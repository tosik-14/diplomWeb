import React, { useState, useEffect, useRef } from 'react';

import './FileManager.css';
import '../../shared/styles/global.css';
import useSelection from '../../shared/hooks/useSelection';
import NameInputModal from '../../shared/ui/NameInputModal'; //ввод имени файла/папкуи
import DropZone from '../../shared/lib/DropZone';
import { createCustomDragPreview } from '../../shared/lib/dragPreview';

import UploadIcon from '../../shared/icons/UploadIcon';
import DeleteIcon from "../../shared/icons/DeleteIcon";
import BackArrowIcon from "../../shared/icons/BackArrowIcon";
import ForwardArrowIcon from "../../shared/icons/ForwardArrowIcon";
import FolderPathIcon from "../../shared/icons/FolderPathIcon";
import CreateIcon from "../../shared/icons/CreateIcon";
import RenameIcon from "../../shared/icons/RenameIcon";
import MoveItemIcon from "../../shared/icons/MoveItemIcon";
import PasteItemIcon from "../../shared/icons/PasteItemIcon";
import DownloadIcon from "../../shared/icons/DownloadIcon";

import { fetchFolders, fetchFilesInFolder } from '../../shared/api/fileManagerApi';
import { apiCreateFolder, renameFolder, deleteFolders, moveItems } from './api/fileManagerFolderApi';
import { renameFile, deleteFiles, uploadFile, downloadSingleFile, downloadArchive } from './api/fileManagerFileApi';

const API_URL = process.env.REACT_APP_API_URL;
const PUBLIC_URL = process.env.PUBLIC_URL;


const FileManager = ({ activeTab }) => {
    const [folders, setFolders] = useState([]); // для хранения папок
    const [files, setFiles] = useState([]); // для хранения файлов
    const [isLoadingFolders, setIsLoadingFolders] = useState(true); // индикатор окончания первичной загрузки

    const [currentFolderId, setCurrentFolderId] = useState(null); // текущая папка, в которой находится пользователь
    const [pathTo, setPathTo] = useState([]);              // путь к текущей папке
    const [forwardPath, setForwardPath] = useState([]);  //путь до папки, которую пользователь покинул(для кнопки вперед)
    //const [selectedFolders, setSelectedFolders] = useState([]);
    const [lastSelectedFolder, setLastSelectedFolder] = useState(null); // последняя выделенная пользователем папка
    const [lastSelectedFile, setLastSelectedFile] = useState(null); // последний выделенный пользователем файл

    const { isSelecting, selectionArea, handleMouseDown, handleMouseUp, handleMouseMove, //логика для выделения папок и файлов с помощью выделяемой области
        selectedAreaFolders, setSelectedAreaFolders, selectedAreaFiles, setSelectedAreaFiles, } = useSelection(folders, setLastSelectedFolder, files, setLastSelectedFile);

    const [moveFiles, setMoveFiles] = useState([]); //файлы, которые пользователь хочет переместить
    const [moveFolders, setMoveFolders] = useState([]); //папки, которые пользователь намерен переместить
    const [isMoveMode, setIsMoveMode] = useState(false); //индикатор, показывающий, включен ли режим перемещения

    const dropZoneRef = useRef();  //ссылка на элемент страницы, которая будет использоваться как dropZone
    const isInternalDragging = useRef(false); // флаг, который срабатывает только когда файлы перетаскиваются внутри самой дропзоны
    const [fileError, setFileError] = useState(false);  // флаг ошибки
    const [fileErrorMessage, setFileErrorMessage] = useState(''); // текст ошибки, приходит из DropZone
    /*const [isSelecting, setIsSelecting] = useState(false);
    const [selectionArea, setSelectionArea] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });*/

    const [showNameModal, setShowNameModal] = useState(false); // индикатор окна ввода имени
    const [initialName, setInitialName] = useState(''); // старое имя файла.
    const [modalType, setModalType] = useState(null); // "rename" или "create" для переименования. Чтобы NameInputModal их различал



    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('token');
            const rootFolders = await fetchFolders(token, null);
            setFolders(rootFolders);

            const rootFolder = rootFolders.find(folder => folder.name === (activeTab === 'questions' ? 'Themes' : 'Tickets'));
            if (rootFolder) {
                const childFolders = await fetchFolders(token, rootFolder.id);
                setFolders(prev => {
                    const existingIds = new Set(prev.map(f => f.id));
                    return [...prev, ...childFolders.filter(f => !existingIds.has(f.id))];
                });
                setIsLoadingFolders(false);
            }
        };
        init();
    }, []);


    useEffect(() => {   // перерендер страницы в случае изменения currentFolderId и isLoadingFolders
        if(isLoadingFolders) return;
        const updateFolders = async () => {
            if(currentFolderId !== null){
                //console.log("update folders");
                await handleFolderClick(currentFolderId);
            } else {
                await handleFolderClick(getRootFolderId());
            }
        };
        updateFolders()
    }, [currentFolderId, isLoadingFolders]);

    const fetchFiles = async (folderId) => {              // ||||||||||||||||||||| ЗАГРУЗКА ФАЙЛОВ
        if (folderId === null){ folderId = getRootFolderId(); }
        //console.log("FOLDER ID: ", folderId);
        const token = localStorage.getItem('token');


        try {
            const files = await fetchFilesInFolder(token, folderId);
            setFiles((prevFiles) => {
                const existingIds = new Set(prevFiles.map(file => file.id));
                const uniqueFiles = files.filter(file => !existingIds.has(file.id));
                return [...prevFiles, ...uniqueFiles];
            });
        } catch (error) {
            console.error('ошибка подключения к серверу:', error);
        }
    };

    const handleFolderClick = async (folderId) => { // ЗАГРУЗКА ДОЧЕРНИХ ПАПОК
        const token = localStorage.getItem('token');
        try {

            const folders = await fetchFolders(token, folderId);
            //console.log("handleFolderClick data", data);
            setFolders((prevFolders) => {
                const existingIds = new Set(prevFolders.map(folder => folder.id));   // добавляем новые папки, не удаляя предыдущие
                const uniqueFolders = folders.filter(folder => !existingIds.has(folder.id));
                return [...prevFolders, ...uniqueFolders];
            });
            //console.log("handleFolderClick folders", folders);
            setCurrentFolderId(folderId);
            await fetchFiles(folderId); // загружаем файлы
            //console.log("update folders handleFolderClick", folderId);

            //console.log("handleFolderClick", response);

        } catch (error) {
            console.error('Не удалось подключится к серверу:', error);
        }
    };

    const handleSelectFolder = (folderId) => {  // последняя выделенная папка
        setLastSelectedFolder(folderId);
        setLastSelectedFile(null);
    };

    const handleSelectFile = (fileId) => {   //последний выделенный файл
        setLastSelectedFile(fileId);
        setLastSelectedFolder(null);
    };

    const getRootFolderId = () => {
        const rootFolder = folders.find(folder => folder.name === (activeTab === 'questions' ? 'Themes' : 'Tickets')); //определяем корневую папку
        return rootFolder ? rootFolder.id : null; //возвращаем айди корневой папки или null если ее нет(на всякий, она должна быть всегда).
    };

    const goToFolder = async (folderId) => {
        if(folderId !== currentFolderId){
            setSelectedAreaFolders([]); //убираем выделение
            setSelectedAreaFiles([]); //убираем выделение
            setForwardPath([]); // сбрасываем путь вперед
            const folderIndex = pathTo?.indexOf(folderId) ?? -1; //возвращаем индекс нужной папки в массиве pathTo в случае если она там есть. Иначе -1

            if(folderIndex !== -1){  // на случай перехода в папку посреди пути
                const newPathTo = (pathTo.slice(0, folderIndex+1)); //обрезаем путь назад до этой папки
                const newForwardPath = pathTo.slice(folderIndex + 1); //другую часть записываем в путь вперед
                setPathTo(newPathTo);
                setForwardPath(newForwardPath);
            }
            else if (folderId === getRootFolderId()) { // на случай перехода в корневую папку
                setForwardPath(pathTo); // записываем путь вперед как путь назад
                setPathTo([]);
            } else {

                if(currentFolderId){
                    setPathTo(prevPath => [...prevPath, folderId]); // добавляем к текущему пути папку в которую заходим
                    //console.log("PATH FOLDER", pathTo);                 // корневая папка в путь не записывается
                }
                else if (currentFolderId === null){ // это можно удалить, но на всякий случай пусть будет
                    setPathTo([]);             // путь начинается с корневой папки. Пример: корень -> папка1, я перешел в папка1, pathTo = []
                }
            }
            setCurrentFolderId(folderId);
            await handleFolderClick(folderId);
        }
        setLastSelectedFolder(null);
    };

    const handleBack = () => {
        if(pathTo.length > 0){
            const newPathTo = [...pathTo];
            newPathTo.pop();
            setForwardPath([currentFolderId, ...forwardPath]); // для кнопки вперед
            const previousFolder = newPathTo.length > 0 ? newPathTo[newPathTo.length - 1] : getRootFolderId(); //обычная или корневая папка?
            setPathTo(newPathTo);
            setCurrentFolderId(previousFolder);
            setLastSelectedFolder(null);
        } else{
            const rootFolderId = getRootFolderId();
            setCurrentFolderId(rootFolderId);  // корневая папка
            setPathTo([]);
        }
    };

    const handleForward = () => {
        if (forwardPath.length > 0) {

            const nextFolder = forwardPath[0]; //берем папку в которую переходим
            setPathTo([...pathTo, nextFolder]); //к пути назад добавляем папку в которую переходим
            setForwardPath(forwardPath.slice(1)); //берем всё кроме первой папки
            setCurrentFolderId(nextFolder);
            setLastSelectedFolder(null);
        } else {
            console.log("путь вперед закончен");
        }
    };

    const handleSaveName = (name) => {
        if (modalType === "create") {
            createNewFolder(name); // функция для создания папки
        } else if (modalType === "rename") {
            renameItem(name); // функция для переименования папки/файла
        }

        setShowNameModal(false);
    };

    const handleCreateFolder = () => {
        setInitialName("Новая папка");
        setModalType("create");
        setShowNameModal(true);
    };

    const createNewFolder = async (folderName) => {
        const token = localStorage.getItem('token');
        /*const folderName = prompt("Введите имя новой папки:");*/
        if (!folderName) return;
        const parent_Id = pathTo?.length ? pathTo[pathTo.length - 1] : getRootFolderId();

        try {
            await apiCreateFolder(token, folderName, parent_Id);
            await handleFolderClick(parent_Id);
        } catch (error){
            console.error("Ошибка при создании папки:", error);
            alert("Не удалось создать папку");
        }
    };

    const handleRename = () => {
        if (!lastSelectedFolder && !lastSelectedFile) {
            alert("выберите, что хотите переименовать"); //заменить на нормальное предупреждение, у всех кнопок.
            return;
        }

        const targetId = lastSelectedFolder || lastSelectedFile;
        const item = folders.find(f => f.id === targetId) || files.find(f => f.id === targetId);

        if (!item) return;

        setInitialName(item.name || item.fileName);
        setModalType("rename");
        setShowNameModal(true);
    };

    const renameItem = async (newName) => {
        const token = localStorage.getItem('token');

        try {
            if (lastSelectedFolder) {
                const folderId = lastSelectedFolder;
                const parentId = pathTo?.length ? pathTo[pathTo.length - 1] : getRootFolderId(); // чтобы проверить есть ли такие имена в папке

                try {
                    await renameFolder(token, folderId, newName, parentId);
                    setFolders(prevFolders =>
                        prevFolders.map(folder =>
                            folder.id === folderId ? { ...folder, name: newName } : folder
                        )
                    );
                    await handleFolderClick(currentFolderId);
                }catch (error) {
                    console.error("ошибка при смене имени папки:", error);
                    alert("не удалось переименовать папку");
                }
            }

            if (lastSelectedFile) {
                const fileId = lastSelectedFile;
                try {
                    await renameFile(token, fileId, newName);
                    setFiles(prevFiles =>
                        prevFiles.map(file =>
                            file.id === fileId ? { ...file, fileName: newName } : file
                        )
                    );
                    await handleFolderClick(currentFolderId); // обновим папку
                }catch (error) {
                    console.error("ошибка при смене имени файла:", error);
                    alert("не удалось переименовать файл");
                }
            }


        } catch (error) {  // по сути можно удалить, но пускай пока будет
            console.error("ошибка при переименовании:", error);
            alert("не удалось переименовать элемент.");
        }
    };

    const handleDeleteItem = async () => {
        const foldersToDelete = new Set(selectedAreaFolders);
        if (lastSelectedFolder) foldersToDelete.add(lastSelectedFolder);

        const filesToDelete = new Set(selectedAreaFiles);
        if (lastSelectedFile) filesToDelete.add(lastSelectedFile);

        if (foldersToDelete.size === 0 && filesToDelete.size === 0) {
            console.log("NO FILES OR FOLDERS TO DELETE.");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            if(foldersToDelete.size > 0) {
                const folderIds = Array.from(foldersToDelete);
                await deleteFolders(token, folderIds);
                setFolders((prevFolders) => prevFolders.filter(folder => !foldersToDelete.has(folder.id)));
            }
            if(filesToDelete.size > 0) {
                const fileIds = Array.from(filesToDelete);
                await deleteFiles(token, fileIds);
                setFiles((prevFiles) => prevFiles.filter(file => !filesToDelete.has(file.id)));
            }

            await handleFolderClick(currentFolderId);

            setSelectedAreaFolders([]);
            setSelectedAreaFiles([]);
            setLastSelectedFile(null);
            setLastSelectedFolder(null);
        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert('Не удалось удалить папки.');
        }
    };

    const handleUploadFile = () => { // вызывается при нажатии кнопки загрузить файл
        dropZoneRef.current?.openFileDialog(); // открывается окно для выбора файла
    };

    const handleFileUpload = async (file) => {
        const token = localStorage.getItem('token');
        const parent_Id = pathTo?.length ? pathTo[pathTo.length - 1] : getRootFolderId();
        try {
            const uploadedFile = uploadFile(token, file, parent_Id);
            setFiles((prevFiles) => [...prevFiles, uploadedFile]);
            await handleFolderClick(currentFolderId);
        } catch (error) {
            console.error('ошибка при загрузке файла:', error);
        }
    };

    const handleDownloadFile = async () => {
        const token = localStorage.getItem('token');
        const fileIds = selectedAreaFiles.length > 0 ? selectedAreaFiles : [lastSelectedFile];

        try {
            let blob, fileName; //blob - ссылка на скачивание. (бинарные данные: Binary Large Object)

            if(fileIds.length === 1) {
                const result = await downloadSingleFile(token, fileIds[0]);
                blob = result.blob;
                fileName = result.fileName;
            } else if (fileIds.length > 1) {
                const result = await downloadArchive(token, fileIds);
                blob = result.blob;
                fileName = result.fileName;
            }
            const url = window.URL.createObjectURL(blob); // создаем ссылку для 'a'
            const link = document.createElement('a'); // создание 'a' элемента, который имитирует ссылку
            link.href = url; // вносим в элемент 'a' ссылку
            link.setAttribute('download', fileName );  // указываем имя файла и то что его нужно скачать
            document.body.appendChild(link); //добавляем 'a' элемент
            link.click(); // имитируем клик по элементу
            document.body.removeChild(link); //удаляем 'a' элемент
            window.URL.revokeObjectURL(url);  // удаляем ссылку
        } catch (error) {
            console.error('ошибка при скачивании файла:', error);
        }
    };

    const handleMoveItem = () => {
        const filesToMove = selectedAreaFiles.length > 0 ? selectedAreaFiles : lastSelectedFile ? [lastSelectedFile] : [];
        const foldersToMove = selectedAreaFolders.length > 0 ? selectedAreaFolders : lastSelectedFolder ? [lastSelectedFolder] : [];

        if (filesToMove.length === 0 && foldersToMove.length === 0) return;

        setMoveFiles(filesToMove);
        setMoveFolders(foldersToMove);

        setIsMoveMode(true); // индикатор, что перемещение работает
    };

    const handlePasteItem = async () => {
        if (!isMoveMode || (moveFiles.length === 0 && moveFolders.length === 0)) return;
        if (moveFolders.includes(currentFolderId)) {
            alert('нельзя переместить папку внутрь себя');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await moveItems(token, moveFolders, moveFiles, currentFolderId);

            setFiles(prev => prev.filter(file => !moveFiles.includes(file.id)));
            setFolders(prev => prev.filter(folder => !moveFolders.includes(folder.id)));

            setMoveFiles([]);
            setMoveFolders([]);
            setIsMoveMode(false);
            await handleFolderClick(currentFolderId);
        } catch (e) {
            console.error('ошибка при перемещении, подключении:', e);
            alert('ошибка при перемещении элементов, ошибка подключения');
        }
    };

    const handleTEST = () => {
        //console.log("MOVE FILES AND MOVE FOLDERS: ", moveFiles, moveFolders);
        console.log("FILES: ", files);
        console.log("FOLDERS: ", folders);
        //console.log("CURRENT FOLDER ID: ", currentFolderId);
        //console.log("PATH TO: ", pathTo);
        //console.log("LAST SELECTED FILE: ", lastSelectedFile);
        //console.log("LAST SELECTED FOLDER: ", lastSelectedFolder);
        //.log("SELECTED AREA FOLDERS && LAST SELECTED FOLDER: ", selectedAreaFolders, lastSelectedFolder);
        //console.log("SELECTED AREA FOLDERS", selectedAreaFolders);
        //console.log("IS SELECTING", isSelecting);
    };


    const renderFolderPath = () => {
        if (!Array.isArray(pathTo) || pathTo.length === 0) { // на случай пустого пути
            return activeTab === 'questions' ? 'Themes' : 'Tickets';
        }

        const rootFolderName = activeTab === 'questions' ? 'Themes' : 'Tickets'; //определяем какую корневую папку рендерить
        const pathNames = [
            <span
                key="root"
                className="folder-path__item"
                onClick={() => goToFolder(getRootFolderId())}
                style={{ cursor: 'pointer' }}
            >
            {rootFolderName}
        </span>
        ];

        pathTo.forEach((folderId, index) => {  // отображаем весь путь pathTo
            const folder = folders.find(f => f.id === folderId);
            if (folder) {
                pathNames.push(
                    <span
                        key={folderId}
                        className="folder-path__item"
                        onClick={() => goToFolder(folderId)}
                        style={{ cursor: 'pointer' }}
                    >
                    {' / ' + folder.name}
                </span>
                );
            }
        });

        //console.log("PATH TO", pathTo);

        return pathNames;
    };

    const renderFolders = (parentId) => {
        //console.log("PARENT ID", parentId);
        return folders
            .filter(folder => folder.parent_id === parentId)
            .map(folder => {
                let folderClass = 'item';
                if (Array.isArray(selectedAreaFolders) && selectedAreaFolders.includes(folder.id)) {
                    /*setLastSelectedFolder(null);*/
                    folderClass += ' selected-folder';
                }
                if(lastSelectedFolder === folder.id) {
                    folderClass += ' last-selected';
                }
                return (
                    <div>
                        <div
                            key={folder.id}
                            id={folder.id}
                            className={folderClass}
                            onClick={() => handleSelectFolder(folder.id)}
                            onDoubleClick={() => goToFolder(folder.id)} >
                            <img
                                src={`${PUBLIC_URL}/icons/Folder.svg`}
                                alt={`${folder.name}`}
                                className="item-icon"
                                draggable={false}
                            />
                            <div className="item-name font-14">{folder.name}</div>
                        </div>
                    </div>
                )
            });
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();

        const iconMap = {
            docx: `${PUBLIC_URL}/icons/files_icons/DOCX.svg`,
            doc: `${PUBLIC_URL}/icons/files_icons/DOC.svg`,
            /*pdf: `${PUBLIC_URL}/icons/PDF.svg`,
            txt: `${PUBLIC_URL}/icons/TXT.svg`,*/  // на будущее мб
        };

        return iconMap[extension] || `${PUBLIC_URL}/icons/files_icons/unknown.svg`;
    };

    const renderFiles = (parentId) => {

        return files
            .filter(file => file.folderId === currentFolderId)
            .map(file => {
                let fileClass = 'item';
                if (Array.isArray(selectedAreaFiles) && selectedAreaFiles.includes(file.id)) {
                    fileClass += ' selected-folder';
                }
                if(lastSelectedFile === file.id) {
                    fileClass += ' last-selected';
                }

                return (
                    <div
                        key={file.id}
                        id={file.id}
                        className={fileClass}
                        draggable // делаем элемент перетягиваемым
                        onClick={() => handleSelectFile(file.id)}
                        onDragStart={(e) => {
                            isInternalDragging.current = true;

                            const draggedFileIds = selectedAreaFiles.length > 0
                                ? selectedAreaFiles
                                : [file.id]; // если выбран только один

                            const draggedFiles = files.filter(f => draggedFileIds.includes(f.id)).map(f => ({
                                id: f.id,
                                name: f.fileName,
                            }));

                            e.dataTransfer.setData('application/json', JSON.stringify(draggedFiles));

                            createCustomDragPreview(e, draggedFiles); // создается кастомная область для перетаскиваемых файлов.
                        }}
                        onDragEnd={() => {
                            isInternalDragging.current = false; // сбрасываем
                        }}
                    >
                        <img
                            /*src={`${PUBLIC_URL}/icons/DOCX.svg`}*/
                            src={getFileIcon(file.fileName)}
                            alt={`${file.fileName}`}
                            className="item-icon"
                            draggable={false} //отключаем перетягивание самой иконки чтобы драгэндроп не пытался ее словить | upd: не помогло))

                        />
                        <div className="item-name font-14">{file.fileName}</div>
                    </div>
                )
            });
    };

    return (
        <div className="profile__folders">
            <div className="folder-structure__toolbar">
                <button onClick={handleBack} className="toolbar-btn" title="Назад">
                    <BackArrowIcon className="toolbar-btn__icon"/>
                </button>
                <button onClick={handleForward} className="toolbar-btn" title="Вперед">
                    <ForwardArrowIcon className="toolbar-btn__icon" draggable={false}/>
                </button>
                <div className="folder-path" title="Путь">
                    <FolderPathIcon alt="Forward" className="toolbar-btn__icon" draggable={false}/><p>{renderFolderPath()}</p>
                </div>
                <button onClick={handleCreateFolder} className="toolbar-btn" title="Создать папку">
                    <CreateIcon alt="Create" className="toolbar-btn__icon" draggable={false}/>
                </button>
                <button onClick={handleDeleteItem} className="toolbar-btn" title="Удалить">
                    <DeleteIcon className="toolbar-btn__icon" />
                </button>
                <button onClick={handleRename} className="toolbar-btn" title="Переименовать">
                    <RenameIcon alt="Rename" className="toolbar-btn__icon" draggable={false}/>
                </button>


                <button onClick={handleMoveItem} className="toolbar-btn" title="Переместить">
                    <MoveItemIcon alt="Move" className="toolbar-btn__icon" draggable={false}/>
                </button>

                <button onClick={handlePasteItem} className="toolbar-btn" title="Вставить">
                    <PasteItemIcon alt="Paste" className="toolbar-btn__icon" draggable={false}/>
                </button>

                <button onClick={handleUploadFile} className="toolbar-btn" title="Загрузить">
                    <UploadIcon className="toolbar-btn__icon toolbar-icon-margin" /> Загрузить
                </button>


                <button onClick={handleDownloadFile} className="toolbar-btn" title="Скачать">
                    <DownloadIcon className="toolbar-btn__icon toolbar-icon-margin" /> Скачать
                </button>


                <button onClick={handleTEST} className="toolbar-btn">   TEST   </button>
            </div>
            {showNameModal && (   // переименовать или дать имя окно
                <NameInputModal
                    initialName={initialName}
                    isFile={modalType === "rename" && !!lastSelectedFile}
                    onClose={() => setShowNameModal(false)}
                    onSave={handleSaveName}
                />
            )}
            <DropZone
                ref={dropZoneRef}
                onFileUpload={handleFileUpload}
                isInternalDragging={isInternalDragging}
                onFileError={(message) => {
                    setFileError(true); // флаг ошибки
                    setFileErrorMessage(message); // устанавливает текст сообщения
                    setTimeout(() => setFileError(false), 5000); // скрывает надпись через 5 сек
                }}
            >
                <div className="folder-list font-14" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                    {isSelecting && (
                        <div
                            className="selection-box"
                            style={{
                                left: Math.min(selectionArea.startX, selectionArea.endX) + 'px',
                                top: Math.min(selectionArea.startY, selectionArea.endY) + 'px',
                                width: Math.abs(selectionArea.endX - selectionArea.startX) + 'px',
                                height: Math.abs(selectionArea.endY - selectionArea.startY) + 'px',
                            }}
                        >
                            {/*{`(${isSelecting}, ${selectionArea.startX}, ${selectionArea.startY}) -> (${selectionArea.endX}, ${selectionArea.endY})`}*/}
                            {/*<img src={`${PUBLIC_URL}/icons/rofl.svg`} alt="kupi_pzh" className="rofl"/>*/} {/*ну это мем чисто*/}
                        </div>
                    )}

                    {currentFolderId === null ?
                        renderFolders(getRootFolderId()) : // Если нет текущей папки, отображаем корневые папки
                        renderFolders(currentFolderId) // Иначе отображаем дочерние папки для текущей
                    }
                    {currentFolderId === null ?
                        renderFiles(getRootFolderId()) : // Если нет текущей папки, отображаем файлы из корневой папки
                        renderFiles(currentFolderId) // Иначе отображаем файлы текущей папки
                    }
                </div>
                {fileError && ( //сообщение об ошибке видно только пока флаг тру
                    <div className="file-manager-dropzone-error-message font-14">
                        {fileErrorMessage}
                    </div>
                )}

            </DropZone>
        </div>
    );
};

export default FileManager;
