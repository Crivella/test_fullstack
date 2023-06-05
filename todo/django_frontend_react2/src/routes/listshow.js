import { useParams } from 'react-router-dom';

import TodoList from '../components/TodoList';

export function ListShow({props}) {
    const { id } = useParams();
    
    return (
        <TodoList id={Number(id)} />
    );
}
