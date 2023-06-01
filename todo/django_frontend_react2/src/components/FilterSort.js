
import { useContext, useRef, useState } from "react";
import { Button, Col, Container, Form, Overlay, Popover } from 'react-bootstrap';

import { FilterSortContext } from "../API/Contexts";

const arrows = {
    '-1': '↓',
    0: '',
    1: '↑',
    };

const filterSymbol = '⧩';

export function FilterSortHeader({head, cname, layout = {}}) {
    return (
        <Col className="m-0 p-0" {...layout}>
            <Container className="d-flex justify-content-between flex-grow-1 m-0 p-0">
            {/* <span onClick={() => onSort(head)}>{arrow}{sortIdx}{head}</span> */}
            <span>{head === null ? cname : head}</span>
            <FilterComponent cname={cname} />
            </Container>
        </Col> 
    )
}

export function FilterComponent({ cname }) {
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
            <Button 
                variant={`${filters.has(cname) ? '' : 'outline-'}primary`} 
                className="px-1 mx-0" 
                onClick={onFilter}>{filterSymbol}
            </Button>
            <Overlay 
                target={target} container={ref} show={show} placement="bottom"
                onHide={() => setShow(false)} rootClose
                >
                <Popover id="popover-contained">
                    <Popover.Body>
                        <FilterForm setShow={setShow} head={cname} />
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