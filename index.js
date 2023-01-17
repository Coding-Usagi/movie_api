const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const {check, validationResult} = require('express-validator');

require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Models = require('./model.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

//mongoose.connect('mongodb://localhost:27017/my_flix_db', 
//{useNewUrlParser: true, useUnifiedTopology: true});

app.use(morgan ('common'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);

const passport = require('passport');
const res = require('express/lib/response');
require('./passport');

app.get('/', (req, res) => {
    res.send('Welcome to myFlix App.');
});

//Changing the code to let certain origins have access
let allowedOrigins =['http://localhost:8080', 'http://localhost:1234', 'http://testsite.com'];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback (null, true);
        if(allowedOrigins.indexOf(origin) === -1) {
            //If a specific origin isn't found on the list of allowed origins
            let message = 'The CORS policy for this application does not allow access from origin' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

//Get a list of all movies to a user
app.get('/movies', function (req, res) { passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
    .then ((movies) => {
        res.status(201).json(movies);
    })    
    .catch ((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Return data about a single movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req,res) => {
    Movies.findOne({Title: req.params.Title})
    .then((title) => {
        res.json(title);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error :' + err);
    });
});

//Return a list of all genres
app.get('/genres', passport.authenticate('jwt', { session: false }), (req, res) => {
    Genres.find()
    .then((genres) => {
        res.status(201).json(genres);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Return data about a movie's genre
app.get('/movies/genre/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({"Genre.Name": req.params.name})
    .then((genre) => {
        res.status(201).json(genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Get data on all directors
app.get('/directors', passport.authenticate('jwt', { session: false }), (req, res) => {
    Directors.find()
    .then((directors) => {
        res.status(201).json(directors);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Return information about a movie's director
app.get('/movies/director/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Director.Name" : req.params.name })
    .then((director) => {
        res.json(director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Return info on all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(400).send('Error: ' + err);
    });
});

//Return info on a user by id
app.get('/users/:ID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({id: req.params.ID})
    .then((users) => {
        res.status(201).json(users);
        console.log(req.params.ID);
    })
    .catch((err) => {
        console.error(err);
        res.status(400).send('Error: ' + err);
    });
});

//Add a new user
/* Expect JSON in format
{
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
}*/

app.post('/users',
[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non-alphanumeric characters, not allowed').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
],
    (req, res) => {
        //Check the validation object for errors
        let errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOne({Username: req.body.Username})
        .then((user) => {
            if(user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
              Users
                .create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
    }
})

    .catch ((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

//Allow users to update their user information
app.put('/users/:ID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({id: req.params.ID},
        {
            $set: {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        },
        {new: true}, //Makes sure the updated doc is returned
        (err, updatedUser) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser)
            }
        });
});

//Allow users to add a movie to their favorites list
app.post('/users/:Username/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username}, 
        {
        $push: {FavoriteMovies: req.params.movieID}
    },
    {new: true}, //Makes sure the updated doc is returned
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//Allow users to remove a movie from their favorites list 
app.delete('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({Username: req.params.Username})
    .then((FavoriteMovies) => {
        if(!FavoriteMovies) {
            res.status(400).send(req.params.MovieID + 'was not found');
        } else {
            res.status(200).send(req.params.MovieID + 'was deleted');
        }

    })
    .catch ((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
    //res.send('Successful DELETE request of user removing a movie from their favorites list.');
});

//Allow a user to unregister
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({Username: req.params.Username})
    .then((user) => {
        if(!user) {
            res.status(400).send(req.params.Username + 'was not found');
        } else {
            res.status(200).send(req.params.Username + 'was deleted');
        }
    })
    .catch ((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Error handling
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Uh oh!');
    });

    const port = process.env.PORT || 8080;
    app.listen(port, '0.0.0.0', () => {
        console.log('Listening on Port' + port)
    });