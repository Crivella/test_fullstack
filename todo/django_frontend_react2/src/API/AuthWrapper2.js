import axios from 'axios';
import { createContext, useCallback, useEffect, useReducer, useState } from 'react';

const endpoint = process.env.REACT_APP_AUTH_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export const AuthContext = createContext({});

function authReducer(state, action) {
    switch (action.type) {
        case 'get-user': return action.data.username;
        case 'login': return state;
        case 'logout': return state;
        case 'password-change': return state;
        default:
            return state;
    }
}

function statusReducer(state, action) {
    let data = authReducer(state.data, action);
    let loading = (action.type === 'loading');
    let error = (action.type === 'error' ? action.error : null);

    return {data, loading, error};
}

export default function APIAuthProvider({children}) {
    const [user, dispatch] = useReducer(statusReducer, {
        loading: false,
        error: null,
        data: ""
        });

    const [trigger, setTrigger] = useState(false);

    useEffect(() => {
        getCSRFToken() //Needed to get CSRF token first time app is run
    }, []);

    useEffect(() => {
        axios.post(`${endpoint}/get-user/`, {
            headers: { 'Content-Type': 'application/json' }})
            .then(({data}) => dispatch({type: 'get-user', data}))
    }, [trigger]);

    // GET request to a valide rendered page by Django to get CSRF token
    // https://stackoverflow.com/a/75014511/7604434
    const getCSRFToken = () => {
        return axios.get(`${endpoint}/login/`, {})
            // .then((res) => console.log(res))
            .catch((err) => console.log(err));
    };

    const asyncDispatch = useCallback((action) => {
        const fn = (type, data) => {
            switch (type) {
                case 'login': return axios.post(`${endpoint}/login/`, data, {});
                case 'delete': return axios.delete(`${endpoint}/${data.id}/`, {}) ;
                default:
                    throw new Error('Invalid action type');
                }
            }

        dispatch({type: 'loading'})
        fn(action.type, action.data)
            .then(({data}) => {
                dispatch({'type': action.type, 'data': data || action.data});
            })
            .catch((err) => dispatch({type: 'error', error: err}));
        return true;
    }, []);


    const passwordChange = async (data) => {
        const res = await axios.post(`${endpoint}/password_change/`, data, {})
            .catch((err) => console.log(err));

        return res.data.includes('Password change successful');
    };

    const login = async (data) => {
        await axios.post(`${endpoint}/login/`, data, {})
            .catch((err) => console.log(err));
        return updateUser();
    };

    const logout = async () => {
        await axios.post(`${endpoint}/logout/`, {}, {})
            .catch((err) => console.log(err));
        return updateUser();
    };

    const newProps = {
        'user': user.data,
        'loading': user.loading,
        'error': user.error,
        dispatch,
        'login': login,
        'logout': logout,
        'passwordChange': passwordChange,
    }

    return (
        <AuthContext.Provider value={newProps}>
            {children}
        </AuthContext.Provider>
    )
}
