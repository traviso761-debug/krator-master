// prefix: res
// ================================================================= THE MINED GOODS' NODES (1): the metals: lodestone (zinc is 44r-res-nodes.js's)
// The kinds are 42s-res-ore-mined.js (Gemini's trade model, 2026-11-16); drawn as 44r-res-nodes.js draws, with its helpers
// (resOutcrop, resLoose, resK, resC) and the same def body (resNodeDef). Vertex colours where the library has no set yet:
// rock.sphalerite and rock.magnetite are owed (core/materials/PROMPTS-NEEDED.md sections 51 and 59).
//   zinc        (merged into main 2026-11-18: main's own zinc node, 44r-res-nodes.js, the galvanic biome's, is the one drawn;
//               this file's take, below in words only, was dropped so the kit has one zinc) the dark outcrop banded with resinous brown-black sphalerite (blackjack), honey-yellow where it is thin,
//               a streak of galena beside it (they come out together), a pale blue-white calamine crust on the tops where
//               the ore has weathered (smithsonite, hemimorphite)
//   lodestone   a crest of rounded black magnetite boulders, iron filings bristling in tufts where the field is strongest,
//               a fulgurite of fused glass across the big one where the lightning struck (the Arch, biomes/arch/PLAN.md
//               section 1: Earth's lodestones are lightning-struck magnetite); the Compass Hills' ore is the same stone
RES_LOOK.lodestone={vein:[0x1a1a1c,0x242426,0x2e2c2a],lump:0x16161a,pile:0x3a3634,glass:0xc8b48a};
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
{const node0=resNode;resNode=function(kind,grade){const G=RES_ORE.grades[grade];if(kind==='lodestone')return resLodestone(G.size,G.rank);return node0(kind,grade);};}
Object.assign(RES_NAME,{lodestone:'Lodestone'});Object.assign(RES_H,{lodestone:.42});
defBuilding({key:'node-lodestone-low',seed:6710,...resNodeDef('lodestone','low')});
defBuilding({key:'node-lodestone-medium',seed:6711,...resNodeDef('lodestone','medium')});
defBuilding({key:'node-lodestone-high',seed:6712,...resNodeDef('lodestone','high')});
