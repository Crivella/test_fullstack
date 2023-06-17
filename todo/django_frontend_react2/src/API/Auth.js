import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { createContext, useCallback } from 'react';

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export const AuthContext = createContext({});

export default function APIAuthProvider({children, endpoint=process.env.REACT_APP_AUTH_ENDPOINT}) {
    const queryClient = useQueryClient();
    const {user} = useAuth({endpoint});

    const login = async (formData) => {
        const {data} = await axios.post(`${endpoint}/login/`, formData, {})
        return data.username;
    };

    const logout = async () => {
        await axios.post(`${endpoint}/logout/`, {}, {})
        return true;
    };

    const passwordChange = async (data) => {
        const res = await axios.post(`${endpoint}/password_change/`, data, {})
        
        return res.data.includes('Password change successful');
    };

    const loginMutation = useMutation((data) =>login(data), {
        onSuccess: (data) => {
            queryClient.setQueryData(['user'], data);
            queryClient.invalidateQueries(['user']);
        },
    });

    const logoutMutation = useMutation((data) =>logout(data), {
        onSuccess: (data) => {
            queryClient.setQueryData(['user'], '');
            queryClient.invalidateQueries(['user']);
            queryClient.invalidateQueries([user.data]);
        },
    });

    const newProps = {
        'user': user.data,
        'login': loginMutation.mutateAsync,
        'logout': logoutMutation.mutateAsync,
        'passwordChange': passwordChange,
    }

    return (
        <AuthContext.Provider value={newProps}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth({endpoint = process.env.REACT_APP_AUTH_ENDPOINT}) {
    const updateUser = useCallback(async ({ signal }) => {
        const {data} = await axios.get(`${endpoint}/get-user/`, {
            headers: { 'Content-Type': 'application/json' },
            signal
            });
        return data.username;
    }, [endpoint]);

    const user = useQuery({
        queryKey: ['user'],
        queryFn: ({ signal }) => updateUser({ signal }),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return { user };
}