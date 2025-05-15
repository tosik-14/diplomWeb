import React, { useState } from 'react';
import {validateFile, validateFileFromStorage} from "../api/ticketApi";


export const useTicketCreator = ({
                                     dropZoneFiles,
                                     setDropZoneFiles,
                                     dropAreasCount,
                                     setDropAreasCount,
                                     setEmptyInput,
                                     setEmptyInputMessage,
                                     setSeason,
                                 }) => {

    const [questionsPerType, setQuestionsPerType] = useState([2]); //количество вопросов в каждом типе

    const [fileError, setFileError] = useState(false);  // флаг ошибки
    const [fileErrorMessage, setFileErrorMessage] = useState(''); // текст ошибки, приходит из DropZone

    const handleFileUpload = async (file, areaIndex) => {  // если файл загружается с компьютера
        //console.log("DROP ZONE FILES ARRAY: ", dropZoneFiles[areaIndex]);
        if (dropZoneFiles[areaIndex]?.length >= 5) {
            setFileError(true);
            setFileErrorMessage(`Нельзя загрузить больше 5 файлов в одну зону.`);
            setTimeout(() => setFileError(false), 5000);
            return;
        }
        setDropZoneFiles(prev => { // сразу записываем файл в массив
            const newState = [...prev]; // копируется текущий массив дропзон
            newState[areaIndex] = [...newState[areaIndex], file];// добавляется в массив новый файл в формате { name: 'test.docx' }
            return newState;
        });

        const result = await validateFile(file); // отправляем файл серверу на проверку, если файл говно, то удаляем из массива

        if (!result.success) {
            setDropZoneFiles(prev => { // удаление файла из массива
                const newState = [...prev];
                newState[areaIndex] = newState[areaIndex].filter(f => f !== file);
                return newState;
            });

            setFileError(true);  // включаем отображение ошибки
            setFileErrorMessage(`Файл "${file.name}" не может быть использован: ${result.error}`);
            setTimeout(() => setFileError(false), 5000); // скрывает надпись через 5 сек
        }
    };

    const handleServerFileDrop = async (fileInfo, areaIndex) => {// если файл загружается с родительского окна
        if (dropZoneFiles[areaIndex]?.length >= 5) {
            setFileError(true);
            setFileErrorMessage(`Нельзя загрузить больше 5 файлов в одну зону.`);
            setTimeout(() => setFileError(false), 5000);
            return;
        }
        const result = await validateFileFromStorage(fileInfo.id);

        if (!result.success) {
            setFileError(true);
            setFileErrorMessage(`Файл "${fileInfo.name}" не может быть использован: ${result.error}`);
            setTimeout(() => setFileError(false), 5000); // скрывает надпись через 5 сек
            return;
        }

        setDropZoneFiles(prev => {
            const newState = [...prev]; // копируется текущий массив дропзон
            newState[areaIndex] = [...newState[areaIndex], fileInfo]; // добавляется в массив новый файл в формате { id: 42, name: 'test.docx' }
            return newState;
        });
    };

    const handleRemoveFile = (areaIndex, fileIndex) => { // удаление из области
        setDropZoneFiles(prev => {
            const updated = [...prev];// копируется текущий массив дропзон
            updated[areaIndex] = updated[areaIndex].filter((_, i) => i !== fileIndex); // сохраняем все кроме удаляемого
            return updated;
        });
    };


    const handleAddType = () => { // добавление нового типа вопросов(с проверкой не больше 5)
        setDropAreasCount((prevCount) => {
            if (prevCount < 5) {
                setQuestionsPerType((prev) => {
                    if (prev.length < prevCount + 1) {
                        return [...prev, 1];
                    }
                    return prev;
                });
                return prevCount + 1;
            }
            return prevCount;
        });
    };

    const handleRemoveType = (index) => { // удаление типа вопросов(с проверкой не меньше 1)
        setQuestionsPerType((prev) => prev.filter((_, i) => i !== index));
        setDropZoneFiles((prev) => prev.filter((_, i) => i !== index));
        setDropAreasCount((prev) => Math.max(prev - 1, 1));
    };

    const handleQuestionCountChange = (index, newValue) => { // проверка на правильность числа
        if (isNaN(newValue) || newValue < 1) return;

        setQuestionsPerType((prev) => {
            const updated = [...prev];
            updated[index] = newValue;
            return updated;
        });
    };

    const errorAlert = (message) => {
        setEmptyInput(true);  // включаем отображение ошибки
        setEmptyInputMessage(message);
        setTimeout(() => setEmptyInput(false), 5000); // скрывает надпись через 5 сек
    };


    const handleSetSeason = (season) => {
        setSeason(season);
    };


    return {
        dropZoneFiles,
        questionsPerType,
        handleFileUpload,
        handleServerFileDrop,
        handleRemoveFile,
        handleAddType,
        handleRemoveType,
        handleQuestionCountChange,
        errorAlert,
        handleSetSeason,
        fileError,
        fileErrorMessage,
        setFileErrorMessage,
        setFileError,
    };

};