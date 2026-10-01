// ================================================================= EASTERN NOMAD KIT — the camp: black tents, market stalls, fairy chimneys
//   buildBlackTent({w,d,poles,seed})       a beit al-sha'ar: goat-hair roof sagging between pole peaks,
//                                          a back wall to the ground, the front propped open, guy ropes, a rug
//   buildMarketStall({w,d,dye,seed})       four poles, a striped awning, a counter and its goods
//   buildFairyChimney({height,radius,twin,seed})  an eroded tufa cone under a dark cap stone,
//                                          hollowed: a door, windows, a stair cut round its foot
(function(){
const K0=NOMAD.kit,DYE=NOMAD.DYE,TAU=NOMAD.TAU,clamp=NOMAD.clamp;
function buildBlackTent({w=9,d=5,poles=3,seed=1}={}){
 const K=K0(seed),r=K.rnd,W=Math.max(5,w),D=Math.max(3.5,d),hx=W/2,hz=D/2,N=Math.max(2,poles),ridge=2.3+r()*.4,eave=1.05,front=1.7;
 // the roof is a sheet over x, z: peaks at the pole lines, sagging between them; the front edge is propped higher
 const px=[];for(let i=0;i<N;i++)px.push(-hx+W*(i+.5)/N);
 const hRoof=(x,z)=>{let pk=0;for(const p of px)pk=Math.max(pk,Math.exp(-((x-p)*(x-p))/(W/N*.35)**2));const across=1-Math.abs(z)/hz,frontLift=clamp(z/hz,0,1);
  return eave+(ridge-eave)*Math.pow(clamp(across,0,1),.8)*(.62+.38*pk)+(front-eave)*frontLift*frontLift;};
 const nx=Math.max(10,N*6),nz=8;K.color(null,.95+r()*.1);
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const x0=-hx+W*i/nx,x1=-hx+W*(i+1)/nx,z0=-hz+D*j/nz,z1=-hz+D*(j+1)/nz;
  K.quad('cloth',[x0,hRoof(x0,z0),z0],[x1,hRoof(x1,z0),z0],[x1,hRoof(x1,z1),z1],[x0,hRoof(x0,z1),z1]);}
 // the back wall and the side walls hang to the ground (the sides only part way, the front stays open)
 for(let i=0;i<nx;i++){const x0=-hx+W*i/nx,x1=-hx+W*(i+1)/nx;K.quad('cloth',[x0,.05,-hz],[x1,.05,-hz],[x1,hRoof(x1,-hz),-hz],[x0,hRoof(x0,-hz),-hz]);}
 for(const sx of [-1,1]){const x=sx*hx;for(let j=0;j<nz/2;j++){const z0=-hz+D*j/nz,z1=-hz+D*(j+1)/nz;K.quad('cloth',[x,.05,z0],[x,.05,z1],[x,hRoof(x,z1),z1],[x,hRoof(x,z0),z0]);}}
 // poles: the ridge line and the propped front, then ropes to stakes
 K.color(0x6a5038,1);for(const p of px){K.beam('wood',[p,0,0],[p,hRoof(p,0)-.03,0],.06);K.beam('wood',[p,0,hz],[p,front-.03,hz],.05);}
 K.color(0xa08868,1);for(const p of px)for(const sz of [-1,1]){const z=sz*hz,y=hRoof(p,z),sz2=sz*(hz+1.6);K.beam('wood',[p,y,z],[p+(r()-.5)*.6,.02,sz2],.018,4);K.block('wood',p,0,sz2,.1,.25,.1);}
 // inside and in front: a rug, a few bolsters, a hearth of three stones and a coffee pot
 K.color([DYE.madder,DYE.indigo,DYE.saffron][Math.floor(r()*3)],1);K.block('canvas',0,0,hz-.2,W*.5,.03,2.4);
 K.color([DYE.cream,DYE.madder,DYE.olive][Math.floor(r()*3)],1);for(let k=0;k<3;k++)K.cyl('canvas',-W*.2+k*W*.2,0,-hz+.6,.22,.22,.45,8);
 K.color(0x7a6a5a,1);const hx2=W*.2,hz2=hz+1.5;for(let k=0;k<3;k++){const a=k/3*TAU;K.block('stone',hx2+Math.cos(a)*.35,0,hz2+Math.sin(a)*.35,.25,.22,.25);}
 K.color(0xb08a3a,1);K.lathe('wood',hx2,.22,hz2,[[.12,0],[.16,.12],[.06,.3],[.08,.34]],8);
 return K.finish({kind:'building',name:'Black goat-hair tent',culture:'eastern-nomad',types:['single-family dwelling'],
  footprint:NOMAD.rect(W+.6,D+3.4,false),height:ridge+.1,family:'tent',seed:seed>>>0});}
function buildMarketStall({w=4,d=3,dye=null,seed=1}={}){
 const K=K0(seed),r=K.rnd,W=Math.max(2.5,w),D=Math.max(2,d),hx=W/2,hz=D/2,hb=2.1,hf=2.5;
 const dc=dye||[DYE.madder,DYE.indigo,DYE.saffron,DYE.cream,DYE.olive][Math.floor(r()*5)];
 K.color(0x6a4a32,1);for(const sx of [-1,1]){K.beam('wood',[sx*hx,0,-hz],[sx*hx,hb,-hz],.06);K.beam('wood',[sx*hx,0,hz],[sx*hx,hf,hz],.06);}
 K.beam('wood',[-hx,hb,-hz],[hx,hb,-hz],.05);K.beam('wood',[-hx,hf,hz],[hx,hf,hz],.05);
 K.color(dc,1);K.quad('canvas',[-hx-.2,hb+.05,-hz-.2],[hx+.2,hb+.05,-hz-.2],[hx+.2,hf+.05,hz+.5],[-hx-.2,hf+.05,hz+.5]);
 for(let x=-hx-.2;x<hx+.2;x+=.5)K.quad('canvas',[x,hf+.05,hz+.5],[x+.5,hf+.05,hz+.5],[x+.4,hf-.25,hz+.52],[x+.1,hf-.25,hz+.52]);   // the scalloped valance
 // the counter and what is on it: jars, sacks, a bolt of cloth
 K.color(0xb48a62,1);K.block('adobe',0,0,hz-.45,W*.9,.85,.7);
 for(let k=0;k<4;k++){const x=-hx*.7+k*hx*.47;K.color([0xb0663a,0x8a6a3a,0xcaa060][k%3],1);
  if(k%2)K.lathe('wood',x,.85,hz-.45,[[.14,0],[.2,.15],[.16,.32],[.08,.38],[.1,.42]],8);else K.cyl('canvas',x,.85,hz-.45,.18,.22,.34,8);}
 K.color([DYE.saffron,0x8a5a2a,DYE.olive][Math.floor(r()*3)],1);for(let k=0;k<3;k++)K.cyl('canvas',-hx*.6+k*.6,0,-hz+.4,.28,.32,.62,8);
 K.color(dc,.9);K.block('canvas',hx*.5,0,-hz+.3,.9,.18,.5);
 return K.finish({kind:'building',name:'Market stall',culture:'eastern-nomad',types:['market/shop'],
  footprint:NOMAD.rect(W+.4,D+.8,false),height:hf+.1,family:'stall',seed:seed>>>0});}
// Cappadocian tufa: buff to pale rose, never white
const TUFA_WASH=[0xd2b08a,0xc9a27e,0xd8b994,0xc79c84,0xcdac8c];
function buildFairyChimney({height=10,radius=3,twin=false,seed=1}={}){
 const K=K0(seed),r=K.rnd,H=Math.max(5,height),R=Math.max(1.6,radius);
 const cone=(x,z,h,rad)=>{const prof=[];const n=9;for(let i=0;i<=n;i++){const t=i/n,y=t*h*.86;const rr=rad*(1.28-.25*t-.55*t*t+.12*Math.sin(t*9+x))*(t>.92?.85:1);prof.push([Math.max(.25,rr),y]);}
  K.color(TUFA_WASH[Math.floor(r()*TUFA_WASH.length)],.92+r()*.1);K.lathe('tufa',x,0,z,prof,18,.12);
  // the cap: a dark basalt mushroom on a narrowed neck
  K.color(0x6a5a52,1);K.lathe('stone',x,h*.86,z,[[rad*.35,0],[rad*.62,.15*h*.14],[rad*.78,.55*h*.14],[rad*.62,h*.14*.95],[0,h*.14]],12,.15);};
 cone(0,0,H,R);if(twin)cone(R*1.25,-R*.55,H*.72,R*.62);
 // the hollowed rooms: a door at the foot facing +z, windows round the upper body
 const rAt=t=>R*(1.28-.25*t-.55*t*t);
 K.color(null,1);K.block('dark',0,0,rAt(.05)-.12,1,2.1,.25);
 K.color(0xb89470,1);K.block('tufa',0,2.1,rAt(.2)-.05,1.5,.35,.5);
 for(let k=0;k<4;k++){const t=.32+k*.13,a=k*1.7+r()*.6,rr=rAt(t)-.1;K.color(null,1);K.box('dark',Math.sin(a)*rr,t*H*.86,Math.cos(a)*rr,.55,.75,.2,a);}
 // a stair cut round the foot to the first window
 K.color(0xb89470,.92);for(let k=0;k<8;k++){const a=-.5-k*.28,rr=rAt(.05+k*.03)+.25,y=k*.32;K.box('tufa',Math.sin(a)*rr,y+.16,Math.cos(a)*rr,.9,.32,.5,a);}
 const fr=R*1.32+(twin?R*1.1:0);
 return K.finish({kind:'building',name:twin?'Twin fairy chimney (gatehouse)':'Fairy chimney (rock-cut warren)',culture:'eastern-nomad',types:twin?['infrastructure','civic']:['single-family dwelling'],
  footprint:NOMAD.circle(fr,16),height:H,family:'fairy',seed:seed>>>0});}
window.buildBlackTent=buildBlackTent;window.buildMarketStall=buildMarketStall;window.buildFairyChimney=buildFairyChimney;
})();
