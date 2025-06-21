import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Chat({ user }) {
  const { doubtId, otherUserId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [doubt, setDoubt] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket('ws://localhost:5000');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      // Join the chat room
      ws.send(JSON.stringify({
        type: 'join_room',
        roomId: `chat_${doubtId}_${otherUserId}`,
        userId: user._id
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'message') {
          setMessages(prev => [...prev, data.message]);
        } else if (data.type === 'typing') {
          setIsTyping(data.isTyping);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [doubtId, otherUserId, user._id]);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        // Fetch chat messages
        const messagesResponse = await fetch(`http://localhost:5000/api/chat/${doubtId}/${otherUserId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData.messages);
        }

        // Fetch other user details
        const userResponse = await fetch(`http://localhost:5000/api/users/${otherUserId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setOtherUser(userData.user);
        }

        // Fetch doubt details
        const doubtResponse = await fetch(`http://localhost:5000/api/doubts/${doubtId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (doubtResponse.ok) {
          const doubtData = await doubtResponse.json();
          setDoubt(doubtData.doubt);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching chat data:', error);
        setIsLoading(false);
      }
    };

    if (doubtId && otherUserId) {
      fetchChatData();
    }
  }, [doubtId, otherUserId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      content: newMessage.trim(),
      sender: user._id,
      receiver: otherUserId,
      doubtId: doubtId,
      timestamp: new Date().toISOString()
    };

    try {
      console.log('Sending message:', messageData);
      
      // Send message to backend
      const response = await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const savedMessage = await response.json();
        console.log('Message saved to database:', savedMessage);
        
        // Add message to local state immediately
        setMessages(prev => [...prev, savedMessage.message]);
        
        // Send message through WebSocket to other users
        socket.send(JSON.stringify({
          type: 'message',
          roomId: `chat_${doubtId}_${otherUserId}`,
          message: savedMessage.message
        }));

        setNewMessage('');
      } else {
        const errorData = await response.json();
        console.error('Failed to send message:', errorData);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please check your connection and try again.');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket) {
      socket.send(JSON.stringify({
        type: 'typing',
        roomId: `chat_${doubtId}_${otherUserId}`,
        userId: user._id,
        isTyping: e.target.value.length > 0
      }));
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <span style={{ marginLeft: '16px', color: 'white' }}>Loading chat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ padding: '20px 0' }}>
        {/* Chat Header */}
        <div className="card" style={{ 
          marginBottom: '20px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => navigate('/doubts')}
              className="btn btn-secondary btn-small"
            >
              ← Back
            </button>
            <img 
              src={otherUser?.profileImage || 'https://via.placeholder.com/40x40/667eea/ffffff?text=U'} 
              alt={otherUser?.name}
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div>
              <h3 style={{ margin: 0, color: '#333' }}>{otherUser?.name}</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {doubt?.title}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              fontSize: '12px', 
              color: '#666',
              display: 'block'
            }}>
              {otherUser?.expertiseLevel}
            </span>
            {isTyping && (
              <span style={{ 
                fontSize: '12px', 
                color: '#667eea',
                fontStyle: 'italic'
              }}>
                typing...
              </span>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="card" style={{ 
          height: '60vh', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '0'
        }}>
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            {messages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                marginTop: '20px' 
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
                <p>Start the conversation!</p>
                <p style={{ fontSize: '14px' }}>Send a message to begin chatting</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={message._id || index}
                  style={{ 
                    display: 'flex',
                    justifyContent: message.sender === user._id ? 'flex-end' : 'flex-start',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ 
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    backgroundColor: message.sender === user._id ? '#667eea' : '#fff',
                    color: message.sender === user._id ? '#fff' : '#333',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}>
                    <p style={{ margin: 0, wordWrap: 'break-word' }}>
                      {message.content}
                    </p>
                    <span style={{ 
                      fontSize: '10px', 
                      opacity: 0.7,
                      marginTop: '4px',
                      display: 'block'
                    }}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div style={{ 
            padding: '16px', 
            borderTop: '1px solid #e9ecef',
            backgroundColor: '#fff'
          }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type your message..."
                style={{ 
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!newMessage.trim()}
                style={{ 
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat; 