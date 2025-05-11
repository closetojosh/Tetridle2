import React from 'react';
import './Timer.css';
import { Context } from '../context';

interface TimerProps {
    /**
     * Total seconds to display.
     */
    /**
     * Optional className for additional styling.
     */
    className?: string;
}
export const formatTime = (seconds: number): string => {
    const nonNegativeSeconds = Math.max(0, seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(nonNegativeSeconds / 60);
    const remainingSeconds = nonNegativeSeconds % 60;

    // Format the time to ensure two digits for seconds (e.g., 1:05 instead of 1:5)
    const formattedTime = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    return formattedTime;
}
const Timer: React.FC<TimerProps> = ({ className }) => {
    // Ensure seconds is not negative
    const { ticks } = React.useContext(Context);
    const formattedTime = formatTime(ticks);

    return (
        <div className={`timer-container ${className || ''}`}>
            <span className="timer-text" role="timer" aria-live="off">
                {formattedTime}
            </span>
        </div>
    );
};

export default Timer;