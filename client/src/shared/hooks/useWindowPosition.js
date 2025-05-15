import { useEffect, useState } from "react";

export const useWindowPosition = ({ initialSize }) => {  // хук для позиционирования окна(размещения его по центру экрана)
    const [position, setPosition] = useState(null); // сначала null
    const [size, setSize] = useState({ width: 835, height: 600 });
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (!hasInitialized && position === null) {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            const initialX = (windowWidth - size.width) / 2;

            const initialY = Math.max((windowHeight - size.height) / 2, 0); // если высота страницы-высота окна меньше 0, то начальная позиция по y 0,

            setPosition({ x: initialX, y: initialY });
            setHasInitialized(true);



            //console.log("USER", user);
        }
    }, [hasInitialized, position, size]);

    return { position, setPosition, size, setSize };

};