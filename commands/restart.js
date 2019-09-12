const cmd = require('node-cmd');
const fs = require('fs');
let id = require('../restart.json');
module.exports = async (client, message, args) => {
    await message.channel.send('Restarting...');
    id.type = message.channel.type;
    id.id = message.channel.type == 'dm' ? message.author.id : message.channel.id;
    fs.writeFile('restart.json', JSON.stringify(id), err => console.error);
    cmd.get(
        'pm2 restart index',
        function(err, data, stderr){
            message.channel.send(err.message);
        }
    );
};