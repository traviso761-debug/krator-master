// ================================================================= HOST — Fleetborn Cove water, 5-tier tufa curtains and 14 m tide
// Loaded only for --station cove (before 89w-host-water.js). Eliminates all straight water/entrance borders with a single continuous
// 14 km CDLOD marine surface + in-shader bathymetric reversible sill overfalls, builds cliff-clearing 5-tier overhanging travertine
// and tufa draperies with springhead rimstone basins, stalactite drip-teeth and waterfall veils; the tide is the scale model's (KTIDE, springs and neaps).
const COVE_TIDE=(function(){
 /* The tide is the scale model's (core/water/tide, KTIDE): the cove's cell of tides.json (the slice build.py inlines as KTIDE_DATA),
    scaled to SITE.tide.mean metres of mean range, with the Week's and the Thirteen's springs and neaps, on WORLD time (the host's
    KCLOCK: day and hour). Modes: 'live' follows the clock; 'run' runs the tide alone at RUN world seconds a second (a whole day in 48 s);
    'hold' eases to a held level (the slider, ?tide=low|high|<m>). */
 const S=SITE,RUN=1800,DAY=86400;
 const K=typeof KTIDE!=='undefined'&&typeof KTIDE_DATA!=='undefined'?KTIDE.load(KTIDE_DATA,{origin:S.px}):null;
 const site=K?K.site({px:S.px[0],py:S.px[1]},{range:S.tide.mean==null?11:S.tide.mean}):null;
 const T={level:S.sea,target:S.sea,wetTop:.65,mode:site?'live':'hold',cycling:false,tw:0,rate:0,racePhase:0,raceU:null,plungeMeshes:[],ui:null,curtainAudit:null,site:site,
  maxRate:1,clock:null,dayCache:null};
 if(site){let m=0;for(let t=0;t<14*DAY;t+=600)m=Math.max(m,Math.abs(site.rate(t)));T.maxRate=m||1;}
 const qp=new URLSearchParams(location.search),qTide=qp.get('tide'),qDay=qp.get('tideday');
 if(qTide==='low'){T.level=T.target=S.tide.low;T.mode='hold';}
 else if(qTide==='high'){T.level=T.target=S.tide.high;T.mode='hold';T.wetTop=S.tide.high;}
 else if(qTide==='cycle'||qTide==='run'){T.mode=site?'run':'hold';T.cycling=!!site;}
 else if(qTide!=null&&!isNaN(+qTide)){T.level=T.target=clamp(+qTide,S.tide.low,S.tide.high);T.mode='hold';T.wetTop=Math.max(.65,T.level);}
 const clk=()=>T.clock||(typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null);
 const ws=()=>{const C=clk();return C?KTIDE.worldSeconds(C):0;};
 const tNow=()=>T.mode==='run'?T.tw:ws();
 const mpsOf=r=>S.sill.raceSpeed*r/T.maxRate;
 function syncScene(){
  WATER.PRESETS.sea.level=T.level;
  if(L.setTideLv)L.setTideLv(T.level);
  if(BIGW&&BIGW.U&&BIGW.U.wtrLevel)BIGW.U.wtrLevel.value=T.level;
  if(T.raceU){
   if(site&&T.mode!=='hold')T.raceU.uRaceGain.value=clamp(.16+.95*Math.abs(mpsOf(T.rate))/S.sill.raceSpeed,0,1.15);
   else T.raceU.uRaceGain.value=T.level<=S.tide.low+1?.96:T.level>=S.tide.high-1?.52:.74;
  }
  if(typeof COVE_GND_U!=='undefined'&&COVE_GND_U){COVE_GND_U.uTideLv.value=T.level;COVE_GND_U.uTideWetTop.value=T.wetTop;}
  for(let i=0;i<T.plungeMeshes.length;i++){const pm=T.plungeMeshes[i];pm.mesh.position.y=Math.max(pm.bedY,T.level)+.12;}
  paintUI();
 }
 const hm=t=>{const h=((t%DAY)+DAY)%DAY/3600,H=Math.floor(h),M=Math.floor((h-H)*60);return(H<10?'0':'')+H+':'+(M<10?'0':'')+M;};
 function dayOf(t){const d=Math.floor(t/DAY);if(!T.dayCache||T.dayCache.d!==d)T.dayCache={d:d,x:site.day(d)};return T.dayCache.x;}
 function labelOf(){
  const lv=(T.level>=0?'+':'')+T.level.toFixed(1)+' m';
  if(!site||T.mode==='hold'){const tag=T.level<=-5.5?'Low spring':T.level<-1.2?'Ebb / low':T.level>=5.5?'High spring':T.level>1.2?'Flood / high':'Mid tide';return lv+' · '+tag+' (held)';}
  const t=tNow(),mps=mpsOf(T.rate),st=Math.abs(mps)<.65?(T.level>0?'High slack':'Low slack'):mps>0?'Flood +'+mps.toFixed(1)+' m/s':'Ebb '+mps.toFixed(1)+' m/s';
  const x=dayOf(t),sp=site.spring(t),phase=sp>1.2?'springs':sp<.8?'neaps':'mid-cycle';
  const nx=x.high.concat(x.low).filter(q=>q>t).sort((a,b)=>a-b)[0];
  return lv+' · '+st+'\nday '+(Math.floor(t/DAY)+1)+' '+hm(t)+' · range '+x.range.toFixed(1)+' m\n'+phase+' ×'+sp.toFixed(2)+(nx!=null?' · next '+(x.high.indexOf(nx)>=0?'high ':'low ')+hm(nx):'')+(T.mode==='run'?' · running':'');
 }
 function paintUI(){
  const U=T.ui;if(!U)return;
  U.readout.textContent=labelOf();
  if(document.activeElement!==U.slider)U.slider.value=T.level.toFixed(1);
  U.bLive.classList.toggle('on',T.mode==='live');U.bRun.classList.toggle('on',T.mode==='run');U.bHold.classList.toggle('on',T.mode==='hold');
 }
 /* jump the world clock to a time (s): its day and hour; the tide follows it in 'live' */
 function jumpTo(t){const C=clk();if(C){C.day=Math.floor(t/DAY);if(C.set)C.set(((t%DAY)+DAY)%DAY/3600);else C.hour=((t%DAY)+DAY)%DAY/3600;}T.mode='live';T.cycling=false;T.dayCache=null;}
 function extreme(x,want){const L2=want>0?x.high:x.low;let b=null,bv=0;for(const q of L2){const v=site.level(q);if(b==null||(v-bv)*want>0){b=q;bv=v;}}return b;}
 function setTide(arg,opt){
  const inst=!!(opt&&opt.instant);
  if(site&&(arg==='live'||arg==='cycle'||arg==='run')){
   if(arg==='live'){T.mode='live';T.cycling=false;}
   else{const on=opt&&opt.on!=null?!!opt.on:T.mode!=='run';if(on){T.tw=tNow();T.mode='run';T.cycling=true;}else{jumpTo(T.tw);}}
  }else if(site&&(arg==='greatEbb'||arg==='greatFlood'||arg==='spring'||arg==='neap'||arg==='doubleDark')){
   let t=tNow();
   if(arg==='spring'||arg==='neap'){const q=arg==='spring'?site.nextSpring(t):site.nextNeap(t);if(q!=null)t=q;}
   if(arg==='doubleDark'){const e=K.inferred.length?K.inferred[0].epoch:0,P=91*DAY;t=e+Math.ceil((t-e)/P)*P;}
   const x=site.day(Math.floor(t/DAY)),q=extreme(x,arg==='greatEbb'||arg==='neap'?-1:1);
   jumpTo(q==null?t:q);
  }else{
   T.cycling=false;T.rate=0;T.mode='hold';
   const v=arg==='low'?S.tide.low:arg==='mid'?0:arg==='high'?S.tide.high:clamp(+arg,S.tide.low-1.5,S.tide.high+1.5);
   T.target=isNaN(v)?0:v;if(inst)T.level=T.target;
  }
  if(T.mode!=='hold')advance(0);
  T.wetTop=Math.max(T.wetTop,T.level+.35);
  syncScene();
  return state();
 }
 function state(){
  let sub=0,exp=0;
  for(let i=0;i<L.STACKS.length;i++){if(L.STACKS[i].h<=T.level)sub++;else exp++;}
  const live=site&&T.mode!=='hold',t=live?tNow():null,x=live?dayOf(t):null;
  const mps=live?+mpsOf(T.rate).toFixed(2):(T.level<-.5?-S.sill.raceSpeed:S.sill.raceSpeed);
  return{level:+T.level.toFixed(2),target:+T.target.toFixed(2),mode:T.mode,cycling:T.mode==='run',currentMps:mps,submergedStacks:sub,exposedStacks:exp,
   ktide:!!site,worldSec:t,day:t==null?null:Math.floor(t/DAY),spring:live?+site.spring(t).toFixed(3):null,dayRange:x?+x.range.toFixed(2):null,
   dayHighest:x?+x.highest.toFixed(2):null,dayLowest:x?+x.lowest.toFixed(2):null,slack:live?Math.abs(mps)<.65:null};
 }
 function advance(d){
  if(T.mode==='run')T.tw+=RUN*d;
  const t=tNow(),v=site.level(t);T.rate=site.rate(t);T.level=v;T.target=v;
 }
 tick(function coveTideTick(dt){
  const d=clamp(dt==null?.016:dt,0,.1);
  const dir=site&&T.mode!=='hold'?Math.sign(T.rate)*Math.min(1,Math.abs(mpsOf(T.rate))/S.sill.raceSpeed*1.6):(T.level<-.5?-1:1);
  T.racePhase=(T.racePhase+d*dir*1.35)%1000;
  if(T.raceU)T.raceU.uRacePhase.value=T.racePhase;
  if(site&&T.mode!=='hold'){
   const prev=T.level;advance(d);
   T.wetTop=Math.max(T.level+.35,T.wetTop-(T.mode==='run'?.18:.02)*d);
   if(Math.abs(T.level-prev)>1e-4||T.mode==='run'||!T._painted){T._painted=true;syncScene();}
   else if(T.ui&&(T._pt=(T._pt||0)+d)>.5){T._pt=0;paintUI();}
  }else if(Math.abs(T.target-T.level)>.004){
   const step=Math.min(1,d*2.4),prev=T.level;
   T.level=lerp(T.level,T.target,step);
   if(Math.abs(T.target-T.level)<.006)T.level=T.target;
   T.rate=(T.level-prev)/Math.max(d,1e-3);
   T.wetTop=Math.max(T.level+.35,T.wetTop-.12*d);
   syncScene();
  }else if(T.rate!==0){T.rate=0;syncScene();}
  else if(T.wetTop>T.level+.45){T.wetTop=Math.max(T.level+.45,T.wetTop-.08*d);if(typeof COVE_GND_U!=='undefined'&&COVE_GND_U)COVE_GND_U.uTideWetTop.value=T.wetTop;}
 });
 function mountUI(){
  if(T.ui||typeof document==='undefined')return;
  T.clock=clk();
  if(site&&qDay!=null&&isFinite(+qDay)&&T.clock){T.clock.day=Math.floor(+qDay);T.dayCache=null;}
  if(site&&T.mode==='run')T.tw=ws();
  if(site&&T.mode!=='hold'){advance(0);T.wetTop=Math.max(T.wetTop,T.level+.35);syncScene();}
  const bar=document.getElementById('bar');if(!bar)return;
  const row=document.createElement('div');row.className='row';row.id='cove-tide';
  const mk=(par,tag,txt,title,fn)=>{const e=document.createElement(tag);if(txt!=null)e.textContent=txt;if(title)e.title=title;if(fn)e.onclick=fn;par.appendChild(e);return e;};
  mk(row,'span','tide').className='lbl';
  const bLive=mk(row,'button','Live','The scale model\'s tide on the world clock (core/water/tide): the hour and day move it',()=>setTide('live'));
  const bRun=mk(row,'button','Run','Run the tide alone, a whole day in 48 s (the clock held)',()=>setTide('run'));
  const bEbb=mk(row,'button','Great Ebb','Jump the clock to today\'s lowest water',()=>setTide('greatEbb'));
  const bFl=mk(row,'button','Great Flood','Jump the clock to today\'s highest water',()=>setTide('greatFlood'));
  const r2=document.createElement('div');r2.style.cssText='display:flex;align-items:center;gap:4px;margin-top:4px';row.appendChild(r2);
  mk(r2,'button','Spring','Jump to the next springs\' highest water (the Week and the Thirteen in phase with D2)',()=>setTide('spring'));
  mk(r2,'button','Neap','Jump to the next neaps\' lowest water',()=>setTide('neap'));
  mk(r2,'button','Double Dark','Jump to the greatest springs: both moons new, every 91 days (and the Double Full between)',()=>setTide('doubleDark'));
  const bHold=mk(r2,'button','Hold','Hold the level the slider sets',()=>setTide(T.level,{instant:true}));
  const br=document.createElement('div');br.style.cssText='display:flex;align-items:flex-start;gap:6px;margin-top:4px';row.appendChild(br);
  const slider=document.createElement('input');slider.type='range';slider.min=String(S.tide.low-1);slider.max=String(S.tide.high+1);slider.step='0.1';slider.value=String(T.level);
  slider.style.cssText='width:120px;vertical-align:middle';br.appendChild(slider);
  const readout=document.createElement('span');readout.className='k';readout.style.cssText='opacity:.92;color:#9fe8ff;font:11px ui-monospace,Menlo,monospace;white-space:pre;display:block;margin-top:3px';br.appendChild(readout);
  slider.oninput=()=>setTide(+slider.value,{instant:true});
  if(!site){bLive.disabled=bRun.disabled=bEbb.disabled=bFl.disabled=true;}
  const anchor=document.getElementById('khost-time')||document.getElementById('khost-export');
  if(anchor&&anchor.parentNode===bar)bar.insertBefore(row,anchor);else bar.appendChild(row);
  T.ui={row,bLive,bRun,bHold,slider,readout};
  paintUI();
 }
 return{T,setTide,state,syncScene,mountUI};
})();

function COVE_BUILD_WATER(H){
 const S=SITE,lin2=H.lin;
 /* 1. UNIFIED 14 KM CDLOD MARINE SURFACE + IN-SHADER BATHYMETRIC SILL OVERFALLS (0 straight seams, 0 river-bank stripes!) */
 WATER.PRESETS.bed={cell:4.5,deep:[-24,62],fine:[-8.5,8.5]};
 WATER.PRESETS.sea.level=COVE_TIDE.T.level;
 const maskOf=(box,cell,fn)=>{const nx=Math.round((box[2]-box[0])/cell),nz=Math.round((box[3]-box[1])/cell),d=new Uint8Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(fn(box[0]+(i+.5)*cell,box[1]+(j+.5)*cell))d[j*nx+i]=255;return{x0:box[0],z0:box[1],cell,nx,nz,data:d};};
 const tightBox=(full,step,pad,fn)=>{let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;
  for(let z=full[1];z<=full[3];z+=step)for(let x=full[0];x<=full[2];x+=step)if(fn(x,z)){x0=Math.min(x0,x);z0=Math.min(z0,z);x1=Math.max(x1,x);z1=Math.max(z1,z);}
  return[Math.max(full[0],Math.floor((x0-pad)/16)*16),Math.max(full[1],Math.floor((z0-pad)/16)*16),Math.min(full[2],Math.ceil((x1+pad)/16)*16),Math.min(full[3],Math.ceil((z1+pad)/16)*16)];};
 const TILE_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],FAR_BOX=[-14000,-14000,14000,14000];
 const isNearMarine=(x,z)=>L.S_OF(x,z)<1095&&L.land(x,z)<19;
 const BED_BOX=tightBox(TILE_BOX,16,64,isNearMarine);
 BIGW=WATER.open({name:'Fleetborn Cove and the Arch Sea (14 m macrotidal fjord and -11 m sill)',
  swell:[[.011,17,58,0,.022],[.006,8.5,-36,1.3,.016]],field:0,bounds:FAR_BOX,bedBox:BED_BOX,bed:terrainH,bedCell:4.5,
  mask:maskOf(FAR_BOX,96,(x,z)=>L.S_OF(x,z)<1110&&landH(x,z)<24)});
 BIG_DRAW=WATER.draw(BIGW,{surf:true,surfDepth:[.06,1.05],ramp:[.4,7.2],breakers:false,renderOrder:1,roughness:.09,metalness:.05,envMapIntensity:.66,
  shallow:lin2(0x4cb0aa),deep:lin2(0x09324a)});
 BIG_DRAW.mesh.raycast=WATER.pickRay(BIGW,BIG_DRAW.mesh,THREE,()=>BIGW.U.wtrLevel.value);
 BIG_DRAW.mesh.userData.inspectLabel='Fleetborn Cove and the Arch Sea (14 m macrotidal fjord, -11 m sill race, -59 m inner sanctuary)';

 /* Reversible bathymetric sill tidal-race boils & lacy overfall streaks injected directly on BIG_DRAW (zero polygon seams!) */
 {const raceU={uRacePhase:{value:0},uRaceGain:{value:.74}};
  KHOOK.add(BIG_DRAW.material,'cove-sill-overfalls',sh=>{
   Object.assign(sh.uniforms,raceU);
   KHOOK.f(sh,'#include <common>','#include <common>\nuniform float uRacePhase;\nuniform float uRaceGain;','cove-sill-overfalls');
   KHOOK.f(sh,'diffuseColor.rgb=mix(diffuseColor.rgb,',
    '{float cvS=dot(vWtrP,vec2(0.422618,0.906308));float cvA=dot(vWtrP,vec2(0.906308,-0.422618));'+
    'float warp=75.0*(wtrNoise(vWtrP*0.0055)-0.5)+32.0*(wtrNoise(vWtrP*0.014+3.1)-0.5);'+
    'float sillEnv=smoothstep(-1080.0,-830.0,cvS+warp)*smoothstep(-500.0,-730.0,cvS+warp)*smoothstep(1.2,3.2,wtrDp)*smoothstep(21.0,11.5,wtrDp);'+
    'if(sillEnv>0.005){vec2 qFlow=vec2(cvA*0.16,cvS*0.085-uRacePhase*2.1);'+
    'float st1=wtrNoise(qFlow+vec2(wtrNoise(qFlow*0.42)*1.6,0.0)),st2=wtrNoise(qFlow*3.1+vec2(4.7,-uRacePhase*1.5));'+
    'float lace=smoothstep(0.65,0.91,st1*0.58+st2*0.42)*sillEnv*uRaceGain*(0.45+0.55*smoothstep(15.0,4.8,wtrDp));'+
    'wtrFoamK=max(wtrFoamK,lace*0.52);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.07,0.31,0.36),sillEnv*0.20*uRaceGain);}}\n'+
    'diffuseColor.rgb=mix(diffuseColor.rgb,','cove-sill-overfalls');
  },{key:'cove-sill-overfalls'});
  COVE_TIDE.T.raceU=raceU;}

 /* 2. SOUTHERN GJAR RIFT SEEP STREAM entering the head of the cove */
 H.ribbon('The southern gjar seep stream',L.GJAR_PTS,6.2,.42,0xbce6ec,0x3e8ca0,[.01,.05]);

 /* 3. TYPE II (Ca-OH, pH > 11) CLIFF SPRINGS + 5-TIER OVERHANGING TRAVERTINE & TUFA DRAPERIES + WATERFALL VEILS */
 L.WEEPS.forEach((w,i)=>H.spring('weep'+i,'Type II cliff seep '+(i+1)+' (Ca-OH, pH '+w.chem.pH.toFixed(1)+', H2)',w.x,w.z,w.r*.78,terrainH(w.x,w.z)+.28,.48,H.alkRamp,{milky:.78}));
 {const TEX_TUFA_BUMP=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,u=x/w,v=y/h;
    const fl=.5+.5*Math.cos(u*TAU*18+1.2*Math.sin(v*TAU*3))*.62+.38*(.5+.5*Math.cos(u*TAU*39+.6*Math.cos(v*TAU*4)));
    const vug=fbm(u*12,v*10,14.2,3),shelf=.5+.5*Math.sin(v*TAU*9+u*2.7);
    const val=clamp((fl*.52+vug*.36+shelf*.12)*255,0,255);
    d[i]=d[i+1]=d[i+2]=val;d[i+3]=255;}
   g.putImageData(id,0,0);});
  TEX_TUFA_BUMP.wrapS=TEX_TUFA_BUMP.wrapT=THREE.RepeatWrapping;
  const TEX_TUFA_ROUGH=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,u=x/w,v=y/h;
    const wetStreak=.5+.5*Math.cos(u*TAU*13+Math.sin(v*TAU*2)*1.8),porous=fbm(u*16,v*16,21.7,2);
    const rgh=clamp((.22+.58*(1-wetStreak)*.75+.20*porous)*255,44,232);
    d[i]=d[i+1]=d[i+2]=rgh;d[i+3]=255;}
   g.putImageData(id,0,0);});
  TEX_TUFA_ROUGH.wrapS=TEX_TUFA_ROUGH.wrapT=THREE.RepeatWrapping;

  const pos=[],uvs=[],col=[],idx=[],pp=[];
  const vPos=[],vUv=[],vIdx=[];
  let checkedSamples=0,clippedSamples=0,minClearance=1e9;
  const drawnH=(x,z)=>{const th=terrainH(x,z),dh=typeof KDRAWN!=='undefined'&&KDRAWN.h?KDRAWN.h(x,z):null;return dh==null?th:Math.max(th,dh);};

  L.WEEPS.forEach((w,wi)=>{
   const yLip=drawnH(w.x,w.z),yBot=-8.4,maxHW=w.w*1.32+6,sMaxClamp=w.F.L+1.5;
   /* Precompute dilated cliff-face envelope sEnv(y, a) clamped to the shoreline cliff toe so basal tufa plunges steeply into deep water */
   const NY=32,NA=29,envRaw=new Float32Array(NY*NA),env=new Float32Array(NY*NA);
   for(let iy=0;iy<NY;iy++){const y=lerp(yLip+4,yBot-2,iy/(NY-1));
    for(let ia=0;ia<NA;ia++){const a=lerp(-maxHW-8,maxHW+8,ia/(NA-1));
     let sMax=-6;
     for(let s=-6;s<=sMaxClamp;s+=1.8){
      const p0=w.F.p(s,a),pL=w.F.p(s,a-5.5),pR=w.F.p(s,a+5.5),pF=w.F.p(Math.min(sMaxClamp,s+4.2),a);
      const hMax=Math.max(drawnH(p0[0],p0[1]),drawnH(pL[0],pL[1]),drawnH(pR[0],pR[1]),drawnH(pF[0],pF[1]));
      if(hMax>=y-1.6)sMax=s;
     }
     envRaw[iy*NA+ia]=sMax;
    }}
   for(let iy=0;iy<NY;iy++)for(let ia=0;ia<NA;ia++){
    let mx=envRaw[iy*NA+ia],sm=0,cnt=0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
     const jy=clamp(iy+dy,0,NY-1),ja=clamp(ia+dx,0,NA-1),v=envRaw[jy*NA+ja];
     if(v>mx)mx=v;sm+=v;cnt++;
    }
    env[iy*NA+ia]=mx*.64+(sm/cnt)*.36;
   }
   const sampleEnv=(y,a)=>{
    const fy=clamp((yLip+4-y)/(yLip+6-yBot)*(NY-1),0,NY-1.001),fa=clamp((a+maxHW+8)/(2*(maxHW+8))*(NA-1),0,NA-1.001);
    const i0=Math.floor(fy),j0=Math.floor(fa),ty=fy-i0,ta=fa-j0,k=i0*NA+j0;
    return(env[k]*(1-ta)+env[k+1]*ta)*(1-ty)+(env[k+NA]*(1-ta)+env[k+NA+1]*ta)*ty;
   };

   /* Sculpted semicircular travertine rimstone basin & stepped gours around the upper springhead pool */
   {const rIn=w.r*.72,rOut=w.r*1.58,NA_S=28,NR_S=6,sBase=pos.length/3;
    for(let jr=0;jr<=NR_S;jr++){
     const fr=jr/NR_S,rr=lerp(rIn,rOut,fr);
     for(let ia=0;ia<=NA_S;ia++){
      const th=ia/NA_S*TAU,lob=1+.12*Math.sin(th*5+wi)+.07*Math.cos(th*9),rad=rr*lob;
      const px=w.x+Math.cos(th)*rad,pz=w.z+Math.sin(th)*rad,gy=drawnH(px,pz);
      const stepRim=(1-fr)*.85+.22*Math.pow(.5+.5*Math.sin(fr*Math.PI*3),2)*(1-fr),edgeTuck=jr===NR_S?-.65:0;
      const yy=Math.max(gy+.12,yLip+.38-fr*.55)+stepRim+edgeTuck;
      pos.push(px,yy,pz);uvs.push(Math.cos(th)*1.2,Math.sin(th)*1.2);
      const och=smooth(.35,.95,fr)*.45;
      col.push(mix(.96,.78,och),mix(.95,.62,och),mix(.91,.44,och));
     }
    }
    for(let jr=0;jr<NR_S;jr++)for(let ia=0;ia<NA_S;ia++){
     const a0=sBase+jr*(NA_S+1)+ia,b0=a0+NA_S+1;
     idx.push(a0,a0+1,b0,a0+1,b0+1,b0);
    }}

   /* 5 staggered overhanging tufa canopy tiers stepping from the serpentinite spring brow to -8.4 m submarine cliff foot */
   const TIERS=[[0.00,0.28],[0.18,0.48],[0.37,0.68],[0.56,0.86],[0.75,1.00]];
   const NR=26,NC=56;
   for(let ti=0;ti<TIERS.length;ti++){
    const f0Base=TIERS[ti][0],f1Base=TIERS[ti][1],isBase=ti===TIERS.length-1;
    const baseV=pos.length/3,cols=NC+3,rows=NR+1;
    const ph1=KRAND.unit(KRAND.hash(S.seed,wi*11+ti,301))*TAU,ph2=KRAND.unit(KRAND.hash(S.seed,wi*11+ti,302))*TAU;
    const nPipes=9+(ti%3)*2,lipPts=[];
    for(let j=0;j<=NR;j++){
     const u=j/NR;
     for(let ic=0;ic<cols;ic++){
      const isSkirtL=ic===0,isSkirtR=ic===cols-1,faRaw=isSkirtL?-1.03:isSkirtR?1.03:(ic-1)/NC*2-1,fa=clamp(faRaw,-1,1);
      const arch=(ti===0?0:.062*(.55-fa*fa)+.048*Math.sin(fa*4.1+ph1)+.030*Math.cos(fa*7.9+ph2))*(isBase?.42:1);
      const f0=clamp(f0Base-arch*.55,0,.92),f1=clamp(f1Base+arch*.75,.12,1);
      const uEff=isBase?u:(u<=.74?u/.74:1-.042*((u-.74)/.26));
      const fVert=lerp(f0,f1,uEff);
      const yBase=lerp(yLip+.45,yBot,fVert);
      const fanSpread=(.38+.62*Math.pow(clamp(fVert+.04,0,1),.65)*smooth(1.0,.86,fVert*.35))*(1+.12*Math.sin(ti*2.3+wi*1.7));
      const sway=(.14*Math.sin(fVert*8.2+wi*1.9+ti*.9)+.07*Math.cos(fVert*15+ph1))*(1-fa*fa);
      const a=(fa+sway)*w.w*fanSpread;
      const mainLobe=Math.exp(-fa*fa*2.7),leftLobe=.85*Math.exp(-Math.pow(fa+.49-.07*Math.sin(ti+wi),2)*9.2),
       rightLobe=.87*Math.exp(-Math.pow(fa-.47+.06*Math.cos(ti*1.7+wi),2)*9.0),edgeFade=smooth(1.01,.64,Math.abs(fa));
      const lobe=clamp(Math.max(mainLobe,leftLobe,rightLobe)*edgeFade,0,1);
      const pipe=.5+.5*Math.cos(fa*Math.PI*nPipes+ph1+.36*Math.sin(u*4.2+fa*1.8));
      const rind=.5+.5*Math.cos(fa*Math.PI*(nPipes*2.2)+ph2);
      const flute=.58*Math.pow(pipe,.76)+.28*rind+.14*(.5+.5*Math.sin(u*14+Math.abs(fa)*7));
      const browScale=.26+.74*smooth(.02,.18,fVert),toeTaper=isBase?(.52+.48*smooth(1.0,.35,u)):1;
      const festoon=isBase?0:2.45*browScale*lobe*(.40+.60*pipe)*smooth(.34,.74,u)*smooth(1.0,.76,u);
      const y=yBase-festoon;
      const sRock=sampleEnv(y,a);
      let bulge;
      if(isSkirtL||isSkirtR||(ti>0&&j===0)||(isBase&&j===NR)){
       bulge=-2.6;
      }else if(ti===0&&j===0){
       bulge=.45*edgeFade;
      }else if(isBase){
       const hood=smooth(0,.16,u)*toeTaper;
       bulge=1.25+edgeFade*(1.15+lobe*hood*(3.8+3.0*flute));
      }else if(u<=.74){
       const hood=smooth(0,.16,u)*(.48+.66*Math.pow(u/.74,.64));
       bulge=1.25+browScale*edgeFade*(1.25+lobe*hood*(4.5+4.2*flute));
      }else{
       const kUnd=(u-.74)/.26;
       const lipB=1.25+browScale*edgeFade*(1.25+lobe*1.14*(4.5+4.2*flute));
       bulge=lerp(lipB,-2.4,Math.pow(kUnd,.68));
      }
      const sOut=sRock+bulge,p=w.F.p(sOut,a);
      if(!isSkirtL&&!isSkirtR&&j>1&&u<=.72&&lobe>.28&&fVert>.06){
       const gHere=drawnH(p[0],p[1]),clr=sOut-envRaw[clamp(Math.round((yLip+4-y)/(yLip+6-yBot)*(NY-1)),0,NY-1)*NA+clamp(Math.round((a+maxHW+8)/(2*(maxHW+8))*(NA-1)),0,NA-1)];
       checkedSamples++;if(clr<-.5&&y<gHere-.8)clippedSamples++;if(clr<minClearance)minClearance=clr;
      }
      if(!isBase&&j===Math.round(NR*.72)&&!isSkirtL&&!isSkirtR&&ic%2===1&&lobe>.22&&browScale>.45){
       lipPts.push({x:p[0],y,z:p[1],sOut,a,fa,lobe,pipe,tier:ti});
      }
      pos.push(p[0],y,p[1]);
      uvs.push(fa*1.7+wi*.37,y*.062);
      const chute=Math.exp(-fa*fa*6.8),ochreBand=clamp(smooth(.10,.40,Math.abs(fa))*smooth(.98,.56,Math.abs(fa))*(.64+.36*Math.sin(fa*9+wi*2.1)),0,1);
      const darkGroove=clamp((1-pipe)*smooth(.88,.12,chute)*.76,0,1);
      const moss=y>8.2?clamp(smooth(.48,.86,Math.abs(fa))*smooth(.38,.04,Math.abs(u-.22))*.74,0,1):0;
      let r=.94,gg=.92,b=.86;
      r=mix(r,mix(.81,.66,rind),ochreBand*.88);
      gg=mix(gg,mix(.59,.42,rind),ochreBand*.88);
      b=mix(b,mix(.36,.22,rind),ochreBand*.88);
      r=mix(r,.22,darkGroove*.70);gg=mix(gg,.20,darkGroove*.70);b=mix(b,.18,darkGroove*.70);
      const fresh=chute*(.42+.58*pipe);
      r=mix(r,.96,fresh*.82);gg=mix(gg,.96,fresh*.82);b=mix(b,.93,fresh*.82);
      r=mix(r,.26,moss);gg=mix(gg,.38,moss);b=mix(b,.18,moss);
      const hostBlend=smooth(.64,1.02,Math.abs(faRaw));
      r=mix(r,.22,hostBlend*.74);gg=mix(gg,.25,hostBlend*.74);b=mix(b,.22,hostBlend*.74);
      if(y<6.6){
       const kSplash=smooth(6.6,4.8,y)*smooth(3.2,4.6,y),kBarn=smooth(4.4,2.8,y)*smooth(.6,1.8,y),kCor=smooth(1.6,.2,y)*smooth(-2.2,-.6,y),kKelp=smooth(-.8,-4.5,y);
       r=mix(r,.24,kSplash*.45);gg=mix(gg,.25,kSplash*.45);b=mix(b,.26,kSplash*.45);
       r=mix(r,.84,kBarn*.45);gg=mix(gg,.82,kBarn*.45);b=mix(b,.76,kBarn*.45);
       r=mix(r,.80,kCor*.42);gg=mix(gg,.68,kCor*.42);b=mix(b,.71,kCor*.42);
       r=mix(r,.28,kKelp*.52);gg=mix(gg,.36,kKelp*.52);b=mix(b,.20,kKelp*.52);
      }
      const underAO=isBase?1:u>.73?lerp(1,.19,clamp((u-.73)/.21,0,1)):1-.15*(1-pipe);
      const skirtShade=(isSkirtL||isSkirtR)?.55:1;
      const ao=underAO*skirtShade;
      col.push(r*ao,gg*ao,b*ao);
     }
    }
    for(let j=0;j<rows-1;j++)for(let ic=0;ic<cols-1;ic++){
     const a00=baseV+j*cols+ic,b00=a00+cols;
     idx.push(a00,b00,a00+1,a00+1,b00,b00+1);
    }

    /* 3D serrated stalactite & bacon-rind drip-teeth hanging from each overhanging canopy hood */
    for(let li=0;li<lipPts.length;li++){
     const lp=lipPts[li],hR=KRAND.unit(KRAND.hash(S.seed,wi*97+ti*31+li,311));
     if(hR>.84)continue;
     const drop=(1.6+3.8*lp.lobe*(.38+.62*lp.pipe))*(.62+.75*hR),rad=.24+.42*lp.lobe*lp.pipe;
     const pBase=pos.length/3,NS=5,NYP=3;
     for(let py=0;py<=NYP;py++){
      const fu=py/NYP,yy=lp.y-drop*fu+.28*(1-fu),rrP=py===NYP?.03:rad*Math.pow(1-fu,.66)*(1+.18*Math.sin(fu*9));
      for(let ps=0;ps<=NS;ps++){
       const ang=ps/NS*TAU,blade=1+.30*Math.cos(ang*2);
       const qP=w.F.p(lp.sOut-.22+Math.cos(ang)*rrP*.72,lp.a+Math.sin(ang)*rrP*blade);
       pos.push(qP[0],yy,qP[1]);
       uvs.push(lp.fa*1.7+ps*.08,yy*.08);
       const tipBright=mix(.76,.97,fu),och=clamp(Math.abs(lp.fa)*1.15,0,.78);
       col.push(mix(.96,.81,och)*tipBright,mix(.95,.63,och)*tipBright,mix(.90,.42,och)*tipBright);
      }
     }
     for(let py=0;py<NYP;py++)for(let ps=0;ps<NS;ps++){
      const a0=pBase+py*(NS+1)+ps,b0=a0+NS+1;
      idx.push(a0,b0,a0+1,a0+1,b0,b0+1);
     }
    }
   }

   /* Cascading white foaming waterfall veil leaping cleanly clear of the central tufa chute + tide-tracking plunge boil */
   {const VR=52,VC=12,vBase=vPos.length/3,veilHalfW=w.w*.16;
    for(let j=0;j<=VR;j++){
     const fv=j/VR,y=lerp(yLip+.45,-7.2,fv);
     const leap=1.35+.95*Math.pow(.5+.5*Math.sin(fv*Math.PI*4.5),.65);
     for(let i=0;i<=VC;i++){
      const fu=i/VC,fa=fu*2-1,a=fa*veilHalfW*(.58+.48*fv)+.10*Math.sin(fv*8+wi)*w.w*.10;
      const brow=.32+.68*smooth(.02,.18,fv),toe=fv>.75?(.65+.35*smooth(1.0,.75,fv)):1;
      const crest=1.4+brow*toe*(1.3+7.8*(.72+.28*Math.cos(fa*Math.PI*2)));
      const sV=sampleEnv(y,a)+crest+leap*(1-.28*fa*fa);
      const p=w.F.p(sV,a);
      vPos.push(p[0],y,p[1]);
      vUv.push(fu,fv*4.5+wi*.3);
     }
    }
    for(let j=0;j<VR;j++)for(let i=0;i<VC;i++){
     const a0=vBase+j*(VC+1)+i,b0=a0+VC+1;
     vIdx.push(a0,b0,a0+1,a0+1,b0,b0+1);
    }
    const sWater=sampleEnv(0,0)+6.2,pPlunge=w.F.p(sWater,0),rPlunge=4.4+w.w*.18;
    const pg=new THREE.CircleGeometry(rPlunge,28);pg.rotateX(-Math.PI/2);
    const pm=new THREE.MeshStandardMaterial({color:0xeaf6f6,roughness:.42,metalness:0,transparent:true,opacity:.86,depthWrite:false});
    KHOOK.add(pm,'cove-plunge-'+wi,sh=>{
     ATMOS.waveUniforms(sh.uniforms);
     KHOOK.v(sh,'#include <common>','#include <common>\nvarying vec2 vPlUv;','cove-plunge');
     KHOOK.v(sh,'#include <begin_vertex>','#include <begin_vertex>\nvPlUv=uv*2.0-1.0;','cove-plunge');
     KHOOK.f(sh,'#include <common>','#include <common>\n#include <atmos_waves>\nvarying vec2 vPlUv;','cove-plunge');
     KHOOK.f(sh,'#include <color_fragment>','#include <color_fragment>\n{float pr=length(vPlUv);float pa=6.2831853*(pr*2.2-fract(atmWaveT*0.045));float pf=exp(-pr*2.1)*(0.58+0.42*sin(pa+sin(vPlUv.x*5.0)*1.4));diffuseColor.rgb=mix(vec3(0.32,0.76,0.78),vec3(0.96,0.98,0.98),clamp(pf*1.2,0.0,1.0));diffuseColor.a*=clamp(pf*1.35,0.0,1.0)*(1.0-smoothstep(0.68,1.0,pr));}','cove-plunge');
    },{key:'cove-plunge'});
    const pMesh=new THREE.Mesh(pg,pm);
    const bedFoot=Math.min(-1.5,terrainH(pPlunge[0],pPlunge[1]));
    pMesh.position.set(pPlunge[0],Math.max(bedFoot,COVE_TIDE.T.level)+.12,pPlunge[1]);
    pMesh.renderOrder=3;pMesh.userData.host=true;pMesh.userData.probeSkip=true;
    pMesh.userData.inspectLabel='Alkaline waterfall plunge boil (Type II pH > 11 seep meeting seawater)';
    scene.add(pMesh);
    COVE_TIDE.T.plungeMeshes.push({mesh:pMesh,bedY:bedFoot});
   }

   const mp=w.F.p(sampleEnv(yLip*.48,0)+6.0,0);
   pp.push(mp[0],yLip*.48,mp[1]);
  });

  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setIndex(idx);g.computeVertexNormals();
  const mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.74,metalness:.02,vertexColors:true,
   bumpMap:TEX_TUFA_BUMP,bumpScale:.24,roughnessMap:TEX_TUFA_ROUGH});
  const m=new THREE.Mesh(g,mat);
  m.castShadow=true;m.receiveShadow=true;m.userData.host=true;m.userData.probePoints=pp;
  m.userData.inspectLabel='Multi-tiered travertine, tufa and brucite-carbonate cliff drapery (Type II Ca-OH pH > 11 seep)';
  scene.add(m);

  const vg=new THREE.BufferGeometry();
  vg.setAttribute('position',new THREE.Float32BufferAttribute(vPos,3));
  vg.setAttribute('uv',new THREE.Float32BufferAttribute(vUv,2));
  vg.setIndex(vIdx);vg.computeVertexNormals();
  const vm=new THREE.MeshStandardMaterial({color:0xecf7f8,roughness:.24,metalness:0,transparent:true,opacity:.92,depthWrite:false,side:THREE.DoubleSide});
  KHOOK.add(vm,'cove-veil',sh=>{
   ATMOS.waveUniforms(sh.uniforms);
   KHOOK.v(sh,'#include <common>','#include <common>\nvarying vec2 vVeilUv;\nvarying float vVeilY;','cove-veil');
   KHOOK.v(sh,'#include <begin_vertex>','#include <begin_vertex>\nvVeilUv=uv;vVeilY=(modelMatrix*vec4(position,1.0)).y;','cove-veil');
   KHOOK.f(sh,'#include <common>','#include <common>\n#include <atmos_waves>\nuniform float uVeilTide;\nvarying vec2 vVeilUv;\nvarying float vVeilY;\nfloat cvHash(vec2 p){vec3 q=fract(vec3(p.xyx)*0.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}\nfloat cvNoise(vec2 p){vec2 i=floor(p),u=fract(p);u=u*u*(3.0-2.0*u);return mix(mix(cvHash(i),cvHash(i+vec2(1.0,0.0)),u.x),mix(cvHash(i+vec2(0.0,1.0)),cvHash(i+vec2(1.0,1.0)),u.x),u.y);}','cove-veil');
   sh.uniforms.uVeilTide={value:COVE_TIDE.T.level};
   COVE_TIDE.T.veilU=sh.uniforms.uVeilTide;
   KHOOK.f(sh,'#include <color_fragment>','#include <color_fragment>\n{if(vVeilY<uVeilTide-0.35)discard;float tScroll=fract(atmWaveT*0.038)*18.0;float st=0.6*cvNoise(vec2(vVeilUv.x*12.0,vVeilUv.y*5.0-tScroll))+0.4*cvNoise(vec2(vVeilUv.x*26.0+4.2,vVeilUv.y*11.0-tScroll*1.9));float side=smoothstep(0.0,0.28,vVeilUv.x)*smoothstep(1.0,0.72,vVeilUv.x);float fm=clamp(0.45+0.68*st,0.0,1.0);diffuseColor.rgb=mix(vec3(0.68,0.89,0.91),vec3(0.98,0.995,0.995),fm);diffuseColor.a*=side*(0.42+0.58*smoothstep(0.22,0.76,st))*smoothstep(uVeilTide-0.25,uVeilTide+1.0,vVeilY);}','cove-veil');
  },{key:'cove-veil'});
  tick(()=>{if(COVE_TIDE.T.veilU)COVE_TIDE.T.veilU.value=COVE_TIDE.T.level;});
  const vMesh=new THREE.Mesh(vg,vm);
  vMesh.renderOrder=3;vMesh.userData.host=true;vMesh.userData.probeSkip=true;
  vMesh.userData.inspectLabel='Cascading hyperalkaline spring veil over tufa draperies';
  scene.add(vMesh);
  COVE_TIDE.T.curtainAudit={weeps:L.WEEPS.length,tiers:5,checked:checkedSamples,clipped:clippedSamples,minClear:+minClearance.toFixed(2)};
 }

 /* 4. BRUCITE-CARBONATE WHITE STACKS: clustered Lost-City chimneys on shallow fault ledges (-8..+5.3 m), exposed at low tide and submerged at high tide */
 {const pos=[],col=[],idx=[],pp=[],nr=15,nc=14;
  L.STACKS.forEach((k,ki)=>{pp.push(k.x,(k.bedY+k.h)*.5,k.z);
   for(let sp=0;sp<k.spires;sp++){const ang=sp/k.spires*TAU+ki*1.1,off=sp?k.r*(.52+.18*(sp%2)):0,
    sx=k.x+Math.cos(ang)*off,sz=k.z+Math.sin(ang)*off,by=Math.min(k.bedY,terrainH(sx,sz))-.45,
    top=sp?lerp(by+1.6,k.h,.68+.16*(sp%2)):k.h,rad=sp?k.r*.58:k.r,base=pos.length/3;
    for(let j=0;j<=nr;j++){const t=j/nr,y=lerp(by,top,t),flange=1+.24*Math.sin(t*19+ki+sp*2)+.12*Math.cos(t*39+ki*3),
     r=t===1?.02:Math.max(.18,rad*(1-.56*Math.pow(t,.85))*flange);
     for(let i=0;i<=nc;i++){const th=i/nc*TAU,rib=1+.12*Math.cos(th*6+t*8+ki),px=sx+Math.cos(th)*r*rib,pz=sz+Math.sin(th)*r*rib;
      const sub=smooth(1.6,-2.2,y);pos.push(px,y,pz);col.push(.95-.30*sub,.95-.14*sub,.91-.22*sub);}}
    for(let j=0;j<nr;j++)for(let i=0;i<nc;i++){const a=base+j*(nc+1)+i,b=a+nc+1;idx.push(a,a+1,b,a+1,b+1,b);}}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.74,metalness:.02,vertexColors:true}));
  m.castShadow=true;m.receiveShadow=true;m.userData.host=true;m.userData.probePoints=pp;
  m.userData.inspectLabel='Brucite-carbonate White Stack (Lost-City alkaline seep chimney; exposed at low tide, submerged at +7 m high tide)';
  scene.add(m);}

 COVE_TIDE.syncScene();
 Object.assign(H.out,{cove:true,raceSpeed:S.sill.raceSpeed,weeps:L.WEEPS.length,stacks:L.STACKS.length,tideRange:14,ktide:!!COVE_TIDE.T.site});
}
