  import React, { useState } from 'react';

function Login({ onLogin, onSwitchToSignUp }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Make API call to login user
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Login successful
      onLogin(data);
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: error.message || 'Login failed. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <div style={{ 
          fontSize: '4rem', 
          marginBottom: '20px',
          animation: 'bounceIn 1s ease'
        }}>
          🎓
        </div>
        <h1 style={{ animation: 'slideInUp 1s ease 0.2s both' }}>Welcome Back to Peerpathy</h1>
        <p style={{ animation: 'slideInUp 1s ease 0.4s both' }}>
          Sign in to continue your learning journey
        </p>
        
        <div className="card" style={{ 
          maxWidth: '400px', 
          margin: '0 auto',
          animation: 'slideInUp 1s ease 0.6s both'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '24px', 
            color: '#333',
            animation: 'fadeIn 1s ease 0.8s both'
          }}>
            Sign In
          </h2>
          
          {errors.general && (
            <div className="error-message" style={{ 
              backgroundColor: '#ffebee', 
              color: '#c62828', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              border: '1px solid #ffcdd2'
            }}>
              {errors.general}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
                required
                style={{ animation: 'slideInLeft 0.5s ease 1s both' }}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
                required
                style={{ animation: 'slideInLeft 0.5s ease 1.1s both' }}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%',
                animation: 'slideInUp 0.5s ease 1.3s both',
                position: 'relative'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading" style={{ marginRight: '8px' }}></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '24px', 
            paddingTop: '16px', 
            borderTop: '1px solid #eee' 
          }}>
            <p style={{ margin: '0', color: '#666' }}>
              Don't have an account?{' '}
              <button 
                onClick={onSwitchToSignUp}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#667eea', 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  fontSize: 'inherit'
                }}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 