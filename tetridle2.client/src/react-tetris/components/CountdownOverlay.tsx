import React, { useState, useEffect } from 'react';
import './CountdownOverlay.css';

export default function CountdownOverlay(props: { countdownEndCallback: () => unknown, isEnabled: boolean }) {
    const [count, setCount] = useState<number | null>(3);
    useEffect(() => {
        if (!props.isEnabled) return;
        if (count === null || count === 0) return;
        const timer = setTimeout(() => {
            if (count == 1) {
                props.countdownEndCallback();
            }
            setCount(prev => (prev ?? 0) - 1)
        }, 1000);
        return () => {
            clearTimeout(timer);
        };
    }, [count, props.isEnabled]);

    return (
        <div className="container" >
            {
                count !== null && count > 0 && (
                    <div className="overlay" >
                        {props.isEnabled ? <span className="count-text" > {count} </span> : <></>}
                     </div>
              )
            }
       </div>
    );
}