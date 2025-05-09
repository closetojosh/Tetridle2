// src/Portal.tsx
import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Define the props interface
interface PortalProps {
    children: ReactNode; // ReactNode covers anything renderable by React
}

const Portal: React.FC<PortalProps> = ({ children }) => {
    // Ensure modal-root exists and is an HTMLElement, otherwise default to document.body
    // Note: It's generally better if #modal-root is guaranteed to exist.
    const modalRoot = document.getElementById('modal-root') ?? document.body;

    // Type the ref to hold an HTMLDivElement or null
    const elRef = useRef<HTMLDivElement | null>(null);

    // Ensure the element is created only once
    if (!elRef.current) {
        elRef.current = document.createElement('div');
    }

    useEffect(() => {
        const el = elRef.current; // Keep local reference

        // Ensure both the mount point and the element exist before appending
        if (modalRoot && el) {
            modalRoot.appendChild(el);
        }

        // Cleanup function: Remove the element from the DOM on unmount
        return () => {
            // Check if el exists and is a child of modalRoot before removing
            if (modalRoot && el && modalRoot.contains(el)) {
                modalRoot.removeChild(el);
            }
        };
    }, [modalRoot]); // Dependency array

    // elRef.current will be null on first render pass, before useEffect runs.
    // createPortal requires a valid DOM element.
    return elRef.current ? createPortal(children, elRef.current) : null;
}

export default Portal;