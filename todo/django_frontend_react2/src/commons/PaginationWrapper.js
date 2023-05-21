import { createContext, useContext, useEffect, useState } from 'react';

// import { useListContext } from './ListWrapper';
import { ListContext } from '../API/ListWrapper';

export const PaginationContext = createContext();

export default function PaginatorWrapper({children, size=10}) {
    const { total, pageSize, page, setPage, list} = useContext(ListContext);
    const [FEpageSize, setFEpageSize] = useState(size); // [15]
    const [FEpage, setFEpage] = useState(1); // [1]
    const [FElist, setFElist] = useState([]); // [{}]

    useEffect(() => {
        if (pageSize !== undefined) {
            const requestLower = (FEpage-1)*FEpageSize;
            const requestUpper = FEpage*FEpageSize;
            if (requestUpper > page*pageSize) setPage(Math.ceil(requestUpper/pageSize));
            if (requestLower < (page-1)*pageSize) setPage(Math.ceil(requestLower/pageSize));
        }

        const start = ((FEpage-1)*FEpageSize)%(pageSize || Infinity);
        const end = start + FEpageSize;
        setFElist(list.slice(start, end));
        // setFElist(list);
    }, [list, FEpage, FEpageSize, page, pageSize]);

    const newProps = {
        'list': FElist,
        'total': total,
        'pageSize': FEpageSize,
        'page': FEpage,
        'setPage': setFEpage,
        'setPageSize': setFEpageSize,
    }
    return (
        <PaginationContext.Provider value={newProps}>
            {children}
        </PaginationContext.Provider>
    )
}

