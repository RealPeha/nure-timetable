const Session = require('../mongo').Session

module.exports = function () {
    return async (ctx, next) => {
        const key = ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`
        if (!key) {
            return next(ctx)
        }
        let session = await Session.findOne({ key: key })
        session = session ? session.session : {}
        Object.defineProperty(ctx, 'session', {
            get: () => session,
            set: (newValue) => { session = Object.assign({}, newValue) }
        })
        return next(ctx).then(() => {
            return Session.updateOne({key: key}, { $set: { session: session } }, { upsert: true })
        })
    }
}
