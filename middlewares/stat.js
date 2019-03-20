const Stat = require('../utils/query')
const moment = require('moment')

module.exports = () => {
    return (ctx, next) => {
        Stat.add(moment().format('DD.MM.YYYY'), ctx.updateType)
        return next()
    }
}
