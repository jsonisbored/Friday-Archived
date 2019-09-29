const db = require('../database.js');
module.exports = (client, message, args) => {
    db.alarms.destroy();
    require('../database.js');
    message.channel.send('Database destroyed');
};