import React, { useState, useEffect, useCallback, type Ref } from 'react';
import Portal from './Portal';
import { type Action, ALL_ACTIONS_ORDERED, DEFAULT_KEYBOARD_CONTROLS_ENTRIES, } from '../models/Game';
import './Modal.css'; // Reusing existing styles + new ones for controls

interface ControlsModalProps {
    isOpen: boolean;
    onClose: () => void;
    keyboardControls: Ref<Map<string, Action>>;
    setKeyboardControls: (newControls: Map<string, Action>) => void;
}

const ControlsModal: React.FC<ControlsModalProps> = ({
    isOpen,
    onClose,
    keyboardControls,
    setKeyboardControls,
}) => {
    const [editingControls, setEditingControls] = useState<Map<string, Action>>(new Map(keyboardControls!.current));
    const [listeningForActionKey, setListeningForActionKey] = useState<Action | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Reset editingControls when the modal is opened or external controls change
    useEffect(() => {
        if (isOpen) {
            setEditingControls(new Map(keyboardControls!.current));
            setErrorMessage(null); // Clear errors when modal opens
            setListeningForActionKey(null); // Stop listening if was active
        }
    }, [isOpen, keyboardControls]);

    const handleKeyDownCapture = useCallback((event: KeyboardEvent) => {
        event.preventDefault();
        const newKey = event.key;

        if (!listeningForActionKey) return;

        const tempControls = new Map(editingControls);
        let keyConflict = false;

        // Check if the new key is already assigned to a *different* action
        if (tempControls.has(newKey) && tempControls.get(newKey) !== listeningForActionKey) {
            const conflictingAction = tempControls.get(newKey);
            setErrorMessage(`Error: Key "${newKey}" is already assigned to ${conflictingAction}.`);
            keyConflict = true;
        } else {
            setErrorMessage(null); // Clear previous error
            // Remove old key(s) for the action being remapped
            tempControls.forEach((action, key) => {
                if (action === listeningForActionKey) {
                    tempControls.delete(key);
                }
            });
            // Assign the new key
            tempControls.set(newKey, listeningForActionKey);
        }

        if (!keyConflict) {
            setEditingControls(tempControls);
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
        localStorage.setItem('controls', JSON.stringify(Object.fromEntries(editingControls)));
        setKeyboardControls(new Map(editingControls));
        onClose();
    };

    const handleResetToDefaults = () => {
        setEditingControls(new Map(DEFAULT_KEYBOARD_CONTROLS_ENTRIES));
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
                                <span className="key-display">{getKeysForActionDisplay(action, editingControls)}</span>
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