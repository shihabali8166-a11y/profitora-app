const express = require('express');
const path = require('path');
const { Telegraf, Markup } = require('telegraf');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// ==================== CONFIGURATION (DYNAMIC) ====================
let BOT_TOKEN = process.env.BOT_TOKEN || '8803285889:AAH0xsUhk9rwpMXVdibgJfhLIMH5jhHCoe0';
let ADMIN_ID = process.env.ADMIN_ID || '8791142942';

// Dynamic Settings (Can be edited via Admin Commands)
let config = {
  supportUsername: '@BD_INCOME_2027_ADMIN',
  channel1: '@BD_INCOME_2027',
  channel2: 'https://t.me/BD_INCOME_REVEO_2027',
  minWithdraw: 50.00,
  withdrawFee: 5.00,
  referBonus: 5.00,
  adReward: 0.20,
  dailyAdLimit: 30
};

const bot = new Telegraf(BOT_TOKEN);

// Database (In-Memory)
let users = {};
let tasks = [
  { id: 1, title: 'Task — 1', reward: 5.00, details: 'Subscribe YouTube & Join Channel', link: 'https://t.me/BD_INCOME_2027' },
  { id: 2, title: 'Task — 2', reward: 5.00, details: 'Complete survey & share link', link: 'https://t.me/BD_INCOME_2027' }
];
let pendingTasks = {};
let currentAd = { 
  title: "📺 Watch Sponsored Ad", 
  link: "https://t.me/BD_INCOME_2027", 
  reward: 0.20 
};

// Helper: Get or Initialize User
function getUser(userId, username) {
  if (!users[userId]) {
    users[userId] = {
      id: userId,
      username: username || 'User',
      balance: 0,
      referrals: 0,
      referredBy: null,
      dailyAdsWatched: 0,
      lastAdReset: new Date().toDateString(),
      withdrawHistory: [],
      taskHistory: []
    };
  }

  const today = new Date().toDateString();
  if (users[userId].lastAdReset !== today) {
    users[userId].dailyAdsWatched = 0;
    users[userId].lastAdReset = today;
  }

  return users[userId];
}

// Mandatory Channel Check Middleware
async function checkChannelJoin(ctx, next) {
  if (ctx.from && ctx.chat && ctx.chat.type === 'private') {
    try {
      const member = await ctx.telegram.getChatMember(config.channel1, ctx.from.id);
      const isJoined = ['creator', 'administrator', 'member'].includes(member.status);

      if (!isJoined) {
        return ctx.reply(
          `❌ **CHANNEL JOIN REQUIRED!**\n\nবট ব্যবহার করতে আপনাকে অবশ্যই আমাদের চ্যানেলে জয়েন করতে হবে।`,
          Markup.inlineKeyboard([
            [Markup.button.url('📢 Join Channel 1', `https://t.me/${config.channel1.replace('@','')}`)],
            [Markup.button.url('📢 Review Channel 2', config.channel2)],
            [Markup.button.callback('🔄 Check Join', 'check_join')]
          ])
        );
      }
    } catch (err) {
      console.log("Channel join check error:", err.message);
    }
  }
  return next();
}

bot.use(checkChannelJoin);

bot.action('check_join', async (ctx) => {
  ctx.answerCbQuery();
  try {
    const member = await ctx.telegram.getChatMember(config.channel1, ctx.from.id);
    if (['creator', 'administrator', 'member'].includes(member.status)) {
      ctx.reply('✅ জয়েন সম্পন্ন হয়েছে!');
      sendMainMenu(ctx);
    } else {
      ctx.reply('❌ এখনো চ্যানেলে জয়েন হন নি!');
    }
  } catch (e) {
    ctx.reply('⚠️ সমস্যা হয়েছে! আবার চেষ্টা করুন।');
  }
});

// Main Menu Generator
function sendMainMenu(ctx) {
  const welcomeMsg = `✨ **ONLINE_INCOME_2027** ✨\n\nস্বাগতম! নিচে প্রদত্ত অপশন থেকে কাজ শুরু করুন।`;

  return ctx.reply(welcomeMsg, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('✨ Open Mini App ✨', 'https://profitora-app.onrender.com'), Markup.button.url('📢 Open Channel', `https://t.me/${config.channel1.replace('@','')}`)],
      [Markup.button.callback('💰 Balance', 'btn_balance'), Markup.button.callback('📋 Tasks', 'btn_tasks')],
      [Markup.button.callback(`📺 Ads (${config.adReward} BDT)`, 'btn_ads'), Markup.button.callback('👥 Referral', 'btn_refer')],
      [Markup.button.callback('💳 Withdraw', 'btn_withdraw'), Markup.button.callback('📜 Withdraw History', 'btn_withdraw_history')],
      [Markup.button.callback('📜 Task History', 'btn_task_history'), Markup.button.url('🎧 Support', `https://t.me/${config.supportUsername.replace('@','')}`)]
    ])
  });
}

// /start Command
bot.start((ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId, ctx.from.username);

  const startParam = ctx.message.text.split(' ')[1];
  if (startParam && startParam !== String(userId) && !user.referredBy) {
    const referrerId = startParam;
    if (users[referrerId]) {
      user.referredBy = referrerId;
      users[referrerId].referrals += 1;
      users[referrerId].balance += config.referBonus;
      ctx.telegram.sendMessage(referrerId, `🎉 **NEW REFERRAL BONUS!**\n\nআপনি পেয়েছেন **${config.referBonus.toFixed(2)} BDT**!`);
    }
  }

  sendMainMenu(ctx);
});

// Balance Action
bot.action('btn_balance', (ctx) => {
  const user = getUser(ctx.from.id, ctx.from.username);
  ctx.answerCbQuery();
  ctx.reply(`💳 **ACCOUNT BALANCE**\n\n💰 Balance: **${user.balance.toFixed(2)} BDT**\n👥 Total Referrals: **${user.referrals}**`, { parse_mode: 'Markdown' });
});

// Referral Action
bot.action('btn_refer', (ctx) => {
  const userId = ctx.from.id;
  const referLink = `https://t.me/${ctx.botInfo.username}?start=${userId}`;
  ctx.answerCbQuery();
  ctx.reply(`👥 **REFERRAL PROGRAM**\n\nপ্রতিটি রেফারে পাবেন **${config.referBonus.toFixed(2)} BDT**।\n\n🔗 Your Referral Link:\n\`${referLink}\``, { parse_mode: 'Markdown' });
});

// Ads Action
bot.action('btn_ads', (ctx) => {
  const user = getUser(ctx.from.id, ctx.from.username);
  ctx.answerCbQuery();

  if (user.dailyAdsWatched >= config.dailyAdLimit) {
    return ctx.reply(`⚠️ **TODAY'S ADS LIMIT EXHAUSTED!**\n\nআজকের ${config.dailyAdLimit}টি এড দেখা শেষ! আবার রাত ১২টার পর দেখতে পারবেন।`, { parse_mode: 'Markdown' });
  }

  ctx.reply(
    `📺 **WATCH SPONSORED ADS**\n\n${currentAd.title}\n\nপ্রতিটি এড দেখলে পাবেন: **${currentAd.reward} BDT**\nআজকের বাকি এড: **${config.dailyAdLimit - user.dailyAdsWatched}/${config.dailyAdLimit}**\n\nবিজ্ঞাপন দেখে নিচের বাটনে ক্লিক করুন।`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('🔗 Watch Ad', currentAd.link)],
        [Markup.button.callback(`✨ Claim ${currentAd.reward} BDT ✨`, 'claim_ad_reward')]
      ])
    }
  );
});

// Claim Ad Reward
bot.action('claim_ad_reward', (ctx) => {
  const user = getUser(ctx.from.id, ctx.from.username);
  ctx.answerCbQuery();

  if (user.dailyAdsWatched >= config.dailyAdLimit) {
    return ctx.reply('⚠️ আজকের এডের লিমিট শেষ!');
  }

  user.dailyAdsWatched += 1;
  user.balance += currentAd.reward;

  ctx.reply(`🎉 **SUCCESS!**\n\nআপনার ব্যালেন্সে **${currentAd.reward} BDT** যোগ করা হয়েছে!\nবর্তমান ব্যালেন্স: **${user.balance.toFixed(2)} BDT**\nআজকের দেখা এড: **${user.dailyAdsWatched}/${config.dailyAdLimit}**`, { parse_mode: 'Markdown' });
});

// Tasks Action
bot.action('btn_tasks', (ctx) => {
  ctx.answerCbQuery();
  if (tasks.length === 0) return ctx.reply('❌ কোনো টাস্ক নেই।');

  let msg = '📋 **AVAILABLE TASKS**\n\n';
  tasks.forEach(t => {
    msg += `📌 **${t.title}** - ৳${t.reward.toFixed(2)}\n📝 ${t.details}\n🔗 ${t.link}\n\n`;
  });
  ctx.reply(msg, { parse_mode: 'Markdown' });
});

// Handle 2 Photo Submissions for Task Proof
bot.on('photo', (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username ? `@${ctx.from.username}` : 'No Username';
  const user = getUser(userId, ctx.from.username);

  if (!pendingTasks[userId]) return ctx.reply('⚠️ আপনি কোনো টাস্ক শুরু করেননি।');

  const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
  pendingTasks[userId].photos.push(fileId);

  if (pendingTasks[userId].photos.length < 2) {
    return ctx.reply('📸 **১ম ছবি জমা হয়েছে!** এবার **২য় ছবিটি** পাঠান। (২টি ছবি আবশ্যক)');
  }

  const taskId = pendingTasks[userId].taskId;
  const task = tasks.find(t => t.id === taskId);

  ctx.telegram.sendMediaGroup(ADMIN_ID, [
    { type: 'photo', media: pendingTasks[userId].photos[0], caption: `📥 **NEW TASK PROOF**\n\n👤 User: ${username}\n🆔 User ID: \`${userId}\`\n📌 Task: ${task.title}\n💰 Reward: ৳${task.reward}` },
    { type: 'photo', media: pendingTasks[userId].photos[1] }
  ]);

  ctx.telegram.sendMessage(ADMIN_ID, `⚙️ **Action Required for User ${userId} (${username}):**`, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('✨ SUCCESS ✨', `approve_task_${userId}_${taskId}`),
        Markup.button.callback('❌ CANCEL ❌', `reject_task_${userId}_${taskId}`)
      ]
    ])
  });

  user.taskHistory.push({
    title: task.title,
    reward: task.reward,
    status: '✨ PROCESSING ✨',
    time: new Date().toLocaleString()
  });

  delete pendingTasks[userId];
  ctx.reply('✅ **SUBMITTED SUCCESSFULLY!**\n\nআপনার প্রুফ এডমিনের কাছে পাঠানো হয়েছে।', { parse_mode: 'Markdown' });
});

// Admin Task Approval
bot.action(/^approve_task_(\d+)_(\d+)$/, (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;

  const targetId = ctx.match[1];
  const taskId = parseInt(ctx.match[2]);
  const task = tasks.find(t => t.id === taskId);
  const user = getUser(targetId);

  if (task) {
    user.balance += task.reward;
    const history = user.taskHistory.slice().reverse().find(t => t.status === '✨ PROCESSING ✨');
    if (history) history.status = '✨ SUCCESS ✨';

    ctx.answerCbQuery();
    ctx.editMessageText(`✅ **Approved Task! Added ৳${task.reward} to User${targetId}.**`);
    bot.telegram.sendMessage(targetId, `🎉 **SUCCESS!**\n\nআপনার টাস্কটি অনুমোদিত হয়েছে! একাউন্টে **৳${task.reward}** যোগ করা হয়েছে।`);
  }
});

// Admin Task Rejection
bot.action(/^reject_task_(\d+)_(\d+)$/, (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;

  const targetId = ctx.match[1];
  const user = getUser(targetId);

  const history = user.taskHistory.slice().reverse().find(t => t.status === '✨ PROCESSING ✨');
  if (history) history.status = '❌ CANCEL ❌';

  ctx.answerCbQuery();
  ctx.editMessageText(`❌ **Task Rejected for User ${targetId}.**`);
  bot.telegram.sendMessage(targetId, `❌ **CANCEL!**\n\nআপনার টাস্ক প্রুফটি বাতিল করা হয়েছে।`);
});

// Withdraw Action
bot.action('btn_withdraw', (ctx) => {
  const user = getUser(ctx.from.id, ctx.from.username);
  ctx.answerCbQuery();

  ctx.reply(
    `💳 **WITHDRAWAL SYSTEM**\n\n💰 Minimum Withdraw: **${config.minWithdraw.toFixed(2)} BDT**\n⚡ Charge Fee: **${config.withdrawFee.toFixed(2)} BDT**\n\nবর্তমান ব্যালেন্স: **${user.balance.toFixed(2)} BDT**\n\nউইথড্র করতে কমান্ড লিখুন:\n\`/withdraw [নম্বর] [Bkash/Nagad] [পরিমাণ]\``,
    { parse_mode: 'Markdown' }
  );
});

bot.command('withdraw', (ctx) => {
  const args = ctx.message.text.split(' ');
  const user = getUser(ctx.from.id, ctx.from.username);
  const username = ctx.from.username ? `@${ctx.from.username}` : 'No Username';

  if (args.length < 4) return ctx.reply('⚠️ সঠিক নিয়ম: `/withdraw 01700000000 Bkash 50`');

  const number = args[1];
  const method = args[2];
  const amount = parseFloat(args[3]);

  if (isNaN(amount) || amount < config.minWithdraw) return ctx.reply(`❌ সর্বনিম্ন উইথড্র ${config.minWithdraw} টাকা।`);
  if (amount > user.balance) return ctx.reply('❌ পর্যাপ্ত ব্যালেন্স নেই।');

  user.balance -= amount;
  const requestId = Date.now();

  user.withdrawHistory.push({
    id: requestId,
    amount: amount,
    method: method,
    number: number,
    status: '✨ PROCESSING ✨',
    time: new Date().toLocaleString()
  });

  ctx.telegram.sendMessage(
    ADMIN_ID,
    `🔔 **NEW WITHDRAW REQUEST**\n\n👤 User: ${username}\n🆔 User ID: \`${user.id}\`\nNumber: ${number}\nMethod:${method}\nAmount: ${amount} BDT (Fee:${config.withdrawFee} BDT)`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('✨ SUCCESS ✨', `app_w_${user.id}_${requestId}`),
          Markup.button.callback('❌ REJECT ❌', `rej_w_${user.id}_${requestId}`)
        ]
      ])
    }
  );

  ctx.reply(`✅ উইথড্র সফলভাবে জমা হয়েছে!`);
});

// Admin Approve Withdraw
bot.action(/^app_w_(\d+)_(\d+)$/, (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const targetId = ctx.match[1];
  const reqId = parseInt(ctx.match[2]);
  const user = getUser(targetId);
  const req = user.withdrawHistory.find(w => w.id === reqId);
  if (req) req.status = '✨ SUCCESS ✨';

  ctx.answerCbQuery();
  ctx.editMessageText(`✅ **Withdraw Approved.**`);
  bot.telegram.sendMessage(targetId, `🎉 উইথড্র সফল হয়েছে এবং পেমেন্ট পাঠানো হয়েছে!`);
});

// Admin Reject Withdraw
bot.action(/^rej_w_(\d+)_(\d+)$/, (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const targetId = ctx.match[1];
  const reqId = parseInt(ctx.match[2]);
  ctx.answerCbQuery();
  ctx.reply(`✏️ কারণ লিখে রিজেক্ট করতে কমান্ড দিন:\n\`/rejectreason ${targetId} ${reqId} [কারণ]\``);
});

bot.command('rejectreason', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const args = ctx.message.text.split(' ');
  const targetId = args[1];
  const reqId = parseInt(args[2]);
  const reason = args.slice(3).join(' ');
  const user = getUser(targetId);
  const req = user.withdrawHistory.find(w => w.id === reqId);

  if (req) {
    req.status = `❌ REJECTED: ${reason}`;
    user.balance += req.amount; // Refund
    ctx.reply(`✅ Rejected & Refunded.`);
    bot.telegram.sendMessage(targetId, `❌ উইথড্র বাতিল হয়েছে!\nকারণ: ${reason}\nটাকা একাউন্টে ফেরত দেওয়া হয়েছে।`);
  }
});

// History Actions
bot.action('btn_withdraw_history', (ctx) => {
  const user =getUser(ctx.from.id, ctx.from.username);
  ctx.answerCbQuery();
  if (user.withdrawHistory.length === 0) return ctx.reply('📜 কোনো উইথড্র হিস্টোরি নেই।');

  let msg = '📜 **WITHDRAW HISTORY**\n\n';
  user.withdrawHistory.slice(-5).forEach((h, i) => {
    msg += `${i + 1}. Amount: ${h.amount} BDT\nMethod: ${h.method} (${h.number})\nStatus: **${h.status}**\nTime: ${h.time}\n\n`;
  });
  ctx.reply(msg, { parse_mode: 'Markdown' });
});

bot.action('btn_task_history', (ctx) => {
  const user = getUser(ctx.from.id, ctx.from.username);
  ctx.answerCbQuery();
  if (user.taskHistory.length === 0) return ctx.reply('📜 কোনো টাস্ক হিস্টোরি নেই।');

  let msg = '📜 **TASK HISTORY**\n\n';
  user.taskHistory.slice(-5).forEach((t, i) => {
    msg += `${i + 1}. ${t.title} - ৳${t.reward}\nStatus: **${t.status}**\nTime: ${t.time}\n\n`;
  });
  ctx.reply(msg, { parse_mode: 'Markdown' });
});

// ==================== ALL ADMIN EDIT COMMANDS ====================

// 1. Edit Ad: /setad [Title] | [Link] | [Reward]
bot.command('setad', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const input = ctx.message.text.replace('/setad ', '').split('|');
  if (input.length < 3) return ctx.reply('⚠️ সঠিক নিয়ম:\n`/setad New Sponsor Ad | https://link.com | 0.20`');

  currentAd.title = input[0].trim();
  currentAd.link = input[1].trim();
  currentAd.reward = parseFloat(input[2].trim());
  config.adReward = currentAd.reward;

  ctx.reply(`✅ **Ad Updated Successfully!**\nTitle: ${currentAd.title}\nLink: ${currentAd.link}\nReward: ${currentAd.reward} BDT`);
});

// 2. Edit Channel 1: /setchannel1 [Username]
bot.command('setchannel1', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const username = ctx.message.text.split(' ')[1];
  if (!username) return ctx.reply('⚠️ ব্যবহার নির্দেশিকা: `/setchannel1 @your_channel`');

  config.channel1 = username.trim();
  ctx.reply(`✅ **Mandatory Channel 1 Updated to:** ${config.channel1}`);
});

// 3. Edit Channel 2: /setchannel2 [Link]
bot.command('setchannel2', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const link = ctx.message.text.split(' ')[1];
  if (!link) return ctx.reply('⚠️ ব্যবহার নির্দেশিকা: `/setchannel2 https://t.me/...`');

  config.channel2 = link.trim();
  ctx.reply(`✅ **Review Channel 2 Link Updated!**`);
});

// 4. Edit Support ID: /setsupport [Username]
bot.command('setsupport', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const username = ctx.message.text.split(' ')[1];
  if (!username) return ctx.reply('⚠️ ব্যবহার নির্দেশিকা: `/setsupport @your_admin_id`');

  config.supportUsername = username.trim();
  ctx.reply(`✅ **Support Username Updated to:** ${config.supportUsername}`);
});

// 5. Edit Min Withdraw: /setminwithdraw [Amount]
bot.command('setminwithdraw', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const amount = parseFloat(ctx.message.text.split(' ')[1]);
  if (isNaN(amount)) return ctx.reply('⚠️ ব্যবহার নির্দেশিকা: `/setminwithdraw 50`');

  config.minWithdraw = amount;
  ctx.reply(`✅ **Minimum Withdraw Amount Updated to:** ${config.minWithdraw} BDT`);
});

// 6. Edit Refer Bonus: /setreferbonus [Amount]
bot.command('setreferbonus', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const amount = parseFloat(ctx.message.text.split(' ')[1]);
  if (isNaN(amount)) return ctx.reply('⚠️ ব্যবহার নির্দেশিকা: `/setreferbonus 5.00`');

  config.referBonus = amount;
  ctx.reply(`✅ **Referral Bonus Amount Updated to:** ${config.referBonus} BDT`);
});

// Task Commands
bot.command('addtask', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const input = ctx.message.text.replace('/addtask ', '').split('|');
  if (input.length < 4) return ctx.reply('⚠️ সঠিক ফরম্যাট:\n`/addtask Task — 3 | 5.00 | Details here | https://link.com`');

  const newId = tasks.length + 1;
  tasks.push({
    id: newId,
    title: input[0].trim(),
    reward: parseFloat(input[1].trim()),
    details: input[2].trim(),
    link: input[3].trim()
  });

  ctx.reply(`✅ টাস্ক #${newId} সফলভাবে যোগ করা হয়েছে!`);
});

bot.command('edittask', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const input = ctx.message.text.replace('/edittask ', '').split('|');
  if (input.length < 5) return ctx.reply('⚠️ সঠিক ফরম্যাট:\n`/edittask [ID] | [Title] | [Reward] | [Details] | [Link]`');

  const id = parseInt(input[0].trim());
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.title = input[1].trim();
    task.reward = parseFloat(input[2].trim());
    task.details = input[3].trim();
    task.link = input[4].trim();
    ctx.reply(`✅ টাস্ক #${id} এডিট করা হয়েছে!`);
  }
});

bot.command('deletetask', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const id = parseInt(ctx.message.text.split(' ')[1]);
  tasks = tasks.filter(t => t.id !== id);
  ctx.reply(`✅ টাস্ক #${id} ডিলিট করা হয়েছে!`);
});

bot.command('add', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const args = ctx.message.text.split(' ');
  if (args.length < 3) return ctx.reply('⚠️ সঠিক নিয়ম: `/add [UserID] [Amount]`');

  const targetId = args[1];
  const amount = parseFloat(args[2]);
  const user = getUser(targetId);

  user.balance += amount;
  ctx.reply(`✅ ${targetId} আইডি-তে ${amount} BDT যোগ করা হয়েছে।`);
  bot.telegram.sendMessage(targetId, `🎉 এডমিন আপনার অ্যাকাউন্টে **${amount} BDT** যোগ করেছেন!`);
});

bot.launch();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
