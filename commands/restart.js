const cmd = require('node-cmd');
const fs = require('fs');
let id = require('../restart.json');
module.exports = async (client, message, args) => {
    await message.channel.send('Restarting...');
    id.id = message.channel.type == 'dm' ? message.author.id : message.channel.id;
    id.type = message.channel.type;
    id.restart = true;
    fs.writeFile('restart.json', JSON.stringify(id), err => console.error);
    process.exit(0);
};