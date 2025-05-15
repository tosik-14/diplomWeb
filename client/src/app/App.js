import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegistrationForm from '../pages/auth/RegistrationForm';
import LoginForm from '../pages/auth/LoginForm';
import HomePage from '../pages/homepages/HomePage';
import Profile from '../pages/profile/Profile';
import ProfileSetup from '../pages/profile/ProfileSetup';
import AdminPanel from "../pages/admin/ui/AdminPanel";

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



