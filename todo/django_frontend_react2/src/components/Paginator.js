import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';


export default function Paginator({pageSize, total, ...rest}) {
    const [pagination, setPagination] = useState([]); // [{}

    useEffect(() => {
        const numPages = Math.ceil(total/pageSize);
        setPagination([...Array(numPages).keys()].map((e) => e+1));
    }, [total, pageSize]);

    return (
        <Container className='d-flex justify-content-end text-light'>
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