import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useFilter, useSort } from '../commons/FilterSortWrapper';
import { usePagination } from '../commons/PaginationWrapper';
import { AuthContext } from './AuthWrapper';

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export const TodoAPIContext = createContext({});
export const TodoAPIBulkContext = createContext({});

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

        itm1.priority = itm2.priority;
        if (idx1 > idx2) {
            slice = visibleList.slice(idx2, idx1);
            slice.forEach(e => e.priority -= 1);
        } else {
            slice = visibleList.slice(idx1+1, idx2+1);
            slice.forEach(e => e.priority += 1);
        }
        
        slice.forEach(e => updateItem(e));
        updateItem(itm1);
        
        return true;
    }, [visibleList, updateItem]);

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
        getItem, updateItem, deleteItem, addItem,
    };
}

export function useTodoBulkAPI(endpoint = process.env.REACT_APP_TODO_ENDPOINT) {
    const { list: serverList, getItem, updateItem, deleteItem, addItem } = useTodoAPI();

    const [list, setList] = useState([]); // [{}, {}
    const [addList, setAddList] = useState(new Map(JSON.parse(localStorage.getItem('addList')))); // [{}
    const [updateList, setUpdateList] = useState(new Map(JSON.parse(localStorage.getItem('updateList')))); // [{}
    const [deleteList, setDeleteList] = useState(new Map(JSON.parse(localStorage.getItem('deleteList')))); // [{}]

    const [maxID, setMaxID] = useState(0); // [{}
    const [maxPrio, setMaxPrio] = useState(0); // [{}

    const [adding, setAdding] = useState(false); // [{
    const [updating, setUpdating] = useState(false); // [{}
    const [deleting, setDeleting] = useState(false); // [{}]

    // Lifecycle
    // Apply local changes to server list
    useEffect(() => {
        let app = [...serverList];

        app = app.concat(Array.from(addList.values()));
        app = Array.from(updateList.values()).reduce((acc, e) => {
            return acc.map((itm) => itm.id === e.id ? e : itm );
        }, app);
        app = app.filter((itm) => !deleteList.has(itm.id));

        setList(app);
    }, [serverList]);

    useEffect(() => {
        let max;
        max = list.reduce((acc, e) => Math.max(acc, e.priority), 0);
        setMaxPrio(max);
        max = list.reduce((acc, e) => Math.max(acc, e.id), 0);
        setMaxID(max);
    }, [list]);

    useEffect(() => {
        localStorage.setItem('addList', JSON.stringify(Array.from(addList.entries())));
        if (adding) {
            setAddList(new Map(addList));
            setAdding(false);
            setList([...list, ...Array.from(addList.values())]);
        }
    }, [adding, addList]);

    useEffect(() => {
        localStorage.setItem('updateList', JSON.stringify(Array.from(updateList.entries())));
        if (updating) {
            setUpdateList(new Map(updateList))
            setUpdating(false);
            let app = [...list];
            app = Array.from(updateList.values()).reduce((acc, e) => {
                return acc.map((itm) => itm.id === e.id ? e : itm );
            }
            , app);
            setList(app);
        }
    }, [updating, updateList]);

    useEffect(() => {
        localStorage.setItem('deleteList', JSON.stringify(Array.from(deleteList.entries())));
        if (deleting) {
            setDeleteList(new Map(deleteList));
            setDeleting(false);
            setList(list.filter((itm) => !deleteList.has(itm.id)));
        }
    }, [deleting, deleteList]);

    // Callbacks
    const flusthItems = useCallback(() => {
        console.log('Flush');
        console.log('Add', addList);
        console.log('Update', updateList);
        console.log('Delete', deleteList);
        Array.from(deleteList.keys()).forEach(e => deleteItem(e));
        Array.from(updateList.values()).forEach(e => updateItem(e));
        Array.from(addList.values()).forEach(e => addItem(e));
        setDeleteList(new Map());
        setUpdateList(new Map());
        setAddList(new Map());
    }, [addList, updateList, deleteList, addItem, updateItem, deleteItem]);

    const addItemBulk = useCallback((data) => {
        console.log('Add', data);
        const newItem = {priority: maxPrio + 1, id: maxID + 1, ...data};
        addList.set(newItem.id, newItem);
        setAdding(true);
        if (deleteList.delete(data.id)) {
            setDeleting(true);
        }
        return true;
    }, [addList, deleteList, maxPrio, maxID]);

    const updateItemBulk = useCallback((data) => {
        if (addList.has(data.id)) {
            addList.set(data.id, data);
            setAdding(true);
        } else {
            updateList.set(data.id, data);
            setUpdating(true);
        };
        return true;
    }, [updateList, addList]);

    const deleteItemBulk = useCallback((id) => {
        console.log('Delete', id);
        if (updateList.delete(id)) {
            console.log('Updating');
            setUpdating(true);
        }
        if (addList.delete(id)) {
            console.log('Adding');
            setAdding(true);
        } else {
            console.log('Deleting');
            deleteList.set(id, true);
            setDeleting(true);
        }
        return true;
    }, [ addList, updateList, deleteList]);

    return { 
        list,
        getItem, updateItem, deleteItem, addItem,
        addItemBulk, updateItemBulk, deleteItemBulk,
        flusthItems
    };
}