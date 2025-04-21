export const startResize = ({ direction, nodeRef, position, setPosition, size, setSize }) => (e) => {
    e.preventDefault(); // Отключаем стандартное поведение браузера (например, выделение текста при перетаскивании)
    e.stopPropagation(); // Предотвращаем всплытие события выше по дереву DOM


    const startX = e.clientX;// запоминаем стартовые координаты
    const startY = e.clientY;
    const startWidth = nodeRef.current.offsetWidth;// Запоминаем стартовые размеры
    const startHeight = nodeRef.current.offsetHeight;
    const startLeft = position.x;// Запоминаем позицию окна
    const startTop = position.y;



    const minW = 900;// устанавливаем минимальные и максимальные допустимые размеры окна
    const maxW = 1200;
    const minH = 300;
    const maxH = 1000;



    const onMouseMove = (e) => {// обработчик движения мыши
        let newWidth = startWidth; // стартовые значения, которые будем обновлять
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;

        if (direction.includes("right")) {//если ресайзим справа, то ширина увеличивается вправо от курсора
            const deltaX = e.clientX - startX; // расчет насколько сдвинули курсор вправо
            newWidth = Math.max(minW, Math.min(maxW, startWidth + deltaX)); // ограничиваем ширину между min и max
        }

        if (direction.includes("bottom")) {// если ресайзим снизу
            const deltaY = e.clientY - startY; // расчет насколько сдвинули курсор вниз
            const desiredHeight = startHeight + deltaY;


            const clampedHeight = Math.max(minH, Math.min(maxH, desiredHeight)); //не даем новой высоте выйти за пределы мин макс размеров
            newHeight = clampedHeight;


            const maxHeight = window.innerHeight;// проверяем не выходит ли нижняя граница окна за пределы экрана
            if (startTop + newHeight > maxHeight) {
                newHeight = maxHeight - startTop; // смотрим, чтобы не вылезло за границы страницы
            }

            // Применяем новую высоту
            setSize((prev) => ({
                ...prev,
                height: newHeight,
            }));
        }


        //при изменениях влево и вверх начинается небольшой цирк из-за того, начальная позиция окна считается от верхнего левого окна
        //и двигая эти границы мы как бы двигаем саму начальную позицию, этого нужно было избежать

        if (direction.includes("left")) {// если ресайзим слева, то уменьшаем ширину и смещаем левую границу вправо
            const deltaX = e.clientX - startX; // расчет насколько сдвинули курсор слева
            const desiredWidth = startWidth - deltaX; // чем больше курсор вправо — тем меньше ширина
            const clampedWidth = Math.max(minW, Math.min(maxW, desiredWidth)); // ограничение ширины по мин макс
            const appliedDeltaX = startWidth - clampedWidth; // насколько изменилась ширина

            newWidth = clampedWidth;
            newLeft = startLeft + appliedDeltaX; // смещаем окно вправо, чтобы компенсировать уменьшение
        }


        if (direction.includes("top")) {// если ресайзим сверху, то уменьшаем высоту и смещаем верхнюю границу вниз
            const deltaY = e.clientY - startY; // расчет насколько сдвинули курсор вверх
            const desiredHeight = startHeight - deltaY; // чем больше курсор вниз — тем меньше высота

            const clampedHeight = Math.max(minH, Math.min(maxH, desiredHeight)); // ограничение высоты по мин макс
            const appliedDeltaY = startHeight - clampedHeight; // насколько изменилась высота

            newHeight = clampedHeight;



            const newTop = Math.max(0, startTop + appliedDeltaY);// новая верхняя граница не должна быть выше верхней границы экрана
            setPosition((prev) => ({
                ...prev,
                y: newTop,
            }));

            if (newTop === 0) { // если окно уперлось в верхнюю границу, то меняем высоту
                setSize((prev) => ({
                    ...prev,
                    height: Math.min(maxH, startHeight - appliedDeltaY),
                }));
            }
        }

        if (newWidth !== size.width || newHeight !== size.height) { // устанавливаем новые размеры, только если они реально изменились
            setSize({ width: newWidth, height: newHeight });
        }

        if ((newLeft !== position.x && direction.includes("left")) || (newTop !== position.y && direction.includes("top"))) {
            setPosition({ x: newLeft, y: newTop });  // устанавливаем новую позицию окна, если окну изменили положение верхней или левой границы
        }
    };

    const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
};

