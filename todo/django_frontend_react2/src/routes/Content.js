import { useParams } from 'react-router-dom';

import { Container } from 'react-bootstrap';
import SidePanel from '../components/SidePanel';
import TodoList from '../components/TodoList';
import './Content.css';

export default function Content() {
    const { user, id } = useParams();

    return (
        <Container
            // fluid
            className="d-flex m-0 p-0 content-container"
            >
            <TodoList id={id} user={user} />
            <SidePanel user={user} />
        </Container>
    );
}
