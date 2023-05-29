import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import useQueue from '../Hooks/Queue';
import { useFilter, usePagination, useSort } from '../context/Hooks';
import { AuthContext } from './Auth';

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export const TodoAPIContext = createContext({});

export function TodosAPIWrapper({children}) {
    // const { list: serverList } = useTodoAPI();

    const applyFilters = useFilter();
    const applySort = useSort();
    const {paginateList} = usePagination();

    const [active, setActive] = useState(null);
    const [visibleList, setVisibleList] = useState([]); // [{}]
    const [formHeader, setFormHeader] = useState('Add Item'); 
    const [formAction, setFormAction] = useState('add');

    const { 
        list: serverList,
        addItemBulk: addItem,
        updateItemBulk: updateItem,
        deleteItemBulk: deleteItem,
        flusthItems
    } = useTodoBulkAPI()
    // const { addItem, updateItem, deleteItem } = useTodoAPI()

    // Lifecycle
    useEffect(() => {
        const app = paginateList(applySort(applyFilters(serverList)));
        app.forEach((e, idx) => e.idx = idx);
        setVisibleList(app);
    }, [serverList, paginateList, applyFilters, applySort]);

    useEffect(() => {
        switch (formAction) {
            case 'add': return setFormHeader('Add Item');
            case 'edit': return setFormHeader('Edit Item');
            case 'delete': return setFormHeader('Delete Item');
            default: throw new Error('Invalid form action');
        }
    }, [formAction]);

    // This should probably be somewhere else?
    const moveItemTo = useCallback((itm1, itm2) => { // itm1: dragged, itm2: inplace
        const idx1 = itm1.idx;
        const idx2 = itm2.idx;

        let  slice;
        if (idx1 > idx2) {
            slice = visibleList.slice(idx2, idx1);
            slice = slice.map(e => ({...e, priority: e.priority - 1}))
        } else {
            slice = visibleList.slice(idx1+1, idx2+1);
            slice = slice.map(e => ({...e, priority: e.priority + 1}))
        }
        slice.forEach(e => updateItem(e));
        updateItem({...itm1, priority: itm2.priority});
        
        return true;
    }, [visibleList, updateItem]);

    const onSubmit = (data) => {
        switch (formAction) {
            case 'add': return addItem(data);
            case 'edit': return updateItem(data);
            case 'delete':
                const id = data.id || data;
                return deleteItem(id);
            default:
                throw new Error('Invalid form action');
        }
    };

    const newProps = {
        'list': visibleList, // [{}, {}, {}]
        'formHeader': formHeader,
        'formAction': formAction, // 'add' or 'edit
        'setFormAction': setFormAction,
        'todoAction': onSubmit,
        'addItem': addItem,
        'updateItem': updateItem,
        'deleteItem': deleteItem,
        'flushItems': flusthItems,
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
    const { user } = useContext(AuthContext);
    const [list, setList] = useState([]); // [{}, {}

    // Lifecycle
    useEffect(() => {
        axios.get(`${endpoint}/`, {
            headers: { 'Content-Type': 'application/json' },
        })
        .catch((err) => console.log(err))
        .then(({data}) => setList(data));
    }, [user, endpoint]);

    const getEmptyItem = useCallback((data) => {
        return {
            title: '',
            description: '',
            priority: 0,
            completed: false,
            private: false,
            user: user.id,
            ...data
        };
    }, [user]);

    const getItem = useCallback((id) => {
        return axios.get(`${endpoint}/${id}/`, {
            headers: { 'Content-Type': 'application/json' }
        });
    }, [endpoint]);

    const updateItem = useCallback((data) => {
        return axios.patch(`${endpoint}/${data.id}/`, data, {})
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

    return { 
        list, setList,
        getItem, getEmptyItem,
        updateItem, deleteItem, addItem,
    };
}

export function useTodoBulkAPI(endpoint = process.env.REACT_APP_TODO_ENDPOINT) {
    const { list: serverList, getItem, getEmptyItem, updateItem, deleteItem, addItem } = useTodoAPI();

    const [list, setList] = useState([]); // [{}, {}
    const [changedServerList, setChangedServerList] = useState(false);
    const { push, flush } = useQueue({
        id: 'todo',
        cache: 'local',
        dataActions: {
            'add': (data) => setList((list) => [data, ...list]), // list.push(data)
            'update': (data) => setList((list) => list.map((itm) => itm.id === data.id ? data : itm)),
            'delete': (id) => setList((list) => list.filter((itm) => itm.id !== id)),
            'list': list
        },
        flustActions: {
            'add': addItem,
            'update': updateItem,
            'delete': deleteItem
        },
    }, [changedServerList, setList]);

    const [maxID, setMaxID] = useState(0); // [{}
    const [maxPrio, setMaxPrio] = useState(0); // [{}

    // Lifecycle

    useEffect(() => {
        setChangedServerList((c) => {
            setList([...serverList]);
            return !c;
        })
    }, [serverList]);

    useEffect(() => {
        let max;
        max = list.reduce((acc, e) => Math.max(acc, e.priority), 0);
        setMaxPrio(max);
        max = list.reduce((acc, e) => Math.max(acc, e.id), 0);
        setMaxID(max);
    }, [list]);

    // Callbacks
    const addItemBulk = useCallback((data) => {
        const newItem = getEmptyItem({priority: maxPrio + 1, id: maxID + 1, ...data});
        push('add', newItem);
        return true;
    }, [getEmptyItem, push, maxPrio, maxID]);

    const updateItemBulk = useCallback((data) => {
        push('update', data);
        return true;
    }, [push]);

    const deleteItemBulk = useCallback((id) => {
        push('delete', id);
        return true;
    }, [push]);

    return { 
        list,
        getItem, getEmptyItem,
        updateItem, deleteItem, addItem,
        addItemBulk, updateItemBulk, deleteItemBulk,
        flusthItems: flush
    };
}