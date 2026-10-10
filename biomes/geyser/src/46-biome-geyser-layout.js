// ================================================================= GEYSER — the thermal ground (data: records, relief, heat, cycles)
// The kit's first fragment, and pure data: no THREE, no page. A host hands GEYSER.lay() its thermal layout (BIOME-API.md:
// the showcase's is THERMAL in 45; GEYSER.cluster() makes one for a site the scale model only marks with a point) and its
// ground BEFORE the thermal relief; the kit lays out RECORDS (GEYSER.R: the geysers and their cycles, the springs and their
// levels, the mud pots, the fumaroles, the run-off channels it traces downhill from every spring and geyser, the sinter
// flats, the dead forest, the terrace flights) and from them:
//   GEYSER.relief(x,z,b)  what the thermal ground adds to the host's ground b: the sinter shields and mounds, the springs'
//                         bowls and funnels, the pools, the mud pots, the channels' shallow beds, and the terraces (stepped
//                         rimstone pools: the flight's ground quantised into steps whose rims scallop downhill)
//   GEYSER.at(x,z)        the heat (degC, and 0..1), sinter, film (the run-off's sheet of water), acid, dead, spray (where
//                         the geysers' water falls), terr (a terrace flight) and the flow's direction: the life reads it, the
//                         ground paints by it
//   GEYSER.cycle(g,t)     a geyser's phase at time t: rest, pre (the preplay's surges), column, steam; its water (0..1 of
//                         its column) and steam; the seconds to its next column. The eruption shader runs the same maths
// A host's terrain is then ground + relief (exactly: the springs' levels are measured on it).
var GEYSER={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm}=BIO.fn;
const GRAV=7.35;   // Krator's gravity, 0.75 g (biomes/WORLD.md)
GEYSER.GRAV=GRAV;
// the mats' temperatures (degC; Yellowstone's): no photosynthesis over ~73; Synechococcus' yellow-green to ~60, then the
// orange of Chloroflexus and its partners, brown-green under ~45. Krator's thermophiles keep Earth's bands (NOTES.md)
GEYSER.BANDS={clear:73,yellow:63,orange:52,brown:42};
let S=null,R=null,AMB=33;
const H=new Map(),HC=24;
const hk=(gx,gz)=>(gx+4096)*8192+(gz+4096);
function hput(o,x0,z0,x1,z1){for(let gz=Math.floor(z0/HC);gz<=Math.floor(z1/HC);gz++)for(let gx=Math.floor(x0/HC);gx<=Math.floor(x1/HC);gx++){const k=hk(gx,gz);let L=H.get(k);if(!L)H.set(k,L=[]);L.push(o);}}
function hputC(o,x,z,r){hput(o,x-r,z-r,x+r,z+r);}

// ---------------------------------------------------------------- lay out
GEYSER.lay=function(spec){S=spec;AMB=spec.amb==null?33:spec.amb;H.clear();reseed(spec.seed||631);
 const ground=spec.ground,wind=spec.wind||[0,0];
 R=GEYSER.R={geysers:[],springs:[],mud:[],fumaroles:[],flats:[],dead:[],acid:[],terraces:[],runoff:[],amb:AMB};
 // THE GEYSERS: a vent per geyser (the Twins have two), its mound's top and its cone's
 (spec.geysers||[]).forEach((g0,i)=>{const g=Object.assign({i,period:60,pre:6,dur:8,steam:8,off:0},g0);
  g.vents=[[g.x,g.z]];if(g.twin)g.vents.push([g.x+g.twin[0],g.z+g.twin[1]]);
  g.mound=g.mound||{r:10,h:.6};g.base=ground(g.x,g.z);g.y0=g.base+g.mound.h;
  g.top=g.kind==='cone'?g.y0+(g.cone?g.cone.h:1):g.y0;   /* where the water leaves */
  g.sprayR=6+g.H*.45;g.sprayX=g.x+wind[0]*g.H*.22;g.sprayZ=g.z+wind[1]*g.H*.22;
  R.geysers.push(g);hputC({t:'g',g},g.x,g.z,Math.max(g.mound.r*1.3,g.sprayR+g.H*.25));});
 (spec.springs||[]).forEach((s0,i)=>{const s=Object.assign({i,kind:'pool',temp:.8,out:1},s0);R.springs.push(s);
  s.apron=s.kind==='prismatic'?s.r*.8+10:s.r*.9+3;s.Tc=40+60*s.temp;s.ref=ground(s.x,s.z);hputC({t:'s',s},s.x,s.z,s.r+s.apron*1.8+(s.shield?s.r*1.6:0));});
 (spec.flats||[]).forEach(f0=>{const f=Object.assign({a:0},f0);f.ca=Math.cos(f.a);f.sa=Math.sin(f.a);R.flats.push(f);const r=Math.max(f.rx,f.rz)*1.25;hputC({t:'f',f},f.x,f.z,r);});
 (spec.dead||[]).forEach(d=>{R.dead.push(d);hputC({t:'d',d},d.x,d.z,d.r*1.3);});
 // THE ACID FIELDS: their mud pots and fumaroles placed in them (a pot clear of the others)
 (spec.acid||[]).forEach(a=>{R.acid.push(a);hputC({t:'a',a},a.x,a.z,a.r*1.3);
  for(let k=0,n=0;k<a.mud*30&&n<a.mud;k++){const an=rr(0,TAU),d=a.r*.7*Math.sqrt(rng()),x=a.x+Math.cos(an)*d,z=a.z+Math.sin(an)*d,r=rr(2,6);
   if(R.mud.some(m=>Math.hypot(m.x-x,m.z-z)<m.r+r+4))continue;const m={x,z,r,seed:rng(),acid:a.key};R.mud.push(m);hputC({t:'m',m},x,z,r*1.6);n++;}
  for(let k=0;k<a.fumaroles;k++){const an=rr(0,TAU),d=a.r*.92*Math.sqrt(rng());R.fumaroles.push({x:a.x+Math.cos(an)*d,z:a.z+Math.sin(an)*d,s:rr(.35,1)});}});
 (spec.fumaroles||[]).forEach(F=>{for(let k=0;k<F.n;k++){const an=rr(0,TAU),d=F.r*Math.sqrt(rng());R.fumaroles.push({x:F.x+Math.cos(an)*d,z:F.z+Math.sin(an)*d,s:rr(.3,.8)});}});
 R.fumaroles.forEach(f=>hputC({t:'u',u:f},f.x,f.z,7));
 // THE TERRACE FLIGHTS (the host gives each its mask and box)
 (spec.terraces||[]).forEach(t0=>{const t=Object.assign({S2:2.6,cu:26,cv:15,drop:.3,lip:.16,depth:.35,temp:[70,36],across:[1,0]},t0);R.terraces.push(t);poolSeeds(t,ground);
  hput({t:'t',tf:t},t.box[0],t.box[1],t.box[2],t.box[3]);});
 // THE RUN-OFF: traced down the ground from each spring's rim and each geyser's mound (it stops at a sink: the host's
 // creek, the sea, a terrace flight), hotter and longer from the bigger sources, spreading as it goes
 const sink=spec.sink||((x,z)=>false),len=spec.runLen||500;
 const grad=(x,z)=>{const e=3,gx=ground(x+e,z)-ground(x-e,z),gz=ground(x,z+e)-ground(x,z-e);const l=Math.hypot(gx,gz)||1;return[-gx/l,-gz/l,l/(2*e)];};
 function trace(x,z,dir,T0,w0,lam,src,seed,maxL,ownSink){const SK=ownSink||sink;const P=[[x,z,0]];let dx=dir[0],dz=dir[1],s=0,hi=ground(x,z),stall=0;
  for(let i=0;i<Math.min(len,maxL)/2.5;i++){const g=grad(x,z),k=g[2]>.004?.3:.05;dx=dx*(1-k)+g[0]*k;dz=dz*(1-k)+g[1]*k;
   const w=(fbm(s*.012+seed,seed*.7,4601,2)-.5)*.22,c=Math.cos(w),sn=Math.sin(w),ndx=dx*c-dz*sn,ndz=dx*sn+dz*c,l=Math.hypot(ndx,ndz)||1;dx=ndx/l;dz=ndz/l;
   x+=dx*2.5;z+=dz*2.5;s+=2.5;const y=ground(x,z);P.push([x,z,s]);
   if(SK(x,z))break;if(y>hi+.25){if(++stall>12)break;}else{stall=0;hi=Math.min(hi,y);}}
  const ch={src,P,T0,w0,lam,len:s,i:R.runoff.length};R.runoff.push(ch);
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],w=chW(ch,a[2])*2.4+4;hput({t:'c',ch,i},Math.min(a[0],b[0])-w,Math.min(a[1],b[1])-w,Math.max(a[0],b[0])+w,Math.max(a[1],b[1])+w);}
  return ch;}
 const downhill=(x,z)=>{const g=grad(x,z);return Math.atan2(g[1],g[0]);};
 R.springs.forEach((s,i)=>{if(!s.out)return;const a0=downhill(s.x,s.z),spread=s.spread!=null?s.spread:s.kind==='prismatic'?1.5:.6;
  for(let k=0;k<s.out;k++){const a=a0+(s.out>1?(k/(s.out-1)-.5)*spread:0)+rr(-.12,.12),r0=s.r*1.02;
   trace(s.x+Math.cos(a)*r0,s.z+Math.sin(a)*r0,[Math.cos(a),Math.sin(a)],s.Tc-6,(.8+s.r*.07)*(s.outW||1),80+s.r*2.4,s.key,i*7+k,60+s.r*6);}});
 // A FLIGHT'S OUTFALLS: where its lowest pools spill over their last wall onto the beach, the water runs on across the
 // sand into the sea, cooling (t.outfalls of them, spread across the flight's foot)
 R.terraces.forEach((t,ti)=>{const n=t.outfalls==null?10:t.outfalls,a=t.across,d=t.d,B=t.box;if(!n)return;
  const cx=(B[0]+B[2])/2,cz=(B[1]+B[3])/2,cu=cx*a[0]+cz*a[1],cv=cx*d[0]+cz*d[1],half=Math.abs((B[2]-B[0])*a[0]+(B[3]-B[1])*a[1])/2;
  for(let k=0;k<n;k++){const u=cu+((k+.5)/n-.5)*half*1.2+rr(-8,8);let found=null;
   for(let v=cv-Math.abs((B[3]-B[1]))*.5;v<cv+Math.abs(B[3]-B[1])*.6;v+=1.5){const x=u*a[0]+v*d[0],z=u*a[1]+v*d[1];if(t.mask(x,z)<.9)continue;
    const q=GEYSER.poolAt(t,x,z);if(q.A&&q.A.sea&&q.B&&!q.B.sea&&!q.B.dry&&q.db>1){found=[x,z,q.B.L];break;}}
   if(found)trace(found[0],found[1],[d[0],d[1]],48,1.2,8,t.key+'-out',300+ti*17+k,90,(x,z)=>ground(x,z)<.02);}});
 R.geysers.forEach((g,i)=>{if(g.kind==='spouter'&&g.H<4)return;const a0=downhill(g.x,g.z),n=g.H>30?3:g.kind==='spouter'?1:2;
  for(let k=0;k<n;k++){const a=a0+(n>1?(k/(n-1)-.5)*1.1:0)+rr(-.15,.15),r0=g.kind==='cone'?g.cone.r*1.1:(g.pool||3);
   trace(g.x+Math.cos(a)*r0,g.z+Math.sin(a)*r0,[Math.cos(a),Math.sin(a)],92,.9+g.H*.03,70+g.H*1.6,g.key,100+i*7+k,70+g.H*3);}});
 // THE LEVELS, measured on the ground with its relief: a spring brims at its rim's lowest point; a pool geyser at its pool's
 const fin=(x,z)=>{const b=ground(x,z);return b+GEYSER.relief(x,z,b);};
 R.springs.forEach(s=>{let lo=1e9;for(let k=0;k<32;k++){const a=k/32*TAU;lo=Math.min(lo,fin(s.x+Math.cos(a)*s.r*1.04,s.z+Math.sin(a)*s.r*1.04));}s.level=lo-.04;});
 R.geysers.forEach(g=>{if(g.kind==='cone')return;const pr=g.pool||2;let lo=1e9;for(let k=0;k<24;k++){const a=k/24*TAU;lo=Math.min(lo,fin(g.x+Math.cos(a)*pr*1.05,g.z+Math.sin(a)*pr*1.05));}g.level=lo-.04;g.top=g.level;});
 R.mud.forEach(m=>{let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,fin(m.x+Math.cos(a)*m.r,m.z+Math.sin(a)*m.r));}m.level=lo-.2;});
 R.terraces.forEach(t=>{if(t.hTop==null){let hi=-1e9,lo=1e9;for(let z=t.box[1];z<=t.box[3];z+=8)for(let x=t.box[0];x<=t.box[2];x+=8){if(t.mask(x,z)<.9)continue;const b=ground(x,z);hi=Math.max(hi,b);lo=Math.min(lo,b);}t.hTop=hi;t.hBot=lo;}});
 return R;};
const chW=(ch,s)=>Math.min(9,ch.w0*(1+s/140));
const chT=(ch,s)=>AMB+(ch.T0-AMB)*Math.exp(-s/ch.lam);
GEYSER.chW=chW;GEYSER.chT=chT;

// ---------------------------------------------------------------- relief
// THE TERRACES (the owner, 2026-10-07, with Pamukkale, Mammoth and Badab-e Surt: fewer, larger, more irregular pools,
// irregular in height too). A flight is a field of POOLS, not bands across the slope. Seeds on a jittered grid in the
// flight's frame (u across the slope, v down it; the cells wider across than down), a third of them dropped so some
// pools are big, each weighted (a power diagram: the heavier a seed, the more ground it takes), every boundary wobbled
// by noise into lobes. Each pool holds its own LEVEL: the ground at its seed drawn toward the flight's TIERS (the
// ground in steps of S2, ~2.6 m, their edges wandering), with a little of its own; so the pools crowd onto tiers a few
// metres apart with tall walls between the tiers and low rims between the pools of one tier. In a pool: its floor
// (depth under its level); toward a lower neighbour its own rim (a crest a lip over its level, then its inner face);
// toward a higher one that pool's curtain, from that rim down to this floor, wider the taller the drop.
function poolSeeds(t,ground){const a=t.across,d=[-a[1],a[0]],cu=t.cu,cv=t.cv,B=t.box,S2=t.S2,G=new Map();
 const cs=[[B[0],B[1]],[B[2],B[1]],[B[0],B[3]],[B[2],B[3]]].map(p=>[p[0]*a[0]+p[1]*a[1],p[0]*d[0]+p[1]*d[1]]);
 const u0=Math.min(...cs.map(c=>c[0])),u1=Math.max(...cs.map(c=>c[0])),v0=Math.min(...cs.map(c=>c[1])),v1=Math.max(...cs.map(c=>c[1]));
 for(let iv=Math.floor(v0/cv)-2;iv<=Math.ceil(v1/cv)+2;iv++)for(let iu=Math.floor(u0/cu)-2;iu<=Math.ceil(u1/cu)+2;iu++){
  const u=(iu+.5+rr(-.42,.42))*cu,v=(iv+.5+rr(-.42,.42))*cv,drop=rng()<t.drop,w=Math.pow(rng(),2)*.16,x=u*a[0]+v*d[0],z=u*a[1]+v*d[1];
  if(drop)continue;const b=ground(x,z),bt=b+1.6*(fbm(x*.011+5,z*.011-3,4631,2)-.5),sea=b<(t.seaB==null?.8:t.seaB);
  G.set(iu*65536+iv,{iu,iv,u,v,x,z,w,sea,dry:!sea&&rng()<(t.dry==null?.25:t.dry),L:sea?b:Math.max(t.minL==null?1.1:t.minL,.86*S2*Math.round(bt/S2)+.14*b+rr(-.16,.16))});}
 t.seeds=G;t.d=d;}
// the two nearest pools to a point and its distance (m) to the boundary between them
const _pq={A:null,B:null,db:0};
GEYSER.poolAt=function(t,x,z){const a=t.across,d=t.d,wx=x+9*(fbm(x*.02,z*.02,4632,3)-.5)+6*(fbm(x*.065,z*.065,4635,2)-.5)+1.6*(fbm(x*.24,z*.24,4637,2)-.5),wz=z+9*(fbm(x*.02+9,z*.02,4633,3)-.5)+6*(fbm(x*.065+4,z*.065,4636,2)-.5)+1.6*(fbm(x*.24+2,z*.24,4638,2)-.5);
 const u=(wx*a[0]+wz*a[1])/t.cu,v=(wx*d[0]+wz*d[1])/t.cv,iu=Math.floor(u),iv=Math.floor(v);let A=null,B=null,ma=1e9,mb=1e9;
 for(let jv=iv-2;jv<=iv+2;jv++)for(let ju=iu-2;ju<=iu+2;ju++){const s=t.seeds.get(ju*65536+jv);if(!s)continue;const du=u-s.u/t.cu,dv=v-s.v/t.cv,m=du*du+dv*dv-s.w;
  if(m<ma){mb=ma;B=A;ma=m;A=s;}else if(m<mb){mb=m;B=s;}}
 _pq.A=A;_pq.B=B;if(!A||!B){_pq.db=99;return _pq;}
 // the higher pool's rim bulges into the lower one: most in the middle of their shared edge, not at its ends (a convex
 // arc downhill, the cusps between pointing up)
 const au=A.u/t.cu,av=A.v/t.cv,bu=B.u/t.cu,bv=B.v/t.cv,sep=Math.hypot(au-bu,av-bv)||1,pu=-(av-bv)/sep,pv=(au-bu)/sep;
 const sl=clamp(((u-(au+bu)/2)*pu+(v-(av+bv)/2)*pv)/(sep*.62),-1,1),dl=A.L-B.L,sg=Math.abs(dl)<.09?0:dl>0?1:-1;
 let g=(mb-ma)+sg*.55*sep*(1-sl*sl);if(g<0){const T=A;A=B;B=T;g=-g;_pq.A=A;_pq.B=B;}
 _pq.db=g/(2*sep)*t.cv;return _pq;};
function poolH(t,q,x,z,b){const A=q.A,B=q.B,D=t.depth,lip=t.lip,db=q.db,fl=A.sea?b:A.L-(A.dry?.08:D*(.25+.95*fbm(x*.08+A.u*.01,z*.08,4639,2)))+.05*(fbm(x*.3,z*.3,4634,2)-.5);
 if(!B||(B.sea&&A.sea)||(!A.sea&&!B.sea&&Math.abs(B.L-A.L)<.09))return fl;   /* two pools of one level are one pool */
 if(B.L<A.L){const dr=A.L-B.L,cr=.18+.22*Math.min(1,dr),fw=.35+.35*Math.min(1,dr),lp=lip*Math.min(1,.4+dr);return db<cr?A.L+lp:db<cr+fw?mix(A.L+lp,fl,smooth(cr,cr+fw,db)):fl;}
 const dr=B.L-A.L,cw=clamp(.4+.38*dr,.5,3.2),lp=lip*Math.min(1,.4+dr);return db<cw?mix(B.L+lp,fl,Math.pow(smooth(0,cw,db),.85)):fl;}
GEYSER.relief=function(x,z,b){if(!R)return 0;const L=H.get(hk(Math.floor(x/HC),Math.floor(z/HC)));if(!L)return 0;
 let r=0,tr=null,tm=0,inc=0;
 for(let k=0;k<L.length;k++){const o=L[k];
  if(o.t==='g'){const g=o.g,M=g.mound;for(const v of g.vents){const d=Math.hypot(x-v[0],z-v[1]);if(d<M.r*1.15)r+=M.h*Math.pow(smooth(M.r*1.15,0,d),1.4)*(v===g.vents[0]?1:.5);}
   if(g.kind!=='cone'){const pr=g.pool||2,d=Math.hypot(x-g.x,z-g.z);r+=(g.base-b)*smooth(pr*1.5+3,pr*1.05,d);if(d<pr*1.4){const dp=.8+pr*.25;r-=d<pr?dp*(1-Math.pow(d/pr,2)):0;r+=.14*Math.exp(-Math.pow((d-pr)/.8,2));}}}
  else if(o.t==='s'){const s=o.s,d=Math.hypot(x-s.x,z-s.z),R0=s.r;r+=(s.ref-b)*smooth(R0*1.5+3,R0*1.05,d);
   if(s.shield)r+=s.shield*Math.pow(smooth(R0*2.6,R0*.6,d),1.2);
   if(s.kind==='prismatic'){const dp=1.2+R0*.035;if(d<R0)r-=dp*(1-Math.pow(d/R0,2.4));r+=.18*Math.exp(-Math.pow((d-R0)/1.4,2));
    /* the apron's rimlets: low steps out from the rim */ if(d>R0&&d<R0+s.apron){const f=((d-R0)/2.4)%1;r+=.09*smooth(R0,R0+3,d)*smooth(R0+s.apron,R0+s.apron*.6,d)*(f<.15?f/.15:1-(f-.15)/.85);}}
   else if(s.kind==='funnel'){const dp=2.5+R0*.6;if(d<R0)r-=dp*(.35*smooth(R0,R0*.55,d)+.65*Math.pow(smooth(R0*.55,0,d),1.5));r+=.15*Math.exp(-Math.pow((d-R0)/.7,2))+.35*smooth(R0*3,R0,d);}
   else{const dp=1+R0*.3;if(d<R0)r-=dp*(1-Math.pow(d/R0,2));r+=.12*Math.exp(-Math.pow((d-R0)/.8,2))+.4*smooth(R0*3,R0,d);}}
  else if(o.t==='m'){const m=o.m,d=Math.hypot(x-m.x,z-m.z);if(d<m.r)r-=.8*(1-Math.pow(d/m.r,2));r+=.2*Math.exp(-Math.pow((d-m.r)/1,2));}
  else if(o.t==='a'){const a=o.a,d=Math.hypot(x-a.x,z-a.z);r-=1.6*smooth(a.r*1.1,a.r*.4,d);}
  else if(o.t==='c'){const ch=o.ch,i=o.i,P=ch.P,A=P[i],B=P[i+1],vx=B[0]-A[0],vz=B[1]-A[1],l2=vx*vx+vz*vz||1;let t=((x-A[0])*vx+(z-A[1])*vz)/l2;t=t<0?0:t>1?1:t;
   const d=Math.hypot(x-A[0]-vx*t,z-A[1]-vz*t),w=chW(ch,A[2]);if(d<w)inc=Math.max(inc,.16*smooth(1,.2,d/w)*smooth(0,6,A[2]));}
  else if(o.t==='t'&&!tr){const m=o.tf.mask(x,z);if(m>0){tr=o.tf;tm=m;}}}
 r-=inc;
 if(tr){const q=GEYSER.poolAt(tr,x,z);if(q.A)r=mix(r,poolH(tr,q,x,z,b)-b,smooth(0,.6,tm));}
 return r;};

// ---------------------------------------------------------------- the heat and the rest (GEYSER.at)
const A={T:0,heat:0,sinter:0,film:0,acid:0,dead:0,spray:0,terr:0,pl:-100,dx:0,dz:0,mud:0,vent:0,spring:0,level:-1e9};
GEYSER.at=function(x,z,b){const o=A;o.T=AMB;o.sinter=0;o.film=0;o.acid=0;o.dead=0;o.spray=0;o.terr=0;o.pl=-100;o.dx=0;o.dz=0;o.mud=0;o.vent=0;o.spring=0;o.level=-1e9;o.tfl=null;
 if(!R){o.heat=0;return o;}const L=H.get(hk(Math.floor(x/HC),Math.floor(z/HC)));if(!L){o.heat=0;return o;}
 let wsum=0;const heat=(T,w,dx,dz)=>{if(T>o.T)o.T=T;if(w>0&&(dx||dz)){o.dx+=dx*w;o.dz+=dz*w;wsum+=w;}};
 for(let k=0;k<L.length;k++){const q=L[k];
  if(q.t==='g'){const g=q.g;for(const v of g.vents){const d=Math.hypot(x-v[0],z-v[1]),M=g.mound;
    if(d<M.r*1.4){const u=d/M.r;heat(mix(95,48,smooth(0,1,u)),.5*smooth(1.2,.3,u),(x-v[0])/(d||1),(z-v[1])/(d||1));o.sinter=Math.max(o.sinter,smooth(1.4,.6,u));}}
   if(g.H>8){const d=Math.hypot(x-g.sprayX,z-g.sprayZ);o.spray=Math.max(o.spray,smooth(g.sprayR,g.sprayR*.3,d)*Math.min(1,g.H/40));}
   if(g.kind!=='cone'){const d=Math.hypot(x-g.x,z-g.z),pr=g.pool||2;if(d<pr){o.spring=1;o.level=g.level;}}}
  else if(q.t==='s'){const s=q.s,d=Math.hypot(x-s.x,z-s.z);
   if(d<s.r){o.spring=1;o.level=s.level;heat(s.Tc,0,0,0);continue;}
   const u=(d-s.r)/s.apron,dx=(x-s.x)/d,dz=(z-s.z)/d;
   if(u<1.6){heat(u<1?s.Tc-6-(s.Tc-6-46)*Math.pow(u,.8)*(s.milky?.4:1):46-12*(u-1)/.6,smooth(1.5,.2,u),dx,dz);o.sinter=Math.max(o.sinter,smooth(1.5,.6,u));o.film=Math.max(o.film,smooth(1.25,0,u)*.9);}
   if(s.shield)o.sinter=Math.max(o.sinter,smooth(2.6,1.2,d/s.r)*.9);}
  else if(q.t==='c'){const ch=q.ch,i=q.i,P=ch.P,Pa=P[i],Pb=P[i+1],vx=Pb[0]-Pa[0],vz=Pb[1]-Pa[1],l2=vx*vx+vz*vz||1;let t=((x-Pa[0])*vx+(z-Pa[1])*vz)/l2;t=t<0?0:t>1?1:t;
   const d=Math.hypot(x-Pa[0]-vx*t,z-Pa[1]-vz*t),s=Pa[2]+(Pb[2]-Pa[2])*t,w=chW(ch,s),u=d/w;if(u>2.4)continue;
   const T=chT(ch,s),l=Math.sqrt(l2),p=smooth(1.5,.3,u);heat(AMB+(T-AMB)*p,p,vx/l,vz/l);
   o.film=Math.max(o.film,smooth(1.05,.4,u)*smooth(0,8,s));o.sinter=Math.max(o.sinter,smooth(2.4,1,u)*smooth(54,70,T)*.8);}
  else if(q.t==='f'){const f=q.f,dx=x-f.x,dz=z-f.z,u=(dx*f.ca+dz*f.sa)/f.rx,v=(-dx*f.sa+dz*f.ca)/f.rz,e=Math.hypot(u,v)+.32*(fbm(x*.008,z*.008,4621,2)-.5)+.12*(fbm(x*.03,z*.03,4622,2)-.5)+.04*(fbm(x*.12,z*.12,4626,2)-.5);
   const sn=smooth(1.06,.74,e);if(sn>0){o.sinter=Math.max(o.sinter,sn*(.82+.18*fbm(x*.03,z*.03,4623,2)));heat(AMB+8*sn,0,0,0);}}
  else if(q.t==='d'){const d=q.d,u=Math.hypot(x-d.x,z-d.z)/d.r+.25*(fbm(x*.01,z*.01,4624,2)-.5);o.dead=Math.max(o.dead,smooth(1.0,.65,u));}
  else if(q.t==='a'){const a=q.a,u=Math.hypot(x-a.x,z-a.z)/a.r+.18*(fbm(x*.02,z*.02,4625,2)-.5);const ac=smooth(1.05,.7,u);if(ac>0){o.acid=Math.max(o.acid,ac);heat(AMB+(42-AMB)*ac,0,0,0);}}
  else if(q.t==='m'){const m=q.m,d=Math.hypot(x-m.x,z-m.z);o.mud=Math.max(o.mud,smooth(m.r*1.5,m.r*.9,d));if(d<m.r){o.spring=1;o.level=m.level;}heat(mix(92,50,smooth(m.r,m.r*1.6,d)),0,0,0);}
  else if(q.t==='u'){const f=q.u,d=Math.hypot(x-f.x,z-f.z),v=Math.exp(-Math.pow(d/(3+3*f.s),2));o.vent=Math.max(o.vent,v);heat(AMB+(88-AMB)*v,0,0,0);}
  else if(q.t==='t'){const t=q.tf,m0=t.mask(x,z);if(m0<=0)continue;const pq=GEYSER.poolAt(t,x,z);let m=m0;
   /* the beach under the last wall is sand, not travertine: only the wall's own foot */
   if(pq.A&&pq.A.sea)m*=pq.B&&!pq.B.sea?1-smooth(clamp(.4+.38*(pq.B.L-pq.A.L),.5,3.2)*.9,clamp(.4+.38*(pq.B.L-pq.A.L),.5,3.2)*1.4,pq.db):0;
   if(m<=0)continue;o.terr=Math.max(o.terr,m);const bb=b==null?S.ground(x,z):b;
   const u=clamp((t.hTop-bb)/Math.max(1,t.hTop-t.hBot),0,1);heat(mix(t.temp[0],t.temp[1],u),0,0,0);if(m0>.98&&pq.A&&!pq.A.sea&&!pq.A.dry){o.pl=pq.A.L+t.lip-.03;o.tfl=t;}o.film=Math.max(o.film,m*.22);}}
 if(wsum>0){const l=Math.hypot(o.dx,o.dz)||1;o.dx/=l;o.dz/=l;}
 o.heat=clamp((o.T-AMB)/(100-AMB),0,1);return o;};
// the fields a host may bind for its kits (biomes/WORLD.md), each (x,z)->0..1
GEYSER.fields={heat:(x,z)=>GEYSER.at(x,z).heat,sinter:(x,z)=>GEYSER.at(x,z).sinter,film:(x,z)=>GEYSER.at(x,z).film,acid:(x,z)=>GEYSER.at(x,z).acid,
 dead:(x,z)=>GEYSER.at(x,z).dead,spray:(x,z)=>GEYSER.at(x,z).spray,terr:(x,z)=>GEYSER.at(x,z).terr};
// the water a host draws or keeps clear: a spring's, a pool geyser's, a mud pot's level; a terrace's pool's
GEYSER.waterAt=function(x,z,b){const o=GEYSER.at(x,z,b);if(o.level>-1e8)return o.level;
 if(o.pl>-50){const bb=b==null?S.ground(x,z):b;if(bb+GEYSER.relief(x,z,bb)<o.pl)return o.pl;}return -1e9;};

// ---------------------------------------------------------------- the cycles
// u: the clock within the period; pre: the preplay (surges a few metres high, closer together toward the column);
// column: up in 2.5 s, falling off over its second half and ending in 3 s; steam: the roaring steam after; rest: a wisp
GEYSER.cycle=function(g,t){const o=g._c||(g._c={phase:'rest',water:0,steam:0,next:0,u:0});
 if(g.kind==='spouter'){o.phase='spout';o.water=.72+.28*Math.sin(t*3.1+g.x)*Math.sin(t*1.7+g.z);o.steam=.35;o.next=0;o.u=0;return o;}
 const P=g.period,u=((t-g.off)%P+P)%P,a=g.pre,b=a+g.dur,c=b+g.steam;o.u=u;
 if(u<a){o.phase='pre';o.water=.16*Math.pow(Math.max(0,Math.sin(u*1.9+Math.sin(u*.7)*2)),6)*smooth(0,a*.4,u)*(.5+.5*u/a);o.steam=.15+.2*u/a;}
 else if(u<b){o.phase='column';const v=u-a;o.water=smooth(0,2.5,v)*(1-.3*smooth(g.dur*.5,g.dur,v))*smooth(g.dur,g.dur-3,v);o.steam=1;}
 else if(u<c){o.phase='steam';o.water=.04*smooth(c,b,u);o.steam=.1+.9*smooth(c,b+2,u);}
 else{o.phase='rest';o.water=0;o.steam=.1;}
 o.next=u<a?a-u:P-u+a;return o;};
// set a geyser off now: its clock moved so its column starts at t (the preplay skipped)
GEYSER.erupt=function(key,t){const g=R&&R.geysers.find(q=>q.key===key);if(!g||g.kind==='spouter')return false;g.off=t-g.pre+.01;return true;};
GEYSER.byKey=k=>R&&(R.geysers.find(g=>g.key===k)||R.springs.find(s=>s.key===k));

// ---------------------------------------------------------------- a site from a point (the open world; the isles)
// The scale model marks a geyser field as a point with a radius (DATA.vents, kind 'geyser'): cluster() makes a thermal
// layout for it, seeded by the point: a sinter flat, one to three geysers, springs and pools round them, a mud field
// with fumaroles at one side, a dead fringe. The host adds its own ground, sink and terraces and hands it to lay().
GEYSER.cluster=function(o){reseed(o.seed||1);const x=o.x,z=o.z,r=o.r||300,G=[],Sp=[],kinds=['cone','fountain','cone'];
 const pt=(f)=>{const a=rr(0,TAU),d=r*f*Math.sqrt(rng());return[x+Math.cos(a)*d,z+Math.sin(a)*d];};
 for(let i=0,n=ri(1,3);i<n;i++){const p=pt(.5),k=kinds[i],H=k==='cone'?rr(18,50):rr(15,40);
  G.push({key:'g'+i,name:'A '+k+' geyser',kind:k,x:p[0],z:p[1],H,period:Math.round(rr(80,300)),pre:Math.round(rr(8,30)),dur:Math.round(rr(12,40)),steam:Math.round(rr(12,40)),off:rr(0,200),
   cone:k==='cone'?{r:rr(3,8),h:rr(2,6)}:null,pool:k==='fountain'?rr(4,10):null,mound:{r:rr(15,36),h:rr(.8,2.4)}});}
 G.push((p=>({key:'sp',name:'A spouter',kind:'spouter',x:p[0],z:p[1],H:rr(2.5,5),pool:rr(1.8,3),mound:{r:rr(8,13),h:.5}}))(pt(.6)));
 for(let i=0,n=ri(2,6);i<n;i++){const p=pt(.75),big=i===0&&rng()<.6;Sp.push({key:'s'+i,name:big?'A prismatic spring':'A hot pool',kind:big?'prismatic':pick(['pool','funnel']),x:p[0],z:p[1],r:big?rr(12,36):rr(2.5,7),temp:rr(.4,1),out:big?3:ri(0,1),shield:big?rr(.8,2):0});}
 const ma=rr(0,TAU),mx=x+Math.cos(ma)*r*.8,mz=z+Math.sin(ma)*r*.8;
 return{seed:o.seed||1,amb:o.amb==null?33:o.amb,geysers:G,springs:Sp,acid:[{key:'acid',name:'An acid field',x:mx,z:mz,r:r*.25,mud:ri(3,8),fumaroles:ri(6,16)}],
  fumaroles:[{x,z,r:r*.6,n:ri(3,8)}],flats:[{key:'flat',name:'The sinter flat',x,z,rx:r*rr(.8,1),rz:r*rr(.6,.85),a:rr(0,TAU)}],
  dead:[{key:'dead',name:'A dead fringe',x:x-Math.cos(ma)*r*.9,z:z-Math.sin(ma)*r*.9,r:r*.35}],terraces:[],runLen:r*1.6};};

// the records as plain data (Godot: a port reads these and runs the same cycles; tools/ may write them out)
GEYSER.records=function(){if(!R)return null;const rd=v=>Math.round(v*100)/100;
 return{amb:AMB,geysers:R.geysers.map(g=>({key:g.key,name:g.name,kind:g.kind,vents:g.vents.map(v=>v.map(rd)),top:rd(g.top),H:g.H,period:g.period||0,pre:g.pre||0,dur:g.dur||0,steam:g.steam||0,off:rd(g.off||0),cone:g.cone||null,mound:g.mound,pool:g.pool||null})),
  springs:R.springs.map(s=>({key:s.key,name:s.name,kind:s.kind,x:rd(s.x),z:rd(s.z),r:s.r,temp:s.temp,level:rd(s.level)})),
  mud:R.mud.map(m=>({x:rd(m.x),z:rd(m.z),r:rd(m.r),level:rd(m.level)})),fumaroles:R.fumaroles.map(f=>({x:rd(f.x),z:rd(f.z),s:rd(f.s)})),
  runoff:R.runoff.map(c=>({src:c.src,T0:c.T0,w0:rd(c.w0),lam:c.lam,pts:c.P.filter((p,i)=>i%4===0||i===c.P.length-1).map(p=>[rd(p[0]),rd(p[1]),rd(p[2])])})),
  terraces:R.terraces.map(t=>({key:t.key,S2:t.S2,lip:t.lip,depth:t.depth,pools:t.seeds.size,temp:t.temp,hTop:rd(t.hTop),hBot:rd(t.hBot)}))};};
// none of this touches a registry, and terrainH calls relief and at a million times: BIO.kitEnd (70) leaves them unwrapped
['lay','poolAt','relief','at','waterAt','cycle','erupt','byKey','cluster','records','chW','chT'].forEach(k=>{GEYSER[k]._kit='-';});
})();
