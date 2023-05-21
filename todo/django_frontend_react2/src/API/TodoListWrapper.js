import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { useFilter, useSort } from '../commons/FilterSortWrapper';
import { AuthContext } from './AuthWrapper';

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export const TodoAPIContext = createContext({});

export default function TodosClientWrapper({children}) {
    const { user } = useContext(AuthContext);
    const { getList, addItem, updateItem, deleteItem } = useTodoAPI();

    const applyFilters = useFilter();
    const applySort = useSort();

    // const [active, setActive] = useState(null);
    const [list, setList] = useState([]); // [{}
    const [formHeader, setFormHeader] = useState('Add Item'); 
    const [formAction, _setFormAction] = useState('add');

    // const [update, setUpdate] = useState([]); // [{}
    const [update, setUpdate] = useState(0); // [{}

    useEffect(() => {
        getList()
            .then(data => applyFilters(data))
            .then(data => applySort(data))
            .then(data => setList(data));
    }, [user]);

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
        // 'active': active,
        // 'setActive': setActive,
        'formHeader': formHeader,
        'formAction': formAction, // 'add' or 'edit
        'setFormAction': setFormAction,
        'todoAction': onSubmit,
    }

    return (
        <TodoAPIContext.Provider value={newProps}>
            {children}
        </TodoAPIContext.Provider>
    )
}


export function useTodoAPI() {
    const getList = () => {
        return axios.get(`${endpoint}/`, {
            headers: { 'Content-Type': 'application/json' },
        })
        .catch((err) => console.log(err))
        .then(({data}) => data);
    };

    const getItem = (id) => {
        return axios.get(`${endpoint}/${id}/`, {
            headers: { 'Content-Type': 'application/json' }
        });
    };

    const updateItem =(id, data) => {
        return axios.patch(`${endpoint}/${id}/`, data, {})
            .catch((err) => console.log(err));
    };

    const deleteItem = (id) => {
        return axios.delete(`${endpoint}/${id}/`, {}) 
            .catch((err) => console.log(err));
    };

    const addItem = (data) => {
        return axios.post(`${endpoint}/`, data, {})
            .catch((err) => console.log(err));
    };

    return { getList, getItem, updateItem, deleteItem, addItem};
}