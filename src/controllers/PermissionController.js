const PermissionService = require('../services/PermissionService');
const permissionService = new PermissionService();
const { Op } = require("sequelize");

class PermissionController {
    async index(req, res) {
        try {
            const { keyword, status,exclude_id } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const whereCondition = {};
            if (status) whereCondition.status = status;
            if (keyword) {
                whereCondition[Op.or] = [
                    { name: { [Op.like]: `%${keyword}%` } },
                    { keyword: { [Op.like]: `%${keyword}%` } },
                ];
            }
            if (exclude_id) {
                whereCondition.id = { [Op.ne]: Number(exclude_id) };
            }
            const options = {
                where: whereCondition,
                limit,
                offset,
                order: [['id', 'DESC']]
            };

            const permissions = await permissionService.paginate(options)
            const totalPages = Math.ceil(permissions.count / limit);

            if (permissions.rows.length > 0) {
                return res.status(200).json({
                    status: 200,
                    message: 'Success',
                    data: {
                        data:permissions.rows,
                        current_page: page,
                        first_page_url: `${req.protocol}://${req.get("host")}${req.baseUrl}?page=1`,
                        from: offset + 1,
                        last_page: totalPages,
                        last_page_url: `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${totalPages}`,
                        next_page_url: page < totalPages ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page + 1}` : null,
                        prev_page_url: page > 1 ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page - 1}` : null,
                        path: `${req.protocol}://${req.get("host")}${req.baseUrl}`,
                        per_page: limit,
                        to: offset + permissions.rows.length,
                        total: permissions.count,
                    }
                });
            } 
            else {
                return res.status(204).json({
                    status: 204,
                    message: 'No Data',
                });
              }
        } 
        catch (error) {
            console.error('Error in index:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async show(req, res) {
        try {
            const { id } = req.params;
            const permission = await permissionService.getById(id);

            if (!permission) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }

            return res.status(200).json({
                status: 200,
                message: 'Success',
                data: { data: permission }
            });
        } catch (error) {
            console.error('Error in show:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async create(req, res) {
        try {
            const permission = await permissionService.create(req.body);
            return res.status(200).json({
                status: 200,
                message: 'Created',
                data: { data: permission }
            });
        } catch (error) {
            console.error('Error in create:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const permission = await permissionService.getById(id);
            if (!permission) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }
            const updatedPermission = await permissionService.update(id, req.body);
            return res.status(200).json({
                status: 200,
                message: 'Success',
                data: { data: updatedPermission }
            });
        } catch (error) {
            console.error('Error in update:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async remove(req, res) {
        try {
            const { id } = req.params;
            const success = await permissionService.delete(id);
            if (!success) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }
            return res.status(200).send();
        } catch (error) {
            console.error('Error in delete:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }
}

module.exports = new PermissionController();