const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware ቅንብሮች
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// የዳታቤዝ ፋይል ማንበቢያ ፈንክሽን
function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        return { users: {}, deposits: [], withdrawals: [] };
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// ዋናው ገጽ (Home Route) - የኤችቲኤምኤል ፋይልዎን ያሳያል
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Dashbet3.html.html'));
});

// የአድሚን ዳሽቦርድ መረጃዎች ማግኛ (Admin Routes)
app.get('/admin/stats', (req, res) => {
    const db = readDB();
    let totalCapital = Object.values(db.users).reduce((sum, u) => sum + u.balance, 0);
    res.json({ 
        totalUsers: Object.keys(db.users).length, 
        pendingDeposits: db.deposits.filter(r => r.status === 'PENDING').length, 
        pendingWithdrawals: db.withdrawals.filter(r => r.status === 'PENDING').length, 
        totalCapital 
    });
});

app.get('/admin/deposits', (req, res) => { 
    const db = readDB(); 
    res.json(db.deposits || []); 
});

app.get('/admin/withdrawals', (req, res) => { 
    const db = readDB(); 
    res.json(db.withdrawals || []); 
});

app.get('/admin/users', (req, res) => { 
    const db = readDB(); 
    res.json(Object.values(db.users)); 
});

// ሰርቨር መቀስቀሻ (Port Binding)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Dashbet ሰርቨር በተሳካ ሁኔታ ተነስቷል!`);
    console.log(`🔗 ላይቭ ሊንክዎ፦ https://hulugame-5.onrender.com`);
    console.log(`==================================================\n`);
});
