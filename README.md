# CampusOne

> **CampusOne** is a complete institutional management backend that handles academics, attendance, approvals, timetable, responsibilities and user workflows.
> Built with **Node.js, Express, MongoDB, JWT Auth, Multer, Cloudinary & Kafka (event-driven bulk import processing).**

---

## User Authentication & Profile Routes

**Base Path:** `/user`

| Method | Endpoint                   | Access          | Description                   |
| ------ | -------------------------- | --------------- | ----------------------------- |
| POST   | `/register`                | Institution JWT | Create user under institution |
| POST   | `/login`                   | Public          | Login user                    |
| POST   | `/refresh`                 | Public          | Refresh access token          |
| POST   | `/forgot-password`         | Public          | Send reset mail               |
| POST   | `/reset-password/:token`   | Public          | Reset password                |
| GET    | `/verify-email/:token`     | Public          | Verify email                  |
| GET    | `/current-user`            | User JWT        | Get logged in user            |
| POST   | `/logout`                  | User JWT        | Logout                        |
| POST   | `/send-email-verification` | User JWT        | Send verification mail        |
| POST   | `/update-avatar`           | User JWT        | Update avatar                 |
| PUT    | `/update`                  | User JWT        | Update profile                |
| GET    | `/faculty`                 | User JWT        | Get linked faculty            |
| DELETE | `/delete/:userId`          | Institution JWT | Delete user                   |

---

## Institution Routes

**Base Path:** `/institution`

| Method | Endpoint                   | Access          | Description            |
| ------ | -------------------------- | --------------- | ---------------------- |
| GET    | `/`                        | Public          | Get all institutions   |
| GET    | `/:institutionId`          | Public          | Get institution        |
| POST   | `/register`                | Public          | Register institution   |
| POST   | `/login`                   | Public          | Login institution      |
| POST   | `/refresh`                 | Public          | Refresh token          |
| POST   | `/forgot-password`         | Public          | Forgot password        |
| POST   | `/reset-password/:token`   | Public          | Reset password         |
| GET    | `/verify-email/:token`     | Public          | Verify email           |
| GET    | `/current-institution`     | Institution JWT | Current institution    |
| POST   | `/logout`                  | Institution JWT | Logout                 |
| POST   | `/send-email-verification` | Institution JWT | Send verification      |
| POST   | `/update-avatar`           | Institution JWT | Update avatar          |
| PUT    | `/update`                  | Institution JWT | Update institution     |
| DELETE | `/delete/:institutionId`   | Institution JWT | Delete institution     |
| POST   | `/code-exists`             | Public          | Check institution code |

---

##  Faculty Management

**Base Path:** `/faculty`

| Method | Endpoint                         | Access          | Description              |
| ------ | -------------------------------- | --------------- | ------------------------ |
| GET    | `/:facultyId`                    | Public          | Get faculty              |
| POST   | `/`                              | Institution JWT | Create faculty           |
| PUT    | `/:facultyId`                    | Institution JWT | Edit faculty             |
| DELETE | `/:facultyId`                    | Institution JWT | Delete faculty           |
| GET    | `/by-institution/:institutionId` | Institution JWT | Faculties of institution |
| GET    | `/by-department/:departmentId`   | Institution JWT | Faculties by department  |
| PUT    | `/:facultyId/department`         | Institution JWT | Update department        |
| PUT    | `/:facultyId/status`             | Institution JWT | Activate/Deactivate      |
| PUT    | `/:facultyId/in-charge`          | Institution JWT | Toggle in-charge         |
| PUT    | `/:facultyId/courses`            | Institution JWT | Assign courses           |
| DELETE | `/:facultyId/courses/:courseId`  | Institution JWT | Remove course            |
| PUT    | `/self/:facultyId`               | User JWT        | Self edit                |

---

##  Student Management

**Base Path:** `/student`

| Method | Endpoint                           | Access          | Description             |
| ------ | ---------------------------------- | --------------- | ----------------------- |
| POST   | `/create-student`                  | Institution JWT | Create student          |
| PUT    | `/edit-student/:studentId`         | Institution JWT | Edit student            |
| DELETE | `/delete-student/:studentId`       | Institution JWT | Delete student          |
| GET    | `/institution/:institutionId`      | Institution JWT | Students by institution |
| GET    | `/branch/:branchId`                | Institution JWT | Students by branch      |
| PUT    | `/update-branch/:studentId`        | Institution JWT | Update branch           |
| PUT    | `/update-hostel-status/:studentId` | Institution JWT | Hostel status           |
| PUT    | `/update-semester/:studentId`      | User JWT        | Update semester         |
| PUT    | `/change-status/:studentId`        | Institution JWT | Activate/Deactivate     |
| GET    | `/:studentId`                      | Public          | Student by id           |

---

## Department & Branch

### Department (`/department`)

| Method | Endpoint                           | Access          | Description                   |
| ------ | ---------------------------------- | --------------- | ----------------------------- |
| GET    | `/institution/:institutionId`      | Public          | Get departments by institution |
| GET    | `/:departmentId`                   | Public          | Get department by ID          |
| POST   | `/create-department`               | Institution JWT | Create department             |
| PUT    | `/update-department/:departmentId` | Institution JWT | Update department             |
| DELETE | `/delete-department/:departmentId` | Institution JWT | Delete department             |

### Branch (`/branch`)

| Method | Endpoint                       | Access |
| ------ | ------------------------------ | ------ |
| GET    | `/institutions/:institutionId` | Public |
| GET    | `/:branchId`                   | Public |
| GET    | `/departments/:departmentId`   | Public |
| POST   | `/institutions/:institutionId` | Public |
| PUT    | `/:branchId`                   | Public |
| DELETE | `/:branchId`                   | Public |

---

## Course Management

**Base Path:** `/course`

| Method | Endpoint                      | Access          | Description            |
| ------ | ----------------------------- | --------------- | ---------------------- |
| GET    | `/department/:departmentId`   | Public          | Courses by department  |
| GET    | `/institution/:institutionId` | Public          | Courses by institution |
| GET    | `/:courseId`                  | Public          | Course by id           |
| POST   | `/create-course`              | Institution JWT | Create                 |
| PUT    | `/:courseId`                  | Institution JWT | Update                 |
| DELETE | `/:courseId`                  | Institution JWT | Delete                 |
| PUT    | `/change-status/:courseId`    | Institution JWT | Activate/Deactivate    |

---

##  Timetable & Sessions

### Timetable (`/timetable`)

| Method | Endpoint                      | Access          |
| ------ | ----------------------------- | --------------- |
| GET    | `/faculty/:facultyId`         | Public          |
| GET    | `/student/:studentId`         | Public          |
| GET    | `/institution/:institutionId` | Public          |
| POST   | `/slot`                       | Institution JWT |
| PATCH  | `/slot/:slotId`               | Institution JWT |
| DELETE | `/slot/:slotId`               | Institution JWT |

### Attendance Sessions (`/session`)

| Method | Endpoint              | Access          |
| ------ | --------------------- | --------------- |
| GET    | `/faculty/:facultyId` | Public          |
| GET    | `/student/:studentId` | Public          |
| POST   | `/generate`           | Institution JWT |
| PATCH  | `/:sessionId/cancel`  | User JWT        |
| DELETE | `/:sessionId`         | User JWT        |

---

## Attendance Records

**Base Path:** `/attendance`

| Method | Endpoint                                    | Access          | Description       |
| ------ | ------------------------------------------- | --------------- | ----------------- |
| POST   | `/user/:sessionId/mark`                     | User JWT        | Mark attendance   |
| GET    | `/user/student/:studentId/course/:courseId` | User JWT        | Course attendance |
| GET    | `/user/student/:studentId/report`           | User JWT        | Full report       |
| GET    | `/batch/defaulters`                         | Institution JWT | Defaulters list   |
| GET    | `/batch/matrix`                             | Institution JWT | Attendance matrix |

---

## Applications (Approval Workflow)

**Base Path:** `/application`

| Method | Endpoint                  | Access   |
| ------ | ------------------------- | -------- |
| POST   | `/`                       | User JWT |
| GET    | `/my`                     | User JWT |
| GET    | `/faculty/pending`        | User JWT |
| POST   | `/:applicationId/approve` | User JWT |
| POST   | `/:applicationId/reject`  | User JWT |
| POST   | `/:applicationId/forward` | User JWT |

---

##  Marks & Evaluation

**Base Path:** `/marks`

| Method | Endpoint                               | Access   | Description                                          |
| ------ | -------------------------------------- | -------- | ---------------------------------------------------- |
| POST   | `/record`                              | User JWT | Record or update marks/evaluation entries            |
| GET    | `/matrix`                              | User JWT | Get aggregated marks/evaluation matrix               |
| GET    | `/student/:studentId/all`              | User JWT | Get all marks/evaluations for a specific student     |
| GET    | `/student/:studentId/course/:courseId` | User JWT | Get a student's marks for a specific course          |

---

##  Responsibilities

**Base Path:** `/responsibility`

| Method | Endpoint                      | Access          |
| ------ | ----------------------------- | --------------- |
| GET    | `/institution/:institutionId` | Public          |
| POST   | `/`                           | Institution JWT |
| PUT    | `/:responsibilityId`          | Institution JWT |
| DELETE | `/:responsibilityId`          | Institution JWT |

### Responsibility Assignment (`/responsibility-assignment`)

| Method | Endpoint          | Access          |
| ------ | ----------------- | --------------- |
| GET    | `/`               | Public          |
| POST   | `/`               | Institution JWT |
| PATCH  | `/:id/deactivate` | Institution JWT |

---

## Bulk Import (Kafka Powered)

**Base Path:** `/import`

| Method | Endpoint               | Description                                    |
| ------ | ---------------------- | ---------------------------------------------- |
| POST   | `/students`            | Upload student CSV (async processed via Kafka) |
| POST   | `/faculty`             | Upload faculty CSV (async processed via Kafka) |
| GET    | `/students/:id/status` | Import status                                  |
| GET    | `/faculty/:id/status`  | Import status                                  |

> Large uploads are processed asynchronously using **Apache Kafka event streaming** to avoid blocking the main server and ensure reliability.

---

## Authentication Summary

* **User JWT** → Faculty/User operations
* **Institution JWT** → Admin/management operations

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
JWT_REFRESH_SECRET=
MAILJET_API_KEY=
MAILJET_SECRET=
MAILJET_FROM_EMAIL=
MAILJET_FROM_NAME=
NODE_ENV=
BACKEND_URL=
KAFKA_BROKERS=
```

---

##  Author

**Vansh Verma**  
Full Stack Developer  

---


