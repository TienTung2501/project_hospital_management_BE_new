const express = require('express');
const UserController = require('../controllers/UserController');
const {validateUser,validateUserUpdate} = require('../validators/UserValidator');

const router = express.Router();


router.get('/', UserController.index); // Lấy danh sách user
router.get('/:id', UserController.show); // Lấy thông tin user theo ID
router.post('/create', validateUser, UserController.create); // Tạo user mới
router.patch('/:id', validateUserUpdate, UserController.update); // Cập nhật user
router.delete('/:id', UserController.delete); // Xóa user

module.exports = router;
