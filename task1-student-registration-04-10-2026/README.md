# Student Management System Backend

## Task
Student Registration Backend

## Technologies
- JavaScript
- Node.js
- Express.js
- JSON
- Multer

## Features
- Create student
- Read all students
- Read student by ID
- Update student
- Delete student
- Student validation
- Enrollment number uniqueness
- Email uniqueness
- Passport photo upload
- JSON data storage
- Error handling

## Validation
- Student Name: Required, 2–50 characters
- Enrollment No: Required, unique
- Email: Required, valid and unique
- Mobile: Required, exactly 10 digits
- Age: 18–60
- Gender: Male, Female or Other
- Semester: 1–6
- Skills: At least one
- Hobbies: At least one
- Passport Photo: JPG/PNG, maximum 2 MB

## Run Project

```bash
npm install
node server.js