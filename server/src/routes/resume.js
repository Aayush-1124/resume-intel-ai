import express from 'express';
import Resume from '../models/Resume.js';

const router = express.Router();
const MAX_VERSIONS = 20;

// GET resume by localId
router.get('/:localId', async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ localId: req.params.localId });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
});

// GET version list (summaries only — no snapshot payload)
router.get('/:localId/versions', async (req, res, next) => {
  try {
    const resume = await Resume.findOne(
      { localId: req.params.localId },
      { versions: 1 }
    );
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const summaries = (resume.versions || []).map((v) => ({
      _id:     v._id,
      savedAt: v.savedAt,
      label:   v.label || '',
    })).reverse(); // newest first

    res.json({ success: true, data: summaries });
  } catch (err) {
    next(err);
  }
});

// GET a specific version snapshot
router.get('/:localId/versions/:versionId', async (req, res, next) => {
  try {
    const resume = await Resume.findOne(
      { localId: req.params.localId },
      { versions: 1 }
    );
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const version = resume.versions.id(req.params.versionId);
    if (!version) return res.status(404).json({ error: 'Version not found' });

    res.json({ success: true, data: version });
  } catch (err) {
    next(err);
  }
});

// CREATE or UPDATE resume by localId (upsert)
// Optional body field `versionLabel` — if provided, save a named version snapshot
router.post('/save', async (req, res, next) => {
  try {
    const { localId, versionLabel, ...data } = req.body;
    if (!localId) return res.status(400).json({ error: 'localId is required' });

    // Build the snapshot from the incoming data (exclude versions itself)
    const { versions: _v, ...snapshotData } = data;
    const newVersion = {
      savedAt:  new Date(),
      label:    versionLabel || '',
      snapshot: snapshotData,
    };

    // Use MongoDB $push with $slice to cap at MAX_VERSIONS (keeps newest)
    const resume = await Resume.findOneAndUpdate(
      { localId },
      {
        $set:  { localId, ...data },
        $push: {
          versions: {
            $each:     [newVersion],
            $slice:    -MAX_VERSIONS, // keep last N
          },
        },
      },
      { upsert: true, new: true, runValidators: false }
    );

    // Return without the full versions array (can be large)
    const { versions: _, ...resumeObj } = resume.toObject();
    res.json({ success: true, data: resumeObj });
  } catch (err) {
    next(err);
  }
});

// PATCH a version's label
router.patch('/:localId/versions/:versionId/label', async (req, res, next) => {
  try {
    const { label } = req.body;
    if (typeof label !== 'string') return res.status(400).json({ error: 'label is required' });

    await Resume.updateOne(
      { localId: req.params.localId, 'versions._id': req.params.versionId },
      { $set: { 'versions.$.label': label.slice(0, 80) } }
    );
    res.json({ success: true });
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
