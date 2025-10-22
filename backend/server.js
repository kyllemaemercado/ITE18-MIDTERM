const express = require('express');
const cors = require('cors');
const customCors = require('./middleware/cors');
const studentRoutes = require('./routes/students');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
// Use the npm cors package with default settings and also apply the custom middleware
app.use(cors());
app.use(customCors);

// Serve frontend static files (project root) so index.html and script.js are available
const publicPath = path.join(__dirname, '..');
app.use(express.static(publicPath));

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
// Serve the frontend index.html at root so the app can be opened via http://localhost:3000/
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Access the backend at http://localhost:${PORT}`);
});