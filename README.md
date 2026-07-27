# 🏥 AIIMS OPD Management System

A full-stack Hospital Outpatient Department (OPD) Management System designed to simplify patient registration, appointment scheduling, doctor management, and pathology workflows. The application provides a centralized platform for hospital staff to efficiently manage day-to-day OPD operations through an intuitive web interface.

---

## 📌 Features

### 👨‍⚕️ Doctor Module
- View assigned appointments
- Access patient information
- Manage OPD consultations
- Update patient visit records

### 🧑‍💼 Reception Module
- Register new patients
- Schedule appointments
- Manage patient queue
- Update patient details

### 👨‍💻 Admin Module
- Manage doctors and departments
- Monitor hospital records
- Maintain patient database
- Administrative dashboard

### 🧪 Pathology Module
- Manage pathology records
- Store test information
- View patient test history

### 👤 Patient Management
- Patient registration
- Patient profile management
- Medical history tracking
- Visit history

### 📅 Appointment Management
- Book appointments
- Update appointment status
- View doctor schedules
- Appointment history

---

# 🛠 Tech Stack

## Frontend
- React.js
- Vite
- HTML5
- CSS3
- JavaScript (ES6)

## Backend
- Node.js
- Express.js
- REST APIs

## Database
- MySQL

## Other Tools
- CORS
- dotenv
- mysql2

---

# 📂 Project Structure

```
AIIMS_OPD_System/
│
├── client/                 # React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                 # Express Backend
│   ├── routes/
│   │   ├── admin.js
│   │   ├── doctor.js
│   │   ├── patient.js
│   │   ├── reception.js
│   │   ├── appointment.js
│   │   └── pathology.js
│   ├── db.js
│   ├── index.js
│   └── package.json
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

- Node.js (v18 or above)
- MySQL Server
- npm

---

## Clone Repository

```bash
git clone https://github.com/your-username/AIIMS_OPD_System.git

cd AIIMS_OPD_System
```

---

## Backend Setup

```bash
cd server

npm install
```

Create a `.env` file inside the `server` folder.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aiims_opd
DB_PORT=3306
PORT=5000
```

Start the backend server:

```bash
npm run dev
```

or

```bash
npm start
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

The application will typically be available at:

```
http://localhost:5173
```

---

# 📡 API Modules

The backend is organized into separate REST modules for:

- Doctor
- Patient
- Reception
- Appointment
- Pathology
- Admin

Each module exposes APIs for CRUD operations and hospital workflow management.

---

# Database

The system uses **MySQL** to manage:

- Patients
- Doctors
- Departments
- Appointments
- Visits
- Pathology Records

---

