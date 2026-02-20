require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
});

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('myDatabase');
    console.log('✅ Connected to MongoDB!');

    // Ensure email is unique
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    // Start server only after DB is connected
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server started on http://localhost:${process.env.PORT}`);
    });

  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
}

connectDB();

// ─── Middleware: Verify Token ─────────────────────────────────────────────────
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const users = db.collection('users');
    await users.insertOne({ name, email, password: hashedPassword, createdAt: new Date() });
    res.status(201).json({ message: 'Account created successfully!' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists!' });
    }
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const users = db.collection('users');
    const user = await users.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password!' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful!', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ─── Protected Route Example ──────────────────────────────────────────────────
app.get('/profile', verifyToken, async (req, res) => {
  try {
    const users = db.collection('users');
    const user = await users.findOne(
      { email: req.user.email },
      { projection: { password: 0 } } // exclude password
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});