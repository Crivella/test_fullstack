import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthWrapper';
import { FilterSortContext } from './FilterSortWrapper';

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export const ListContext = createContext({});


export default function APIListWrapper({children, size=10, ...rest}) {
    const { user } = useContext(AuthContext);
    const { getParams = {} } = useContext(FilterSortContext);

    const [active, setActive] = useState(null);
    const [list, setList] = useState([]); // [{}
    const [formHeader, setFormHeader] = useState('Add Item'); 
    const [formAction, _setFormAction] = useState('add');

    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(size);
    const [page, setPage] = useState(1);

    // const [update, setUpdate] = useState([]); // [{}
    const [update, setUpdate] = useState(0); // [{}

    useEffect(() => {
        const offset = page > 1? `&offset=${(page-1)*pageSize}` : '';
        axios.get(`${endpoint}/?limit=${pageSize}${offset}`, {
            headers: { 'Content-Type': 'application/json' },
            params: getParams,
        }).then(({data}) => {
            setList(data.results); 
            setTotal(data.count);
        })
        .catch((err) => console.log(err));
    }, [page, pageSize, getParams, user, update]);

    // useEffect(() => {
    //     if (update.length) {
    //         const app = update.shift();
    //         setList(list.map((e) => e.id === app.id ? app : e));
    //         setPage(page);
    //         // setUpdate([]);
    //     };
    // }, [update, list]);

    const getItem = (id) => {
        return axios.get(`${endpoint}/${id}/`, {
            headers: { 'Content-Type': 'application/json' }
        }).then(({data}) => data);
    };

    const updateItem =(id, data) => {
        return axios.patch(`${endpoint}/${id}/`, data, {})
            // .then(({data}) => {setList(list.map((e) => e.id === data.id ? data : e)); return data})
            // .then(({data}) => {setUpdate([...update, data]); return data})
            .then(({data}) => {setUpdate(update+1); return data})
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
            // .then(({data}) => {setList([...list, data]); return data})
            .then(({data}) => {setUpdate(update+1); return data})
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
        <ListContext.Provider value={newProps}>
            {children}
        </ListContext.Provider>
    )
}
