import { useMemo, useState } from "react";

const initialVisitForm = {
	AppointmentID: "",
	PatientID: "",
	DoctorID: "",
	VisitDateTime: "",
	Diagnosis: "",
	PrescribedMedication: "",
	NextVisitDate: "",
	Remarks: "",
};

export default function DoctorSection({ api }) {
	const [doctorIdInput, setDoctorIdInput] = useState("");
	const [doctorData, setDoctorData] = useState(null);
	const [pendingAppointments, setPendingAppointments] = useState([]);
	const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
	const [appointmentDetailsMap, setAppointmentDetailsMap] = useState({});
	const [patientHistory, setPatientHistory] = useState(null);

	const [visitForm, setVisitForm] = useState(initialVisitForm);
	const [editVisitId, setEditVisitId] = useState(null);
	const [editVisitForm, setEditVisitForm] = useState({
		Diagnosis: "",
		PrescribedMedication: "",
		NextVisitDate: "",
		Remarks: "",
	});

	const [appointmentStatusForm, setAppointmentStatusForm] = useState({
		AppointmentStatus: "",
	});

	const [historyExpanded, setHistoryExpanded] = useState(null);

	const [loadingDoctor, setLoadingDoctor] = useState(false);
	const [loadingAppointment, setLoadingAppointment] = useState(false);
	const [loadingPatient, setLoadingPatient] = useState(false);
	const [error, setError] = useState("");

	const selectedAppointmentDetails = selectedAppointmentId
		? appointmentDetailsMap[selectedAppointmentId]
		: null;

	async function handleFetchDoctor() {
		if (!doctorIdInput) return;
		setError("");
		setLoadingDoctor(true);
		setDoctorData(null);
		setPendingAppointments([]);
		setSelectedAppointmentId(null);
		setAppointmentDetailsMap({});
		setPatientHistory(null);
		try {
			const res = await fetch(`${api.base}/api/doctor/${doctorIdInput}`);
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Doctor not found");
			setDoctorData(j);
			const pending = j.pendingAppointments ?? [];
			setPendingAppointments(pending);

			if (pending.length > 0) {
				selectAppointment(pending[0]);
			} else {
				setVisitForm((prev) => ({
					...initialVisitForm,
					DoctorID: doctorIdInput,
				}));
			}
		} catch (e) {
			setError(e.message);
		} finally {
			setLoadingDoctor(false);
		}
	}

	async function loadAppointmentDetails(appointmentId, patientId, { refreshPatient = false } = {}) {
		if (!appointmentId) return;
		setLoadingAppointment(true);
		try {
			const res = await fetch(`${api.base}/api/appointment/${appointmentId}`);
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed to load appointment");
			setAppointmentDetailsMap((prev) => ({ ...prev, [appointmentId]: j }));
			// Update status form when appointment details are loaded
			if (j.appointment) {
				setAppointmentStatusForm({
					AppointmentStatus: j.appointment.AppointmentStatus || "",
				});
			}
		} catch (e) {
			setError(e.message);
		} finally {
			setLoadingAppointment(false);
		}

		if (patientId && (refreshPatient || patientHistory?.patient?.PatientID !== patientId)) {
			setLoadingPatient(true);
			try {
				const res = await fetch(`${api.base}/api/patient/${patientId}`);
				const j = await res.json();
				if (!res.ok) throw new Error(j.error || "Failed to load patient");
				setPatientHistory(j);
			} catch (e) {
				setError(e.message);
			} finally {
				setLoadingPatient(false);
			}
		}
	}

	function selectAppointment(appointment) {
		if (!appointment) return;
		setSelectedAppointmentId(appointment.AppointmentID);
		setHistoryExpanded(null);
		setVisitForm({
			...initialVisitForm,
			AppointmentID: appointment.AppointmentID,
			PatientID: appointment.PatientID,
			DoctorID: doctorData?.doctor?.DoctorID || doctorIdInput,
			VisitDateTime: new Date().toISOString().slice(0, 16),
		});
		setEditVisitId(null);
		setAppointmentStatusForm({
			AppointmentStatus: appointment.AppointmentStatus || "",
		});
		loadAppointmentDetails(appointment.AppointmentID, appointment.PatientID);
	}

	async function createVisit() {
		if (!visitForm.PatientID || !visitForm.DoctorID) {
			setError("PatientID and DoctorID are required");
			return;
		}
		setError("");
		try {
			const res = await fetch(`${api.base}/api/doctor/visit`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...visitForm,
					VisitDateTime: visitForm.VisitDateTime || null,
					NextVisitDate: visitForm.NextVisitDate || null,
					Remarks: visitForm.Remarks || null,
				}),
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed to create visit");
			alert(`Visit created with ID ${j.VisitID}`);
			await loadAppointmentDetails(visitForm.AppointmentID, visitForm.PatientID, { refreshPatient: true });
			setVisitForm((f) => ({
				...f,
				VisitDateTime: new Date().toISOString().slice(0, 16),
				Diagnosis: "",
				PrescribedMedication: "",
				NextVisitDate: "",
				Remarks: "",
			}));
		} catch (e) {
			setError(e.message);
		}
	}

	function startEditVisit(visit) {
		setEditVisitId(visit.VisitID);
		setEditVisitForm({
			Diagnosis: visit.Diagnosis || "",
			PrescribedMedication: visit.PrescribedMedication || "",
			NextVisitDate: visit.NextVisitDate ? visit.NextVisitDate.split("T")[0] : "",
			Remarks: visit.Remarks || "",
		});
	}

	async function updateVisit() {
		if (!editVisitId) return;
		setError("");
		try {
			const res = await fetch(`${api.base}/api/doctor/visit/${editVisitId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...editVisitForm,
					NextVisitDate: editVisitForm.NextVisitDate || null,
				}),
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed to update visit");
			alert("Visit updated");
			if (selectedAppointmentId && visitForm.PatientID) {
				await loadAppointmentDetails(selectedAppointmentId, visitForm.PatientID, { refreshPatient: true });
			}
			setEditVisitId(null);
		} catch (e) {
			setError(e.message);
		}
	}

	async function updateAppointmentStatus() {
		if (!selectedAppointmentId || !appointmentStatusForm.AppointmentStatus) return;
		setError("");
		try {
			const res = await fetch(`${api.base}/api/appointment/${selectedAppointmentId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					AppointmentStatus: appointmentStatusForm.AppointmentStatus,
				}),
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed to update appointment status");
			alert("Appointment status updated");
			await loadAppointmentDetails(selectedAppointmentId, visitForm.PatientID, { refreshPatient: true });
			// Refresh pending appointments list
			if (doctorIdInput) {
				await handleFetchDoctor();
			}
		} catch (e) {
			setError(e.message);
		}
	}

	async function toggleHistoryAppointment(appointmentId, patientId) {
		if (historyExpanded === appointmentId) {
			setHistoryExpanded(null);
			return;
		}
		setHistoryExpanded(appointmentId);
		if (!appointmentDetailsMap[appointmentId]) {
			await loadAppointmentDetails(appointmentId, patientId);
		}
	}

	const previousAppointments = useMemo(() => {
		if (!patientHistory?.appointments) return [];
		return [...patientHistory.appointments]
			.sort((a, b) => new Date(b.AppointmentDate) - new Date(a.AppointmentDate));
	}, [patientHistory]);

	const pendingAppointmentCards = pendingAppointments.map((appt) => (
		<div
			key={appt.AppointmentID}
			className="card"
			style={{
				borderColor: selectedAppointmentId === appt.AppointmentID ? "#2563eb" : "#e5e7eb",
				cursor: "pointer",
			}}
			onClick={() => selectAppointment(appt)}
		>
			<strong>
				#{appt.AppointmentID} • {appt.PatientFirstName} {appt.PatientLastName || ""}
			</strong>
			<p className="small">ABHA: {appt.ABHA_ID || "-"} • {appt.PatientMobileNo || "no phone"}</p>
			<p>Date: {new Date(appt.AppointmentDate).toLocaleString()}</p>
			<p>Status: {appt.AppointmentStatus}</p>
			<p className="small">
				Last Visit: {appt.LastVisitDate ? new Date(appt.LastVisitDate).toLocaleString() : "N/A"}
			</p>
		</div>
	));

	return (
		<div className="grid" style={{ gap: 16 }}>
			<div className="card">
				<h2>Doctor Lookup</h2>
				<div className="grid grid-2">
					<div>
						<label>Doctor ID</label>
						<input
							value={doctorIdInput}
							onChange={(e) => setDoctorIdInput(e.target.value)}
							placeholder="Enter doctor ID"
						/>
					</div>
				</div>
				<div style={{ marginTop: 12 }}>
					<button className="btn" onClick={handleFetchDoctor} disabled={!doctorIdInput}>
						{loadingDoctor ? "Loading..." : "Load Doctor"}
					</button>
					{error ? <p style={{ color: "crimson" }}>{error}</p> : null}
				</div>
			</div>

			{doctorData && (
				<>
					<div className="card">
						<h3>Doctor Details</h3>
						<p>
							<strong>Name:</strong> {doctorData.doctor.FirstName} {doctorData.doctor.LastName || ""}
						</p>
						<p>
							<strong>Department:</strong> {doctorData.doctor.DeptName || "-"}
						</p>
						<p>
							<strong>Shift:</strong> {doctorData.doctor.ShiftName || "-"} ({doctorData.doctor.StartTime || "-"} -{" "}
							{doctorData.doctor.EndTime || "-"})
						</p>
						<p>
							<strong>Room:</strong> {doctorData.doctor.RoomAssigned || "-"}
						</p>
						<p>
							<strong>Contact:</strong> {doctorData.doctor.Email || "-"} / {doctorData.doctor.MobileNo || "-"}
						</p>
					</div>

					<div className="card">
						<h3>Pending Appointments</h3>
						{pendingAppointmentCards.length > 0 ? (
							<div style={{ display: "grid", gap: 12 }}>{pendingAppointmentCards}</div>
						) : (
							<p className="small">No pending appointments</p>
						)}
					</div>

					<div className="card">
						<h3>Recent Visits</h3>
						<table className="table">
							<thead>
								<tr>
									<th>Visit</th>
									<th>Patient</th>
									<th>Date</th>
									<th>Diagnosis</th>
									<th>Remarks</th>
								</tr>
							</thead>
							<tbody>
								{(doctorData.visits || []).map((visit) => (
									<tr key={visit.VisitID}>
										<td>{visit.VisitID}</td>
										<td>
											{visit.PatientFirstName} {visit.PatientLastName || ""}
										</td>
										<td>{visit.VisitDateTime ? new Date(visit.VisitDateTime).toLocaleString() : "-"}</td>
										<td>{visit.Diagnosis || "-"}</td>
										<td>{visit.Remarks || "-"}</td>
									</tr>
								))}
								{!doctorData.visits?.length && (
									<tr>
										<td colSpan={5} className="small">
											No visits yet
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{selectedAppointmentId && selectedAppointmentDetails && (
				<>
					<div className="card">
						<h3>Current Appointment</h3>
						{loadingAppointment ? <p>Loading appointment...</p> : null}
						<p>
							<strong>Appointment ID:</strong> {selectedAppointmentDetails.appointment.AppointmentID}
						</p>
						<div style={{ marginTop: 12, padding: 12, border: "1px solid #e5e7eb", borderRadius: 6 }}>
							<label>
								<strong>Appointment Status:</strong>
							</label>
							<div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
								<select
									value={appointmentStatusForm.AppointmentStatus}
									onChange={(e) =>
										setAppointmentStatusForm({ ...appointmentStatusForm, AppointmentStatus: e.target.value })
									}
									style={{ flex: 1 }}
								>
									<option value="scheduled">scheduled</option>
									<option value="pending">pending</option>
									<option value="completed">completed</option>
								</select>
								<button
									className="btn"
									onClick={updateAppointmentStatus}
									disabled={appointmentStatusForm.AppointmentStatus === selectedAppointmentDetails.appointment.AppointmentStatus}
								>
									Update Status
								</button>
							</div>
							<p className="small" style={{ marginTop: 8, color: "#6b7280" }}>
								Set to "pending" when tests are added in remarks. Set to "completed" after reviewing reports.
							</p>
						</div>
						<p style={{ marginTop: 12 }}>
							<strong>Scheduled At:</strong>{" "}
							{new Date(selectedAppointmentDetails.appointment.AppointmentDate).toLocaleString()}
						</p>
						<p>
							<strong>Visit Type:</strong> {selectedAppointmentDetails.appointment.VisitType || "-"}
						</p>
						{patientHistory && (
							<>
								<hr />
								<p>
									<strong>Patient:</strong> {patientHistory.patient.FirstName}{" "}
									{patientHistory.patient.LastName || ""} (#{patientHistory.patient.PatientID})
								</p>
								<p>
									<strong>Contact:</strong> {patientHistory.patient.MobileNo || "-"} | ABHA:{" "}
									{patientHistory.patient.ABHA_ID || "-"}
								</p>
								<p>
									<strong>Address:</strong> {patientHistory.patient.Address || "-"},{" "}
									{patientHistory.patient.City || "-"} ({patientHistory.patient.State || "-"})
								</p>
							</>
						)}
					</div>

					<div className="card">
						<h3>Create OPD Visit</h3>
						<p className="small">
							Add the visit as soon as patient arrives. Leave diagnosis/prescription empty until reports are ready.
						</p>
						<div className="grid grid-2">
							<div>
								<label>Visit DateTime</label>
								<input
									type="datetime-local"
									value={visitForm.VisitDateTime}
									onChange={(e) => setVisitForm({ ...visitForm, VisitDateTime: e.target.value })}
								/>
							</div>
							<div>
								<label>Next Visit Date</label>
								<input
									type="date"
									value={visitForm.NextVisitDate}
									onChange={(e) => setVisitForm({ ...visitForm, NextVisitDate: e.target.value })}
								/>
							</div>
							<div>
								<label>Diagnosis</label>
								<input
									value={visitForm.Diagnosis}
									onChange={(e) => setVisitForm({ ...visitForm, Diagnosis: e.target.value })}
									placeholder="Fill later after reports"
								/>
							</div>
							<div>
								<label>Prescribed Medication</label>
								<input
									value={visitForm.PrescribedMedication}
									onChange={(e) =>
										setVisitForm({ ...visitForm, PrescribedMedication: e.target.value })
									}
									placeholder="Fill later after reports"
								/>
							</div>
							<div style={{ gridColumn: "1 / span 2" }}>
								<label>Remarks</label>
								<textarea
									value={visitForm.Remarks}
									onChange={(e) => setVisitForm({ ...visitForm, Remarks: e.target.value })}
									rows={3}
								/>
							</div>
						</div>
						<div style={{ marginTop: 12 }}>
							<button
								className="btn"
								onClick={createVisit}
								disabled={!visitForm.PatientID || !visitForm.DoctorID}
							>
								Add Visit
							</button>
						</div>
					</div>

					<div className="card">
						<h3>Visits for this Appointment</h3>
						<table className="table">
							<thead>
								<tr>
									<th>Visit</th>
									<th>Date</th>
									<th>Diagnosis</th>
									<th>Medication</th>
									<th>Remarks</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{selectedAppointmentDetails.visits.map((v) => (
									<tr key={v.VisitID}>
										<td>{v.VisitID}</td>
										<td>{v.VisitDateTime ? new Date(v.VisitDateTime).toLocaleString() : "-"}</td>
										<td>{v.Diagnosis || "-"}</td>
										<td>{v.PrescribedMedication || "-"}</td>
										<td>{v.Remarks || "-"}</td>
										<td>
											<button className="tab" onClick={() => startEditVisit(v)}>
												Update
											</button>
										</td>
									</tr>
								))}
								{selectedAppointmentDetails.visits.length === 0 && (
									<tr>
										<td colSpan={6} className="small">
											No visits recorded yet
										</td>
									</tr>
								)}
							</tbody>
						</table>

						{editVisitId && (
							<div style={{ marginTop: 16 }}>
								<h4>Update Visit #{editVisitId}</h4>
								<div className="grid grid-2">
									<div>
										<label>Diagnosis</label>
										<input
											value={editVisitForm.Diagnosis}
											onChange={(e) =>
												setEditVisitForm({ ...editVisitForm, Diagnosis: e.target.value })
											}
										/>
									</div>
									<div>
										<label>Prescribed Medication</label>
										<input
											value={editVisitForm.PrescribedMedication}
											onChange={(e) =>
												setEditVisitForm({ ...editVisitForm, PrescribedMedication: e.target.value })
											}
										/>
									</div>
									<div>
										<label>Next Visit Date</label>
										<input
											type="date"
											value={editVisitForm.NextVisitDate}
											onChange={(e) =>
												setEditVisitForm({ ...editVisitForm, NextVisitDate: e.target.value })
											}
										/>
									</div>
									<div>
										<label>Remarks</label>
										<textarea
											rows={3}
											value={editVisitForm.Remarks}
											onChange={(e) =>
												setEditVisitForm({ ...editVisitForm, Remarks: e.target.value })
											}
										/>
									</div>
								</div>
								<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
									<button className="btn" onClick={updateVisit}>
										Save Updates
									</button>
									<button className="tab" onClick={() => setEditVisitId(null)}>
										Cancel
									</button>
								</div>
							</div>
						)}
					</div>

					<div className="card">
						<h3>Investigations Ordered (this appointment)</h3>
						<table className="table">
							<thead>
								<tr>
									<th>Order</th>
									<th>Test</th>
									<th>Ordered</th>
									<th>Result Date</th>
									<th>Value</th>
									<th>Comments</th>
								</tr>
							</thead>
							<tbody>
								{selectedAppointmentDetails.investigations.map((inv) => (
									<tr key={inv.OrderID}>
										<td>{inv.OrderID}</td>
										<td>
											{inv.TestCode || ""} {inv.TestName ? `- ${inv.TestName}` : ""}
										</td>
										<td>{inv.OrderedDate || "-"}</td>
										<td>{inv.ResultDate || "-"}</td>
										<td>{inv.ResultValue || "-"}</td>
										<td>{inv.Comments || "-"}</td>
									</tr>
								))}
								{!selectedAppointmentDetails.investigations.length && (
									<tr>
										<td colSpan={6} className="small">
											No investigations yet
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{patientHistory && (
				<div className="card">
					<h3>Patient History</h3>
					{loadingPatient ? <p>Loading history...</p> : null}
					{previousAppointments.length > 0 ? (
						previousAppointments.map((appt) => {
							const details = appointmentDetailsMap[appt.AppointmentID];
							const isExpanded = historyExpanded === appt.AppointmentID;
							return (
								<div
									key={appt.AppointmentID}
									style={{
										border: "1px solid #e5e7eb",
										borderRadius: 6,
										padding: 10,
										marginBottom: 10,
									}}
								>
									<div
										style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
									>
										<div>
											<strong>
												#{appt.AppointmentID} • {new Date(appt.AppointmentDate).toLocaleString()}
											</strong>
											<p className="small">
												Status: {appt.AppointmentStatus} | Doctor #{appt.DoctorID || "-"}
											</p>
										</div>
										<button className="tab" onClick={() => toggleHistoryAppointment(appt.AppointmentID, appt.PatientID)}>
											{isExpanded ? "Hide details" : "View details"}
										</button>
									</div>
									{isExpanded && (
										<div style={{ marginTop: 8 }}>
											{details ? (
												<>
													<h4 style={{ marginBottom: 4 }}>Visits</h4>
													{details.visits.length ? (
														details.visits.map((v) => (
															<div key={v.VisitID} className="card" style={{ marginBottom: 8 }}>
																<strong>Visit #{v.VisitID}</strong>
																<p className="small">
																	{v.VisitDateTime ? new Date(v.VisitDateTime).toLocaleString() : "-"}
																</p>
																<p>Diagnosis: {v.Diagnosis || "-"}</p>
																<p>Medication: {v.PrescribedMedication || "-"}</p>
																<p>Remarks: {v.Remarks || "-"}</p>
															</div>
														))
													) : (
														<p className="small">No visits recorded</p>
													)}
													<h4 style={{ marginBottom: 4 }}>Investigation Orders</h4>
													{details.investigations.length ? (
														<table className="table">
															<thead>
																<tr>
																	<th>Order</th>
																	<th>Test</th>
																	<th>Ordered</th>
																	<th>Result</th>
																</tr>
															</thead>
															<tbody>
																{details.investigations.map((inv) => (
																	<tr key={inv.OrderID}>
																		<td>{inv.OrderID}</td>
																		<td>
																			{inv.TestCode || ""} {inv.TestName ? `- ${inv.TestName}` : ""}
																		</td>
																		<td>{inv.OrderedDate || "-"}</td>
																		<td>
																			{inv.ResultDate ? `${inv.ResultDate} (${inv.ResultValue || "-"})` : "-"}
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													) : (
														<p className="small">No investigations ordered</p>
													)}
												</>
											) : (
												<p className="small">Loading details...</p>
											)}
										</div>
									)}
								</div>
							);
						})
					) : (
						<p className="small">No past appointments</p>
					)}
				</div>
			)}
		</div>
	);
}

