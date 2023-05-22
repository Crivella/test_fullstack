import { createContext, useCallback, useContext, useState } from 'react';

// import { useListContext } from './ListWrapper';

export const PaginationContext = createContext();

export default function PaginatorWrapper({children, size=16}) {
    const [count, setCount] = useState(0); // [0
    const [pageSize, setpageSize] = useState(size); // [15]
    const [page, setPage] = useState(1); // [1]

    const newProps = {
        'count': count,
        'setCount': setCount,
        'pageSize': pageSize,
        'page': page,
        'setPage': setPage,
        'setPageSize': setpageSize,
    }
    return (
        <PaginationContext.Provider value={newProps}>
            {children}
        </PaginationContext.Provider>
    )
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
