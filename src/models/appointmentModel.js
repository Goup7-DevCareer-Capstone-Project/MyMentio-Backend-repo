const mongoose = require("mongoose");

const appointmentSchema= new mongoose.Schema(
    {
        patient: {
            type: Schema.Types.ObjectId,
            ref:"User",
          required:true
        },
        therapist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Therapist',
            required: true
        },
        date: { 
            type: Date,
            required: true
        },
        time: {
            type: String, 
            required: true
        },
    },
    {timestamps: true}
);

appointmentSchema.pre('save',async function(next){
    try {
        const userAppointment = await this.constructor.findOne({
            therapist: this.therapist,
            date: this.date,
            time: this.time,
        })

        const therapistAppointment = await this.constructor.findOne({
            patient: this.patient,
            date: this.date,
            time: this.time,
        });

        if(userAppointment || therapistAppointment ){
            throw new ApiError("Appointment time is not available. Please choose a different time.")
        }

        next()

    } catch (error) {
        next(error)   
    }
})



const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment