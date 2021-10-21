const express = require('express');
morgan = require('morgan');

const app = express();

app.use(morgan ('common'));

let topTenMovies = [];

app.get('/movies', (req, res, next) => {
        res.json(topTenMovies);
    });

    app.get('/', (req, res, next) => {
        res.send('Mugen Train was really good');
    });

    app.use(express.static('public'));

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Uh oh!');
    });

    app.listen(8080, () => {
        console.log('listening on port 8080');
    });