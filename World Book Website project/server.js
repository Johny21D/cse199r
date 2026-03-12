require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();

// --- MIDDLEWARE ---
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// --- DATABASE CONNECTION ---
const client = new MongoClient(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('myDatabase');
    console.log('✅ Connected to MongoDB Atlas!');
    
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    // Use process.env.PORT for hosting services like Render
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
}
connectDB();

// --- EMAIL TRANSPORTER ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Use a Gmail App Password here!
  }
});

// --- AUTH MIDDLEWARE ---
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

// --- SIGNUP ---
app.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required.' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection('users').insertOne({ name, email, phone: phone || null, password: hashedPassword, createdAt: new Date() });
    res.status(201).json({ message: 'Account created successfully!' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email already exists!' });
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- LOGIN ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password!' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful!', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- FORGOT PASSWORD ---
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ message: 'No account found with that email.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.collection('users').updateOne(
      { email },
      { $set: { resetToken, resetExpires } }
    );

    // FIX: Use process.env.BASE_URL so it works on the real website
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    const resetLink = `${baseURL}/login-page/reset-password.html?token=${resetToken}&email=${email}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'World Book - Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}" style="background:#e67e22;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
        <p>If you didn't request this, ignore this email.</p>
      `
    });

    res.json({ message: 'Reset link sent to your email!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- RESET PASSWORD ---
app.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) return res.status(400).json({ message: 'All fields are required.' });

  try {
    const user = await db.collection('users').findOne({ email, resetToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link.' });
    if (new Date() > user.resetExpires) return res.status(400).json({ message: 'Reset link has expired.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection('users').updateOne(
      { email },
      { $set: { password: hashedPassword }, $unset: { resetToken: '', resetExpires: '' } }
    );

    res.json({ message: 'Password reset successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- PROFILE ---
app.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ email: req.user.email }, { projection: { password: 0 } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});