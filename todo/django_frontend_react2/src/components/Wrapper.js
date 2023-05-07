import { useEffect } from "react";

export default function PassPropsWrapper({ children, newProps }) {
    useEffect(() => console.log(children), []);
    
    return (
        <>
            {children.map((e) => {
                let newObj = {...e}
                if (typeof(e.type) === 'function') newObj.props = {...newProps, ...e.props};
                return newObj
            })}
        </>
    )
}