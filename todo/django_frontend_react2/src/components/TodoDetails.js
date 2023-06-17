import { Button, Container, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAPITodoItem } from "../API/Hooks";
import { useTheme } from "../context/Hooks";
import { CompletedButton, FavoriteButton, PrivateButton } from './FlippableButton';

export default function TodoDetails({ id, user }) {
    // const { active: id, setActive } = useContext(ActiveContext);
    const item = useAPITodoItem(id, user);
    const { owner, title, description, updateItem } = item
    
    const { theme, themeContrast1 } = useTheme();

    if (id === null) return ( <></> )
    
    return (
        <Container className={`
            text-${themeContrast1}
            d-flex flex-column
            `}>
            <Container className="p-0 mt-2 d-flex justify-content-xl-between">
                <Container className="p-0 m-0 d-flex">
                    <Button as={Link} to={`/${owner}/${id}`} variant="outline-primary">
                        <Image src='/todos/details.png' width={20} height={20}/>
                    </Button>
                </Container>
                <Container className="p-0 m-0 d-flex justify-content-end">
                    <CompletedButton item={item} handleUpdate={updateItem} />
                    <PrivateButton item={item} handleUpdate={updateItem} />
                    <FavoriteButton item={item} handleUpdate={updateItem} />
                </Container>
            </Container>
            <p>{id}</p>
            <p>{owner}</p>
            <p>{title}</p>
            <p>{description}</p>
        </Container>
    )
}