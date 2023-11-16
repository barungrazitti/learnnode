const express = require('express');
const Joi = require('joi');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const session = require('express-session');

const router = express.Router();
const SECRET = 'randomsecret67890%#222';
const User = require('../models/usersModel');

// Your routes will go here
router.get('/signup', (req, res) => {
    res.send(`
      <form method="post" action="/api/signup">
        <input type="text" name="name" placeholder="Name ">
        <input type="text" name="email" placeholder="email">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Signup</button>
      </form>
    `);
});




router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;


    const SignupUserSchema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    });

    const { error } = SignupUserSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    // Check if the user already exists
    const NameExists = await User.findOne({ email });

    //console.log(NameExists);
    if (!NameExists) {

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            user_status: '1',
            user_registered: Date(new Date),
        });

        const dbUser = await User.create(newUser);
        if (dbUser) {
            res.send('Signup successful. <a href="/api/login">Login</a>');
        }
    } else {
        res.send('Username already taken. <a href="/api/signup">Try again</a>');
    }


});

router.get('/login', (req, res) => {
    res.clearCookie('token');
    res.send(`
      <form method="post" action="/api/login">
        <input type="text" name="email" placeholder="email">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Signin</button>
      </form>
    `);
});


router.post('/login', async (req, res) => {
    res.clearCookie('token');

    const { email, password } = req.body;
    //console.log(req.body);

    const SignupUserSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    });

    const { error } = SignupUserSchema.validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const dbUser = await User.findOne({ email });

    if (dbUser) {

        const isPasswordSame = await bcrypt.compare(password, dbUser.password);

        if (isPasswordSame) {
            const token = jwt.sign(
                { email: dbUser.email, user_status: dbUser.user_status, user_status: dbUser.user_status },
                SECRET
            );

            res.cookie('token', token, { httpOnly: true });

            // res.send({
            //   token,
            // });
            res.redirect('/api/users');

        } else {
            res.status(401).send({
                message: "Invalid password",
            });
        }
    }
    else {
        res.status(401).send({
            message: "Invalid email",
        });
    }


});


const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token || '';
        if (!token) {
            //return res.status(401).json({ error: 'Token is missing' });
            res.redirect('/api/login');
        } else {
            const decodedToken = jwt.verify(token, SECRET);
            req.userId = decodedToken.userId;
            next();
        }

    } catch (error) {
        console.error(error);
        //return res.status(401).json({ error: 'Token is invalid' });
        res.redirect('/api/login');
    }
};


router.get('/users', requireAuth, async (req, res) => {

    const Users = await User.find();
    if (Users) res.send(Users);
    else res.send("No users")

});

router.get('/logout', requireAuth, async (req, res) => {

    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, SECRET);

    res.send(`
    ${decodedToken.email}
    <form method="post" action="/api/logoutDelete">    
      <button type="submit">Logout</button>
    </form>
  `);

});

const deleteSession = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else {
            res.clearCookie('token');
            res.send('Logout successful');
        }
    });
}
router.post('/logoutDelete', (req, res) => {
    deleteSession(req, res);
});

module.exports = router;