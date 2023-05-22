
import { useContext, useRef, useState } from "react";
import { Button, Col, Container, Form, Overlay, Popover } from 'react-bootstrap';

import { FilterSortContext } from "../commons/FilterSortWrapper";

const arrows = {
    '-1': '↓',
    0: '',
    1: '↑',
    };

const filterSymbol = '⧩';

export function FilterSortHeader({head, layout = {}}) {
    // const { sorting, setSorting } = useContext(FilterSortContext);
    
    // const [arrow, setArrow] = useState('')
    // const [sortIdx, setSortIdx] = useState('')

    // const keyMap = useContext(KeyMapContext);

    // useEffect(() => {
    //     // Set sorting arrow symbol
    //     setArrow(arrows[sorting.get(head) | 0]);

    //     // Set sorting index for multisort
    //     const getIdx = (head) => {
    //         let idx = 0;
    //         for (const [k,v] of sorting) {
    //             if (v !== 0) idx++;
    //             if (k === head) {
    //                 if (v === 0) idx = '';
    //                 return idx;
    //             }
    //         }
    //         return '';
    //     };

    //     const nsort = [...sorting.values()].filter((e) => e !== 0).length;
    //     const idx = getIdx(head);

    //     if (nsort > 1){
    //         setSortIdx(`${idx} `)
    //     } else {
    //         setSortIdx(' ');
    //     }

    // }, [sorting, head]);


    // 0 - no sort, 1 - asc, 2 - desc
    // const onSort = (head) => {
    //     let res;
    //     const app = sorting.get(head) | 0;
    //     if (keyMap.get('Shift', 0)) {
    //         res = new Map(sorting);
    //     } else {
    //         res = new Map();
    //         res.set(head, app);
    //     };
    //     res.delete(head)
    //     res.set(head, (app + 2)%3 - 1);
    //     setSorting(res);
    // };

    return (
        <Col className="d-flex justify-content-between flex-grow-1" {...layout}>
            {/* <span onClick={() => onSort(head)}>{arrow}{sortIdx}{head}</span> */}
            <span>{head}</span>
            <FilterComponent head={head} />
        </Col> 
    )
}

export function FilterComponent({ head }) {
    const { filters } = useContext(FilterSortContext);
    const [show, setShow] = useState(false);
    const [target, setTarget] = useState(null);

    const ref = useRef(null);

    const onFilter = (e) => {
        setShow(!show);
        setTarget(e.target);
    };
    
    return (
        <Container ref={ref}>
            <Button variant={`${filters.has(head) ? '' : 'outline-'}primary`} className="px-1" onClick={onFilter}>{filterSymbol}</Button>
            <Overlay 
                target={target} container={ref} show={show} placement="bottom"
                onHide={() => setShow(false)} rootClose
                >
                <Popover id="popover-contained">
                    <Popover.Body>
                        <FilterForm setShow={setShow} head={head} />
                    </Popover.Body>
                </Popover>
            </Overlay>
        </Container>
    )
}

export function FilterForm({head, setShow}) {
    const { filters, setFilters } = useContext(FilterSortContext);

    const def = [1, ''];
    const [select, setSelect] = useState((filters.get(head) || def)[0]); // [1,2,3,4,5,6,7,8]
    const [value, setValue] = useState((filters.get(head) || def)[1]);

    const form = useRef(null);

    const onReset = () => {
        const res = new Map(filters);
        res.delete(head);      
        setFilters(res);
        setShow(false);
    };
    
    const onApply = (e) => {
        e.preventDefault();
        const res = new Map(filters);
        res.set(head, [select, value]);
        setFilters(res);
        setShow(false);
    };

    const onSelect = (e) => {
        setSelect(e.target.value);
    };

    const onValue = (e) => {
        setValue(e.target.value);
    };

    return (
        <Form ref={form} onSubmit={onApply}>
            <Form.Select aria-label="Select filter" value={select} onChange={onSelect}>
                <option value="1">Contains</option>
                <option value="2">Not contains</option>
                <option value="3">Equals</option>
                <option value="4">Not equals</option>
                <option value="5">Starts with</option>
                <option value="6">Ends with</option>
                <option value="7">Blank</option>
                <option value="8">Not Blank</option>
            </Form.Select>
            {
            select < 7 
            ? <Form.Control type="text" placeholder="Filter value" value={value} onChange={onValue} /> 
            : null
            }
            <Container className="d-flex justify-content-between">
                <Button variant="primary" onClick={onReset}>Reset</Button>
                <Button variant="primary" type="submit" onClick={onApply}>Apply</Button>
            </Container>
        </Form>
    )
}