import React, { useState } from 'react';

function SignUp({ onSignUp, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: null,
    bio: '',
    expertiseLevel: 'beginner',
    skills: '',
    subjects: '',
    education: '',
    university: '',
    yearOfStudy: '',
    phone: '',
    whatsapp: '',
    linkedin: ''
  });
  const [imagePreview, setImagePreview] = useState('');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Prepare data for API call
      const signUpData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        profileImage: imagePreview || '',
        bio: formData.bio.trim(),
        expertiseLevel: formData.expertiseLevel,
        skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()) : [],
        subjects: formData.subjects ? formData.subjects.split(',').map(subject => subject.trim()) : [],
        education: formData.education.trim(),
        university: formData.university.trim(),
        yearOfStudy: formData.yearOfStudy.trim(),
        contactInfo: {
          phone: formData.phone.trim(),
          whatsapp: formData.whatsapp.trim(),
          linkedin: formData.linkedin.trim()
        }
      };

      // Make API call to register user
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful
      onSignUp(data);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
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
        <h1 style={{ animation: 'slideInUp 1s ease 0.2s both' }}>Join Peerpathy</h1>
        <p style={{ animation: 'slideInUp 1s ease 0.4s both' }}>
          Create your account and start connecting with peers
        </p>
        
        <div className="card" style={{ 
          maxWidth: '500px', 
          margin: '0 auto',
          animation: 'slideInUp 1s ease 0.6s both'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '24px', 
            color: '#333',
            animation: 'fadeIn 1s ease 0.8s both'
          }}>
            Create Account
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={errors.name ? 'error' : ''}
                  required
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              
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
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className={errors.password ? 'error' : ''}
                  required
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className={errors.confirmPassword ? 'error' : ''}
                  required
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profileImage">Profile Picture</label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    marginTop: '8px',
                    objectFit: 'cover',
                    border: '3px solid #667eea'
                  }} 
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows="3"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="expertiseLevel">Expertise Level</label>
                <select
                  id="expertiseLevel"
                  name="expertiseLevel"
                  value={formData.expertiseLevel}
                  onChange={handleInputChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="yearOfStudy">Year of Study</label>
                <input
                  type="text"
                  id="yearOfStudy"
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleInputChange}
                  placeholder="e.g., 2nd Year, Final Year"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="education">Education Level</label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder="e.g., Bachelor's, Master's"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="university">University/Institution</label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  placeholder="Your university name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="skills">Skills (comma-separated)</label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="e.g., JavaScript, Python, Design"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subjects">Subjects (comma-separated)</label>
              <input
                type="text"
                id="subjects"
                name="subjects"
                value={formData.subjects}
                onChange={handleInputChange}
                placeholder="e.g., Mathematics, Physics, Computer Science"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="whatsapp">WhatsApp</label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="WhatsApp number"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="linkedin">LinkedIn</label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="LinkedIn profile URL"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%',
                marginTop: '16px',
                position: 'relative'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading" style={{ marginRight: '8px' }}></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
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
              Already have an account?{' '}
              <button 
                onClick={onSwitchToLogin}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#667eea', 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  fontSize: 'inherit'
                }}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp; 