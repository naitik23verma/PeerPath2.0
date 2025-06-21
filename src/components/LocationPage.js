import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapModal from './MapModal';

function LocationPage({ user }) {
  const [peers, setPeers] = useState([
    {
      id: 1,
      name: 'Mike Rodriguez',
      avatar: 'https://via.placeholder.com/50x50/667eea/ffffff?text=M',
      destination: 'University Campus',
      currentLocation: 'Downtown Station',
      departureTime: '9:00 AM',
      distance: '0.5 km',
      rating: 4.8,
      reviews: 12,
      coordinates: {
        current: { lat: 40.7128, lng: -74.0060 },
        destination: { lat: 40.7589, lng: -73.9851 }
      }
    },
    {
      id: 2,
      name: 'Emma Wilson',
      avatar: 'https://via.placeholder.com/50x50/f093fb/ffffff?text=E',
      destination: 'Shopping Mall',
      currentLocation: 'Central Park',
      departureTime: '2:30 PM',
      distance: '1.2 km',
      rating: 4.9,
      reviews: 8,
      coordinates: {
        current: { lat: 40.7829, lng: -73.9654 },
        destination: { lat: 40.7505, lng: -73.9934 }
      }
    },
    {
      id: 3,
      name: 'David Kim',
      avatar: 'https://via.placeholder.com/50x50/4CAF50/ffffff?text=D',
      destination: 'Library',
      currentLocation: 'Student Housing',
      departureTime: '10:15 AM',
      distance: '0.8 km',
      rating: 4.7,
      reviews: 15,
      coordinates: {
        current: { lat: 40.7484, lng: -73.9857 },
        destination: { lat: 40.7527, lng: -73.9772 }
      }
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState({
    destination: '',
    currentLocation: '',
    departureTime: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitLocation = (e) => {
    e.preventDefault();
    if (userLocation.destination && userLocation.currentLocation && userLocation.departureTime) {
      const newPeer = {
        id: Date.now(),
        name: user.name,
        avatar: user.profileImage,
        ...userLocation,
        distance: '0.0 km',
        rating: 5.0,
        reviews: 0,
        coordinates: {
          current: { lat: 40.7128, lng: -74.0060 },
          destination: { lat: 40.7589, lng: -73.9851 }
        }
      };
      setPeers(prev => [newPeer, ...prev]);
      setUserLocation({ destination: '', currentLocation: '', departureTime: '', notes: '' });
      setShowForm(false);
    }
  };

  const handleConnect = (peerId) => {
    alert(`Connecting with peer #${peerId}. This would open a chat or call interface to coordinate travel plans.`);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          alert(`Location detected: ${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          alert('Unable to get location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handlePeerClick = (peer) => {
    setSelectedPeer(peer);
    setShowMap(true);
  };

  const closeMap = () => {
    setShowMap(false);
    setSelectedPeer(null);
  };

  return (
    <div className="container">
      <div style={{ padding: '40px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: 'white', margin: 0, animation: 'slideInLeft 0.6s ease' }}>🗺️ Find Travel Companions</h1>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn btn-secondary"
            style={{ animation: showForm ? 'pulse 0.5s ease' : 'none' }}
          >
            {showForm ? 'Cancel' : '+ Share My Trip'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ animation: 'slideDown 0.3s ease' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Share Your Travel Plan</h3>
            <form onSubmit={handleSubmitLocation}>
              <div className="form-group">
                <label htmlFor="currentLocation">Current Location</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    id="currentLocation"
                    name="currentLocation"
                    value={userLocation.currentLocation}
                    onChange={handleInputChange}
                    placeholder="Where are you starting from?"
                    required
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={handleGetLocation}
                    className="btn btn-small"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    📍 Detect
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="destination">Destination</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={userLocation.destination}
                  onChange={handleInputChange}
                  placeholder="Where are you going?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="departureTime">Departure Time</label>
                <input
                  type="time"
                  id="departureTime"
                  name="departureTime"
                  value={userLocation.departureTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={userLocation.notes}
                  onChange={handleInputChange}
                  placeholder="Any preferences or additional information..."
                  rows="3"
                />
              </div>

              <button type="submit" className="btn btn-secondary">
                Share Trip
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <h2 style={{ color: 'white', marginBottom: '20px', animation: 'slideInLeft 0.6s ease 0.2s both' }}>
            Available Travel Companions
          </h2>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {peers.map((peer, index) => (
              <div 
                key={peer.id} 
                className="peer-card"
                onClick={() => handlePeerClick(peer)}
                style={{ 
                  animation: `slideInUp 0.5s ease ${index * 0.1}s both`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div className="peer-info">
                  <img 
                    src={peer.avatar} 
                    alt={peer.name}
                    className="peer-avatar"
                  />
                  <div className="peer-details">
                    <h3>{peer.name}</h3>
                    <p>⭐ {peer.rating} ({peer.reviews} reviews)</p>
                  </div>
                  <span className="distance">{peer.distance}</span>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <p><strong>From:</strong> {peer.currentLocation}</p>
                  <p><strong>To:</strong> {peer.destination}</p>
                  <p><strong>Departure:</strong> {peer.departureTime}</p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnect(peer.id);
                    }}
                    className="btn btn-primary btn-small"
                  >
                    🤝 Connect
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnect(peer.id);
                    }}
                    className="btn btn-secondary btn-small"
                  >
                    📞 Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showMap && selectedPeer && (
          <MapModal peer={selectedPeer} onClose={closeMap} />
        )}

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/" className="btn btn-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LocationPage; 