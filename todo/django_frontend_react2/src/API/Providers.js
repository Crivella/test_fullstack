import APIAuthProvider from "./Auth";
import APIFilterSortProvider from "./FilterSort";
import APIPaginatorProvider from "./Pagination";
// import APITodosProvider from "./Todos";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// APIFilterSort and APIPaginatorProvider has to be above APITodosProvider 
// which makes use of their contexts
export default function APIProvider({children, size=16}) {
    return (
        <QueryClientProvider client={queryClient}>
        <APIAuthProvider>
            <APIFilterSortProvider> 
                <APIPaginatorProvider size={size}>
                    {/* <APITodosProvider> */}
                        {children}
                    {/* </APITodosProvider> */}
                </APIPaginatorProvider>
            </APIFilterSortProvider>
        </APIAuthProvider>
        </QueryClientProvider>
    )
}

export { APIAuthProvider, APIFilterSortProvider, APIPaginatorProvider };

