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

const ResumeSchema = new mongoose.Schema(
  {
    localId: { type: String, required: true, unique: true }, // localStorage ID
    personal: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      website: String,
      linkedin: String,
      summary: String,
    },
    experience: [ExperienceSchema],
    education: [EducationSchema],
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
  },
  { timestamps: true }
);

export default mongoose.model('Resume', ResumeSchema);
