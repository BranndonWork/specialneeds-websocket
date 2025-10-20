# CLAUDE.md - SpecialNeeds WebSocket

This file provides context for AI assistants working with the SpecialNeeds WebSocket repository.

## Repository Overview

**Repository:** specialneeds-websocket
**Purpose:** Real-time notification service for SpecialNeeds.com platform
**Status:** **FUTURE USE** - Not currently deployed
**Tech Stack:** Node.js, WebSocket

## Project Context

This WebSocket service is preserved for future use when real-time notifications are needed for the SpecialNeeds.com platform.

### Original Purpose
The service was originally planned for Yelp-like functionality where users could chat with businesses in real-time. The platform has since pivoted to asynchronous messaging.

### Future Use Case
While not currently deployed, this service will be valuable for **real-time notifications** when:
- Users are online and need instant updates
- Live messaging features are implemented
- Real-time status updates are needed
- Instant notifications for important events

### Current Status
- **Not deployed**
- **Code preserved** for future implementation
- **Not actively maintained**
- **No production traffic**

## Architecture

### Tech Stack
- **Runtime:** Node.js
- **Protocol:** WebSocket (ws or socket.io)
- **Deployment:** To be determined when needed

### Directory Structure
```
specialneeds-websocket/
├── docs/              # Documentation
├── scripts/           # Utility scripts
├── webroot/          # WebSocket application code
│   ├── src/
│   └── package.json
├── package.json      # Root metadata
└── README.md
```

## Development Environment

### Setup (When Needed)
```bash
cd webroot
npm install
npm start
```

## Important Notes for AI Assistants

### When This Repository Will Be Needed

1. **Real-Time Notifications**
   - Push notifications to connected clients
   - Live updates for user actions
   - Instant alerts for important events

2. **Live Messaging**
   - Real-time chat between users and providers
   - Instant message delivery
   - Typing indicators
   - Read receipts

3. **Live Updates**
   - Availability changes
   - Booking confirmations
   - Status updates

### Not Currently Used For

- ❌ Async messaging (handled in specialneeds-api)
- ❌ Email notifications (handled in specialneeds-api)
- ❌ Static content delivery (handled in specialneeds-client)

### When Working on This Repository (Future)

1. **WebSocket Best Practices**
   - Handle connection/disconnection gracefully
   - Implement reconnection logic
   - Use heartbeat/ping-pong for connection health
   - Scale horizontally with Redis adapter

2. **Security**
   - Authenticate WebSocket connections
   - Validate all messages
   - Implement rate limiting
   - Use secure WebSocket (wss://)

3. **Performance**
   - Optimize for many concurrent connections
   - Implement connection pooling
   - Use efficient message serialization
   - Monitor memory usage

4. **Architecture**
   - Separate concerns (auth, routing, handlers)
   - Use event-driven architecture
   - Implement proper error handling
   - Add logging for debugging

### Common WebSocket Patterns

**Basic WebSocket server:**
```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send('Echo: ' + message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
```

**Socket.io server:**
```javascript
const io = require('socket.io')(3000);

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
```

**Authentication:**
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (isValidToken(token)) {
    socket.userId = getUserIdFromToken(token);
    next();
  } else {
    next(new Error('Authentication error'));
  }
});
```

**Broadcasting to specific users:**
```javascript
function sendToUser(userId, event, data) {
  const userSocket = connectedUsers.get(userId);
  if (userSocket) {
    userSocket.emit(event, data);
  }
}
```

### Integration Points (Future)

**With specialneeds-api:**
- API triggers WebSocket notifications
- WebSocket authenticates against API
- Shared user/session management

**With specialneeds-client:**
- Client connects to WebSocket for live updates
- React components listen to WebSocket events
- Fallback to polling if WebSocket unavailable

**With specialneeds-admin:**
- Admin users receive real-time notifications
- Live updates for bookings/inquiries
- Real-time dashboard updates

## Deployment (Future)

### When Ready to Deploy

**Considerations:**
- Choose hosting platform (Heroku, AWS, DigitalOcean, etc.)
- Set up SSL/TLS for wss://
- Configure load balancing
- Implement Redis for multi-server setup
- Set up monitoring and logging

**Environment Variables:**
```
PORT=8080
NODE_ENV=production
API_URL=https://api.specialneeds.com
REDIS_URL=redis://...
JWT_SECRET=...
```

## Related Repositories

- **specialneeds-api** - Backend API, will trigger WebSocket events
- **specialneeds-client** - Frontend, will consume WebSocket updates
- **specialneeds-admin** - Admin interface, may use WebSocket
- **specialneeds-services** - Background services
- **specialneeds-infrastructure** - Cloudflare Workers

## When to Activate This Service

Consider activating this service when:

1. **User demand** for real-time features
2. **Business need** for instant notifications
3. **Technical capacity** to maintain WebSocket service
4. **Clear use case** that benefits from real-time updates

## Best Practices (For Future Implementation)

1. **Connection Management**
   - Implement connection pooling
   - Handle reconnections gracefully
   - Use heartbeat to detect dead connections
   - Clean up disconnected clients

2. **Scalability**
   - Use Redis adapter for multi-server setup
   - Implement horizontal scaling
   - Load balance connections
   - Monitor resource usage

3. **Security**
   - Authenticate all connections
   - Validate all messages
   - Implement rate limiting
   - Use secure WebSocket (wss://)

4. **Reliability**
   - Handle errors gracefully
   - Implement message queuing
   - Add retry logic
   - Monitor service health

5. **Developer Experience**
   - Document WebSocket events
   - Provide client SDKs
   - Add debugging tools
   - Write comprehensive tests

## Current Recommendation

**Status:** This repository should remain archived until there is a clear business need for real-time features.

**Alternatives:** For now, continue using:
- API polling for updates (specialneeds-api)
- Push notifications for mobile (future)
- Email notifications for important events (specialneeds-api)

## Questions?

Refer to:
- Repository README.md
- WebSocket documentation
- Socket.io documentation (if used)
- Project-wide docs/repository-guide.md

---

**Note:** This service is intentionally preserved but not deployed. Do not activate it unless specifically requested and there is a clear business case for real-time features.
