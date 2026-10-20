// ================================================================= NECANYONS — the carnivores (flora with a trap record)
// biomes/necanyons/PLAN.md section 4: drawn and placed here like any plant (instanced, carded, under the core's LOD), each
// patch registered in core/tags as class 'flora' with its `trap` (core/biome/37-core-traps.js) and `zone`. Every item set a
// carnivore draws carries the same trap through its plant's tags (50: NECANYONS.PLANTS). Korona reads this fragment in
// place and adds its own, larger ones (danger above 0).
//   THE SEEP LINES (46: NECANYONS.SEEPS): under each cap rock, where water comes out of the parting: carnivorous moss and
//     maidenhair hung from the lip below it, rimdew and sun pitchers on the ledge between the lip and the cap's foot
//   THE LEDGES and THE BENCH BOGS: rimdew and sun pitchers                      THE WALLS' FEET: clapjaws in the damp sand,
//     rimdew, young turncoats; monkeycup vines and turncoat lianas climbing the wall
//   THE CREEK'S BANKS (the canopy's light gaps): young turncoats, clapjaws     THE CAPS: yellow tubes; potholewort in the pools
// The clapjaw's lobes shut and open in the shader (50: KTRAPS.GLSL on the wind clock, a phase from the trap's id).
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm,qEuler}=BIO.fn;
const PAL=NECANYONS.PAL,C=NECANYONS.C,P=NECANYONS.PLANTS,TRAPS=NECANYONS.TRAPS,K=KSTACKS,SEED=0x0E7D;
const {bright,vary}=BIO.col;
const col=(slot,set,k)=>NECANYONS.libCol(slot,bright(vary(pick(set),.03,.08,.06),k==null?1.2:k));
const NAMES=[];NECANYONS.TRAPPED=[];
// a hero patch: a core/tags flora record carrying its trap (and its name for the inspector)
function reg(key,x,y,z,r,h,zone,id){const o={name:P[key].name,key,kind:'flora',x,y,z,r,h,tags:{trap:TRAPS[key],zone}};BIO.register(o);
 NAMES.push({name:P[key].name,plant:key,x,y,z,r,h});NECANYONS.TRAPPED.push({id,key,x,y,z,r,zone,trap:TRAPS[key]});}

// ---------------------------------------------------------------- the plants
function rimdew(x,y,z,lv,st,k){k=k==null?1:k;const n=lv===2?ri(3,9):2;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.1,.6)*k:0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=BIO.terrainH(px,pz),u=rng();
  if(u<.55){const r=rr(.18,.34)*k;BIO.put('sundewR',[px,py+.02,pz],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[r,1,r],col('sundew',PAL.dew));}
  else{const h=rr(.25,.6)*k;BIO.put(u<.85?'sundewF':'sundewB',[px,py-.02,pz],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[h*.9,h,h*.9],col('sundew',PAL.dew));}
  st.rimdew++;}}
function sunpitcher(x,y,z,lv,st){const n=lv===2?ri(1,3):1;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.3,.9):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(.8,1.8);
  BIO.put(rng()<.6?'sunpit':'sunpitB',[px,BIO.terrainH(px,pz)-.05,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*.85,h,h*.85],col('sunpit',PAL.sunpit));st.sunpitcher++;}}
// a clapjaw: a rosette of leaf stalks, each ending in a trap of two lobes hinged along it (aTrap: phase, side, open angle)
function clapjaw(x,y,z,lv,st,id){const n=lv===2?ri(4,8):3,a0=rr(0,TAU),ph=KTRAPS.phase(id);
 for(let k=0;k<n;k++){const a=a0+k*TAU/n+rr(-.25,.25),d=rr(.28,.55),w=rr(.18,.35);
  BIO.put('petiole',[x,y+.01,z],qEuler(0,-a,rr(-.1,.05)),[d,.5,.18],col('petiole',PAL.petiole,1.1));
  const tx=x+Math.cos(a)*d,tz=z+Math.sin(a)*d,ty=BIO.terrainH(tx,tz)+.06,ph2=(ph+k*.137)%1,op=rr(.6,.85);
  for(const side of[1,-1])BIO.put('lobe',[tx,ty,tz],qEuler(0,-a,0),[w,w*.62,1],NECANYONS.libCol('lobe',bright(pick(PAL.lobe),1.1)),{aTrap:[ph2,side,op,0]});
  st.traps++;}
 st.clapjaw++;}
function turncoatYoung(x,y,z,lv,st){const n=lv===2?ri(2,5):1;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.2,.9):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,r=rr(.25,.5);
  BIO.put('sticky',[px,BIO.terrainH(px,pz)+.03,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[r,1,r],bright(pick(PAL.sticky),1.15));st.turncoat++;}}
function yellowtube(x,y,z,lv,st){const n=ri(1,4);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.6,1.6):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=BIO.terrainH(px,pz),H=rr(1,2.5),nl=lv===2?ri(6,9):4,a0=rr(0,TAU);
  for(let k=0;k<nl;k++){const la=a0+k*TAU/nl;BIO.put('tube',[px+Math.cos(la)*.08,py-.05,pz+Math.sin(la)*.08],qEuler(0,-la,Math.PI/2-rr(.04,.14)),[H,H*.6,H*rr(.22,.3)],col('strap',PAL.tube,1.15));}
  st.yellowtube++;}}
// a vine up a wall from its foot: the stem as a tube on the face (KSTACKS: the wall's radius at each height), leaves along
// it, and (a monkeycup) pitchers hung from it: squat ones low, funnels high
function vine(B,a,y0,Hc,cups,lv,st){const pts=[];let y=y0;
 for(let g=0;g<30&&y<y0+Hc;g++){let bed=null;for(const b of B.beds){if(y>=b.y&&y<=b.y+b.h){bed=b;break;}}if(!bed)break;
  const u=(y-bed.y)/bed.h,R=K.footR(bed,a)*K.prof(bed,u)+.25,wob=Math.sin(y*.21+a*7)*.12;
  pts.push({x:bed.cx+Math.cos(a+wob/R)*R,y,z:bed.cz+Math.sin(a+wob/R)*R,r:mix(.07,.03,(y-y0)/Hc)});y+=rr(1.5,2.6);}
 if(pts.length<3)return null;st.vineTris+=BIO.tube('bark.wood',pts,bright(pick(PAL.vine),.8),{seg:3});
 pts.forEach((p,i)=>{if(i%2===0||lv<2){const ox=Math.cos(a)*.35,oz=Math.sin(a)*.35;
   BIO.put('vine',[p.x+ox,p.y,p.z+oz],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.7,1.1),NECANYONS.libCol('vine',bright(pick(PAL.vine),1.2)),{n:[Math.cos(a),.6,Math.sin(a)]});}
  if(cups&&i>0&&lv===2){const t=(p.y-y0)/Hc,it=t<.35?'cupLow':rng()<.75?'cupUp':'cupWine',w=it==='cupLow'?rr(.3,.45):rr(.22,.32);
   BIO.put(it,[p.x+Math.cos(a)*.45,p.y-.1,p.z+Math.sin(a)*.45],qEuler(0,rr(0,TAU),0),[w,w*1.4,w],NECANYONS.libCol('cup',pick(PAL.cup)));st.pitchers++;}});
 st.vines++;return pts[0];}

// ---------------------------------------------------------------- the passes
NECANYONS.buildCarnivores=function(R,q){q=q==null?1:q;R=R==null?1500:R;const L=BIO.radii(),st={rimdew:0,sunpitcher:0,clapjaw:0,traps:0,turncoat:0,yellowtube:0,pitchers:0,vines:0,vineTris:0,curtains:0,wort:0,seeps:0};
 NAMES.length=0;NECANYONS.TRAPPED.length=0;
 const lvOf=(x,z)=>{const d=BIO.lodD(x,z);return d<L.hero?2:d<L.mid?1:0;};
 // THE SEEP LINES: curtains from the lip, plants on the ledge between the lip and the cap's foot
 NECANYONS.SEEPS.forEach((s,i)=>{const lv=lvOf(s.x,s.z);if(lv===0)return;reseed(KRAND.hash(SEED,1,i));
  const B=NECANYONS.bodies()[s.body],q0=B.beds[s.bed],up=B.beds[s.bed+1],a=s.a,lipR=K.footR(q0,a)*(1-q0.ch),backR=K.footR(up,a)*(1-up.nt),w=lipR-backR;
  // the curtains hang just clear of the bed's face below the lip
  const outR=K.footR(q0,a)+.35,lip={x:q0.cx+Math.cos(a)*outR,z:q0.cz+Math.sin(a)*outR},ty=K.topH(q0,q0.cx+Math.cos(a)*lipR*.99,q0.cz+Math.sin(a)*lipR*.99);
  if(rng()<s.seep*q){const n=lv===2?ri(1,3):1;for(let k=0;k<n;k++){const L2=rr(2,7)*(.5+s.seep),wd=rr(1.4,2.8),o=rr(-2.5,2.5),ox=-Math.sin(a)*o,oz=Math.cos(a)*o;
    BIO.put('carnmoss',[lip.x+ox,ty+.25,lip.z+oz],qEuler(rr(-.08,.08),-a+Math.PI/2+rr(-.3,.3),rr(-.06,.06)),[wd,L2,wd],col('carnmoss',PAL.moss,1.1));st.curtains++;}}
  if(lv===2&&rng()<.7*s.seep)for(let k=0;k<ri(2,5);k++){const l=rr(.6,1.3);BIO.put('seepfern',[lip.x+rr(-1.5,1.5)*-Math.sin(a),ty+.05,lip.z+rr(-1.5,1.5)*Math.cos(a)],qEuler(rr(-.05,.05),-a+rr(-.5,.5),-rr(.5,1.1)),[l,l,l],col('fern',PAL.fern,1.2));}
  if(w>.9&&rng()<.85*s.seep*q){const t=rr(.25,.85),R2=backR+w*t,x=q0.cx+Math.cos(a)*R2,z=q0.cz+Math.sin(a)*R2,y=BIO.terrainH(x,z);
   const k=rng()<.6?'rimdew':'sunpitcher';if(k==='rimdew')rimdew(x,y,z,lv,st,1);else sunpitcher(x,y,z,lv,st);
   if(lv===2&&i%3===0)reg(k,x,y,z,2,2,'ledge','seep:'+s.id);}
  st.seeps++;});
 // THE LEDGES (away from a seep line) and THE BENCH BOGS (a bench's pans where it holds water)
 const bog=(x,z)=>smooth(.48,.6,fbm(x*.02+5,z*.02-2,93,2));
 NECANYONS.place(3.2,201,(x,z,Z)=>(Z.zone==='ledge'?.5*Z.seep:Z.zone==='bench'?Z.pan*bog(x,z)*.4:0)*q,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);
  const k=rng()<.55?'rimdew':'sunpitcher';if(k==='rimdew')rimdew(x,y,z,lv,st,1);else sunpitcher(x,y,z,lv,st);
  if(lv===2&&(i+j)%4===0)reg(k,x,y,z,1.5,1.8,Z.zone,'ledge:'+i+','+j);},{R,lodMax:L.mid});
 // THE WALLS' FEET: the damp sand under the seeps
 NECANYONS.place(3.6,202,(x,z,Z)=>Z.zone==='foot'?smooth(2.5,5,Z.footD)*smooth(24,12,Z.footD)*smooth(.15,.45,Z.seep)*.55*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z),u=rng(),id='foot:'+i+','+j;
  if(u<.45){clapjaw(x,y,z,lv,st,id);if(lv===2)reg('clapjaw',x,y,z,.8,.4,'foot',id);}else if(u<.75)rimdew(x,y,z,lv,st,1);else turncoatYoung(x,y,z,lv,st);},{R,lodMax:L.mid});
 // THE CREEK'S BANKS: the canopy's light gaps
 NECANYONS.place(4.5,203,(x,z,Z)=>Z.zone==='floor'?smooth(.35,.6,BIO.field('flow',x,z))*smooth(.95,.8,BIO.field('flow',x,z))*.35*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z),u=rng(),id='creek:'+i+','+j;
  if(u<.6)turncoatYoung(x,y,z,lv,st);else if(u<.85){clapjaw(x,y,z,lv,st,id);if(lv===2)reg('clapjaw',x,y,z,.8,.4,'floor',id);}else rimdew(x,y,z,lv,st,.8);},{R,lodMax:L.mid});
 // THE CAPS: yellow tubes, off the pans
 NECANYONS.place(7,204,(x,z,Z)=>(Z.zone==='cap'||Z.zone==='stack')?(1-Z.pan)*smooth(-4.5,-7,Z.d)*.2*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);yellowtube(x,y,z,lv,st);
  if(lv>=1&&(i+j)%3===0)reg('yellowtube',x,y,z,2,2.5,Z.zone,'cap:'+i+','+j);},{R,lodMax:L.mid});
 // VINES up the walls from their feet: monkeycups where the seep is, turncoat lianas elsewhere
 NECANYONS.place(16,205,(x,z,Z)=>Z.zone==='foot'&&Z.B&&!({spire:1,fin:1,balanced:1})[Z.B.kind]?smooth(1,3,Z.footD)*smooth(7,4,Z.footD)*(.25+.5*Z.seep)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(lv===0)return;
  const Bd=Z.B,b0=Bd.beds[0],a=Math.atan2(z-b0.cz,x-b0.cx),cups=rng()<.4+.5*Z.seep,Hc=rr(10,34),p0=vine(Bd,a,y-.3,Hc,cups,lv,st);
  if(p0&&cups&&lv===2)reg('monkeycup',p0.x+Math.cos(a)*.4,p0.y,p0.z+Math.sin(a)*.4,1.6,Hc,'foot','vine:'+i+','+j);},{R,lodMax:L.mid});
 // THE RAIN POOLS: potholewort's flowers on stalks above the water
 NECANYONS.POTHOLES.forEach((p,i)=>{const lv=lvOf(p.x,p.z);if(lv===0)return;reseed(KRAND.hash(SEED,7,i));
  for(let k=0,n=Math.round(p.r*3*q);k<n;k++){const a=rr(0,TAU),d=p.r*Math.sqrt(rng())*.85,x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d,h=rr(.12,.3);
   BIO.put('rod',[x,p.y+h/2,z],null,[.006,h,.006],C(0x5a7a3a));BIO.put('wort',[x,p.y+h,z],qEuler(rr(-.3,.3),rr(0,TAU),0),rr(.03,.05),NECANYONS.libCol('bloom',pick(PAL.wort)));st.wort++;}
  if(lv===2)reg('potholewort',p.x,p.y,p.z,p.r,.4,'cap','pool:'+p.id);});
 BIO.nameSet('necanyons.carnivores',NAMES.slice());
 return{carnivores:st};};
})();
