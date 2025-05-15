import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const getAdminData = async (token) => { // загружаем всех пользователей
    const response = await axios.get(`${API_URL}/api/admin-data`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};


export const updateUserRoles = async ({ token, userIds, isAdmin }) => {  //меняем роль
    const response = await axios.put(`${API_URL}/api/update-roles`,
        {
            userIds,
            isAdmin,
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const deleteUsers = async ({ token, userIds }) => {
    const response = await axios.delete(`${API_URL}/api/auth/delete-users`, {
        data: { userIds },
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};