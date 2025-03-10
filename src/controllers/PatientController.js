const patientService = require("../services/patientService");

exports.index = async (req, res) => {
  try {
    const { keyword, status, limit = 10 } = req.query;
    const condition = status ? { status } : {};
    const patients = await patientService.paginate(
      [
        "id",
        "name",
        "birthday",
        "address",
        "phone",
        "cccd_number",
        "health_insurance_code",
        "guardian_phone",
        "gender",
        "description",
        "createdAt",
        "updatedAt",
      ],
      condition,
      [],
      ["name", "description"],
      keyword,
      ["id", "DESC"],
      parseInt(limit)
    );

    return res.status(patients.length ? 200 : 204).json({
      status: patients.length ? 200 : 204,
      message: patients.length ? "success" : "No Data",
      data: patients,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await patientService.getHistory(id);

    if (!patient) {
      return res.status(404).json({ status: 404, title: "Not Found" });
    }

    return res.status(200).json({ status: 200, title: "success", data: patient });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

exports.show = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await patientService.getById(id);

    if (!patient) {
      return res.status(404).json({ status: 404, title: "Not Found" });
    }

    return res.status(200).json({ status: 200, title: "success", data: patient });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const patient = await patientService.create(req.body);

    return res.status(201).json({
      status: 201,
      message: "created",
      data: patient,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await patientService.getById(id);

    if (!patient) {
      return res.status(404).json({ status: 404, title: "Not Found" });
    }

    const updatedPatient = await patientService.update(id, req.body);
    return res.status(200).json({ status: 200, title: "success", data: updatedPatient });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await patientService.delete(id);

    if (!deleted) {
      return res.status(404).json({ status: 404, message: "error" });
    }

    return res.status(204).json({ status: 204, message: "success" });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};
