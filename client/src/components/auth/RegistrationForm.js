import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/global.css';
import './RegistrationForm.css';
const API_URL = process.env.REACT_APP_API_URL;

const RegistrationForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (response.ok) {
                alert('Registration successful!');
                navigate('/login');
            } else {
                alert('Registration failed!');
            }
        } catch (error) {
            console.error('Error registering:', error);
            alert('An error occurred!');
        }
    };

    return (
        <div className="container">
            <h2 className="registration__title">Регистрация</h2>
            <form className="registration" onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="registration__input"
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="registration__input"
                    required
                />
                <button type="submit" className="registration__button">Зарегистрироваться</button>
                <p>
                    Already have an account? <a href="/login">Login</a>
                </p>
            </form>
        </div>
    );
};

export default RegistrationForm;
