import React, { useRef } from 'react';
import styles from './GooeyButton.module.css';

const GooeyButton = ({ children, onClick, className = '', style = {} }) => {
    const buttonRef = useRef(null);

    const handleMouseMove = (e) => {
        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        button.style.setProperty('--x', `${x}px`);
        button.style.setProperty('--y', `${y}px`);
        button.style.setProperty('--height', `${rect.height}px`);
        button.style.setProperty('--width', `${rect.width}px`);
    };

    return (
        <div className={`${styles.container} ${className}`} style={style}>
            <div
                className={styles.inner}
                ref={buttonRef}
                onMouseMove={handleMouseMove}
                onClick={onClick}
            >
                <button type="button" className={styles.button}>
                    {children}
                </button>
                <div className={styles.blob}></div>
            </div>
        </div>
    );
};

export default GooeyButton;
