# Peerpathy Backend API

A comprehensive backend API for the Peerpathy student platform, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Academic Doubts**: Create, view, and respond to academic doubts with voting system
- **Travel Companions**: Location-based travel companion finding with real-time matching
- **Real-time Chat**: Socket.io integration for instant messaging
- **User Profiles**: Complete user profiles with ratings and reviews
- **Search & Filtering**: Advanced search and filtering capabilities

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd peerpathy-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `config.env` and update the values:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/peerpathy
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Start MongoDB service
   mongod
   ```

5. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| POST | `/api/auth/logout` | Logout user | Private |

### Doubts

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/doubts` | Create new doubt | Private |
| GET | `/api/doubts` | Get all doubts | Public |
| GET | `/api/doubts/:id` | Get doubt by ID | Public |
| POST | `/api/doubts/:id/responses` | Add response | Private |
| PUT | `/api/doubts/:id/responses/:responseId/accept` | Accept response | Private |
| POST | `/api/doubts/:id/vote` | Vote on doubt | Private |
| DELETE | `/api/doubts/:id` | Delete doubt | Private |

### Location/Travel

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/location/trips` | Create travel plan | Private |
| GET | `/api/location/trips` | Get all trips | Public |
| GET | `/api/location/trips/nearby` | Find nearby companions | Private |
| GET | `/api/location/trips/:id` | Get trip by ID | Public |
| POST | `/api/location/trips/:id/join` | Join trip | Private |
| PUT | `/api/location/trips/:id/companions/:userId/respond` | Respond to request | Private |
| PUT | `/api/location/trips/:id` | Update trip | Private |
| DELETE | `/api/location/trips/:id` | Delete trip | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users` | Get all users | Public |
| GET | `/api/users/:id` | Get user by ID | Public |
| GET | `/api/users/search/experts` | Search experts | Public |
| POST | `/api/users/:id/review` | Add review | Private |
| GET | `/api/users/online/list` | Get online users | Public |
| PUT | `/api/users/online-status` | Update online status | Private |

## Database Models

### User
- Basic info (name, email, password)
- Profile image and bio
- Subjects expertise
- Rating and reviews
- Online status

### Doubt
- Academic doubt details
- Author and responses
- Voting system
- Status tracking
- Tags and attachments

### Location
- Travel plan details
- Current location and destination
- Companion requests
- Fare sharing options
- User preferences

## Real-time Features

The backend includes Socket.io for real-time communication:

- **Chat Rooms**: Join doubt-specific chat rooms
- **Message Broadcasting**: Real-time message delivery
- **Online Status**: Live user online/offline status

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: express-validator for data validation
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Built-in protection against abuse

## Error Handling

Comprehensive error handling with:
- Validation errors
- Authentication errors
- Database errors
- Custom error messages

## Development

### Project Structure
```
backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── server.js        # Main server file
├── package.json     # Dependencies
└── config.env       # Environment variables
```

### Adding New Features

1. Create model in `models/` directory
2. Add routes in `routes/` directory
3. Update `server.js` to include new routes
4. Test endpoints with Postman or similar tool

## Testing

Test the API endpoints using tools like:
- Postman
- Insomnia
- curl commands

Example curl command:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

## Deployment

1. Set environment variables for production
2. Use PM2 or similar process manager
3. Set up MongoDB Atlas or production MongoDB
4. Configure reverse proxy (nginx)
5. Set up SSL certificates

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details 