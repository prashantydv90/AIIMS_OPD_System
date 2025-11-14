import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/patient - list all patients with latest activity
router.get("/", async (_req, res) => {
	try {
		const [rows] = await pool.query(
			`SELECT p.PatientID,
              p.FirstName,
              p.LastName,
              p.ABHA_ID,
              p.MobileNo,
              p.City,
              p.State,
              MAX(a.AppointmentDate) AS LastAppointment,
              MAX(v.VisitDateTime) AS LastVisit,
              COUNT(DISTINCT a.AppointmentID) AS AppointmentCount,
              COUNT(DISTINCT v.VisitID) AS VisitCount
           FROM Patient p
           LEFT JOIN Appointment a ON a.PatientID = p.PatientID
           LEFT JOIN OPDVisit v ON v.PatientID = p.PatientID
           GROUP BY p.PatientID
           ORDER BY p.FirstName, p.LastName`
		);
		res.json(rows);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// GET /api/patient/:id - patient details + appointments + visits + investigations + billing
router.get("/:id", async (req, res) => {
	const patientId = Number(req.params.id);
	if (!patientId) return res.status(400).json({ error: "Invalid patient id" });
	try {
		const [[patient]] = await pool.query(
			`SELECT * FROM Patient WHERE PatientID = ?`,
			[patientId]
		);
		if (!patient) return res.status(404).json({ error: "Patient not found" });

		const [appointments] = await pool.query(
			`SELECT a.*, d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName, dept.DeptName
       FROM Appointment a
       LEFT JOIN Doctor d ON a.DoctorID = d.DoctorID
       LEFT JOIN Department dept ON a.DeptID = dept.DepartmentID
       WHERE a.PatientID = ?
       ORDER BY a.AppointmentDate DESC
       LIMIT 50`,
			[patientId]
		);

		const [visits] = await pool.query(
			`SELECT v.*, doc.FirstName AS DoctorFirstName, doc.LastName AS DoctorLastName
       FROM OPDVisit v
       LEFT JOIN Doctor doc ON v.DoctorID = doc.DoctorID
       WHERE v.PatientID = ?
       ORDER BY v.VisitDateTime DESC
       LIMIT 50`,
			[patientId]
		);

		const [investigations] = await pool.query(
			`SELECT io.*
       FROM InvestigationOrder io
       INNER JOIN OPDVisit v ON io.VisitID = v.VisitID
       WHERE v.PatientID = ?
       ORDER BY io.OrderedDate DESC
       LIMIT 50`,
			[patientId]
		);

		const [billing] = await pool.query(
			`SELECT * FROM Billing WHERE PatientID = ? ORDER BY BillDate DESC LIMIT 50`,
			[patientId]
		);

		res.json({ patient, appointments, visits, investigations, billing });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

export default router;


