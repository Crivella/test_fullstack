import axios from 'axios';
import { useCallback, useContext, useEffect } from 'react';
import { AuthContext } from './Auth';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaginationContext } from './Pagination';

const APIendpoint = process.env.REACT_APP_TODO_ENDPOINT;
const todoEndpoint = APIendpoint + '/todo';
const mapEndpoint = APIendpoint + '/map';
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

const getTodoData = async ({id, signal}) => {
    const {data} = await axios.get(`${todoEndpoint}/${id}/`, {
        headers: { 'Content-Type': 'application/json' },
        signal
    });
    return data;
}

export function useTodoAPI() {
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);

    const maps = useQuery({
        queryKey: ['todosMap'],
        queryFn: ({ signal }) => axios.get(`${mapEndpoint}/`, {
            headers: { 'Content-Type': 'application/json' },
            signal
        }).then(({data}) => data),
        enabled: user !== undefined,
        // placeholderData: {id: id},
        staleTime: 1000 * 60 * 5,
    });

    const addItemMutation = useMutation((data) => axios.post(`${todoEndpoint}/`, data, {}), {
        onSuccess: ({data}) => {
            queryClient.setQueryData(['todos', data.id], () => data)
            queryClient.invalidateQueries(['todos', data.id]);
        },
        });

    const addMapMutation = useMutation((data) => axios.post(`${mapEndpoint}/`, data, {}), {
        onSuccess: ({data}) => {
            queryClient.setQueryData(['todosMap', data.id], (old) => data);
            queryClient.setQueryData(['todosMap'], (old) => [...old, data]);
            queryClient.invalidateQueries(['todosMap']);
            queryClient.invalidateQueries(['todosMap', data.id]);
        },
        });

    const updateMutation = useMutation((data) => axios.patch(`${todoEndpoint}/${data.id}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todos', data.id]);
            const oldData = queryClient.getQueryData(['todos', data.id]);
            queryClient.setQueryData(['todos', data.id], (old) => ({...old, ...data}));
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todos', data.id], context.oldData)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['todos', data.id]);
        },
        });

    const updateMapMutation = useMutation((data) => axios.patch(`${mapEndpoint}/${data.id}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todosMap', data.id]);
            const oldData = queryClient.getQueryData(['todosMap', data.id]);
            queryClient.setQueryData(['todosMap', data.id], (old) => ({...old, ...data}));
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todosMap', data.id], context.oldData)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['todosMap', data.id]);
        },
        });

    useEffect(() => {
        queryClient.invalidateQueries(['todos']);
        queryClient.invalidateQueries(['todosMap']);
    }, [user, queryClient]);

    return { 
        'maps': maps,
        'updateMap': updateMapMutation.mutate,
        'addItem': addItemMutation.mutateAsync,
        'addMap': addMapMutation.mutateAsync,
    };
}


export function useTodoItemAPI(id) {
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);

    const data = useQuery({
        queryKey: ['todos', id], 
        queryFn: ({ signal }) => getTodoData({id, signal}),
        enabled: user !== undefined && id !== undefined,
        // placeholderData: {id: id},
        staleTime: 1000 * 60 * 5,
    });

    const updateMutation = useMutation((data) => axios.patch(`${todoEndpoint}/${id}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todos', id]);
            const oldData = queryClient.getQueryData(['todos', id]);
            queryClient.setQueryData(['todos', id], (old) => ({...old, ...data}));
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todos', id], context.oldData)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['todos', id]);
        },
        });

    const deleteMutation = useMutation((data) => axios.delete(`${todoEndpoint}/${id}/`, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todos', id]);
            const oldData = queryClient.getQueryData(['todos', id]);
            queryClient.setQueryData(['todos', id], () => {});
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todos', id], context.oldData)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['todos', id]);
        },
        });

    return {
        'data': data.data,
        'loading': data.isLoading,
        'error': data.error,
        'update': updateMutation.mutateAsync,
        'delete': deleteMutation.mutateAsync,
    };
}

export function useTodoMapAPI(id) {
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const {page, pageSize, count, setCount} = useContext(PaginationContext);
    const { addItem: serverAddItem } = useTodoAPI();

    const getTodoMap = async ({signal}) => {
        const {data} = await axios.get(`${mapEndpoint}/${id}`, {
            headers: { 'Content-Type': 'application/json' },
            signal 
        });
        setCount(data.seq.length);
        return data;
    };

    // Queries
    const serverMap = useQuery({
        queryKey: ['todosMap', id], 
        queryFn: ({ signal }) => getTodoMap({signal}),
        enabled: user !== undefined,
    });

    useEffect(() => {
        queryClient.invalidateQueries(['todosMap', id]);
        queryClient.invalidateQueries(['todos']);
    }, [user, queryClient]);

    // Prefetch
    useEffect(() => {
        const map = serverMap.data?.seq;
        if (map && page < Math.ceil(count / pageSize)) {
            map
            .slice(page * pageSize, (page + 1) * pageSize)
            .forEach((id) => {
                queryClient.prefetchQuery({
                    queryKey: ['todos', id],
                    queryFn: ({ signal }) => getTodoData({id, signal}),
                    staleTime: 1000 * 60 * 5,
                })
            });
        }
      }, [serverMap, page, pageSize, queryClient, count])

    // Mutations
    const serverUpdateMap = useMutation((data) => axios.patch(`${mapEndpoint}/${id}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todosMap', id]);
            const oldMap = queryClient.getQueryData(['todosMap', id]);
            queryClient.setQueryData(['todosMap', id], () => data);
            return {oldMap};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todosMap', id], context.oldMap);
        },
        onSuccess: ({data}) => {
            queryClient.invalidateQueries(['todosMap', id]);
        },
        });

    const deleteItem = useCallback((data) => {
        const newSeq = serverMap.data.seq.filter((id) => id !== data.id);
        return serverUpdateMap.mutateAsync({seq: newSeq});
    }, [serverMap, serverUpdateMap]);

    const addItem = useCallback((data) => {
        console.log(data);
        return serverAddItem(data)
            .then(({data}) => serverUpdateMap.mutateAsync({seq: [data.id, ...serverMap.data.seq]}));
    }, [serverMap, serverUpdateMap, serverAddItem]);

    const onSwap = useCallback((itm1, itm2) => {
        const newMap = [...serverMap.data.seq];
        const idx1 = newMap.indexOf(itm1.id);
        const idx2 = newMap.indexOf(itm2.id);

        newMap.splice(idx1, 1);
        newMap.splice(idx2, 0, itm1.id);
        return serverUpdateMap.mutateAsync({seq: newMap});
    }, [serverMap, serverUpdateMap]);

    return { 
        'list': (serverMap.data?.seq || []).slice(0, page*pageSize),
        'addItem': addItem,
        'deleteItem': deleteItem,
        'onSwap': onSwap,
        'loading': serverMap.isLoading,
        'error': serverMap.error,
    };
}
