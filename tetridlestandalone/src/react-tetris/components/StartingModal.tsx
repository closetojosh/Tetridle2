import React, { useState, type RefObject } from 'react';
import Portal from './Portal';
import './Modal.css'; // CSS styles remain the same
import { Checklist } from './Checklist';
import ControlsModal from './ControlsModal';
import type { GameSettings } from '../../App';
import { missionList } from '../../missionList';
import { daysSinceMay122025 } from '../../App';
import { formatTime } from './Timer';

// Define the interface for the component's props
interface ModalProps {
    isOpen: boolean;
    onClose: () => void; // A function that takes no arguments and returns nothing
    missions?: string[]; // An optional array of strings (defaults to empty array below)
    setSettings: (controls: GameSettings) => void; // Optional function to set controls
    settings: RefObject<GameSettings>; // Optional keyboard controls
    onMissionSelect: (index: number) => void;
    currentMissionIndex: number;
}

const StartingModal: React.FC<ModalProps> = ({ isOpen, onClose, missions = [], setSettings, settings, onMissionSelect, currentMissionIndex }) => {
    const [isControlsModalOpen, setIsControlsModalOpen] = useState<boolean>(false);
    const [selectedMissionIndex, setSelectedMissionIndex] = useState<number>(daysSinceMay122025());
    const closeControlsModal = () => { setIsControlsModalOpen(false)};
    // Effect for handling the Escape key

    if (!isOpen) {
        return null;
    }

    // Type the event parameter as React's MouseEvent specifically for an HTMLDivElement
    const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // Prevent click from bubbling up to the overlay
    };

    const handleMissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = parseInt(e.target.value);
        setSelectedMissionIndex(index);
        onMissionSelect(index);
    };

    const renderMissionOptions = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to start of day
        const startDate = new Date('2025-05-12');
        
        return missionList.map((_, i) => {
            const missionDate = new Date(startDate);
            missionDate.setDate(missionDate.getDate() + i);
            missionDate.setHours(0, 0, 0, 0); // Set time to start of day
            
            // Only show missions up to and including today
            if (missionDate > today) {
                return null;
            }

            const dateString = missionDate.toISOString().split('T')[0];
            const hasWon = localStorage.getItem(`won-${dateString}`) === '1';
            const score = localStorage.getItem(`score-${dateString}`);
            const formattedScore = score ? ` (${formatTime(parseInt(score))})` : '';

            return (
                <option key={i} value={i}>
                    {missionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {hasWon ? ` ✓${formattedScore}` : ''}
                </option>
            );
        }).filter(Boolean); // Remove null entries
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
                        <div className="mission-selector">
                            <label htmlFor="mission-select">Select Mission:</label>
                            <select 
                                id="mission-select" 
                                value={selectedMissionIndex.toString()}
                                onChange={handleMissionChange}
                                className="mission-select"
                                style={{ position: 'relative', zIndex: 1002 }}
                            >
                                {renderMissionOptions()}
                            </select>
                        </div>
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