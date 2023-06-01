import APIAuthProvider from "./Auth";
import APIFilterSortProvider from "./FilterSort";
import APIPaginatorProvider from "./Pagination";
import APITodosProvider from "./Todos";

// APIFilterSort and APIPaginatorProvider has to be above APITodosProvider 
// which makes use of their contexts
export default function APIProvider({children, size=16}) {
    return (
        <APIAuthProvider>
            <APIFilterSortProvider> 
                <APIPaginatorProvider size={size}>
                    <APITodosProvider>
                        {children}
                    </APITodosProvider>
                </APIPaginatorProvider>
            </APIFilterSortProvider>
        </APIAuthProvider>
    )
}

export { APIAuthProvider, APIFilterSortProvider, APIPaginatorProvider, APITodosProvider };
