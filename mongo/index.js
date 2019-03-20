const config = require('../config.json')
const mongoose = require("mongoose")
mongoose.connect(`mongodb://${config.db.user}:${config.db.pass}@ds145555.mlab.com:45555/peoples`, {
    useNewUrlParser: true,
    useFindAndModify: false
})
.then(() => console.log('DB connected'))
.catch((err) => console.log(err))

module.exports = {
    User: require('./models').User,
    Update: require('./models').Update,
    Group: require('./models').Group,
    Stat: require('./models').Stat,
    Session: require('./models').Session
}
