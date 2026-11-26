// ================================================================= EASTERN DESERT, THE BOWL — the halophytes and the floor
// PLAN-BOWL.md section 4: the plants of the salt (Earth models named), their items on the Bowl's library cards
// (stations/bowl/materials.json, BIO.libSwap('bowl'); the procedural maps below when the page has no pack), and the floor
// pass that replaces the kit's on this page (SEDESERT.buildFloor), by the Bowl's zones from the host's fields (45):
//   SAXAUL      Haloxylon: twisted, nearly leafless small trees in open woods on the halo; the densest firewood there is
//   SALTBUSH    Atriplex: silver-grey mounds on the halo and the reg's edge
//   GLASSWORT   Salicornia: jointed succulent carpets in the flat's damp hollows and the halo, green in spring, crimson by
//               autumn (here: crimson where the salt is strongest, green where it is fresher); a vegetable and an oil seed
//   TAMARISK    Tamarix: feathery grey-green trees with pink plumes on the delta's levees and the halo; manna, timber
//   SALT REED   Phragmites in brackish water: the delta's channel edges; thatch, mats
//   BRINE LAMP  Krator's: a succulent whose salt glands crust its leaves in crystal, so a stand glitters at low sun; the medicine
// with the rank grass (blue-grey tussocks) and the highland blooms on the delta, the kit's dry grass, spinifex, stones and
// barrel cacti on the reg, and salt lumps on the ochre rim's ridges. Nothing grows on the open crust.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler}=BIO.fn;
const T3=BIO.host.THREE,C=SEDESERT.C,{bright,shade,vary,leafCol}=SEDESERT,{tuft,card,agaveR,barrel}=SEDESERT.small,G=SEDESERT.G,TX=SEDESERT.TEX;
const F=(n,x,z)=>BIO.field(n,x,z);
// ---------------------------------------------------------------- colours
const PB={
 saltbush:[0xa8b0a0,0xb4bcae,0x9aa496,0xbcc0b0],
 glassGreen:[0x6a9a3a,0x7aa848,0x5a8a34],glassRed:[0xb02a2a,0xc0382e,0x9a2430,0xc8503a],
 tamarisk:[0x8a9a80,0x96a48a,0x7e8e76],tamPlume:[0xe8a8c0,0xf0b8cc,0xd890b0],
 saxaul:[0x8a9a6a,0x7e8e5e,0x98a678],saxBark:[0xb4a892,0xa89c86,0xc0b49e],tamBark:[0x6a4a3a,0x5e4234,0x744e3e],
 saltreed:[0x8a9a5a,0x9aaa64,0x7a8a4a,0xb0a870],rankgrass:[0x8a9aa8,0x98a4b0,0x7c8a98],
 brinelamp:[0xffffff],salt:[0xf4f0e8,0xece6da,0xe8dcc8],ochreSalt:[0xd8b078,0xc89a60,0xe4c490],
 flowers:[0xffffff]};
// ---------------------------------------------------------------- materials (library cards when the 'bowl' pack is on the page)
const MB={
 saltbush:BIO.leafMat(TX.small,'bowl-saltbush',{aN:true,swayW:'1.0',swayA:.05}),
 tamarisk:BIO.leafMat(TX.feather,'bowl-tamarisk',{aN:true,swayW:'1.0',swayA:.12}),
 glasswort:BIO.leafMat(TX.needle,'bowl-glasswort',{swayW:'(position.y)',swayA:.02,alphaTest:.4}),
 saxtwig:BIO.leafMat(TX.needle,'bowl-saxtwig',{swayW:'(position.y)',swayA:.02,alphaTest:.4}),   /* the saxaul's twigs: glasswort's card held by its sprigs' stems on the clump (its own slot, the card fit 2026-10-27) */
 saltreed:BIO.leafMat(TX.reed,'bowl-saltreed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 rankgrass:BIO.leafMat(TX.grass,'bowl-rankgrass',{swayW:'(position.y)',swayA:.1,alphaTest:.4}),
 flowers:BIO.leafMat(TX.plume,'bowl-flowers',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 saxbark:BIO.barkMat(SEDESERT.BARKTEX[3]),
};
SEDESERT.BOWL_LIB=BIO.libSwap('bowl',MB);
BIO.bucket('saxbark',MB.saxbark,{label:'Saxaul and tamarisk wood',uvScale:[2,3]});
BIO.def('saltbush',BIO.geo.clump(),MB.saltbush,{attrs:['aN'],label:'Saltbush'});
BIO.def('tamarisk',BIO.geo.clump(),MB.tamarisk,{attrs:['aN'],label:'Tamarisk foliage'});
BIO.def('saxtwig',BIO.geo.clump(),MB.saxtwig,{attrs:['aN'],label:'Saxaul twigs'});
BIO.def('glasswort',G.tuft(),MB.glasswort,{label:'Glasswort'});
BIO.def('saltreed',G.tuft(),MB.saltreed,{label:'Salt reed'});
BIO.def('rankgrass',G.tuft(),MB.rankgrass,{label:'Rank grass'});
BIO.def('flowers',SEDESERT.BOWL_LIB&&SEDESERT.BOWL_LIB.flowers?BIO.geo.cells(G.tuft(),{rects:[[.015,.001,.316,.327],[.386,.335,.607,.665],[.013,.688,.321,.995]],scale:1}):G.tuft(),MB.flowers,{label:'Delta blooms'});   /* three of the sheet's nine highland flowers a tuft, one a quad (the card fit: "sheet": "geometry") */
BIO.def('saltlump',new T3.IcosahedronGeometry(1,0),BIO.solidMat(null,0xffffff),{label:'Salt crust'});
// ---------------------------------------------------------------- the plants, tagged (the inspector names them; biomes/FRUIT.md)
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
const PK=(name,aridity,riparian,items,hv)=>({name,tags:{climate:'tropic',aridity,abyssal:true,riparian,salt:true,harvest:hv},items});
Object.assign(SEDESERT.PLANTS,{
 saxaul:PK('Saxaul','arid','no',['saxtwig'],HV('the densest firewood there is; charcoal',[],false,'Haloxylon of the salt deserts: a fire of it burns all night.')),
 bowlsaltbush:PK('Saltbush','arid','no',['saltbush'],HV('fuel',['leaves (salty greens)'],false,'Grazing; the leaves eaten as salty greens.')),
 glasswort:PK('Glasswort','arid','both',['glasswort'],HV('none',['young shoots (sea asparagus)','seed oil'],false,'Salicornia: the vegetable in spring, an oil seed in autumn, when it turns crimson.')),
 tamarisk:PK('Tamarisk','arid','both',['tamarisk'],HV('timber, fuel',['manna (the scale insects\' sweet secretion on the twigs)'],false,'Salt crystals on the leaves; the manna is a sweetener.')),
 saltreed:PK('Salt reed','humid','yes',['saltreed'],HV('thatch, mats',[],false,'Phragmites in brackish water.')),
 rankgrass:PK('Rank grass','semiarid','both',['rankgrass'],HV('thatch',['seed (ground)'],false,'Blue-grey tussocks on the delta\'s silt.')),
 brinelamp:SEDESERT.BRINELAMP.plant,   /* the one builder's record (65-biome-sedesert-brinelamp.js) */
 deltabloom:PK('Delta blooms','semiarid','yes',['flowers'],HV('none',['nectar'],false,'')),
});
// ---------------------------------------------------------------- the builders
const clearT=(x,z,r)=>!SEDESERT.blocked(x,z,r)&&BIO.clearOf(x,z,r);
// the halophyte trees' keep-clear: core/space (KSPACE), rebuilt each pass
let HALO_TREES=null;const _hn=[];
const halo2=(x,z,r)=>!HALO_TREES.some(x,z,r+5,t=>{const dx=t.x-x,dz=t.z-z,rr2=t.r+r;return dx*dx+dz*dz<rr2*rr2;});
const haloAdd=t=>HALO_TREES.insert(t,t.x,t.z,t.r);
// SAXAUL: three to six twisted stems from one root, leaning, forking once or twice; tufts of jointed green twigs at the tips
function saxaul(x,y,z,lv,st){const H=rr(2.6,5.5),n=ri(3,6),bk=pick(PB.saxBark);
 for(let i=0;i<n;i++){const a=rr(0,TAU),lean=rr(.15,.55),L=H*rr(.7,1.05),pts=[];let px=x+rr(-.2,.2),pz=z+rr(-.2,.2),py=y-.15;const k=ri(5,7);
  for(let s=0;s<=k;s++){const t=s/k;pts.push({x:px,y:py,z:pz,r:lerp(.14,.04,t)*(lv===2?1:1.3)});const w=a+rr(-.7,.7);px+=Math.cos(w)*lean*L/k*1.4;pz+=Math.sin(w)*lean*L/k*1.4;py+=L/k*rr(.7,1.05);}
  st.sax+=BIO.tube('saxbark',pts,shade(C(bk),rr(-.15,.05)),{seg:lv===2?5:3});
  const tip=pts[pts.length-1],tw=leafCol(PB.saxaul,1.2,.03);
  /* each tuft held to its stem's tip (2026-11-08, the attach audit): the draws as they were, the spot brought in to half its size */
  for(let j=0,m=lv===2?ri(3,5):2;j<m;j++){const P=[tip.x+rr(-.8,.8),tip.y+rr(-.7,.1),tip.z+rr(-.8,.8)],q=qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),S3=[rr(1.5,2.4),rr(1.1,1.7),rr(1.5,2.4)];
   BIO.put('saxtwig',BIO.holdTo([tip.x,tip.y,tip.z],P,SEDESERT.reachOf('saxtwig',Math.max(S3[0],S3[2]))),q,S3,tw,{n:[rr(-.3,.3),1,rr(-.3,.3)]});}}
 if(lv===2)BIO.register({name:'Saxaul',key:'saxaul',x,z,y,r:H*.6,h:H+1});
 haloAdd({x,z,r:H*.45});st.saxauls++;}
// TAMARISK: a short leaning trunk and a feathery grey-green crown of clumps, pink flower plumes at the branch ends
function tamarisk(x,y,z,lv,st){const H=rr(3.5,7.5),R=H*rr(.42,.6),a0=rr(0,TAU),lean=rr(.05,.25),tx=x+Math.cos(a0)*lean*H,tz=z+Math.sin(a0)*lean*H,ty=y+H*.55;
 const bc=shade(C(pick(PB.tamBark)),rr(-.1,.05));st.sax+=BIO.tube('saxbark',[{x,y:y-.2,z,r:.22*H/6},{x:(x+tx)/2,y:(y+ty)/2,z:(z+tz)/2,r:.16*H/6},{x:tx,y:ty,z:tz,r:.1*H/6}],bc,{seg:lv===2?6:4});
 const lc=leafCol(PB.tamarisk,1.2,.03),n=lv===2?ri(8,13):ri(3,4);
 /* (2026-11-08, the attach audit: the crown's clumps stood in the air round the trunk's top) a branch from the trunk's top to each clump
    (a rod, no draw from the stream), and each plume held on its clump */
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=R*Math.sqrt(rng())*.75,cx=tx+Math.cos(a)*d,cz=tz+Math.sin(a)*d,cy=ty+rr(-.1,.45)*H*.4,s=R*rr(.6,.95);
  BIO.beam('rod',[tx,ty-.3,tz],[cx,cy,cz],.08*H/6,.03,bc);
  BIO.put('tamarisk',[cx,cy,cz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s*rr(.7,1),s],bright(vary(lc,.02,.06,.05),rr(.9,1.1)),{n:[Math.cos(a)*.4,1,Math.sin(a)*.4]});
  if(lv===2&&rng()<.55){const P=[cx+rr(-.4,.4),cy+s*.45,cz+rr(-.4,.4)];BIO.put('plume',BIO.holdTo([cx,cy,cz],P,SEDESERT.reachOf('plume',s*.35)),qEuler(0,rr(0,TAU),0),[s*.35,s*.3,s*.35],leafCol(PB.tamPlume,1.15,.02),{n:[0,1,0]});}}
 if(lv===2)BIO.register({name:'Tamarisk',key:'tamarisk',x,z,y,r:R+1,h:H+1});
 haloAdd({x,z,r:R*.8});st.tamarisks++;}
function saltbush(x,y,z,lv,st){const Rs=rr(.7,1.7),hc=leafCol(PB.saltbush,1.2,.03);
 BIO.put('saltbush',[x,y+Rs*.42,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[Rs*1.5,Rs*.95,Rs*1.5],hc,{n:[0,1,0]});
 if(lv===2&&rng()<.6){const ox=x+rr(-.6,.6)*Rs,oz=z+rr(-.6,.6)*Rs;if(BIO.mask(ox,oz)>0)BIO.put('saltbush',[ox,y+Rs*.3,oz],qEuler(0,rr(0,TAU),0),[Rs,Rs*.7,Rs],bright(hc,.92),{n:[0,1,0]});}st.saltbush++;}
// glasswort: a carpet of jointed sprigs, its colour by the salt: crimson where it is strongest
function glasswort(x,y,z,lv,st){const red=smooth(.45,.85,F('salt',x,z)+(BIO.fn.fbm(x*.01,z*.01,6601,2)-.5)*.5);
 const n=lv===2?ri(5,10):lv===1?ri(3,5):2,r=lv===0?2.4:1.6;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?r*Math.sqrt(rng()):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;
  const c=rng()<red?leafCol(PB.glassRed,1.05,.03):leafCol(PB.glassGreen,1.15,.03),h=rr(.18,.38)*(lv===0?1.6:1);
  BIO.put('glasswort',[px,y-.03,pz],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[h*1.3,h,h*1.3],c);}st.glasswort++;}
function saltreed(x,y,z,lv,st){const h=rr(1.6,3.2)*(lv===0?1.4:1);
 for(let i=0,n=lv===2?ri(3,6):lv===1?2:1;i<n;i++){const a=rr(0,TAU),d=i?rr(.5,2):0;tuftAt('saltreed',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.75,1.1),h*rr(.7,1),leafCol(PB.saltreed,1.25,.03));}st.reeds++;}
function rankgrass(x,y,z,lv,st){const h=rr(.6,1.2)*(lv===0?1.5:1);
 for(let i=0,n=lv===2?ri(2,4):1;i<n;i++){const a=rr(0,TAU),d=i?rr(.4,1.4):0;tuftAt('rankgrass',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*1.25,leafCol(PB.rankgrass,1.25,.03));}st.grass++;}
// the brine lamp: its own fragment (65-biome-sedesert-brinelamp.js), the one builder the Catch reads too
const brinelamp=(x,y,z,lv,st)=>SEDESERT.BRINELAMP.put(x,y,z,lv,st);
function blooms(x,y,z,lv,st){for(let i=0,n=lv===2?ri(2,5):1;i<n;i++){const a=rr(0,TAU),d=i?rr(.4,1.6):0,h=rr(.35,.7);tuftAt('flowers',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h,0xffffff);}st.blooms++;}
// a tuft that tests the mask itself (a cluster round an accepted point spills into the water otherwise)
function tuftAt(item,x,y,z,h,w,col){if(BIO.mask(x,z)<=0)return;tuft(item,x,BIO.terrainH(x,z),z,h,w,col);}
const stone=(x,y,z,lv,st,big)=>{const s=big?rr(.5,1.4):rr(.12,.4),c=bright(vary(pick([0x8a6a54,0x7a5a48,0x9a7a60,0x6a5a50]),.02,.08,.06),1.05);
 BIO.put(big?'boulder':'stone',[x,y+s*.15,z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[s*rr(1,1.5),s*rr(.5,.8),s*rr(1,1.4)],c);if(big)SEDESERT.ROCKS.push([x,y+s*.6,z,s]);st.stones++;};
// ---------------------------------------------------------------- the floor pass
SEDESERT.buildFloor=function(R,q){
 reseed(660021);q=q==null?1:q;R=R||3000;SEDESERT.means();SEDESERT.ROCKS.length=0;HALO_TREES=KSPACE.create({cell:8});
 const st={saxauls:0,tamarisks:0,sax:0,saltbush:0,glasswort:0,reeds:0,grass:0,brinelamps:0,blooms:0,stones:0,dry:0,salt:0};
 const L=BIO.LOD();
 // the halophyte trees: saxaul woods on the halo (open woods, patchy), tamarisks on the delta's levees and the halo
 BIO.grid(15,0,R,(x,z)=>{if(BIO.lodD(x,z)>L.far)return 0;return F('halo',x,z)*(1-F('delta',x,z)*.8)*(1-F('salt',x,z)*.6)*(1-F('yard',x,z))*.42*q;},(x,y,z)=>{if(!clearT(x,z,2.5)||!halo2(x,z,1.5))return;
  const lv=BIO.lodD(x,z)<L.hero?2:1;saxaul(x,y,z,lv,st);},{patch:.85,patchScale:.004,pad:2});
 BIO.grid(16,0,R,(x,z)=>{if(BIO.lodD(x,z)>L.far)return 0;return (F('delta',x,z)*.32*(1-F('flow',x,z))+F('halo',x,z)*.07)*(1-F('lake',x,z))*q;},(x,y,z)=>{if(!clearT(x,z,3)||!halo2(x,z,3))return;
  const lv=BIO.lodD(x,z)<L.hero?2:1;tamarisk(x,y,z,lv,st);},{patch:.6,patchScale:.008,pad:3});
 // one plant of the zone's mix at a point
 function plant(x,y,z,lv){if(SEDESERT.blocked(x,z,.8)||!halo2(x,z,.4)||!BIO.clearOf(x,z,.5))return;
  const de=F('delta',x,z),ha=F('halo',x,z),dm=F('damp',x,z),rg=F('reg',x,z),yd=F('yard',x,z),dn=F('dune',x,z),sa=F('salt',x,z),fl=F('flat',x,z);
  const w=[de*1.2,ha*1.0,dm*fl*.9,rg*(1-yd)*(1-dn)*.35,yd*.15,dn*.12],t=rng();
  let tot=0;for(const v of w)tot+=v;if(tot<=0)return;let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  if(k===0){if(t<.34)saltreed(x,y,z,lv,st);else if(t<.62)rankgrass(x,y,z,lv,st);else if(t<.76)glasswort(x,y,z,lv,st);else if(t<.88)blooms(x,y,z,lv,st);else saltbush(x,y,z,lv,st);}
  else if(k===1){if(t<.36)saltbush(x,y,z,lv,st);else if(t<.6)glasswort(x,y,z,lv,st);else if(t<.76)brinelamp(x,y,z,lv,st);else if(t<.9)rankgrass(x,y,z,lv,st);else stone(x,y,z,lv,st);}
  else if(k===2){glasswort(x,y,z,lv,st);}
  else if(k===3){if(t<.3){tuft('grass',x,y,z,rr(.5,1),rr(.6,1.2),leafCol(SEDESERT.PAL.drygrass,1.3,.03));st.dry++;}else if(t<.45)saltbush(x,y,z,lv,st);else if(t<.55)brinelamp(x,y,z,lv,st);
   else if(t<.63){barrel(x,y,z,lv);st.dry++;}else if(t<.7){agaveR(x,y,z,SEDESERT.PAL.agave,.9);st.dry++;}else stone(x,y,z,lv,st,t>.93);}
  else if(k===4){stone(x,y,z,lv,st,t>.7);}
  else{if(t<.75){tuft('grass',x,y,z,rr(.5,1),rr(.6,1.2),leafCol(SEDESERT.PAL.drygrass,1.3,.03));st.dry++;}else stone(x,y,z,lv,st);}}
 // three bands along the LOD spine (the core's floor radii), as the kit's
 const bands=[[8,L.floor[0],0],[16,L.floor[1],L.floor[0]],[32,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .7*q*(lv===0?.5:1);},(x,y,z)=>plant(x,y,z,lv),{patch:.7,patchScale:.014,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // the salt reeds standing in the channels' shallows (the water window)
 BIO.grid(7,0,R,(x,z)=>{if(BIO.lodD(x,z)>=L.mid)return 0;return .5*q*F('flow',x,z)*smooth(.9,.25,BIO.depth(x,z));},
  (x,y,z)=>{const lv=BIO.lodD(x,z)<L.floor[0]*1.2?2:1;const h=rr(1.6,3)*(lv===2?1:1.3);tuft('saltreed',x,Math.max(y,BIO.waterH(x,z)-.4),z,h,h*.85,leafCol(PB.saltreed,1.25,.03));st.reeds++;},
  {patch:.6,patchScale:.03,noMask:true,depth:[-.1,.8],pad:1,box:BIO.window('water')});
 // the salt crust on the ochre rim's ridges out in the shallows: white and ochre lumps
 BIO.grid(9,0,R,(x,z)=>{if(BIO.lodD(x,z)>=L.mid)return 0;return F('ridge',x,z)*.5*q;},(x,y,z)=>{const s=rr(.3,1.1),c=rng()<.6?pick(PB.salt):pick(PB.ochreSalt);
  BIO.put('saltlump',[x,y-s*.1,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s*rr(1.2,2.4),s*rr(.25,.5),s*rr(1,1.8)],c);st.salt++;},{patch:.4,pad:.5});
 return{under:st};};
})();
