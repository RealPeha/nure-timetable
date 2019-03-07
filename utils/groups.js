const Group = require('../mongo').Group,
      Cist = require('./cist'),
      Update = require('./update'),
      moment = require('moment')

module.exports = new class {
    async exist(group) {
        return await this.get(group) ? true : false
    }
    async add(group, groupId) {
        const isGroup = await this.exist(group)
        if (!isGroup) {
            const data = await Cist.getSchedules(groupId)
            const json = JSON.stringify(data).replace(/type/g, 's_type')
            const newdata = JSON.parse(json)
            const groups = new Group(newdata)
            await Update.add(group)
            return await groups.save()
        }
        return false
    }
    async update(group, newdata, groupId = 0) {
        if (!this.exist(group)) {
            await Group.updateOne({group_name: group}, newdata)
        } else {
            await this.add(group, groupId)
        }
    }
    async get(group) {
        return await Group.findOne({group_name: group})
    }
}