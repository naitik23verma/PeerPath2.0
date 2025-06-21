import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function DoubtPage({ user }) {
  const [doubts, setDoubts] = useState([
    {
      id: 1,
      subject: 'Mathematics',
      title: 'Calculus Integration Problem',
      description: 'I\'m stuck on this integration problem. Can anyone help me understand the steps?',
      author: 'Alex Johnson',
      authorImage: 'https://via.placeholder.com/40x40/667eea/ffffff?text=A',
      timestamp: '2 hours ago',
      responses: 3,
      views: 45,
      authorProfile: {
        bio: 'Math enthusiast and problem solver',
        expertiseLevel: 'expert',
        skills: ['Calculus', 'Linear Algebra', 'Statistics']
      }
    },
    {
      id: 2,
      subject: 'Physics',
      title: 'Quantum Mechanics Concept',
      description: 'Need help understanding wave-particle duality. Any physics experts here?',
      author: 'Sarah Chen',
      authorImage: 'https://via.placeholder.com/40x40/f093fb/ffffff?text=S',
      timestamp: '5 hours ago',
      responses: 1,
      views: 23,
      authorProfile: {
        bio: 'Physics researcher and educator',
        expertiseLevel: 'advanced',
        skills: ['Quantum Physics', 'Mechanics', 'Electromagnetism']
      }
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newDoubt, setNewDoubt] = useState({
    subject: '',
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'Computer Science', 'English', 'History', 'Economics',
    'Psychology', 'Engineering', 'Medicine', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDoubt(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitDoubt = async (e) => {
    e.preventDefault();
    if (newDoubt.subject && newDoubt.title && newDoubt.description) {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const doubt = {
        id: Date.now(),
        ...newDoubt,
        author: user.name,
        authorImage: user.profileImage,
        timestamp: 'Just now',
        responses: 0,
        views: 0,
        authorProfile: {
          bio: user.bio || '',
          expertiseLevel: user.expertiseLevel || 'beginner',
          skills: user.skills || []
        }
      };
      setDoubts(prev => [doubt, ...prev]);
      setNewDoubt({ subject: '', title: '', description: '' });
      setShowForm(false);
      setIsSubmitting(false);
    }
  };

  const handleVideoCall = (doubtId) => {
    alert(`Initiating video call for doubt #${doubtId}. This would integrate with a video calling service like Zoom or Google Meet.`);
  };

  const handleChat = (doubtId) => {
    alert(`Opening chat for doubt #${doubtId}. This would open a real-time chat interface.`);
  };

  const getExpertiseColor = (level) => {
    switch (level) {
      case 'expert': return '#9C27B0';
      case 'advanced': return '#F44336';
      case 'intermediate': return '#FF9800';
      default: return '#4CAF50';
    }
  };

  return (
    <div className="container">
      <div style={{ padding: '40px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: 'white', margin: 0, animation: 'slideInLeft 0.6s ease' }}>📚 Academic Doubts</h1>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn btn-primary"
            style={{ animation: showForm ? 'pulse 0.5s ease' : 'none' }}
          >
            {showForm ? 'Cancel' : '+ Share Doubt'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ animation: 'slideDown 0.3s ease' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Share Your Doubt</h3>
            <form onSubmit={handleSubmitDoubt}>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  value={newDoubt.subject}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newDoubt.title}
                  onChange={handleInputChange}
                  placeholder="Brief title for your doubt"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newDoubt.description}
                  onChange={handleInputChange}
                  placeholder="Describe your doubt in detail..."
                  rows="4"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ position: 'relative' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading" style={{ marginRight: '8px' }}></span>
                    Posting...
                  </>
                ) : (
                  'Post Doubt'
                )}
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <h2 style={{ color: 'white', marginBottom: '20px', animation: 'slideInLeft 0.6s ease 0.2s both' }}>
            Recent Doubts
          </h2>
          
          {doubts.map((doubt, index) => (
            <div 
              key={doubt.id} 
              className="doubt-item"
              style={{ 
                animation: `slideInUp 0.5s ease ${index * 0.1}s both`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div className="doubt-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={doubt.authorImage} 
                    alt={doubt.author}
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  <span style={{ fontWeight: '600' }}>{doubt.author}</span>
                  <span style={{ color: '#666', fontSize: '14px' }}>{doubt.timestamp}</span>
                </div>
                <span className="doubt-subject">{doubt.subject}</span>
              </div>
              
              {/* User profile info for the author */}
              {doubt.authorProfile && (
                <div style={{ 
                  marginBottom: '12px', 
                  padding: '12px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  animation: 'fadeIn 0.5s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}><b>Bio:</b></span>
                    <span style={{ fontSize: '12px', color: '#333' }}>{doubt.authorProfile.bio}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}><b>Expertise:</b></span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      backgroundColor: getExpertiseColor(doubt.authorProfile.expertiseLevel),
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      {doubt.authorProfile.expertiseLevel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}><b>Skills:</b></span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {doubt.authorProfile.skills?.slice(0, 3).map(skill => (
                        <span 
                          key={skill}
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            backgroundColor: '#667eea',
                            color: 'white'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {doubt.authorProfile.skills?.length > 3 && (
                        <span style={{ fontSize: '10px', color: '#666' }}>
                          +{doubt.authorProfile.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <h3 style={{ marginBottom: '8px', color: '#333' }}>{doubt.title}</h3>
              <p style={{ color: '#666', marginBottom: '16px' }}>{doubt.description}</p>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '16px',
                fontSize: '14px',
                color: '#666'
              }}>
                <span>👁️ {doubt.views} views</span>
                <span>💬 {doubt.responses} responses</span>
              </div>
              
              <div className="doubt-actions">
                <button 
                  onClick={() => handleVideoCall(doubt.id)}
                  className="btn btn-primary btn-small"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  📹 Video Call
                </button>
                <button 
                  onClick={() => handleChat(doubt.id)}
                  className="btn btn-secondary btn-small"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  💬 Chat
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/" className="btn btn-secondary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DoubtPage; 