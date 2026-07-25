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

// Demo user
const users = [
    {
        username: "admin",
        password: "$2b$10$EPQ.wMcETgSLx9UvB9hCLe7c4.KdlhAroNFpA8GfYt9xNRnmYISaq"
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
// LOGIN API
// =========================
app.post("/login", async (req, res) => {
    console.log("Login Request:", req.body);
    
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.json({
            success: false,
            message: "Username and password required"
        });
    }

    const user = users.find(u => u.username === username);
    
    if (!user) {
        return res.json({
            success: false,
            message: "Invalid Username or Password"
        });
    }

    try {
        const match = await bcrypt.compare(password, user.password);
        
        if (match) {
            return res.json({
                success: true,
                message: "Login Successful"
            });
        } else {
            return res.json({
                success: false,
                message: "Invalid Username or Password"
            });
        }
    } catch (err) {
        console.error("Error comparing passwords:", err);
        return res.json({
            success: false,
            message: "Login error occurred"
        });
    }
});

// =========================
// GET ALL RECORDS
// =========================
app.get("/api/records", (req, res) => {
    console.log("GET /api/records - returning", recordsData.length, "records");
    res.json(recordsData);
});

// =========================
// UPDATE RECORD - FULL UPDATE (FIXED - SINGLE ENDPOINT)
// =========================
app.put("/api/records/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { cleaner, cleaning_date, status } = req.body;
    
    console.log(`========================================`);
    console.log(`PUT /api/records/${id} - Update Request`);
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
    
    console.log("✅ Record found at index:", recordIndex);
    console.log("Before update:", JSON.stringify(recordsData[recordIndex], null, 2));
    
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
    
    console.log("After update:", JSON.stringify(recordsData[recordIndex], null, 2));
    
    // Save to file
    if (saveData()) {
        console.log("✅ Data saved successfully!");
        res.json({
            success: true,
            message: "Record updated successfully",
            record: recordsData[recordIndex]
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
// SUBMIT CITIZEN COMPLAINT
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
        complaint_id: complaintId  // ← NEW: Store the complaint ID
    };
    
    // Add to data
    recordsData.push(newRecord);
    
    // Save to file
    if (saveData()) {
        res.json({
            success: true,
            message: "Complaint submitted successfully! Reference ID: " + complaintId,
            record: newRecord,
            complaint_id: complaintId  // ← Return the complaint ID
        });
    } else {
        res.status(500).json({
            success: false,
            message: "Error saving complaint. Please try again."
        });
    }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=================================`);
    console.log(`🚻 Server Running Successfully`);
    console.log(`=================================`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`=================================`);
    console.log(`📝 Login Credentials:`);
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log(`=================================\n`);
});