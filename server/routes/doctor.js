import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/doctor - list all doctors with department and shift info
router.get("/", async (_req, res) => {
	try {
		const [rows] = await pool.query(
			`SELECT d.DoctorID,
              d.FirstName,
              d.LastName,
              d.Qualification,
              d.Specialty,
              d.MobileNo,
              d.Email,
              d.RoomAssigned,
              dept.DeptName,
              s.ShiftName,
              s.StartTime,
              s.EndTime,
              COUNT(DISTINCT a.AppointmentID) AS AppointmentCount,
              COUNT(DISTINCT v.VisitID) AS VisitCount
           FROM Doctor d
           LEFT JOIN Department dept ON d.DepartmentID = dept.DepartmentID
           LEFT JOIN Shift s ON d.ShiftID = s.ShiftID
           LEFT JOIN Appointment a ON a.DoctorID = d.DoctorID
           LEFT JOIN OPDVisit v ON v.DoctorID = d.DoctorID
           GROUP BY d.DoctorID
           ORDER BY d.FirstName, d.LastName`
		);
		res.json(rows);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// GET /api/doctor/:id - doctor profile + pending appointments + recent visits
router.get("/:id", async (req, res) => {
	const doctorId = Number(req.params.id);
	if (!doctorId) return res.status(400).json({ error: "Invalid doctor id" });
	try {
		const [[doctor]] = await pool.query(
			`SELECT d.*, dept.DeptName, s.ShiftName, s.StartTime, s.EndTime
       FROM Doctor d
       LEFT JOIN Department dept ON d.DepartmentID = dept.DepartmentID
       LEFT JOIN Shift s ON d.ShiftID = s.ShiftID
       WHERE d.DoctorID = ?`,
			[doctorId]
		);
		if (!doctor) return res.status(404).json({ error: "Doctor not found" });

		const [pendingAppointments] = await pool.query(
			`SELECT a.AppointmentID,
              a.PatientID,
              a.AppointmentDate,
              a.VisitType,
              a.AppointmentStatus,
              TIMESTAMPDIFF(MINUTE, NOW(), a.AppointmentDate) AS MinutesUntil,
              p.FirstName AS PatientFirstName,
              p.LastName AS PatientLastName,
              p.MobileNo AS PatientMobileNo,
              p.ABHA_ID,
              (SELECT MAX(VisitDateTime) FROM OPDVisit v WHERE v.PatientID = a.PatientID) AS LastVisitDate
       FROM Appointment a
       LEFT JOIN Patient p ON p.PatientID = a.PatientID
       WHERE a.DoctorID = ? AND a.AppointmentStatus = 'scheduled'
       ORDER BY a.AppointmentDate ASC
       LIMIT 100`,
			[doctorId]
		);

		const [visits] = await pool.query(
			`SELECT v.*, p.FirstName AS PatientFirstName, p.LastName AS PatientLastName
       FROM OPDVisit v
       LEFT JOIN Patient p ON v.PatientID = p.PatientID
       WHERE v.DoctorID = ?
       ORDER BY v.VisitDateTime DESC
       LIMIT 50`,
			[doctorId]
		);

		res.json({ doctor, pendingAppointments, visits });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// POST /api/doctor/visit - create OPD visit
router.post("/visit", async (req, res) => {
	const { AppointmentID, PatientID, DoctorID, VisitDateTime, Diagnosis, PrescribedMedication, NextVisitDate, Remarks } =
		req.body || {};

	if (!PatientID || !DoctorID) {
		return res.status(400).json({ error: "PatientID and DoctorID are required" });
	}

	try {
		const visitDateTimeValue = VisitDateTime || new Date();
		const [result] = await pool.query(
			`INSERT INTO OPDVisit
       (AppointmentID, PatientID, DoctorID, VisitDateTime, Diagnosis, PrescribedMedication, NextVisitDate, Remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				AppointmentID ?? null,
				PatientID,
				DoctorID,
				visitDateTimeValue,
				Diagnosis ?? null,
				PrescribedMedication ?? null,
				NextVisitDate ?? null,
				Remarks ?? null,
			]
		);
		res.status(201).json({ VisitID: result.insertId });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// PATCH /api/doctor/visit/:id - update visit with diagnosis/prescription/remarks
router.patch("/visit/:id", async (req, res) => {
	const visitId = Number(req.params.id);
	if (!visitId) return res.status(400).json({ error: "Invalid visit id" });
	const { Diagnosis, PrescribedMedication, NextVisitDate, Remarks } = req.body || {};
	if (
		Diagnosis === undefined &&
		PrescribedMedication === undefined &&
		NextVisitDate === undefined &&
		Remarks === undefined
	) {
		return res.status(400).json({ error: "No fields to update" });
	}
	try {
		await pool.query(
			`UPDATE OPDVisit
         SET Diagnosis = COALESCE(?, Diagnosis),
             PrescribedMedication = COALESCE(?, PrescribedMedication),
             NextVisitDate = COALESCE(?, NextVisitDate),
             Remarks = COALESCE(?, Remarks)
         WHERE VisitID = ?`,
			[
				Diagnosis ?? null,
				PrescribedMedication ?? null,
				NextVisitDate ?? null,
				Remarks ?? null,
				visitId,
			]
		);
		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

export default router;


