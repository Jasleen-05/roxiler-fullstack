# 🚀 Roxiler Fullstack Project

A full-stack web application built with **React (frontend)** and **Node.js + Express + PostgreSQL (backend)**.  
It includes authentication, user roles (**Admin, Owner, User**), light/dark mode support, and role-based dashboards.

---

## ✨ Features
- 🔑 **Authentication (Signup/Login)** with JWT & bcrypt  
- 🌓 **Light/Dark Mode** using Tailwind CSS  
- 👤 **User Dashboard** – search stores, rate stores, update password  
- 🛠 **Admin Dashboard** – manage users & stores  
- 🏬 **Owner Dashboard** – manage owned stores   
- 🎨 Modern UI with Tailwind + Context API  

---

## 📂 Project Structure
```
roxiler-fullstack/
│── backend/ # Express + PostgreSQL backend
│ ├── models/ # Sequelize models (User, Store, Rating)
│ ├── routes/ # Routes (auth, admin, user, owner)
│ ├── server.js # App entry point
│ └── ...
│
│── frontend/ # React + Vite frontend
│ ├── src/
│ │ ├── components/ # Navbar, Forms, etc.
│ │ ├── pages/ # Dashboard, Profile
│ │ ├── context/ # ThemeContext
│ │ └── ...
│
└── README.md
```

---

## ⚙️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS  
- **Backend:** Node.js, Express, Sequelize ORM  
- **Database:** PostgreSQL  
- **Auth:** JWT, bcrypt
- **API Testing:** Postman

---

## 🚀 Setup Instructions

### 1. Clone Repo
```bash
git clone https://github.com/<your-username>/roxiler-fullstack.git
cd roxiler-fullstack
```
2. Backend Setup
```bash
cd backend
npm install
```
Create .env inside backend/:
```
DB_NAME=roxiler_db
DB_USER=postgres
DB_PASS=yourpassword
DB_HOST=localhost
JWT_SECRET=mysupersecretkey123
PORT=5000
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=no-reply@yourdomain.com
```
Run backend:
```
npm start
```
3. Frontend Setup
```
cd frontend
npm install
npm run dev
```
Open → http://localhost:5173

---

## 📸 Screenshots

Admin
    
<img width="1919" height="833" alt="image" src="https://github.com/user-attachments/assets/106c86d5-e63d-4505-a3ef-87f57d5001d0" />

Owner
    
<img width="1894" height="829" alt="image" src="https://github.com/user-attachments/assets/54908df0-9f27-415f-bcd3-abbd4ee33f17" />

User
    
<img width="1919" height="822" alt="image" src="https://github.com/user-attachments/assets/b5198701-68a7-445b-b5de-ef7fb6e5815c" />



---

##  👩‍💻 Author
Jasleen Kaur Matharoo      
📧 For queries: jasleen.matharoo@gmail.com
