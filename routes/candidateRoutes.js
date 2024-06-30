const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware } = require('../jwt');
const Candidate = require('../models/candidate');
const Voter = require('../models/Voter');

const checkAdminRole = async (voterID) => {
  try {
    const voter = await Voter.findById(voterID);
    return voter && voter.role === 'admin';
  } catch (err) {
    return false;
  }
};

router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id))
      return res.status(403).json({ message: 'User has no admin role' });
    const newCandidate = new Candidate(req.body);
    const response = await newCandidate.save();
    res.status(200).json({ response });
  } catch (err) {
    console.error('Error in POST /:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: 'User has no admin role' });
    }
    const response = await Candidate.findByIdAndUpdate(req.params.candidateID, req.body, {
      new: true,
      runValidators: true
    });
    if (!response) return res.status(404).json({ error: 'Candidate not found' });
    res.status(200).json(response);
  } catch (err) {
    console.error('Error in PUT /:candidateID:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: 'User has no admin role' });
    }
    const response = await Candidate.findByIdAndDelete(req.params.candidateID);
    if (!response) return res.status(404).json({ error: 'Candidate not found' });
    res.status(200).json(response);
  } catch (err) {
    console.error('Error in DELETE /:candidateID:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
  const candidateID = req.params.candidateID;
  const voterId = req.user.id;
  try {
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) return res.status(404).json({ message: 'Candidate cannot be found' });

    const voter = await Voter.findById(voterId);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });

    if (voter.isVoted) return res.status(400).json({ message: 'You have already voted' });

    if (voter.role === 'admin') return res.status(403).json({ message: 'Admin is not allowed' });

    candidate.votes.push({ voter: voter._id });
    candidate.voteCount++;
    await candidate.save();

    voter.isVoted = true;
    await voter.save();
    res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/vote/count', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: 'desc' });
    const voteRecord = candidates.map((data) => ({
      party: data.party,
      count: data.voteCount
    }));
    res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/candidate',async (req,res)=>{
  try{
      //list of candidates
  }catch(err){
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

module.exports = router;
