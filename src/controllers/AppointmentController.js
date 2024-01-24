const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');

const Appointment = require('../models/appointmentModel'); // path to the appointment model file

// user and therapist model
const User = require('../models/userModel'); // path to your User model
const Therapist = require('../models/therapistModel'); //path to your Therapist model


// Function to generate a unique identifier for the meeting
const generateUniqueMeetingId = () => {
  // Generate a v4 UUID
  const uniqueId = uuidv4();
  return uniqueId;
};
const uniqueMeetingId = generateUniqueMeetingId();

// Function to schedule a meeting using Google Meet
const scheduleMeeting = async (userId, therapistId, date, time) => {
  try {
    // Retrieve user and therapist information from the database using the info sent from the scheduled appointment session.
    const user = await User.findById(userId); // getting this user from the db
    const therapist = await Therapist.findById(therapistId); // getting this therapist from the db

    // Use the retrieved information to create the meeting event
    const event = {
      summary: 'Therapy Session',
      description: 'Scheduled therapy session with ' + therapist.name,
      start: {
        dateTime: new Date(`${date}T${time}`),
        timeZone: 'Africa/Lagos',
      },
      end: {
        dateTime: new Date(new Date(`${date}T${time}`).getTime() + 60 * 60 * 1000), // Assuming 1 hour session duration
        timeZone: 'Africa/Lagos',
      },
      attendees: [
        { email: user.email },
        { email: therapist.email },
      ],
      conferenceData: {
        createRequest: {
          requestId: uniqueMeetingId, // Using the generated unique identifier value
        },
      },
    };

    // Initialize the Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth: YOUR_AUTHENTICATION_CLIENT });

    // Create the event and conference data
    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    // Create a new appointment in the database
    const newAppointment = new Appointment({
      patient: userId,
      therapist: therapistId,
      date,
      time,
      eventId: res.data.id, // Store the Google Calendar event ID in the database for future reference
    });
    await newAppointment.save();

    return res.data; // Return the Google Calendar event data
  } catch (error) {
    // Handling errors
    console.error('Error scheduling meeting:', error);
    throw new Error('Failed to schedule the meeting');
  }
};

module.exports = { scheduleMeeting };
