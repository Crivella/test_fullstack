import axios from 'axios';
import { useEffect, useState } from 'react';
import PassPropsWrapper from '../commons/Wrapper';

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true


export default function APIListWrapper(props) {
    const [active, setActive] = useState(null);
    const [list, setList] = useState([]); // [{}
    const [formHeader, setFormHeader] = useState('Add Item'); 
    const [formAction, _setFormAction] = useState('add');

    const [update, setUpdate] = useState([]); // [{}

    useEffect(() => {getList()}, [props.user]);

    useEffect(() => {
        if (update.length) {
            console.log('UPDATE', update);
            const app = update.shift();
            console.log(app)
            setList(list.map((e) => e.id === app.id ? app : e));
        };
    }, [update, list]);

    const {children, ...rest} = props;

    const getList = () => {
        return axios.get(`${endpoint}/`, {
            headers: { 'Content-Type': 'application/json' }
        })
        // .then((data) => data.sort((a, b) => b.priority - a.priority))
        .then(({data}) => {setList(data); return data})
        .catch((err) => console.log(err));
    };

    const getItem = (id) => {
        return axios.get(`${endpoint}/${id}/`, {
            headers: { 'Content-Type': 'application/json' }
        }).then(({data}) => data);
    };

    const updateItem =(id, data) => {
        return axios.patch(`${endpoint}/${id}/`, data, {})
            .then(({data}) => {setUpdate([...update, data]); return data})
            .catch((err) => console.log(err));
    };

    const deleteItem = (id) => {
        return axios.delete(`${endpoint}/${id}/`, {}) 
            .then(() => setList(list.filter((e) => e.id !== id)))
            .then(() => setActive(null))
            .then(() => id)
            .catch((err) => console.log(err));
    };

    const addItem = (data) => {
        return axios.post(`${endpoint}/`, data, {})
            .then(({data}) => {setList([...list, data]); return data})
            .catch((err) => console.log(err));
    };

    const setFormAction = (action) => {
        _setFormAction(action);
        switch (action) {
            case 'add': return setFormHeader('Add Item');
            case 'edit': return setFormHeader('Edit Item');
            case 'delete': return setFormHeader('Delete Item');
            default: throw new Error('Invalid form action');
        }
    };

    const onSubmit = (data) => {
        switch (formAction) {
            case 'add': return addItem(data);
            case 'edit': return updateItem(data.id, data);
            case 'delete':
                const id = data.id || data;
                return deleteItem(id);
            default:
                throw new Error('Invalid form action');
        }
    };

    const newProps = {
        ...rest,
        'list': list, // [{}, {}, {}]
        'setList': setList,
        'active': active,
        'setActive': setActive,
        // 'getList': getList,
        'getItem': getItem,
        'updateItem': updateItem,
        'deleteItem': deleteItem,
        'addItem': addItem,
        'formHeader': formHeader,
        'formAction': formAction, // 'add' or 'edit
        'setFormAction': setFormAction,
        'todoAction': onSubmit,
    }

    return (
        <PassPropsWrapper newProps={newProps}>
            {children}
        </PassPropsWrapper>
    )
}