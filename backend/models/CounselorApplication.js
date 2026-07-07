const mongoose = require('mongoose')

const counselorApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  nic: { type: String, required: true },
  profilePhoto: { type: String, required: true }, // Image URL or base64
  email: { type: String, required: true },
  phone: { type: String, required: true },
  
  // Qualifications array (e.g. ['Diploma in Counseling', 'Psychology Degree'])
  qualifications: { type: [String], required: true },
  
  licenseNumber: { type: String, default: '' },
  membership: { type: String, default: '' },
  counsellorIdFront: { type: String, required: true },
  counsellorIdBack: { type: String, required: true },
  
  experienceYears: { type: Number, required: true },
  experienceInstitutions: { type: String, required: true },
  
  // Specialization array (e.g. ['Mental Health', 'Career'])
  specialization: { type: [String], required: true },
  
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true })

module.exports = mongoose.model('CounselorApplication', counselorApplicationSchema)
