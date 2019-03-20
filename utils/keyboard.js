const Markup = require('telegraf/markup')

module.exports = new class {
    constructor() {
        this.buttons = {}
        this.id = 0
    }
    //Создание клавиатуры
    new(id, but = []) {
        this.buttons[this.id] = []
        if (arguments.length == 0) {
            this.id = 0
            this.buttons[this.id][0] = []
        } else if (typeof id == 'Number') {
            this.id = id
            this.buttons[this.id][0] = but
        } else {
            this.id = 0
            this.buttons[this.id][0] = id
        }
        return this
    }
    rowAdd(index, but) {
        this.buttons[this.id][index] = but
    }
    existRow(index) {
        return this.buttons[this.id][index] ? true : false
    }
    //Добавление кнопки в массив кнопок. Аргумент - массив
    add(but, index = 0) {
        if (!this.exist(but[0])) {
            if (this.existRow(index)) {
                this.buttons[this.id][index] = this.buttons[this.id][index].concat(but)
            } else {
                this.rowAdd(index, but)
            }
        }
        return this
    }
    //Проверка на существование кнопки в массиве кнопок
    exist(but) {
        for (let i in this.buttons[this.id]) {
            if (this.buttons[this.id][i].indexOf(but) >= 0) {
                return true
            }
        }
        return false
    }
    //Удаление кнопки из массива кнопок
    remove(but) {
        if (this.exist(but)) {
            for (let i in this.buttons[this.id]) {
                if (this.buttons[this.id][i].indexOf(but) >= 0) {
                    this.buttons[this.id][i].splice(this.buttons[this.id][i].indexOf(but), 1)
                }
            }
        }
        return this
    }
    rename(but, newbut) {
        if (this.exist(but)) {
            for (let i in this.buttons[this.id]) {
                const pos = this.buttons[this.id][i].indexOf(but)
                if (pos >= 0) {
                    this.buttons[this.id][i][pos] = newbut
                }
            }
        }
        return this
    }
    //Проверка на наличие кнопок
    empty() {
        return !this.buttons[this.id][0].length ? true : false
    }
    //Привязка массива кнопок к определенному человеку по его id
    ID(id) {
        this.id = id
        return this
    }
    //Отрисовка клавиатуры
    draw() {
        if (!this.buttons[this.id]) {
            return this.clear()
        }
        if (!this.existRow(1)) {
            const linearKeyboard = this.buttons[this.id][0].map(val => [val])
            return Markup.keyboard(linearKeyboard).resize().extra()
        }
        return Markup.keyboard(this.buttons[this.id]).resize().extra()
    }
    //Очистка клавиатуры
    clear() {
        this.buttons[this.id] = []
        return Markup.removeKeyboard().extra()
    }
}
