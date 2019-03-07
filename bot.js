const Telegraf = require('telegraf'),
      session = require('telegraf/session'),
      Stage = require('telegraf/stage')

const config = require('./config.json')

const User  = require('./utils/user'),
      Mongo = require('./mongo'),
      Schedule  = require('./utils/schedule')

const menu = require('./scenes/menu'),
      select = require('./scenes/select'),
      settings = require('./scenes/settings'),
      settingsTime = require('./scenes/settings-time'),
      join = require('./scenes/join')
      //notify = require('./scenes/notify')

const stage = new Stage([menu, settings, select, settingsTime, join]/*.concat(notify)*/)

//Для уведомлений
/*const cron = require('cron')

const cronJob = cron.job('* 5 * * * *', () => {
    Notify.start()
})
cronJob.start()*/
//

const bot = new Telegraf(config.token)

bot.use(session())
bot.use(stage.middleware())

bot.start(async (ctx) => {
    const id = ctx.message.from.id
    ctx.session.groups = await Schedule.allGroups() //Сразу же создаем массив из всех групп и их id
    const user = await User.get(id)
    if (user) {
        ctx.session.user = user //И запоминаем юзера, чтобы каждый раз не дергать бд
        ctx.scene.enter('menu')
    } else {
        ctx.session.user = await User.register(ctx.message.from) //Регистрируем и запоминаем юзера, чтобы каждый раз не дергать бд
        await ctx.reply('Этот бот поможет тебе всегда узнавать актуальное расписание пар для твоей группы. Чтобы узнать расписание просто укажи свою группу')
        ctx.scene.enter('select')
    }
})
/*bot.launch({
  webhook: {
    domain: `https://${config.app}.appspot.com/${config.token}`,
    port: process.env.PORT || 8080
  }
})*/
bot.launch()