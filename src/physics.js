import * as C from 'cannon-es';
import { OBJECT_TYPES } from './object-catalog.js';

export const BOX = { x: .36, y: .40, z: .36 };
export { OBJECT_TYPES };
export const CLAW_FIT_LIMITS={minGripSpan:.24,maxGripSpan:.94,maxLength:1.18,maxHeight:1.08,maxMass:.9,minGrip:.38};
export function validatePrize(entry={}) {
  const spec=OBJECT_TYPES[entry.kind];
  if(!spec)return {ok:false,errors:['unknown-kind']};
  const raw=entry.size||spec.size,size=raw.map(Number),mass=Number(entry.mass??spec.mass),grip=Number(entry.grip??spec.grip);
  const [width,height,depth]=size.map(n=>n*2),gripSpan=Math.min(width,depth),length=Math.max(width,depth),errors=[];
  if(!size.every(n=>Number.isFinite(n)&&n>0))errors.push('invalid-size');
  if(gripSpan<CLAW_FIT_LIMITS.minGripSpan)errors.push('too-thin');
  if(gripSpan>CLAW_FIT_LIMITS.maxGripSpan)errors.push('too-wide');
  if(length>CLAW_FIT_LIMITS.maxLength)errors.push('too-long');
  if(height>CLAW_FIT_LIMITS.maxHeight)errors.push('too-tall');
  if(!Number.isFinite(mass)||mass<=0||mass>CLAW_FIT_LIMITS.maxMass)errors.push('too-heavy');
  if(!Number.isFinite(grip)||grip<CLAW_FIT_LIMITS.minGrip)errors.push('too-slippery');
  return {ok:errors.length===0,errors,dimensions:{width,height,depth},mass,grip};
}
export const CHUTE = { x: -1.61, z: 1.35, minX: -2.43, maxX: -.79, minZ: .55, maxZ: 2.15 };
export const CHUTE_SENSOR = {
  minX: CHUTE.minX-.12, maxX: CHUTE.maxX+.12,
  minZ: CHUTE.minZ-.12, maxZ: CHUTE.maxZ+.12,
  maxY: -.28,
};
export const DIFFICULTIES = {
  easy: { name: '容易', force: 13, friction: .85, radius: .36, lift: .70, travel: .72 },
  normal: { name: '標準', force: 8.5, friction: .62, radius: .38, lift: .86, travel: .90 },
  hard: { name: '挑戰', force: 6.5, friction: .54, radius: .40, lift: 1.02, travel: 1.06 },
};
export const STATES = {
  ready: '移動夾爪，搵個靚角度', lowering: '落夾中…', closing: '合爪，試吓握實',
  lifting: '提起中…', returning: '移向出口…', unloading: '出口上方停穩…', releasing: '放開夾爪…',
  settling: '等盒子落定…', won: '夾到喇！', lost: '今次未夾到',
};
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const move = (v, target, amount) => v + clamp(target - v, -amount, amount);
const smooth = value => { const t=clamp(value,0,1);return t*t*(3-2*t); };

// A fixed-step rigid-body world. Pure physics mode never samples randomness.
// The optional, disclosed chance mode draws whether to maintain grip at contact.
// The mechanical carriage is controlled; the boxes remain dynamic at all times.
export class ClawSimulation {
  constructor(onEvent = () => {}, { random = Math.random, level = null } = {}) {
    this.onEvent = onEvent;
    this.random=random;this.mode='physics';this.holdChance=.5;this.chanceHold=null;
    this.world = new C.World({ gravity: new C.Vec3(0, -9.82, 0) });
    this.world.solver.iterations = 20;
    this.world.allowSleep = true;
    this.material = new C.Material('candy-box');
    this.padMaterial = new C.Material('claw-pad');
    this.world.addContactMaterial(new C.ContactMaterial(this.material, this.material, {
      friction: .42, restitution: .035, contactEquationStiffness: 1e7,
    }));
    this.world.addContactMaterial(new C.ContactMaterial(this.padMaterial, this.material, {
      friction: 0, restitution: 0, contactEquationStiffness: 1e8, contactEquationRelaxation: 2,
    }));
    this.staticBodies = [];
    // Split floor leaves a real opening at the front left.
    this.solid(0, -.10, -.785, 4.8, .20, 2.67);
    this.solid(.805, -.10, 1.35, 3.19, .20, 1.60);
    this.solid(0, 1.7, -2.2, 5.0, 3.6, .16);
    this.solid(-2.48, 1.5, 0, .16, 3.2, 4.5);
    this.solid(2.48, 1.5, 0, .16, 3.2, 4.5);
    this.solid(0, 1.5, 2.20, 5.0, 3.2, .16);
    this.solid(CHUTE.x, -1.45, CHUTE.z, 1.64, .16, 1.60);
    this.solid(CHUTE.maxX+.05, -.7, CHUTE.z, .1, 1.4, 1.60);
    this.solid(CHUTE.x, -.7, CHUTE.minZ-.05, 1.64, 1.4, .1);
    this.solid(CHUTE.minX-.05, -.7, CHUTE.z, .1, 1.4, 1.60);
    this.solid(CHUTE.x, -.7, CHUTE.maxZ+.05, 1.64, 1.4, .1);
    this.anchor = new C.Body({ type: C.Body.KINEMATIC, collisionFilterMask: 0, allowSleep: false });
    this.world.addBody(this.anchor);
    this.fingerBodies = Array.from({ length: 3 }, () => {
      const b = new C.Body({ type: C.Body.KINEMATIC, material: this.padMaterial, allowSleep: false,
        shape: new C.Sphere(.13), collisionFilterMask: 0 });
      this.world.addBody(b); return b;
    });
    this.fingerTargets = this.fingerBodies.map(body=>body.position.clone());
    this.boxes = [];
    this.claw = new C.Vec3(0, 3.05, .05);
    this.open = 1;
    this.fingerRadii = [.74,.74,.74];
    this.accumulator = 0;
    this.round = null;this.level=level;this.magnetReady=false;this.magnetActive=false;this.gripConstraint=null;this.stickyConstraint=null;
    this.difficulty = 'normal';
    this.aimRemaining = null;
    this.state = 'ready';
    this.time = 0;
    this.reset();
  }
  solid(x, y, z, w, h, d) {
    const b = new C.Body({ mass: 0, material: this.material, shape: new C.Box(new C.Vec3(w/2,h/2,d/2)),
      position: new C.Vec3(x,y,z) });
    this.world.addBody(b); this.staticBodies.push(b); return b;
  }
  reset() {
    if (this.busy || this.aiming) return false;
    this.detach();
    for (const box of this.boxes) this.world.removeBody(box.body);
    const layout = this.level?.objects || [
      {kind:'bear',x:-.72,z:-.85,yaw:.04},{kind:'penguin',x:.55,z:-.65,yaw:-.18},
      {kind:'penguin',x:-.12,z:.55,yaw:.25},{kind:'bear',x:1.22,z:.75,yaw:-.22},
    ];
    this.boxes = layout.map((entry, i) => {
      const spec=OBJECT_TYPES[entry.kind]||OBJECT_TYPES.bear;
      const size={x:entry.size?.[0]??spec.size[0],y:entry.size?.[1]??spec.size[1],z:entry.size?.[2]??spec.size[2]};
      const shape=entry.kind==='candy'?new C.Sphere(size.x):new C.Box(new C.Vec3(size.x,size.y,size.z));
      const body = new C.Body({ mass: entry.mass??spec.mass, material: this.material,
        shape, position: new C.Vec3(entry.x, size.y+.04, entry.z),
        linearDamping: .22, angularDamping: .34, sleepTimeLimit: .5 });
      body.quaternion.setFromEuler(0, entry.yaw||0, 0);
      this.world.addBody(body);
      return { id: `${this.level?.id||0}-${i}`, kind:entry.kind, body, size, grip:entry.grip??spec.grip,
        holdAssist:Boolean(entry.holdAssist??spec.holdAssist), holdForce:entry.holdForce??spec.holdForce, collected:false };
    });
    this.claw.set(0, 3.05, .05);
    this.open = 1; this.fingerRadii.fill(.74);this.gripStrength=1;this.round = null; this.reason = ''; this.awarded = false; this.aimRemaining = null;this.chanceHold=null;this.magnetReady=false;this.magnetActive=false;this.maxPadPenetration=0;
    this.state = 'ready'; this.time = 0;
    for (let i=0; i<90; i++) { this.syncMechanism(1/120); this.world.step(1/120); }
    this.onEvent({ type: 'reset' });
    return true;
  }
  get busy() { return !['ready','won','lost'].includes(this.state); }
  get aiming() { return this.state === 'ready' && this.aimRemaining !== null; }
  get settings() { return DIFFICULTIES[this.difficulty]; }
  setDifficulty(value) {
    if(this.busy || this.aiming || !DIFFICULTIES[value])return false;
    this.difficulty=value;return true;
  }
  setMode(mode, chance=this.holdChance) {
    if(this.busy || this.aiming || !['physics','chance'].includes(mode) || !Number.isFinite(chance))return false;
    this.mode=mode;this.holdChance=clamp(chance,0,1);return true;
  }
  setLevel(level) {
    if(this.busy||this.aiming||!level?.objects?.length)return false;
    this.level=level;this.difficulty=DIFFICULTIES[level.difficulty]?level.difficulty:this.difficulty;return this.reset();
  }
  prepareMagnet() {
    if(this.state!=='ready'||this.aiming||this.magnetReady)return false;
    this.magnetReady=true;this.onEvent({type:'magnet-ready'});return true;
  }
  beginAim(roundId) {
    if(this.state !== 'ready' || this.aiming)return false;
    this.round=roundId;this.aimRemaining=10;this.chanceHold=null;this.onEvent({type:'aim-start'});return true;
  }
  startMoving(dx,dz,roundId) {
    if(this.state!=='ready'||!Number.isFinite(dx)||!Number.isFinite(dz)||Math.hypot(dx,dz)<.001)return false;
    if(!this.aiming)this.beginAim(roundId);
    return true;
  }
  setState(state) { this.state = state; this.time = 0; this.onEvent({ type: 'state', state }); }
  aim(dx, dz, dt) {
    if (!this.aiming) return;
    const length = Math.max(1, Math.hypot(dx, dz));
    this.claw.x = clamp(this.claw.x + dx / length * dt * 1.45, -1.93, 1.93);
    this.claw.z = clamp(this.claw.z + dz / length * dt * 1.45, -1.66, 1.69);
  }
  assist(kind = 'bear') {
    if (!this.aiming) return false;
    if (kind === 'empty') { this.claw.x = 1.7; this.claw.z = -1.62; }
    else {
      const box = this.boxes.find(b => b.kind === kind && !b.collected && b.body.position.y > -.1);
      if (!box) return false;
      this.claw.x = box.body.position.x; this.claw.z = box.body.position.z;
    }
    return true;
  }
  drop(roundId = this.round, automatic = false) {
    if (!this.aiming) return false;
    this.round = roundId; this.aimRemaining = null;
    this.awarded = false; this.reason = '未接觸到盒子'; this.grabbed = null;
    this.hadGrip=false;this.touching=false;this.slipReported=false;this.gripStrength=1;this.maxPadPenetration=0;
    this.magnetActive=this.magnetReady;this.magnetReady=false;
    this.setState('lowering');this.onEvent({type:'drop',roundId:this.round,automatic});return true;
  }
  retry() {
    if (!['won', 'lost'].includes(this.state)) return false;
    this.clearChute();
    this.claw.set(0, 3.05, .05); this.open = 1; this.round = null; this.aimRemaining=null;this.chanceHold=null;this.magnetActive=false;
    this.setState('ready'); return true;
  }
  // Compliant finger pads: compression plus Coulomb-limited tangential friction.
  // The disclosed sticky booster adds a temporary contact constraint for one grab.
  applyPadContacts() {
    let maxContacts=0,contactBox=null,contactPoint=null;
    for(const box of this.boxes) {
      if(box.collected)continue;
      let count=0,firstPoint=null;
      for(let i=0;i<this.fingerBodies.length;i++) {
        const pad=this.fingerBodies[i],padPosition=this.fingerTargets[i]||pad.position;
        const contact=this.padContact(box,padPosition);if(!contact)continue;
        const {penetration,normal,point}=contact;
        const velocity=box.body.getVelocityAtWorldPoint(point,new C.Vec3());
        const relative=pad.velocity.vsub(velocity);
        const normalVelocity=relative.dot(normal);
        this.maxPadPenetration=Math.max(this.maxPadPenetration,penetration);
        // Collision pressure stays firm enough to keep a pad outside the prize.
        // Grip strength only limits tangential friction, so weak mode still slips
        // without letting a visible claw tip travel through a rigid object.
        const normalForce=clamp(penetration*300-normalVelocity*2.2,0,24);
        if(normalForce<=0)continue;
        const tangent=relative.vsub(normal.scale(normalVelocity));
        const friction=tangent.scale(45);
        const gripNormal=Math.min(normalForce,this.settings.force*this.gripStrength);
        const cap=this.settings.friction*box.grip*gripNormal;
        if(friction.length()>cap)friction.scale(cap/friction.length(),friction);
        const force=normal.scale(-normalForce).vadd(friction);
        box.body.wakeUp();box.body.applyForce(force,point.vsub(box.body.position));count++;firstPoint??=point.clone();
      }
      if(count>maxContacts){maxContacts=count;contactBox=box;contactPoint=firstPoint;}
    }
    this.touching=maxContacts>0;
    if(maxContacts>=2 && !this.hadGrip) {
      this.hadGrip=true;this.grabbed=contactBox;this.reason='盒子滑返落去喇';
      if(contactBox.holdAssist && !this.magnetActive && !this.gripConstraint) {
        const worldPoint=contactPoint||new C.Vec3(this.claw.x,this.claw.y-.66,this.claw.z);
        const anchorPoint=this.anchor.pointToLocalFrame(worldPoint);
        const localPoint=contactBox.body.pointToLocalFrame(worldPoint);
        const maxForce=Math.max(12,contactBox.holdForce||0,this.settings.force*contactBox.grip*2.2);
        this.gripConstraint=new C.PointToPointConstraint(
          this.anchor,anchorPoint,contactBox.body,localPoint,maxForce
        );
        this.world.addConstraint(this.gripConstraint);
      }
      if(this.mode==='chance') {
        this.chanceAtDraw=this.holdChance;
        this.chanceHold=this.random()<this.holdChance;
        this.onEvent({type:'chance',hold:this.chanceHold,chance:this.holdChance});
      }
      this.onEvent({type:'grip',kind:contactBox.kind,contacts:maxContacts});
    }
    if(maxContacts>=1 && this.magnetActive && !this.stickyConstraint && this.state==='closing') {
      const worldPoint=contactPoint||new C.Vec3(this.claw.x,this.claw.y-.66,this.claw.z);
      const anchorPoint=this.anchor.pointToLocalFrame(worldPoint);
      const localPoint=contactBox.body.pointToLocalFrame(worldPoint);
      this.stickyConstraint=new C.PointToPointConstraint(
        this.anchor,anchorPoint,contactBox.body,localPoint,75
      );
      this.world.addConstraint(this.stickyConstraint);
      this.hadGrip=true;this.grabbed=contactBox;this.reason='黏力已接觸，但物件未入出口';
      this.onEvent({type:'sticky',kind:contactBox.kind});
    }
    if(this.hadGrip && !this.touching && !this.gripConstraint && !this.stickyConstraint && !this.slipReported && ['lifting','returning'].includes(this.state)) {
      this.slipReported=true;this.grabbed=null;this.onEvent({type:'slip'});
    }
  }
  detach() {
    if(this.gripConstraint){this.world.removeConstraint(this.gripConstraint);this.gripConstraint=null;}
    if(this.stickyConstraint){this.world.removeConstraint(this.stickyConstraint);this.stickyConstraint=null;}
    this.grabbed = null; this.touching=false;
  }
  clearChute() {
    if(this.busy || this.aiming)return false;
    for(const box of this.boxes) {
      if(box.collected){if(box.body.world)this.world.removeBody(box.body);continue;}
      box.body.updateAABB();const a=box.body.aabb;
      if(a.lowerBound.y>1 || a.upperBound.x<CHUTE.minX || a.lowerBound.x>CHUTE.maxX || a.upperBound.z<CHUTE.minZ || a.lowerBound.z>CHUTE.maxZ)continue;
      // A box hung on the lip is returned to an empty floor slot, without reward.
      const slots=[[-1.6,-1.45],[-.6,-1.45],[.45,-1.45],[1.5,-1.45],[-1.6,-.35],[1.5,-.35],[.4,.85],[1.5,1.1]];
      const slot=slots.find(([x,z])=>this.boxes.every(other=>other===box||other.collected||Math.abs(other.body.position.x-x)>.9||Math.abs(other.body.position.z-z)>.9));
      if(!slot)continue;
      box.body.position.set(slot[0],.43,slot[1]);box.body.quaternion.set(0,0,0,1);
      box.body.velocity.setZero();box.body.angularVelocity.setZero();box.body.force.setZero();box.body.torque.setZero();box.body.aabbNeedsUpdate=true;box.body.wakeUp();
    }
    return true;
  }
  reposition() {
    if(this.busy||this.aiming||this.state!=='ready')return false;
    const layout=this.level?.objects;if(!layout)return false;
    for(let i=0;i<this.boxes.length;i++){
      const box=this.boxes[i],entry=layout[i];if(box.collected||!entry)continue;
      box.body.position.set(entry.x,box.size.y+.04,entry.z);box.body.quaternion.setFromEuler(0,entry.yaw||0,0);
      box.body.velocity.setZero();box.body.angularVelocity.setZero();box.body.force.setZero();box.body.torque.setZero();box.body.aabbNeedsUpdate=true;box.body.wakeUp();
    }
    this.claw.set(0,3.05,.05);this.onEvent({type:'reposition'});return true;
  }
  padContact(box, position) {
    if(box.kind==='candy') {
      const delta=position.vsub(box.body.position),distance=delta.length();
      if(distance<1e-7)return null;
      const penetration=box.size.x+.13-distance;if(penetration<=0)return null;
      const normal=delta.scale(1/distance);
      return {penetration,normal,point:box.body.position.vadd(normal.scale(box.size.x))};
    }
    const local=box.body.pointToLocalFrame(position),size=box.size;
    const nearest=new C.Vec3(clamp(local.x,-size.x,size.x),clamp(local.y,-size.y,size.y),clamp(local.z,-size.z,size.z));
    const delta=local.vsub(nearest);let distance=delta.length(),normal;
    if(distance<1e-7) {
      const axis=size.x-Math.abs(local.x)<size.z-Math.abs(local.z)?'x':'z';
      const sign=local[axis]>=0?1:-1;distance=-(size[axis]-Math.abs(local[axis]));
      normal=new C.Vec3();normal[axis]=sign;nearest[axis]=sign*size[axis];
    } else normal=delta.scale(1/distance);
    const penetration=.13-distance;
    if(penetration<=0||Math.abs(local.y)>size.y+.06||Math.abs(normal.y)>.6)return null;
    box.body.quaternion.vmult(normal,normal);
    return {penetration,normal,point:box.body.pointToWorldFrame(nearest)};
  }
  padPenetrationAt(position) {
    let deepest=0;
    for(const box of this.boxes) {
      if(box.collected)continue;
      deepest=Math.max(deepest,this.padContact(box,position)?.penetration||0);
    }
    return deepest;
  }
  limitedFingerRadius(index, desired) {
    if(!['closing','lifting','returning','unloading','releasing'].includes(this.state))return desired;
    const a=index*Math.PI*2/3;
    const at=radius=>new C.Vec3(this.claw.x+Math.cos(a)*radius,this.claw.y-.66,this.claw.z+Math.sin(a)*radius);
    const compression=.04;
    if(this.padPenetrationAt(at(desired))<=compression)return desired;
    // Approach from the open side and stop each hinged finger independently at
    // the first rigid surface. This works for boxes, balls and long objects.
    let inner=desired,outer=.74;
    while(outer<1.34&&this.padPenetrationAt(at(outer))>compression)outer+=.1;
    for(let i=0;i<14;i++) {
      const middle=(inner+outer)/2;
      if(this.padPenetrationAt(at(middle))>compression)inner=middle;
      else outer=middle;
    }
    return outer;
  }
  syncMechanism(dt) {
    const follow = (b, p) => {
      p.vsub(b.position, b.velocity); b.velocity.scale(1/dt, b.velocity);
      // The kinematic body reaches p in this upcoming fixed physics step.
    };
    follow(this.anchor, this.claw);
    const radius = this.settings.radius + this.open * (.74-this.settings.radius);
    this.fingerBodies.forEach((body, i) => {
      const a = i*Math.PI*2/3;
      this.fingerRadii[i]=this.limitedFingerRadius(i,radius);
      const target=new C.Vec3(this.claw.x + Math.cos(a)*this.fingerRadii[i], this.claw.y-.66, this.claw.z+Math.sin(a)*this.fingerRadii[i]);
      this.fingerTargets[i].copy(target);follow(body,target);
      // Closing/lifting use finite pad forces; no infinitely strong kinematic pinch.
      // Cannon blocks the downward approach; compliant hinged stops handle the
      // sideways close without adding an unlimited kinematic carrying force.
      body.collisionFilterMask = this.state==='lowering' ? -1 : 0;
    });
  }
  advance(realDt, direction = { x: 0, z: 0 }) {
    if(this.aiming) {
      // Countdown is elapsed active time, independent of the physics catch-up cap.
      this.aimRemaining=Math.max(0,this.aimRemaining-Math.max(0,realDt));
      if(this.aimRemaining<1e-7)this.drop(this.round,true);
    }
    // Slow/background frames never become a giant catch-up impulse.
    this.accumulator += Math.min(Math.max(realDt,0), .10);
    while(this.accumulator >= 1/120) {
      this.tick(1/120, direction); this.accumulator -= 1/120;
    }
  }
  tick(dt, direction) {
    this.time += dt;
    this.aim(direction.x, direction.z, dt);
    if (this.state === 'lowering') {
      let target = .92;
      for(const { body, collected, kind } of this.boxes) {
        if(!collected && Math.hypot(body.position.x-this.claw.x,body.position.z-this.claw.z)<.72)
          target = Math.max(target, body.position.y+(kind==='candy'?.54:.66));
      }
      this.claw.y = move(this.claw.y, target, dt*1.12);
      if(this.claw.y <= target+.003) this.setState('closing');
    } else if(this.state === 'closing') {
      // Ease into contact and let the box settle before raising the carriage.
      this.open = 1-smooth(this.time/.85);
      if(this.time >= 1.02) this.setState('lifting');
    } else if(this.state === 'lifting') {
      // A weak draw reduces motor pressure gradually after a short lift.
      // The fingers stay closed; gravity/friction cause the slip, not a snap-open.
      if(this.mode==='chance' && this.chanceHold===false)this.gripStrength=1-.96*smooth((this.time-.65)/1.2);
      this.claw.y = move(this.claw.y,3.05,dt*this.settings.lift*smooth(this.time/.4));
      if(this.claw.y >= 3.047) this.setState('returning');
    } else if(this.state === 'returning') {
      const dx=CHUTE.x-this.claw.x, dz=CHUTE.z-this.claw.z;
      const d=Math.hypot(dx,dz), step=Math.min(d,dt*this.settings.travel);
      if(d>.004) { this.claw.x+=dx/d*step; this.claw.z+=dz/d*step; }
      else this.setState('unloading');
    } else if(this.state === 'unloading') {
      if(this.time>=.4){
        // The carriage pauses over the opening before release. Remove the
        // remaining pendulum swing so long prizes drop through the chute
        // instead of being flung across its front lip.
        if(this.grabbed&&!this.grabbed.collected){
          this.grabbed.body.velocity.x*=.12;this.grabbed.body.velocity.z*=.12;
          this.grabbed.body.angularVelocity.scale(.35,this.grabbed.body.angularVelocity);
        }
        this.detach();this.setState('releasing');
      }
    } else if(this.state === 'releasing') {
      this.open = Math.min(1,this.time/.5);
      if(this.time>=.5) this.setState('settling');
    }
    this.syncMechanism(dt);
    // Once detached above the chute, opening fingers no longer push the prize
    // sideways; gravity owns the drop from that point.
    if(['closing','lifting','returning','unloading'].includes(this.state))this.applyPadContacts();
    this.world.step(dt);
    if(this.busy && this.round) {
      for(const box of this.boxes) {
        const p=box.body.position;
        if(!box.collected && p.y < CHUTE_SENSOR.maxY && p.x>CHUTE_SENSOR.minX && p.x<CHUTE_SENSOR.maxX && p.z>CHUTE_SENSOR.minZ && p.z<CHUTE_SENSOR.maxZ) {
          box.collected = true; this.awarded = true;
          this.onEvent({ type: 'reward', roundId: this.round, prizeId: box.id, kind: box.kind });
          this.world.removeBody(box.body);
        }
      }
    }
    if(this.state === 'settling' && this.time > 1.8) {
      this.setState(this.awarded ? 'won' : 'lost');this.clearChute();this.magnetActive=false;
      this.onEvent({ type: 'result', won: this.awarded, reason: this.awarded ? '盒子已跌入虛擬收藏出口' : this.reason });
    }
  }
  snapshot() {
    return { state:this.state, claw:{x:this.claw.x,y:this.claw.y,z:this.claw.z},
      boxes:this.boxes.map(b=>({ kind:b.kind, collected:b.collected, size:b.size, position:b.body.position.toArray(), quaternion:b.body.quaternion.toArray() })) };
  }
}
