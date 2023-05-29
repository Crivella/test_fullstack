import { createContext, useState } from "react";

export const FilterSortContext = createContext({});

export default function FilterSortProvider({children}) {
    const [filters, setFilters] = useState(new Map());
    const [sorting, setSorting] = useState(new Map([['completed',1], ['priority',-1]]));

    const onOrderFilterReset = () => {
        setFilters(new Map());
        // setSorting(new Map());
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

