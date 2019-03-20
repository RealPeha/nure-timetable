const Update = require('../mongo').Update
const moment = require('moment')

module.exports = new class {
    async exist(group) {
        return await this.get(group) ? true : false
    }
    async add(group) {
        const isGroup = await this.exist(group)
        if (!isGroup) {
            const updates = new Update({
                group: group,
                date: moment().format('DD.MM.YYYY'),
                time: moment().format('hh:mm')
            }, (err, data) => {
                console.log(`Update ${group} good`)
            })
            return await updates.save()
        }
        return false
    }
    async update(group) {
        await Update.updateOne({group: group}, {
            group: group,
            date: moment().format('DD.MM.YYYY'),
            time: moment().format('hh:mm')
        }, (err, data) => {
            console.log(`Update ${group} good`)
        })
    }
    async get(group) {
        return await Update.findOne({group: group})
    }
}
