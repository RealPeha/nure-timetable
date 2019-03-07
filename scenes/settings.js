const Scene    = require('telegraf/scenes/base'),
      Keyboard = require('../utils/keyboard'),
      User     = require('../utils/user'),
      Update   = require('../utils/update'),
      Schedule = require('../utils/schedule'),
      Fun      = require('../utils/forfun'),
      Group    = require('../utils/groups')

module.exports = new Scene('settings')
.enter(async (ctx) => {
    let keyboard = Keyboard.new(['Сменить группу', 'Обновить рассписание']).add(['Отображение нескольких групп'], 1)
    const user = ctx.session.user
    let groups = user.group
    //let text = `🔎 <b>Выбранная группа:</b> ${user.group}\n🔔 <b>Уведомления:</b> ${(user.notify ? 'Включены' : 'Выключены')}`
    let text = `🔎 <b>Выбранная группа:</b> ${groups.join(', ')}\n`
    let lastUpdateText = []
    for (let i = 0; i < groups.length; i++) {
        const lastUpdate = await Update.get(groups[i])
        if (lastUpdate) {
            lastUpdateText.push(`${lastUpdate.date} в ${lastUpdate.time}`)
        } else {
            lastUpdateText.push(`неизвестно`)
        }
    }
    if (lastUpdateText.length) {
        text += `💾 <b>Обновлено:</b> ${lastUpdateText.join(', ')}\n`
    } else {
        text += `💾 <b>Обновлено:</b> неизвестно\n`
    }
    //Если уведомления включены, то отображаем кнопки их выключения и настройки
    /*if (user.notify) {
        keyboard.add(['Выключить уведомления', 'Установить время'], 1)
        text += `\n⏰ <b>Время:</b> ${user.time}`
    } else {
        keyboard.add(['Включить уведомления'], 1)
    }
    keyboard.add(['Минималистичное отображение'], 2)*/
    ctx.replyWithHTML(text, keyboard.add(['Назад'], 2/*3*/).draw())
    ctx.session.keyboard = keyboard
})
.hears('Назад', ({ scene }) => {
    scene.enter('menu')
})
.hears('Сменить группу', ({ scene }) => {
    scene.enter('select')
})
.hears('Отображение нескольких групп', ({ scene }) => {
    scene.enter('join')
})
/*.hears('Включить уведомления', async (ctx) => {
    let keyboard = ctx.session.keyboard
    const id   = ctx.message.from.id,
          user = ctx.session.user
    //Меняем значения
    user.notify = true
    user.time = 10
    await User.update(id, user)//Обновляем данные в бд
    ctx.scene.enter('settings')
})*/
.hears('Обновить рассписание', async (ctx) => {
    await ctx.replyWithHTML(`<b>Обновляется...</b>\n\n<b>На заметку:</b> обновление рассписания глобальное. Это означает, что если кто-то до вас уже обновлял эту группу, то вам будет показана актуальная информация. Перед обновлением обращайте внимание на пункт "Обновлено" в настройках, если там стоит сегодняшняя дата, тогда обновлять нету смысла`, Keyboard.new().clear())
    ctx.replyWithHTML(`<i>${Fun.load()}</i>`)
    await Schedule.update(ctx.session.user)
    ctx.scene.enter('settings')
})
/*.hears('Выключить уведомления', async (ctx) => {
    let keyboard = ctx.session.keyboard
    const id   = ctx.message.from.id,
          user = ctx.session.user
    
    //Меняем значения
    user.notify = false
    user.time = 0
    await User.update(id, user) //Обновляем данные в бд
    ctx.scene.enter('settings')
})
.hears('Установить время', (ctx) => {
    ctx.scene.enter('set-time')
})*/