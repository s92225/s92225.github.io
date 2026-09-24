import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BOX, CHUTE } from './physics.js';
import { createPrizeModel } from './object-models.js';

export class CabinetView {
  constructor(container, simulation, settings) {
    this.sim = simulation; this.settings = settings; this.container = container; this.disposed=false;
    this.renderer = new T.WebGLRenderer({ antialias:true, alpha:false, powerPreference:'low-power' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    this.renderer.shadowMap.enabled=true;
    this.renderer.shadowMap.type=T.PCFSoftShadowMap;
    this.renderer.toneMapping=T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=.92;
    this.renderer.domElement.setAttribute('aria-label','即時 3D 夾公仔機：前左方設有紫色出口');
    this.renderer.domElement.setAttribute('role','img');
    container.append(this.renderer.domElement);
    this.scene=new T.Scene(); this.scene.background=new T.Color('#efe5fb');
    this.camera=new T.PerspectiveCamera(37,1,.1,80);
    this.scene.add(this.camera);this.celebration=null;
    this.side=false;this.closeUp=false;this.setView(false);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);
    this.controls.target.set(0,1.12,0);
    this.controls.enablePan=false;
    this.controls.minDistance=6.8;this.controls.maxDistance=18;
    this.controls.minPolarAngle=.35;this.controls.maxPolarAngle=1.42;
    this.controls.minAzimuthAngle=-1.45;this.controls.maxAzimuthAngle=1.45;
    this.controls.rotateSpeed=.55;this.controls.zoomSpeed=.8;
    this.controls.touches={ONE:T.TOUCH.ROTATE,TWO:T.TOUCH.DOLLY_PAN};
    this.controls.addEventListener('start',()=>container.dispatchEvent(new CustomEvent('camera-manual')));
    this.controls.update();
    this.crosshairEnabled=false;
    this.envGenerator=new T.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.environment=this.envGenerator.fromScene(room,.04); room.dispose();
    this.scene.environment=this.environment.texture;
    this.scene.environmentIntensity=.6;
    this.scene.add(new T.HemisphereLight(0xffffff,0xbaa0d4,1));
    const light=new T.DirectionalLight(0xfff0e7,2.2);light.position.set(-3,7,5); light.castShadow=true;
    light.shadow.mapSize.set(1024,1024); light.shadow.camera.left=-4; light.shadow.camera.right=4;
    light.shadow.camera.top=5; light.shadow.camera.bottom=-4; light.shadow.normalBias=.025;
    this.scene.add(light); this.scene.add(light.target);
    const fill=new T.PointLight(0x91f5ee,8,12); fill.position.set(3,3,-1); this.scene.add(fill);
    this.materials={
      frame:new T.MeshPhysicalMaterial({color:'#e79ebe',metalness:.28,roughness:.26,clearcoat:1}),
      lavender:new T.MeshPhysicalMaterial({color:'#bfa2e1',metalness:.25,roughness:.28,clearcoat:1}),
      cream:new T.MeshStandardMaterial({color:'#fff7ed',roughness:.35}),
      silver:new T.MeshPhysicalMaterial({color:'#d7cfe5',metalness:.9,roughness:.2}),
      glass:new T.MeshPhysicalMaterial({color:'#efdcff',transparent:true,opacity:.10,roughness:.09,metalness:.08,depthWrite:false,side:T.DoubleSide}),
      dark:new T.MeshStandardMaterial({color:'#594264',roughness:.7}),
      glow:new T.MeshStandardMaterial({color:'#fff0c8',emissive:'#ffdca8',emissiveIntensity:1.7}),
      mint:new T.MeshPhysicalMaterial({color:'#a4eada',roughness:.22,clearcoat:1}),
      tissue:new T.MeshPhysicalMaterial({color:'#ffc4d5',roughness:.36,clearcoat:.65}),
      tissueLabel:new T.MeshPhysicalMaterial({color:'#a9eee5',roughness:.28,clearcoat:.72}),
      paper:new T.MeshPhysicalMaterial({color:'#fffdfb',roughness:.72,clearcoat:.08,side:T.DoubleSide}),
      darkSoft:new T.MeshStandardMaterial({color:'#8b5c87',roughness:.55}),
      phoneCase:new T.MeshPhysicalMaterial({color:'#8f63cf',metalness:.18,roughness:.22,clearcoat:1}),
      screen:new T.MeshPhysicalMaterial({color:'#201d32',metalness:.15,roughness:.12,clearcoat:1}),
      phoneMetal:new T.MeshPhysicalMaterial({color:'#d6b8ff',metalness:.32,roughness:.18,clearcoat:1}),
      camera:new T.MeshPhysicalMaterial({color:'#292039',metalness:.42,roughness:.12,clearcoat:1}),
      mouse:new T.MeshPhysicalMaterial({color:'#8fe5d7',roughness:.28,clearcoat:.86}),
      mouseButton:new T.MeshPhysicalMaterial({color:'#d9fff7',roughness:.27,clearcoat:.78}),
      mouseSeam:new T.MeshStandardMaterial({color:'#4f9d94',roughness:.5}),
      scroll:new T.MeshPhysicalMaterial({color:'#7550a8',roughness:.33,clearcoat:.7}),
      bottle:new T.MeshPhysicalMaterial({color:'#73dfd2',transparent:true,opacity:.72,roughness:.10,transmission:.12,clearcoat:1,depthWrite:false}),
      bottleCap:new T.MeshPhysicalMaterial({color:'#7651aa',roughness:.25,clearcoat:.9}),
      bottleLabel:new T.MeshPhysicalMaterial({color:'#ffd1df',transparent:true,opacity:.92,roughness:.3,clearcoat:.55,side:T.DoubleSide}),
      bearBody:new T.MeshPhysicalMaterial({color:'#ff9bb7',roughness:.22,clearcoat:1}),
      bearLight:new T.MeshPhysicalMaterial({color:'#ffe9e3',roughness:.36,clearcoat:.65}),
      bearDark:new T.MeshPhysicalMaterial({color:'#3e2947',roughness:.25,clearcoat:.72}),
      penguinBody:new T.MeshPhysicalMaterial({color:'#59c8b8',roughness:.22,clearcoat:1}),
      penguinBelly:new T.MeshPhysicalMaterial({color:'#f3fffb',roughness:.42,clearcoat:.42}),
      orange:new T.MeshPhysicalMaterial({color:'#ffb94f',roughness:.31,clearcoat:.65}),
      candyGold:new T.MeshPhysicalMaterial({color:'#ffd45c',emissive:'#9b6500',emissiveIntensity:.07,roughness:.21,clearcoat:1}),
      candyPink:new T.MeshPhysicalMaterial({color:'#ff83a9',roughness:.25,clearcoat:.9}),
      giftBody:new T.MeshPhysicalMaterial({color:'#ffb5ca',roughness:.28,clearcoat:.9}),
      giftLid:new T.MeshPhysicalMaterial({color:'#ffd3df',roughness:.27,clearcoat:.86}),
      ribbon:new T.MeshPhysicalMaterial({color:'#8752ca',roughness:.24,clearcoat:1}),
      wandPurple:new T.MeshPhysicalMaterial({color:'#8752ca',roughness:.25,clearcoat:.95}),
      wandMint:new T.MeshPhysicalMaterial({color:'#6bd1c0',roughness:.25,clearcoat:.95}),
      jellyBody:new T.MeshPhysicalMaterial({color:'#79ddcf',transparent:true,opacity:.86,roughness:.1,transmission:.08,clearcoat:1}),
      jellyBand:new T.MeshPhysicalMaterial({color:'#fff5fb',transparent:true,opacity:.94,roughness:.3,clearcoat:.65}),
    };
    this.buildCabinet(); this.buildClaw(); this.boxMeshes=[];
    this.syncBoxes();
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(container);this.resize();
    this.onContextLost=e=>{e.preventDefault(); this.contextLost=true;container.dispatchEvent(new CustomEvent('webgl-lost'));};
    this.renderer.domElement.addEventListener('webglcontextlost',this.onContextLost);
  }
  rounded(w,h,d,r=.07) { return new RoundedBoxGeometry(w,h,d,3,r); }
  part(w,h,d,x,y,z,mat,r=.04,parent=this.scene) {
    const mesh=new T.Mesh(this.rounded(w,h,d,r),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  buildCabinet() {
    const m=this.materials;
    // Complete cabinet: raised plinth, enclosed lower housing and pickup hatch.
    this.part(5.25,.20,4.8,0,-1.65,0,m.lavender,.10);
    this.part(5.08,1.44,2.86,0,-.83,-.72,m.frame,.12);
    this.part(3.36,1.44,1.65,.82,-.83,1.5,m.frame,.12);
    this.part(.17,1.44,1.7,CHUTE.minX-.05,-.83,1.48,m.frame);
    this.part(1.74,.25,.19,CHUTE.x,-.2,2.31,m.lavender);
    this.part(1.74,.26,.19,CHUTE.x,-1.41,2.31,m.lavender);
    for(const x of [CHUTE.minX-.05,CHUTE.maxX+.05])this.part(.14,1.1,.19,x,-.80,2.31,m.lavender);
    this.part(1.55,.85,.04,CHUTE.x,-.81,2.23,m.dark);
    const hatchLabel=this.textPlane('虛擬收藏出口','#e8dbfb','#654984',768,128);
    hatchLabel.position.set(CHUTE.x,-1.4,2.418);hatchLabel.scale.set(1.38,.23,1);this.scene.add(hatchLabel);
    this.part(2.7,1.04,.08,.78,-.83,2.345,m.mint,.10);
    const lowerLabel=this.textPlane('CANDY JELLY','#a4eada','#3d7a75',1024,170);
    lowerLabel.position.set(.78,-.64,2.398);lowerLabel.scale.set(2.25,.38,1);this.scene.add(lowerLabel);
    const lowerSub=this.textPlane('夾 一 份 小 快 樂','#a4eada','#4c8980',768,110);
    lowerSub.position.set(.78,-1.08,2.398);lowerSub.scale.set(1.78,.26,1);this.scene.add(lowerSub);
    for(const x of [-2.13,2.13])for(const z of [-1.9,1.9])this.part(.35,.20,.35,x,-1.83,z,m.dark,.10);
    // Open-top cabinet with a front marquee and exposed moving rail.
    this.part(5.35,.63,.35,0,4.18,2.24,m.frame,.12);
    this.part(5.18,.06,.06,0,3.89,2.45,m.glow,.025);
    const sign=this.textPlane('CANDY JELLY','#e79ebe','#633c79',1200,150);
    sign.position.set(0,4.18,2.42);sign.scale.set(3.95,.49,1);this.scene.add(sign);
    for(const x of [-2.23,2.23]) {
      const candy=new T.Mesh(new T.SphereGeometry(.15,20,16),m.mint);
      candy.position.set(x,4.2,2.44);this.scene.add(candy);
    }
    // Floor and front-left chute use the same dimensions as the collision world.
    this.part(4.8,.15,2.67,0,-.075,-.785,m.lavender);
    this.part(3.19,.15,1.60,.805,-.075,1.35,m.lavender);
    this.part(1.64,.12,1.60,CHUTE.x,-1.35,CHUTE.z,m.dark);
    this.part(.08,1.35,1.60,CHUTE.maxX+.05,-.63,CHUTE.z,m.dark);
    this.part(1.64,1.35,.08,CHUTE.x,-.63,CHUTE.minZ-.05,m.dark);
    this.part(.08,1.35,1.60,CHUTE.minX-.05,-.63,CHUTE.z,m.dark);
    this.part(1.64,1.35,.08,CHUTE.x,-.63,CHUTE.maxZ+.05,m.dark);
    this.part(.08,.10,1.64,CHUTE.maxX+.05,.03,CHUTE.z,m.frame);
    this.part(1.68,.10,.08,CHUTE.x,.03,CHUTE.minZ-.05,m.frame);
    this.part(1.68,.10,.08,CHUTE.x,.03,CHUTE.maxZ+.05,m.frame);
    this.part(4.99,.22,.20,0,-.04,2.27,m.frame,.06);
    this.part(4.99,.22,.20,0,-.04,-2.27,m.frame,.06);
    for(const x of [-2.5,2.5]) {
      this.part(.18,.22,4.65,x,-.04,0,m.frame,.06);
      for(const z of [-2.27,2.27]) {
        this.part(.12,3.8,.12,x,1.83,z,m.frame);
        if(z<0) this.part(.035,3.3,.035,x*.97,1.8,z+.03,m.glow,.015);
      }
      this.part(.03,3.55,4.3,x,1.85,0,m.glass,.01);
    }
    this.part(5.1,.20,.22,0,3.75,-2.27,m.frame);
    this.part(5.1,.15,.15,0,3.75,2.27,m.frame);
    for(const x of [-2.5,2.5]) this.part(.17,.17,4.6,x,3.75,0,m.frame);
    // Soft illustrated backboard is decorative; all prizes/claw are true 3D.
    const backBase=new T.Mesh(new T.PlaneGeometry(4.8,3.3),new T.MeshBasicMaterial({color:'#eadffc',side:T.DoubleSide,toneMapped:false}));
    backBase.position.set(0,1.75,-2.19);this.scene.add(backBase);
    const backMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false,toneMapped:false});
    const back=new T.Mesh(new T.PlaneGeometry(4.8,3.3),backMaterial);back.position.set(0,1.75,-2.18);back.renderOrder=1;this.scene.add(back);
    new T.TextureLoader().load('/assets/mascots.png',texture=>{if(this.disposed){texture.dispose();return;}texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());this.backTexture=texture;backMaterial.map=texture;backMaterial.opacity=1;backMaterial.needsUpdate=true;},undefined,()=>{backMaterial.opacity=0;});
    for(let x=-1.9;x<2;x+=.48) {
      this.part(.09,.035,.09,x,.025,-1.93,m.glow,.015);
    }
    const label=this.textPlane('虛擬收藏出口 ↓','#f8eaff','#6c438f',512,110);
    label.position.set(CHUTE.x,.09,1.84);label.rotation.x=-Math.PI/2;
    label.scale.set(1.13,.24,1);this.scene.add(label);
    // Rail and travelling carriage.
    this.rail=this.part(4.65,.075,.075,0,3.57,0,m.silver);
    this.carriage=this.part(.42,.18,.34,0,3.55,0,m.lavender);
    this.targetRing=new T.Mesh(new T.RingGeometry(.22,.245,48),new T.MeshBasicMaterial({color:'#7447c8',side:T.DoubleSide,transparent:true,opacity:.7,depthWrite:false}));
    this.targetRing.rotation.x=-Math.PI/2;this.scene.add(this.targetRing);
    this.targetCross=[];
    for(let i=0;i<2;i++) {
      const line=this.part(i?.018:.28,.007,i?.28:.018,0,.014,0,new T.MeshBasicMaterial({color:'#7447c8'}),.001);
      this.targetCross.push(line);
    }
    this.magnetRing=new T.Mesh(new T.RingGeometry(.58,.66,64),new T.MeshBasicMaterial({color:'#ff79aa',side:T.DoubleSide,transparent:true,opacity:.76,depthWrite:false}));
    this.magnetRing.rotation.x=-Math.PI/2;this.magnetRing.position.y=.025;this.magnetRing.visible=false;this.scene.add(this.magnetRing);
  }
  textPlane(text,bg,fg,w=512,h=128) {
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ctx.font='bold 48px "Microsoft JhengHei", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=fg;ctx.fillText(text,w/2,h/2);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    return new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}));
  }
  badgeSprite(text,color='#7447c8') {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;
    const ctx=canvas.getContext('2d'),rounded=(x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();};
    ctx.shadowColor='#5a347238';ctx.shadowBlur=18;ctx.shadowOffsetY=7;rounded(18,18,476,124,54);
    const gradient=ctx.createLinearGradient(18,18,494,142);gradient.addColorStop(0,'#fffaff');gradient.addColorStop(.55,'#f7eaff');gradient.addColorStop(1,'#fff4d3');ctx.fillStyle=gradient;ctx.fill();ctx.shadowColor='transparent';
    ctx.strokeStyle=color;ctx.lineWidth=9;rounded(18,18,476,124,54);ctx.stroke();
    for(const x of [48,464]){ctx.fillStyle=color;ctx.globalAlpha=.18;ctx.beginPath();ctx.arc(x,80,24,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle=color;ctx.font='bold 25px sans-serif';ctx.fillText('✦',x,83);}
    ctx.fillStyle=color;ctx.font='bold 62px "Microsoft JhengHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,80);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));
    sprite.scale.set(1.24,.39,1);sprite.renderOrder=20;return sprite;
  }
  clearPrizeMeshes() {
    for(const b of this.boxMeshes) {
      const geometries=new Set();
      for(const object of [b.mesh])if(object){object.traverse?.(node=>{if(node.geometry)geometries.add(node.geometry);});this.scene.remove(object);}
      for(const geometry of geometries)geometry.dispose();
      if(b.badge){this.scene.remove(b.badge);b.badge.material.map.dispose();b.badge.material.dispose();}
    }
    this.boxMeshes=[];
  }
  syncBoxes() {
    const changed=this.boxMeshes.length!==this.sim.boxes.length || this.boxMeshes.some((b,i)=>b.box!==this.sim.boxes[i]);
    if(changed) {
      this.clearPrizeMeshes();
      this.boxMeshes=this.sim.boxes.map(box=>{
        const s=box.size||BOX;let geometry,mesh=createPrizeModel(box.kind,s,this.materials);
        const fallback=box.kind==='candy'?this.materials.glow:['jelly','bottle','mouse'].includes(box.kind)?this.materials.mint:['wand','phone'].includes(box.kind)?this.materials.lavender:this.materials.frame;
        if(!mesh){
          if(box.kind==='candy')geometry=new T.IcosahedronGeometry(s.x,1);
          else if(box.kind==='jelly')geometry=new T.CapsuleGeometry(s.x,Math.max(.05,s.y*2-s.x*2),8,18);
          else geometry=this.rounded(s.x*2,s.y*2,s.z*2,box.kind==='wand'?.07:.035);
          mesh=new T.Mesh(geometry,fallback);mesh.castShadow=true;mesh.receiveShadow=true;
        }
        this.scene.add(mesh);
        const badgeText=box.kind==='candy'?'+5':'';
        const badge=badgeText?this.badgeSprite(badgeText,'#b47a13'):null;
        if(badge)this.scene.add(badge);
        return {box,mesh,badge};
      });
    }
    for(const {box,mesh,badge} of this.boxMeshes) {
      mesh.position.copy(box.body.position);mesh.quaternion.copy(box.body.quaternion);
      mesh.visible=!box.collected && box.body.position.y> -1.2;
      if(badge){badge.visible=mesh.visible;badge.position.set(box.body.position.x,box.body.position.y+box.size.y+.42,box.body.position.z);}
    }
  }
  buildClaw() {
    this.clawGroup=new T.Group();this.scene.add(this.clawGroup);
    const head=new T.Mesh(new T.CylinderGeometry(.19,.23,.36,32),this.materials.silver);
    head.position.y=.12;head.castShadow=true;this.clawGroup.add(head);
    const ring=new T.Mesh(new T.TorusGeometry(.22,.04,12,32),this.materials.frame);ring.rotation.x=Math.PI/2;ring.position.y=-.03;this.clawGroup.add(ring);
    this.arms=[];
    for(let i=0;i<3;i++) {
      const rods=Array.from({length:2},()=>{const mesh=new T.Mesh(new T.CylinderGeometry(.035,.035,1,12),this.materials.silver);mesh.castShadow=true;this.clawGroup.add(mesh);return mesh;});
      const tip=new T.Mesh(new T.SphereGeometry(.13,16,12),this.materials.frame);this.clawGroup.add(tip);
      this.arms.push({rods,tip});
    }
    this.cable=new T.Mesh(new T.CylinderGeometry(.022,.022,1,12),this.materials.dark);this.scene.add(this.cable);
  }
  rod(mesh,from,to) {
    const direction=to.clone().sub(from);mesh.position.copy(from).add(to).multiplyScalar(.5);
    mesh.scale.set(1,direction.length(),1);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());
  }
  setView(side) {
    this.side=side;
    this.camera.position.set(...(this.closeUp?(side?[9.3,5.2,3.3]:[3.8,5.3,8.8]):(side?[12.2,5.5,5.8]:[6,5.5,12])));
    this.camera.lookAt(0,this.closeUp?1.45:1.12,0);
    if(this.controls){this.controls.target.set(0,this.closeUp?1.45:1.12,0);this.controls.update();}
  }
  setCloseUp(value) {
    this.closeUp=value;
    const offset=this.camera.position.clone().sub(this.controls.target).setLength(value?10.3:14.1);
    this.controls.target.y=value?1.45:1.12;
    this.camera.position.copy(this.controls.target).add(offset);this.controls.update();
  }
  zoomBy(factor) {
    const offset=this.camera.position.clone().sub(this.controls.target);
    offset.setLength(T.MathUtils.clamp(offset.length()*factor,this.controls.minDistance,this.controls.maxDistance));
    this.camera.position.copy(this.controls.target).add(offset);this.controls.update();
    this.container.dispatchEvent(new CustomEvent('camera-manual'));
  }
  starTexture() {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const ctx=canvas.getContext('2d');
    ctx.translate(48,48);ctx.beginPath();for(let i=0;i<10;i++){const r=i%2?16:40,a=-Math.PI/2+i*Math.PI/5;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();
    const glow=ctx.createRadialGradient(0,0,2,0,0,44);glow.addColorStop(0,'#fff');glow.addColorStop(.35,'#fff8ae');glow.addColorStop(1,'#ffd85a00');ctx.shadowColor='#fff2a0';ctx.shadowBlur=14;ctx.fillStyle=glow;ctx.fill();
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
  }
  clearCelebration() {
    if(!this.celebration)return;
    this.camera.remove(this.celebration.root);
    for(const effect of this.celebration.effects){effect.geometry?.dispose();effect.material?.map?.dispose();effect.material?.dispose();}
    this.celebration=null;
  }
  celebrate(kind) {
    this.clearCelebration();
    const source=[...this.boxMeshes].reverse().find(item=>item.box.kind===kind&&item.box.collected)||this.boxMeshes.find(item=>item.box.kind===kind);if(!source)return;
    const root=new T.Group(),holder=new T.Group(),model=source.mesh.clone(true);model.position.set(0,0,0);model.quaternion.identity();model.scale.set(1,1,1);
    const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),max=Math.max(size.x,size.y,size.z,.1);
    model.position.copy(center).multiplyScalar(-1);holder.userData.baseScale=1.55/max;holder.scale.setScalar(holder.userData.baseScale);holder.add(model);root.add(holder);
    const count=64,positions=new Float32Array(count*3),colors=new Float32Array(count*3),angles=new Float32Array(count),speeds=new Float32Array(count),delays=new Float32Array(count),palette=['#ffd85a','#ff77a8','#9b7ae8','#62d7c2','#ffffff'];
    for(let i=0;i<count;i++){angles[i]=i/count*Math.PI*2+(i%5)*.13;speeds[i]=.9+(i%9)*.13;delays[i]=(i%7)*.025;const color=new T.Color(palette[i%palette.length]);color.toArray(colors,i*3);}
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('color',new T.BufferAttribute(colors,3));
    const points=new T.Points(geometry,new T.PointsMaterial({size:.18,map:this.starTexture(),transparent:true,opacity:1,vertexColors:true,depthTest:false,depthWrite:false,blending:T.AdditiveBlending}));points.renderOrder=50;root.add(points);
    const rings=[0,1,2].map((_,i)=>{const ring=new T.Mesh(new T.RingGeometry(.47,.51,64),new T.MeshBasicMaterial({color:palette[i+1],transparent:true,opacity:.8,depthTest:false,depthWrite:false,side:T.DoubleSide}));ring.position.set((i-1)*.58,(i%2?.32:-.22),.15);ring.scale.setScalar(.05);ring.renderOrder=48;root.add(ring);return ring;});
    root.position.set(0,.05,-4.2);this.camera.add(root);this.celebration={root,holder,points,rings,effects:[points,...rings],positions,angles,speeds,delays,start:performance.now()};
  }
  updateCelebration() {
    const c=this.celebration;if(!c)return;const elapsed=(performance.now()-c.start)/1000,t=elapsed%2.2;
    const pop=t<.32?T.MathUtils.lerp(.2,1.12,T.MathUtils.smoothstep(t,0,.32)):1+Math.sin((t-.32)*4.5)*.055;c.holder.scale.setScalar(c.holder.userData.baseScale*pop);
    c.holder.rotation.y=elapsed*2.1;c.holder.rotation.z=Math.sin(elapsed*5)*.07;c.holder.position.y=.12+Math.sin(elapsed*4.5)*.09;
    for(let i=0;i<c.angles.length;i++){const local=Math.max(0,t-c.delays[i]),distance=c.speeds[i]*local*(1-local*.19),j=i*3;c.positions[j]=Math.cos(c.angles[i])*distance;c.positions[j+1]=Math.sin(c.angles[i])*distance+local*.28-local*local*.20;c.positions[j+2]=.18+(i%4)*.035;}
    c.points.geometry.attributes.position.needsUpdate=true;c.points.material.opacity=T.MathUtils.clamp(Math.min(t*5,(2.2-t)*1.8),0,1);
    c.rings.forEach((ring,i)=>{const local=Math.max(0,t-i*.18),scale=.05+local*2.1;ring.scale.setScalar(scale);ring.material.opacity=Math.max(0,.7-local*.65);});
  }
  resize() {
    const {width,height}=this.container.getBoundingClientRect();if(!width||!height)return;
    this.camera.aspect=width/height;
    // Camera distance adapts to narrow portrait containers without clipping.
    this.camera.fov=this.camera.aspect < .85 ? 44 : 37;this.camera.updateProjectionMatrix();
    this.renderer.setSize(width,height,false);
  }
  render() {
    if(this.disposed || this.contextLost)return;
    this.syncBoxes();const c=this.sim.claw;
    this.clawGroup.position.copy(c);
    this.rail.position.z=c.z;this.carriage.position.set(c.x,3.55,c.z);
    this.rod(this.cable,new T.Vector3(c.x,c.y+.3,c.z),new T.Vector3(c.x,3.55,c.z));
    this.arms.forEach(({rods,tip},i)=>{
      const a=i*Math.PI*2/3, radius=this.sim.fingerRadii[i];
      const p1=new T.Vector3(Math.cos(a)*.18,-.02,Math.sin(a)*.18);
      const p2=new T.Vector3(Math.cos(a)*(radius+.11),-.37,Math.sin(a)*(radius+.11));
      const p3=new T.Vector3(Math.cos(a)*radius,-.66,Math.sin(a)*radius);
      this.rod(rods[0],p1,p2);this.rod(rods[1],p2,p3);tip.position.copy(p3);
    });
    this.targetRing.position.set(c.x,.014,c.z);
    this.targetRing.visible=this.crosshairEnabled&&this.sim.state==='ready';
    this.targetCross.forEach(l=>{l.position.set(c.x,.016,c.z);l.visible=this.crosshairEnabled&&this.sim.state==='ready';});
    this.magnetRing.position.set(c.x,.026,c.z);
    this.magnetRing.visible=(this.sim.magnetReady||this.sim.magnetActive)&&['ready','lowering','closing'].includes(this.sim.state);
    this.updateCelebration();
    this.renderer.render(this.scene,this.camera);
  }
  dispose() {
    this.disposed=true;this.clearCelebration();this.controls.dispose();this.observer.disconnect();
    this.renderer.domElement.removeEventListener('webglcontextlost',this.onContextLost);
    const geometries=new Set(),materials=new Set(),textures=new Set();
    this.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));if(o.isLight&&o.shadow)o.shadow.dispose();});
    Object.values(this.materials).forEach(m=>materials.add(m));
    for(const m of materials) {for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();}
    for(const t of textures)t.dispose();for(const g of geometries)g.dispose();
    this.environment.dispose();this.envGenerator.dispose();this.renderer.dispose();this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
