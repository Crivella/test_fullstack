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
    const strId = id === undefined ? '' : id + '/';
    const {data} = await axios.get(`${todoEndpoint}/${strId}`, {
        headers: { 'Content-Type': 'application/json' },
        signal
    });
    return data;
}

export function useTodoAPI() {
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);

    const maps = useQuery({
        queryKey: ['todosMap', user],
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
            queryClient.setQueryData(['todos', user, data.id], () => data)
            queryClient.invalidateQueries(['todos', user, data.id]);
        },
        });

    const addMapMutation = useMutation((data) => axios.post(`${mapEndpoint}/`, data, {}), {
        onSuccess: ({data}) => {
            queryClient.setQueryData(['todosMap', user, data.id], (old) => data);
            queryClient.setQueryData(['todosMap',  user], (old) => [...old, data]);
            queryClient.invalidateQueries(['todosMap', user,]);
            queryClient.invalidateQueries(['todosMap', user, data.id]);
        },
        });

    const updateMutation = useMutation((data) => axios.patch(`${todoEndpoint}/${data.id}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todos', user, data.id]);
            const oldData = queryClient.getQueryData(['todos', data.id]);
            queryClient.setQueryData(['todos', user, data.id], (old) => ({...old, ...data}));
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todos', user, data.id], context.oldData)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['todos', user, data.id]);
        },
        });

    const updateMapMutation = useMutation((data) => axios.patch(`${mapEndpoint}/${data.id}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todosMap', user, data.id]);
            const oldData = queryClient.getQueryData(['todosMap', user, data.id]);
            queryClient.setQueryData(['todosMap', user, data.id], (old) => ({...old, ...data}));
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todosMap', user, data.id], context.oldData)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['todosMap', user, data.id]);
        },
        });

    const deleteMapMutation = useMutation((data) => axios.delete(`${mapEndpoint}/${data.id}/`, {}), {
        onSuccess: (data) => {
            queryClient.setQueryData(['todosMap', user, data.id], () => undefined);
            queryClient.setQueryData(['todosMap', user], (old) => old.filter((item) => item.id !== data.id));
            queryClient.invalidateQueries(['todosMap', user, data.id]);
        },
        });


    return { 
        'maps': maps,
        'updateMap': updateMapMutation.mutate,
        'addItem': addItemMutation.mutateAsync,
        'addMap': addMapMutation.mutateAsync,
        'deleteMap': deleteMapMutation.mutateAsync,
    };
}

export function useAPITodoItem(id) {
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);

    const item = useQuery({
        queryKey: ['todos', user, id],
        queryFn: ({ signal }) => getTodoData({id, signal}),
        enabled: user !== undefined,
        // placeholderData: {id: id},
        staleTime: 1000 * 60 * 5,
    });

    const updateMutation = useMutation((data) => axios.patch(`${todoEndpoint}/${data.id}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todos', user, data.id]);
            const oldData = queryClient.getQueryData(['todos', user, data.id]);
            queryClient.setQueryData(['todos', user, data.id], (old) => ({...old, ...data}));
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todos', user, data.id], context.oldData)
        },
        onSettled: ({data}, variables, context) => {
            queryClient.invalidateQueries(['todos', user, data.id]);
            queryClient.invalidateQueries(['todos', user, id]);
        },
        });

    const deleteMutation = useMutation((data) => axios.delete(`${todoEndpoint}/${data?.id || id}/`, {}), {
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries(['todos', user, variables?.id || id]);
        },
        });

    const addMutation = useMutation((data) => axios.post(`${todoEndpoint}/`, data, {}), {
        onSuccess: ({data}) => {
            queryClient.setQueryData(['todos', user, data.id], () => data);
            queryClient.invalidateQueries(['todos', user, data.id]);
        },
        });

    const deleteItem = useCallback(async (data) => {
        await deleteMutation.mutateAsync(data);
        await updateMutation.mutateAsync({
            id,
            ordered_childrens: item.data.ordered_childrens.filter((item) => item.id !== data.id),
            map: item.data.map.filter((item) => item !== data.id),
        });
    }, [id, item.data, updateMutation, deleteMutation]);

    const updateItem = useCallback(async (data) => {
        const res = await updateMutation.mutateAsync({id, ...data});
        return res.data;
    }, [id, updateMutation]);

    const addItem = useCallback(async (data) => {
        const res = await addMutation.mutateAsync({...data, parent: id});
        const newData = res.data;

        updateItem({
            ordered_childrens: [newData, ...item.data.ordered_childrens,],
            map: [newData.id, ...item.data.map,],
        });
        return newData;
    }, [item.data, updateItem, addMutation, id]);

    return {
        'title': item.data?.title || '',
        'description': item.data?.description || '',
        'completed': item.data?.completed || false,
        'parent': item.data?.parent || null,
        'count': item.data?.count_childrens || 0,
        'countCompleted': item.data?.count_completed || 0,
        'list': item.data?.ordered_childrens || [],
        'loading': item.isLoading,
        'error': item.error,
        'addItem': addItem,
        'updateItem': updateItem,
        'deleteItem': deleteItem,
    }
}


export function useTodoItemAPI(id) {
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);
    

    const {updateMap} = useTodoAPI();

    const item = useQuery({
        queryKey: ['todos', user, id], 
        queryFn: ({ signal }) => getTodoData({id, signal}),
        enabled: user !== undefined && id !== undefined,
        // placeholderData: {id: id},
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (user) {
            queryClient.invalidateQueries(['todos', user, id]);
        }
    }, [user, queryClient, id]);

    const updateMutation = useMutation((data) => axios.patch(`${todoEndpoint}/${id}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todos', user, id]);
            const oldData = queryClient.getQueryData(['todos', user, id]);
            queryClient.setQueryData(['todos', user, id], (old) => ({...old, ...data}));
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todos', user, id], context.oldData)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['todos', user, id]);
        },
        });

    const deleteMutation = useMutation((data) => axios.delete(`${todoEndpoint}/${id}/`, {}), {
        onSuccess: (data) => {
            const mapId = item.data.todo_list;
            const oldMap = queryClient.getQueryData(['todosMap', user, mapId]);
            updateMap({id: mapId, seq: oldMap.seq.filter((id) => id !== item.data.id)});
            queryClient.invalidateQueries(['todos', user, id]);
        },
        });

    return {
        'data': item.data,
        'loading': item.isLoading,
        'error': item.error,
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
        queryKey: ['todosMap', user, id], 
        queryFn: ({ signal }) => getTodoMap({signal}),
        enabled: user !== undefined,
    });


    // Prefetch
    useEffect(() => {
        const map = serverMap.data?.seq;

        if (map && page) {
            if (page < Math.ceil(count / pageSize) ) {
                map.slice(page * pageSize, (page + 1) * pageSize)
                    .forEach((id) => {
                        queryClient.prefetchQuery({
                            queryKey: ['todos', user, id],
                            queryFn: ({ signal }) => getTodoData({id, signal}),
                            staleTime: 1000 * 60 * 5,
                        })
                });
            }
        }
    }, [serverMap, page, pageSize, queryClient, count, user])

    // Mutations
    const serverUpdateMap = useMutation((data) => axios.patch(`${mapEndpoint}/${id}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todosMap', user, id]);
            const oldMap = queryClient.getQueryData(['todosMap', user, id]);
            queryClient.setQueryData(['todosMap', user, id], () => data);
            return {oldMap};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todosMap', user, id], context.oldMap);
        },
        onSuccess: ({data}) => {
            queryClient.invalidateQueries(['todosMap', user, id]);
        },
        });

    const addItem = useCallback((data) => {
        return serverAddItem({...data, todo_list: id})
            .then(({data}) => serverUpdateMap.mutateAsync({seq: [data.id, ...serverMap.data.seq]}));
    }, [serverMap, serverUpdateMap, serverAddItem, id]);

    const onSwap = useCallback((itm1, itm2) => {
        const newMap = [...serverMap.data.seq];
        const idx1 = newMap.indexOf(itm1.id);
        const idx2 = newMap.indexOf(itm2.id);

        newMap.splice(idx1, 1);
        newMap.splice(idx2, 0, itm1.id);
        return serverUpdateMap.mutateAsync({seq: newMap});
    }, [serverMap, serverUpdateMap]);

    const onCheck = useCallback((itm) => {
        const seq = serverMap.data.seq;
        const filtered = seq.filter((id) => id !== itm.id);
        const place = serverMap.data.first_completed - 1 || filtered.length
        if (!itm.completed) {
            filtered.splice(0, 0, itm.id);
        }
        else {
            filtered.splice(place, 0, itm.id)
         }
         return serverUpdateMap.mutateAsync({
             seq: filtered
         });
    }, [serverMap, serverUpdateMap]);
    
    return { 
        'list': (serverMap.data?.seq || []).slice(0, page*pageSize),
        'addItem': addItem,
        'onSwap': onSwap,
        'onCheck': onCheck,
        'loading': serverMap.isLoading,
        'error': serverMap.error,
    };
}
