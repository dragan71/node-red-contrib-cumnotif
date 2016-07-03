module.exports = {
    addDays: addDaysfunct,
    addMonths: addMonthsfunct
};

function addDaysfunct(date, days, callback) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    callback(result);
}

function addMonthsfunct(date, months, callback) {
    var result = new Date(date);
    result.setMonth(result.getMonth() + months);
    callback(result);
}