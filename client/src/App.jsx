import { useState, useMemo } from "react";
import DoctorSection from "./sections/DoctorSection.jsx";
import PatientSection from "./sections/PatientSection.jsx";
import ReceptionSection from "./sections/ReceptionSection.jsx";
import AdminSection from "./sections/AdminSection.jsx";
import PathologySection from "./sections/PathologySection.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function App() {
	const [tab, setTab] = useState("doctor");
	const api = useMemo(() => ({ base: API_BASE }), []);

	return (
		<>
			<Navbar tab={tab} setTab={setTab} />
			<div className="container">
				{tab === "doctor" && <DoctorSection api={api} />}
				{tab === "patient" && <PatientSection api={api} />}
				{tab === "reception" && <ReceptionSection api={api} />}
				{tab === "admin" && <AdminSection api={api} />}
				{tab === "pathology" && <PathologySection api={api} />}
			</div>
			<Footer />
		</>
	);
}


