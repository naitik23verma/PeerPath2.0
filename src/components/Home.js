import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home({ user }) {
  const [trendingDoubts, setTrendingDoubts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch trending doubts
    const fetchTrendingDoubts = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTrendingDoubts([
        {
          id: 1,
          subject: 'Mathematics',
          title: 'Calculus Integration Problem',
          author: 'Alex Johnson',
          views: 156,
          responses: 8,
          authorImage: 'https://via.placeholder.com/40x40/667eea/ffffff?text=A'
        },
        {
          id: 2,
          subject: 'Physics',
          title: 'Quantum Mechanics Concept',
          author: 'Sarah Chen',
          views: 89,
          responses: 5,
          authorImage: 'https://via.placeholder.com/40x40/f093fb/ffffff?text=S'
        },
        {
          id: 3,
          subject: 'Computer Science',
          title: 'React State Management',
          author: 'Mike Rodriguez',
          views: 234,
          responses: 12,
          authorImage: 'https://via.placeholder.com/40x40/4CAF50/ffffff?text=M'
        }
      ]);
      setIsLoading(false);
    };

    fetchTrendingDoubts();
  }, []);

  const stats = [
    { label: 'Doubts Solved', value: '156', icon: '✅' },
    { label: 'Peers Connected', value: '89', icon: '🤝' },
    { label: 'Travel Companions', value: '23', icon: '🚗' },
    { label: 'Study Sessions', value: '45', icon: '📚' }
  ];

  return (
    <div className="container">
      <div style={{ padding: '40px 0' }}>
        {/* Welcome Section */}
        <div className="hero" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ 
            fontSize: '5rem', 
            marginBottom: '20px',
            animation: 'bounceIn 1s ease'
          }}>
            🎓
          </div>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '20px',
            animation: 'slideInUp 1s ease 0.2s both'
          }}>
            Welcome back, {user.name}! 👋
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            opacity: 0.9,
            animation: 'slideInUp 1s ease 0.4s both'
          }}>
            Ready to learn, connect, and explore together?
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '50px' 
        }}>
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="card"
              style={{ 
                textAlign: 'center',
                animation: `slideInUp 0.5s ease ${index * 0.1}s both`
              }}
            >
              <div style={{ 
                fontSize: '2.5rem', 
                marginBottom: '12px',
                animation: 'pulse 2s infinite'
              }}>
                {stat.icon}
              </div>
              <h3 style={{ 
                fontSize: '2rem', 
                marginBottom: '8px', 
                color: '#667eea',
                fontWeight: 'bold'
              }}>
                {stat.value}
              </h3>
              <p style={{ color: '#666', fontSize: '14px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ 
            color: 'white', 
            marginBottom: '30px',
            textAlign: 'center',
            animation: 'slideInLeft 0.6s ease'
          }}>
            Quick Actions
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            <Link 
              to="/doubts" 
              className="card"
              style={{ 
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                animation: 'slideInUp 0.5s ease 0.2s both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>
              <h3 style={{ color: '#333', marginBottom: '8px' }}>Share Academic Doubts</h3>
              <p style={{ color: '#666' }}>Get help from peers and experts</p>
            </Link>

            <Link 
              to="/location" 
              className="card"
              style={{ 
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                animation: 'slideInUp 0.5s ease 0.3s both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗺️</div>
              <h3 style={{ color: '#333', marginBottom: '8px' }}>Find Travel Companions</h3>
              <p style={{ color: '#666' }}>Connect with peers going to the same place</p>
            </Link>

            <Link 
              to="/profile" 
              className="card"
              style={{ 
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                animation: 'slideInUp 0.5s ease 0.4s both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👤</div>
              <h3 style={{ color: '#333', marginBottom: '8px' }}>View Profile</h3>
              <p style={{ color: '#666' }}>Manage your profile and achievements</p>
            </Link>
          </div>
        </div>

        {/* Trending Doubts */}
        <div>
          <h2 style={{ 
            color: 'white', 
            marginBottom: '30px',
            animation: 'slideInLeft 0.6s ease 0.5s both'
          }}>
            🔥 Trending Doubts
          </h2>
          
          {isLoading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              animation: 'fadeIn 0.5s ease'
            }}>
              <div className="loading" style={{ 
                width: '40px', 
                height: '40px', 
                margin: '0 auto 16px',
                border: '4px solid rgba(255, 255, 255, 0.3)',
                borderTop: '4px solid white'
              }}></div>
              <p style={{ color: 'white' }}>Loading trending doubts...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {trendingDoubts.map((doubt, index) => (
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
                    </div>
                    <span className="doubt-subject">{doubt.subject}</span>
                  </div>
                  
                  <h3 style={{ marginBottom: '8px', color: '#333' }}>{doubt.title}</h3>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <span>👁️ {doubt.views} views</span>
                    <span>💬 {doubt.responses} responses</span>
                  </div>
                  
                  <div className="doubt-actions">
                    <Link to="/doubts" className="btn btn-primary btn-small">
                      View Details
                    </Link>
                    <button className="btn btn-secondary btn-small">
                      💬 Join Discussion
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div style={{ marginTop: '50px' }}>
          <h2 style={{ 
            color: 'white', 
            marginBottom: '30px',
            animation: 'slideInLeft 0.6s ease 0.6s both'
          }}>
            📈 Recent Activity
          </h2>
          
          <div className="card" style={{ animation: 'slideInUp 0.5s ease 0.7s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#4CAF50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                ✅
              </div>
              <div>
                <h4 style={{ margin: 0, color: '#333' }}>Solved a Math Problem</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>2 hours ago</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#2196F3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                🤝
              </div>
              <div>
                <h4 style={{ margin: 0, color: '#333' }}>Connected with Sarah Chen</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Yesterday</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#FF9800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                🚗
              </div>
              <div>
                <h4 style={{ margin: 0, color: '#333' }}>Found travel companion to Campus</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 