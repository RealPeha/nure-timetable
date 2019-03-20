const Keyboard    = require('../utils/keyboard'),
      Markup      = require('telegraf/markup'),
      WizardScene = require('telegraf/scenes/wizard'),
      User        = require('../utils/user'),
      Fun         = require('../utils/forfun'),
      Schedule    = require('../utils/schedule'),
      Group       = require('../utils/groups')

const { session } = require('../middlewares')

const select = new WizardScene('select',
    async (ctx) => {
        try {
            console.log('select', ctx.session)
            const user = ctx.session.user
            const recentGroups = user.last_group.map(lastGroup => Markup.callbackButton(lastGroup,lastGroup))
            await ctx.reply('Введите краткое название группы (например, КСТЗІу-18-1, или кстзиу-18-1, или кстзиу 18 1)', Keyboard.new().clear())
            if (recentGroups.length) {
                ctx.reply('Или выберите её из списка недавних', Markup.inlineKeyboard(recentGroups, {
                    columns: 2
                }).extra())
            }
            return ctx.wizard.next()
        } catch(err) {
            console.log(`(select) User ${ctx.from.id} blocked`)
        }
    },
    async (ctx) => {
        const id = ctx.from.id
        let group = ctx.message ? ctx.message.text : ctx.callbackQuery.data
        if (group == '/start') {
            return ctx.scene.enter('select')
        }
        group = group.replace(/\И/gi, 'І').replace(/\s/g, '-')
    
        const allGroups = Schedule.allGroups()
        const allGroupsLower = {}
        for (let key in allGroups) {
            if (group.toLowerCase() == key.toLowerCase()) {
                group = key
            }
            allGroupsLower[key.toLowerCase()] = allGroups[key]
        }
        const user = ctx.session.user
        if (!allGroupsLower[group.toLowerCase()]) {
            ctx.reply('Группа не найдена. Возможно, вы допустили ошибку в её названии или же она действительно не существует')
            if (!user.group.length) {
                return ctx.scene.enter('select')
            } else {
                return ctx.scene.enter('settings')
            }
        } else {
            ctx.replyWithHTML(`<i>${Fun.load()}</i>`)
            const loadGroup = await Group.add(group, allGroups[group])
            if (loadGroup) {
                ctx.session.select = true
                user.group = [group]
                if (!user.last_group.includes(group)) {
                    user.last_group.push(group)
                }
                user.group_id = [allGroups[group]]
                await User.update(id, user)
            } else {
                await ctx.reply('Не удалось загрузить расписание. Попробуйте позже')
                if (user.group.length) {
                    return ctx.scene.enter('settings')
                }
            }
            ctx.scene.enter('menu')
        }
    }                  
)

module.exports = select
