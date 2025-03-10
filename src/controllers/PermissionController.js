const PermissionService = require('../services/PermissionService');
const permissionService = new PermissionService();

exports.index = async (req, res) => {
    const { keyword, status, limit } = req.query;
    const options = { where: {}, limit: Number(limit) || 10 };
    if (status) options.where.status = status;
    if (keyword) options.where.name = { [Op.like]: `%${keyword}%` };
    const permissions = await permissionService.paginate(options);
    res.json({ status: 200, message: 'success', data: permissions });
};

exports.show = async (req, res) => {
    const permission = await permissionService.getById(Number(req.params.id));
    if (permission) res.json({ status: 200, message: 'success', data: permission });
    else res.status(404).json({ status: 404, message: 'Not Found' });
};

exports.create = async (req, res) => {
    const permission = await permissionService.create(req.body);
    res.status(201).json({ status: 201, message: 'created', data: permission });
};

exports.update = async (req, res) => {
    const permission = await permissionService.update(Number(req.params.id), req.body);
    if (permission) res.json({ status: 200, message: 'success', data: permission });
    else res.status(404).json({ status: 404, message: 'Not Found' });
};

exports.remove = async (req, res) => {
    const success = await permissionService.delete(Number(req.params.id));
    if (success) res.status(204).send();
    else res.status(404).json({ status: 404, message: 'Not Found' });
};
