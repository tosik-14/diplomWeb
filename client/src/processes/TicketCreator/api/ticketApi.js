import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;



export const validateFile = async (file) => { // проверка пригодности файла из компа
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    try {
        const res = await axios.post(`${API_URL}/api/tickets-create/validate`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
        });

        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Ошибка валидации' };
    }
};

export const validateFileFromStorage = async (id) => { // проверка пригодности файла из хранилища
    const token = localStorage.getItem('token');
    try {
        const res = await axios.post(`${API_URL}/api/tickets-create/validate-storage`, { id }, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Ошибка валидации' };
    }
};

export const createTickets = async (payload) => {
    const token = localStorage.getItem('token');

    const formData = new FormData();

    formData.append('ticketCount', payload.ticketCount);
    formData.append('fileName', payload.fileName);
    formData.append('university', payload.university);
    formData.append('faculty', payload.faculty);
    formData.append('discipline', payload.discipline);
    formData.append('department', payload.department);
    formData.append('headOfDepartment', payload.headOfDepartment);
    formData.append('userName', payload.userName);
    formData.append('userPosition', payload.userPosition);
    formData.append('ticketProtocol', payload.ticketProtocol);
    formData.append('season', payload.season);
    formData.append('sessionYears', payload.sessionYears);
    formData.append('approvalDate', payload.approvalDate);


    formData.append('questionsPerType', JSON.stringify(payload.questionsPerType)); // кол-во вопросов каждого типа
    formData.append('fileGroupCount', payload.dropZoneFiles.length); // количество типов вопросов. По сути можно обойтись без нее, но так безопаснее.

    payload.dropZoneFiles.forEach((group, groupIndex) => { // dropZoneFiles
        group.forEach((fileOrRef, i) => {

            if (fileOrRef instanceof File) { // файл, который пользователь загрузил с компа

                formData.append(`filesGroup${groupIndex}`, fileOrRef);

            } else { // файл, который пользователь взял из хранилища
                formData.append(`dbFilesGroup${groupIndex}`, JSON.stringify(fileOrRef));
            }
        });
    });

    const response = await axios.post( //понеслась
        `${API_URL}/api/tickets-create/create-tickets`,
        formData,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        }
    );

    return response.data;
};