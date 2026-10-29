const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

app.get('/', (req, res) => {
  res.send('StayHub API is running.');
});

const startServer = async () => {
  const { MONGO_URI, JWT_SECRET } = process.env;
  const missingVariables = [
    !MONGO_URI && 'MONGO_URI',
    !JWT_SECRET && 'JWT_SECRET'
  ].filter(Boolean);
  if (missingVariables.length > 0) {
    throw new Error(`Missing required backend environment variable(s): ${missingVariables.join(', ')}. Add them to backend/.env.`);
  }

  await mongoose.connect(MONGO_URI);
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`StayHub server running on port ${port}.`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Unable to start StayHub:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
