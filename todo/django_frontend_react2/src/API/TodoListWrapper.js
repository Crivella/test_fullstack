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

    // const [addList, setAddList] = useState([]); // [{}
    // const [updateList, setUpdateList] = useState({}); // [{}
    // const [deleteList, setDeleteList] = useState([]); // [{}]

    // const [maxID, setMaxID] = useState(0); // [{}
    // const [maxPrio, setMaxPrio] = useState(0); // [{}

    // Lifecycle
    useEffect(() => {
        axios.get(`${endpoint}/`, {
            headers: { 'Content-Type': 'application/json' },
        })
        .catch((err) => console.log(err))
        .then(({data}) => setList(data));
    }, [user, endpoint]);

    // useEffect(() => {
    //     let max;
    //     max = list.reduce((acc, e) => Math.max(acc, e.priority), 0);
    //     setMaxPrio(max);
    //     max = list.reduce((acc, e) => Math.max(acc, e.id), 0);
    //     setMaxID(max);
    // }, [list]);

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

    // const flusthItems = useCallback(() => {
    //     deleteList.forEach(e => deleteItem(e));
    //     setDeleteList([]);
    //     updateList.forEach(e => updateItem(e));
    //     setUpdateList({});
    //     addList.forEach(e => addItem(e));
    //     setAddList([]);
    // }, [addList, updateList, deleteList, addItem, updateItem, deleteItem]);

    // const addItemBulk = useCallback((data) => {
    //     const app = {priority: maxPrio + 1, id: maxID + 1, ...data};
    //     setAddList([...addList, app]);
    //     setList([app, ...list]);
    //     return true;
    // }, [list, addList, maxPrio, maxID]);

    // const updateItemBulk = useCallback((data) => {
    //     console.log(data);
    //     const app = {...updateList};
    //     app[data.id] = data;
    //     setUpdateList(app);
    //     setList(list.map(e => e.id === data.id ? data : e));
    //     return true;
    // }, [list, updateList]);

    // const deleteItemBulk = useCallback((id) => {
    //     const idxAdd = addList.findIndex(e => e.id === id);
    //     if (idxAdd !== -1) {
    //         setAddList(addList.filter(e => e.id !== id));
    //     } else {
    //         setDeleteList([...deleteList, id]);
    //     }
    //     setDeleteList([...deleteList, id]);
    //     setList(list.filter(e => e.id !== id));
    //     // setActive(null);
    //     return true;
    // }, [list, addList, deleteList]);

    return { 
        list, setList,
        getItem, updateItem, deleteItem, addItem,
        // addItemBulk, updateItemBulk, deleteItemBulk,
    };
}

export function useTodoBulkAPI(endpoint = process.env.REACT_APP_TODO_ENDPOINT) {
    const { list, setList, getItem, updateItem, deleteItem, addItem } = useTodoAPI();

    const [addList, setAddList] = useState(new Map()); // [{}
    const [updateList, setUpdateList] = useState(new Map()); // [{}
    const [deleteList, setDeleteList] = useState(new Map()); // [{}]

    const [maxID, setMaxID] = useState(0); // [{}
    const [maxPrio, setMaxPrio] = useState(0); // [{}

    // Lifecycle

    useEffect(() => {
        let max;
        max = list.reduce((acc, e) => Math.max(acc, e.priority), 0);
        setMaxPrio(max);
        max = list.reduce((acc, e) => Math.max(acc, e.id), 0);
        setMaxID(max);
    }, [list]);

    const flusthItems = useCallback(() => {
        // console.log('Flush');
        // console.log('Add', addList);
        // console.log('Update', updateList);
        // console.log('Delete', deleteList);
        deleteList.forEach(e => deleteItem(e));
        setDeleteList([]);
        updateList.forEach(e => updateItem(e));
        setUpdateList({});
        addList.forEach(e => addItem(e));
        setAddList([]);
    }, [addList, updateList, deleteList, addItem, updateItem, deleteItem]);

    const addItemBulk = useCallback((data) => {
        const newItem = {priority: maxPrio + 1, id: maxID + 1, ...data};
        addList.set(newItem.id, newItem);
        setAddList(addList);
        if (deleteList.delete(newItem.id)) {
            setDeleteList(deleteList);
        }
        setList([newItem, ...list]);
        return true;
    }, [list, setList, addList, deleteList, maxPrio, maxID]);

    const updateItemBulk = useCallback((data) => {
        updateList.set(data.id, data);
        setUpdateList(updateList);
        setList(list.map(e => e.id === data.id ? data : e));
        return true;
    }, [list, setList, updateList]);

    const deleteItemBulk = useCallback((id) => {
        // console.log('Delete', id);
        // console.log('Update', updateList);
        updateList.delete(id);
        // setUpdateList(updateList);
        console.log('Update', updateList);
        if (addList.delete(id)) {
            setAddList(addList);
        } else {
            deleteList.set(id, true);
            setDeleteList(deleteList);
        }
        setList(list.filter(e => e.id !== id));
        // setActive(null);
        return true;
    }, [list, setList, addList, deleteList]);

    return { 
        list,
        getItem, updateItem, deleteItem, addItem,
        addItemBulk, updateItemBulk, deleteItemBulk,
        flusthItems
    };
}