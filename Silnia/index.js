const express = require('express');

const redis = require('redis');

const app = express();

const process = require('process');

const client = redis.createClient({
    host: 'redis-server',
    port: 6379
});

app.get('/:number', (req, resp) => {

    const value = req.params.number;
    console.log('Your number: ' + value);
    if(value >= 10)
        process.exit(1);

    client.get('factorialResult', (err, result) => {
        if (!result) {
            let factorialResult = factorial(value);
            client.set(value, parseInt(factorialResult));
            resp.send('Result ' + factorialResult);
        }
        else {
            resp.send('Result ' + result);
        }
    });
});

function factorial(number) {
    if (number === 0) {
        return 1;
    } else {
        return number * factorial(number - 1);
    }
}

app.listen(8080, () => {
    console.log('Server running on port 8080');
});