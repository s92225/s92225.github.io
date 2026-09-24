import { COLLECTIBLE_CATALOG } from './object-catalog.js';

export const COLLECTIBLES = COLLECTIBLE_CATALOG;
const LEGACY_PRODUCT_IDS=['duo','charm'];
const KEY = 'candy-jelly-player-v1';
const LEGACY_KEY = `candy-jelly-${['m','v','p'].join('')}-v1`;
export const BOOSTERS = {
  extra:{name:'額外夾取',cost:15,description:'今關即時加 1 夾。'},
  magnet:{name:'黏力夾',cost:30,description:'下一夾接觸物件後會黏住，去到出口先放開。'},
  reset:{name:'重設擺位',cost:20,description:'物件回到今關起始位置。'},
  continue:{name:'續關 +3 夾',cost:35,description:'失敗後保留場面，再加 3 夾。'},
};
export const freshState = () => ({ version:3, guest:false, tutorialSeen:false,
  collection:Object.fromEntries(Object.keys(COLLECTIBLES).map(id=>[id,0])), rewarded:[],
  attempts:0, cart:{}, orders:[], settings:{sound:false,reducedMotion:false}, game:{difficulty:'normal',mode:'physics',chance:50},
  coins:9000, progress:{unlocked:1,stars:{},best:{},criteria:{}}, boosterStock:{extra:2,magnet:2,reset:2}, boosterUses:{extra:0,magnet:0,reset:0,continue:0} });
const int = (v, max=100000) => Number.isSafeInteger(v) && v>=0 ? Math.min(v,max) : 0;
// Lab preferences never silently change the player machine's rules.
export const getGameConfig = (state,testing=false) => testing ? {...state.game} : {difficulty:'normal',mode:'physics',chance:50};
export function normalize(data) {
  const out=freshState();
  if(!data || ![1,2,3].includes(data.version)) return out;
  out.guest = data.guest===true;
  out.tutorialSeen = data.tutorialSeen===true;
  for(const id of Object.keys(COLLECTIBLES)) out.collection[id]=int(data.collection?.[id])>0?1:0;
  out.rewarded=Array.isArray(data.rewarded) ? data.rewarded.filter(x=>typeof x==='string').slice(-2000) : [];
  out.attempts=int(data.attempts);
  for(const id of LEGACY_PRODUCT_IDS)if(data.cart?.[id])out.cart[id]=int(data.cart[id],9);
  out.orders=Array.isArray(data.orders)?data.orders.filter(o=>o&&typeof o.id==='string').slice(0,100):[];
  out.settings.sound=data.settings?.sound===true;
  out.settings.reducedMotion=data.settings?.reducedMotion===true;
  if(['easy','normal','hard'].includes(data.game?.difficulty))out.game.difficulty=data.game.difficulty;
  if(['physics','chance'].includes(data.game?.mode))out.game.mode=data.game.mode;
  if(Number.isFinite(data.game?.chance))out.game.chance=Math.max(0,Math.min(100,Math.round(data.game.chance)));
  out.coins=int(data.coins,999999);
  if(data.coins===undefined)out.coins=data.version===1?9000:out.coins;
  if(data.version===1)out.coins=Math.max(9000,out.coins);
  out.progress.unlocked=Math.max(1,Math.min(30,int(data.progress?.unlocked)||1));
  for(const [id,stars] of Object.entries(data.progress?.stars||{})){
    const value=Math.max(0,Math.min(3,int(stars,3)));if(!/^(?:[1-9]|[12][0-9]|30)$/.test(id))continue;
    const saved=data.progress?.criteria?.[id],criteria=saved&&typeof saved==='object'
      ? {efficient:saved.efficient===true,timely:saved.timely===true,noBoosters:saved.noBoosters===true}
      : {efficient:value>=1,timely:value>=2,noBoosters:value>=3};
    out.progress.criteria[id]=criteria;out.progress.stars[id]=Object.values(criteria).filter(Boolean).length;
  }
  for(const [id,best] of Object.entries(data.progress?.best||{}))if(/^(?:[1-9]|[12][0-9]|30)$/.test(id))out.progress.best[id]=int(best,99);
  for(const id of ['extra','magnet','reset'])if(data.boosterStock?.[id]!==undefined)out.boosterStock[id]=int(data.boosterStock[id],99);
  for(const id of Object.keys(BOOSTERS))out.boosterUses[id]=int(data.boosterUses?.[id],9999);
  return out;
}
export function reward(state, roundId, kind) {
  if(!COLLECTIBLES[kind] || typeof roundId!=='string' || state.rewarded.includes(roundId)) return false;
  state.collection[kind]=1;
  if(kind==='candy')state.coins+=5;
  state.rewarded.push(roundId);
  return true;
}
export function loadState(storage) {
  try { const raw=storage.getItem(KEY) ?? storage.getItem(LEGACY_KEY); return {state:normalize(raw ? JSON.parse(raw) : null), available:true}; }
  catch { return {state:freshState(),available:false}; }
}
export function saveState(storage,state) {
  try { storage.setItem(KEY,JSON.stringify(state)); return true; }
  catch { return false; }
}

export function spendCoins(state, booster) {
  const item=BOOSTERS[booster];
  if(!item || !Number.isFinite(item.cost) || state.coins<item.cost)return false;
  state.coins-=item.cost;
  if(booster==='continue')state.boosterUses.continue=(state.boosterUses.continue||0)+1;
  else if(['extra','magnet','reset'].includes(booster))state.boosterStock[booster]=Math.min(99,(state.boosterStock[booster]||0)+1);
  else return false;
  return true;
}

export function consumeBooster(state, booster) {
  if(!['extra','magnet','reset'].includes(booster) || !state.boosterStock || state.boosterStock[booster]<=0)return false;
  state.boosterStock[booster]--;state.boosterUses[booster]=(state.boosterUses[booster]||0)+1;return true;
}

export function redeemAdBooster(state, booster) {
  if(!['extra','magnet','reset'].includes(booster))return false;
  state.boosterStock??={extra:0,magnet:0,reset:0};
  state.boosterStock[booster]=Math.min(99,(state.boosterStock[booster]||0)+1);return true;
}

export function completeLevel(state, levelId, starsOrCriteria, remaining, rewardCoins) {
  const id=String(levelId),criteria=typeof starsOrCriteria==='object'&&starsOrCriteria
    ? {efficient:starsOrCriteria.efficient===true,timely:starsOrCriteria.timely===true,noBoosters:starsOrCriteria.noBoosters===true}
    : {efficient:Number(starsOrCriteria)>=1,timely:Number(starsOrCriteria)>=2,noBoosters:Number(starsOrCriteria)>=3};
  const firstClear=!Object.hasOwn(state.progress.stars,id);
  state.progress.criteria??={};const previous=state.progress.criteria[id]||{};
  state.progress.criteria[id]={efficient:Boolean(previous.efficient||criteria.efficient),timely:Boolean(previous.timely||criteria.timely),noBoosters:Boolean(previous.noBoosters||criteria.noBoosters)};
  state.progress.stars[id]=Object.values(state.progress.criteria[id]).filter(Boolean).length;
  state.progress.best[id]=Math.max(state.progress.best[id]||0,Math.max(0,Math.floor(remaining)));
  state.progress.unlocked=Math.max(state.progress.unlocked,Math.min(30,Number(levelId)+1));
  if(firstClear)state.coins+=Math.max(0,Math.floor(rewardCoins||0));
  return {firstClear,coins:firstClear?Math.max(0,Math.floor(rewardCoins||0)):0,stars:state.progress.stars[id],criteria:state.progress.criteria[id]};
}
