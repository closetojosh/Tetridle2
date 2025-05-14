import React, { useState, useEffect, useCallback, type RefObject } from 'react';
import Portal from './Portal';
import { type Action, ALL_ACTIONS_ORDERED, DEFAULT_GAME_SETTINGS} from '../models/Game';
import './Modal.css'; // Reusing existing styles + new ones for controls
import type { GameSettings } from '../../App';

interface ControlsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: RefObject<GameSettings>;
    setSettings: (newControls: GameSettings) => void;
}

const ControlsModal: React.FC<ControlsModalProps> = ({
    isOpen,
    onClose,
    settings,
    setSettings,
}) => {
    const [editingControls, setEditingControls] = useState<GameSettings>(settings.current);
    const [listeningForActionKey, setListeningForActionKey] = useState<Action | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // Reset editingControls when the modal is opened or external controls change
    useEffect(() => {
        if (isOpen) {
            setEditingControls(settings.current);
            setErrorMessage(null); // Clear errors when modal opens
            setListeningForActionKey(null); // Stop listening if was active
        }
    }, [isOpen, settings]);

    const handleKeyDownCapture = useCallback((event: KeyboardEvent) => {
        event.preventDefault();
        const newKey = event.key;

        if (!listeningForActionKey) return;

        const tempControls = settings;
        let keyConflict = false;

        // Check if the new key is already assigned to a *different* action
        if (tempControls.current.keyboardControls.has(newKey) && tempControls.current.keyboardControls.get(newKey) !== listeningForActionKey) {
            const conflictingAction = tempControls.current.keyboardControls.get(newKey);
            setErrorMessage(`Error: Key "${newKey}" is already assigned to ${conflictingAction}.`);
            keyConflict = true;
        } else {
            setErrorMessage(null); // Clear previous error
            // Remove old key(s) for the action being remapped
            tempControls.current.keyboardControls.forEach((action, key) => {
                if (action === listeningForActionKey) {
                    tempControls.current.keyboardControls.delete(key);
                }
            });
            // Assign the new key
            tempControls.current.keyboardControls.set(newKey, listeningForActionKey);
        }

        if (!keyConflict) {
            setEditingControls(tempControls.current);
            setListeningForActionKey(null); // Stop listening
        }
    }, [listeningForActionKey, editingControls]);

    useEffect(() => {
        if (listeningForActionKey) {
            window.addEventListener('keydown', handleKeyDownCapture);
            // Focus something in the modal to ensure key events are captured if modal just opened
            // This is a bit tricky, often requires a ref to an element.
            // For simplicity, we rely on the modal being the active context.
        } else {
            window.removeEventListener('keydown', handleKeyDownCapture);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDownCapture);
        };
    }, [listeningForActionKey, handleKeyDownCapture]);


    const handleSetListening = (actionToListenFor: Action) => {
        setErrorMessage(null); // Clear any previous errors
        setListeningForActionKey(actionToListenFor);
    };

    const handleSaveChanges = () => {
        localStorage.setItem('controls', JSON.stringify(editingControls));
        localStorage.setItem('keyMap', JSON.stringify(Object.fromEntries(editingControls.keyboardControls)));
        setSettings(editingControls);
        onClose();
    };

    const handleResetToDefaults = () => {
        setEditingControls(DEFAULT_GAME_SETTINGS);
        setErrorMessage(null);
    };

    const handleCancel = () => {
        setListeningForActionKey(null); // Stop listening if active
        onClose(); // editingControls will be reset by useEffect when modal re-opens
    };

    const getKeysForActionDisplay = (action: Action, controls: Map<string, Action>): string => {
        const keys: string[] = [];
        controls.forEach((act, key) => {
            if (act === action) {
                keys.push(key);
            }
        });
        if(keys[0] === " ") return "Space"
        return keys.join(', ') || 'Unassigned';
    };

    if (!isOpen) return null;

    const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();

    return (
        <Portal>
            <div className="modal-overlay" onClick={handleCancel}>
                <div className="modal-content controls-modal-content" onClick={handleContentClick}>
                    <button className="modal-close-button" onClick={handleCancel}>&times;</button>
                    <h1 className="modal-title">Edit Controls</h1>

                    {listeningForActionKey && (
                        <div className="listening-prompt">
                            {`Press any key for ${listeningForActionKey}...`}
                            <button onClick={() => setListeningForActionKey(null)} className="cancel-listen-button">Cancel</button>
                        </div>
                    )}

                    {errorMessage && <div className="error-message">{errorMessage}</div>}

                    <ul className="controls-list">
                        {ALL_ACTIONS_ORDERED.map(action => (
                            <li key={action as React.Key} className="control-item">
                                <span className="action-name">{(action as string).replace(/_/g, ' ')}:</span>
                                <span className="key-display">{getKeysForActionDisplay(action, editingControls.keyboardControls)}</span>
                                <button
                                    className="change-key-button"
                                    onClick={() => handleSetListening(action)}
                                    disabled={listeningForActionKey !== null && listeningForActionKey !== action}
                                >
                                    {listeningForActionKey === action ? 'Listening...' : 'Change'}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="game-settings-section">
                        <h3 className="section-title">Timing Settings (milliseconds)</h3>
                        <div className="setting-item">
                            <label htmlFor="arr-input">Auto Repeat Rate (ARR): </label>
                            <input
                                type="number"
                                id="arr-input"
                                className="setting-input"
                                value={editingControls.arr} // Assumes 'editingSettings' is your state object
                                onChange={e => setEditingControls({ ...editingControls, arr: parseInt(e.target.value) }) } // Assumes 'handleNumericSettingChange' is your handler
                                min="0"
                                disabled={!!listeningForActionKey} // Assumes 'listeningForActionKey' is your state for when a key is being remapped
                            />
                        </div>
                        <div className="setting-item">
                            <label htmlFor="das-input">Delayed Auto Shift (DAS): </label>
                            <input
                                type="number"
                                id="das-input"
                                className="setting-input"
                                value={editingControls.das} // Assumes 'editingSettings' is your state object
                                onChange={e => setEditingControls({ ...editingControls, das: parseInt(e.target.value) })} // Assumes 'handleNumericSettingChange' is your handler
                                min="0"
                                disabled={!!listeningForActionKey} // Assumes 'listeningForActionKey' is your state
                            />
                        </div>
                        <div className="setting-item">
                            <label htmlFor="sdf-input">Soft Drop Delay (SDF): </label>
                            <input
                                type="number"
                                id="sdf-input"
                                className="setting-input"
                                value={editingControls.sdf} // Assumes 'editingSettings' is your state object
                                onChange={e => setEditingControls({ ...editingControls, sdf: parseInt(e.target.value) })} // Assumes 'handleNumericSettingChange' is your handler
                                min="0"
                                disabled={!!listeningForActionKey} // Assumes 'listeningForActionKey' is your state
                            />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button className="modal-button modal-button-secondary" onClick={handleResetToDefaults} disabled={!!listeningForActionKey}>
                            Reset Defaults
                        </button>
                        <button className="modal-button modal-button-secondary" onClick={handleCancel} disabled={!!listeningForActionKey}>
                            Cancel
                        </button>
                        <button className="modal-button modal-button-primary" onClick={handleSaveChanges} disabled={!!listeningForActionKey}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default ControlsModal;