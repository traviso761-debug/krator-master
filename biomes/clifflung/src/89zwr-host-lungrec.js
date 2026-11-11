// ================================================================= HOST — the lungs as records: the rings, the mouths, the bells, the hazards (before the bake: core/tags first)
// Each drawn ring a volume (the inspector names it "ring 83 of 121, born at 1.21 atm", the probe checks its band), each mouth and bell, and the
// hazards on the breath (LUNG.hazards: core/hazard records, registered before anything of theirs is drawn; the rings under the deck are not drawn,
// and their sphincters wait for the station that draws them).
LUNG.L=LUNG_L;
const LUNG_VOL={rings:0};
LUNG_L.lungs.forEach(l=>l.rings.forEach(R=>{const top=Math.max(R.a[1],R.b[1]);if(top<CLIP_Y-40)return;const lo=Math.min(R.a[1],R.b[1]),mx=(R.a[0]+R.b[0])/2,mz=(R.a[2]+R.b[2])/2,B=LUNG.bandAt(R.atm);
 REGISTER({name:(l.dead?'A husk\'s ring ':'Lung ring (ringos) ')+(R.n+1)+' of '+l.rings.length+' ('+l.id+(l.mirror?', the mirror lung':'')+'), born at '+R.atm.toFixed(2)+' atm: the '+B.name+' band',
  key:'ring',ring:R.id,lung:l.id,atm:R.atm,band:R.band,hand:l.hand,x:mx,z:mz,y:lo-R.r-2,r:Math.hypot(R.b[0]-R.a[0],R.b[2]-R.a[2])/2+R.r+2,h:top-lo+2*R.r+4});LUNG_VOL.rings++;}));
LUNG_L.mouths.forEach(M=>REGISTER({name:(M.live?'The mouth (Uxomouđos) of ':'The dead mouth of the husk ')+M.lung+(M.mirror?': the mirror lung\'s, a Levtonemetos':''),key:'mouth',mouth:M.id,x:M.x,z:M.z,y:terrainH(M.x,M.z)-M.r,r:M.collar+1,h:M.r*3}));
LUNG_L.bells.forEach(B=>REGISTER({name:'The bell (Andemouđos) of '+B.lung,key:'bell',bell:B.id,x:B.x,z:B.z,y:B.y-B.r,r:B.r*1.2,h:B.r*3}));
// ---- the hazards: each a core/tags record with tags.hazard, registered before it is drawn (the rings under the deck are not drawn: their sphincters wait)
const LUNG_HAZ=LUNG.hazards(LUNG_L).filter(h=>h.y+h.h>CLIP_Y-40);
LUNG_HAZ.forEach(h=>{REGISTER(Object.assign({},h));if(/mouth-maw/.test(h.name))probeAt(h.x,h.z,.4);});
