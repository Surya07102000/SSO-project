const { applications, sequelize } = require('../model/init-models')
const { Op } = require('sequelize');

async function create(data) {
    try {
        const existing = await applications.findOne({
            where: { name: data.name }
        });

        if (existing) {
            const err = new Error('Application with this name already exists');
            err.statusCode = 409;
            throw err;
        }

        const application = await applications.create(data)
        return application
        
    } catch (error) {
        console.error(`[Application Service] : Got error from create application -> ${error.message}`)
        throw error;
    }
}

async function update(data, id) {
    try {
        const existing = await applications.findOne({
            where: {
                name: data.name,
                id: { [Op.ne] : id }
            }
        });

        if (existing) {
            const err = new Error('Application with this name already exists');
            err.statusCode = 409;
            throw err;
        }

        await applications.update(data, { where: { id } });

        const updated = await applications.findByPk(id);
        return updated;
    } catch (error) {
        console.error(`[Application Service] : Got error from update application -> ${error.message}`)
        throw error;
    }
}

const getApplication = async (query, authData) => {
    try {
        const { page, limit, search, sort = 'id', order = 'ASC', id } = query;
        const isPagination = page && limit;

        const whereClause = {
            is_active: true,
            id:{[Op.in]: sequelize.literal(`(select p.application_id from role_permissions rp join permissions p on rp.permission_id = p.id where rp.role_id = ${authData.role})`)}
        };
        if (id) {
            whereClause.id = {
              [Op.and]: [
                whereClause.id,
                id
              ]
            };
          }
        if(search) whereClause.name = { [Op.iLike]: `%${search}%` };

        const orderClause = [[sort, order]];
        const {count,rows} = await applications.findAndCountAll({
            where: whereClause,
            order: orderClause,
            limit: isPagination ? Number(limit) : null,
            offset: isPagination ? (Number(page) - 1) * Number(limit) : null,
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        });

        return {
            data: rows,
            ...(isPagination ? {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / Number(limit))
            } : {})
        }
    } catch (error) {
        console.error(`[Application Service] : Got error from get application -> ${error.message}`)
        throw error;
    }
}

module.exports = {
    create,
    update,
    getApplication,
}
