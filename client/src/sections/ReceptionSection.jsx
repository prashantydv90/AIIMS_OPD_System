import { useEffect, useState, useMemo } from "react";

export default function ReceptionSection({ api }) {
	const [patients, setPatients] = useState([]);
	const [filter, setFilter] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState(null);
	const [patientData, setPatientData] = useState(null);
	const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
	const [appointmentDetails, setAppointmentDetails] = useState(null);
	const [showAddPatient, setShowAddPatient] = useState(false);
	const [showScheduleAppointment, setShowScheduleAppointment] = useState(false);
	const [showAddBill, setShowAddBill] = useState(false);
	const [editBillId, setEditBillId] = useState(null);

	const [patientForm, setPatientForm] = useState({
		ABHA_ID: "",
		FirstName: "",
		LastName: "",
		DOB: "",
		Gender: "",
		MobileNo: "",
		Address: "",
		City: "",
		State: "",
	});
	const [appointmentForm, setAppointmentForm] = useState({
		PatientID: "",
		DoctorID: "",
		DeptID: "",
		AppointmentDate: "",
		VisitType: "",
		AppointmentStatus: "scheduled",
	});
	const [billingForm, setBillingForm] = useState({
		VisitID: "",
		AppointmentID: "",
		PatientID: "",
		Amount: "",
		PaidAmount: "",
		PaymentMethod: "",
		Status: "unpaid",
	});
	const [editBillForm, setEditBillForm] = useState({
		Amount: "",
		PaidAmount: "",
		PaymentMethod: "",
		Status: "",
	});
	const [rescheduleForm, setRescheduleForm] = useState({
		AppointmentDate: "",
		AppointmentStatus: "scheduled",
	});
	const [showReschedule, setShowReschedule] = useState(false);

	const [departments, setDepartments] = useState([]);
	const [doctors, setDoctors] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		async function loadData() {
			try {
				const [patientRes, doctorRes, deptRes] = await Promise.all([
					fetch(`${api.base}/api/patient`).then((r) => r.json()),
					fetch(`${api.base}/api/admin/doctors`).then((r) => r.json()),
					fetch(`${api.base}/api/admin/departments`).then((r) => r.json()),
				]);
				if (Array.isArray(patientRes)) setPatients(patientRes);
				if (Array.isArray(doctorRes)) setDoctors(doctorRes);
				if (Array.isArray(deptRes)) setDepartments(deptRes);
			} catch (e) {
				console.error(e);
			}
		}
		loadData();
	}, [api.base]);

	const filteredPatients = useMemo(() => {
		if (!filter.trim()) return patients;
		const term = filter.toLowerCase();
		return patients.filter((p) => {
			const fullName = `${p.FirstName} ${p.LastName || ""}`.toLowerCase();
			return (
				fullName.includes(term) ||
				(p.MobileNo || "").toLowerCase().includes(term) ||
				String(p.PatientID).includes(term)
			);
		});
	}, [patients, filter]);

	async function loadPatient(id) {
		setLoading(true);
		setError("");
		setPatientData(null);
		setSelectedAppointmentId(null);
		setAppointmentDetails(null);
		try {
			const res = await fetch(`${api.base}/api/patient/${id}`);
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Patient not found");
			setPatientData(j);
			setAppointmentForm((f) => ({ ...f, PatientID: id }));
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	}

	function selectPatient(id) {
		setSelectedPatientId(id);
		setShowAddPatient(false);
		setShowScheduleAppointment(false);
		setShowAddBill(false);
		loadPatient(id);
	}

	async function loadAppointmentDetails(appointmentId) {
		setLoading(true);
		setSelectedAppointmentId(appointmentId);
		setShowAddBill(false);
		setEditBillId(null);
		setShowReschedule(false);
		try {
			const res = await fetch(`${api.base}/api/appointment/${appointmentId}`);
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed to load appointment");
			setAppointmentDetails(j);
			setBillingForm((f) => ({
				...f,
				AppointmentID: appointmentId,
				PatientID: selectedPatientId,
			}));
			// Initialize reschedule form with current appointment date
			if (j.appointment) {
				const appointmentDate = new Date(j.appointment.AppointmentDate);
				setRescheduleForm({
					AppointmentDate: appointmentDate.toISOString().slice(0, 16),
					AppointmentStatus: "scheduled",
				});
			}
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	}

	async function createPatient() {
		setError("");
		try {
			const res = await fetch(`${api.base}/api/reception/patient`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...patientForm,
					DOB: patientForm.DOB || null,
					Gender: patientForm.Gender || null,
				}),
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed");
			alert(`Patient created with ID ${j.PatientID}`);
			setPatientForm({
				ABHA_ID: "",
				FirstName: "",
				LastName: "",
				DOB: "",
				Gender: "",
				MobileNo: "",
				Address: "",
				City: "",
				State: "",
			});
			setShowAddPatient(false);
			// Reload patients list
			const patientRes = await fetch(`${api.base}/api/patient`).then((r) => r.json());
			if (Array.isArray(patientRes)) {
				setPatients(patientRes);
				selectPatient(j.PatientID);
			}
		} catch (e) {
			setError(e.message);
		}
	}

	async function createAppointment() {
		setError("");
		try {
			const res = await fetch(`${api.base}/api/reception/appointment`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(appointmentForm),
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed");
			alert(`Appointment created with ID ${j.AppointmentID}`);
			setAppointmentForm({
				PatientID: selectedPatientId,
				DoctorID: "",
				DeptID: "",
				AppointmentDate: "",
				VisitType: "",
				AppointmentStatus: "scheduled",
			});
			setShowScheduleAppointment(false);
			await loadPatient(selectedPatientId);
		} catch (e) {
			setError(e.message);
		}
	}

	async function createBill() {
		setError("");
		try {
			const res = await fetch(`${api.base}/api/reception/billing`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...billingForm,
					VisitID: billingForm.VisitID || null,
					AppointmentID: billingForm.AppointmentID || null,
					Amount: parseFloat(billingForm.Amount) || 0,
					PaidAmount: billingForm.PaidAmount ? parseFloat(billingForm.PaidAmount) : 0,
				}),
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed");
			alert(`Bill created with ID ${j.BillID}`);
			setBillingForm({
				VisitID: "",
				AppointmentID: selectedAppointmentId || "",
				PatientID: selectedPatientId,
				Amount: "",
				PaidAmount: "",
				PaymentMethod: "",
				Status: "unpaid",
			});
			if (selectedAppointmentId) {
				await loadAppointmentDetails(selectedAppointmentId);
			}
		} catch (e) {
			setError(e.message);
		}
	}

	function startEditBill(bill) {
		setEditBillId(bill.BillID);
		setEditBillForm({
			Amount: bill.Amount || "",
			PaidAmount: bill.PaidAmount || "",
			PaymentMethod: bill.PaymentMethod || "",
			Status: bill.Status || "unpaid",
		});
	}

	async function updateBill() {
		if (!editBillId) return;
		setError("");
		try {
			const res = await fetch(`${api.base}/api/reception/billing/${editBillId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					Amount: editBillForm.Amount ? parseFloat(editBillForm.Amount) : undefined,
					PaidAmount: editBillForm.PaidAmount ? parseFloat(editBillForm.PaidAmount) : undefined,
					PaymentMethod: editBillForm.PaymentMethod || undefined,
					Status: editBillForm.Status || undefined,
				}),
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed");
			alert("Bill updated");
			setEditBillId(null);
			if (selectedAppointmentId) {
				await loadAppointmentDetails(selectedAppointmentId);
			}
		} catch (e) {
			setError(e.message);
		}
	}

	async function rescheduleAppointment() {
		if (!selectedAppointmentId) return;
		setError("");
		try {
			const res = await fetch(`${api.base}/api/appointment/${selectedAppointmentId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					AppointmentStatus: rescheduleForm.AppointmentStatus,
					AppointmentDate: rescheduleForm.AppointmentDate || undefined,
				}),
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed to reschedule appointment");
			alert("Appointment rescheduled successfully");
			setShowReschedule(false);
			await loadAppointmentDetails(selectedAppointmentId);
			await loadPatient(selectedPatientId);
		} catch (e) {
			setError(e.message);
		}
	}

	return (
		<div className="grid" style={{ gridTemplateColumns: "360px 1fr", alignItems: "stretch" }}>
			<div className="card" style={{ height: "fit-content", maxHeight: "80vh", overflow: "auto" }}>
				<h2>Patients</h2>
				<div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
					<input
						placeholder="Search patients"
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						style={{ flex: 1 }}
					/>
					<button className="btn" onClick={() => setShowAddPatient(true)} style={{ whiteSpace: "nowrap" }}>
						+ Add
					</button>
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					{filteredPatients.map((p) => (
						<button
							key={p.PatientID}
							onClick={() => selectPatient(p.PatientID)}
							className="tab"
							style={{
								width: "100%",
								textAlign: "left",
								borderColor: selectedPatientId === p.PatientID ? "#2563eb" : undefined,
								color: selectedPatientId === p.PatientID ? "#2563eb" : undefined,
							}}
						>
							<strong>
								#{p.PatientID} {p.FirstName} {p.LastName || ""}
							</strong>
							<br />
							<span className="small">
								{p.MobileNo || "No phone"} • {p.AppointmentCount || 0} appointments
							</span>
						</button>
					))}
					{filteredPatients.length === 0 && <p className="small">No patients found</p>}
				</div>
			</div>

			<div className="grid" style={{ gap: 16 }}>
				{showAddPatient && (
					<div className="card">
						<h3>Add New Patient</h3>
						<div className="grid grid-2">
							<div>
								<label>First Name *</label>
								<input
									value={patientForm.FirstName}
									onChange={(e) => setPatientForm({ ...patientForm, FirstName: e.target.value })}
								/>
							</div>
							<div>
								<label>Last Name</label>
								<input
									value={patientForm.LastName}
									onChange={(e) => setPatientForm({ ...patientForm, LastName: e.target.value })}
								/>
							</div>
							<div>
								<label>ABHA ID</label>
								<input
									value={patientForm.ABHA_ID}
									onChange={(e) => setPatientForm({ ...patientForm, ABHA_ID: e.target.value })}
								/>
							</div>
							<div>
								<label>DOB</label>
								<input
									type="date"
									value={patientForm.DOB}
									onChange={(e) => setPatientForm({ ...patientForm, DOB: e.target.value })}
								/>
							</div>
							<div>
								<label>Gender</label>
								<select
									value={patientForm.Gender}
									onChange={(e) => setPatientForm({ ...patientForm, Gender: e.target.value })}
								>
									<option value="">-</option>
									<option value="M">Male</option>
									<option value="F">Female</option>
									<option value="O">Other</option>
								</select>
							</div>
							<div>
								<label>Mobile</label>
								<input
									value={patientForm.MobileNo}
									onChange={(e) => setPatientForm({ ...patientForm, MobileNo: e.target.value })}
								/>
							</div>
							<div>
								<label>Address</label>
								<input
									value={patientForm.Address}
									onChange={(e) => setPatientForm({ ...patientForm, Address: e.target.value })}
								/>
							</div>
							<div>
								<label>City</label>
								<input
									value={patientForm.City}
									onChange={(e) => setPatientForm({ ...patientForm, City: e.target.value })}
								/>
							</div>
							<div>
								<label>State</label>
								<input
									value={patientForm.State}
									onChange={(e) => setPatientForm({ ...patientForm, State: e.target.value })}
								/>
							</div>
						</div>
						<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
							<button className="btn" onClick={createPatient} disabled={!patientForm.FirstName}>
								Save Patient
							</button>
							<button className="tab" onClick={() => setShowAddPatient(false)}>
								Cancel
							</button>
						</div>
					</div>
				)}

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
								<strong>Address:</strong> {patientData.patient.Address || "-"}, {patientData.patient.City || "-"},{" "}
								{patientData.patient.State || "-"}
							</p>
							<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
								<button className="btn" onClick={() => setShowScheduleAppointment(true)}>
									Schedule Appointment
								</button>
							</div>
						</div>

						<div className="card">
							<h3>Previous Appointments</h3>
							{patientData.appointments && patientData.appointments.length > 0 ? (
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
											<strong>Appointment #{appt.AppointmentID}</strong>
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
											<p className="small" style={{ marginTop: 8, color: "#6b7280" }}>
												Click to view OPD visits, investigations, and billing
											</p>
										</div>
									))}
								</div>
							) : (
								<p className="small">No previous appointments</p>
							)}
						</div>
					</>
				)}

				{showScheduleAppointment && selectedPatientId && (
					<div className="card">
						<h3>Schedule Appointment</h3>
						<div className="grid grid-2">
							<div>
								<label>Doctor *</label>
								<select
									value={appointmentForm.DoctorID}
									onChange={(e) => setAppointmentForm({ ...appointmentForm, DoctorID: e.target.value })}
								>
									<option value="">Select doctor</option>
									{doctors.map((d) => (
										<option key={d.DoctorID} value={d.DoctorID}>
											{d.FirstName} {d.LastName || ""} {d.DeptName ? `(${d.DeptName})` : ""}
										</option>
									))}
								</select>
							</div>
							<div>
								<label>Department</label>
								<select
									value={appointmentForm.DeptID}
									onChange={(e) => setAppointmentForm({ ...appointmentForm, DeptID: e.target.value })}
								>
									<option value="">-</option>
									{departments.map((d) => (
										<option key={d.DepartmentID} value={d.DepartmentID}>
											{d.DeptName}
										</option>
									))}
								</select>
							</div>
							<div>
								<label>Appointment DateTime *</label>
								<input
									type="datetime-local"
									value={appointmentForm.AppointmentDate}
									onChange={(e) =>
										setAppointmentForm({ ...appointmentForm, AppointmentDate: e.target.value })
									}
								/>
							</div>
							<div>
								<label>Visit Type</label>
								<input
									value={appointmentForm.VisitType}
									onChange={(e) => setAppointmentForm({ ...appointmentForm, VisitType: e.target.value })}
								/>
							</div>
							<div>
								<label>Status</label>
								<select
									value={appointmentForm.AppointmentStatus}
									onChange={(e) =>
										setAppointmentForm({ ...appointmentForm, AppointmentStatus: e.target.value })
									}
								>
									<option value="scheduled">scheduled</option>
									<option value="completed">completed</option>
									<option value="pending">pending</option>
								</select>
							</div>
						</div>
						<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
							<button
								className="btn"
								onClick={createAppointment}
								disabled={!appointmentForm.DoctorID || !appointmentForm.AppointmentDate}
							>
								Create Appointment
							</button>
							<button className="tab" onClick={() => setShowScheduleAppointment(false)}>
								Cancel
							</button>
						</div>
					</div>
				)}

				{selectedAppointmentId && appointmentDetails && (
					<>
						<div className="card">
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<h3>Appointment #{selectedAppointmentId} - Details</h3>
								<div style={{ display: "flex", gap: 8 }}>
									<button
										className="btn"
										onClick={() => setShowReschedule(true)}
										style={{ whiteSpace: "nowrap" }}
									>
										Reschedule
									</button>
								</div>
							</div>
							<p>
								<strong>Status:</strong> {appointmentDetails.appointment.AppointmentStatus}
							</p>
							<p>
								<strong>Date:</strong>{" "}
								{new Date(appointmentDetails.appointment.AppointmentDate).toLocaleString()}
							</p>
							{showReschedule && (
								<div
									style={{
										marginTop: 16,
										padding: 16,
										border: "1px solid #2563eb",
										borderRadius: 8,
										backgroundColor: "#f0f9ff",
									}}
								>
									<h4>Reschedule Appointment</h4>
									<p className="small" style={{ marginBottom: 12, color: "#6b7280" }}>
										Use this to reschedule appointments after testing is complete. Status will be set to
										"scheduled".
									</p>
									<div className="grid grid-2">
										<div>
											<label>New Appointment DateTime *</label>
											<input
												type="datetime-local"
												value={rescheduleForm.AppointmentDate}
												onChange={(e) =>
													setRescheduleForm({ ...rescheduleForm, AppointmentDate: e.target.value })
												}
											/>
										</div>
										<div>
											<label>Status</label>
											<select
												value={rescheduleForm.AppointmentStatus}
												onChange={(e) =>
													setRescheduleForm({ ...rescheduleForm, AppointmentStatus: e.target.value })
												}
											>
												<option value="scheduled">scheduled</option>
												<option value="pending">pending</option>
												<option value="completed">completed</option>
											</select>
										</div>
									</div>
									<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
										<button
											className="btn"
											onClick={rescheduleAppointment}
											disabled={!rescheduleForm.AppointmentDate}
										>
											Reschedule Appointment
										</button>
										<button className="tab" onClick={() => setShowReschedule(false)}>
											Cancel
										</button>
									</div>
								</div>
							)}
						</div>

						<div className="card">
							<h3>OPD Visits</h3>
							{appointmentDetails.visits && appointmentDetails.visits.length > 0 ? (
								<table className="table">
									<thead>
										<tr>
											<th>Visit ID</th>
											<th>Visit Date</th>
											<th>Doctor</th>
											<th>Diagnosis</th>
											<th>Prescribed Medication</th>
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
							<h3>Investigation Orders</h3>
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
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<h3>Billing for Appointment #{selectedAppointmentId}</h3>
								<button className="btn" onClick={() => setShowAddBill(true)}>
									+ Add Bill
								</button>
							</div>

							{showAddBill && (
								<div style={{ marginBottom: 16, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
									<h4>Add New Bill</h4>
									<div className="grid grid-2">
										<div>
											<label>Visit ID (optional)</label>
											<input
												value={billingForm.VisitID}
												onChange={(e) => setBillingForm({ ...billingForm, VisitID: e.target.value })}
												placeholder="optional"
											/>
										</div>
										<div>
											<label>Amount *</label>
											<input
												type="number"
												value={billingForm.Amount}
												onChange={(e) => setBillingForm({ ...billingForm, Amount: e.target.value })}
											/>
										</div>
										<div>
											<label>Paid Amount</label>
											<input
												type="number"
												value={billingForm.PaidAmount}
												onChange={(e) => setBillingForm({ ...billingForm, PaidAmount: e.target.value })}
											/>
										</div>
										<div>
											<label>Payment Method</label>
											<input
												value={billingForm.PaymentMethod}
												onChange={(e) => setBillingForm({ ...billingForm, PaymentMethod: e.target.value })}
											/>
										</div>
										<div>
											<label>Status</label>
											<select
												value={billingForm.Status}
												onChange={(e) => setBillingForm({ ...billingForm, Status: e.target.value })}
											>
												<option value="unpaid">unpaid</option>
												<option value="partial">partial</option>
												<option value="paid">paid</option>
											</select>
										</div>
									</div>
									<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
										<button className="btn" onClick={createBill} disabled={!billingForm.Amount}>
											Save Bill
										</button>
										<button className="tab" onClick={() => setShowAddBill(false)}>
											Cancel
										</button>
									</div>
								</div>
							)}

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
											<th>Actions</th>
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
												<td>{bill.BillDate ? new Date(bill.BillDate).toLocaleString() : "-"}</td>
												<td>
													<button className="tab" onClick={() => startEditBill(bill)}>
														Edit
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<p className="small">No billing records for this appointment</p>
							)}

							{editBillId && (
								<div style={{ marginTop: 16, padding: 16, border: "1px solid #2563eb", borderRadius: 8 }}>
									<h4>Edit Bill #{editBillId}</h4>
									<div className="grid grid-2">
										<div>
											<label>Amount</label>
											<input
												type="number"
												value={editBillForm.Amount}
												onChange={(e) => setEditBillForm({ ...editBillForm, Amount: e.target.value })}
											/>
										</div>
										<div>
											<label>Paid Amount</label>
											<input
												type="number"
												value={editBillForm.PaidAmount}
												onChange={(e) => setEditBillForm({ ...editBillForm, PaidAmount: e.target.value })}
											/>
										</div>
										<div>
											<label>Payment Method</label>
											<input
												value={editBillForm.PaymentMethod}
												onChange={(e) => setEditBillForm({ ...editBillForm, PaymentMethod: e.target.value })}
											/>
										</div>
										<div>
											<label>Status</label>
											<select
												value={editBillForm.Status}
												onChange={(e) => setEditBillForm({ ...editBillForm, Status: e.target.value })}
											>
												<option value="unpaid">unpaid</option>
												<option value="partial">partial</option>
												<option value="paid">paid</option>
											</select>
										</div>
									</div>
									<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
										<button className="btn" onClick={updateBill}>
											Update Bill
										</button>
										<button className="tab" onClick={() => setEditBillId(null)}>
											Cancel
										</button>
									</div>
								</div>
							)}
						</div>
					</>
				)}

				{error ? <p style={{ color: "crimson" }}>{error}</p> : null}
			</div>
		</div>
	);
}
