import { useContext, useEffect, useState } from 'react';
import { Pagination } from 'react-bootstrap';

import { PaginationContext } from "../API/Contexts";


export default function PaginationToolbar() {
    const {page, setPage, pageSize, count} = useContext(PaginationContext);
    const [pagination, setPagination] = useState([]); // [{}

    useEffect(() => {
        const numPages = Math.ceil(count/pageSize);
        setPagination([...Array(numPages).keys()].map((e) => e+1));
    }, [count, pageSize]);

    return (
        <Pagination className='justify-content-end text-light mt-2'>
            {pagination.map((e) => (
                <Pagination.Item key={e} active={e === page} onClick={() => setPage(e)}>
                    {e}
                </Pagination.Item>
            ))}
        </Pagination>
    )
}
