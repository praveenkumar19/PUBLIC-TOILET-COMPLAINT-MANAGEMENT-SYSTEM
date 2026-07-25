console.log("login.js loaded");

// =========================
// PORTAL TOGGLE
// =========================

function togglePortal(type) {
    const adminToggle = document.getElementById("adminToggle");
    const citizenToggle = document.getElementById("citizenToggle");
    const trackToggle = document.getElementById("trackToggle");
    const adminPortal = document.getElementById("adminPortal");
    const citizenPortal = document.getElementById("citizenPortal");
    const trackPortal = document.getElementById("trackPortal");
    const message = document.getElementById("message");
    const trackResult = document.getElementById("trackResult");

    // Clear messages
    message.innerHTML = "";
    message.className = "";
    trackResult.style.display = "none";
    trackResult.innerHTML = "";

    // Remove active from all
    adminToggle.classList.remove("active");
    citizenToggle.classList.remove("active");
    trackToggle.classList.remove("active");
    adminPortal.classList.remove("active");
    citizenPortal.classList.remove("active");
    trackPortal.classList.remove("active");

    if (type === "admin") {
        adminToggle.classList.add("active");
        adminPortal.classList.add("active");
    } else if (type === "citizen") {
        citizenToggle.classList.add("active");
        citizenPortal.classList.add("active");
    } else if (type === "track") {
        trackToggle.classList.add("active");
        trackPortal.classList.add("active");
    }
}

// =========================
// ADMIN LOGIN - UPDATED FOR VERCEL
// =========================

document.getElementById("adminForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Admin Login clicked");

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    message.innerHTML = "";
    message.className = "";

    if (!username || !password) {
        message.innerHTML = "⚠️ Please enter both username and password";
        message.className = "error";
        return;
    }

    try {
        console.log("Sending login request to:", "/login");
        
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        console.log("Response status:", response.status);
        
        const result = await response.json();
        console.log("Login result:", result);

        if (result.success) {
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("username", username);
            localStorage.setItem("userRole", "admin");
            message.innerHTML = "✅ Login Successful! Redirecting...";
            message.className = "success";
            
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        } else {
            message.innerHTML = "❌ " + result.message;
            message.className = "error";
        }

    } catch (err) {
        console.error("Login error:", err);
        message.innerHTML = "❌ Server Connection Failed. Please make sure the server is running.";
        message.className = "error";
    }
});

// =========================
// CITIZEN COMPLAINT SUBMISSION - UPDATED
// =========================

document.getElementById("citizenForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Citizen Complaint submitted");

    const name = document.getElementById("citizenName").value.trim();
    const mobile = document.getElementById("citizenMobile").value.trim();
    const location = document.querySelector('input[name="location"]:checked');
    const complaint = document.getElementById("complaintDetails").value.trim();
    const message = document.getElementById("message");

    message.innerHTML = "";
    message.className = "";

    // Validation
    if (!name) {
        message.innerHTML = "⚠️ Please enter your full name";
        message.className = "error";
        return;
    }

    if (!mobile) {
        message.innerHTML = "⚠️ Please enter your mobile number";
        message.className = "error";
        return;
    }

    if (mobile.length < 10) {
        message.innerHTML = "⚠️ Please enter a valid 10-digit mobile number";
        message.className = "error";
        return;
    }

    if (!location) {
        message.innerHTML = "⚠️ Please select a toilet location";
        message.className = "error";
        return;
    }

    if (!complaint || complaint.length < 10) {
        message.innerHTML = "⚠️ Please provide more details (minimum 10 characters)";
        message.className = "error";
        return;
    }

    // Show loading
    const submitBtn = document.querySelector('#citizenForm .btn-login');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = "⏳ Submitting...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("/api/complaint", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                mobile: mobile,
                location: location.value,
                complaint: complaint
            })
        });

        const result = await response.json();

        if (result.success) {
            const complaintId = result.complaint_id;
            
            message.innerHTML = `
                <div style="text-align: left; padding: 10px;">
                    <div style="background: #dcfce7; padding: 15px; border-radius: 10px; border-left: 4px solid #16a34a;">
                        <h3 style="color: #16a34a; margin-bottom: 10px;">✅ Complaint Submitted Successfully!</h3>
                        <div style="margin: 10px 0;">
                            <strong>📋 Your Complaint ID:</strong>
                            <span style="background: #f1f5f9; padding: 4px 12px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; margin-top: 5px;">
                                ${complaintId}
                            </span>
                        </div>
                        <div style="margin: 10px 0;">
                            <strong>📌 Status:</strong>
                            <span style="background: #fef3c7; padding: 4px 12px; border-radius: 20px; font-weight: 600; color: #d97706; display: inline-block; margin-top: 5px;">
                                ⏳ Pending
                            </span>
                        </div>
                        <div style="margin: 10px 0; font-size: 14px; color: #64748b;">
                            <strong>📍 Location:</strong> ${location.value}
                        </div>
                        <p style="margin-top: 15px; font-size: 13px; color: #64748b; border-top: 1px solid #bbf7d0; padding-top: 10px;">
                            ℹ️ Use this Complaint ID to track your complaint status.<br>
                            Our team will resolve your issue soon.
                        </p>
                    </div>
                </div>
            `;
            message.className = "success";
            
            document.getElementById("citizenForm").reset();
            document.querySelectorAll('input[name="location"]').forEach(radio => {
                radio.checked = false;
            });

        } else {
            message.innerHTML = "❌ " + result.message;
            message.className = "error";
        }

    } catch (err) {
        console.error("Error:", err);
        message.innerHTML = "❌ Server Connection Failed. Please try again.";
        message.className = "error";
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// =========================
// TRACK COMPLAINT - UPDATED
// =========================

document.getElementById("trackForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Track Complaint clicked");

    const complaintId = document.getElementById("trackComplaintId").value.trim().toUpperCase();
    const trackResult = document.getElementById("trackResult");
    const message = document.getElementById("message");

    message.innerHTML = "";
    message.className = "";
    trackResult.style.display = "none";
    trackResult.innerHTML = "";

    if (!complaintId) {
        message.innerHTML = "⚠️ Please enter your Complaint ID";
        message.className = "error";
        return;
    }

    const trackBtn = document.querySelector('#trackForm .btn-login');
    const originalText = trackBtn.innerHTML;
    trackBtn.innerHTML = "⏳ Searching...";
    trackBtn.disabled = true;

    try {
        const response = await fetch("/api/records");
        const records = await response.json();

        let foundRecord = records.find(r => r.complaint_id === complaintId);
        
        if (!foundRecord) {
            foundRecord = records.find(r => r.complaint_id && r.complaint_id.toUpperCase() === complaintId);
        }

        if (foundRecord) {
            let statusBadge = '';
            let statusMessage = '';
            let statusColor = '';
            const status = foundRecord.status || 'Pending';
            
            if (status === 'Pending') {
                statusBadge = '<span style="background: #fef3c7; padding: 4px 16px; border-radius: 20px; font-weight: 600; color: #d97706;">⏳ Pending</span>';
                statusMessage = '⏳ Your complaint is pending. We\'ll resolve it soon.';
                statusColor = '#d97706';
            } else if (status === 'In Progress') {
                statusBadge = '<span style="background: #cffafe; padding: 4px 16px; border-radius: 20px; font-weight: 600; color: #0891b2;">🔄 In Progress</span>';
                statusMessage = '🔄 This complaint is being worked on by our team.';
                statusColor = '#0891b2';
            } else if (status === 'Resolved') {
                statusBadge = '<span style="background: #dcfce7; padding: 4px 16px; border-radius: 20px; font-weight: 600; color: #16a34a;">✅ Resolved</span>';
                statusMessage = '✅ This complaint has been resolved successfully!';
                statusColor = '#16a34a';
            }

            trackResult.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 12px; border: 2px solid #e2e8f0; text-align: left;">
                    <h3 style="color: #0f172a; margin-bottom: 15px;">📋 Complaint Details</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <p style="font-size: 11px; color: #64748b; margin-bottom: 2px; text-transform: uppercase; font-weight: 600;">Complaint ID</p>
                            <p style="font-weight: 600; color: #0f172a; font-size: 15px;">${foundRecord.complaint_id || complaintId}</p>
                        </div>
                        <div>
                            <p style="font-size: 11px; color: #64748b; margin-bottom: 2px; text-transform: uppercase; font-weight: 600;">Status</p>
                            <p>${statusBadge}</p>
                        </div>
                        <div>
                            <p style="font-size: 11px; color: #64748b; margin-bottom: 2px; text-transform: uppercase; font-weight: 600;">Location</p>
                            <p style="font-weight: 500; color: #0f172a;">${foundRecord.location || 'N/A'}</p>
                        </div>
                        <div>
                            <p style="font-size: 11px; color: #64748b; margin-bottom: 2px; text-transform: uppercase; font-weight: 600;">Block ID</p>
                            <p style="font-weight: 500; color: #0f172a;">${foundRecord.block_id || 'N/A'}</p>
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <p style="font-size: 11px; color: #64748b; margin-bottom: 2px; text-transform: uppercase; font-weight: 600;">Complaint</p>
                            <p style="font-weight: 500; color: #0f172a; background: #f8fafc; padding: 8px 12px; border-radius: 6px;">${foundRecord.complaint_text || 'No complaint details'}</p>
                        </div>
                        <div>
                            <p style="font-size: 11px; color: #64748b; margin-bottom: 2px; text-transform: uppercase; font-weight: 600;">Complaint Date</p>
                            <p style="font-weight: 500; color: #0f172a;">${foundRecord.complaint_date || 'N/A'}</p>
                        </div>
                        <div>
                            <p style="font-size: 11px; color: #64748b; margin-bottom: 2px; text-transform: uppercase; font-weight: 600;">Citizen</p>
                            <p style="font-weight: 500; color: #0f172a;">${foundRecord.citizen_name || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 15px; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600; 
                        background: ${status === 'Resolved' ? '#dcfce7' : status === 'In Progress' ? '#cffafe' : '#fef3c7'};
                        border-left: 4px solid ${statusColor};
                        color: ${statusColor};">
                        ${statusMessage}
                    </div>
                </div>
            `;
            trackResult.style.display = "block";
            
        } else {
            trackResult.innerHTML = `
                <div style="background: #fee2e2; padding: 20px; border-radius: 12px; border-left: 4px solid #dc2626; text-align: center;">
                    <p style="color: #dc2626; font-weight: 600; font-size: 16px;">❌ Complaint Not Found</p>
                    <p style="color: #64748b; margin-top: 8px; font-size: 14px;">
                        No complaint found with ID: <strong>${complaintId}</strong>
                    </p>
                </div>
            `;
            trackResult.style.display = "block";
        }

    } catch (error) {
        console.error("Error tracking complaint:", error);
        message.innerHTML = "❌ Error fetching complaint details. Please try again.";
        message.className = "error";
    } finally {
        trackBtn.innerHTML = originalText;
        trackBtn.disabled = false;
    }
});

// =========================
// SET DEFAULT PORTAL (Admin)
// =========================

togglePortal('admin');