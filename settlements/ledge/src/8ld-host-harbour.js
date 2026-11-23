// ================================================================= HOST — the harbour: the landing stage, its stairs, the boats to Nulab
// [draw] The Ancients' mole stands at the apron's height, 15 m over the lake (KNOWN_ISSUES.md, 2026-11-17). Dalab's harbour is the
// landing stage along its east side, 1.5 m over the water, reached from the mole's top by three stairs cut down its face, and the
// lake boats (sail and oar: PLAN.md 4.3, the day's crossing to Nulab) moored along it. Placed from the mole's record; KRAND by id.
const LHARBOUR=(function(){const L=LEDGE_LAYOUT,G=L.ground,W=L.world,dr=(id,i,salt)=>LEDGE.draw(W,id,i,salt),box=LB.box;
 const mole=L.parts.find(p=>p.id==='foot_mole');if(!mole)return null;
 const HG=new THREE.Group();HG.name='the harbour';scene.add(HG);
 const s=mole.shape,x1=s[2],z0=s[3],z1=s[4],top=mole.y,stage=G.lake+1.5,sx0=x1,sx1=x1+12;
 // the stage: from the lake's bed to 1.5 m over the water, 12 m wide, the mole's length less its root
 const bed=Math.min(LEDGE_H(sx1,z0+20),LEDGE_H(sx1,z1))-.5;
 box('panel',(sx0+sx1)/2,(bed+stage)/2,(z0+20+z1)/2,sx1-sx0,stage-bed,z1-z0-20);
 // three stairs down the mole's east face to the stage, each a flight of 20 steps running along the mole
 const rise=(top-stage)/20;
 [z0+50,z0+130,z0+210].forEach(zs=>{for(let k=0;k<20;k++){const h=top-stage-k*rise;box('panel',x1+2,stage+h/2,zs+k*.8+.4,4,h,.8);}});
 // bollards along the stage's edge
 for(let z=z0+30;z<z1-6;z+=16)box('rust',sx1-.8,stage+.5,z,.7,1,.7);
 // the boats: a hull, a deckhouse, a mast with its yard and furled sail; moored 3 m off the stage, by KRAND
 let n=0;for(let z=z0+40;z<z1-20;z+=34){if(dr('foot_mole',n,1)<.2){n++;continue;}
  const len=11+5*dr('foot_mole',n,2),bx=sx1+3+1.8,bz=z+(dr('foot_mole',n,3)-.5)*6;
  box('timber',bx,G.lake+.3,bz,3.6,1.8,len);
  box('timber',bx,G.lake+.6,bz+len/2+1,2.2,1.2,2.2,{q:new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/4)});
  box('timber',bx,G.lake+1.8,bz-len*.25,2.6,1.4,3.2);
  const mh=8+3*dr('foot_mole',n,4);box('timber',bx,G.lake+1.2+mh/2,bz+len*.12,.25,mh,.25);
  box('timber',bx,G.lake+1.2+mh*.86,bz+len*.12,5.6,.18,.18);box('canvas',bx,G.lake+1.2+mh*.86-.35,bz+len*.12,5.2,.5,.5);
  n++;}
 const mats=Object.assign({},LMAT,{timber:MAT.timber||LMAT.ochre,canvas:new THREE.MeshStandardMaterial({color:0xd8cdb0,roughness:1})});
 const meshes=LB.flush(HG,mats,'the harbour (the landing stage, its stairs, the lake boats)');
 return {group:HG,meshes,boats:n};})();
