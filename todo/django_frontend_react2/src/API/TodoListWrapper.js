import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useFilter, useSort } from '../commons/FilterSortWrapper';
import { usePagination } from '../commons/PaginationWrapper';
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
    const {paginateList} = usePagination();

    const [active, setActive] = useState(null);
    const [maxID, setMacID] = useState(0); // [{}
    const [maxPrio, setMaxPrio] = useState(0); // [{}
    const [list, setList] = useState([]); // [{}
    const [fullList, setFullList] = useState([]); // [{}
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

    useEffect(() => {
        const app = paginateList(applySort(applyFilters(fullList)));
        app.forEach((e, idx) => e.idx = idx);
        setList(app);
    }, [fullList, paginateList, applyFilters, applySort]);

    useEffect(() => {
        setFullList(serverList);
    }, [serverList]);

    useEffect(() => {
        let max;
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
        setFullList([app, ...fullList]);
        return true;
    }, [fullList, addList, maxPrio, maxID]);

    const updateItem = useCallback((data) => {
        const app = {...updateList};
        app[data.id] = data;
        setUpdateList(app);
        setFullList(fullList.map(e => e.id === data.id ? data : e));
        return true;
    }, [fullList, updateList]);

    const deleteItem = useCallback((id) => {
        setDeleteList([...deleteList, id]);
        setFullList(fullList.filter(e => e.id !== id));
        setActive(null);
        return true;
    }, [fullList, deleteList]);

    const moveItemTo = useCallback((itm1, itm2) => { // itm1: dragged, itm2: inplace
        const idx1 = itm1.idx;
        const idx2 = itm2.idx;

        let  slice;

        itm1.priority = itm2.priority;
        if (idx1 > idx2) {
            slice = list.slice(idx2, idx1);
            slice.forEach(e => e.priority -= 1);
        } else {
            slice = list.slice(idx1+1, idx2+1);
            slice.forEach(e => e.priority += 1);
        }
        
        slice.forEach(e => updateItem(e));
        updateItem(itm1);
        
        return true;
    }, [list, updateItem]);

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