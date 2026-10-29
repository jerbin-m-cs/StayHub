# StayHub — Hotel Room Booking Management System

StayHub is a MERN application for hotel room and booking management. Staff can create, edit, and remove rooms. Users can browse rooms, place bookings, and cancel their own active bookings.

## Requirements

- Node.js and npm
- MongoDB (local or hosted)

## Configure and run the backend

1. Open a terminal in `backend`.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and set `MONGO_URI` to your MongoDB connection string and `JWT_SECRET` to a long, random secret.
4. Start the API with `npm run dev`. The default address is `http://localhost:5000`.

The backend exits with an explicit error if `MONGO_URI` or `JWT_SECRET` is missing.

## Configure and run the frontend

1. Open a second terminal in `frontend`.
2. Install dependencies with `npm install`.
3. Optionally copy `.env.example` to `.env` to set `REACT_APP_API_URL`. Its default is `http://localhost:5000/api`.
4. Start the app with `npm start`; Create React App opens it at `http://localhost:3000`.

## Roles and API access

- Register and log in at `/login`. Registration supports the `user` and `staff` roles.
- Staff can add, edit, and delete rooms. A room with an active booking cannot be deleted.
- Users can book available rooms and can only view or cancel their own bookings.
- Staff can view the booking list. Room creation and editing require staff authentication; booking creation and cancellation require user authentication.
- The frontend attaches the saved login JWT to every protected API request.

## API routes

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/rooms` | Public |
| POST | `/api/rooms` | Staff |
| PUT | `/api/rooms/:roomId` | Staff |
| DELETE | `/api/rooms/:roomId` | Staff |
| GET | `/api/bookings` | Authenticated user or staff |
| POST | `/api/bookings` | User |
| PUT | `/api/bookings/cancel/:id` | Booking owner |

## Checks

Run the frontend test with `npm test -- --watchAll=false` and build it with `npm run build` from `frontend`. Check backend syntax with `node --check server.js` from `backend`.
