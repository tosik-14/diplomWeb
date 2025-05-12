import axios from "axios";
import { createFile } from '../../../entities/FileManagerItems/fileModel';

const API_URL = process.env.REACT_APP_API_URL;

export async function renameFile(token, fileId, newName) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const res = await axios.put(
        `${API_URL}/api/file`,
        { fileId, newFilename: newName },
        { headers }
    );

    return createFile(res.data); //скорее всего ретурн я уберу
}

export async function deleteFiles(token, fileIds) { //удаление файла/файлов
    const response = await axios.delete(
        `${API_URL}/api/file`,
        {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        data: { fileIds },
    });
    return response.data; //скорее всего ретурн я уберу
}

export async function uploadFile(token, file, parentId) { //загрузить файл/файлы
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', parentId);

    const response = await axios.post(`${API_URL}/api/file`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });

    return createFile(response.data);
}


export async function downloadSingleFile(token, fileId) { //скачать 1 файл по айди
    const url = `${API_URL}/api/file/download?fileId=${fileId}`;

    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'];
    let fileName = 'downloaded_file';

    if (disposition) {// извлечение имени из заголовков
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

    return { blob: response.data, fileName };
}


export async function downloadArchive(token, fileIds) {//скачать более одного файла(архивом)
    const url = `${API_URL}/api/file/download-archive`;

    const response = await axios.post(url, { fileIds }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
    });

    return { blob: response.data, fileName: 'files.zip' };
}