import React, { useState, useEffect } from 'react';
import './Profile.css';
import '../../styles/global.css';
import ProfileView from './ProfileView';
import FileManager from "./FileManager";
const API_URL = process.env.REACT_APP_API_URL;
const PUBLIC_URL = process.env.PUBLIC_URL;

const ProfilePage = () => {
    const [user, setUser] = useState({});
    const [activeTab, setActiveTab] = useState('questions'); // по дефолту выбранная кладка questions - Themes
    const [showProfileView, setShowProfileView] = useState(false);

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
                //console.log("PATRONYMIC", data.patronymic);
                //console.log("USER DATA", data);
            } else {
                console.error('Ошибка при получении данных профиля');
            }
        };

        fetchProfileData();
    }, []);

    return (
        <div className="container">

            <div className="profile__container">

                <div className="profile">
                    <div className="profile__header">

                        <button className="profile__info-button" onClick={() => setShowProfileView(true)}>

                            <div className="profile__avatar">
                                <img
                                    src={user.profile_image ? `${API_URL}${user.profile_image}` : `${PUBLIC_URL}/icons/default_avatar.svg`}
                                    alt="Avatar"
                                />
                            </div>

                            <div className="profile__info-button-wrapper">
                                <div className="profile__name font-20">{user.secondName} {user.firstName} {user.patronymic}</div>
                                <div className="profile__bio font-16">{user.bio}</div>
                            </div>


                        </button>

                        <button className="button_st font-16 profile__create-button">Создать билеты</button>

                    </div>


                    {showProfileView && <ProfileView user={user} onClose={() => setShowProfileView(false)} />}



                    {/* здесь отображаются вкладки, Themes или Tickets */}
                    <div className="profile__tabs font-16">
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

                    {/*тут самое главное - интерфейс для работы с папками и файлами FileManager*/}
                    <div className="profile__content">
                        {activeTab === 'questions' && (
                            <div className="profile__files">
                                <FileManager activeTab={activeTab}/>
                            </div>
                        )}
                        {activeTab === 'tickets' && (
                            <div className="profile__files">
                                <FileManager activeTab={activeTab}/>
                            </div>
                        )}
                    </div>

                </div>

            </div>

        </div>
    );
};

export default ProfilePage;