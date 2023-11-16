const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Movie = require("../models/movie");
const SECRET = 'randomsecret67890%#222';


const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token || '';
        if (!token) {
            //return res.status(401).json({ error: 'Token is missing' });
            const headers = req.headers;
            var authToken = headers.authorization;
            authToken = authToken.split(' ')[1];

            //const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJhcnVudEBncmF6aXR0aS5jb20iLCJ1c2VyX3N0YXR1cyI6IjEiLCJpYXQiOjE3MDAwNTE0NTR9.fw_7eM5Sz0V7nnhdL9ZPZTO8DC-gsAYwxRMIDCanKxM";

            if (authToken) {
                req.userId = 8;
                try {
                    const decodedToken = jwt.verify(authToken, SECRET);
                    req.email = decodedToken.email;
                    req.user_status = decodedToken.user_status;

                } catch (err) {
                    if (err instanceof jwt.TokenExpiredError) {
                        return res.status(401).json({ message: 'Token expired' });
                    } else if (err instanceof jwt.JsonWebTokenError) {
                        return res.status(400).json({ message: 'Invalid token =>' + authToken });
                    } else {
                        return res.status(500).json({ message: 'Internal server error' });
                    }

                }


            } else {
                console.log('No token available');
            }

            next();
        } else {
            const decodedToken = jwt.verify(token, SECRET);
            req.email = decodedToken.email;
            req.user_status = decodedToken.user_status;
            next();
        }

    } catch (error) {
        console.error(error);
        //return res.status(401).json({ error: 'Token is invalid' });
        res.redirect('/api/login');
    }
};

router.use(requireAuth);

router.get("/movies/", async (req, res) => {
    const movies = await Movie.find();
    res.send(movies);
});

router.get("/movie/:id", async (req, res) => {
    const id = req.params.id;
    const movie = await Movie.findById(id);
    res.send(movie);
});

router.post("/movie/", async (req, res) => {

    const { name, year, director, duration, genre, rate } = req.body;
    const movie = new Movie({
        name,
        year,
        director,
        duration,
        genre,
        rate,
    });

    console.log("email " + req.email);
    userId = 5;

    if (userId && userId == "5") {
        const dbMovie = await Movie.create(movie);
        res.send(dbMovie);
    } else {
        res.status(403).send({ message: "Only admins can create new movies" });
    }
});

module.exports = router;