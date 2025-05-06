import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfileSetup.css';
import '../../shared/styles/global.css';
import { createUser } from "../../entities/user/userModel";

const API_URL = process.env.REACT_APP_API_URL;
const PUBLIC_URL = process.env.PUBLIC_URL;



const ProfileSetup = () => {
    const [userData, setUserData] = useState(createUser({}));
    const [originalData, setOriginalData] = useState(null); // его текущие данные

    const [isLoading, setIsLoading] = useState(true); //флаг загрузки страницы
    const fileInputRef = useRef(null); //референс на DOM элемент, что я мог на картинку накинуть невидимы input file
    const [avatarFile, setAvatarFile] = useState(null); // тут картинка аватарки будет, если пользователь станет менять
    const [validationErrors, setValidationErrors] = useState([]); //ошибки
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/profile`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();

                const userEntity = createUser(data);
                setUserData(userEntity);
                setOriginalData(JSON.parse(JSON.stringify(userEntity)));

                setIsLoading(false);
            } else {
                console.error('Ошибка при получении данных профиля');
            }
        };
        fetchProfileData();
    }, []);

    useEffect(() => { // удаляем ссылки на картинки, которые пользователь заменил
        return () => {     // т.е. например он загрузил картинку, ему не зашло и он загрузил другую
            if (userData.profile_image?.startsWith?.('blob:')) { // вот мы и удаляем ссылку на предыдущую картинку
                URL.revokeObjectURL(userData.profile_image);
            }
        };
    }, [userData.profile_image]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        //console.log("START");

        const requiredFields = ['secondName', 'firstName', 'city', 'university', 'faculty', 'position']; //обязательные поля

        const emptyRequiredFields = requiredFields.filter(field => { // только для обязательных полей, добавляем значения которые true в конце этой небольшой функции
            const newValue = userData[field]?.trim(); // берем старые значения
            const oldValue = originalData[field]?.trim(); //новые значения

            const wasChanged = newValue !== oldValue; // проверяем изменилось ли поле

            return wasChanged && newValue === ''; // если поле изменено и стало пустым, это ошибка
        });

        if (emptyRequiredFields.length > 0) { // если тут чет есть, значит ошибка
            setValidationErrors(emptyRequiredFields);
            //console.log("STOP");
            return;
        }

        //console.log("START CHANGE");

        const token = localStorage.getItem('token');

        try {
            const hasTextChanges = Object.keys(userData).some( // смотрим изменились ли значения
                key => key !== 'profile_image' && userData[key] !== originalData[key]
            );

            if (hasTextChanges) { //если да то отправляем запрос на изменение
                //console.log("UPDATE USER TEXT DATA");
                const profileResponse = await axios.put(`${API_URL}/api/profile`, userData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                //alert(profileResponse.data.message);
                setOriginalData(JSON.parse(JSON.stringify(userData)));
            } else if (!avatarFile) {
                //alert("Нет изменений для сохранения.");
            }

            setAvatarFile(null);
        } catch (error) {
            console.error('Ошибка при сохранении профиля:', error);
            //alert('Ошибка при сохранении профиля');
        }

        if (avatarFile) {  // отдельный запрос для смены аватарки
            //console.log("UPDATE USER AVATAR");
            const formData = new FormData();
            formData.append('avatar', avatarFile);
            const avatarResponse = await axios.post(`${API_URL}/api/upload-avatar`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' }
            });

            setUserData(prev => ({
                ...prev,
                profile_image: avatarResponse.data.profile_image
            }));
        }
        navigate('/profile');
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatarFile(file);
        const previewUrl = URL.createObjectURL(file); // устанавлием ту самую ссылку, которую потом в случае чего чистим через useEffect выше
        setUserData(prev => ({
            ...prev,
            profile_image: previewUrl
        }));
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="container">
            <div className="setup-container">
                <div className="setup-wrapper">

                    <div className="setup-content">

                        <div className="left-side font-16">

                            <label>
                                Фамилия

                                     {/*<input type="text" name="second_name" value={userData.second_name} onChange={handleChange} />*/}
                                    {/*Фамилия:*/}
                                <div className="input-icon setup__input-wrapper">

                                    <input
                                        type="text"
                                        name="secondName"
                                        value={userData.secondName}
                                        onChange={handleChange}
                                        placeholder="Обязательное поле"
                                        className={validationErrors.includes('secondName') ? "input setup__input-error" : "input"} // для красного обозначения обязательных полей
                                            /*required*/
                                    />
                                </div>

                            </label>
                            <label>
                                Имя
                                <div className="input-icon setup__input-wrapper">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={userData.firstName}
                                        onChange={handleChange}
                                        placeholder="Обязательное поле"
                                        className={validationErrors.includes('firstName') ? "input setup__input-error" : "input"}
                                    />
                                </div>
                            </label>
                            <label>
                                Отчество
                                <div className="input-icon setup__input-wrapper">
                                    <input
                                        type="text"
                                        name="patronymic"
                                        value={userData.patronymic}
                                        onChange={handleChange}
                                    />
                                </div>
                            </label>
                            <label>
                                Город
                                <div className="input-icon setup__input-wrapper">
                                    <input
                                        type="text"
                                        name="city"
                                        value={userData.city}
                                        onChange={handleChange}
                                        placeholder="Обязательное поле"
                                        className={validationErrors.includes('city') ? "input setup__input-error" : "input"}
                                    />
                                </div>
                            </label>
                            <label>
                                Университет
                                <div className="input-icon setup__input-wrapper">
                                    <input
                                        type="text"
                                        name="university"
                                        value={userData.university}
                                        onChange={handleChange}
                                        placeholder="Обязательное поле"
                                        className={validationErrors.includes('university') ? "input setup__input-error" : "input"}
                                    />
                                </div>
                            </label>
                            <label>
                                Факультет
                                <div className="input-icon setup__input-wrapper">
                                    <input
                                        type="text"
                                        name="faculty"
                                        value={userData.faculty}
                                        onChange={handleChange}
                                        placeholder="Обязательное поле"
                                        className={validationErrors.includes('faculty') ? "input setup__input-error" : "input"}
                                    />
                                </div>
                            </label>
                            <label>
                                Должность
                                <div className="input-icon setup__input-wrapper">
                                    <input
                                        type="text"
                                        name="position"
                                        value={userData.position}
                                        onChange={handleChange}
                                        placeholder="Обязательное поле"
                                        className={validationErrors.includes('position') ? "input setup__input-error" : "input"}
                                    />
                                    {/*<span className={`required-hint ${validationErrors.includes('second_name') ? 'error' : ''}`}>
                                        Обязательное поле
                                    </span>*/}
                                </div>
                            </label>
                        </div>

                        <div className="right-side">
                            <div className="avatar-section">

                                <div className="avatar-wrapper" onClick={handleAvatarClick}>
                                    <img
                                        src={
                                            avatarFile
                                                ? URL.createObjectURL(avatarFile) // Локальный превью
                                                : userData.profile_image
                                                    ? `${API_URL}${userData.profile_image}` // С сервера
                                                    : '/icons/default_avatar.svg'
                                        }
                                        alt="Avatar"
                                        className="profile-image"
                                    />
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    <div className="avatar-overlay">
                                        <span className="avatar-overlay-text font-16">Нажмите, чтобы изменить</span>
                                    </div>

                                </div>

                                <img className="settings-icon" src={`${PUBLIC_URL}/icons/settings.svg`}/>

                            </div>
                            <div className="bio-button-section">
                                <label className="label-bio font-16">О себе:</label>
                                <textarea
                                    name="bio"
                                    value={userData.bio}
                                    onChange={handleChange}
                                    className="bio-textarea font-16"
                                />
                                <button className="button_st setup-button font-20" onClick={handleSave}>Сохранить</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
