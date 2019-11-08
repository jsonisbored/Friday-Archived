module.exports = {
    formatDate: d => {
        const minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
        hours = d.getHours().toString().length == 1 ? '0'+d.getHours() : d.getHours(),
        ampm = d.getHours() >= 12 ? 'PM' : 'AM',
        months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
        days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        return {
            day: days[d.getDay()],
            month: months[d.getMonth()],
            date: d.getDate(),
            year: d.getFullYear(),
            hours: hours%12 == 0 ? 12 : hours%12,
            minutes: minutes,
            ampm: ampm
        };
    },
    getHoliday: (args, holiday, year) => {
        holiday = holidays[holiday.toLowerCase()];
        if (!holiday) return 0;
        year = year || new Date(args.date ? args.date.startDate : Date.now()).getFullYear() || new Date().getFullYear();
        let firstDay = 1,
        month = holiday[0],
        week = holiday[1],
        day = holiday[2],
        d = holiday[3]
        t = new Date();
        if (d) {
            t = new Date(year, month, d+1);
        }  else {
            if (week < 0) {
                month++;
                firstDay--;
            }
            let date = new Date(year, month, (week * 7) + firstDay);
            if (day < date.getDay()) {
                day += 7;
            }
            date.setDate(date.getDate() - date.getDay() + day);
            t = date;
        }
        return t;
    }
};