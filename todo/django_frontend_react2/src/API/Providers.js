import APIAuthProvider from "./Auth";
import APITodosProvider from "./Todos";

export default function APIProvider({children}) {
    return (
        <APIAuthProvider>
            <APITodosProvider>
                {children}
            </APITodosProvider>
        </APIAuthProvider>
    )
}

export { APIAuthProvider, APITodosProvider };
