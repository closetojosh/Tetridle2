// src/Modal.tsx
import React, { useEffect } from 'react';
import Portal from './Portal';
import './Modal.css'; // CSS styles remain the same
import { Checklist } from './Checklist';

// Define the interface for the component's props
interface ModalProps {
    isOpen: boolean;
    onClose: () => void; // A function that takes no arguments and returns nothing
    missions?: string[]; // An optional array of strings (defaults to empty array below)
}

const StartingModal: React.FC<ModalProps> = ({ isOpen, onClose, missions = [] }) => {

    // Effect for handling the Escape key
    useEffect(() => {
        // Type the event parameter as KeyboardEvent
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]); // Dependencies

    if (!isOpen) {
        return null;
    }

    // Type the event parameter as React's MouseEvent specifically for an HTMLDivElement
    const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // Prevent click from bubbling up to the overlay
    };

    // Type the event for the overlay click handler
    const handleOverlayClick = () => {
        // Optional: Check if the click was directly on the overlay, not the content
        // if (e.target === e.currentTarget) {
        onClose();
        // }
    }

    return (
        <Portal>
            <div
                className="modal-overlay"
                onClick={handleOverlayClick} // Use the typed handler
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-content" onClick={handleContentClick}>
                    <h1 className="modal-title">Tetridle</h1>
                    <button className="modal-play-button" onClick={onClose}>
                        Play!
                    </button>
                    <Checklist missions={missions} />
                </div>
            </div>
        </Portal>
    );
}

export default StartingModal;