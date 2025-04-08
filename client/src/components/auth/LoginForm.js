import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import '../../styles/global.css';
const API_URL = process.env.REACT_APP_API_URL;

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, { //login
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                alert('Login successful!');
                navigate('/profile');
            } else {
                alert('Login failed!');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('An error occurred!');
        }
    };

    return (
        <div className="container">
            <h2 className="login__title">Вход</h2>
            <form className="login" onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login__input"
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login__input"
                    required
                />
                <button type="submit" className="login__button">Войти</button>
            </form>
            <p>
                Dont have an account? <a href="/register">Registration</a>
            </p>
        </div>
    );
};

export default LoginForm;
