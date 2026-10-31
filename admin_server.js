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
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        return { users: {}, deposits: [], withdrawals: [] };
    }
}

// የዳታቤዝ ፋይል መጻፊያ ፈንክሽን
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ዋናው ገጽ (Home Route) - የኤችቲኤምኤል ፋይልዎን ያሳያል
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Dashbet3.html.html'));
});

// ==== 1. የተጠቃሚ ምዝገባ ክፍል (REGISTER ROUTE) ====
app.post('/register', (req, res) => {
    const { username, phoneNumber, password } = req.body;
    const db = readDB();

    if (!username || !phoneNumber || !password) {
        return res.json({ success: false, message: 'እባክዎ ሁሉንም መረጃዎች በትክክል ያስገቡ!' });
    }

    if (db.users[phoneNumber]) {
        return res.json({ success: false, message: 'ይህ ስልክ ቁጥር ቀደም ብሎ ተመዝግቧል!' });
    }

    // አዲስ ተጠቃሚ መመዝገብ (መነሻ ቦነስ 0.00 ብር)
    db.users[phoneNumber] = {
        username,
        phoneNumber,
        password,
        balance: 0.00
    };

    writeDB(db);
    res.json({ success: true, message: 'ምዝገባው በተሳካ ሁኔታ ተጠናቋል!' });
});

// ==== 2. የተጠቃሚ መግቢያ ክፍል (LOGIN ROUTE) ====
app.post('/login', (req, res) => {
    const { phoneNumber, password } = req.body;
    const db = readDB();

    const user = db.users[phoneNumber];
    if (!user || user.password !== password) {
        return res.json({ success: false, message: 'የስልክ ቁጥር ወይም የይለፍ ቃል አልተሳሳተም!' });
    }

    res.json({ 
        success: true, 
        message: 'እንኳን ደህና መጡ!', 
        username: user.username, 
        balance: user.balance 
    });
});

// የአድሚን ዳሽቦርድ መረጃዎች ማግኛ (Admin Routes)
app.get('/admin/stats', (req, res) => {
    const db = readDB();
    let totalCapital = Object.values(db.users).reduce((sum, u) => sum + u.balance, 0);
    res.json({ 
        totalUsers: Object.keys(db.users).length, 
        pendingDeposits: (db.deposits || []).filter(r => r.status === 'PENDING').length, 
        pendingWithdrawals: (db.withdrawals || []).filter(r => r.status === 'PENDING').length, 
        totalCapital 
    });
});

app.get('/admin/deposits', (req, res) => { const db = readDB(); res.json(db.deposits || []); });
app.get('/admin/withdrawals', (req, res) => { const db = readDB(); res.json(db.withdrawals || []); });
app.get('/admin/users', (req, res) => { const db = readDB(); res.json(Object.values(db.users)); });

// ሰርቨር መቀስቀሻ
app.listen(PORT, '0.0.0.0', () => {
    console.log(`==================================================`);
    console.log(`🚀 Dashbet ሰርቨር በተሳካ ሁኔታ በፖርት ${PORT} ላይ ተነስቷል!`);
    console.log(`==================================================`);
});
