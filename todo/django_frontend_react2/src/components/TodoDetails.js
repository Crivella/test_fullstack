import { Button, Container, FormControl, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAPITodoItem } from "../API/Hooks";
import { useTheme } from "../context/Hooks";
import { CompletedButton, FavoriteButton, PrivateButton } from './FlippableButton';
import ShareButton from "./ShareButton";

export default function TodoDetails({ id, user }) {
    // const { active: id, setActive } = useContext(ActiveContext);
    const item = useAPITodoItem(id, user);
    const { owner, title, description, updateItem, shareItem } = item
    
    const { theme, themeContrast1 } = useTheme();

    if (id === null) return ( <></> )
    
    return (
        <Container className={`
            text-${themeContrast1}
            d-flex flex-column
            `}>
            <Container className="p-0 mt-2 d-flex justify-content-xl-between">
                <Container className="p-0 m-0 d-flex">
                    <Button as={Link} to={`/${owner}/${id}`} className="mr-1" variant="outline-primary">
                        <Image src='/todos/details.png' width={20} height={20}/>
                    </Button>
                </Container>
                <Container className="p-0 m-0 d-flex justify-content-end">
                    {
                    owner === user &&
                    <>
                        <CompletedButton item={item} handleUpdate={updateItem} />
                        <ShareButton item={item} />
                        <PrivateButton item={item} handleUpdate={updateItem} />
                        <FavoriteButton item={item} handleUpdate={updateItem} />
                    </>
                    }
                </Container>
            </Container>
            <p>{id}</p>
            <p>{owner}</p>
            <p>{title}</p>
            <FormControl as='textarea' value={description} disabled />
            {/* <p>{description}</p> */}
        </Container>
    )
}