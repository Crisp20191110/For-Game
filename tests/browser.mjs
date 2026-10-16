import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import {HEROES} from '../src/heroes.js';
import {SAVE_KEY,LEGACY_KEY} from '../src/squad.js';
const base='http://127.0.0.1:3100';
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'3100'},stdio:['ignore','pipe','pipe']});
let browser;
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Server timeout')),10000);server.stdout.once('data',()=>{clearTimeout(timer);resolve();});server.once('error',reject);server.once('exit',code=>{clearTimeout(timer);reject(new Error('Server exit '+code));});});
 const engine=process.env.BROWSER==='webkit'?webkit:chromium;
 browser=await engine.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{}),...(engine===chromium?{args:['--no-sandbox']}: {})});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,acceptDownloads:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.setFixedTime(new Date('2026-10-13T12:00:00+08:00'));
 // Force base R pulls to verify visible SR and SSR guarantees via actual interactions.
 await page.addInitScript(()=>{Math.random=()=>.99;});
 const nav=tab=>page.locator(`.bottom-nav [data-tab="${tab}"]`).click();
 const saved=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
 async function finish(){await page.locator('[data-action="skip"]').waitFor();assert.equal(await page.locator('.battle-unit').count(),10);await page.locator('[data-action="skip"]').click();await page.locator('#modal [data-action="close"]').waitFor();const result=await page.locator('#modal-body').textContent();await page.locator('#modal [data-action="close"]').click();return result;}
 await page.goto(base);await page.locator('[data-draw="10"]').waitFor();assert.equal(await page.title(),'一叶问仙 · 万仙图录');
 await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/v5-summon.png',fullPage:true});
 assert.equal(await page.locator('#fruit').textContent(),'∞');
 for(let i=0;i<5;i++){
  await page.locator('.summon-buttons [data-draw="10"]').click();await page.locator('.draw-card').first().waitFor();assert.equal(await page.locator('.draw-card').count(),10);await page.locator('[data-action="reveal-all"]').click();
  if(i===4)assert.equal(await page.locator('.draw-card.rarity-SSR').count(),1);
  await page.locator('#modal [data-action="close"]').click();
 }
 assert.equal((await saved()).draws,50);assert.equal((await saved()).pity,0);assert.ok((await saved()).roster.shennong);
 await nav('heroes');assert.equal(await page.locator('.hero-card').count(),72);
 await page.locator('#role-filter').selectOption('healer');assert.equal(await page.locator('.hero-card').count(),HEROES.filter(h=>h.role==='healer').length);
 await page.locator('[data-hero="shennong"]').click();await page.locator('[data-train="shennong"]').click();assert.equal((await saved()).roster.shennong.level,20);await page.locator('#modal [data-action="close"]').click();
 await page.locator('#role-filter').selectOption('all');await page.locator('[data-hero="zao_shen"]').click();await page.locator('[data-ascend="zao_shen"]').click();assert.equal((await saved()).roster.zao_shen.star,1);await page.locator('#modal [data-action="close"]').click();
 await page.screenshot({path:'test-results/v5-heroes.png',fullPage:true});
 await nav('team');assert.equal(await page.locator('.formation-slot').count(),5);
 await page.locator('[data-slot="2"]').click();await page.locator('[data-pick="shennong"]').click();assert.equal((await saved()).team[2],'shennong');
 await page.locator('[data-slot="0"]').click();await page.locator('[data-pick="ling"]').click();assert.equal((await saved()).team[0],'ling');assert.equal((await saved()).team[3],'shi');
 await page.locator('[data-slot="0"]').click();await page.locator('[data-pick="shi"]').click();
 await page.locator('[data-action="train-team"]').click();const trained=await saved();assert.ok(trained.team.every(id=>trained.roster[id].level===20));
 await page.screenshot({path:'test-results/v5-team.png',fullPage:true});
 await nav('arena');assert.equal(await page.locator('.squad-rank').count(),9);assert.equal(await page.locator('[data-preview]').count(),8);
 const old=(await saved()).arena;await page.reload();await nav('arena');assert.deepEqual((await saved()).arena,old);
 await page.locator('[data-preview="bamboo"]').click();await page.locator('[data-duel="bamboo"]').click();
 await page.locator('[data-action="skip"]').waitFor();await page.screenshot({path:'test-results/v5-battle.png',fullPage:true});
 assert.match(await finish(),/此战告捷/);assert.equal((await saved()).arena.matches,1);assert.ok((await saved()).arena.rating>1000);
 await page.screenshot({path:'test-results/v5-arena.png',fullPage:true});
 await nav('journey');await page.locator('[data-battle="adventure"]').click();assert.match(await finish(),/此战告捷/);assert.equal((await saved()).stage,2);
 await page.locator('[data-battle="tower"]').click();assert.match(await finish(),/此战告捷/);assert.equal((await saved()).weekly.tower,1);
 await page.locator('[data-claim-kind="daily"][data-claim="login"]').click();assert.equal(await page.locator('[data-claim="login"]').isDisabled(),true);
 await page.locator('[data-claim-kind="chapter"][data-claim="summon"]').click();assert.equal(await page.locator('[data-claim="summon"]').isDisabled(),true);
 const progress=await saved();await page.locator('#settings').click();const download=page.waitForEvent('download');await page.locator('[data-action="export"]').click();await(await download).saveAs('test-results/v5-backup.json');
 await page.locator('[data-action="reset-confirm"]').click();await page.locator('[data-action="reset"]').click();assert.equal((await saved()).draws,0);
 await page.locator('#settings').click();await page.locator('#import-file').setInputFiles('test-results/v5-backup.json');await page.locator('#confirm-import').click();assert.deepEqual((await saved()).roster,progress.roster);assert.deepEqual((await saved()).team,progress.team);assert.equal((await saved()).pity,progress.pity);
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();
 await page.locator('[data-draw="1"]').click();await page.locator('#modal [data-action="close"]').click();await nav('arena');await page.locator('[data-preview="bamboo"]').click();await page.locator('[data-duel="bamboo"]').click();assert.match(await finish(),/积分/);await context.setOffline(false);
 await nav('journey');await page.clock.setFixedTime(new Date('2026-10-14T00:00:01+08:00'));await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).daily.claimed.length===0,SAVE_KEY);assert.equal(await page.locator('[data-claim="login"]').isEnabled(),true);
 await page.clock.setFixedTime(new Date('2026-10-19T00:00:01+08:00'));await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).arena.matches===0,SAVE_KEY);assert.equal((await saved()).weekly.tower,0);
 for(const width of [320,375,390,430,768,1280]){await page.setViewportSize({width,height:844});for(const tab of ['summon','heroes','team','arena','journey','estate']){await nav(tab);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${tab} overflow ${width}`);}}
 await nav('summon');await page.screenshot({path:'test-results/v5-desktop.png',fullPage:true});
 const legacyContext=await browser.newContext(),legacyPage=await legacyContext.newPage();const legacy={version:2,realm:7,stage:20};
 await legacyContext.addInitScript(({key,legacy})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(legacy));},{key:LEGACY_KEY,legacy});
 await legacyPage.goto(base);await legacyPage.locator('[data-draw="10"]').waitFor();
 assert.equal(await legacyPage.evaluate(key=>JSON.parse(localStorage.getItem(key)).roster.qing.level,SAVE_KEY),8);assert.equal(await legacyPage.evaluate(key=>JSON.parse(localStorage.getItem(key)).realm,LEGACY_KEY),7);
 const other=await legacyContext.newPage();await other.goto(base);await other.locator('[data-draw="1"]').click();await legacyPage.locator('.conflict-banner').waitFor();const shared=await other.evaluate(key=>localStorage.getItem(key),SAVE_KEY);await legacyPage.locator('[data-draw="1"]').click();assert.equal(await other.evaluate(key=>localStorage.getItem(key),SAVE_KEY),shared);await legacyContext.close();
 const updateContext=await browser.newContext(),up=await updateContext.newPage();const oldWorker="const CACHE='one-leaf-update-fixture';self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.add('/'))));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>e.respondWith(fetch(e.request)));";
 await updateContext.route('**/sw.js',route=>route.fulfill({contentType:'text/javascript',body:oldWorker}));await up.goto(base);await up.evaluate(()=>navigator.serviceWorker.ready);await up.waitForFunction(()=>navigator.serviceWorker.controller);await up.locator('[data-draw="1"]').click();await up.locator('#modal [data-action="close"]').click();await updateContext.unroute('**/sw.js');await up.evaluate(async()=>(await navigator.serviceWorker.getRegistration()).update());await up.waitForFunction(async()=>Boolean((await navigator.serviceWorker.getRegistration()).waiting));await up.locator('#settings').click();await up.locator('[data-action="update"]').click().catch(async e=>{console.log('UPDATE FAILURE',await up.locator('#modal-body').textContent(),await up.locator('#toast').textContent(),await up.evaluate(async()=>({waiting:!!(await navigator.serviceWorker.getRegistration()).waiting,conflict:!!document.querySelector('.conflict-banner')})));throw e;});await up.waitForFunction(async()=>!(await caches.keys()).includes('one-leaf-update-fixture'));await up.locator('[data-draw="1"]').waitFor();assert.equal(await up.evaluate(key=>JSON.parse(localStorage.getItem(key)).draws,SAVE_KEY),1);await updateContext.setOffline(true);await up.reload();await up.locator('[data-draw="1"]').click();assert.equal(await up.evaluate(key=>JSON.parse(localStorage.getItem(key)).draws,SAVE_KEY),2);await updateContext.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: 50 pulls and SSR pity, hero filtering/training/awakening, five-slot replacement and swaps, 5v5 PK, adventure/tower, rewards, saves, offline draw/PK, date/season reset, legacy migration, multi-tab guard, worker upgrade, six viewports, no page errors.');
}finally{await browser?.close();server.kill();}
