const express = require("express");
const cookieParser = require('cookie-parser')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')

const connectToDb = require("./db");
const authRoutes = require("./routes/authRoutes");
const {checkUser} = require('./middlewares/authMiddleware')

const dotenv = require("dotenv");
dotenv.config();

const app = express();

//views
//app.set("view engine", "ejs");

app.use(cookieParser())
//app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors()) //To allow CORS on domain
app.use(rateLimit({ //to limit the number of requests
    windowMs: 20*60*1000, //20 minutes limit
    max: 100, //maximum 100 requests
    message: 'Please try again in 20 minutes, too many request from this IP',
    standardHeaders: true
}))
app.use(helmet({
    contentSecurityPolicy:{
        useDefaults: true
    },
    xssFilter: false,    //disable some headers if not needed
    frameguard:{
        action: 'deny'      // prevents the page from being embedded in a frame
    }
}))

connectToDb().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}...`);
  });
});

app.get("*", checkUser);
app.get("/", (req, res) => {
  res.render("home");
});

app.use(authRoutes);
