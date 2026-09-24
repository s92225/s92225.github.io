const prize = (kind, x, z, options={}) => ({ kind, x, z, yaw:0, ...options });

// Every stage is plain data so later releases can add hundreds of stages
// without duplicating gameplay code.
const CORE_LEVELS = [
  {
    id:1, name:'第一口軟糖', area:'蜜桃街', difficulty:'easy', grabs:4,
    objective:'夾走 1 個桃桃熊盒', targetKinds:['bear'], targetCount:1, reward:20,
    note:'大目標、近出口，先熟習落夾。',
    objects:[prize('bear',-.72,-.78),prize('penguin',.72,-.55,{yaw:-.18})],
  },
  {
    id:2, name:'細粒糖雨', area:'蜜桃街', difficulty:'easy', grabs:5,
    objective:'夾走 1 粒星星糖', targetKinds:['candy'], targetCount:1, reward:20,
    note:'放大糖粒，先練習對準中心。',
    objects:[prize('candy',-.62,-.75),prize('penguin',.25,-.58),prize('wand',1.05,.28,{yaw:.65}),prize('bear',.78,.92,{yaw:.2})],
  },
  {
    id:3, name:'大盒搬運', area:'雲呢拿廣場', difficulty:'normal', grabs:4,
    objective:'把 1 個巨型禮盒送入出口', targetKinds:['bigbox'], targetCount:1, reward:25,
    note:'大盒較重，夾中重心先抬得穩。',
    objects:[prize('bigbox',.15,-.42,{yaw:.18,mass:.58,grip:1}),prize('candy',1.32,.55),prize('penguin',-.52,.82,{yaw:-.22})],
  },
  {
    id:4, name:'手機平衡', area:'雲呢拿廣場', difficulty:'normal', grabs:4,
    objective:'夾走 1 部手提電話', targetKinds:['phone'], targetCount:1, reward:25,
    note:'薄身電話要對準短邊中央。',
    objects:[prize('phone',.28,-.28,{yaw:.72}),prize('candy',-.58,-.3),prize('bear',1.15,.7,{yaw:-.2}),prize('candy',-.48,.88)],
  },
  {
    id:5, name:'紙巾補給', area:'薄荷碼頭', difficulty:'normal', grabs:5,
    objective:'夾走 2 包紙巾', targetKinds:['tissue'], targetCount:2, reward:30,
    note:'紙巾包扁身輕巧，夾住中間最穩。',
    objects:[prize('tissue',-.85,-.80,{yaw:.38,mass:.105,grip:1.62,holdAssist:true}),prize('tissue',.70,-.15,{yaw:-.35,mass:.105,grip:1.62,holdAssist:true}),prize('candy',1.25,.90),prize('penguin',-.55,.90)],
  },
  {
    id:6, name:'水樽雙雙', area:'薄荷碼頭', difficulty:'hard', grabs:5,
    objective:'夾走 2 支水樽', targetKinds:['bottle'], targetCount:2, reward:35,
    note:'高身水樽要對準樽身，避免只掂到樽蓋。',
    objects:[prize('bottle',.88,-.85,{yaw:.15}),prize('bottle',1.18,.55,{yaw:-.25}),prize('bear',-.15,.38),prize('candy',-.82,-.36),prize('wand',.1,1.05,{yaw:1.1})],
  },
  {
    id:7, name:'滑鼠窄位', area:'星光塔', difficulty:'hard', grabs:5,
    objective:'夾走 2 個電腦滑鼠', targetKinds:['mouse'], targetCount:2, reward:40,
    note:'長身滑鼠已留出夾位，對準兩側弧面。',
    objects:[prize('mouse',.15,-.50),prize('mouse',1.70,-1.45),prize('candy',0,1.30),prize('bigbox',-1.20,-.90,{yaw:.22}),prize('wand',.90,.80,{yaw:.9}),prize('jelly',1.80,1.50)],
  },
  {
    id:8, name:'日常大挑戰', area:'星光塔', difficulty:'hard', grabs:6,
    objective:'夾走 4 件日用品', targetKinds:['tissue','phone','mouse','bottle'], targetCount:4, reward:50,
    note:'四種日用品、四種重心，全部送入出口。',
    objects:[prize('tissue',.18,-.52,{yaw:.12}),prize('phone',1.02,.05,{yaw:.85}),prize('mouse',-.82,.42,{yaw:-.4}),prize('bottle',1.25,.9),prize('candy',-.18,.82),prize('penguin',-.98,-.72,{yaw:.18})],
  },
];

const DAILY_STAGES = [
  ['mug','咖啡暖場','彩虹商店街'],
  ['remote','遙控尋寶','彩虹商店街'],
  ['keys','鎖匙圈圈','彩虹商店街'],
  ['glasses','眼鏡對焦','彩虹商店街'],
  ['notebook','筆記簿頁','棉花糖書室'],
  ['pen','原子筆直線','棉花糖書室'],
  ['wallet','銀包守護','棉花糖書室'],
  ['comb','梳齒小徑','棉花糖書室'],
  ['earbuds','耳機盒節拍','汽水音樂台'],
  ['umbrella','縮骨遮雨','汽水音樂台'],
  ['soap','泡泡番梘','汽水音樂台'],
  ['toothpaste','牙膏補給','汽水音樂台'],
  ['camera','相機快門','啫喱旅行社'],
  ['watch','手錶準時','啫喱旅行社'],
  ['shoe','波鞋起步','啫喱旅行社'],
  ['cap','太陽帽飛行','啫喱旅行社'],
  ['lunchbox','飯盒午餐','星糖校園'],
  ['charger','充電器接力','星糖校園'],
  ['flashlight','電筒照路','星糖校園'],
  ['toycar','玩具車入站','星糖校園'],
  ['spoon','湯匙平衡','月光餐廳'],
  ['tape','膠紙座終點','月光餐廳'],
];
const DISTRACTORS=['bear','penguin','candy','wand','jelly','tissue','phone','mouse','bottle'];
const DAILY_LEVELS=DAILY_STAGES.map(([kind,name,area],index)=>{
  const id=index+9,targetCount=[14,20,26,30].includes(id)?2:1,difficulty=id<15?'normal':'hard',grabs=targetCount+3;
  const targets=targetCount===2
    ? [prize(kind,-.62,-.66,{yaw:.22}),prize(kind,.76,.04,{yaw:-.34})]
    : [prize(kind,.06,-.48,{yaw:(index%5-2)*.14})];
  const a=DISTRACTORS[index%DISTRACTORS.length],b=DISTRACTORS[(index+4)%DISTRACTORS.length],c=DISTRACTORS[(index+7)%DISTRACTORS.length];
  return {
    id,name,area,difficulty,grabs,targetKinds:[kind],targetCount,reward:30+Math.floor(index/4)*5,
    objective:`夾走 ${targetCount} 件${kind==='keys'?'鎖匙':kind==='glasses'?'眼鏡':'指定日用品'}`,
    note:'認清專屬外形，對準物件較厚嘅位置先落夾。',
    objects:[...targets,prize(a,-1.02,.58,{yaw:-.2}),prize(b,.72,.88,{yaw:.34}),prize(c,1.34,-.82,{yaw:-.38})],
  };
});

export const LEVELS=[...CORE_LEVELS,...DAILY_LEVELS];

export const getLevel = id => LEVELS.find(level => level.id === Number(id)) || LEVELS[0];
export const isTarget = (level, kind) => level.targetKinds.includes(kind);
