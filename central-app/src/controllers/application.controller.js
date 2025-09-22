const applicationService = require('../services/application.service')
const { error, success, custom } = require('../utils/responseBuilder')

async function create(req, res) {
    try {
        const application = await applicationService.create(req.body)
        return success.created(res, 'Application created successfully', application)
    } catch (err) {
        return error.internal(res, 'Failed to create application', err)
    }
}

async function update(req, res) {
    try {
        const application = await applicationService.update(req.body, req.params.id)
        return success.ok(res, 'Application updated successfully', application)
    } catch (err) {
        return error.internal(res, 'Failed to update application', err)
    }
}

const getApplication = async (req, res) => {
    try {
        const application = await applicationService.getApplication(req.query, req.user)
        return custom(res, 200, {...application, message: 'Application fetched successfully'})
    } catch (err) {
        return error.internal(res, 'Failed to fetch application', err)
    }
}

async function getUserCountByApplication(req, res) {
    try {
        const userCount = await applicationService.getUserCountByApplication(req.query)
        return success.ok(res, 'User count fetched successfully', userCount)
    } catch (err) {
        return error.internal(res, 'Failed to fetch user count', err)
    }
}

module.exports = {
    create,
    update,
    getApplication,
    getUserCountByApplication
}