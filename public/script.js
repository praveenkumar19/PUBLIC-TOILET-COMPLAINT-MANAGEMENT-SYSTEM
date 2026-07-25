// =========================
// LOGIN PROTECTION
// =========================

if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}

// =========================
// WELCOME USER
// =========================

const username = localStorage.getItem("username") || "Supervisor";

document.getElementById("welcomeUser").innerHTML =
    "👋 Welcome, <b>" + username + "</b>";


// =========================
// LOGOUT WITH CUSTOM MODAL
// =========================

// Create and show logout modal
function showLogoutModal() {
    // Check if modal already exists
    let modal = document.getElementById("logoutModal");
    
    if (!modal) {
        // Create modal element
        modal = document.createElement("div");
        modal.id = "logoutModal";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-box">
                <div class="modal-icon">🚪</div>
                <div class="modal-title">Confirm Logout</div>
                <div class="modal-message">
                    Are you sure you want to logout?<br>
                    <small style="color: #999;">You will need to login again to access the dashboard.</small>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn modal-btn-cancel" onclick="closeLogoutModal()">
                        Cancel
                    </button>
                    <button class="modal-btn modal-btn-logout" onclick="confirmLogout()">
                        Logout
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Show modal
    modal.style.display = "flex";
}

// Close modal function
function closeLogoutModal() {
    const modal = document.getElementById("logoutModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Confirm logout function
function confirmLogout() {
    // Close modal first
    closeLogoutModal();
    
    // Show brief success message on button
    const btn = document.getElementById("logoutBtn");
    const originalText = btn.innerHTML;
    btn.innerHTML = "✅ Logging out...";
    btn.style.background = "#28a745";
    btn.disabled = true;
    
    setTimeout(() => {
        // Clear local storage
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        
        // Redirect to login
        window.location.href = "login.html";
    }, 800);
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
    const modal = document.getElementById("logoutModal");
    if (modal && e.target === modal) {
        closeLogoutModal();
    }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeLogoutModal();
    }
});

// Attach logout event listener
document.getElementById("logoutBtn").addEventListener("click", showLogoutModal);


// =========================
// LOAD DATA
// =========================

let records = [];

function loadRecords() {
    console.log("Loading records from API...");
    
    fetch("/api/records")
    .then(response => {
        console.log("API Response status:", response.status);
        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log("Records loaded:", data.length);
        records = data;
        displayRecords(records);
    })
    .catch(error => {
        console.error("Error loading from API:", error);
        // Fallback to local data.json
        console.log("Trying fallback to data.json...");
        fetch("data.json")
        .then(response => response.json())
        .then(data => {
            console.log("Fallback data loaded:", data.length);
            records = data;
            displayRecords(records);
        })
        .catch(err => {
            console.error("Error loading fallback data:", err);
            alert("Error loading data. Please make sure the server is running (node server.js)");
        });
    });
}

// Load data when page loads
loadRecords();


// =========================
// DISPLAY TABLE
// =========================

function displayRecords(data){

    const tableBody = document.getElementById("tableBody");

    if (!tableBody) {
        console.error("Table body not found");
        return;
    }

    tableBody.innerHTML = "";

    let pending = 0;
    let resolved = 0;
    let progress = 0;

    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
                    📭 No records found
                </td>
            </tr>
        `;
        document.getElementById("totalRecords").innerHTML = 0;
        document.getElementById("pendingCount").innerHTML = 0;
        document.getElementById("resolvedCount").innerHTML = 0;
        document.getElementById("progressCount").innerHTML = 0;
        document.getElementById("recordCount").innerHTML = "Showing 0 Records";
        return;
    }

    data.forEach(record=>{

        if(record.status==="Pending") pending++;
        else if(record.status==="Resolved") resolved++;
        else if(record.status==="In Progress") progress++;

        // Status badge class
        let statusClass = "status-badge";
        if(record.status === "Pending") statusClass += " pending";
        else if(record.status === "In Progress") statusClass += " in-progress";
        else if(record.status === "Resolved") statusClass += " resolved";

        // REMOVED: Citizen badge - now just shows cleaner name only
        const cleanerDisplay = record.cleaner || 'Not Assigned';

        tableBody.innerHTML += `
        <tr>
            <td><strong>${record.record_id || '-'}</strong></td>
            <td><code style="background:#f1f5f9;padding:2px 8px;border-radius:4px;font-size:13px;">${record.block_id || '-'}</code></td>
            <td>${record.location || '-'}</td>
            <td>${cleanerDisplay}</td>
            <td>${record.cleaning_date || '-'}</td>
            <td><span class="${statusClass}">${record.status || '-'}</span></td>
            <td>
                <button onclick="viewDetails(${record.record_id})" class="btn-view">
                    View
                </button>
            </td>
        </tr>
        `;

    });

    document.getElementById("totalRecords").innerHTML = data.length;
    document.getElementById("pendingCount").innerHTML = pending;
    document.getElementById("resolvedCount").innerHTML = resolved;
    document.getElementById("progressCount").innerHTML = progress;
    document.getElementById("recordCount").innerHTML = "Showing " + data.length + " Records";
}


// =========================
// SEARCH
// =========================

document.getElementById("search").addEventListener("input", filterData);
document.getElementById("statusFilter").addEventListener("change", filterData);

function filterData(){

    const search = document.getElementById("search").value.toLowerCase();
    const status = document.getElementById("statusFilter").value;

    const filtered = records.filter(record=>{

        const matchSearch =
            (record.block_id && record.block_id.toLowerCase().includes(search)) ||
            (record.location && record.location.toLowerCase().includes(search)) ||
            (record.cleaner && record.cleaner.toLowerCase().includes(search)) ||
            (record.citizen_name && record.citizen_name.toLowerCase().includes(search));

        const matchStatus =
            status==="All" ||
            record.status===status;

        return matchSearch && matchStatus;

    });

    displayRecords(filtered);

}


// =========================
// VIEW DETAILS
// =========================

function viewDetails(id){
    localStorage.setItem("selectedRecord", id);
    window.location.href = "detail.html";
}


// =========================
// REFRESH DATA
// =========================

function refreshData() {
    console.log("Refresh button clicked");
    
    const refreshBtn = document.querySelector('.controls button:last-child');
    if (!refreshBtn) {
        console.error("Refresh button not found");
        return;
    }
    
    const originalText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = "⏳ Loading...";
    refreshBtn.disabled = true;
    
    fetch("/api/records")
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log("Refresh: Records loaded:", data.length);
        records = data;
        displayRecords(records);
        // Re-apply current filters
        const searchValue = document.getElementById("search").value;
        const statusValue = document.getElementById("statusFilter").value;
        if (searchValue || statusValue !== "All") {
            filterData();
        }
        // Show success message briefly
        refreshBtn.innerHTML = "✅ Updated!";
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }, 1500);
    })
    .catch(error => {
        console.error("Error refreshing data:", error);
        refreshBtn.innerHTML = "❌ Error";
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }, 2000);
        alert("Error refreshing data. Please check if server is running.");
    });
}


// =========================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// =========================
window.viewDetails = viewDetails;
window.refreshData = refreshData;
window.showLogoutModal = showLogoutModal;
window.closeLogoutModal = closeLogoutModal;
window.confirmLogout = confirmLogout;