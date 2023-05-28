import { useCallback, useEffect, useState } from "react";

export default function useQueue({
    id, cache = 'local',
    dataActions, flustActions, undoActions
}, deps=[]) {
    const queue_name = `queue_${id}`;

    const [queue, setQueue] = useState([]); // [(action, data), (action, data)
    const [idx, setIdx] = useState(0); // [{}

    // Lifecycle
    useEffect(() => {
        setIdx(0);
    }, deps);
        
    useEffect(() => {
        let app;
        switch (cache) {
            case 'local':
                app = localStorage.getItem(queue_name);
                break;
            case 'session':
                app = sessionStorage.getItem(queue_name);
                break;
            default:
                break;
        }
        if (app) {
            setQueue(JSON.parse(app));
        }
    }, [cache, queue_name]);

    useEffect(() => {
        if (queue.length > 0) {
            switch (cache) {
                case 'local':
                    localStorage.setItem(queue_name, JSON.stringify(queue));
                    break;
                case 'session':
                    sessionStorage.setItem(queue_name, JSON.stringify(queue));
                    break;
                default:
                    break;
            }
        }
    }, [queue, cache, queue_name]);

    useEffect(() => {
        const length = queue.length;
        if (length > idx) {
            for (let i = idx; i < length; i++) {
                const [action, data] = queue[i];
                dataActions[action](data);
            }
            setIdx(length);
        }
    }, [queue, dataActions, idx]);

    const flush = useCallback(() => {
        queue.forEach(([action, data]) => flustActions[action](data));
        setIdx(0);
        setQueue([]);
        localStorage.removeItem(queue_name);
    }, [queue, queue_name, flustActions]);

    const push = useCallback((action, data) => {
        setQueue((queue) => [...queue, [action, data]]);
    }, []);

    const undo = useCallback(() => {
        throw new Error('Not implemented');
    }, []);


    return {push, flush, undo};
};