import { useEffect, useState } from 'react';
import PassPropsWrapper from './Wrapper';


export default function PaginatorWrapper({children, pageSize, setPageSize, page, setPage, list, size=10, ...rest}) {
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
    }, [list, FEpage, FEpageSize]);

    const newProps = {
        ...rest,
        'list': FElist,
        'pageSize': FEpageSize,
        'page': FEpage,
        'setPage': setFEpage,
        'setPageSize': setFEpageSize,
    }
    return (
        <PassPropsWrapper newProps={newProps}>
            {children}
        </PassPropsWrapper>
    )
}

