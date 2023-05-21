import { createContext, useContext, useEffect, useState } from "react";
import { ListContext } from "../API/ListWrapper";

export const FilterSortContext = createContext({});

export default function FilterSortWrapper({children}) {
    const { list: raw } = useContext(ListContext);
    const [list, setList] = useState(raw);
    const [filters, setFilters] = useState(new Map(JSON.parse(localStorage.getItem('filters'))));
    const [sorting, setSorting] = useState(new Map(JSON.parse(localStorage.getItem('sorting'))));

    // Sorting/Filters change hook (merged togheter to avoid infinite loop)
    useEffect(() => {
        localStorage.setItem('filters', JSON.stringify([...filters.entries()]));
        localStorage.setItem('sorting', JSON.stringify([...sorting.entries()]));

        const res = [...raw];
        let sorters = Array.from(sorting.entries()).filter(([k,v]) => v !== 0).map(([k, v]) => (a,b) => {
            // Add type specific comparison
            // eg strings.toUpper to sort case insensitive
            if (a[k] < b[k]) return -v;
            if (a[k] > b[k]) return v;
            return 0;
        });
        // If no active sorters, default to id
        if (sorters.length === 0) sorters = [(a,b) => a.id - b.id];

        sorters.reverse().forEach((f) => res.sort(f));

        // 1: contains, 2: not contains, 3: equals, 4: not equals, 5: starts with, 6: ends with, 7: blank, 8: not blank
        const filterers = Array.from(filters.entries()).filter(([k,[select,value]]) => value !== '').map(([k, [select,value]]) => (e) => {
            switch (select) {
                case 1: return e[k].includes(value);
                case 2: return !e[k].includes(value);
                case 3: return e[k] === value;
                case 4: return e[k] !== value;
                case 5: return e[k].startsWith(value);
                case 6: return e[k].endsWith(value);
                case 7: return e[k] === '';
                case 8: return e[k] !== '';
    
                default:
                    throw new Error(`Invalid action ${select} for filter ${k}`);
            }
        });
        setList(filterers.reduce((acc, f) => acc.filter(f), res));
    }, [filters, sorting, raw]);

    const onOrderFilterReset = () => {
        setFilters(new Map());
        setSorting(new Map());
    };


    const newProps = {
        'list': list,
        'filters': filters,
        'setFilters': setFilters,
        'sorting': sorting,
        'setSorting': setSorting,
        'onOrderFilterReset': onOrderFilterReset,
    }

    return (
        <FilterSortContext.Provider value={newProps}>
            {children}
        </FilterSortContext.Provider>
    )
}
