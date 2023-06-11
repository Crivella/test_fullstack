import { useCallback, useContext } from "react";
import { Form } from "react-bootstrap";
import { FilterSortContext, PaginationContext, ThemeContext } from "../context/Contexts";

export function useTheme() {
    const {theme, setTheme, themeContrast1, themeContrast2} = useContext(ThemeContext);

    const ThemeSwitch = (props) => {
        const newProps = {
            type: 'switch',
            checked: theme === 'dark',
            onChange: (e) => {e.target.checked ? setTheme('dark') : setTheme('light')},
            ...props,
        }
        return <Form.Check {...newProps} />
    }
    return {theme, themeContrast1, themeContrast2, ThemeSwitch};
}

export function useFilter() {
    const { filters } = useContext(FilterSortContext);
    
    // 1: contains, 2: not contains, 3: equals, 4: not equals, 5: starts with, 6: ends with, 7: blank, 8: not blank
    const applyFilters = useCallback((lst) => {
        const filterers = Array.from(filters.entries())
        .filter(([k,[select,value]]) => value !== '')
        .map(([k, [select,value]]) => (e) => {
            switch (Number(select)) {
                case 1: return String(e[k]).includes(value);
                case 2: return String(!e[k]).includes(value);
                case 3: return String(e[k]) === value;
                case 4: return String(e[k]) !== value;
                case 5: return String(e[k]).startsWith(value);
                case 6: return String(e[k]).endsWith(value);
                case 7: return String(e[k]) === '';
                case 8: return String(e[k]) !== '';
    
                default:
                    throw new Error(`Invalid action ${select} for filter ${k}`);
            }
        });
        return filterers.reduce((acc, f) => acc.filter(f), lst);
    }, [filters]);

    return applyFilters;
}

export function useSort() {
    const { sorting  } = useContext(FilterSortContext);

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


export function usePagination() {
    const { pageSize, page, setCount } = useContext(PaginationContext);

    const paginateList = useCallback((lst) => {
        setCount(lst.length);
        const start = (page-1)*pageSize;
        const end = start + pageSize;
        return lst.slice(start, end);
    }, [page, pageSize, setCount]);

    return { paginateList }
}
