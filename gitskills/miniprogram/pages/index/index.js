const LOVE_QUOTES = [
  { text: '遇见你，是我这辈子最美丽的意外。', author: '给最爱的莎' },
  { text: '春风十里不如你，夏阳满天不及你。', author: '赫' },
  { text: '和你在一起的每一天，都是最好的时光。', author: '赫' },
  { text: '世界很大，但我的心很小，只装得下你一个人。', author: '给最爱的莎' },
  { text: '你的笑容，是我每天醒来最大的动力。', author: '赫' },
  { text: '不管是晴天还是雨天，有你在身边就是好天气。', author: '赫' },
  { text: '我想和你一起，看遍世间所有的风景。', author: '给最爱的莎' },
  { text: '执子之手，与子偕老。', author: '赫 & 莎' },
  { text: '你是我所有温柔和浪漫的来源。', author: '赫' },
  { text: '谢谢你来到我的世界，让它变得如此美好。', author: '给最爱的莎' },
  { text: '爱不是轰轰烈烈，而是细水长流的陪伴。', author: '赫 & 莎' },
  { text: '有你的地方，就是家。', author: '赫' },
  { text: '我没有什么超能力，只想超爱你。', author: '给最爱的莎' },
  { text: '时光往复，爱你如初。', author: '赫' },
  { text: '你是年少的欢喜，也是余生的甜蜜。', author: '赫 & 莎' },
];

const DEFAULT_HOLIDAYS = [
  { id: 'valentine', name: '情人节', emoji: '💝', date: '02-14', repeat: true },
  { id: '520', name: '520 表白日', emoji: '💌', date: '05-20', repeat: true },
  { id: 'qixi', name: '七夕情人节', emoji: '🎋', date: '--', repeat: true, lunar: true, lunarText: '农历七月初七' },
  { id: 'xmas', name: '圣诞节', emoji: '🎄', date: '12-25', repeat: true },
  { id: 'newyear', name: '元旦新年', emoji: '🎊', date: '01-01', repeat: true },
  { id: 'midautumn', name: '中秋节', emoji: '🥮', date: '--', repeat: true, lunar: true, lunarText: '农历八月十五' },
];

const LUNAR_APPROX = {
  '七夕': y => new Date(y, 7, { 2025: 29, 2026: 19, 2027: 7, 2028: 26, 2029: 15, 2030: 4 }[y] || 7),
  '中秋': y => new Date(y, 8, { 2025: 6, 2026: 25, 2027: 15, 2028: 3, 2029: 22, 2030: 12 }[y] || 15),
};

function daysBetween(d1, d2) { return Math.floor((d2 - d1) / 86400000); }
function monthsBetween(d1, d2) { return (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth() - (d2.getDate() < d1.getDate() ? 1 : 0); }
function formatCN(d) { return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'; }
function nextAnniversary(s, n) { const y = n.getFullYear(); let a = new Date(y, s.getMonth(), s.getDate()); if (a <= n) a.setFullYear(y + 1); return a; }
function currentAnniversaryStart(s, n) { const y = n.getFullYear(); let a = new Date(y, s.getMonth(), s.getDate()); if (a > n) a.setFullYear(y - 1); return a; }

function getHolidayDate(h, now) {
  if (h.lunar) { if (h.name === '七夕情人节') return LUNAR_APPROX['七夕'](now.getFullYear()); if (h.name === '中秋节') return LUNAR_APPROX['中秋'](now.getFullYear()); return null; }
  const [m, d] = h.date.split('-').map(Number); let t = new Date(now.getFullYear(), m - 1, d);
  if (t <= now) t.setFullYear(now.getFullYear() + 1); return t;
}

function load(k) { return wx.getStorageSync(k) || ''; }
function loadJSON(k, def) { try { const r = wx.getStorageSync(k); return r ? JSON.parse(r) : def; } catch (e) { return def; } }
function save(k, v) { wx.setStorageSync(k, v); }
function saveJSON(k, v) { wx.setStorageSync(k, JSON.stringify(v)); }

Page({
  data: {
    activeTab: 'ann', subTab: 'meeting',
    couple: { days: '?', startText: '点击下方按钮设置恋爱开始日期吧', years: '--', months: '--', day: '--', hms: '--:--:--', pct: 0, annStart: '--', annEnd: '--', cdDays: '--', cdHours: '--', cdMins: '--', cdSecs: '--', annLabel: '距离周年纪念日' },
    quote: { text: '', author: '' },
    meeting: { days: '?', hours: '--', mins: '--', secs: '--', label: '还没有设置见面日期' },
    status: {}, statusInput: '',
    milestones: [],
    album: [],
    holidays: [],
    // tea
    tea: { name: '', price: '', sugar: '七分糖', ice: '少冰', toppings: [], toppingStr: '' },
    teaOrders: [],
    sugarOpts: ['正常糖', '七分糖', '半糖', '三分糖', '无糖'],
    iceOpts: ['正常冰', '少冰', '去冰', '热饮'],
    toppingOpts: ['珍珠', '椰果', '布丁', '芋圆', '脆波波', '奶盖'],
    // modals
    showSettings: false, settingsDate: '',
    showHoliday: false, holidayForm: { name: '', date: '', emoji: '🎉', repeat: true },
    holidayEmojis: ['🎉', '🎂', '💝', '🌟', '🎄', '🎊', '🌸', '🍂', '🎁', '💍', '🌈'],
    showMilestone: false, msForm: { title: '', date: '', desc: '', emoji: '💕' },
    msEmojis: ['💕', '✈️', '🎂', '💍', '🏠', '🎓', '🎉', '🌟'],
    showMeeting: false, meetingDate: '',
    showAlbum: false, albumForm: { file: '', cap: '', date: '' },
    orderDone: false, orderMsg: '',
  },

  onLoad() { this.renderAll(); this.timer = setInterval(() => this.renderCoupleCard(), 1000); },
  onUnload() { if (this.timer) clearInterval(this.timer); },

  // ====== tabs ======
  switchTab(e) { const t = e.currentTarget.dataset.tab; this.setData({ activeTab: t }); },
  switchSubTab(e) { this.setData({ subTab: e.currentTarget.dataset.sub }); },

  // ====== render ======
  renderAll() { this.renderCoupleCard(); this.renderHolidays(); this.renderMilestones(); this.renderQuote(); this.renderMeeting(); this.renderStatus(); this.renderAlbum(); this.renderTeaHistory(); },

  renderCoupleCard() {
    const ds = wx.getStorageSync('ann_couple_date'), now = new Date();
    if (!ds) return this.setData({ couple: Object.assign(this.data.couple, { days: '?', years: '--', months: '--', day: '--', hms: '--:--:--', cdDays: '--', cdHours: '--', cdMins: '--', cdSecs: '--', startText: '点击下方按钮设置恋爱开始日期吧' }) });
    const s = new Date(ds + 'T00:00:00'), days = daysBetween(s, now);
    const tm = monthsBetween(s, now), y = Math.floor(tm / 12), m = tm % 12;
    let ld = new Date(now.getFullYear(), now.getMonth(), s.getDate()); if (ld > now) ld.setMonth(ld.getMonth() - 1);
    const d = Math.floor((now - ld) / 86400000);
    const hms = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
    const aS = currentAnniversaryStart(s, now), aE = nextAnniversary(s, now);
    const pct = Math.min(100, Math.round(((now - aS) / (aE - aS)) * 100));
    let cd = { cdDays: '0', cdHours: '0', cdMins: '0', cdSecs: '0', annLabel: '今天就是纪念日！🎉' };
    const diff = aE - now;
    if (diff > 0) { const ts = Math.floor(diff / 1000); cd = { cdDays: Math.floor(ts / 86400), cdHours: Math.floor((ts % 86400) / 3600), cdMins: Math.floor((ts % 3600) / 60), cdSecs: ts % 60, annLabel: '距离 ' + (aE.getFullYear() - s.getFullYear()) + ' 周年纪念日 (' + formatCN(aE) + ')' }; }
    this.setData({ couple: { days, startText: '从 ' + formatCN(s) + ' 开始', years: y, months: m, day: d, hms, pct, annStart: formatCN(aS), annEnd: formatCN(aE), ...cd } });
  },

  renderQuote() {
    const ds = wx.getStorageSync('ann_couple_date'), now = new Date();
    let idx = ds ? daysBetween(new Date(ds + 'T00:00:00'), now) % LOVE_QUOTES.length : now.getDate() % LOVE_QUOTES.length;
    this.setData({ quote: LOVE_QUOTES[idx] });
  },

  renderMeeting() {
    const ds = wx.getStorageSync('ann_meeting_date'), now = new Date();
    if (!ds) return this.setData({ meeting: { days: '?', hours: '--', mins: '--', secs: '--', label: '还没有设置见面日期' } });
    const m = new Date(ds + 'T00:00:00'), diff = m - now;
    if (diff <= 0) return this.setData({ meeting: { days: '🎉', hours: '0', mins: '0', secs: '0', label: '今天就是见面日！' } });
    const ts = Math.floor(diff / 1000);
    this.setData({ meeting: { days: Math.floor(ts / 86400), hours: Math.floor((ts % 86400) / 3600), mins: Math.floor((ts % 3600) / 60), secs: ts % 60, label: '见面日期：' + formatCN(m) } });
  },

  renderStatus() {
    const s = loadJSON('ann_status', null);
    this.setData({ status: s || {} });
  },

  renderMilestones() {
    const ms = loadJSON('ann_milestones', [{ id: 'ms1', title: '我们在一起了', date: '', emoji: '💕', desc: '最美好的一天开始' }]);
    ms.forEach(m => { if (m.date) { m.dateStr = formatCN(new Date(m.date + 'T00:00:00')); m.sortDate = new Date(m.date + 'T00:00:00'); } else { m.dateStr = '开始的那天'; m.sortDate = new Date(0); } });
    ms.sort((a, b) => b.sortDate - a.sortDate);
    this.setData({ milestones: ms });
  },

  renderAlbum() {
    const album = loadJSON('ann_album', []);
    album.forEach(p => { p.dateStr = p.date ? formatCN(new Date(p.date + 'T00:00:00')) : ''; });
    album.sort((a, b) => b.id.localeCompare(a.id));
    this.setData({ album });
  },

  renderHolidays() {
    const hols = loadJSON('ann_holidays', DEFAULT_HOLIDAYS), now = new Date();
    const ts = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    hols.forEach(h => {
      const t = getHolidayDate(h, now); let dl = null, it = false;
      if (h.lunar) { if (t) { dl = Math.ceil((t - now) / 86400000); if (dl < 0 && t.toDateString() === now.toDateString()) dl = 0; } }
      else { const [m, d] = h.date.split('-').map(Number); if (String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0') === ts) { it = true; dl = 0; } else { let x = new Date(now.getFullYear(), m - 1, d); if (x <= now) x.setFullYear(now.getFullYear() + 1); dl = Math.ceil((x - now) / 86400000); } }
      h.badge = ''; h.badgeClass = ''; if (it) { h.badge = '今天'; h.badgeClass = 'badge-today'; } else if (dl !== null && dl <= 7) { h.badge = '还有 ' + dl + ' 天'; h.badgeClass = 'badge-soon'; } else if (dl !== null) { h.badge = '还有 ' + dl + ' 天'; h.badgeClass = 'badge-days'; }
      h.isToday = it; h.upcoming = dl !== null && dl <= 7 && dl >= 0;
      if (h.lunar && h.lunarText) h.dateText = h.lunarText + ' · ' + (t ? formatCN(t) : '');
      else { const [m, d] = h.date.split('-').map(Number); h.dateText = '每年 ' + m + '月' + d + '日'; }
    });
    hols.sort((a, b) => { const p = x => x.isToday ? 0 : x.upcoming ? 1 : 2; return p(a) - p(b); });
    this.setData({ holidays: hols });
  },

  // ====== modals ======
  openSettings() { const c = wx.getStorageSync('ann_couple_date') || ''; this.setData({ showSettings: true, settingsDate: c }); },
  closeSettings() { this.setData({ showSettings: false }); },
  onSettingsDateChange(e) { this.setData({ settingsDate: e.detail.value }); },
  saveCoupleDate() { const v = this.data.settingsDate; if (!v) return wx.showToast({ title: '请选择日期', icon: 'none' }); wx.setStorageSync('ann_couple_date', v); this.setData({ showSettings: false }); this.renderAll(); },

  openHolidayForm() { this.setData({ showHoliday: true, holidayForm: { name: '', date: '', emoji: '🎉', repeat: true } }); },
  closeHolidayForm() { this.setData({ showHoliday: false }); },
  onHolidayName(e) { this.setData({ 'holidayForm.name': e.detail.value }); },
  onHolidayDateChange(e) { this.setData({ 'holidayForm.date': e.detail.value }); },
  setHolidayEmoji(e) { this.setData({ 'holidayForm.emoji': e.currentTarget.dataset.v }); },
  onHolidayRepeat(e) { this.setData({ 'holidayForm.repeat': e.detail.value }); },
  addHoliday() { const f = this.data.holidayForm; if (!f.name || !f.date) return wx.showToast({ title: '请填写完整', icon: 'none' }); const p = f.date.split('-'), h = loadJSON('ann_holidays', DEFAULT_HOLIDAYS); h.push({ id: 'c_' + Date.now(), name: f.name, emoji: f.emoji, date: p[1] + '-' + p[2], repeat: f.repeat }); saveJSON('ann_holidays', h); this.setData({ showHoliday: false }); this.renderAll(); },

  openMilestoneForm() { this.setData({ showMilestone: true, msForm: { title: '', date: '', desc: '', emoji: '💕' } }); },
  closeMilestoneForm() { this.setData({ showMilestone: false }); },
  onMsTitle(e) { this.setData({ 'msForm.title': e.detail.value }); },
  onMsDateChange(e) { this.setData({ 'msForm.date': e.detail.value }); },
  onMsDesc(e) { this.setData({ 'msForm.desc': e.detail.value }); },
  setMsEmoji(e) { this.setData({ 'msForm.emoji': e.currentTarget.dataset.v }); },
  addMilestone() { const f = this.data.msForm; if (!f.title) return wx.showToast({ title: '请填写标题', icon: 'none' }); const ms = loadJSON('ann_milestones', []); ms.push({ id: 'ms_' + Date.now(), title: f.title, date: f.date, desc: f.desc, emoji: f.emoji }); saveJSON('ann_milestones', ms); this.setData({ showMilestone: false }); this.renderAll(); },

  openMeetingSettings() { const c = wx.getStorageSync('ann_meeting_date') || ''; this.setData({ showMeeting: true, meetingDate: c }); },
  closeMeetingSettings() { this.setData({ showMeeting: false }); },
  onMeetingDateChange(e) { this.setData({ meetingDate: e.detail.value }); },
  saveMeetingDate() { const v = this.data.meetingDate; if (!v) return wx.showToast({ title: '请选择日期', icon: 'none' }); wx.setStorageSync('ann_meeting_date', v); this.setData({ showMeeting: false }); this.renderAll(); },

  // status
  onStatusInput(e) { this.setData({ statusInput: e.detail.value }); },
  updateStatus() { const t = this.data.statusInput.trim(); if (!t) return wx.showToast({ title: '写点什么吧~', icon: 'none' }); saveJSON('ann_status', { text: t, time: new Date().toLocaleString('zh-CN') }); this.setData({ statusInput: '' }); this.renderStatus(); },

  // album
  openAlbumForm() { this.setData({ showAlbum: true, albumForm: { file: '', cap: '', date: '' } }); },
  closeAlbumForm() { this.setData({ showAlbum: false }); },
  onAlbumFile(e) { this.setData({ 'albumForm.file': e.detail.value }); },
  onAlbumCap(e) { this.setData({ 'albumForm.cap': e.detail.value }); },
  onAlbumDateChange(e) { this.setData({ 'albumForm.date': e.detail.value }); },
  addAlbumPhoto() { const f = this.data.albumForm; if (!f.file) return wx.showToast({ title: '请填写文件名', icon: 'none' }); const a = loadJSON('ann_album', []); a.push({ id: 'ap_' + Date.now(), file: f.file, cap: f.cap, date: f.date }); saveJSON('ann_album', a); this.setData({ showAlbum: false }); this.renderAll(); },
  deleteAlbumPhoto(e) { const id = e.currentTarget.dataset.id; const a = loadJSON('ann_album', []).filter(p => p.id !== id); saveJSON('ann_album', a); this.renderAll(); },
  previewPhoto(e) { const idx = e.currentTarget.dataset.idx; const urls = this.data.album.map(p => '/photos/' + p.file); wx.previewImage({ current: urls[idx], urls }); },

  // ====== tea ======
  onTeaName(e) { this.setData({ 'tea.name': e.detail.value }); this.updateTeaSummary(); },
  onTeaPrice(e) { this.setData({ 'tea.price': e.detail.value }); this.updateTeaSummary(); },
  setSugar(e) { this.setData({ 'tea.sugar': e.currentTarget.dataset.v }); this.updateTeaSummary(); },
  setIce(e) { this.setData({ 'tea.ice': e.currentTarget.dataset.v }); this.updateTeaSummary(); },
  toggleTopping(e) { const v = e.currentTarget.dataset.v; let t = this.data.tea.toppings; if (t.indexOf(v) >= 0) t = t.filter(x => x !== v); else t = t.concat(v); this.setData({ 'tea.toppings': t }); this.updateTeaSummary(); },
  updateTeaSummary() { this.setData({ 'tea.toppingStr': this.data.tea.toppings.join('、') }); },
  placeOrder() { const n = this.data.tea.name.trim(); if (!n) return wx.showToast({ title: '请填写奶茶名称', icon: 'none' }); const p = parseFloat(this.data.tea.price) || 0; const o = { time: new Date().toLocaleString('zh-CN'), name: n, price: p, sugar: this.data.tea.sugar, ice: this.data.tea.ice, toppings: this.data.tea.toppings, toppingStr: this.data.tea.toppings.join('、') }; const os = loadJSON('tea_orders', []); os.unshift(o); if (os.length > 30) os.length = 30; saveJSON('tea_orders', os); this.setData({ orderDone: true, orderMsg: '给莎点了\n' + o.name + '\n' + o.sugar + ' / ' + o.ice + (o.toppings.length ? '\n加料：' + o.toppings.join('、') : '') + (o.price ? '\n价格：¥' + o.price : '') + '\n\n快去拿奶茶吧~ 🧋', tea: { name: '', price: '', sugar: '七分糖', ice: '少冰', toppings: [], toppingStr: '' } }); this.renderTeaHistory(); },
  closeOrderDone() { this.setData({ orderDone: false }); },
  renderTeaHistory() { const os = loadJSON('tea_orders', []); os.forEach(o => { o.toppingStr = (o.toppings || []).join('、'); }); this.setData({ teaOrders: os }); },
});
