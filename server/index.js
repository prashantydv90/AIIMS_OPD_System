import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
	try {
		const [rows] = await pool.query("SELECT 1 AS ok");
		res.json({ ok: true, db: rows[0]?.ok === 1 });
	} catch (e) {
		res.status(500).json({ ok: false, error: e.message });
	}
});

// Placeholder routers to be extended
import routerDoctor from "./routes/doctor.js";
import routerPatient from "./routes/patient.js";
import routerReception from "./routes/reception.js";
import routerAdmin from "./routes/admin.js";
import routerAppointment from "./routes/appointment.js";
import routerPathology from "./routes/pathology.js";

app.use("/api/doctor", routerDoctor);
app.use("/api/patient", routerPatient);
app.use("/api/reception", routerReception);
app.use("/api/admin", routerAdmin);
app.use("/api/appointment", routerAppointment);
app.use("/api/pathology", routerPathology);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});


