import { Router } from "express";
import pool from "../db.js";

const router = Router();

// POST /api/reception/patient - add new patient
router.post("/patient", async (req, res) => {
	const {
		ABHA_ID,
		FirstName,
		LastName,
		DOB,
		Gender,
		MobileNo,
		Address,
		City,
		State,
	} = req.body || {};
	if (!FirstName) return res.status(400).json({ error: "FirstName required" });
	try {
		const [result] = await pool.query(
			`INSERT INTO Patient
       (ABHA_ID, FirstName, LastName, DOB, Gender, MobileNo, Address, City, State)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				ABHA_ID || null,
				FirstName,
				LastName || null,
				DOB || null,
				Gender || null,
				MobileNo || null,
				Address || null,
				City || null,
				State || null,
			]
		);
		res.status(201).json({ PatientID: result.insertId });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// POST /api/reception/appointment - schedule appointment
router.post("/appointment", async (req, res) => {
	const {
		PatientID,
		DoctorID,
		DeptID,
		AppointmentDate,
		VisitType,
		AppointmentStatus,
	} = req.body || {};
	if (!PatientID || !DoctorID || !AppointmentDate) {
		return res
			.status(400)
			.json({ error: "PatientID, DoctorID and AppointmentDate are required" });
	}
	try {
		const [result] = await pool.query(
			`INSERT INTO Appointment
       (PatientID, DoctorID, DeptID, AppointmentDate, VisitType, AppointmentStatus)
       VALUES (?, ?, ?, ?, ?, ?)`,
			[
				PatientID,
				DoctorID,
				DeptID || null,
				AppointmentDate,
				VisitType || null,
				AppointmentStatus || "scheduled",
			]
		);
		res.status(201).json({ AppointmentID: result.insertId });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// POST /api/reception/billing - add bill
router.post("/billing", async (req, res) => {
	const { VisitID, AppointmentID, PatientID, Amount, PaidAmount, PaymentMethod, Status } =
		req.body || {};
	if (!PatientID || Amount == null) {
		return res.status(400).json({ error: "PatientID and Amount are required" });
	}
	try {
		const [result] = await pool.query(
			`INSERT INTO Billing
       (VisitID, AppointmentID, PatientID, Amount, PaidAmount, PaymentMethod, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[
				VisitID || null,
				AppointmentID || null,
				PatientID,
				Amount,
				PaidAmount !== undefined && PaidAmount !== "" ? PaidAmount : 0,
				PaymentMethod || null,
				Status || "unpaid",
			]
		);
		res.status(201).json({ BillID: result.insertId });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// PATCH /api/reception/billing/:id - update bill
router.patch("/billing/:id", async (req, res) => {
	const billId = Number(req.params.id);
	if (!billId) return res.status(400).json({ error: "Invalid bill id" });
	const { Amount, PaidAmount, PaymentMethod, Status } = req.body || {};
	try {
		await pool.query(
			`UPDATE Billing
         SET Amount = COALESCE(?, Amount),
             PaidAmount = COALESCE(?, PaidAmount),
             PaymentMethod = COALESCE(?, PaymentMethod),
             Status = COALESCE(?, Status)
         WHERE BillID = ?`,
			[
				Amount !== undefined ? Amount : null,
				PaidAmount !== undefined ? PaidAmount : null,
				PaymentMethod !== undefined ? PaymentMethod : null,
				Status !== undefined ? Status : null,
				billId,
			]
		);
		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

export default router;


