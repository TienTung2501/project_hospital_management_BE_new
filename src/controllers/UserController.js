const UserService = require('../services/UserService');
const { Department, Position, Room,User } = require("../models");
const { Op } = require("sequelize");
class UserController {
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
                    { email: { [Op.like]: `%${keyword}%` } },
                    { address: { [Op.like]: `%${keyword}%` } },
                    { phone: { [Op.like]: `%${keyword}%` } },
                    { cccd: { [Op.like]: `%${keyword}%` } },
                ];
            }
            if (exclude_id) {
                whereCondition.id = { [Op.ne]: Number(exclude_id) };
            }
            const options = {
                where: whereCondition,
                limit,
                offset,
                order: [['id', 'DESC']],
                relations:[
                    { model: Department, as: 'departments' },
                    { model: Position, as: 'positions' },
                    { model: Room, as: 'rooms' }

                ]

            };
            
            const users = await UserService.paginate(options);
           
            const totalPages = Math.ceil(users.count / limit);
            if (users.rows.length > 0) {
                return res.status(200).json({
                    status: 200,
                    message: 'Success',
                    data: {
                        current_page: page,
                        data: users.rows,
                        first_page_url: `${req.protocol}://${req.get("host")}${req.baseUrl}?page=1`,
                        from: offset + 1,
                        last_page: totalPages,
                        last_page_url: `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${totalPages}`,
                        next_page_url: page < totalPages ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page + 1}` : null,
                        prev_page_url: page > 1 ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page - 1}` : null,
                        path: `${req.protocol}://${req.get("host")}${req.baseUrl}`,
                        per_page: limit,
                        to: offset + users.rows.length,
                        total: users.count,
                    }
                });
            } else {
                return res.status(204).json({
                    status: 204,
                    message: 'No Data'
                });
            }
        } catch (error) {
            console.error('Error in index:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async show(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService.getById(id);
            
            if (!user) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }
            
            return res.status(200).json({
                status: 200,
                message: 'Success',
                data: {
                    data: user,
                }
            });
        } catch (error) {
            console.error('Error in show:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async create(req, res) {
        try {
            const user = await UserService.create(req.body);
            if (user) {
                return res.status(201).json({
                    status: 201,
                    message: 'Created',
                    data: {
                        data: user,
                    }
                });
            } else {
                return res.status(500).json({ status: 500, message: 'Server Error' });
            }
        } catch (error) {
            console.error('Error in create:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService.getById(id);
            if (!user) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }
            const updatedUser = await UserService.update(id, req.body);
            return res.status(200).json({
                status: 200,
                message: 'Success',
                data: {
                    data: updatedUser,
                }
            });
        } catch (error) {
            console.error('Error in update:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await UserService.delete(id);
            if (!deleted) {
                return res.status(404).json({ status: 404, message: 'Error' });
            }
            return res.status(204).send();
        } catch (error) {
            console.error('Error in delete:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }
}

module.exports = new UserController();
