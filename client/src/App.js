import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegistrationForm from './components/auth/RegistrationForm';
import LoginForm from './components/auth/LoginForm';
import Profile from './components/profile/Profile';

function App() {
    return (
        <Router>
            <div>
                <h1>Welcome to the Exam Ticket Creator</h1>
                <Routes>
                    <Route path="/register" element={<RegistrationForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/" element={<h2>Home Page</h2>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;



