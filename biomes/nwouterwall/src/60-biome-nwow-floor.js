// ================================================================= NWOW — the floor: the ground plants, the fields of the Three Gifts, the caches
// The ground plants by zone (46), each pass on the kit's per-cell grid (55: NWOW.place, KRAND by cell), dense near the LOD spine
// and sparse in the floor's far band: plumegrass and steppe grass on the sunny slopes with the furflowers; caribou moss under the
// larch; Ivan-chai on the burn; willow, cottongrass and stones on the valley floor; cottongrass and cloudberry in the alases; snow
// birch, crowberry and caribou moss on the tundra; cushions, woolly snowballs and felt stars on the fellfield.
// THE FIELDS (PLAN.md section 4; the host's places: NWOW.build's opt.beds, opt.pockets, opt.tors): SWEETROOT in perennial beds on
// the sunny terrace's gravel, row by row, each row a year of its 3-7 (the plants grow with it); in autumn the oldest rows dug (bare
// soil, the dug heaps, a part of each root buried again); SNOW POTATO in stone-walled pockets on the rocky slope; GOLDROOT in the
// tors' cracks; and the root voles' caches in the meadows, some raided ("mouse nuts": the vole's gift left beside it).
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick}=BIO.fn;const qEuler=BIO.qEuler||BIO.fn.qEuler;
const PAL=NWOW.PAL,C=NWOW.C,SEED=0x4E58;const {bright,vary}=BIO.col;
const col=(slot,set,k)=>NWOW.libCol(slot,bright(vary(pick(set),.03,.08,.06),k==null?1:k));
const S=NWOW.season;
// a ground plant: an upright tuft scaled to its height, turned at random, its colour the slot's
const tuft=(item,x,y,z,h,w,c)=>BIO.put(item,[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[w,h,w],c);
const pad=(item,x,y,z,r,c)=>BIO.put(item,[x,y+.03,z],qEuler(0,rr(0,TAU),0),[r,1,r],c);
NWOW.FLOOR_ITEMS={stipa:'stipa',grass:'grass',pasque:'pasque',fireweed:'fireweed',cotton:'cotton',deermoss:'deermoss',birch:'birch',willow:'willow',heath:'heath',
 cloud:'cloud',snowball:'snowball',edelweiss:'edelweiss',cushion:'cushion'};
// each pass: {item, cell, accept by zone, draw}
const D={
 stipa:(x,y,z)=>{const h=rr(.5,.9);tuft('stipa',x,y,z,h,h*rr(.9,1.3),col('stipa',PAL.stipa,1));},
 grass:(x,y,z)=>{const h=rr(.25,.5);tuft('grass',x,y,z,h,h*rr(1,1.5),col('grass',PAL.grass,1));},
 pasque:(x,y,z)=>{const h=rr(.18,.32);tuft('pasque',x,y,z,h,h*1.1,col('pasque',[0xffffff],1));},
 fireweed:(x,y,z)=>{const h=rr(.9,1.6);tuft('fireweed',x,y,z,h,h*.55,col('fireweed',[0xffffff],1));},
 cotton:(x,y,z)=>{const h=rr(.3,.55);tuft('cotton',x,y,z,h,h*1.1,col('cotton',[0xffffff],1));},
 deermoss:(x,y,z)=>{if(NWOW.LIB.deer){const h=rr(.1,.22);tuft('deermoss',x,y,z,h,h*rr(1.5,2.2),col('deer',PAL.deer,.9));}else pad('deermoss',x,y,z,rr(.25,.6),col('deer',PAL.deer,.9));},
 birch:(x,y,z)=>{const s=rr(.5,.95);BIO.put('birch',[x,y+s*.35,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s*1.5,s*.8,s*1.5],col('birch',PAL.birch,1.05),{n:[0,1,0]});},
 willow:(x,y,z)=>{const s=rr(.8,1.4);BIO.put('willow',[x,y+s*.45,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s*1.3,s,s*1.3],col('willow',PAL.willow,1.1),{n:[0,1,0]});
  if(S==='spring'||S==='summer'){const n=ri(2,5);for(let k=0;k<n;k++){const a=rr(0,TAU),r=s*rr(.2,.5);BIO.put('catkin',[x+Math.cos(a)*r,y+s*rr(.55,.9),z+Math.sin(a)*r],qEuler(0,rr(0,TAU),0),rr(.07,.12),C(pick(PAL.catkin)));}}},
 heath:(x,y,z)=>{const h=rr(.15,.3);tuft('heath',x,y,z,h,h*2.2,col('heath',[0xffffff],1));},
 cloud:(x,y,z)=>{if(NWOW.LIB.cloud){const h=rr(.1,.18);tuft('cloud',x,y,z,h,h*rr(1.6,2.2),col('cloud',PAL.cloud,1));}else pad('cloud',x,y+.04,z,rr(.18,.3),col('cloud',PAL.cloud,1));if((S==='summer'||S==='autumn')&&rng()<.6)BIO.put('berry',[x+rr(-.05,.05),y+.12,z+rr(-.05,.05)],null,rr(.012,.018),C(pick(PAL.cloudBerry)));},
 snowball:(x,y,z)=>{const h=rr(.18,.32);tuft('snowball',x,y,z,h,h*.9,col('snowball',[0xffffff],1));},
 edelweiss:(x,y,z)=>BIO.put('edelweiss',[x,y+.08,z],qEuler(-Math.PI/2+rr(-.3,.3),rr(0,TAU),0),rr(.06,.1),col('edel',PAL.edel,1)),
 cushion:(x,y,z)=>{const r=rr(.25,.7);BIO.put('cushion',[x,y-.03,z],qEuler(0,rr(0,TAU),0),[r*2,r*1.1,r*2],bright(C(pick(PAL.cushion)),rr(.9,1.1)));
  if(S==='spring'||S==='summer'){const n=ri(3,8);for(let k=0;k<n;k++){const a=rr(0,TAU),q=r*Math.sqrt(rng())*.85;BIO.put('cushionbloom',[x+Math.cos(a)*q,y+r*.36*(1-q*q/(r*r))+.01,z+Math.sin(a)*q],qEuler(0,rr(0,TAU),0),[.04,1,.04],C(pick(PAL.cushionBloom)));}}},
 stone:(x,y,z)=>{const s=rr(.25,.9);BIO.put('stone',[x,y-s*.25,z],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[s*rr(.9,1.4),s*rr(.6,.9),s],bright(C(pick(PAL.rock)),rr(.85,1.1)));},
};
// the season's flowers: furflowers bloom after the melt (spring), are seed heads by summer's end; Ivan-chai blooms in summer, is fluff
// by autumn (the slots are chosen at the def: 50; the counts follow the season here)
const SEAS={pasque:{spring:1,summer:.6,autumn:.45,winter:0}[S],fireweed:{spring:.35,summer:1,autumn:.9,winter:.45}[S],cotton:{spring:.4,summer:1,autumn:.8,winter:.25}[S]};
// passes: [kind, cell, accept(zone, F)]; F is read only for the candidates a zone accepts (the host's fields)
const PASSES=[
 ['stipa',1.6,Z=>Z==='steppe'?.5:Z==='floor'?.04:Z==='gully'?.1:0],
 ['grass',1.4,Z=>Z==='steppe'?.42:Z==='larch'?.1:Z==='floor'?.18:Z==='gully'?.3:Z==='burn'?.15:Z==='field'?.02:0],
 ['pasque',3.2,Z=>Z==='steppe'?.14*SEAS.pasque:0],
 ['fireweed',1.3,Z=>Z==='burn'?.62*SEAS.fireweed:Z==='larch'?.008:Z==='floor'?.01:0],
 ['deermoss',2.6,Z=>Z==='larch'?.1:Z==='tundra'?.18:Z==='alas'?.02:0],
 ['birch',3,Z=>Z==='tundra'?.32:Z==='alas'?.12:Z==='larch'?.04:0],
 ['willow',4,Z=>Z==='floor'?.18:Z==='alas'?.06:Z==='tundra'?.04:0],
 ['cotton',1.5,Z=>Z==='alas'?.45*SEAS.cotton:Z==='floor'?.05*SEAS.cotton:Z==='tundra'?.03:0],
 ['cloud',2.4,Z=>Z==='alas'?.22:Z==='tundra'?.02:0],
 ['heath',2.2,Z=>Z==='tundra'?.32:Z==='fellfield'?.08:Z==='larch'?.03:0],
 ['snowball',3.6,Z=>Z==='fellfield'?.16:Z==='rock'?.05:0],
 ['edelweiss',4,Z=>Z==='fellfield'?.1:Z==='tundra'?.03:Z==='steppe'?.002:0],
 ['cushion',2.6,Z=>Z==='fellfield'?.26:Z==='rock'?.08:Z==='tundra'?.02:0],
 ['stone',3.5,Z=>Z==='floor'?.14:Z==='fellfield'?.18:Z==='rock'?.2:Z==='pocket'?.05:Z==='steppe'?.006:0],
];

// ---------------------------------------------------------------- the fields: sweetroot beds, snow-potato pockets, goldroot
// beds: {c:[x,z], len, wid, ang} a rectangle of rows; pockets: {c, rad, n}; tors: the KSTACKS bodies (the host's)
function sweetroot(B,st){if(!B)return;const ca=Math.cos(B.ang),sa=Math.sin(B.ang),rows=Math.floor(B.wid/1.7),W=(u,v)=>[B.c[0]+u*ca-v*sa,B.c[1]+u*sa+v*ca];
 NWOW.BEDS=[];
 for(let r=0;r<rows;r++){reseed(KRAND.hash(SEED,0xBED,r));const v=-B.wid/2+(r+.5)*1.7,year=ri(1,7),dug=S==='autumn'&&year>=6||S==='spring'&&year===7;
  NWOW.BEDS.push({row:r,year,dug,crop:'sweetroot'});
  for(let u=-B.len/2+.6;u<B.len/2-.6;u+=rr(.45,.7)){const q=W(u,v+rr(-.18,.18)),y=BIO.terrainH(q[0],q[1]);
   if(dug){if(rng()<.18){const s=rr(.35,.6);BIO.put('cache',[q[0],y-.04,q[1]],qEuler(0,rr(0,TAU),0),[s*1.6,s*.6,s*1.2],C(pick(PAL.soil)));st.heaps++;}
    if(rng()<.06){BIO.beam('rootbit',[q[0],y+.05,q[1]],[q[0]+rr(-.5,.5),y+.08,q[1]+rr(-.5,.5)],.025,.012,C(pick(PAL.rootPale)));st.roots++;}continue;}
   const h=mix(.25,.6,(year-1)/6)*rr(.8,1.15);tuft('sweetroot',q[0],y,q[1],h/(1-.42),h*.9,col('crop.sweet',[0xffffff],1));st.sweet++;}}}
function pockets(P,st){if(!P)return;NWOW.POCKETS=[];
 for(let k=0;k<P.n;k++){reseed(KRAND.hash(SEED,0x9C7,k));const a=rr(0,TAU),r=P.rad*Math.sqrt(rr(.02,1)),x=P.c[0]+Math.cos(a)*r,z=P.c[1]+Math.sin(a)*r,R=rr(1,1.8);
  if(NWOW.POCKETS.some(p=>Math.hypot(p.x-x,p.z-z)<p.R+R+1.2))continue;if(BIO.mask(x,z)<=0)continue;
  NWOW.POCKETS.push({x,z,R,crop:'snowpotato'});
  const n=Math.round(R*9);for(let i=0;i<n;i++){const t=i/n*TAU+rr(-.1,.1),sx=x+Math.cos(t)*R,sz=z+Math.sin(t)*R,y=BIO.terrainH(sx,sz),s=rr(.3,.5);
   BIO.put('stone',[sx,y-s*.1,sz],qEuler(rr(-.3,.3),t,rr(-.3,.3)),[s*1.3,s*.9,s],bright(C(pick(PAL.rock)),rr(.8,1.05)));st.stones++;}
  const m=ri(4,10);for(let i=0;i<m;i++){const t=rr(0,TAU),q=R*.7*Math.sqrt(rng()),px=x+Math.cos(t)*q,pz=z+Math.sin(t)*q,h=rr(.12,.22);
   tuft('snowpotato',px,BIO.terrainH(px,pz),pz,h/(1-.42),h*1.3,col('crop.potato',[0xffffff],1));st.potato++;}
  BIO.register({name:'A snow-potato pocket (a stone wall that holds the day\'s warmth)',key:'field.pocket',x,z,y:BIO.terrainH(x,z)-.3,r:R+.4,h:1.2});}}
function goldroot(tors,st){if(!tors||!tors.length||typeof KSTACKS==='undefined')return;
 tors.forEach((B,ti)=>B.beds.forEach((b,bi)=>{reseed(KRAND.hash(SEED,0x60D,ti,bi));const n=ri(1,4);
  for(let k=0;k<n;k++){if(rng()>.55)continue;const w=KSTACKS.wall(B,b,rr(0,TAU),1);const h=rr(.14,.24);
   tuft('goldroot',w.x-w.nx*.25,b.y+b.h-.02,w.z-w.nz*.25,h/(1-.45),h*1.2,col('crop.gold',[0xffffff],1));st.gold++;}}));}
// the voles' caches: small dug mounds in the steppe and the meadows; a raided one shows its roots, and the gift left by it
function caches(st){NWOW.place(26,0xCAC,(x,z,Z)=>Z==='steppe'?.06:Z==='alas'?.05:Z==='tundra'?.03:0,(x,y,z)=>{const s=rr(.25,.4);
  BIO.put('cache',[x,y-.03,z],qEuler(0,rr(0,TAU),0),[s*1.4,s*.7,s*1.4],C(pick(PAL.soil)));st.caches++;
  const raided=rng()<.4;if(raided){const n=ri(3,7);for(let k=0;k<n;k++){const a=rr(0,TAU),r=rr(.2,.55);BIO.beam('rootbit',[x+Math.cos(a)*r,y+.03,z+Math.sin(a)*r],[x+Math.cos(a)*(r+.18),y+.05,z+Math.sin(a)*(r+.18)],.02,.012,C(pick(PAL.rootPale)));st.roots++;}}
  BIO.register({name:raided?'A vole\'s cache, raided (sweetroot and bistort: "mouse nuts"; a gift left beside it)':'A vole\'s cache (sweetroot and bistort stored in the burrow)',key:'cache',x,z,y:y-.2,r:.6,h:.6});},{R:NWOW.R*.9,lodMax:BIO.radii().floor[1]});}

NWOW.buildFloor=function(R,q,opt){q=q==null?1:q;opt=opt||{};const st={plants:0,sweet:0,potato:0,gold:0,stones:0,heaps:0,roots:0,caches:0,byKind:{}};
 const LOD=BIO.radii(),near=LOD.floor[0],far=LOD.floor[1];
 // the floor's band round each point of the LOD spine: the passes visit only these windows (55: NWOW.place's boxes)
 const BOXES=BIO.host.origin.map(o=>[o[0]-far,o[1]-far,o[0]+far,o[1]+far]);
 PASSES.forEach((P,pi)=>{const kind=P[0];let n=0;
  // dense to the near band, then a third, to the far band's edge
  NWOW.place(P[1],200+pi,(x,z,Z)=>{const a=P[2](Z);if(!(a>0))return 0;const d=BIO.lodD(x,z);return a*q*(d<near?1:d<far?.33:0);},
   (x,y,z)=>{D[kind](x,y,z);n++;},{R,lodMax:far,boxes:BOXES});
  st.byKind[kind]=n;st.plants+=n;});
 BIO.cur='nwouterwall/fields';sweetroot(opt.beds,st);pockets(opt.pockets,st);goldroot(opt.tors,st);caches(st);
 return st;};
})();
