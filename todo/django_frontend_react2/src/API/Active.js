import { createContext, useState } from "react";

export const ActiveContext = createContext({});

export default function ActiveProvider({children}) {
    const [ active, setActive ] = useState(null);

    return (
        <ActiveContext.Provider value={{active, setActive}}>
            {children}
        </ActiveContext.Provider>
    )
}