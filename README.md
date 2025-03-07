# Employee Management System

## 📚 Introduction
Employee Management System is a full-stack web application designed to streamline employee and attendance management. Built using modern web technologies, this system allows for CRUD operations (Create, Read, Update, Delete) on employee records and attendance logs.

## 🚀 Tech Stack
- **Backend:** Node.js, Express.js
- **Frontend:** EJS, EJS-Mate, Bootstrap
- **Database:** MongoDB (with Mongoose)
- **Authentication:** Passport.js, Passport-Local-Mongoose
- **Validation:** Joi
- **File Uploads:** Multer
- **Session & Flash Messages:** Express-Session, Connect-Flash
- **HTTP Method Override:** Method-Override

## 🏗️ Setup & Installation

Follow these steps to set up the project locally:

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/employee-management.git
cd employee-management
```

### 2. Initialize package.json
```bash
npm init -y
```

### 2. Install dependencies
```bash
npm i express mongoose ejs ejs-mate method-override joi express-session connect-flash passport passport-local-mongoose multer
```

### 3. Set up environment variables
Create a `.env` file in the root directory and configure the following:
```
DATABASE_URL=mongodb://127.0.0.1/employee-attendance
SECRET=yourSecretKey
```

### 4. Seed initial data (optional)
If you want to seed some sample data, run:
```bash
node seeds/employee.js
```
and
```bash
node seeds/attendance.js
```

### 5. Run the server
Start the development server:
```bash
nodemon app.js
```
The app will run on `http://localhost:3000`

## 📦 Project Structure
```
.
├── public/          # Static assets (CSS, JS, images)
├── routes/          # Express routes
├── models/          # Mongoose models
├── views/           # EJS templates
├── seeds/           # Seed data scripts
├── app.js           # Main application file
├── .env             # Environment variables
└── package.json     # Project dependencies
```

## 📄 Features
- Employee CRUD functionality
- Attendance logging (Check-in, Check-out)
- User authentication and authorization
- Real-time form validation
- Flash messages for user feedback

## ✅ Contributing
Contributions are welcome! Feel free to fork the repo and submit pull requests.

## 📝 License
This project is licensed under the MIT License.

---

Looking forward to building this project together! 💡

