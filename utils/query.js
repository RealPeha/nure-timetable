const Stat = require('../mongo').Stat
const moment = require('moment')

module.exports = new class {
    async exist(date) {
        return (await this.get(date)) ? true : false
    }

    async add(date, type) {
        const exist = await this.exist(date)
        if (!exist) {
            const statObj = {
                date: date,
                callback_query: 0,
                message: 0
            }
            statObj[type]++
            Stat.create(statObj, (err, data) => {
                if (err) return console.log(err)
                return data
            })
        } else {
            await this.update(date, type)
        }
    }

    async update(date, type) {
        const stat = await this.get(date)
        stat[type]++
        await Stat.updateOne({date: date}, stat)
    }

    async get(date) {
        return await Stat.findOne({date: date})
    }
}
