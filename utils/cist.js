const request = require('request-promise')
      
const API_ROOT = 'http://cist.nure.ua/ias/app/tt/'

const getFaculties = async () => {
    const data  = await request({
        method: 'GET',
        uri: API_ROOT + 'get_faculties',
        json: true
    })
    return data.faculties
}
const getGroups = async (facultyId) => {
    const data  = await request({
        method: 'GET',
        uri: API_ROOT + 'get_groups',
        json: true,
        qs: {
            faculty_id: facultyId
        }
    })
    return data.groups
}
const getSchedules = async (groupId) => {
    const data  = await request({
        method: 'GET',
        uri: API_ROOT + 'get_schedule',
        json: true,
        qs: {
            group_id: groupId
        }
    })
    return /*data ? */data/* : []*/
}

module.exports.getFaculties = getFaculties
module.exports.getGroups = getGroups
module.exports.getSchedules = getSchedules