// ================================================================= SAVANNARIM — the grass (the passes a host calls; it says where)
// The savannah's grass in three rings round the host's centre, as the hyperjungle's savanna station draws its tall grass: a near cell,
// a mid cell and a far cell, each tussock from KRAND.hash(world, i, j, salt) of its cell (never draw order), its height by the burn's age
// (short or none on this year's burns, regrown by three years: KFIRE's ages, the host's burnAge), its colour from the land's palette.
//   SAVRIM.grass(o)      the red oat grass: o = {world, center [x,z], R, lod {floor, mid, far}, ground(x,z), weight(x,z) -> 0..1,
//                        burnAge(x,z) (60: never burnt), clear(x,z) -> bool, H [2,3], col [hex...], cells [3,6,13]} -> {n}
//   SAVRIM.blindGrass(o) the blind grass: the same, 5-8 m stands of cane-grass on cells [4,9,16]; o.lanes (true): clear lanes 3 m wide
//                        every ~260 m on two bearings, hashed from the world (PLAN-LANDS.md section 3: the kit leaves lanes in the
//                        blind grass for the Screamers' punji pits and nets, the settlement's own records). Read in place by
//                        biomes/hyperjungle's station `north` for its gaps.
(function(){
const U=KRAND.unit,HS=KRAND.hash;
function rings(o,item,salt,cells,height,width,per){const R=o.R==null?3000:o.R,c=o.center||[0,0],LD=o.lod||{},W=o.world==null?0:o.world;
 const bands=[[cells[0],0,LD.floor==null?700:LD.floor],[cells[1],LD.floor==null?700:LD.floor,LD.mid==null?1600:LD.mid],[cells[2],LD.mid==null?1600:LD.mid,R*1.5]];
 const col=o.col||[0xb09a58,0xc0a860,0x9a8a4a,0xa89050,0xd0b868];let n=0;
 bands.forEach((B,bi)=>{BIO.range=[LD.floor,LD.mid,LD.far][bi]||null;const cell=B[0],N=Math.ceil((B[2]+50)/cell);
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=HS(W,i,j,salt+bi),u=k=>U(HS(h,k,0,salt));
   const x=c[0]+(i+u(1))*cell,z=c[1]+(j+u(2))*cell,d=Math.hypot(x-c[0],z-c[1]);if(d<B[1]||d>=B[2]||Math.max(Math.abs(x),Math.abs(z))>R)continue;
   const w=o.weight?o.weight(x,z):1;if(w<.05||u(3)>w*(bi===2?.75:.92))continue;if(o.clear&&!o.clear(x,z))continue;
   const a=o.burnAge?o.burnAge(x,z):60,k=smooth(.25,3,a);if(k<.08||u(4)>.25+.75*k)continue;
   const y=o.ground?o.ground(x,z):0,hh=height(u)*(.35+.65*k)*(bi===2?1.25:1),wd=width(u,hh)*(bi===0?1:1.5),np=bi===2?1:per;
   for(let m=0;m<np;m++){const aa=u(7+m)*TAU,dd=m?.6+u(9)*1.4:0;
    BIO.put(item,[x+Math.cos(aa)*dd,y-.05,z+Math.sin(aa)*dd],qEuler(0,u(12+m)*TAU,0),[wd,hh,wd],col[Math.floor(u(10+m)*col.length)%col.length]);n++;}}});
 BIO.range=null;return n;}
SAVRIM.grass=SAVRIM.inKit(function(o){o=o||{};const H=o.H||[2,3];
 return{n:rings(o,'redoat',0x5c10,o.cells||[3.5,7,14],u=>(H[0]+(H[1]-H[0])*u(5))*1.15,(u,hh)=>hh*(.75+.35*u(6)),2)};});
// the lanes: two bearings from the world's hash; a point is in a lane when it is within 1.5 m of a line of the family (spacing ~260 m)
function laneAt(W,x,z){for(let f=0;f<2;f++){const a=U(HS(W,f,0,0x5c2f))*Math.PI,ca=Math.cos(a),sa=Math.sin(a),sp=240+60*U(HS(W,f,1,0x5c2f)),d=x*ca+z*sa,r=((d%sp)+sp)%sp;if(r<1.5||r>sp-1.5)return true;}return false;}
SAVRIM.laneAt=laneAt;
SAVRIM.blindGrass=SAVRIM.inKit(function(o){o=o||{};const H=o.H||[5,8],W=o.world==null?0:o.world,lanes=o.lanes!==false;
 const o2=Object.assign({},o,{clear:(x,z)=>(!lanes||!laneAt(W,x,z))&&(!o.clear||o.clear(x,z)),col:o.col||[0x8a9a50,0x7a8a44,0x9aa858,0xa89a50,0x6a7a3a]});
 return{n:rings(o2,'blindgrass',0x5c20,o.cells||[4,9,16],u=>H[0]+(H[1]-H[0])*u(5),(u,hh)=>hh*(.35+.15*u(6)),2)};});
})();
