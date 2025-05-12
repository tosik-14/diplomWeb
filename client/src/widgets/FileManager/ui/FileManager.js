import React, { useState, useRef } from 'react';

import '../styles/FileManager.css';
import '../../../shared/styles/global.css';

import useSelection from '../model/useSelection/useSelection';
import useSelectionStyles from '../model/useSelection/useSelection.module.css';




import { createCustomDragPreview } from '../../../shared/lib/dragPreview';

import UploadIcon from '../../../shared/icons/UploadIcon';
import DeleteIcon from "../../../shared/icons/DeleteIcon";
import BackArrowIcon from "../../../shared/icons/BackArrowIcon";
import ForwardArrowIcon from "../../../shared/icons/ForwardArrowIcon";
import FolderPathIcon from "../../../shared/icons/FolderPathIcon";
import CreateIcon from "../../../shared/icons/CreateIcon";
import RenameIcon from "../../../shared/icons/RenameIcon";
import MoveItemIcon from "../../../shared/icons/MoveItemIcon";
import PasteItemIcon from "../../../shared/icons/PasteItemIcon";
import DownloadIcon from "../../../shared/icons/DownloadIcon";

import {useFileManager} from "../model/useFileManager";

import NameInputModal from '../../../shared/ui/NameInputModal'; //ввод имени файла/папкуи
import {RenderFiles} from "./RenderFiles";
import {RenderFolders} from "./RenderFolders";
import {RenderPath} from "./RenderPath";
import DropZone from '../../../shared/lib/DropZone/DropZone';

const FileManager = ({ activeTab }) => {
    const dropZoneRef = useRef();  //ссылка на элемент страницы, которая будет использоваться как dropZone
    const isInternalDragging = useRef(false); // флаг, который срабатывает только когда файлы перетаскиваются внутри самой дропзоны

    const [folders, setFolders] = useState([]); // для хранения папок
    const [files, setFiles] = useState([]); // для хранения файлов

    const [lastSelectedFolder, setLastSelectedFolder] = useState(null); // последняя выделенная пользователем папка
    const [lastSelectedFile, setLastSelectedFile] = useState(null); // последний выделенный пользователем файл

    const [fileError, setFileError] = useState(false);  // флаг ошибки
    const [fileErrorMessage, setFileErrorMessage] = useState(''); // текст ошибки, приходит из DropZone

    const [showNameModal, setShowNameModal] = useState(false); // индикатор окна ввода имени

    const getRootFolderId = () => {
        const rootFolder = folders.find(folder => folder.name === (activeTab === 'questions' ? 'Themes' : 'Tickets')); //определяем корневую папку
        return rootFolder ? rootFolder.id : null; //возвращаем айди корневой папки или null если ее нет(на всякий, она должна быть всегда).
    };

    const { isSelecting, selectionArea, handleMouseDown, handleMouseUp, handleMouseMove, //логика для выделения папок и файлов с помощью выделяемой области
        selectedAreaFolders, setSelectedAreaFolders, selectedAreaFiles, setSelectedAreaFiles,
    } = useSelection(folders, setLastSelectedFolder, files, setLastSelectedFile);

    const {
        currentFolderId,
        pathTo,
        initialName,
        modalType,
        handleSelectItem,
        goToFolder,
        handleBack,
        handleForward,
        handleSaveName,
        handleCreateFolder,
        handleRename,
        handleDeleteItem,
        handleUploadFile,
        handleFileUpload,
        handleDownloadFile,
        handleMoveItem,
        handlePasteItem,
        handleTEST,

    } = useFileManager({
        activeTab,
        getRootFolderId,
        setShowNameModal,
        lastSelectedFolder, setLastSelectedFolder,
        lastSelectedFile, setLastSelectedFile,
        selectedAreaFolders, setSelectedAreaFolders, selectedAreaFiles, setSelectedAreaFiles,
        folders, setFolders,
        files, setFiles,
        dropZoneRef,
    });

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
                    <FolderPathIcon alt="Forward" className="toolbar-btn__icon" draggable={false}/>
                    <span>
                        <RenderPath
                            pathTo={pathTo}
                            activeTab={activeTab}
                            goToFolder={goToFolder}
                            folders={folders}
                            getRootFolderId={getRootFolderId}
                        />
                    </span>
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
                            className={useSelectionStyles.selectionBox}
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
                        <RenderFolders
                            folders={folders}
                            currentFolderId={getRootFolderId()}
                            selectedAreaFolders={selectedAreaFolders}
                            lastSelectedFolder={lastSelectedFolder}
                            handleSelectItem={handleSelectItem}
                            goToFolder={goToFolder}
                        /> :
                        <RenderFolders
                            folders={folders}
                            currentFolderId={currentFolderId}
                            selectedAreaFolders={selectedAreaFolders}
                            lastSelectedFolder={lastSelectedFolder}
                            handleSelectItem={handleSelectItem}
                            goToFolder={goToFolder}
                        />
                        /*renderFolders(getRootFolderId()) : // Если нет текущей папки, отображаем корневые папки
                        renderFolders(currentFolderId) // Иначе отображаем дочерние папки для текущей*/
                    }
                    {currentFolderId === null ?
                        <RenderFiles
                            files={files}
                            currentFolderId={getRootFolderId()}
                            selectedAreaFiles={selectedAreaFiles}
                            lastSelectedFile={lastSelectedFile}
                            handleSelectItem={handleSelectItem}
                            createCustomDragPreview={createCustomDragPreview}
                            isInternalDragging={isInternalDragging}
                        /> :
                        <RenderFiles
                            files={files}
                            currentFolderId={currentFolderId}
                            selectedAreaFiles={selectedAreaFiles}
                            lastSelectedFile={lastSelectedFile}
                            handleSelectItem={handleSelectItem}
                            createCustomDragPreview={createCustomDragPreview}
                            isInternalDragging={isInternalDragging}
                        />
                        /*renderFiles(getRootFolderId()) : // Если нет текущей папки, отображаем файлы из корневой папки
                        renderFiles(currentFolderId) // Иначе отображаем файлы текущей папки*/
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
