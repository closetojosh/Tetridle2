
import React, { useState, type RefObject } from 'react';
import Portal from './Portal';
import './Modal.css'; // CSS styles remain the same
import { Checklist } from './Checklist';
import ControlsModal from './ControlsModal';
import type { GameSettings } from '../../App';

// Define the interface for the component's props
interface ModalProps {
    isOpen: boolean;
    onClose: () => void; // A function that takes no arguments and returns nothing
    missions?: string[]; // An optional array of strings (defaults to empty array below)
    setSettings: (controls: GameSettings) => void; // Optional function to set controls
    settings: RefObject<GameSettings>; // Optional keyboard controls
}

const StartingModal: React.FC<ModalProps> = ({ isOpen, onClose, missions = [], setSettings, settings }) => {
    const [isControlsModalOpen, setIsControlsModalOpen] = useState<boolean>(false);
    const closeControlsModal = () => { setIsControlsModalOpen(false)};
    // Effect for handling the Escape key

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
                settings={settings}
                setSettings={setSettings}
            />
        </>
    );
}

export default StartingModal;