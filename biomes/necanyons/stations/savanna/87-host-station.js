// ================================================================= HOST — station 3's own passes (the savanna floor toward Korona)
// Before the build (88): the EMBER PLUMS (Terminalia, the Australian savanna's own) stand out on the open floor as well as on the tops,
// and the fan palms keep to the creek (55: NECANYONS.PASSES, data: only their acceptance changes). After it (stationBuild, called by
// 88 once both kits are placed): the SAVANNA GRASS, golden tussocks of the kit's bunchgrass card (the ringgrass item: card.ichu) over
// the floor, thinning on the pavement and the talus, none in the wadi's channel, the pans or the creek's gallery forest; placed by cell
// (NECANYONS.place: each cell its own KRAND seed) to 900 m of the LOD spine, under the runtime LOD's floor range
(function(){const P=NECANYONS.PASSES,smooth=BIO.fn.smooth,by=sp=>P.find(p=>p.sp===sp);
 const pl=by(3);if(pl){const a=pl.accept;pl.accept=(x,z,Z)=>Z.zone==='floor'?(PANS.some(p=>Math.hypot(x-p.x,z-p.z)<p.r*1.15)?0:1)*.05*smooth(60,120,creekD(x,z))*(1-PAVE(x,z)*.6)*smooth(50,90,Z.footD):a(x,z,Z);}
 const fp=by(0);if(fp){const a=fp.accept;fp.accept=(x,z,Z)=>Z.zone==='floor'?a(x,z,Z)*smooth(140,40,creekD(x,z)):a(x,z,Z);}})();
function stationBuild(){const {TAU,rr,ri,rng,qEuler}=BIO.fn,{bright,vary}=BIO.col,st={tussocks:0,tufts:0};
 const GOLD=[0xc8a45a,0xb89048,0xd4b46c,0xa88a4a,0xbca068],col=()=>NECANYONS.libCol('ringgrass',bright(vary(new THREE.Color(GOLD[ri(0,GOLD.length-1)]),.03,.1,.06),1.15));
 const L=BIO.radii(),inWadi=(x,z)=>{const w=KRELIEF.at(WADI,x,z,floorBase0(x,z));return !!(w&&w.part&&w.part!=='plain');},inPan=(x,z)=>PANS.some(p=>Math.hypot(x-p.x,z-p.z)<p.r*1.05);
 BIO.cur='necanyons/station';BIO.range=NECANYONS.LOD.floor||null;
 try{NECANYONS.place(7,401,(x,z,Z)=>Z.zone!=='floor'||inPan(x,z)||inWadi(x,z)?0:.75*smooth(40,110,creekD(x,z))*(1-.7*PAVE(x,z))*smooth(20,45,Z.footD),(x,y,z,Z)=>{
   const d=BIO.lodD(x,z),lv=d<L.floor[0]?2:d<900?1:0,n=lv===2?ri(4,8):lv===1?3:1,r=rr(.5,1.3);st.tussocks++;
   for(let k=0;k<n;k++){const a=rr(0,TAU),dd=k?r*Math.sqrt(rng()):0,h=rr(.55,1.25)*(lv===0?1.4:1),px=x+Math.cos(a)*dd,pz=z+Math.sin(a)*dd;
    BIO.put('ringgrass',[px,BIO.terrainH(px,pz)-.05,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[h*1.1,h,h*1.1],col());st.tufts++;}},{R:TERR.R-60,lodMax:900});}
 finally{BIO.range=null;BIO.cur=null;}
 return st;}
