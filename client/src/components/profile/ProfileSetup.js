import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfileSetup.css';
import '../../styles/global.css';
const API_URL = process.env.REACT_APP_API_URL;
const PUBLIC_URL = process.env.PUBLIC_URL;



const ProfileSetup = () => {
    const [userData, setUserData] = useState({
        first_name: '',
        second_name: '',
        patronymic: '',
        faculty: '',
        position: '',
        bio: '',
        university: '',
        city: '',
        profile_image: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
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
                setUserData(data);
                setOriginalData(JSON.parse(JSON.stringify(data)));
                setIsLoading(false);
            } else {
                console.error('Ошибка при получении данных профиля');
            }
        };
        fetchProfileData();
    }, []);

    useEffect(() => {
        return () => {
            if (userData.profile_image?.startsWith?.('blob:')) {
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

        const requiredFields = ['second_name', 'first_name', 'city', 'university', 'faculty', 'position'];

        const emptyRequiredFields = requiredFields.filter(field => {
            const newValue = userData[field]?.trim();
            const oldValue = originalData[field]?.trim();

            // Проверяем ТОЛЬКО если значение было изменено
            const wasChanged = newValue !== oldValue;

            // Если поле изменено и стало пустым — ошибка
            return wasChanged && newValue === '';
        });

        if (emptyRequiredFields.length > 0) {
            setValidationErrors(emptyRequiredFields);
            console.log("STOP");
            return;
        }

        //console.log("START CHANGE");

        const token = localStorage.getItem('token');

        try {
            const hasTextChanges = Object.keys(userData).some(
                key => key !== 'profile_image' && userData[key] !== originalData[key]
            );

            if (hasTextChanges) {
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

        if (avatarFile) {
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
        const previewUrl = URL.createObjectURL(file);
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
                                        type="email"
                                        name="second_name"
                                        value={userData.secondName}
                                        onChange={handleChange}
                                        placeholder="Обязательное поле"
                                        className={validationErrors.includes('second_name') ? "input setup__input-error" : "input"}
                                            /*required*/
                                    />
                                </div>

                            </label>
                            <label>
                                Имя
                                <div className="input-icon setup__input-wrapper">
                                    <input
                                        type="email"
                                        name="first_name"
                                        value={userData.firstName}
                                        onChange={handleChange}
                                        placeholder="Обязательное поле"
                                        className={validationErrors.includes('second_name') ? "input setup__input-error" : "input"}
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
                                        className={validationErrors.includes('second_name') ? "input setup__input-error" : "input"}
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
                                        className={validationErrors.includes('second_name') ? "input setup__input-error" : "input"}
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
                                        className={validationErrors.includes('second_name') ? "input setup__input-error" : "input"}
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
                                        className={validationErrors.includes('second_name') ? "input setup__input-error" : "input"}
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
