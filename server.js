const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// BOT CREDENTIALS
// ==========================================
const TOKEN = '8642037280:AAFdbV2nbs9xAN14qMKYSL53gU9zS9Fhtd8';
const ADMIN_ID = '8791142942';

const bot = new TelegramBot(TOKEN, { polling: true });
console.log('🚀 Telegram Bot & Web App Server Starting...');

app.use(express.json());

// Channel Join Checker
async function checkChannelJoin(userId) {
  try {
    const member1 = await bot.getChatMember('@BD_INCOME_2027', userId);
    const member2 = await bot.getChatMember('@BD_INCOME_REVEO_2027', userId);
    const validStatuses = ['creator', 'administrator', 'member'];
    return validStatuses.includes(member1.status) && validStatuses.includes(member2.status);
  } catch (e) {
    return false;
  }
}

// Bot /start Command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const isJoined = await checkChannelJoin(msg.from.id);

  if (!isJoined) {
    bot.sendMessage(chatId, "❌ এখনো চ্যানেলে জয়েন হন নি! দয়া করে উভয় চ্যানেলে জয়েন করুন:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 Join Channel 1", url: "https://t.me/BD_INCOME_2027" }],
          [{ text: "📢 Join Channel 2", url: "https://t.me/BD_INCOME_REVEO_2027" }],
          [{ text: "🔄 VERIFY JOIN", callback_data: "check_join" }]
        ]
      }
    });
    return;
  }

  bot.sendMessage(chatId, `✨ Welcome to ProfitOra BD Engine!\nSelect an option below:`, {
    reply_markup: {
      keyboard: [
        [{ text: "🚀 OPEN MINING 🚀" }, { text: "📢 OPEN CHANNEL" }],
        [{ text: "📊 STATUS" }, { text: "💬 SUPPORT" }]
      ],
      resize_keyboard: true
    }
  });
});

// Bot Buttons Handler
bot.on('message', async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;

  if (text === "🚀 OPEN MINING 🚀") {
    const appUrl = `https://${msg.headers?.host || 'profitora-bd.onrender.com'}`;
    bot.sendMessage(chatId, "Click below to enter ProfitOra App:", {
      reply_markup: {
        inline_keyboard: [[{ text: "⚡ OPEN MINI APP ⚡", web_app: { url: appUrl } }]]
      }
    });
  } else if (text === "📢 OPEN CHANNEL") {
    bot.sendMessage(chatId, "Official Channel: https://t.me/BD_INCOME_2027");
  } else if (text === "💬 SUPPORT") {
    bot.sendMessage(chatId, "Support Admin: @BD_INCOME_2027_ADMIN");
  } else if (text === "📊 STATUS") {
    bot.sendMessage(chatId, `👤 User Status:\nID: ${msg.from.id}\nStatus: Active ✅`);
  }
});

bot.on('callback_query', async (query) => {
  if (query.data === "check_join") {
    const isJoined = await checkChannelJoin(query.from.id);
    if (isJoined) {
      bot.sendMessage(query.message.chat.id, "✅ Verification Successful! Send /start to continue.");
    } else {
      bot.answerCallbackQuery(query.id, { text: "❌ এখনো চ্যানেলে জয়েন হন নি", show_alert: true });
    }
  }
});

// FRONTEND MINI APP HTML CODE
const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>ProfitOra BD Mini App</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0a0518;
      --card-bg: #160d33;
      --accent-purple: #7c3aed;
      --accent-glow: #a855f7;
      --accent-cyan: #06b6d4;
      --text-white: #ffffff;
      --text-gray: #a1a1aa;
      --danger: #ef4444;
      --success: #22c55e;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; -webkit-tap-highlight-color: transparent; }
    body { background-color: var(--bg-primary); color: var(--text-white); display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

    .glow-text-purple { color: #d8b4fe; text-shadow: 0 0 8px #a855f7, 0 0 15px #a855f7; animation: pulseGlow 1.8s infinite alternate; }
    .glow-text-cyan { color: #67e8f9; text-shadow: 0 0 8px #06b6d4, 0 0 15px #06b6d4; animation: pulseGlow 1.8s infinite alternate; }
    .glow-text-gold { color: #fde047; text-shadow: 0 0 8px #eab308; animation: pulseGlow 1.8s infinite alternate; }

    @keyframes pulseGlow { 0% { opacity: 0.8; } 100% { opacity: 1; text-shadow: 0 0 18px #c084fc, 0 0 25px #a855f7; } }

    .user-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(22, 13, 51, 0.9); border-bottom: 1px solid rgba(168, 85, 247, 0.3); }
    .user-info { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .user-avatar { width: 42px; height: 42px; border-radius: 50%; border: 2px solid #a855f7; box-shadow: 0 0 10px #a855f7; object-fit: cover; }
    .user-name { font-weight: bold; font-size: 15px; color: #fff; }
    .support-btn { background: rgba(6, 182, 212, 0.2); border: 1px solid #06b6d4; color: #06b6d4; padding: 6px 12px; border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 6px; text-decoration: none; }

    .banner-container { width: 100%; height: 140px; overflow: hidden; border-bottom: 2px solid rgba(168, 85, 247, 0.3); }
    .banner-container img { width: 100%; height: 100%; object-fit: cover; }

    .app-content { flex: 1; overflow-y: auto; padding: 16px; padding-bottom: 80px; }
    .tab-page { display: none; }
    .tab-page.active { display: block; }

    .card { background: var(--card-bg); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 16px; padding: 16px; margin-bottom: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
    .action-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #1f1245; border-radius: 12px; margin-bottom: 8px; cursor: pointer; border: 1px solid rgba(168, 85, 247, 0.2); }

    .glow-button { background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; font-weight: bold; border: none; border-radius: 12px; padding: 12px 20px; cursor: pointer; box-shadow: 0 0 12px rgba(168, 85, 247, 0.6); }
    .glow-button:disabled { opacity: 0.5; cursor: not-allowed; }

    .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 65px; background: #110826; border-top: 1px solid rgba(168, 85, 247, 0.4); display: flex; justify-content: space-around; align-items: center; z-index: 100; }
    .nav-item { display: flex; flex-direction: column; align-items: center; color: var(--text-gray); background: none; border: none; font-size: 11px; font-weight: 600; cursor: pointer; gap: 4px; }
    .nav-item.active { color: #c084fc; text-shadow: 0 0 10px #a855f7; }

    .input-field { width: 100%; padding: 12px; border-radius: 10px; background: #0f0724; border: 1px solid rgba(168, 85, 247, 0.4); color: #fff; margin-top: 8px; outline: none; }
    .file-input-box { border: 2px dashed rgba(168, 85, 247, 0.5); padding: 15px; border-radius: 12px; text-align: center; margin-top: 10px; background: #110829; }

    #channelGate { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 5, 24, 0.96); backdrop-filter: blur(10px); z-index: 1000; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 24px; text-align: center; }
    .channel-btn { width: 100%; margin: 8px 0; padding: 12px; border-radius: 12px; background: #1d1042; border: 1px solid #a855f7; color: #fff; font-weight: bold; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .warning-text { color: var(--danger); font-size: 13px; margin-top: 8px; font-weight: bold; display: none; }
  </style>
</head>
<body>

  <div id="channelGate">
    <h2 class="glow-text-purple" style="font-size: 22px; margin-bottom: 8px;">JOIN CHANNELS FIRST</h2>
    <p class="glow-text-cyan" style="font-size: 14px; margin-bottom: 20px;">MUST JOIN BOTH CHANNELS TO ACCESS APP</p>

    <a href="https://t.me/BD_INCOME_2027" target="_blank" onclick="markJoined(1)" class="channel-btn">
      <i class="fab fa-telegram"></i> <span class="glow-text-purple">1. JOIN CHANNEL 1</span>
    </a>

    <a href="https://t.me/BD_INCOME_REVEO_2027" target="_blank" onclick="markJoined(2)" class="channel-btn">
      <i class="fab fa-telegram"></i> <span class="glow-text-purple">2. JOIN CHANNEL 2</span>
    </a>

    <button onclick="verifyJoin()" class="glow-button" style="width: 100%; margin-top: 20px;">VERIFY NOW</button>
    <div id="gateWarning" class="warning-text">এখনো চ্যানেলে জয়েন করেন নি!</div>
  </div>

  <div class="user-header">
    <div class="user-info" onclick="openBot()">
      <img id="userAvatar" class="user-avatar" src="https://i.postimg.cc/GpGtGRyC/6c90e3f6-37ac-4c4c-aedd-7a83100c62a4.jpg" alt="User">
      <span id="userName" class="user-name glow-text-purple">🚀 [SHIHAB OWNER]</span>
    </div>
    <a href="https://t.me/BD_INCOME_2027_ADMIN" target="_blank" class="support-btn glow-text-cyan"><i class="fas fa-headset"></i> SUPPORT</a>
  </div>

  <div class="banner-container">
    <img src="https://i.postimg.cc/GpGtGRyC/6c90e3f6-37ac-4c4c-aedd-7a83100c62a4.jpg" alt="Banner">
  </div>

  <div class="app-content">
    <div id="homeTab" class="tab-page active">
      <div class="card" style="text-align: center;">
        <p style="color: var(--text-gray); font-size: 13px;">Total Balance</p>
        <h1 id="userBalance" class="glow-text-cyan" style="font-size: 36px; margin: 5px 0;">৳0.00</h1>
        <p style="color: var(--text-gray); font-size: 12px;">Current Balance</p>
      </div>

      <div class="card">
        <div class="action-row" onclick="showTab('rulesTab', document.getElementById('navRules'))">
          <span><i class="fas fa-book glow-text-gold"></i> Rules / Guidelines</span>
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    </div>

    <div id="tasksTab" class="tab-page">
      <h3 class="glow-text-purple" style="margin-bottom: 12px;">AVAILABLE TASKS</h3>
      <div class="card">
        <h4>Task 1: Complete Task & Upload 2 Proof Images</h4>
        <div class="file-input-box">
          <input type="file" id="img1" class="input-field" onchange="checkFiles()">
        </div>
        <div class="file-input-box">
          <input type="file" id="img2" class="input-field" onchange="checkFiles()">
        </div>
        <button id="taskSubmitBtn" onclick="alert('Proof Submitted Successfully!')" class="glow-button" style="width: 100%; margin-top: 15px;" disabled>SUBMIT TASK PROOF</button>
      </div>
    </div>

    <div id="adsTab" class="tab-page">
      <h3 class="glow-text-purple" style="margin-bottom: 12px;">WATCH ADS & EARN</h3>
      <div class="card" style="text-align: center;">
        <h2 id="adCountText" class="glow-text-cyan">0 / 30 ADS</h2>
        <p class="glow-text-gold" style="font-size: 13px;">EARN ৳0.20 PER AD</p>
        <button onclick="watchAd()" class="glow-button" style="width: 100%; margin-top: 15px;">WATCH AD NOW</button>
      </div>
    </div>

    <div id="walletTab" class="tab-page">
      <h3 class="glow-text-purple" style="margin-bottom: 8px;">WITHDRAW</h3>
      <div style="background: rgba(168, 85, 247, 0.1); padding: 10px; border-radius: 10px; border: 1px dashed #a855f7; text-align: center; margin-bottom: 12px;">
        <span class="glow-text-cyan" style="font-weight: bold;">MINIMUM WITHDRAW 50 TAKA</span>
        <p class="glow-text-gold" style="font-size: 12px;">Charge: ৳5.00 Service Fee</p>
      </div>
      <div class="card">
        <select id="withdrawMethod" class="input-field">
          <option value="Nagad">Nagad</option>
          <option value="bKash">bKash</option>
        </select>
        <input type="text" id="withdrawNum" class="input-field" placeholder="Account Number">
        <input type="number" id="withdrawAmt" class="input-field" placeholder="Amount (Min 50)">
        <button onclick="withdraw()" class="glow-button" style="width: 100%; margin-top: 15px;">WITHDRAW NOW</button>
      </div>
    </div>

    <div id="rulesTab" class="tab-page">
      <h3 class="glow-text-gold" style="text-align: center;">নিয়মাবলী</h3>
      <p style="margin-top: 10px; font-size: 13px; color: var(--text-gray);">১. ফেক রেফার করা যাবে না।<br>২. টাস্ক সঠিকভাবে পূরণ করে ২টা স্ক্রিনশট দিতে হবে।<br>৩. চ্যানেলে যুক্ত না থাকলে পেমেন্ট বাতিল হবে।</p>
    </div>
  </div>

  <div class="bottom-nav">
    <button class="nav-item active" onclick="showTab('homeTab', this)"><i class="fas fa-home"></i><span class="glow-text-purple">Home</span></button>
    <button class="nav-item" onclick="showTab('tasksTab', this)"><i class="fas fa-tasks"></i><span class="glow-text-purple">Tasks</span></button>
    <button class="nav-item" onclick="openChannel1()"><i class="fab fa-telegram-plane" style="font-size: 22px; color: #06b6d4;"></i><span class="glow-text-cyan">Telegram</span></button>
    <button class="nav-item" id="navRules" onclick="showTab('rulesTab', this)"><i class="fas fa-book"></i><span class="glow-text-gold">Rules</span></button>
    <button class="nav-item" onclick="showTab('walletTab', this)"><i class="fas fa-wallet"></i><span class="glow-text-purple">Wallet</span></button>
  </div>

  <script>
    let ch1 = false, ch2 = false, balance = 0.00, ads = 0;
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user) document.getElementById('userName').innerText = user.first_name || 'User';
    }

    function markJoined(c) { if (c===1) ch1=true; if (c===2) ch2=true; }
    function verifyJoin() {
      if (ch1 && ch2) document.getElementById('channelGate').style.display = 'none';
      else document.getElementById('gateWarning').style.display = 'block';
    }

    function showTab(id, btn) {
      document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      if(btn) btn.classList.add('active');
    }

    function openBot() { window.location.href = "https://t.me/BD_INCOME_2027_BOT"; }
    function openChannel1() { window.location.href = "https://t.me/BD_INCOME_2027"; }

    function checkFiles() {
      const f1 = document.getElementById('img1').files.length;
      const f2 = document.getElementById('img2').files.length;
      document.getElementById('taskSubmitBtn').disabled = !(f1 > 0 && f2 > 0);
    }

    function watchAd() {
      if (ads >= 30) return alert("Daily 30 Ads Limit Reached!");
      ads++;
      balance += 0.20;
      document.getElementById('userBalance').innerText = '৳' + balance.toFixed(2);
      document.getElementById('adCountText').innerText = ads + ' / 30 ADS';
      alert('Ad Watched! ৳0.20 Added.');
    }

    function withdraw() {
      const amt = parseFloat(document.getElementById('withdrawAmt').value) || 0;
      if (amt < 50 || balance < 50) return alert("MINIMUM WITHDRAW 50 TAKA");
      balance -= amt;
      document.getElementById('userBalance').innerText = '৳' + balance.toFixed(2);
      alert('Withdrawal Request Sent!');
    }
  </script>
</body>
</html>
`;

app.get('/', (req, res) => {
  res.send(HTML_CONTENT);
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
