let currentRecord = null;
let selectedId = localStorage.getItem("selectedRecord");

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
    
    fetch("/api/records")
    .then(response => {
        console.log("API Response status:", response.status);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        console.log("All records loaded:", data.length);
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
        alert("Error loading record data. Please check if server is running.");
    });
}

// =========================
// DISPLAY RECORD
// =========================

function displayRecord(record) {
    console.log("Displaying record:", record);
    
    // Basic info - Update text content
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
        let cleanDate = new Date(record.cleaning_date);
        let today = new Date();
        let diff = today - cleanDate;
        let days = Math.floor(diff / (1000*60*60*24));
        daysSpan.textContent = "📅 Days Since Cleaning : " + days;
    } else {
        daysSpan.textContent = "📅 Days Since Cleaning : Not Available";
    }
}

// =========================
// UPDATE RECORD - FIXED
// =========================

function updateRecord() {
    console.log("Update button clicked");
    
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
    
    fetch(`/api/records/${currentRecord.record_id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        console.log("Server response status:", response.status);
        if (!response.ok) {
            throw new Error("Server returned " + response.status);
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
            
        } else {
            throw new Error(result.message || "Update failed");
        }
    })
    .catch(error => {
        console.error("Error updating record:", error);
        messageSpan.textContent = "❌ Error: " + error.message;
        messageSpan.className = "error";
    })
    .finally(() => {
        // Re-enable button
        updateBtn.disabled = false;
        updateBtn.textContent = originalText;
    });
}

// =========================
// MAKE FUNCTIONS GLOBAL
// =========================
window.updateRecord = updateRecord;
window.loadRecord = loadRecord;

// =========================
// LOAD ON PAGE READY
// =========================
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded, loading record...");
    loadRecord();
});