const { RoomCatalogue, User,Department } = require('../models');
const { count } = require('../models/Room');
const roomService = require('../services/RoomService');
const { Op } = require("sequelize");

class RoomController {
    async index(req, res) {
        try {
            const { keyword, status,exclude_id } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) ;
            const offset = (page - 1) * limit;

            const whereCondition = {};
            if (status) whereCondition.status = status;
            if (keyword) {
                whereCondition[Op.or] = [
                    { code: { [Op.like]: `%${keyword}%` } },
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
                count:['beds'],
                relations:[
                    { model: Department, as: 'departments' },
                    { model: RoomCatalogue, as: 'room_catalogues' },
                    { model: User, as: 'users' }

                ]
            };

            const rooms = await roomService.paginate(options)
            const totalPages = Math.ceil(rooms.count / limit);

            if (rooms.rows.length > 0) {
                return res.status(200).json({
                    status: 200,
                    message: 'Success',
                    data: {
                        data:rooms.rows,
                        current_page: page,
                        first_page_url: `${req.protocol}://${req.get("host")}${req.baseUrl}?page=1`,
                        from: offset + 1,
                        last_page: totalPages,
                        last_page_url: `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${totalPages}`,
                        next_page_url: page < totalPages ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page + 1}` : null,
                        prev_page_url: page > 1 ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page - 1}` : null,
                        path: `${req.protocol}://${req.get("host")}${req.baseUrl}`,
                        per_page: limit,
                        to: offset + rooms.rows.length,
                        total: rooms.count,
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
            const room = await roomService.getById(id,{count:'beds',relations:[{ model: User, as: 'users' }]});

            if (!room) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }

            return res.status(200).json({
                status: 200,
                message: 'Success',
                data: { data: room }
            });
        } catch (error) {
            console.error('Error in show:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async create(req, res) {
        try {
            const room = await roomService.create(req.body);
            return res.status(200).json({
                status: 200,
                message: 'Created',
                data: { data: room }
            });
        } catch (error) {
            console.error('Error in create:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const room = await roomService.getById(id);
            if (!room) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }
            const updatedRoom = await roomService.update(id, req.body);
            return res.status(200).json({
                status: 200,
                message: 'Success',
                data: { data: updatedRoom }
            });
        } catch (error) {
            console.error('Error in update:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async remove(req, res) {
        try {
            const { id } = req.params;
            const success = await roomService.delete(id);
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

module.exports = new RoomController();