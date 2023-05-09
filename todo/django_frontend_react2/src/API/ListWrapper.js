import axios from 'axios';
import { useEffect, useState } from 'react';
import PassPropsWrapper from '../commons/Wrapper';

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true


export default function APIListWrapper(props) {
    const [active, setActive] = useState(null);
    const [list, setList] = useState([]); // [{}
    const [formHeader, setFormHeader] = useState('Add Item'); 
    const [formAction, setFormAction] = useState('add');

    useEffect(() => {getList()}, [props.user]);

    const {children, ...rest} = props;

    const getList = () => {
        return axios.get(`${endpoint}/`, {
            headers: { 'Content-Type': 'application/json' }
        })
        .then(({data}) => {setList(data); return data})
        .catch((err) => console.log(err));
    };

    const getItem = (id) => {
        return axios.get(`${endpoint}/${id}/`, {
            headers: { 'Content-Type': 'application/json' }
        }).then(({data}) => {return data});
    };

    const updateItem = (id, data) => {
        return axios.patch(`${endpoint}/${id}/`, data, {})
            .then(({data}) => {setList(list.map((e) => e.id === id ? data : e)); return data})
            .catch((err) => console.log(err));
    };

    const deleteItem = (id) => {
        axios.delete(`${endpoint}/${id}/`, {}) 
            .then(() => {setList(list.filter((e) => e.id !== id)); setActive(null); return true})
            .catch((err) => console.log(err));
    };

    const addItem = (data) => {
        return axios.post(`${endpoint}/`, data, {})
            .then(({data}) => {setList([...list, data]); return data})
            .catch((err) => console.log(err));
    };

    const onSubmit = (data) => {
        switch (formAction) {
            case 'add':
                return addItem(data);
            case 'edit':
                return updateItem(data.id, data);
    
            default:
                throw new Error('Invalid form action');
        }
    };

    const newProps = {
        ...rest,
        'list': list, // [{}, {}, {}]
        'active': active,
        'setActive': setActive,
        // 'getList': getList,
        'getItem': getItem,
        'updateItem': updateItem,
        'deleteItem': deleteItem,
        'addItem': addItem,
        'formHeader': formHeader,
        'setFormHeader': setFormHeader,
        'formAction': formAction, // 'add' or 'edit
        'setFormAction': setFormAction,
        'onSubmit': onSubmit,
    }

    return (
        <PassPropsWrapper newProps={newProps}>
            {children}
        </PassPropsWrapper>
    )
}