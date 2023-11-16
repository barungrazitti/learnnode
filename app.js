const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Joi = require('joi');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json');


const userRoutes = require('./app/routes/userRoutes');
const movieRoutes = require('./app/routes/movie');


const SECRET = 'randomsecret67890%#222';
const cors = require('cors');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(cors());
// Connect to MongoDB
//const dbUrl = "mongodb+srv://learner:yrHefn3jbqoktTi3@cluster0.bxrwcfq.mongodb.net/?retryWrites=true&w=majority";

const dbUrl = "mongodb+srv://learner:yrHefn3jbqoktTi3@cluster0.bxrwcfq.mongodb.net/LearningDB?retryWrites=true&w=majority";

mongoose.connect(dbUrl).then(() => {
  console.log("MongoDB connected");
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

app.get('/', (req, res) => {
  res.send(`
    <h4>Welcome to App</h4>
  `);
})



const port = 3000;

app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', movieRoutes);

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
