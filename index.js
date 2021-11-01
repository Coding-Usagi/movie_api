const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();

const mongoose = require('mongoose');
const Models = require('./model.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genre = Models.Genre;
const Director = Models.Director;

mongoose.connect('mongodb://localhost:27017/my_flix_db', 
{useNewUrlParser: true, useUnifiedTopology: true});

app.use(morgan ('common'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res, next) => {
    res.send('Welcome to myFlix App.');
});


//Get a list of all movies to a user
app.get('/movies', (req, res,) => {
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
app.get('/movies/:Title', (req,res) => {
    Movies.findOne({Title: req.params.Title})
    .then((title) => {
        res.json(title);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error :' + err);
    });
    //res.send('Successful GET request returning movies by title.');
});

//Return data about a movie's genre
app.get('/genre/:Name', (req, res) => {
    Genre.findOne({Name: req.params.Name})
    .then((genre) => {
        res.json(genre.Description);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
    //res.send('Successful GET request returning movies genre.');
});

//Return information about a movie's director
app.get('/director/Name', (req, res) => {
    Director.findOne({Name: req.params.Name})
    .then((director) => {
        res.json(director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });

    //res.send('Successful GET request returning information about director.');
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
app.post('/users', (req, res) => {
    Users.findOne({Username: req.body.Username})
    .then((user) => {
        if(user){
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users
            .create ({
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            })
            .then((user) => {res.status(201).json(user)})
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch ((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
    //res.send('Successful POST request a new user has been registered.');
});

//Allow users to update their user information
app.put('/users/Username', (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username},
        {
            $set: {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        },
        {new: true}, //Makes sure the updated doc is returned
        (err, updateUser) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser)
            }
        });
    //res.send('Successful PUT request user has updated their information.');
});

//Allow users to add a movie to their favorites list
app.post('/users/:Username/Movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username}, 
        {
        $push: {FavoriteMovies: req.params.MovieID}
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
    //res.send('Successful POST request of user adding a movie to their favorites.');
});

//Allow users to remove a movie from their favorites list 
app.delete('/users/:Username/Movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username', (req, res) => {
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
    //res.send('Successful DELETE request of a user unregistering.');
});

//Error handling
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Uh oh!');
    });

    app.listen(8080, () => {
        console.log('listening on port 8080');
    });