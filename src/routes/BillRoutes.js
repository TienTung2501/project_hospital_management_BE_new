const express = require('express');
const router = express.Router();
const BillController = require('../controllers/BillController');

// Route để lấy danh sách các hóa đơn
router.get('/', BillController.index);

// Route để lấy thông tin một hóa đơn theo ID
router.get('/:id', BillController.show);

// Route để cập nhật thông tin hóa đơn
router.patch('/:id', BillController.update);

// Route để xóa một hóa đơn
router.delete('/:id', BillController.delete);



module.exports = router;
