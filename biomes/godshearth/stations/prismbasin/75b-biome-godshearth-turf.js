// ================================================================= GODSHEARTH — the floor's frost turf (station 1; PLAN.md section 4, "Outside the discs"), a registry of its own
// The caldera floor between the warm discs is cool high meadow that takes a night frost: a short tufted sward of sedge and grass, Earth's analogue the
// Kobresia pastures of the Tibetan plateau at Lhasa's height (the plan's climate twin). One plant, TURF, drawn as short tufts (the geyser kit's tuft:
// three crossed quads) on the library's grass set (the geyser pack's `grass` slot, a neutral grey the instance colour tints: summer green-olive, cured
// straw where the noise says), over the ground's own turf paint (44s). Earth's (origin earth): what the Xanadui herders' beasts graze (proposed).
// GHTURF.place(o): every tuft from KRAND.cell(seed + salt, ix, iz) over its cell lattice: nothing hangs on how many draws came before. o: {at [x, z], R, cell,
// accept(x, z) 0..1, q, seed}. Each patch is a core/tags record (BIO.register) before it is drawn.
const GHTURF=(function(){BIO.kit('godshearth');const {TAU,clamp,mix,smooth,qEuler}=BIO.fn,T3=BIO.host.THREE,C=h=>new T3.Color(h);
 const G2=BIO.tex.grey;
 const TX=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<110;i++){const u=KRAND.unit(KRAND.hash(8150,i,1)),v=KRAND.unit(KRAND.hash(8150,i,2)),w=KRAND.unit(KRAND.hash(8150,i,3));
  const x=S/2+(u-.5)*.5*S,a=-Math.PI/2+(v-.5)*.9,L=S*(.4+.5*w);g.strokeStyle=G2(140+100*w);g.lineWidth=1.6;g.beginPath();g.moveTo(x,S);g.quadraticCurveTo(x+Math.cos(a)*L*.5,S+Math.sin(a)*L*.5,x+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[120,130,80]);
 const M={grass:BIO.leafMat(TX,'grass',{swayW:'(position.y)',swayA:.08,alphaTest:.4})};
 const LIB=BIO.libSwap('geyser',M);
 BIO.def('gturf',GEYSER.G.tuft(),M.grass,{label:'Frost turf (sedge and grass)'});
 const PLANTS={turf:{name:'Frost turf (a short sedge and grass sward)',items:['gturf'],
  tags:{climate:'cold',aridity:'semiarid',abyssal:false,riparian:'no',koppen:['Cwb','Dwb','Dwc','ET'],holy:false,shared:null,alien:false,native:false,origin:'earth',
   harvest:{wood:'none',edible:[],medicinal:false,note:'Grazing: the caldera\'s summer pasture (the Xanadui herders\', proposed). Takes a frost any night of the year.'}}}};
 const byKey={};
 function place(o){const q=o.q==null?1:o.q,at=o.at||[0,0],R=o.R==null?1250:o.R,cell=o.cell==null?3.2:o.cell,seed=o.seed==null?8150:o.seed,N=Math.ceil(R*2/cell),st={tufts:0};
  const GREEN=C(0x5e7034),OLIVE=C(0x7a7c3e),STRAW=C(0xa0925a);
  for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){const s=KRAND.stream(KRAND.cell(seed,ix,iz)),x=at[0]-R+(ix+s.next())*cell,z=at[1]-R+(iz+s.next())*cell;
   if(Math.hypot(x-at[0],z-at[1])>R||BIO.mask(x,z)<=0)continue;const a=o.accept(x,z);if(a<=0||s.next()>a*q)continue;
   const h=s.range(.18,.38),y=BIO.terrainH(x,z),cure=clamp(KRAND.fbm(x*.012,.5,z*.012,2,8151)*1.4-.35,0,1),c=GREEN.clone().lerp(OLIVE,s.next()).lerp(STRAW,cure*.8);
   BIO.put('gturf',[x,y-.03,z],qEuler((s.next()-.5)*.2,s.next()*TAU,(s.next()-.5)*.2),[h*2.2,h,h*2.2],LIB.grass?C(0xffffff).lerp(c,.85):c);st.tufts++;}
  if(st.tufts)BIO.register({name:'Frost turf on the caldera floor',key:'turf',kit:'godshearth',x:at[0],z:at[1],y:BIO.terrainH(at[0],at[1])-30,r:R,h:80});
  return st;}
 return BIO.kitEnd({SPECIES:[],PLANTS,byKey,place,plantOfItem:it=>it==='gturf'?PLANTS.turf:null});})();
