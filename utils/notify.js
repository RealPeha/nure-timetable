const User   = require('./user'),
      db     = require('../db'),
      notify = new db('notifications')

const start = () => {
    
}

module.exports = async function allTimes() {
    const allNotify = await notify.find({})
    return allNotify.all
}

module.exports = function firstPair() {
    
}