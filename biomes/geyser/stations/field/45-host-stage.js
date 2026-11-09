// ================================================================= HOST — stage for a geyser field on other ground (stations 2-5: puna, basin, corona, ice)
// The base the four stations share (station.json "base": "field"; PLAN-STATIONS.md). The showcase's stage (src/45) draws the Steampits' basin with
// its plateau, Stair, creek and sea; this one draws a field on whatever ground its station's site record says (STATION_SITE, the station's 44s):
//   land(x, z)      the ground before the thermal relief (metres over the field's own datum, y up; x east, z south)
//   field           {x, z, r} the thermal field's centre and reach; floorK(x, z) 0..1 the field's floor (default an ellipse round it)
//   thermal()       the kit's layout (GEYSER.lay's spec), called in 47 once the kit is loaded (GEYSER.cluster, or a field written out)
//   amb, wind, sun, haze, fog, light    the air: mean temperature (degC), the wind (where it blows to), the sun, the haze colour, its density
// The names the shared host fragments read (84, 85, 89, 99) are given here as the showcase's features with none of them present: no sea (shoreZ far
// south), no creek, no Stair (STAIR.none). The field's ground is the kit's (GEYSER.relief on land).
const SITE=STATION_SITE;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(SITE.haze==null?0xc8d0d4:SITE.haze);scene.fog=new THREE.FogExp2(HAZE.getHex(),SITE.fog==null?.0002:SITE.fog);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,16000);
const hemi=new THREE.HemisphereLight(0xc8d4dc,0x4a4640,.7);scene.add(hemi);
const SUN_POS=SITE.sun||[-900,820,700];
const sun=new THREE.DirectionalLight(0xfff0d8,1.4);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8c8d0,.3);fill.position.set(900,400,-900);scene.add(fill);
const WIND=SITE.wind||[.6,-.4];

// ---------------------------------------------------------------- the land
const TERR={R:1400};
const SEA=-1e4;   /* no sea: nothing is under it */
const landH=(x,z)=>SITE.land(x,z);
const F0=SITE.field;
const BASIN={x:F0.x,z:F0.z,rx:F0.r,rz:F0.r*(F0.e==null?.8:F0.e),name:SITE.fieldName||'The geyser field'};
const basinK=SITE.floorK||((x,z)=>smooth(1.18,.86,Math.hypot((x-BASIN.x)/BASIN.rx,(z-BASIN.z)/BASIN.rz)));
// the showcase's features, absent here (84 paints by them, 99's views and checks read them; each reads as nothing)
const shoreZ=x=>1e9;
const STAIR={none:true,x0:0,z0:0,w:0,name:''},STAIR_TOP=0;
const stairX=z=>0,stairW=z=>0,stairK=(x,z)=>0;
const CREEK={none:true,P:[],bed:[],w:[],s:[],len:0,depth:0,name:''};
const _cq={d:1e9,i:0,t:0,bed:-1e9,w:0};
function creekAt(x,z){return _cq;}

// ---------------------------------------------------------------- a field's layout, written from the site's numbers (GEYSER.lay's spec)
// FIELD_SPEC(o): the geysers, springs, acid ground, fumaroles, sinter flats and dead ring of one field, every record from KRAND.hash(seed, index, salt),
// placed in the field's ellipse (or along o.line: [[x, z], ...], a fault the vents follow, as corona's ring), spaced so no two crowd. o:
//   seed, r (reach), e (the ellipse's z/x), line, amb
//   geysers {n, H [lo, hi], period [lo, hi] s, dur [lo, hi] s, kinds [...], names [...]}, spouters n
//   springs {n, r [lo, hi], temp [lo, hi], big (the first a prismatic of this radius), minerals [...], tints [[r, g, b]...]}
//   acid {n, r, mud, fumaroles}, fumaroles {n groups, each [3, 8]}, dead {r, n, f (how far out, of r), name} | null, runLen
function FIELD_SPEC(o){const sd=o.seed==null?1:o.seed,U=(i,s)=>KRAND.unit(KRAND.hash(sd,i,s)),lerp=(a,b,t)=>a+(b-a)*t,cx=BASIN.x,cz=BASIN.z,r=o.r,e=o.e==null?.8:o.e;
 const taken=[];const free=(x,z,R)=>!taken.some(t=>Math.hypot(t[0]-x,t[1]-z)<t[2]+R);
 // a point in the field (or along its line), its own hash; tries until it is clear of the others
 const spot=(i,salt,R,f)=>{for(let k=0;k<24;k++){let x,z;const u=U(i*31+k,salt),v=U(i*31+k,salt+1);
   if(o.line){const L=o.line,seg=Math.min(L.length-2,Math.floor(u*(L.length-1))),t=u*(L.length-1)-seg,a=L[seg],b=L[seg+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,off=(v-.5)*2*r*(f==null?.25:f);
    x=a[0]+dx*t-dz/l*off;z=a[1]+dz*t+dx/l*off;}
   else{const an=u*TAU,d=r*(f==null?.8:f)*Math.sqrt(v);x=cx+Math.cos(an)*d;z=cz+Math.sin(an)*d*e;}
   if(free(x,z,R)){taken.push([x,z,R]);return[x,z];}}const p=[cx+(U(i,salt+2)-.5)*r,cz+(U(i,salt+3)-.5)*r*e];taken.push([p[0],p[1],R]);return p;};
 const G=[],Sp=[],gy=o.geysers||{n:0},kinds=gy.kinds||['cone','fountain','cone'],round=v=>Math.round(v);
 for(let i=0;i<gy.n;i++){const k=kinds[i%kinds.length],H=lerp(gy.H[0],gy.H[1],U(i,11)),p=spot(i,12,Math.max(18,H*.6));
  const per=round(lerp(gy.period[0],gy.period[1],U(i,13))),dur=round(lerp(gy.dur[0],gy.dur[1],U(i,14)));
  G.push({key:'g'+i,name:(gy.names&&gy.names[i])||('A '+k+' geyser'),kind:k,x:p[0],z:p[1],H:Math.round(H*10)/10,period:per,pre:round(Math.max(4,per*.04)),dur,steam:round(dur*1.4),off:round(U(i,15)*per),
   cone:k==='cone'?{r:lerp(2.5,7,U(i,16))*Math.min(1.4,.5+H/40),h:lerp(1.5,5,U(i,17))*Math.min(1.4,.5+H/40)}:null,pool:k==='fountain'?lerp(3,9,U(i,18)):null,mound:{r:lerp(12,30,U(i,19)),h:lerp(.6,2.2,U(i,20))}});}
 for(let i=0;i<(o.spouters||0);i++){const p=spot(100+i,21,12);G.push({key:'sp'+i,name:'A spouter',kind:'spouter',x:p[0],z:p[1],H:lerp(1.5,4.5,U(i,22)),pool:lerp(1.6,2.8,U(i,23)),mound:{r:lerp(7,12,U(i,24)),h:.5}});}
 const sp=o.springs||{n:0};
 for(let i=0;i<sp.n;i++){const big=i===0&&sp.big,rr=big?sp.big:lerp(sp.r[0],sp.r[1],U(i,31)),p=spot(200+i,32,rr*1.6+8),temp=Math.round(lerp(sp.temp[0],sp.temp[1],U(i,33))*100)/100;
  const kind=big?'prismatic':U(i,34)<.5?'funnel':'pool',m=sp.minerals?sp.minerals[i%sp.minerals.length]:null,t=sp.tints?sp.tints[i%sp.tints.length]:null;
  Sp.push(Object.assign({key:'s'+i,name:(sp.names&&sp.names[i])||(big?'A prismatic spring':kind==='funnel'?'A boiling funnel':'A hot pool'),kind,x:p[0],z:p[1],r:Math.round(rr*10)/10,temp,out:big?3:U(i,35)<.6?1:0,shield:big?1.4:0},
   m?{mineral:m}:{},t?{tint:t}:{}));}
 const A=[],ac=o.acid||{n:0};for(let i=0;i<ac.n;i++){const p=spot(300+i,41,ac.r);A.push({key:'acid'+i,name:i?'An acid field':'The acid field (mud pots and fumaroles)',x:p[0],z:p[1],r:ac.r,mud:ac.mud,fumaroles:ac.fumaroles});}
 const Fm=[],fm=o.fumaroles||{n:0};for(let i=0;i<fm.n;i++){const p=spot(400+i,51,30,.9);Fm.push({x:p[0],z:p[1],r:lerp(25,70,U(i,52)),n:round(lerp(3,8,U(i,53)))});}
 const flats=[{key:'flat',name:'The sinter flat',x:cx,z:cz,rx:r*.95,rz:r*.95*e,a:U(0,61)*TAU}];
 if(o.line)flats.length=0,o.line.forEach((q,i)=>{if(i<o.line.length-1){const b=o.line[i+1];flats.push({key:'flat'+i,name:'The sinter along the fault',x:(q[0]+b[0])/2,z:(q[1]+b[1])/2,rx:Math.hypot(b[0]-q[0],b[1]-q[1])*.62,rz:r*.32,a:Math.atan2(b[1]-q[1],b[0]-q[0])});}});
 const dead=[],nd=o.dead&&o.dead.n!=null?o.dead.n:1;if(o.dead)for(let i=0;i<nd;i++){const a=U(i,71)*TAU/nd+i*TAU/nd,f=o.dead.f==null?.85:o.dead.f;
  dead.push({key:'dead'+(i||''),name:o.dead.name||'A dead fringe',x:cx+Math.cos(a)*r*f,z:cz+Math.sin(a)*r*f*e,r:o.dead.r*(.75+.5*U(i,72))});}
 return{seed:sd,amb:o.amb,geysers:G,springs:Sp,acid:A,fumaroles:Fm,flats,dead,terraces:[],runLen:o.runLen==null?r*1.4:o.runLen};}
// the ground's fine mesh over the field (84's PATCHES: the showcase's are its basin floor and Stair), unless the station names its own
if(typeof STATION_GROUND!=='undefined'&&!STATION_GROUND.patches){const P=Math.ceil(BASIN.rx*1.3/32)*32,Q=Math.ceil(BASIN.rz*1.3/32)*32;
 STATION_GROUND.patches=[{name:BASIN.name,x0:Math.round(BASIN.x)-P,z0:Math.round(BASIN.z)-Q,x1:Math.round(BASIN.x)+P,z1:Math.round(BASIN.z)+Q,cs:2,tol:.04,fine:true}];}
