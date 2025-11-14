import { useState } from "react";

export default function PatientSection({ api }) {
	const [patientIdInput, setPatientIdInput] = useState("");
	const [patientData, setPatientData] = useState(null);
	const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
	const [appointmentDetails, setAppointmentDetails] = useState(null);
	const [loadingPatient, setLoadingPatient] = useState(false);
	const [loadingAppointment, setLoadingAppointment] = useState(false);
	const [error, setError] = useState("");

	async function handleFetchPatient() {
		if (!patientIdInput) return;
		setError("");
		setLoadingPatient(true);
		setPatientData(null);
		setSelectedAppointmentId(null);
		setAppointmentDetails(null);
		try {
			const res = await fetch(`${api.base}/api/patient/${patientIdInput}`);
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Patient not found");
			setPatientData(j);
		} catch (e) {
			setError(e.message);
		} finally {
			setLoadingPatient(false);
		}
	}

	async function loadAppointmentDetails(appointmentId) {
		if (!appointmentId) return;
		setLoadingAppointment(true);
		setSelectedAppointmentId(appointmentId);
		try {
			const res = await fetch(`${api.base}/api/appointment/${appointmentId}`);
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed to load appointment");
			setAppointmentDetails(j);
		} catch (e) {
			setError(e.message);
		} finally {
			setLoadingAppointment(false);
		}
	}

	return (
		<div className="grid" style={{ gap: 16 }}>
			<div className="card">
				<h2>Patient Lookup</h2>
				<div className="grid grid-2">
					<div>
						<label>Patient ID</label>
						<input
							value={patientIdInput}
							onChange={(e) => setPatientIdInput(e.target.value)}
							placeholder="Enter patient ID"
							onKeyPress={(e) => {
								if (e.key === "Enter") handleFetchPatient();
							}}
						/>
					</div>
				</div>
				<div style={{ marginTop: 12 }}>
					<button className="btn" onClick={handleFetchPatient} disabled={!patientIdInput}>
						{loadingPatient ? "Loading..." : "Load Patient"}
					</button>
					{error ? <p style={{ color: "crimson" }}>{error}</p> : null}
				</div>
			</div>

			{patientData && (
				<>
					<div className="card">
						<h3>Patient Details</h3>
						<p>
							<strong>Name:</strong> {patientData.patient.FirstName} {patientData.patient.LastName || ""}
						</p>
						<p>
							<strong>Patient ID:</strong> #{patientData.patient.PatientID}
						</p>
						<p>
							<strong>ABHA ID:</strong> {patientData.patient.ABHA_ID || "-"}
						</p>
						<p>
							<strong>Mobile:</strong> {patientData.patient.MobileNo || "-"}
						</p>
						<p>
							<strong>Email:</strong> {patientData.patient.Email || "-"}
						</p>
						<p>
							<strong>Address:</strong> {patientData.patient.Address || "-"}, {patientData.patient.City || "-"},{" "}
							{patientData.patient.State || "-"}
						</p>
						<p>
							<strong>DOB:</strong> {patientData.patient.DOB || "-"} • <strong>Gender:</strong>{" "}
							{patientData.patient.Gender || "-"}
						</p>
					</div>

					<div className="card">
						<h3>All Appointments</h3>
						{patientData.appointments.length > 0 ? (
							<div style={{ display: "grid", gap: 12 }}>
								{patientData.appointments.map((appt) => (
									<div
										key={appt.AppointmentID}
										className="card"
										style={{
											borderColor: selectedAppointmentId === appt.AppointmentID ? "#2563eb" : "#e5e7eb",
											cursor: "pointer",
										}}
										onClick={() => loadAppointmentDetails(appt.AppointmentID)}
									>
										<strong>
											Appointment #{appt.AppointmentID}
										</strong>
										<p>
											<strong>Doctor:</strong> {appt.DoctorFirstName} {appt.DoctorLastName || ""}
										</p>
										<p>
											<strong>Department:</strong> {appt.DeptName || "-"}
										</p>
										<p>
											<strong>Date:</strong> {new Date(appt.AppointmentDate).toLocaleString()}
										</p>
										<p>
											<strong>Status:</strong> {appt.AppointmentStatus}
										</p>
										<p>
											<strong>Visit Type:</strong> {appt.VisitType || "-"}
										</p>
										<p className="small" style={{ marginTop: 8, color: "#6b7280" }}>
											Click to view OPD visits, investigations, and billing details
										</p>
									</div>
								))}
							</div>
						) : (
							<p className="small">No appointments found</p>
						)}
					</div>
				</>
			)}

			{selectedAppointmentId && appointmentDetails && (
				<>
					<div className="card">
						<h3>Appointment #{selectedAppointmentId} - Details</h3>
						{loadingAppointment ? (
							<p>Loading appointment details...</p>
						) : (
							<>
								<p>
									<strong>Doctor:</strong> {appointmentDetails.appointment.DoctorFirstName}{" "}
									{appointmentDetails.appointment.DoctorLastName || ""}
								</p>
								<p>
									<strong>Department:</strong> {appointmentDetails.appointment.DeptName || "-"}
								</p>
								<p>
									<strong>Scheduled Date:</strong>{" "}
									{new Date(appointmentDetails.appointment.AppointmentDate).toLocaleString()}
								</p>
								<p>
									<strong>Status:</strong> {appointmentDetails.appointment.AppointmentStatus}
								</p>
								<p>
									<strong>Visit Type:</strong> {appointmentDetails.appointment.VisitType || "-"}
								</p>
							</>
						)}
					</div>

					<div className="card">
						<h3>OPD Visits for this Appointment</h3>
						{appointmentDetails.visits && appointmentDetails.visits.length > 0 ? (
							<table className="table">
								<thead>
									<tr>
										<th>Visit ID</th>
										<th>Visit Date</th>
										<th>Doctor</th>
										<th>Diagnosis</th>
										<th>Prescribed Medication</th>
										<th>Next Visit Date</th>
										<th>Remarks</th>
									</tr>
								</thead>
								<tbody>
									{appointmentDetails.visits.map((visit) => (
										<tr key={visit.VisitID}>
											<td>{visit.VisitID}</td>
											<td>
												{visit.VisitDateTime ? new Date(visit.VisitDateTime).toLocaleString() : "-"}
											</td>
											<td>
												{visit.DoctorFirstName} {visit.DoctorLastName || ""}
											</td>
											<td>{visit.Diagnosis || "-"}</td>
											<td>{visit.PrescribedMedication || "-"}</td>
											<td>{visit.NextVisitDate || "-"}</td>
											<td>{visit.Remarks || "-"}</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<p className="small">No OPD visits recorded for this appointment</p>
						)}
					</div>

					<div className="card">
						<h3>Investigation Orders for this Appointment</h3>
						{appointmentDetails.investigations && appointmentDetails.investigations.length > 0 ? (
							<table className="table">
								<thead>
									<tr>
										<th>Order ID</th>
										<th>Test Code</th>
										<th>Test Name</th>
										<th>Ordered Date</th>
										<th>Result Date</th>
										<th>Result Value</th>
										<th>Comments</th>
									</tr>
								</thead>
								<tbody>
									{appointmentDetails.investigations.map((inv) => (
										<tr key={inv.OrderID}>
											<td>{inv.OrderID}</td>
											<td>{inv.TestCode || "-"}</td>
											<td>{inv.TestName || "-"}</td>
											<td>{inv.OrderedDate || "-"}</td>
											<td>{inv.ResultDate || "-"}</td>
											<td>{inv.ResultValue || "-"}</td>
											<td>{inv.Comments || "-"}</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<p className="small">No investigation orders for this appointment</p>
						)}
					</div>

					<div className="card">
						<h3>Billing Details for this Appointment</h3>
						{appointmentDetails.billing && appointmentDetails.billing.length > 0 ? (
							<table className="table">
								<thead>
									<tr>
										<th>Bill ID</th>
										<th>Visit ID</th>
										<th>Amount</th>
										<th>Paid Amount</th>
										<th>Payment Method</th>
										<th>Status</th>
										<th>Bill Date</th>
									</tr>
								</thead>
								<tbody>
									{appointmentDetails.billing.map((bill) => (
										<tr key={bill.BillID}>
											<td>{bill.BillID}</td>
											<td>{bill.VisitID || "-"}</td>
											<td>₹{bill.Amount || "0.00"}</td>
											<td>₹{bill.PaidAmount || "0.00"}</td>
											<td>{bill.PaymentMethod || "-"}</td>
											<td>{bill.Status}</td>
											<td>
												{bill.BillDate ? new Date(bill.BillDate).toLocaleString() : "-"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<p className="small">No billing records for this appointment</p>
						)}
					</div>
				</>
			)}
		</div>
	);
}
