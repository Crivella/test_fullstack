import { useEffect, useRef, useState } from "react";
import { Button, Container, Form, Image, ListGroup, Overlay, Popover } from "react-bootstrap";
import { useAPIUser } from "../API/Hooks";

export default function ShareButton({ handleShare }) {

    const [target, setTarget] = useState(null);
    const [show, setShow] = useState(false);

    const ref = useRef(null);

    const onClick = (e) => {
        setTarget(e.target);
        setShow(!show);
    };

    const handleSubmit = (value) => {
        console.log('handleSubmit');
        setShow(false);
        handleShare(value);
    }

    return (
        <Container ref={ref} className="p-0 m-0 ">
            <Button className="mx-1"  onClick={onClick} >
                <Image src='/todos/share.png' width={20} height={20}/>
            </Button>
            <Overlay 
                target={target} container={ref} 
                show={show} 
                placement="top" 
                onHide={() => setShow(false)}
                rootClose
                >
                <Popover id="popover-contained">
                    <Popover.Body>
                        <UserForm handleSubmit={handleSubmit} />
                    </Popover.Body>
                </Popover>
            </Overlay>
        </Container>
    )
}

function UserForm({ handleSubmit }) {
    const users = useAPIUser();

    return (
        <AutocompleteField items={users} handleSubmit={handleSubmit} />
    )
}

function AutocompleteField({items = [], handleSubmit}) {
    const [active, setActive] = useState(null); // [id, username
    const [value, setValue] = useState('');
    const [flist, setFlist] = useState([]);

    useEffect(() => {
        if (value === '') setFlist([...items]);
        else {
            setFlist(items.filter((item) => item.username.startsWith(value)));
        }
    }, [value, items]);

    const onSubmit = (e) => {
        e.preventDefault();
        console.log('onSubmit');
        console.log(value);
        console.log(items);
        handleSubmit(value);
    }

    const onChange = (e) => {
        setActive(null);
        setValue(e.target.value);
    }

    const onKeydown = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (active === null) setActive(0);
                else if (active < flist.length - 1) setActive((a) => a + 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (active === null) setActive(flist.length - 1);
                else if (active > 0) setActive((a) => a - 1);
                break;
            case 'Enter':
                e.preventDefault();
                if (active !== null) {
                    setValue(flist[active].username);
                    setActive(null);
                } else {
                    onSubmit(e);
                }
                break;
            default:
                break;
        }
    }

    return (
        <Form onSubmit={onSubmit}>
            <ListGroup>
                {flist.map((user,idx) => (
                    <ListGroup.Item key={user.id} disabled active={active === idx}>
                        {user.username}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <Form.Control 
                type='text'
                value={value}
                onChange={onChange}
                onKeyDown={onKeydown}
                />
        </Form>
    )
}