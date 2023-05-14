import { useEffect, useState } from "react";
import { Form, Table } from "react-bootstrap";


export default function SortedTable({ children, list, exclude=[], ...rest }) {
    const {theme, themeContrast1, themeContrast2} = rest;
    const [keys, setKeys] = useState([]); // [{}
    const {setShowTodo, setShowDelete, setFormAction} = rest;
    const {active, setActive, updateItem, deleteItem} = rest;

    useEffect(() => {
        if (list.length) {
            setKeys(Object.keys(list[0]).filter((e) => !exclude.includes(e)));
        }
    }, [list]);

    const onCheck = (todo, e) => {
        if (isNaN(e.currentTarget.value)) return false;
        const data = {...todo, completed: e.target.checked};
        return updateItem(todo.id, data);
    };
    const onPriority = (todo, e) => {
        const data = {...todo, priority: e.currentTarget.value};
        return updateItem(todo.id, data);
    };
    
    const onSelect = (id) => {
        active === id ? setActive(null) : setActive(id);
    };
    
    const onEdit = () => {
        setFormAction('edit');
        setShowTodo(true);
    };
    
    const onDelete = () => {
        setFormAction('delete');
        setShowDelete(true);
    };

    return (
        <Table variant={theme} responsive="md" striped bordered hover>
            {children}
            <thead>
                <tr>
                    {keys.map((key, index) => <th key={index}>{key}</th>)}
                </tr>
            </thead>
            <tbody>
                {list.map((todo, index) => {
                    return (
                        <tr>
                            <td style={{width: '90px'}}><Form.Control type='number' value={todo.priority} onChange={(e) => onPriority(todo, e)} /></td>
                            <td style={{width: '600px'}}><Form.Label onClick={() => onSelect(todo.id)}> {todo.title}</Form.Label></td>
                            <td style={{width: '78px'}}>test</td>
                        </tr>
                    )})}
            </tbody>
        </Table>
        )
    }

    // <tr key={index}>
    //     {keys.map((key, index) => <td key={index}>{item[key]}</td>)}
    //     <td>Actions</td>
    // </tr>