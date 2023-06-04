import FilterSortProvider from "./FilterSort";
import HoldingKeyMapProvider from "./HoldingKeyMap";
import ModalProvider from "./Modal";
import PaginatorProvider from "./Pagination";
import ThemeProvider from "./Theme";


export default function CommonProviders({children, theme='dark', size=16}) {
    return (
        <ThemeProvider theme={theme}>
        <HoldingKeyMapProvider>
        <ModalProvider>
        {/* <PaginatorProvider size={size}> */}
        {/* <FilterSortProvider> */}
            {children}
        {/* </FilterSortProvider> */}
        {/* </PaginatorProvider> */}
        </ModalProvider>
        </HoldingKeyMapProvider>
        </ThemeProvider>
    )
}

export { FilterSortProvider, HoldingKeyMapProvider, ModalProvider, PaginatorProvider, ThemeProvider };

