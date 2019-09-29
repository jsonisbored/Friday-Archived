require('datejs');
const alarms = require('../database.js').alarms;
module.exports = {
    init: client => {
        setInterval(() => {
            alarms.forEach((alarm, id) => {
                let t = alarm.time.split(':'), d = new Date(alarm.date || Date.now()), now = new Date();
                d.addHours(t[0]*1);
                d.addMinutes(t[1]*1);
                d.addSeconds(t[2]*1);

                if (now.getTime() >= d.getTime()) {
                    client.users.get(id).send({
                        embed: {
                            color: 0xf04747,
                            fields: [{
                                name: alarm.alarmName+'' || 'Alarm',
                                value: alarm.time+''
                            }]
                        }
                    });

                    if (alarm.recurrence) {
                        let toAdd = 1, day;
                        switch (alarm.recurrence) {
                            case 'Fridays':
                            case 'Mondays':
                            case 'Saturdays':
                            case 'Sundays':
                            case 'Thursdays':
                            case 'Tuesdays':
                            case 'Wednesdays':
                            case 'weekly':
                                toAdd = 7;
                                break;
                            case 'Mondays, Tuesdays':
                                day = d.getDay();
                                if (day != 1) toAdd = 6;
                                break;
                            case 'Mondays, Tuesdays, Wednesdays':
                                day = d.getDay();
                                if (day != 1 && day != 2) toAdd = 5;
                                break;
                            case 'Mondays, Tuesdays, Wednesdays, Thursdays':
                                day = d.getDay();
                                if (day != 1 && day != 2 && day != 3) toAdd = 4;
                                break;
                            case 'Mondays, Tuesdays, Wednesdays, Thursdays, Fridays, Saturdays':
                                day = d.getDay();
                                if (day == 0) toAdd = 2;
                                break;
                            case 'every month':
                                toAdd = 0;
                                d.addMonths(1);
                                break;
                            case 'weekdays':
                                day = d.getDay();
                                if (day == 5) toAdd = 3;
                                break;
                            case 'weekends':
                                day = d.getDay();
                                if (day == 0) toAdd = 6;
                                break;
                        }
                        d.addDays(toAdd);
                        alarm.date = d;
                        alarms.set(id, alarm);
                    } else {
                        alarms.delete(id);
                    }
                }
            });
        }, 1000);
    },
    set: (id, args) => {
        alarms.set(id, args);
    },
};