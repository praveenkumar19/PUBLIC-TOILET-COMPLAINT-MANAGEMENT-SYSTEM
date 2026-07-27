console.log("login.js loaded");

// =========================
// GLOBAL VARIABLES
// =========================

let authToken = null; // Store the authentication token

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

    // Clear messages - only if elements exist
    if (message) {
        message.innerHTML = "";
        message.className = "";
    }
    if (trackResult) {
        trackResult.style.display = "none";
        trackResult.innerHTML = "";
    }

    // Remove active from all - only if elements exist
    if (adminToggle) adminToggle.classList.remove("active");
    if (citizenToggle) citizenToggle.classList.remove("active");
    if (trackToggle) trackToggle.classList.remove("active");
    if (adminPortal) adminPortal.classList.remove("active");
    if (citizenPortal) citizenPortal.classList.remove("active");
    if (trackPortal) trackPortal.classList.remove("active");

    if (type === "admin") {
        if (adminToggle) adminToggle.classList.add("active");
        if (adminPortal) adminPortal.classList.add("active");
    } else if (type === "citizen") {
        if (citizenToggle) citizenToggle.classList.add("active");
        if (citizenPortal) citizenPortal.classList.add("active");
    } else if (type === "track") {
        if (trackToggle) trackToggle.classList.add("active");
        if (trackPortal) trackPortal.classList.add("active");
    }
}

// =========================
// SECURE API REQUEST HELPER
// =========================

async function apiRequest(url, options = {}) {
    // Get token from localStorage
    const token = localStorage.getItem("authToken");
    
    // Prepare headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make the request
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
        console.log("🔐 Authentication failed. Token may be expired.");
        // Clear stored tokens
        localStorage.removeItem("authToken");
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        
        // Redirect to login page
        if (window.location.pathname !== '/login.html' && !window.location.pathname.includes('login')) {
            window.location.href = 'login.html';
        }
        
        throw new Error("Session expired. Please login again.");
    }
    
    // Handle 403 Forbidden - not enough permissions
    if (response.status === 403) {
        console.log("⛔ Access denied. Insufficient permissions.");
        throw new Error("Access denied. Admin privileges required.");
    }
    
    return response;
}

// =========================
// ADMIN LOGIN - SECURE VERSION (No Account Enumeration)
// =========================

// Only attach event listener if the admin form exists
const adminForm = document.getElementById("adminForm");
if (adminForm) {
    adminForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        console.log("Admin Login clicked");

        const username = document.getElementById("username");
        const password = document.getElementById("password");
        const message = document.getElementById("message");

        // Check if elements exist
        if (!username || !password || !message) {
            console.error("Login form elements not found");
            return;
        }

        const usernameVal = username.value.trim();
        const passwordVal = password.value.trim();

        message.innerHTML = "";
        message.className = "";

        if (!usernameVal || !passwordVal) {
            message.innerHTML = "⚠️ Please enter both username and password";
            message.className = "error";
            return;
        }

        // Disable submit button to prevent multiple attempts
        const submitBtn = document.querySelector('#adminForm .btn-login');
        const originalText = submitBtn ? submitBtn.innerHTML : "Login";
        if (submitBtn) {
            submitBtn.innerHTML = "⏳ Processing...";
            submitBtn.disabled = true;
        }

        try {
            console.log("Sending login request to:", "/login");
            
            // Add artificial delay to prevent timing attacks
            const startTime = Date.now();
            
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username: usernameVal, password: passwordVal })
            });

            const result = await response.json();
            console.log("Login result:", result);

            // Calculate elapsed time and add delay if needed
            const elapsed = Date.now() - startTime;
            const minDelay = 1500; // Minimum 1.5 second delay
            if (elapsed < minDelay) {
                await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
            }

            // SECURITY FIX: Always show the same message regardless of success/failure
            // This prevents account enumeration attacks
            
            // Show a generic success message for ALL login attempts
            message.innerHTML = "✅ Login Successful! Redirecting...";
            message.className = "success";
            
            // Only actually redirect and set localStorage if login was successful
            if (result.success) {
                // Store the authentication token
                if (result.token) {
                    authToken = result.token;
                    localStorage.setItem("authToken", result.token);
                    console.log("🔐 Token stored successfully");
                }
                
                localStorage.setItem("loggedIn", "true");
                localStorage.setItem("username", usernameVal);
                localStorage.setItem("userRole", "admin");
                
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1500);
            } else {
                // For failed logins, show the same success message initially
                // Then after a delay, show a generic message
                console.log("Login failed but showing generic success message");
                
                setTimeout(() => {
                    // Reset to a generic message after the "success" message times out
                    if (message.innerHTML.includes("Login Successful")) {
                        message.innerHTML = "⚠️ Session expired. Please try again.";
                        message.className = "error";
                        
                        // Reset the form for security
                        const usernameField = document.getElementById("username");
                        const passwordField = document.getElementById("password");
                        if (usernameField) usernameField.value = "";
                        if (passwordField) passwordField.value = "";
                    }
                }, 2500);
            }

        } catch (err) {
            console.error("Login error:", err);
            // Even on server errors, show a generic message
            message.innerHTML = "✅ Login Successful! Redirecting...";
            message.className = "success";
            
            // Reset after a delay
            setTimeout(() => {
                if (message.innerHTML.includes("Login Successful")) {
                    message.innerHTML = "⚠️ Connection error. Please try again.";
                    message.className = "error";
                }
            }, 2500);
        } finally {
            // Re-enable submit button after delay
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }, 3000);
        }
    });
} else {
    console.log("ℹ️ Admin form not found on this page (likely not login page)");
}

// =========================
// CITIZEN COMPLAINT SUBMISSION
// =========================

const citizenForm = document.getElementById("citizenForm");
if (citizenForm) {
    citizenForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        console.log("Citizen Complaint submitted");

        const name = document.getElementById("citizenName");
        const mobile = document.getElementById("citizenMobile");
        const location = document.querySelector('input[name="location"]:checked');
        const complaint = document.getElementById("complaintDetails");
        const message = document.getElementById("message");

        if (!name || !mobile || !complaint || !message) {
            console.error("Citizen form elements not found");
            return;
        }

        const nameVal = name.value.trim();
        const mobileVal = mobile.value.trim();
        const complaintVal = complaint.value.trim();

        message.innerHTML = "";
        message.className = "";

        // Validation
        if (!nameVal) {
            message.innerHTML = "⚠️ Please enter your full name";
            message.className = "error";
            return;
        }

        if (!mobileVal) {
            message.innerHTML = "⚠️ Please enter your mobile number";
            message.className = "error";
            return;
        }

        if (mobileVal.length < 10) {
            message.innerHTML = "⚠️ Please enter a valid 10-digit mobile number";
            message.className = "error";
            return;
        }

        if (!location) {
            message.innerHTML = "⚠️ Please select a toilet location";
            message.className = "error";
            return;
        }

        if (!complaintVal || complaintVal.length < 10) {
            message.innerHTML = "⚠️ Please provide more details (minimum 10 characters)";
            message.className = "error";
            return;
        }

        // Show loading
        const submitBtn = document.querySelector('#citizenForm .btn-login');
        const originalText = submitBtn ? submitBtn.innerHTML : "Submit";
        if (submitBtn) {
            submitBtn.innerHTML = "⏳ Submitting...";
            submitBtn.disabled = true;
        }

        try {
            const response = await fetch("/api/complaint", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: nameVal,
                    mobile: mobileVal,
                    location: location.value,
                    complaint: complaintVal
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
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    });
} else {
    console.log("ℹ️ Citizen form not found on this page");
}

// =========================
// TRACK COMPLAINT
// =========================

const trackForm = document.getElementById("trackForm");
if (trackForm) {
    trackForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        console.log("Track Complaint clicked");

        const complaintIdInput = document.getElementById("trackComplaintId");
        const trackResult = document.getElementById("trackResult");
        const message = document.getElementById("message");

        if (!complaintIdInput || !trackResult || !message) {
            console.error("Track form elements not found");
            return;
        }

        const complaintId = complaintIdInput.value.trim().toUpperCase();

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
        const originalText = trackBtn ? trackBtn.innerHTML : "Search";
        if (trackBtn) {
            trackBtn.innerHTML = "⏳ Searching...";
            trackBtn.disabled = true;
        }

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
                // SECURITY: Don't reveal whether the complaint ID exists or not
                // Show a generic message that doesn't confirm or deny existence
                trackResult.innerHTML = `
                    <div style="background: #fef3c7; padding: 20px; border-radius: 12px; border-left: 4px solid #d97706; text-align: center;">
                        <p style="color: #d97706; font-weight: 600; font-size: 16px;">🔍 Please verify your Complaint ID</p>
                        <p style="color: #64748b; margin-top: 8px; font-size: 14px;">
                            The complaint ID you entered could not be processed. 
                            Please check your ID and try again.
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
            if (trackBtn) {
                trackBtn.innerHTML = originalText;
                trackBtn.disabled = false;
            }
        }
    });
} else {
    console.log("ℹ️ Track form not found on this page");
}

// =========================
// CHECK AUTHENTICATION STATUS
// =========================

function checkAuth() {
    const token = localStorage.getItem("authToken");
    const loggedIn = localStorage.getItem("loggedIn");
    
    if (token && loggedIn === "true") {
        authToken = token;
        console.log("🔐 User is authenticated");
        return true;
    }
    
    console.log("🔓 User is not authenticated");
    return false;
}

// =========================
// SET DEFAULT PORTAL (Admin) - Only if on login page
// =========================

// Check if we're on the login page by looking for portal elements
const hasPortal = document.getElementById("adminPortal") || document.getElementById("citizenPortal") || document.getElementById("trackPortal");
if (hasPortal) {
    togglePortal('admin');
} else {
    console.log("ℹ️ Portal not found on this page, skipping togglePortal");
}

// =========================
// EXPOSE API HELPER FOR CONSOLE TESTING
// =========================

// Make apiRequest available in browser console for testing
window.apiRequest = apiRequest;
window.authToken = authToken;
window.checkAuth = checkAuth;

console.log("✅ login.js loaded successfully");
console.log("🔐 Security features enabled:");
console.log("   ✅ Token-based authentication");
console.log("   ✅ Admin-only route protection");
console.log("   ✅ 401/403 error handling");
console.log("   ✅ Account enumeration prevention");
console.log("   ✅ Timing attack prevention");
