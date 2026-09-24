import test from 'node:test';
import assert from 'node:assert/strict';
import { ClawSimulation, CHUTE, CHUTE_SENSOR } from '../src/physics.js';

function run(sim, max=3600, dt=1/120) {
  for(let i=0;i<max&&sim.busy;i++)sim.advance(dt);
  assert.equal(sim.busy,false,'round must finish within 30 simulated seconds');
}
function trial(offset=0,kind='bear') {
  const events=[];let rewardSnapshot;
  const sim=new ClawSimulation(e=>{events.push(e);if(e.type==='reward')rewardSnapshot=sim.snapshot();});
  sim.beginAim('round-1');sim.assist(kind);sim.claw.x+=offset;sim.drop();run(sim);
  return {sim,events,rewardSnapshot};
}
test('centered contact lifts a dynamic box and rewards only after chute entry',()=>{
  const {sim,events,rewardSnapshot}=trial();
  assert.equal(sim.state,'won');
  const grip=events.find(e=>e.type==='grip');assert.ok(grip.contacts>=2);
  assert.equal(events.filter(e=>e.type==='reward').length,1);
  const collected=rewardSnapshot.boxes.find(b=>b.collected);
  assert.ok(collected.position[1]<CHUTE_SENSOR.maxY);
  assert.ok(collected.position[0]>CHUTE_SENSOR.minX&&collected.position[0]<CHUTE_SENSOR.maxX);
  assert.ok(collected.position[2]>CHUTE_SENSOR.minZ&&collected.position[2]<CHUTE_SENSOR.maxZ);
  assert.ok(events.findIndex(e=>e.type==='state'&&e.state==='releasing')<events.findIndex(e=>e.type==='reward'));
  assert.equal(events.find(e=>e.type==='result').reason,'盒子已跌入虛擬收藏出口');
  assert.equal(sim.boxes[0].body.mass,.45,'box stays dynamic while grabbed');
  for(let i=0;i<500;i++)sim.advance(1/120);
  assert.equal(events.filter(e=>e.type==='reward').length,1,'continued settling must not duplicate reward');
});
test('empty location produces a miss and zero rewards',()=>{
  const {sim,events}=trial(0,'empty');assert.equal(sim.state,'lost');
  assert.equal(events.some(e=>e.type==='grip'),false);assert.equal(events.some(e=>e.type==='reward'),false);
  assert.equal(sim.reason,'未接觸到盒子');
});
test('off-centre finite grip slips, changes the position, and retry preserves that world',()=>{
  const {sim,events}=trial(.50);assert.equal(sim.state,'lost');
  assert.ok(events.some(e=>e.type==='grip'));assert.ok(events.some(e=>e.type==='slip'));
  assert.equal(events.some(e=>e.type==='reward'),false);
  const body=sim.boxes[0].body,position=body.position.toArray();
  assert.ok(Math.hypot(position[0]+.72,position[2]+.85)>.1,'off-center grasp physically displaced the box');
  sim.retry();assert.deepEqual(body.position.toArray(),position);
  assert.equal(sim.boxes[0].body,body);assert.equal(sim.state,'ready');
});
test('identical initial conditions produce identical physics; changing aim changes outcome',()=>{
  assert.deepEqual(trial(.50).sim.snapshot(),trial(.50).sim.snapshot());
  assert.equal(trial().sim.state,'won');assert.equal(trial(.50).sim.state,'lost');
});
test('both character types can be collected',()=>assert.equal(trial(0,'penguin').sim.state,'won'));
test('an idle machine still grips after boxes have gone to sleep',()=>{
  const sim=new ClawSimulation();for(let i=0;i<2400;i++)sim.advance(1/120);
  sim.beginAim('after-idle');sim.assist('bear');sim.drop();run(sim);assert.equal(sim.state,'won');
});
test('busy state rejects second drop, assistance, reset, retry and directional movement',()=>{
  const sim=new ClawSimulation();sim.beginAim('once');sim.drop();const position=sim.claw.clone();
  assert.equal(sim.drop('twice'),false);assert.equal(sim.round,'once');
  assert.equal(sim.reset(),false);assert.equal(sim.assist('bear'),false);assert.equal(sim.retry(),false);
  sim.aim(1,1,5);assert.ok(position.almostEquals(sim.claw));
});
test('frame chunking does not change the fixed-step result, and long frames are bounded',()=>{
  const sim=new ClawSimulation();sim.beginAim('round-1');sim.assist('bear');sim.drop();run(sim,1200,1/30);
  assert.equal(sim.state,'won');
  const slow=new ClawSimulation();slow.beginAim('slow');slow.drop();slow.advance(20);
  assert.equal(slow.state,'lowering');assert.ok(slow.claw.y>2.9);
});
test('rotated dropped boxes collide with the floor and change orientation without tunnelling',()=>{
  const sim=new ClawSimulation();const b=sim.boxes[0].body;b.position.y=2;
  b.quaternion.setFromEuler(.55,.3,.4);b.velocity.set(.5,0,.3);b.wakeUp();
  const before=b.quaternion.toArray();for(let i=0;i<600;i++)sim.advance(1/120);
  assert.ok(b.position.y>.32&&b.position.y<.65);assert.notDeepEqual(b.quaternion.toArray(),before);
});
test('reset restores the repeatable layout and releases constraints',()=>{
  const {sim}=trial(.35);sim.reset();const fresh=new ClawSimulation();
  assert.equal(sim.state,'ready');assert.ok(sim.claw.almostEquals(fresh.claw,1e-6));
  sim.boxes.forEach((box,i)=>{
    assert.ok(box.body.position.almostEquals(fresh.boxes[i].body.position,1e-6));
    box.body.quaternion.toArray().forEach((n,j)=>assert.ok(Math.abs(n-fresh.boxes[i].body.quaternion.toArray()[j])<1e-6));
  });
  assert.equal(sim.world.constraints.length,0);
});
test('idle movement input starts ten seconds once; zero input stays idle and timeout drops once',()=>{
  const events=[];const sim=new ClawSimulation(e=>events.push(e));
  const before=sim.claw.clone();sim.aim(1,0,2);assert.ok(sim.claw.almostEquals(before));
  assert.equal(sim.drop(),false);assert.equal(sim.assist('bear'),false);
  assert.equal(sim.startMoving(0,0,'idle'),false);sim.advance(20);assert.equal(sim.aiming,false);
  assert.equal(sim.startMoving(1,0,'timer'),true);sim.advance(.2,{x:1,z:0});assert.ok(sim.claw.x>before.x);
  assert.equal(sim.startMoving(0,-1,'do-not-reset'),true);assert.equal(sim.round,'timer');assert.equal(sim.aimRemaining,9.8);
  sim.advance(9.7);assert.equal(sim.state,'ready');
  assert.ok(Math.abs(sim.aimRemaining-.1)<1e-6);sim.advance(.1);
  assert.equal(sim.state,'lowering');assert.equal(sim.round,'timer');
  assert.equal(events.filter(e=>e.type==='drop').length,1);
  assert.equal(events.find(e=>e.type==='drop').automatic,true);
  sim.advance(20);assert.equal(events.filter(e=>e.type==='drop').length,1);
});
test('manual drop ends countdown; retry never auto-starts another timer',()=>{
  const events=[];const sim=new ClawSimulation(e=>events.push(e));
  sim.beginAim('manual');sim.advance(2);sim.drop();run(sim);
  assert.equal(events.filter(e=>e.type==='drop').length,1);
  assert.equal(events.find(e=>e.type==='drop').automatic,false);
  sim.retry();sim.advance(30);assert.equal(sim.aiming,false);assert.equal(sim.state,'ready');
});
test('countdown cannot be reset or difficulty/mode changed after start',()=>{
  const sim=new ClawSimulation();sim.beginAim('locked');sim.advance(3);
  assert.equal(sim.reset(),false);assert.equal(sim.clearChute(),false);
  assert.equal(sim.beginAim('again'),false);assert.equal(sim.setDifficulty('easy'),false);
  assert.equal(sim.setMode('chance',1),false);assert.equal(sim.aimRemaining,7);
});
test('successful bodies leave the physics world and cannot clog the delivery area',()=>{
  const {sim,events}=trial();const collected=sim.boxes.find(b=>b.collected);
  assert.equal(collected.body.world,null);assert.ok(!sim.world.bodies.includes(collected.body));
  sim.retry();assert.equal(events.filter(e=>e.type==='reward').length,1);
});
test('every prize entering the chute in one round is scored with its own claim id',()=>{
  const events=[];const sim=new ClawSimulation(e=>events.push(e));
  sim.beginAim('multi-prize');sim.drop();
  const [first,second]=sim.boxes;
  first.body.position.set(CHUTE.x-.12,-.5,CHUTE.z);second.body.position.set(CHUTE.x+.12,-.5,CHUTE.z);
  first.body.velocity.setZero();second.body.velocity.setZero();first.body.wakeUp();second.body.wakeUp();
  sim.advance(1/120);
  const rewards=events.filter(e=>e.type==='reward');
  assert.equal(rewards.length,2);assert.deepEqual(new Set(rewards.map(e=>e.prizeId)).size,2);
  assert.ok(rewards.every(e=>e.roundId==='multi-prize'));
});
test('clear delivery area returns an unscored jam to a vacant slot without touching other boxes',()=>{
  const events=[];const sim=new ClawSimulation(e=>events.push(e));
  const jam=sim.boxes[0].body;jam.position.set(CHUTE.x,.4,CHUTE.z);
  const others=sim.boxes.slice(1).map(b=>b.body.position.toArray());sim.clearChute();
  assert.ok(jam.position.z<CHUTE.minZ || jam.position.x>CHUTE.maxX);
  assert.deepEqual(sim.boxes.slice(1).map(b=>b.body.position.toArray()),others);
  assert.equal(events.some(e=>e.type==='reward'),false);
});
test('contact grip has no attachment and cannot exert force on a distant box',()=>{
  const sim=new ClawSimulation();sim.beginAim('contact');sim.assist('bear');sim.drop();
  for(let i=0;i<1500&&!sim.hadGrip;i++)sim.advance(1/120);
  assert.ok(sim.hadGrip);assert.equal(sim.world.constraints.length,0);
  const box=sim.boxes[0].body;box.position.set(1.8,.4,-1.8);box.force.setZero();box.torque.setZero();
  sim.applyPadContacts();assert.equal(box.force.length(),0);assert.equal(box.torque.length(),0);
});
test('hinged pads stop at prize surfaces instead of tunnelling through a centered box',()=>{
  const sim=new ClawSimulation();sim.setDifficulty('easy');sim.beginAim('no-tunnel');sim.assist('bear');sim.drop();run(sim);
  assert.equal(sim.state,'won');
  assert.ok(sim.maxPadPenetration<=.065,`pad penetration ${sim.maxPadPenetration} exceeded the compliant surface allowance`);
  assert.ok(sim.fingerRadii.some(radius=>radius>sim.settings.radius+.04),'at least one finger should stop outside its motor target');
});
test('difficulty changes physical grip, with successful and failed challenge grabs both possible',()=>{
  const runWith=(difficulty,offset)=>{const s=new ClawSimulation();s.setDifficulty(difficulty);s.beginAim('difficulty');s.assist('bear');s.claw.x+=offset;s.drop();run(s);return s.state;};
  assert.equal(runWith('normal',.445),'won');assert.equal(runWith('hard',.445),'lost');
  assert.equal(runWith('hard',0),'won');
});
test('explicit chance mode samples once at contact: 0% weakens, 100% maintains grip',()=>{
  for(const chance of [0,1]) {
    let rolls=0;const events=[];
    const sim=new ClawSimulation(e=>events.push(e),{random:()=>{rolls++;return .5;}});
    sim.setMode('chance',chance);sim.beginAim('chance');sim.assist('bear');sim.drop();run(sim);
    assert.equal(rolls,1);assert.equal(sim.chanceHold,Boolean(chance));
    assert.equal(events.filter(e=>e.type==='chance').length,1);assert.equal(sim.state,chance?'won':'lost');
    sim.setMode('chance',.35);assert.equal(sim.chanceAtDraw,chance);
  }
});
test('weak grip lifts first, fades smoothly and slips without snapping the fingers open',()=>{
  const sim=new ClawSimulation(()=>{},{random:()=>.9});sim.setMode('chance',0);
  sim.beginAim('soft-slip');sim.assist('bear');sim.drop();
  let peak=.4,previousStrength=1,sawWeakening=false;
  for(let i=0;i<3600&&sim.busy;i++){
    sim.advance(1/120);
    if(['lifting','returning'].includes(sim.state)){
      assert.equal(sim.open,0,'grip failure must not open the claw');
      assert.ok(Math.abs(sim.gripStrength-previousStrength)<.02,'motor force should fade continuously');
      if(sim.state==='lifting'&&sim.time<.6)assert.equal(sim.gripStrength,1);
      previousStrength=sim.gripStrength;sawWeakening ||= sim.gripStrength<.1;
      peak=Math.max(peak,sim.boxes[0].body.position.y);
    }
  }
  assert.ok(peak>1,'box is visibly lifted before slipping');assert.ok(sawWeakening);assert.equal(sim.state,'lost');
});
test('pure physics never samples RNG; chance mode cannot turn an empty grab into a win',()=>{
  let rolls=0;const random=()=>{rolls++;return 0;};
  const physical=new ClawSimulation(()=>{},{random});physical.beginAim('pure');physical.assist('bear');physical.drop();run(physical);assert.equal(rolls,0);
  const empty=new ClawSimulation(()=>{},{random});empty.setMode('chance',1);empty.beginAim('empty');empty.assist('empty');empty.drop();run(empty);assert.equal(empty.state,'lost');assert.equal(rolls,0);
});
