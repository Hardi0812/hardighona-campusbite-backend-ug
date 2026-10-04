const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

const PORT = 5000;

const DATA_FILE = path.join(__dirname, "data", "students.json");
const FORM_FILE = path.join(__dirname, "config", "studentForm.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
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

        const allowedTypes = [
            "image/jpeg",
            "image/png"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG and PNG images are allowed"));
        }
    }
});


function readStudents() {
    const data = fs.readFileSync(DATA_FILE, "utf8");

    return JSON.parse(data);
}


function saveStudents(students) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(students, null, 2)
    );
}


function validateStudent(data, students, currentId = null) {

    const errors = {};

    if (
        !data.studentName ||
        data.studentName.trim().length < 2 ||
        data.studentName.trim().length > 50
    ) {
        errors.studentName =
            "Student Name is required and must be 2–50 characters";
    }


    if (!data.enrollmentNo) {

        errors.enrollmentNo =
            "Enrollment No is required";

    } else {

        const duplicate = students.find(
            student =>
                student.enrollmentNo === data.enrollmentNo &&
                student.id !== currentId
        );

        if (duplicate) {
            errors.enrollmentNo =
                "Enrollment No already exists";
        }
    }


    if (!data.email) {

        errors.email =
            "Email is required";

    } else {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(data.email)) {

            errors.email =
                "Please enter a valid email address";

        }

        const duplicateEmail = students.find(
            student =>
                student.email === data.email &&
                student.id !== currentId
        );

        if (duplicateEmail) {

            errors.email =
                "Email already exists";
        }
    }


    if (
        !data.mobile ||
        !/^[0-9]{10}$/.test(data.mobile)
    ) {

        errors.mobile =
            "Mobile must contain exactly 10 digits";
    }


    if (!data.dateOfBirth) {

        errors.dateOfBirth =
            "Date of Birth is required";
    }


    const age = Number(data.age);

    if (
        !data.age ||
        age < 18 ||
        age > 60
    ) {

        errors.age =
            "Age must be between 18 and 60";
    }


    const allowedGenders = [
        "Male",
        "Female",
        "Other"
    ];

    if (!data.gender) {

        errors.gender =
            "Gender is required";

    } else if (!allowedGenders.includes(data.gender)) {

        errors.gender =
            "Gender must be Male, Female or Other";
    }


    const allowedCourses = [
        "B.Sc. IT",
        "BCA",
        "B.Tech",
        "MCA",
        "M.Sc. IT"
    ];

    if (!data.course) {

        errors.course =
            "Course is required";

    } else if (!allowedCourses.includes(data.course)) {

        errors.course =
            "Invalid course selected";
    }


    if (!data.specialization) {

        errors.specialization =
            "Specialization is required";
    }


    const semester = Number(data.semester);

    if (
        !data.semester ||
        semester < 1 ||
        semester > 6
    ) {

        errors.semester =
            "Semester must be between 1 and 6";
    }


    if (!data.address) {

        errors.address =
            "Address is required";
    }


    if (!data.city) {

        errors.city =
            "City is required";
    }


    if (!data.state) {

        errors.state =
            "State is required";
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

    if (!data.skills) {

        errors.skills =
            "Select at least one skill";

    } else if (!allowedSkills.includes(data.skills)) {

        errors.skills =
            "Invalid skill selected";
    }


    const allowedHobbies = [
        "Reading",
        "Music",
        "Gaming",
        "Travel",
        "Sports",
        "Photography"
    ];

    if (!data.hobbies) {

        errors.hobbies =
            "Select at least one hobby";

    } else if (!allowedHobbies.includes(data.hobbies)) {

        errors.hobbies =
            "Invalid hobby selected";
    }


    return errors;
}


// HOME
app.get("/", (req, res) => {

    res.json({
        message: "Student Management System Backend"
    });

});


// FORM CONFIGURATION
app.get("/api/form-config", (req, res) => {

    const formConfig =
        JSON.parse(
            fs.readFileSync(FORM_FILE, "utf8")
        );

    res.json(formConfig);

});


// CREATE
app.post(
    "/api/students",
    upload.single("passportPhoto"),

    (req, res) => {

        try {

            const students =
                readStudents();

            const errors =
                validateStudent(
                    req.body,
                    students
                );


            if (!req.file) {

                errors.passportPhoto =
                    "Passport Photo is required";
            }


            if (Object.keys(errors).length > 0) {

                return res.status(400).json({

                    success: false,

                    errors: errors

                });
            }


            const student = {

                id:
                    students.length > 0
                        ? students[students.length - 1].id + 1
                        : 1,

                studentName:
                    req.body.studentName,

                enrollmentNo:
                    req.body.enrollmentNo,

                email:
                    req.body.email,

                mobile:
                    req.body.mobile,

                dateOfBirth:
                    req.body.dateOfBirth,

                age:
                    Number(req.body.age),

                gender:
                    req.body.gender,

                course:
                    req.body.course,

                specialization:
                    req.body.specialization,

                semester:
                    Number(req.body.semester),

                address:
                    req.body.address,

                city:
                    req.body.city,

                state:
                    req.body.state,

                skills:
                    req.body.skills,

                hobbies:
                    req.body.hobbies,

                passportPhoto:
                    req.file.filename
            };


            students.push(student);

            saveStudents(students);


            res.status(201).json({

                success: true,

                message:
                    "Student created successfully",

                data:
                    student
            });

        } catch (error) {

            res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// READ ALL
app.get(
    "/api/students",
    (req, res) => {

        const students =
            readStudents();

        res.json({

            success: true,

            count:
                students.length,

            data:
                students

        });

    }
);


// READ ONE
app.get(
    "/api/students/:id",
    (req, res) => {

        const students =
            readStudents();

        const id =
            Number(req.params.id);

        const student =
            students.find(
                student =>
                    student.id === id
            );


        if (!student) {

            return res.status(404).json({

                success: false,

                message:
                    "Student not found"

            });

        }


        res.json({

            success: true,

            data:
                student

        });

    }
);


// UPDATE
app.put(
    "/api/students/:id",
    upload.single("passportPhoto"),

    (req, res) => {

        try {

            const students =
                readStudents();

            const id =
                Number(req.params.id);

            const index =
                students.findIndex(
                    student =>
                        student.id === id
                );


            if (index === -1) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student not found"

                });

            }


            const errors =
                validateStudent(
                    req.body,
                    students,
                    id
                );


            if (Object.keys(errors).length > 0) {

                return res.status(400).json({

                    success: false,

                    errors:
                        errors

                });

            }


            const oldStudent =
                students[index];


            students[index] = {

                ...oldStudent,

                ...req.body,

                id: id,

                age:
                    Number(req.body.age),

                semester:
                    Number(req.body.semester),

                passportPhoto:
                    req.file
                        ? req.file.filename
                        : oldStudent.passportPhoto

            };


            saveStudents(students);


            res.json({

                success: true,

                message:
                    "Student updated successfully",

                data:
                    students[index]

            });

        } catch (error) {

            res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// DELETE
app.delete(
    "/api/students/:id",
    (req, res) => {

        const students =
            readStudents();

        const id =
            Number(req.params.id);

        const index =
            students.findIndex(
                student =>
                    student.id === id
            );


        if (index === -1) {

            return res.status(404).json({

                success: false,

                message:
                    "Student not found"

            });

        }


        students.splice(index, 1);

        saveStudents(students);


        res.json({

            success: true,

            message:
                "Student deleted successfully"

        });

    }
);


// ERROR HANDLER
app.use(
    (error, req, res, next) => {

        res.status(400).json({

            success: false,

            message:
                error.message

        });

    }
);


// START SERVER
app.listen(
    PORT,

    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);