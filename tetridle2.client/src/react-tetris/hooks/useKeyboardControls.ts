import React from 'react';
import { Action } from '../models/Game';


export type KeyboardMap = Map<string, Action>;

export const useKeyboardControls = (
    keyboardMap: KeyboardMap,
    dispatch: React.Dispatch<Action>
): void => {
    React.useEffect(() => {
        const keyboardDispatch = Object.entries(keyboardMap).reduce<KeyboardDispatch>((output, [key, action]) => {
            output[key] = () => dispatch(action);
            return output;
        }, {});
        function onEvent(event: KeyboardEvent) {
            if (event.repeat) return;
            if (event.type == "keyup") {
                console.log('up');
                keyboardDispatch[event.key + "_done"]?.();
            }
            else {
                console.log('down')
                keyboardDispatch[event.key]?.();
            }
        }
        addKeyboardEvents(onEvent);
        return () => removeKeyboardEvents(onEvent);
    }, [keyboardMap, dispatch]);
};

function addKeyboardEvents(onEvent: (event: KeyboardEvent) => void) {
    //Object.keys(keyboardMap).forEach((k: keyof KeyboardDispatch) => {
    //  const fn = keyboardMap[k];
    //  if (k === 'shift' && fn) {
    //    DetectShift.bind(fn);
    //  } else if (fn) {
    //    key(k, fn);
    //  }
    //});
    document.addEventListener("keydown", onEvent);
    document.addEventListener("keyup", onEvent)
}
function removeKeyboardEvents(onEvent: (event: KeyboardEvent) => void) {
    //Object.keys(keyboardMap).forEach((k) => {
    //  if (k === 'shift') {
    //    const fn = keyboardMap[k];
    //    fn && DetectShift.unbind(fn);
    //  } else {
    //    key.unbind(k);
    //  }
    //});
    document.removeEventListener("keydown", onEvent);
}

type KeyboardDispatch = Record<string, () => void>;
