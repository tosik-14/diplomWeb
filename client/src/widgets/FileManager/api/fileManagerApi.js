import { createFile } from '../../../entities/FileManagerItems/fileModel';
import { createFolder } from '../../../entities/FileManagerItems/folderModel';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

/*const axiosInstance = axios.create({ //дефолтный url, с которого начинается любой запрос тут
    baseURL: `${API_URL}/api`,
});

function getAuthHeaders(token) { //дефолтные заголовки
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}*/

export async function fetchFolders(token, parentId = null) {
    try {
        const response = await axios.get(`${API_URL}/api/folder`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: { parentId },
        });
        return response.data.map(createFolder);
    } catch (error) {
        console.error('Ошибка при получении папок:', error);
        throw new Error('Ошибка при получении папок');
    }
}

export async function fetchFilesInFolder(token, folderId) {
    try {
        const response = await axios.get(`${API_URL}/api/file`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: { parentId: folderId },
        });
        return response.data.map(createFile);
    } catch (error) {
        console.error('Ошибка при получении файлов:', error);
        throw new Error('Ошибка при получении файлов');
    }
}
