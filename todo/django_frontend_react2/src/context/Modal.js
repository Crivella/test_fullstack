import { createContext, useState } from "react";

export const ModalContext = createContext({});

export default function ModalProvider({children}) {
    const [showLogin, setShowLogin] = useState(false);
    const [showTodo, setShowTodo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);

    const newProps = {
        'showLogin': showLogin,
        'showTodo': showTodo,
        'showDelete': showDelete,
        'showUserProfile': showUserProfile,
        'setShowLogin': setShowLogin,
        'setShowTodo': setShowTodo,
        'setShowDelete': setShowDelete,
        'setShowUserProfile': setShowUserProfile,
    }

    return (
        <ModalContext.Provider value={newProps}>
            {children}
        </ModalContext.Provider>
    )
    
}