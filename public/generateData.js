const fs = require("fs");

const locations = [
    "Central Bus Stand",
    "Railway Station",
    "City Park",
    "Market Area",
    "Government Hospital",
    "Shopping Mall",
    "Beach Road",
    "School Campus",
    "Temple Street",
    "Bus Depot"
];

const cleaners = [
    "Kumar",
    "Ravi",
    "Arun",
    "Suresh",
    "Mani",
    "Priya",
    "Anitha",
    "Karthik",
    "Selvi",
    "Vijay"
];

const complaints = [
    "Bad smell",
    "Water leakage",
    "Dirty floor",
    "Broken tap",
    "No water supply",
    "Dustbin full",
    "Broken door",
    "Lights not working",
    "Overflowing drain",
    "No tissue paper"
];

const status = [
    "Pending",
    "Resolved",
    "In Progress"
];

let data = [];

for(let i=1;i<=40;i++){

    data.push({

        record_id:i,

        block_id:"B"+(100+i),

        location:locations[i%10],

        cleaning_date:`2026-07-${String((i%28)+1).padStart(2,"0")}`,

        cleaner:cleaners[i%10],

        complaint_text:complaints[i%10],

        complaint_date:`2026-07-${String((i%28)+2).padStart(2,"0")}`,

        status:status[i%3]

    });

}

// Missing Value
data[35].cleaning_date = "";

// Similar Names
data[36].cleaner = "Kumar";
data[37].cleaner = "Kumarr";

// Record with no complaint
data[38].complaint_text = "";
data[38].complaint_date = "";
data[38].status = "Resolved";

fs.writeFileSync(
    "./public/data.json",
    JSON.stringify(data,null,4)
);

console.log("40 Records Generated Successfully");