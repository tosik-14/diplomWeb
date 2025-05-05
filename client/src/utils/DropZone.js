// DropZone.js
import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';

const DropZone = forwardRef(({ onFileUpload, onServerFileDrop, areaIndex, children, isInternalDragging, onFileError }, ref) => {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    useImperativeHandle(ref, () => ({ //предоставление родительскому компоненту доступ к функциям этого дочернего
                                          // тут передан ref, значит он может вызвать dropZoneRef.current.openFileDialog();
        openFileDialog: () => {
            fileInputRef.current?.click();  // диалоговое окно для выбора файла
        }
    }));

    const handleFileChange = (event) => {  // тут обрабатывается случай, кода пользователь выбрал файл, по сути чуть проще, чем если дропнул
        const file = event.target.files[0];
        if (file) onFileUpload(file); // проп-функция
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true); // перетаскивание работает
        //console.log("IS INTERNAL DRAGGING WHILE DRAG OVER", isInternalDragging.current);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const isAllowedExtension = (fileName) => {
        return fileName?.toLowerCase().endsWith('.docx');
    };

    const handleDrop = (event) => {                 //боже
        event.preventDefault();  // убираем стандартное поведение браузера
        setIsDragging(false); // индикатор, что идет перетаскивание

        //console.log("IS INTERNAL DRAGGING", isInternalDragging.current);
        if (isInternalDragging.current) {
            //console.log("IS INTERNAL DRAGGING", isInternalDragging.current);
            return;// пользователь просто двигал файл в пределах интерфейса
        }
        /*if (!event.dataTransfer.files || event.dataTransfer.files.length === 0) {
            return;  // так себе проверка на отличие между реальным файлом и просто элементом, не стабильная, ну пусть будет
        }*/

        const jsonData = event.dataTransfer.getData('application/json'); // достаем json из интейфеса, если есть
        //console.log("START PARSE JSON", jsonData);
        if (jsonData) {

            try {
                const parsedData = JSON.parse(jsonData); //парсим. Формат: { id: ..., name: ... }
                //console.log("PARSED DATA", parsedData);
                if (parsedData && onServerFileDrop) {
                    const isArray = Array.isArray(parsedData); // если несколько файлов, получается массив
                    if (typeof areaIndex === "number") { // если индекс передан, то он должен быть числом
                        if (isArray) {
                            parsedData.forEach(fileInfo => {

                                if (!isAllowedExtension(fileInfo.name)) {
                                    if (onFileError) onFileError('Можно загружать только .docx файлы');
                                    return;
                                } //проверка чтобы это был файл ворда.

                                if (isAllowedExtension(fileInfo.name)) { // отправляем только docx и doc файлы
                                    onServerFileDrop(fileInfo, areaIndex); //проп, если вызван, передает родителю инфу куда кинули файл
                                }

                            });
                        } else {

                            if (!isAllowedExtension(parsedData.name)) {
                                if (onFileError) onFileError('Можно загружать только .docx файлы');
                                return;
                            } //проверка чтобы это был файл ворда.

                            if (isAllowedExtension(parsedData.name)) {  // конечно получается что проверка дублируется, но думаю это не страшно
                                onServerFileDrop(parsedData, areaIndex);
                            }
                        }
                    }
                    else {  // для главного окна. По сути не нужно, но на будущее может понадобится
                        if (isArray) {
                            parsedData.forEach(fileInfo => {
                                onServerFileDrop(fileInfo); // без индекса
                            });
                        } else {
                            onServerFileDrop(parsedData);
                        }
                    }
                }
                return;
            } catch (err) {
                console.error('Ошибка при разборе JSON из Drag&Drop:', err);
            }
        }


        //const file = event.dataTransfer.files[0];
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const files = Array.from(event.dataTransfer.files); // изымаем массив перетаскиваемых файлов
            //const file = event.dataTransfer.files[0];// изымаем перетаскиваемый файл console.log("FILE", file);
            //onFileUpload(file, areaIndex);   // onFileUpload - проп-функция. Когда юзер отпускает файл, она вызывает handleFileUpload = async (file),
                                             // который находится в родителе и передает ему файл.
            files.forEach(file => {
                if (!isAllowedExtension(file.name)) {
                    if (onFileError) onFileError('Можно загружать только .docx файлы');
                    return;
                } //проверка чтобы это был файл ворда.

                if (onFileUpload) {
                    if (typeof areaIndex === "number") {
                        onFileUpload(file, areaIndex); // модальное окно с индексом зоны
                    } else {
                        onFileUpload(file); // главный интерфейс
                    }
                }
            });
        }
        /*if (file) {
            onFileUpload(file);
        }*/

    }; //аминь

    return (
        <div
            className={`drop-zone ${isDragging && !isInternalDragging.current ? 'dragging' : ''}`} // визуально не отображаем область если юзер таскает файл внутри зоны
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }} // дроп зон не виден, только добавляются доп стили если isDragging ? 'dragging'
            />
            {children}
        </div>
    );
});

export default DropZone;
