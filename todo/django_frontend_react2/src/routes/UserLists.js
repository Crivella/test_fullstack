import { useParams } from 'react-router-dom';

import TodoList from '../components/TodoList';

export default function UserLists() {
    const { user, id } = useParams();

    return (
        <TodoList id={id} user={user} />
    );
}
