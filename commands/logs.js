const logs = require('../logs.json');
const fs = require('fs');
module.exports = (client, message, args) => {
    if (logs.logs.length>2000) {
        logs.logs = logs.logs.slice(logs.logs.length-1994);
        fs.writeFile('./logs.json', JSON.stringify(logs), err => console.error);
    }
    message.channel.send('```'+logs.logs+'```');
};