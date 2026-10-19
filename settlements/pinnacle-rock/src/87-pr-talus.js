// ================================================================= HOST — the debris slope's boulders (the cliff's fall)
// The slope round every wall's foot (45: TALUS, ~34 degrees, ledge bands) is rough with the rock it is made of: blocks
// fallen from the cliff, the largest (to ~9 m) lying near the foot of the wall, smaller ones down to the slope's toe, thicker
// under the gullies. One biome item ('pinnacle/talus': a sandstone block, the necanyons stack texture) so the blocks are
// registered and baked like every other placed thing; each cell of 6 m draws from its own hash (KRAND), never from a stream.
function dressTalus(q){
 const T=THREE,geo=new T.IcosahedronGeometry(1,0),L=layer('rock.stack');
 BIO.def('talusblock',geo,BIO.solidMat(L.map),{label:'Fallen sandstone (the debris slope)'});
 const TINT=[0xb5643f,0x9c5236,0xc98468,0x8a4a30,0xa85a3a].map(h=>new T.Color(h)),E=new T.Euler(),CELL=6,ext=900;
 let n=0;BIO.cur='pinnacle/talus';
 for(let i=-ext/CELL;i<ext/CELL;i++)for(let j=-ext*1.1/CELL;j<ext*1.1/CELL;j++){
  const h=KRAND.hash(911,i,j),u=k=>KRAND.unit(KRAND.hash(h,k));
  const x=(i+u(1))*CELL,z=(j+u(2))*CELL,fd=NECANYONS.footD(x,z);if(!(fd>1.5&&fd<TALUS.w-10))continue;
  const s=1-fd/TALUS.w,p=(.12+.5*s*s)*q;if(u(3)>p)continue;
  if(PR.inFarms(x,z)&&fd>TALUS.w*.6)continue;   // the farms' inner edge stays clear
  const r=(.6+u(4)*(1.2+7*s*s))*(u(5)<.06*s?1.8:1),y=terrainH(x,z);
  E.set((u(6)-.5)*.8,u(7)*TAU,(u(8)-.5)*.8);const qt=new T.Quaternion().setFromEuler(E);
  BIO.put('talusblock',[x,y+r*.25,z],qt,[r*(.8+.5*u(9)),r*(.45+.35*u(10)),r*(.8+.5*u(11))],TINT[KRAND.hash(h,12)%TINT.length]);n++;}
 BIO.cur=null;return n;}
