import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ProfilePage({ user, onUpdateProfile }) {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    expertiseLevel: user?.expertiseLevel || 'beginner',
    subjects: user?.subjects || [],
    education: user?.education || '',
    university: user?.university || '',
    yearOfStudy: user?.yearOfStudy || '',
    contactInfo: user?.contactInfo || {
      phone: '',
      whatsapp: '',
      linkedin: ''
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const skillOptions = [
    'Web Development', 'Data Science', 'Machine Learning', 'Mobile Development',
    'UI/UX Design', 'DevOps', 'Cybersecurity', 'Blockchain', 'Cloud Computing',
    'Artificial Intelligence', 'Database Management', 'Software Testing',
    'Game Development', 'Network Administration', 'Digital Marketing'
  ];

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Economics', 'Psychology', 'Engineering',
    'Medicine', 'Law', 'Business', 'Arts', 'Literature'
  ];

  const expertiseLevels = [
    { value: 'beginner', label: 'Beginner', color: '#4CAF50' },
    { value: 'intermediate', label: 'Intermediate', color: '#FF9800' },
    { value: 'advanced', label: 'Advanced', color: '#F44336' },
    { value: 'expert', label: 'Expert', color: '#9C27B0' }
  ];

  useEffect(() => {
    if (user?._id) {
      fetchUserAnalytics();
    }
  }, [user?._id]);

  const fetchUserAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/analytics`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [name]: value
      }
    }));
  };

  const addSkill = () => {
    if (newSkill && !profile.skills.includes(newSkill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addSubject = () => {
    if (newSubject && !profile.subjects.includes(newSubject)) {
      setProfile(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject]
      }));
      setNewSubject('');
    }
  };

  const removeSubject = (subjectToRemove) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subject => subject !== subjectToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would typically make an API call to update the profile
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onUpdateProfile) {
        onUpdateProfile(profile);
      }
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getExpertiseColor = (level) => {
    const expertise = expertiseLevels.find(exp => exp.value === level);
    return expertise ? expertise.color : '#666';
  };

  const getExpertiseLabel = (level) => {
    const expertise = expertiseLevels.find(exp => exp.value === level);
    return expertise ? expertise.label : 'Unknown';
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      flex: 1
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '1.2rem' }}>{value}</h3>
      <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{title}</p>
    </div>
  );

  const ProgressBar = ({ percentage, color }) => (
    <div style={{
      width: '100%',
      height: '8px',
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '8px'
    }}>
      <div style={{
        width: `${percentage}%`,
        height: '100%',
        backgroundColor: color,
        transition: 'width 0.3s ease'
      }} />
    </div>
  );

  if (isLoading) {
    return (
      <div className="container">
        <div style={{ 
          padding: '40px 0',
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease'
        }}>
          <div className="loading" style={{ 
            width: '50px', 
            height: '50px', 
            margin: '0 auto 20px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white'
          }}></div>
          <p style={{ color: 'white', fontSize: '18px' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ padding: '40px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', animation: 'slideInDown 0.6s ease' }}>
          <h1 style={{ color: 'white', margin: 0 }}>👤 Profile</h1>
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className="btn btn-secondary"
            style={{ animation: isEditing ? 'pulse 0.5s ease' : 'none' }}
          >
            {isEditing ? 'Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        {/* Statistics Section */}
        {analytics && (
          <div className="card" style={{ marginBottom: '30px', animation: 'slideInRight 0.6s ease 0.1s both' }}>
            <h2 style={{ color: '#667eea', marginBottom: '20px' }}>📊 Your Statistics</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <StatCard 
                title="Doubts Asked" 
                value={analytics.totalDoubts} 
                icon="❓" 
                color="#667eea"
              />
              <StatCard 
                title="Doubts Solved" 
                value={user?.doubtsSolved || 0} 
                icon="✅" 
                color="#4CAF50"
              />
              <StatCard 
                title="Total Views" 
                value={analytics.totalViews} 
                icon="👁️" 
                color="#FF9800"
              />
              <StatCard 
                title="Success Rate" 
                value={`${analytics.successRate}%`} 
                icon="📈" 
                color="#9C27B0"
              />
            </div>

            {/* Subject Performance */}
            {analytics.subjectStats && analytics.subjectStats.length > 0 && (
              <div style={{ marginBottom: '30px', animation: 'slideInRight 0.6s ease 0.2s both' }}>
                <h3 style={{ color: '#333', marginBottom: '16px' }}>Subject Performance</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {analytics.subjectStats.map(subject => (
                    <div key={subject._id} style={{ animation: `fadeIn 0.5s ease ${subject._id.charCodeAt(0) * 0.1}s both` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', color: '#333' }}>{subject._id}</span>
                        <span style={{ color: '#666' }}>{subject.count} doubts • {subject.totalViews} views</span>
                      </div>
                      <ProgressBar 
                        percentage={(subject.count / Math.max(...analytics.subjectStats.map(s => s.count))) * 100} 
                        color="#667eea"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Activity */}
            {analytics.weeklyActivity && (
              <div style={{ animation: 'slideInRight 0.6s ease 0.3s both' }}>
                <h3 style={{ color: '#333', marginBottom: '16px' }}>Weekly Activity</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                  {analytics.weeklyActivity.map((week, index) => (
                    <div key={index} style={{
                      background: '#f8f9fa',
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      animation: `fadeIn 0.5s ease ${index * 0.1}s both`
                    }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{week.week}</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                        {week.doubts + week.responses}
                      </div>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        {week.doubts}D {week.responses}R
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: '1fr 2fr' }}>
          {/* Profile Card */}
          <div className="card" style={{ animation: 'slideInLeft 0.6s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <img 
                src={user?.profileImage || 'https://via.placeholder.com/100x100/667eea/ffffff?text=U'} 
                alt={profile.name}
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #667eea',
                  marginBottom: '16px',
                  transition: 'all 0.3s ease',
                  animation: 'bounceIn 1s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
              <h2 style={{ color: '#333', marginBottom: '8px' }}>{profile.name}</h2>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '20px' }}>⭐</span>
                <span style={{ fontWeight: '600', color: '#333' }}>{analytics?.rating}</span>
                <span style={{ color: '#666', fontSize: '14px' }}>({analytics?.reviews} reviews)</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                textAlign: 'center', 
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                animation: 'fadeIn 0.5s ease 0.2s both'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                  {analytics?.totalDoubts}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Doubts Asked</div>
              </div>
              <div style={{ 
                textAlign: 'center', 
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                animation: 'fadeIn 0.5s ease 0.3s both'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {user?.doubtsSolved || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Doubts Solved</div>
              </div>
              <div style={{ 
                textAlign: 'center', 
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                animation: 'fadeIn 0.5s ease 0.4s both'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
                  {analytics?.totalViews}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total Views</div>
              </div>
              <div style={{ 
                textAlign: 'center', 
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                animation: 'fadeIn 0.5s ease 0.5s both'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>
                  {Math.round((user?.doubtsSolved || 0 / analytics?.totalDoubts) * 100)}%
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Success Rate</div>
              </div>
            </div>

            {isEditing && (
              <button 
                onClick={handleSubmit}
                className="btn btn-primary"
                style={{ width: '100%', position: 'relative' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading" style={{ marginRight: '8px' }}></span>
                    Saving...
                  </>
                ) : (
                  '💾 Save Changes'
                )}
              </button>
            )}
          </div>

          {/* Profile Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Bio Section */}
            <div className="card" style={{ animation: 'slideInRight 0.6s ease 0.1s both' }}>
              <h3 style={{ marginBottom: '16px', color: '#333' }}>📝 Bio</h3>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  rows="3"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e1e5e9' }}
                />
              ) : (
                <p style={{ color: '#666', lineHeight: '1.6' }}>{profile.bio}</p>
              )}
            </div>

            {/* Skills Section */}
            <div className="card" style={{ animation: 'slideInRight 0.6s ease 0.2s both' }}>
              <h3 style={{ marginBottom: '16px', color: '#333' }}>🛠️ Skills</h3>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {profile.skills.map((skill, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...profile.skills];
                          newSkills[index] = e.target.value;
                          setProfile(prev => ({
                            ...prev,
                            skills: newSkills
                          }));
                        }}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                      />
                      <button 
                        onClick={() => removeSkill(skill)}
                        style={{ 
                          padding: '8px 12px', 
                          backgroundColor: '#f44336', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setNewSkill('')}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#4CAF50', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      alignSelf: 'flex-start'
                    }}
                  >
                    + Add Skill
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.skills.map((skill, index) => (
                    <span 
                      key={index}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '14px',
                        animation: `fadeIn 0.5s ease ${index * 0.1}s both`
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Expertise & Education */}
            <div className="card" style={{ animation: 'slideInRight 0.6s ease 0.3s both' }}>
              <h3 style={{ marginBottom: '16px', color: '#333' }}>🎓 Education & Expertise</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                    Expertise Level
                  </label>
                  {isEditing ? (
                    <select
                      name="expertiseLevel"
                      value={profile.expertiseLevel}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                    >
                      {expertiseLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span style={{
                      padding: '6px 12px',
                      backgroundColor: getExpertiseColor(profile.expertiseLevel),
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {getExpertiseLabel(profile.expertiseLevel)}
                    </span>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                    Field of Study
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="education"
                      value={profile.education}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                    />
                  ) : (
                    <p style={{ color: '#666' }}>{profile.education}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card" style={{ animation: 'slideInRight 0.6s ease 0.4s both' }}>
              <h3 style={{ marginBottom: '16px', color: '#333' }}>📞 Contact Information</h3>
              {isEditing ? (
                <input
                  type="text"
                  name="contactInfo"
                  value={profile.contactInfo.phone}
                  onChange={handleContactChange}
                  placeholder="Phone number"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                />
              ) : (
                <p style={{ color: '#666' }}>{profile.contactInfo.phone}</p>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/" className="btn btn-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage; 