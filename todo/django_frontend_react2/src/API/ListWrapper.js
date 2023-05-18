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

    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(16);
    const [page, setPage] = useState(1);

    const [update, setUpdate] = useState([]); // [{}

    useEffect(() => {
        const offset = page > 1? `&offset=${(page-1)*pageSize}` : '';
        axios.get(`${endpoint}/?limit=${pageSize}${offset}`, {
            headers: { 'Content-Type': 'application/json' }
        }).then(({data}) => {
            setList(data.results); 
            setTotal(data.count);
        })
        .catch((err) => console.log(err));
    }, [page, pageSize, props.user]);

    useEffect(() => {
        if (update.length) {
            const app = update.shift();
            setList(list.map((e) => e.id === app.id ? app : e));
        };
    }, [update, list]);

    const {children, ...rest} = props;

    const getItem = (id) => {
        return axios.get(`${endpoint}/${id}/`, {
            headers: { 'Content-Type': 'application/json' }
        }).then(({data}) => data);
    };

    const updateItem =(id, data) => {
        return axios.patch(`${endpoint}/${id}/`, data, {})
            // .then(({data}) => {setList(list.map((e) => e.id === data.id ? data : e)); return data})
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

        'page': page,
        'setPage': setPage,
        'pageSize': pageSize,
        'setPageSize': setPageSize,
        'total': total,
        'setTotal': setTotal,
    }

    return (
        <PassPropsWrapper newProps={newProps}>
            {children}
        </PassPropsWrapper>
    )
}
