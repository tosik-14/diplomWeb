import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/AdminPanel.css';
import '../../../shared/styles/global.css';
import { useAdminPanel } from "../model/useAdminPanel";
import { getAdminData, updateUserRoles, deleteUsers } from "../api/adminPanelApi";

const PUBLIC_URL = process.env.PUBLIC_URL;


const AdminPanel = () => {
    const navigate = useNavigate();
    const [expandedUserId, setExpandedUserId] = useState(null); // для доп данных пользователя

    const {
        users,
        adminName,
        selectedUserIds,
        setSelectedUserIds,
        fetchAdminData,
        handleRoleUpdate,
        deleteUser,
    } = useAdminPanel();

    useEffect(() => {
        fetchAdminData();
    }, []);

    const onBackToProfile = () => {
        navigate('/profile');
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
