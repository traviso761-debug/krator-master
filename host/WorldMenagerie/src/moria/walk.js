// ---------- going about under the mountain: walking, flying, the map, and the tours ----------
// Fan work from Tolkien.
//
// The engine's camera orbits a point on the ground, which is right for a city under the sky and wrong for one
// inside a mountain: from outside the halls it looks at rock, and pulled back inside them it goes through the
// wall. So under the mountain this page has a camera of its own, on the engine's camera stack (ctx.pushCam):
//
//   Walk   at a Dwarf's eye height, on the floors the halls and stairs were carved with (carve.js): W A S D,
//          drag to look, Shift to hurry. You go up and down the stairs by walking up and down them, you cannot
//          walk through walls, pillars, houses or hearths, and you cannot walk off the edge of a terrace, into
//          the pit, or onto the Bridge once it has fallen
//   Fly    the same look, no floor and no walls: W A S D along the look, Q and E down and up
//   Map    the plan of the city, every floor coloured by its level, and where you are on it. Click anywhere on
//          a floor to be walking there. The places are buttons too
//   Tours  a walk that walks itself, looking where it goes: the Fellowship's road from the great hall up to
//          Mazarbul, down to the Bridge and out to the gate; down into the city, through the Mansions to the
//          forges and the mines; and up the Kings' Stair to the throne and the cistern. Any key or drag stops it
//
// A viewpoint chosen while walking puts you on the floor under it; one with no floor under it hands the camera
// back to the engine. Esc does too. #walk, #walk=<place>, #fly, #tour=<fellowship|city|kings> and #map open that way.
import { trackKeys } from '../core/input.js';
import { HALLS,FLOOR,LEVEL,SEVENTH } from './plan.js';

export function walk(api){
  const {THREE,C,ctx,camera,animHooks,onUI,HASH0}=api;
  const M=ctx.moria||{},FL=M.floors||[],BL=M.blocks||[],H=HALLS;
  const EYE=1.45,D=1.5;

  // ---- the floors, and what stands on them ----
  const onStrip=(f,x,z)=>{const [ax,az,ay]=f.a,[bx,bz,by]=f.b,dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1,t=((x-ax)*dx+(z-az)*dz)/L2;
    if(t<-0.02||t>1.02)return null;const px=ax+dx*t,pz=az+dz*t;if((x-px)**2+(z-pz)**2>(f.w/2)**2)return null;
    const u=Math.max(0,Math.min(1,t));return ay+(by-ay)*u+(f.arc?f.arc*Math.sin(Math.PI*u):0);};
  const floorsAt=(x,z)=>{const out=[];for(const f of FL){if(f.when&&!f.when())continue;let y=null;
    if(f.rect){const [x0,x1,z0,z1]=f.rect;if(x>=x0&&x<=x1&&z>=z0&&z<=z1)y=f.y;}else y=onStrip(f,x,z);if(y!==null)out.push([y,f]);}return out;};
  // the floor under a foot at y: the nearest one within a step of it
  const floorNear=(x,z,y,reach=1.9)=>{let best=null,bd=1e9;for(const q of floorsAt(x,z)){const d=Math.abs(q[0]-y);if(d<=reach&&d<bd){bd=d;best=q;}}return best;};
  // the floor under a point in the air: the highest one below it
  const floorBelow=(x,z,y)=>{let best=null;for(const q of floorsAt(x,z))if(q[0]<=y+0.5&&(!best||q[0]>best[0]))best=q;return best;};
  const blocked=(x,z,y)=>{const r=0.45;for(const b of BL){if(y<b[4]-0.5||y>b[5]-0.3)continue;if(x>b[0]-r&&x<b[1]+r&&z>b[2]-r&&z<b[3]+r)return true;}return false;};
  const levelName=y=>{const n=Math.round((y-FLOOR)/LEVEL);if(Math.abs(y-FLOOR)>900)return '';
    const ord=['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Eleventh','Twelfth'];
    return n===0?'the level of the Gates':n>0?(ord[n]||(n+1)+'th')+' Level':(ord[-n-1]||(-n)+'th')+' Deep';};

  // ---- the places, and the tours ----
  const W0=H.mansions[4],F0=H.forges[4],DV0=H.delvings[4],T0=H.throne[4],CY=FLOOR+2*LEVEL;
  const PLACES={   // [x, z, y, look (the way you face: 0 east, pi/2 south, pi west, -pi/2 north)], and a label
    dwarrowdelf:[3760,0,FLOOR,0,'The Dwarrowdelf'],mansions:[4200,330,W0,Math.PI/2,'The Mansions'],forges:[4620,425,F0,0,'The Forges'],
    delvings:[4800,715,DV0,Math.PI/2,'The Delvings'],throne:[4150,-480,T0,-Math.PI/2,'The Throne'],cistern:[3890,-610,CY,Math.PI,'The Cistern'],
    twentyfirst:[4712,-360,SEVENTH,0,'Twenty-first Hall'],mazarbul:[4944,-356,SEVENTH,0,'Mazarbul'],second:[4760,0,FLOOR,0,'The Second Hall'],
    bridge:[5150,0,FLOOR,0,'The Bridge'],first:[5200,0,FLOOR,0,'The First Hall'],westgate:[-5990,900,905,0,'Inside the Doors'],guard:[-3008,697,1060,0,'The guard-room']};
  const TOURS={
    fellowship:['The Fellowship\'s road',[[3720,0],[4532,0],[4532,-172],[4560,-172],[4560,-356],[4700,-360],[4935,-360],[4945,-354],[4953,-349],[4953,-60],[4953,-8],[5060,-8],[5165,0],[5192,0],[5585,0]]],
    city:['Down into the city',[[4200,-10],[4200,176],[4200,304],[4200,470],[4236,492],[4574,500],[4588,440],[4588,410],[4640,425],[4800,440],[4800,516],[4800,704],[4800,730],[4700,740],[4700,840]]],
    kings:['The throne and the cistern',[[4150,-10],[4150,-176],[4150,-464],[4150,-650],[4150,-612],[3955,-610],[3895,-610],[3490,-610]]]};

  // ---- the state ----
  const W={mode:'orbit',x:0,y:0,z:0,fy:0,name:'',seen:null,t:0,tour:null,vx:0,vy:0,vz:0};
  const keys=trackKeys({arrows:true,onKey:(k,e,held)=>{
    if(k==='escape'&&W.mode!=='orbit'){leave();return;}
    if(held&&W.tour){W.tour=null;status();}
    if(held)return;
    if(k==='m')toggleMap();
    if(k==='f'&&W.mode!=='orbit')setMode(W.mode==='walk'?'fly':'walk');}});
  let saved=null;const CAM=C.camera||{};
  function take(ctl){if(!saved){saved={near:camera.near};camera.near=0.25;camera.updateProjectionMatrix();}ctl.elMin=-1.45;ctl.elMax=1.45;}
  function leave(){const ctl=W.ctl;W.mode='orbit';W.tour=null;
    if(saved){camera.near=saved.near;camera.updateProjectionMatrix();saved=null;}
    if(ctl){const back=dirOf(ctl);ctl.target.set(W.x,W.y+EYE,W.z).addScaledVector(back,-20);ctl.dist=20;ctl.elMin=CAM.elMin!==undefined?CAM.elMin:0.03;ctl.elMax=CAM.elMax!==undefined?CAM.elMax:1.5;}
    status();}
  const dirOf=ctl=>new THREE.Vector3(Math.cos(ctl.az)*Math.cos(ctl.el),Math.sin(ctl.el),Math.sin(ctl.az)*Math.cos(ctl.el));
  // put the walker at x, z on the floor nearest y, facing `look` (radians, 0 east); false if there is no floor
  function placeAt(x,z,y,look,near){const q=near?floorNear(x,z,y,6):floorBelow(x,z,y);if(!q)return false;
    W.x=x;W.z=z;W.y=W.fy=q[0];W.name=q[1].name||'';if(W.ctl&&look!==undefined){W.ctl.az=look+Math.PI;W.ctl.el=0.02;}return true;}
  function goPlace(key){const p=PLACES[key];if(!p)return;W.pending=()=>{placeAt(p[0],p[1],p[2],p[3],true);setMode('walk');};}
  function setMode(m){W.mode=m;if(m==='fly'){W.vy=0;}status();}
  function startTour(key){const T=TOURS[key];if(!T)return;const [x,z]=T[1][0];
    W.pending=()=>{const q=floorsAt(x,z).sort((a,b)=>a[0]-b[0]);const want=key==='city'||key==='kings'||key==='fellowship'?FLOOR:q.length?q[0][0]:FLOOR;
      if(!placeAt(x,z,want,undefined,true))return;setMode('walk');W.tour={pts:T[1],i:1,label:T[0]};status();};}

  // ---- the frame ----
  const back=new THREE.Vector3(),look=new THREE.Vector3();
  ctx.pushCam(frame);
  function frame(now,ctl){W.ctl=ctl;
    // time is taken in steps of no more than 80 ms, so a slow frame walks as far as a fast one, not less
    const DT=Math.min(0.6,(now-(W.t||now))/1000);W.t=now;
    if(W.pending){const f=W.pending;W.pending=null;take(ctl);f();if(W.mode==='orbit'){if(saved){camera.near=saved.near;camera.updateProjectionMatrix();saved=null;}return;}}
    // a viewpoint from the panel (or an event's "Go and look"): walk there if there is a floor under it, and
    // otherwise give the engine its camera back
    if(ctl.goal&&ctl.goal!==W.seen){W.seen=ctl.goal;if(W.mode!=='orbit'){const g=ctl.goal,p=new THREE.Vector3(Math.cos(g.az)*Math.cos(g.el),Math.sin(g.el),Math.sin(g.az)*Math.cos(g.el)).multiplyScalar(g.dist).add(g.target);
        // the address being read back (it holds the camera as it is) makes a goal too: one that would leave the
        // camera where it already is is no reason to stop a tour
        if(p.distanceTo(camera.position)<3){ctl.goal=null;W.seen=null;}
        else{W.tour=null;if(W.mode==='fly'){W.x=p.x;W.y=p.y-EYE;W.z=p.z;ctl.az=g.az;ctl.el=g.el;ctl.goal=null;}
        else if(placeAt(p.x,p.z,p.y)){ctl.az=g.az;ctl.el=Math.max(-0.6,Math.min(0.6,g.el));ctl.goal=null;}
        else{leave();return;}}}}
    W.seen=ctl.goal;
    if(W.mode==='orbit')return;
    take(ctl);
    back.copy(dirOf(ctl));look.copy(back).negate();
    const fx=-Math.cos(ctl.az),fz=-Math.sin(ctl.az),rx=-fz,rz=fx;
    for(let left=DT;left>1e-4;left-=0.08){const dt=Math.min(0.08,left);
    if(W.mode==='walk'){
      let mx=0,mz=0;
      if(W.tour){// the tour walks itself: toward the next point, turning to face it
        const T=W.tour,p=T.pts[T.i],dx=p[0]-W.x,dz=p[1]-W.z,d=Math.hypot(dx,dz);
        if(d<1.2){T.i++;if(T.i>=T.pts.length){W.tour=null;status();}}
        else{const sp=6*(keys.has('shift')?3:1)*dt,k=Math.min(1,sp/d);mx=dx*k;mz=dz*k;
          const want=Math.atan2(-dz,-dx);let da=want-ctl.az;da=Math.atan2(Math.sin(da),Math.cos(da));ctl.az+=da*Math.min(1,dt*2.5);ctl.el+=(0.04-ctl.el)*Math.min(1,dt*2);}}
      else{const sp=5*(keys.has('shift')?4:1)*dt;let f=0,s=0;
        if(keys.has('w')||keys.has('arrowup'))f++;if(keys.has('s')||keys.has('arrowdown'))f--;if(keys.has('d')||keys.has('arrowright'))s++;if(keys.has('a')||keys.has('arrowleft'))s--;
        if(f||s){const n=Math.hypot(f,s);mx=(fx*f+rx*s)/n*sp;mz=(fz*f+rz*s)/n*sp;}}
      if(mx||mz){const tryMove=(nx,nz)=>{const q=floorNear(nx,nz,W.fy);if(!q||blocked(nx,nz,q[0]))return false;W.x=nx;W.z=nz;W.fy=q[0];W.name=q[1].name||W.name;return true;};
        tryMove(W.x+mx,W.z+mz)||tryMove(W.x+mx,W.z)||tryMove(W.x,W.z+mz);}
      else{const q=floorNear(W.x,W.z,W.fy);if(q)W.fy=q[0];}
      W.y+=(W.fy-W.y)*Math.min(1,dt*10);}
    else{// flying: along the look, pitch and all
      const sp=25*(keys.has('shift')?5:1)*dt;let f=0,s=0,u=0;
      if(keys.has('w')||keys.has('arrowup'))f++;if(keys.has('s')||keys.has('arrowdown'))f--;if(keys.has('d')||keys.has('arrowright'))s++;if(keys.has('a')||keys.has('arrowleft'))s--;if(keys.has('e'))u++;if(keys.has('q'))u--;
      W.x+=(look.x*f+rx*s)*sp;W.y+=(look.y*f+u)*sp;W.z+=(look.z*f+rz*s)*sp;
      const q=floorBelow(W.x,W.z,W.y+EYE);W.name=q?q[1].name||'':'';}}
    back.copy(dirOf(ctl));look.copy(back).negate();
    ctl.target.set(W.x,W.y+EYE,W.z).addScaledVector(look,D);ctl.dist=D;ctl.goal=null;W.seen=null;
    if(now-(W.st||0)>250){W.st=now;status();drawMap();}}

  // ---- the panel: modes, the map, the places, the tours ----
  const UI={};
  const status=()=>{if(!UI.read)return;const where=W.mode==='orbit'?'Looking on':W.mode==='fly'?'Flying':W.tour?'Touring: '+W.tour.label:'Walking';
    const lv=W.mode==='orbit'?'':levelName(W.y);if(ctx.details)ctx.details.walk=[W.mode,W.name,lv,Math.round(W.x),Math.round(W.y),Math.round(W.z)].join(' | ');UI.read.textContent=where+(W.mode!=='orbit'&&W.name?' · '+W.name:'')+(lv?' · '+lv:'');
    if(UI.bWalk){UI.bWalk.setAttribute('aria-pressed',String(W.mode==='walk'));UI.bFly.setAttribute('aria-pressed',String(W.mode==='fly'));}};
  // the map's frame: the east end of the city, where the halls are; the road from the West-gate comes in from
  // off the left edge
  const MX0=3340,MX1=5660,MZ0=-1130,MZ1=1010,CW=270,CH=Math.round(CW*(MZ1-MZ0)/(MX1-MX0));
  const toPx=(x,z)=>[(x-MX0)/(MX1-MX0)*CW,(z-MZ0)/(MZ1-MZ0)*CH],toW=(px,py)=>[MX0+px/CW*(MX1-MX0),MZ0+py/CH*(MZ1-MZ0)];
  const colourOf=y=>{const n=(y-FLOOR)/LEVEL;if(n<-0.5)return `hsl(${28+n*1.5},${50}%,${Math.max(22,40+n*1.6)}%)`;if(n>0.5)return `hsl(${205},${40}%,${Math.min(72,48+n*3)}%)`;return 'hsl(40,8%,52%)';};
  let base=null;
  function paintBase(){base=document.createElement('canvas');base.width=CW;base.height=CH;const g=base.getContext('2d');g.fillStyle='#0c0b0d';g.fillRect(0,0,CW,CH);
    const list=[...FL].sort((a,b)=>(a.y!==undefined?a.y:Math.max(a.a[2],a.b[2]))-(b.y!==undefined?b.y:Math.max(b.a[2],b.b[2])));
    for(const f of list){if(f.rect){const [x0,x1,z0,z1]=f.rect,[a,b]=toPx(x0,z0),[c,d]=toPx(x1,z1);g.fillStyle=colourOf(f.y);g.fillRect(a,b,Math.max(1,c-a),Math.max(1,d-b));}
      else{const [a,b]=toPx(f.a[0],f.a[1]),[c,d]=toPx(f.b[0],f.b[1]);g.strokeStyle=colourOf((f.a[2]+f.b[2])/2);g.lineWidth=Math.max(1.5,f.w/(MX1-MX0)*CW);g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();}}
    // the chasm, and the pit of the Delvings, black
    const hole=(x0,x1,z0,z1)=>{const [a,b]=toPx(x0,z0),[c,d]=toPx(x1,z1);g.fillStyle='#000';g.fillRect(a,b,c-a,d-b);};hole(5170,5186,-200,200);
    g.fillStyle='#b8b0a0';g.font='9px Helvetica,Arial,sans-serif';
    for(const [t,x,z] of [['Mansions',4200,560],['Forges',4790,405],['Delvings',4830,960],['Throne',4150,-600],['Cistern',3670,-560],['Dwarrowdelf',4200,-60],['21st Hall',4820,-420],['Second Hall',4960,-70],['First Hall',5380,-45]]){const [a,b]=toPx(x,z);g.fillText(t,a-t.length*2.2,b);}
    const [ra,rb]=toPx(MX0,120);g.fillText('← the West-gate, 10 km',ra+2,rb);}
  function drawMap(){if(!UI.map||UI.map.style.display==='none')return;if(!base)paintBase();const g=UI.map.getContext('2d');g.drawImage(base,0,0);
    const p=W.mode==='orbit'?camera.position:{x:W.x,z:W.z};const [a,b]=toPx(p.x,p.z);const ctl=W.ctl;
    if(ctl){const ang=Math.atan2(-Math.sin(ctl.az),-Math.cos(ctl.az));g.fillStyle='rgba(255,230,160,0.35)';g.beginPath();g.moveTo(a,b);g.arc(a,b,16,ang-0.5,ang+0.5);g.closePath();g.fill();}
    g.fillStyle=W.mode==='orbit'?'#9fd0ff':'#ffe08a';g.beginPath();g.arc(a,b,3.5,0,7);g.fill();g.strokeStyle='#000';g.lineWidth=1;g.stroke();
    if(UI.hover)g.fillStyle='#e8e0d0',g.font='10px Helvetica,Arial,sans-serif',g.fillText(UI.hover,4,CH-6);}
  function toggleMap(on){if(!UI.panel)return;const show=on===undefined?UI.panel.style.display==='none':on;UI.panel.style.display=show?'flex':'none';if(UI.bMap)UI.bMap.setAttribute('aria-pressed',String(show));drawMap();}
  function enterWalk(){// from wherever the camera is: the floor under it if it is in a hall, or the great hall
    const p=camera.position,q=floorBelow(p.x,p.z,p.y);W.tour=null;
    if(q&&p.y-q[0]<40){W.pending=()=>{placeAt(p.x,p.z,p.y);setMode('walk');};}else goPlace('dwarrowdelf');}
  onUI(({mkBtn,ui,el})=>{
    // a drag to look round stops a tour, as a key does
    el.addEventListener('pointerdown',()=>{if(W.tour){W.tour=null;status();}});
    UI.bWalk=mkBtn('Walk',ui,()=>{if(W.mode==='walk')leave();else if(W.mode==='fly')setMode('walk');else enterWalk();});
    UI.bWalk.title='Walk the halls at a Dwarf\'s eye height: W A S D, drag to look, Shift to hurry, Esc to stop';
    UI.bFly=mkBtn('Fly',ui,()=>{if(W.mode==='fly')leave();else if(W.mode==='walk')setMode('fly');else{const p=camera.position;W.x=p.x;W.y=p.y-EYE;W.z=p.z;W.pending=()=>setMode('fly');}});
    UI.bFly.title='Fly anywhere, through the rock if you like: W A S D along the look, Q and E down and up';
    UI.bMap=mkBtn('Map',ui,()=>toggleMap());UI.bMap.title='The plan of the city (M): click a floor to walk there';
    const panel=document.createElement('div');panel.id='moriamap';panel.style.cssText='position:fixed;left:10px;bottom:40px;display:none;flex-direction:column;gap:4px;z-index:6;background:rgba(10,10,12,.9);border:1px solid #5e5a52;padding:6px;font:11px Helvetica,Arial,sans-serif;color:#e6e2d8;max-width:'+(CW+2)+'px';
    UI.read=document.createElement('div');UI.read.style.cssText='min-height:14px';panel.appendChild(UI.read);
    const cv=document.createElement('canvas');cv.width=CW;cv.height=CH;cv.style.cssText='cursor:crosshair;display:block';panel.appendChild(cv);UI.map=cv;
    const at=e=>{const r=cv.getBoundingClientRect();return toW((e.clientX-r.left)*CW/r.width,(e.clientY-r.top)*CH/r.height);};
    cv.addEventListener('mousemove',e=>{const [x,z]=at(e),q=floorsAt(x,z);UI.hover=q.length?(q.sort((a,b)=>b[0]-a[0])[0][1].name||'')+' · '+levelName(q[0][0]):'';drawMap();});
    cv.addEventListener('mouseleave',()=>{UI.hover='';drawMap();});
    cv.addEventListener('click',e=>{const [x,z]=at(e),q=floorsAt(x,z);if(!q.length)return;
      // of the floors there, the one nearest the level you are on
      const y0=W.mode==='orbit'?FLOOR:W.y;q.sort((a,b)=>Math.abs(a[0]-y0)-Math.abs(b[0]-y0));const y=q[0][0];
      W.tour=null;W.pending=()=>{placeAt(x,z,y,undefined,true);setMode('walk');};});
    const row=()=>{const d=document.createElement('div');d.style.cssText='display:flex;flex-wrap:wrap;gap:3px';panel.appendChild(d);return d;};
    const sub=t=>{const d=document.createElement('div');d.textContent=t;d.style.cssText='color:#a8a090;margin-top:2px';panel.appendChild(d);};
    sub('Places');const pr=row();for(const [k,p] of Object.entries(PLACES)){const b=mkBtn(p[4],pr,()=>goPlace(k));b.style.fontSize='11px';b.style.padding='2px 5px';}
    sub('Tours');const tr=row();for(const [k,[label]] of Object.entries(TOURS)){const b=mkBtn(label,tr,()=>startTour(k));b.style.fontSize='11px';b.style.padding='2px 5px';}
    const tip=document.createElement('div');tip.style.cssText='color:#8a8478;line-height:1.35';tip.textContent='W A S D to walk, drag to look, Shift to hurry. F: walk or fly. M: this map. Esc: stop.';panel.appendChild(tip);
    document.body.appendChild(panel);UI.panel=panel;status();
    // the address
    const h=HASH0||'',w=/(^|&)walk(=([a-z0-9]+))?(&|$)/.exec(h),t=/(^|&)tour=([a-z]+)/.exec(h);
    if(/(^|&)map(&|$)/.test(h))toggleMap(true);
    if(t)startTour(t[2]);else if(w)(w[3]&&PLACES[w[3]]?goPlace(w[3]):enterWalk());else if(/(^|&)fly(&|$)/.test(h))UI.bFly.click();});
  ctx.walk={W,PLACES,TOURS,floorsAt,goPlace,startTour,leave};
  ctx.details=Object.assign(ctx.details||{},{walkFloors:FL.length,walkBlocks:BL.length});
}
