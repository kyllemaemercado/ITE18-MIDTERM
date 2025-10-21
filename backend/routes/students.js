const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const dataFilePath = path.join(__dirname, '..', 'data', 'students.json');

function readStudents() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading student data:", error);
        return [];
    }
}

function writeStudents(students) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(students, null, 4));
    } catch (error) {
        console.error("Error writing student data:", error);
    }
}


// GET /api/students - Get all students
router.get('/', (req, res) => {
    const students = readStudents();
    res.json(students);
});

// POST /api/students - Add a new student
router.post('/', (req, res) => {
    const newStudent = req.body;
    let students = readStudents();

    // Server-Side Validation
    const requiredFields = ['id', 'fullName', 'program', 'yearLevel', 'university'];
    const missingField = requiredFields.find(field => !newStudent[field]);
    if (missingField) {
        return res.status(400).json({ message: `Validation Failed: Missing required field: ${missingField}.` });
    }

    // Check for duplicate Student ID
    const idExists = students.some(s => s.id === newStudent.id);
    if (idExists) {
        return res.status(409).json({ message: `Conflict: Student ID ${newStudent.id} already exists in the registry.` });
    }

    // Success: Add the new student
    students.push(newStudent);
    writeStudents(students);
    res.status(201).json({ message: "Student successfully inducted into the Registry.", student: newStudent });
});

// DELETE /api/students/:id - Delete a student
router.delete('/:id', (req, res) => {
    const studentId = req.params.id;
    let students = readStudents();
    const initialLength = students.length;

    students = students.filter(s => s.id !== studentId);

    if (students.length < initialLength) {
        writeStudents(students);
        res.json({ message: `Student ID ${studentId} successfully deregistered.` });
    } else {
        res.status(404).json({ message: `Error: Student ID ${studentId} not found in the Registry.` });
    }
});

module.exports = router;