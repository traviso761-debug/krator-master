// ---------- Lake Atitlán: the lake's own landmark models ----------
// The churches are Antigua's `iglesia` (src/antigua/landmarks.js, the colonial kind every town here has, whitewashed);
// this adds what Antigua has not (the docks are the map's own piers, which the engine draws):
//   torre    the Torre Centroamericana in Sololá's plaza (1914): a slender tower in four stages, its clock in the
//            third, a small dome on top
//   cross    a hilltop cross: the one on the Cerro de Oro, over Santiago's bay
// Map data (c) OpenStreetMap contributors, ODbL.
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,gh}=api;
  const {Model,turn}=landkit(api,{deck:0x8a6a4a,deckDark:0x5a4230,pile:0x4a3a2c,concrete:0xb4aea2,lamina:0x8a8e94,booth:0x2a7ab8,white:0xeeeae0,cream:0xe8dcb8,
    stoneGrey:0xa8a49a,blueTrim:0x2a5aa8,dark:0x2a2620,gold:0xcaa13c,dome:0xc8c4bc});
  return {
  torre(L,x,z){const g0=gh(x,z),M=Model(),S=L.side||4.4,H=L.height||24;
    M.box('stoneGrey',0,0,0,S+1.4,1.2,S+1.4);M.box('cream',0,1.2,0,S,H*0.38,S);M.box('blueTrim',0,1.2+H*0.38,0,S+0.4,0.4,S+0.4);
    M.box('cream',0,1.6+H*0.38,0,S*0.86,H*0.28,S*0.86);M.box('blueTrim',0,1.6+H*0.66,0,S*0.9,0.35,S*0.9);
    const cy=2+H*0.66;M.box('white',0,cy,0,S*0.74,H*0.2,S*0.74);
    for(const [ax,az,a] of [[0,1,0],[1,0,Math.PI/2],[0,-1,Math.PI],[-1,0,-Math.PI/2]]){M.put('white',new THREE.CylinderGeometry(1.05,1.05,0.1,20).rotateX(Math.PI/2),ax*(S*0.37+0.06),cy+H*0.1,az*(S*0.37+0.06),a);
      M.put('dark',new THREE.CylinderGeometry(0.92,0.92,0.11,20).rotateX(Math.PI/2),ax*(S*0.37+0.08),cy+H*0.1,az*(S*0.37+0.08),a);
      M.put('gold',new THREE.BoxGeometry(0.07,0.7,0.03).translate(0,0.3,0),ax*(S*0.37+0.15),cy+H*0.1,az*(S*0.37+0.15),a,0,0.5);   // the hand
      // the windows of the lower stages, tall and arched
      for(const yy of [4,4+H*0.3])M.box('dark',ax*(S/2+0.02)*(yy>4?0.86:1),yy,az*(S/2+0.02)*(yy>4?0.86:1),ax?0.04:0.9,2.6,ax?0.9:0.04);}
    M.box('blueTrim',0,cy+H*0.2,0,S*0.8,0.3,S*0.8);M.put('dome',new THREE.SphereGeometry(S*0.36,14,8,0,Math.PI*2,0,Math.PI/2),0,cy+H*0.2+0.3,0);
    M.cyl('gold',0,cy+H*0.2+0.3+S*0.36,0,0.06,0.06,1.4,6);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  cross(L,x,z){const g0=gh(x,z),M=Model(),H=L.h||10;M.box('stoneGrey',0,0,0,3,1.2,3);M.box('white',0,1.2,0,0.8,H,0.8);M.box('white',0,1.2+H*0.66,0,4,0.8,0.8);
    return M.finish(L,x,g0,z,turn(L.face||0));},
  };
}
