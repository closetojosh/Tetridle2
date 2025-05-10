// src/Modal.tsx
import React, { useEffect, useState, type RefObject } from 'react';
import Portal from './Portal';
import './Modal.css'; // CSS styles remain the same
import { Checklist } from './Checklist';
import type { Action } from '../models/Game';
import ControlsModal from './ControlsModal';

// Define the interface for the component's props
interface ModalProps {
    isOpen: boolean;
    onClose: () => void; // A function that takes no arguments and returns nothing
    missions?: string[]; // An optional array of strings (defaults to empty array below)
    setControls: (controls: Map<string, Action>) => void; // Optional function to set controls
    keyboardControls: RefObject<Map<string, Action>>; // Optional keyboard controls
}

const StartingModal: React.FC<ModalProps> = ({ isOpen, onClose, missions = [], setControls, keyboardControls }) => {
    const [isControlsModalOpen, setIsControlsModalOpen] = useState<boolean>(false);
    const closeControlsModal = () => { setIsControlsModalOpen(false)};
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

    return (
        <>
            <Portal>
                <div
                    className="modal-overlay"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="modal-content" onClick={handleContentClick}>
                        <h1 className="modal-title">Tetridle</h1>
                        <div className="vertical-flexbox">
                            <button className="modal-play-button" onClick={onClose}>
                                Play!
                            </button>
                            <button className="modal-control-button" onClick={() => setIsControlsModalOpen(true)}>
                                Change Controls
                            </button>
                        </div>
                        <Checklist missions={missions} />
                    </div>
                </div>
            </Portal>
            <ControlsModal
                isOpen={isControlsModalOpen}
                onClose={closeControlsModal}
                keyboardControls={keyboardControls}
                setKeyboardControls={setControls}
            />
        </>
    );
}

export default StartingModal;