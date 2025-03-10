const UserService = require('../services/UserService');

class UserController {
    // [GET] /users
    async index(req, res) {
        try {
            const { keyword, status, limit = 10 } = req.query;
            const condition = {};

            if (status !== undefined) {
                condition.status = status;
            }

            const users = await UserService.paginate(condition, keyword, limit);

            if (users.length > 0) {
                return res.status(200).json({
                    status: 200,
                    message: 'success',
                    data: users
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

    // [GET] /users/:id
    async show(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService.getById(id);

            if (!user) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }

            return res.status(200).json({
                status: 200,
                message: 'success',
                data: user
            });
        } catch (error) {
            console.error('Error in show:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    // [POST] /users
    async create(req, res) {
        try {
            const user = await UserService.create(req.body);

            if (user) {
                return res.status(201).json({
                    status: 201,
                    message: 'Created',
                    data: user
                });
            } else {
                return res.status(500).json({ status: 500, message: 'Server Error' });
            }
        } catch (error) {
            console.error('Error in create:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    // [PATCH] /users/:id
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
                message: 'success',
                data: updatedUser
            });
        } catch (error) {
            console.error('Error in update:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    // [DELETE] /users/:id
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await UserService.delete(id);

            if (!deleted) {
                return res.status(404).json({ status: 404, message: 'Error' });
            }

            return res.status(204).send(); // No content response
        } catch (error) {
            console.error('Error in delete:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }
}

module.exports = new UserController();
