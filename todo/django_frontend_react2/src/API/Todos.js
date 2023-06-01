import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { AuthContext } from './Auth';
import { FilterSortContext } from './FilterSort';
import { PaginationContext } from './Pagination';

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export const TodoAPIContext = createContext({});

export default function APITodosProvider({children}) {
    // const applyFilters = useFilter();
    // const applySort = useSort();
    // const {paginateList} = usePagination();

    const [active, setActive] = useState(null);
    const [visibleList, setVisibleList] = useState([]); // [{}]
    const [formHeader, setFormHeader] = useState('Add Item'); 
    const [formAction, setFormAction] = useState('add');

    const {list: serverList, loading: serverLoading, error: serverError, dispatch} = useTodoBackendAPI()

    // Lifecycle
    // useEffect(() => {
    //     const app = paginateList(applySort(applyFilters(serverList)));
    //     app.forEach((e, idx) => e.idx = idx);
    //     setVisibleList(app);
    // }, [serverList, paginateList, applyFilters, applySort]);
    useEffect(() => {
        serverList.forEach((e, idx) => e.idx = idx);
        setVisibleList(serverList);
    }, [serverList]);

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
        dispatch({type: 'moveInsert', data: {itm1, itm2}})
        // const idx1 = itm1.idx;
        // const idx2 = itm2.idx;

        // console.log('moveItemTo', itm1, itm2, idx1, idx2);
        // let  slice, slice1, slice2, slice3;
        // if (idx1 > idx2) {
        //     slice1 = visibleList.slice(0, idx2);
        //     slice2 = visibleList.slice(idx2, idx1);
        //     slice3 = visibleList.slice(idx1+1);
        //     slice = visibleList.slice(idx2, idx1);
        //     slice = slice.map(e => ({...e, priority: e.priority - 1}))
        //     setVisibleList([...slice1, itm1, ...slice2, ...slice3]);
        // } else {
        //     slice1 = visibleList.slice(0, idx1);
        //     slice2 = visibleList.slice(idx1+1, idx2+1);
        //     slice3 = visibleList.slice(idx2+1);
        //     slice = visibleList.slice(idx1+1, idx2+1);
        //     slice = slice.map(e => ({...e, priority: e.priority + 1}))
        //     setVisibleList([...slice1, ...slice2, itm1, ...slice3]);
        // }
        // slice.forEach(e => dispatch({type: 'update', data: e}));
        // dispatch({type: 'update', data: {...itm1, priority: itm2.priority}});
        
        return true;
    }, [visibleList, dispatch]);

    const onSubmit = (data) => {
        switch (formAction) {
            case 'add': return dispatch({type: 'add', data: data});
            case 'edit': return dispatch({type: 'update', data: data});
            case 'delete': return dispatch({type: 'delete', data: data});
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
    console.log('listReducer', action);
    switch (action.type) {
        case 'set': return action.data;
        case 'add': return [action.data, ...state];
        case 'moveInsert': {
            const itm1 = action.data.itm1;
            const itm2 = action.data.itm2;
            const idx1 = state.findIndex((itm) => itm.id === itm1.id);
            const idx2 = state.findIndex((itm) => itm.id === itm2.id);
            let  slice1, slice2, slice3;
            if (idx1 > idx2) {
                slice1 = state.slice(0, idx2);
                slice2 = state.slice(idx2, idx1);
                slice3 = state.slice(idx1+1);
                return [...slice1, itm1, ...slice2, ...slice3];
            } else {
                slice1 = state.slice(0, idx1);
                slice2 = state.slice(idx1+1, idx2+1);
                slice3 = state.slice(idx2+1);
                return [...slice1, ...slice2, itm1, ...slice3];
            }

        } 
        case 'update': return state.map((itm) => itm.id === action.data.id ? action.data : itm);
        case 'delete': return state.filter((itm) => itm.id !== action.data.id);
        default:
            return state;
    }
}

function statusReducer(state, action) {
    let data = listReducer(state.data, action);
    let loading = (action.type === 'loading');
    let error = (action.type === 'error' ? action.error : null);

    return {data, loading, error};
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function useTodoBackendAPI(endpoint = process.env.REACT_APP_TODO_ENDPOINT) {
    const { user } = useContext(AuthContext);
    const {getParams: FSParams} = useContext(FilterSortContext);
    const {getParams: PagParams, setCount} = useContext(PaginationContext);
    const [trigger, setTrigger] = useState(false);
    const [list, dispatch] = useReducer(statusReducer, {
        loading: false,
        error: null,
        data: [] // [{}, {}

    }); 
    // Lifecycle
    // Usefull for avoiding spamming the backend when state
    // are adjusting on initialization
    useEffect(() => {
        if (user != null) {
            timeout(300).then(() => setTrigger(true));
        }
    }, [user, endpoint, FSParams, PagParams, setCount]);

    useEffect(() => {
        if (trigger) {
            dispatch({type: 'loading'});
            axios.get(`${endpoint}/`, {
                headers: { 'Content-Type': 'application/json' },
                params: {...FSParams, ...PagParams}
            })
                .then(({data}) => {
                    setCount(data.count);
                    return dispatch({type: 'set', 'data': data.results});
                })
                .catch((err) => dispatch({type: 'error', error: err}));
            setTrigger(false);
        }
    }, [trigger]);

    const getNewItem = useCallback((data) => {
        const maxPrio = list.data.reduce((acc, e) => Math.max(acc, e.priority), 0);
        return {
            title: '',
            description: '',
            priority: maxPrio + 1,
            completed: false,
            private: false,
            ...data
        };
    }, [list]);

    const asyncDispatch = useCallback((action) => {
        console.log('asyncDispatch', action);
        const fn = (type, data) => {
            console.log('fn', type, data);
            switch (type) {
                case 'add': return axios.post(`${endpoint}/`, data, {});
                case 'update': return axios.patch(`${endpoint}/${data.id}/`, data, {});
                case 'delete': return axios.delete(`${endpoint}/${data.id}/`, {}) ;
                default:
                    return Promise.resolve();
                    throw new Error('Invalid action type');
                }
            }
        if (action.type === 'add') action.data = getNewItem(action.data);

        dispatch({type: 'loading'})
        fn(action.type, action.data)
            .then(({data}) => {
                console.log('asyncDispatch...', data);
                dispatch({'type': action.type, 'data': data || action.data});
            })
            .catch((err) => dispatch({type: 'error', error: err}));
        return true;
    }, [endpoint, getNewItem]);

    return { 
        'list': list.data, 'loading': list.loading, 'error': list.error,
        'dispatch': asyncDispatch, getEmptyItem: getNewItem,
    };
}
