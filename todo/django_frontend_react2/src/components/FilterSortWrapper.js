import { useEffect, useState } from "react";
import PassPropsWrapper from "../commons/Wrapper";

export default function FilterSortWrapper({children, list: raw, ...rest}) {
    const [list, setList] = useState(raw);
    const [filters, setFilters] = useState({});
    const [sorting, setSorting] = useState(new Map());

    // Filters change hook
    useEffect(() => {
        
    }, [filters, raw]);

    // Sorting change hook
    useEffect(() => {
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

        sorters.reverse().forEach((e) => res.sort(e));
        setList(res);
    }, [sorting, raw]);


    const newProps = {
        ...rest,
        'list': list,
        'filters': filters,
        'setFilters': setFilters,
        'sorting': sorting,
        'setSorting': setSorting,
    }

    return (
        <PassPropsWrapper newProps={newProps}>
            {children}
        </PassPropsWrapper>
    )
}