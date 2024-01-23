const mongoose = require ("mongoose");

const TherapistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: true,
    },
    officeAddress: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: /^\d{14}$/, // validates a 14 digit phone number
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: "Email address is required",
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    expertise: {
      type: [
        {
          type: String,
          enum: ["Depression", "Anxiety", "PTSD", "OCD", "Stress"],
        },
      ],
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    // cv: {
    //   type: String, // Cloudinary url
    //   required: true,
    // },
    experience: {
      type: Number,
      required: true,
    },
    timings: {
      type: String,
      required: true,
      validate: {
        validator: function (time) {
          const validTimings = [
            "Mon-Wed-Fri: 11am-4pm",
            "Tue-Thu: 12pm-3pm",
          ];
          return validTimings.includes(time);
        },
        message: (props) =>
          `${props.value} is not a valid timing. Please use one of the specified timings.`,
      },
    },
    careerExperience: [
      {
        title: String,
        company: String,
        location: String,
        description: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    sessionOffered: [
      {
        sessionType: String,
        duration: Number,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

const Therapist = mongoose.model('Therapist', TherapistSchema);
module.exports = Therapist;