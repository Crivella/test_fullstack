import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import PassPropsWrapper from '../commons/Wrapper';


export function PaginatorWrapper({children, pageSize, setPageSize, page, setPage, list, size=10, ...rest}) {
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

export function PaginationToolbar({pageSize, total, ...rest}) {
    const [pagination, setPagination] = useState([]); // [{}

    useEffect(() => {
        const numPages = Math.ceil(total/pageSize);
        setPagination([...Array(numPages).keys()].map((e) => e+1));
    }, [total, pageSize]);

    return (
        <Container className='d-flex justify-content-end text-light mt-2'>
            {pagination.map((e) => (
                <PaginationNumber key={e} {...rest} num={e} />
            ))}
        </Container>
    )
}

function PaginationNumber({page: active, setPage: setActive, num}) {
    const [style, setStyle] = useState('outline-primary'); // ['btn-outline-primary'

    useEffect(() => {
        setStyle(`${active === num ? '' : 'outline-'}primary`);
    }, [active, num])

    return (
        <Button className='mx-1 text-light' variant={style} onClick={() => setActive(num)}>
            {num}
        </Button>
    )
}