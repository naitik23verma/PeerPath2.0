import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function DoubtPage({ user }) {
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newDoubt, setNewDoubt] = useState({
    subject: '',
    title: '',
    description: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'Computer Science', 'English', 'History', 'Economics',
    'Psychology', 'Engineering', 'Medicine', 'Other'
  ];

  // Fetch doubts from API
  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/doubts', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDoubts(data.doubts);
        }
      } catch (error) {
        console.error('Error fetching doubts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoubts();
  }, []);

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
      
      try {
        const response = await fetch('http://localhost:5000/api/doubts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(newDoubt)
        });

        if (response.ok) {
          const data = await response.json();
          setDoubts(prev => [data.doubt, ...prev]);
          setNewDoubt({ subject: '', title: '', description: '', priority: 'medium' });
          setShowForm(false);
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to post doubt');
        }
      } catch (error) {
        console.error('Error posting doubt:', error);
        alert('Failed to post doubt. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVideoCall = (doubtId) => {
    // Find the doubt to get more context
    const doubt = doubts.find(d => d._id === doubtId);
    if (doubt) {
      alert(`📹 Initiating video call for doubt: "${doubt.title}"\n\nThis would integrate with a video calling service like:\n• Twilio Video\n• Agora.io\n• WebRTC\n• Zoom API\n\nCall features would include:\n• Video/audio streaming\n• Screen sharing for doubt explanation\n• Chat during call\n• Call recording (optional)\n• Whiteboard for problem solving`);
    } else {
      alert(`📹 Initiating video call for doubt #${doubtId}. This would integrate with a video calling service like Zoom or Google Meet.`);
    }
  };

  const handleChat = (doubtId, authorId) => {
    // Navigate to chat page with doubt ID and author ID
    if (authorId) {
      navigate(`/chat/${doubtId}/${authorId}`);
    } else {
      alert('Unable to start chat: Author information not available');
    }
  };

  const getExpertiseColor = (level) => {
    switch (level) {
      case 'expert': return '#9C27B0';
      case 'advanced': return '#F44336';
      case 'intermediate': return '#FF9800';
      default: return '#4CAF50';
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh' 
        }}>
          <div className="loading" style={{ width: '40px', height: '40px' }}></div>
          <span style={{ marginLeft: '16px', color: 'white' }}>Loading doubts...</span>
        </div>
      </div>
    );
  }

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

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={newDoubt.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
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
          
          {doubts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>
              <h3 style={{ color: '#333', marginBottom: '8px' }}>No doubts yet</h3>
              <p style={{ color: '#666' }}>Be the first to share a doubt!</p>
            </div>
          ) : (
            doubts.map((doubt, index) => (
              <div 
                key={doubt._id} 
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
                      src={doubt.author?.profileImage || 'https://via.placeholder.com/40x40/667eea/ffffff?text=U'} 
                      alt={doubt.author?.name}
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                    <span style={{ fontWeight: '600' }}>{doubt.author?.name}</span>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {new Date(doubt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="doubt-subject">{doubt.subject}</span>
                </div>
                
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
                  <span>💬 {doubt.responses?.length || 0} responses</span>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    backgroundColor: doubt.priority === 'urgent' ? '#f44336' : 
                                   doubt.priority === 'high' ? '#ff9800' : 
                                   doubt.priority === 'medium' ? '#2196f3' : '#4caf50',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {doubt.priority}
                  </span>
                </div>
                
                <div className="doubt-actions">
                  <button 
                    onClick={() => handleVideoCall(doubt._id)}
                    className="btn btn-primary btn-small"
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    📹 Video Call
                  </button>
                  <button 
                    onClick={() => handleChat(doubt._id, doubt.author?._id)}
                    className="btn btn-secondary btn-small"
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    💬 Chat
                  </button>
                </div>
              </div>
            ))
          )}
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