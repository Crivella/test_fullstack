import { useContext, useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';

import { ListContext } from '../API/ListWrapper';


export function PaginationToolbar({...rest}) {
    const {pageSize, total} = useContext(ListContext);
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