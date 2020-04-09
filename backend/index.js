const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort
});

const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort,
});

pgClient.on('error', () => console.log('No connection to PG DB'));

pgClient.query('CREATE TABLE IF NOT EXISTS results(number INT)').catch(err => console.log(err));

console.log(keys);

app.get('/', (req, resp) => {
   resp.send('Hello World!!!');
});

app.get('/:firstNumber/:secondNumber', (req, resp) => {
    const firstValue = req.params.firstNumber;
    const secondValue = req.params.secondNumber;

    redisClient.get(firstValue + ',' + secondValue, (err, result) => {
        if (!result) {
            let nwdResult = nwd(firstValue, secondValue);
            redisClient.set(firstValue + ',' + secondValue, parseInt(nwdResult));
            resp.send('New result ' + nwdResult);
            pgClient.query('INSERT INTO results VALUES ($1)', [nwdResult]).catch(err => console.log(err));
        }
        else {
            resp.send('Result ' + result);
        }
    });
});

app.get('/results', (req, resp) => {
    pgClient.query('SELECT * FROM results')
        .then(res => resp.send(res.rows))
        .catch(err => console.log(err));
});

app.listen(8080, err => {
    console.log('Server listening on 8080');
});

function nwd(a, b) {
    let temp;
    while (b !== 0){
        temp = a;
        a = b;
        b = temp % b;
    }
    return a;
}