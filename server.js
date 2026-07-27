const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// =========================
// DEMO USERS (In production, use database)
// =========================

const users = [
    {
        id: 1,
        username: "admin",
        password: "$2b$10$EPQ.wMcETgSLx9UvB9hCLe7c4.KdlhAroNFpA8GfYt9xNRnmYISaq", // admin123
        role: "admin"
    },
    {
        id: 2,
        username: "user",
        password: "$2b$10$abc123def456ghi789jklmno123pqrs456tuvwxyz789", // user123
        role: "user"
    }
];

// Load data from file
let recordsData = [];
const dataFilePath = path.join(__dirname, "public", "data.json");

function loadData() {
    try {
        if (fs.existsSync(dataFilePath)) {
            const data = fs.readFileSync(dataFilePath, "utf8");
            recordsData = JSON.parse(data);
            console.log(`Loaded ${recordsData.length} records`);
        } else {
            console.log("data.json not found, creating empty array");
            recordsData = [];
        }
    } catch (err) {
        console.error("Error loading data:", err);
        recordsData = [];
    }
}

function saveData() {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(recordsData, null, 4));
        console.log("Data saved successfully");
        return true;
    } catch (err) {
        console.error("Error saving data:", err);
        return false;
    }
}

loadData();

// =========================
// 🔐 AUTHENTICATION MIDDLEWARE
// =========================

function isAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("❌ No valid authorization header found");
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please login first.",
            error: "UNAUTHORIZED"
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        // For demo: Simple token validation
        // In production, use JWT: jwt.verify(token, process.env.JWT_SECRET)
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const userData = JSON.parse(decoded);
        
        // Check if user exists
        const user = users.find(u => u.username === userData.username);
        
        if (!user) {
            console.log("❌ User not found from token");
            return res.status(401).json({
                success: false,
                message: "Invalid authentication. Please login again.",
                error: "UNAUTHORIZED"
            });
        }
        
        // Attach user to request
        req.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };
        next();
    } catch (err) {
        console.error("❌ Token verification failed:", err.message);
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token. Please login again.",
            error: "UNAUTHORIZED"
        });
    }
}

// =========================
// 🔐 ADMIN AUTHORIZATION MIDDLEWARE
// =========================

function isAdmin(req, res, next) {
    isAuthenticated(req, res, () => {
        if (!req.user || req.user.role !== 'admin') {
            console.log(`❌ Access denied for user: ${req.user?.username || 'unknown'}`);
            console.log(`   Required role: admin`);
            console.log(`   Actual role: ${req.user?.role || 'none'}`);
            
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required.",
                error: "FORBIDDEN"
            });
        }
        
        console.log(`✅ Admin access granted: ${req.user.username}`);
        next();
    });
}

// =========================
// LOGIN API - Creates authentication token
// =========================

app.post("/login", async (req, res) => {
    console.log("Login Request:", req.body);
    
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password required"
        });
    }

    const user = users.find(u => u.username === username);
    
    if (!user) {
        // Same response for security
        return res.status(401).json({
            success: false,
            message: "Invalid Username or Password"
        });
    }

    try {
        const match = await bcrypt.compare(password, user.password);
        
        if (match) {
            // Create a token with user info
            const tokenData = {
                id: user.id,
                username: user.username,
                role: user.role,
                timestamp: Date.now()
            };
            
            // Simple token generation (for demo only)
            const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
            
            return res.json({
                success: true,
                message: "Login Successful",
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid Username or Password"
            });
        }
    } catch (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({
            success: false,
            message: "Login error occurred"
        });
    }
});

// =========================
// GET ALL RECORDS - PUBLIC (No authentication needed)
// =========================

app.get("/api/records", (req, res) => {
    console.log("GET /api/records - returning", recordsData.length, "records");
    res.json(recordsData);
});

// =========================
// GET SINGLE RECORD - PUBLIC (No authentication needed)
// =========================

app.get("/api/records/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const record = recordsData.find(r => r.record_id === id);
    
    if (!record) {
        return res.status(404).json({
            success: false,
            message: "Record not found"
        });
    }
    
    res.json(record);
});

// =========================
// 🔐 UPDATE RECORD - ADMIN ONLY
// =========================

app.put("/api/records/:id", isAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const { cleaner, cleaning_date, status } = req.body;
    
    console.log(`========================================`);
    console.log(`🔐 PUT /api/records/${id} - Admin Update Request`);
    console.log(`Admin: ${req.user.username} (${req.user.role})`);
    console.log(`Cleaner:`, cleaner);
    console.log(`Cleaning Date:`, cleaning_date);
    console.log(`Status:`, status);
    console.log(`========================================`);
    
    // Find the record
    const recordIndex = recordsData.findIndex(r => r.record_id === id);
    
    if (recordIndex === -1) {
        console.log("❌ Record not found!");
        return res.status(404).json({
            success: false,
            message: "Record not found"
        });
    }
    
    // Update fields - only update if provided
    if (cleaner !== undefined && cleaner !== null && cleaner !== "") {
        recordsData[recordIndex].cleaner = cleaner;
    }
    if (cleaning_date !== undefined && cleaning_date !== null && cleaning_date !== "") {
        recordsData[recordIndex].cleaning_date = cleaning_date;
    }
    if (status !== undefined && status !== null && status !== "") {
        recordsData[recordIndex].status = status;
    }
    
    // Save to file
    if (saveData()) {
        console.log("✅ Data saved successfully by admin:", req.user.username);
        res.json({
            success: true,
            message: "Record updated successfully",
            record: recordsData[recordIndex],
            updated_by: req.user.username
        });
    } else {
        console.log("❌ Error saving data!");
        res.status(500).json({
            success: false,
            message: "Error saving data"
        });
    }
});

// =========================
// 🔐 DELETE RECORD - ADMIN ONLY
// =========================

app.delete("/api/records/:id", isAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    
    console.log(`========================================`);
    console.log(`🔐 DELETE /api/records/${id} - Admin Delete Request`);
    console.log(`Admin: ${req.user.username} (${req.user.role})`);
    console.log(`========================================`);
    
    // Find the record
    const recordIndex = recordsData.findIndex(r => r.record_id === id);
    
    if (recordIndex === -1) {
        console.log("❌ Record not found!");
        return res.status(404).json({
            success: false,
            message: "Record not found"
        });
    }
    
    // Remove record
    const deletedRecord = recordsData[recordIndex];
    recordsData.splice(recordIndex, 1);
    
    console.log("✅ Record deleted by admin:", req.user.username);
    
    // Save to file
    if (saveData()) {
        console.log("✅ Data saved successfully!");
        res.json({
            success: true,
            message: "Record deleted successfully",
            deleted_record: deletedRecord,
            deleted_by: req.user.username
        });
    } else {
        console.log("❌ Error saving data!");
        res.status(500).json({
            success: false,
            message: "Error saving data"
        });
    }
});

// =========================
// SUBMIT CITIZEN COMPLAINT - PUBLIC
// =========================

app.post("/api/complaint", (req, res) => {
    console.log("New Citizen Complaint:", req.body);
    
    const { name, mobile, location, complaint } = req.body;
    
    // Validate input
    if (!name || !mobile || !location || !complaint) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }
    
    if (mobile.length < 10) {
        return res.status(400).json({
            success: false,
            message: "Valid 10-digit mobile number is required"
        });
    }
    
    // Generate new record ID
    const newId = recordsData.length > 0 ? Math.max(...recordsData.map(r => r.record_id)) + 1 : 1;
    
    // Generate Complaint ID (PTC + Year + Month + Day + 3-digit number)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const complaintId = `PTC${year}${month}${day}${String(newId).padStart(3, '0')}`;
    
    // Create new complaint record
    const newRecord = {
        record_id: newId,
        block_id: "CIT" + String(newId).padStart(3, "0"),
        location: location,
        cleaning_date: "",
        cleaner: "",
        complaint_text: complaint,
        complaint_date: new Date().toISOString().split('T')[0],
        status: "Pending",
        citizen_name: name,
        citizen_mobile: mobile,
        is_citizen_complaint: true,
        complaint_id: complaintId
    };
    
    // Add to data
    recordsData.push(newRecord);
    
    // Save to file
    if (saveData()) {
        res.json({
            success: true,
            message: "Complaint submitted successfully! Reference ID: " + complaintId,
            record: newRecord,
            complaint_id: complaintId
        });
    } else {
        res.status(500).json({
            success: false,
            message: "Error saving complaint. Please try again."
        });
    }
});

// =========================
// TEST ROUTE - Check user role
// =========================

app.get("/api/user/role", isAuthenticated, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=================================`);
    console.log(`🚻 Server Running Successfully`);
    console.log(`=================================`);
    console.log(`📍 Local:   http://localhost:${PORT}`);
    console.log(`=================================`);
    console.log(`📝 Login Credentials:`);
    console.log(`   🔐 Admin:  admin / admin123`);
    console.log(`   👤 User:   user / user123`);
    console.log(`=================================`);
    console.log(`🔐 API Security:`);
    console.log(`   ✅ GET  /api/records      - PUBLIC`);
    console.log(`   🔐 PUT  /api/records/:id  - ADMIN ONLY`);
    console.log(`   🔐 DELETE /api/records/:id - ADMIN ONLY`);
    console.log(`   ✅ POST /api/complaint    - PUBLIC`);
    console.log(`=================================`);
    console.log(`🔑 To test authorization:`);
    console.log(`   curl -X PUT http://localhost:3000/api/records/1 \\`);
    console.log(`   -H "Authorization: Bearer TOKEN" \\`);
    console.log(`   -d '{"status":"Resolved"}'`);
    console.log(`=================================\n`);
});
