import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import '../../shared/styles/global.css';
import ProfileView from '../../widgets/ProfileView/ProfileView';
import FileManager from "../../widgets/FileManager/ui/FileManager";
import TicketCreator from "../../processes/TicketCreator/ui/TicketCreator";
import {createUser} from "../../entities/user/userModel";
import { useLocation } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;
const PUBLIC_URL = process.env.PUBLIC_URL;

const ProfilePage = () => {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState({});

    const location = useLocation(); //сюда будет передаваться ключ на изменение activeTab
    const [fileManagerKey, setFileManagerKey] = useState(0); // для перерендера файл менеджера, чтобы он отобразил новую папку.
    const [activeTab, setActiveTab] = useState('questions'); // по дефолту выбранная кладка questions - Themes

    const [showProfileView, setShowProfileView] = useState(false);
    const [showTicketCreator, setShowTicketCreator] = useState(false);

    useEffect(() => { // принимает значение activeTab из другого компонента
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
            setFileManagerKey(prev => prev + 1);
        }
    }, [location.state]);

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
                const userEntity = createUser(data);
                setUser(userEntity);

                if(!userEntity.isComplete()) navigate('/profile-setup');
                //console.log("PATRONYMIC", data.patronymic);
                //console.log("USER DATA", data);
                setIsLoading(true);
            } else {
                console.error('Ошибка при получении данных профиля');
            }
        };

        fetchProfileData();
    }, []);

    if (!isLoading) {
        return <div>Загрузка...</div>;
    }

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

                        <button className="button_st font-16 profile__create-button" onClick={() => setShowTicketCreator(true)}>Создать билеты</button>

                    </div>


                    {showProfileView && <ProfileView user={user} onClose={() => setShowProfileView(false)} />}
                    {/*{showTicketCreator && <TicketCreator user={user} onClose={() => setShowTicketCreator(false)} />}*/}
                    {isLoading &&  (
                        <TicketCreator   //непосредственно окно создания билетов ооо дааа
                            user={user}
                            visible={showTicketCreator}
                            onClose={() => setShowTicketCreator(false)}
                        />
                    )}




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
                                <FileManager activeTab={activeTab} key={fileManagerKey}/>
                            </div>
                        )}
                        {activeTab === 'tickets' && (
                            <div className="profile__files">
                                <FileManager activeTab={activeTab}  key={fileManagerKey}/>
                            </div>
                        )}
                    </div>

                </div>

            </div>

        </div>
    );
};

export default ProfilePage;