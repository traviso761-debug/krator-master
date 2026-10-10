// Shiganshina: the walls and what stands on them, on the shared landmark kit (src/core/landkit.js). Fan work after
// Hajime Isayama's Attack on Titan; the geometry is this project's own.
//
//   walls    Wall Maria across the map and the district's own wall in its half-circle: fifty metres of stone, a little
//            battered, the walkway along the top with its parapet, the Garrison's cannon on their rails; the inner
//            gate and the outer gate (its great doors), the canal's arches through both
//   steeple  a church tower with its spire (the church on the market square)
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,animHooks,gh,nightF,hour}=api;
  const {Model,mat,turn}=landkit(api,{wallStone:0xb8ad98,wallDark:0x8e8472,wallTop:0xa89c86,iron:0x3a3a3c,wood:0x6a4a30,woodDark:0x4a3422,roofTile:0x8a3a2a,
    plaster:0xe8e0cc,timber:0x5a3e2a,slate:0x5a5e64});
  return {

  // ================================================================ the walls
  // One continuous wall: Wall Maria across the map, and the district's U out from it. Every run overlaps the next by
  // the wall's thickness and a tower stands on every corner, so nothing shows daylight; the gates have their doors and
  // the canal's arches their gratings, and the only way through is the one the Colossal Titan makes.
  walls(L,x,z){const M=Model(),S=api.OSM.shiganshina,H=S.wallH,T=S.wallT,G=S.gateW,CX=S.canalX,HX=S.hx,P=S.path,DR=S.distR,base=5;
    const courses=[6,12,18,24,30,36,42];
    const run=(ax,az,bx,bz,outer,opts={})=>{const L2=Math.hypot(bx-ax,bz-az);if(L2<0.5)return;const ry=-Math.atan2(bz-az,bx-ax),ux=(bx-ax)/L2,uz=(bz-az)/L2,mx=(ax+bx)/2,mz=(az+bz)/2,nx=-uz*outer,nz=ux*outer,LL=L2+T;
      M.put('wallStone',new THREE.BoxGeometry(LL,H+base,T+4).translate(0,(H+base)/2,0),mx,-base,mz,ry);
      M.put('wallDark',new THREE.BoxGeometry(LL,7,T+9).translate(0,3.5,0),mx,-base,mz,ry);                                   // the footing
      for(const cy of courses)for(const sd of [-1,1])M.put('wallDark',new THREE.BoxGeometry(LL,0.35,0.3),mx+nx*sd*(T/2+2.1),cy,mz+nz*sd*(T/2+2.1),ry);   // the courses, both faces
      M.put('wallTop',new THREE.BoxGeometry(LL,1.5,1.2).translate(0,0.75,0),mx+nx*(T/2+1.4),H,mz+nz*(T/2+1.4),ry);               // the outer parapet
      M.put('wallTop',new THREE.BoxGeometry(LL,1.0,0.8).translate(0,0.5,0),mx-nx*(T/2+1.6),H,mz-nz*(T/2+1.6),ry);                // the inner rail
      M.put('iron',new THREE.BoxGeometry(LL,0.25,0.4),mx+nx*(T/2-2.6),H+0.15,mz+nz*(T/2-2.6),ry);                                // the cannons' rail
      for(let u=opts.from||40;u<L2-20;u+=150){const px=ax+ux*u,pz=az+uz*u;M.box('wallStone',px+nx*(T/2+4),-base,pz+nz*(T/2+4),9,H+base-3,6,ry);   // a buttress
        const gx=px+nx*(T/2-1),gz=pz+nz*(T/2-1);M.box('wood',gx,H,gz,1.8,0.6,2.4,ry);M.put('iron',new THREE.CylinderGeometry(0.35,0.5,4.4,8).rotateZ(Math.PI/2).rotateY(-Math.atan2(nz,nx)),gx+nx*1.6,H+1.3,gz+nz*1.6);}};
    const tower=(tx,tz,w=18)=>{M.box('wallStone',tx,-base,tz,w,H+base+3,w);M.box('wallTop',tx,H+3,tz,w+1,1.4,w+1);};
    // Wall Maria: west and east of the district, and across its mouth with the inner gate and the canal's arch
    const W=S.distW;
    run(-HX-300,0,-W,0,1);run(W,0,HX+300,0,1);
    run(-W,0,-G/2-8,0,1);run(G/2+8,0,CX-15,0,1);run(CX+15,0,W,0,1);
    // the district's U, run by run along its line; the outer gate's opening left where the line crosses x = 0
    for(let i=0;i+1<P.length;i++){const [ax,az]=P[i],[bx,bz]=P[i+1],mx=(ax+bx)/2;if(Math.abs(mx)<G/2+6&&az>S.distL)continue;run(ax,az,bx,bz,-1);}
    for(const p of [P[0],P[1],P[P.length-2],P[P.length-1]])tower(p[0],p[1],22);                                            // the corners, and the joins to Wall Maria
    // the gates: towers either side, the lintel over the opening, the winch house on top
    const gate=(gx,gz,ry,front)=>{const c=Math.cos(ry),sn=Math.sin(ry);for(const sd of [-1,1])M.box('wallStone',gx+c*sd*(G/2+9),-base,gz-sn*sd*(G/2+9),18,H+base+4,T+12,ry);
      M.box('wallStone',gx,32,gz,G+4,H-32,T+8,ry);M.box('wallTop',gx,H+4,gz,G+36,1.4,T+14,ry);
      M.box('wood',gx,H+5.4,gz,14,6,10,ry);M.cyl('roofTile',gx,H+11.4,gz,9,0.4,5,4,ry+Math.PI/4);                             // the winch house and its roof
      for(const sd of [-1,1])M.put('iron',new THREE.BoxGeometry(0.3,22,0.3),gx+c*sd*(G/2-2),20,gz-sn*sd*(G/2-2)+front*(T/2+4.5));}; // the chains
    gate(0,0,0,1);
    // the inner gate's doors are part of the wall; the outer gate's are their own mesh (the Colossal Titan breaks them)
    M.box('woodDark',0,0,1,G,32,1.8);for(let k=0;k<6;k++)M.box('iron',0,3+k*5,2.1,G,0.6,0.5);
    gate(0,DR,0,-1);
    // the canal's arches: the wall over the water, the grating under it
    for(const [cx,cz,ry] of [[CX,0,0],[CX,S.canalOut,0]]){M.box('wallStone',cx,9,cz,32,H-9,T+6,ry);M.box('wallDark',cx,8,cz,30,1.2,T+7,ry);for(let u=-6;u<=6;u+=1.5)M.box('iron',cx+u,0,cz+(cz?1:-1)*(T/2+2.6),0.3,8,0.3);M.box('iron',cx,4,cz+(cz?1:-1)*(T/2+2.6),15,0.3,0.3);}
    // the lifts up the inside of the district's wall: a frame, a cage, the rope
    for(const [lx,lz,ry] of [[-W+T/2+6,300,Math.PI/2],[W-T/2-6,420,Math.PI/2],[-300,DR-S.distW*0.16,0]]){M.box('wood',lx,0,lz,0.6,H+3,0.6);M.box('wood',lx+(ry?0:3.6),0,lz+(ry?3.6:0),0.6,H+3,0.6);
      M.box('woodDark',lx+(ry?0:1.8),18,lz+(ry?1.8:0),3.2,3,3.2);M.box('iron',lx+(ry?0:1.8),21,lz+(ry?1.8:0),0.1,H-19,0.1);}
    const g=M.finish(L,x,0,z,0);
    const doors=new THREE.Mesh(new THREE.BoxGeometry(G,32,2),new THREE.MeshLambertMaterial({color:0x5a3e28}));doors.position.set(x,16,z+DR-T/2-3);doors.castShadow=true;api.scene.add(doors);
    api.WALLS={doors,outerGate:[x,z+DR]};return g;},

  // ================================================================ a church tower and spire
  steeple(L,x,z){const g0=gh(x,z),M=Model(),S=L.side||8,T=L.tower||26,H=L.towerH||46;
    M.box('plaster',0,0,0,S,T,S);for(const s of [-1,1])M.box('timber',s*(S/2+0.05),0,0,0.3,T,S*0.9);M.box('timber',0,T*0.5,0,S+0.2,0.4,S+0.2);
    M.box('iron',S/2+0.06,T-6,0,0.1,2.2,1.4);M.cyl('slate',0,T,0,S*0.62,0.1,H-T,4,Math.PI/4);M.box('iron',0,H-0.4,0,0.15,2.4,0.15);M.box('iron',0,H+0.6,0,0.15,0.15,1.2);
    return M.finish(L,x,g0,z,turn(L.face||0));},
  };
}
