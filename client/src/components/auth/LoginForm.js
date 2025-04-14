import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';
import '../../styles/global.css';
const API_URL = process.env.REACT_APP_API_URL;

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, { //login
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                /*alert('Login successful!');*/
                if (rememberMe) {
                    document.cookie = `token=${data.token}; max-age=${60 * 60 * 24 * 30}; path=/`; //сохраняем токен в куки на 30 дней
                } else {
                    sessionStorage.setItem('token', data.token); // сохраняем локально, до закрытия вкладки
                }

                const userProfile = data.userProfile;
                //console.log("USER PROFILE da da da", userProfile);

                if (!userProfile || !userProfile.first_name || !userProfile.second_name || !userProfile.faculty || !userProfile.position || !userProfile.city) {
                    //console.log("COME TO PROFILE SETUP", userProfile);
                    navigate('/profile-setup'); // если обязательных данных нет, то пусть идет их заполнять
                } else {
                    console.log("COME TO PROFILE YES YES YES", userProfile);
                    navigate('/profile');
                }

                //navigate('/profile');
            } else {
                /*alert('Login failed!');*/
                setError(data.message || 'Произошла ошибка');

            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('An error occurred!');
            setError('Ошибка подключения к серверу');

        }
    };

    return (
        <div className="container">

            <div className="auth__container">

                <div className="auth__form-wrapper">

                    <h2 className="auth__title font-40">Вход</h2>

                    <form className="authorization" onSubmit={handleLogin}>

                        <div className="auth__inputs">

                            <div className="auth__input-wrapper">
                                <label className="floating-label">Email</label>
                                <div className="input-icon">
                                    <img src="/icons/login_page/login.svg" alt="email" width={21} height={21} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                {error && <div className="input-error font-14">{error}</div>}
                            </div>


                            <div className="auth__input-wrapper">
                                <label className="floating-label">Пароль</label>
                                <div className="input-icon">
                                    <img src="/icons/login_page/lock.svg" alt="password" width={21} height={21} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {error && <div className="input-error font-14">{error}</div>}
                            </div>

                        </div>

                        <div className="remember">
                            <input type="checkbox"
                                   id="remember"
                                   checked={rememberMe}
                                   onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="remember">Запомнить меня</label>
                        </div>

                        <button type="submit" className="auth__button button_st font-20">Войти</button>

                        <p className="auth__footer font-16">
                            Вы здесь впервые? <a href="/register">Зарегистрироваться</a>
                        </p>
                    </form>
                </div>

            </div>

        </div>
    );
};

export default LoginForm;
