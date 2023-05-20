import { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Form, Overlay, Popover } from 'react-bootstrap';
import PassPropsWrapper from "../commons/Wrapper";


const arrows = {
    '-1': '↓',
    0: '',
    1: '↑',
    };

const filterSymbol = '⧩';

export default function FilterSortWrapper({children, ...rest}) {
    const [getParams, setGetParams] = useState({});
    const [filters, setFilters] = useState(new Map(JSON.parse(localStorage.getItem('filters'))));
    const [sorting, setSorting] = useState(new Map(JSON.parse(localStorage.getItem('sorting'))));

    // Sorting/Filters change hook (merged togheter to avoid infinite loop)
    useEffect(() => {
        // localStorage.setItem('filters', JSON.stringify([...filters.entries()]));
        // localStorage.setItem('sorting', JSON.stringify([...sorting.entries()]));

        // 1: contains, 2: not contains, 3: equals, 4: not equals, 5: starts with, 6: ends with, 7: blank, 8: not blank
        // const filterers = Array.from(filters.entries()).filter(([k,[select,value]]) => value !== '').map(([k, [select,value]]) => (e) => {
        //     console.log(select, value, e[k])
        //     switch (select) {
        //         case 1: return e[k].includes(value);
        //         case 2: return !e[k].includes(value);
        //         case 3: return e[k] === value;
        //         case 4: return e[k] !== value;
        //         case 5: return e[k].startsWith(value);
        //         case 6: return e[k].endsWith(value);
        //         case 7: return e[k] === '';
        //         case 8: return e[k] !== '';
    
        //         default:
        //             throw new Error(`Invalid action ${select} for filter ${k}`);
        //     }
        // });
        // setList(filterers.reduce((acc, f) => acc.filter(f), res));
        const res = 1;
    }, []);

    const onOrderFilterReset = () => {
        setFilters(new Map());
        setSorting(new Map());
    };


    const newProps = {
        ...rest,
        'getParams': getParams,
        'filters': filters,
        'setFilters': setFilters,
        'sorting': sorting,
        'setSorting': setSorting,
        'onOrderFilterReset': onOrderFilterReset,
    }

    return (
        <PassPropsWrapper newProps={newProps}>
            {children}
        </PassPropsWrapper>
    )
}

export function FilterSortHeader({layout = {}, ...rest}) {
    const [arrow, setArrow] = useState('')
    const [sortIdx, setSortIdx] = useState('')

    const {head, sorting, setSorting, keyMap} = rest;

    useEffect(() => {
        // Set sorting arrow symbol
        setArrow(arrows[sorting.get(head) | 0]);

        // Set sorting index for multisort
        const getIdx = (head) => {
            let idx = 0;
            for (const [k,v] of sorting) {
                if (v !== 0) idx++;
                if (k === head) {
                    if (v === 0) idx = '';
                    return idx;
                }
            }
            return '';
        };

        const nsort = [...sorting.values()].filter((e) => e !== 0).length;
        const idx = getIdx(head);

        if (nsort > 1){
            setSortIdx(`${idx} `)
        } else {
            setSortIdx(' ');
        }

    }, [sorting, head]);


    // 0 - no sort, 1 - asc, 2 - desc
    const onSort = (head) => {
        let res;
        const app = sorting.get(head) | 0;
        if (keyMap.get('Shift', 0)) {
            res = new Map(sorting);
        } else {
            res = new Map();
            res.set(head, app);
        };
        res.delete(head)
        res.set(head, (app + 2)%3 - 1);
        setSorting(res);
    };

    return (
        <Col className="d-flex justify-content-between flex-grow-1" {...layout}>
            <span onClick={() => onSort(head)}>{arrow}{sortIdx}{head}</span>
            <FilterComponent {...rest}/>
        </Col> 
    )
}

export function FilterComponent({...rest}) {
    const [show, setShow] = useState(false);
    const [target, setTarget] = useState(null);

    const ref = useRef(null);

    const onFilter = (e) => {
        setShow(!show);
        setTarget(e.target);
    };
    
    return (
        <Container ref={ref}>
            <span className="px-1" onClick={onFilter}>{filterSymbol}</span>
            <Overlay target={target} container={ref} show={show} placement="bottom">
                <Popover id="popover-contained">
                    <Popover.Body>
                        <FilterForm setShow={setShow} {...rest} />
                    </Popover.Body>
                </Popover>
            </Overlay>
        </Container>
    )
}

export function FilterForm({head, setShow, filters, setFilters, ...rest}) {
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
    
    const onApply = () => {
        const res = new Map(filters);
        res.set(head, [select, value]);
        setFilters(res);
        setShow(false);
    };

    const onTest = (e) => {
        console.log(select, value)
        console.log(filters)
    };

    const onSelect = (e) => {
        setSelect(e.target.value);
    };

    const onValue = (e) => {
        setValue(e.target.value);
    };

    return (
        <Form ref={form}>
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
            {select < 7 ? <Form.Control type="text" placeholder="Filter value" value={value} onChange={onValue} /> : null}
            <Container className="d-flex justify-content-between">
                <Button variant="primary" onClick={onReset}>Rest</Button>
                <Button variant="primary" onClick={onTest}>TEST</Button>
                <Button variant="primary" onClick={onApply}>Apply</Button>
            </Container>
        </Form>
    )
}