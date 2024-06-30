const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const Voter = require('../models/Voter');

router.post('/signup', async (req, res) => {
  try {
    const data = req.body;
    const newVoter = new Voter(data);
    const response = await newVoter.save();

    const payload = {
      id: response._id,
      username: response.username
    };

    const token = generateToken(payload);
    res.status(200).json({ token,response:response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;
    const voter = await Voter.findOne({ aadharCardNumber });

    if (!voter || !(await voter.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid aadharCardNumber or password' });
    }

    const payload = { id: voter._id };
    const token = generateToken(payload);
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    const voter = await Voter.findById(req.user.id);
    res.status(200).json(voter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
  try {
    const voter = await Voter.findById(req.user.id);
    const { currentPassword, newPassword } = req.body;

    if (!voter || !(await voter.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    voter.password = newPassword;
    await voter.save();
    res.status(200).json({ message: 'Password updated' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

module.exports = router;
