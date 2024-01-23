const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./src/database/db");
const passportConfig = require('./src/middlewares/passportMiddleware')
const passport = require("passport");
const cookieSession = require('cookie-session');

// Initialize Express
const app = express();
const userRoutes = require('./src/routes/userRoutes');
const therapistRoutes = require('./src/routes/therapistRoutes')

// connect to database
connectDB();


app.use(express.json());
app.use(cors({
  origin: "http://localhost:8000",
  // origin: 'https://(ourproject).vercel.app', //add our project link
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}))
app.use(express.urlencoded({extended: false}));

app.use(passport.initialize());
app.use(passport.session())
app.use(cookieSession({name: "session", keys:["mymentio"], maxAge: 24*60*60*100})) 
    // app.use(
    //   session({
    //     secret: process.env.JWT_SECRET,
    //     resave: false,
    //     saveUninitialized: true,
    //   })
    // );

    // app.use((req, res, next) => {
    //     res.setHeader("Access-Control-Allow-Origin", "*");
    //     res.setHeader("Access-Control-Allow-Credentials", "true");
    //     res.setHeader(
    //       "Access-Control-Allow-Headers",
    //       "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    //     );
    //     res.setHeader(
    //       "Access-Control-Allow-Methods",
    //       "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    //     );
    //     next();
    //   });



  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'welcome to My Mentio api',
    })
  })

//routes
app.use('/api/user', userRoutes);
app.use('/api/therapist', therapistRoutes)



//PORT
const PORT = process.env.PORT || 8000;


// Listen to our routes
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});