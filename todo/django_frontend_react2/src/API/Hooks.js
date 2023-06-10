import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from './Auth';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const APIendpoint = process.env.REACT_APP_TODO_ENDPOINT;
const todoEndpoint = APIendpoint + '/todo';
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

export function useAPITodoItem(id) {
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);

    const [list, setList] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [completed, setCompleted] = useState(false);
    const [parent, setParent] = useState(null);
    const [countChildrens, setCountChildrens] = useState(0);
    const [countCompleted, setCountCompleted] = useState(0);
    const [firstCompleted, setFirstCompleted] = useState(null);


    const item = useQuery({
        queryKey: ['todos', user, id],
        queryFn: ({ signal }) => getTodoData({id, signal}),
        enabled: user !== undefined,
        // placeholderData: {id: id},
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (item.data) {
            setTitle(item.data.title || '');
            setDescription(item.data.description || '');
            setCompleted(item.data.completed || false);
            setParent(item.data.parent || null);
            setCountChildrens(item.data.count_childrens || 0);
            setCountCompleted(item.data.count_completed || 0);
            setFirstCompleted(item.data.first_completed || 0);
            setList(item.data.ordered_childrens || []);
        }
    }, [item.data]);

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
        onMutate: (data) => {
            queryClient.cancelQueries(['todos', user, data?.id || id]);
            const oldData = queryClient.getQueryData(['todos', user, id]);
            if (data?.id) {
                queryClient.setQueryData(['todos', user, id], (old) => ({
                    ...old,
                    ordered_childrens: item.data.ordered_childrens.filter((item) => item.id !== data.id),
                    map: item.data.map ? item.data.map.filter((item) => item !== data.id) : null,
                }));
            }
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todos', user, id], context.oldData)
        },
        onSuccess: (data, variables, context) => {
            if (variables?.id) {
                queryClient.invalidateQueries(['todos', user, variables.id]);
            }
            queryClient.invalidateQueries(['todos', user, id]);
        },
        });

    const addMutation = useMutation((data) => axios.post(`${todoEndpoint}/`, data, {}), {
        onSuccess: ({data}) => {
            queryClient.setQueryData(['todos', user, data.id], () => data);
            queryClient.invalidateQueries(['todos', user, data.id]);
            queryClient.invalidateQueries(['todos', user, id]);
        },
        });

    const deleteItem = useCallback(async (data) => {
        console.log('DELETE:', data);
        await deleteMutation.mutateAsync(data);
    }, [deleteMutation]);

    const updateItem = useCallback(async (data) => {
        const res = await updateMutation.mutateAsync({id, ...data});
        return res.data;
    }, [id, updateMutation]);

    const addItem = useCallback(async (data) => {
        const res = await addMutation.mutateAsync({...data, parent: id});
        const newData = res.data;
        return newData;
    }, [addMutation, id]);

    const swapItems = useCallback(async (id1, id2) => {
        if (!item.data.map) return;
        const newMap = [...item.data.map];
        const idx1 = newMap.indexOf(id1);
        const idx2 = newMap.indexOf(id2);

        newMap.splice(idx1, 1);
        newMap.splice(idx2, 0, id1);
        await updateItem({
            ordered_childrens: newMap.map((id) => item.data.ordered_childrens.find((item) => item.id === id)),
            map: newMap,
        });
    }, [item.data, updateItem]);

    return {
        'title': title,
        'description': description,
        'completed': completed,
        'parent': parent,
        'count_childrens': countChildrens,
        'count_completed': countCompleted,
        'first_completed': firstCompleted,
        'list': list,
        'loading': item.isLoading,
        'error': item.error,
        'addItem': addItem,
        'updateItem': updateItem,
        'deleteItem': deleteItem,
        'swapItems': swapItems,
    }
}

