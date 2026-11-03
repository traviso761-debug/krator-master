// ================================================================= HOST — the neighbours' species (EXCHANGES.md "ebadlands": the kit as receiver; the final rebuild, 2026-11-02)
// On a page whose station reads the vendors in place (stations/<name>/station.json "kin"; build.py slots their species and trees before this kit), each
// row grown by BIO.kin (core/biome 32) with its own kit's builder, never the source kit's build. The waste station (1) takes the two whose vendors had
// their turns:
//   eastabyss.araucaria -> 'ropearaucaria', Rope araucaria, a cousin: shorter (x.7) and sparser in the thinner, drier air, no abyssal habit; in the
//                     waste's shade, the slot canyon cut into the first step and the gullies' floors near the step's foot (the low BSh canyons over the
//                     abyss's rim the row names)
//   sedesert.mesquite -> 'mesquite', Mesquite, as it is (read in place): the washes' banks and the wadis' fans. OWED, not read now: sedesert's builder
//                     jitters the crowns up to ~2.8 m off their limbs and the attach audit failed at 9.5% (29 of 305 cards); grown here again (station.json)
//                     once sedesert holds them (BIO.holdTo, its next turn). The code stays: it grows nothing while SEDESERT is not on the page
// Owed: the Bowl's tamarisk (its builder is private to the Bowl's floor fragment, stations/bowl/66-biome-sedesert-halo.js: the Bowl's next turn exports
// it, then this file grows it on the wadis' bars), Korona's frost tank (Korona's turn, pair 9). Placed after the kit's build and before the bake, on a
// lattice whose every cell is KRAND.hash(world, i, j, salt) and whose tree's numbers come from a reseed of the same hash: nothing the kit placed moves.
// Clear of the kit's trees (core/space), the obstacles and the water. ?kin=0 grows none.
function growKin(){
 if(new URLSearchParams(location.search).get('kin')==='0'||!BIO.kin||(typeof EASTABYSS==='undefined'&&typeof SEDESERT==='undefined'))return null;
 const W=5861,out={araucaria:0,mesquite:0};
 const ARA=typeof EASTABYSS!=='undefined'?BIO.kin('eastabyss.araucaria',{key:'ropearaucaria',name:'Rope araucaria',scale:{H:.7,rb:.8,crownR:.85},
  tags:{abyssal:false,koppen:['BSh','Csa']}}):null;
 const MES=typeof SEDESERT!=='undefined'?BIO.kin('sedesert.mesquite',{key:'mesquite',name:'Mesquite',tags:{koppen:['BSh','BWh']}}):null;
 const S=KSPACE.create({cell:40});(EBADLANDS.TREES||[]).forEach(T=>S.insert(T,T.x,T.z,(T.rb==null?.5:T.rb)*1.4+2));
 const clear=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&terrainH(x,z)-waterH(x,z)>.5;
 const R=TERR.R-150,F=(n,x,z)=>BIO.field(n,x,z);
 function lattice(K,cell,salt,accept,minR){if(!K)return 0;let n=0;const N=Math.ceil(R/cell);
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.abs(x)>R||Math.abs(z)>R||u(3)>accept(x,z)||!clear(x,z,minR))continue;
   reseed(h);const T=K.make(x,terrainH(x,z),z);K.grow(T,2);   /* the hero always: a mid tier draws no boughs and its crowns would float (a few dozen trees) */
   S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+2);REGISTER({name:K.name,kind:'tree',label:K.name,x,z,y:T.y0,r:T.crownR==null?3:T.crownR,h:T.H});n++;}
  return n;}
 BIO.cur='badlands/kin';
 // the araucaria: the slot canyon's floor and the gullies' floors within 600 m of the step's foot, never on a wall
 if(typeof STATION!=='undefined'&&STATION.E)out.araucaria=lattice(ARA,40,0x5e11,(x,z)=>{const sl=F('slope',x,z),dE=STATION.E(z)-x,inSlot=Math.abs(z-STATION.slotZ(x))<28&&x>STATION.E(z)-250;
  return smooth(.4,.2,sl)*Math.max(inSlot?.8:0,smooth(600,150,dE)*smooth(-50,50,dE)*smooth(.2,.5,F('canyon',x,z)+F('wet',x,z))*.35);},4);
 // the mesquite: a wash's banks and its fan (the land's wash field), where it is dry
 out.mesquite=lattice(MES,24,0x5e12,(x,z)=>{const w=F('wash',x,z);return smooth(.2,.5,w)*smooth(.98,.6,w)*smooth(.35,.2,F('slope',x,z))*.6;},3);
 BIO.cur=null;return out;}
