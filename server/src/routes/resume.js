import express from 'express';
import Resume from '../models/Resume.js';

const router = express.Router();

// GET resume by localId
router.get('/:localId', async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ localId: req.params.localId });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    next(err);
  }
});

// CREATE or UPDATE resume by localId (upsert)
router.post('/save', async (req, res, next) => {
  try {
    const { localId, ...data } = req.body;
    if (!localId) return res.status(400).json({ error: 'localId is required' });

    const resume = await Resume.findOneAndUpdate(
      { localId },
      { localId, ...data },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(resume);
  } catch (err) {
    next(err);
  }
});

// DELETE resume
router.delete('/:localId', async (req, res, next) => {
  try {
    await Resume.findOneAndDelete({ localId: req.params.localId });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
