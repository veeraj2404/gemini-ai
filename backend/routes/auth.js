const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, 'your-secret-key', { expiresIn: '1h' });
};

//Model
const Image = require('../models/Image');

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() })

// Sign Up
router.post('/signup', async (req, res) => {
  
  const { username, email, password } = req.body;

  try {
    const userExistsByEmail = await User.findOne({ email });
    if (userExistsByEmail) return res.status(400).json({ message: 'Email already exists' });

    const userExistsByUsername = await User.findOne({ username });
    if (userExistsByUsername) return res.status(400).json({ message: 'Username already exists' });

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ token, userId: user._id, email: email, username: username });
  } catch (error) {
    res.status(500).json({ message: 'Error in creating user', error });
  }
});

// Login
router.post('/login', async (req, res) => {
  
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = generateToken(user._id);
    res.status(200).json({ token, userId: user._id, email: email, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error });
  }
});

router.get('/getUser', async (req, res) => {
  
  const { userId } = req.query;
  try {

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profilePic) {
      const profile = JSON.parse(user.profilePic);
      var data = `data:${profile.contentType};base64,${profile.data}`;
    }

    // res.contentType(user.contentType);
    res.status(200).json({ username: user.username, email: user.email, preview: data });
  } catch (error) {
    res.status(500).json({ message: 'User Error', error });
  }
});

router.post('/updateProfile', async (req, res) => {
  
  const { username, email, password, newPass } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.username !== username) {
      const userExistsByUsername = await User.findOne({ username });
      if (userExistsByUsername) return res.status(200).json({ message: 'Username already exists' });
    }

    if (password !== '') {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) return res.status(200).json({ message: 'Invalid password' });
      if (newPass === '') {
        return res.status(200).json({ message: 'Please enter new Password' })
      }
      user.password = newPass;
    }

    if (password === '' && newPass !== '') {
      return res.status(200).json({ message: 'Please enter old Password' })
    }

    user.username = username;
    await user.save();

    return res.status(200).json({ message: 'Update Successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Login error', error });
  }

});

router.post('/uploadImage', upload.single('file'), async (req, res) => {

  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const image = new Image({
      contentType: req.file.mimetype,
      name: req.file.originalname,
      data: req.file.buffer.toString('base64'),
    });

    const profilePic = JSON.stringify(image);
    user.profilePic = profilePic;

    await user.save();

    res.json({ message: 'Image uploaded successfully!' });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

module.exports = router;