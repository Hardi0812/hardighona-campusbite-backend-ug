
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 5000;

const DATA_FILE = path.join(__dirname, "data", "students.json");
const FORM_FILE = path.join(__dirname, "config", "studentForm.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(UPLOAD_DIR));

// =========================
// PHOTO UPLOAD CONFIGURATION
// =========================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const filename =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000000) +
            path.extname(file.originalname);

        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ["image/jpeg", "image/png"];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG and PNG images are allowed"));
        }
    }
});

// =========================
// JSON FILE FUNCTIONS
// =========================

function readStudents() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveStudents(students) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
}

// =========================
// VALIDATION
// =========================

function validateStudent(data, students, currentId = null) {
    const errors = {};

    if (
        typeof data.studentName !== "string" ||
        data.studentName.trim().length < 2 ||
        data.studentName.trim().length > 50
    ) {
        errors.studentName =
            "Student Name is required and must be 2-50 characters";
    }

    if (
        typeof data.enrollmentNo !== "string" ||
        !data.enrollmentNo.trim()
    ) {
        errors.enrollmentNo = "Enrollment No is required";
    } else if (
        students.some(s =>
            s.enrollmentNo === data.enrollmentNo.trim() &&
            s.id !== currentId
        )
    ) {
        errors.enrollmentNo = "Enrollment No already exists";
    }

    if (typeof data.email !== "string" || !data.email.trim()) {
        errors.email = "Email is required";
    } else {
        const email = data.email.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            errors.email = "Please enter a valid email address";
        } else if (
            students.some(s =>
                s.email.toLowerCase() === email.toLowerCase() &&
                s.id !== currentId
            )
        ) {
            errors.email = "Email already exists";
        }
    }

    if (
        typeof data.mobile !== "string" ||
        !/^[0-9]{10}$/.test(data.mobile)
    ) {
        errors.mobile = "Mobile must contain exactly 10 digits";
    }

    if (
        typeof data.dateOfBirth !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth) ||
        Number.isNaN(Date.parse(data.dateOfBirth)) ||
        new Date(data.dateOfBirth).toISOString().slice(0, 10) !== data.dateOfBirth
    ) {
        errors.dateOfBirth = "Enter a valid Date of Birth";
    }

    const age = Number(data.age);

    if (
        data.age === "" ||
        data.age === null ||
        data.age === undefined ||
        !Number.isInteger(age) ||
        age < 18 ||
        age > 60
    ) {
        errors.age = "Age must be between 18 and 60";
    }

    const allowedGenders = ["Male", "Female", "Other"];

    if (!allowedGenders.includes(data.gender)) {
        errors.gender = "Gender must be Male, Female or Other";
    }

    const allowedCourses = [
        "B.Sc. IT",
        "BCA",
        "B.Tech",
        "MCA",
        "M.Sc. IT"
    ];

    if (!allowedCourses.includes(data.course)) {
        errors.course = "Invalid course selected";
    }

    if (
        typeof data.specialization !== "string" ||
        !data.specialization.trim()
    ) {
        errors.specialization = "Specialization is required";
    }

    const semester = Number(data.semester);

    if (
        data.semester === "" ||
        data.semester === null ||
        data.semester === undefined ||
        !Number.isInteger(semester) ||
        semester < 1 ||
        semester > 6
    ) {
        errors.semester = "Semester must be between 1 and 6";
    }

    for (const field of ["address", "city", "state"]) {
        if (
            typeof data[field] !== "string" ||
            !data[field].trim()
        ) {
            errors[field] = `${field} is required`;
        }
    }

    const allowedSkills = [
        "Java",
        "JavaScript",
        "Python",
        "C",
        "C++",
        "HTML",
        "CSS",
        "SQL"
    ];

    if (!allowedSkills.includes(data.skills)) {
        errors.skills = "Select a valid skill";
    }

    const allowedHobbies = [
        "Reading",
        "Music",
        "Gaming",
        "Travel",
        "Sports",
        "Photography"
    ];

    if (!allowedHobbies.includes(data.hobbies)) {
        errors.hobbies = "Select a valid hobby";
    }

    return errors;
}

// =========================
// STUDENT HELPER FUNCTIONS
// =========================

function makeStudent(data, id, photo) {
    return {
        id,
        studentName: data.studentName.trim(),
        enrollmentNo: data.enrollmentNo.trim(),
        email: data.email.trim(),
        mobile: data.mobile,
        dateOfBirth: data.dateOfBirth,
        age: Number(data.age),
        gender: data.gender,
        course: data.course,
        specialization: data.specialization.trim(),
        semester: Number(data.semester),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        skills: data.skills,
        hobbies: data.hobbies,
        passportPhoto: photo
    };
}

function nextStudentId(students) {
    return Math.max(0, ...students.map(s => Number(s.id) || 0)) + 1;
}

function isUploadedPhoto(filename) {
    return (
        typeof filename === "string" &&
        path.basename(filename) === filename &&
        fs.existsSync(path.join(UPLOAD_DIR, filename)) &&
        /\.(jpg|jpeg|png)$/i.test(filename)
    );
}

// =========================
// HOME
// =========================

app.get("/", (req, res) => {
    res.json({
        message: "Student Management System Backend"
    });
});

// =========================
// FORM CONFIGURATION
// =========================

app.get("/api/form-config", (req, res, next) => {
    try {
        res.json(JSON.parse(fs.readFileSync(FORM_FILE, "utf8")));
    } catch (error) {
        next(error);
    }
});

// =========================
// CREATE ONE STUDENT
// POST /api/students
// =========================

app.post("/api/students", upload.single("passportPhoto"), (req, res, next) => {
    try {
        const students = readStudents();
        const errors = validateStudent(req.body, students);

        if (!req.file) {
            errors.passportPhoto = "Passport Photo is required";
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const student = makeStudent(
            req.body,
            nextStudentId(students),
            req.file.filename
        );

        students.push(student);
        saveStudents(students);

        return res.status(201).json({
            success: true,
            message: "Student created successfully",
            data: student
        });
    } catch (error) {
        next(error);
    }
});

// =========================
// BULK INSERT
// POST /api/students/bulk
// =========================

app.post("/api/students/bulk", (req, res, next) => {
    try {
        const input = req.body.students;

        if (!Array.isArray(input) || input.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Provide a non-empty students array"
            });
        }

        const existing = readStudents();
        const added = [];
        const errors = [];
        let id = nextStudentId(existing);

        input.forEach((data, index) => {
            if (
                !data ||
                typeof data !== "object" ||
                Array.isArray(data)
            ) {
                errors.push({
                    index,
                    message: "Invalid student object"
                });
                return;
            }

            const photo = data.passportPhoto;

            if (!isUploadedPhoto(photo)) {
                errors.push({
                    index,
                    errors: {
                        passportPhoto:
                            "Provide an existing uploaded JPG or PNG filename"
                    }
                });
                return;
            }

            added.push(makeStudent(data, id++, photo));
        });

        const combined = [...existing, ...added];

        added.forEach(student => {
            const validationErrors = validateStudent(
                student,
                combined,
                student.id
            );

            if (Object.keys(validationErrors).length > 0) {
                errors.push({
                    id: student.id,
                    enrollmentNo: student.enrollmentNo,
                    errors: validationErrors
                });
            }
        });

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Bulk insert failed; no students were saved",
                errors
            });
        }

        saveStudents(combined);

        return res.status(201).json({
            success: true,
            insertedCount: added.length,
            data: added
        });
    } catch (error) {
        next(error);
    }
});

// =========================
// READ ALL STUDENTS
// GET /api/students
// =========================

app.get("/api/students", (req, res, next) => {
    try {
        const students = readStudents();

        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        next(error);
    }
});

// =========================
// SEARCH STUDENTS
// GET /api/students/search?query=...
// =========================

app.get("/api/students/search", (req, res, next) => {
    try {
        const query = String(req.query.query || "").trim().toLowerCase();

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Provide a search query"
            });
        }

        const students = readStudents();

        const results = students.filter(student =>
            [
                student.studentName,
                student.enrollmentNo,
                student.email,
                student.course,
                student.city
            ].some(value =>
                String(value || "").toLowerCase().includes(query)
            )
        );

        return res.json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        next(error);
    }
});

// =========================
// READ ONE STUDENT
// GET /api/students/:id
// =========================

app.get("/api/students/:id", (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID"
            });
        }

        const student = readStudents().find(s => s.id === id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.json({
            success: true,
            data: student
        });
    } catch (error) {
        next(error);
    }
});

// =========================
// UPDATE ONE STUDENT
// PUT /api/students/:id
// =========================

app.put("/api/students/:id", upload.single("passportPhoto"), (req, res, next) => {
    try {
        const students = readStudents();
        const id = Number(req.params.id);
        const index = students.findIndex(s => s.id === id);

        if (!Number.isInteger(id) || id < 1 || index === -1) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const oldStudent = students[index];
        const photo = req.file ? req.file.filename : oldStudent.passportPhoto;

        const updatedStudent = makeStudent(
            { ...oldStudent, ...req.body },
            id,
            photo
        );

        const errors = validateStudent(updatedStudent, students, id);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        students[index] = updatedStudent;
        saveStudents(students);

        return res.json({
            success: true,
            message: "Student updated successfully",
            data: updatedStudent
        });
    } catch (error) {
        next(error);
    }
});

// =========================
// BULK UPDATE
// PATCH /api/students/bulk
// =========================

app.patch("/api/students/bulk", (req, res, next) => {
    try {
        const updates = req.body.students;

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Provide a non-empty students array"
            });
        }

        const original = readStudents();
        const working = original.map(s => ({ ...s }));
        const errors = [];
        const seenIds = new Set();

        const editableFields = [
            "studentName",
            "enrollmentNo",
            "email",
            "mobile",
            "dateOfBirth",
            "age",
            "gender",
            "course",
            "specialization",
            "semester",
            "address",
            "city",
            "state",
            "skills",
            "hobbies"
        ];

        updates.forEach((item, index) => {
            if (
                !item ||
                typeof item !== "object" ||
                Array.isArray(item) ||
                item.id === undefined ||
                !Number.isInteger(Number(item.id)) ||
                Number(item.id) < 1
            ) {
                errors.push({
                    index,
                    message: "A valid student ID is required"
                });
                return;
            }

            const id = Number(item.id);

            if (seenIds.has(id)) {
                errors.push({
                    index,
                    id,
                    message: "Duplicate student ID in request"
                });
                return;
            }

            seenIds.add(id);

            const studentIndex = working.findIndex(s => s.id === id);

            if (studentIndex === -1) {
                errors.push({
                    index,
                    id,
                    message: "Student not found"
                });
                return;
            }

            const changes = {};

            editableFields.forEach(field => {
                if (Object.prototype.hasOwnProperty.call(item, field)) {
                    changes[field] = item[field];
                }
            });

            working[studentIndex] = {
                ...working[studentIndex],
                ...changes,
                id
            };
        });

        if (errors.length === 0) {
            updates.forEach((item, index) => {
                const id = Number(item.id);
                const student = working.find(s => s.id === id);

                if (!student) return;

                const validationErrors = validateStudent(student, working, id);

                if (Object.keys(validationErrors).length > 0) {
                    errors.push({
                        index,
                        id,
                        errors: validationErrors
                    });
                }
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Bulk update failed; no changes were saved",
                errors
            });
        }

        saveStudents(working);

        return res.json({
            success: true,
            updatedCount: updates.length,
            data: updates.map(item =>
                working.find(s => s.id === Number(item.id))
            )
        });
    } catch (error) {
        next(error);
    }
});

// =========================
// DELETE ONE STUDENT
// DELETE /api/students/:id
// =========================

app.delete("/api/students/:id", (req, res, next) => {
    try {
        const students = readStudents();
        const id = Number(req.params.id);
        const index = students.findIndex(s => s.id === id);

        if (!Number.isInteger(id) || id < 1 || index === -1) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        students.splice(index, 1);
        saveStudents(students);

        return res.json({
            success: true,
            message: "Student deleted successfully"
        });
    } catch (error) {
        next(error);
    }
});

// =========================
// BULK DELETE
// DELETE /api/students/bulk
// BODY: { "ids": [1, 2] }
// =========================

app.delete("/api/students/bulk", (req, res, next) => {
    try {
        const ids = req.body.ids;

        if (
            !Array.isArray(ids) ||
            ids.length === 0 ||
            !ids.every(id =>
                (typeof id === "number" ||
                    (typeof id === "string" && id.trim() !== "")) &&
                Number.isInteger(Number(id)) &&
                Number(id) > 0
            ) ||
            new Set(ids.map(Number)).size !== ids.length
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide a non-empty array of unique positive student IDs"
            });
        }

        const students = readStudents();
        const numericIds = ids.map(Number);

        const notFoundIds = numericIds.filter(
            id => !students.some(s => s.id === id)
        );

        if (notFoundIds.length > 0) {
            return res.status(404).json({
                success: false,
                message: "Some students were not found; none were deleted",
                notFoundIds
            });
        }

        const remaining = students.filter(
            s => !numericIds.includes(s.id)
        );

        const deletedCount = students.length - remaining.length;
        saveStudents(remaining);

        return res.json({
            success: true,
            deletedCount,
            message: `${deletedCount} student(s) deleted successfully`
        });
    } catch (error) {
        next(error);
    }
});

// =========================
// ERROR HANDLER
// =========================

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    return res.status(400).json({
        success: false,
        message: error.message || "Something went wrong"
    });
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
