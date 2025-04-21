import { useEffect, useState } from 'react';

export const useCustomDraggable = ({ size, position, setPosition }) => {
    const [dragging, setDragging] = useState(false); //флаг двигаем чи не
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });//позиция старта

    const handleMouseDown = (e) => {
        setDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e) => {
        if (!dragging) return;

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
        });
    };

    const handleMouseUp = () => setDragging(false);

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    });

    return {
        handleMouseDown,
    };
};