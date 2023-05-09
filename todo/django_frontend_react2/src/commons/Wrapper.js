export default function PassPropsWrapper({ children, newProps, ...rest }) {
    Array.isArray(children) || (children = [children]);

    return (
        <>
            {children.map((e) => {
                let newObj = {...e}
                if (typeof(e.type) === 'function') newObj.props = {...rest, ...newProps, ...e.props};
                return newObj
            })}
        </>
    )
}