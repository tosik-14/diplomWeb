import useSelectionStyles from "../model/useSelection/useSelection.module.css";
import {createCustomDragPreview} from "../../../shared/lib/dragPreview";
const PUBLIC_URL = process.env.PUBLIC_URL;

export const RenderFolders = ({
                                folders,
                                currentFolderId,
                                selectedAreaFolders,
                                lastSelectedFolder,
                                handleSelectItem,
                                goToFolder,
                            }) => {
    const filteredFolders = folders.filter(folder => folder.parent_id === currentFolderId);
    return (
        <>
            {filteredFolders.map(folder => {
                let folderClass = 'item';
                if (Array.isArray(selectedAreaFolders) && selectedAreaFolders.includes(folder.id)) {
                    /*setLastSelectedFolder(null);*/
                    folderClass += ` ${useSelectionStyles.selectedFolder}`;
                }
                if(lastSelectedFolder === folder.id) {
                    folderClass += ` ${useSelectionStyles.lastSelected}`;
                }
                return (
                    <div
                        key={folder.id}
                        id={folder.id}
                        className={folderClass}
                        /*onClick={() => handleSelectFolder(folder.id)}*/
                        onClick={(e) => {
                            const isCtrl = e.ctrlKey || e.metaKey;
                            handleSelectItem('folder', folder.id, isCtrl);
                        }}
                        onDoubleClick={() => goToFolder(folder.id)} >
                        <img
                            src={`${PUBLIC_URL}/icons/Folder.svg`}
                            alt={`${folder.name}`}
                            className="item-icon"
                            draggable={false}
                        />
                        <div className="item-name font-14">{folder.name}</div>
                    </div>
                )
            })}
        </>
    )

};