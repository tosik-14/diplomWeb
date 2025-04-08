// DropZone.js
import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';

const DropZone = forwardRef(({ onFileUpload, children }, ref) => {
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
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();  // убираем стандартное поведение браузера
        setIsDragging(false); // индикатор, что идет перетаскивание
        const file = event.dataTransfer.files[0]; // изымаем перетаскиваемый файл
        if (file) {
            onFileUpload(file); // onFileUpload - проп-функция. Когда юзер отпускает файл, она вызывает handleFileUpload = async (file),
                                // который находится в родителе и передает ему файл.
        }

    };

    return (
        <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
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
