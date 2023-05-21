import { createContext, useCallback, useContext, useState } from "react";

export const FilterSortContext = createContext({});

export default function FilterSortWrapper({children}) {
    const [filters, setFilters] = useState(new Map(JSON.parse(localStorage.getItem('filters'))));
    const [sorting, setSorting] = useState(new Map([['completed',1], ['priority',-1]]));

    const onOrderFilterReset = () => {
        setFilters(new Map());
        setSorting(new Map());
    };


    const newProps = {
        'filters': filters,
        'setFilters': setFilters,
        'sorting': sorting,
        'setSorting': () => 1,
        'onOrderFilterReset': onOrderFilterReset,
    }

    return (
        <FilterSortContext.Provider value={newProps}>
            {children}
        </FilterSortContext.Provider>
    )
}

export function useSort() {
    const { sorting = new Map([['completed',1], ['priority',-1]]) } = useContext(FilterSortContext);

    const applySorting = useCallback((lst) => {
        let sorters = Array.from(sorting.entries())
        .filter(([k,v]) => v !== 0)
        .map(([k, v]) => (a,b) => {
            // Add type specific comparison
            // eg strings.toUpper to sort case insensitive
            if (a[k] < b[k]) return -v;
            if (a[k] > b[k]) return v;
            return 0;
        });
        // If no active sorters, default to id
        if (sorters.length === 0) sorters = [(a,b) => a.id - b.id];
        sorters.reverse().forEach((f) => lst.sort(f));
        return lst;
    }, [sorting]);

    return applySorting;
}

export function useFilter() {
    const { filters = new Map()} = useContext(FilterSortContext);

    // 1: contains, 2: not contains, 3: equals, 4: not equals, 5: starts with, 6: ends with, 7: blank, 8: not blank
    const applyFilters = useCallback((lst) => {
        const filterers = Array.from(filters.entries())
        .filter(([k,[select,value]]) => value !== '')
        .map(([k, [select,value]]) => (e) => {
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
        return filterers.reduce((acc, f) => acc.filter(f), lst);
    }, [filters]);

    return applyFilters;
}