const Scene    = require('telegraf/scenes/base'),
      Keyboard = require('../utils/keyboard'),
      User     = require('../utils/user'),
      Schedule = require('../utils/schedule'),
      Markup   = require('telegraf/markup'),
      Router   = require('telegraf/router')

const joinGroup = new Router(({ callbackQuery }) => {
  if (!callbackQuery.data) {
    return
  }
  const parts = callbackQuery.data.split(':')
  return {
    route: parts[0],
    state: {
      group: parts[1]
    }
  }
})

joinGroup.on('set', async (ctx) => {
    const user  = ctx.session.user,
          id    = ctx.update.callback_query.from.id,
          group = ctx.state.group
    const allGroups = await Schedule.allGroups()
    user.group.push(group)   
    user.group_id.push(allGroups[group])
    await User.update(id, user)
    //ctx.editMessageText(schedule, inlineKeyboard.extra({parse_mode: 'HTML'}))
    ctx.scene.enter('settings')
    return ctx.answerCbQuery()
})

joinGroup.on('cancel', (ctx) => {
    ctx.scene.enter('settings')
    return ctx.answerCbQuery() 
})

module.exports = new Scene('join')
.enter(async (ctx) => {
    try {
        const user = ctx.session.user
        let groups = user.group
        await ctx.reply('С помощью этой настройки вы можете сделать так, чтобы отображалось рассписание сразу нескольких групп вместо того, чтобы каждый раз отдельно менять группу. Чтобы отключить эту настройку, перевыберите группу нажав на пункт "Сменить группу" в настройках', Keyboard.new().clear())
        let inlineKeyboard = []
        for (let group of user.last_group) {
            if (!groups.includes(group)) {
                inlineKeyboard.push(Markup.callbackButton(group, 'set:' + group))
            }
        }
        if (inlineKeyboard.length > 0) {
            inlineKeyboard.push(Markup.callbackButton('Отмена', 'cancel'))
            ctx.reply('Выберите группу, которую вы хотите добавить к текущей', Markup.inlineKeyboard(inlineKeyboard, {
                columns: 2
            }).extra())
        } else {
            await ctx.replyWithHTML('У вас нету сохраненных групп или только одна, для начала добавьте их через меню <b>"Сменить группу"</b> в настройках')
            return ctx.scene.enter('settings')
        }
    } catch(err) {
        console.log(`(join) User ${ctx.from.id} blocked`)
    }
})
.on('callback_query', joinGroup)
