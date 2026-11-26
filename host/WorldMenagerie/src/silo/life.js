// Silo 18: the people. Anonymous figures only, no one in particular: residents standing about on the landings and
// in the farms, people going up and down the stair, porters with loads on their backs, and the one in the suit.
import {mkRng} from '../core/rng.js';
import {LH,NL,RS,RW,yL,kindOf,zoneOf,cafeTables,CAFE} from './levels.js';
import {STAIR,landA} from './levels.js';
const TAU=Math.PI*2;

// a person, about 1.75 m, feet at 0, facing +x: legs, hips, a torso narrowing to the shoulders, arms, neck, head
// and hair, out of rounded pieces (a few hundred vertices; it is drawn as instances). Seated: thighs forward, the
// shins down, the hands on the table. Nobody in particular.
export function personGeo(K,o={}){const k=K.kit(),{G}=K,b=o.bulk||1,col='#ffffff',sk=o.head||'#d8b898',hair=o.hair||'#3a2e26';
  const limb=(ax,ay,az,bx,by,bz,r,c)=>k.pipe('p',c||col,ax,ay,az,bx,by,bz,r,G.cyl6);
  if(o.seated){for(const sd of [-1,1]){limb(0,0.47,0.1*sd*b,0.42,0.47,0.1*sd*b,0.075*b);limb(0.42,0.47,0.1*sd*b,0.44,0.02,0.1*sd*b,0.06*b);k.add('p',G.box,'#2a2622',0.5,0.03,0.1*sd*b,{sx:0.24,sy:0.06,sz:0.1});}
    limb(0,0.45,0,0,0.62,0,0.15*b);k.add('p',G.cyl,col,0,0.92,0,{sx:0.17*b,sy:0.6,sz:0.2*b});
    for(const sd of [-1,1]){if(o.lap){limb(0,1.16,0.24*sd*b,0.06,0.86,0.25*sd*b,0.05*b);limb(0.06,0.86,0.25*sd*b,0.3,0.6,0.12*sd*b,0.045*b);}
      else{limb(0,1.16,0.24*sd*b,0.18,0.86,0.24*sd*b,0.05*b);limb(0.18,0.86,0.24*sd*b,0.45,0.8,0.14*sd*b,0.045*b);}}
    limb(0,1.22,0,0,1.3,0,0.05,sk);k.add('p',G.sph,sk,0.01,1.42,0,{sx:0.1*b,sy:0.12*b,sz:0.1*b});k.add('p',G.sph,hair,-0.015,1.47,0,{sx:0.104*b,sy:0.09*b,sz:0.104*b});
    return k.build().p;}
  for(const sd of [-1,1]){limb(0,0.05,0.1*sd*b,0,0.86,0.1*sd*b,0.07*b);k.add('p',G.box,'#2a2622',0.05,0.03,0.1*sd*b,{sx:0.26,sy:0.06,sz:0.1});}
  k.add('p',G.cyl,col,0,0.92,0,{sx:0.15*b,sy:0.14,sz:0.19*b});
  k.add('p',G.cyl,col,0,1.18,0,{sx:0.15*b,sy:0.42,sz:0.22*b});
  for(const sd of [-1,1]){limb(0,1.36,0.25*sd*b,0.02,1.04,0.27*sd*b,0.05*b);limb(0.02,1.04,0.27*sd*b,0.06,0.78,0.26*sd*b,0.045*b);k.add('p',G.sph,sk,0.06,0.74,0.26*sd*b,{sx:0.045,sy:0.05,sz:0.035});}
  limb(0,1.38,0,0,1.47,0,0.05,sk);k.add('p',G.sph,o.visor?col:sk,0.01,1.6,0,{sx:0.1*b,sy:0.12*b,sz:0.1*b});
  if(o.visor)k.add('p',G.box,'#202428',0.1*b,1.6,0,{sx:0.04,sy:0.1,sz:0.16});else k.add('p',G.sph,hair,-0.015,1.65,0,{sx:0.104*b,sy:0.09*b,sz:0.104*b});
  return k.build().p;}

export function buildLife(api,M){
  const {THREE,scene}=api,R=mkRng(4418),K=M.K;
  const CLOTH={top:['#c8c4b8','#8a96a0','#a89070','#6e7a84','#8a6a5a','#b0a890'],mid:['#6f8a5a','#8a9a6a','#a89a6a','#5e7a5e'],deep:['#4a5a7a','#5a6a80','#7a6a5a','#40506a'],it:['#c0c4c8','#a8b0b8']};
  const c=new THREE.Color(),o=new THREE.Object3D(),out={};
  const geo=personGeo(K),mat=new THREE.MeshLambertMaterial({vertexColors:true,clippingPlanes:M.clip});
  // (the residents round the levels are src/silo/crowd.js, drawn near the camera; here the diners and the stair)
  out.residents=[];out.residentCount=0;
  // ---- diners at the cafeteria's tables ----
  // (two ways of sitting: leaning in with the hands on the table, or sat back with them in the lap; a little turned)
  {const seats=[];for(const t of cafeTables())for(const ch of t.chairs)if(R()<0.27)seats.push(ch);
    const poses=[personGeo(K,{seated:true}),personGeo(K,{seated:true,lap:true})],y=yL(1),ims=poses.map((g,j)=>new THREE.InstancedMesh(g,mat,seats.length)),cnt=[0,0];
    seats.forEach((ch,i)=>{const j=R()<0.55?0:1,im=ims[j],sc=0.92+R()*0.14;o.position.set(ch.x+ch.bx*0.4,y+0.02,ch.z+ch.bz*0.4);o.rotation.set(0,-ch.face+(R()-0.5)*0.5,0);o.scale.set(sc,sc,sc);o.updateMatrix();
      im.setMatrixAt(cnt[j],o.matrix);im.setColorAt(cnt[j],c.set(CLOTH.top[(R()*6)|0]).multiplyScalar(0.8+R()*0.35));cnt[j]++;});
    ims.forEach((im,j)=>{im.count=cnt[j];im.frustumCulled=false;scene.add(im);out.residents.push(im);});out.residentCount+=seats.length;
    // and two behind the counter
    const cook=new THREE.InstancedMesh(personGeo(K),mat,2),K1=CAFE[0]+13*Math.PI/180;
    for(let j=0;j<2;j++){const a=K1-1.6/(RW+8+j*9),r=RW+8+j*9;o.position.set(Math.cos(a)*r,y,Math.sin(a)*r);o.rotation.set(0,-K1-Math.PI/2,0);o.scale.set(1,1,1);o.updateMatrix();cook.setMatrixAt(j,o.matrix);cook.setColorAt(j,c.set('#e8e6e0'));}
    cook.frustumCulled=false;scene.add(cook);out.residents.push(cook);out.residentCount+=2;}
  // ---- the stair: people going down on the outside of the treads, up on the inside; a few porters loaded ----
  {const n=150,smat=new THREE.MeshLambertMaterial({vertexColors:true});const im=new THREE.InstancedMesh(geo,smat,n+1),packs=new THREE.InstancedMesh(new THREE.BoxGeometry(0.55,0.75,0.5),new THREE.MeshLambertMaterial({color:'#7a5a3a'}),n+1);
    const W=[];for(let i=0;i<n;i++){const down=R()<0.55;W.push({L:1+R()*(NL-2),v:(0.012+R()*0.02)*(down?1:-1),porter:R()<0.3,ph:R()*10});
      const z=i<n*0.3?'top':i<n*0.65?'mid':'deep';im.setColorAt(i,c.set(CLOTH[z][i%4]));}
    im.setColorAt(n,c.set('#8a6a4a'));
    im.frustumCulled=packs.frustumCulled=false;scene.add(im,packs);
    // where someone at (fractional) level L is on the stair, in its lane
    const at=(L,lane,t)=>{const f=L-1,th=landA(1+Math.floor(f))+(f%1)*STAIR.span,y=yL(1)-f*LH,r=lane;return {x:Math.cos(th)*r,y:y+Math.abs(Math.sin(t*6))*0.05,z:Math.sin(th)*r,th};};
    out.stairAt=at;
    let np=0;const place=(i,L,dir,t,porter)=>{const lane=dir>0?STAIR.rout-0.8:STAIR.rin+1.0,p=at(L,lane,t);
      // facing along the stair: going down is the way the angle grows
      const ry=-(p.th+(dir>0?Math.PI/2:-Math.PI/2));o.position.set(p.x,p.y,p.z);o.rotation.set(0,ry,0);o.scale.set(1,1,1);o.updateMatrix();im.setMatrixAt(i,o.matrix);
      if(porter){o.position.set(p.x-Math.cos(ry)*0.32,p.y+1.18,p.z+Math.sin(ry)*0.32);o.updateMatrix();packs.setMatrixAt(np++,o.matrix);}};
    out.walkers={tick(t,dt,porterRun){np=0;
        const act=Math.min(W.length,out.walkers.active==null?W.length:out.walkers.active);
        for(let i=0;i<act;i++){const w=W[i];w.L+=w.v*dt;if(w.L>NL-1){w.L=NL-1;w.v=-Math.abs(w.v);}if(w.L<1){w.L=1;w.v=Math.abs(w.v);}place(i,w.L,w.v,t+w.ph,w.porter);}
        if(porterRun){place(act,porterRun.L,1,t,true);im.count=act+1;}else im.count=act;
        packs.count=np;im.instanceMatrix.needsUpdate=true;packs.instanceMatrix.needsUpdate=true;}};}
  // ---- the one in the suit: white, bulky, a dark visor ----
  {const g=personGeo(K,{bulk:1.35,head:'#e8e8e4',visor:true}),m=new THREE.MeshLambertMaterial({vertexColors:true,color:'#f0efe8'});
    const suit=new THREE.Mesh(g,m);suit.visible=false;suit.layers.enable(1);scene.add(suit);out.suit=suit;
    // the tank on its back
    const tank=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.6,10),new THREE.MeshLambertMaterial({color:'#bcb8ae'}));tank.position.set(-0.42,1.2,0);suit.add(tank);tank.layers.enable(1);}
  return out;
}
