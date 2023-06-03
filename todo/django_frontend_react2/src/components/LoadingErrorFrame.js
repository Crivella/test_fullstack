import { useEffect, useState } from 'react';


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default function LoadingErrorFrame({loading: _loading, error, onLoading, onError, children}) {
    const [loading, setLoading] = useState(false);
    const [trigger, setTrigger] = useState(false); // [0, 1

    // Useful for avoiding flickering on updates
    useEffect(() => {
        if (_loading) {
            timeout(200).then(() => setTrigger(!trigger))
        } else {
            setLoading(_loading);
        }
    }, [_loading]);

    useEffect(() => {
        if (_loading) setLoading(_loading);
    }, [trigger]);


    if (error) return onError(error);
    if (loading) return onLoading();
    return children;
}