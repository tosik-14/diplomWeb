import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegistrationForm from './components/auth/RegistrationForm';
import LoginForm from './components/auth/LoginForm';
import HomePage from './components/auth/HomePage';
import Profile from './components/profile/Profile';
import ProfileSetup from './components/profile/ProfileSetup';
import AdminPanel from "./components/admin/AdminPanel";

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/register" element={<RegistrationForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile-setup" element={<ProfileSetup />} />
                    <Route path="/admin-panel" element={<AdminPanel />} />
                    <Route path="/" element={<HomePage />} />

                </Routes>
            </div>
        </Router>
    );
}

export default App;



