const express = require('express');
const cors = require('./middleware/cors'); 
const studentRoutes = require('./routes/students');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json()); 
app.use(cors);

// --- Initialize Data File (if it doesn't exist) ---
const dataFilePath = path.join(__dirname, 'data', 'students.json');
if (!fs.existsSync(dataFilePath)) {
    const initialData = [
        { "id": "PH-101-001", "fullName": "Liam O'Connell", "gender": "Male", "email": "liam.o@university.edu", "program": "BS Physics", "yearLevel": "4th Year", "university": "Apex University" },
    ];
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 4));
    console.log(`Created initial data file at: ${dataFilePath}`);
}

// Routes
app.use('/api/students', studentRoutes);

// Simple root route for testing
app.get('/', (req, res) => {
    res.send('Student Management Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Access the backend at http://localhost:${PORT}`);
});