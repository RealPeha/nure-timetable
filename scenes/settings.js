const Scene    = require('telegraf/scenes/base'),
      Keyboard = require('../utils/keyboard'),
      Update   = require('../utils/update'),
      Schedule = require('../utils/schedule'),
      Fun      = require('../utils/forfun'),
      moment   = require('moment')

module.exports = new Scene('settings')
.enter(async (ctx) => {
    const user = ctx.session.user
    let text = `🔎 <b>Выбранная группа:</b> ${user.group.join(', ')}\n`
    let lastUpdateText = []
    for (let group of user.group) {
        const lastUpdate = await Update.get(group)
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
    ctx.replyWithHTML(text, Keyboard.new(['Сменить группу', 'Обновить рассписание']).add(['Отображение нескольких групп'], 1).add(['Назад'], 2).draw())
    .catch(() => console.log(`(settings) User ${ctx.from.id} blocked`))
})
.hears('Назад', ({ scene }) => scene.enter('menu'))
.hears('Сменить группу', ({ scene }) => scene.enter('select'))
.hears('Отображение нескольких групп', ({ scene }) => scene.enter('join'))
.hears('Обновить рассписание', async (ctx) => {
    const now = moment()
    const lastUpdateAll = (await Update.get(ctx.session.user.group))
    if (!lastUpdateAll) {
        await ctx.reply('Не удалось обновить расписание. Попробуйте позже')
        return ctx.scene.enter('settings')
    }
    let lastUpdate = lastUpdateAll.date
    lastUpdate = moment(lastUpdate, 'DD.MM.YYYY')
    const duration = now.diff(lastUpdate, 'days')
    if (duration > 0) {
        await ctx.replyWithHTML(`<b>Обновляется...</b>\n\n<b>На заметку:</b> обновление рассписания глобальное. Это означает, что если кто-то до вас уже обновлял эту группу, то вам будет показана актуальная информация. Перед обновлением обращайте внимание на пункт "Обновлено" в настройках, если там стоит сегодняшняя дата, тогда обновлять нет смысла`, Keyboard.new().clear())
        ctx.replyWithHTML(`<i>${Fun.load()}</i>`)
        await Schedule.update(ctx.session.user)
    } else {
        await ctx.replyWithHTML(`У вас уже актуальное расписание`, Keyboard.new().clear())
    }
    ctx.scene.enter('settings')
})
