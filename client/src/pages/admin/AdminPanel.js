import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';
import '../../shared/styles/global.css';
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const PUBLIC_URL = process.env.PUBLIC_URL;


const AdminPanel = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [adminName, setAdminName] = useState('');
    const [expandedUserId, setExpandedUserId] = useState(null); // для доп данных пользователя

    const fetchAdminData = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin-data`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (response.status === 403) { // на случай если пользователь не админ или он забрал у себя статус админа
            navigate('/profile');
            return;
        }

        if (response.ok) {
            const data = await response.json();
            //console.log("DATA: ", data);
            const current = data.currentUser;
            //console.log("CURRENT: ", current);

            const secondName = current.secondName || '';
            const firstInitial = current.firstName || ''; //?.[0] || '' конечно это тупо добавлять такую проверку для имени, но мне кажется ее стоит добавить
            //хотя тогда ее следует добавлять везде, иначе в ней нет смыла -_-    короче хз
            const patronymicInitial = current.patronymic || '';

            setAdminName(`${secondName} ${firstInitial} ${patronymicInitial}`);

            /*setAdminName(`${current.secondName} ${current.firstName[0]}.${current.patronymic[0]}.`);*/
            setUsers(data.users);
        } else {
            console.error('Ошибка при получении данных администратора');
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const onBackToProfile = () => {
        navigate('/profile');
    };

    const handleRoleUpdate = async (isAdminNew) => {  // обновляем статус юзера
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(
                `${API_URL}/api/update-roles`,
                {
                    userIds: selectedUserIds,
                    isAdmin: isAdminNew,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            ).then(() => {
                fetchAdminData();
            });

            //console.log('UPDATED:', response.data);
            setSelectedUserIds([]); // очищаем выделение после обновления
        } catch (error) {
            console.error('Ошибка при обновлении ролей:', error);
        }
    };

    const onSetAdmin = async () => {
        await handleRoleUpdate(true);
    };

    const onSetUser = async () => {
        //console.log("USERS", users);
        await handleRoleUpdate(false);
    };



    const handleCheckboxChange = (userId) => {
        setSelectedUserIds((prevSelected) =>
            prevSelected.includes(userId)
                ? prevSelected.filter((id) => id !== userId)
                : [...prevSelected, userId]
        );
        //console.log("SELECTED USERS:", selectedUserIds);
    };

    /*const toggleExpand = (userId) => {
        setExpandedUserId(prev => (prev === userId ? null : userId));
    };*/

    const deleteUser = async () => {
        if(selectedUserIds.length === 0){
            alert("Выберите пользователей");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/api/auth/delete-users`,{
                    data: { userIds: selectedUserIds },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            ).then(() => {
                fetchAdminData();
            });

            //console.log('UPDATED:', response.data);
            setSelectedUserIds([]); // очищаем выделение после обновления
        } catch (error) {
            console.error('Ошибка при удалении пользователей:', error);
        }
    };

    return (
        <div className="container">
            <div className="admin-container">

                <div className="admin-panel">
                    <div className="admin-panel__header">
                        <div className="admin-panel__title font-20">Админ: <span>{adminName}</span></div>
                        <button className="admin-panel__back button_st font-16" onClick={onBackToProfile}>Вернуться в профиль</button>
                    </div>

                    <div className="admin-panel-toolbar-btns">
                        <div className="admin-panel__controls">
                            <button className="admin-panel__btn font-16" onClick={onSetAdmin}>Set admin</button>
                            <button className="admin-panel__btn font-16" onClick={onSetUser}>Set user</button>
                        </div>

                        <button className="admin-panel__btn-icon" onClick={deleteUser}>
                            <img src={`${PUBLIC_URL}/icons/toolbar_btn/Delete.svg`} alt="close" />
                        </button>
                    </div>

                    <div className="admin-panel__table">
                        <div className="admin-panel__row admin-panel__row--header">
                            <div className="admin-panel__cell admin-panel__checkbox-cell"></div>
                            <div className="admin-panel__cell">Фамилия И.О.</div>
                            <div className="admin-panel__cell">Админ</div>
                            <div className="admin-panel__cell">Университет</div>
                            <div className="admin-panel__cell">Факультет</div>
                            <div className="admin-panel__cell">Должность</div>
                            <div className="admin-panel__cell">Город</div>
                        </div>
                        {users.map(user => (
                            <React.Fragment key={user.id}>
                                {expandedUserId === user.id ? (
                                    <div className="admin-panel__row-expanded">
                                        <div className="admin-panel__expanded-wrapper">
                                            <button onClick={() => setExpandedUserId(null)} className="admin-panel__close-expanded-content">
                                                <img src={`${PUBLIC_URL}/icons/close.svg`} alt="close" />
                                            </button>
                                            <div className="admin-panel__expanded-content">
                                                <div className="admin-panel__expanded-col">
                                                    <p><strong>ФИО:</strong> {user.secondName} {user.firstName} {user.patronymic || ''}</p>
                                                    <p><strong>Email:</strong> {user.email}</p>
                                                    <p><strong>Город:</strong> {user.city}</p>
                                                    <p><strong>Статус:</strong> {user.isAdmin ? 'Администратор' : 'Пользователь'}</p>
                                                </div>
                                                <div className="admin-panel__expanded-col">
                                                    <p><strong>Университет:</strong> {user.university}</p>
                                                    <p><strong>Факультет:</strong> {user.faculty}</p>
                                                    <p><strong>Должность:</strong> {user.position}</p>
                                                    <p><strong>Дата регистрации:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="admin-panel__row"
                                        onClick={() => setExpandedUserId(user.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="admin-panel__cell admin-panel__checkbox-cell">
                                            <input type="checkbox"
                                                   onClick={(e) => e.stopPropagation()}
                                                   checked={selectedUserIds.includes(user.id)}
                                                   onChange={() => handleCheckboxChange(user.id)}
                                            />
                                        </div>
                                        <div className="admin-panel__cell">
                                            {user.secondName} {user.firstName[0]}.{user.patronymic ? `${user.patronymic[0]}.` : ''}
                                        </div>
                                        <div className="admin-panel__cell admin-panel__cell-isAdmin">{user.isAdmin ? 'Да' : 'Нет'}</div>
                                        <div className="admin-panel__cell" title={user.university}>{user.university}</div>
                                        <div className="admin-panel__cell" title={user.faculty}>{user.faculty}</div>
                                        <div className="admin-panel__cell" title={user.position}>{user.position}</div>
                                        <div className="admin-panel__cell" title={user.city}>{user.city}</div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminPanel;
