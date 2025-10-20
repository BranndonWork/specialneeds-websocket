# SpecialNeeds WebSocket Service

**Purpose:** Real-time notification service for SpecialNeeds.com platform
**Status:** Future use - not currently deployed

## Overview

This WebSocket service is preserved for future use when real-time notifications are needed. The original plan included Yelp-like functionality where users could chat with businesses in real-time. While we've pivoted to async messaging for now, WebSockets will be useful for **real-time notifications** when users are online.

## Use Cases (Future)

- Push notifications when users receive messages (if they're online)
- Real-time updates for listing changes
- Live chat features (if implemented later)
- Real-time status updates

## Tech Stack

- **Runtime:** Node.js
- **WebSocket Server:** WebSocket library
- **Framework:** Express.js or similar
- **Authentication:** JWT tokens

## Deployment

**Status:** TBD (when needed)
**Platform:** To be determined based on future requirements

## Setup (Development)

```bash
cd webroot/
npm install
npm start
```

## Environment Variables

See `webroot/.env` for configuration (if applicable).

## Notes

- This service is not currently part of the active deployment
- Code preserved for when real-time features are needed
- All websocket functionality has been archived for future reference
