import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  startDate: String,
  endDate: String,
  current: Boolean,
  bullets: [String],
});

const EducationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  graduationYear: String,
  achievements: String,
});

const ProjectSchema = new mongoose.Schema({
  title: String,
  role: String,
  link: String,
  bullets: [String],
});

// Lightweight version snapshot — stores full resume JSON at a point in time
const VersionSchema = new mongoose.Schema({
  savedAt:  { type: Date, default: Date.now },
  label:    { type: String, default: '' },  // e.g. "Before AI tailor", "After ATS fix"
  snapshot: { type: mongoose.Schema.Types.Mixed }, // full resumeData JSON
});

const ResumeSchema = new mongoose.Schema(
  {
    localId: { type: String, required: true, unique: true }, // localStorage ID
    personal: {
      fullName: String,
      role:     String,
      email: String,
      phone: String,
      location: String,
      website: String,
      linkedin: String,
      summary: String,
    },
    experience: [ExperienceSchema],
    projects:   [ProjectSchema],
    education:  [EducationSchema],
    skills: {
      technical: [String],
      soft: [String],
      languages: [String],
      certifications: [String],
    },
    selectedTemplate: {
      type: String,
      enum: ['classic', 'modern', 'minimal', 'executive', 'tech', 'compact'],
      default: 'modern',
    },
    lastJD: String,
    atsScore: Number,

    // Version history — capped at 20 snapshots (oldest pruned automatically)
    versions: {
      type: [VersionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', ResumeSchema);
