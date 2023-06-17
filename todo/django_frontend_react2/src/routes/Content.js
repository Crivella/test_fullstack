import { useParams } from 'react-router-dom';

import SidePanel from '../components/SidePanel';
import TodoList from '../components/TodoList';

export default function Content() {
    const { user, id } = useParams();

    return (
        <>
        <TodoList id={id} user={user} />
        <SidePanel user={user} />
        </>
    );
}
