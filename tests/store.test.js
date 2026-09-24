import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,normalize,reward,saveState,loadState,getGameConfig,spendCoins,consumeBooster,redeemAdBooster,completeLevel,BOOSTERS,COLLECTIBLES} from '../src/store.js';
import {LEVELS,getLevel,isTarget} from '../src/levels.js';

test('one digital reward per claim key and unknown prize kinds are rejected',()=>{
  const state=freshState();
  assert.equal(reward(state,'a','bear'),true);
  assert.equal(reward(state,'a','penguin'),false);
  assert.equal(reward(state,'b','candy'),true);
  assert.equal(reward(state,'c','unknown'),false);
  assert.equal(state.collection.bear,1);assert.equal(state.collection.candy,1);
  assert.equal(state.coins,9005,'yellow candy awards five game coins once');
});

test('separate prize claim keys from one grab can each be rewarded',()=>{
  const state=freshState();
  assert.equal(reward(state,'round:prize-a','tissue'),true);
  assert.equal(reward(state,'round:prize-b','candy'),true);
  assert.equal(reward(state,'round:prize-a','tissue'),false);
  assert.equal(state.collection.tissue,1);assert.equal(state.collection.candy,1);
});

test('collection, level progress, coins and settings survive reload',()=>{
  let raw;const storage={setItem:(_,v)=>raw=v,getItem:()=>raw};const state=freshState();
  state.guest=true;state.settings={sound:true,reducedMotion:true};state.tutorialSeen=true;
  reward(state,'persist','jelly');consumeBooster(state,'extra');completeLevel(state,1,3,3,20);
  assert.ok(saveState(storage,state));assert.deepEqual(loadState(storage).state,state);
  assert.equal(reward(loadState(storage).state,'persist','jelly'),false);
});

test('v0.3 saves migrate collection counts into unique Pokédex registrations',()=>{
  const old={version:1,guest:true,tutorialSeen:true,collection:{bear:3,penguin:1},rewarded:['old'],attempts:7,
    cart:{duo:2},orders:[{id:'legacy-order'}],settings:{sound:false,reducedMotion:false},game:{difficulty:'hard',mode:'chance',chance:35}};
  const upgraded=normalize(old);
  assert.equal(upgraded.collection.bear,1);assert.equal(upgraded.collection.penguin,1);assert.equal(upgraded.collection.candy,0);
  assert.equal(upgraded.coins,9000);assert.equal(upgraded.version,3);assert.deepEqual(upgraded.progress,{unlocked:1,stars:{},best:{},criteria:{}});
  assert.deepEqual(upgraded.cart,{duo:2});assert.deepEqual(upgraded.orders,[{id:'legacy-order'}]);
});

test('malformed or inaccessible storage returns a complete usable level state',()=>{
  assert.deepEqual(normalize({version:99}),freshState());
  const normalized=normalize({version:2,coins:-5,progress:{unlocked:99,stars:{1:9,12:3}},collection:{bear:-3}});
  assert.equal(normalized.coins,0);assert.equal(normalized.progress.unlocked,30);assert.deepEqual(normalized.progress.stars,{1:3,12:3});
  assert.deepEqual(Object.keys(normalized.collection),Object.keys(COLLECTIBLES));
  assert.equal(loadState({getItem:()=>'{broken'}).available,false);
  assert.equal(saveState({setItem:()=>{throw new Error('quota');}},freshState()),false);
});

test('lab configuration never leaks into the player physics rules',()=>{
  const state=freshState();state.game={difficulty:'hard',mode:'chance',chance:0};
  assert.deepEqual(getGameConfig(state),{difficulty:'normal',mode:'physics',chance:50});
  assert.deepEqual(getGameConfig(state,true),state.game);
});

test('coins can buy continuation or add one booster to inventory',()=>{
  const state=freshState(),start=state.coins;
  assert.equal(spendCoins(state,'continue'),true);assert.equal(state.coins,start-BOOSTERS.continue.cost);
  assert.deepEqual(state.boosterUses,{extra:0,magnet:0,reset:0,continue:1});
  const stock=state.boosterStock.magnet;assert.equal(spendCoins(state,'magnet'),true);assert.equal(state.boosterStock.magnet,stock+1);
  assert.equal(state.coins,start-BOOSTERS.continue.cost-BOOSTERS.magnet.cost);assert.equal(state.boosterUses.magnet,0);
  state.coins=0;assert.equal(spendCoins(state,'continue'),false);assert.equal(spendCoins(state,'unknown'),false);
});

test('booster inventory is consumed on use and replenished by rewarded ads',()=>{
  const state=freshState(),before=state.coins;
  assert.equal(state.boosterStock.magnet,2);assert.equal(consumeBooster(state,'magnet'),true);
  assert.equal(state.boosterStock.magnet,1);assert.equal(state.boosterUses.magnet,1);
  assert.equal(redeemAdBooster(state,'magnet'),true);assert.equal(state.coins,before);assert.equal(state.boosterStock.magnet,2);assert.equal(state.boosterUses.magnet,1);
  state.boosterStock.magnet=0;assert.equal(consumeBooster(state,'magnet'),false);
  assert.equal(redeemAdBooster(state,'continue'),false);assert.equal(redeemAdBooster(state,'unknown'),false);
});

test('completion unlocks sequentially, keeps best result, and only grants first-clear coins once',()=>{
  const state=freshState();
  const first=completeLevel(state,1,2,1,20);
  assert.deepEqual(first,{firstClear:true,coins:20,stars:2,criteria:{efficient:true,timely:true,noBoosters:false}});assert.equal(state.progress.unlocked,2);assert.equal(state.coins,9020);
  const replay=completeLevel(state,1,3,3,20);
  assert.deepEqual(replay,{firstClear:false,coins:0,stars:3,criteria:{efficient:true,timely:true,noBoosters:true}});assert.equal(state.coins,9020);assert.equal(state.progress.best[1],3);
  completeLevel(state,30,3,5,50);assert.equal(state.progress.unlocked,30);
});

test('thirty stages are data-driven, ordered, and cover every everyday target',()=>{
  assert.equal(LEVELS.length,30);assert.deepEqual(LEVELS.map(l=>l.id),Array.from({length:30},(_,i)=>i+1));
  const kinds=new Set(LEVELS.flatMap(l=>l.objects.map(o=>o.kind)));
  for(const kind of Object.keys(COLLECTIBLES))assert.ok(kinds.has(kind),`${kind} appears in the journey`);
  for(const level of LEVELS){assert.ok(level.grabs>=level.targetCount);assert.equal(level.objects.filter(o=>isTarget(level,o.kind)).length,level.targetCount,`level ${level.id} target count matches its board`);}
  assert.equal(getLevel(999).id,1);
});

test('three star conditions are recorded independently and can be completed on replay',()=>{
  const state=freshState();
  const first=completeLevel(state,4,{efficient:true,timely:false,noBoosters:true},1,25);
  assert.equal(first.stars,2);assert.deepEqual(first.criteria,{efficient:true,timely:false,noBoosters:true});
  const replay=completeLevel(state,4,{efficient:false,timely:true,noBoosters:false},0,25);
  assert.equal(replay.stars,3);assert.deepEqual(state.progress.criteria[4],{efficient:true,timely:true,noBoosters:true});
});

test('a zero-star clear still grants first-clear coins only once',()=>{
  const state=freshState(),none={efficient:false,timely:false,noBoosters:false};
  assert.equal(completeLevel(state,2,none,0,20).coins,20);
  assert.equal(completeLevel(state,2,none,0,20).coins,0);
  const reloaded=normalize(state);assert.ok(Object.hasOwn(reloaded.progress.stars,'2'));assert.equal(reloaded.progress.stars[2],0);
});
