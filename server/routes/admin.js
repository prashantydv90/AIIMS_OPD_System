import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Helpers
async function insert(table, fields, values) {
	const placeholders = fields.map(() => "?").join(", ");
	const sql = `INSERT INTO ${table} (${fields.join(", ")}) VALUES (${placeholders})`;
	const [result] = await pool.query(sql, values);
	return result.insertId;
}

// List endpoints
router.get("/departments", async (_req, res) => {
	const [rows] = await pool.query(`SELECT * FROM Department ORDER BY DeptName`);
	res.json(rows);
});
router.get("/doctors", async (_req, res) => {
	const [rows] = await pool.query(
		`SELECT d.*, dept.DeptName FROM Doctor d LEFT JOIN Department dept ON d.DepartmentID = dept.DepartmentID ORDER BY d.FirstName, d.LastName`
	);
	res.json(rows);
});
router.get("/staff", async (_req, res) => {
	const [rows] = await pool.query(
		`SELECT s.*, dept.DeptName FROM Staff s LEFT JOIN Department dept ON s.DepartmentID = dept.DepartmentID ORDER BY s.FirstName, s.LastName`
	);
	res.json(rows);
});
router.get("/shifts", async (_req, res) => {
	const [rows] = await pool.query(`SELECT * FROM Shift ORDER BY StartTime`);
	res.json(rows);
});
router.get("/rooms", async (_req, res) => {
	const [rows] = await pool.query(
		`SELECT r.*, d.DeptName FROM Room r LEFT JOIN Department d ON r.DeptID = d.DepartmentID ORDER BY r.FloorNo, r.RoomNo`
	);
	res.json(rows);
});

// Create endpoints
router.post("/department", async (req, res) => {
	const { DeptName, FloorNo, Description } = req.body || {};
	if (!DeptName) return res.status(400).json({ error: "DeptName required" });
	try {
		const id = await insert(
			"Department",
			["DeptName", "FloorNo", "Description"],
			[DeptName, FloorNo ?? null, Description ?? null]
		);
		res.status(201).json({ DepartmentID: id });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

router.post("/shift", async (req, res) => {
	const { ShiftName, StartTime, EndTime, Description } = req.body || {};
	if (!ShiftName || !StartTime || !EndTime)
		return res.status(400).json({ error: "ShiftName, StartTime, EndTime required" });
	try {
		const id = await insert(
			"Shift",
			["ShiftName", "StartTime", "EndTime", "Description"],
			[ShiftName, StartTime, EndTime, Description ?? null]
		);
		res.status(201).json({ ShiftID: id });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

router.post("/doctor", async (req, res) => {
	const {
		FirstName,
		LastName,
		DepartmentID,
		Qualification,
		Specialty,
		MobileNo,
		Email,
		ShiftID,
		ShiftDate,
		RoomAssigned,
	} = req.body || {};
	if (!FirstName) return res.status(400).json({ error: "FirstName required" });
	try {
		const id = await insert(
			"Doctor",
			[
				"FirstName",
				"LastName",
				"DepartmentID",
				"Qualification",
				"Specialty",
				"MobileNo",
				"Email",
				"ShiftID",
				"ShiftDate",
				"RoomAssigned",
			],
			[
				FirstName,
				LastName ?? null,
				DepartmentID ?? null,
				Qualification ?? null,
				Specialty ?? null,
				MobileNo ?? null,
				Email ?? null,
				ShiftID ?? null,
				ShiftDate ?? null,
				RoomAssigned ?? null,
			]
		);
		res.status(201).json({ DoctorID: id });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

router.post("/staff", async (req, res) => {
	const {
		FirstName,
		LastName,
		Role,
		DepartmentID,
		MobileNo,
		Email,
		ShiftID,
		ShiftDate,
		AssignedRoom,
	} = req.body || {};
	if (!FirstName) return res.status(400).json({ error: "FirstName required" });
	try {
		const id = await insert(
			"Staff",
			[
				"FirstName",
				"LastName",
				"Role",
				"DepartmentID",
				"MobileNo",
				"Email",
				"ShiftID",
				"ShiftDate",
				"AssignedRoom",
			],
			[
				FirstName,
				LastName ?? null,
				Role ?? null,
				DepartmentID ?? null,
				MobileNo ?? null,
				Email ?? null,
				ShiftID ?? null,
				ShiftDate ?? null,
				AssignedRoom ?? null,
			]
		);
		res.status(201).json({ StaffID: id });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

router.post("/room", async (req, res) => {
	const { DeptID, RoomNo, FloorNo } = req.body || {};
	try {
		const id = await insert("Room", ["DeptID", "RoomNo", "FloorNo"], [
			DeptID ?? null,
			RoomNo ?? null,
			FloorNo ?? null,
		]);
		res.status(201).json({ RoomID: id });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// Update endpoints
router.patch("/department/:id", async (req, res) => {
	const deptId = Number(req.params.id);
	if (!deptId) return res.status(400).json({ error: "Invalid department id" });
	const { DeptName, FloorNo, Description } = req.body || {};
	try {
		await pool.query(
			`UPDATE Department
         SET DeptName = COALESCE(?, DeptName),
             FloorNo = COALESCE(?, FloorNo),
             Description = COALESCE(?, Description)
         WHERE DepartmentID = ?`,
			[DeptName || null, FloorNo || null, Description || null, deptId]
		);
		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

router.patch("/shift/:id", async (req, res) => {
	const shiftId = Number(req.params.id);
	if (!shiftId) return res.status(400).json({ error: "Invalid shift id" });
	const { ShiftName, StartTime, EndTime, Description } = req.body || {};
	try {
		await pool.query(
			`UPDATE Shift
         SET ShiftName = COALESCE(?, ShiftName),
             StartTime = COALESCE(?, StartTime),
             EndTime = COALESCE(?, EndTime),
             Description = COALESCE(?, Description)
         WHERE ShiftID = ?`,
			[ShiftName || null, StartTime || null, EndTime || null, Description || null, shiftId]
		);
		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

router.patch("/doctor/:id", async (req, res) => {
	const doctorId = Number(req.params.id);
	if (!doctorId) return res.status(400).json({ error: "Invalid doctor id" });
	const {
		FirstName,
		LastName,
		DepartmentID,
		Qualification,
		Specialty,
		MobileNo,
		Email,
		ShiftID,
		ShiftDate,
		RoomAssigned,
	} = req.body || {};
	try {
		await pool.query(
			`UPDATE Doctor
         SET FirstName = COALESCE(?, FirstName),
             LastName = COALESCE(?, LastName),
             DepartmentID = COALESCE(?, DepartmentID),
             Qualification = COALESCE(?, Qualification),
             Specialty = COALESCE(?, Specialty),
             MobileNo = COALESCE(?, MobileNo),
             Email = COALESCE(?, Email),
             ShiftID = COALESCE(?, ShiftID),
             ShiftDate = COALESCE(?, ShiftDate),
             RoomAssigned = COALESCE(?, RoomAssigned)
         WHERE DoctorID = ?`,
			[
				FirstName || null,
				LastName || null,
				DepartmentID || null,
				Qualification || null,
				Specialty || null,
				MobileNo || null,
				Email || null,
				ShiftID || null,
				ShiftDate || null,
				RoomAssigned || null,
				doctorId,
			]
		);
		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

router.patch("/staff/:id", async (req, res) => {
	const staffId = Number(req.params.id);
	if (!staffId) return res.status(400).json({ error: "Invalid staff id" });
	const {
		FirstName,
		LastName,
		Role,
		DepartmentID,
		MobileNo,
		Email,
		ShiftID,
		ShiftDate,
		AssignedRoom,
	} = req.body || {};
	try {
		await pool.query(
			`UPDATE Staff
         SET FirstName = COALESCE(?, FirstName),
             LastName = COALESCE(?, LastName),
             Role = COALESCE(?, Role),
             DepartmentID = COALESCE(?, DepartmentID),
             MobileNo = COALESCE(?, MobileNo),
             Email = COALESCE(?, Email),
             ShiftID = COALESCE(?, ShiftID),
             ShiftDate = COALESCE(?, ShiftDate),
             AssignedRoom = COALESCE(?, AssignedRoom)
         WHERE StaffID = ?`,
			[
				FirstName || null,
				LastName || null,
				Role || null,
				DepartmentID || null,
				MobileNo || null,
				Email || null,
				ShiftID || null,
				ShiftDate || null,
				AssignedRoom || null,
				staffId,
			]
		);
		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

router.patch("/room/:id", async (req, res) => {
	const roomId = Number(req.params.id);
	if (!roomId) return res.status(400).json({ error: "Invalid room id" });
	const { DeptID, RoomNo, FloorNo } = req.body || {};
	try {
		await pool.query(
			`UPDATE Room
         SET DeptID = COALESCE(?, DeptID),
             RoomNo = COALESCE(?, RoomNo),
             FloorNo = COALESCE(?, FloorNo)
         WHERE RoomID = ?`,
			[DeptID || null, RoomNo || null, FloorNo || null, roomId]
		);
		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

export default router;


