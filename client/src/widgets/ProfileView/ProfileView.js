import { useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './ProfileView.css';
import '../../shared/styles/global.css';
import ThemeToggle from "../../shared/ui/ThemeToggle";
const API_URL = process.env.REACT_APP_API_URL;
const PUBLIC_URL = process.env.PUBLIC_URL;


const ProfileView = ({ user, onClose }) => {
    const nodeRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleOpenSetting = () => {
        navigate('/Profile-Setup');
    }

    const handleAdminPanel = () => {
        navigate('/admin-panel');
    }

    const handleLogOut = () => {
        localStorage.removeItem('token');
        Cookies.remove('token');
        navigate('/login');
    }

    return (
        <div className="profile-view__backdrop">
            <Draggable handle=".profile-view__header" nodeRef={nodeRef} bounds="parent">
                <div className="profile-view" ref={nodeRef}>

                    <div className="profile-view__header">
                        <div className="profile-view__title font-20">
                            Профиль
                        </div>

                        <button onClick={onClose} className="profile-view__close">
                            <img src={`${PUBLIC_URL}/icons/close_white.svg`} alt="close"/>
                        </button>
                    </div>

                    <div className="profile-view__body">
                        <div className="profile-view-main-info">

                            <div className="profile-view__left">
                                <img
                                    src={user.profile_image ? `${API_URL}${user.profile_image}` : `${PUBLIC_URL}/icons/default_avatar.svg`}
                                    alt="Avatar"
                                    className="profile-view__avatar"
                                />
                            </div>

                            <div className="profile-view__right">
                                <div className="profile-view__name">
                                    {user.secondName} {user.firstName} {user.patronymic}
                                </div>

                                <div className="profile-view__row">
                                    <div className="profile-view__label">Зарегистрировался:</div>
                                    <div className="profile-view__value">{new Date(user.created_at).toLocaleDateString()}</div>
                                </div>

                                <div className="profile-view__row">
                                    <div className="profile-view__label">Статус:</div>
                                    <div className="profile-view__value">{user.role === 'admin' ? 'Администратор' : 'Пользователь'}</div>
                                </div>

                                <div className="profile-view__row">
                                    <div className="profile-view__label">Город:</div>
                                    <div className="profile-view__value">{user.city}</div>
                                </div>

                                <div className="profile-view__row">
                                    <div className="profile-view__label">Университет:</div>
                                    <div className="profile-view__value">{user.university}</div>
                                </div>

                                <div className="profile-view__row">
                                    <div className="profile-view__label">Факультет:</div>
                                    <div className="profile-view__value">{user.faculty}</div>
                                </div>

                                <div className="profile-view__row">
                                    <div className="profile-view__label">Должность:</div>
                                    <div className="profile-view__value">{user.position}</div>
                                </div>
                            </div>

                        </div>

                        <div style={{ marginTop: '6px' }}>
                            <div className="profile-view__bio_label">О себе:</div>
                            <div className="profile-view__bio">{user.bio}</div>
                        </div>

                        <div className="profile-view__buttons">
                            <ThemeToggle className="button_st theme_toggle-btn profile-view__btn font-16"/>
                            <button onClick={handleLogOut} className="logout-btn profile-view__btn button_st font-16">Выйти</button>
                            {user.role === 'admin' && <button onClick={handleAdminPanel} className="profile-view__btn button_st font-16">Админ
                                <img src={`${PUBLIC_URL}/icons/settings_white.svg`} alt="Админ панель"/></button>}
                            <button onClick={handleOpenSetting} className="edit-btn profile-view__btn button_st font-16">Изменить
                                <img src={`${PUBLIC_URL}/icons/settings_white.svg`} alt="Изменить"/></button>
                        </div>
                    </div>
                </div>
            </Draggable>
        </div>
    );
};

export default ProfileView;
