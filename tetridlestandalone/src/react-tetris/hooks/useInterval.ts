import { useEffect, useRef } from 'react';

export function useInterval(callback: () => unknown, delay: number) {
    const savedCallback = useRef<() => unknown>(callback);

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current?.();
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}
export function useTimeout(callback: () => unknown, delay: number) {
    const savedCallback = useRef<() => unknown>(callback);

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current?.();
        }
        if (delay !== null) {
            const id = setTimeout(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}