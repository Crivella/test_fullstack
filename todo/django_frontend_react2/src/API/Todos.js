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
    const data = action.data;
    switch (action.type) {
        case 'add': return {...state, [data.id]: data};
        case 'update': return {...state, [data.id]: data};
        case 'delete': 
            const {[data.id]: _, ...rest} = state;
            return rest;
        default:
            return state;
    }
}

function statusReducer(state, action) {
    let { data, map, list } = state;
    let maptrigger = false;
    const loading = (action.type === 'loading');
    const error = (action.type === 'error' ? action.error : null);

    const applyMap = (data, map, list) => {
        let res = map
        .map((id) => data[id])
        .filter((itm) => itm !== undefined);

        if (res.length === 0) {
            if (list !== undefined)
                res = list;
            else
                res = Object.values(data);
        }
        return res;
    }
    
    console.log('statusReducer', action);
    switch (action.type) {
        case 'loading': break;
        case 'error': break;
        case 'set': 
            data = {};
            action.data.forEach((itm) => data[itm.id] = itm);
            list = applyMap(data, map);
            break;
        case 'map': 
            map = action.data;
            list = applyMap(data, map, list);
            break;
        case 'add':
            data = listReducer(data, action);
            map = [data.id, ...map];
            list = applyMap(data, map, list);
            break;
        case 'moveInsert': {
            const itm1 = action.data.itm1;
            const itm2 = action.data.itm2;
            const idx1 = map.indexOf(itm1.id);
            const idx2 = map.indexOf(itm2.id);

            let slice1, slice2, slice3;
            if (idx1 > idx2) {
                slice1 = map.slice(0, idx2);
                slice2 = map.slice(idx2, idx1);
                slice3 = map.slice(idx1+1);
                map = [...slice1, itm1.id, ...slice2, ...slice3];
            } else {
                slice1 = map.slice(0, idx1);
                slice2 = map.slice(idx1+1, idx2+1);
                slice3 = map.slice(idx2+1);
                map = [...slice1, ...slice2, itm1.id, ...slice3];
            }
            list = applyMap(data, map, list)
            maptrigger = true;
            break;
        }
        default:
            data = listReducer(data, action);
            list = applyMap(data, map, list);
            break;
    }

    return {data, map, list, loading, error, maptrigger};
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
        data: {}, // {id: {}, id: {}, id: {}}
        list: [],
        map: [],
        maptrigger: false,
    }); 

    // Lifecycle
    // Usefull for avoiding spamming the backend when state
    // are adjusting on initialization
    useEffect(() => {
        if (user != null) {
            timeout(150).then(() => setTrigger(true));
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
            axios.get(`${endpoint}/map/`, {
                headers: { 'Content-Type': 'application/json' },
            })
                .then(({data}) => dispatch({type: 'map', 'data': data}))
                .catch((err) => dispatch({type: 'error', error: err}));
            setTrigger(false);
            }
    }, [trigger]);

    useEffect(() => {
        if (list.maptrigger && list.map.length > 0)
        {
            asyncDispatch({type: 'map', 'data': list.map});
        }
    }, [list.maptrigger]);

    // const getNewItem = useCallback((data) => {
    //     const maxPrio = list.data.reduce((acc, e) => Math.max(acc, e.priority), 0);
    //     return {
    //         title: '',
    //         description: '',
    //         priority: maxPrio + 1,
    //         completed: false,
    //         private: false,
    //         ...data
    //     };
    // }, [list]);

    const asyncDispatch = useCallback((action) => {
        const fn = (type, data) => {
            switch (type) {
                case 'map': return axios.post(`${endpoint}/map/`, data, {});
                case 'add': return axios.post(`${endpoint}/`, data, {});
                case 'update': return axios.patch(`${endpoint}/${data.id}/`, data, {});
                case 'delete': return axios.delete(`${endpoint}/${data.id}/`, {}) ;
                default:
                    return new Promise(r => r({'data': data}));
                }
            }
        // if (action.type === 'add') action.data = getNewItem(action.data);

        dispatch({type: 'loading'})
        fn(action.type, action.data)
            .then(({data}) => {
                dispatch({'type': action.type, 'data': data || action.data});
                return {data};
            })
            .catch((err) => dispatch({type: 'error', error: err}));
        return true;
    }, [endpoint]);

    return { 
        'list': list.list, 'loading': list.loading, 'error': list.error,
        'dispatch': asyncDispatch
    };
}
