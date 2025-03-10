const BaseService = require('./BaseService');
const User = require('../models/User');
const Room = require('../models/Room');
const sequelize = require('../config/database');

class UserService extends BaseService {
    constructor() {
        super(User);
    }

    async create(payload) {
        const transaction = await sequelize.transaction();
        try {
            const { room_ids, ...userData } = payload; // Lấy danh sách phòng & dữ liệu người dùng

            // Tạo user mới
            const user = await User.create(userData, { transaction });

            // Gán phòng nếu có
            if (room_ids && room_ids.length > 0) {
                await user.setRooms(room_ids, { transaction });
            }

            await transaction.commit();
            return user;
        } catch (error) {
            await transaction.rollback();
            console.error('Lỗi khi tạo user:', error);
            return false;
        }
    }

    async update(id, payload) {
        const transaction = await sequelize.transaction();
        try {
            const { room_ids, ...updateData } = payload;

            // Cập nhật user
            const [updated] = await User.update(updateData, {
                where: { id },
                transaction
            });

            if (!updated) throw new Error('User không tồn tại hoặc không cập nhật được');

            const user = await User.findByPk(id, { transaction });

            // Cập nhật danh sách phòng nếu có
            if (room_ids) {
                await user.setRooms(room_ids, { transaction });
            }

            await transaction.commit();
            return user;
        } catch (error) {
            await transaction.rollback();
            console.error('Lỗi khi cập nhật user:', error);
            return false;
        }
    }
}

module.exports = new UserService();
