// Antigua: the buildings that are shapes rather than heights, on the shared landmark kit (src/core/landkit.js),
// each placed from its entry in antigua.json. Antigua's churches are Earthquake Baroque: squat, thick-walled, the
// towers short and the façades wide, a retablo of white stucco on yellow or ochre limewash, so that what the
// tremors leave standing still stands. Half of them did not: the ruins are roofless naves, the vaults fallen in.
//
//   iglesia    a colonial church: its nave (len x w x h) under a barrel-vault roof, a dome on a drum over the crossing,
//              the façade (wall colour `colour`) carrying a retablo of white stucco in tiers, two squat bell towers
//              with cupolas (towers: 0, 1 or 2), all turned to face `face` (bearing). ruin: true takes off the
//              roof and the vaults, breaks the wall tops and leaves the façade standing (the Cathedral behind its
//              rebuilt front, La Recolección, San Francisco's nave); facade: false leaves only
//              (lace: true covers the front and the towers' fronts in white stucco relief, as La Merced's)
//              the broken walls, for the ruin behind a rebuilt front
//   arco       the Arco de Santa Catalina (1694): a yellow arch across 5a Avenida Norte, the clock in its lantern,
//              which the nuns crossed from one half of their convent to the other unseen
//   arcade     a two-storey arcade along a square: the Palacio de los Capitanes Generales and the Ayuntamiento
//   sirenas    the Fuente de las Sirenas in the Plaza Mayor (1739): four mermaids round a basin, water from their breasts
//   cruz       the great cross on the Cerro de la Cruz, over the town, with Agua behind it
//   tanque     the Tanque de la Unión: the public washing basins under their arcade, beside the park
//   capuchinas Las Capuchinas' round cloister, the Torre del Retiro: a ring of cells round a well
//
// Map data (c) OpenStreetMap contributors, ODbL. The geometry here is this project's own.
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,gh}=api;
  const {Model,turn,archPanel}=landkit(api,{yellow:0xe0b03a,ochre:0xc89040,rose:0xc87a6a,white:0xf2ede2,limewash:0xece4d0,ruinStone:0x8e8270,ruinDark:0x6e6456,
    clayTile:0xa8583a,domeWhite:0xe6e0d2,dark:0x2a231e,wood:0x5a3e26,ironDark:0x24221e,clockFace:0xf4efe2,grass:0x5f7a3a,waterBlue:0x2f6a78,moss:0x5a6a40});
  const tone=L=>L.colour||'yellow';
  // a barrel vault along x (ry turns it): w long, d across, rising h
  const vault=(M,k,x,y,z,w,d,h,ry=0)=>M.put(k,M.cached('v'+w+','+d+','+h,()=>new THREE.CylinderGeometry(d/2,d/2,w,14,1,false,0,Math.PI).rotateZ(Math.PI/2).scale(1,h/(d/2),1)),x,y,z,ry);
  // the retablo: a façade's white stucco - pilasters in tiers, cornices, niches with their saints, the window - on a wall
  // `wall` wide and `H` high, its face at z = zf (facing +z)
  function retablo(M,wall,H,zf,tiers=3){const tierH=H/tiers;
    for(let t=0;t<tiers;t++){const y=t*tierH,wT=wall*(1-t*0.18);
      M.box('white',0,y+tierH-0.6,zf+0.3,wT,0.6,0.7);                                              // the cornice of each tier
      for(const s of [-1,1])for(const p of [0.18,0.38]){M.box('white',s*wT*p,y,zf+0.22,0.9,tierH-0.6,0.45);   // paired pilasters, encrusted
        for(let b=0.8;b<tierH-1;b+=1.6)M.box('white',s*wT*p,y+b,zf+0.46,1.1,0.3,0.2);}
      for(const s of [-1,1]){M.box('dark',s*wT*0.28,y+tierH*0.3,zf+0.12,1.2,tierH*0.45,0.2);M.box('limewash',s*wT*0.28,y+tierH*0.3,zf+0.24,0.6,tierH*0.35,0.3);}}   // the niches and their saints
    M.put('dark',archPanel(4,6.5,0.3,3,4),0,0,zf+0.1);M.box('wood',0,0,zf+0.02,3,5.2,0.2);          // the door in its arch
    M.cyl('dark',0,tierH*1.4,zf+0.1,1.1,1.1,0.25,12);                                              // the choir window over it
    M.pediment('white',0,H,zf+0.2,wall*0.45,H*0.12,0.6);}

  return {

  // ================================================================ a colonial church
  iglesia(L,x,z){const g0=gh(x,z),M=Model(),k=tone(L),LEN=L.len||60,W=L.w||16,H=L.h||14,FH=L.facadeH||H+6,FW=L.facadeW||W+8,ruin=!!L.ruin;
    // built along z, its front at +z (the turn points that at L.face)
    const walls=ruin?'ruinStone':k,zf=LEN/2;
    // the nave: the side walls with their buttresses (stepped, broad: the tremors' answer) and, unless ruined, the vault
    for(const s of [-1,1]){
      if(ruin){for(let u=-LEN/2;u<LEN/2-4;u+=4){const h=H*(0.45+0.55*Math.abs(Math.sin(u*1.7+s)));M.box('ruinStone',s*(W/2-0.9),0,u+2,1.8,h,4);}}   // broken to every height
      else M.box(walls,s*(W/2-0.9),0,0,1.8,H,LEN);
      for(let u=-LEN/2+6;u<LEN/2-3;u+=8){M.box(walls,s*(W/2+0.9),0,u,1.8,H*0.8,2.4);M.box(walls,s*(W/2+2),0,u,1.2,H*0.45,2.4);}}
    M.box(walls,0,0,-LEN/2+0.9,W,ruin?H*0.6:H,1.8);                                                    // the apse wall
    if(!ruin){M.box(k,0,H-0.2,0,W,0.4,LEN);vault(M,'limewash',0,H,0,LEN-2,W,W*0.22,Math.PI/2);
      if(L.dome!==false){const dz=-LEN/2+W*0.9;M.cyl(k,0,H,dz,W*0.36,W*0.36,W*0.3,16);M.dome('domeWhite',0,H+W*0.3,dz,W*0.36,0.95);M.cyl('domeWhite',0,H+W*0.3+W*0.34,dz,1,0.9,2.4,8);}}
    else for(let i=0;i<14;i++){const u=(i/14-0.5)*LEN*0.8,sx=(i%2?1:-1)*W*0.2;M.box('ruinDark',sx,0,u,2+(i*7)%3,1+i%2,2+i%3);}         // the vault, fallen into the nave
    // the façade: wider and taller than the nave, the retablo on it, the bell towers at its corners
    if(L.facade===false){M.box(walls,0,0,zf-0.9,W,H*0.7,1.8);return M.finish(L,x,g0,z,turn(L.face||0));}   // a ruin behind another front: its west wall only
    M.box(k,0,0,zf-1.2,FW,FH,2.4);retablo(M,FW*0.7,FH,zf,L.tiers||3);
    // lace: La Merced's front is covered in white stucco, ataurique, every space between the pilasters - a lattice
    // of small reliefs, a checker of them, over the façade and up the fronts of the towers
    if(L.lace){const TW=(L.towers===0?[]:L.towers===1?[1]:[-1,1]).map(s2=>s2*(FW/2-2.5)),TH=FH+(L.towerH||7);
      const D=M.cached('lace',()=>new THREE.BoxGeometry(0.34,0.34,0.12).rotateZ(Math.PI/4));   // a diamond of stucco
      for(let y=0.9;y<TH-0.6;y+=0.55)for(let x=-FW/2+0.7;x<FW/2-0.5;x+=0.55){if(((Math.round(x/0.55)+Math.round(y/0.55))&1))continue;
        const onTower=TW.some(tx=>Math.abs(x-tx)<2.7);if(y>FH-0.3&&!onTower)continue;if(Math.abs(x)<2.6&&y<7)continue;   // above the façade only the towers; not over the door
        M.put('white',D,x,y,zf+0.03);}}
    for(const s of (L.towers===0?[]:L.towers===1?[1]:[-1,1])){const tx=s*(FW/2-2.5),TH=FH+(L.towerH||7);
      M.box(k,tx,0,zf-3,6,TH,6);M.box('white',tx,TH,zf-3,6.6,0.6,6.6);
      for(const [a,b] of [[0,1],[1,0],[-1,0]])M.put('dark',archPanel(2,3,0.2,1.4,1.8),tx+a*3.05,TH-5,zf-3+b*3.05,a?Math.PI/2:0);    // the bell openings
      M.box(k,tx,TH+0.6,zf-3,4.6,3,4.6);M.dome('domeWhite',tx,TH+3.6,zf-3,2.4,1);M.cyl('ironDark',tx,TH+6,zf-3,0.1,0.1,2,4);}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Arco de Santa Catalina
  arco(L,x,z){const g0=gh(x,z),M=Model(),W=L.w||14,D=5.5,H=11,AW=6,AS=5.4;
    // the arch across the street (the street runs along the model's z); the passage above it, the clock lantern
    M.put('yellow',archPanel(W,H,D,AW,AS),0,0,0,0);
    M.box('white',0,H-0.6,0,W+0.4,0.6,D+0.4);M.box('white',0,AS+AW/2+0.2,D/2+0.05,AW+1.2,0.5,0.25);
    for(const s of [-1,1]){M.box('white',s*(AW/2+0.7),0,D/2+0.05,0.7,AS+AW/2,0.3);M.box('white',s*(AW/2+0.7),0,-D/2-0.05,0.7,AS+AW/2,0.3);}
    for(const s of [-1,1])M.box('dark',s*W*0.32,H-3.4,D/2+0.02,1.1,1.8,0.1);                      // the passage's windows
    M.put('clayTile',new THREE.CylinderGeometry(D*0.5,D*0.5,W+0.4,12,1,false,0,Math.PI).rotateZ(Math.PI/2).scale(1,0.3,1),0,H,0);
    M.box('yellow',0,H,0,3.6,4.6,3.6);M.box('white',0,H+4.6,0,4,0.4,4);                            // the lantern
    for(const s of [-1,1]){M.put('clockFace',new THREE.CylinderGeometry(1.1,1.1,0.12,20).rotateX(Math.PI/2),0,H+2.4,s*1.86);M.box('dark',0,H+2.4,s*1.93,0.08,0.8,0.05);}
    M.put('dark',archPanel(1.6,2.4,0.2,1,1.2),1.85,H+0.2,0,Math.PI/2);M.put('dark',archPanel(1.6,2.4,0.2,1,1.2),-1.85,H+0.2,0,Math.PI/2);
    M.dome('yellow',0,H+5,0,1.8,1.1);M.cyl('ironDark',0,H+7,0,0.08,0.08,1.6,4);M.box('ironDark',0,H+8.1,0,0.8,0.08,0.08);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ an arcade along a square
  arcade(L,x,z){const g0=gh(x,z),M=Model(),N=L.bays||16,B=L.bay||5.6,LEN=N*B,D=L.d||14,k=tone(L),two=L.storeys!==1;
    const SH=6.2;M.box(k,0,0,-D/2,LEN,two?SH*2+1.2:SH+1.2,D-4.5);
    for(let i=0;i<N;i++){const u=-LEN/2+B*(i+0.5);M.put('white',archPanel(B,SH,0.9,B-1.4,3.6),u,0,0);if(two)M.put('white',archPanel(B,SH,0.9,B-1.4,3.6),u,SH+0.6,0);}
    M.box('white',0,SH,0,LEN,0.6,1.2);if(two)M.box('white',0,SH*2+0.6,0,LEN,0.6,1.4);
    M.box('limewash',0,0.02,-2.2,LEN,0.1,4.2);                                                     // the gallery's floor
    if(L.roof!==false)M.put('clayTile',new THREE.CylinderGeometry(1,1,LEN,4,1,false,0,Math.PI).rotateZ(Math.PI/2).scale(1,0.18*D,D/2),0,two?SH*2+1.2:SH+1.2,-D/2+0.5);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Fuente de las Sirenas
  sirenas(L,x,z){const g0=gh(x,z),M=Model();
    M.cyl('limewash',0,0,0,7.5,7.5,0.8,24);M.cyl('water',0,0.75,0,7,7,0.08,24);
    M.cyl('limewash',0,0,0,1.6,1.4,2.4,12);M.cyl('limewash',0,2.4,0,3.4,3.4,0.45,16);M.cyl('water',0,2.82,0,3.1,3.1,0.06,16);
    for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;M.statue('limewash',Math.cos(a)*2.4,2.85,Math.sin(a)*2.4,2.0,-a+Math.PI/2);}
    M.cyl('limewash',0,2.85,0,0.6,0.4,2.2,10);M.dome('limewash',0,5.05,0,0.6,1);
    return M.finish(L,x,g0,z,0);},

  // ================================================================ the cross on the Cerro de la Cruz
  cruz(L,x,z){const g0=gh(x,z),M=Model(),H=L.h||13;
    M.box('limewash',0,0,0,4,1,4);M.box('limewash',0,1,0,2.4,1.2,2.4);M.box('limewash',0,2.2,0,1.2,H,1.2);M.box('limewash',0,2.2+H*0.66,0,6.4,1.1,1.2);
    M.box('limewash',0,0,6,26,0.25,12);                                                            // the mirador's terrace
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Tanque de la Unión
  tanque(L,x,z){const g0=gh(x,z),M=Model(),LEN=L.len||40,N=Math.round(LEN/4.4);
    for(const s of [-1,1]){M.box('limewash',0,0,s*3.2,LEN,0.9,2.2);M.box('water',0,0.85,s*3.2,LEN-0.6,0.05,1.6);
      for(let i=0;i<N;i++)M.put('limewash',archPanel(LEN/N,4.4,0.6,LEN/N-1,2.4),-LEN/2+LEN/N*(i+0.5),0,s*5);}
    M.put('clayTile',new THREE.CylinderGeometry(1,1,LEN,4,1,false,0,Math.PI).rotateZ(Math.PI/2).scale(1,1.8,5.6),0,4.4,0);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ Las Capuchinas' round cloister
  capuchinas(L,x,z){const g0=gh(x,z),M=Model(),R0=L.r||13,N=18;
    for(let i=0;i<N;i++){const a=i/N*Math.PI*2;M.box('ruinStone',Math.cos(a)*R0,0,Math.sin(a)*R0,2*Math.PI*R0/N*0.92,7,5,-a+Math.PI/2);
      M.box('dark',Math.cos(a)*(R0-2.55),1,Math.sin(a)*(R0-2.55),1.2,2.2,0.1,-a+Math.PI/2);}                          // the cells and their doors
    M.cyl('ruinStone',0,0,0,R0-2.6,R0-2.6,0.4,24);M.cyl('ruinStone',0,0,0,2.2,2.2,1.4,14);M.cyl('dark',0,1.38,0,1.6,1.6,0.04,14);   // the court and its well
    M.cyl('ruinStone',0,7,0,R0+2.6,R0+2.6,0.6,24);
    return M.finish(L,x,g0,z,0);},
  };
}
