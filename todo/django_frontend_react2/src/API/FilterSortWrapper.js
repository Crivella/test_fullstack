import { useEffect, useState } from "react";
import PassPropsWrapper from "../commons/Wrapper";


export default function FilterSortWrapper({children, ...rest}) {
    const [getParams, setGetParams] = useState(new Map());
    const [filters, setFilters] = useState(new Map(JSON.parse(localStorage.getItem('BEfilters'))));
    const [sorting, setSorting] = useState(new Map(JSON.parse(localStorage.getItem('BEsorting'))));

    // Sorting/Filters change hook (merged togheter to avoid infinite loop)
    useEffect(() => {
        // localStorage.setItem('filters', JSON.stringify([...filters.entries()]));
        // localStorage.setItem('sorting', JSON.stringify([...sorting.entries()]));

        const res = new Map(getParams);

        filters.forEach((v, k) => {
        });


        // 1: contains, 2: not contains, 3: equals, 4: not equals, 5: starts with, 6: ends with, 7: blank, 8: not blank

        // const filterers = Array.from(filters.entries()).filter(([k,[select,value]]) => value !== '').map(([k, [select,value]]) => (e) => {
        //     console.log(select, value, e[k])
        //     switch (select) {
        //         case 1: return e[k].includes(value);
        //         case 2: return !e[k].includes(value);
        //         case 3: return e[k] === value;
        //         case 4: return e[k] !== value;
        //         case 5: return e[k].startsWith(value);
        //         case 6: return e[k].endsWith(value);
        //         case 7: return e[k] === '';
        //         case 8: return e[k] !== '';
    
        //         default:
        //             throw new Error(`Invalid action ${select} for filter ${k}`);
        //     }
        // });
        // setList(filterers.reduce((acc, f) => acc.filter(f), res));
    }, [filters]);

    const onOrderFilterReset = () => {
        setFilters(new Map());
        setSorting(new Map());
    };


    const newProps = {
        ...rest,
        'getParams': getParams,
        'filters': filters,
        'setFilters': setFilters,
        'sorting': sorting,
        'setSorting': setSorting,
        'onOrderFilterReset': onOrderFilterReset,
    }

    return (
        <PassPropsWrapper newProps={newProps}>
            {children}
        </PassPropsWrapper>
    )
}
