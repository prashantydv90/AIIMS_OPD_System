import { useState } from "react";

export default function PathologySection({ api }) {
	const [visitIdInput, setVisitIdInput] = useState("");
	const [visitData, setVisitData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [investigationForm, setInvestigationForm] = useState({
		TestCode: "",
		TestName: "",
		OrderedDate: "",
		ResultDate: "",
		ResultValue: "",
		Comments: "",
	});

	const [editOrderId, setEditOrderId] = useState(null);
	const [editOrderForm, setEditOrderForm] = useState({
		ResultDate: "",
		ResultValue: "",
		Comments: "",
	});

	async function loadVisit() {
		if (!visitIdInput) return;
		setError("");
		setLoading(true);
		setVisitData(null);
		try {
			const res = await fetch(`${api.base}/api/pathology/visit/${visitIdInput}`);
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Visit not found");
			setVisitData(j);
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	}

	async function addInvestigation() {
		if (!visitData?.visit?.VisitID) return;
		if (!investigationForm.TestCode && !investigationForm.TestName) {
			setError("Enter Test Code or Test Name");
			return;
		}
		setError("");
		try {
			const res = await fetch(`${api.base}/api/pathology/visit/${visitData.visit.VisitID}/investigation`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...investigationForm,
					OrderedDate: investigationForm.OrderedDate || new Date().toISOString().slice(0, 10),
					ResultDate: investigationForm.ResultDate || null,
					ResultValue: investigationForm.ResultValue || null,
					Comments: investigationForm.Comments || null,
				}),
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed to add investigation");
			alert(`Investigation added (Order ${j.OrderID})`);
			setInvestigationForm({
				TestCode: "",
				TestName: "",
				OrderedDate: "",
				ResultDate: "",
				ResultValue: "",
				Comments: "",
			});
			await loadVisit();
		} catch (e) {
			setError(e.message);
		}
	}

	function startEditOrder(order) {
		setEditOrderId(order.OrderID);
		setEditOrderForm({
			ResultDate: order.ResultDate || "",
			ResultValue: order.ResultValue || "",
			Comments: order.Comments || "",
		});
	}

	async function updateOrder() {
		if (!editOrderId) return;
		setError("");
		try {
			const res = await fetch(`${api.base}/api/pathology/investigation/${editOrderId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...editOrderForm,
					ResultDate: editOrderForm.ResultDate || null,
					ResultValue: editOrderForm.ResultValue || null,
					Comments: editOrderForm.Comments || null,
				}),
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || "Failed to update investigation");
			alert("Investigation updated");
			setEditOrderId(null);
			await loadVisit();
		} catch (e) {
			setError(e.message);
		}
	}

	return (
		<div className="grid" style={{ gap: 16 }}>
			<div className="card">
				<h2>Pathology Desk</h2>
				<div className="grid grid-2">
					<div>
						<label>Visit ID</label>
						<input
							value={visitIdInput}
							onChange={(e) => setVisitIdInput(e.target.value)}
							placeholder="Enter OPD Visit ID"
						/>
					</div>
				</div>
				<div style={{ marginTop: 12 }}>
					<button className="btn" onClick={loadVisit} disabled={!visitIdInput}>
						{loading ? "Loading..." : "Load Visit"}
					</button>
					{error ? <p style={{ color: "crimson" }}>{error}</p> : null}
				</div>
			</div>

			{visitData && (
				<>
					<div className="card">
						<h3>Visit Summary</h3>
						<p>
							<strong>Visit ID:</strong> {visitData.visit.VisitID}
						</p>
						<p>
							<strong>Appointment:</strong> {visitData.visit.AppointmentID || "-"}
						</p>
						<p>
							<strong>Visit Time:</strong>{" "}
							{visitData.visit.VisitDateTime ? new Date(visitData.visit.VisitDateTime).toLocaleString() : "-"}
						</p>
						<p>
							<strong>Doctor:</strong> {visitData.visit.DoctorFirstName} {visitData.visit.DoctorLastName || ""} (
							{visitData.visit.DeptName || "-"})
						</p>
						<p>
							<strong>Patient:</strong> {visitData.visit.PatientFirstName} {visitData.visit.PatientLastName || ""} • ABHA:{" "}
							{visitData.visit.ABHA_ID || "-"} • {visitData.visit.PatientMobileNo || "No phone"}
						</p>
						<p>
							<strong>Diagnosis:</strong> {visitData.visit.Diagnosis || "-"}
						</p>
						<p>
							<strong>Prescription:</strong> {visitData.visit.PrescribedMedication || "-"}
						</p>
						<p>
							<strong>Remarks:</strong> {visitData.visit.Remarks || "-"}
						</p>
					</div>

					<div className="card">
						<h3>Add Investigation Order</h3>
						<div className="grid grid-2">
							<div>
								<label>Test Code</label>
								<input
									value={investigationForm.TestCode}
									onChange={(e) => setInvestigationForm({ ...investigationForm, TestCode: e.target.value })}
								/>
							</div>
							<div>
								<label>Test Name</label>
								<input
									value={investigationForm.TestName}
									onChange={(e) => setInvestigationForm({ ...investigationForm, TestName: e.target.value })}
								/>
							</div>
							<div>
								<label>Ordered Date</label>
								<input
									type="date"
									value={investigationForm.OrderedDate}
									onChange={(e) =>
										setInvestigationForm({ ...investigationForm, OrderedDate: e.target.value })
									}
								/>
							</div>
							<div>
								<label>Result Date</label>
								<input
									type="date"
									value={investigationForm.ResultDate}
									onChange={(e) =>
										setInvestigationForm({ ...investigationForm, ResultDate: e.target.value })
									}
								/>
							</div>
							<div>
								<label>Result Value</label>
								<input
									value={investigationForm.ResultValue}
									onChange={(e) =>
										setInvestigationForm({ ...investigationForm, ResultValue: e.target.value })
									}
								/>
							</div>
							<div>
								<label>Comments</label>
								<textarea
									rows={3}
									value={investigationForm.Comments}
									onChange={(e) =>
										setInvestigationForm({ ...investigationForm, Comments: e.target.value })
									}
								/>
							</div>
						</div>
						<div style={{ marginTop: 12 }}>
							<button className="btn" onClick={addInvestigation}>
								Add Investigation
							</button>
						</div>
					</div>

					<div className="card">
						<h3>Investigations for this Visit</h3>
						<table className="table">
							<thead>
								<tr>
									<th>Order</th>
									<th>Test</th>
									<th>Ordered</th>
									<th>Result Date</th>
									<th>Result</th>
									<th>Comments</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{visitData.investigations.map((inv) => (
									<tr key={inv.OrderID}>
										<td>{inv.OrderID}</td>
										<td>
											{inv.TestCode || ""} {inv.TestName ? `- ${inv.TestName}` : ""}
										</td>
										<td>{inv.OrderedDate || "-"}</td>
										<td>{inv.ResultDate || "-"}</td>
										<td>{inv.ResultValue || "-"}</td>
										<td>{inv.Comments || "-"}</td>
										<td>
											<button className="tab" onClick={() => startEditOrder(inv)}>
												Update Result
											</button>
										</td>
									</tr>
								))}
								{visitData.investigations.length === 0 && (
									<tr>
										<td colSpan={7} className="small">
											No investigations added yet
										</td>
									</tr>
								)}
							</tbody>
						</table>

						{editOrderId && (
							<div style={{ marginTop: 16 }}>
								<h4>Update Investigation #{editOrderId}</h4>
								<div className="grid grid-2">
									<div>
										<label>Result Date</label>
										<input
											type="date"
											value={editOrderForm.ResultDate}
											onChange={(e) =>
												setEditOrderForm({ ...editOrderForm, ResultDate: e.target.value })
											}
										/>
									</div>
									<div>
										<label>Result Value</label>
										<input
											value={editOrderForm.ResultValue}
											onChange={(e) =>
												setEditOrderForm({ ...editOrderForm, ResultValue: e.target.value })
											}
										/>
									</div>
									<div>
										<label>Comments</label>
										<textarea
											rows={3}
											value={editOrderForm.Comments}
											onChange={(e) =>
												setEditOrderForm({ ...editOrderForm, Comments: e.target.value })
											}
										/>
									</div>
								</div>
								<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
									<button className="btn" onClick={updateOrder}>
										Save Result
									</button>
									<button className="tab" onClick={() => setEditOrderId(null)}>
										Cancel
									</button>
								</div>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}


