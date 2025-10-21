const API_BASE_URL = 'http://localhost:3000/api/students';

// --- Global Data and UI elements ---
let studentsData = []; 
const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchQuery');
const refreshBtn = document.getElementById('refreshBtn');
const studentForm = document.getElementById('studentForm');
const loadingSpinner = document.getElementById('loading-spinner');
const submitText = document.getElementById('submit-text');

// Stats elements
const statTotalStudents = document.getElementById('statTotalStudents');
const statMaleStudents = document.getElementById('statMaleStudents');
const statFemaleStudents = document.getElementById('statFemaleStudents');
const statPrograms = document.getElementById('statPrograms');
const studentCountDisplay = document.getElementById('studentCountDisplay');

// Filter dropdowns
const programFilter = document.getElementById('programFilter');
const yearLevelFilter = document.getElementById('yearLevelFilter');
const universityFilter = document.getElementById('universityFilter');
const resetFilterBtn = document.getElementById('resetFilterBtn');

/*
 *  Shows a temporary notification message on the screen.
 */
function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    const box = document.createElement('div');
    
    // Determine color based on message type
    let bgColor, icon;
    if (type === 'success') {
        bgColor = 'bg-green-500';
        icon = 'fas fa-check-circle';
    } else if (type === 'error') {
        bgColor = 'bg-red-500';
        icon = 'fas fa-times-circle';
    } else { 
        bgColor = 'bg-blue-500';
        icon = 'fas fa-info-circle';
    }

    box.className = `message-box text-white ${bgColor}`;
    box.innerHTML = `<i class="${icon} mr-2"></i> ${message}`;
    container.appendChild(box);

    setTimeout(() => {
        box.style.opacity = '0';
        setTimeout(() => box.remove(), 300);
    }, 4000);
}
/*
 * Client-side validation function to ensure required fields are present.
 */
function clientValidateForm(form) {
    let isValid = true;
    
    document.querySelectorAll('.text-red-500').forEach(el => el.classList.add('hidden'));
    const requiredFields = ['id', 'fullName', 'email', 'program', 'yearLevel', 'university'];
    
    requiredFields.forEach(name => {
        const input = form.elements[name];
        if (input && !input.value) {
            const errorElement = document.getElementById(`${name}-error`);
            if (errorElement) {
                errorElement.textContent = `${input.placeholder || name} is required.`;
                errorElement.classList.remove('hidden');
                isValid = false;
            }
        }
    });

    // Check Gender radio buttons
    const genderChecked = form.querySelector('input[name="gender"]:checked');
    if (!genderChecked) {
        isValid = false; 
    }

    return isValid;
}

/**
 * Helper to toggle form loading state
 */
function setFormLoading(isLoading) {
    if (isLoading) {
        loadingSpinner.classList.remove('hidden');
        submitText.textContent = 'Adding...';
        studentForm.querySelector('button[type="submit"]').disabled = true;
    } else {
        loadingSpinner.classList.add('hidden');
        submitText.textContent = 'Add Student';
        studentForm.querySelector('button[type="submit"]').disabled = false;
    }
}

/*
 * Fetches all students and updates the table and statistics.
 */
async function fetchStudents() {
    try {
        const response = await fetch(API_BASE_URL); 
        
        if (!response.ok) {
            throw new Error(`API Error! status: ${response.status}`);
        }
        
        const students = await response.json();
        
        studentsData = students; 
        
        renderStudents(students); 
        calculateAndRenderStats(students);
        populateFilterDropdowns(students);
        
    } catch (error) {
        console.error("Failed to fetch student registry:", error);
        showMessage('Connection Error: Could not reach the backend server.', 'error');
    }
}

/**
 * Render students into the table body.
 */
function renderStudents(students) {
    let filtered = applyFiltersAndSearch(students);

    studentTableBody.innerHTML = '';

    if (!filtered || filtered.length === 0) {
        document.getElementById('noResults').classList.remove('hidden');
    } else {
        document.getElementById('noResults').classList.add('hidden');
    }

    filtered.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-700">${s.id}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${s.fullName}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${s.gender || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${s.email || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${s.program}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${s.yearLevel}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${s.university}</td>
            <td class="px-4 py-3 text-sm text-gray-700">
                <button data-id="${s.id}" class="delete-btn text-sm text-white btn-danger px-3 py-1 rounded">Delete</button>
            </td>
        `;
        studentTableBody.appendChild(tr);
    });

    studentCountDisplay.textContent = `${filtered.length} of ${students.length} students`;
}

/**
 * Apply search and dropdown filters to the students list
 */
function applyFiltersAndSearch(list) {
    const q = (searchInput.value || '').trim().toLowerCase();
    const genderF = document.getElementById('genderFilter').value;
    const programF = programFilter.value;
    const yearF = yearLevelFilter.value;
    const uniF = universityFilter.value;

    return list.filter(s => {
        if (genderF && s.gender !== genderF) return false;
        if (programF && s.program !== programF) return false;
        if (yearF && s.yearLevel !== yearF) return false;
        if (uniF && s.university !== uniF) return false;

        if (!q) return true;
        return (
            (s.fullName || '').toLowerCase().includes(q) ||
            (s.id || '').toLowerCase().includes(q) ||
            (s.program || '').toLowerCase().includes(q) ||
            (s.university || '').toLowerCase().includes(q)
        );
    });
}

/**
 * Calculate and render simple stats
 */
function calculateAndRenderStats(students) {
    statTotalStudents.textContent = students.length;
    statMaleStudents.textContent = students.filter(s => (s.gender || '').toLowerCase() === 'male').length;
    statFemaleStudents.textContent = students.filter(s => (s.gender || '').toLowerCase() === 'female').length;
    const programs = new Set(students.map(s => s.program).filter(Boolean));
    statPrograms.textContent = programs.size;
}

/**
 * Populate filter dropdowns with unique values
 */
function populateFilterDropdowns(students) {
    const programs = Array.from(new Set(students.map(s => s.program).filter(Boolean))).sort();
    const years = Array.from(new Set(students.map(s => s.yearLevel).filter(Boolean))).sort();
    const unis = Array.from(new Set(students.map(s => s.university).filter(Boolean))).sort();

    function fill(selectEl, values, placeholder) {
        const current = selectEl.value;
        selectEl.innerHTML = `<option value="">${placeholder}</option>` + values.map(v => `<option value="${v}">${v}</option>`).join('');
        if (values.includes(current)) selectEl.value = current;
    }

    fill(programFilter, programs, 'All Programs');
    fill(yearLevelFilter, years, 'All Year Levels');
    fill(universityFilter, unis, 'All Universities');
}

/**
 * Form submit handler: POST to backend to add student
 */
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    if (!clientValidateForm(form)) {
        showMessage('Please fill in the required fields correctly.', 'error');
        return;
    }

    const gender = form.querySelector('input[name="gender"]:checked')?.value || '';

    const payload = {
        id: form.elements['id'].value.trim(),
        fullName: form.elements['fullName'].value.trim(),
        email: form.elements['email'].value.trim(),
        gender,
        program: form.elements['program'].value.trim(),
        yearLevel: form.elements['yearLevel'].value,
        university: form.elements['university'].value.trim()
    };

    setFormLoading(true);

    try {
        const res = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.status === 201) {
            showMessage('Student added successfully.', 'success');
            form.reset();
            await fetchStudents();
        } else {
            // Try to parse error message from server
            let errText = `Failed to add student (status ${res.status}).`;
            try { const data = await res.json(); if (data && data.message) errText = data.message; } catch(_) {}
            showMessage(errText, 'error');
            if (res.status === 409) {
                const idError = document.getElementById('id-error');
                if (idError) { idError.textContent = 'Student ID must be unique.'; idError.classList.remove('hidden'); }
            }
        }
    } catch (err) {
        console.error('Add student failed:', err);
        showMessage('Network error: could not reach server.', 'error');
    } finally {
        setFormLoading(false);
    }
});

// Delete handler
studentTableBody.addEventListener('click', async (e) => {
    if (e.target.matches('.delete-btn')) {
        const id = e.target.getAttribute('data-id');
        if (!id) return;
        if (!confirm(`Delete student ${id}? This action cannot be undone.`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (res.ok) {
                showMessage(`Student ${id} deleted.`, 'success');
                await fetchStudents();
            } else {
                let msg = `Failed to delete student (status ${res.status}).`;
                try { const d = await res.json(); if (d && d.message) msg = d.message; } catch(_) {}
                showMessage(msg, 'error');
            }
        } catch (err) {
            console.error('Delete error:', err);
            showMessage('Network error deleting student.', 'error');
        }
    }
});

// Search and filters
searchInput.addEventListener('input', () => renderStudents(studentsData));
programFilter.addEventListener('change', () => renderStudents(studentsData));
yearLevelFilter.addEventListener('change', () => renderStudents(studentsData));
universityFilter.addEventListener('change', () => renderStudents(studentsData));
document.getElementById('genderFilter').addEventListener('change', () => renderStudents(studentsData));
resetFilterBtn.addEventListener('click', () => {
    searchInput.value = '';
    document.getElementById('genderFilter').value = '';
    programFilter.value = '';
    yearLevelFilter.value = '';
    universityFilter.value = '';
    renderStudents(studentsData);
});

refreshBtn.addEventListener('click', () => fetchStudents());

window.onload = fetchStudents;