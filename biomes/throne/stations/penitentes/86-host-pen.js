// ================================================================= HOST — the penitentes and the rock steps (station 14, the lee's penitentes)
// The penitentes are the caldera station's item (86-host-caldera.js there): a blade of hard snow, wide across its row, thin along it, its
// crest blunt and notched, leaning a little to the noon sun. Here they fill the benches' treads where the field 'pen' is (47), in rows
// east-west (the sun carves them in lines), taller where the snow lies deepest; dense round the cameras, thinning out. On the rock steps,
// boulders fallen from the flows' fronts (the kit's stones). Nothing else: the kit's cold pass draws the lichen and the cushions (89z).
const SNOW_MAT=BIO.solidMat(null);
const PENS={penitentes:0,boulders:0};
BIO.def('penitente',(function(){const g=new THREE.CylinderGeometry(.16,.5,1,8,4);g.translate(0,.5,0);g.scale(1,1,.3);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),w=1+.12*Math.sin(x*11+y*3),top=y>.99?-.18*Math.abs(Math.sin(x*9)):0;p.setXYZ(i,x*w+.1*y*y,y+top,z*(1+.25*Math.sin(y*7)));}
 g.computeVertexNormals();return g;})(),SNOW_MAT,{label:'Penitentes (blades of hard snow)'});
(function(){reseed(14801);const L=BIO.LOD(),C3=c=>new THREE.Color(c);
 // in rows: a band every ~1.4 m (north-south), blades every ~0.9 m along it; the rows wander a little. Near the cameras only (on the caldera,
 // half a million blades was 28M triangles); the far treads keep the snow's own paint
 BIO.grid(5,0,TERR.R-150,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>L.floor[0]*.75)return 0;return smooth(.3,.7,FIELD.pen(x,z))*(ld<60?1:.15);},
  (x0,y0,z0)=>{const pk=FIELD.pen(x0,z0);for(let r=0;r<4;r++){const zr=z0-2.1+r*1.4+.25*Math.sin(x0*.07+r);for(let c=0;c<6;c++){if(rng()<.15)continue;const x=x0-2.5+c*.9+rr(-.2,.2),z=zr+rr(-.15,.15),y=terrainH(x,z);if(FIELD.pen(x,z)<.15||benchAt(x,z).riser>.5)continue;   /* a blade off the tread's snow is not drawn */
    const h=rr(.9,3.6)*(.5+.6*pk),w=rr(.9,1.25);BIO.put('penitente',[x,y-.12,z],qEuler(rr(-.05,.05),rr(-.1,.1),-.18+rr(-.06,.06)),[w,h,w],C3(0xf0f4f8).multiplyScalar(rr(.9,1.02)));PENS.penitentes++;}}},
  {patch:.35,patchScale:.02,pad:0,noMask:true});
 // the rock steps' boulders (the kit's stones, in its registry), at the foot of each front near the cameras
 {const prev=BIO.kit('throne'),cur=BIO.cur;BIO.cur='throne/floor';
  BIO.grid(14,0,TERR.R-150,(x,z)=>BIO.lodD(x,z)<L.mid?benchAt(x,z).riser*.5:0,(x,y,z)=>{const s=rr(.4,2.2);
   BIO.put('boulder',[x,y+s*.25,z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[s,s*rr(.55,.9),s],C3(pick([0x4a4644,0x3a3634,0x5a5450])));PENS.boulders++;},{patch:.5,patchScale:.02,pad:.5});
  BIO.cur=cur;BIO.kit(prev);}
 _mark('layout');})();
