// One source of truth for every prize. Gameplay, collection UI and 3D rendering
// all read the same record so a renamed target cannot keep the wrong model.
export const OBJECT_CATALOG = {
  bear: {
    name:'桃桃熊', number:'001', color:'peach', symbol:'🐻', category:'character', model:'character-box-bear-v1',
    description:'把每顆小星星，都攬入懷。', size:[.36,.40,.36], mass:.45, grip:1,
    visualParts:['round-head','bear-ears','cream-muzzle','star-chest'],
  },
  penguin: {
    name:'薄荷企鵝', number:'002', color:'mint', symbol:'🐧', category:'character', model:'character-box-penguin-v1',
    description:'涼浸浸嘅陪伴，暖笠笠嘅心。', size:[.36,.40,.36], mass:.45, grip:1,
    visualParts:['mint-body','white-belly','side-wings','orange-beak'],
  },
  candy: {
    name:'星星糖', number:'003', color:'gold', symbol:'✦', category:'candy', model:'star-candy-v1',
    description:'放大星形糖果，三邊爪墊都可以確實夾住。', size:[.39,.38,.39], mass:.16, grip:1.4,
    visualParts:['five-point-star','bevel-edge','face-eyes','gold-glaze'],
  },
  bigbox: {
    name:'巨型禮盒', number:'004', color:'peach', symbol:'▣', category:'gift', model:'gift-box-v1',
    description:'又大又重，夾中重心先穩。', size:[.46,.48,.46], mass:.82, grip:.78,
    visualParts:['gift-body','raised-lid','cross-ribbon','double-bow'],
  },
  wand: {
    name:'彩虹棒', number:'005', color:'lavender', symbol:'▰', category:'candy', model:'rainbow-wand-v1',
    description:'幼長身形，最容易翻側。', size:[.52,.18,.16], mass:.32, grip:.62,
    visualParts:['striped-handle','gold-star-tip','mint-segments','purple-segments'],
  },
  jelly: {
    name:'啫喱膠囊', number:'006', color:'mint', symbol:'●', category:'candy', model:'jelly-capsule-v1',
    description:'滑捋捋，合爪後都要睇實。', size:[.29,.36,.29], mass:.30, grip:.38,
    visualParts:['capsule-shell','cream-band','face-eyes','clear-glaze'],
  },
  tissue: {
    name:'紙巾包', number:'007', color:'peach', symbol:'▤', category:'everyday', model:'tissue-pack-v1',
    description:'柔軟膠裝紙巾包，頂部有抽取口及白色紙巾。', size:[.46,.32,.30], mass:.12, grip:1.5,
    visualParts:['soft-pack','top-opening','tissue-sheet','front-label'],
  },
  phone: {
    name:'手提電話', number:'008', color:'lavender', symbol:'▯', category:'everyday', model:'smartphone-v1',
    description:'圓角機身、黑色螢幕、鏡頭及底部手勢橫條。', size:[.37,.20,.22], mass:.12, grip:1.35,
    visualParts:['rounded-case','screen','camera-lenses','gesture-bar'],
  },
  mouse: {
    name:'電腦滑鼠', number:'009', color:'mint', symbol:'◒', category:'everyday', model:'computer-mouse-v1',
    description:'長身拱面、收窄尾部、分開左右鍵及中央滾輪。', size:[.34,.24,.46], mass:.11, grip:1.55, holdAssist:true, holdForce:42,
    visualParts:['long-arched-shell','tapered-tail','split-buttons','scroll-wheel','centre-seam'],
  },
  bottle: {
    name:'水樽', number:'010', color:'mint', symbol:'♢', category:'everyday', model:'water-bottle-v1',
    description:'半透明樽身、收窄樽頸、樽蓋及環形標籤。', size:[.25,.44,.25], mass:.16, grip:1.35,
    visualParts:['clear-body','shoulder','neck','cap','label-band'],
  },
  mug: {
    name:'咖啡杯', number:'011', color:'peach', symbol:'☕', category:'everyday', model:'coffee-mug-v1',
    description:'圓杯身、杯口、把手與拉花。', size:[.34,.34,.34], mass:.19, grip:1.28,
    visualParts:['cup-body','open-rim','side-handle','latte-top'],
  },
  remote: {
    name:'遙控器', number:'012', color:'lavender', symbol:'▦', category:'everyday', model:'remote-control-v1',
    description:'長形機身配方向鍵及彩色按鈕。', size:[.28,.18,.46], mass:.12, grip:1.42, holdAssist:true,
    visualParts:['long-case','direction-pad','button-grid','power-button'],
  },
  keys: {
    name:'鎖匙', number:'013', color:'gold', symbol:'⚿', category:'everyday', model:'house-keys-v1',
    description:'匙圈連接兩把不同齒形鎖匙。', size:[.36,.16,.34], mass:.11, grip:1.48, holdAssist:true,
    visualParts:['key-ring','first-key','second-key','key-teeth'],
  },
  glasses: {
    name:'眼鏡', number:'014', color:'mint', symbol:'◉', category:'everyday', model:'eyeglasses-v1',
    description:'雙鏡框、鼻樑與兩邊鏡臂。', size:[.44,.18,.25], mass:.10, grip:1.5, holdAssist:true,
    visualParts:['left-lens','right-lens','nose-bridge','temple-arms'],
  },
  notebook: {
    name:'筆記簿', number:'015', color:'peach', symbol:'▥', category:'everyday', model:'notebook-v1',
    description:'圓角封面、書頁與側邊線圈。', size:[.39,.18,.43], mass:.18, grip:1.3,
    visualParts:['cover','paper-block','spiral-rings','bookmark'],
  },
  pen: {
    name:'原子筆', number:'016', color:'lavender', symbol:'✎', category:'everyday', model:'ballpoint-pen-v1',
    description:'粗身筆桿、筆尖、筆夾及按掣。', size:[.48,.18,.22], mass:.09, grip:1.6, holdAssist:true, holdForce:42,
    visualParts:['pen-barrel','metal-tip','pocket-clip','clicker'],
  },
  wallet: {
    name:'銀包', number:'017', color:'peach', symbol:'▰', category:'everyday', model:'wallet-v1',
    description:'摺疊銀包、扣帶、卡片與縫線。', size:[.39,.20,.31], mass:.16, grip:1.34,
    visualParts:['folded-body','strap','card-slot','edge-stitching'],
  },
  comb: {
    name:'梳', number:'018', color:'mint', symbol:'≣', category:'everyday', model:'hair-comb-v1',
    description:'寬梳背與一排圓頭梳齒。', size:[.48,.17,.20], mass:.09, grip:1.5, holdAssist:true,
    visualParts:['comb-spine','wide-teeth','fine-teeth','rounded-ends'],
  },
  earbuds: {
    name:'耳機盒', number:'019', color:'mint', symbol:'◖', category:'everyday', model:'earbud-case-v1',
    description:'充電盒、揭蓋、左右耳機及指示燈。', size:[.34,.27,.30], mass:.13, grip:1.42,
    visualParts:['charging-case','hinged-lid','left-earbud','right-earbud','status-light'],
  },
  umbrella: {
    name:'縮骨遮', number:'020', color:'lavender', symbol:'☂', category:'everyday', model:'folding-umbrella-v1',
    description:'收合傘布、束帶、傘柄及彎勾。', size:[.49,.16,.17], mass:.14, grip:1.46, holdAssist:true,
    visualParts:['folded-canopy','tie-strap','shaft','curved-handle'],
  },
  soap: {
    name:'番梘', number:'021', color:'mint', symbol:'▱', category:'everyday', model:'soap-bar-v1',
    description:'圓角皂身、壓花、泡泡與凹槽。', size:[.35,.22,.29], mass:.14, grip:1.25,
    visualParts:['rounded-bar','logo-emboss','soap-groove','bubbles'],
  },
  toothpaste: {
    name:'牙膏', number:'022', color:'peach', symbol:'▭', category:'everyday', model:'toothpaste-tube-v1',
    description:'軟管、扁尾、樽蓋與彩色標籤。', size:[.45,.18,.20], mass:.11, grip:1.44, holdAssist:true,
    visualParts:['soft-tube','sealed-tail','screw-cap','front-label'],
  },
  camera: {
    name:'相機', number:'023', color:'lavender', symbol:'▣', category:'everyday', model:'camera-v1',
    description:'相機機身、突出鏡頭、快門及閃光燈。', size:[.40,.30,.28], mass:.24, grip:1.18,
    visualParts:['camera-body','lens-barrel','shutter-button','flash-window'],
  },
  watch: {
    name:'手錶', number:'024', color:'mint', symbol:'◴', category:'everyday', model:'wrist-watch-v1',
    description:'圓形錶面、指針、錶冠與兩段錶帶。', size:[.30,.18,.43], mass:.11, grip:1.46, holdAssist:true,
    visualParts:['watch-face','clock-hands','crown','upper-strap','lower-strap'],
  },
  shoe: {
    name:'波鞋', number:'025', color:'peach', symbol:'◒', category:'everyday', model:'sneaker-v1',
    description:'鞋底、鞋身、鞋頭與交叉鞋帶。', size:[.46,.27,.25], mass:.21, grip:1.22,
    visualParts:['rubber-sole','shoe-upper','toe-cap','cross-laces'],
  },
  cap: {
    name:'太陽帽', number:'026', color:'gold', symbol:'◡', category:'everyday', model:'baseball-cap-v1',
    description:'弧形帽冠、帽舌、頂鈕與背扣。', size:[.40,.29,.38], mass:.14, grip:1.33,
    visualParts:['cap-crown','curved-visor','top-button','back-strap'],
  },
  lunchbox: {
    name:'飯盒', number:'027', color:'mint', symbol:'▣', category:'everyday', model:'lunch-box-v1',
    description:'雙層盒身、盒蓋、扣位與提手。', size:[.43,.32,.35], mass:.23, grip:1.2,
    visualParts:['lower-box','upper-box','side-clips','carry-handle'],
  },
  charger: {
    name:'充電器', number:'028', color:'lavender', symbol:'⌁', category:'everyday', model:'phone-charger-v1',
    description:'火牛、兩腳插頭、電線與充電頭。', size:[.35,.23,.29], mass:.14, grip:1.38,
    visualParts:['power-brick','plug-pins','coiled-cable','connector-tip'],
  },
  flashlight: {
    name:'電筒', number:'029', color:'gold', symbol:'◉', category:'everyday', model:'flashlight-v1',
    description:'筒身、燈頭、光面及側邊開關。', size:[.46,.18,.18], mass:.17, grip:1.38, holdAssist:true,
    visualParts:['barrel','wide-head','light-lens','side-switch'],
  },
  toycar: {
    name:'玩具車', number:'030', color:'peach', symbol:'▰', category:'everyday', model:'toy-car-v1',
    description:'車身、車頂、車窗及四個車輪。', size:[.42,.25,.27], mass:.18, grip:1.27,
    visualParts:['car-body','roof','windows','four-wheels'],
  },
  spoon: {
    name:'湯匙', number:'031', color:'mint', symbol:'◒', category:'everyday', model:'table-spoon-v1',
    description:'橢圓匙羹與加厚手柄。', size:[.48,.15,.18], mass:.09, grip:1.55, holdAssist:true,
    visualParts:['spoon-bowl','raised-rim','thick-handle','rounded-end'],
  },
  tape: {
    name:'膠紙座', number:'032', color:'lavender', symbol:'◉', category:'everyday', model:'tape-dispenser-v1',
    description:'底座、膠紙圈、轉軸與鋸齒切口。', size:[.39,.28,.31], mass:.20, grip:1.23,
    visualParts:['weighted-base','tape-roll','central-spindle','cutting-edge'],
  },
};

export const OBJECT_TYPES = Object.fromEntries(Object.entries(OBJECT_CATALOG).map(([id,item])=>[id,{
  size:item.size, mass:item.mass, grip:item.grip, holdAssist:Boolean(item.holdAssist||item.category==='everyday'), holdForce:Number(item.holdForce||28),
}]));

export const COLLECTIBLE_CATALOG = Object.fromEntries(Object.entries(OBJECT_CATALOG).map(([id,item])=>[id,{
  name:item.name, number:item.number, color:item.color, description:item.description,
}]));

export const EVERYDAY_OBJECT_IDS = Object.keys(OBJECT_CATALOG).filter(id=>OBJECT_CATALOG[id].category==='everyday');
export const prizeSymbol = kind => OBJECT_CATALOG[kind]?.symbol || '◆';
export const getObjectSpec = kind => OBJECT_CATALOG[kind] || null;
