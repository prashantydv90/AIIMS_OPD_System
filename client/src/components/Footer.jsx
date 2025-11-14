export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="footer">
			<div className="footer-container">
				<div className="footer-section">
					<h3>🏥 AIIMS Jammu</h3>
					<p>All India Institute of Medical Sciences</p>
					<p className="footer-small">OPD Management System</p>
				</div>
				<div className="footer-section">
					<h4>Quick Links</h4>
					<ul>
						<li>Doctor Portal</li>
						<li>Patient Portal</li>
						<li>Reception</li>
						<li>Admin Panel</li>
					</ul>
				</div>
				<div className="footer-section">
					<h4>Contact</h4>
					<p>📍 Jammu, Jammu and Kashmir</p>
					<p>📧 info@aiimsjammu.edu.in</p>
					<p>📞 +91-XXX-XXXXXXX</p>
				</div>
				<div className="footer-section">
					<h4>About</h4>
					<p className="footer-small">
						This is a DBMS project for managing OPD operations including appointments, visits, billing, and
						investigations.
					</p>
				</div>
			</div>
			<div className="footer-bottom">
				<p>&copy; {currentYear} AIIMS Jammu. All rights reserved.</p>
				<p className="footer-small">Developed for Educational Purposes</p>
			</div>
		</footer>
	);
}

