// ---------- Mount Hood: the trails, the Trail map, walking a trail, and the people on them ----------
// The mountain's trails come from OpenStreetMap through tools/make-mthood.py (api.ctx.mtn.trails: every named path,
// track and footway joined by name, measured on the USGS 3DEP ground; .routes: the route relations, among them the
// Timberline Trail round the mountain and the Pacific Crest Trail). The engine already draws them as thin ribbons on
// the ground; this adds (C.hoodTrails: not `trails`, which the engine reads as the pattern of names drawn paler):
//   the Trail map   a topographic map drawn once from the ground itself: the hillshade and the height tints, contours
//                   every 40 m (an index every 200 m), the glaciers, lakes, streams and roads, every trail (the
//                   Timberline Trail and the PCT picked out), the ski runs by difficulty and the lifts (strong on the
//                   winter map, faint on the summer one), the peaks with their heights, trailheads, shelters, huts,
//                   camps, viewpoints and falls, a scale and north; zoom and pan; where you are, and which way you look
//   a trail's card  its length, climb and descent, high and low points, its difficulty, a profile, a few lines about
//                   it (C.hoodTrails.about); `official` corrects the figures OSM inflates (the Timberline Trail's ways
//                   overlap the PCT's); "Fly to it" and "Walk it"; the trail lit on the ground in 3D
//   walking         the camera at a hiker's eyes along the trail, at a walk, a run, or flying over it forty times
//                   faster; Esc or Stop gives the camera back
//   people          hikers on the trails in summer (most on the famous ones), snowshoers on the low trails in winter,
//                   and in climbing season the rope teams on the South Side route (C.hoodTrails.climbs), starting from
//                   Timberline between one and four in the morning, their headlamps a line of lights up the Palmer
//   signs           a brown Forest Service board at every trailhead, its card listing the trails that start there
// The address: #trail=<name> opens the map on that trail. None of it is in the layout fingerprint.
import {hash3} from '../core/rng.js';
import {mergeHash} from '../core/hash.js';

export function trails(api){
  const {THREE,C,scene,P,groundH,animHooks,camera,OSM,HASH0}=api;const ctx=api.ctx,K=C.hoodTrails||{},M=ctx.mtn||{},S=ctx.season;
  const dec=a=>{const o=[];for(let i=0;i+1<a.length;i+=2)o.push([a[i]/10,a[i+1]/10]);return o;};
  const FT=3.28084,MI=1609.344,fmt=n=>Math.round(n).toLocaleString('en-US');
  const mi=m=>(m/MI).toFixed(m<16000?1:0),km=m=>(m/1000).toFixed(m<10000?1:0);
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};

  // ---- the trails as records: chains resampled every 8 m with their running distance ----
  function chainOf(pts){const out=[pts[0]],cum=[0];for(let k=0;k+1<pts.length;k++){const [ax,az]=pts[k],[bx,bz]=pts[k+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/8));
      for(let s=1;s<=n;s++){out.push([ax+(bx-ax)*s/n,az+(bz-az)*s/n]);cum.push(cum[cum.length-1]+L/n);}}
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const [x,z] of out){if(x<x0)x0=x;if(x>x1)x1=x;if(z<z0)z0=z;if(z>z1)z1=z;}
    return {pts:out,cum,len:cum[cum.length-1],bb:[x0,z0,x1,z1]};}
  const ABOUT=Object.entries(K.about||{}).sort((a,b)=>b[0].length-a[0].length);
  const aboutOf=n=>{for(const [k,v] of ABOUT)if(n.startsWith(k)||n.startsWith('Mt. Hood '+k))return v;return '';};
  const TR=[];
  for(const t of M.trails||[]){const chains=t.c.map(c=>chainOf(dec(c))).filter(c=>c.pts.length>1);if(!chains.length)continue;
    TR.push({n:t.n,ref:t.ref||'',k:t.k,sac:t.sac||'',chains,len:t.len,up:t.up,down:t.down,hi:t.hi,lo:t.lo,prof:t.prof||[],about:aboutOf(t.n)});}
  // the official figures where OSM's are wrong: the Timberline Trail's ways overlap, so take its route relation's
  for(const [key,o] of Object.entries(K.official||{})){const t=TR.find(q=>q.n.startsWith(key)&&!/Cutoff|Tie/.test(q.n));if(!t)continue;
    const r=o.route&&(M.routes||[]).find(q=>q.n===o.route);if(r){Object.assign(t,{len:r.len,up:r.up,down:r.down,hi:r.hi,lo:r.lo,prof:r.prof||t.prof,chains:r.c.map(c=>chainOf(dec(c)))});}
    t.official=o;}
  // the climbing routes OSM does not map: their figures measured here on the ground
  for(const cl of K.climbs||[]){const ch=chainOf(cl.pts.map(p=>P(p)));let up=0,dn=0,hi=-1e9,lo=1e9,prev=null;const prof=[];
    for(let i=0;i<ch.pts.length;i+=3){const h=groundH(ch.pts[i][0],ch.pts[i][1]);if(prev!=null){if(h>prev)up+=h-prev;else dn+=prev-h;}prev=h;hi=Math.max(hi,h);lo=Math.min(lo,h);prof.push(h);}
    TR.push({n:cl.n,ref:'',k:'climb',sac:cl.sac||'',chains:[ch],len:ch.len,up,down:dn,hi:Math.max(hi,3429),lo,prof,about:aboutOf(cl.n),climb:cl});}
  const famous=t=>!!t.about||t.k==='climb';
  const isTL=t=>/^Timberline Trail #600/.test(t.n),isPCT=t=>/^Pacific Crest/.test(t.n);
  const PATHS=(M.paths||[]).map(p=>dec(p));
  const SAC={hiking:'Hiking: a good trail',mountain_hiking:'Mountain hiking: steep, rough in places',demanding_mountain_hiking:'Demanding mountain hiking: scrambling, exposure',
    alpine_hiking:'Alpine: snow and rock, an ice axe',demanding_alpine_hiking:'Demanding alpine',difficult_alpine_hiking:'Difficult alpine'};
  const diff=t=>t.k==='climb'?'Glaciated climb: crampons, ice axe, helmet; a guide or experience on snow and ice':(SAC[t.sac]||(t.up>900?'Strenuous':t.up>350?'Moderate':'Easy'));

  // ---- the ground under the map: heights from the fine patch over the mountain, else the 40 m grid ----
  const T=OSM.terrain,TX0=T?T.x0/10:0,TZ0=T?T.z0/10:0,DAT=T&&T.datum||0;
  const gridH=(x,z)=>{const fx=Math.max(0,Math.min(T.nx-1.001,(x-TX0)/T.step)),fz=Math.max(0,Math.min(T.nz-1.001,(z-TZ0)/T.step)),i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,H=T.h,n=T.nx;
    return ((H[j*n+i]*(1-u)+H[j*n+i+1]*u)*(1-v)+(H[(j+1)*n+i]*(1-u)+H[(j+1)*n+i+1]*u)*v)/10+DAT;};
  const hAt=(x,z)=>{const f=ctx.fine&&ctx.fine.at(x,z);return f!=null?f+DAT:gridH(x,z);};
  const Bd=C.bounds,[X0,Z0]=P([Bd[2],Bd[1]]),[X1,Z1]=P([Bd[0],Bd[3]]);

  // ---- the panel ----
  const css=document.createElement('style');css.textContent=`
#trailmap{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(1180px,calc(100vw - 20px));height:min(820px,calc(100vh - 90px));z-index:20;display:none;flex-direction:column;background:#f4f0e6;border:1px solid #5a4a36;box-shadow:0 8px 30px rgba(0,0,0,.5);font:13px/1.4 Georgia,serif;color:#2a2018}
#trailmap.open{display:flex}#trailmap header{display:flex;gap:8px;align-items:center;padding:6px 8px;background:#3a5a3a;color:#f4f0e6;flex-wrap:wrap}
#trailmap header b{font:bold 15px Georgia,serif;letter-spacing:.06em;margin-right:6px}#trailmap header select,#trailmap header button{font:12px Georgia,serif}
#trailmap .tmbody{flex:1;display:flex;min-height:0}#trailmap .tmcv{flex:1;position:relative;min-width:0}#trailmap canvas.tm{position:absolute;inset:0;width:100%;height:100%;cursor:grab;touch-action:none}
#trailmap .tmcard{width:310px;overflow-y:auto;overflow-x:hidden;box-sizing:border-box;border-left:1px solid #b0a080;padding:10px;background:#fbf8f0;display:none}#trailmap .tmcard.on{display:block}
#trailmap .tmcard h3{margin:0 0 2px;font-size:17px}#trailmap .tmcard .ref{color:#7a5a3a;font-size:12px}#trailmap .tmcard table{border-collapse:collapse;margin:6px 0;width:100%}
#trailmap .tmcard td{padding:2px 4px;border-bottom:1px solid #e4dcc8;font-size:12px}#trailmap .tmcard td:first-child{color:#6a5a48}#trailmap .tmcard p{margin:6px 0;font-size:12.5px}
#trailmap .tmcard select{max-width:100%}#trailmap .tmcard button,#trailwalk button{font:12px Georgia,serif;margin:2px 4px 2px 0}#trailmap .tmhint{position:absolute;left:50%;transform:translateX(-50%);top:6px;white-space:nowrap;font:11px Georgia,serif;color:#4a3a28;background:rgba(244,240,230,.8);padding:2px 6px;pointer-events:none}
#trailwalk{position:fixed;left:50%;bottom:calc(var(--barh,44px) + 18px);transform:translateX(-50%);z-index:12;display:none;background:rgba(20,28,20,.86);color:#eef2e8;border:1px solid #7a9a6a;padding:7px 12px;font:13px/1.4 Georgia,serif;text-align:center;max-width:calc(100vw - 32px)}
@media (max-width:700px){#trailmap .tmbody{flex-direction:column}#trailmap .tmcard{width:auto;max-height:42%;border-left:0;border-top:1px solid #b0a080}}`;
  document.head.appendChild(css);
  const panel=document.createElement('div');panel.id='trailmap';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Trail map');
  panel.innerHTML='<header><b>MOUNT HOOD · TRAIL MAP</b><select aria-label="Find a trail"></select><button type="button" data-k="season"></button><button type="button" data-k="fit">Whole map</button><span style="flex:1"></span><button type="button" data-k="close">Close</button></header><div class="tmbody"><div class="tmcv"><canvas class="tm"></canvas><div class="tmhint">Drag to pan, wheel or pinch to zoom. Click a trail for its card; double-click to fly there.</div></div><div class="tmcard"></div></div>';
  document.body.appendChild(panel);
  const cv=panel.querySelector('canvas'),g=cv.getContext('2d'),cardEl=panel.querySelector('.tmcard'),sel=panel.querySelector('select'),seasonB=panel.querySelector('[data-k=season]');
  {const o=document.createElement('option');o.textContent='Find a trail…';o.value='';sel.appendChild(o);
    const list=TR.filter(t=>t.len>300).sort((a,b)=>(famous(b)-famous(a))||a.n.localeCompare(b.n));let grp=null,gf=null;
    for(const t of list){if(famous(t)!==gf){gf=famous(t);grp=document.createElement('optgroup');grp.label=gf?'The well-known trails':'Every other trail';sel.appendChild(grp);}
      const o=document.createElement('option');o.value=String(TR.indexOf(t));o.textContent=t.n+' — '+mi(t.len)+' mi';grp.appendChild(o);}}
  sel.onchange=()=>{if(sel.value!==''){const t=TR[+sel.value];select(t);fitTo(t);}};
  let winter=S?S.skiing>=1:false;const showSeasonB=()=>{seasonB.textContent=winter?'Summer map':'Winter map';};showSeasonB();
  seasonB.onclick=()=>{winter=!winter;showSeasonB();draw();};
  panel.querySelector('[data-k=fit]').onclick=()=>{fitAll();draw();};
  panel.querySelector('[data-k=close]').onclick=()=>close();
  function close(){panel.classList.remove('open');if(btn)btn.setAttribute('aria-expanded','false');}
  function open(){panel.classList.add('open');if(btn)btn.setAttribute('aria-expanded','true');if(S)winter=S.skiing>=1;showSeasonB();resize();if(!base)makeBase();draw();}

  // ---- the base: hillshade, height tints, contours; drawn once, at about 15 m a pixel ----
  let base=null;const BW=1500,BH=Math.round(BW*(Z1-Z0)/(X1-X0)),MPP=(X1-X0)/BW;
  const TINT=[[300,[178,200,150]],[700,[192,208,160]],[1100,[208,214,170]],[1500,[222,218,184]],[1850,[226,214,186]],[2200,[218,206,190]],[2600,[214,210,206]],[3100,[236,236,238]],[3500,[250,250,252]]];
  const tint=h=>{let i=0;while(i+1<TINT.length&&h>TINT[i+1][0])i++;if(i+1>=TINT.length)return TINT[i][1];const [h0,a]=TINT[i],[h1,b]=TINT[i+1],f=Math.max(0,Math.min(1,(h-h0)/(h1-h0)));return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];};
  function makeBase(){const t0=performance.now();base=raster(X0,Z0,MPP,BW,BH);ctx.details=Object.assign(ctx.details||{},{trailMap:{px:BW+'x'+BH,ms:Math.round(performance.now()-t0)}});}
  // a raster of the ground: x0, z0 its north-west corner, mpp metres a pixel; the base and the zoomed-in detail both
  function raster(rx0,rz0,MPP,BW,BH){const H=new Float32Array(BW*BH);
    for(let j=0;j<BH;j++){const z=rz0+(j+0.5)*MPP;for(let i=0;i<BW;i++)H[j*BW+i]=hAt(rx0+(i+0.5)*MPP,z);}
    const c=document.createElement('canvas');c.width=BW;c.height=BH;const cx=c.getContext('2d'),im=cx.createImageData(BW,BH),D=im.data;
    // the light from the north-west, 45 degrees up, as on every printed map; the slope exaggerated a little
    const L=[-0.5,0.7071,-0.5];
    for(let j=0;j<BH;j++)for(let i=0;i<BW;i++){const k=j*BW+i,h=H[k],hx=(H[j*BW+Math.min(BW-1,i+1)]-H[j*BW+Math.max(0,i-1)])/(2*MPP)*1.6,hz=(H[Math.min(BH-1,j+1)*BW+i]-H[Math.max(0,j-1)*BW+i])/(2*MPP)*1.6,
        n=Math.hypot(hx,1,hz),sh=Math.max(0,(-hx*L[0]+L[1]-hz*L[2])/n),col=tint(h),f=0.5+0.62*sh;
      let r=col[0]*f,gg=col[1]*f,b=col[2]*f;
      // contours: where the 40 m band changes to the right or below; every fifth line is an index line
      const c0=Math.floor(h/40),cr=Math.floor(H[j*BW+Math.min(BW-1,i+1)]/40),cd=Math.floor(H[Math.min(BH-1,j+1)*BW+i]/40);
      if(c0!==cr||c0!==cd){const idx=(Math.max(c0,cr,cd)%5===0),a=idx?0.62:0.32;r=r*(1-a)+120*a;gg=gg*(1-a)+82*a;b=b*(1-a)+40*a;}
      D[k*4]=r;D[k*4+1]=gg;D[k*4+2]=b;D[k*4+3]=255;}
    cx.putImageData(im,0,0);
    // the index contours' heights in feet, along a few of them, where the ground is not too steep to read
    cx.font='italic 10px Georgia';cx.fillStyle='rgba(110,74,36,.9)';cx.textAlign='center';const done=[];
    for(let j=6;j<BH-6;j+=23)for(let i=6;i<BW-6;i+=23){const k=j*BW+i,h=H[k],c0=Math.floor(h/200);if(Math.floor(H[k+1]/200)===c0&&Math.floor(H[k+BW]/200)===c0)continue;
      if(hash3(i,j,41)>0.35||done.some(([a,b])=>Math.abs(a-i)<70&&Math.abs(b-j)<50))continue;done.push([i,j]);
      const lv=Math.round(Math.max(h,H[k+1],H[k+BW])/200)*200,hx=H[k+1]-H[k-1],hz=H[k+BW]-H[k-BW];cx.save();cx.translate(i,j);let a=Math.atan2(hx,-hz);if(a>Math.PI/2)a-=Math.PI;if(a<-Math.PI/2)a+=Math.PI;cx.rotate(a);
      cx.fillStyle='rgba(244,240,230,.7)';cx.fillRect(-16,-6,32,11);cx.fillStyle='rgba(110,74,36,.95)';cx.fillText(fmt(Math.round(lv*FT/10)*10),0,3);cx.restore();}
    return c;}
  // zoomed in past the base's pixels, the view is drawn again at the screen's own, a moment after it stops moving
  let detail=null,detT=0;
  function wantDetail(){clearTimeout(detT);if(V.s*MPP<1.4)return;detT=setTimeout(()=>{if(!panel.classList.contains('open'))return;const k=Math.min(1.5,dpr),mpp=1/(V.s*k),w=Math.ceil(CW*k),h=Math.ceil(CH*k);
    const t0=performance.now();try{detail={x0:wx(0),z0:wz(0),mpp,w,h,c:raster(wx(0),wz(0),mpp,w,h)};}catch(e){api.report&&api.report('trail map',e);return;}ctx.details.trailMapDetail={px:w+'x'+h,ms:Math.round(performance.now()-t0)};draw(true);},280);}

  // ---- the view: metres to pixels ----
  const V={cx:(X0+X1)/2,cz:(Z0+Z1)/2,s:0.03};let dpr=1,CW=1,CH=1;
  function resize(){const r=cv.getBoundingClientRect();dpr=Math.min(2,devicePixelRatio||1);CW=Math.max(1,r.width);CH=Math.max(1,r.height);cv.width=Math.round(CW*dpr);cv.height=Math.round(CH*dpr);if(!V.fit){fitAll();V.fit=true;}}
  function fitAll(){V.cx=(X0+X1)/2;V.cz=(Z0+Z1)/2;V.s=Math.min(CW/(X1-X0),CH/(Z1-Z0))*0.98;}
  const sx=x=>(x-V.cx)*V.s+CW/2,sz=z=>(z-V.cz)*V.s+CH/2,wx=px=>(px-CW/2)/V.s+V.cx,wz=py=>(py-CH/2)/V.s+V.cz;
  const path=(pts,closed)=>{g.beginPath();for(let k=0;k<pts.length;k++){const X=sx(pts[k][0]),Y=sz(pts[k][1]);k?g.lineTo(X,Y):g.moveTo(X,Y);}if(closed)g.closePath();};
  const inView=bb=>sx(bb[2])>-20&&sx(bb[0])<CW+20&&sz(bb[3])>-20&&sz(bb[1])<CH+20;
  // the map's records drawn from: lakes, glaciers (with their names), streams, roads, runs, lifts
  const LAKES=(OSM.water||[]).map(w=>({n:w.n||'',o:dec(w.o),i:(w.i||[]).map(dec)}));
  const ring=(o,i)=>[o,...(i||[])];
  const GLA=(M.glaciers||[]).map(q=>({n:q.n,rings:ring(dec(q.o),(q.i||[]).map(dec))}));
  const STR=(M.streams||[]).map(s=>({n:s.n,w:s.w,k:s.k,pts:dec(s.p),int:s.int}));
  const ROADS=(api.ROADS||[]).filter(r=>!/^(path|footway|track|bridleway|steps|service|cycleway)$/.test(r.c));
  const TRACKS=(api.ROADS||[]).filter(r=>/^(track|service)$/.test(r.c));
  const RUNS=(M.pistes||[]).map(p=>({n:p.n,k:p.k,d:p.d,area:!!p.area,pts:p.area?null:dec(p.p),rings:p.area?ring(dec(p.o),(p.i||[]).map(dec)):null}));
  const LIFTS=(M.lifts||[]).map(l=>({n:l.n,k:l.k,pts:dec(l.p),len:l.len,lo:l.lo,hi:l.hi}));
  const RUNC={novice:'#2a9a3a',easy:'#2a9a3a',intermediate:'#1e5ad8',advanced:'#111',expert:'#111',extreme:'#c81e1e',freeride:'#d07a10'};
  const POIS=(M.pois||[]).filter(p=>p.n&&!/^(information|cliff|stone)$/.test(p.k));
  const FALLS=(M.falls||[]).filter(f=>f.n);
  const pc=(x,z,r)=>{g.beginPath();g.arc(sx(x),sz(z),r,0,Math.PI*2);};
  let selected=null,labels=[];
  const label=(text,x,y,o={})=>{g.font=o.font||'11px Georgia';const w=g.measureText(text).width,h=o.h||11,bx=[x-(o.align==='left'?0:w/2)-2,y-h,w+4,h+4];
    if(!o.force&&labels.some(b=>bx[0]<b[0]+b[2]&&b[0]<bx[0]+bx[2]&&bx[1]<b[1]+b[3]&&b[1]<bx[1]+bx[3]))return false;labels.push(bx);
    g.textAlign=o.align||'center';g.lineWidth=3;g.strokeStyle=o.halo||'rgba(250,247,238,.85)';g.strokeText(text,x,y);g.fillStyle=o.colour||'#2a2018';g.fillText(text,x,y);return true;};

  function draw(quiet){if(!panel.classList.contains('open'))return;g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#e8e2d2';g.fillRect(0,0,CW,CH);labels=[];
    if(base){g.imageSmoothingEnabled=true;g.drawImage(base,sx(X0),sz(Z0),(X1-X0)*V.s,(Z1-Z0)*V.s);}
    if(detail&&V.s*MPP>=1.4&&Math.abs(Math.log(detail.mpp*V.s*Math.min(1.5,dpr)))<0.4)g.drawImage(detail.c,sx(detail.x0),sz(detail.z0),detail.w*detail.mpp*V.s,detail.h*detail.mpp*V.s);
    if(!quiet)wantDetail();
    const zoom=V.s/0.03,lw=Math.max(0.6,Math.min(2.4,V.s*28));
    // water
    g.fillStyle='#9cc8e8';g.strokeStyle='#3a78b0';g.lineWidth=0.8;
    for(const l of LAKES){g.beginPath();for(const r of ring(l.o,l.i)){for(let k=0;k<r.length;k++){const X=sx(r[k][0]),Y=sz(r[k][1]);k?g.lineTo(X,Y):g.moveTo(X,Y);}g.closePath();}g.fill('evenodd');g.stroke();}
    for(const s of STR){if(s.k!=='river'&&V.s<0.05&&s.w<4)continue;path(s.pts);g.strokeStyle=s.int?'rgba(58,120,190,.55)':'#4a88cc';g.setLineDash(s.int?[3,2]:[]);g.lineWidth=Math.max(0.6,Math.min(3,s.w*V.s*1.2+0.4));g.stroke();}g.setLineDash([]);
    // glaciers: white-blue with a blue edge, their names in blue italic
    for(const q of GLA){g.beginPath();for(const r of q.rings){for(let k=0;k<r.length;k++){const X=sx(r[k][0]),Y=sz(r[k][1]);k?g.lineTo(X,Y):g.moveTo(X,Y);}g.closePath();}g.fillStyle='rgba(236,246,255,.86)';g.fill('evenodd');g.strokeStyle='#5a9ad0';g.lineWidth=0.9;g.stroke();}
    // roads: the highways white with a dark casing, the forest roads thin
    for(const r of TRACKS){if(V.s<0.045)break;path(r.pts);g.strokeStyle='rgba(120,100,80,.6)';g.lineWidth=0.7;g.setLineDash([4,3]);g.stroke();}g.setLineDash([]);
    for(const pass of [0,1])for(const r of ROADS){const major=/^(motorway|trunk|primary|secondary)/.test(r.c);path(r.pts);g.strokeStyle=pass?(major?'#f0d070':'#fffaf0'):'#5a4a3a';g.lineWidth=(major?3:1.8)*Math.max(0.7,Math.min(1.6,zoom*0.5))+(pass?0:1.4);g.stroke();}
    // the ski runs and lifts: by difficulty, strong on the winter map
    const ra=winter?0.9:0.35;
    for(const r of RUNS){if(r.k!=='downhill'&&!(winter&&r.k==='nordic'))continue;const col=r.k==='nordic'?'#7a3aa8':(RUNC[r.d]||'#555');g.globalAlpha=ra;
      if(r.area){g.beginPath();for(const q of r.rings){for(let k=0;k<q.length;k++){const X=sx(q[k][0]),Y=sz(q[k][1]);k?g.lineTo(X,Y):g.moveTo(X,Y);}g.closePath();}g.fillStyle=col;g.globalAlpha=ra*0.22;g.fill('evenodd');}
      else{path(r.pts);g.strokeStyle=col;g.lineWidth=(winter?2.2:1.2)*Math.max(0.8,Math.min(1.8,zoom*0.4));g.setLineDash(r.k==='nordic'?[5,3]:r.d==='expert'||r.d==='extreme'?[7,2]:[]);g.stroke();}}
    g.setLineDash([]);g.globalAlpha=1;
    for(const l of LIFTS){g.globalAlpha=winter?1:0.55;path(l.pts);g.strokeStyle='#c81e1e';g.lineWidth=winter?1.8:1.1;g.stroke();
      // the towers as ticks across the line, about every 90 m
      const a=l.pts[0],b=l.pts[l.pts.length-1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/90)),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,t=4;
      g.beginPath();for(let k=0;k<=n;k++){const X=sx(a[0]+(b[0]-a[0])*k/n),Y=sz(a[1]+(b[1]-a[1])*k/n);g.moveTo(X-uz*t,Y+ux*t);g.lineTo(X+uz*t,Y-ux*t);}g.stroke();g.globalAlpha=1;}
    // the trails: every unnamed path faint, every named trail the Forest Service's red dashes, the Timberline Trail
    // and the PCT picked out; the climbing route dotted over the snow; the selected trail glowing
    if(V.s>0.04)for(const p of PATHS){path(p);g.strokeStyle='rgba(120,70,40,.5)';g.lineWidth=0.7;g.setLineDash([2,3]);g.stroke();}
    for(const t of TR){const tl=isTL(t),pct=isPCT(t),cl=t.k==='climb';for(const ch of t.chains){if(!inView(ch.bb))continue;path(ch.pts);
      if(tl||pct){g.strokeStyle='rgba(255,250,235,.9)';g.lineWidth=lw*2.8;g.setLineDash([]);g.stroke();}
      g.strokeStyle=tl?'#d4400e':pct?'#5a2a8a':cl?'#14306a':(t.k==='track'?'#7a5a3a':'#a8281a');g.lineWidth=tl||pct?lw*1.6:lw*(famous(t)?1.25:0.95);
      g.setLineDash(tl||pct?[]:cl?[1.5,3]:[6,3]);g.lineCap='round';g.stroke();g.lineCap='butt';}}
    g.setLineDash([]);
    if(selected)for(const ch of selected.chains){path(ch.pts);g.strokeStyle='rgba(255,220,40,.55)';g.lineWidth=lw*6+3;g.stroke();g.strokeStyle='#e01010';g.lineWidth=lw*1.8+0.5;g.stroke();}
    // the places: peaks, falls, trailheads, shelters and huts, camps, viewpoints
    const ftm=e=>(e===3429?'11,249':fmt(e*FT))+' ft';   // the summit by its survey (NGS, 2005), not the metres rounded
    const sym=(p,k)=>{const X=sx(p[0]),Y=sz(p[1]);if(X<-30||Y<-30||X>CW+30||Y>CH+30)return null;g.lineWidth=1;
      if(k==='peak'){g.fillStyle='#3a2a1a';g.beginPath();g.moveTo(X,Y-5);g.lineTo(X+4.5,Y+3);g.lineTo(X-4.5,Y+3);g.closePath();g.fill();}
      else if(k==='fall'){g.strokeStyle='#1a5ab0';g.lineWidth=1.6;g.beginPath();g.moveTo(X-4,Y-3);g.lineTo(X,Y+1);g.lineTo(X+4,Y-3);g.moveTo(X-4,Y+1);g.lineTo(X,Y+5);g.lineTo(X+4,Y+1);g.stroke();}
      else if(k==='trailhead'){g.fillStyle='#6a3a1a';g.fillRect(X-4,Y-4,8,8);g.fillStyle='#fff';g.font='bold 6px Helvetica';g.textAlign='center';g.fillText('T',X,Y+2.5);}
      else if(/shelter|hut|hotel/.test(k)){g.fillStyle='#4a3020';g.beginPath();g.moveTo(X-5,Y);g.lineTo(X,Y-5);g.lineTo(X+5,Y);g.lineTo(X+3.5,Y);g.lineTo(X+3.5,Y+4);g.lineTo(X-3.5,Y+4);g.lineTo(X-3.5,Y);g.closePath();g.fill();}
      else if(k==='camp_site'){g.strokeStyle='#2a5a2a';g.lineWidth=1.4;g.beginPath();g.moveTo(X-4,Y+3);g.lineTo(X,Y-4);g.lineTo(X+4,Y+3);g.stroke();}
      else if(k==='viewpoint'){g.fillStyle='#2a2a2a';g.beginPath();g.moveTo(X,Y);g.arc(X,Y,5,-2.2,-0.94);g.closePath();g.fill();}
      else{g.fillStyle='#3a3a3a';g.beginPath();g.arc(X,Y,2,0,7);g.fill();}return [X,Y];};
    // the summit first, by its surveyed height
    const order=POIS.slice().sort((a,b)=>((b.k==='volcano')-(a.k==='volcano'))||((b.k==='peak')-(a.k==='peak'))||(b.ele-a.ele));
    for(const p of order){const k=p.k==='volcano'?'peak':p.k;const minZ={peak:0,volcano:0,trailhead:0.05,alpine_hut:0.04,wilderness_hut:0.04,shelter:0.04,hotel:0.03,viewpoint:0.06,camp_site:0.09,saddle:0.06,ridge:0.06,valley:0.08,spring:0.12,winter_sports:0.02,attraction:0.04}[p.k];
      if(minZ==null||V.s<minZ)continue;const q=sym(p.at,k);if(!q)continue;
      const ele=p.k==='volcano'?3429:(+p.t_ele||p.ele),big=p.k==='volcano';
      if(k==='peak')label(p.n+' '+ftm(ele)+(V.s>0.06||big?' / '+fmt(ele)+' m':''),q[0],q[1]-7,{font:(big?'bold 14px':'bold 11px')+' Georgia',force:big});
      else if(/ridge|valley|saddle/.test(k))label(p.n,q[0],q[1]-5,{font:'italic 10.5px Georgia',colour:'#5a4028'});
      else label(p.n,q[0]+7,q[1]+4,{align:'left',font:'10.5px Georgia',colour:k==='trailhead'?'#6a3a1a':'#2a2018'});}
    for(const f of FALLS){if(V.s<0.03)break;const q=sym(f.at,'fall');if(q)label(f.n,q[0]+7,q[1]+4,{align:'left',font:'italic 10.5px Georgia',colour:'#1a4a98'});}
    // glacier and lake names, trail names along the famous ones
    for(const q of GLA){if(!q.n)continue;let x=0,z=0;for(const p of q.rings[0]){x+=p[0];z+=p[1];}x/=q.rings[0].length;z/=q.rings[0].length;label(q.n.replace(' Glacier',' Gl.'),sx(x),sz(z),{font:'italic 11px Georgia',colour:'#1a5aa0'});}
    for(const l of LAKES){if(!l.n||l.o.length<4)continue;let x=0,z=0;for(const p of l.o){x+=p[0];z+=p[1];}x/=l.o.length;z/=l.o.length;label(l.n,sx(x),sz(z)+4,{font:'italic 11px Georgia',colour:'#1a4a88'});}
    if(V.s>0.03)for(const t of TR){if(!famous(t)&&V.s<0.08)continue;const ch=t.chains.reduce((a,b)=>b.len>a.len?b:a);const p=ch.pts[Math.floor(ch.pts.length*0.5)];if(!p)continue;
      label((t.ref&&V.s<0.07?'#'+t.ref:t.n.replace(/ Trail #?\w*$/,'')),sx(p[0]),sz(p[1])-4,{font:'italic bold 10.5px Georgia',colour:isTL(t)?'#b03008':'#8a2010'});}
    if(winter&&V.s>0.06)for(const l of LIFTS){if(!l.n)continue;const p=l.pts[Math.floor(l.pts.length/2)];label(l.n,sx(p[0]),sz(p[1])-5,{font:'bold 10px Helvetica',colour:'#a01010'});}
    // you: an arrow and the wedge of what the camera sees
    {const p=camera.position,d=new THREE.Vector3();camera.getWorldDirection(d);const X=sx(p.x),Y=sz(p.z),a=Math.atan2(d.z,d.x),fov=camera.fov*Math.PI/180*camera.aspect*0.5;
      g.fillStyle='rgba(220,40,20,.18)';g.beginPath();g.moveTo(X,Y);g.arc(X,Y,60,a-fov,a+fov);g.closePath();g.fill();
      g.save();g.translate(X,Y);g.rotate(a);g.fillStyle='#e02010';g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.moveTo(9,0);g.lineTo(-6,-5.5);g.lineTo(-3,0);g.lineTo(-6,5.5);g.closePath();g.fill();g.stroke();g.restore();}
    // north, the scale in miles and kilometres, the legend
    g.save();g.translate(28,34);g.fillStyle='#2a2018';g.beginPath();g.moveTo(0,-18);g.lineTo(7,8);g.lineTo(0,3);g.lineTo(-7,8);g.closePath();g.fill();g.font='bold 12px Georgia';g.textAlign='center';g.fillText('N',0,22);g.restore();
    {const nice=v=>{const p=Math.pow(10,Math.floor(Math.log10(v))),m=v/p;return (m>=5?5:m>=2?2:1)*p;};const kmL=nice(130/V.s/1000),miL=nice(130/V.s/MI);
      const y0=CH-46,x0=CW-170;g.fillStyle='rgba(250,247,238,.85)';g.fillRect(x0-8,y0-14,168,40);g.fillStyle='#2a2018';g.font='10px Georgia';g.textAlign='left';
      g.fillRect(x0,y0,kmL*1000*V.s,3);g.fillText(kmL+' km',x0+kmL*1000*V.s+4,y0+4);g.fillRect(x0,y0+12,miL*MI*V.s,3);g.fillText(miL+' mi',x0+miL*MI*V.s+4,y0+16);}
    {const L=[['#d4400e','Timberline Trail',0],['#5a2a8a','Pacific Crest Trail',0],['#a8281a','trail',[6,3]],['#14306a','climbing route',[1.5,3]],['#c81e1e','lift',0]];
      if(winter)L.push(['#2a9a3a','easiest run',0],['#1e5ad8','more difficult',0],['#111','most difficult',0],['#7a3aa8','nordic',[5,3]]);
      const x0=10,y0=CH-12-L.length*13;g.fillStyle='rgba(250,247,238,.85)';g.fillRect(x0-4,y0-12,150,L.length*13+8);
      L.forEach(([c,t,d],i)=>{g.strokeStyle=c;g.lineWidth=2.4;g.setLineDash(d||[]);g.beginPath();g.moveTo(x0,y0+i*13-4);g.lineTo(x0+24,y0+i*13-4);g.stroke();g.setLineDash([]);g.fillStyle='#2a2018';g.font='10.5px Georgia';g.textAlign='left';g.fillText(t,x0+30,y0+i*13);});}
    g.font='9px Georgia';g.textAlign='right';g.fillStyle='rgba(60,44,30,.8)';g.fillText('Contours 40 m (index 200 m, labelled in feet). Map data © OpenStreetMap contributors; elevation USGS 3DEP.',CW-8,CH-4);}

  // ---- pan, zoom, pinch, click ----
  const ptrs=new Map();let drag=null,moved=0,pinch=null;
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.offsetX,e.offsetY]);moved=0;
    if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),s:V.s};drag=null;}else drag={x:e.offsetX,y:e.offsetY,cx:V.cx,cz:V.cz};cv.style.cursor='grabbing';});
  cv.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,[e.offsetX,e.offsetY]);
    if(pinch&&ptrs.size===2){const [a,b]=[...ptrs.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,pinch.s*d/pinch.d/V.s);moved=99;return;}
    if(drag){const dx=e.offsetX-drag.x,dy=e.offsetY-drag.y;moved=Math.max(moved,Math.hypot(dx,dy));V.cx=drag.cx-dx/V.s;V.cz=drag.cz-dy/V.s;draw();}});
  const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;cv.style.cursor='grab';if(drag&&moved<4&&e.type==='pointerup')pick(e.offsetX,e.offsetY);drag=null;};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.offsetX,e.offsetY,Math.exp(-e.deltaY*0.0015));},{passive:false});
  cv.addEventListener('dblclick',e=>{const x=wx(e.offsetX),z=wz(e.offsetY),h=groundH(x,z);api.setView&&api.setView(x,h+700,z+900,x,h,z);close();});
  function zoomAt(px,py,f){const x=wx(px),z=wz(py);V.s=Math.max(0.012,Math.min(2.5,V.s*f));V.cx=x-(px-CW/2)/V.s;V.cz=z-(py-CH/2)/V.s;draw();}
  // the nearest trail to a click, within 8 px
  function pick(px,py){let best=null,bd=8;const x=wx(px),z=wz(py),r=bd/V.s;
    for(const t of TR)for(const ch of t.chains){const b=ch.bb;if(x<b[0]-r||x>b[2]+r||z<b[1]-r||z>b[3]+r)continue;const P2=ch.pts;
      for(let k=0;k+1<P2.length;k+=1){const [ax,az]=P2[k],[bx,bz]=P2[k+1],dx=bx-ax,dz=bz-az,L=dx*dx+dz*dz,u=L?Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/L)):0,d=Math.hypot(x-ax-dx*u,z-az-dz*u)*V.s;
        if(d<bd||(d===bd&&famous(t))){bd=d;best=t;}}}
    if(best)select(best);}
  addEventListener('resize',()=>{if(panel.classList.contains('open')){resize();draw();}});

  // ---- a trail's card ----
  function select(t){selected=t;showCard(t);highlight(t);draw();try{history.replaceState(null,'',mergeHash({trail:t.n})||location.pathname+location.search);}catch(e){}}
  function fitTo(t){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const ch of t.chains){x0=Math.min(x0,ch.bb[0]);z0=Math.min(z0,ch.bb[1]);x1=Math.max(x1,ch.bb[2]);z1=Math.max(z1,ch.bb[3]);}
    V.cx=(x0+x1)/2;V.cz=(z0+z1)/2;V.s=Math.max(0.012,Math.min(1.2,Math.min(CW/(x1-x0+400),CH/(z1-z0+400))*0.9));draw();}
  function showCard(t){cardEl.innerHTML='';cardEl.classList.add('on');
    const h=document.createElement('h3');h.textContent=t.n;cardEl.appendChild(h);
    const r=document.createElement('div');r.className='ref';r.textContent=t.k==='climb'?'Climbing route (not on OpenStreetMap: drawn from its waypoints)':(t.ref?'Trail No. '+t.ref+', Mount Hood National Forest':'Mount Hood National Forest');cardEl.appendChild(r);
    const tb=document.createElement('table'),row=(a,b)=>{const tr=document.createElement('tr'),x=document.createElement('td'),y=document.createElement('td');x.textContent=a;y.textContent=b;tr.append(x,y);tb.appendChild(tr);};
    row('Length',mi(t.len)+' mi ('+km(t.len)+' km)'+(t.k==='climb'?' one way':''));
    row('Climb',fmt(t.up*FT)+' ft ('+fmt(t.up)+' m) up, '+fmt(t.down*FT)+' ft down');
    row('Highest',fmt(t.hi*FT)+' ft ('+fmt(t.hi)+' m)');row('Lowest',fmt(t.lo*FT)+' ft ('+fmt(t.lo)+' m)');
    row('Difficulty',diff(t));
    if(t.official&&t.official.miles)row('Official',`about ${t.official.miles} mi (${Math.round(t.official.miles*1.609)} km), ~${fmt(t.official.feet)} ft of climbing`);
    if(S)row('Now ('+S.label()+')',conditions(t));
    cardEl.appendChild(tb);
    // the profile: height along the way, in feet, with the distance in miles under it
    const pc2=document.createElement('canvas');pc2.width=580;pc2.height=200;pc2.style.cssText='width:100%;height:auto;background:#fff;border:1px solid #d8ccb0';cardEl.appendChild(pc2);
    {const q=pc2.getContext('2d'),pr=t.prof.length>1?t.prof:[t.lo,t.hi],lo=Math.min(...pr),hi=Math.max(...pr),pad=[66,14,16,28],W=580-pad[0]-pad[1],H=200-pad[2]-pad[3],span=Math.max(60,hi-lo);
      const L=t.chains.reduce((a,b)=>b.len>a.len?b:a).len,X=i=>pad[0]+i/(pr.length-1)*W,Y=h=>pad[2]+H-(h-lo)/span*H;
      q.font='16px Georgia';q.fillStyle='#6a5a48';q.strokeStyle='#e8e0cc';q.lineWidth=1;
      for(let k=0;k<=4;k++){const h=lo+span*k/4,y=Y(h);q.beginPath();q.moveTo(pad[0],y);q.lineTo(pad[0]+W,y);q.stroke();q.textAlign='right';q.fillText(fmt(h*FT)+(k===4?' ft':''),pad[0]-4,y+5);}
      for(let k=0;k<=4;k++){q.textAlign='center';q.fillText((L/MI*k/4).toFixed(1)+' mi',pad[0]+W*k/4,200-6);}
      const gr=q.createLinearGradient(0,pad[2],0,pad[2]+H);gr.addColorStop(0,'rgba(160,110,60,.55)');gr.addColorStop(1,'rgba(90,130,70,.25)');
      q.beginPath();q.moveTo(X(0),Y(lo));pr.forEach((h,i)=>q.lineTo(X(i),Y(h)));q.lineTo(X(pr.length-1),Y(lo));q.closePath();q.fillStyle=gr;q.fill();
      q.beginPath();pr.forEach((h,i)=>i?q.lineTo(X(i),Y(h)):q.moveTo(X(i),Y(h)));q.strokeStyle='#7a3a1a';q.lineWidth=2.5;q.stroke();
      }
    if(t.about||t.official&&t.official.note){const p=document.createElement('p');p.textContent=(t.about||'')+(t.official&&t.official.note&&!t.about?t.official.note:'');cardEl.appendChild(p);}
    const bar=document.createElement('div');cardEl.appendChild(bar);
    const mk=(txt,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=txt;b.onclick=fn;bar.appendChild(b);return b;};
    mk('Fly to it',()=>{flyTo(t);close();});
    const pace=document.createElement('select');pace.setAttribute('aria-label','Pace');for(const [k,l] of [['walk','at a walk'],['run','at a run'],['fly','flying over it (×40)']]){const o=document.createElement('option');o.value=k;o.textContent=l;pace.appendChild(o);}
    mk('Walk it',()=>{walk(t,pace.value);close();});bar.appendChild(pace);
    mk('Show on map',()=>fitTo(t));}
  function conditions(t){const sl=S.snowLine;if(t.k==='climb')return S.climbing>0.5?'In season: firm snow early, softening by mid-morning':S.snowLine>2500?'Out of season: rockfall and open crevasses on the bare upper mountain':'Winter: avalanche danger, short days';
    if(t.lo>sl)return 'Under snow: snowshoes or skis';if(t.hi>sl)return 'Snow on its upper '+fmt((t.hi-sl)*FT)+' ft';
    if(S.bloom>0.4&&t.hi>S.bloomH-250)return 'Open; the meadows in flower near '+fmt(S.bloomH*FT)+' ft';if(S.autumn>0.4)return 'Open; huckleberry red on the ridges';return 'Open, free of snow';}

  // ---- the trail lit on the ground ----
  // a ribbon whose width grows with distance (the vertex shader pushes it out sideways), so it reads from the summit
  // and does not smother the path at your feet; it lies a little over the ground and is drawn over it
  const hiM=new THREE.MeshBasicMaterial({color:0xff5a10,transparent:true,opacity:0.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
  hiM.onBeforeCompile=sh=>{sh.vertexShader='attribute vec3 aSide;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{float d=distance((modelMatrix*vec4(position,1.0)).xyz,cameraPosition);float w=clamp(d*0.0035,1.3,45.0);transformed+=aSide*w;transformed.y+=0.4+w*0.25;}');};
  hiM.customProgramCacheKey=()=>'mhtrailhi';
  let hiMesh=null;
  function highlight(t){if(hiMesh){scene.remove(hiMesh);hiMesh.geometry.dispose();hiMesh=null;}if(!t)return;
    const pos=[],side=[],idx=[];let base0=0;
    for(const ch of t.chains){const Pp=ch.pts;for(let k=0;k<Pp.length;k++){const a=Pp[Math.max(0,k-1)],b=Pp[Math.min(Pp.length-1,k+1)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L,nz=dx/L,y=groundH(Pp[k][0],Pp[k][1]);
        pos.push(Pp[k][0],y,Pp[k][1],Pp[k][0],y,Pp[k][1]);side.push(nx,0,nz,-nx,0,-nz);if(k)idx.push(base0+2*k-2,base0+2*k-1,base0+2*k,base0+2*k-1,base0+2*k+1,base0+2*k);}
      base0+=Pp.length*2;}
    const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('aSide',new THREE.Float32BufferAttribute(side,3));ge.setIndex(idx);ge.computeBoundingSphere();
    hiMesh=tag(new THREE.Mesh(ge,hiM));hiMesh.frustumCulled=false;hiMesh.renderOrder=3;hiMesh.name='trail highlight';hiMesh.userData.noShadow=true;scene.add(hiMesh);}
  function flyTo(t){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const ch of t.chains){x0=Math.min(x0,ch.bb[0]);z0=Math.min(z0,ch.bb[1]);x1=Math.max(x1,ch.bb[2]);z1=Math.max(z1,ch.bb[3]);}
    const cx=(x0+x1)/2,cz=(z0+z1)/2,ext=Math.max(600,x1-x0,z1-z0),h=groundH(cx,cz);api.setView&&api.setView(cx-ext*0.15,h+ext*0.75,cz+ext*0.95,cx,h,cz);}

  // ---- walking a trail ----
  const hud=document.createElement('div');hud.id='trailwalk';hud.setAttribute('role','status');document.body.appendChild(hud);
  let W=null;
  function walk(t,pace){stopWalk();const ch=t.chains.reduce((a,b)=>b.len>a.len?b:a),PC=K.pace||{};
    // start at the end nearer the camera, or at the bottom of a climb
    let rev=false;if(t.k!=='climb'){const p=camera.position,a=ch.pts[0],b=ch.pts[ch.pts.length-1];rev=Math.hypot(b[0]-p.x,b[1]-p.z)<Math.hypot(a[0]-p.x,a[1]-p.z);}
    W={t,ch,rev,s:0,pace,speed:{walk:PC.walk==null?1.3:PC.walk,run:PC.run==null?3.2:PC.run,fly:PC.fly==null?40:PC.fly},last:performance.now(),look:null,mine:api.ctl?api.ctl.goal:null};
    W.pop=ctx.pushCam&&ctx.pushCam(walkFrame);hud.style.display='block';hudShow(true);}
  function stopWalk(){if(!W)return;if(W.pop)W.pop();W=null;if(hiMesh)hiMesh.visible=true;hud.style.display='none';}
  const at=(ch,s,rev)=>{s=Math.max(0,Math.min(ch.len,rev?ch.len-s:s));let lo=0,hi=ch.cum.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(ch.cum[m]<=s)lo=m;else hi=m;}
    const f=(s-ch.cum[lo])/((ch.cum[hi]-ch.cum[lo])||1),a=ch.pts[lo],b=ch.pts[hi];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];};
  function walkFrame(now,c){if(!W)return;if(c.goal&&c.goal!==W.mine){stopWalk();return;}
    const dt=Math.min(0.1,(now-W.last)/1000);W.last=now;const fly=W.pace==='fly';W.s+=W.speed[W.pace]*dt;if(W.s>=W.ch.len){stopWalk();return;}
    const [x,z]=at(W.ch,W.s,W.rev),gy=groundH(x,z),eye=gy+(fly?70:1.7),ahead=fly?260:W.pace==='run'?30:14,[lx,lz]=at(W.ch,W.s+ahead,W.rev),ly=groundH(lx,lz);
    // the gaze: the point ahead, eased so the view does not jerk at every bend, a little above its ground so a hill ahead is looked up to, not into
    const tgt=[lx,fly?ly+10:eye+(ly-gy)*0.55,lz];if(!W.look)W.look=tgt.slice();const k=1-Math.exp(-dt*(fly?1.5:3));for(let i=0;i<3;i++)W.look[i]+=(tgt[i]-W.look[i])*k;
    const dx=x-W.look[0],dy=eye-W.look[1],dz=z-W.look[2],hz=Math.hypot(dx,dz)||0.01;
    c.target.set(W.look[0],W.look[1],W.look[2]);c.az=Math.atan2(dz,dx);c.el=Math.atan2(dy,hz);c.dist=Math.hypot(hz,dy);c.goal=null;W.mine=null;
    // the lit ribbon lifts and widens with distance: from a walker's eye its far end stands above the horizon and
    // covers the sky, so it is hidden on foot and shown again flying over or after
    if(hiMesh)hiMesh.visible=fly;
    W.y=gy;hudShow(false);}
  let hudT=0;function hudShow(force){if(!W)return;const now=performance.now();if(!force&&now-hudT<250)return;hudT=now;
    hud.innerHTML='';const b=document.createElement('b');b.textContent=W.t.n;hud.appendChild(b);
    hud.appendChild(document.createTextNode(` — ${mi(W.s)} of ${mi(W.ch.len)} mi (${km(W.s)} of ${km(W.ch.len)} km) · ${fmt((W.y||0)*FT)} ft (${fmt(W.y||0)} m) `));
    for(const [k,l] of [['walk','Walk'],['run','Run'],['fly','Fly over']]){const q=document.createElement('button');q.type='button';q.textContent=l;q.setAttribute('aria-pressed',String(W.pace===k));q.onclick=()=>{W.pace=k;hudShow(true);};hud.appendChild(q);}
    const s=document.createElement('button');s.type='button';s.textContent='Stop (Esc)';s.onclick=stopWalk;hud.appendChild(s);}
  addEventListener('keydown',e=>{if(e.key==='Escape'){if(W){stopWalk();e.preventDefault();}else if(panel.classList.contains('open'))close();}});

  // ---- the people on the trails ----
  // a figure, 1.75 m, facing +z from its feet: tapered legs, arms in two pieces, a head under a beanie, a framed pack
  // with a pad roll; poles, an ice axe or snowshoes by what the figure is doing. Two instanced meshes: the jacket and
  // beanie take a colour per instance, the rest their own. Each vertex says which limb it hangs from (aPart.x: 1, 2 the
  // left and right leg from the hip, 3, 4 the arms from the shoulder) and what it is shown for (aPart.y: 1 poles,
  // 2 the ice axe, 3 snowshoes); each instance carries its gait (aAnim: the phase at time 0, its rate, the swing, the kind
  // 0 walking, 1 with poles, 2 snowshoeing, 3 climbing with an axe, 4 standing), so the walk cycle runs in the shader
  const cyl=(r0,r1,h,x,y,z,sd=6)=>new THREE.CylinderGeometry(r1,r0,h,sd).translate(x,y,z);
  const box=(w,h,d,x,y,z)=>new THREE.BoxGeometry(w,h,d).translate(x,y,z);
  const mergeG=list=>{const pos=[],cl=[],pa=[];for(const [ge,col,limb,gate] of list){const a=ge.toNonIndexed().attributes.position.array,cc=new THREE.Color(col);
      for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);cl.push(cc.r,cc.g,cc.b);pa.push(limb||0,gate||0);}}
    const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));
    ge.setAttribute('aPart',new THREE.Float32BufferAttribute(pa,2));ge.computeVertexNormals();return ge;};
  const W1='#ffffff',TROU='#3a3b42',BOOT='#4a3424',SKIN='#c89a78',GLOVE='#2a2a2e',PACK='#4a5a3a',FRAME='#9a9ca0',PAD='#c0a040',POLE='#b8bcc4',AXE='#5a5e66',SHOE='#26282c';
  const jacketG=mergeG([[cyl(0.16,0.19,0.58,0,1.17,0,7).scale(1,1,0.72),W1],
      [cyl(0.055,0.05,0.32,-0.245,1.29,0),W1,3],[cyl(0.055,0.05,0.32,0.245,1.29,0),W1,4],[cyl(0.05,0.042,0.28,-0.255,0.99,0.01),W1,3],[cyl(0.05,0.042,0.28,0.255,0.99,0.01),W1,4],
      [new THREE.SphereGeometry(0.128,8,4,0,Math.PI*2,0,Math.PI/2).translate(0,1.61,0),W1],[new THREE.SphereGeometry(0.035,5,4).translate(0,1.75,0),W1]]),
    restG=mergeG([[cyl(0.07,0.088,0.46,-0.1,0.68,0),TROU,1],[cyl(0.07,0.088,0.46,0.1,0.68,0),TROU,2],[cyl(0.05,0.066,0.42,-0.1,0.27,0),TROU,1],[cyl(0.05,0.066,0.42,0.1,0.27,0),TROU,2],
      [box(0.11,0.1,0.25,-0.1,0.05,0.04),BOOT,1],[box(0.11,0.1,0.25,0.1,0.05,0.04),BOOT,2],
      [cyl(0.05,0.055,0.1,0,1.49,0),SKIN],[new THREE.SphereGeometry(0.115,8,6).scale(0.92,1.05,1).translate(0,1.6,0.01),SKIN],
      [new THREE.SphereGeometry(0.045,5,4).translate(-0.26,0.82,0.02),GLOVE,3],[new THREE.SphereGeometry(0.045,5,4).translate(0.26,0.82,0.02),GLOVE,4],
      [box(0.3,0.46,0.17,0,1.2,-0.2),PACK],[box(0.28,0.1,0.15,0,1.47,-0.19),PACK],[cyl(0.012,0.012,0.72,-0.14,1.15,-0.3,4),FRAME],[cyl(0.012,0.012,0.72,0.14,1.15,-0.3,4),FRAME],
      [box(0.3,0.03,0.03,0,1.5,-0.3),FRAME],[cyl(0.06,0.06,0.36,0,0,0,8).rotateZ(Math.PI/2).translate(0,0.94,-0.22),PAD],
      [cyl(0.009,0.011,1.12,-0.29,0.33,0.06,4).rotateX(0.12),POLE,3,1],[cyl(0.009,0.011,1.12,0.29,0.33,0.06,4).rotateX(0.12),POLE,4,1],
      [cyl(0.014,0.016,0.66,0.27,0.5,0.03,5),AXE,4,2],[box(0.04,0.03,0.28,0.27,0.84,0.03),AXE,4,2],
      [box(0.22,0.025,0.56,-0.12,0.012,0.06),SHOE,1,3],[box(0.22,0.025,0.56,0.12,0.012,0.06),SHOE,2,3]]);
  const aAnim=new THREE.InstancedBufferAttribute(new Float32Array(900*4),4);aAnim.setUsage(THREE.DynamicDrawUsage);
  jacketG.setAttribute('aAnim',aAnim);restG.setAttribute('aAnim',aAnim);
  const uWalkT={value:0};
  const gait=m=>{m.onBeforeCompile=sh=>{sh.uniforms.uWalkT=uWalkT;
      sh.vertexShader='attribute vec2 aPart;attribute vec4 aAnim;uniform float uWalkT;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
{float kind=aAnim.w,amp=aAnim.z,ph=aAnim.x+aAnim.y*uWalkT,sw=sin(ph),limb=aPart.x,gate=aPart.y;
 // what this figure does not carry folds away to nothing
 bool hide=(gate>0.5&&gate<1.5&&!(kind>0.5&&kind<2.5))||(gate>1.5&&gate<2.5&&!(kind>2.5&&kind<3.5))||(gate>2.5&&!(kind>1.5&&kind<2.5));
 if(hide)transformed*=0.0;
 else{float a=0.0,py=0.0;
  if(limb>0.5&&limb<2.5){py=0.92;a=(limb<1.5?1.0:-1.0)*amp*sw;if(kind>1.5&&kind<2.5)transformed.x+=(limb<1.5?-0.05:0.05)*(0.92-transformed.y);}
  else if(limb>2.5){py=1.42;a=(limb<3.5?-1.0:1.0)*amp*sw*0.8;if(kind>2.5&&kind<3.5&&limb>3.5)a=0.35+0.15*amp*sw;}
  if(limb>0.5){float dy=transformed.y-py,dz=transformed.z,c=cos(a),s=sin(a);transformed.y=py+dy*c+dz*s;transformed.z=dz*c-dy*s;}
  transformed.y+=abs(cos(ph))*0.03*step(0.01,amp);}
}`);};m.customProgramCacheKey=()=>'mhgait';return m;};
  const pMat=gait(new THREE.MeshLambertMaterial({vertexColors:true})),MAXP=900;
  const jIM=tag(new THREE.InstancedMesh(jacketG,pMat,MAXP)),rIM=tag(new THREE.InstancedMesh(restG,gait(new THREE.MeshLambertMaterial({vertexColors:true})),MAXP));
  for(const m of [jIM,rIM]){m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.count=0;m.frustumCulled=false;m.castShadow=true;scene.add(m);}
  const JACK=['#c83a20','#2a5ab0','#e0a020','#2a8a5a','#8a2a8a','#e06a10','#1e1e24','#3aa0c0','#b02040','#6a8a2a'].map(h=>new THREE.Color(h));
  // (the colour attribute made at full size: setColorAt would size it by the mesh's count, which is 0 here)
  jIM.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(MAXP*3),3);for(let i=0;i<MAXP;i++)jIM.setColorAt(i,JACK[(i*7)%JACK.length]);
  // the walkers: on each chain, a number by its length and how well known the trail is; each walks it back and forth
  const WALKERS=[];
  TR.forEach((t,ti)=>{if(t.k==='climb')return;t.chains.forEach((ch,ci)=>{const n=Math.round(ch.len/1000*(famous(t)?5:1.4)+(hash3(ti,ci,51)<0.3?1:0));
    for(let i=0;i<n;i++){const grp=1+Math.floor(hash3(ti,ci*31+i,52)*3);for(let m=0;m<grp;m++)WALKERS.push({t,ch,ph:hash3(ti,ci*31+i,53),sp:(0.9+hash3(ti,i,54)*0.5),dir:hash3(ti,i,55)<0.5?1:-1,lag:m*(2.2+hash3(i,m,56)*2),r:hash3(ti*7+i,m,57),low:t.hi<1550});}});});
  // the climbers: rope teams of two to four on the South Side route, by the hour
  const CL=TR.find(t=>t.k==='climb'),CLIMB=[];
  if(CL)for(let i=0;i<70;i++){const team=Math.floor(i/3),st=0.6+hash3(team,1,58)*3.2,up=6.2+hash3(team,2,58)*2.4;CLIMB.push({i,team,st,up,lag:(i%3)*7,r:hash3(i,3,58)});}
  const lampG=new THREE.BufferGeometry(),lampP=new Float32Array(CLIMB.length*3);lampG.setAttribute('position',new THREE.BufferAttribute(lampP,3));
  const lampTex=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const q=c.getContext('2d'),gr=q.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,240,1)');gr.addColorStop(0.3,'rgba(255,240,200,.6)');gr.addColorStop(1,'rgba(255,230,180,0)');q.fillStyle=gr;q.fillRect(0,0,32,32);return new THREE.CanvasTexture(c);})();
  const lamps=tag(new THREE.Points(lampG,new THREE.PointsMaterial({map:lampTex,size:7,sizeAttenuation:false,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:0xfff4d8})));
  lamps.frustumCulled=false;lamps.renderOrder=4;scene.add(lamps);
  const o3=new THREE.Object3D();let pT=0,shown=0;const t0=performance.now();
  o3.rotation.order='YXZ';   // turn to the path, then lean forward into it
  // a stride is 1.5 m (two steps) at a walk; the phase follows the distance walked, so feet keep pace with the ground
  function place(i,x,z,ang,lean,dist,speed,amp,kind,ts){o3.position.set(x,groundH(x,z),z);o3.rotation.set(lean||0,ang,0);o3.scale.setScalar(1);o3.updateMatrix();jIM.setMatrixAt(i,o3.matrix);rIM.setMatrixAt(i,o3.matrix);
    const st=kind===2?1.7:1.5,rate=speed/st*Math.PI*2,A=aAnim.array;A[i*4]=dist/st*Math.PI*2-rate*ts;A[i*4+1]=rate;A[i*4+2]=amp;A[i*4+3]=kind;}
  animHooks.push(now=>{uWalkT.value=(now-t0)/1000;});
  animHooks.push(now=>{if(now-pT<60)return;pT=now;const p=camera.position,ts=(now-t0)/1000,hr=api.hour?api.hour():12,night=api.nightF?api.nightF(hr):0;
    const hike=S?S.hiking:1,snow=S?(S.snowLine<1450?1:0):0,climbing=S?S.climbing:0,R=1400,hh=p.y-groundH(p.x,p.z);let n=0;
    // people are out by day: from seven in the morning to an hour before dark
    const day=Math.max(0,Math.min(1,(hr-7)))*Math.max(0,Math.min(1,(19.5-hr)));
    if(hh<R*1.2&&day>0)for(const w of WALKERS){if(n>=MAXP-80)break;const b=w.ch.bb;if(p.x<b[0]-R||p.x>b[2]+R||p.z<b[1]-R||p.z>b[3]+R)continue;
      // (no one within 3 m of a camera on the ground: a walk's camera would stand inside them)
      // summer: everyone the season allows; winter: snowshoers on the low trails only
      const ok=snow?(w.low&&w.r<0.5):(w.r<hike*day);if(!ok)continue;
      const L=w.ch.len;let s=((w.ph*2*L+w.dir*w.sp*(snow?0.6:1)*ts-w.lag)%(2*L)+2*L)%(2*L);const back=s>L;if(back)s=2*L-s;
      const [x,z]=at(w.ch,s,false);if(Math.abs(x-p.x)>R||Math.abs(z-p.z)>R||(hh<6&&Math.hypot(x-p.x,z-p.z)<3))continue;const [x2,z2]=at(w.ch,s+(back?-2:2),false);
      const sp=w.sp*(snow?0.6:1);place(n,x,z,Math.atan2(x2-x,z2-z),snow?0.05:0.03,s,sp,snow?0.42:0.5,snow?2:(w.r*7%1<0.45?1:0),ts);n++;}
    // the climbers by the hour: up by headlamp from their start, a while on the top, then down
    let nl=0;if(CL&&climbing>0.05){const ch=CL.chains[0],L=ch.len;
      for(const c of CLIMB){if(c.r>climbing)continue;let s=-1;const e=hr-c.st;
        if(e>0&&e<c.up)s=L*Math.pow(e/c.up,1.15);else if(e>=c.up&&e<c.up+0.6)s=L;else if(e>=c.up+0.6&&e<c.up+3.4)s=L*(1-(e-c.up-0.6)/2.8);
        if(s<0)continue;s=Math.max(0,s-c.lag);const [x,z]=at(ch,s,false),y=groundH(x,z);
        if(night>0.25){lampP[nl*3]=x;lampP[nl*3+1]=y+1.7;lampP[nl*3+2]=z;nl++;}
        if(n<MAXP&&Math.hypot(x-p.x,z-p.z)<R&&!(hh<6&&Math.hypot(x-p.x,z-p.z)<3)){const top=e>=c.up&&e<c.up+0.6,down=e>=c.up+0.6,[x2,z2]=at(ch,s+(down?-2:2),false);place(n,x,z,Math.atan2(x2-x,z2-z),top?0:0.16,s,top?0:0.45,top?0:0.3,top?4:3,ts);n++;}}}
    lampG.setDrawRange(0,nl);lampG.attributes.position.needsUpdate=true;lamps.visible=nl>0;if(nl)lampG.computeBoundingSphere();
    jIM.count=rIM.count=n;jIM.instanceMatrix.needsUpdate=rIM.instanceMatrix.needsUpdate=true;aAnim.needsUpdate=true;shown=n;
    ctx.details.trails={trails:TR.length,walkers:WALKERS.length,shown,headlamps:nl};});

  // ---- the signs at the trailheads ----
  const signM={post:new THREE.MeshLambertMaterial({color:0x5a3e26}),board:new THREE.MeshLambertMaterial({color:0x6a4424}),letters:new THREE.MeshLambertMaterial({color:0xe8dcb8}),roof:new THREE.MeshLambertMaterial({color:0x4a3a2a})};
  if(ctx.ground&&ctx.ground.snowOnTop)ctx.ground.snowOnTop(signM.roof,{k:'sign'});
  let nSigns=0;
  for(const p of M.pois||[]){if(p.k!=='trailhead'||!p.n)continue;const [px,pz]=p.at;const x=px+(hash3(px,pz,59)-0.5)*6,z=pz+(hash3(pz,px,60)-0.5)*6,y=groundH(x,z),grp=new THREE.Group();
    for(const sx2 of [-0.75,0.75])grp.add(new THREE.Mesh(new THREE.BoxGeometry(0.14,2.1,0.14).translate(sx2,1.05,0),signM.post));
    grp.add(new THREE.Mesh(new THREE.BoxGeometry(1.9,0.85,0.08).translate(0,1.55,0),signM.board));
    for(let r=0;r<3;r++)grp.add(new THREE.Mesh(new THREE.BoxGeometry(1.5-r*0.3,0.07,0.02).translate(0,1.8-r*0.2,0.05),signM.letters));   // the routed lettering
    grp.add(new THREE.Mesh(new THREE.BoxGeometry(2.2,0.08,0.5).translate(0,2.12,0).rotateX(0),signM.roof));
    grp.position.set(x,y-0.05,z);grp.rotation.y=hash3(x,z,61)*6.28;
    // the trails that start here: an end of one of its chains within 250 m
    const here=TR.filter(t=>t.k!=='climb'&&t.chains.some(ch=>{const a=ch.pts[0],b=ch.pts[ch.pts.length-1];return Math.hypot(a[0]-px,a[1]-pz)<250||Math.hypot(b[0]-px,b[1]-pz)<250;}));
    grp.userData.info={name:p.n,info:(here.length?'Trails from here: '+here.slice(0,8).map(t=>`${t.n} (${mi(t.len)} mi)`).join('; ')+'. ':'')+`${fmt(p.ele*FT)} ft (${fmt(p.ele)} m). A Northwest Forest Pass is needed to park; in the wilderness, fill in a free permit at the board. Open the Trail map for any trail's card.`};
    grp.traverse(q=>{q.userData.info=grp.userData.info;q.castShadow=true;});tag(grp);scene.add(grp);if(api.LANDMARKS)api.LANDMARKS.push(grp);nSigns++;}

  // ---- the button, and #trail= in the address ----
  let btn=null;
  api.onUI&&api.onUI(({ui,mkBtn})=>{btn=mkBtn('Trail map',ui,()=>{panel.classList.contains('open')?close():open();});btn.setAttribute('aria-expanded','false');btn.title='A topographic map of every trail, the lifts and runs; a trail’s card, profile and a walk along it';
    const m=/(?:^|&)trail=([^&]+)/.exec(HASH0||'');if(m){const n=decodeURIComponent(m[1]).replace(/\+/g,' '),t=TR.find(q=>q.n===n)||TR.find(q=>q.n.startsWith(n));if(t){open();select(t);fitTo(t);}}else if(/(?:^|&)trailmap(?:&|$|=)/.test(HASH0||''))open();
    // #walk=<name>[&pace=run|fly]: straight onto the trail
    const w=/(?:^|&)walk=([^&]+)/.exec(HASH0||''),pc=/(?:^|&)pace=(walk|run|fly)/.exec(HASH0||'');if(w){const n=decodeURIComponent(w[1]).replace(/\+/g,' '),t=TR.find(q=>q.n===n)||TR.find(q=>q.n.startsWith(n));if(t){highlight(t);walk(t,pc?pc[1]:'walk');}}});
  // the live arrow on an open map
  let mT=0;animHooks.push(now=>{if(now-mT<200||!panel.classList.contains('open'))return;mT=now;draw(true);});
  ctx.trails={list:TR,select:t=>{open();select(t);fitTo(t);},walk,stopWalk,open,close,find:n=>TR.find(q=>q.n.startsWith(n))};
  ctx.details=Object.assign(ctx.details||{},{trails:{trails:TR.length,walkers:WALKERS.length,signs:nSigns,shown:0}});
}
