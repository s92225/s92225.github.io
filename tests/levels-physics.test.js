import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {ClawSimulation,validatePrize} from '../src/physics.js';
import {LEVELS} from '../src/levels.js';
import {EVERYDAY_OBJECT_IDS,OBJECT_CATALOG} from '../src/object-catalog.js';
import {EVERYDAY_MODEL_IDS,PRIZE_MODEL_IDS,createPrizeModel} from '../src/object-models.js';

test('everyday-object catalog binds each gameplay name to a dedicated multipart 3D model',()=>{
  assert.equal(EVERYDAY_OBJECT_IDS.length,26);
  for(const id of ['tissue','phone','mouse','bottle','mug','camera','shoe','tape'])assert.ok(EVERYDAY_OBJECT_IDS.includes(id));
  const models=new Set();
  for(const id of EVERYDAY_OBJECT_IDS){
    const item=OBJECT_CATALOG[id];
    assert.ok(EVERYDAY_MODEL_IDS.includes(item.model),`${id} needs a supported model`);
    assert.ok(item.visualParts.length>=4,`${id} needs recognisable model parts`);
    assert.ok(!models.has(item.model),`${id} must not share a generic model`);models.add(item.model);
  }
});

test('all collectibles bind to unique recognisable multipart 3D models',()=>{
  const models=new Set(),shared=new T.MeshBasicMaterial(),materials=new Proxy({},{get:()=>shared});
  for(const [id,item] of Object.entries(OBJECT_CATALOG)){
    assert.ok(PRIZE_MODEL_IDS.includes(item.model),`${id} needs a supported 3D model`);
    assert.ok(item.visualParts.length>=4,`${id} needs recognisable model parts`);
    assert.ok(!models.has(item.model),`${id} must not share a generic model`);models.add(item.model);
    const [x,y,z]=item.size,model=createPrizeModel(id,{x,y,z},materials);let meshes=0;
    model.traverse(node=>{if(node.isMesh){meshes++;node.geometry.dispose();}});
    assert.ok(meshes>=3,`${id} should render as a multipart model`);
  }
  shared.dispose();assert.equal(models.size,Object.keys(OBJECT_CATALOG).length);
});

test('level configuration creates distinct everyday-object sizes and weights',()=>{
  const sim=new ClawSimulation(()=>{}, {level:LEVELS[7]});
  assert.equal(sim.boxes.length,LEVELS[7].objects.length);
  const tissue=sim.boxes.find(b=>b.kind==='tissue'),phone=sim.boxes.find(b=>b.kind==='phone'),bottle=sim.boxes.find(b=>b.kind==='bottle');
  assert.ok(tissue.size.x>phone.size.z);assert.ok(bottle.size.y>phone.size.z);assert.ok(phone.body.mass<bottle.body.mass);
  assert.equal(sim.difficulty,'normal');
  sim.setDifficulty(LEVELS[7].difficulty);assert.equal(sim.difficulty,'hard');
});

test('every configured prize fits the declared claw gap, height, weight and grip envelope',()=>{
  for(const level of LEVELS)for(const entry of level.objects){
    const result=validatePrize(entry);
    assert.equal(result.ok,true,`level ${level.id} ${entry.kind}: ${result.errors.join(', ')}`);
  }
});

test('everyday targets can be lifted and delivered with standard physics and normal aiming tolerance',()=>{
  for(const kind of ['tissue','phone','mouse','bottle'])for(const [dx,dz] of [[0,0],[.06,0],[-.06,.04],[.08,-.06]]){
    const level={id:90,difficulty:'normal',targetKinds:[kind],objects:[{kind,x:0,z:-.2,yaw:.25}]};
    const events=[];const sim=new ClawSimulation(e=>events.push(e),{level});
    sim.setDifficulty('normal');sim.beginAim(`${kind}-${dx}-${dz}`);sim.assist(kind);sim.claw.x+=dx;sim.claw.z+=dz;sim.drop();
    for(let i=0;i<5000&&sim.busy;i++)sim.advance(1/120);
    assert.equal(sim.state,'won',`${kind} should be liftable at offset ${dx}, ${dz}`);
    assert.equal(events.filter(e=>e.type==='reward'&&e.kind===kind).length,1);
  }
});

test('all new everyday targets can be caught from a centered aim',()=>{
  for(const kind of EVERYDAY_OBJECT_IDS.slice(4)){
    const level={id:92,difficulty:'normal',targetKinds:[kind],objects:[{kind,x:0,z:-.2,yaw:.12}]};
    const events=[],sim=new ClawSimulation(e=>events.push(e),{level});
    sim.beginAim(`new-${kind}`);sim.assist(kind);sim.drop();
    for(let i=0;i<5000&&sim.busy;i++)sim.advance(1/120);
    assert.equal(sim.state,'won',`${kind} should be liftable from a centered aim`);
    assert.equal(events.filter(e=>e.type==='reward'&&e.kind===kind).length,1);
  }
});

test('reposition restores only remaining objects and does not start a countdown',()=>{
  const sim=new ClawSimulation(()=>{}, {level:LEVELS[1]});
  const box=sim.boxes[0],start=[box.body.position.x,box.body.position.z];
  box.body.position.x+=1;box.body.position.z+=1;
  assert.equal(sim.reposition(),true);assert.ok(Math.abs(box.body.position.x-start[0])<1e-5);assert.ok(Math.abs(box.body.position.z-start[1])<1e-5);
  assert.equal(sim.aimRemaining,null);assert.equal(sim.state,'ready');
});

test('level two has a forgiving first candy goal that a centered physical grab can complete',()=>{
  const events=[];const sim=new ClawSimulation(e=>events.push(e),{level:LEVELS[1]});
  sim.setDifficulty(LEVELS[1].difficulty);sim.beginAim('level-2');sim.assist('candy');
  sim.claw.x+=.14;sim.claw.z-=.12;sim.drop();
  for(let i=0;i<3600&&sim.busy;i++)sim.advance(1/120);
  assert.equal(LEVELS[1].targetCount,1);assert.equal(sim.state,'won');
  assert.equal(events.filter(e=>e.type==='reward'&&e.kind==='candy').length,1);
});

test('level two enlarged star candy is held by the claw with normal aiming error',()=>{
  for(const [dx,dz] of [[0,0],[.08,0],[-.08,.06],[.13,-.09]]){
    const sim=new ClawSimulation(()=>{}, {level:LEVELS[1]});
    sim.setDifficulty(LEVELS[1].difficulty);sim.beginAim(`level-2-large-${dx}-${dz}`);sim.assist('candy');sim.claw.x+=dx;sim.claw.z+=dz;sim.drop();
    for(let i=0;i<5000&&sim.busy;i++)sim.advance(1/120);
    assert.equal(sim.state,'won',`enlarged candy should remain grippable at ${dx}, ${dz}`);
  }
});

test('level three big gift can be lifted and delivered with a reasonable offset',()=>{
  for(const [dx,dz] of [[0,0],[.08,0],[-.08,.06],[.12,-.08]]){
    const events=[];const sim=new ClawSimulation(e=>events.push(e),{level:LEVELS[2]});
    sim.setDifficulty(LEVELS[2].difficulty);sim.beginAim(`level-3-${dx}-${dz}`);sim.assist('bigbox');sim.claw.x+=dx;sim.claw.z+=dz;sim.drop();
    for(let i=0;i<5000&&sim.busy;i++)sim.advance(1/120);
    assert.equal(sim.state,'won',`offset ${dx}, ${dz} should remain passable`);
    assert.equal(events.filter(e=>e.type==='reward'&&e.kind==='bigbox').length,1);
  }
});

test('level five tissue targets have stronger hold and can both be delivered in sequence',()=>{
  for(const [dx,dz] of [[0,0],[.06,0],[-.06,.04],[.08,-.06]]){
    const events=[];const sim=new ClawSimulation(e=>events.push(e),{level:LEVELS[4]});
    sim.beginAim(`level-5-${dx}-${dz}`);sim.assist('tissue');sim.claw.x+=dx;sim.claw.z+=dz;sim.drop();
    for(let i=0;i<5000&&sim.busy;i++)sim.advance(1/120);
    assert.equal(sim.state,'won',`first level 5 tissue should hold at offset ${dx}, ${dz}`);
    sim.retry();sim.beginAim(`level-5-second-${dx}-${dz}`);sim.assist('tissue');sim.claw.x+=dx;sim.claw.z+=dz;sim.drop();
    for(let i=0;i<5000&&sim.busy;i++)sim.advance(1/120);
    assert.equal(sim.state,'won',`second level 5 tissue should hold at offset ${dx}, ${dz}`);
    assert.equal(events.filter(e=>e.type==='reward'&&e.kind==='tissue').length,2);
  }
});

test('both elongated level seven mouse models can be delivered on hard difficulty',()=>{
  for(const [dx,dz] of [[0,0],[.05,0],[-.05,.04]]){
    const events=[];const sim=new ClawSimulation(e=>events.push(e),{level:LEVELS[6]});sim.setDifficulty('hard');
    sim.beginAim(`level-7-mouse-a-${dx}-${dz}`);sim.assist('mouse');sim.claw.x+=dx;sim.claw.z+=dz;sim.drop();
    for(let i=0;i<6000&&sim.busy;i++)sim.advance(1/120);
    assert.equal(sim.state,'won',`first mouse should hold at offset ${dx}, ${dz}`);
    sim.retry();sim.beginAim(`level-7-mouse-b-${dx}-${dz}`);sim.assist('mouse');sim.claw.x+=dx;sim.claw.z+=dz;sim.drop();
    for(let i=0;i<6000&&sim.busy;i++)sim.advance(1/120);
    assert.equal(sim.state,'won',`second mouse should hold at offset ${dx}, ${dz}`);
    assert.equal(events.filter(e=>e.type==='reward'&&e.kind==='mouse').length,2);
  }
});

test('sticky booster activates only after contact, holds one prize, and releases above the chute',()=>{
  const events=[];const sim=new ClawSimulation(e=>events.push(e), {level:LEVELS[2]});
  assert.equal(sim.prepareMagnet(),true);assert.equal(sim.magnetReady,true);
  sim.beginAim('sticky-round');sim.assist('bigbox');sim.drop();
  assert.equal(sim.magnetReady,false);assert.equal(sim.magnetActive,true);assert.equal(sim.world.constraints.length,0);
  for(let i=0;i<1600&&!events.some(e=>e.type==='sticky');i++)sim.advance(1/120);
  assert.equal(events.filter(e=>e.type==='sticky').length,1);assert.equal(sim.world.constraints.length,1);
  for(let i=0;i<5000&&sim.busy;i++)sim.advance(1/120);
  assert.equal(sim.state,'won');assert.equal(sim.world.constraints.length,0);
  assert.equal(events.filter(e=>e.type==='reward'&&e.kind==='bigbox').length,1);
});

test('sticky booster attaches on a single real contact with a thin everyday object',()=>{
  const events=[];const level={id:91,difficulty:'normal',targetKinds:['phone'],objects:[{kind:'phone',x:0,z:-.2,yaw:.55}]};
  const sim=new ClawSimulation(e=>events.push(e),{level});sim.prepareMagnet();sim.beginAim('sticky-phone');sim.assist('phone');sim.claw.x+=.20;sim.drop();
  for(let i=0;i<1800&&!events.some(e=>e.type==='sticky');i++)sim.advance(1/120);
  assert.equal(events.filter(e=>e.type==='sticky').length,1);assert.equal(sim.world.constraints.length,1);
  for(let i=0;i<5000&&sim.busy;i++)sim.advance(1/120);
  assert.equal(sim.world.constraints.length,0);
});
