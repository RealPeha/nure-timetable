const Keyboard    = require('../utils/keyboard'),
      Markup      = require('telegraf/markup'),
      WizardScene = require('telegraf/scenes/wizard'),
      User        = require('../utils/user'),
      Fun         = require('../utils/forfun'),
      Group       = require('../utils/groups')

const select = new WizardScene('select',
    async (ctx) => { 
        const user = ctx.session.user
        let recentGroups = []
        for (let i = 0; i < user.last_group.length; i++) {
            recentGroups.push(Markup.callbackButton(user.last_group[i], user.last_group[i]))
        }
        await ctx.reply('Введите краткое название группы (например, КСТЗІу-18-1 или кстзиу-18-1 или кстзиу 18 1)', Keyboard.new().clear())
        if (recentGroups.length) {
            ctx.reply('Или выберите её из списка недавних', Markup.inlineKeyboard(recentGroups, {
                columns: 2
            }).extra())
        }
        return ctx.wizard.next()
    },
    async (ctx) => {
        const id = ctx.message ? ctx.message.from.id : ctx.update.callback_query.from.id
        let group = ctx.message ? ctx.message.text : ctx.update.callback_query.data
        
        group = group.replace(/\И/gi, 'І').replace(/\s/g, '-')
        //const allGroups = await Schedule.allGroups()
        const allGroups = ctx.session.groups
    
        const allGroupsLower = {}
        for (var key in allGroups) {
            if (group.toLowerCase() == key.toLowerCase()) {
                group = key
            }
            allGroupsLower[key.toLowerCase()] = allGroups[key]
        }
        if (!allGroups) {
            ctx.reply('Произошла ошибка на сервере. Попробуйте позже')
            return ctx.scene.enter('settings')
        } else if (!allGroupsLower[group.toLowerCase()]) {
            ctx.reply('Группа не найдена. Возможно, вы допустили ошибку в её названии или же она действительно не существует')
            return ctx.scene.enter('settings')
        } else {
            ctx.replyWithHTML(`<i>${Fun.load()}</i>`)
            const user = ctx.session.user
            user.group = [group]
            if (!user.last_group.includes(group)) {
                user.last_group.push(group)
            }
            user.group_id = [allGroups[group]]
            await User.update(id, user)
            await Group.add(group, allGroups[group])
            return ctx.scene.enter('menu')
        }
    }                  
)

module.exports = select