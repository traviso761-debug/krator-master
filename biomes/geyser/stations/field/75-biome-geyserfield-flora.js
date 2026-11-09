// ================================================================= GEYSER FIELD FLORA — the cold grounds' plants (stations 2-5), a registry of its own
// The kit's own species (50, 55, 60) are the Steampits' hot-country life and keep their keys and indices for their readers (ringisles, the isle demo, the
// hyperjungle's lake): a cold field's plants live here, in their own registry (BIO.kit('geyserfield')), on the stations' own library sets (the
// materials.json slots st.*, packed only into the pages that list them):
//   lodgepole  the mountain forest field's living trees (basin; Yellowstone's basins stand in lodgepole pine): a straight bole, a narrow crown of
//              needle clumps on its upper half, a few dead stubs below. Earth's (origin earth), on the library's pine needles and scaled bark
//   ichu       the high desert's bunch grass (puna): tussocks on the run-off's warm margins only
//   yareta     the high desert's cushion plant (puna): hard green domes on the warm ground near the vents, older ones broad and low
// FIELDFLORA.place(o): every tree and tuft from KRAND.cell(seed + salt, ix, iz) over its cell lattice and KRAND.hash(seed, index, salt) for its parts:
// nothing hangs on how many draws came before. o: {seed, q, R (reach from the field's centre), at [x, z], blocked(x, z) (the kit's trees), lodgepole {cell, accept(x, z) 0..1, near},
// ichu {cell, accept}, yareta {cell, accept}}. Each tree and patch is a core/tags record (BIO.register) before it is drawn.
const FIELDFLORA=(function(){BIO.kit('geyserfield');const {TAU,clamp,mix,smooth,qEuler}=BIO.fn,T3=BIO.host.THREE,C=h=>new T3.Color(h);
const K=(c,a,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:'no',koppen:kp,holy:false,shared:null,alien:false,native:false,origin:'earth'},o||{});
const HV=(wood,edible,medicinal,note)=>({wood,edible,medicinal:!!medicinal,note:note||''});
const SPECIES=[{key:'lodgepole',name:'Lodgepole pine',how:'a straight bole, a narrow crown of needle clumps on its upper half; the forest round a mountain geyser basin',
  tags:K('cold','semiarid',['Dwc','Dsc','Dfc','Dfb'],{harvest:HV('lumber, poles, fuel',[],false,'The poles of a lodge.')})}];
const PLANTS={ichu:{name:'Ichu (bunch grass)',items:['fichu'],tags:K('polar','arid',['ET','BSk'],{harvest:HV('none',[],false,'Thatch and fodder.')})},
 yareta:{name:'Yareta (cushion plant)',items:['fcushion'],tags:K('polar','arid',['ET'],{native:false,harvest:HV('fuel (its resin)',[],true,'Burns hot; centuries old.')})}};
SPECIES.forEach((S,i)=>{S.i=i;});const byKey={lodgepole:SPECIES[0]};
// the materials: procedural greys (the per-instance colour tints them) until the library's sets swap in (BIO.libSwap on the stations' st.* slots)
const G2=BIO.tex.grey;
const TX={needle:BIO.alphaTex(256,(g,S)=>{for(let i=0;i<420;i++){const u=KRAND.unit(KRAND.hash(7302,i,1)),v=KRAND.unit(KRAND.hash(7302,i,2)),a=KRAND.unit(KRAND.hash(7302,i,3))*TAU,r=S*.42*Math.sqrt(u);
  const x=S/2+Math.cos(a)*r,y=S/2+Math.sin(a)*r*.8;g.strokeStyle=G2(120+110*v);g.lineWidth=1.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a+.6)*12,y+Math.sin(a+.6)*12);g.stroke();}},[50,70,40]),
 grass:BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<90;i++){const u=KRAND.unit(KRAND.hash(7303,i,1)),v=KRAND.unit(KRAND.hash(7303,i,2)),w=KRAND.unit(KRAND.hash(7303,i,3));
  const x=S/2+(u-.5)*.3*S,a=-Math.PI/2+(v-.5)*1.1,L=S*(.55+.43*w);g.strokeStyle=G2(150+90*w);g.lineWidth=1.8;g.beginPath();g.moveTo(x,S);g.quadraticCurveTo(x+Math.cos(a)*L*.5,S+Math.sin(a)*L*.5,x+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[150,130,80])};
const BARK=BIO.canvasTex(256,256,(g,W,H)=>{const id=g.createImageData(W,H),d=id.data;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4,v=150+40*(BIO.fn.fbm(x*.06,y*.03,7304,3)-.5)+18*(BIO.fn.h3(x,y,7305)-.5);d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}g.putImageData(id,0,0);});
const M={'st.pine':BIO.leafMat(TX.needle,'st.pine',{aN:true,swayW:'1.0',swayA:.04}),'st.ichu':BIO.leafMat(TX.grass,'st.ichu',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 'st.pinebark':BIO.barkMat(BARK),cushion:BIO.solidMat(null)};
const LIB=BIO.libSwap('geyser',M);
BIO.bucket('fbark',M['st.pinebark'],{label:'Lodgepole bark',uvScale:[2,4]});
BIO.def('fneedle',BIO.geo.clump(),M['st.pine'],{attrs:['aN'],label:'Lodgepole needles'});
BIO.def('fichu',GEYSER.G.tuft(),M['st.ichu'],{label:'Ichu (bunch grass)'});
BIO.def('fcushion',BIO.geo.lobe(),M.cushion,{label:'Yareta cushions'});
const LIBW=C(0xffffff),libCol=(slot,c)=>LIB[slot]?LIBW.clone().lerp(c,.2):c;
// ---------------------------------------------------------------- the lodgepole
function lodgepole(x,z,i,seed,lv,st){const U=s=>KRAND.unit(KRAND.hash(seed,i,s)),y=BIO.terrainH(x,z),H=mix(12,23,U(1))*(lv?1:.9),rb=mix(.13,.24,U(2)),la=U(3)*TAU,lean=U(4)*.03;
 BIO.register({name:'A lodgepole pine',key:'lodgepole',kit:'geyserfield',x,z,y:y-.5,r:2.6,h:H+1});
 const n=lv?6:3,pts=[];for(let k=0;k<=n;k++){const t=k/n;pts.push({x:x+Math.cos(la)*lean*H*t*t,y:y-.3+(H+.3)*t,z:z+Math.sin(la)*lean*H*t*t,r:rb*mix(1,.18,Math.pow(t,.9))});}
 st.tris+=BIO.tube('fbark',pts,libCol('st.pinebark',C(0x6a5a4a)),{seg:lv?6:4,cap:true});
 /* the crown: whorls of needle clumps on the upper half, two or three to a whorl round the bole (a lodgepole's crown is narrow: ~3 m across) */
 const nw=lv?Math.round(mix(10,14,U(5))):6,c0=C(0x3e5a32).lerp(C(0x56703a),U(6));
 for(let kk=0;kk<nw*(lv?2:1);kk++){const k=lv?kk>>1:kk,t=mix(.42,.99,k/(nw-1)),p=pts[Math.min(n,Math.round(t*n))],sz=mix(3.4,1.2,k/(nw-1))*mix(.85,1.15,U(10+kk)),a=U(30+kk)*TAU+(kk&1)*Math.PI,o=sz*.3;
  const px=x+Math.cos(la)*lean*H*t*t+Math.cos(a)*o,pz=z+Math.sin(la)*lean*H*t*t+Math.sin(a)*o,py=y+H*t;
  BIO.put('fneedle',[px,py,pz],qEuler((U(50+kk)-.5)*.3,a,(U(70+kk)-.5)*.3),[sz,sz*.85,sz],libCol('st.pine',c0.clone().multiplyScalar(mix(.85,1.1,t))),{n:[Math.cos(a)*.4,.85,Math.sin(a)*.4]});st.clumps++;}
 st.trees++;}
// ---------------------------------------------------------------- the pass
function cells(o,cell,salt,R,fn){const at=o.at||[0,0],N=Math.ceil(R*2/cell),seed=(o.seed==null?7310:o.seed)+salt;
 for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){const s=KRAND.stream(KRAND.cell(seed,ix,iz)),x=at[0]-R+(ix+s.next())*cell,z=at[1]-R+(iz+s.next())*cell;
  if(Math.hypot(x-at[0],z-at[1])>R||BIO.mask(x,z)<=0)continue;fn(x,z,s,iz*N+ix);}}
function place(o){const q=o.q==null?1:o.q,R=(o.R==null?1300:o.R),st={trees:0,clumps:0,tris:0,ichu:0,yareta:0},seed=o.seed==null?7310:o.seed;
 if(o.lodgepole){const P=o.lodgepole,near=(P.near==null?700:P.near);
  cells(o,(P.cell==null?10:P.cell),1,R,(x,z,s,i)=>{const a=P.accept(x,z);const d=Math.hypot(x-(o.at||[0,0])[0],z-(o.at||[0,0])[1]);if(d>near&&s.next()>.45)return;if(a<=0||s.next()>a*q)return;
   if(o.blocked&&o.blocked(x,z))return;lodgepole(x,z,i,seed+1,d<near?1:0,st);});}
 if(o.ichu){const P=o.ichu;cells(o,(P.cell==null?2.4:P.cell),2,Math.min(R,(P.R==null?R:P.R)),(x,z,s)=>{const a=P.accept(x,z);if(a<=0||s.next()>a*q)return;const h=s.range(.35,.75),y=BIO.terrainH(x,z);
   BIO.put('fichu',[x,y-.04,z],qEuler((s.next()-.5)*.15,s.next()*TAU,(s.next()-.5)*.15),[h*1.3,h,h*1.3],libCol('st.ichu',C(0xb8a46a).lerp(C(0x8a8a50),s.next()*.5)));st.ichu++;});
  if(st.ichu)BIO.register({name:'Ichu on the warm margins',key:'ichu',kit:'geyserfield',x:(o.at||[0,0])[0],z:(o.at||[0,0])[1],y:BIO.terrainH((o.at||[0,0])[0],(o.at||[0,0])[1])-30,r:Math.min(R,(P.R==null?R:P.R)),h:80});}
 if(o.yareta){const P=o.yareta;cells(o,(P.cell==null?4:P.cell),3,Math.min(R,(P.R==null?R:P.R)),(x,z,s)=>{const a=P.accept(x,z);if(a<=0||s.next()>a*q)return;const r=s.range(.35,1.4),y=BIO.terrainH(x,z);
   BIO.put('fcushion',[x,y-.12*r,z],qEuler(0,s.next()*TAU,0),[r,r*s.range(.25,.45),r*s.range(.8,1.2)],C(0x6f8a2c).lerp(C(0x8aa040),s.next()*.6));st.yareta++;});}
 return st;}
return BIO.kitEnd({SPECIES,PLANTS,byKey,place,plantOfItem:it=>{for(const k in PLANTS)if(PLANTS[k].items.indexOf(it)>=0)return PLANTS[k];return it==='fneedle'?SPECIES[0]:null;}});})();
