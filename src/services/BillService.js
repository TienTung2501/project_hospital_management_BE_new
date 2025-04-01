const BaseService = require('./BaseService');
const Bill = require('../models/Bill');
const { sequelize } = require('../config/database');  // Import sequelize instance
class BillService extends BaseService {
    constructor() {
        super(Bill);
    }

    // Updated method to handle bill updates
    async update(id, payload) {
        try {
            // Tìm hóa đơn theo ID
            const bill = await Bill.findByPk(id);
            if (!bill) {
                return { status: 404, message: 'Bill not found' };  // Return error if no bill is found
            }
            /*
            Cập nhật các trường của bill: Sử dụng Object.assign(bill, payload) để cập nhật các trường trong instance của hóa đơn.

            Lưu lại instance: Thay vì gọi Bill.update(), bạn sử dụng bill.save() để lưu lại thay đổi. Việc này sẽ đảm bảo rằng các hooks như afterUpdate được gọi khi bạn lưu instance.
            */
            Object.assign(bill, payload);

            // Save the updated bill instance
            await bill.save();  // Lưu lại instance, điều này sẽ kích hoạt các hooks như afterUpdate

            return { status: 200, message: 'Bill updated successfully' };  // Success response
        } catch (error) {
            console.error(error);
            return { status: 500, message: 'Server Error', error: error.message };
        }
    }
}

module.exports = new BillService();

