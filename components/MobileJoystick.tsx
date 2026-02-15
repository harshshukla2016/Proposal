import React, { useState, useRef } from 'react';

export const MobileJoystick = ({ moveRef }: { moveRef: React.MutableRefObject<{ x: number, y: number }> }) => {
    const joystickRadius = 50;
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [active, setActive] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });

    const handleTouchStart = (e: React.TouchEvent) => {
        setActive(true);
        const touch = e.touches[0];
        startPos.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!active) return;
        const touch = e.touches[0];
        let dx = touch.clientX - startPos.current.x;
        let dy = touch.clientY - startPos.current.y;

        // Clamp to radius
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > joystickRadius) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * joystickRadius;
            dy = Math.sin(angle) * joystickRadius;
        }

        setPos({ x: dx, y: dy });

        // Update Ref (Normalize -1 to 1)
        // Invert Y because dragging UP (negative Y) means FORWARD (positive move)
        moveRef.current = {
            x: dx / joystickRadius,
            y: -(dy / joystickRadius)
        };
    };

    const handleTouchEnd = () => {
        setActive(false);
        setPos({ x: 0, y: 0 });
        moveRef.current = { x: 0, y: 0 };
    };

    return (
        <div
            className="fixed bottom-10 left-10 w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30 touch-none flex items-center justify-center z-50 pointer-events-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className="w-10 h-10 bg-white/80 rounded-full shadow-lg"
                style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
            />
        </div>
    );
};
