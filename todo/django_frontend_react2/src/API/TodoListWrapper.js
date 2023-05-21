import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useFilter, useSort } from '../commons/FilterSortWrapper';
import { AuthContext } from './AuthWrapper';

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export const TodoAPIContext = createContext({});

export default function TodosClientWrapper({children}) {
    const { user } = useContext(AuthContext);
    const { getList  } = useTodoAPI();

    const applyFilters = useFilter();
    const applySort = useSort();

    const [active, setActive] = useState(null);
    const [maxID, setMacID] = useState(0); // [{}
    const [maxPrio, setMaxPrio] = useState(0); // [{}
    const [list, _setList] = useState([]); // [{}
    const [serverList, setServerList] = useState([]); // [{}
    const [formHeader, setFormHeader] = useState('Add Item'); 
    const [formAction, setFormAction] = useState('add');
    
    // const [update, setUpdate] = useState([]); // [{}
    const [addList, setAddList] = useState([]); // [{}
    const [updateList, setUpdateList] = useState({}); // [{}
    const [deleteList, setDeleteList] = useState([]); // [{}]

    // Lifecycle
    useEffect(() => {
        getList()
            .then(data => setServerList(data));
    }, [user, getList]);

    const setList = useCallback((data) => {
        _setList(applySort(applyFilters(data)));
    }, [applyFilters, applySort]);

    useEffect(() => {
        setList(serverList);
    }, [serverList]);

    useEffect(() => {
        let max;
        console.log(list);
        max = list.reduce((acc, e) => Math.max(acc, e.priority), 0);
        setMaxPrio(max);
        max = list.reduce((acc, e) => Math.max(acc, e.id), 0);
        setMacID(max);
    }, [list]);

    useEffect(() => {
        switch (formAction) {
            case 'add': return setFormHeader('Add Item');
            case 'edit': return setFormHeader('Edit Item');
            case 'delete': return setFormHeader('Delete Item');
            default: throw new Error('Invalid form action');
        }
    }, [formAction]);

    // Callbacks
    const addItem = useCallback((data) => {
        const app = {priority: maxPrio + 1, id: maxID + 1, ...data};
        setAddList([...addList, app]);
        setList([app, ...list]);
        return true;
    }, [list, addList, maxPrio, setList]);

    const updateItem = useCallback((data) => {
        const app = {...updateList};
        app[data.id] = data;
        setUpdateList(app);
        setList(list.map(e => e.id === data.id ? data : e));
        return true;
    }, [list, updateList]);

    const deleteItem = useCallback((id) => {
        setDeleteList([...deleteList, id]);
        setList(list.filter(e => e.id !== id));
        setActive(null);
        return true;
    }, [list, deleteList]);

    const moveItemTo = useCallback((itm1, itm2) => { // itm1: dragged, itm2: inplace
        const app = [...list];
        const idx1 = app.findIndex(e => e.id === itm1.id);
        const idx2 = app.findIndex(e => e.id === itm2.id);

        let slice1, slice2, slice3;

        if (idx1 > idx2) {
            itm1.priority = itm2.priority;
            slice1 = app.slice(0, idx2);
            slice2 = app.slice(idx2, idx1);
            slice3 = app.slice(idx1);
            slice3.shift()
            slice2.forEach(e => e.priority -= 1);
            slice2.forEach(e => updateItem(e));

            setList([...slice1, itm1, ...slice2, ...slice3])
        } else {
            console.log('idx1 < idx2');
            itm1.priority = itm2.priority;
            slice1 = app.slice(0, idx1);
            slice2 = app.slice(idx1, idx2+1);
            slice3 = app.slice(idx2+1);
            slice2.shift()
            slice2.forEach(e => e.priority += 1);
            
            setList([...slice1, ...slice2, itm1, ...slice3])
        }
        
        slice2.forEach(e => updateItem(e));
        updateItem(itm1);
        
        return true;
    }, [list]);

    const onSubmit = (data) => {
        console.log('onSubmit', data, formAction);
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
        'addItem': addItem,
        'updateItem': updateItem,
        'deleteItem': deleteItem,
        'moveItemTo': moveItemTo,
        'active': active,
        'setActive': setActive,
    }

    return (
        <TodoAPIContext.Provider value={newProps}>
            {children}
        </TodoAPIContext.Provider>
    )
}

export function useTodoAPI(endpoint = process.env.REACT_APP_TODO_ENDPOINT) {
    const getList = useCallback(() => {
        return axios.get(`${endpoint}/`, {
            headers: { 'Content-Type': 'application/json' },
        })
        .catch((err) => console.log(err))
        .then(({data}) => data);
    }, [endpoint]);

    const getItem = useCallback((id) => {
        return axios.get(`${endpoint}/${id}/`, {
            headers: { 'Content-Type': 'application/json' }
        });
    }, [endpoint]);

    const updateItem = useCallback((id, data) => {
        return axios.patch(`${endpoint}/${id}/`, data, {})
            .catch((err) => console.log(err));
    }, [endpoint]);

    const deleteItem = useCallback((id) => {
        return axios.delete(`${endpoint}/${id}/`, {}) 
            .catch((err) => console.log(err));
    }, [endpoint]);

    const addItem = useCallback((data) => {
        return axios.post(`${endpoint}/`, data, {})
            .catch((err) => console.log(err));
    }, [endpoint]);

    return { getList, getItem, updateItem, deleteItem, addItem};
}