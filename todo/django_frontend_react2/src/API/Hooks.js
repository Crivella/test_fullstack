import axios from 'axios';
import { useCallback, useContext } from 'react';
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
            map: [newData.id, ...(item.data.map || [])],
        });
        return newData;
    }, [item.data, updateItem, addMutation, id]);

    const swapItems = useCallback(async (itm1, itm2) => {
        const newMap = [...item.data.map];
        const idx1 = newMap.indexOf(itm1.id);
        const idx2 = newMap.indexOf(itm2.id);

        newMap.splice(idx1, 1);
        newMap.splice(idx2, 0, itm1.id);
        await updateItem({
            ordered_childrens: newMap.map((id) => item.data.ordered_childrens.find((item) => item.id === id)),
            map: newMap,
        });
    }, [item.data, updateItem]);

    return {
        'title': item.data?.title || '',
        'description': item.data?.description || '',
        'completed': item.data?.completed || false,
        'parent': item.data?.parent || null,
        'count_childrens': item.data?.count_childrens || 0,
        'count_completed': item.data?.count_completed || 0,
        'list': item.data?.ordered_childrens || [],
        'loading': item.isLoading,
        'error': item.error,
        'addItem': addItem,
        'updateItem': updateItem,
        'deleteItem': deleteItem,
        'swapItems': swapItems,
    }
}

