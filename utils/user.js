const User = require('../mongo').User
const moment = require('moment')

module.exports = new class {
    //Проверка на существование юзера по id
    async exist(id) {
        return (await this.get(id)) ? true : false
    }
    //Регистрация нового юзера
    async reg(user) {
        const users = new User({
            id: user.id,
            nick: user.username,
            group: [],
            group_id: [],
            notify: false,
            time: 0,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            last_group: [],
            current_week: {
                start: moment().startOf('isoWeek').format('DD.MM.YYYY'),
                end  : moment().endOf('isoWeek').add(-2, 'days').format('DD.MM.YYYY')
            },
            current_day: moment().format('DD.MM.YYYY')
        })
        return await users.save()
    }
    //Обновление данных о пользователе
    async update(id, newdata) {
        await User.updateOne({id: id}, newdata)
    }
    //Получение объекта юзера по id
    async get(id) {
        return await User.findOne({id: id})
    }
    //Получение всех пользователей
    async all() {
        return await User.find()
    }
}
