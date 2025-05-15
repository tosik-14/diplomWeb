import React, { useEffect } from 'react';

export const useTicketCreatorHooks = ({
                                     dropAreasCount,
                                     setDropZoneFiles,
                                     zoneRefs,
                                     setIsNarrow,
                                     size,
                                 }) => {
    useEffect(() => { //изменение размера массива файлов вместе с изменением количества типов вопросов
        setDropZoneFiles((prev) => {
            const newFiles = [...prev];

            if (dropAreasCount > newFiles.length) { // добавить новый массив в массив
                while (newFiles.length < dropAreasCount) {
                    newFiles.push([]);
                }
            } else if (dropAreasCount < newFiles.length) { // удалить
                newFiles.length = dropAreasCount;
            }

            return newFiles;
        });

    }, [dropAreasCount]);

//спорное решение, но красота требует жертв
    useEffect(() => { // ResizeObserver - браузерный api инструмент, отслеживает изменения размеров элемента на странице
        const observer = new ResizeObserver((entries) => {//создаем новый экземпляр ResizeObserver, который будет реагировать на изменение размеров элементов
            setIsNarrow((prev) => { // обновляем состояние isNarrow, в зависимости от ее ширины
                const updated = [...prev]; // записываем предыдущее состояние, чтобы можно было изменить по индексам

                entries.forEach((entry) => {

                    const i = zoneRefs.current.findIndex((el) => el === entry.target);//находим индекс текущего элемента в массиве ссылок zoneRefs

                    if (i !== -1) {

                        updated[i] = entry.contentRect.width < 216;//проверяем ширину зоны, если она меньше 216пх, то ставим тру для дропзоны, типа она узкая
                    }
                });

                return updated; // возвращаем обновлённый массив
            });
        });

        zoneRefs.current.forEach((el) => {//подключаем ResizeObserver ко всем зонам, хранящимся в массиве ссылок
            if (el) observer.observe(el); //подписываемся на изменение размеров дропзоны(начинаем следить)
        });

        return () => {//возвращаем функцию очистки, чтобы остановить наблюдение при закрытии страницы или изменении ссылок
            zoneRefs.current.forEach((el) => {
                if (el) observer.unobserve(el);// отписываемся от изменения размеров(перестаем следить)
            });
        };
    }, [size.width, dropAreasCount]); //эффект повторно срабатывает при изменении ширины окна или количества дропзон
};

