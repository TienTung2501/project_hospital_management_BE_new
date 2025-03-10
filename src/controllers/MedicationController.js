const MedicationService = require("../services/MedicationService");
const { validationResult } = require("express-validator");

class MedicationController {
  async index(req, res) {
    try {
      const { keyword, status, limit = 10 } = req.query;
      const condition = [];
      if (status !== undefined) {
        condition.push({ status });
      }

      const medications = await MedicationService.paginate(
        ["id", "name", "medication_catalogue_id", "price", "measure", "measure_count", "description", "status"],
        condition,
        ["medicationCatalogue"],
        ["name", "description"],
        keyword,
        [["id", "DESC"]],
        limit
      );

      if (medications.length) {
        return res.status(200).json({ status: 200, message: "success", data: medications });
      }

      return res.status(204).json({ status: 204, message: "No Data", data: [] });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error", error: error.message });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const medication = await MedicationService.getById(id);
      if (medication) {
        return res.status(200).json({ status: 200, message: "success", data: medication });
      }
      return res.status(404).json({ status: 404, message: "Not Found" });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error", error: error.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 400, errors: errors.array() });
    }

    try {
      const medication = await MedicationService.create(req.body);
      return res.status(201).json({ status: 201, message: "created", data: medication });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error", error: error.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 400, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const medication = await MedicationService.getById(id);
      if (!medication) {
        return res.status(404).json({ status: 404, message: "Not Found" });
      }

      const updatedMedication = await MedicationService.update(id, req.body);
      return res.status(200).json({ status: 200, message: "success", data: updatedMedication });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error", error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await MedicationService.delete(id);
      if (deleted) {
        return res.status(204).json({ status: 204, message: "success" });
      }
      return res.status(404).json({ status: 404, message: "error" });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error", error: error.message });
    }
  }
}

module.exports = new MedicationController();
