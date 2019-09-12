require('dotenv').config();
const express = require('express');
const app = express();
const pm2 = require('pm2');
const fs = require('fs');
const logs = require('./logs.json');

pm2.connect (function(err) {
    if (err) {
        console.error(err);
        process.exit(2);
    }
    pm2.start([{
        script: 'index.js',
    }],
    function (err, proc) {
        if (err) {
            throw err
        }
    });

    pm2.launchBus((err, bus) => {
        bus.on('log:out', data => {
            logs.logs += data.data;
            fs.writeFile('./logs.json', JSON.stringify(logs), err => console.error);
        });
        bus.on('log:err', data => {
            logs.logs += data.data;
            fs.writeFile('./logs.json', JSON.stringify(logs), err => console.error);
        });
    });
})
app.get('/', (req, res) => res.send('Hello World!'));
app.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}!`));
