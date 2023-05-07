export default function PassPropsWrapper({ children, newProps }) {
    Array.isArray(children) || (children = [children]);
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