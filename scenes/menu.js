const Scene    = require('telegraf/scenes/base'),
      Keyboard = require('../utils/keyboard'),
      User     = require('../utils/user'),
      Schedule = require('../utils/schedule'),
      Fun      = require('../utils/forfun'),
      Markup   = require('telegraf/markup'),
      Router   = require('telegraf/router'),
      moment   = require('moment')

const { session } = require('../middlewares')

async function loadSchedule(user, group) {
    const oneDay = await Schedule.getScheduleDay(group, user.current_day)
    let schedule = `<b>${user.current_week.start} - ${user.current_week.end}</b>\n\n<b>${(oneDay.titleFull || 'Воскресенье')} - ${user.current_day}</b>\n\n`
    const lessons = oneDay.lessons
    if (lessons.length == 0 && !oneDay.err) {
        schedule += `<i>${Fun.free()}</i>`
    } else if (oneDay.err) {
        schedule += `<i>${oneDay.err}</i>`
    }
    //for (let i = 0; i < lessons.length; i++) {
    for (let lesson of lessons) {
        schedule += `⏰ <i>${lesson.start} - ${lesson.end}</i>\n<b>📖 Предмет:</b> ${lesson.subject} (<i>${lesson.type}</i>)\n`
        if (lesson.teacher != false) {
            schedule += `<b>🤓 Преподаватель:</b> ${lesson.teacher}\n`
        }
        if (lesson.auditory_name != false) {
            schedule += `<b>🚪 Аудитория:</b> ${lesson.auditory_name}\n`
        }
        schedule += `\n`
    }
    return schedule
}

const calendar = new Router(({ callbackQuery }) => {
    if (!callbackQuery.data) {
        return
    }
    const parts = callbackQuery.data.split(':')
    return {
        route: parts[0],
        state: {
            day: parseInt(parts[1], 10) || 0,
            group: parts[2]
        }
    }
})

calendar.on('day', async (ctx) => {
    const user = ctx.session.user,
          id   = ctx.update.callback_query.from.id,
          week = Schedule.thisWeek(user.current_week.start),
          day  = ctx.state.day,
          group  = ctx.state.group
    if (user.current_day == week[day]) {
        return ctx.answerCbQuery()  
    }
    user.current_day = week[day]
    User.update(id, user)
    const schedule = await loadSchedule(user, group)
    const inlineKeyboard = genInlineKeyboard(group)
    ctx.editMessageText(schedule, inlineKeyboard.extra({parse_mode: 'HTML'}))
    return ctx.answerCbQuery()  
})

calendar.on('week', async (ctx) => {
    const user = ctx.session.user,
          id   = ctx.update.callback_query.from.id,
          week  = ctx.state.day,
          group  = ctx.state.group
    
    if (week > 0) {
        const next = nextWeek(user.current_week.start)
        user.current_week = {
            start: next.start,
            end: next.end
        }
        user.current_day = user.current_week.start
    } else {
        const prev = prevWeek(user.current_week.start)
        user.current_week = {
            start: prev.start,
            end: prev.end
        }
        user.current_day = user.current_week.end
    }
    User.update(id, user)
    const schedule = await loadSchedule(user, group)
    const inlineKeyboard = genInlineKeyboard(group)
    ctx.editMessageText(schedule, inlineKeyboard.extra({parse_mode: 'HTML'}))
    return ctx.answerCbQuery()
})
const nextWeek = (current_week) => {
    const now = moment(current_week, 'DD.MM.YYYY')
    const nextWeek = now.endOf('isoWeek').add(1, 'days')
    //console.log(now, nextWeek)
    return {start: nextWeek.format('DD.MM.YYYY'), end: nextWeek.endOf('isoWeek').add(-2, 'days').format('DD.MM.YYYY')}
}
const prevWeek = (current_week) => {
    const now = moment(current_week, 'DD.MM.YYYY')
    const nextWeek = now.add(-1, 'days').startOf('isoWeek')
    return {start: nextWeek.format('DD.MM.YYYY'), end: nextWeek.endOf('isoWeek').add(-2, 'days').format('DD.MM.YYYY')}
}

calendar.on('today', async (ctx) => {
    const user = ctx.session.user,
          id   = ctx.update.callback_query.from.id,
          day  = ctx.state.day,
          group  = ctx.state.group
    const now = moment()
    const next = now.add(day, 'days')
    const nextDay = next.format('DD.MM.YYYY')
    if (user.current_day == nextDay) {
        return ctx.answerCbQuery()
    }
    user.current_day = nextDay
    user.current_week = {
        start: next.startOf('isoWeek').format('DD.MM.YYYY'),
        end: next.endOf('isoWeek').format('DD.MM.YYYY')
    }
    User.update(id, user)
    const schedule = await loadSchedule(user, group)
    const inlineKeyboard = genInlineKeyboard(group)
    ctx.editMessageText(schedule, inlineKeyboard.extra({parse_mode: 'HTML'}))
    return ctx.answerCbQuery()
})

function genInlineKeyboard(group) {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton('Сегодня', 'today:0:'+group),
            Markup.callbackButton('На завтра', 'today:1:'+group),
        ],
        [
            Markup.callbackButton('Пн', 'day:0:'+group),
            Markup.callbackButton('Вт', 'day:1:'+group),
            Markup.callbackButton('Ср', 'day:2:'+group),
            Markup.callbackButton('Чт', 'day:3:'+group),
            Markup.callbackButton('Пт', 'day:4:'+group),
            Markup.callbackButton('Сб', 'day:5:'+group)
        ],
        [
            Markup.callbackButton('Предыдущая неделя', 'week:-1:'+group),
            Markup.callbackButton('Следующая неделя', 'week:1:'+group),
        ]
    ])
}

module.exports = new Scene('menu')
.enter(async (ctx) => {
    try {
        console.log('menu', ctx.session)
        const user = ctx.session.user
        if (!user.group.length) {
            ctx.scene.enter('select')
        } else {
            for (let group of user.group) {
                const schedule = await loadSchedule(user, group)
                await ctx.replyWithHTML(`🗓 Расписание для группы <b>${group}</b>`, Keyboard.new(['Настройки', 'Помощь']).draw())
                const inlineKeyboard = genInlineKeyboard(group)
                await ctx.replyWithHTML(schedule, inlineKeyboard.extra({parse_mode: 'HTML'}))
            }
        }
    } catch(err) {
        console.log(`(menu) User ${ctx.from.id} blocked`)
    }
})
.hears('Настройки', ({ scene }) => {
    scene.enter('settings')
})
.hears('Помощь', ({ reply }) => {
    reply('Если бот перестал реагировать на ваши команды, просто повторно введи команду /start, чтобы перезапустить его.\n\nСейчас бот находится в рабочем состоянии, но если вас заинтересует, то в планах добавить настраиваемые уведомления перед парой (либо на определенное время) в стиле "Через 10 минут начинается такая-то пара"\n\nА вообще если у вас есть какие-либо предложения или вопросы, то пишите сюда @Ballet228')
})
.hears('Выбрать группу', ({ scene }) => {
    scene.enter('select')
})
.hears(/\/send ([\s\S]*)/i, (ctx) => require('../utils/broadcast')(ctx))
.on('callback_query', calendar)
