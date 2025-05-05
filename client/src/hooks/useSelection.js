import { useState, useEffect } from 'react';

const useSelection = (folders, setLastSelectedFolder, files, setLastSelectedFile) => {
    const [isSelecting, setIsSelecting] = useState(false);  // индикатор показывающий, что пользователь выделяет область
    const [selectionArea, setSelectionArea] = useState(null);  // координаты выделенной области
    const [folderPositions, setFolderPositions] = useState({});
    const [filePositions, setFilePositions] = useState({});

    const [selectedAreaFolders, setSelectedAreaFolders] = useState([]);
    const [selectedAreaFiles, setSelectedAreaFiles] = useState([]);

    const handleMouseDown = (e) => {
        //e.preventDefault(); //не позволит выделение по двойному клику
        document.body.style.userSelect = 'none'; //отключаем выделение пока юзер таскает окно по экрану
        if (e.target.closest('.item')) return; // если тыкнули по самому файлу, то выделение не начинается. вдруг юзер хочет перетащить файл

        const container = e.target.closest('.folder-list'); // поиск контейнера .folder-list. Если пользователь тыкнет по папке
                                                            // то он сначала проверит класс папки, если не сойдется с .folder-list
                                                            // то будет подниматься выше, пока не найдет контейнер с нужным классом
        if (!container) return; // если всё таки не найдет

        const rect = container.getBoundingClientRect(); // записываем координаты контейнера

        const startX = e.clientX - rect.left; // координаты начала выделения
        const startY = e.clientY - rect.top;

        setIsSelecting(true);
        //console.log("IS SELECTING", isSelecting);
        setSelectionArea({ startX, startY, endX: startX, endY: startY });
        //console.log("SELECTION AREA", selectionArea);
    };

    const handleMouseMove = (e) => {
        if (!isSelecting) return;
        const container = e.target.closest('.folder-list'); // тоже самое
        if (!container) return;
        //console.log("IS SELECTING", isSelecting);
        //console.log("CONTAINER: ", container);
        const rect = container.getBoundingClientRect(); // Получаем координаты контейнера
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;
        setSelectionArea((prevArea) => ({ // в процессе выделения пока движется мышка, записываются коорды конца выделения
            ...prevArea,
            endX,
            endY,
        }));
    };

    const handleMouseUp = () => {
        document.body.style.userSelect = ''; //включаем выделение
        if(!isSelecting) return;
        setLastSelectedFolder(null);
        setLastSelectedFile(null);
        //console.log("SELECTION AREA", selectionArea);
        setIsSelecting(false);
        //console.log("IS SELECTING", isSelecting);

        setSelectedAreaFolders(      // записываем папки, попавшие в область выделения
            folders.filter(folder => isElementInSelection(folder.id, selectionArea, 'folder'))//проверка попала ли папка в область
                .map(folder => folder.id) // записываем только id
        );

        //console.log("FILES POSITION", filePositions);

        setSelectedAreaFiles(      // записываем файлы, попавшие в область выделения
            files.filter(file => isElementInSelection(file.id, selectionArea, 'file'))//проверка попал ли файл в область
                .map(file => file.id) // записываем только id
        );


        //console.log("Selected folders:", selectedAreaFolders);
    };

    const isElementInSelection = (elementId, selectionArea, elementType) => {
        const positions = elementType === 'folder' ? folderPositions : filePositions;//записываем позиции нужных элементов
        const elementPosition = positions[elementId]; //берем позицию конкретного элемента

        if (!elementPosition) return false;

        //4 строки внизу устанавливают правильный порядок координаты выделенной области.
        // selectionStartX/Y — верхний левый угол, selectionEndX/Y — нижний правый
        const selectionStartX = Math.min(selectionArea.startX, selectionArea.endX);
        const selectionEndX = Math.max(selectionArea.startX, selectionArea.endX);
        const selectionStartY = Math.min(selectionArea.startY, selectionArea.endY);
        const selectionEndY = Math.max(selectionArea.startY, selectionArea.endY);


        return ( //true если каждое из условий соблюдено, т.е. элемент попал в область
            elementPosition.left < selectionEndX &&
            elementPosition.right > selectionStartX &&
            elementPosition.top < selectionEndY &&
            elementPosition.bottom > selectionStartY
        );
    };

    useEffect(() => {
        if (isSelecting) {
            // когда область выделяется, добавляем обработчики(слушатели)
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            // наоборот
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            // если выходим со страницы по какой-то причине, так же удаляем обработчики
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isSelecting]); // реагирует на isSelecting

    useEffect(() => {
        const updateFolderPositions = () => { // записываем в folderPositions координаты папок
            const positions = {};
            const container = document.querySelector('.folder-list');
            const containerRect = container.getBoundingClientRect(); //getBoundingClientRect возвращает положение элемента
                                                                     //относительно окна. (верхний, нижний, левый, правый края относительно окна)
            folders.forEach((folder) => {
                const folderElement = document.getElementById(folder.id);
                if (folderElement) {
                    const rect = folderElement.getBoundingClientRect();
                    positions[folder.id] = { //вычисление позиции каждой папку уже относительно контейнера
                        top: rect.top - containerRect.top,
                        left: rect.left - containerRect.left,
                        bottom: rect.bottom - containerRect.top,
                        right: rect.right - containerRect.left,
                    };
                }
            });
            //console.log("POSITIONS", positions);
            setFolderPositions(positions);
        };

        updateFolderPositions(); // вызывается сразу после рендера

        window.addEventListener('resize', updateFolderPositions); // обновляем координаты в случае изменения размера страницы

        return () => { // в случае выхода со страницы удаляем обработчик(слушатель)
            window.removeEventListener('resize', updateFolderPositions);
        };
    }, [folders]);

    useEffect(() => {
        const updateFilePositions = () => { // записываем в folderPositions координаты файлов
            const positionsFiles = {};
            const container = document.querySelector('.folder-list');
            const containerRect = container.getBoundingClientRect(); //getBoundingClientRect возвращает положение элемента
                                                                     //относительно окна. (верхний, нижний, левый, правый края относительно окна)
            files.forEach((file) => {
                const fileElement = document.getElementById(file.id);
                //console.log("FILE ELEMENT, FILE", fileElement, file);
                if (fileElement) {
                    const rect = fileElement.getBoundingClientRect();
                    positionsFiles[file.id] = { //вычисление позиции каждого файла уже относительно контейнера
                        top: rect.top - containerRect.top,
                        left: rect.left - containerRect.left,
                        bottom: rect.bottom - containerRect.top,
                        right: rect.right - containerRect.left,
                    };
                }
            });
            //console.log("POSITIONS FILES", positionsFiles);

            setFilePositions(positionsFiles);
        };

        updateFilePositions(); // вызывается сразу после рендера

        window.addEventListener('resize', updateFilePositions); // обновляем координаты в случае изменения размера страницы

        return () => { // в случае выхода со страницы удаляем обработчик(слушатель)
            window.removeEventListener('resize', updateFilePositions);
        };
    }, [files]);

    return {
        isSelecting,
        selectionArea,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        selectedAreaFolders,
        setSelectedAreaFolders,
        selectedAreaFiles,
        setSelectedAreaFiles,
    };
};

export default useSelection;
