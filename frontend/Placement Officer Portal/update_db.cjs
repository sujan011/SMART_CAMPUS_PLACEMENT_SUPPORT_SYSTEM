const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.studentsChartData = [
  { name: 'Jan', applied: 400, eligible: 240 },
  { name: 'Feb', applied: 300, eligible: 139 },
  { name: 'Mar', applied: 200, eligible: 980 },
  { name: 'Apr', applied: 278, eligible: 390 },
  { name: 'May', applied: 189, eligible: 480 },
  { name: 'Jun', applied: 239, eligible: 380 },
  { name: 'Jul', applied: 349, eligible: 430 },
];

db.placementsPieData = [
  { name: 'Placed', value: 326 },
  { name: 'Unplaced', value: 776 }
];

db.placementsBarData = [
  { name: 'TCS', applied: 400, placed: 120 },
  { name: 'Infosys', applied: 300, placed: 85 },
  { name: 'Wipro', applied: 250, placed: 60 },
  { name: 'Amazon', applied: 150, placed: 12 },
  { name: 'Tech Mahindra', applied: 200, placed: 49 }
];

db.reportsTrendData = [
  { name: 'Jun', reports: 12 },
  { name: 'Jul', reports: 19 },
  { name: 'Aug', reports: 15 },
  { name: 'Sep', reports: 22 },
  { name: 'Oct', reports: 30 },
  { name: 'Nov', reports: 28 },
  { name: 'Dec', reports: 35 },
  { name: 'Jan', reports: 42 },
  { name: 'Feb', reports: 38 },
  { name: 'Mar', reports: 45 },
  { name: 'Apr', reports: 50 },
  { name: 'May', reports: 48 },
];

db.reportsPieData = [
  { name: 'Placement', value: 45, color: '#3b82f6' },
  { name: 'Student', value: 25, color: '#10b981' },
  { name: 'Company', value: 15, color: '#f59e0b' },
  { name: 'Drive', value: 10, color: '#8b5cf6' },
  { name: 'Offer', value: 5, color: '#64748b' },
];

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('db.json updated successfully');
