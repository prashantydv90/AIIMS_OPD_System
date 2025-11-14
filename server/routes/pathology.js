import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/pathology/visit/:id - fetch visit details + patient + doctor + investigations
router.get("/visit/:id", async (req, res) => {
	const visitId = Number(req.params.id);
	if (!visitId) return res.status(400).json({ error: "Invalid visit id" });
	try {
		const [[visit]] = await pool.query(
			`SELECT v.*,
              p.FirstName AS PatientFirstName,
              p.LastName AS PatientLastName,
              p.ABHA_ID,
              p.MobileNo AS PatientMobileNo,
              d.FirstName AS DoctorFirstName,
              d.LastName AS DoctorLastName,
              dept.DeptName
           FROM OPDVisit v
           LEFT JOIN Patient p ON p.PatientID = v.PatientID
           LEFT JOIN Doctor d ON d.DoctorID = v.DoctorID
           LEFT JOIN Department dept ON dept.DepartmentID = d.DepartmentID
           WHERE v.VisitID = ?`,
			[visitId]
		);
		if (!visit) return res.status(404).json({ error: "Visit not found" });

		const [investigations] = await pool.query(
			`SELECT * FROM InvestigationOrder WHERE VisitID = ? ORDER BY OrderedDate DESC, OrderID DESC`,
			[visitId]
		);

		res.json({ visit, investigations });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// POST /api/pathology/visit/:id/investigation - add investigation order
router.post("/visit/:id/investigation", async (req, res) => {
	const visitId = Number(req.params.id);
	if (!visitId) return res.status(400).json({ error: "Invalid visit id" });
	const { TestCode, TestName, OrderedDate, ResultDate, ResultValue, Comments } = req.body || {};
	if (!TestName && !TestCode) {
		return res.status(400).json({ error: "TestCode or TestName required" });
	}
	try {
		const [result] = await pool.query(
			`INSERT INTO InvestigationOrder
       (VisitID, TestCode, TestName, OrderedDate, ResultDate, ResultValue, Comments)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[
				visitId,
				TestCode || null,
				TestName || null,
				OrderedDate || new Date(),
				ResultDate || null,
				ResultValue || null,
				Comments || null,
			]
		);
		res.status(201).json({ OrderID: result.insertId });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// PATCH /api/pathology/investigation/:id - update result info
router.patch("/investigation/:id", async (req, res) => {
	const orderId = Number(req.params.id);
	if (!orderId) return res.status(400).json({ error: "Invalid order id" });
	const { ResultDate, ResultValue, Comments } = req.body || {};
	try {
		await pool.query(
			`UPDATE InvestigationOrder
         SET ResultDate = COALESCE(?, ResultDate),
             ResultValue = COALESCE(?, ResultValue),
             Comments = COALESCE(?, Comments)
         WHERE OrderID = ?`,
			[ResultDate || null, ResultValue || null, Comments || null, orderId]
		);
		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

export default router;


