

# PUBLIC-TOILET-COMPLAINT-MANAGEMENT-SYSTEM
SIH 2026 project for digital public toilet cleaning management, citizen complaint registration, and real-time complaint tracking.


<p align="center">
  <img src="./public/toilet-icon.jpg" width="180" alt="Public Toilet Cleaning Logo">
</p>

<p align="center">
A web-based sanitation management system to monitor public toilet cleaning activities and manage citizen complaints with real-time tracking.
</p>

<p align="center">
<img src="https://img.shields.io/badge/Project-SIH%202026-success">
<img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white">
<img src="https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white">
<img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white">
<img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black">
<img src="https://img.shields.io/badge/Security-bcrypt-blueviolet">
</p>

---

# 📌 Project Overview

**Public Toilet Cleaning & Complaint Register** is a Smart India Hackathon 2026 project developed to solve the problem of unorganized toilet cleaning records and manual complaint handling.

The system helps sanitation supervisors maintain cleaning records, monitor toilet block conditions, and resolve citizen complaints efficiently.

---

# ❓ Problem Statement

Public toilet cleaning activities are often maintained manually or verbally. Due to the lack of proper tracking:

* Cleaning schedules are not recorded properly.
* Supervisors cannot verify cleaning activities.
* Citizens cannot track complaint progress.
* Repeated issues remain unresolved.

---

# 💡 Solution

This project provides a digital platform where:

✅ Admins can manage cleaning records.
✅ Citizens can register complaints.
✅ Each complaint receives a unique Complaint ID.
✅ Citizens can track complaint status.
✅ Supervisors can update resolution progress.

---

# ✨ Features

## 🔐 Admin Portal

* Secure admin authentication
* Password hashing using bcrypt
* Dashboard with cleaning statistics
* View toilet cleaning records
* Search and filter complaints
* Assign cleaning staff
* Update complaint status

---

## 👤 Citizen Portal

* Register toilet complaints

* Submit:

  * Name
  * Mobile Number
  * Location
  * Complaint Description

* Automatic Complaint ID generation

Example:

```
PTC20260725001
```

* Track complaint status using Complaint ID

---

## 📊 Complaint Tracking

Complaint workflow:

```
Complaint Submitted
        ↓
Under Review
        ↓
Assigned
        ↓
Cleaning In Progress
        ↓
Resolved
```

---

# 🛠️ Technology Stack

| Technology | Usage               |
| ---------- | ------------------- |
| HTML5      | Frontend Structure  |
| CSS3       | Styling & UI Design |
| JavaScript | Frontend Logic      |
| Node.js    | Backend Runtime     |
| Express.js | Server Framework    |
| bcrypt     | Password Security   |
| JSON       | Data Storage        |
| CORS       | API Communication   |

---

# 📂 Project Structure

```
PUBLIC-TOILET-CLEANING-AND-COMPLAINT-PORTAL

│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── detail.html
│   ├── style.css
│   ├── script.js
│   ├── login.js
│   ├── detail.js
│   ├── data.json
│   └── toilet-icon.jpg
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

# 🚀 Installation & Setup

## Prerequisites

* Node.js installed
* npm installed

---

## Clone Repository

```bash
git clone https://github.com/praveenkumar19/PUBLIC-TOILET-CLEANING-AND-COMPLAINT-PORTAL.git
```

Move into project folder:

```bash
cd PUBLIC-TOILET-CLEANING-AND-COMPLAINT-PORTAL
```

---

## Install Dependencies

```bash
npm install
```

---

## Start Server

```bash
node server.js
```

Open browser:

```
http://localhost:3000
```

---

# 🔒 Security Features

| Feature           | Implementation             |
| ----------------- | -------------------------- |
| Password Security | bcrypt hashing             |
| Input Validation  | Client & Server validation |
| Authentication    | Role-based login           |
| Data Protection   | No plain text passwords    |
| Error Handling    | Secure error messages      |

---

# 📸 Screenshots

## Login Page

<img width="1917" height="1078" alt="Screenshot 2026-07-25 134308" src="https://github.com/user-attachments/assets/467b4596-7711-4266-a591-c218954952d4" />


## Admin Dashboard

<img width="1918" height="1078" alt="Screenshot 2026-07-25 134400" src="https://github.com/user-attachments/assets/9ff857c3-38f2-4865-b165-009efc88db60" />


## Citizen Complaint

<img width="1918" height="1078" alt="Screenshot 2026-07-25 134434" src="https://github.com/user-attachments/assets/179b9e36-7cdc-4001-a591-582c8b6f3a05" />


## Complaint Tracking

<img width="1918" height="1078" alt="Screenshot 2026-07-25 134500" src="https://github.com/user-attachments/assets/e7bb2260-c753-432b-9af7-53aa2ad50cfb" />

## Explaination Video

https://github.com/user-attachments/assets/967fa047-262d-4827-bae0-78ed8fbadadc

## Prensentation Slides

**[View Presentation on Google Drive](https://drive.google.com/file/d/1qNT8xJwufrBFC7jPNlyDbgLFgDdQmSts/view)**


---

# 📈 Future Enhancements

* 📱 Mobile application for cleaners
* 📍 Map integration for toilet locations
* 📊 Advanced analytics dashboard
* 🔔 SMS/Email complaint notifications
* 🤖 AI-based complaint prediction
* 📶 Offline PWA support

---

# 👨‍💻 Developer

**Praveen Kumar A**

Cyber Security Student
Prince Dr. K. Vasudevan College of Engineering and Technology

📧 Email:
[mrapraveenkumar200719@gmail.com](mailto:mrapraveenkumar200719@gmail.com)

🔗 GitHub:
https://github.com/praveenkumar19

🔗 LinkedIn:  
https://www.linkedin.com/in/praveen-kumar-792b8a395/

🔗 Portfolio:
https://praveenkumar19.github.io/PORTFOLIO/

---

# 🏆 Smart India Hackathon 2026

Developed as part of **SIH 2026 Internal Project Assessment**.

---

<p align="center">
⭐ If you like this project, consider giving it a star ⭐
<br>
Made with ❤️ by Praveen Kumar
</p>
