const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const body = req.body || {};
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const { password, role } = body;

    if (!username || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Username is required and password must be at least 8 characters.' });
    }
    if (!['staff', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Role must be staff or user.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role });

    return res.status(201).json({
      message: 'User registered successfully.',
      username: user.username,
      role: user.role
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Registration failed:', error);
    return res.status(500).json({ message: 'Unable to register user.' });
  }
};

const login = async (req, res) => {
  try {
    const body = req.body || {};
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const { password } = body;
    if (!username || typeof password !== 'string') {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured.');
      return res.status(500).json({ message: 'Authentication is not configured.' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({ token, role: user.role, username: user.username });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ message: 'Unable to log in.' });
  }
};

module.exports = { register, login };
