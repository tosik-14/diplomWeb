import React, { useState, useEffect, useRef } from 'react';
/*import './Profile.css';*/
import './FileManager.css';
import '../../styles/global.css';
import useSelection from '../../hooks/useSelection';
import NameInputModal from './NameInputModal'; //ввод имени файла/папкуи
import DropZone from '../../utils/DropZone';
import { createCustomDragPreview } from '../../utils/dragPreview';
import axios from "axios";
import UploadIcon from '../icons/UploadIcon';
import DeleteIcon from "../icons/DeleteIcon";
import BackArrowIcon from "../icons/BackArrowIcon";
import ForwardArrowIcon from "../icons/ForwardArrowIcon";
import FolderPathIcon from "../icons/FolderPathIcon";
import CreateIcon from "../icons/CreateIcon";
import RenameIcon from "../icons/RenameIcon";
import MoveItemIcon from "../icons/MoveItemIcon";
import PasteItemIcon from "../icons/PasteItemIcon";
import DownloadIcon from "../icons/DownloadIcon";
import {data} from "react-router-dom";
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
        const fetchFolders = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_URL}/api/folder?parentId=null`, { //первичная загрузка папок(корневых)
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                //console.log("ACTIVETAB", activeTab);
                if (response.ok) {
                    const data = await response.json();
                    setFolders(data);
                    //console.log("RESPONSE DATA:", data);

                    const rootFolder = data.find(folder => folder.name === (activeTab === 'questions' ? 'Themes' : 'Tickets'));
                    //console.log("ROOTFOLDER: ", rootFolder, activeTab);

                    if (rootFolder) { // первичная загрузка папок(вложенных в корневую). Далее это будет делать handleFolderClick
                        const childResponse = await fetch(`${API_URL}/api/folder?parentId=${rootFolder.id}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });

                        if (childResponse.ok) {
                            const childFolders = await childResponse.json();
                            setFolders((prevFolders) => {
                                const existingIds = new Set(prevFolders.map(folder => folder.id));   // добавляем новые папки, не удаляя предыдущие
                                const uniqueFolders = childFolders.filter(folder => !existingIds.has(folder.id));
                                return [...prevFolders, ...uniqueFolders];
                            });
                            setIsLoadingFolders(false);
                            //console.log("CHILD FOLDERS:", childFolders);
                        } else {
                            console.error('Ошибка при получении вложенных папок');
                        }
                    }

                } else {
                    console.error('Ошибка при получении папок');
                }
            } catch (error) {
                console.error('Ошибка подключения к серверу:', error);
            }
        };

        fetchFolders();
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

    const handleSelectFolder = (folderId) => {  // последняя выделенная папка
        setLastSelectedFolder(folderId);
        setLastSelectedFile(null);
    };

    const handleSelectFile = (fileId) => {   //последний выделенный файл
        setLastSelectedFile(fileId);
        setLastSelectedFolder(null);
    };

    const fetchFiles = async (folderId) => {              // ||||||||||||||||||||| ЗАГРУЗКА ФАЙЛОВ
        if (folderId === null){ folderId = getRootFolderId(); }
        //console.log("FOLDER ID: ", folderId);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/file?parentId=${folderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                //setFiles(data);
                setFiles((prevFiles) => {
                    const existingIds = new Set(prevFiles.map(file => file.id));  // собираем id файлов которые уже есть в file
                    const uniqueFiles = data.filter(file => !existingIds.has(file.id));  // добавляем в file тока новые id
                    return [...prevFiles, ...uniqueFiles];
                });
            } else {
                console.error('не удалось получить файлы');
            }
        } catch (error) {
            console.error('ошибка подключения к серверу:', error);
        }
    };

    const handleFolderClick = async (folderId) => { // ЗАГРУЗКА ДОЧЕРНИХ ПАПОК
        try {
            //console.log("update folders handleFolderClick", folderId);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/folder?parentId=${folderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            //console.log("handleFolderClick", response);
            if (response.ok) {
                const data = await response.json();
                //console.log("handleFolderClick data", data);
                setFolders((prevFolders) => {
                    const existingIds = new Set(prevFolders.map(folder => folder.id));   // добавляем новые папки, не удаляя предыдущие
                    const uniqueFolders = data.filter(folder => !existingIds.has(folder.id));
                    return [...prevFolders, ...uniqueFolders];
                });
                //console.log("handleFolderClick folders", folders);
                setCurrentFolderId(folderId);
                await fetchFiles(folderId); // загружаем файлы

            } else {
                console.error('ошибка при получении вложенных папок');
            }
        } catch (error) {
            console.error('Не удалось подключится к серверу:', error);
        }
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

        axios.post(`${API_URL}/api/folder`,
            { name: folderName, parentId: parent_Id },
            {
                    headers: { 'Authorization': `Bearer ${token}`, }
            })
            .then(response => {
                setFolders((prevFolders) => [...prevFolders, { //обновляем массив folders
                    id: response.data.id,
                    name: folderName,
                    parent_id: parent_Id
                }]);

                handleFolderClick(parent_Id);
                //console.log("NEW FOLDER IN THE END:", folders);
            })
            .catch(error => {
                console.error("Ошибка при создании папки:", error);
                alert("Не удалось создать папку");
            });
    };

    const handleDeleteItem = async () => {
        //console.log("SELECTED AREA FOLDERS && LAST SELECTED FOLDER: ", selectedAreaFolders, lastSelectedFolder);
        const foldersToDelete = new Set(selectedAreaFolders);
        if (lastSelectedFolder) foldersToDelete.add(lastSelectedFolder);

        //console.log("SELECTED AREA FILES && LAST SELECTED FILE: ", selectedAreaFiles, lastSelectedFile);
        const filesToDelete = new Set(selectedAreaFiles);
        if (lastSelectedFile) filesToDelete.add(lastSelectedFile);

        if (foldersToDelete.size === 0 && filesToDelete.size === 0) {
            console.log("NO FILES OR FOLDERS TO DELETE.");
            return;
        }

        //console.log("FOLDERS TO DELETE AND FILES TO DELETE", foldersToDelete, filesToDelete);

        //console.log("FOLDER IDS", folderIds);

        const token = localStorage.getItem('token');
        try {
            if(foldersToDelete.size > 0) {
                const folderIds = Array.from(foldersToDelete);
                const response = await axios.delete(`${API_URL}/api/folder`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    data: { folderIds },
                })
                    .then(response =>{
                        setFolders((prevFolders) => prevFolders.filter(folder => !foldersToDelete.has(folder.id))
                        );
                        handleFolderClick(currentFolderId);
                        /*const result = response.data;
                        console.log(result.message);*/
                    })
                    .catch(error => {
                        console.error('Ошибка при удалении: ', error);
                    });
            }
            if(filesToDelete.size > 0) {
                const fileIds = Array.from(filesToDelete);
                //console.log("FILES IDS", fileIds);
                const response = await axios.delete(`${API_URL}/api/file`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    data: { fileIds },
                })
                    .then(response =>{
                        setFiles((prevFiles) => prevFiles.filter(file => !filesToDelete.has(file.id))
                        );
                        handleFolderClick(currentFolderId);
                        /*const result = response.data;
                        console.log(result.message);*/
                    })
                    .catch(error => {
                        console.error('Ошибка при удалении: ', error);
                    });
            }


            /*if (!response.ok) {
                throw new Error('Ошибка при удалении папок');
            }*/

            /*const result = await response.data;
            console.log(result.message);*/


            setSelectedAreaFolders([]);
            setSelectedAreaFiles([]);
            setLastSelectedFile(null);
            setLastSelectedFolder(null);
        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert('Не удалось удалить папки.');
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

        /*if (!lastSelectedFolder && !lastSelectedFile) {
            alert("выберите, что хотите переименовать");
            return;
        }

        const newName = prompt("введите имя");
        if (!newName) return;*/

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };

        try {
            if (lastSelectedFolder) {
                const folderId = lastSelectedFolder;
                const parentId = pathTo?.length ? pathTo[pathTo.length - 1] : getRootFolderId(); // чтобы проверить есть ли такие имена в папке

                await axios.put(
                    `${API_URL}/api/folder`,
                    { folderId, newFolderName: newName, parentId },
                    { headers }
                )
                    .then(()=>{
                        setFolders(prevFolders =>
                            prevFolders.map(folder =>
                                folder.id === folderId ? { ...folder, name: newName } : folder
                            )
                        );
                        handleFolderClick(currentFolderId); // обновим папку
                    })
                    .catch(error => {
                        console.error("ошибка при смене имени папки:", error);
                        alert("не удалось переименовать папку");
                    });
            }

            if (lastSelectedFile) {
                const fileId = lastSelectedFile;

                await axios.put(
                    `${API_URL}/api/file`,
                    { fileId, newFilename: newName },
                    { headers }
                )
                    .then(()=>{
                        setFiles(prevFiles =>
                            prevFiles.map(file =>
                                file.id === fileId ? { ...file, fileName: newName } : file
                            )
                        );
                        handleFolderClick(currentFolderId); // обновим папку
                    })
                    .catch(error => {
                        console.error("ошибка при смене имени файла:", error);
                        alert("не удалось переименовать файл");
                    });

            }


        } catch (error) {  // по сути можно удалить, но пускай пока будет
            console.error("ошибка при переименовании:", error);
            alert("не удалось переименовать элемент.");
        }
    };

    const handleUploadFile = () => { // вызывается при нажатии кнопки загрузить файл
        dropZoneRef.current?.openFileDialog(); // открывается окно для выбора файла
    };

    const handleFileUpload = async (file) => {
        console.log("FILE TO UPLOAD:", file);
        const token = localStorage.getItem('token');
        const parent_Id = pathTo?.length ? pathTo[pathTo.length - 1] : getRootFolderId();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('sectionId', parent_Id);
        //console.log("FORM DATA:", formData.file);
        try {
            const response = await axios.post(`${API_URL}/api/file`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then(response => {
                    setFiles((prevFiles) => [...prevFiles, response.data]);


                    handleFolderClick(parent_Id);

                    //console.log("NEW FOLDER IN THE END:", folders);
                })
                .catch(error => {
                    console.error("ошибка при загрузке файла:", error);
                    alert("не удалось загрузить файл");
                });

        } catch (error) {
            console.error('ошибка при загрузке файла:', error);
        }
    };

    const handleDownloadFile = async () => {
        const token = localStorage.getItem('token');
        const fileIds = selectedAreaFiles.length > 0 ? selectedAreaFiles : [lastSelectedFile];

        if (fileIds.length === 1) { //скачивание одного файла
            const fileId = fileIds[0];
            const downloadUrl = `${API_URL}/api/file/download?fileId=${fileId}`;

            const token = localStorage.getItem('token');

            const response = await axios.get(downloadUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob',  // получение файла в виде бинарных данных(тип ответа)
            });

            const disposition = response.headers['content-disposition'];
            let fileName = 'downloaded_file';
            //console.log("DISPOSITION", disposition);
            if (disposition) { // извлечение имени из заголовков
                const filenameStarMatch = disposition.match(/filename\*\=UTF-8''(.+?)(?:;|$)/); // должен включать filename*
                if (filenameStarMatch && filenameStarMatch[1]) {
                    fileName = decodeURIComponent(filenameStarMatch[1]); // раскодирование, пример: %D1%82 в т
                } else { // если filename* не включен. Это будет плохо для имени на русском
                    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
                    if (filenameMatch && filenameMatch[1]) {
                        fileName = filenameMatch[1];
                    }
                }
            }

            const blob = response.data; // ссылка на скачивание
            const link = document.createElement('a'); // создание 'a' элемента, который имитирует ссылку
            const url = window.URL.createObjectURL(blob); // создаем ссылку для 'a'
            link.href = url; // вносим в элемент 'a' ссылку
            link.setAttribute('download', fileName );  // указываем имя файла и то что его нужно скачать
            document.body.appendChild(link); //добавляем 'a' элемент
            link.click(); // имитируем клик по элементу
            document.body.removeChild(link); //удаляем 'a' элемент
            window.URL.revokeObjectURL(url);  // удаляем ссылку
        } else if (fileIds.length > 1) {

            // ну тут короче если файлов больше одного, то они скачиваются архивом

            const downloadUrl = `${API_URL}/api/file/download-archive`;
            const response = await axios.post(downloadUrl, { fileIds }, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob',
            });

            const archiveName = 'files.zip'; // имя архива статично


            const blob = new Blob([response.data]); // всё +- так же, как выше
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', archiveName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
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
            await axios.post(`${API_URL}/api/folder/move`, {
                folderIds: moveFolders,
                fileIds: moveFiles,
                targetFolderId: currentFolderId
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })

                .then(() => {
                    setFiles(prevFiles => prevFiles.filter(file => !moveFiles.includes(file.id)));
                    setFolders(prevFolders => prevFolders.filter(folder => !moveFolders.includes(folder.id)));

                    setMoveFiles([]);
                    setMoveFolders([]);
                    setIsMoveMode(false);
                    handleFolderClick(currentFolderId);
                })
                .catch(error => {
                    console.error('ошибка перемещения элементов:', error);
                    alert('не удалось переместить элементы');
                });
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
            .filter(file => file.sectionId === currentFolderId)
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
