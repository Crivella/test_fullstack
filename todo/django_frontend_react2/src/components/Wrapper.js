export default function PassPropsWrapper({ children, newProps }) {
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