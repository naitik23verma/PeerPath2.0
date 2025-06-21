import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MapModal from './MapModal';

function LocationPage({ user }) {
  const [peers, setPeers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState({
    destination: '',
    currentLocation: '',
    departureTime: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch existing travel companions on component mount
  useEffect(() => {
    const fetchTravelCompanions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/location/travel-companions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Transform backend data to match frontend format
          const transformedPeers = data.companions.map(companion => ({
            id: companion._id,
            name: companion.name,
            avatar: companion.profileImage || 'https://via.placeholder.com/50x50/667eea/ffffff?text=U',
            destination: companion.travelPlans?.[0]?.destination || 'Unknown',
            currentLocation: 'Current Location',
            departureTime: companion.travelPlans?.[0]?.date ? 
              new Date(companion.travelPlans[0].date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
              'Unknown',
            distance: '0.0 km',
            rating: companion.rating || 5.0,
            reviews: companion.totalReviews || 0,
            coordinates: {
              current: { lat: 40.7128, lng: -74.0060 },
              destination: { lat: 40.7589, lng: -73.9851 }
            }
          }));
          setPeers(transformedPeers);
        }
      } catch (error) {
        console.error('Error fetching travel companions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTravelCompanions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitLocation = async (e) => {
    e.preventDefault();
    if (userLocation.destination && userLocation.currentLocation && userLocation.departureTime) {
      try {
        // Send travel plan to backend
        const response = await fetch('http://localhost:5000/api/location/travel-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            destination: userLocation.destination,
            date: new Date().toISOString().split('T')[0] + 'T' + userLocation.departureTime + ':00',
            transportMode: 'other',
            description: userLocation.notes || ''
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Travel plan saved:', data);
          
          // Update local state with the new peer
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
          
          alert('Travel plan shared successfully!');
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to share travel plan');
        }
      } catch (error) {
        console.error('Error sharing travel plan:', error);
        alert('Failed to share travel plan. Please try again.');
      }
    }
  };

  const handleConnect = (peerId) => {
    alert(`Connecting with peer #${peerId}. This would open a chat or call interface to coordinate travel plans.`);
  };

  const handleCall = (peerId) => {
    // Use a unique room ID for both users
    const roomId = [user._id, peerId].sort().join('_');
    navigate(`/call/${roomId}`);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      // Show loading state
      const detectButton = document.querySelector('button[onclick="handleGetLocation"]');
      if (detectButton) {
        detectButton.textContent = '📍 Detecting...';
        detectButton.disabled = true;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Location detected:', latitude, longitude);
          
          try {
            // Reverse geocoding to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              const address = data.display_name || `${latitude}, ${longitude}`;
              
              // Update the current location input
              setUserLocation(prev => ({
                ...prev,
                currentLocation: address
              }));
              
              // Update backend with user's location
              try {
                await fetch('http://localhost:5000/api/location/update', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({
                    latitude,
                    longitude,
                    address
                  })
                });
              } catch (error) {
                console.error('Error updating location in backend:', error);
              }
              
              alert(`Location detected and filled: ${address}`);
            } else {
              // Fallback to coordinates if reverse geocoding fails
              const coordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              setUserLocation(prev => ({
                ...prev,
                currentLocation: coordinates
              }));
              alert(`Location detected: ${coordinates}`);
            }
          } catch (error) {
            console.error('Error in reverse geocoding:', error);
            // Fallback to coordinates
            const coordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setUserLocation(prev => ({
              ...prev,
              currentLocation: coordinates
            }));
            alert(`Location detected: ${coordinates}`);
          }
          
          // Reset button
          if (detectButton) {
            detectButton.textContent = '📍 Detect';
            detectButton.disabled = false;
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to get location. Please enter manually.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please enter manually.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          
          alert(errorMessage);
          
          // Reset button
          if (detectButton) {
            detectButton.textContent = '📍 Detect';
            detectButton.disabled = false;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('Geolocation is not supported by this browser. Please enter your location manually.');
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
          <span style={{ marginLeft: '16px', color: 'white' }}>Loading travel companions...</span>
        </div>
      </div>
    );
  }

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
                      handleCall(peer.id);
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