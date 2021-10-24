const express = require('express');
morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();

app.use(morgan ('common'));
app.use(express.static('public'));

let topTenMovies = [
    {
        title: 'Demon Slayer: Kimetsu no Yaiba – The Movie: Mugen Train',
        director: 'Haruo Sotozaki',
        genre: [
            'Animation',
            'Action',
            'Adventure'
        ]
    },
    {
        title: 'A Silent Voice',
        director: '	Naoko Yamada',
        genre: [
            'Drama'
        ]
    },
    {
        title: 'The Boy and the Beast',
        director: 'Mamoru Hosoda',
        genre: [
            'Adventure',
            'Supernatural'
        ]
    },
    {
        title: 'Ponyo',
        director: '	Hayao Miyazaki',
        genre: [
            'Animation',
            'Adventure',
            'Comedy',
            'Family',
            'Fantasy'
        ]
    },
    {
        title: 'Dragon Ball Super: Broly',
        director: 'Tatsuya Nagamine',
        genre: [
            'Action',
            'Adventure',
            'Fantasy'
        ]
    },
    {
        title: 'Patema Inverted',
        director: '	Yasuhiro Yoshiura',
        genre: [
            'Adventure',
            'Sci-Fi'

        ]
    },
    {
        title: 'Your Name',
        director: '	Makoto Shinkai',
        genre: [
            'Drama',
            'Romance',
            'Supernatural'
        ]
    },
    {
        title: 'The Girl Who Leapt Through Time',
        director: '	Mamoru Hosoda',
        genre: [
            'Drama',
            'Romance',
            'Sci-Fi'
        ]
    },
    {
        title: 'Paprika',
        director: 'Satoshi Kon',
        genre: [
            'AvantGarde',
            'Fantasy',
            'Horror',
            'Mystery',
            'Sci-Fi',
            'Suspense'
        ]
    },
    {
        title: 'Clannad Movie',
        director: 'Dezaki, Osamu',
        genre: [
            'Drama',
            'Fantasy',
            'Romance'
        ]
    }
];

//Get a list of all movies to a user
app.get('/movies', (req, res,) => {
        res.json(topTenMovies);
    });

//Return data about a single movie by title
app.get('/movies/:title', (req,res) => {
    res.send('Successful GET request returning movies by title.');
});

//Return data about a movie's genre
app.get('/movies/:genre', (req, res) => {
    res.send('Successful GET request returning movies genre.');
});

//Return information about a movie's director
app.get('/director', (req, res) => {
    res.send('Successful GET request returning information about director.');
});

//Allow new users to register
app.post('/register', (req, res) => {
    res.send('Successful POST request a new user has been registered.');
});

//Allow users to update their user information
app.put('/users/:id/:user_info', (req, res) => {
    res.send('Successful PUT request user has updated their information.');
});

//Allow users to add a movie to their favorites list
app.post('/users/:id/:favorites', (req, res) => {
    res.send('Successful POST request of user adding a movie to their favorites.');
});

//Allow users to remove a movie from their favorites list 
app.delete('/users/:id/:favorites', (req, res) => {
    res.send('Successful DELETE request of user removing a movie from their favorites list.');
});

//Allow a user to unregister
app.delete('/users/:id/:unregister', (req, res) => {
    res.send('Successful DELETE request of a user unregistering.');
});

   // app.get('/', (req, res, next) => {
     //   res.send('Mugen Train was really good');
    //});

//Error handling
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Uh oh!');
    });

    app.listen(8080, () => {
        console.log('listening on port 8080');
    });