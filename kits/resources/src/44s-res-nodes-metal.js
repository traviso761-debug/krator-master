// prefix: res
// ================================================================= THE MINED GOODS' NODES (1): the two metals, zinc and lodestone
// The kinds are 42s-res-ore-mined.js (Gemini's trade model, 2026-11-16); drawn as 44r-res-nodes.js draws, with its helpers
// (resOutcrop, resLoose, resK, resC) and the same def body (resNodeDef). Vertex colours where the library has no set yet:
// rock.sphalerite and rock.magnetite are owed (core/materials/PROMPTS-NEEDED.md sections 51 and 53).
//   zinc        the dark outcrop banded with resinous brown-black sphalerite (blackjack), honey-yellow where it is thin,
//               a streak of galena beside it (they come out together), a pale blue-white calamine crust on the tops where
//               the ore has weathered (smithsonite, hemimorphite)
//   lodestone   a crest of rounded black magnetite boulders, iron filings bristling in tufts where the field is strongest,
//               a fulgurite of fused glass across the big one where the lightning struck (the Arch, biomes/arch/PLAN.md
//               section 1: Earth's lodestones are lightning-struck magnetite); the Compass Hills' ore is the same stone
RES_LOOK.zinc={vein:[0x2a1e16,0x3e2c1e,0xb8862e],lump:0x241a14,pile:0x5a4a3c,host:[0x4a463e,0x3e3a34],crust:[0xdfe8e4,0xb8d4d8,0xe8ece4]};
RES_LOOK.lodestone={vein:[0x1a1a1c,0x242426,0x2e2c2a],lump:0x16161a,pile:0x3a3634,glass:0xc8b48a};
function resZinc(S,rich){const L=RES_LOOK.zinc;
 resOutcrop(S,rich,(i,bw,bh,bd)=>{const nb=1+rich+(i%2);
  for(let k=0;k<nb;k++){const side=k%2?1:-1,y=bh*rr(.2,.8),th=.04*S*(1+rich*.35);
   box('plain',0,y,side*(bd/2+.006),bw*rr(.6,.95),th,.012,L.vein[k%2]);
   for(let f=0;f<2+rich*2;f++){const q=rr(.012,.026)*S;box('glass',rr(-.4,.4)*bw,y+rr(.1,.8)*th,side*(bd/2+.014),q,q*.8,.008,L.vein[2]);}
   if(k===0){const gk=resK('galena','iron');box(gk,0,y+th,side*(bd/2+.008),bw*rr(.35,.6),th*.4,.012,resC(gk,0x9ca0a8));}}
  box('plain',0,bh,0,bw*rr(.55,.85),.01,bd*rr(.55,.85),L.crust[i%3]);},{col:i=>L.host[i%2]});
 resLoose(S,rich*7,[L.pile,L.lump,L.crust[0]],'plain');}
function resLodestone(S,rich){const L=RES_LOOK.lodestone,nb=3+rich*2,ang=rr(0,TAU);let big=null;
 for(let i=0;i<nb;i++){const a=ang+i/nb*TAU*.8+rr(-.2,.2),r=i?rr(.22,.5)*S:0,rx=(i?rr(.12,.2):.28)*S,ry=rx*rr(.55,.7),rz=rx*rr(.75,.95),x=Math.cos(a)*r,z=Math.sin(a)*r,yw=i?rr(0,TAU):0;
  ellip('stone',x,ry*.35,z,rx,ry,rz,L.vein[i%3],yw,12);
  /* the filings: tufts of fine needles on the boulder's crown, leaning out */
  const nt=2+rich*2;for(let t=0;t<nt;t++){const ta=rr(0,TAU),tr=rr(.15,.55),tx=x+Math.cos(ta)*rx*tr*.8,tz=z+Math.sin(ta)*rz*tr*.8,ty=ry*.35+ry*Math.sqrt(Math.max(0,1-tr*tr))*.92;
   for(let n=0;n<5+rich*2;n++)WX(tx+rr(-.015,.015)*S,ty,tz+rr(-.015,.015)*S,ta,rr(-.45,.45)*tr,rr(-.45,.45),()=>cone('iron',0,0,0,.004*S,rr(.02,.045)*S,0x3a3632,4));}
  if(!i)big={x:x,z:z,rx:rx,ry:ry};}
 /* the fulgurite: a branched streak of fused glass on the big boulder's crown */
 {const top=big.ry*1.35-.01*S;W(big.x,top,big.z,rr(0,TAU),()=>{box('glass',0,0,0,big.rx*.6,.008*S,.018*S,L.glass);
  for(let b=0;b<1+rich;b++)box('glass',rr(-.15,.15)*big.rx,-.004*S,.02*S,big.rx*.3,.008*S,.014*S,L.glass,rr(.5,.9));});}
 resLoose(S,3+rich*5,[L.lump,L.pile],'iron');}
{const node0=resNode;resNode=function(kind,grade){const G=RES_ORE.grades[grade];if(kind==='zinc')return resZinc(G.size,G.rank);if(kind==='lodestone')return resLodestone(G.size,G.rank);return node0(kind,grade);};}
Object.assign(RES_NAME,{zinc:'Zinc ore',lodestone:'Lodestone'});Object.assign(RES_H,{zinc:.72,lodestone:.42});
defBuilding({key:'node-zinc-low',seed:6700,...resNodeDef('zinc','low')});
defBuilding({key:'node-zinc-medium',seed:6701,...resNodeDef('zinc','medium')});
defBuilding({key:'node-zinc-high',seed:6702,...resNodeDef('zinc','high')});
defBuilding({key:'node-lodestone-low',seed:6710,...resNodeDef('lodestone','low')});
defBuilding({key:'node-lodestone-medium',seed:6711,...resNodeDef('lodestone','medium')});
defBuilding({key:'node-lodestone-high',seed:6712,...resNodeDef('lodestone','high')});
