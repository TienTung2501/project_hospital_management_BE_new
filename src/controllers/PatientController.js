const PatientService = require('../services/PatientService');
const {MedicalRecord, Service, User, Medication} =require('../models')
const patientService = new PatientService();
const { Op } = require("sequelize");

class PatientController {
    async index(req, res) {
        try {
            const { keyword, status,exclude_id } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const whereCondition = {};
            if (status) whereCondition.status = status;
            if (keyword) {
                whereCondition[Op.or] = [
                    { name: { [Op.like]: `%${keyword}%` } },
                    { keyword: { [Op.like]: `%${keyword}%` } },
                ];
            }
            if (exclude_id) {
                whereCondition.id = { [Op.ne]: Number(exclude_id) };
            }
            const options = {
                where: whereCondition,
                limit,
                offset,
                order: [['id', 'DESC']]
            };

            const patients = await patientService.paginate(options)
            const totalPages = Math.ceil(patients.count / limit);

            if (patients.rows.length > 0) {
                return res.status(200).json({
                    status: 200,
                    message: 'Success',
                    data: {
                        data:patients.rows,
                        current_page: page,
                        first_page_url: `${req.protocol}://${req.get("host")}${req.baseUrl}?page=1`,
                        from: offset + 1,
                        last_page: totalPages,
                        last_page_url: `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${totalPages}`,
                        next_page_url: page < totalPages ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page + 1}` : null,
                        prev_page_url: page > 1 ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page - 1}` : null,
                        path: `${req.protocol}://${req.get("host")}${req.baseUrl}`,
                        per_page: limit,
                        to: offset + patients.rows.length,
                        total: patients.count,
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
            const patient = await patientService.getById(id);

            if (!patient) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }

            return res.status(200).json({
                status: 200,
                message: 'Success',
                data: { data: patient }
            });
        } catch (error) {
            console.error('Error in show:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }
    async getHistory(req, res) {
      try {
        const { id } = req.params;
        const relations = [
          {
            model: MedicalRecord,
            as: "medical_records",
            where: { diagnosis: { [Op.ne]: null } }, // Điều kiện where
            required: false, // Không loại bỏ bệnh nhân nếu không có medicalRecords
            include: [
              { model: Service, as: "services" },
              { model: User, as: "users" },
              { model: Medication, as: "medications" },
            ],
          },
        ];
  
        const patient = await patientService.getHistory(id, relations);
  
        if (patient) {
          return res.status(200).json({
            status: 200,
            title: "success",
            data: patient,
          });
        } else {
          return res.status(404).json({
            status: 404,
            title: "Not Found",
            data: null,
          });
        }
      } catch (error) {
        console.error("Error in getHistory:", error);
        return res.status(500).json({
          status: 500,
          title: "Internal Server Error",
          error: error.message,
        });
      }
    }
  
    async create(req, res) {
        try {
            const patient = await patientService.create(req.body);
            return res.status(200).json({
                status: 200,
                message: 'Created',
                data: { data: patient }
            });
        } catch (error) {
            console.error('Error in create:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const patient = await patientService.getById(id);
            if (!patient) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }
            const updatedPatient = await patientService.update(id, req.body);
            return res.status(200).json({
                status: 200,
                message: 'Success',
                data: { data: updatedPatient }
            });
        } catch (error) {
            console.error('Error in update:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async remove(req, res) {
        try {
            const { id } = req.params;
            const success = await patientService.delete(id);
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

module.exports = new PatientController();