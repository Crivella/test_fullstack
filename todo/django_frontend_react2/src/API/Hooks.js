import axios from 'axios';
import { useContext, useEffect } from 'react';
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

export function useTodoItemAPI(id) {
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);

    const data = useQuery({
        queryKey: ['todos', id], 
        queryFn: ({ signal }) => getTodoData({id, signal}),
        enabled: user !== undefined && id !== undefined,
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
            queryClient.setQueryData(['todos', id], () => null);
            return {oldData};
        },
        onError: (err, data, context) => queryClient.setQueryData(['todos', id], context.oldData),
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

export function useTodoAPI({ id }) {
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const {page, pageSize, count, setCount} = useContext(PaginationContext);

    const getTodoMap = async ({signal}) => {
        const {data} = await axios.get(`${mapEndpoint}/${id}`, {
            headers: { 'Content-Type': 'application/json' },
            signal 
        });
        setCount(data.seq.length);
        return data.seq;
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
        const map = serverMap.data;
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
    const serverAdd = useMutation((data) => axios.post(`${todoEndpoint}/`, data, {}), {
        onSuccess: ({data}) => {
            queryClient.setQueryData(['todos', data.id], () => data)
            queryClient.invalidateQueries(['todos', data.id]);
        },
        });

    const serverUpdate = useMutation((data) => axios.patch(`${todoEndpoint}/${data.id}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todos', data.id]);
            const oldData = queryClient.getQueryData(['todos', data.id]);
            queryClient.setQueryData(['todos', data.id], () => data);
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todos', data.id], context.oldData)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['todos', data.id]);
        }
        });
    const serverDelete = useMutation((data) => axios.delete(`${todoEndpoint}/${data.id}/`, {}), {
        onSuccess: (data) => {
            queryClient.invalidateQueries(['todos', data.id])
        },
        });

    const serverAddMap = useMutation((data) => axios.post(`${mapEndpoint}/`, data, {}), {
        onSuccess: ({data}) => {
            queryClient.setQueryData(['todosMap', id], (old) => data);
            queryClient.invalidateQueries(['todosMap', id]);
        },
        });


    const serverUpdateMap = useMutation((data) => axios.patch(`${mapEndpoint}/${id}/`, data, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todosMap', id]);
            const oldMap = queryClient.getQueryData(['todosMap', id]);
            queryClient.setQueryData(['todosMap', id], () => data.seq);
            return {oldMap};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todosMap', id], context.oldMap);
        },
        onSuccess: ({data}) => {
            // queryClient.setQueryData(['todosMap', id], (old) => data);
            queryClient.invalidateQueries(['todosMap', id]);
        },
        });

    const dispatch = (action) => {
        const { type, data } = action;
        switch (type) {
            case 'delete':
                return serverDelete.mutateAsync(data)
                    .then(() => serverUpdateMap.mutateAsync(
                        {seq: serverMap.data.filter((id) => id !== data.id)}
                        ));
            case 'update':
                return serverUpdate.mutateAsync(data);
            case 'add':
                return serverAdd.mutateAsync(data)
                    .then(({data}) => serverUpdateMap.mutateAsync({seq: [data.id, ...serverMap.data]}));
            case 'moveInsert': {
                const newMap = [...serverMap.data];
                const itm1 = action.data.itm1;
                const itm2 = action.data.itm2;
                const idx1 = newMap.indexOf(itm1.id);
                const idx2 = newMap.indexOf(itm2.id);


                newMap.splice(idx1, 1);
                newMap.splice(idx2, 0, itm1.id);
                return serverUpdateMap.mutate([...newMap]);
            }
            default:
                throw new Error('Invalid action type');
        }
    }
    // , [serverMap.data, serverAdd, serverDelete, serverUpdate, serverUpdateMap, ]);

    return { 
        'list': serverMap.data?.slice(0, page * pageSize),
        'loading': serverMap.isLoading,
        'error': serverMap.error,
        dispatch
    };
}
