const WizardScene = require('telegraf/scenes/wizard'),
      Keyboard    = require('../utils/keyboard'),
      User        = require('../utils/user')

const setTime = new WizardScene('set-time',
    (ctx) => {
        ctx.reply('Введите время в минутах', Keyboard.new().clear())
        return ctx.wizard.next()
    },
    async (ctx) => {
        const id = ctx.message.from.id
        const time = ctx.message.text
        
        user = ctx.session.user
        user.time = time
        await User.update(id, user)
    
        return ctx.scene.enter('settings')
    }                  
)

module.exports = setTime