// ================================================================= THE LABYRINTH — the floor: grasses, forbs, scrub, the wild melon, cushions, lichens, the tarns
// The ground plants by the host's fields (55: LABY.zones) under the station's profile (55: LABY.PROFILES), each pass on the kit's per-cell grid
// (55: LABY.place, KRAND by cell), dense in the floor's near band round the LOD spine and thin in its far band:
//   STEPPE GRASSES  everywhere the floor is open; tall and green in the wet grabens, short and straw-coloured on the dry floors (the height
//                   band is the profile's, the wet field picks within it); FEATHER GRASS and WORMWOOD on the dry floors
//   SEDGE, COTTONGRASS  the wet margins (the shore field); cottongrass only in the cold
//   FORBS           the summer's colour on the open floor: composites and saxifrage (full-colour cards), violet and yellow spikes
//   DWARF SCRUB     dwarf birch on the cold and stony ground, scrub willow on the cold wet ground, juniper on the dry rock's feet
//   WILD MELON      a vine's patch: runners lying out from its root, leaves along them, melons to 1 m on them; a fallen one brown and split
//                   (fermenting); on the warm open floors, thickest in the sun traps (dry, open, away from the water)
//   CUSHIONS        domes on the cold stony ground and the pit rims; STONES with lichen on their tops; reindeer lichen in the cold
//   THE TARNS' NATIVES  iridescent pads lying on the cold tarns' shallows and glass reeds standing in them (the profile's tarn share)
//   DUNG            the herds' pats in the grass
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qUp}=BIO.fn;
const PAL=LABY.PAL,C=LABY.C;const {bright,vary}=BIO.col;
const col=(slot,set,k)=>LABY.libCol(slot,bright(vary(pick(set),.03,.08,.06),k==null?1:k));
const tuft=(item,x,y,z,h,w,c)=>BIO.put(item,[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[w,h,w],c);
const zones=LABY.zones;
// the draws: (x, y, z, Z zones, P profile, st)
const D={
 grass:(x,y,z,Z,P)=>{const k=clamp(Z.wet*1.3-.25+P.tall*.35-.4*Z.dry,0,1),h=mix(P.grassH[0],P.grassH[1],k)*rr(.8,1.2);
  tuft('grass',x,y,z,h,h*rr(1.4,2),col('grass',k>.55?PAL.grassTall:k>.3?PAL.grassWet:PAL.grassShort,1));},
 stipa:(x,y,z)=>{const h=rr(.5,.85);tuft('stipa',x,y,z,h,h*rr(1,1.4),col('stipa',PAL.stipa,1));},
 wormwood:(x,y,z)=>{const h=rr(.3,.6);tuft('wormwood',x,y,z,h,h*rr(1.2,1.6),col('wormwood',PAL.sage,1));},
 sedge:(x,y,z)=>{const h=rr(.45,.8);tuft('sedge',x,y,z,h,h*rr(1.1,1.5),col('sedge',PAL.sedge,1));},
 cotton:(x,y,z)=>{const h=rr(.3,.5);tuft('cotton',x,y,z,h,h*1.1,col('cotton',[0xffffff],1));},
 forb:(x,y,z)=>{if(rng()<.6){const h=rr(.25,.45);tuft('forb',x,y,z,h,h*rr(1,1.3),col('forb',[0xffffff],1));}else{const h=rr(.4,.75);tuft('spike',x,y,z,h,h*.6,col('spike',PAL.spike,1));}},
 dwarfbirch:(x,y,z)=>{const n=ri(1,3);for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.4,1.1):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,s=rr(.55,1);if(k&&BIO.mask(px,pz)<=0)continue;
  BIO.put('dwarfbirch',[px,BIO.terrainH(px,pz)+s*.3,pz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s*1.5,s*.75,s*1.5],col('dwarfbirch',PAL.dwarfbirch,1.05),{n:[0,1,0]});}},
 scrubwillow:(x,y,z)=>{const n=ri(1,3);for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.5,1.3):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,s=rr(.8,1.4);if(k&&BIO.mask(px,pz)<=0)continue;
  BIO.put('scrubwillow',[px,BIO.terrainH(px,pz)+s*.4,pz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s*1.3,s*.9,s*1.3],col('scrubwillow',PAL.scrubwillow,1.1),{n:[0,1,0]});}},
 juniper:(x,y,z)=>{const s=rr(.6,1.3),low=rng()<.6;BIO.put('juniper',[x,y+s*(low?.18:.45),z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),low?[s*1.9,s*.5,s*1.9]:[s*1,s*1.4,s*1],col('juniper',PAL.juniper,1),{n:[0,1,0]});},
 // a melon patch: the root, 3-6 runners lying out over the ground, leaves along them, melons on them; ripe ones gold, fallen ones brown, split
 melon:(x,y,z,Z,P,st)=>{const nr=ri(3,6),a0=rr(0,TAU);
  for(let r=0;r<nr;r++){const a=a0+r/nr*TAU+rr(-.4,.4),L=rr(3,7),n=Math.ceil(L/1.2);let px=x,pz=z,py=y;
   for(let k=1;k<=n;k++){const t=k/n,ax=x+Math.cos(a+Math.sin(t*3+r)*.3)*L*t,az=z+Math.sin(a+Math.sin(t*3+r)*.3)*L*t,ay=BIO.terrainH(ax,az);
    if(BIO.mask(ax,az)<=0)break;BIO.beam('vine',[px,py+.04,pz],[ax,ay+.04,az],.035,.025,col('vine',PAL.vine,1));
    const h=rr(.3,.5);tuft('melonleaf',ax,ay,az,h,h*rr(1.6,2.2),col('melonleaf',PAL.melonLeaf,1));
    if(rng()<.35){const s=rr(.3,1),fall=rng()<.25,ripe=rng()<.5,c=fall?PAL.melonRot:ripe?PAL.melonRipe:PAL.melon;
     BIO.put('melon',[ax+rr(-.2,.2),ay-.04*s,az+rr(-.2,.2)],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),fall?[s*1.15,s*.6,s]:[s*rr(1,1.15),s,s],bright(vary(C(pick(c)),.02,.06,.05),1));st.melons++;if(fall)st.fallen++;}
    px=ax;pz=az;py=ay;}}
  st.patches++;BIO.register({name:'A wild melon patch (the sweet fall: ripening late in the dry season, fermenting where it falls)',key:'wildmelon',x,z,y:y-.2,r:6,h:1.4,kind:'flora'});},
 cushion:(x,y,z,Z,P,st)=>{const r=rr(.25,.7);BIO.put('cushion',[x,y-.04,z],qEuler(0,rr(0,TAU),0),[r,r,r],bright(C(pick(PAL.cushion)),rr(.9,1.1)));},
 stone:(x,y,z,Z,P,st)=>{const s=rr(.4,1.6),h=s*rr(.6,.9);BIO.put('stone',[x,y-h*.15,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s*rr(.9,1.3),h,s],bright(vary(C(pick(PAL.rock)),.01,.03,.05),1));
  if(rng()<.75*(P.lichen==null?0:P.lichen)){const l=s*rr(.4,.8);BIO.put('lichen',[x+rr(-.1,.1)*s,y-h*.15+h*.9,z+rr(-.1,.1)*s],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[l,1,l],col('lichen',PAL.lichen,1));st.lichen++;}},
 cladonia:(x,y,z)=>{const h=rr(.08,.18);tuft('cladonia',x,y+.03,z,h,h*rr(1.8,2.6),col('cladonia',PAL.clad,.95));},
 dung:(x,y,z)=>{const s=rr(.18,.45);BIO.put('dung',[x,y-.02,z],qEuler(0,rr(0,TAU),0),[s,s,s*rr(.8,1)],C(pick(PAL.dung)));},
};
// the passes: [kind, cell, accept(Z, P), item range]; the accept is before the near/far share and the quality
const notWater=Z=>1-smooth(.55,.9,Z.shore);
const PASSES=[
 ['grass',3.2,(Z,P)=>.4*P.grass*(1-smooth(.4,.7,Z.rock))*mix(.55,1,Z.meadow),'floor'],
 ['stipa',3.2,(Z,P)=>.5*P.stipa*smooth(.3,.7,Z.dry)*(1-smooth(.35,.6,Z.rock)),'floor'],
 ['wormwood',3.6,(Z,P)=>.42*P.wormwood*smooth(.35,.75,Z.dry)*(1-Z.shore),'floor'],
 ['sedge',2.6,(Z,P)=>.6*P.sedge*smooth(.55,.92,Z.shore),'floor'],
 ['cotton',2.4,(Z,P)=>.5*P.cotton*smooth(.3,.8,Z.shore)*smooth(.1,.25,Z.cold+.12),'floor'],
 ['forb',3.4,(Z,P)=>.32*P.forb*Z.meadow*(.4+.6*Z.wet)*(1-Z.dry*.5),'floor'],
 ['dwarfbirch',4.5,(Z,P)=>.4*P.scrub*clamp(Z.cold*2+Z.rock*.8,0,1)*(1-Z.shore*.6)*(1-smooth(.45,.6,Z.rock)),'scrub'],
 ['scrubwillow',5,(Z,P)=>.45*P.scrub*smooth(.25,.7,Z.shore)*clamp(Z.cold*3+.2,0,1),'scrub'],
 ['juniper',6,(Z,P)=>.4*P.juniper*clamp(smooth(.12,.35,Z.rock)+Z.dry*.4,0,1)*(1-smooth(.45,.6,Z.rock))*notWater(Z),'scrub'],
 ['melon',40,(Z,P)=>.25*P.melon*Z.meadow*(1-.6*Z.wet)*(1-Z.shore)*(1-Z.cold*2),'scrub'],
 ['cushion',3.4,(Z,P)=>.45*P.cushion*clamp(smooth(.1,.3,Z.rock)+Z.cold*1.5,0,1)*(1-smooth(.45,.6,Z.rock))*notWater(Z),'floor'],
 ['stone',7,(Z,P)=>.5*clamp(smooth(.12,.4,Z.rock)+Z.cold*.6,0,1)*(1-smooth(.5,.62,Z.rock))*(.3+.7*P.lichen),'scrub'],
 ['cladonia',3,(Z,P)=>.4*P.clad*(1-Z.wet*.6)*clamp(Z.cold*3,0,1)*(1-Z.shore),'floor'],
 ['dung',9,(Z,P)=>.05*P.dung*Z.meadow*(1-Z.shore),'floor'],
];
// the tarns' natives: in the cold tarns' shallows (depth 0.3-2.5 m for the pads, 0.05-0.5 m for the reeds: the host's check fails a plant
// rooted 0.6 m under the water), never in a river
function tarns(R,P,q,st,boxes){if(!(P.tarn>0))return;
 const inTarn=(x,z,lo,hi)=>{const w=BIO.waterH(x,z);if(w<-1e8)return false;if(BIO.field('flow',x,z)>.3)return false;const d=w-BIO.terrainH(x,z);return d>=lo&&d<=hi;};
 LABY.place(2.2,0x7A1,(x,z)=>inTarn(x,z,.3,2.5)?.45*P.tarn*q:0,(x,y,z)=>{const w=BIO.waterH(x,z),n=ri(2,5);
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.3,1.4):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(!inTarn(px,pz,.2,3))continue;const s=rr(.5,1.1);
   BIO.put('tarnlily',[px,w+.02,pz],qEuler(0,rr(0,TAU),0),[s,1,s],LABY.libCol('tarnlily',vary(C(pick(PAL.tarnPad)),.02,.06,.05)),{c2:C(pick(PAL.tarnIrid))});st.pads++;}},{R,boxes,noMask:true,cliff:true});
 LABY.place(1.6,0x7A2,(x,z)=>inTarn(x,z,.05,.5)?.5*P.tarn*q:0,(x,y,z)=>{const w=BIO.waterH(x,z),h=(w-y)+rr(.6,1.3);
  BIO.put('tarnreed',[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*.5,h,h*.5],LABY.libCol('tarnreed',vary(C(pick(PAL.tarnReed)),.02,.06,.05)),{c2:C(pick(PAL.tarnIrid))});st.reeds++;},{R,boxes,noMask:true,cliff:true});}

LABY.buildFloor=function(R,q,P){q=q==null?1:q;P=P||LABY.PROFILES.parkland;const st={plants:0,melons:0,fallen:0,patches:0,lichen:0,pads:0,reeds:0,byKind:{}};
 const LOD=BIO.radii(),near=LOD.floor[0],far=LOD.floor[1],FARK=LABY.FARK==null?.06:LABY.FARK;
 // the floor's band round each point of the LOD spine: the passes visit only these windows
 const BOXES=BIO.host.origin.map(o=>[o[0]-far,o[1]-far,o[0]+far,o[1]+far]);
 const r0=BIO.range;
 PASSES.forEach((ps,pi)=>{const kind=ps[0];let n=0;BIO.range=LABY.LOD[ps[3]];
  LABY.place(ps[1],200+pi,(x,z)=>{const d=LABY.lodAt(x,z),share=d<near?1:d<far?FARK*(kind==='melon'||kind==='stone'?3:1):0;if(!share)return 0;return ps[2](zones(x,z),P)*q*share;},
   (x,y,z)=>{D[kind](x,y,z,zones(x,z),P,st);n++;},{R,lodMax:far,boxes:BOXES});
  st.byKind[kind]=n;st.plants+=n;});
 BIO.range=LABY.LOD.floor;tarns(R,P,q,st,BOXES);BIO.range=r0;
 return st;};
})();
