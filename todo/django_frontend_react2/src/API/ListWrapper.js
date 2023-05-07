import axios from 'axios';
import { useEffect, useState } from 'react';
import PassPropsWrapper from '../components/Wrapper';

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true


export default function APIListWrapper(props) {
    const [list, setList] = useState([]); // [{}

    useEffect(() => {getList()}, [props.user]);

    const {children, ...extras} = props;

    const getList = () => {
        return axios.get(`${endpoint}/`, {
            headers: { 'Content-Type': 'application/json' }
        })
        .then(({data}) => setList(data))
        .catch((err) => console.log(err));
    };

    const getItem = (id) => {
        return axios.get(`${endpoint}/${id}/`, {
            headers: { 'Content-Type': 'application/json' }
        }).then(({data}) => data);
    };

    const updateItem = (id, data) => {
        return axios.patch(`${endpoint}/${id}/`, data, {})
            .then(({data}) => setList(list.map((e) => e.id === id ? data : e)))
            .catch((err) => console.log(err));
    };

    const deleteItem = (id) => {
        axios.delete(`${endpoint}/${id}/`, {}) 
            .then(() => setList(list.filter((e) => e.id !== id)))
            .catch((err) => console.log(err));
    };

    const addItem = (data) => {
        return axios.post(`${endpoint}/`, data, {})
            .then(({data}) => setList([...list, data]))
            .catch((err) => console.log(err));
    };

    const newProps = {
        ...extras,
        'list': list, // [{}, {}, {}]
        // 'getList': getList,
        'getItem': getItem,
        'updateItem': updateItem,
        'deleteItem': deleteItem,
        'addItem': addItem,
    }

    return (
        <PassPropsWrapper newProps={newProps}>
            {children}
        </PassPropsWrapper>
    )
}