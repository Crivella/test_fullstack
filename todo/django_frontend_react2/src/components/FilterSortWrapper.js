import { useEffect, useState } from "react";
import PassPropsWrapper from "../commons/Wrapper";

const arrows = {
    '-1': '↓',
    0: '',
    1: '↑',
    }

export default function FilterSortWrapper({children, list: raw, ...rest}) {
    const [list, setList] = useState(raw);
    const [filters, setFilters] = useState({});
    const [sorting, setSorting] = useState(new Map(JSON.parse(localStorage.getItem('sorting'))));

    // Filters change hook
    useEffect(() => {
        
    }, [filters, raw]);

    // Sorting change hook
    useEffect(() => {
        // console.log('SORTING HOOK');
        // console.log(sorting);
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
        // console.log(sorters);

        sorters.reverse().forEach((f) => res.sort(f));
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

export function FSHeader({head, sorting, setSorting, filters, setFIlters, keyMap, ...rest}) {
    const [arrow, setArrow] = useState('')
    const [sortIdx, setSortIdx] = useState('')



    useEffect(() => {
        // Set sorting arrow symbol
        setArrow(arrows[sorting.get(head) | 0]);

        // Set sorting index for multisort
        const getIdx = (head) => {
            let idx = 0;
            for (const [k,v] of sorting) {
                if (v !== 0) idx++;
                if (k === head) {
                    if (v === 0) idx = '';
                    return idx;
                }
            }
            return '';
        };

        const nsort = [...sorting.values()].filter((e) => e !== 0).length;
        const idx = getIdx(head);

        if (nsort > 1){
            setSortIdx(`${idx} `)
        } else {
            setSortIdx(' ');
        }

    }, [sorting, head]);


    // 0 - no sort, 1 - asc, 2 - desc
    const onSort = (head) => {
        let res;
        const app = sorting.get(head) | 0;
        if (keyMap.get('Shift', 0)) {
            res = new Map(sorting);
        } else {
            res = new Map();
            res.set(head, app);
        };
        res.delete(head)
        res.set(head, (app + 2)%3 - 1);
        setSorting(res);
        console.log(res);
        // setSorting({...sorting, ...app});
    };

    return (
        <span onClick={() => onSort(head)}>{arrow}{sortIdx}{head}</span> 
    )
}