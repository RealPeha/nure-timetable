const Telegraf  = require('telegraf'),
      rateLimit = require('telegraf-ratelimit'),
      Stage     = require('telegraf/stage')

const config = require('./config.json')

const { stat, session } = require('./middlewares')
const User  = require('./utils/user')

const menu = require('./scenes/menu'),
      select = require('./scenes/select'),
      settings = require('./scenes/settings'),
      join = require('./scenes/join')

const stage = new Stage([menu, settings, select, join])
//Для уведомлений
/*const cron = require('cron')

const cronJob = cron.job('* 5 * * * *', () => {
    Notify.start()
})
cronJob.start()*/

const bot = new Telegraf(config.token)

bot.use(session())
bot.use(stat())
bot.use(stage.middleware())
bot.use(rateLimit())

bot.start(async (ctx) => {
    console.log('start', ctx.session)
    const id = ctx.from.id
    const user = await User.get(id)
    if (user) {
        ctx.session.user = user
        return ctx.scene.enter('menu')
    } else {
        const regUser = await User.reg(ctx.from)
        ctx.session.user = regUser
        try {
            ctx.reply('Этот бот поможет тебе всегда узнавать актуальное расписание пар для твоей группы. Чтобы узнать расписание просто укажи свою группу')
            return ctx.scene.enter('select')
        } catch (err) {
            console.log(`(start) User ${id} blocked`)
        }
        //.then(() => ctx.scene.enter('select'))
        //.catch(err => console.log(`(start) User ${id} blocked`))
    }
})
/*bot.launch({
  webhook: {
    domain: `https://${config.app}.appspot.com/${config.token}`,
    port: process.env.PORT || 8080
  }
})*/
bot.catch(err => console.log(err))
bot.launch()
