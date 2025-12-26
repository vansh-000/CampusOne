# CampusOne

## 📌 Institutions API Endpoints

### 🔓 Public Routes

| Method | Endpoint | Description |
|------|--------|------------|
| POST | `/register` | Register a new institution |
| POST | `/login` | Login institution |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password/:token` | Reset password |
| GET | `/verify-email/:token` | Verify email |

---

### 🔒 Protected Routes (JWT Required)

| Method | Endpoint | Description |
|------|--------|------------|
| GET | `/current-institution` | Get logged-in institution |
| POST | `/logout` | Logout institution |
| POST | `/send-email-verification` | Send verification email |
| POST | `/update-avatar` | Update institution avatar |

---

## 🔑 Environment Variables
```
PORT=
FRONTEND_URL=
MONGODB_URI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
JWT_SECRET=
MAILJET_API_KEY=
MAILJET_SECRET=
MAILJET_FROM_EMAIL=
MAILJET_FROM_NAME=
NODE_ENV=
BACKEND_URL=
```

## 👨‍💻 Author

**Vansh Verma**  
Full Stack Developer  

---


