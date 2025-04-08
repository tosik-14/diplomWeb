import React, { useState, useEffect } from 'react';
import './Profile.css';
import '../../styles/global.css';
import FolderStructure from "./FolderStructure";
const API_URL = process.env.REACT_APP_API_URL;

const ProfilePage = () => {
    const [user, setUser] = useState({});
    const [activeTab, setActiveTab] = useState('questions'); // по дефолту выбранная кладка questions - Themes

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                console.error('Ошибка при получении данных профиля');
            }
        };

        fetchProfileData();
    }, []);

    return (
        <div className="container">
            <div className="profile">
                <div className="profile__header">
                    <div className="profile__avatar">
                        <img src={`${API_URL}${user.profile_image}`} alt="Avatar" />
                    </div>
                    <div className="profile__details">
                        <div className="profile__name">{user.name}</div>
                        <div className="profile__date-of-birth">Дата рождения: {user.date_of_birth}</div>
                        <div className="profile__city">{user.city}</div>
                        <div className="profile__university">{user.university}</div>
                        <div className="profile__faculty">{user.faculty}</div>
                        <div className="profile__position">{user.position}</div>
                    </div>
                    {user.role === 'admin' && <button className="profile__admin-btn">Админ</button>}
                </div>

                <div className="profile__bio">{user.bio}</div>

                {/* здесь отображаются вкладки, Themes или Tickets */}
                <div className="profile__tabs">
                    <button
                        className={`profile__tab ${activeTab === 'questions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('questions')}
                    >
                        Вопросы
                    </button>
                    <button
                        className={`profile__tab ${activeTab === 'tickets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tickets')}
                    >
                        Билеты
                    </button>
                </div>

                {/*тут самое главное - интерфейс для работы с папками и файлами FolderStructure*/}
                <div className="profile__content">
                    {activeTab === 'questions' && (
                        <div className="profile__files">
                            <FolderStructure  activeTab={activeTab}/>
                        </div>
                    )}
                    {activeTab === 'tickets' && (
                        <div className="profile__files">
                            <FolderStructure  activeTab={activeTab}/>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;