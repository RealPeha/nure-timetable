const mongoose = require("mongoose")
const Schema = mongoose.Schema

//Users
const userScheme = new Schema({
    id: Number,
    nick: String,
    group: [String],
    group_id: [Number],
    notify: Boolean,
    time: Number,
    first_name: String,
    last_name: String,
    last_group: [String],
    current_week: {
        start: String,
        end: String
    },
    current_day: String
})

//Updates
const updateScheme = new Schema({
    group: String,
    date: String,
    time: String
})

//Groups
const groupScheme = new Schema({
    group_name: String,
    days: [{
        weekday: Number,
        lessons: [{
            subject: String,
            s_type: Number,
            time_start: String,
            time_end: String,
            date_start: String,
            date_end: String,
            dates: [String],
            teachers: [{
                teacher_name: String
            }],
            auditories: [{
                auditory_name: String,
                auditory_address: String
            }]
        }]
    }]
})

module.exports.Group  = mongoose.model("Group", groupScheme, 'groups')
module.exports.Update = mongoose.model("Update", updateScheme, 'updates')
module.exports.User   = mongoose.model("User", userScheme, 'users')