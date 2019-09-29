const Enmap = require("enmap");

module.exports = {
    alarms: new Enmap({
        name: "alarms",
        fetchAll: true,
        autoFetch: true,
        cloneLevel: 'deep'
    })
};