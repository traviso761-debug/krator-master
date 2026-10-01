// ---------------------------------------------------------------- JIMJAM SHOPS (row 'Shops', seeds 9200-9299, prefix jjShop / buildJjShop)
// Eight two-storey shops: an open stall on the ground floor (counter, goods), living quarters above, a canvas awning and a trade
// sign through the culture sockets (62-jj-culture.js draws them). Each differs in width, roof, colour and facade:
//   weapons   8.4 m  red brick     two-bay arcade              crenellated terrace + ornamental forge chimney stack
//   armor     7.2 m  yellow brick  one big arch (iwan)         barrel vault with a round gable and porthole
//   general  10.0 m  ochre plaster timber shopfront + jharokha terrace + rooftop pavilion (chhatri)
//   food      9.6 m  banded brick  arcaded porch + balcony     roof pergola; a domed bread oven in the side yard
//   alchemy   6.4 m  dark brick    door + stall bay, rose glass small slate ribbed dome + smoking flue
//   textiles 10.0 m  yellow/red    arched ground + loggia      drying frame with carpets on the roof terrace
//   jeweler   6.0 m  marble front  door + lit display niche    gold onion dome, gold pinnacles (rich, lit)
//   spice     8.0 m  ochre/deep    timber gallery on brackets  twin terracotta domes
// Local frame: origin at the plot centre on the ground, +z front. Sockets are declared at the top level (never inside jjWithYaw:
// sock() reads CM, not JJ.frame, so a socket declared inside a yaw would ignore it).
const JJ_SHOP_GEO={},JJ_SHOP_MAT={};
function jjShopGeo(jjK){if(JJ_SHOP_GEO[jjK])return JJ_SHOP_GEO[jjK];let jjG;
 if(jjK==='ball')jjG=new THREE.SphereGeometry(1,10,7);else if(jjK==='cyl')jjG=new THREE.CylinderGeometry(1,1,1,12);else if(jjK==='cone')jjG=new THREE.ConeGeometry(1,1,12);
 else if(jjK==='half')jjG=new THREE.CylinderGeometry(1,1,1,18,1,false,-Math.PI/2,Math.PI);else if(jjK==='disc')jjG=new THREE.CylinderGeometry(1,1,1,28);
 else if(jjK==='ring')jjG=new THREE.TorusGeometry(1,.11,6,28);else jjG=JJGEO.box;return JJ_SHOP_GEO[jjK]=jjG;}
function jjShopMat(jjK){if(JJ_SHOP_MAT[jjK])return JJ_SHOP_MAT[jjK];if(JMAT[jjK])return JMAT[jjK];let jjM;
 if(jjK==='goods')jjM=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.88});
 else if(jjK==='steel')jjM=new THREE.MeshStandardMaterial({color:0xc4c8cc,metalness:.85,roughness:.28});
 else if(jjK==='glaze')jjM=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35,metalness:.05});
 else if(jjK==='smoke')jjM=new THREE.MeshStandardMaterial({color:0xcfcac2,roughness:1,transparent:true,opacity:.55,depthWrite:false});
 else if(jjK==='rose')jjM=new THREE.MeshStandardMaterial({map:jjCanvas(128,128,(g,w,h)=>{g.fillStyle='#1a2a3a';g.fillRect(0,0,w,h);const cx=w/2,cy=h/2,cols=['#2fa0c8','#c8302a','#e0b030','#3aa060','#7a3ab0','#e07a2a'];
   for(let k=0;k<12;k++){g.fillStyle=cols[k%cols.length];g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,w*.47,k*TAU/12+.04,(k+1)*TAU/12-.04);g.closePath();g.fill();}
   g.fillStyle='#e0b030';g.beginPath();g.arc(cx,cy,w*.17,0,TAU);g.fill();g.fillStyle='#c8302a';g.beginPath();g.arc(cx,cy,w*.1,0,TAU);g.fill();
   g.strokeStyle='#2a2018';g.lineWidth=3;for(const r of [.17,.3,.47]){g.beginPath();g.arc(cx,cy,w*r,0,TAU);g.stroke();}}),color:0xffffff,roughness:.2,emissive:0x302018,emissiveMap:null});
 else if(jjK.startsWith('carpet')){const jjI=+jjK.slice(6),jjP=[['#8a1e22','#e0b040','#1e3a6a','#efe2c2'],['#1e4a6a','#c8302a','#e0b040','#efe2c2'],['#5a2a5a','#e07a2a','#2f9a94','#efe2c2'],['#2a5a3a','#c8a040','#a8322a','#efe2c2']][jjI%4];
  jjM=new THREE.MeshStandardMaterial({map:jjCanvas(64,128,(g,w,h)=>{g.fillStyle=jjP[0];g.fillRect(0,0,w,h);g.fillStyle=jjP[1];g.fillRect(3,3,w-6,h-6);g.fillStyle=jjP[0];g.fillRect(8,8,w-16,h-16);
   g.fillStyle=jjP[2];for(let y=14;y<h-12;y+=10)for(let x=12;x<w-10;x+=10){if(((x+y)/10)%2<1)g.fillRect(x,y,4,4);}
   g.fillStyle=jjP[1];g.beginPath();g.moveTo(w/2,h*.22);g.lineTo(w*.8,h/2);g.lineTo(w/2,h*.78);g.lineTo(w*.2,h/2);g.closePath();g.fill();g.fillStyle=jjP[2];g.beginPath();g.moveTo(w/2,h*.32);g.lineTo(w*.68,h/2);g.lineTo(w/2,h*.68);g.lineTo(w*.32,h/2);g.closePath();g.fill();
   g.fillStyle=jjP[3];g.beginPath();g.arc(w/2,h/2,5,0,TAU);g.fill();g.fillStyle=jjP[3];for(let x=1;x<w;x+=3){g.fillRect(x,0,1.5,3);g.fillRect(x,h-3,1.5,3);}}),color:0xffffff,roughness:.95,side:THREE.DoubleSide});}
 return JJ_SHOP_MAT[jjK]=jjM;}
function jjShopPut(jjName,jjGeoK,jjMatK,jjX,jjY,jjZ,jjSX,jjSY,jjSZ,jjTint,jjQ){jjPut('jj_shop_'+jjName,jjShopGeo(jjGeoK),typeof jjMatK==='string'?jjShopMat(jjMatK):jjMatK,jjX,jjY,jjZ,jjSX,jjSY,jjSZ,jjTint,jjQ);}
// ---- goods primitives (y = the BASE of the object unless named *C)
function jjShopBlock(jjX,jjY,jjZ,jjW,jjH,jjD,jjHex,jjRy){jjShopPut('goodsbox','box','goods',jjX,jjY+jjH/2,jjZ,jjW,jjH,jjD,jjHex,jjRy?qEuler(0,jjRy,0):undefined);}
function jjShopBallC(jjX,jjY,jjZ,jjRx,jjRy,jjRz,jjHex,jjMatK){jjShopPut('ball_'+(jjMatK||'goods'),'ball',jjMatK||'goods',jjX,jjY,jjZ,jjRx,jjRy,jjRz,jjHex);}
function jjShopCylC(jjX,jjY,jjZ,jjR,jjH,jjHex,jjQ,jjMatK){jjShopPut('cyl_'+(jjMatK||'goods'),'cyl',jjMatK||'goods',jjX,jjY,jjZ,jjR,jjH,jjR,jjHex,jjQ);}
function jjShopCone(jjX,jjY,jjZ,jjR,jjH,jjHex){jjShopPut('cone','cone','goods',jjX,jjY+jjH/2,jjZ,jjR,jjH,jjR,jjHex);}
function jjShopRod(jjA,jjB,jjR,jjHex,jjMatK){const jjD=new THREE.Vector3(jjB[0]-jjA[0],jjB[1]-jjA[1],jjB[2]-jjA[2]),jjL=jjD.length();if(jjL<.001)return;jjShopCylC((jjA[0]+jjB[0])/2,(jjA[1]+jjB[1])/2,(jjA[2]+jjB[2])/2,jjR,jjL,jjHex,new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),jjD.normalize()),jjMatK);}
function jjShopSteel(jjX,jjY,jjZ,jjW,jjH,jjD,jjQ){jjShopPut('steel','box','steel',jjX,jjY,jjZ,jjW,jjH,jjD,undefined,jjQ);}
const JJ_SHOP_QX=qEuler(Math.PI/2,0,0),JJ_SHOP_QZ=qEuler(0,0,Math.PI/2);
function jjShopCrate(jjX,jjY,jjZ,jjS,jjRy){jjShopBlock(jjX,jjY,jjZ,jjS,jjS*.8,jjS,0x9c7448,jjRy);for(const jjF of [.22,.62])jjBox(jjX,jjY+jjS*.8*jjF,jjZ,jjS+.03,.06,jjS+.03,'wood',undefined,jjRy);}
function jjShopSack(jjX,jjY,jjZ,jjR,jjHex){const jjC=jjHex||0xcbb488;jjShopBallC(jjX,jjY+jjR*1.05,jjZ,jjR,jjR*1.08,jjR*.9,jjC);jjShopBallC(jjX,jjY+jjR*2.05,jjZ,jjR*.36,jjR*.3,jjR*.36,jjC);jjShopCylC(jjX,jjY+jjR*1.82,jjZ,jjR*.22,jjR*.14,0x5a3a20);}
function jjShopOpenSack(jjX,jjY,jjZ,jjR,jjH,jjFill){jjShopCylC(jjX,jjY+jjH/2,jjZ,jjR,jjH,0xcbb488);jjShopCylC(jjX,jjY+jjH,jjZ,jjR*1.12,.09,0xbba070);jjShopBallC(jjX,jjY+jjH,jjZ,jjR*.98,jjR*.45,jjR*.98,jjFill);}
function jjShopBarrel(jjX,jjY,jjZ,jjR,jjH){jjShopCylC(jjX,jjY+jjH/2,jjZ,jjR,jjH,0x7a5230);for(const jjF of [.18,.82])jjShopCylC(jjX,jjY+jjH*jjF,jjZ,jjR*1.04,.07,0x35302c);jjShopCylC(jjX,jjY+jjH+.01,jjZ,jjR*.9,.03,0x5a3a20);}
function jjShopBasket(jjX,jjY,jjZ,jjR,jjHex){jjShopCylC(jjX,jjY+.14,jjZ,jjR,.28,0xb48a50);jjShopCylC(jjX,jjY+.29,jjZ,jjR*1.06,.05,0x8a6a3a);const jjB=jjR*.34;
 jjShopBallC(jjX,jjY+.3+jjB*.5,jjZ,jjB,jjB,jjB,jjHex);for(let jjK=0;jjK<6;jjK++){const jjA=jjK*TAU/6;jjShopBallC(jjX+Math.cos(jjA)*jjR*.6,jjY+.3+jjB*.2,jjZ+Math.sin(jjA)*jjR*.6,jjB,jjB,jjB,jjHex);}}
function jjShopJar(jjX,jjY,jjZ,jjS,jjHex,jjMatK){const jjM=jjMatK||'glaze';jjShopBallC(jjX,jjY+.36*jjS,jjZ,.3*jjS,.36*jjS,.3*jjS,jjHex,jjM);jjShopCylC(jjX,jjY+.78*jjS,jjZ,.12*jjS,.2*jjS,jjHex,undefined,jjM);jjShopCylC(jjX,jjY+.9*jjS,jjZ,.17*jjS,.05*jjS,jjHex,undefined,jjM);}
function jjShopCounter(jjX,jjY,jjZ,jjW,jjD,jjH,jjMat){jjBox(jjX,jjY+(jjH-.08)/2,jjZ,jjW,jjH-.08,jjD,jjMat||'brickDeep');jjBox(jjX,jjY+jjH-.04,jjZ,jjW+.14,.08,jjD+.14,'marble');}
// shelving against a wall face at z (the shelves stand in front of it): returns the shelf-top heights
function jjShopShelves(jjX,jjY,jjZ,jjW,jjH,jjN,jjDep){jjDep=jjDep||.4;const jjOut=[];for(const jjS of [-1,1])jjBox(jjX+jjS*(jjW/2-.04),jjY+jjH/2,jjZ+jjDep/2,.08,jjH,jjDep,'wood');
 for(let jjI=0;jjI<jjN;jjI++){const jjYY=jjY+.35+jjI*(jjH-.45)/Math.max(1,jjN-1);jjBox(jjX,jjYY,jjZ+jjDep/2,jjW,.05,jjDep,'wood');jjOut.push(jjYY+.025);}return jjOut;}
// ---- architecture
// the shell: plinth, back rooms, the stall (open to the front between two piers), the living floor above
function jjShopShell(jjO){const S={w:jjO.w,d:jjO.d,bh:jjO.bh===undefined?.3:jjO.bh,pw:jjO.pw||.5};S.ww=S.w-.3;S.fz=jjO.fz!==undefined?jjO.fz:S.d/2-.3;S.zb=-S.d/2+.15;S.zp=S.fz-(jjO.sd||3.4);
 S.y1=S.bh;S.y2=S.bh+jjO.h1;S.y3=S.y2+jjO.h2;const m1=jjO.m1||'brick',m2=jjO.m2||m1,jjSw=jjO.stallW||S.ww-2*S.pw;S.sw=jjSw;
 jjBox(0,S.bh/2,0,S.w,S.bh,S.d,'brickDeep');
 jjBox(jjO.stallX||0,S.bh+.015,(S.zp+S.fz)/2,jjSw,.03,S.fz-S.zp,'marble');
 jjBox(0,S.y1+jjO.h1/2,(S.zb+S.zp)/2,S.ww,jjO.h1,S.zp-S.zb,m1);
 if(!jjO.noPiers)for(const jjS of [-1,1])jjBox(jjS*(S.ww/2-S.pw/2),S.y1+jjO.h1/2,(S.zp+S.fz)/2,S.pw,jjO.h1,S.fz-S.zp,m1);
 const uf=jjO.upperFz!==undefined?jjO.upperFz:S.fz;jjBox(0,S.y2+jjO.h2/2,(S.zb+uf)/2,S.ww,jjO.h2,uf-S.zb,m2);
 if(jjO.course!==false)jjBox(0,S.y2+.1,(S.zb+S.fz)/2,S.ww+.14,.2,S.fz-S.zb+.14,'marble');
 jjBox(jjO.stallX||0,S.y1+1.1,S.zp+.03,1.0,2.2,.06,'dark');jjBox(jjO.stallX||0,S.y1+2.25,S.zp+.05,1.3,.12,.1,'marble'); // door to the back rooms
 return S;}
function jjShopParapet(S,jjH,jjMat,jjO){jjO=jjO||{};const t=.28,L=S.fz-S.zb,cz=(S.zb+S.fz)/2,y=S.y3;
 jjBox(0,y+jjH/2,S.fz-t/2,S.ww,jjH,t,jjMat);jjBox(0,y+jjH/2,S.zb+t/2,S.ww,jjH,t,jjMat);for(const s of [-1,1])jjBox(s*(S.ww/2-t/2),y+jjH/2,cz,t,jjH,L-2*t,jjMat);
 if(jjO.coping!==false){const c=jjO.coping||'marble';jjBox(0,y+jjH+.06,S.fz-t/2,S.ww+.1,.12,t+.1,c);jjBox(0,y+jjH+.06,S.zb+t/2,S.ww+.1,.12,t+.1,c);for(const s of [-1,1])jjBox(s*(S.ww/2-t/2),y+jjH+.06,cz,t+.1,.12,L-2*t,c);}
 if(jjO.crenel){const mh=.5,yy=y+jjH+.12+mh/2,n=Math.max(3,Math.round(S.ww/.8)|1);for(let i=0;i<n;i+=2){const x=-S.ww/2+(i+.5)*S.ww/n;for(const z of [S.fz-t/2,S.zb+t/2])jjBox(x,yy,z,S.ww/n*.9,mh,t+.04,jjO.crenel);}
  const m=Math.max(3,Math.round((L-2*t)/.8)|1);for(let i=0;i<m;i+=2){const z=S.zb+t+(i+.5)*(L-2*t)/m;for(const s of [-1,1])jjBox(s*(S.ww/2-t/2),yy,z,t+.04,mh,(L-2*t)/m*.9,jjO.crenel);}}}
// fills the rectangle above a parabolic arch (as jjArch draws it: outer curve y=H(1-(2x/W)^2)) up to topY, in strips hidden by the ring
function jjShopSpandrel(jjXc,jjY0,jjZ,jjW,jjH,jjTop,jjDep,jjMat){const N=8;for(let i=0;i<N;i++){const xi=i*jjW/2/N,xo=(i+1)*jjW/2/N,bot=jjY0+jjH*(1-Math.pow(2*xo/jjW,2));if(bot>=jjTop-.02)continue;
 for(const s of [-1,1])jjBox(jjXc+s*(xi+xo)/2,(bot+jjTop)/2,jjZ,jjW/2/N+.02,jjTop-bot,jjDep,jjMat);}}
// columns with arches springing from their capitals, filled spandrels and an entablature whose top is topY
function jjShopArcade(jjX,jjY,jjZ,jjN,jjBay,jjColH,jjTop,jjO){jjO=jjO||{};const r=jjO.r||.28,dep=jjO.depth||.6,ha=jjTop-.5-(jjY+jjColH);
 for(let i=0;i<=jjN;i++)jjColumn(jjX-jjN*jjBay/2+i*jjBay,jjY,jjZ,r,jjColH,{pattern:jjO.pattern||'diamond'});
 for(let i=0;i<jjN;i++){const xc=jjX-jjN*jjBay/2+(i+.5)*jjBay;jjArch(xc,jjY+jjColH,jjZ,jjBay+.08,ha,0,{depth:dep});jjShopSpandrel(xc,jjY+jjColH,jjZ,jjBay+.08,ha,jjTop-.5,dep*.8,jjO.mat||'brick');}
 jjBox(jjX,jjTop-.25,jjZ,jjO.entW||jjN*jjBay+r*3,.5,dep+.12,jjO.ent||'marble');}
// a window on a front face: frame, pane, marble sill and hood
function jjShopWin(jjX,jjYc,jjZ,jjW,jjH,jjO){jjO=jjO||{};jjWindow(jjX,jjYc,jjZ,jjW,jjH,0,{shutter:jjO.shutter,lit:jjO.lit});if(jjO.lit)for(const sx of [-1,1])jjBox(jjX+sx*jjW/4,jjYc,jjZ+.135,jjW*.44,jjH*.94,.01,'glow');
 jjBox(jjX,jjYc-jjH/2-.26,jjZ+.12,jjW+.5,.12,.3,'marble');jjBox(jjX,jjYc+jjH/2+.3,jjZ+.1,jjW+.6,.16,.26,jjO.hood||'marble');}
// a half-cylinder vault: axis along local z, springing at y, radius r across x, rising `rise`
function jjShopVault(jjX,jjY,jjZ,jjR,jjLen,jjRise,jjMat){jjPut('jj_shop_vault_'+jjMat,jjShopGeo('half'),JMAT[jjMat],jjX,jjY,jjZ,jjR,jjLen,jjRise,undefined,qEuler(-Math.PI/2,0,0));}
// a chhatri: four slim marble columns on a platform, an eave slab and a small dome
function jjShopChhatri(jjX,jjY,jjZ,jjS,jjH,jjKind){jjBox(jjX,jjY+.12,jjZ,jjS+.3,.24,jjS+.3,'marble');for(const sx of [-1,1])for(const sz of [-1,1]){jjCylinder(jjX+sx*jjS/2,jjY+.24+jjH/2,jjZ+sz*jjS/2,.1,jjH,'marble');jjBox(jjX+sx*jjS/2,jjY+.3,jjZ+sz*jjS/2,.28,.12,.28,'brickYellow');}
 jjBox(jjX,jjY+.24+jjH+.08,jjZ,jjS+.6,.16,jjS+.6,'marble');jjBox(jjX,jjY+.24+jjH+.24,jjZ,jjS+.2,.16,jjS+.2,'brickYellow');jjDome(jjX,jjY+.24+jjH+.32,jjZ,jjS*.5,{kind:jjKind||'terracotta',shape:'hemi'});return jjY+.24+jjH+.32+jjS*.5;}
// a jharokha: a projecting oriel on stepped corbels, jali screen, curved (bangla) roof. y = its floor, z = the wall face
function jjShopJharokha(jjX,jjY,jjZ,jjW,jjH,jjO){jjO=jjO||{};const dp=jjO.dp||.9,zc=jjZ+dp/2;
 for(let i=0;i<3;i++)jjBox(jjX,jjY-.16-i*.22,jjZ+(dp-.12)*(1-i*.3)/2,jjW-.3-i*.5,.2,(dp-.12)*(1-i*.3),i===1?'brickYellow':'marble');
 jjBox(jjX,jjY-.05,zc,jjW,.1,dp,'marble');jjBox(jjX,jjY+.42,jjZ+dp-.06,jjW-.1,.75,.1,'wood');for(const sx of [-1,1])jjBox(jjX+sx*(jjW/2-.05),jjY+.42,zc,.1,.75,dp-.1,'wood');
 jjBox(jjX,jjY+.8+(jjH-1.1)/2,jjZ+dp-.12,jjW-.3,jjH-1.1,.05,'dark');const n=Math.round((jjW-.3)/.22);for(let i=1;i<n;i++)jjBox(jjX-(jjW-.3)/2+i*(jjW-.3)/n,jjY+.8+(jjH-1.1)/2,jjZ+dp-.08,.04,jjH-1.1,.04,'wood');
 for(let k=1;k<4;k++)jjBox(jjX,jjY+.8+k*(jjH-1.1)/4,jjZ+dp-.08,jjW-.3,.04,.04,'wood');
 for(const sx of [-1,0,1])jjBox(jjX+sx*(jjW/2-.08),jjY+.8+(jjH-1.1)/2,jjZ+dp-.06,.14,jjH-1.1,.14,'marble');
 for(const sx of [-1,1])jjBox(jjX+sx*(jjW/2-.05),jjY+.8+(jjH-1.1)/2,zc,.1,jjH-1.1,dp-.1,'wood');
 jjBox(jjX,jjY+jjH-.22,zc+.05,jjW+.3,.14,dp+.3,'marble');
 jjWithYaw(jjX,jjY+jjH-.15,zc+.05,Math.PI/2,()=>jjShopVault(jjX,jjY+jjH-.15,zc+.05,(dp+.3)/2,jjW+.3,jjO.rise||.55,jjO.roof||'tile'));
 if(jjO.finial)jjShopFinial(jjX,jjY+jjH-.15+(jjO.rise||.55)-.03,zc+.05,1);}
// hung round shield on a wall face (faces +z unless wrapped in jjWithYaw)
function jjShopShield(jjX,jjYc,jjZ,jjR,jjHex){jjShopCylC(jjX,jjYc,jjZ+.04,jjR,.06,jjHex,JJ_SHOP_QX);jjShopPut('ring_gold','ring','gold',jjX,jjYc,jjZ+.07,jjR*.94,jjR*.94,jjR*.6);jjShopBallC(jjX,jjYc,jjZ+.08,jjR*.24,jjR*.24,jjR*.18,undefined,'gold');}
// a small gold finial (jjDome's own finial is a fixed 0.24 m ball, too big on a dome under ~0.5 m)
function jjShopFinial(jjX,jjY,jjZ,jjS){jjShopCylC(jjX,jjY+.05*jjS,jjZ,.12*jjS,.1*jjS,undefined,undefined,'gold');jjShopBallC(jjX,jjY+.22*jjS,jjZ,.15*jjS,.18*jjS,.15*jjS,undefined,'gold');jjShopCone(jjX,jjY+.36*jjS,jjZ,.05*jjS,.4*jjS,0xd9a520);}
function jjShopSmoke(jjX,jjY,jjZ,jjDir){const k=jjDir||1;for(let i=0;i<6;i++){const r=.22+i*.11;jjShopPut('smoke','ball','smoke',jjX+k*i*.16+Math.sin(i*1.7)*.12,jjY+.3+i*.5,jjZ-i*.05,r,r*.85,r);}}
function jjShopLantern(jjX,jjY,jjZ){jjBox(jjX,jjY+.42,jjZ-.18,.05,.05,.36,'iron');jjBox(jjX,jjY,jjZ,.26,.36,.26,'glow');for(const sx of [-1,1])for(const sz of [-1,1])jjBox(jjX+sx*.13,jjY,jjZ+sz*.13,.03,.4,.03,'iron');jjBox(jjX,jjY+.22,jjZ,.34,.06,.34,'gold');jjBox(jjX,jjY+.3,jjZ,.12,.12,.12,'gold');}
const JJ_SHOP_TAGS=(jjW)=>({type:['market/shop','single-family dwelling'],wealth:jjW||'middle',lit:jjW==='rich'});

// =============================================================== 1. WEAPONSMITH: red brick, two-bay arcade, crenellated terrace, forge chimney
function buildJjShopWeapons(jjG,jjO){reseed(9200+(jjO.v|0));
 const S=jjShopShell({w:8.4,d:9,h1:3.5,h2:3.2,sd:3.6,pw:.45,m1:'brick',m2:'brick'}),fz=S.fz,y2=S.y2,y3=S.y3,bh=S.bh;
 jjShopArcade(0,bh,fz-.3,2,(S.ww-.4)/2,1.8,y2,{r:.3,pattern:'diamond',depth:.6,mat:'brick',entW:S.ww});
 for(const y of [bh+.7,y3-.5])jjBox(0,y,(S.zb+fz)/2,S.ww+.06,.18,fz-S.zb+.06,'brickYellow');
 // living floor: two shuttered windows, the sign between them, banners on the corners
 for(const x of [-2.3,2.3])jjShopWin(x,y2+1.85,fz,1.0,1.2,{shutter:true});
 jjShopParapet(S,.75,'brick',{crenel:'brickYellow'});
 jjChimneyStack(2.1,y3,-2.4,{n:3,h:2.3,r:.3,patterns:['spiral','chevron','diamond'],seed:1});
 // the forge in the right of the stall: hearth, coals, hood and flue into the stack above
 const fx=2.35,fzz=S.zp+.75;jjBox(fx,bh+.45,fzz,1.5,.9,1.3,'brickDark');jjBox(fx,bh+.93,fzz,1.1,.06,.9,'glow');jjBox(fx,bh+2.15,fzz,1.6,.5,1.4,'brickDeep');jjBox(fx,bh+2.95,fzz-.2,.7,1.2,.7,'brickDeep');
 jjBox(fx-.95,bh+.5,fzz,.35,.45,.8,'wood');jjBox(fx-.95,bh+.78,fzz,.3,.1,.7,'iron');
 // anvil on a stump, a quench trough
 jjShopCylC(1.1,bh+.22,S.zp+2.2,.3,.44,0x6a4a2a);jjBox(1.1,bh+.56,S.zp+2.2,.3,.24,.22,'iron');jjBox(1.1,bh+.74,S.zp+2.2,.7,.13,.24,'iron');jjBox(1.53,bh+.76,S.zp+2.2,.2,.08,.12,'iron');
 jjBox(2.9,bh+.3,S.zp+2.3,.5,.6,1.0,'wood');jjBox(2.9,bh+.58,S.zp+2.3,.4,.04,.9,'water');
 // the counter with blades laid out, and a sword rack on the stall's back wall
 jjShopCounter(-1.85,bh,fz-1.05,2.9,.7,1.0,'brickDeep');
 for(let i=0;i<4;i++){const x=-3.0+i*.7;jjShopSteel(x,bh+1.02,fz-1.05,.08,.02,.62,qEuler(0,.3,0));jjBox(x-.12,bh+1.03,fz-1.05+.32*Math.cos(.3),.22,.04,.05,'gold',undefined,.3);}
 const rz=S.zp+.12;for(const x of [-3.2,-.4])jjBox(x,bh+1.25,rz,.12,2.5,.12,'wood');for(const y of [bh+.55,bh+1.95])jjBox(-1.8,y,rz,2.9,.1,.1,'wood');
 for(let i=0;i<6;i++){const x=-2.95+i*.45;jjShopSteel(x,bh+1.15,rz+.1,.07,1.0,.02);jjBox(x,bh+1.68,rz+.1,.3,.05,.07,'gold');jjShopCylC(x,bh+1.82,rz+.1,.025,.24,0x3a2418);jjShopBallC(x,bh+1.96,rz+.1,.04,.04,.04,undefined,'gold');}
 for(let i=0;i<3;i++){const x=-3.55+i*.18;jjBeam([x,bh,S.zp+1.2],[x,bh+2.9,S.zp+1.0],.025,'wood');jjShopCone(x,bh+2.88,S.zp+1.0,.05,.3,0xc4c8cc);}
 // a street rack under the awning: posts, a top bar, hanging blades and two axes; a grindstone
 const sx0=2.5,sz0=fz+1.7;for(const dx of [-.8,.8])jjBox(sx0+dx,.8,sz0,.1,1.6,.1,'wood');jjBox(sx0,1.6,sz0,1.8,.1,.12,'wood');jjBox(sx0,.05,sz0,1.9,.1,.5,'wood');
 for(let i=0;i<4;i++){const x=sx0-.6+i*.4;jjShopSteel(x,.98,sz0+.08,.07,.9,.02);jjBox(x,1.45,sz0+.08,.26,.05,.06,'gold');}
 for(const dx of [-.95,.95]){jjBeam([sx0+dx,.1,sz0+.25],[sx0+dx*.92,1.5,sz0+.12],.03,'wood');jjShopSteel(sx0+dx*.92,1.35,sz0+.2,.32,.24,.03);}
 const gx=-2.7,gz=fz+1.9;for(const dx of [-.3,.3])jjBox(gx+dx,.4,gz,.08,.8,.5,'wood');jjShopCylC(gx,.85,gz,.42,.14,0x9a948a,JJ_SHOP_QZ);jjBox(gx,.1,gz+.45,.9,.2,.3,'wood');
 // sockets: one long awning on posts, the sign over the arcade, two banners
 jjAwning(0,y2+.32,fz+.08,0,{w:S.ww-.5,d:2.4,drop:.75,h:y2+.32-.75,scheme:'gold'});
 sock('sign',0,y2+.85,fz+.05,0,{w:2.3,h:.72,trade:'WEAPONS'});
 for(const x of [-3.45,3.45])jjBanner(x,y3-.15,fz+.02,0,{w:.62,h:2.0});
 jjReg('Weaponsmith forge',fx,fzz,1.2,y3+3.7,{type:['market/shop','industry']});jjReg('Weaponsmith stall',0,(S.zp+fz)/2,3.4,S.y2);jjReg('Weaponsmith living floor',0,0,4.2,y3,{type:['single-family dwelling']});}
JJ.def({key:'jj_shop_weapons',name:'Weaponsmith',family:'shops',row:'Shops',w:8.4,d:9,h:11.9,r:6,tags:JJ_SHOP_TAGS('middle'),build:buildJjShopWeapons});

// =============================================================== 2. ARMOURER: yellow brick, one big arch, barrel vault with a round gable
function buildJjShopArmor(jjG,jjO){reseed(9210+(jjO.v|0));
 const W=4.9,S=jjShopShell({w:7.2,d:8.6,h1:4.6,h2:2.9,sd:3.6,pw:(7.2-.3-W)/2,m1:'brickYellow',m2:'brickYellow'}),fz=S.fz,y2=S.y2,y3=S.y3,bh=S.bh;
 jjArch(0,bh,fz-.25,W,4.25,0,{depth:.7});jjShopSpandrel(0,bh,fz-.25,W,4.25,y2,.56,'brickYellow');
 jjBox(0,y2-.2,fz-.1,S.ww+.08,.4,.3,'brick');for(const y of [bh+.65,y3-.35])jjBox(0,y,(S.zb+fz)/2,S.ww+.06,.2,fz-S.zb+.06,'brick');
 for(const s of [-1,1]){jjBox(s*(S.ww/2-.06),y3/2,fz-.05,.24,y3,.3,'brick');}
 // the vault: tiles over the whole roof, a brick gable proud of the front with a gold porthole, marble eaves
 const cz=(S.zb+fz)/2,L=fz-S.zb;jjShopVault(0,y3,cz,S.ww/2+.2,L+.3,2.0,'tile');jjShopVault(0,y3,fz+.05,S.ww/2-.05,.4,1.9,'brickYellow');
 jjBox(0,y3+.06,cz,S.ww+.5,.12,L+.4,'marble');jjPorthole(0,y3+.85,fz+.25,0,.5);jjShopFinial(0,y3+1.98,cz,1.2);
  // the stall: three armour stands under the arch, shields on the piers and on the back wall
 const stand=(x,z,body)=>{jjBox(x,bh+.04,z,.5,.08,.5,'wood');jjShopCylC(x,bh+.6,z,.04,1.1,0x5a3a24);jjShopCylC(x,bh+1.0,z,.26,.4,body);jjShopPut('cuirass','cyl','steel',x,bh+1.45,z,.25,.55,.19);
  for(const s of [-1,1])jjShopBallC(x+s*.27,bh+1.68,z,.13,.11,.13,undefined,'steel');jjShopBallC(x,bh+1.92,z,.15,.17,.15,undefined,'steel');jjShopCone(x,bh+2.06,z,.04,.16,0xd9a520);jjBox(x,bh+1.84,z+.13,.2,.04,.04,'gold');};
 stand(-1.4,S.zp+1.5,0xa8322a);stand(0,S.zp+1.1,0x2f6a8a);stand(1.4,S.zp+1.5,0x6a4a2a);
 const hexes=[0xa8322a,0xd9a33a,0x2f6a8a,0x7e2220,0xc4602f];
 for(let i=0;i<5;i++)jjShopShield(-1.8+i*.9,bh+2.5+(i%2)*.35,S.zp+.02,.36,hexes[i]);
 for(const s of [-1,1])jjShopShield(s*(S.ww/2-S.pw/2),bh+2.3,fz,.38,hexes[s>0?1:0]);
 jjShopCounter(0,bh,fz-.55,2.4,.55,.95,'brick');for(const x of [-.7,0,.7])jjShopBallC(x,bh+1.05,fz-.55,.13,.13,.13,undefined,'steel');
 // the shield wall: a lean-to on the left side wall with a rack of shields and a bench of helmets
 const lx=-S.ww/2;jjWithYaw(lx,0,1.2,-Math.PI/2,()=>{for(let i=0;i<6;i++)jjShopShield(lx-1.5+(i%3)*1.0,1.2+Math.floor(i/3)*.95,1.2,.4,hexes[(i+2)%5]);});
 jjBox(lx-.6,.25,1.2,.6,.5,3.0,'wood');for(const z of [.3,.9,1.5,2.1])jjShopBallC(lx-.6,.62,z,.14,.16,.14,undefined,'steel');
 // the living floor: windows with small bracketed awnings, the sign between them, corner banners
 for(const x of [-1.85,1.85])jjShopWin(x,y2+1.4,fz,.85,1.15,{shutter:false});
 for(const x of [-1.85,1.85])jjAwning(x,y2+2.5,fz+.05,0,{w:1.5,d:.75,drop:.28,posts:false,scheme:'turq'});
 jjAwning(lx,3.1,1.2,-Math.PI/2,{w:3.6,d:1.6,drop:.6,h:3.1-.6,scheme:'red'});
 sock('sign',0,y2+1.35,fz+.03,0,{w:1.7,h:.68,trade:'ARMOR'});
 for(const x of [-3.0,3.0])jjBanner(x,y3-.1,fz+.12,0,{w:.5,h:1.9});
 jjReg('Armourer stall',0,(S.zp+fz)/2,2.8,y2);jjReg('Armourer shield wall',lx-.9,1.2,1.9,3.2);jjReg('Armourer living floor',0,0,3.8,y3+2,{type:['single-family dwelling']});}
JJ.def({key:'jj_shop_armor',name:'Armourer',family:'shops',row:'Shops',w:10.2,d:8.6,h:10.2,r:5.1,tags:JJ_SHOP_TAGS('middle'),build:buildJjShopArmor});

// =============================================================== 3. GENERAL GOODS: ochre plaster, timber shopfront under a jharokha, rooftop pavilion
function buildJjShopGeneral(jjG,jjO){reseed(9220+(jjO.v|0));
 const S=jjShopShell({w:10,d:8.4,h1:3.3,h2:3.1,sd:3.7,pw:.45,m1:'ochre',m2:'ochre'}),fz=S.fz,y2=S.y2,y3=S.y3,bh=S.bh;
 for(const s of [-1,1])for(let k=0;k<6;k++)jjBox(s*(S.ww/2-.2),bh+.3+k*1.0,fz+.02,.44+(k%2)*.2,.42,.1,'brickDeep');      // quoins
 jjBox(0,bh+.25,(S.zb+fz)/2,S.ww+.04,.5,fz-S.zb+.04,'brickDeep');
 // timber shopfront: posts, a carved lintel with brackets, folded-back shutters
 const px=[-3.4,-1.15,1.15,3.4];for(const x of px){jjBox(x,bh+(S.y2-.4-bh)/2,fz-.12,.22,S.y2-.4-bh,.22,'wood');jjBox(x,bh+.1,fz-.12,.34,.2,.34,'marble');}
 jjBox(0,y2-.22,fz-.1,S.ww-.6,.42,.3,'wood');jjBox(0,y2-.45,fz-.02,S.ww-.8,.06,.2,'brickYellow');
 for(const x of px)for(const s of [-1,1])if(Math.abs(x+s*.35)<S.ww/2-.5)jjBeam([x+s*.1,y2-1.0,fz-.1],[x+s*.45,y2-.45,fz-.1],.05,'wood');
 for(const s of [-1,1])for(const k of [0,1])jjBox(s*(S.ww/2-.62),bh+1.5,fz-.5-k*.55,.06,2.6,.5,'wood');
 // goods: shelves of jars and boxes, a counter, crates, sacks and barrels out on the pavement
 const sh=jjShopShelves(0,bh,S.zp,6.6,2.6,4,.4);for(const y of sh.slice(0,3))for(let i=0;i<9;i++){const x=-3+i*.75;if(i%3===1)jjShopJar(x,y,S.zp+.2,.5,[0xc4602f,0x3aa6a0,0xd9a33a][i%3]);else jjShopBlock(x,y,S.zp+.2,.45,.3,.3,[0xb08a5a,0xd8c8a0,0x8a6a4a][(i+Math.floor(y))%3]);}
 jjShopCounter(-1.2,bh,fz-1.2,3.6,.6,.95,'wood');for(let i=0;i<5;i++)jjShopBlock(-2.6+i*.65,bh+.95,fz-1.2,.4,.18+(i%2)*.12,.35,[0xd8c8a0,0xb08a5a,0xa8322a][i%3]);
 jjShopCrate(2.3,bh,fz-1.1,.75,.1);jjShopCrate(2.9,bh,fz-1.6,.7,-.2);jjShopCrate(2.5,bh+.6,fz-1.35,.6,.3);
 jjShopCrate(-3.9,0,fz+.9,.8,.15);jjShopCrate(-3.85,.64,fz+.85,.62,-.2);jjShopCrate(-3.0,0,fz+1.0,.7,-.1);
 for(let i=0;i<4;i++)jjShopSack(-1.7+i*.6,0,fz+.85+(i%2)*.2,.3,[0xcbb488,0xb8a070,0xd8c8a0][i%3]);
 for(const [x,z] of [[1.6,fz+.8],[2.35,fz+.95],[3.1,fz+.8]])jjShopBarrel(x,0,z,.32,.85);jjShopBarrel(2.0,.86,fz+.85,.3,.8);
 jjShopBasket(3.95,0,fz+1.0,.35,0xd8b040);
 // living floor: a jharokha over the middle bay, square shuttered windows to the sides
 jjShopJharokha(0,y2+.45,fz,2.8,2.35,{dp:.95,roof:'tile',rise:.5,finial:true});
 for(const x of [-3.2,3.2])jjShopWin(x,y2+1.6,fz,.85,1.05,{shutter:true,hood:'brickDeep'});
 jjShopParapet(S,.95,'ochre',{coping:'brickDeep'});
 jjShopChhatri(2.7,y3,-1.8,2.0,1.9,'terracotta');jjBox(-2.6,y3+.9,-2.3,1.6,1.8,1.4,'ochre');jjBox(-2.6,y3+1.85,-2.3,1.8,.1,1.6,'brickDeep');jjBox(-2.6,y3+.95,-1.58,.8,1.7,.04,'dark'); // stair head
 // sockets: two awnings either side of the jharokha's corbels, the sign on the parapet, a banner
 jjAwning(-3.05,y2-.0,fz+.06,0,{w:2.9,d:2.0,drop:.6,h:y2-.6,scheme:'turq'});jjAwning(3.05,y2-.0,fz+.06,0,{w:2.9,d:2.0,drop:.6,h:y2-.6,scheme:'red'});
 sock('sign',0,y3+.7,fz+.02,0,{w:2.8,h:.8,trade:'GENERAL'});
 jjBanner(-4.45,y3-.1,fz+.02,0,{w:.5,h:1.8});jjBanner(4.45,y3-.1,fz+.02,0,{w:.5,h:1.8});
 jjReg('General goods stall',0,(S.zp+fz)/2,4,y2);jjReg('General goods rooftop pavilion',2.7,-1.8,1.6,y3+4.5,{type:['single-family dwelling']});jjReg('General goods living floor',0,0,5,y3,{type:['single-family dwelling']});}
JJ.def({key:'jj_shop_general',name:'General goods',family:'shops',row:'Shops',w:10,d:8.4,h:10.4,r:6.5,tags:JJ_SHOP_TAGS('middle'),build:buildJjShopGeneral});

// =============================================================== 4. GROCER AND BAKER: banded brick, arcaded porch with a balcony, bread oven in the yard
function buildJjShopFood(jjG,jjO){reseed(9230+(jjO.v|0));
 const w=9.6,d=9.2,bh=.3,h1=3.4,h2=3.1,bx=1.3,bw=7.0,fz=d/2-2.0,zb=-d/2+.15,zp=fz-2.8,y2=bh+h1,y3=y2+h2;
 jjBox(0,bh/2,0,w,bh,d,'brickDeep');
 // the main block (left 7 m): back rooms, stall piers, living floor
 jjBox(bx,bh+h1/2,(zb+zp)/2,bw,h1,zp-zb,'bandBrick');for(const s of [-1,1])jjBox(bx+s*(bw/2-.25),bh+h1/2,(zp+fz)/2,.5,h1,fz-zp,'bandBrick');
 jjBox(bx,bh+.015,(zp+fz)/2,bw-1,.03,fz-zp,'marble');jjBox(bx,bh+1.1,zp+.03,1.0,2.2,.06,'dark');
 jjBox(bx,y2+h2/2,(zb+fz)/2,bw,h2,fz-zb,'bandBrick');jjBox(bx,y2+.1,(zb+fz)/2,bw+.14,.2,fz-zb+.14,'marble');
 // the porch: three bays on spiral columns, a balcony with a balustrade on its roof
 const pz=d/2-.45;jjShopArcade(bx,bh,pz,3,2.25,2.0,y2,{r:.27,pattern:'spiral',depth:.55,mat:'bandBrick'});
 jjBox(bx,y2-.06,(fz+pz)/2,bw,.12,pz-fz+.4,'marble');jjBox(bx,bh+.015,(fz+pz)/2,bw-.4,.03,pz-fz,'marble');
 for(let i=0;i<=12;i++)jjCylinder(bx-bw/2+.25+i*(bw-.5)/12,y2+.4,pz,.07,.7,'marble');jjBox(bx,y2+.8,pz,bw-.2,.12,.22,'marble');for(const s of [-1,1])jjBox(bx+s*(bw/2-.1),y2+.4,(fz+pz)/2,.12,.8,pz-fz,'marble');
 // living floor: a door onto the balcony between two windows; parapet; a timber pergola on the roof
 jjDoor(bx,y2+.05,fz,1.1,2.3,0,{mat:'dark'});for(const x of [bx-2.0,bx+2.0])jjShopWin(x,y2+1.55,fz,.9,1.2,{shutter:true});
 jjBox(bx,y3+.4,fz-.14,bw,.8,.28,'bandBrick');jjBox(bx,y3+.4,zb+.14,bw,.8,.28,'bandBrick');for(const s of [-1,1])jjBox(bx+s*(bw/2-.14),y3+.4,(zb+fz)/2,.28,.8,fz-zb-.56,'bandBrick');
 jjBox(bx,y3+.86,fz-.14,bw+.1,.12,.38,'marble');jjBox(bx,y3+.86,zb+.14,bw+.1,.12,.38,'marble');for(const s of [-1,1])jjBox(bx+s*(bw/2-.14),y3+.86,(zb+fz)/2,.38,.12,fz-zb-.56,'marble');
 for(const x of [bx-2.2,bx+.2])for(const z of [-2.8,0])jjBox(x,y3+1.1,z,.16,2.2,.16,'wood');for(const z of [-2.8,0])jjBox(bx-1,y3+2.24,z,2.8,.14,.14,'wood');for(let i=0;i<6;i++)jjBox(bx-2.2+i*.48,y3+2.36,-1.4,.08,.1,3.4,'wood');
 // the bread oven in the left yard: brick base, drum, terracotta dome, mouth, flue and smoke; a bread rack
 const ox=-3.45,oz=1.6;jjBox(ox,bh+.35,oz,2.5,.7,2.6,'brickDeep');jjBox(ox,bh+.72,oz,2.6,.08,2.7,'marble');jjCylinder(ox,bh+.76+.45,oz,1.05,.9,'brick');jjDome(ox,bh+1.66,oz,1.05,{kind:'terracotta',shape:'hemi'});
 jjBox(ox,bh+1.15,oz+1.02,.62,.5,.14,'brickYellow');jjBox(ox,bh+1.12,oz+1.06,.44,.4,.1,'dark');jjBox(ox,bh+1.0,oz+1.08,.4,.06,.08,'glow');
 jjCylinder(ox-.45,bh+2.7,oz-.35,.16,1.1,'brick');jjBox(ox-.45,bh+3.3,oz-.35,.42,.12,.42,'brickYellow');jjShopSmoke(ox-.45,bh+3.3,oz-.35,-1);
 const rk=jjShopShelves(ox,bh,-2.9,2.0,1.7,3,.45);for(const y of rk)for(let i=0;i<5;i++)jjShopBallC(ox-.8+i*.4,y+.08,-2.67,.16,.09,.1,0xc08a48);
 // produce: a stepped display of baskets in the porch, loaves on the counter, sacks of flour
 jjShopCounter(bx-1.6,bh,fz-.8,2.8,.6,1.0,'brickDeep');for(let i=0;i<6;i++)jjShopBallC(bx-2.75+i*.46,bh+1.08,fz-.8,.18,.1,.11,[0xc89050,0xb07838][i%2]);
 for(let t=0;t<3;t++)jjBox(bx+1.5,bh+.18+t*.3,fz+.75-t*.42,2.6,.36+t*.3*0,.42,'wood');
 const fruit=[0xe08a2a,0xb8302a,0x6a9a3a,0xe6c64a,0x4a2a5a,0xd06a28,0x8ab83a,0xc8302a,0xe0b040];for(let t=0;t<3;t++)for(let i=0;i<3;i++)jjShopBasket(bx+.7+i*.8,bh+.36+t*.3,fz+.75-t*.42,.24,fruit[t*3+i]);
 for(let i=0;i<3;i++)jjShopSack(ox-.5+i*.55,0,d/2-.1+.55,.3,0xe8e0d0);jjShopBasket(ox-1.0,0,d/2+.5,.3,0xe08a2a);
 // sockets: an awning over the yard display (on the block's side wall), the sign on the porch, a banner and a sun emblem
 jjAwning(bx-bw/2,3.25,-1.55,-Math.PI/2,{w:3.6,d:2.4,drop:.7,h:3.25-.7,scheme:'red'});
 sock('sign',bx,y2-.25,pz+.3,0,{w:2.2,h:.46,trade:'FOOD'});
 jjBanner(bx+bw/2-.35,y3-.1,fz+.02,0,{w:.5,h:2.0});sock('emblem',bx-bw/2+.45,y3-.9,fz+.02,0,{w:.6});
 jjReg('Baker oven',ox,oz,1.4,3.9,{type:['market/shop','industry']});jjReg('Grocer porch',bx,(fz+pz)/2,3.5,y2);jjReg('Grocer living floor',bx,-.5,3.8,y3,{type:['single-family dwelling']});}
JJ.def({key:'jj_shop_food',name:'Grocer and baker',family:'shops',row:'Shops',w:9.6,d:9.2,h:9.4,r:6.6,tags:JJ_SHOP_TAGS('middle'),build:buildJjShopFood});

// =============================================================== 5. ALCHEMIST: dark brick, narrow; door and a jar stall, rose porthole, slate ribbed dome, smoking flue
function buildJjShopAlchemy(jjG,jjO){reseed(9240+(jjO.v|0));
 const S=jjShopShell({w:6.4,d:8,h1:3.2,h2:3.0,sd:2.6,noPiers:true,stallW:3.2,stallX:1.15,m1:'brickDark',m2:'brickDeep'}),fz=S.fz,y2=S.y2,y3=S.y3,bh=S.bh;
 // left: solid wall with the door; right: the stall bay (3.2 m) with its pier
 jjBox(-1.85,bh+(y2-bh)/2,(S.zp+fz)/2,2.4,y2-bh,fz-S.zp,'brickDark');jjBox(S.ww/2-.15,bh+(y2-bh)/2,(S.zp+fz)/2,.3,y2-bh,fz-S.zp,'brickDark');
 jjDoor(-1.75,bh,fz,1.05,2.35,0,{mat:'dark'});jjBox(-1.75,bh+2.9,fz+.08,1.5,.16,.2,'turquoise');
 for(const y of [bh+.05,y2-.25])jjBox(0,y,fz+.02,S.ww+.04,.14,.08,'turquoise');jjBox(1.15,y2-.25,fz-.12,3.4,.5,.3,'wood');
 // the jar stall: four shelves of coloured jars and a counter with a retort and a mortar
 const sh=jjShopShelves(1.15,bh,S.zp,3.0,2.5,4,.36),jc=[0x2fa0c8,0x7a3ab0,0x3aa060,0xc8302a,0xe0b030,0x1e3a6a,0xe07a2a];
 for(let k=0;k<sh.length;k++)for(let i=0;i<7;i++)jjShopJar(-.1+i*.42,sh[k],S.zp+.18,.36+((i+k)%3)*.07,jc[(i*3+k)%7]);
 jjShopCounter(1.15,bh,fz-.6,3.0,.6,1.0,'brickDeep');jjShopBallC(.3,bh+1.2,fz-.6,.17,.17,.17,0x3aa060,'glaze');jjShopRod([.42,bh+1.3,fz-.6],[.95,bh+1.55,fz-.6],.03,0x3aa060,'glaze');
 jjShopCylC(1.6,bh+1.1,fz-.6,.13,.18,0x8a8078);jjShopCylC(1.68,bh+1.25,fz-.6,.02,.3,0x6a6058,qEuler(0,0,.4));jjShopJar(2.25,bh+1.0,fz-.6,.5,0x7a3ab0);
 // the living floor: the rose porthole in a gold ring, a lancet window, a turquoise frieze
 const rx=-.7,ry=y2+1.5;jjPut('jj_porthole_rim',new THREE.CylinderGeometry(1,1,1,32),JMAT.brickDeep,rx,ry,fz,1.0,.2,1.0,undefined,JJ_SHOP_QX);
 jjShopPut('ring_gold','ring','gold',rx,ry,fz+.12,.9,.9,.7);jjShopPut('rose','disc','rose',rx,ry,fz+.11,.8,.04,.8,undefined,JJ_SHOP_QX);
 jjShopWin(1.2,y2+1.5,fz,.7,1.4,{shutter:true});jjBox(0,y3-.35,fz+.03,S.ww+.04,.22,.1,'turquoise');
 // the roof: plain parapet with turquoise coping, a slate ribbed dome on a drum with a lantern, the flue with smoke
 jjShopParapet(S,.7,'brickDark',{coping:'turquoise'});
 jjCylinder(.3,y3+.4,-.9,1.45,.8,'brickYellow',undefined,32);jjCylinder(.3,y3+.85,-.9,1.55,.12,'marble',undefined,32);jjDome(.3,y3+.9,-.9,1.4,{kind:'slate',shape:'ribbed'});
 jjCylinder(.3,y3+2.45,-.9,.32,.4,'marble');jjBox(.3,y3+2.7,-.9,.8,.1,.8,'gold');jjShopFinial(.3,y3+2.75,-.9,1.3);
 const flx=-2.2,flz=-2.7;jjBox(flx,y3+1.4,flz,.6,2.8,.6,'brick');jjBox(flx,y3+2.85,flz,.8,.14,.8,'brickYellow');for(const s of [-1,1])jjBox(flx+s*.22,y3+3.1,flz,.14,.36,.6,'brick');jjBox(flx,y3+3.32,flz,.8,.1,.8,'brickYellow');
 jjShopSmoke(flx,y3+3.3,flz);
 // sockets: the stall awning, a bracketed sign by the door, a banner on the right
 jjAwning(1.15,y2+.05,fz+.05,0,{w:3.4,d:1.7,drop:.55,h:y2+.05-.55,scheme:'turq'});
 jjBeam([-S.ww/2+.2,2.95,fz],[-S.ww/2+.2,2.95,fz+1.2],.03,'iron');jjBeam([-S.ww/2+.2,2.4,fz],[-S.ww/2+.2,2.95,fz+.6],.025,'iron');
 sock('sign',-S.ww/2+.2,2.55,fz+.65,-Math.PI/2,{w:1.0,h:.62,trade:'ALCHEMY'});
 jjBanner(2.45,y3-.45,fz+.02,0,{w:.45,h:1.7});
 jjReg('Alchemist stall',1.15,(S.zp+fz)/2,1.8,y2);jjReg('Alchemist dome',.3,-.9,1.6,y3+3.1);jjReg('Alchemist living floor',0,0,3.4,y3,{type:['single-family dwelling']});}
JJ.def({key:'jj_shop_alchemy',name:'Alchemist',family:'shops',row:'Shops',w:6.4,d:8,h:11.6,r:5,tags:JJ_SHOP_TAGS('middle'),build:buildJjShopAlchemy});

// =============================================================== 6. CLOTH AND CARPETS: yellow brick, arched ground floor, loggia, carpet drying frame on the roof
function buildJjShopTextiles(jjG,jjO){reseed(9250+(jjO.v|0));
 const S=jjShopShell({w:10,d:8.6,h1:3.6,h2:3.3,sd:3.6,noPiers:true,upperFz:8.6/2-.3-1.2,m1:'brickYellow',m2:'brickYellow'}),fz=S.fz,y2=S.y2,y3=S.y3,bh=S.bh,cz=(S.zb+fz)/2;
 // ground: four brick piers and three arches; red bands
 const pw=.55,bay=(S.ww-4*pw)/3;for(let i=0;i<4;i++){const x=-S.ww/2+pw/2+i*(bay+pw);jjBox(x,bh+(y2-bh)/2,(S.zp+fz)/2,pw,y2-bh,fz-S.zp,'brickYellow');jjBox(x,bh+.15,fz+.05,pw+.12,.3,.25,'marble');}
 for(let i=0;i<3;i++){const xc=-S.ww/2+pw+bay/2+i*(bay+pw);jjArch(xc,bh,fz-.3,bay+pw,3.05,0,{depth:.62});jjShopSpandrel(xc,bh,fz-.3,bay+pw,3.05,y2,.5,'brickYellow');}
 for(const y of [y2-.12,y3-.2])jjBox(0,y,cz,S.ww+.06,.24,fz-S.zb+.06,'brick');
 // upper floor: a loggia recessed 1.2 m behind three arches on columns, a balustrade with carpets thrown over it
 const lz=fz-1.2;
 jjShopArcade(0,y2+.2,fz-.3,3,(S.ww-1.2)/3,1.55,y3,{r:.24,pattern:'chevron',depth:.5,mat:'brickYellow',ent:'brick'});
 for(const s of [-1,1])jjBox(s*(S.ww/2-.3),(y2+y3)/2,fz-.6,.6,y3-y2,1.2,'brickYellow');
 jjBox(0,y2+1.1,fz-.25,S.ww-1.2,.1,.16,'marble');for(let i=0;i<=16;i++)jjBox(-(S.ww-1.4)/2+i*(S.ww-1.4)/16,y2+.65,fz-.25,.06,.9,.06,'marble');
 for(const [x,k] of [[-2.6,0],[0,1],[2.6,2]]){jjShopPut('carpet'+k,'box','carpet'+k,x,y2+.55,fz-.1,1.5,1.25,.03);jjShopPut('carpet'+k,'box','carpet'+k,x,y2+1.17,fz-.25,1.5,.03,.32);}
 for(const x of [-1.3,1.3])jjBox(x,y2+1.45,lz+.05,.9,1.9,.06,'dark');
 // ground stall: carpets hanging in the side arches, a counter and bolts of cloth in the middle, shelves of bolts behind
 const hx=bay+pw;for(const s of [-1,1]){jjBox(s*hx,bh+2.62,fz-.7,bay+.2,.05,.05,'wood');for(const k of [-1,1])jjShopPut('carpet'+(s>0?3:(k>0?1:2)),'box','carpet'+(s>0?3:(k>0?1:2)),s*hx+k*.48,bh+1.6,fz-.7,.9,2.0,.03);}
 jjShopCounter(0,bh,fz-1.3,2.4,.6,.9,'wood');const bc=[0xa8322a,0x2f6a8a,0xd9a33a,0x3aa060,0x7a3ab0,0xe8e0d0,0xe07a2a];
 for(let r=0;r<3;r++)for(let i=0;i<4-r;i++)jjShopCylC(-.6+i*.4+r*.2,bh+.98+r*.17,fz-1.3,.09,.62,bc[(i+r*2)%7],JJ_SHOP_QZ);
 const sh=jjShopShelves(0,bh,S.zp,5.6,2.6,5,.45);for(const y of sh)for(let i=0;i<9;i++)jjShopCylC(-2.4+i*.6,y+.1,S.zp+.25,.1,.4,bc[(i+Math.round(y*3))%7],JJ_SHOP_QX);
 for(let i=0;i<3;i++)jjShopRod([-4.15+i*.34,0,fz+.75],[-4.45+i*.3,1.45,fz+.3],.13,bc[i+2]);
 // the roof: plain parapet, a timber drying frame with carpets hung over it
 jjShopParapet(S,.85,'brickYellow',{coping:'marble'});
 for(const x of [-3.6,3.6])jjBox(x,y3+1.4,-1.2,.16,2.8,.16,'wood');jjBox(0,y3+2.75,-1.2,7.6,.12,.12,'wood');
 for(const [x,k] of [[-2.4,1],[0,3],[2.4,0]]){jjShopPut('carpet'+k,'box','carpet'+k,x,y3+1.75,-1.12,1.6,2.0,.03);jjShopPut('carpet'+k,'box','carpet'+k,x,y3+2.1,-1.3,1.6,1.3,.03);}
 jjShopPut('carpet2','box','carpet2',-S.ww/2-.03,y3+.3,.6,.03,1.4,1.6);
 // sockets: one long awning over the arches, the sign on the parapet, banners on the loggia's end walls
 jjAwning(0,y2+.18,fz+.08,0,{w:S.ww-.6,d:2.2,drop:.75,h:y2+.18-.75,scheme:'red'});
 sock('sign',0,y3+.55,fz+.02,0,{w:2.7,h:.78,trade:'TEXTILES'});
 for(const x of [-(S.ww/2-.3),S.ww/2-.3])jjBanner(x,y3-.3,fz+.02,0,{w:.48,h:2.0});
 jjReg('Cloth merchant stall',0,(S.zp+fz)/2,4.2,y2);jjReg('Cloth merchant loggia',0,fz-.6,4.2,y3,{type:['single-family dwelling']});jjReg('Carpet drying frame',0,-1.2,3.9,y3+2.9);}
JJ.def({key:'jj_shop_textiles',name:'Cloth and carpet merchant',family:'shops',row:'Shops',w:10,d:8.6,h:10.2,r:6.6,tags:JJ_SHOP_TAGS('middle'),build:buildJjShopTextiles});

// =============================================================== 7. JEWELLER: small, a marble front, gold onion dome, lit (rich)
function buildJjShopJeweler(jjG,jjO){reseed(9260+(jjO.v|0));
 const S=jjShopShell({w:6,d:7.6,h1:3.3,h2:3.0,sd:2.0,noPiers:true,stallW:2.4,stallX:1.2,m1:'brick',m2:'brick'}),fz=S.fz,y2=S.y2,y3=S.y3,bh=S.bh,mf=fz+.08;
 jjBox(0,bh+.15,fz+.24,S.w-.1,.3,.42,'marble');                                        // marble step along the front
 jjBox(-1.45,bh+(y2-bh)/2,(S.zp+fz)/2,2.8,y2-bh,fz-S.zp,'brick');jjBox(S.ww/2-.08,bh+(y2-bh)/2,(S.zp+fz)/2,.16,y2-bh,fz-S.zp,'brick');
 // the marble front: pilasters with gold capitals, a frieze, a cornice; red brick panels between
 for(const x of [-2.75,-.15,2.75]){jjBox(x,(bh+y3)/2,mf,.42,y3-bh,.16,'marble');for(const y of [y2-.25,y3-.25])jjBox(x,y,mf+.04,.56,.18,.2,'gold');jjBox(x,bh+.2,mf+.04,.56,.4,.22,'marble');}
 jjBox(0,y2+.2,mf+.02,S.ww+.1,.62,.2,'marble');jjBox(0,y2-.05,mf+.1,S.ww+.12,.08,.2,'gold');jjCornice(0,y3-.05,fz-.4,S.ww,1.0,0);
 // ground: an arched door with lanterns, the lit display niche with a counter, velvet trays and gold
 jjBox(-1.45,bh+(y2-bh)/2,fz+.04,2.2,y2-bh,.08,'marble');jjDoor(-1.45,bh+.3,mf+.05,1.0,2.35,0,{mat:'dark'});jjBox(-1.45,bh+2.95,mf+.14,1.7,.14,.3,'marble');jjBox(-1.45,bh+3.06,mf+.14,1.5,.08,.26,'gold');for(const x of [-2.42,-.48])jjShopLantern(x,bh+2.3,mf+.35);
 jjShopBlock(1.2,bh,S.zp+.06,2.4,2.9,.06,0x5a1a2a);jjBox(1.2,bh+2.85,S.zp+.3,2.2,.06,.3,'glow');
 const sh=jjShopShelves(1.2,bh+.6,S.zp+.1,2.2,1.9,3,.3);for(const y of sh)for(let i=0;i<4;i++){jjShopBlock(.55+i*.43,y,S.zp+.27,.34,.04,.22,0x5a1a2a);jjShopBallC(.55+i*.43,y+.08,S.zp+.27,.06,.05,.06,undefined,'gold');}
 jjShopCounter(1.2,bh,fz-.45,2.3,.55,1.0,'marble');jjBox(1.2,bh+1.0,fz-.45,2.1,.02,.42,'glow');
 for(let i=0;i<5;i++){jjShopPut('ring_gold','ring','gold',.4+i*.4,bh+1.04,fz-.5,.07,.07,.07,undefined,JJ_SHOP_QX);jjShopBallC(.4+i*.4,bh+1.05,fz-.34,.04,.04,.04,[0xc8302a,0x2fa0c8,0x3aa060,0xe8e0d0,0x7a3ab0][i],'glaze');}
 // upper floor: a balcony with a marble balustrade and a lit arched window, gold-framed portholes
 jjBox(-.15,y2+.55,fz+.42,3.0,.12,.72,'marble');for(const s of [-1,1]){jjBox(-.15+s*1.4,y2+.3,fz+.3,.2,.4,.45,'marble');jjBox(-.15+s*1.4,y2+.08,fz+.18,.2,.2,.2,'gold');}
 for(let i=0;i<=9;i++)jjCylinder(-1.55+i*.31,y2+1.0,fz+.72,.05,.8,'marble');jjBox(-.15,y2+1.44,fz+.72,3.0,.1,.14,'gold');for(const s of [-1,1])jjBox(-.15+s*1.45,y2+1.0,fz+.42,.12,.9,.62,'marble');
 jjShopWin(-.15,y2+1.6,mf+.02,1.1,1.8,{lit:true,hood:'gold'});
 for(const x of [-1.95,1.85])jjPorthole(x,y2+1.65,mf+.08,0,.48);
 // roof: a gold onion dome on a marble drum, gold pinnacles on the corners
 jjShopParapet(S,.8,'brick',{coping:'marble'});
 jjCylinder(0,y3+.55,-.9,1.25,1.1,'marble',undefined,32);jjCylinder(0,y3+1.15,-.9,1.35,.12,'gold',undefined,32);jjDome(0,y3+1.2,-.9,1.2,{kind:'gold',shape:'onion'});
 for(const sx of [-1,1])for(const z of [fz-.4,S.zb+.3]){jjBox(sx*(S.ww/2-.25),y3+1.0,z,.4,2.0,.4,'marble');jjShopFinial(sx*(S.ww/2-.25),y3+2.0,z,1.1);}
 // sockets: a small awning over the display, the sign on the frieze, narrow banners on the outer pilasters
 jjAwning(1.2,y2-.12,mf+.1,0,{w:2.5,d:1.4,drop:.45,h:y2-.12-.45,scheme:'gold'});
 sock('sign',-.15,y2+.22,mf+.12,0,{w:2.0,h:.48,trade:'JEWELER'});
 for(const x of [-2.75,2.75])jjBanner(x,y3-.55,mf+.08,0,{w:.4,h:1.5});
 jjReg('Jeweller display',1.2,fz-.6,1.4,y2);jjReg('Jeweller dome',0,-.9,1.4,y3+3.6);jjReg('Jeweller living floor',0,0,3.2,y3,{type:['single-family dwelling']});}
JJ.def({key:'jj_shop_jeweler',name:'Jeweller',family:'shops',row:'Shops',w:6,d:7.6,h:10.2,r:4.3,tags:JJ_SHOP_TAGS('rich'),build:buildJjShopJeweler});

// =============================================================== 8. SPICE AND POTTERY: ochre over deep brick, a timber gallery on brackets, twin terracotta domes
function buildJjShopSpice(jjG,jjO){reseed(9270+(jjO.v|0));
 const S=jjShopShell({w:8,d:8.2,h1:3.4,h2:3.0,sd:3.4,pw:.7,m1:'brickDeep',m2:'ochre',course:false}),fz=S.fz,y2=S.y2,y3=S.y3,bh=S.bh;
 for(const s of [-1,1])jjBox(s*(S.ww/2-.35),y2-.3,fz+.05,.9,.6,.3,'brickYellow');
 // the gallery: a timber floor on carved brackets, posts, a rail with turned balusters, doors behind
 const gd=1.05;jjBox(0,y2-.08,fz+gd/2,S.ww+.1,.16,gd,'wood');jjBox(0,y2-.22,fz+gd-.05,S.ww+.1,.14,.12,'brickYellow');
 for(let i=0;i<5;i++){const x=-S.ww/2+.4+i*(S.ww-.8)/4;jjBeam([x,y2-.9,fz],[x,y2-.15,fz+gd-.1],.06,'wood');jjBox(x,y2-.7,fz+.08,.14,.6,.16,'wood');}
 for(let i=0;i<5;i++){const x=-S.ww/2+.2+i*(S.ww-.4)/4;jjBox(x,y2+1.2,fz+gd-.1,.12,2.4,.12,'wood');}
 jjBox(0,y2+.95,fz+gd-.1,S.ww,.08,.1,'wood');for(let i=0;i<=24;i++)jjCylinder(-S.ww/2+.2+i*(S.ww-.4)/24,y2+.45,fz+gd-.1,.035,.86,'wood');
 for(const x of [-2.1,0,2.1])jjDoor(x,y2,fz,.9,2.15,0,{mat:'dark'});
 jjBox(0,y3-.25,(S.zb+fz)/2,S.ww+.12,.18,fz-S.zb+.12,'brickDeep');
 // roof: low parapet, twin terracotta domes on drums
 jjShopParapet(S,.6,'ochre',{coping:'brickDeep'});
 for(const x of [-1.8,1.8]){jjCylinder(x,y3+.35,-1.4,1.25,.7,'brickDeep');jjBox(x,y3+.74,-1.4,2.7,.08,2.7,'marble');jjDome(x,y3+.7,-1.4,1.2,{kind:'terracotta',shape:'hemi'});}
 // the stall: a three-step stand of heaped spice cones, open sacks, shelves of jars; big clay jars and stacked pots outside
 const spice=[0xe0a020,0xb8341c,0xd86a1a,0x8a5a2a,0x7a8a3a,0x7a4020,0x3a2a24,0xe8c84a,0x9a2a2a];
 for(let t=0;t<3;t++){const z=fz-.9-t*.45,y=bh+.25+t*.3;jjBox(0,y-.1,z,4.6,.2+t*.0,.45,'wood');for(let i=0;i<6;i++){const x=-1.9+i*.76,c=spice[(i+t*2)%9];jjShopCylC(x,y+.03,z,.2,.06,0xa86a38);jjShopCone(x,y+.06,z,.18,.36,c);}}
 for(let t=0;t<3;t++)jjBox(0,bh+.12+t*.15,fz-.9-t*.45,4.7,.24+t*.3,.4,'brickDeep');
 const sh=jjShopShelves(0,bh,S.zp,5.4,2.6,4,.38);for(const y of sh)for(let i=0;i<8;i++)jjShopJar(-2.3+i*.66,y,S.zp+.2,.42,[0xc4602f,0xa84a26,0xd8a060,0x3aa6a0][(i+Math.round(y*2))%4],'goods');
 for(let i=0;i<4;i++)jjShopOpenSack(-1.65+i*1.1,0,fz+.85,.3,.55,spice[(i*2+1)%9]);
 for(const [x,s] of [[-3.45,1.2],[3.45,1.25],[2.6,.85],[-2.6,.9]])jjShopJar(x,0,fz+.75,s,0xc4602f,'goods');
 for(let i=0;i<4;i++)jjShopCylC(3.35,.08+i*.1,fz+1.6,.3-i*.03,.1,0xb85a2c);
 // sockets: a street awning hung from the gallery edge, an awning over the gallery, a bracketed sign, banners on the piers
 jjAwning(0,y2-.32,fz+gd,0,{w:S.ww-1.2,d:1.6,drop:.55,h:y2-.32-.55,scheme:'gold'});
 jjAwning(0,y3-.2,fz+.05,0,{w:S.ww-.2,d:gd+.1,drop:.55,h:y3-.2-.55-y2,scheme:'turq'});
 jjBeam([S.ww/2-.2,y2-1.1,fz],[S.ww/2-.2,y2-1.1,fz+1.0],.03,'iron');
 sock('sign',S.ww/2-.2,y2-1.55,fz+.6,Math.PI/2,{w:1.0,h:.62,trade:'SPICE'});
 jjBanner(-(S.ww/2-.35),y2-1.05,fz+.06,0,{w:.5,h:1.5});
 jjReg('Spice stall',0,(S.zp+fz)/2,3.4,y2);jjReg('Spice gallery',0,fz+.5,3.8,y3,{type:['single-family dwelling']});jjReg('Spice domes',0,-1.4,3.2,y3+2);}
JJ.def({key:'jj_shop_spice',name:'Spice and pottery',family:'shops',row:'Shops',w:8,d:8.2,h:8.6,r:5.6,tags:JJ_SHOP_TAGS('middle'),build:buildJjShopSpice});
