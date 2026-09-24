import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { OBJECT_CATALOG, getObjectSpec } from './object-catalog.js';

export const EVERYDAY_MODEL_IDS = Object.values(OBJECT_CATALOG).filter(item=>item.category==='everyday').map(item=>item.model);
export const PRIZE_MODEL_IDS = Object.values(OBJECT_CATALOG).map(item=>item.model);

const add = (root,geometry,material,{x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1,shadow=true}={}) => {
  const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,rz);mesh.scale.set(sx,sy,sz);
  mesh.castShadow=shadow;mesh.receiveShadow=shadow;root.add(mesh);return mesh;
};
const rounded = (w,h,d,r=.035) => new RoundedBoxGeometry(w,h,d,3,Math.min(r,w*.22,h*.22,d*.22));
const material = (m,key,fallback='frame') => m[key]||m[fallback]||m.cream;

function starGeometry(outer,depth,inner=outer*.46) {
  const shape=new T.Shape();
  for(let i=0;i<10;i++){const r=i%2?inner:outer,a=-Math.PI/2+i*Math.PI/5,x=Math.cos(a)*r,y=Math.sin(a)*r;i?shape.lineTo(x,y):shape.moveTo(x,y);}
  shape.closePath();const geometry=new T.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:Math.min(depth*.18,outer*.08),bevelThickness:Math.min(depth*.16,outer*.07)});geometry.center();return geometry;
}

function bearModel(size,m) {
  const root=new T.Group(),w=size.x*2,h=size.y*2,d=size.z*2,pink=material(m,'bearBody'),light=material(m,'bearLight'),dark=material(m,'bearDark','darkSoft');
  add(root,new T.SphereGeometry(1,28,20),pink,{y:h*.17,sx:w*.39,sy:h*.37,sz:d*.38});
  add(root,new T.SphereGeometry(1,22,16),pink,{x:-w*.31,y:h*.39,sx:w*.15,sy:h*.15,sz:d*.14});
  add(root,new T.SphereGeometry(1,22,16),pink,{x:w*.31,y:h*.39,sx:w*.15,sy:h*.15,sz:d*.14});
  add(root,new T.SphereGeometry(1,26,18),pink,{y:-h*.26,sx:w*.33,sy:h*.31,sz:d*.31});
  add(root,new T.SphereGeometry(1,18,14),light,{y:h*.08,z:d*.35,sx:w*.19,sy:h*.13,sz:d*.055});
  for(const x of [-w*.14,w*.14])add(root,new T.SphereGeometry(1,16,12),dark,{x,y:h*.23,z:d*.36,sx:w*.035,sy:h*.036,sz:d*.035});
  add(root,starGeometry(w*.14,d*.07),material(m,'candyGold'),{y:-h*.18,z:d*.31});
  return root;
}

function penguinModel(size,m) {
  const root=new T.Group(),w=size.x*2,h=size.y*2,d=size.z*2,body=material(m,'penguinBody'),belly=material(m,'penguinBelly','paper'),dark=material(m,'bearDark','darkSoft');
  add(root,new T.SphereGeometry(1,30,22),body,{y:-h*.02,sx:w*.39,sy:h*.49,sz:d*.39});
  add(root,new T.SphereGeometry(1,24,18),belly,{y:-h*.10,z:d*.31,sx:w*.25,sy:h*.32,sz:d*.08});
  add(root,new T.SphereGeometry(1,18,14),body,{x:-w*.36,y:-h*.02,sx:w*.13,sy:h*.29,sz:d*.17,rz:-.42});
  add(root,new T.SphereGeometry(1,18,14),body,{x:w*.36,y:-h*.02,sx:w*.13,sy:h*.29,sz:d*.17,rz:.42});
  for(const x of [-w*.12,w*.12])add(root,new T.SphereGeometry(1,16,12),dark,{x,y:h*.17,z:d*.36,sx:w*.035,sy:h*.036,sz:d*.035});
  add(root,new T.ConeGeometry(w*.075,d*.16,4),material(m,'orange'),{y:h*.06,z:d*.43,rx:Math.PI/2,ry:Math.PI/4});
  return root;
}

function candyModel(size,m) {
  const root=new T.Group(),w=size.x*2,d=size.z*2;
  add(root,starGeometry(w*.48,d*.58),material(m,'candyGold'));
  for(const x of [-w*.12,w*.12])add(root,new T.SphereGeometry(1,14,10),material(m,'bearDark','darkSoft'),{x,y:w*.04,z:d*.31,sx:w*.035,sy:w*.035,sz:d*.035});
  return root;
}

function giftModel(size,m) {
  const root=new T.Group(),w=size.x*2,h=size.y*2,d=size.z*2,body=material(m,'giftBody'),lid=material(m,'giftLid'),ribbon=material(m,'ribbon');
  add(root,rounded(w*.92,h*.70,d*.90,.08),body,{y:-h*.11});
  add(root,rounded(w,h*.22,d,.07),lid,{y:h*.31});
  add(root,rounded(w*.15,h*.93,d*.935,.035),ribbon,{y:-h*.015});
  add(root,rounded(w*.94,h*.14,d*.94,.035),ribbon,{y:h*.02});
  add(root,new T.TorusGeometry(w*.16,w*.05,10,24),ribbon,{x:-w*.13,y:h*.52,rz:-.48,sy:.68});
  add(root,new T.TorusGeometry(w*.16,w*.05,10,24),ribbon,{x:w*.13,y:h*.52,rz:.48,sy:.68});
  add(root,new T.SphereGeometry(w*.07,18,12),material(m,'candyGold'),{y:h*.50});
  return root;
}

function wandModel(size,m) {
  const root=new T.Group(),w=size.x*2,h=size.y*2,d=size.z*2,segment=w*.13,start=-w*.12;
  add(root,rounded(w*.72,h*.54,d*.62,.07),material(m,'wandPurple'),{x:w*.12});
  for(let i=0;i<5;i++)add(root,rounded(segment,h*.57,d*.65,.035),i%2?material(m,'giftLid'):material(m,'wandMint'),{x:start+i*segment});
  add(root,starGeometry(h*.49,d*.52),material(m,'candyGold'),{x:-w*.39,rz:-Math.PI/2});
  return root;
}

function jellyModel(size,m) {
  const root=new T.Group(),w=size.x*2,h=size.y*2,d=size.z*2,r=Math.min(w,d)*.43;
  add(root,new T.CapsuleGeometry(r,Math.max(.03,h-r*2),10,24),material(m,'jellyBody','mint'));
  add(root,rounded(w*.88,h*.17,d*.91,.045),material(m,'jellyBand','paper'),{y:-h*.06});
  for(const x of [-w*.13,w*.13])add(root,new T.SphereGeometry(1,14,10),material(m,'bearDark','darkSoft'),{x,y:h*.13,z:d*.42,sx:w*.034,sy:h*.033,sz:d*.03});
  return root;
}

function tissueModel(size,m) {
  const root=new T.Group(),w=size.x*2,h=size.y*2,d=size.z*2;
  add(root,rounded(w,h*.78,d,.10),m.tissue,{y:-h*.08});
  add(root,rounded(w*.72,.018,d*.58,.008),m.tissueLabel,{y:h*.32});
  add(root,rounded(w*.28,.022,d*.12,.006),m.darkSoft,{y:h*.35});
  add(root,rounded(w*.42,h*.62,.025,.012),m.paper,{y:h*.49,z:.015,rx:-.16,rz:.12});
  add(root,rounded(w*.58,h*.27,.018,.008),m.paper,{y:h*.41,z:-.015,rx:.10,rz:-.08});
  add(root,rounded(w*.52,h*.30,.018,.008),m.tissueLabel,{y:-h*.10,z:d*.505,rx:-Math.PI/2});
  return root;
}

function phoneModel(size,m) {
  const root=new T.Group(),w=size.x*2,h=size.y*2,d=size.z*2;
  add(root,rounded(w,h,d,.09),m.phoneCase);
  add(root,rounded(w*.86,.025,d*.82,.035),m.screen,{y:h*.51});
  const cameraPlate=add(root,rounded(w*.25,.035,d*.30,.035),m.phoneMetal,{x:-w*.28,y:h*.535,z:-d*.25});
  for(const [x,z] of [[-.055,-.045],[.055,-.045],[0,.055]])add(cameraPlate,new T.CylinderGeometry(.035,.035,.025,20),m.camera,{x,y:.025,z});
  add(root,rounded(w*.24,.018,.025,.008),m.paper,{y:h*.54,z:d*.28});
  return root;
}

function mouseModel(size,m) {
  const root=new T.Group(),w=size.x*2,h=size.y*2,d=size.z*2;
  // Elongated shell and a slightly narrower rear base give the silhouette of
  // a real desktop mouse instead of a ball with a plate on top.
  add(root,rounded(w*.84,h*.30,d*.82,.09),m.mouseSeam,{y:-h*.30,z:d*.035});
  add(root,new T.SphereGeometry(1,36,24),m.mouse,{y:-h*.035,z:-d*.015,sx:w*.46,sy:h*.47,sz:d*.49});
  add(root,rounded(w*.405,h*.075,d*.39,.055),m.mouseButton,{x:-w*.215,y:h*.34,z:-d*.255,rz:.018});
  add(root,rounded(w*.405,h*.075,d*.39,.055),m.mouseButton,{x:w*.215,y:h*.34,z:-d*.255,rz:-.018});
  add(root,rounded(w*.035,h*.045,d*.47,.012),m.mouseSeam,{y:h*.34,z:-d*.17});
  add(root,new T.CylinderGeometry(w*.055,w*.055,w*.17,24),m.scroll,{y:h*.43,z:-d*.16,rz:Math.PI/2});
  add(root,rounded(w*.13,h*.035,d*.09,.018),m.scroll,{y:h*.39,z:d*.10});
  return root;
}

function bottleModel(size,m) {
  const root=new T.Group(),r=size.x,h=size.y*2;
  add(root,new T.CylinderGeometry(r*.78,r*.92,h*.62,32),m.bottle,{y:-h*.12});
  add(root,new T.CylinderGeometry(r*.46,r*.78,h*.18,32),m.bottle,{y:h*.28});
  add(root,new T.CylinderGeometry(r*.43,r*.43,h*.15,28),m.bottle,{y:h*.40});
  add(root,new T.CylinderGeometry(r*.51,r*.51,h*.10,28),m.bottleCap,{y:h*.505});
  add(root,new T.CylinderGeometry(r*.935,r*.94,h*.20,32,1,true),m.bottleLabel,{y:-h*.10});
  return root;
}

// The long-tail everyday collection uses the same soft Candy Jelly materials,
// but every record has a distinct silhouette and model id. Collision remains a
// simple, stable proxy while these visible parts tell the player what they are
// actually trying to catch.
function everydayModel(model,size,m) {
  const root=new T.Group(),w=size.x*2,h=size.y*2,d=size.z*2;
  const pink=material(m,'giftBody'),mint=material(m,'mint'),purple=material(m,'wandPurple'),cream=material(m,'cream'),dark=material(m,'darkSoft'),gold=material(m,'candyGold'),silver=material(m,'silver'),screen=material(m,'screen');
  const box=(x,y,z,mat,{px=0,py=0,pz=0,rx=0,ry=0,rz=0,r=.035}={})=>add(root,rounded(x,y,z,r),mat,{x:px,y:py,z:pz,rx,ry,rz});
  const sphere=(radius,mat,opts={})=>add(root,new T.SphereGeometry(radius,24,18),mat,opts);
  const cyl=(rt,rb,len,mat,opts={})=>add(root,new T.CylinderGeometry(rt,rb,len,24),mat,opts);
  switch(model){
    case 'coffee-mug-v1':
      cyl(w*.34,w*.38,h*.72,pink);cyl(w*.31,w*.31,h*.04,cream,{y:h*.37});cyl(w*.25,w*.25,h*.025,material(m,'orange'),{y:h*.395});
      add(root,new T.TorusGeometry(w*.22,w*.055,10,26,Math.PI*1.55),pink,{x:w*.34,y:.02,rz:Math.PI/2});break;
    case 'remote-control-v1':
      box(w*.72,h*.72,d*.94,purple);box(w*.33,h*.05,d*.22,dark,{py:h*.39,pz:-d*.25});
      for(let i=0;i<6;i++)cyl(w*.055,w*.055,h*.04,i===0?pink:i===1?mint:cream,{x:(i%2-.5)*w*.25,y:h*.39,z:(Math.floor(i/2)-.15)*d*.22});break;
    case 'house-keys-v1':
      add(root,new T.TorusGeometry(w*.22,w*.045,10,28),gold,{x:-w*.18,rz:Math.PI/2});
      for(const [x,z,rz] of [[w*.08,-d*.08,.18],[w*.08,d*.12,-.25]]){box(w*.46,h*.18,d*.12,silver,{px:x,pz:z,rz});box(w*.12,h*.20,d*.23,gold,{px:x+w*.22,pz:z,rz});}break;
    case 'eyeglasses-v1':
      for(const x of [-w*.25,w*.25])add(root,new T.TorusGeometry(w*.21,w*.035,10,32),purple,{x,rx:Math.PI/2});
      box(w*.13,h*.08,d*.06,purple,{py:0});box(w*.66,h*.06,d*.06,purple,{px:-w*.18,pz:-d*.34,ry:-.18});box(w*.66,h*.06,d*.06,purple,{px:w*.18,pz:-d*.34,ry:.18});break;
    case 'notebook-v1':
      box(w*.92,h*.65,d*.88,pink);box(w*.82,h*.05,d*.78,cream,{py:h*.35});
      for(let i=0;i<5;i++)add(root,new T.TorusGeometry(w*.035,w*.012,7,16),silver,{x:-w*.47+(i%2)*0,y:h*.38,z:-d*.34+i*d*.17,rz:Math.PI/2});box(w*.07,h*.72,d*.12,purple,{px:w*.22});break;
    case 'ballpoint-pen-v1':
      cyl(h*.34,h*.34,w*.72,purple,{rz:Math.PI/2});cyl(h*.27,0,w*.19,silver,{x:-w*.45,rz:-Math.PI/2});
      cyl(h*.28,h*.28,w*.12,pink,{x:w*.42,rz:Math.PI/2});box(w*.35,h*.08,d*.16,gold,{px:w*.16,py:h*.28});break;
    case 'wallet-v1':
      box(w*.94,h*.72,d*.90,pink);box(w*.18,h*.78,d*.96,purple,{px:w*.20});box(w*.43,h*.05,d*.42,cream,{py:h*.39,pz:d*.16});sphere(h*.09,gold,{x:w*.20,y:h*.41,z:d*.32});break;
    case 'hair-comb-v1':
      box(w*.94,h*.38,d*.30,mint,{pz:-d*.25});for(let i=0;i<9;i++)box(w*.055,h*.40,d*.52,purple,{px:-w*.39+i*w*.098,pz:d*.16});break;
    case 'earbud-case-v1':
      box(w*.92,h*.70,d*.92,cream,{py:-h*.10,r:.09});box(w*.92,h*.23,d*.92,mint,{py:h*.35,r:.08});
      for(const x of [-w*.20,w*.20]){sphere(w*.10,purple,{x,y:h*.05,z:d*.25,sx:1,sy:.75,sz:.75});cyl(w*.045,w*.045,h*.23,purple,{x,y:-h*.13,z:d*.25});}break;
    case 'folding-umbrella-v1':
      cyl(h*.30,h*.38,w*.72,pink,{rz:Math.PI/2});box(w*.22,h*.16,d*.34,purple,{px:.02});cyl(h*.12,h*.12,w*.26,silver,{x:w*.40,rz:Math.PI/2});add(root,new T.TorusGeometry(h*.20,h*.055,9,22,Math.PI*1.25),purple,{x:-w*.43,rz:-Math.PI/2});break;
    case 'soap-bar-v1':
      box(w*.94,h*.82,d*.94,mint,{r:.10});add(root,new T.TorusGeometry(w*.20,w*.025,8,28),cream,{y:h*.43,rx:Math.PI/2});
      for(const [x,z,s] of [[-w*.32,-d*.36,.065],[w*.28,d*.35,.05],[w*.38,-d*.18,.04]])sphere(w*s,cream,{x,y:h*.48,z});break;
    case 'toothpaste-tube-v1':
      box(w*.75,h*.75,d*.82,cream,{px:-w*.05});box(w*.16,h*.82,d*.88,mint,{px:-w*.43});cyl(h*.26,h*.26,w*.20,purple,{x:w*.43,rz:Math.PI/2});box(w*.35,h*.78,d*.05,pink,{px:-w*.03,pz:d*.44});break;
    case 'camera-v1':
      box(w*.96,h*.76,d*.85,purple);cyl(w*.24,w*.30,d*.42,screen,{z:d*.55,rx:Math.PI/2});cyl(w*.14,w*.14,d*.04,silver,{z:d*.78,rx:Math.PI/2});box(w*.20,h*.14,d*.12,cream,{px:w*.27,py:h*.43,pz:d*.20});cyl(w*.07,w*.07,h*.08,pink,{px:-w*.28,py:h*.43});break;
    case 'wrist-watch-v1':
      box(w*.38,h*.60,d*.94,mint);cyl(w*.32,w*.32,h*.42,purple,{y:h*.18});cyl(w*.25,w*.25,h*.44,cream,{y:h*.20});box(w*.04,h*.04,d*.20,dark,{py:h*.43,pz:d*.06,rz:.45});sphere(w*.06,gold,{x:w*.35,y:h*.18});break;
    case 'sneaker-v1':
      box(w*.96,h*.26,d*.92,cream,{py:-h*.34,r:.06});box(w*.88,h*.62,d*.72,pink,{py:-h*.02,pz:d*.05,r:.10});box(w*.28,h*.66,d*.70,purple,{px:-w*.31,py:h*.03});for(let i=0;i<3;i++)box(w*.05,h*.05,d*.58,cream,{px:-w*.10+i*w*.14,py:h*.34,rz:(i%2?.45:-.45)});break;
    case 'baseball-cap-v1':
      sphere(1,pink,{y:.02,sx:w*.44,sy:h*.45,sz:d*.40});box(w*.80,h*.10,d*.48,purple,{py:-h*.20,pz:d*.33,r:.08});sphere(w*.06,gold,{y:h*.47});box(w*.28,h*.10,d*.08,cream,{py:-h*.15,pz:-d*.40});break;
    case 'lunch-box-v1':
      box(w*.94,h*.48,d*.92,mint,{py:-h*.20});box(w*.94,h*.25,d*.92,cream,{py:h*.20});box(w*.18,h*.50,d*.96,purple,{px:-w*.35});box(w*.18,h*.50,d*.96,purple,{px:w*.35});add(root,new T.TorusGeometry(w*.24,w*.045,9,24,Math.PI),pink,{y:h*.44,rz:Math.PI});break;
    case 'phone-charger-v1':
      box(w*.72,h*.75,d*.72,cream);for(const x of [-w*.15,w*.15])box(w*.07,h*.32,d*.07,silver,{px:x,py:h*.51});
      add(root,new T.TorusGeometry(w*.30,w*.045,9,30,Math.PI*1.6),purple,{pz:d*.20,rx:Math.PI/2});box(w*.22,h*.10,d*.13,mint,{px:w*.30,py:-h*.22,pz:d*.34});break;
    case 'flashlight-v1':
      cyl(h*.32,h*.32,w*.65,purple,{rz:Math.PI/2});cyl(h*.50,h*.32,w*.25,gold,{x:-w*.36,rz:Math.PI/2});cyl(h*.38,h*.38,w*.035,cream,{x:-w*.50,rz:Math.PI/2});box(w*.18,h*.14,d*.30,mint,{px:w*.10,py:h*.33});break;
    case 'toy-car-v1':
      box(w*.92,h*.38,d*.90,pink,{py:-h*.10});box(w*.52,h*.38,d*.72,mint,{py:h*.26,pz:-d*.03});box(w*.38,h*.06,d*.58,screen,{py:h*.47,pz:-d*.04});for(const x of [-w*.32,w*.32])for(const z of [-d*.38,d*.38])cyl(h*.18,h*.18,d*.10,dark,{x,y:-h*.30,z,rx:Math.PI/2});break;
    case 'table-spoon-v1':
      box(w*.72,h*.22,d*.26,silver,{px:w*.12});sphere(1,silver,{x:-w*.36,sx:w*.30,sy:h*.34,sz:d*.48});sphere(1,cream,{x:-w*.36,y:h*.08,sx:w*.20,sy:h*.20,sz:d*.34});box(w*.12,h*.28,d*.35,purple,{px:w*.45});break;
    case 'tape-dispenser-v1':
      box(w*.94,h*.42,d*.94,purple,{py:-h*.26});add(root,new T.TorusGeometry(w*.26,w*.095,12,32),gold,{y:h*.12,rx:Math.PI/2});cyl(w*.075,w*.075,d*.38,mint,{y:h*.12,rx:Math.PI/2});box(w*.30,h*.18,d*.70,silver,{px:w*.34,py:h*.10});break;
    default:return null;
  }
  return root;
}

export function createPrizeModel(kind,size,materials) {
  const model=getObjectSpec(kind)?.model;
  if(model==='character-box-bear-v1')return bearModel(size,materials);
  if(model==='character-box-penguin-v1')return penguinModel(size,materials);
  if(model==='star-candy-v1')return candyModel(size,materials);
  if(model==='gift-box-v1')return giftModel(size,materials);
  if(model==='rainbow-wand-v1')return wandModel(size,materials);
  if(model==='jelly-capsule-v1')return jellyModel(size,materials);
  if(model==='tissue-pack-v1')return tissueModel(size,materials);
  if(model==='smartphone-v1')return phoneModel(size,materials);
  if(model==='computer-mouse-v1')return mouseModel(size,materials);
  if(model==='water-bottle-v1')return bottleModel(size,materials);
  return everydayModel(model,size,materials);
}

export const createEverydayModel = createPrizeModel;
