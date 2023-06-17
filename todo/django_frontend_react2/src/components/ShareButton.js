import { useEffect, useRef, useState } from "react";
import { Button, Container, Form, Image, ListGroup, Overlay, Popover } from "react-bootstrap";
import { useAPIUser } from "../API/Hooks";
import FlippableButton from "./FlippableButton";

export default function ShareButton({ item }) {
    const [variant, setVariant] = useState('outline-primary'); // ['outline-primary', 'success'
    const [target, setTarget] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (item.sharedWith.length > 0) setVariant('success');
        else setVariant('outline-primary');
    }, [item]);

    const ref = useRef(null);

    const onClick = (e) => {
        setTarget(e.target);
        setShow(!show);
    };

    const handleSubmit = (value) => {
        setShow(false);
    }

    return (
        <Container ref={ref} className="p-0 m-0">
            <Button className="mx-1"  onClick={onClick} variant={variant}>
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
                        <UserForm item={item} handleSubmit={handleSubmit} />
                    </Popover.Body>
                </Popover>
            </Overlay>
        </Container>
    )
}

function UserForm({ item, handleSubmit }) {
    const users = useAPIUser();

    return (
        <AutocompleteField item={item} items={users} handleSubmit={handleSubmit} />
    )
}

function AutocompleteField({item, items = [], handleSubmit}) {
    const { owner, sharedWith, shareItem } = item || {}
    const [active, setActive] = useState(null); // [id, username
    const [value, setValue] = useState('');
    const [flist, setFlist] = useState([]);
    const [slist, setSlist] = useState([]); // [id, username

    useEffect(() => {
        const res = items.filter((item) => item.username !== owner);
        setSlist(res.filter((item) => sharedWith.includes(item.username)));
        setFlist(res
            .filter((item) => !sharedWith.includes(item.username))
            .filter((item) => item.username.includes(value))
            );
    }, [value, items, owner, sharedWith]);

    const onSubmit = (e) => {
        e.preventDefault();
        shareItem(value);
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
                    <ListGroup.Item key={user.id} active={active === idx}>
                        <div className="d-flex justify-content-between">
                        {user.username}
                        <ShareToUserButton item={item} user={user.username} />
                        </div>
                    </ListGroup.Item>
                ))}
                {slist.map((user,idx) => (
                    <ListGroup.Item key={user.id} active={active === idx}>
                        <div className="d-flex justify-content-between">
                        {user.username}
                        <ShareToUserButton item={item} user={user.username} />
                        </div>
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

function ShareToUserButton({ item, user }) {
    const { sharedWith, shareItem } = item || {};

    const [isShared, setIsShared] = useState(false);

    useEffect(() => {
        setIsShared(sharedWith.includes(user));
    }, [sharedWith, user]);

    const handleAsync = () => {
        shareItem(user);
    }

    return (
        <FlippableButton 
            on={isShared}
            offState="→"
            onState="→"
            onVariant='success'
            handleAsync={handleAsync}
            >
            {user}
        </FlippableButton>
    )
}
