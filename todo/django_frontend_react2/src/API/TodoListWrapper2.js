import axios from 'axios';
import { useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { TodoAPIContext } from '../Context/API';
import { useFilter, useSort } from '../commons/FilterSortWrapper';
import { usePagination } from '../commons/PaginationWrapper';
import { AuthContext } from './AuthWrapper';

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export function TodosAPIWrapper({children}) {
    // const { list: serverList } = useTodoAPI();

    const applyFilters = useFilter();
    const applySort = useSort();
    const {paginateList} = usePagination();

    const [active, setActive] = useState(null);
    const [visibleList, setVisibleList] = useState([]); // [{}]
    const [formHeader, setFormHeader] = useState('Add Item'); 
    const [formAction, setFormAction] = useState('add');

    const {list: serverList, loading: serverLoading, error: serverError, dispatch} = useTodoBackendAPI()
    // const { 
    //     list: serverList,
    //     dispatch,
    // } = useTodoSimpleAPI(_serverList)
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
        slice.forEach(e => dispatch({type: 'update', data: e}));
        dispatch({type: 'update', data: {...itm1, priority: itm2.priority}});
        
        return true;
    }, [visibleList, dispatch]);

    const onSubmit = (data) => {
        switch (formAction) {
            case 'add': return dispatch({type: 'add', data: data});
            case 'edit': return dispatch({type: 'update', data: data});
            case 'delete':
                const id = data.id || data;
                return dispatch({type: 'delete', id: id});
            default:
                throw new Error('Invalid form action');
        }
    };

    const newProps = {
        'list': visibleList, // [{}, {}, {}]
        'loading': serverLoading,
        'error': serverError,
        'formHeader': formHeader,
        'formAction': formAction, // 'add' or 'edit
        'setFormAction': setFormAction,
        'todoAction': onSubmit,
        'dispatch': dispatch,
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

function listReducer(state, action) {
    let newData = state.data;
    let loading = false;
    let error = null;
    switch (action.type) {
        case 'loading':
            loading = true;
            break;
        case 'error':
            error = action.error;
            break;
        case 'set': 
            newData = action.data;
            break
        case 'add': 
            newData = [action.data, ...state];
            break; 
        case 'update':
            newData = state.data.map((itm) => itm.id === action.data.id ? action.data : itm);
            break;
        case 'delete':
            newData = state.data.filter((itm) => itm.id !== action.id);
            break;
        default:
            throw new Error('Invalid action type');
    }

    return {data: newData, loading: loading, error: error};
}

export function useTodoBackendAPI(endpoint = process.env.REACT_APP_TODO_ENDPOINT) {
    const { user } = useContext(AuthContext);
    const [list, dispatch] = useReducer(listReducer, {
        loading: false,
        error: null,
        data: [] // [{}, {}

    }); 
    // Lifecycle
    useEffect(() => {
        dispatch({type: 'loading'});
        axios.get(`${endpoint}/`, {
            headers: { 'Content-Type': 'application/json' },
        })
            .then(({data}) => dispatch({type: 'set', data}))
            .catch((err) => dispatch({type: 'error', error: err}));
    }, [user, endpoint]);

    const getEmptyItem = useCallback((data) => {
        return {
            title: '',
            description: '',
            priority: 0,
            completed: false,
            private: false,
            ...data
        };
    }, []);

    const asyncDispatch = useCallback((action) => {
        dispatch({type: 'loading'})
        const fn = (type, data) => {
            switch (type) {
                case 'add': 
                    return axios.post(`${endpoint}/`, data, {});
                case 'update':
                    return axios.patch(`${endpoint}/${data.id}/`, data, {});
                case 'delete':
                    return axios.delete(`${endpoint}/${data.id}/`, {}) ;
                default:
                    throw new Error('Invalid action type');
            }
        }
        fn(action.type, action.data)
            .catch((err) => dispatch({type: 'error', error: err}))
            .then(() => dispatch(action));
    }, [endpoint]);

    return { 
        'list': list.data, 'loading': list.loading, 'error': list.error,
        'dispatch': asyncDispatch, getEmptyItem,
    };
}


// export function useTodoCacheAPI() {
//     const {getItem, getEmptyItem, updateItem, deleteItem, addItem } = useTodoSimpleAPI();

//     const [list, dispatch] = useTodoSimpleAPI(); // [{}, {}
//     const { push, flush } = useQueue({
//         id: 'todo',
//         cache: 'local',
//         dataActions: {
//             'add': (data) => dispatch({type: 'add', data}), 
//             'update': (data) => dispatch({type: 'update', data}), 
//             'delete': (id) => dispatch({type: 'delete', id}),
//         },
//         flustActions: {
//             'add': addItem,
//             'update': updateItem,
//             'delete': deleteItem
//         },
//     }, [dispatch]);

//     const [maxID, setMaxID] = useState(0); // [{}
//     const [maxPrio, setMaxPrio] = useState(0); // [{}

//     // Lifecycle
//     useEffect(() => {
//         let max;
//         max = list.reduce((acc, e) => Math.max(acc, e.priority), 0);
//         setMaxPrio(max);
//         max = list.reduce((acc, e) => Math.max(acc, e.id), 0);
//         setMaxID(max);
//     }, [list]);

//     // Callbacks
//     const addItemBulk = useCallback((data) => {
//         const newItem = getEmptyItem({priority: maxPrio + 1, id: maxID + 1, ...data});
//         push('add', newItem);
//         return true;
//     }, [getEmptyItem, push, maxPrio, maxID]);

//     const updateItemBulk = useCallback((data) => {
//         push('update', data);
//         return true;
//     }, [push]);

//     const deleteItemBulk = useCallback((id) => {
//         push('delete', id);
//         return true;
//     }, [push]);

//     return { 
//         list,
//         getItem, getEmptyItem,
//         updateItem, deleteItem, addItem,
//         addItemBulk, updateItemBulk, deleteItemBulk,
//         flusthItems: flush
//     };
// }