const User = require('../utils/user')

module.exports = () => {
    return async (ctx, next) => {
        const user = await User.get(ctx.from.id)
        if (user) {
            ctx.session.user = user
            next()
        } else {
            ctx.reply('Вы не зарегистрированы. Введите /start')
            return false
        }
    }
}
