import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/global.css';
/*import './RegistrationForm.css';*/
import './AuthForm.css';
const API_URL = process.env.REACT_APP_API_URL;

const RegistrationForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();



    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordError('Пароли не совпадают');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                /*alert('Registration successful!');*/
                navigate('/login');
                setEmailError('');
                setPasswordError('');
            } else {
                setEmailError(data.message || 'Произошла ошибка при регистрации');
            }
        } catch (error) {
            console.error('Error registering:', error);
            setEmailError('Ошибка подключения к серверу');
            /*alert('An error occurred!');*/
        }
    };

    return (
        <div className="container">
            <div className="container">

                <div className="auth__container">

                    <div className="auth__form-wrapper">

                        <h2 className="auth__title font-40">Регистрация</h2>

                        <form className="authorization" onSubmit={handleRegister}>

                            <div className="auth__inputs">

                                <div className="auth__input-wrapper">
                                    <label className="floating-label">Email</label>
                                    <div className="input-icon">
                                        <img src="/icons/login_page/login.svg" alt="email" width={21} height={21} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setEmailError('');
                                            }}
                                            className="registration__input"
                                            required
                                        />
                                    </div>
                                    {emailError && <div className="input-error">{emailError}</div>}
                                </div>

                                <div className="auth__input-wrapper">
                                    <label className="floating-label">Пароль</label>
                                    <div className="input-icon">
                                        <img src="/icons/login_page/lock.svg" alt="password" width={21} height={21} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setPasswordError('');
                                            }}
                                            className="registration__input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="auth__input-wrapper">
                                    <label className="floating-label">Подтвердите пароль</label>
                                    <div className="input-icon">
                                        <img src="/icons/login_page/lock.svg" alt="password" width={21} height={21} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setPasswordError('');
                                            }}
                                            className="registration__input"
                                            required
                                        />
                                    </div>
                                    {passwordError && <div className="input-error">{passwordError}</div>}
                                </div>

                            </div>

                            <button type="submit" className="auth__button button_st font-20">Зарегистрироваться</button>

                            <p className="auth__footer font-16">
                                Уже зарегистрированы? <a href="/login">Войти</a>
                            </p>
                        </form>
                    </div>

                </div>

            </div>





        </div>
    );
};

export default RegistrationForm;
