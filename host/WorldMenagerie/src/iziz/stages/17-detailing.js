// ---------- 6. detailing pass: cornices, deco window strips, doorways, roof furniture ----------
const cornices=new THREE.InstancedMesh(boxG,bldM.clone(),6000);
const stripM=darkM.clone();stripM.emissive=new THREE.Color(0xffb870);stripM.emissiveIntensity=0.9;
setEnv(stripM,{id:'win',vpars:'attribute vec3 izLightT;varying float izLit;\n'+GLSL_LIT,fpars:'varying float izLit;\n',vbody:'izLit=izLitAt(izHour,izLightT);\n',
  fbody:'#ifdef USE_INSTANCING_COLOR\ntotalEmissiveRadiance*=vColor.r*izLit;\n#else\ntotalEmissiveRadiance*=izLit;\n#endif\n'});   // window mask (instance colour) times the building's own schedule
// each building lights up at its own moment across dusk (the core a little earlier); a few burn all night
let curLight={on:18,off:23};
function buildingLight(x,z){const h1=hash3(x,z,1),h2=hash3(x,z,2),h3=hash3(x,z,3);const p=polar(x,z),r01=clamp(p.r/wallR(p.t),0,1);
  return {on:17.05+2.35*clamp(0.6*h1+0.4*r01,0,1),off:h3<0.05?29.5+1.2*h2:21.5+3.4*h2};}
const strips=new THREE.InstancedMesh(withLightT(boxG,16000),stripM,16000);strips.userData.noShadow=true;
const roofBits=new THREE.InstancedMesh(boxG,bldM.clone(),7000);cornices.material.userData.weather=false;roofBits.material.userData.weather=false;
let nc=0,ns=0,nrb=0;const tc=new THREE.Color();
const C=(...a)=>{if(nc<6000)put(cornices,nc++,...a);};
const St=(...a)=>{if(ns<16000){setLT(strips,ns,curLight.on+0.22*hash3(ns,0.5,7),curLight.off+0.25*hash3(ns,1.5,9),-1);put(strips,ns++,...a,rnd()<0.55?0xffffff:0x000000);}};
const StD=(...a)=>{if(ns<16000)put(strips,ns++,...a,0x000000);};   // doors and the like: never lit
const Rb=(...a)=>{if(nrb<7000)put(roofBits,nrb++,...a);};
const StX=(...a)=>{if(ns<16000){setLT(strips,ns,curLight.on+0.22*hash3(ns,0.5,7),curLight.off+0.25*hash3(ns,1.5,9),-1);put(strips,ns++,...a,xr()<0.6?0xffffff:0x000000);}};   // extra windows, drawn from the second random source
const doors=[];   // [x,y,z,ry] with local +z facing out
function door(x,y,z,ry,w,h){const q=loc(x,z,0,0,ry);StD(q[0],y,q[1],w,h,0.5,ry);
  const lq=loc(x,z,0,0.35,ry);Rb(lq[0],y+h,lq[1],w+1,0.35,0.9,ry,0x8a6a3a);
  const jl=loc(x,z,-w/2-0.25,0.2,ry),jr=loc(x,z,w/2+0.25,0.2,ry);Rb(jl[0],y,jl[1],0.4,h,0.6,ry,0x8a6a3a);Rb(jr[0],y,jr[1],0.4,h,0.6,ry,0x8a6a3a);
  const st=loc(x,z,0,0.9,ry);Rb(st[0],y-0.1,st[1],w+1.2,0.35,1.2,ry,0xb09068);
  doors.push(x,y,z,ry);}
function loc(x,z,lx,lz,ry){return [x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];}
// a detailed block: body + stepped cornice + vertical window strips + door
function block(x,y,z,w,h,d,ry,cc,opts){
  opts=opts||{};
  B(x,y,z,w,h,d,ry,cc);
  tc.set(cc);const lighter=tc.clone().multiplyScalar(1.12),darker=tc.clone().multiplyScalar(0.78);
  // Mayan stepped cornice: a band that overhangs, then a smaller cap
  C(x,y+h-1.14,z,w+0.9,1.2,d+0.9,ry,lighter);
  if(h>9)C(x,y+h-2.6,z,w+0.4,0.6,d+0.4,ry,darker);
  // deco vertical strips on the two long faces
  if(h>8&&!opts.plain){
    const n=Math.max(1,Math.round(w/2.4)),sh=h-2.8;
    for(let i=0;i<n;i++){const lx=-w/2+(i+0.5)*(w/n);
      let q=loc(x,z,lx,d/2+0.12,ry);St(q[0],y+1,q[1],0.7,sh,0.25,ry);
      q=loc(x,z,lx,-d/2-0.12,ry);St(q[0],y+1,q[1],0.7,sh,0.25,ry);}
  }
  // doorway on the +z face
  if(!opts.noDoor){const q=loc(x,z,0,d/2+0.1,ry);door(q[0],y,q[1],ry,1.8,3);
    if(rnd()<0.3){const a=loc(x,z,0,d/2+1.3,ry);Aw(a[0],y+3.4,a[1],Math.min(w*0.8,5),0.25,2.2,ry,pick(AWN));}}
  // roof furniture: a small penthouse box, a vent stack, or an antenna
  if(opts.roof){const r=rnd();
    if(r<0.45)Rb(x+rr(-w*.2,w*.2),y+h,z+rr(-d*.2,d*.2),w*.35,rr(1.5,3),d*.35,ry,darker);
    else if(r<0.75)Rb(x+rr(-w*.3,w*.3),y+h,z+rr(-d*.3,d*.3),0.8,rr(2,4),0.8,ry,darker);
    else Rb(x,y+h,z,0.4,rr(4,9),0.4,ry,darker);}
}

// the big static sets: cut into sectors after the build so the far side of the city can be culled (see the culling stage); cat keeps their wireframe colour
for(const im of [boxes,frusts,domes,lights,tyrells,wedges,pents,hepts,gables,cornices,roofBits,strips,vigas,awnings,neons]){im.userData.sector=true;im.userData.cat='city';}
// ---- phase 1: decide every lot (kind, footprint, params) ----
const lots=[];
const BARRACKS=[0.35,1.15,3.4,4.35].map(a=>({x:PALACE.x+63*Math.cos(a),z:PALACE.z+63*Math.sin(a),a:a,rad:22,fx:18,fz:12,ry:-(a+Math.PI/2),fixed:true}));
BARRACKS.forEach(b=>lots.push(b));
lots.push({x:ARENA.x,z:ARENA.z,fx:50,fz:30,ry:0,rad:59,fixed:true},{x:ARENA.x,z:ARENA.z,fx:30,fz:42,ry:0,rad:52,fixed:true});   // ellipse approximated by a cross of rectangles
lots.push({x:SPIRE.x,z:SPIRE.z,fx:7,fz:7,ry:0,rad:10,fixed:true},{x:TPAD.x,z:TPAD.z,fx:10,fz:10,ry:0,rad:14.2,fixed:true},{x:APAD.x,z:APAD.z,fx:10,fz:10,ry:0,rad:14.2,fixed:true},{x:AMPH.x,z:AMPH.z,fx:19,fz:19,ry:0,rad:27,fixed:true});
for(const st of STATUES){if(st[5])continue;const e=st[2]*0.3+0.8;lots.push({x:st[0],z:st[1],fx:e,fz:e,ry:0,rad:e*1.5,fixed:true});}
{ // walls as chains of fixed rectangles so nothing is pushed into them
  const wallLots=(rf,cx,cz,n,thick,towerEvery,towerW,towerD)=>{for(let i=0;i<n;i++){const t0=i/n*2*Math.PI,t1=(i+1)/n*2*Math.PI;
    const a=[cx+rf(t0)*Math.cos(t0),cz+rf(t0)*Math.sin(t0)],b=[cx+rf(t1)*Math.cos(t1),cz+rf(t1)*Math.sin(t1)];const len=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
    lots.push({x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,fx:len/2+0.6,fz:thick/2,ry:-ang,rad:Math.hypot(len/2+0.6,thick/2),fixed:true});
    if(towerEvery&&i%towerEvery===0)lots.push({x:a[0],z:a[1],fx:towerW/2,fz:towerD/2,ry:-ang,rad:Math.hypot(towerW,towerD)/2,fixed:true});}};
  wallLots(wallR,0,0,84,13,3,29,17);
  wallLots(t=>62+3*Math.sin(5*t),PALACE.x,PALACE.z,28,7,5,13,13);
  for(const g of GATES){const R=wallR(g);lots.push({x:R*Math.cos(g),z:R*Math.sin(g),fx:16,fz:44,ry:-g,rad:47,fixed:true});}
}
for(let gx=-262;gx<=262;gx+=9)for(let gz=-262;gz<=262;gz+=9){
  const p0=polar(gx,gz),R=wallR(p0.t);if(p0.r>R-16)continue;
  const irr=1-p0.r/R;                       // 0 at the wall, 1 at the centre
  const j=0.4+irr*5;const x=gx+rr(-j,j),z=gz+rr(-j,j);
  const p=polar(x,z);if(p.r>R-14)continue;
  if(mask(x,z)[0]<200)continue;
  if(rnd()<0.10){if(rnd()<0.7)cityGreen.push([x,z]);continue;}   // gaps become courtyards and pocket gardens
  const hillF=clamp((terrainH(x,z)-PLATEAU)/HILL,0,1);
  const w=rr(4.5,7.5),dpt=rr(4.5,7.5);
  let h=rr(5,12)*(1+1.9*hillF);
  const ry=(p0.r>0.74*R?rr(-0.05,0.05):irr*rr(-0.6,0.6));
  const sector=Math.floor(((p.t+Math.PI)/(2*Math.PI))*6);
  const cc=PAL[(Math.floor(rnd()*4)+sector*2)%PAL.length];
  const type=rnd();
  const core=p.r<0.5*R, midring=p.r>0.28*R&&p.r<0.74*R, nearPalace=Math.hypot(x-PALACE.x,z-PALACE.z)<115;
  const lot={x,z,w,dpt,h,ry,cc,type,hillF,fixed:false,kind:'box',fx:w/2,fz:dpt/2};
  if(core&&rnd()<0.08){lot.kind='setback';lot.h=rr(26,54);}
  else if((core||nearPalace)&&rnd()<0.16){const r=rnd();lot.bc=PAL_BRUT[Math.floor(rnd()*PAL_BRUT.length)];
    if(r<0.4){lot.kind='tyrell';lot.h=rr(18,42);lot.fx=w*1.05;lot.fz=dpt*1.05;}
    else if(r<0.72){lot.kind='wedge';lot.h=rr(14,32);lot.ry=ry+rr(-0.3,0.3);lot.fx=w*0.85;lot.fz=dpt*1.15;}
    else{lot.kind=rnd()<0.5?'pent':'hept';lot.h=rr(12,30);lot.fx=w*0.75;lot.fz=dpt*0.75;}}
  else if((midring||core)&&rnd()<0.05){lot.kind='hall';lot.h=rr(8,13);lot.fx=w*1.5;lot.fz=dpt*0.95;}
  else if(core&&rnd()<0.04){lot.kind='stave';lot.h=rr(9,14);lot.fx=w*1.25;lot.fz=dpt*1.25;}
  else if(p.r>0.6*R&&rnd()<0.28){lot.kind='pueblo';lot.h=rr(4,7);lot.fx=w*0.95;lot.fz=dpt*0.95;}
  else if(p.r>0.62*R&&rnd()<0.1){lot.kind='compound';lot.h=rr(4,6);lot.fx=w*1.3;lot.fz=dpt*1.3;}
  else if(midring&&rnd()<0.2){lot.kind='midrise';lot.h=rr(14,26)*(1+0.8*hillF);lot.fx=w*0.58;lot.fz=dpt*0.58;}
  else if(type<0.42)lot.kind='box';
  else if(type<0.62)lot.kind='tier';
  else if(type<0.74)lot.kind='domed';
  else if(type<0.88){lot.kind=rnd()<0.5?'barrel':'tent';lot.fx=w*0.8;lot.fz=dpt*0.8;}
  else{lot.kind='pyr';lot.fx=w*0.63;lot.fz=dpt*0.63;}
  lot.rad=Math.hypot(lot.fx,lot.fz);
  if(rnd()<0.14)lot.green=[rr(-1,1)*(lot.fx+3.5),rr(-1,1)*(lot.fz+3.5)];
  lots.push(lot);
}
// ---- overlap relaxation on oriented rectangles: push overlapping lots apart along the minimum-separation axis; never delete; stay off roads and inside the wall ----
function obbAxes(l){const c=Math.cos(l.ry),s=Math.sin(l.ry);return [[c,-s],[s,c]];}   // same convention as loc()/rotation.y
function mtv(a,b,gap){  // minimum translation to move b clear of a (with gap), or null if they don't overlap
  const ua=obbAxes(a),ub=obbAxes(b),axes=[ua[0],ua[1],ub[0],ub[1]],d=[b.x-a.x,b.z-a.z];
  let best=Infinity,bax=null,bs=1;
  for(const ax of axes){
    const ra=a.fx*Math.abs(ax[0]*ua[0][0]+ax[1]*ua[0][1])+a.fz*Math.abs(ax[0]*ua[1][0]+ax[1]*ua[1][1]);
    const rb=b.fx*Math.abs(ax[0]*ub[0][0]+ax[1]*ub[0][1])+b.fz*Math.abs(ax[0]*ub[1][0]+ax[1]*ub[1][1]);
    const dd=d[0]*ax[0]+d[1]*ax[1];const o=ra+rb+gap-Math.abs(dd);
    if(o<=0)return null;if(o<best){best=o;bax=ax;bs=dd<0?-1:1;}}
  return [bax[0]*bs*best,bax[1]*bs*best];
}
for(const l of lots){if(l.kind==='hall'||l.kind==='stave')l.fz+=2.4;}   // porch depth
{
  const GAP=1.2,CELL=30;
  function key(x,z){return Math.floor((x+400)/CELL)+'_'+Math.floor((z+400)/CELL);}
  function okPos(l,nx,nz){const p=polar(nx,nz);return p.r<wallR(p.t)-14&&mask(nx,nz)[0]>200;}
  function tryMove(l,vx,vz){for(const f of [1,0.5,0.25]){const nx=l.x+vx*f,nz=l.z+vz*f;if(okPos(l,nx,nz)){l.x=nx;l.z=nz;return true;}}
    if(Math.abs(vx)>0.01){const nx=l.x+vx;if(okPos(l,nx,l.z)){l.x=nx;return true;}}
    if(Math.abs(vz)>0.01){const nz=l.z+vz;if(okPos(l,l.x,nz)){l.z=nz;return true;}}return false;}
  for(let iter=0;iter<40;iter++){
    const grid=new Map();lots.forEach((l,i)=>{const k=key(l.x,l.z);(grid.get(k)||grid.set(k,[]).get(k)).push(i);});
    const dx=new Float32Array(lots.length),dz=new Float32Array(lots.length);let pairs=0;
    for(let i=0;i<lots.length;i++){const a=lots[i];const cx=Math.floor((a.x+400)/CELL),cz=Math.floor((a.z+400)/CELL);
      for(let ox=-1;ox<=1;ox++)for(let oz=-1;oz<=1;oz++){const cell=grid.get((cx+ox)+'_'+(cz+oz));if(!cell)continue;
        for(const j of cell){if(j<=i)continue;const b=lots[j];
          if(Math.hypot(b.x-a.x,b.z-a.z)>a.rad+b.rad+GAP)continue;
          const v=mtv(a,b,GAP);if(!v)continue;pairs++;
          const wa=a.fixed?0:(b.fixed?1:0.5),wb=b.fixed?0:(a.fixed?1:0.5);
          dx[i]-=v[0]*wa;dz[i]-=v[1]*wa;dx[j]+=v[0]*wb;dz[j]+=v[1]*wb;}}}
    if(!pairs)break;
    let moved=0;
    for(let i=0;i<lots.length;i++){const l=lots[i];if(l.fixed||(dx[i]===0&&dz[i]===0))continue;
      const jx=(iter>20?rr(-0.6,0.6):0),jz=(iter>20?rr(-0.6,0.6):0);   // a little jitter late on to break symmetric deadlocks
      if(tryMove(l,dx[i]*1.05+jx,dz[i]*1.05+jz))moved++;}
    if(!moved&&iter>25)break;
  }
  // whatever still overlaps after that is boxed in by roads on every side: trim those lots' footprints just enough to fit, never remove them
  for(let pass=0;pass<3;pass++){
    const grid=new Map();lots.forEach((l,i)=>{const k=key(l.x,l.z);(grid.get(k)||grid.set(k,[]).get(k)).push(i);});
    for(let i=0;i<lots.length;i++){const a=lots[i];const cx=Math.floor((a.x+400)/CELL),cz=Math.floor((a.z+400)/CELL);
      for(let ox=-1;ox<=1;ox++)for(let oz=-1;oz<=1;oz++){const cell=grid.get((cx+ox)+'_'+(cz+oz));if(!cell)continue;
        for(const j of cell){if(j<=i)continue;const b=lots[j];const v=mtv(a,b,0.4);if(!v)continue;
          const big=(a.fixed?b:(b.fixed?a:(a.fx*a.fz>=b.fx*b.fz?a:b)));const o=Math.hypot(v[0],v[1]);
          const k=Math.max(0.6,1-o/(2*Math.max(big.fx,big.fz)));big.fx*=k;big.fz*=k;big.w*=k;big.dpt*=k;big.rad=Math.hypot(big.fx,big.fz);}}}
  }
}
if(/debug/.test(location.search)){let ov=0;for(let i=0;i<lots.length;i++)for(let j=i+1;j<lots.length;j++){if(lots[i].fixed&&lots[j].fixed)continue;if(mtv(lots[i],lots[j],0))ov++;}ctx.overlaps=ov;ctx.lots=lots.filter(l=>!l.fixed).length;ctx.lotList=lots;ctx.doorList=doors;}
// deco long-hall: timber gable roof on a banded body, ridge finials, porch and a lit sign; taverns get a hanging sign
function hall(x,y,z,L,Wd,h,ry,cc,tavern){
  B(x,y,z,L,h,Wd,ry,cc);C(x,y+h-0.84,z,L+0.8,0.9,Wd+0.8,ry,TIMBER);
  const n=Math.max(2,Math.round(L/2.2));for(let i=0;i<n;i++){const lx=-L/2+(i+0.5)*(L/n);let q=loc(x,z,lx,Wd/2+0.12,ry);St(q[0],y+0.8,q[1],0.6,h-2,0.25,ry);q=loc(x,z,lx,-Wd/2-0.12,ry);St(q[0],y+0.8,q[1],0.6,h-2,0.25,ry);}
  Ga(x,y+h,z,L*1.08,h*0.75,Wd*1.18,ry,TIMBER);
  for(const sgn of [-1,1]){const q=loc(x,z,sgn*L*0.54,0,ry);Rb(q[0],y+h+h*0.72,q[1],0.7,1.8,0.5,ry,TIMBER2);}
  const d=loc(x,z,0,Wd/2+0.1,ry);door(d[0],y,d[1],ry,2.4,3.4);
  const pr=loc(x,z,0,Wd/2+1.6,ry);B(pr[0],y,pr[1],5,0.6,3.2,ry,cc);Ga(pr[0],y+3.4,pr[1],5.4,1.6,3.6,ry,TIMBER);
  for(const sgn of [-1,1]){const q=loc(x,z,sgn*2.2,Wd/2+2.9,ry);Rb(q[0],y,q[1],0.4,3.4,0.4,ry,TIMBER);}
  if(tavern){const sg=loc(x,z,3.4,Wd/2+0.9,ry);Ne(sg[0],y+3.6,sg[1],1.8,1,0.15,ry,pick(NEON));Aw(sg[0],y+4.7,sg[1],2.4,0.15,1.6,ry,TIMBER);}
  else{const sg=loc(x,z,0,Wd/2+0.4,ry);Ne(sg[0],y+h-1.6,sg[1],L*0.5,0.3,0.15,ry,pick(NEON));}
}
{const tall=lots.filter(l=>!l.fixed&&l.kind==='setback').sort((a,b)=>b.h-a.h);const chosen=[];for(const l of tall){if(chosen.length>=4)break;if(chosen.every(c=>Math.hypot(c.x-l.x,c.z-l.z)>70)){chosen.push(l);l.dish=true;}}}
for(const im of [boxes,frusts,domes,tyrells,wedges,pents,hepts,gables,cornices,roofBits]){im.userData.dcol=new Float32Array(im.count*3);im.userData.lotOf=[];}
// ---- per-building extras (ivy, window boxes, cisterns, chimneys); they only draw from the second random source ----
// every building face keeps a list of what is fixed to it ([centre, half-width, bottom, top]) so nothing is placed on top of anything else
function claimFace(l,face,c,hw,y0,y1){l.faces=l.faces||{};const L=l.faces[face]=l.faces[face]||[];for(const q of L)if(Math.abs(q[0]-c)<q[1]+hw+0.2&&y0<q[3]+0.1&&y1>q[2]-0.1)return false;L.push([c,hw,y0,y1]);return true;}
const IVY_W={box:1,tier:1,domed:1,midrise:0.7,setback:0.4,barrel:0.6,hall:1.8,stave:1.8,pueblo:2,compound:2};
function bodyOf(l){const w=l.w,d=l.dpt,h=l.h;switch(l.kind){
  case 'box':return {w,d,h,strips:h>8};
  case 'tier':return {w,d,h:h*.6,strips:h*.6>8};
  case 'domed':return {w,d,h:h*.7,strips:h*.7>8};
  case 'midrise':return {w:w*1.15,d:d*1.15,h:h*.55,strips:h*.55>8};
  case 'setback':return {w:w*.95,d:d*.95,h,strips:h>8,cap:0.45};
  case 'barrel':return {w:w*1.2,d:d*1.6,h:h*.35};
  case 'hall':return {w:w*3,d:d*1.9,h,strips:true,cornice:0.9};
  case 'stave':return {w:w*2.5,d:d*2.5,h,strips:true,cornice:0.9};
  case 'pueblo':return {w:w*1.9,d:d*1.9,h,cornice:0.6};
  case 'compound':return {w:w*2.5+1,d:d*2.5+1,h:2.2,cornice:0};
  case 'tent':return {w:w*1.6,d:d*1.6,h:h*.7};
  case 'pyr':return {w:w*1.25+0.8,d:d*1.25+0.8,h};}
  return null;}
function buildingIvy(lot,y){const wgt=IVY_W[lot.kind]||0;if(!wgt||hash3(lot.x,lot.z,31)>=0.23*wgt)return;const b=bodyOf(lot);if(!b)return;
  const faces=['-z','+x','-x'];const nf=1+(xr()<0.45?1:0);const maxH=(b.h-(b.cornice===undefined?1.25:b.cornice))*(b.cap||1);
  for(let f=0;f<nf;f++){const face=faces.splice(Math.floor(xr()*faces.length),1)[0];
    const fw=face==='-z'?b.w:b.d,off=(face==='-z'&&b.strips)?0.32:0.12;
    const pw=fw*xrr(0.45,0.9),lx=xrr(-1,1)*(fw-pw)/2,ph=Math.max(1.2,maxH*xrr(0.35,1.0));
    let q,hd;if(face==='-z'){q=loc(lot.x,lot.z,lx,-b.d/2-off,lot.ry);hd=lot.ry+Math.PI;}
    else if(face==='+x'){q=loc(lot.x,lot.z,b.w/2+off,lx,lot.ry);hd=lot.ry+Math.PI/2;}
    else{q=loc(lot.x,lot.z,-b.w/2-off,lx,lot.ry);hd=lot.ry-Math.PI/2;}
    claimFace(lot,face,lx,pw/2,0,ph+2);ivyPanel(false,q[0],y+0.25,q[1],pw,ph,hd,0);lot.ivy=true;
    if(ph>maxH*0.85&&!b.cap){const n=2+Math.floor(xr()*2);for(let k=0;k<n;k++){const u=lx+(k/(n-1)-0.5)*pw*0.8;
      const c=face==='-z'?loc(lot.x,lot.z,u,-b.d/2+0.2,lot.ry):loc(lot.x,lot.z,(face==='+x'?1:-1)*(b.w/2-0.2),u,lot.ry);ivyClump(c[0],y+b.h+0.05,c[1],xrr(0.5,0.9));}}}}
function lotExtras(lot,y){
  const {x,z,w,dpt,ry,h,kind}=lot;const pp=polar(x,z),r01=pp.r/wallR(pp.t);
  buildingIvy(lot,y);
  if(r01>0.3&&hash3(x,z,61)<0.32){   // window boxes under the windows of the door face
    if(kind==='box'||kind==='tier'||kind==='midrise'){const b=bodyOf(lot);
      if(b.strips){const n=Math.max(1,Math.round(b.w/2.4));for(let i=0;i<n;i++){const lx=-b.w/2+(i+0.5)*(b.w/n);if(Math.abs(lx)<1.3||xr()>=0.55)continue;
        const q=loc(x,z,lx,b.d/2+0.48,ry);flowerBox(q[0],y+3.9,q[1],ry,0.95);if(b.h>11&&xr()<0.6)flowerBox(q[0],y+7.4,q[1],ry,0.95);}}
      else for(const sd of [-1,1]){if(xr()>=0.6)continue;const lx=sd*b.w*0.3;const q=loc(x,z,lx,b.d/2+0.43,ry);flowerBox(q[0],y+3.3,q[1],ry,1.1);
        const wq=loc(x,z,lx,b.d/2+0.12,ry);StX(wq[0],y+3.75,wq[1],1.0,1.0,0.25,ry);}}
    else if(kind==='pueblo'){const q=loc(x,z,-w*0.45,dpt*0.95+0.38,ry);flowerBox(q[0],y+1.75,q[1],ry,1.0);}}
  if(hash3(x,z,71)<0.12){   // rooftop cisterns
    if(kind==='box'){const sx=hash3(x,z,72)<0.5?-1:1,sz=hash3(x,z,73)<0.5?-1:1,q=loc(x,z,sx*0.28*w,sz*0.28*dpt,ry);cistern(q[0],y+h,q[1],Math.min(0.95,0.18*Math.min(w,dpt)),xrr(1.6,2.2));}
    else if(kind==='tier'){const q=loc(x,z,0.12*w,-0.12*dpt,ry);cistern(q[0],y+h*1.02,q[1],Math.min(0.7,0.13*Math.min(w,dpt)),xrr(1.3,1.8));}
    else if(kind==='pueblo'){const q=loc(x,z,0.62*w,-0.5*dpt,ry);cistern(q[0],y+h,q[1],Math.min(1.0,0.25*Math.min(w,dpt)),xrr(1.5,2.1));}}
  if(r01>0.55&&SMOKE.length<28&&hash3(x,z,41)<0.16){   // chimneys in the outer belt
    if(kind==='pueblo'){const q=loc(x,z,0.85*w,0.8*dpt,ry);Rb(q[0],y+h,q[1],0.7,1.9,0.7,ry,0x6a5a4a);lot.chimney=true;SMOKE.push([q[0],y+h+1.9,q[1],0]);}
    else if(kind==='compound'){Rb(x,y+h-0.2,z,0.6,1.6,0.6,ry,0x6a5a4a);lot.chimney=true;SMOKE.push([x,y+h+1.4,z,0]);}
    else if(kind==='hall'){const q=loc(x,z,w*3*0.3,0,ry),top=y+h+h*0.8+1.5;Rb(q[0],y+h+h*0.45,q[1],0.8,top-(y+h+h*0.45),0.8,ry,0x6a5a4a);lot.chimney=true;SMOKE.push([q[0],top,q[1],0]);}
    else if(kind==='box'){const q=loc(x,z,-0.3*w,0.3*dpt,ry);Rb(q[0],y+h,q[1],0.7,1.8,0.7,ry,0x6a5a4a);lot.chimney=true;SMOKE.push([q[0],y+h+1.8,q[1],0]);}}
}
// ---- phase 2: build geometry at the relaxed positions ----
for(const lot of lots){
  if(lot.fixed)continue;
  {let bestK=0,best=-1;const nearSq=Math.hypot(lot.x,lot.z)<62;for(let k=0;k<4;k++){const r2=lot.ry+k*Math.PI/2,ext=(k%2?lot.fx:lot.fz);const q=loc(lot.x,lot.z,0,ext+4,r2);const mk=mask(q[0],q[1]);
     let sc=(mk[0]<60&&mk[1]<60)?2:(mk[0]<200?1:0);
     if(nearSq){const d=Math.hypot(lot.x,lot.z)||1;sc=3+(Math.sin(r2)*(-lot.x/d)+Math.cos(r2)*(-lot.z/d));}   // around the central square: face the square itself
     if(sc>best){best=sc;bestK=k;}}
   if(bestK){lot.ry+=bestK*Math.PI/2;if(bestK%2){[lot.w,lot.dpt]=[lot.dpt,lot.w];[lot.fx,lot.fz]=[lot.fz,lot.fx];}}}
  const {x,z,w,dpt,ry,cc,type,hillF}=lot;let h=lot.h;curLight=buildingLight(x,z);curDist=DGROUP[lot.kind]||'houses';curLot=lot;
  const y=terrainH(x,z)-0.6;
  if(lot.green){const q=[x+lot.green[0],z+lot.green[1]];if(mask(q[0],q[1])[0]>200)cityGreen.push(q);}
  switch(lot.kind){
    case 'setback':                            // art-deco setback towers near the centre
      block(x,y,z,w*.95,h,dpt*.95,ry,cc,{});block(x,y+h,z,w*.6,h*.28,dpt*.6,ry,cc,{noDoor:true});block(x,y+h*1.28,z,w*.32,h*.16,dpt*.32,ry,cc,{noDoor:true,plain:true});
      if(!lot.dish){Rb(x,y+h*1.44,z,0.5,rr(5,10),0.5,ry,0x8a6a3a);if(rnd()<0.6)L(x,y+h*1.44,z,1,1.5,1,ry);}break;
    case 'tyrell':{const bw=w*2.1,bd=dpt*2.1;Ty(x,y,z,bw,h,bd,ry,cc);
      for(let k=1;k<=3;k++){const f=k/4,s=1-(1-0.42)*f;C(x,y+h*f,z,bw*s+0.6,0.7,bd*s+0.6,ry,0x6e5428);}
      L(x,y+h+0.2,z,1.2,1,1.2,ry);{const dq=loc(x,z,0,bd/2-0.3,ry);door(dq[0],y,dq[1],ry,2.2,3.4);}break;}
    case 'wedge':{W(x,y,z,w*1.7,h,dpt*2.3,ry,lot.bc);const dq=loc(x,z,0,dpt*1.15-0.2,ry);door(dq[0],y,dq[1],ry,1.8,3);break;}
    case 'pent':case 'hept':{(lot.kind==='pent'?P5:P7)(x,y,z,w*1.5,h,dpt*1.5,ry,lot.bc);C(x,y+h-0.84,z,w*1.5*0.86+0.6,0.9,dpt*1.5*0.86+0.6,ry,0x6e5428);if(rnd()<0.4)L(x,y+h,z,1,1,1,ry);{const dq=loc(x,z,0,dpt*0.7,ry);door(dq[0],y,dq[1],ry,1.8,3);}break;}
    case 'midrise':block(x,y,z,w*1.15,h*.55,dpt*1.15,ry,cc,{});block(x,y+h*.55,z,w*.85,h*.3,dpt*.85,ry,cc,{noDoor:true});block(x,y+h*.85,z,w*.5,h*.15,dpt*.5,ry,cc,{noDoor:true,plain:true,roof:true});
      if(hillF>0.2&&rnd()<0.5)L(x+rr(-1,1),y+h,z+rr(-1,1),1.2,0.7,1.2,0);break;
    case 'hall':{const Ln=w*3,Wd=dpt*1.9;hall(x,y,z,Ln,Wd,h,ry,cc,true);break;}
    case 'stave':{const Ln=w*2.5,Wd=dpt*2.5;hall(x,y,z,Ln,Wd,h,ry,cc,false);
      Ga(x,y+h+h*0.72,z,Ln*0.62,h*0.55,Wd*0.75,ry+Math.PI/2,TIMBER2);                                   // cross gable
      B(x,y+h+h*0.9,z,Wd*0.36,h*0.9,Wd*0.36,ry,cc);Ga(x,y+h*1.8,z,Wd*0.46,h*0.55,Wd*0.46,ry,TIMBER);   // tower with its own gable
      Rb(x,y+h*2.35,z,0.4,h*0.4,0.4,ry,TIMBER);L(x,y+h*2.75,z,0.8,0.8,0.8,ry);
      for(const sgn of [-1,1]){const q=loc(x,z,sgn*Ln*0.5,0,ry);Rb(q[0],y+h+h*0.7,q[1],1.2,2.2,0.6,ry,TIMBER);}break;}
    case 'pueblo':{const ac=pick(ADOBE),h1=h,h2=h*rr(0.6,0.9);
      B(x,y,z,w*1.9,h1,dpt*1.9,ry,ac);C(x,y+h1-0.54,z,w*1.9+0.3,0.6,dpt*1.9+0.3,ry,tc.set(ac).multiplyScalar(1.1));
      const o=loc(x,z,-w*0.3,-dpt*0.35,ry);B(o[0],y+h1,o[1],w*1.2,h2,dpt*1.1,ry,ac);
      if(rnd()<0.5){const o2=loc(x,z,w*0.45,dpt*0.3,ry);B(o2[0],y+h1,o2[1],w*0.7,h2*0.6,dpt*0.7,ry,ac);}
      for(let i=-2;i<=2;i++){const q=loc(x,z,i*w*0.36,dpt*0.95+0.5,ry);Vg(q[0],y+h1-1.1,q[1],0.4,0.4,1.4,ry);}       // vigas
      const d0=loc(x,z,w*0.2,dpt*0.95+0.1,ry);door(d0[0],y,d0[1],ry,1.5,2.4);
      const wn=loc(x,z,-w*0.45,dpt*0.95+0.15,ry);St(wn[0],y+2.2,wn[1],1,1,0.3,ry);
      {const lq=loc(x,z,w*0.7,dpt*0.95+1.2,ry);if(nvg<3999){putE(vigas,nvg++,lq[0],y,lq[1],0.25,h1+1.5,0.25,-0.22,ry,0);putE(vigas,nvg++,lq[0]+Math.cos(ry)*1.1,y,lq[1]-Math.sin(ry)*1.1,0.25,h1+1.5,0.25,-0.22,ry,0);}}   // ladder rails
      break;}
    case 'compound':{const ac=pick(ADOBE),W2=w*1.25,D2=dpt*1.25;
      [[0,-D2,W2*2,1],[0,D2,W2*2,1],[-W2,0,1,D2*2],[W2,0,1,D2*2]].forEach((wl,i)=>{const q=loc(x,z,wl[0],wl[1],ry);if(i===1){const a=loc(x,z,-W2*0.55,D2,ry),b=loc(x,z,W2*0.55,D2,ry);B(a[0],y,a[1],W2*0.9,2.2,1,ry,ac);B(b[0],y,b[1],W2*0.9,2.2,1,ry,ac);}else B(q[0],y,q[1],wl[2],2.2,wl[3],ry,ac);});
      F(x,y,z,W2*1.1,h,D2*1.1,ry+rr(-0.2,0.2),cc);{const dq=loc(x,z,0,D2*0.55*1.0,ry);door(dq[0],y,dq[1],ry,1.6,2.6);}const q=loc(x,z,-W2*0.55,-D2*0.5,ry);D(q[0],y,q[1],w*0.5,h*0.6,w*0.5,ry,ac);
      Rb(x+rr(-2,2),y,z+rr(-2,2),0.8,0.8,0.8,ry,TIMBER);break;}
    case 'box':block(x,y,z,w,h,dpt,ry,cc,{roof:rnd()<0.5});break;
    case 'tier':block(x,y,z,w,h*.6,dpt,ry,cc,{});block(x,y+h*.6,z,w*.65,h*.42,dpt*.65,ry,cc,{noDoor:true,roof:rnd()<0.4});break;
    case 'domed':block(x,y,z,w,h*.7,dpt,ry,cc,{});D(x,y+h*.7,z,w*.5,h*.45,dpt*.5,ry,cc);break;
    case 'barrel':{B(x,y,z,w*1.2,h*.35,dpt*1.6,ry,cc);D(x,y+h*.35,z,w*.6,h*.4,dpt*.8,ry,cc);const q=loc(x,z,0,dpt*0.8+0.1,ry);door(q[0],y,q[1],ry,1.6,2.6);break;}
    case 'tent':{F(x,y,z,w*1.6,h*.7,dpt*1.6,ry,cc);const q=loc(x,z,0,dpt*0.76,ry);door(q[0],y,q[1],ry,1.6,2.6);break;}
    case 'pyr':{F(x,y,z,w*1.25,h,dpt*1.25,ry,cc);C(x,y+h-0.74,z,w*1.25*0.85+0.8,0.8,dpt*1.25*0.85+0.8,ry,cc);const q=loc(x,z,0,dpt*0.6,ry);door(q[0],y,q[1],ry,1.6,2.8);break;}
  }
  lotExtras(lot,y);
  if(hillF>0.25&&rnd()<0.28)L(x+rr(-1,1),y+h*(type<0.5?1:0.6)+0.2,z+rr(-1,1),1.2,0.7,1.2,0);
  if((lot.kind==='box'||lot.kind==='tier'||lot.kind==='midrise'||lot.kind==='setback')&&Math.hypot(x,z)<0.6*wallR(Math.atan2(z,x))&&rnd()<0.3){
    const q=loc(x,z,w*0.3,dpt/2+0.35,ry);Ne(q[0],y+2.5,q[1],0.5,Math.min(h*0.5,9),0.3,ry,pick(NEON));}
}
await stage('laundry');
curLot=null;
section('laundry',()=>{
const clothM=new THREE.MeshLambertMaterial({color:0xffffff});clothM.userData.wind=0.22;
const canM=new THREE.MeshLambertMaterial({color:0xffffff});canM.userData.tex='stripes';
const ropes=new THREE.InstancedMesh(boxG,lamC(0x2a2420),600),cloth=new THREE.InstancedMesh(boxG,clothM,700),canopies=new THREE.InstancedMesh(boxG,canM,120);
let nr=0,ncl=0,ncn=0,lines=0;
const OKK={box:1,tier:1,pueblo:1,compound:1,hall:1};const WASH=[0xe8d9b8,0xc9442a,0x2f8f8a,0x7a3d8a,0xe0a030,0x3b4a8a,0xd9d1b0,0xf4f0e6];
const outer=lots.filter(l=>{if(l.fixed||!OKK[l.kind])return false;const pp=polar(l.x,l.z);return pp.r>0.45*wallR(pp.t);});
const onBoulevard=(x,z)=>GATES.some(g=>{const along=x*Math.cos(g)+z*Math.sin(g),perp=Math.abs(-x*Math.sin(g)+z*Math.cos(g));return along>0&&perp<11;});
const extent=(l,dx,dz)=>{const b=bodyOf(l),c=Math.cos(l.ry),sn=Math.sin(l.ry);return Math.abs(dx*c-dz*sn)*b.w/2+Math.abs(dx*sn+dz*c)*b.d/2;};
const used=new Set();
// the gap between the two faces must be open ground (a street or an alley), not another building
const clearGap=(p0,p1,a,b)=>{for(const t of [0.2,0.5,0.8]){const x=p0[0]+(p1[0]-p0[0])*t,z=p0[1]+(p1[1]-p0[1])*t,probe={x,z,fx:0.35,fz:0.35,ry:0};
  for(const l of lots){if(l===a||l===b||Math.abs(l.x-x)>l.rad+1||Math.abs(l.z-z)>l.rad+1)continue;if(mtv(l,probe,0))return false;}}return true;};
for(let i=0;i<outer.length&&lines<70;i++){const a=outer[i];if(used.has(a))continue;
  for(let j=i+1;j<outer.length;j++){const b=outer[j];if(used.has(b))continue;const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d<6||d>17)continue;
    const mx=(a.x+b.x)/2,mz=(a.z+b.z)/2,mk=mask(mx,mz);if((mk[1]>200&&mk[0]<60)||onBoulevard(mx,mz)||hash3(a.x,b.z,51)>0.8)continue;
    const ux=dx/d,uz=dz/d,ea=extent(a,ux,uz),eb=extent(b,ux,uz),span=d-ea-eb;if(span<2||span>11)continue;
    const ya=terrainH(a.x,a.z)-0.6,yb=terrainH(b.x,b.z)-0.6,ha=bodyOf(a).h,hb=bodyOf(b).h;if(Math.min(ha,hb)<4.6)continue;
    const yl=Math.max(Math.min(ya+ha*0.72,yb+hb*0.72),Math.max(ya,yb)+3.8);if(yl>Math.min(ya+ha,yb+hb)-0.6)continue;
    const p0=[a.x+ux*(ea+0.03),a.z+uz*(ea+0.03)],p1=[b.x-ux*(eb+0.03),b.z-uz*(eb+0.03)];
    if(!clearGap(p0,p1,a,b))continue;
    used.add(a);used.add(b);lines++;a.laundry=b.laundry=true;
    const sag=0.12*span,hd=Math.atan2(ux,uz),P=t=>[p0[0]+(p1[0]-p0[0])*t,yl-sag*4*t*(1-t),p0[1]+(p1[1]-p0[1])*t];
    if(xr()<0.3){if(ncn<120)putE(canopies,ncn++,(p0[0]+p1[0])/2,yl-sag*0.6,(p0[1]+p1[1])/2,xrr(2.2,3.0),0.05,span+0.1,0,hd,0,xpick(AWN));}
    else{
      for(let k=0;k<5&&nr<600;k++){const A=P(k/5),B=P((k+1)/5),Ls=Math.hypot(B[0]-A[0],B[1]-A[1],B[2]-A[2]),pitch=-Math.atan2(B[1]-A[1],Math.hypot(B[0]-A[0],B[2]-A[2]));
        putE(ropes,nr++,(A[0]+B[0])/2,(A[1]+B[1])/2-0.03,(A[2]+B[2])/2,0.06,0.06,Ls,pitch,hd,0);}
      const n=3+Math.floor(xr()*5);for(let k=0;k<n&&ncl<700;k++){const Q=P(0.12+0.76*(k+0.5)/n+xrr(-0.03,0.03)),hg=xrr(0.7,1.15);
        putE(cloth,ncl++,Q[0],Q[1]-hg,Q[2],0.05,hg,xrr(0.45,0.85),0,hd,0,xpick(WASH));}}
    break;}}
for(const [im,n] of [[ropes,nr],[cloth,ncl],[canopies,ncn]]){im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.userData.noShadow=im!==canopies;if(n>0)scene.add(im);}
ctx.laundry={lines,ropes:nr,cloth:ncl,canopies:ncn};
});
await stage('barracks');
section('barracks',()=>{
// barracks: tall wedge blocks straddling the palace curtain wall, kin to the outer wall towers
for(const b of BARRACKS){const ty=terrainH(b.x,b.z)-4;
  scene.add(mesh(towerWedgeG,sandM,b.x,ty,b.z,36,50,24,-(b.a+Math.PI/2)));
  scene.add(mesh(boxG,sandLightM,b.x,ty+50,b.z,13.5,1,7.4,-(b.a+Math.PI/2)));
  scene.add(mesh(boxG,darkM,b.x+Math.cos(b.a)*12.4,ty+1,b.z+Math.sin(b.a)*12.4,2.2,5,0.8,-(b.a+Math.PI/2)));}
});
await stage('infill');
section('infill',()=>{
{const pwm=new THREE.InstancedMesh(withLightT(boxG,PALWIN.length),stripM,Math.max(1,PALWIN.length));
 PALWIN.forEach((w,i)=>{put(pwm,i,w[0],w[1],w[2],w[3],w[4],w[5],0,0xffffff);setLT(pwm,i,w[6],w[7],-1);});pwm.count=PALWIN.length;pwm.userData.noShadow=true;if(PALWIN.length)scene.add(pwm);}
for(const im of [boxes,frusts,domes]){im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;}
boxes.count=nb;frusts.count=nf;domes.count=nd;lights.count=nl;lights.instanceMatrix.needsUpdate=true;
cornices.count=nc;roofBits.count=nrb;strips.count=ns;
for(const [im,n] of [[flowerBoxes,nFB],[flowerLeaves,nFL],[flowers,nFw],[tanks,nTk],[hoops,nHp],[lids,nLd]]){im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;if(n>0)scene.add(im);}
flowers.userData.noShadow=flowerLeaves.userData.noShadow=hoops.userData.noShadow=true;
tyrells.count=nty;wedges.count=nw;pents.count=np;hepts.count=nh;gables.count=ng;awnings.count=naw;neons.count=nne;vigas.count=nvg;vigas.instanceMatrix.needsUpdate=true;
for(const im of [cornices,roofBits,tyrells,wedges,pents,hepts,gables,awnings,neons]){im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;}
strips.instanceMatrix.needsUpdate=true;if(strips.instanceColor)strips.instanceColor.needsUpdate=true;
for(const im of [boxes,frusts,domes,lights,cornices,strips,roofBits,tyrells,wedges,pents,hepts,gables,awnings,neons,vigas])if(im.count>0)scene.add(im);

});
