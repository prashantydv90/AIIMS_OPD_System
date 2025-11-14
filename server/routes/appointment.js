import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/appointment/:id - details with patient, doctor, visits, investigations
router.get("/:id", async (req, res) => {
	const appointmentId = Number(req.params.id);
	if (!appointmentId) return res.status(400).json({ error: "Invalid appointment id" });
	try {
		const [[appointment]] = await pool.query(
			`SELECT a.*,
              p.FirstName AS PatientFirstName,
              p.LastName AS PatientLastName,
              p.MobileNo AS PatientMobileNo,
              p.ABHA_ID,
              p.City AS PatientCity,
              p.State AS PatientState,
              d.FirstName AS DoctorFirstName,
              d.LastName AS DoctorLastName,
              dept.DeptName
           FROM Appointment a
           LEFT JOIN Patient p ON p.PatientID = a.PatientID
           LEFT JOIN Doctor d ON d.DoctorID = a.DoctorID
           LEFT JOIN Department dept ON dept.DepartmentID = a.DeptID
           WHERE a.AppointmentID = ?`,
			[appointmentId]
		);
		if (!appointment) return res.status(404).json({ error: "Appointment not found" });

		const [visits] = await pool.query(
			`SELECT v.*,
              doc.FirstName AS DoctorFirstName,
              doc.LastName AS DoctorLastName
           FROM OPDVisit v
           LEFT JOIN Doctor doc ON doc.DoctorID = v.DoctorID
           WHERE v.AppointmentID = ?
           ORDER BY v.VisitDateTime DESC`,
			[appointmentId]
		);

		const [investigations] = await pool.query(
			`SELECT io.*,
              v.VisitDateTime,
              v.DoctorID
           FROM InvestigationOrder io
           LEFT JOIN OPDVisit v ON v.VisitID = io.VisitID
           WHERE v.AppointmentID = ?
           ORDER BY io.OrderedDate DESC, io.OrderID DESC`,
			[appointmentId]
		);

		const [billing] = await pool.query(
			`SELECT * FROM Billing WHERE AppointmentID = ? ORDER BY BillDate DESC`,
			[appointmentId]
		);

		res.json({ appointment, visits, investigations, billing });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// PATCH /api/appointment/:id - update appointment status
router.patch("/:id", async (req, res) => {
	const appointmentId = Number(req.params.id);
	if (!appointmentId) return res.status(400).json({ error: "Invalid appointment id" });
	const { AppointmentStatus, AppointmentDate } = req.body || {};
	if (AppointmentStatus === undefined && AppointmentDate === undefined) {
		return res.status(400).json({ error: "No fields to update" });
	}
	try {
		const updates = [];
		const values = [];
		if (AppointmentStatus !== undefined) {
			updates.push("AppointmentStatus = ?");
			values.push(AppointmentStatus);
		}
		if (AppointmentDate !== undefined) {
			updates.push("AppointmentDate = ?");
			values.push(AppointmentDate);
		}
		values.push(appointmentId);
		await pool.query(`UPDATE Appointment SET ${updates.join(", ")} WHERE AppointmentID = ?`, values);
		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

export default router;


