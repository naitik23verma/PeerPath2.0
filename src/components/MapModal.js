import React from 'react';

function MapModal({ peer, onClose }) {
  // In a real implementation, you would integrate with Google Maps API
  // For now, we'll create a placeholder map with route visualization
  
  const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=${peer.coordinates.current.lat},${peer.coordinates.current.lng}&destination=${peer.coordinates.destination.lat},${peer.coordinates.destination.lng}&mode=transit`;

  return (
    <div 
      className="map-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease'
      }}
    >
      <div 
        className="map-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: '800px',
          height: '600px',
          position: 'relative',
          animation: 'slideIn 0.3s ease'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            zIndex: 1001,
            fontSize: '16px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          ×
        </button>
        
        <h3 style={{ 
          marginBottom: '16px', 
          color: '#333',
          animation: 'slideInUp 0.5s ease'
        }}>
          🗺️ Route: {peer.currentLocation} → {peer.destination}
        </h3>
        
        <div style={{ 
          width: '100%', 
          height: 'calc(100% - 120px)', 
          borderRadius: '8px',
          overflow: 'hidden',
          border: '2px solid #e1e5e9',
          animation: 'slideInUp 0.5s ease 0.1s both'
        }}>
          {/* Interactive Map Placeholder */}
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Route visualization */}
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '20%',
              width: '60%',
              height: '60%',
              border: '3px dashed white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗺️</div>
                <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Interactive Map View</p>
                <p style={{ fontSize: '14px', opacity: 0.8 }}>
                  From: <strong>{peer.currentLocation}</strong><br/>
                  To: <strong>{peer.destination}</strong><br/>
                  Distance: <strong>{peer.distance}</strong>
                </p>
              </div>
            </div>
            
            {/* Location markers */}
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              width: '20px',
              height: '20px',
              backgroundColor: '#4CAF50',
              borderRadius: '50%',
              border: '3px solid white',
              animation: 'bounce 2s infinite'
            }}></div>
            
            <div style={{
              position: 'absolute',
              bottom: '15%',
              right: '15%',
              width: '20px',
              height: '20px',
              backgroundColor: '#FF9800',
              borderRadius: '50%',
              border: '3px solid white',
              animation: 'bounce 2s infinite 1s'
            }}></div>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '16px', 
          display: 'flex', 
          gap: '12px',
          justifyContent: 'center',
          animation: 'slideInUp 0.5s ease 0.2s both'
        }}>
          <button 
            onClick={() => {
              alert(`Connecting with ${peer.name} for travel coordination`);
            }}
            className="btn btn-primary"
            style={{ transition: 'all 0.3s ease' }}
          >
            🤝 Connect with {peer.name}
          </button>
          <button 
            onClick={() => {
              alert(`Initiating call with ${peer.name}`);
            }}
            className="btn btn-secondary"
            style={{ transition: 'all 0.3s ease' }}
          >
            📞 Call {peer.name}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapModal; 