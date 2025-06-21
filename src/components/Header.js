import React from 'react';
import { Link } from 'react-router-dom';

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo">
            🎓 Peerpathy
          </Link>
          {user && (
            <div className="profile">
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <img 
                  src={user.profileImage || 'https://via.placeholder.com/40x40/667eea/ffffff?text=U'} 
                  alt={user.name}
                  className="profile-img"
                />
                <span className="profile-name">{user.name}</span>
              </Link>
              <button 
                onClick={onLogout} 
                className="btn btn-small"
                style={{ 
                  backgroundColor: '#f44336',
                  color: 'white',
                  marginLeft: '12px',
                  transition: 'all 0.3s ease'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header; 