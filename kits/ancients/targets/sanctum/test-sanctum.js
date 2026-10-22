// node kits/ancients/targets/sanctum/test-sanctum.js — the Sanctum's plan, in node (no browser): it is [G data], so it
// must run here as it runs in the page, and as a Godot port would read it. The owner's form (2026-10-22) is the spec.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..','..');
const ctx={Math,console};vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','kits/ancients/targets/sanctum/8ar0-sanctum-plan.js'])
 vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;this.SANCTUM=typeof SANCTUM!=="undefined"?SANCTUM:this.SANCTUM;',ctx,{filename:f});
const C=ctx.SANCTUM,D=C.DIM;let fails=0;
const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
const P=C.plan();
ok(JSON.stringify(P)===JSON.stringify(C.plan()),'the plan is deterministic');
ok(JSON.stringify(P)!==JSON.stringify(C.plan({seed:1})),'another seed moves the garden');
/* the mass: between Plymouth's 45.8 Mm3 and Hexahedron's (two pyramids of 480 and 320 m on a 1 km triangle, about 85) */
ok(P.vol>45.8e6&&P.vol<85e6,'the volume is between Plymouth and Hexahedron ('+(P.vol/1e6).toFixed(1)+' Mm3)');
const sol=(D.RS*D.RS*3*Math.sqrt(3)/2)*(D.YS1-D.YS0),pod=(D.RP*D.RP*3*Math.sqrt(3)/2)*D.YP;
ok(sol>pod&&sol>P.vol/2,'the solid is most of the mass ('+Math.round(100*sol/P.vol)+'% of the envelope)');
ok(D.YP===6*D.SH,'the podium is six storeys');
ok(Math.abs(D.RK/D.RP-1/6)<1e-9,'the stalk is a sixth of the podium\'s width');
ok(Math.abs(D.RS/D.RP-2/3)<1e-9,'the solid is two thirds of the podium\'s width');
/* the solid's corners over the middles of the podium's faces: its corner directions are the podium's face normals */
const cs=[0,1,2,3,4,5].map(k=>Math.PI/6+k*Math.PI/3),fp=[0,1,2,3,4,5].map(C.FACE_P);
ok(cs.every((a,i)=>Math.abs(a-fp[i])<1e-9),'the solid\'s corners align with the middles of the podium\'s faces');
ok(P.gates.length===6&&P.atria.length===6&&P.wells.length===6,'six gates, six atria, six light wells');
ok(P.add.filter(a=>a.kind==='head'&&/gate/.test(a.id)).length===6,'a face sculpture over every gate');
/* each atrium open to the sky: none of its corners under the solid; each behind its gate's passage */
ok(P.atria.every(A=>C.hex(A.c[0],A.c[1],A.R,A.th+Math.PI/6).every(q=>!C.inSolid(q[0],q[1],0))),'every atrium is open to the sky (outside the solid\'s plan)');
const apP=D.RP*Math.cos(Math.PI/6);
ok(P.atria.every(A=>Math.abs(D.ATC+D.ATR*Math.cos(Math.PI/6)+D.GATED-apP)<.5),'every gate\'s passage runs from the face to its atrium');
/* the wells pierce the solid: inside its plan with a wall to spare; none over the stalk */
ok(P.wells.every(W=>C.hex(W.c[0],W.c[1],W.R,W.th+Math.PI/6).every(q=>C.inSolid(q[0],q[1],12))),'every light well is inside the solid with 12 m of wall to spare');
ok(P.wells.every(W=>Math.hypot(W.c[0],W.c[1])-W.R>D.RK),'no well over the stalk');
ok(P.corners.length===6&&P.corners.every(c=>C.inSolid(c.c[0],c.c[1],c.R0+2)),'six corner towers on the roof, inside its edge');
ok(P.corners.every(c=>P.wells.every(W=>Math.hypot(c.c[0]-W.c[0],c.c[1]-W.c[1])>W.R+c.R0)),'no corner tower over a well');
const trees=P.add.filter(a=>a.kind==='tree');
ok(trees.length>100,'the garden is planted ('+trees.length+' trees)');
ok(trees.every(t=>!P.wells.some(W=>C.inHex(t.at[0],t.at[2],W.c[0],W.c[1],W.R,W.th))),'no tree in a well');
ok(trees.filter(t=>t.at[1]===D.YP).every(t=>!P.atria.some(A=>C.inHex(t.at[0],t.at[2],A.c[0],A.c[1],A.R,A.th))),'no tree in an atrium');
const ids=new Set();let dup=0,bad=0;
for(const a of P.add.concat(P.gates,P.atria,P.wells,P.bands,P.windows,P.corners)){if(ids.has(a.id))dup++;ids.add(a.id);if(a.at&&a.at.some(v=>!isFinite(v)))bad++;}
ok(dup===0&&bad===0,'ids unique ('+ids.size+'), positions finite');
console.log(fails?fails+' failed':'all passed');process.exit(fails?1:0);
