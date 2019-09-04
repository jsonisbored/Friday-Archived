const cmd = require('node-cmd');
const fs = require('fs');
let id = require('../restart.json');
module.exports = (client, message, args) => {
    message.channel.send("Restarting...");
    id.id = message.channel.id;
    fs.writeFile('restart.json', JSON.stringify(id), err => console.error);
    cmd.get(
        'pm2 restart main',
        function(err, data, stderr){
            message.channel.send(err.message);
        }
    );
};