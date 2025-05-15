import React, { useState } from 'react';
import { getAdminData, updateUserRoles, deleteUsers } from "../api/adminPanelApi";
import {useNavigate} from "react-router-dom";


export const useAdminPanel = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [adminName, setAdminName] = useState('');

    const fetchAdminData = async () => {
        const token = localStorage.getItem('token');

        try {
            const data = await getAdminData(token);
            const current = data.currentUser;
            //console.log("CURRENT: ", current);

            const secondName = current.secondName || '';
            const firstInitial = current.firstName || '';
            const patronymicInitial = current.patronymic || '';

            setAdminName(`${secondName} ${firstInitial} ${patronymicInitial}`);

            setUsers(data.users);
        }catch (error) {
            if (error.status === 403) {// на случай если пользователь не админ или он забрал у себя статус админа
                navigate('/profile');
            } else {
                console.error('Ошибка при получении данных администратора');
            }
        }
    };

    const handleRoleUpdate = async (isAdminNew) => {  // обновляем статус юзера
        const token = localStorage.getItem('token');
        try {
            await updateUserRoles({
                token,
                userIds: selectedUserIds,
                isAdmin: isAdminNew,
            });
            await fetchAdminData();
            //console.log('UPDATED:', response.data);
            setSelectedUserIds([]); // очищаем выделение после обновления
        } catch (error) {
            console.error('Ошибка при обновлении ролей:', error);
        }
    };

    const deleteUser = async () => {
        if(selectedUserIds.length === 0){
            alert("Выберите пользователей");
            return;
        }
        try {
            const token = localStorage.getItem('token');

            await deleteUsers({ token, userIds: selectedUserIds });

            await fetchAdminData(); // обновляем список

            //console.log('UPDATED:', response.data);
            setSelectedUserIds([]); // очищаем выделение после обновления
        } catch (error) {
            console.error('Ошибка при удалении пользователей:', error);
        }
    };


    return {
        users,
        adminName,
        selectedUserIds,
        setSelectedUserIds,
        fetchAdminData,
        handleRoleUpdate,
        deleteUser,
    };

};