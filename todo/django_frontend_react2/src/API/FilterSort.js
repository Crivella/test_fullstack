import { createContext, useEffect, useState } from "react";

export const FilterSortContext = createContext({});

const defaultSorting = new Map([
    // ['completed',1], 
    // ['priority',-1]
]);

export default function APIFilterSortProvider({children}) {
    const [getParams, setGetParams] = useState({});
    const [filters, setFilters] = useState(new Map());
    const [sorting, setSorting] = useState(new Map(defaultSorting));

    // Sorting/Filters change hook (merged togheter to avoid infinite loop)
    useEffect(() => {
        const f = localStorage.getItem('BEfilters');
        const s = localStorage.getItem('BEsorting');
        if (f) setFilters(new Map(JSON.parse(f)));
        if (s) setSorting(new Map(JSON.parse(s)));
    }, []);

    useEffect(() => {
        localStorage.setItem('BEfilters', JSON.stringify([...filters.entries()]));
        localStorage.setItem('BEsorting', JSON.stringify([...sorting.entries()]));

        const res = {};

        const ord = [];
        Array.from(sorting.entries())
        .filter(([k,v]) => v !== 0)
        .forEach(([k, v]) => {
            // Add type specific comparison
            ord.push(v === 1 ? k : `-${k}`);
        });
        if (ord.length > 0) res['order'] = ord.join(',');

        Array.from(filters.entries()).forEach(([k, [select,value]]) => {
            let f;
            let v = value;
            switch (Number(select)) {
                case 1: f = `${k}__icontains`; break;
                case 2: f = `!${k}__icontains`; break;
                case 3: f = `${k}__iexact`; break;
                case 4: f = `!${k}__iexact`; break;
                case 5: f = `${k}__istartswith`; break;
                case 6: f = `${k}__iendswith`; break;
                case 7: f = `${k}__exact`; v = ''; break;
                case 8: f = `!${k}__exact`; v = ''; break;

                default:
                    throw new Error(`Invalid action ${select} for filter ${k}`);
            }

            res[f] = v;
        });

        setGetParams(res);
    }, [filters, sorting]);

    const onOrderFilterReset = () => {
        console.log('onOrderFilterReset');
        setFilters(new Map());
        setSorting(new Map(defaultSorting));
    };

    const newProps = {
        'getParams': getParams,
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
