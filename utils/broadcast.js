const User = require('./user')

module.exports = async (ctx) => {
    if (ctx.from.id == 155054210) {
        const text = ctx.match[1]
        const buttons = text.slice(text.indexOf('[')+1, -1).split('--')
        const textWithButtons = text.slice(0, text.indexOf('[')-1)
        const users = await User.all()

        const usersArr = users.map(users => users.id)
        const amountUsers = usersArr.length
        let i = 0
        const broadcast = setInterval(() => {
            if (i < amountUsers) {
                if (buttons.length > 1) {
                    ctx.telegram.sendMessage(usersArr[i], textWithButtons, Markup.inlineKeyboard([[
                            Markup.urlButton(buttons[0], buttons[1])
                        ]]).extra(), {
                        parse_mode: 'HTML'
                    })
                    .catch(err => console.log(`Don't send:`, usersArr[i]))
                } else {
                    ctx.telegram.sendMessage(usersArr[i], text, {
                        parse_mode: 'HTML'
                    })
                    .catch(err => console.log(`Don't send:`, usersArr[i]))
                }
                i++
            } else {
                console.log('Broadcast to ', amountUsers, ' users')
                clearInterval(broadcast)
            }
        }, 200)
    } else {
        console.log('Permission denied')
    }
}
