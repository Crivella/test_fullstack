import { useContext, useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';

import { PaginationContext } from "../API/Contexts";
import LoadingErrorFrame from './LoadingErrorFrame';

export default function InfiniteScrollToolbar() {
    const {page, setPage, pageSize, count} = useContext(PaginationContext);
    const [loading, setLoading] = useState(false); // [{}

    const ref = useRef();

    useEffect(() => {
        const numPages = Math.ceil(count/pageSize);
        setLoading(false);
        if (page < numPages) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[entries.length-1].isIntersecting) {
                    setPage(page+1);
                    setLoading(true);
                }
            // Difficutl to get 1 if element is at bottom of page
            }, {threshold: 0.5});

            observer.observe(ref.current)
        }
    }, [count, pageSize, page, setPage]);

    // pb-1 necessaty to have some intersection
    return (
        <Container fluid ref={ref} className='pb-1' >
            <LoadingErrorFrame onLoading={() => <></>} loading={loading} error={false} />
        </Container>
    )
}
