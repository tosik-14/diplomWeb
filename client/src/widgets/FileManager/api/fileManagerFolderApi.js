import axios from "axios";
import { createFolder } from '../../../entities/FileManagerItems/folderModel';

const API_URL = process.env.REACT_APP_API_URL;

export async function apiCreateFolder(token, name, parentId) { //создание папки
    const response = await axios.post(`${API_URL}/api/folder`,
        { name, parentId },
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
    );
    return createFolder(response.data);//скорее всего ретурн я уберу
}

export async function renameFolder(token, folderId, newName, parentId) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const res = await axios.put(
        `${API_URL}/api/folder`,
        { folderId, newFolderName: newName, parentId },
        { headers }
    );

    return createFolder(res.data); //скорее всего ретурн я уберу
}

export async function deleteFolders(token, folderIds) { //удаление папки/папок
    const response = await axios.delete(`${API_URL}/api/folder`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        data: { folderIds },
    });
    return response.data; //скорее всего ретурн я уберу
}

export async function moveItems(token, folderIds = [], fileIds = [], targetFolderId) {
    const response = await fetch(`${API_URL}/api/folder/move`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            folderIds,
            fileIds,
            targetFolderId,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка перемещения элементов: ${errorText}`);
    }
}