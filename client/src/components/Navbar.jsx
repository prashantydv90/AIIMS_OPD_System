import { useState } from "react";

export default function Navbar({ tab, setTab }) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const navItems = [
		{ id: "doctor", label: "👨‍⚕️ Doctor", icon: "👨‍⚕️" },
		{ id: "patient", label: "👤 Patient", icon: "👤" },
		{ id: "reception", label: "🏥 Reception", icon: "🏥" },
		{ id: "admin", label: "⚙️ Admin", icon: "⚙️" },
		{ id: "pathology", label: "🔬 Pathology", icon: "🔬" },
	];

	const handleTabChange = (tabId) => {
		setTab(tabId);
		setMobileMenuOpen(false);
	};

	return (
		<nav className="navbar">
			<div className="navbar-container">
				<div className="navbar-brand">
					<div className="brand-icon">🏥</div>
					<div className="brand-text">
						<h1>AIIMS Jammu</h1>
						<p>OPD Management System</p>
					</div>
				</div>
				<div className={`navbar-menu ${mobileMenuOpen ? "active" : ""}`}>
					{navItems.map((item) => (
						<button
							key={item.id}
							className={`nav-item ${tab === item.id ? "active" : ""}`}
							onClick={() => handleTabChange(item.id)}
							title={item.label}
						>
							<span className="nav-icon">{item.icon}</span>
							<span className="nav-label">{item.label.split(" ")[1]}</span>
						</button>
					))}
				</div>
				<div className="navbar-mobile-toggle">
					<button
						className="mobile-menu-btn"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label="Toggle menu"
					>
						<span>{mobileMenuOpen ? "✕" : "☰"}</span>
					</button>
				</div>
			</div>
		</nav>
	);
}

