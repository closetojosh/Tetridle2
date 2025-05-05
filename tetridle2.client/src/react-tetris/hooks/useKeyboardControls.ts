import React from 'react';
import { Action } from '../models/Game';


export type KeyboardMap = Map<string, Action>;
const ARR = 0;
const SOFTDROP_SPEED = 20;
const DAS = 100;
export const useKeyboardControls = (
    keyboardMap: KeyboardMap,
    dispatch: React.Dispatch<Action>
): void => {
    const currentAction = React.useRef<Action | null>(null);
    const dasTimer = React.useRef<number | null>(null);
    const arrTimer = React.useRef<number | null>(null);
    const softDropTimer = React.useRef<number | null>(null);
    React.useEffect(() => {
        const keyboardDispatch = [...keyboardMap.entries()].reduce<KeyboardDispatch>((output, [key, action]) => {
            output[key] = () => dispatch(action);
            return output;
        }, {});
        function onEvent(event: KeyboardEvent) {
            if (event.repeat) return;
            if (event.type == "keyup") {
                console.log('up');
                if (currentAction.current == keyboardMap.get(event.key)) {
                    if(dasTimer.current) clearTimeout(dasTimer.current);
                    if(arrTimer.current) clearInterval(arrTimer.current);
                }
                if (keyboardMap.get(event.key) == 'MOVE_DOWN') {
                    if (softDropTimer.current) clearInterval(softDropTimer.current);
                    softDropTimer.current = null;
                }
            }
            else {
                if (keyboardMap.get(event.key) == 'MOVE_LEFT' || keyboardMap.get(event.key) == 'MOVE_RIGHT') {
                    if (dasTimer.current) clearTimeout(dasTimer.current);
                    if (arrTimer.current) clearInterval(arrTimer.current);
                    currentAction.current = keyboardMap.get(event.key) as Action;
                    dasTimer.current = setTimeout(() => {
                        arrTimer.current = setInterval(() => { keyboardDispatch[event.key]?.() }, ARR);
                    }, DAS);
                    
                }
                if (keyboardMap.get(event.key) == 'MOVE_DOWN') {
                    softDropTimer.current = setInterval(() => { keyboardDispatch[event.key]?.() }, SOFTDROP_SPEED);
                }
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
