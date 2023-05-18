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

    const baseStyle = 'mx-1 text-light ';
    const [style, setStyle] = useState('btn-outline-primary'); // ['btn-outline-primary'

    useEffect(() => {
        setStyle(baseStyle + `btn-${active === num ? '' : 'outline'}-primary`);
    }, [active, num])

    return (
        <Button className={style} onClick={() => setActive(num)}>
            {num}
        </Button>
    )
}