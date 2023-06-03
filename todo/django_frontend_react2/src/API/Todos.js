import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from './Auth';
import { FilterSortContext } from './FilterSort';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaginationContext } from './Pagination';

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export const TodoAPIContext = createContext({});

export default function APITodosProvider({children, pageSize=16}) {
    const [active, setActive] = useState(null);
    // const [visibleList, setVisibleList] = useState([]); // [{}]
    const [formHeader, setFormHeader] = useState('Add Item'); 
    const [formAction, setFormAction] = useState('add');

    const {list, loading, error, dispatch} = useTodoBackendAPI({pageSize})

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
    let res = (map || [])
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

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function useTodoBackendAPI({endpoint = process.env.REACT_APP_TODO_ENDPOINT, pageSize=16}) {
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const {getParams: FSParams} = useContext(FilterSortContext);
    // const [page, setPage] = useState(1); // [1
    // const [count, setCount] = useState(0); // [0]
    const {page, count, setCount} = useContext(PaginationContext);
    const [list, setList] = useState([]); // [{}]
    const [trigger, setTrigger] = useState(false);

    const getTodoData = useCallback(async ({page, params, signal}) => {
        const {data} = await axios.get(`${endpoint}/`, {
            headers: { 'Content-Type': 'application/json' },
            params: {...params, limit: pageSize, offset: (page - 1) * pageSize},
            signal
        });
        setCount(data.count);
        const res = {};
        data.results.forEach((itm) => res[itm.id] = itm);
        return res;
    }, [endpoint, pageSize]);

    const getTodoMap = useCallback(async ({signal}) => {
        if (!user) return [];
        const {data} = await axios.get(`${endpoint}/map/`, {
            headers: { 'Content-Type': 'application/json' },
            signal
        });
        return data;
    }, [endpoint, user]);


    // Queries
    const serverData = useQuery({
        queryKey: ['todos', user, page, FSParams], 
        queryFn: ({ signal }) => getTodoData({page, params: FSParams, signal}), 
        keepPreviousData: true,
        enabled: user !== undefined,
        staleTime: 1000 * 60 * 5,
    });
    const serverMap = useQuery({
        queryKey: ['todosMap', user], 
        queryFn: ({ signal }) => getTodoMap({signal}),
    });

    useEffect(() => {
        if (!serverData.isPreviousData && page < Math.ceil(count / pageSize)) {
            queryClient.prefetchQuery({
                queryKey: ['todos', page + 1, FSParams],
                queryFn: ({ signal }) => getTodoData({page: page + 1, params: FSParams, signal}),
                staleTime: 1000 * 60 * 5,
            });
        }
      }, [serverData.data, serverData.isPreviousData, page, queryClient, FSParams, count])

    // Mutations
    const serverAdd = useMutation((data) => axios.post(`${endpoint}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todos']);
            const oldData = queryClient.getQueryData(['todos']);
            queryClient.setQueryData(['todos'], (old) => ({...old, [data.id]: data}));
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todos'], context.oldData);
        },
        onSuccess: ({data}) => {
            queryClient.setQueryData(['todos'], (old) => ({...old, [data.id]: data}))
            queryClient.invalidateQueries(['todos']);
        },
        });

    const serverUpdate = useMutation((data) => axios.patch(`${endpoint}/${data.id}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todos']);
            const oldData = queryClient.getQueryData(['todos']);
            queryClient.setQueryData(['todos'], (old) => ({...old, [data.id]: data}));
            return {oldData};
        },
        onError: (err, data, context) =>  queryClient.setQueryData(['todos'], context.oldData),
        onSuccess: (data) => queryClient.invalidateQueries(['todos']),
        });
    const serverDelete = useMutation((data) => axios.delete(`${endpoint}/${data.id}/`, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todos']);
            const oldData = queryClient.getQueryData(['todos']);
            queryClient.setQueryData(['todos'], (old) => {
                const {[data.id]: _, ...rest} = old;
                return rest;
            }
            );
            return {oldData};
        },
        onError: (err, data, context) => queryClient.setQueryData(['todos'], context.oldData),
        onSuccess: (data) => queryClient.invalidateQueries(['todos']),
        });
    const serverUpdateMap = useMutation((data) => axios.post(`${endpoint}/map/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todosMap']);
            const oldMap = queryClient.getQueryData(['todosMap']);
            queryClient.setQueryData(['todosMap'], () => data);
            return {oldMap};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todosMap'], context.oldMap);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['todosMap']);
        },
        });


    // Lifecycle
    // Usefull for avoiding spamming the backend when state
    // are adjusting on initialization
    useEffect(() => {
        if (user != null) {
            timeout(150).then(() => setTrigger(true));
        }
    }, [user, endpoint, FSParams]);

    useEffect(() => {
        if (trigger) {
            serverData.refetch();
            serverMap.refetch();
            setTrigger(false);
            }
    }, [trigger]);

    useEffect(() => {
        setList(applyMap(serverData.data || {}, serverMap?.data));
    }, [serverData.data, serverMap.data]);

    const dispatch = useCallback((action) => {
        const { type, data } = action;
        switch (type) {
            case 'delete':
                return serverDelete.mutateAsync(data)
                    .then(() => serverUpdateMap.mutateAsync(serverMap.data.filter((id) => id !== data.id)));
            case 'update':
                return serverUpdate.mutateAsync(data);
            case 'add':
                return serverAdd.mutateAsync(data)
                    .then(({data}) => serverUpdateMap.mutateAsync([data.id, ...serverMap.data]));
            case 'moveInsert':
                const newMap = [...serverMap.data];
                const itm1 = action.data.itm1;
                const itm2 = action.data.itm2;
                const idx1 = newMap.indexOf(itm1.id);
                const idx2 = newMap.indexOf(itm2.id);

                newMap.splice(idx1, 1);
                newMap.splice(idx2, 0, itm1.id);
                return serverUpdateMap.mutateAsync(newMap);
            default:
                throw new Error('Invalid action type');
        }
    }, [serverAdd, serverDelete, serverUpdate, serverUpdateMap]);

    return { 
        'list': list, 'loading': serverData.isLoading, 'error': serverData.error,
        dispatch
    };
}
