import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import DoubtPage from './components/DoubtPage';
import LocationPage from './components/LocationPage';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ProfilePage from './components/ProfilePage';

function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(true); // Start with signup page

  const handleLogin = (userData) => {
    setUser(userData.user);
    setIsLoggedIn(true);
    // Store token in localStorage
    localStorage.setItem('token', userData.token);
  };

  const handleSignUp = (userData) => {
    setUser(userData.user);
    setIsLoggedIn(true);
    // Store token in localStorage
    localStorage.setItem('token', userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    // Remove token from localStorage
    localStorage.removeItem('token');
  };

  const handleUpdateProfile = (updatedProfile) => {
    setUser(prev => ({ ...prev, ...updatedProfile }));
  };

  const switchToLogin = () => {
    setShowSignUp(false);
  };

  const switchToSignUp = () => {
    setShowSignUp(true);
  };

  return (
    <div className="App">
      <Header user={user} onLogout={handleLogout} />
      <Routes>
        <Route 
          path="/" 
          element={
            isLoggedIn ? (
              <Home user={user} />
            ) : showSignUp ? (
              <SignUp onSignUp={handleSignUp} onSwitchToLogin={switchToLogin} />
            ) : (
              <Login onLogin={handleLogin} onSwitchToSignUp={switchToSignUp} />
            )
          } 
        />
        <Route 
          path="/doubts" 
          element={
            isLoggedIn ? (
              <DoubtPage user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/location" 
          element={
            isLoggedIn ? (
              <LocationPage user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route
          path="/profile"
          element={
            isLoggedIn ? (
              <ProfilePage user={user} onUpdateProfile={handleUpdateProfile} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App; 