// ================================================================= HOST — the se rim's own passes (landOwn: 87-host-land.js calls it before the grass)
// PLAN-LANDS.md section 5.2 (J6, 2026-11-08), the incense country, station 1 only (a station's own 87e replaces this fragment; on a land
// that is not the se rim it does nothing). The zones run from the Bowl's side (south-west on this map: down the rise) to the wet face (its
// foot to the north-east, LAND.edge): s along the rise, -3 km .. +3 km.
//   1 dry rocky slopes (s < -1.2 km): the incense tree, the rain rose on the kopjes, the Bowl's cardon and candelabra by reach (H1)
//   2 the savannah (-1.2 .. 0 km): red oat grass, rain bottles, rain dragons, umbrella thorns (87)
//   3 the laterite country (0 .. 1.5 km): the rust miombo woods (the copper flush, H7) on the ironstone; the red guyed stalk's gullies
//     are Godstep's (not built: none drawn)
//   4 the Cfa foot of the wet face (s > 1.3 km): the cloud avocado, the leaning tree ferns in the ravines (H4), the gallery forest (87)
// Near Pylon at the western end, the drylands' frill-tree and prism mallee by reach (H1, LAND.home.drylands). Cousins by BIO.kin of the
// sedesert's builders (src/56: SAVRIM.LANDS.southeast.cousins()), read in place (stations/serim/station.json "neigh"); every place a KRAND cell.
function landOwn(c){if(LAND.key!=='southeast')return;
 const L=SAVRIM.LANDS.southeast,K=L.cousins(),out=c.out;L.def();out.kin=out.kin.concat(Object.keys(K).filter(k=>K[k]).map(k=>K[k].record));
 const RD0=RD,sAt=(x,z)=>x*RD0[0]+z*RD0[1]+150*KN(x,z,.0012,850,2)*2,dry=(x,z)=>smooth(-1000,-1600,sAt(x,z)),savZ=(x,z)=>smooth(-1600,-1000,sAt(x,z))*smooth(200,-200,sAt(x,z)),
  latZ=(x,z)=>smooth(-200,200,sAt(x,z))*smooth(1700,1300,sAt(x,z)),cfa=(x,z)=>smooth(1200,1700,sAt(x,z)),rw=(r,x,z)=>BIO.reachW?BIO.reachW(r,x,z):1;
 const RB={from:'bowl',km:9},RDY={from:'drylands',km:8.5},LT0=c.LD.tree;
 // the drylands' builders read their kit's burn age (its own fire history, which this page does not take): the page's (KFIRE) in its place
 if(typeof CRATERDRY!=='undefined'&&typeof CRATERDRY.ageAt!=='function')CRATERDRY.ageAt=(x,z)=>burnAge(x,z);
 // the Bowl's builders hang their strap tufts and blooms round spots off their limbs, out to half the crown: at the rim's size they
 // stand clear of what holds them. Grown in a BIO.tree scope with those cards held back, then each put on the nearest logged limb
 // (BIO.snapSeg) within its reach (BIO.holdTo; core/biome README "What held means"), in the source's registry: the builder's own draws in
 // its own order, only where the held cards stand moves
 const held=(grow,T,lv,kit,items)=>{const put=BIO.put,buf=[];BIO.put=function(name,pos,q,sc,col,extra){if(items.indexOf(name)>=0){buf.push([name,pos.slice(),q,sc,col,extra]);return;}return put.apply(BIO,arguments);};
  let segs=[];try{segs=BIO.tree(T.x,T.z,()=>{grow(T,lv);},{});}finally{BIO.put=put;}
  const pk=BIO.kit(kit),ow=BIO.owner;BIO.owner=[T.x,T.z];try{for(const b of buf){const s=typeof b[3]==='number'?b[3]:Math.max(b[3][0],b[3][2]),hit=segs.length?BIO.snapSeg(segs,b[1],{t0:.2}):null;
   put.call(BIO,b[0],hit?BIO.holdTo(hit.p,b[1],(hit.seg.r1==null?.3:hit.seg.r1)+s*.45):b[1],b[2],b[3],b[4],b[5]);}}finally{BIO.owner=ow;BIO.kit(pk);}};
 const kinTree=(K1,key,x,z,h,lvNear,name,r0)=>{reseed(h);const T=K1.make(x,terrainH(x,z),z);REGISTER({name,key,kind:'tree',label:K1.name,x,z,y:T.y0,r:(T.crownR==null?r0:T.crownR)+2,h:T.H+3});
  if(K1.kit==='sedesert'){const ld=LT0;BIO.range=ld;BIO.minRange=0;try{held(K1.grow,T,lvNear,'sedesert',['bloom','strap']);if(ld){BIO.range=1e9;BIO.minRange=ld;const ow=BIO.owner;BIO.owner=[x,z];try{K1.grow(Object.assign({},T),0);}finally{BIO.owner=ow;}}}finally{BIO.range=null;BIO.minRange=0;}}
  else c.grown(K1.grow,T,lvNear,0,x,z);
  c.S.insert(T,x,z,(T.rb==null?1:T.rb)*1.6+r0*.3);c.cnt(key);return T;};
 const own=(B,key,x,z,h,lvNear,name,r0)=>{const T=B.make(x,terrainH(x,z),z,h);REGISTER({name,key,kind:'tree',label:SAVRIM.byKey[key].name,x,z,y:T.y0,r:(T.crownR==null?r0:T.crownR)+2,h:T.H+3});
  c.grown(B.grow,T,lvNear,0,x,z);c.S.insert(T,x,z,(T.rb==null?.5:T.rb)*1.6+r0*.3);c.cnt(key);return T;};
 const src=(kit,key)=>BIO.kitBuilder?BIO.kitBuilder(kit,key):null;
 // 1 THE DRY ROCKY SLOPES: the incense trees, the rain roses on the kopjes, the Bowl's cardon and candelabra by reach
 try{c.cells(40,0x8a10,(x,z,h,u)=>{const Z=zoneW(x,z),d=dry(x,z);if(d<.2||Z.gallery>.3||u(3)>.3*d*(.4+.6*smooth(.05,.2,KN(x,z,.003,851,2)+.1))||!c.free(x,z,4))return;
   own(L.incense,'incense',x,z,h,BIO.lodD(x,z)<800?2:1,'Incense tree (frankincense: Talia\'s trade, proposed)',3);c.closer('incenseAt',x,z,'Incense trees on the dry slopes');});
  if(K.rainrose)c.cells(24,0x8a11,(x,z,h,u)=>{const Z=zoneW(x,z);if(Z.kop<.3||u(3)>.35*Z.kop||!c.free(x,z,3))return;
   kinTree(K.rainrose,'rainrose',x,z,h,BIO.lodD(x,z)<800?2:1,'Rain rose (a cousin of the Bowl\'s desert rose; arrow poison)',3);c.closer('roseAt',x,z,'Rain roses on a kopje');});
  for(const [key,salt] of [['cardon',0x8a12],['candelabra',0x8a13]]){const B=src('sedesert',key);if(!B)continue;
   c.cells(150,salt,(x,z,h,u)=>{const Z=zoneW(x,z),w=rw(RB,x,z);if(Z.sav<.5||u(3)>.5*w*(.3+.7*dry(x,z))||!c.free(x,z,8))return;
    reseed(h);const T=B.make(x,terrainH(x,z),z);REGISTER({name:'The Bowl\'s '+B.species.name.toLowerCase()+' (by reach)',key,kind:'tree',label:B.species.name,x,z,y:T.y0,r:(T.crownR==null?8:T.crownR)+2,h:T.H+3});
    c.grown(B.grow,T,BIO.lodD(x,z)<900?2:1,0,x,z);c.S.insert(T,x,z,(T.rb==null?1:T.rb)*1.6+3);c.cnt(key==='cardon'?'cardon':'candelabra');});}}
 catch(e){reportErr('se dry slopes: '+e.stack);}
 // 2 THE SAVANNAH: the rain bottles and the rain dragons over the red oat grass
 try{if(K.rainbottle)c.cells(240,0x8a20,(x,z,h,u)=>{const Z=zoneW(x,z),v=savZ(x,z)+.3*dry(x,z);if(Z.sav<.8||u(3)>.55*v||!c.free(x,z,20))return;
   kinTree(K.rainbottle,'rainbottle',x,z,h,BIO.lodD(x,z)<1300?2:1,'Rain bottle (the gate baobab\'s bulk, the Bowl\'s bottle bark)',10);c.closer('bottleAt',x,z,'A rain bottle');});
  if(K.raindragon)c.cells(120,0x8a21,(x,z,h,u)=>{const Z=zoneW(x,z),v=savZ(x,z)+.4*latZ(x,z);if(Z.sav<.7||u(3)>.5*v||!c.free(x,z,10))return;
   kinTree(K.raindragon,'raindragon',x,z,h,BIO.lodD(x,z)<1100?2:1,'Rain dragon (dragon\'s blood: a red resin)',8);c.closer('dragonAt',x,z,'Rain dragons');});}
 catch(e){reportErr('se savannah: '+e.stack);}
 // 3 THE LATERITE COUNTRY: the rust miombo woods on the ironstone (the laterite's weight and the zone)
 try{c.cells(42,0x8a30,(x,z,h,u)=>{const Z=zoneW(x,z),v=latZ(x,z)*(.5+.5*smooth(.0,.5,Z.lat+.25));if(Z.gallery>.4||Z.dambo>.3||u(3)>.55*v||!c.free(x,z,6))return;
   own(L.rustmiombo,'rustmiombo',x,z,h,BIO.lodD(x,z)<1000?2:1,'Rust miombo (copper-red at the rains\' start; Godstep\'s redlands read it)',8);c.closer('miomboAt',x,z,'The rust miombo woods');});}
 catch(e){reportErr('se miombo: '+e.stack);}
 // 4 THE WET FACE'S FOOT: the cloud avocados and, in the ravines (the river's banks and the dambos), the leaning tree ferns
 try{c.cells(90,0x8a40,(x,z,h,u)=>{const Z=zoneW(x,z),v=cfa(x,z)*(1-Z.forest*.5);if(u(3)>.6*v||!c.free(x,z,14))return;
   const T=own(L.cloudavocado,'cloudavocado',x,z,h,BIO.lodD(x,z)<1100?2:1,'Cloud avocado (its moss on the giant\'s side)',10);c.closer('avoAt',x,z,'A cloud avocado');});
  c.cells(26,0x8a41,(x,z,h,u)=>{const Z=zoneW(x,z),rav=Math.max(smooth(RIVER.w*.6+60,RIVER.w*.6+8,Z.rd),Z.dambo)*smooth(800,1600,sAt(x,z));if(u(3)>.5*rav||!c.free(x,z,3))return;
   const T=L.leanfern.make(x,terrainH(x,z),z,h);T.k=.18+.2*smooth(-3000,3000,x);REGISTER({name:'Leaning tree fern (its crown tipped toward the giant)',key:'leanfern',kind:'tree',label:'Leaning tree fern',x,z,y:T.y0,r:5,h:T.H+3});
   c.grown(L.leanfern.grow,T,BIO.lodD(x,z)<900?2:1,1,x,z);c.S.insert(T,x,z,1.5);c.cnt('leanfern');(out.ferns=out.ferns||[]).push(T.up?T.up.slice():null);c.closer('fernAt',x,z,'Leaning tree ferns in a ravine');});}
 catch(e){reportErr('se wet face: '+e.stack);}
 // NEAR PYLON (the western end): the drylands' frill-tree and prism mallee by reach (H1)
 try{for(const [key,salt] of [['frill',0x8a50],['prismmallee',0x8a51]]){const B=src('craterdry',key);if(!B)continue;
   c.cells(70,salt,(x,z,h,u)=>{const Z=zoneW(x,z),w=rw(RDY,x,z);if(Z.sav<.5||u(3)>.5*w||!c.free(x,z,4))return;
    reseed(h);const T=B.make(x,terrainH(x,z),z);REGISTER({name:'The drylands\' '+B.species.name.toLowerCase()+' (by reach, near Pylon)',key,kind:'tree',label:B.species.name,x,z,y:T.y0,r:(T.crownR==null?3:T.crownR)+2,h:T.H+3});
    c.grown(B.grow,T,BIO.lodD(x,z)<800?2:1,0,x,z);c.S.insert(T,x,z,(T.rb==null?.3:T.rb)*1.6+2);c.cnt(key);});}}
 catch(e){reportErr('se by reach: '+e.stack);}}
// the land's checks (99 calls LAND.checks): station 1 only
if(LAND.key==='southeast'){
 LAND.checks=function(add,L){const n=L.n||{};
  add('the incense country drawn (the se rim\'s own and its cousins)',(()=>{const need=LAND.need,bad=Object.keys(need).filter(k=>!((n[k]==null?0:n[k])>=need[k]));return{ok:!bad.length,detail:Object.keys(need).map(k=>k+' '+(n[k]==null?0:n[k])).join(', ')+(bad.length?'; short: '+bad.join(', '):'')};})());
  add('the rust miombo flushes (H7: its crown on the season and the copper flush), and Godstep can read it',(()=>{const D=SAVRIM.LANDS.southeast._d,o=D&&D.miomboMat.userData.bio.opts,b=BIO.kitBuilder?BIO.kitBuilder('savannarim','rustmiombo'):null;
   return{ok:!!(o&&o.season&&o.season.flush)&&!!BIO.bindFlush&&!!b&&b.own,detail:'season '+JSON.stringify(o&&o.season)+'; kitBuilder(savannarim, rustmiombo) '+(b?'found':'none')};})());
  add('the leaning tree ferns lean toward the giant (H4)',(()=>{const F=(L.ferns||[]).filter(Boolean),g=BIO.GIANT||[0,0];if(!F.length)return{ok:false,detail:'no ferns'};
   const toward=F.filter(u=>u[0]*g[0]+u[2]*g[1]>0).length;return{ok:toward/F.length>.85,detail:toward+' of '+F.length+' tipped toward the giant (azimuth '+BIO.GIANT_AZ+')'};})());
  add('the red guyed stalk is Godstep\'s (a reference, none drawn here)',(()=>{const S=SAVRIM.byKey.guyedstalk;return{ok:!!S&&S.kind==='ref'&&!(n.guyedstalk>0),detail:S?S.ref:'no row'};})());};
 LAND.negatives=function(add){add('a fern that leans away from the giant',(()=>{const u=BIO.leanTo?BIO.leanTo([-(BIO.GIANT||[1,0])[0],-(BIO.GIANT||[1,0])[1]],.3,{jit:0,u:.5}):[0,1,0],g=BIO.GIANT||[1,0];return{ok:u[0]*g[0]+u[2]*g[1]>0,detail:'dot '+(u[0]*g[0]+u[2]*g[1]).toFixed(3)};})());};}
