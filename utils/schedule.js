const moment = require('moment'),
      Cist   = require('./cist'),
      Group  = require('./groups'),
      Update = require('./update'),
      Fun    = require('./forfun')

module.exports.thisWeek = (start) => {
    const day = moment(start, 'DD.MM.YYYY')
    let week = []
    week.push(day.format('DD.MM.YYYY'))
    for (let i = 0; i < 6; i++) {
        week.push(day.add(1, 'days').format('DD.MM.YYYY'))
    }
    return week
}

const daysFull = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
const typesSubject = ['ПЗ', 'ЛР', 'Лекция', 'Семинар', 'Консультация', 'Самостоятельная работа', 'Зачет', 'Экзамен', 'Презентация', 'Мастер-класс', 'День открытых дверей', 'Экскурсия', 'Фильм', 'Концерт, научное шоу', 'Конкурс', 'Конференция', 'Круглый стол', 'Олимпиада', 'Выставка', 'Курсовая работа']
module.exports.getScheduleDay = async (group, day) => {
    const dayNumber = moment(day, 'DD.MM.YYYY').day()-1
    const dayLessons = {titleFull: daysFull[dayNumber], lessons: []}
    let schedule = (await Group.get(group))
    if (!schedule) {
        return {titleFull: daysFull[dayNumber], lessons: [], err: Fun.err()/*'Произошла ошибка при загрузке данных'*/}
    } else {
        schedule = schedule.days
    }
    if (!schedule[dayNumber]) {
        return {titleFull: daysFull[dayNumber], lessons: []}
    }
    let d = 0
    for (let i = 0; i < schedule[dayNumber].lessons.length; i++) {
        const lesson = schedule[dayNumber].lessons[i]
        //Убираем звездочку в начале названия предмета
        if (lesson.subject[0] == '*') lesson.subject = lesson.subject.substr(1)
        //Избавляемся от аудиторий физкультуры
        let auditory = (lesson.auditories[0].auditory_name == 'спорт' || lesson.auditories[0].auditory_name == 'спорт1' || lesson.auditories[0].auditory_name == 'спорт2') ? false : lesson.auditories[0].auditory_name
        //Создаем список преподавателей
        let teachers = []
        if (lesson.teachers.length == 0) {
            teachers = false
        } else {
            for ({teacher_name} of lesson.teachers) {
                teachers.push(teacher_name)
            }
            teachers = teachers.join(', ')
        }
        if (lesson.dates) {
            if (lesson.dates.includes(day)) {
                dayLessons.lessons[d] = {
                    subject: lesson.subject,
                    type: typesSubject[lesson.s_type],
                    start: lesson.time_start,
                    end: lesson.time_end,
                    teacher: teachers,
                    auditory_name: auditory
                }
                d++
            }
        } else if (lesson.date_start == day) {
            dayLessons.lessons[d] = {
                subject: lesson.subject,
                type: typesSubject[lesson.s_type],
                start: lesson.time_start,
                end: lesson.time_end,
                teacher: teachers,
                auditory_name: auditory
            }
            d++
        }
    }
    return dayLessons
}

module.exports.allGroups = async () => {
    const faculties = await Cist.getFaculties()
        .catch(err => false)
    const allGroup = {}
    if (!faculties) {
        return false
    }
    for ({faculty_id} of faculties) {
        const groups = await Cist.getGroups(faculty_id)
        for (group of groups) {
            allGroup[group.group_name] = group.group_id
        }
    }
    return allGroup
}

module.exports.update = async (user) => {
    let groups = user.group
    for (let i = 0; i < groups.length; i++) {
        const data = await Cist.getSchedules(user.group_id[i])
        const json = JSON.stringify(data).replace(/type/g, 's_type')
        const newdata = JSON.parse(json)
        await Group.update(groups[i], newdata, user.group_id[i])
        await Update.update(groups[i])
    }
}