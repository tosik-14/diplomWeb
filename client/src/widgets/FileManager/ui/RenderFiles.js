import useSelectionStyles from "../model/useSelection/useSelection.module.css";
import {createCustomDragPreview} from "../../../shared/lib/dragPreview";
const PUBLIC_URL = process.env.PUBLIC_URL;

export const RenderFiles = ({
                                files,
                                currentFolderId,
                                selectedAreaFiles,
                                lastSelectedFile,
                                handleSelectItem,
                                createCustomDragPreview,
                                isInternalDragging,
                            }) => {
    const filteredFiles = files.filter(file => file.folderId === currentFolderId);
    return (
        <>
        {filteredFiles.map(file => {
            let fileClass = 'item';
            if (Array.isArray(selectedAreaFiles) && selectedAreaFiles.includes(file.id)) {
                fileClass += ` ${useSelectionStyles.selectedFolder}`;
            }
            if(lastSelectedFile === file.id) {
                fileClass += ` ${useSelectionStyles.lastSelected}`;
            }

            return (
                <div
                    key={file.id}
                    id={file.id}
                    className={fileClass}
                    draggable // делаем элемент перетягиваемым
                    onClick={(e) => {
                        const isCtrl = e.ctrlKey || e.metaKey;
                        handleSelectItem('file', file.id, isCtrl);
                    }}
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
                        src={`${PUBLIC_URL}/icons/files_icons/${file.getIconType()}`}
                        /*src={getFileIcon(file.fileName)}*/
                        alt={`${file.fileName}`}
                        className="item-icon"
                        draggable={false} //отключаем перетягивание самой иконки чтобы драгэндроп не пытался ее словить | upd: не помогло))

                    />
                    <div className="item-name font-14">{file.fileName}</div>
                </div>
            )
        })}
        </>
    )

};