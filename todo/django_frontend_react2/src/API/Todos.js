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
    const [active, setActive] = useState(null);
    // const [visibleList, setVisibleList] = useState([]); // [{}]
    const [formHeader, setFormHeader] = useState('Add Item'); 
    const [formAction, setFormAction] = useState('add');

    const {list, loading, error, dispatch} = useTodoBackendAPI()

    // Lifecycle
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
    }, [dispatch]);

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
        'list': list, // [{}, {}, {}]
        'loading': loading,
        'error': error,
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

function statusReducer(state, action) {
    let { data, map, list } = state;
    let maptrigger = false;
    const loading = (action.type === 'loading');
    const error = (action.type === 'error' ? action.error : null);

    switch (action.type) {
        case 'loading': break;
        case 'error': break;
        case 'set': 
            data = {};
            action.data.forEach((itm) => data[itm.id] = itm);
            list = applyMap(data, map);
            break;
        case 'list':
            list = applyMap(data, map);
            list = list.sort((a, b) => a.completed - b.completed);
            break;
        case 'map': 
            map = action.data;
            break;
        case 'delete':
            const {[action.data.id]: _, ...rest} = data
            data = rest;
            map = map.filter((id) => id !== action.data.id);
            maptrigger = true;
            break
        case 'update':
            data = {...data, [action.data.id]: action.data};
            break;
        case 'add':
            data = {...data, [action.data.id]: action.data};
            map = [action.data.id, ...map];
            maptrigger = true;
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
            throw new Error('Invalid action type');
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

    const asyncDispatch = useCallback((action) => {
        const {type, data} = action;

        dispatch({type: 'loading'})
        switch (type) {
            case 'map': 
                return axios.post(`${endpoint}/map/`, data, {})
                    .then(({data}) => dispatch({type: 'map', 'data': data}))
                    .then(() => dispatch({type: 'list'}))
                    .then(() => true)
                    .catch((err) => dispatch({type: 'error', error: err}));
            case 'add': 
                return axios.post(`${endpoint}/`, data, {})
                    .then(({data}) => dispatch({type: 'add', 'data': data}))
                    .then(() => dispatch({type: 'list'}))
                    .then(() => true)
                    .catch((err) => dispatch({type: 'error', error: err}));
            case 'update': 
                return axios.patch(`${endpoint}/${data.id}/`, data, {})
                    .then(({data}) => dispatch({type: 'update', 'data': data}))
                    .then(() => dispatch({type: 'list'}))
                    .then(() => true)
                    .catch((err) => dispatch({type: 'error', error: err}));
            case 'delete':
                return axios.delete(`${endpoint}/${data.id}/`, {})
                    .then(() => dispatch({type: 'delete', 'data': data}))
                    .then(() => dispatch({type: 'list'}))
                    .then(() => true)
                    .catch((err) => dispatch({type: 'error', error: err}));
            default:
                return new Promise(r => r({'data': data, 'res': dispatch({type: type, 'data': data})}));
            }
    }, [endpoint]);

    return { 
        'list': list.list, 'loading': list.loading, 'error': list.error,
        'dispatch': asyncDispatch
    };
}
