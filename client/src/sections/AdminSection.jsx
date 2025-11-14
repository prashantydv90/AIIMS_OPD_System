import { useEffect, useState } from "react";

export default function AdminSection({ api }) {
	const [activeTab, setActiveTab] = useState("departments");
	const [departments, setDepartments] = useState([]);
	const [shifts, setShifts] = useState([]);
	const [doctors, setDoctors] = useState([]);
	const [staff, setStaff] = useState([]);
	const [rooms, setRooms] = useState([]);

	const [showAddForm, setShowAddForm] = useState(false);
	const [editId, setEditId] = useState(null);

	const [deptForm, setDeptForm] = useState({ DeptName: "", FloorNo: "", Description: "" });
	const [shiftForm, setShiftForm] = useState({ ShiftName: "", StartTime: "", EndTime: "", Description: "" });
	const [doctorForm, setDoctorForm] = useState({
		FirstName: "",
		LastName: "",
		DepartmentID: "",
		Qualification: "",
		Specialty: "",
		MobileNo: "",
		Email: "",
		ShiftID: "",
		ShiftDate: "",
		RoomAssigned: "",
	});
	const [staffForm, setStaffForm] = useState({
		FirstName: "",
		LastName: "",
		Role: "",
		DepartmentID: "",
		MobileNo: "",
		Email: "",
		ShiftID: "",
		ShiftDate: "",
		AssignedRoom: "",
	});
	const [roomForm, setRoomForm] = useState({ DeptID: "", RoomNo: "", FloorNo: "" });

	const [error, setError] = useState("");

	useEffect(() => {
		refreshAll();
	}, [api.base]);

	async function refreshAll() {
		try {
			const [dept, sh, doc, st, rm] = await Promise.all([
				fetch(`${api.base}/api/admin/departments`).then((r) => r.json()),
				fetch(`${api.base}/api/admin/shifts`).then((r) => r.json()),
				fetch(`${api.base}/api/admin/doctors`).then((r) => r.json()),
				fetch(`${api.base}/api/admin/staff`).then((r) => r.json()),
				fetch(`${api.base}/api/admin/rooms`).then((r) => r.json()),
			]);
			setDepartments(Array.isArray(dept) ? dept : []);
			setShifts(Array.isArray(sh) ? sh : []);
			setDoctors(Array.isArray(doc) ? doc : []);
			setStaff(Array.isArray(st) ? st : []);
			setRooms(Array.isArray(rm) ? rm : []);
		} catch (e) {
			console.error(e);
		}
	}

	async function post(path, body) {
		const res = await fetch(`${api.base}${path}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const j = await res.json();
		if (!res.ok) throw new Error(j.error || "Failed");
		return j;
	}

	async function patch(path, body) {
		const res = await fetch(`${api.base}${path}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const j = await res.json();
		if (!res.ok) throw new Error(j.error || "Failed");
		return j;
	}

	function resetForms() {
		setDeptForm({ DeptName: "", FloorNo: "", Description: "" });
		setShiftForm({ ShiftName: "", StartTime: "", EndTime: "", Description: "" });
		setDoctorForm({
			FirstName: "",
			LastName: "",
			DepartmentID: "",
			Qualification: "",
			Specialty: "",
			MobileNo: "",
			Email: "",
			ShiftID: "",
			ShiftDate: "",
			RoomAssigned: "",
		});
		setStaffForm({
			FirstName: "",
			LastName: "",
			Role: "",
			DepartmentID: "",
			MobileNo: "",
			Email: "",
			ShiftID: "",
			ShiftDate: "",
			AssignedRoom: "",
		});
		setRoomForm({ DeptID: "", RoomNo: "", FloorNo: "" });
		setShowAddForm(false);
		setEditId(null);
		setError("");
	}

	function startEdit(entity, type) {
		setEditId(entity[`${type}ID`]);
		setShowAddForm(true);
		if (type === "Department") {
			setDeptForm({
				DeptName: entity.DeptName || "",
				FloorNo: entity.FloorNo || "",
				Description: entity.Description || "",
			});
		} else if (type === "Shift") {
			setShiftForm({
				ShiftName: entity.ShiftName || "",
				StartTime: entity.StartTime || "",
				EndTime: entity.EndTime || "",
				Description: entity.Description || "",
			});
		} else if (type === "Doctor") {
			setDoctorForm({
				FirstName: entity.FirstName || "",
				LastName: entity.LastName || "",
				DepartmentID: entity.DepartmentID || "",
				Qualification: entity.Qualification || "",
				Specialty: entity.Specialty || "",
				MobileNo: entity.MobileNo || "",
				Email: entity.Email || "",
				ShiftID: entity.ShiftID || "",
				ShiftDate: entity.ShiftDate ? entity.ShiftDate.split("T")[0] : "",
				RoomAssigned: entity.RoomAssigned || "",
			});
		} else if (type === "Staff") {
			setStaffForm({
				FirstName: entity.FirstName || "",
				LastName: entity.LastName || "",
				Role: entity.Role || "",
				DepartmentID: entity.DepartmentID || "",
				MobileNo: entity.MobileNo || "",
				Email: entity.Email || "",
				ShiftID: entity.ShiftID || "",
				ShiftDate: entity.ShiftDate ? entity.ShiftDate.split("T")[0] : "",
				AssignedRoom: entity.AssignedRoom || "",
			});
		} else if (type === "Room") {
			setRoomForm({
				DeptID: entity.DeptID || "",
				RoomNo: entity.RoomNo || "",
				FloorNo: entity.FloorNo || "",
			});
		}
	}

	async function saveDepartment() {
		setError("");
		try {
			if (editId) {
				await patch(`/api/admin/department/${editId}`, deptForm);
				alert("Department updated");
			} else {
				await post("/api/admin/department", deptForm);
				alert("Department added");
			}
			resetForms();
			refreshAll();
		} catch (e) {
			setError(e.message);
		}
	}

	async function saveShift() {
		setError("");
		try {
			if (editId) {
				await patch(`/api/admin/shift/${editId}`, shiftForm);
				alert("Shift updated");
			} else {
				await post("/api/admin/shift", shiftForm);
				alert("Shift added");
			}
			resetForms();
			refreshAll();
		} catch (e) {
			setError(e.message);
		}
	}

	async function saveDoctor() {
		setError("");
		try {
			if (editId) {
				await patch(`/api/admin/doctor/${editId}`, doctorForm);
				alert("Doctor updated");
			} else {
				await post("/api/admin/doctor", doctorForm);
				alert("Doctor added");
			}
			resetForms();
			refreshAll();
		} catch (e) {
			setError(e.message);
		}
	}

	async function saveStaff() {
		setError("");
		try {
			if (editId) {
				await patch(`/api/admin/staff/${editId}`, staffForm);
				alert("Staff updated");
			} else {
				await post("/api/admin/staff", staffForm);
				alert("Staff added");
			}
			resetForms();
			refreshAll();
		} catch (e) {
			setError(e.message);
		}
	}

	async function saveRoom() {
		setError("");
		try {
			if (editId) {
				await patch(`/api/admin/room/${editId}`, roomForm);
				alert("Room updated");
			} else {
				await post("/api/admin/room", roomForm);
				alert("Room added");
			}
			resetForms();
			refreshAll();
		} catch (e) {
			setError(e.message);
		}
	}

	return (
		<div className="grid" style={{ gap: 16 }}>
			<div className="card">
				<h2>Admin Panel</h2>
				<nav style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
					<button
						className={`tab ${activeTab === "departments" ? "active" : ""}`}
						onClick={() => {
							setActiveTab("departments");
							resetForms();
						}}
					>
						Departments
					</button>
					<button
						className={`tab ${activeTab === "shifts" ? "active" : ""}`}
						onClick={() => {
							setActiveTab("shifts");
							resetForms();
						}}
					>
						Shifts
					</button>
					<button
						className={`tab ${activeTab === "doctors" ? "active" : ""}`}
						onClick={() => {
							setActiveTab("doctors");
							resetForms();
						}}
					>
						Doctors
					</button>
					<button
						className={`tab ${activeTab === "staff" ? "active" : ""}`}
						onClick={() => {
							setActiveTab("staff");
							resetForms();
						}}
					>
						Staff
					</button>
					<button
						className={`tab ${activeTab === "rooms" ? "active" : ""}`}
						onClick={() => {
							setActiveTab("rooms");
							resetForms();
						}}
					>
						Rooms
					</button>
				</nav>
			</div>

			{activeTab === "departments" && (
				<>
					<div className="card">
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<h3>Departments ({departments.length})</h3>
							<button className="btn" onClick={() => setShowAddForm(true)}>
								+ Add Department
							</button>
						</div>
						{showAddForm && (
							<div style={{ marginTop: 16, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
								<h4>{editId ? "Edit" : "Add"} Department</h4>
								<div className="grid grid-2">
									<div>
										<label>Name *</label>
										<input
											value={deptForm.DeptName}
											onChange={(e) => setDeptForm({ ...deptForm, DeptName: e.target.value })}
										/>
									</div>
									<div>
										<label>Floor</label>
										<input
											type="number"
											value={deptForm.FloorNo}
											onChange={(e) => setDeptForm({ ...deptForm, FloorNo: e.target.value })}
										/>
									</div>
									<div style={{ gridColumn: "1 / span 2" }}>
										<label>Description</label>
										<input
											value={deptForm.Description}
											onChange={(e) => setDeptForm({ ...deptForm, Description: e.target.value })}
										/>
									</div>
								</div>
								<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
									<button className="btn" onClick={saveDepartment} disabled={!deptForm.DeptName}>
										{editId ? "Update" : "Save"}
									</button>
									<button className="tab" onClick={resetForms}>
										Cancel
									</button>
								</div>
							</div>
						)}
						<table className="table" style={{ marginTop: 16 }}>
							<thead>
								<tr>
									<th>ID</th>
									<th>Name</th>
									<th>Floor</th>
									<th>Description</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{departments.map((d) => (
									<tr key={d.DepartmentID}>
										<td>{d.DepartmentID}</td>
										<td>{d.DeptName}</td>
										<td>{d.FloorNo || "-"}</td>
										<td>{d.Description || "-"}</td>
										<td>
											<button className="tab" onClick={() => startEdit(d, "Department")}>
												Edit
											</button>
										</td>
									</tr>
								))}
								{departments.length === 0 && (
									<tr>
										<td colSpan={5} className="small">
											No departments
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{activeTab === "shifts" && (
				<>
					<div className="card">
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<h3>Shifts ({shifts.length})</h3>
							<button className="btn" onClick={() => setShowAddForm(true)}>
								+ Add Shift
							</button>
						</div>
						{showAddForm && (
							<div style={{ marginTop: 16, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
								<h4>{editId ? "Edit" : "Add"} Shift</h4>
								<div className="grid grid-2">
									<div>
										<label>Name *</label>
										<input
											value={shiftForm.ShiftName}
											onChange={(e) => setShiftForm({ ...shiftForm, ShiftName: e.target.value })}
										/>
									</div>
									<div>
										<label>Start Time *</label>
										<input
											type="time"
											value={shiftForm.StartTime}
											onChange={(e) => setShiftForm({ ...shiftForm, StartTime: e.target.value })}
										/>
									</div>
									<div>
										<label>End Time *</label>
										<input
											type="time"
											value={shiftForm.EndTime}
											onChange={(e) => setShiftForm({ ...shiftForm, EndTime: e.target.value })}
										/>
									</div>
									<div>
										<label>Description</label>
										<input
											value={shiftForm.Description}
											onChange={(e) => setShiftForm({ ...shiftForm, Description: e.target.value })}
										/>
									</div>
								</div>
								<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
									<button
										className="btn"
										onClick={saveShift}
										disabled={!shiftForm.ShiftName || !shiftForm.StartTime || !shiftForm.EndTime}
									>
										{editId ? "Update" : "Save"}
									</button>
									<button className="tab" onClick={resetForms}>
										Cancel
									</button>
								</div>
							</div>
						)}
						<table className="table" style={{ marginTop: 16 }}>
							<thead>
								<tr>
									<th>ID</th>
									<th>Name</th>
									<th>Start Time</th>
									<th>End Time</th>
									<th>Description</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{shifts.map((s) => (
									<tr key={s.ShiftID}>
										<td>{s.ShiftID}</td>
										<td>{s.ShiftName}</td>
										<td>{s.StartTime}</td>
										<td>{s.EndTime}</td>
										<td>{s.Description || "-"}</td>
										<td>
											<button className="tab" onClick={() => startEdit(s, "Shift")}>
												Edit
											</button>
										</td>
									</tr>
								))}
								{shifts.length === 0 && (
									<tr>
										<td colSpan={6} className="small">
											No shifts
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{activeTab === "doctors" && (
				<>
					<div className="card">
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<h3>Doctors ({doctors.length})</h3>
							<button className="btn" onClick={() => setShowAddForm(true)}>
								+ Add Doctor
							</button>
						</div>
						{showAddForm && (
							<div style={{ marginTop: 16, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
								<h4>{editId ? "Edit" : "Add"} Doctor</h4>
								<div className="grid grid-2">
									<div>
										<label>First Name *</label>
										<input
											value={doctorForm.FirstName}
											onChange={(e) => setDoctorForm({ ...doctorForm, FirstName: e.target.value })}
										/>
									</div>
									<div>
										<label>Last Name</label>
										<input
											value={doctorForm.LastName}
											onChange={(e) => setDoctorForm({ ...doctorForm, LastName: e.target.value })}
										/>
									</div>
									<div>
										<label>Department</label>
										<select
											value={doctorForm.DepartmentID}
											onChange={(e) => setDoctorForm({ ...doctorForm, DepartmentID: e.target.value })}
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
										<label>Qualification</label>
										<input
											value={doctorForm.Qualification}
											onChange={(e) => setDoctorForm({ ...doctorForm, Qualification: e.target.value })}
										/>
									</div>
									<div>
										<label>Specialty</label>
										<input
											value={doctorForm.Specialty}
											onChange={(e) => setDoctorForm({ ...doctorForm, Specialty: e.target.value })}
										/>
									</div>
									<div>
										<label>Mobile</label>
										<input
											value={doctorForm.MobileNo}
											onChange={(e) => setDoctorForm({ ...doctorForm, MobileNo: e.target.value })}
										/>
									</div>
									<div>
										<label>Email</label>
										<input
											type="email"
											value={doctorForm.Email}
											onChange={(e) => setDoctorForm({ ...doctorForm, Email: e.target.value })}
										/>
									</div>
									<div>
										<label>Shift</label>
										<select
											value={doctorForm.ShiftID}
											onChange={(e) => setDoctorForm({ ...doctorForm, ShiftID: e.target.value })}
										>
											<option value="">-</option>
											{shifts.map((s) => (
												<option key={s.ShiftID} value={s.ShiftID}>
													{s.ShiftName} ({s.StartTime} - {s.EndTime})
												</option>
											))}
										</select>
									</div>
									<div>
										<label>Shift Date</label>
										<input
											type="date"
											value={doctorForm.ShiftDate}
											onChange={(e) => setDoctorForm({ ...doctorForm, ShiftDate: e.target.value })}
										/>
									</div>
									<div>
										<label>Room Assigned</label>
										<input
											value={doctorForm.RoomAssigned}
											onChange={(e) => setDoctorForm({ ...doctorForm, RoomAssigned: e.target.value })}
										/>
									</div>
								</div>
								<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
									<button className="btn" onClick={saveDoctor} disabled={!doctorForm.FirstName}>
										{editId ? "Update" : "Save"}
									</button>
									<button className="tab" onClick={resetForms}>
										Cancel
									</button>
								</div>
							</div>
						)}
						<table className="table" style={{ marginTop: 16 }}>
							<thead>
								<tr>
									<th>ID</th>
									<th>Name</th>
									<th>Department</th>
									<th>Qualification</th>
									<th>Specialty</th>
									<th>Mobile</th>
									<th>Email</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{doctors.map((d) => (
									<tr key={d.DoctorID}>
										<td>{d.DoctorID}</td>
										<td>
											{d.FirstName} {d.LastName || ""}
										</td>
										<td>{d.DeptName || "-"}</td>
										<td>{d.Qualification || "-"}</td>
										<td>{d.Specialty || "-"}</td>
										<td>{d.MobileNo || "-"}</td>
										<td>{d.Email || "-"}</td>
										<td>
											<button className="tab" onClick={() => startEdit(d, "Doctor")}>
												Edit
											</button>
										</td>
									</tr>
								))}
								{doctors.length === 0 && (
									<tr>
										<td colSpan={8} className="small">
											No doctors
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{activeTab === "staff" && (
				<>
					<div className="card">
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<h3>Staff ({staff.length})</h3>
							<button className="btn" onClick={() => setShowAddForm(true)}>
								+ Add Staff
							</button>
						</div>
						{showAddForm && (
							<div style={{ marginTop: 16, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
								<h4>{editId ? "Edit" : "Add"} Staff</h4>
								<div className="grid grid-2">
									<div>
										<label>First Name *</label>
										<input
											value={staffForm.FirstName}
											onChange={(e) => setStaffForm({ ...staffForm, FirstName: e.target.value })}
										/>
									</div>
									<div>
										<label>Last Name</label>
										<input
											value={staffForm.LastName}
											onChange={(e) => setStaffForm({ ...staffForm, LastName: e.target.value })}
										/>
									</div>
									<div>
										<label>Role</label>
										<input
											value={staffForm.Role}
											onChange={(e) => setStaffForm({ ...staffForm, Role: e.target.value })}
										/>
									</div>
									<div>
										<label>Department</label>
										<select
											value={staffForm.DepartmentID}
											onChange={(e) => setStaffForm({ ...staffForm, DepartmentID: e.target.value })}
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
										<label>Mobile</label>
										<input
											value={staffForm.MobileNo}
											onChange={(e) => setStaffForm({ ...staffForm, MobileNo: e.target.value })}
										/>
									</div>
									<div>
										<label>Email</label>
										<input
											type="email"
											value={staffForm.Email}
											onChange={(e) => setStaffForm({ ...staffForm, Email: e.target.value })}
										/>
									</div>
									<div>
										<label>Shift</label>
										<select
											value={staffForm.ShiftID}
											onChange={(e) => setStaffForm({ ...staffForm, ShiftID: e.target.value })}
										>
											<option value="">-</option>
											{shifts.map((s) => (
												<option key={s.ShiftID} value={s.ShiftID}>
													{s.ShiftName} ({s.StartTime} - {s.EndTime})
												</option>
											))}
										</select>
									</div>
									<div>
										<label>Shift Date</label>
										<input
											type="date"
											value={staffForm.ShiftDate}
											onChange={(e) => setStaffForm({ ...staffForm, ShiftDate: e.target.value })}
										/>
									</div>
									<div>
										<label>Assigned Room</label>
										<input
											value={staffForm.AssignedRoom}
											onChange={(e) => setStaffForm({ ...staffForm, AssignedRoom: e.target.value })}
										/>
									</div>
								</div>
								<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
									<button className="btn" onClick={saveStaff} disabled={!staffForm.FirstName}>
										{editId ? "Update" : "Save"}
									</button>
									<button className="tab" onClick={resetForms}>
										Cancel
									</button>
								</div>
							</div>
						)}
						<table className="table" style={{ marginTop: 16 }}>
							<thead>
								<tr>
									<th>ID</th>
									<th>Name</th>
									<th>Role</th>
									<th>Department</th>
									<th>Mobile</th>
									<th>Email</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{staff.map((s) => (
									<tr key={s.StaffID}>
										<td>{s.StaffID}</td>
										<td>
											{s.FirstName} {s.LastName || ""}
										</td>
										<td>{s.Role || "-"}</td>
										<td>{s.DeptName || "-"}</td>
										<td>{s.MobileNo || "-"}</td>
										<td>{s.Email || "-"}</td>
										<td>
											<button className="tab" onClick={() => startEdit(s, "Staff")}>
												Edit
											</button>
										</td>
									</tr>
								))}
								{staff.length === 0 && (
									<tr>
										<td colSpan={7} className="small">
											No staff
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{activeTab === "rooms" && (
				<>
					<div className="card">
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<h3>Rooms ({rooms.length})</h3>
							<button className="btn" onClick={() => setShowAddForm(true)}>
								+ Add Room
							</button>
						</div>
						{showAddForm && (
							<div style={{ marginTop: 16, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
								<h4>{editId ? "Edit" : "Add"} Room</h4>
								<div className="grid grid-2">
									<div>
										<label>Department</label>
										<select
											value={roomForm.DeptID}
											onChange={(e) => setRoomForm({ ...roomForm, DeptID: e.target.value })}
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
										<label>Room No</label>
										<input
											value={roomForm.RoomNo}
											onChange={(e) => setRoomForm({ ...roomForm, RoomNo: e.target.value })}
										/>
									</div>
									<div>
										<label>Floor No</label>
										<input
											type="number"
											value={roomForm.FloorNo}
											onChange={(e) => setRoomForm({ ...roomForm, FloorNo: e.target.value })}
										/>
									</div>
								</div>
								<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
									<button className="btn" onClick={saveRoom}>
										{editId ? "Update" : "Save"}
									</button>
									<button className="tab" onClick={resetForms}>
										Cancel
									</button>
								</div>
							</div>
						)}
						<table className="table" style={{ marginTop: 16 }}>
							<thead>
								<tr>
									<th>ID</th>
									<th>Department</th>
									<th>Room No</th>
									<th>Floor No</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{rooms.map((r) => (
									<tr key={r.RoomID}>
										<td>{r.RoomID}</td>
										<td>{r.DeptName || "-"}</td>
										<td>{r.RoomNo || "-"}</td>
										<td>{r.FloorNo || "-"}</td>
										<td>
											<button className="tab" onClick={() => startEdit(r, "Room")}>
												Edit
											</button>
										</td>
									</tr>
								))}
								{rooms.length === 0 && (
									<tr>
										<td colSpan={5} className="small">
											No rooms
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{error ? <p style={{ color: "crimson" }}>{error}</p> : null}
		</div>
	);
}
