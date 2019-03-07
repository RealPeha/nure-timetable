const Scene       = require('telegraf/scenes/base'),
      WizardScene = require('telegraf/scenes/wizard'),
      Keyboard    = require('../utils/keyboard'),
      User        = require('../utils/user'),
      Notify      = require('../utils/notify')

const notify_main = new Scene('notify')
.enter(async (ctx) => {
    ctx.reply('Когда уведомлять?', Keyboard.new(['Перед первой парой']).add(['В другое время'], 1).draw())
})
.hears('Перед первой парой', async (ctx) => {
    Notify.firstPair()
    ctx.scene.enter('notify-setTime')
})
.hears('В другое время', (ctx) => {
    ctx.scene.enter('notify-custom')
})
const notify_custom = new WizardScene('notify-custom',
    (ctx) => {
        ctx.reply('Напишите время, когда нужно отправить уведомление\n', Keyboard.new().clear())
        return ctx.wizard.next()
    },
    async (ctx) => {
        const id = ctx.message.from.id
        const time = ctx.message.text
        
    }                  
)

const notify_setTime = new WizardScene('notify-setTime',
    (ctx) => {
        ctx.reply('За сколько минут уведомлять?', Keyboard.new().clear())
        return ctx.wizard.next()
    },
    async (ctx) => {
        const id = ctx.message.from.id
        const time = ctx.message.text
        
        const user = ctx.session.user
        user.time = time
        await User.update(id, user)
    
        return ctx.scene.enter('settings')
    }                  
)

module.exports = [notify_main, notify_setTime, notify_custom]