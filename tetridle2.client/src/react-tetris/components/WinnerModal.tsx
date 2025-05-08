import React, { useState, useEffect, useRef } from 'react';
import Portal from './Portal';
import './Modal.css'; // We'll add toast styles here later

interface WinnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    scoreString: string; // The string to be copied to the clipboard
}

const WinnerModal: React.FC<WinnerModalProps> = ({ isOpen, onClose, scoreString }) => {
    const [showToast, setShowToast] = useState<boolean>(false);
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For managing the toast timeout

    // Effect for handling the Escape key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    // Effect to clear timeout when component unmounts or isOpen changes
    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);


    const handleShareScore = async () => {
        try {
            await navigator.clipboard.writeText(scoreString);
            setShowToast(true);

            // Clear any existing timeout
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }

            // Hide toast after 3 seconds
            toastTimeoutRef.current = setTimeout(() => {
                setShowToast(false);
            }, 3000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
            // Optionally, show an error toast here
        }
    };

    if (!isOpen) {
        return null;
    }

    const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    const handleOverlayClick = () => {
        onClose();
    }

    return (
        <Portal>
            <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
                <div className="modal-content" onClick={handleContentClick}>
                    <button className="modal-close-button" onClick={onClose} aria-label="Close modal">
                        &times;
                    </button>

                    <h1 className="modal-title">You won!</h1>

                    <button
                        className="modal-play-button" // Reusing green button style
                        onClick={handleShareScore}
                    >
                        Share your score!
                    </button>

                    {/* Toast Notification */}
                    {showToast && (
                        <div className="modal-toast" role="status" aria-live="polite">
                            Copied to clipboard!
                        </div>
                    )}
                </div>
            </div>
        </Portal>
    );
};

export default WinnerModal;
