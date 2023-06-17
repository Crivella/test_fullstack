import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const APIendpoint = process.env.REACT_APP_API_ENDPOINT;
const todoEndpoint = APIendpoint + '/todo';
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

const getTodoData = async ({id, user, signal}) => {
    const strId = id === undefined ? '' : id + '/';
    const {data} = await axios.get(`${todoEndpoint}/${strId}`, {
        headers: { 'Content-Type': 'application/json' },
        params: { user: user },
        signal
    });
    return data;
}

const share = async ({id, user}) => {
    console.log('SHARE:', id, user);
    axios.post(`${APIendpoint}/share/`, {
         todo: id, 
         user: user
    });
}

export function useAPITodoItem(id, user) {
    const queryClient = useQueryClient();
    // const { user } = useContext(AuthContext);

    const [list, setList] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [owner, setOwner] = useState(null); 
    const [favorite, setFavorite] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [parent, setParent] = useState(null);
    const [countChildrens, setCountChildrens] = useState(0);
    const [countCompleted, setCountCompleted] = useState(0);
    const [firstCompleted, setFirstCompleted] = useState(null);


    const item = useQuery({
        queryKey: ['todos', user, String(id)],
        queryFn: ({ signal }) => getTodoData({id, user, signal}),
        enabled: user !== undefined,
        // placeholderData: {id: id},
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (item.data) {
            setTitle(item.data.title || '');
            setDescription(item.data.description || '');
            setOwner(item.data.owner || null);
            setFavorite(item.data.favorite || false);
            setIsPrivate(item.data.private || false);
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
            queryClient.cancelQueries(['todos', user, String(data.id)]);
            const oldData = queryClient.getQueryData(['todos', user, data.id]);
            queryClient.setQueryData(['todos', user, String(data.id)], (old) => ({...old, ...data}));
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todos', user, data.id], context.oldData)
        },
        onSettled: ({data}, variables, context) => {
            queryClient.invalidateQueries(['todos', user, String(data.id)]);
            queryClient.invalidateQueries(['todos', user, String(id)]);
            if (parent) {
                queryClient.invalidateQueries(['todos', user, String(parent)]);
                queryClient.setQueryData(['todos', user, String(parent)], (old) => ({
                    ...old, 
                    ordered_childrens: old.ordered_childrens.map((item) => item.id === data.id ? data : item),
                }));
            }
        },
        });

    const deleteMutation = useMutation((data) => axios.delete(`${todoEndpoint}/${data?.id || id}/`, {}), {
        onMutate: (data) => {
            queryClient.cancelQueries(['todos', user, String(data?.id || id)]);
            const oldData = queryClient.getQueryData(['todos', user, String(id)]);
            if (data?.id) {
                queryClient.setQueryData(['todos', user, String(id)], (old) => ({
                    ...old,
                    ordered_childrens: item.data.ordered_childrens.filter((item) => item.id !== data.id),
                    map: item.data.map ? item.data.map.filter((item) => item !== data.id) : null,
                }));
            }
            return {oldData};
        },
        onError: (err, data, context) => {
            queryClient.setQueryData(['todos', user, String(id)], context.oldData)
        },
        onSuccess: (data, variables, context) => {
            if (variables?.id) {
                queryClient.invalidateQueries(['todos', user, String(variables.id)]);
            }
            queryClient.invalidateQueries(['todos', user, String(id)]);
        },
        });

    const addMutation = useMutation((data) => axios.post(`${todoEndpoint}/`, data, {}), {
        onSuccess: ({data}) => {
            queryClient.setQueryData(['todos', user, String(data.id)], () => data);
            queryClient.invalidateQueries(['todos', user, String(data.id)]);
            queryClient.invalidateQueries(['todos', user, String(id)]);
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

    const shareItem = useCallback(async (user) => {
        await share({id, user});
    }, [id]);

    return {
        'id': id,
        'title': title,
        'description': description,
        'owner': owner,
        'completed': completed,
        'parent': parent,
        'favorite': favorite,
        'isPrivate': isPrivate,
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
        'shareItem': shareItem,
    }
}

