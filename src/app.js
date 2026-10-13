import { SAVE_KEY, SLOTS, SLOT_NAMES, QUALITIES, STYLES, TITLES, fresh, stats, syncTime, realmName, realmGate, upgradeLimit, chop, batchPray, resolveDrop, breakthrough, upgrade, enemy, battle, rewardBattle, duel, settleDuel, leaderboard, tier, eventBattle, settleEvent, QUESTS, DAILIES, WEEKLIES, claim, claimDaily, claimWeekly, nextGoal, periods, restore } from './game.js';

const $ = selector => document.querySelector(selector);
const icons = { weapon: '⚔', robe: '衣', charm: '◈' };
const fmt = value => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(value);
let state = fresh(), tab = 'home', fighting = false, busy = false, skipBattle = false, storageWarning = '', toastTimer, pendingWorker;
try {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try {
      state = restore(raw);
      if (JSON.parse(raw).version === 1) localStorage.setItem(SAVE_KEY + '-v1-backup', raw);
    } catch {
      localStorage.setItem(SAVE_KEY + '-recovery', raw);
      storageWarning = '旧存档无法读取，已保留恢复副本；请在手记中导出原始存档。';
    }
  }
} catch { storageWarning = '浏览器存储不可用，请及时导出存档备份。'; }
let externalChange = false;
function save() {
  if (externalChange) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
  catch { if (!storageWarning) { storageWarning = '无法自动保存，请在手记中导出备份'; toast(storageWarning); } }
}
function toast(message) {
  $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500);
}
function openModal(html) { $('#modal-body').innerHTML = html; if (!$('#modal').open) $('#modal').showModal(); }
function closeModal() { if (!fighting) $('#modal').close(); }
function header() {
  $('#realm').textContent = realmName(state.realm); $('#coins').textContent = '∞'; $('#fruit').textContent = '∞'; $('#power').textContent = fmt(stats(state).power);
  $('#regen').textContent = '全部资源无限';
  $('.identity p').textContent = state.titles.length ? TITLES[state.titles.at(-1)] : '道心自在 · 万物皆有缘';
  $('#quest-dot').hidden = !DAILIES.some(q => !state.daily.claimed.includes(q.id) && (!q.key || state.daily[q.key] >= q.target)) && !WEEKLIES.some(q => !state.weekly.claimed.includes(q.id) && state.weekly[q.key] >= q.target);
}
function countdown(until) {
  const seconds = Math.max(0, Math.floor((until - Date.now()) / 1000));
  return seconds >= 86400 ? `${Math.floor(seconds / 86400)}天 ${Math.floor(seconds % 86400 / 3600)}时` : `${Math.floor(seconds / 3600)}时 ${Math.floor(seconds % 3600 / 60)}分 ${seconds % 60}秒`;
}
function updateClocks() {
  const p = periods(Math.max(Date.now(), state.lastSeen));
  document.querySelectorAll('[data-countdown]').forEach(el => { el.textContent = countdown(el.dataset.countdown === 'day' ? p.nextDay : p.nextWeek); });
}
function render() {
  header();
  document.querySelectorAll('[data-tab]').forEach(b => { b.classList.toggle('active', b.dataset.tab === tab); b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'); });
  $('#page').innerHTML = ({ home: homePage, adventure: adventurePage, character: characterPage, arena: arenaPage, events: eventsPage }[tab])();
  updateClocks();
}
function homePage() {
  const st = stats(state), goal = nextGoal(state);
  return `<section class="scene"><img src="/public/landscape.svg" alt="青山云雾之间的灵树与修行者"><div class="scene-label">青岚洞天<small>一树一世界 · 一叶一修行</small></div><span class="scene-tag">灵树 · ${state.tree} 阶</span><div class="scene-verse">且听风吟，静待花开</div><button class="tree-hit" data-action="pray" aria-label="点击灵树祈愿"></button><div class="scene-footer">资源无限，道途有涯亦无涯</div></section>
  <section class="cultivate"><div class="section-title"><span>${realmName(state.realm)} <small> / 修为 ∞</small></span><button class="text-button" data-action="breakthrough">突破境界 ↗</button></div><div class="xp-row"><div class="xp-track"><div class="xp-fill" style="width:${Math.min(100, state.stage / realmGate(state) * 100)}%"></div></div><span class="xp-value">${state.stage >= realmGate(state) ? '可突破下一境' : `通关 ${realmGate(state) - 1} 关后突破`}</span></div></section>
  <section class="pray-area"><button class="primary" data-action="pray">${state.pending ? '查看未收取灵物' : '灵 树 祈 愿'}<small>❧ 无限灵露</small></button><button class="secondary batch-button" data-action="batch">十连祈愿 · 自动装备战力更高的灵物</button><p class="pray-hint">无充值 · 无体力等待 · 五种品质灵物自由收集</p></section>
  <div class="quick-stats"><span>⚔ 攻击 <b>${fmt(st.atk)}</b></span><span>♡ 气血 <b>${fmt(st.hp)}</b></span><span>◇ 防御 <b>${fmt(st.def)}</b></span></div>
  <button class="goal-banner" data-tab="character"><span><b>${goal.name}</b><small>${goal.detail} · ${goal.current}/${goal.target}</small></span><span>${goal.ready ? '可领奖' : '前往'} →</span></button>`;
}
function adventurePage() {
  const foe = enemy(state.stage);
  return `<section class="page-content"><h2 class="page-heading">山海历练</h2><p class="page-sub">越过一重山，便遇一重天。<br>通关解锁境界，挑战次数无限，失败无损失。</p>
  <div class="arena"><div class="arena-head">青岚山境 · 第 ${state.stage} 关 ${foe.boss ? '· 山君试炼' : ''}</div><div class="enemy-portrait">${foe.boss ? '虎' : ['妖', '岩', '狐', '影'][(state.stage - 1) % 5]}</div><h3>${foe.name}</h3><p class="tip">攻击 ${fmt(foe.atk)} · 气血 ${fmt(foe.hp)} · 防御 ${fmt(foe.def)}</p><p class="tip">你的流派：${STYLES[state.style].name} · 战力 ${fmt(stats(state).power)}</p></div>
  <button class="primary" data-action="battle">启程历练 <small>可加速结算</small></button>
  <div class="card"><h3>此行所得</h3><p>通关声望 +10 · 推进成长路线 · 解锁更高境界</p></div>
  <div class="card"><h3>下一步修行</h3><p>${state.stage >= realmGate(state) ? '你的历练已足够，回洞天突破下一境。' : `通关第 ${realmGate(state) - 1} 关，即可突破至${realmName(state.realm + 1)}。`}</p><button class="text-button" data-tab="character">查看成长路线 →</button></div></section>`;
}
function characterPage() {
  const st = stats(state);
  return `<section class="page-content"><h2 class="page-heading">自在修行</h2><p class="page-sub">资源没有上限，修行有自己的节奏。<br>境界 → 装备 → 流派 → 竞逐仙榜 → 重天进阶。</p>
  <div class="stat-grid"><div><strong>${fmt(st.atk)}</strong><small>攻击</small></div><div><strong>${fmt(st.hp)}</strong><small>气血</small></div><div><strong>${fmt(st.def)}</strong><small>防御</small></div></div>
  <div class="section-title"><span>修行流派</span><small>随时免费切换</small></div><div class="styles">${Object.entries(STYLES).map(([id, style]) => `<button class="style-card ${state.style === id ? 'selected' : ''}" data-style="${id}" aria-pressed="${state.style === id}"><b>${style.name}</b><small>${style.description}</small></button>`).join('')}</div>
  <div class="section-title section-gap"><span>随身灵物</span><small>图鉴 ${state.collection.length}/15</small></div>${SLOTS.map(slot => { const item = state.equipped[slot]; return `<div class="equip-row"><div class="equip-icon" style="color:${item ? QUALITIES[item.quality].color : '#86967e'}">${icons[slot]}</div><div><h3>${item ? item.name : SLOT_NAMES[slot] + ' · 尚未结缘'}</h3><p>${item ? `攻击 ${fmt(item.atk)} · 气血 ${fmt(item.hp)} · 防御 ${fmt(item.def)}` : '去灵树下，求一份机缘'}</p></div><span class="quality" style="color:${item ? QUALITIES[item.quality].color : '#86967e'}">${item ? QUALITIES[item.quality].name : '—'}</span></div>`; }).join('')}
  ${['tree', 'pet'].map(kind => `<div class="card card-row"><div><h3>${kind === 'tree' ? '♧ 洞天灵树' : '♧ 青丘灵狐'} <span class="pill">${state[kind]} ${kind === 'tree' ? '阶' : '级'}</span></h3><p>${kind === 'tree' ? '提升灵物属性；前十阶提升品质概率' : '每级攻击 +4，气血 +16'}<br>当前境界上限 ${upgradeLimit(state, kind)}</p></div><button class="secondary" data-action="${kind}" ${state[kind] >= upgradeLimit(state, kind) ? 'disabled' : ''}>${state[kind] >= upgradeLimit(state, kind) ? '本境已满' : '免费培养'}</button></div>`).join('')}
  <button class="primary" data-action="breakthrough">突破至 ${realmName(state.realm + 1)} <small>修为 ∞</small></button><p class="tip">${state.stage >= realmGate(state) ? '历练条件已达成，可以突破。' : `历练要求：通关第 ${realmGate(state) - 1} 关。`} 问道之后开启下一重天，继续提升装备等级和培养上限。</p>
  <h3 class="section-title section-gap">六章成长路线 <small>声望为成就记录，不是消耗货币</small></h3>${QUESTS.map(q => `<div class="card quest"><div><h3>${q.name}</h3><p>${q.detail} · ${Math.min(state[q.key], q.target)}/${q.target}</p><small>声望 +${q.renown}${q.title ? ' · 称号「' + TITLES[q.title] + '」' : ''}</small></div><button class="secondary" data-claim="${q.id}" ${state.claimed.includes(q.id) || state[q.key] < q.target ? 'disabled' : ''}>${state.claimed.includes(q.id) ? '已领取' : state[q.key] >= q.target ? '领取' : '修行中'}</button></div>`).join('')}
  <div class="card"><h3>道途印记 · 声望 ${fmt(state.renown)}</h3><p>声望用于记录成长，不会被消耗。称号不会增加战斗属性。</p><div class="title-list">${Object.entries(TITLES).map(([id, title]) => `<span class="pill ${state.titles.includes(id) ? 'owned' : 'locked'}">${state.titles.includes(id) ? '✦ ' : '◇ '}${title}</span>`).join('')}</div><p>图鉴全收集、论道十胜、累计签到七天、试炼塔通关和赛季三甲可解锁专属称号。</p></div></section>`;
}
function arenaPage() {
  const board = leaderboard(state), rank = board.findIndex(b => b.id === 'player') + 1;
  return `<section class="page-content"><h2 class="page-heading">九霄仙榜</h2><p class="page-sub">本地机器人联赛 · 无真人联网排名<br>每周一 00:00（北京时间）开启新赛季。</p>
  <div class="season-banner"><span>本周 · ${tier(state.arena.rating)}<b>${state.arena.rating} <small>积分</small></b></span><span>第 ${rank} 名<small>${state.arena.wins} 胜 / ${state.arena.matches} 场</small><small>结算倒计时 <span data-countdown="week"></span></small></span></div>
  <div class="ranking-list">${board.map((entry, i) => `<div class="rank-row ${entry.bot ? '' : 'self'}"><span class="rank-number">${i + 1}</span><div class="rank-person"><b>${entry.name} <span class="bot-label">${entry.bot ? '机器人' : '你'}</span></b><small>${entry.bot ? STYLES[entry.style].name + ' · ' : ''}战力 ${fmt(entry.power)}</small></div><div class="rank-score">${entry.rating}<small>积分</small></div>${entry.bot ? `<button class="secondary" data-duel="${entry.id}">挑战</button>` : '<span class="self-tag">修行中</span>'}</div>`).join('')}</div>
  <div class="card"><h3>势均力敌，也保留超越的空间</h3><p>8 位机器人有各自的流派与强弱梯度。对局开始后属性固定，不会临场改数值。每场结束后，依据你的战力与最近 8 场表现缓慢调整，连续失利时降低压力。大幅提升装备后，你仍可获得领先优势。</p><p>按对手积分计算胜负分；其他机器人也会小幅进步。刷新页面不会改变对手或排名。新赛季全部回到初始积分，保留角色成长。</p></div>
  ${state.lastSeason ? `<div class="card"><h3>上期战报</h3><p>第 ${state.lastSeason.rank} 名 · ${state.lastSeason.rating} 分 · ${state.lastSeason.matches} 场</p></div>` : ''}<p class="tip">赛季结束时，参与至少 5 场且进入前三可获得「仙榜三甲」。模拟榜单与存档都保存在本机，离线可玩。</p></section>`;
}
function eventsPage() {
  return `<section class="page-content"><h2 class="page-heading">四时仙会</h2><p class="page-sub">每日有约，每周有新的山海。<br>所有活动免费，挑战次数无限；奖励为声望与称号。</p>
  <div class="section-title"><span>每日委托</span><small><span data-countdown="day"></span> 后刷新</small></div>
  ${DAILIES.map(q => { const value = q.key ? state.daily[q.key] : 1, done = state.daily.claimed.includes(q.id); return `<div class="card quest"><div><h3>${q.name}</h3><p>${q.detail}${q.key ? ` · ${Math.min(value, q.target)}/${q.target}` : ` · 累计签到 ${state.logins} 天`}</p><small>声望 +${q.reward}</small></div><button class="secondary" data-daily="${q.id}" ${done || value < q.target ? 'disabled' : ''}>${done ? '已领取' : value >= q.target ? '领取' : '进行中'}</button></div>`; }).join('')}
  <div class="section-title section-gap"><span>每周试炼</span><small><span data-countdown="week"></span> 后刷新</small></div>
  <div class="card event-card"><span class="event-symbol">塔</span><div><h3>通天试炼塔</h3><p>十层递进挑战 · 本周已过 ${state.weekly.tower}/10 层<br>本周敌人以开周属性为基准，不随你的升级变强。</p></div><button class="primary" data-event="tower" ${state.weekly.tower >= 10 ? 'disabled' : ''}>${state.weekly.tower >= 10 ? '本周已通关' : `挑战第 ${state.weekly.tower + 1} 层`}</button></div>
  <div class="card event-card"><span class="event-symbol">灵</span><div><h3>太古木灵 · 首领讨伐</h3><p>最多 12 回合，倒下也会记录伤害。<br>本周最佳 ${state.weekly.bossBest} 分 · 已挑战 ${state.weekly.bossTries} 次</p></div><button class="primary" data-event="boss">挑战首领 <small>突破自己的纪录</small></button></div>
  ${WEEKLIES.map(q => { const done = state.weekly.claimed.includes(q.id); return `<div class="card quest"><div><h3>${q.name}</h3><p>${q.key === 'tower' ? '通关塔层' : '首领积分'} ${Math.min(state.weekly[q.key], q.target)}/${q.target}</p><small>声望 +${q.reward}${q.title ? ' · ' + TITLES[q.title] : ''}</small></div><button class="secondary" data-weekly="${q.id}" ${done || state.weekly[q.key] < q.target ? 'disabled' : ''}>${done ? '已领取' : state.weekly[q.key] >= q.target ? '领取' : '进行中'}</button></div>`; }).join('')}
  <p class="tip">活动以北京时间刷新；离线也可参与。排行榜与活动属于本地模拟，不与其他玩家同步。首领积分＝造成伤害 ÷ 本周基础气血 ×100，取最高分。</p></section>`;
}
function dropModal() {
  const item = state.pending; if (!item) return;
  const quality = QUALITIES[item.quality], old = state.equipped[item.slot];
  openModal(`<p class="eyebrow">灵树赐福 · 机缘已至</p><h2>得一件山中灵物</h2><div class="drop-icon" style="color:${quality.color}">${icons[item.slot]}</div><div class="drop-name" style="color:${quality.color}">${item.name}</div><p class="drop-meta">${quality.name} · ${SLOT_NAMES[item.slot]} · ${realmName(item.level - 1)}之物</p><div class="drop-stats">${[['atk', '攻击'], ['hp', '气血'], ['def', '防御']].map(([key, name]) => { const diff = item[key] - (old?.[key] || 0); return `<div><small>${name}</small><strong>${fmt(item[key])}</strong><em class="${diff < 0 ? 'negative' : ''}">${diff >= 0 ? '+' : ''}${fmt(diff)}</em></div>`; }).join('')}</div><p class="tip" style="text-align:center">装备会替换同部位旧物 · 所有材料无限</p><div class="modal-buttons"><button class="secondary" data-action="sell">分解灵物</button><button class="primary" data-action="equip">装备灵物</button></div>`);
}
async function pray() {
  if (busy) return;
  if (state.pending) return dropModal();
  const result = chop(state); if (result.error) return toast(result.error);
  busy = true; save(); header(); $('.scene')?.classList.add('shake');
  await new Promise(r => setTimeout(r, 250));
  busy = false; render(); dropModal();
}
async function fight(result) {
  if (result.error) return toast(result.error);
  fighting = true; skipBattle = false; save();
  const { player, foe } = result;
  openModal(`<p class="eyebrow">${result.mode === 'arena' ? '机器人论道 · 对手属性已固定' : result.mode === 'boss' ? '首领讨伐 · 十二回合试锋' : '山海交锋'}</p><h2>${foe.name}</h2><div class="fighters"><div class="fighter" id="player-fighter"><div class="fighter-icon">仙</div><strong>山中散人</strong><div class="hp-track"><div id="player-hp"></div></div><div class="hp-label" id="player-hp-label">${fmt(player.hp)} / ${fmt(player.hp)}</div></div><span class="versus">VS</span><div class="fighter enemy" id="enemy-fighter"><div class="fighter-icon">${result.mode === 'arena' ? '友' : '灵'}</div><strong>${result.mode === 'arena' ? '机器人' : '山海之灵'}</strong><div class="hp-track"><div id="enemy-hp"></div></div><div class="hp-label" id="enemy-hp-label">${fmt(foe.hp)} / ${fmt(foe.hp)}</div></div></div><div class="battle-log" id="battle-log" aria-live="polite">风起，交锋开始。</div><button class="secondary full-width" data-action="skip">加速结算</button>`);
  try {
    for (const turn of result.turns) {
      if (skipBattle) break;
      await new Promise(r => setTimeout(r, 110));
      $('#player-hp').style.width = `${turn.hp / player.hp * 100}%`;
      $('#enemy-hp').style.width = `${turn.enemyHp / foe.hp * 100}%`;
      $('#player-hp-label').textContent = `${fmt(turn.hp)} / ${fmt(player.hp)}`;
      $('#enemy-hp-label').textContent = `${fmt(turn.enemyHp)} / ${fmt(foe.hp)}`;
      $('#battle-log').textContent = `${turn.side === 'player' ? '你' : foe.name}${turn.crit ? '会心一击' : '出招'}，造成 ${fmt(turn.damage)} 点伤害`;
    }
    let outcome;
    if (result.mode === 'adventure') {
      syncTime(state); const reward = rewardBattle(state, result);
      outcome = reward?.won ? `此战告捷 · 声望 +10<br>已解锁第 ${state.stage} 关` : result.draw ? '交锋未分胜负，可调整流派再战' : '暂且归山修行 · 失败无损失';
    } else if (result.mode === 'arena') {
      const reward = settleDuel(state, result);
      outcome = !reward ? '赛季已经更新，此场不计入新赛季' : `${result.draw ? '平分秋色' : result.won ? '论道获胜' : '论道惜败'} · 积分 ${reward.delta >= 0 ? '+' : ''}${reward.delta}<br>当前 ${reward.rating} 分 · 对手已逐步调整`;
    } else {
      const reward = settleEvent(state, result);
      outcome = !reward ? '活动周期已经更新，本场不计入新周期' : result.mode === 'boss' ? `讨伐得分 ${reward.score} · ${reward.improved ? '刷新纪录' : '继续磨砺'}<br>本周最佳 ${reward.best} 分` : reward.won ? `第 ${reward.floor} 层告捷 · 声望 +25` : '试炼暂败 · 变强后可无限重试';
    }
    save(); render();
    openModal(`<p class="eyebrow">${result.mode === 'arena' ? '机器人联赛 · 公平结算' : '此行有所得'}</p><h2>${result.mode === 'boss' ? '讨伐战报' : result.won ? '此战告捷' : result.draw ? '平分秋色' : '再接再厉'}</h2><p class="result-copy">${outcome}</p><button class="primary" data-action="close">收下战报</button>`);
  } finally { fighting = false; }
}
function settings() {
  openModal(`<p class="eyebrow">一叶问仙 · v2.0 无尽仙途</p><h2>山中手记</h2><div class="settings-copy"><b>无限资源模式</b><br>灵石、灵露、修为、材料和挑战次数全部无限。境界靠历练解锁；声望、图鉴、段位与称号记录你的成长。<br><br><b>机器人与活动</b><br>本地模拟联赛，不是真人排名；属性在对局开始时固定。每日与每周活动以北京时间刷新。<br><br><b>在 iPhone 上安装</b><br>Safari 打开 HTTPS 地址 → 分享 → 添加到主屏幕。第一次加载后可离线玩。<br><br><b>保存与更新</b><br>进度保存在此浏览器。换设备或添加到主屏幕前，请导出备份；旧版存档会自动升级。更新游戏请在同一网址覆盖部署，勿清理网站数据。</div><div class="settings-buttons">${pendingWorker ? '<button class="primary" data-action="update">保存进度并更新游戏</button>' : ''}<button class="secondary" data-action="export">导出存档备份</button><button class="secondary" data-action="import">导入存档</button><button class="secondary" data-action="recover">导出旧版或异常存档原件</button><button class="secondary danger" data-action="reset-confirm">重新开始修行</button></div><button class="close" data-action="close">返回洞天</button>`);
}
function download(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
}
document.addEventListener('click', async event => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'reload') { location.reload(); return; }
  if (externalChange) return toast('另一窗口已更新存档，请重新加载此页');
  if (fighting) { if (action === 'skip') skipBattle = true; else toast('请先完成这一场交锋'); return; }
  if (busy) return;
  if (syncTime(state)) { save(); render(); toast('新一期活动已开始，进度和榜单已刷新'); return; }
  if (button.dataset.tab) { tab = button.dataset.tab; render(); window.scrollTo({ top: 0 }); return; }
  if (button.id === 'settings') return settings();
  if (button.dataset.style) { state.style = button.dataset.style; save(); render(); toast(`已切换为${STYLES[state.style].name}`); return; }
  for (const [key, claimFunction] of [['claim', claim], ['daily', claimDaily], ['weekly', claimWeekly]]) {
    if (button.dataset[key]) { if (claimFunction(state, button.dataset[key])) { save(); render(); toast('声望与成就已记入仙途'); } return; }
  }
  if (button.dataset.duel) return fight(duel(state, button.dataset.duel));
  if (button.dataset.event) return fight(eventBattle(state, button.dataset.event));
  if (action === 'pray') return pray();
  if (action === 'batch') {
    const result = batchPray(state); if (result.error) { toast(result.error); return dropModal(); }
    save(); render(); return toast(`十连完成 · ${result.upgrades} 件装备升级 · 最高${QUALITIES[result.best].name}`);
  }
  if (action === 'close') return closeModal();
  if (action === 'equip' || action === 'sell') { if (!resolveDrop(state, action === 'equip')) return; closeModal(); save(); render(); return toast(action === 'equip' ? '灵物已装备' : '灵物已分解，图鉴收集保留'); }
  if (action === 'breakthrough') { const result = breakthrough(state); if (result.error) return toast(result.error); save(); render(); return toast(`破境成功 · ${result.realm}`); }
  if (action === 'tree' || action === 'pet') { const result = upgrade(state, action); if (result.error) return toast(result.error); save(); render(); return toast(`培养成功 · ${result.level} 级，无需消耗资源`); }
  if (action === 'battle') return fight(battle(state));
  if (action === 'export') { save(); download(JSON.stringify(state, null, 2), `一叶问仙-v2-${new Date().toISOString().slice(0, 10)}.json`); return toast('已生成备份，请保存到“文件”'); }
  if (action === 'recover') {
    try { const raw = localStorage.getItem(SAVE_KEY + '-recovery') || localStorage.getItem(SAVE_KEY + '-v1-backup'); if (raw) download(raw, '一叶问仙-原始存档.json'); else toast('没有旧版或异常存档副本'); } catch { toast('浏览器不允许访问存档'); } return;
  }
  if (action === 'import') return $('#import-file').click();
  if (action === 'reset-confirm') return openModal('<h2>重入凡尘？</h2><p class="settings-copy">将清除当前成长、排行榜与活动进度，资源仍然无限。建议先导出存档。</p><div class="modal-buttons"><button class="secondary" data-action="close">保留修行</button><button class="primary" data-action="reset">确认重来</button></div>');
  if (action === 'reset') { state = fresh(); tab = 'home'; save(); closeModal(); render(); return toast('一念起，仙途再启'); }
  if (action === 'update' && pendingWorker) { save(); pendingWorker.postMessage({ type: 'SKIP_WAITING' }); }
});
$('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 200000) throw new Error();
    const imported = restore(await file.text());
    openModal(`<h2>接续这段仙缘？</h2><p class="settings-copy">境界：${realmName(imported.realm)}<br>历练：第 ${imported.stage} 关<br>赛季积分：${imported.arena.rating}<br>导入会替换当前进度，资源自动设为无限。</p><div class="modal-buttons"><button class="secondary" data-action="close">取消</button><button class="primary" id="confirm-import">确认导入</button></div>`);
    $('#confirm-import').onclick = () => { if (externalChange) return; state = imported; tab = 'home'; save(); closeModal(); render(); toast('存档已恢复，仙途继续'); };
  } catch { toast('无法读取此存档，请选择本游戏导出的 JSON 文件'); }
  finally { event.target.value = ''; }
});
$('#modal').addEventListener('cancel', event => { if (fighting || externalChange) event.preventDefault(); });
setInterval(() => {
  if (externalChange) return;
  if (!fighting && !busy && syncTime(state)) { save(); render(); }
  header(); updateClocks();
}, 1000);
document.addEventListener('visibilitychange', () => { if (!fighting && !busy && !externalChange && syncTime(state)) render(); save(); });
window.addEventListener('pagehide', save);
window.addEventListener('storage', event => {
  if (externalChange || event.key !== SAVE_KEY || event.newValue === JSON.stringify(state)) return;
  externalChange = true;
  if (fighting) skipBattle = true;
  toast('另一窗口已更新存档，请重新加载，以免覆盖进度');
  const banner = document.createElement('button'); banner.className = 'conflict-banner'; banner.dataset.action = 'reload'; banner.textContent = '另一窗口已更新存档 · 点此重新加载'; document.body.append(banner);
});
render(); save();
if (storageWarning) toast(storageWarning);
if ('serviceWorker' in navigator && window.isSecureContext) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (pendingWorker && !refreshing) { refreshing = true; location.reload(); } });
  navigator.serviceWorker.register('/sw.js').then(registration => {
    const found = () => { if (registration.waiting && navigator.serviceWorker.controller) { pendingWorker = registration.waiting; toast('新版游戏已就绪，可在手记中保存并更新'); } };
    found(); registration.addEventListener('updatefound', () => { registration.installing?.addEventListener('statechange', found); });
  }).catch(() => toast('离线缓存暂不可用，联网游玩不受影响'));
}
