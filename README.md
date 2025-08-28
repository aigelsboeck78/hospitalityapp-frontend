# ChaletMoments Hospitality Admin Frontend

Web-based admin interface for managing hospitality properties, guests, activities, and services.

## Features

- Property management
- Guest management with check-in/check-out
- Activity recommendations
- Dining management
- Streaming services configuration
- MDM (Mobile Device Management) for Apple TV devices
- Background image management
- Real-time updates via WebSocket

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Socket.IO Client
- React Query
- React Router

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://your-backend-url.vercel.app
VITE_WS_URL=wss://your-backend-url.vercel.app
```

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Deployment

Deployed on Vercel at: https://hospitalityapp.chaletmoments.com