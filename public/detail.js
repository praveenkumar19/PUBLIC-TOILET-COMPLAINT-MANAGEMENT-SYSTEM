let currentRecord = null;
let selectedId = localStorage.getItem("selectedRecord");

// =========================
// GET AUTH TOKEN
// =========================

function getAuthToken() {
    // Try to get token from localStorage
    let token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    // If no token, try to get from sessionStorage
    if (!token) {
        token = sessionStorage.getItem('authToken') || sessionStorage.getItem('token');
    }
    
    return token;
}

// =========================
// CREATE AUTH HEADERS
// =========================

function getAuthHeaders() {
    const token = getAuthToken();
    const headers = {
        "Content-Type": "application/json"
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        // Some APIs use different header formats
        headers["x-auth-token"] = token;
        headers["X-API-Key"] = token;
    }
    
    return headers;
}

// =========================
// LOAD RECORD DATA
// =========================

function loadRecord() {
    console.log("Loading record with ID:", selectedId);
    
    if (!selectedId) {
        alert("No record selected");
        window.location.href = "index.html";
        return;
    }
    
    const headers = getAuthHeaders();
    console.log("Auth headers:", headers);
    
    fetch("/api/records", {
        method: "GET",
        headers: headers
    })
    .then(response => {
        console.log("API Response status:", response.status);
        
        if (response.status === 401) {
            // Unauthorized - redirect to login
            alert("Session expired. Please login again.");
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            window.location.href = "login.html";
            throw new Error("Unauthorized");
        }
        
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("All records loaded:", data.length);
        // Fix: Use == for comparison since record_id might be string or number
        currentRecord = data.find(r => r.record_id == selectedId);
        
        if(!currentRecord){
            alert("Record Not Found");
            window.location.href = "index.html";
            return;
        }

        console.log("Current record found:", currentRecord);
        displayRecord(currentRecord);
    })
    .catch(error => {
        console.error("Error loading record:", error);
        if (error.message !== "Unauthorized") {
            alert("Error loading record data. Please check if server is running.");
        }
    });
}

// =========================
// DISPLAY RECORD
// =========================

function displayRecord(record) {
    console.log("Displaying record:", record);
    
    // Basic info - Update text content with null checks
    document.getElementById("recordId").textContent = record.record_id || '-';
    document.getElementById("blockId").textContent = record.block_id || '-';
    document.getElementById("location").textContent = record.location || '-';
    document.getElementById("cleaner").textContent = record.cleaner || 'Not Assigned';
    document.getElementById("cleaningDate").textContent = record.cleaning_date || 'Not Set';
    document.getElementById("complaint").textContent = record.complaint_text || 'No Complaint';
    document.getElementById("complaintDate").textContent = record.complaint_date || '-';
    
    // Status with badge class
    const statusDisplay = document.getElementById("statusDisplay");
    const status = record.status || 'Pending';
    statusDisplay.textContent = status;
    // Remove all classes and add the correct one
    statusDisplay.className = 'detail-value';
    if (status === 'Pending') {
        statusDisplay.classList.add('pending');
    } else if (status === 'In Progress') {
        statusDisplay.classList.add('in-progress');
    } else if (status === 'Resolved') {
        statusDisplay.classList.add('resolved');
    }
    
    // Show citizen info if citizen complaint
    const citizenInfo = document.getElementById("citizenInfo");
    if(record.is_citizen_complaint) {
        citizenInfo.style.display = "block";
        document.getElementById("citizenName").textContent = record.citizen_name || 'N/A';
        document.getElementById("citizenMobile").textContent = record.citizen_mobile || 'N/A';
    } else {
        citizenInfo.style.display = "none";
    }
    
    // ============================================
    // UPDATE FORM FIELDS WITH CURRENT VALUES
    // ============================================
    const statusSelect = document.getElementById("statusSelect");
    const cleanerSelect = document.getElementById("cleanerSelect");
    const cleaningDateInput = document.getElementById("cleaningDateInput");
    
    if (statusSelect) statusSelect.value = record.status || 'Pending';
    if (cleanerSelect) cleanerSelect.value = record.cleaner || '';
    if (cleaningDateInput) cleaningDateInput.value = record.cleaning_date || '';
    
    // Calculate days since cleaning
    const daysSpan = document.getElementById("daysSince");
    if(record.cleaning_date && record.cleaning_date !== '') {
        try {
            let cleanDate = new Date(record.cleaning_date);
            let today = new Date();
            let diff = today - cleanDate;
            let days = Math.floor(diff / (1000*60*60*24));
            daysSpan.textContent = "📅 Days Since Cleaning : " + days;
        } catch(e) {
            daysSpan.textContent = "📅 Days Since Cleaning : Invalid Date";
        }
    } else {
        daysSpan.textContent = "📅 Days Since Cleaning : Not Available";
    }
}

// =========================
// UPDATE RECORD - WITH AUTH
// =========================

function updateRecord() {
    console.log("Update button clicked");
    console.log("Current record:", currentRecord);
    
    // Get form values
    const cleaner = document.getElementById("cleanerSelect").value;
    const cleaningDate = document.getElementById("cleaningDateInput").value;
    const status = document.getElementById("statusSelect").value;
    const messageSpan = document.getElementById("updateMessage");
    
    console.log("Form values:", { cleaner, cleaningDate, status });
    
    // Clear previous message
    messageSpan.textContent = "";
    messageSpan.className = "";
    
    // Validate - if status is not Pending, cleaner and date are required
    if (status !== "Pending") {
        if (!cleaner || cleaner === "") {
            messageSpan.textContent = "❌ Please select a cleaner";
            messageSpan.className = "error";
            return;
        }
        if (!cleaningDate || cleaningDate === "") {
            messageSpan.textContent = "❌ Please select a cleaning date";
            messageSpan.className = "error";
            return;
        }
    }
    
    // Check if currentRecord exists
    if (!currentRecord) {
        messageSpan.textContent = "❌ No record loaded";
        messageSpan.className = "error";
        return;
    }
    
    // Check if record_id exists
    if (!currentRecord.record_id) {
        messageSpan.textContent = "❌ Record ID not found";
        messageSpan.className = "error";
        console.error("currentRecord missing record_id:", currentRecord);
        return;
    }
    
    // Disable button and show loading
    const updateBtn = document.querySelector('.btn-update');
    if (!updateBtn) {
        console.error("Update button not found");
        return;
    }
    
    const originalText = updateBtn.textContent;
    updateBtn.disabled = true;
    updateBtn.textContent = "⏳ Updating...";
    messageSpan.textContent = "⏳ Updating record...";
    messageSpan.className = "";
    
    const updateData = {
        cleaner: cleaner,
        cleaning_date: cleaningDate,
        status: status
    };
    
    console.log("Sending update data to server:", updateData);
    console.log("Record ID:", currentRecord.record_id);
    console.log("Full URL:", `/api/records/${currentRecord.record_id}`);
    
    const headers = getAuthHeaders();
    console.log("Auth headers being sent:", headers);
    
    fetch(`/api/records/${currentRecord.record_id}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(updateData)
    })
    .then(response => {
        console.log("Server response status:", response.status);
        console.log("Response headers:", response.headers);
        
        if (response.status === 401) {
            // Unauthorized - redirect to login
            alert("Session expired. Please login again.");
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            window.location.href = "login.html";
            throw new Error("Unauthorized");
        }
        
        if (!response.ok) {
            // Try to get error message from response
            return response.json().then(errorData => {
                console.error("Server error response:", errorData);
                throw new Error(errorData.message || `Server returned ${response.status}`);
            }).catch(() => {
                // If response is not JSON, throw generic error
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            });
        }
        return response.json();
    })
    .then(result => {
        console.log("Server response data:", result);
        
        if(result.success) {
            // Update the current record with server response
            currentRecord = result.record;
            
            // ============================================
            // REFRESH THE DISPLAY WITH UPDATED VALUES
            // ============================================
            displayRecord(currentRecord);
            
            // Show success message
            messageSpan.textContent = "✅ Record updated successfully!";
            messageSpan.className = "success";
            
            // Force form fields to show updated values (double check)
            document.getElementById("cleanerSelect").value = currentRecord.cleaner || '';
            document.getElementById("cleaningDateInput").value = currentRecord.cleaning_date || '';
            document.getElementById("statusSelect").value = currentRecord.status || 'Pending';
            
            // Update localStorage with new data
            localStorage.setItem("selectedRecord", currentRecord.record_id);
            
        } else {
            throw new Error(result.message || "Update failed");
        }
    })
    .catch(error => {
        console.error("Error updating record:", error);
        if (error.message === "Unauthorized") {
            messageSpan.textContent = "❌ Session expired. Please login again.";
        } else {
            messageSpan.textContent = "❌ Error: " + error.message;
        }
        messageSpan.className = "error";
    })
    .finally(() => {
        // Re-enable button
        if (updateBtn) {
            updateBtn.disabled = false;
            updateBtn.textContent = originalText;
        }
    });
}

// =========================
// LOGIN FUNCTION (if needed)
// =========================

function loginUser(username, password) {
    fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('token', data.token);
            alert("Login successful!");
            window.location.reload();
        } else {
            alert("Login failed: " + data.message);
        }
    })
    .catch(error => {
        console.error("Login error:", error);
        alert("Login error: " + error.message);
    });
}

// =========================
// TEST API CONNECTION WITH AUTH
// =========================

function testApiConnection() {
    console.log("Testing API connection with auth...");
    const headers = getAuthHeaders();
    
    fetch("/api/records", {
        method: "GET",
        headers: headers
    })
    .then(response => {
        console.log("API test response status:", response.status);
        if (response.status === 401) {
            alert("Unauthorized! Please login first.");
            return;
        }
        return response.json();
    })
    .then(data => {
        if (data) {
            console.log("API test data:", data);
            alert(`API working! Found ${data.length} records.`);
        }
    })
    .catch(error => {
        console.error("API test failed:", error);
        alert("API connection failed. Please check if server is running.");
    });
}

// =========================
// MAKE FUNCTIONS GLOBAL
// =========================
window.updateRecord = updateRecord;
window.loadRecord = loadRecord;
window.testApiConnection = testApiConnection;
window.loginUser = loginUser;

// =========================
// LOAD ON PAGE READY
// =========================
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded, loading record...");
    console.log("selectedId from localStorage:", selectedId);
    console.log("Auth token present:", !!getAuthToken());
    loadRecord();
});
