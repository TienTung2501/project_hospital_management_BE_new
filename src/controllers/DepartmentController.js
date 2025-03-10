const DepartmentService = require('../services/DepartmentService');
const departmentService = new DepartmentService();

exports.index = async (req, res) => {
    const { keyword, status, limit } = req.query;
    const options = { where: {}, limit: Number(limit) || 10 };
    if (status) options.where.status = status;
    if (keyword) options.where.name = { [Op.like]: `%${keyword}%` };
    const departments = await departmentService.paginate(options);
    res.json({ status: 200, message: 'success', data: departments });
};

exports.show = async (req, res) => {
    const department = await departmentService.getById(Number(req.params.id));
    if (department) res.json({ status: 200, message: 'success', data: department });
    else res.status(404).json({ status: 404, message: 'Not Found' });
};

exports.create = async (req, res) => {
    const department = await departmentService.create(req.body);
    res.status(201).json({ status: 201, message: 'created', data: department });
};

exports.update = async (req, res) => {
    const department = await departmentService.update(Number(req.params.id), req.body);
    if (department) res.json({ status: 200, message: 'success', data: department });
    else res.status(404).json({ status: 404, message: 'Not Found' });
};

exports.remove = async (req, res) => {
    const success = await departmentService.delete(Number(req.params.id));
    if (success) res.status(204).send();
    else res.status(404).json({ status: 404, message: 'Not Found' });
};
