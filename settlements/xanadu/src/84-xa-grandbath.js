// ================================================================= XANADU — the Grand Baths (package X-K, round 6)
// Travis: a colonnaded, mostly open Grand Baths with stained glass and gardens, after five pictures — the Nasir
// al-Mulk mosque's mosaic iwan and its stained-glass hall, a bold red-purple-orange tiled pavilion with a copper sun
// on the ridge and a long tiled pool, a tall mosaic-banded colonnade over an emerald pool, and the Fin garden's
// painted iwan over a rill down a cypress avenue. Seeds 32200–32299.

// ---------------------------------------------------------------- textures and kit items of the baths
// stained glass: a lattice of coloured panes in black leading with a rose at the head of each repeat; unlit so it glows
TEX.xGlass=canvasTex(128,256,(g,w,h)=>{const cols=['#e03030','#2860d8','#30b040','#f0d030','#e040a0','#30c0c8','#f08020','#f4f4f0'];
 const cw=16,ch=16;for(let j=0;j<h/ch;j++)for(let i=0;i<w/cw;i++){g.fillStyle=cols[(i*3+j*5+((i*j)%3))%cols.length];g.fillRect(i*cw,j*ch,cw,ch);}
 const rc=[w/2,h*.18];for(let k=0;k<12;k++){const a=k/12*TAU;g.beginPath();g.moveTo(rc[0],rc[1]);g.arc(rc[0],rc[1],w*.42,a,a+TAU/12);g.closePath();g.fillStyle=cols[k%cols.length];g.fill();}
 g.beginPath();g.arc(rc[0],rc[1],w*.14,0,TAU);g.fillStyle='#f4f4f0';g.fill();
 g.strokeStyle='#1a1614';g.lineWidth=2;for(let k=0;k<=w;k+=cw){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.stroke();}for(let k=0;k<=h;k+=ch){g.beginPath();g.moveTo(0,k);g.lineTo(w,k);g.stroke();}
 for(let k=0;k<12;k++){const a=k/12*TAU;g.beginPath();g.moveTo(rc[0],rc[1]);g.lineTo(rc[0]+Math.cos(a)*w*.42,rc[1]+Math.sin(a)*w*.42);g.stroke();}g.beginPath();g.arc(rc[0],rc[1],w*.42,0,TAU);g.stroke();});
TEX.xGlass.wrapS=TEX.xGlass.wrapT=THREE.ClampToEdgeWrapping;
MAT.xGlass=new THREE.MeshBasicMaterial({map:TEX.xGlass,side:THREE.DoubleSide});
// the bath tile, after the picture: on each tile an orange ground, a half circle off the left edge and one off the
// right, so that across the joints the circles close — red and purple in a checker — and the orange left between
// them reads as pointed lenses running up the wall; dark grout on the joints, a glossy glaze
TEX.xBTile=canvasTex(128,128,(g,w,h)=>{const c=32,n=w/c;g.fillStyle='#e8942c';g.fillRect(0,0,w,h);
 for(let j=0;j<n;j++)for(let i=0;i<=n;i++){g.fillStyle=(i+j)%2?'#c8262a':'#4a2a9c';g.beginPath();g.arc(i*c,j*c+c/2,c/2,0,TAU);g.fill();}
 g.strokeStyle='rgba(70,25,10,.55)';g.lineWidth=2;for(let k=0;k<=w;k+=c){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.stroke();g.beginPath();g.moveTo(0,k);g.lineTo(w,k);g.stroke();}},[1,1]);
MAT.xBTile=xStd({map:TEX.xBTile,roughness:.22,metalness:.05});vWorldUV(MAT.xBTile,.7,.7);
kdef('xGlass',VPLANE,MAT.xGlass);kdef('xBTileB',VBOX,MAT.xBTile);
// emerald pool water, a little brighter than the kit's canal water
MAT.xEmerald=xStd({color:0x117a62,roughness:.08,metalness:.25,transparent:true,opacity:.96});kdef('xEmeraldB',VBOX,MAT.xEmerald);kdef('xEmeraldDisc',XDISC,MAT.xEmerald);kdef('xEmeraldOct',XOCT,MAT.xEmerald);

// ---------------------------------------------------------------- pieces (prefix xnXK)
// a tall square pier of pale stone with a mosaic strip up each face, a gilt necking and a moulded foot
function xnXKPier(x,z,w,h,c,strip){vB('vStone',x,-.1,z,w+.5,.5,w+.5,0,c.clone().multiplyScalar(.95));vB('vStone',x,.4,z,w,h-.4,w,0,c);
 for(let k=0;k<4;k++){const a=k*Math.PI/2,p=loc(x,z,0,w/2+.04,a);kput(strip||'xMosA',[p[0],1.4+(h-3)/2,p[1]],qEuler(0,a,0),[w*.42,h-3,1],null);}
 vB('xGoldB',x,h-1.4,z,w+.16,.3,w+.16,0,xC(xPick(XPAL.gold)));vB('vStone',x,h-.3,z,w+.5,.3,w+.5,0,c);}
// a stained-glass screen in a pointed arch between two piers, over an open walk beneath: an arch frame, a stone
// transom at the screen's foot, the glass, and a tracery bar
function xnXKGlassArch(x,y,z,ry,w,h,c){xnArch('xArchS',x,y,z,ry,w,h,.6,c,{open:true});const gy=y+h*.36,gh=h*.5,gw=w*.7;
 const t=loc(x,z,0,.3,ry);vB('vStone',t[0],gy-.2,t[1],gw+.3,.24,.7,ry,c);const g=loc(x,z,0,.3,ry);kput('xGlass',[g[0],gy+gh/2,g[1]],qEuler(0,ry,0),[gw,gh,1],null);
 vB('xPaint',g[0],gy+gh*.62,g[1],gw,.08,.1,ry,xC(XPAL.black));}
// the curving pool's edge: a run of stone discs along a path of local points, water discs inside — the emerald lake
function xnXKLake(pts,y,c){for(const p of pts){kput('xDiscS',[p[0],y-.02,p[1]],null,[p[2]+.5,.3,p[2]+.5],c);}for(const p of pts)kput('xEmeraldDisc',[p[0],y+.02,p[1]],null,[p[2],.28,p[2]],null);}

// ---------------------------------------------------------------- the Grand Baths
// Plan (z toward the front): the mosaic iwan at the front on a paved forecourt; behind it the great hall — a ring of
// tall mosaic-banded piers under a mosaic-soffited ring roof, its centre open to the sky over the emerald lake, the
// walks paved in glazed turquoise tile, stained glass in every arch of the ring above head height; at the back the
// long tiled pool running out to the tiled pavilion with its copper sun, with cypress avenues and parterres either side.
function buildXaGrandBath(G,o){reseed(32201+(o.v|0));const V=xV(o),lit=xLit();
 const stone=xC(xPick([0xefe6d2,0xe8dfc8,0xf2ebdb])),gold=xC(xPick(XPAL.gold)),turq=xC(xPick([XPAL.turquoise,0x2a9aa0,0x3aa8a8])),tim=xC(xPick(XPAL.red));
 const HW=30,HD=30,HZ=-4,PH=V===2?17:14,PW=1.5,NX=5,NZ=5;   // the hall: 30×30 plan, five piers a side
 vnReg('Grand Baths — hall',0,HZ,HW/2+2,PH+3);vnReg('Grand Baths — iwan',0,HZ+HD/2+2.5,8,20);vnReg('Grand Baths — tiled pavilion',0,HZ-HD/2-26,4,10);
 // the ground: a paved forecourt, the hall floor in glazed tile, the garden gravel
 xnPave(0,HZ+HD/2+10,HW+8,14,0,stone,2.4);vB('xTilesB',0,-.06,HZ,HW+1,.14,HD+1,0,turq);vB('xEarthB',0,-.1,HZ-HD/2-18,HW+14,.1,34,0,xC(0xc8b088));
 // the ring of piers, the arches and stained glass between them on the two long sides and the back, the front open
 const px=[],pz=[];for(let i=0;i<NX;i++)px.push(-HW/2+HW*i/(NX-1));for(let j=0;j<NZ;j++)pz.push(HZ-HD/2+HD*j/(NZ-1));
 const strip=V===1?'xMosB':'xMosA';
 for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){if(i>0&&i<NX-1&&j>0&&j<NZ-1)continue;xnXKPier(px[i],pz[j],PW,PH,stone,strip);}
 const bw=HW/(NX-1);const AH=PH-1.6;
 for(let j=0;j<NZ-1;j++)for(const s of[-1,1]){const z=(pz[j]+pz[j+1])/2;xnXKGlassArch(s*HW/2,0,z,s*Math.PI/2,bw-PW,AH,stone);}
 for(let i=0;i<NX-1;i++){const x=(px[i]+px[i+1])/2;xnXKGlassArch(x,0,HZ-HD/2,Math.PI,bw-PW,AH,stone);if(i===0||i===NX-2)xnXKGlassArch(x,0,HZ+HD/2,0,bw-PW,AH,stone);else xnArch('xArchS',x,0,HZ+HD/2,0,bw-PW,AH,.6,stone,{open:true});}
 // the ring roof: a flat slab over the walks, its soffit in mosaic, a gilt cornice, small tiled domes over every bay on v1
 const RW=bw+1.2;for(const s of[-1,1]){vB('vStone',s*(HW/2-bw/2+.6),PH,HZ,RW,.6,HD+PW+.5,0,stone);kput('xMosB',[s*(HW/2-bw/2+.6),PH-.02,HZ],qEuler(Math.PI/2,0,0),[RW-.6,HD-2.4,1],null);
  vB('vStone',0,PH,HZ+s*(HD/2-bw/2+.6),HW-2*RW+.4,.6,RW,0,stone);kput('xMosB',[0,PH-.02,HZ+s*(HD/2-bw/2+.6)],qEuler(Math.PI/2,0,0),[HW-2*RW-1.4,RW-.6,1],null);}
 xnParapet(0,PH+.6,HZ,HW+PW+.5,HD+PW+.5,0,.7,stone);vB('xFriezeB',0,PH+.15,HZ+HD/2+PW/2+.3,HW+PW+.6,.36,.12,0);vB('xGoldB',0,PH+.62,HZ,HW+PW+.9,.14,HD+PW+.9,0,gold);
 if(V===1)for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){if(i>0&&i<NX-1&&j>0&&j<NZ-1)continue;if((i+j)%2)continue;xnDome(px[i],PH+1.3,pz[j],2.2,'T',{fin:.8});}
 else for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){if(i>0&&i<NX-1&&j>0&&j<NZ-1)continue;kput('xBulbG',[px[i],PH+1.3,pz[j]],null,[1.0,1.4,1.0],gold);}
 // the emerald lake in the open centre: lobed, with paved tongues between the lobes, folk on the tongues
 const lake=V===2?[[0,HZ,7.5],[-5,HZ+4,4.5],[5,HZ-4,4.2],[4,HZ+5,3.6],[-5,HZ-5,3.8]]:[[0,HZ-2,6],[-6,HZ+3,4],[5,HZ+4,3.6],[6,HZ-5,4.2],[-5,HZ-6,3.4],[0,HZ+6,3]];
 xnXKLake(lake,0,stone);if(V===2)xnFountain(0,.3,HZ,2.4,stone);else{vPst('xColS',0,.1,HZ-2,.5,1.2,stone);kput('xOctS',[0,1.3,HZ-2],null,[1.4,.2,1.4],stone);kput('xEmeraldOct',[0,1.5,HZ-2],null,[1.2,.16,1.2],null);}
 for(let k=0;k<7;k++){const a=k/7*TAU;xnFolk(Math.cos(a)*11,0,HZ+Math.sin(a)*11,1,1.2);}
 // the iwan at the front: a mosaic pishtaq with its twin turrets, a rill running out of it down the forecourt
 xnIwanOpen(0,0,HZ+HD/2+PW/2+4.4,0,13,PH+5,5,stone,{through:true,guldasta:true,lamps:lit});
 for(const s of[-1,1]){vPst('xColS',s*8.6,0,HZ+HD/2+2.6,1.0,PH+7,stone);kput('xBulbT',[s*8.6,PH+7,HZ+HD/2+2.6],null,[1.4,1.8,1.4],xC(xPick(XPAL.tile)));vBall('xGold',s*8.6,PH+9,HZ+HD/2+2.6,.16,gold);}
 xnRill(0,0,HZ+HD/2+8.6,0,8,{c:stone});xnRill(0,0,HZ+HD/2+16.6,0,8,{c:stone,cap:'pool'});
 // the back: the long tiled pool down the garden to the tiled pavilion with its copper sun on a green-tiled roof
 const BZ=HZ-HD/2-1;xnRill(0,0,BZ-3,0,6,{c:stone});
 vB('xBTileB',0,-.2,BZ-14,7,.6,16,0);vB('vStone',0,-.2,BZ-14,7.8,.12,16.8,0,stone);vB('xEmeraldB',0,.2,BZ-14,5.8,.24,14.8,0,null);   // the tiled pool: a tiled curb, water inside
 {const z=BZ-26,S=6;vB('xBTileB',0,0,z,S,S,S,0);vnDoor(0,0,z+S/2,0,1.4,3,'xPaint',xC(0x1e4a2a),xC(0x1e4a2a),false);vB('vWood',0,S,z,S+.8,.2,S+.8,0,xC(0x3a2a20));
  vnGableRoof(0,S+.2,z,S+.6,S+.6,1.6,0,'xGableT',xC(0x2f6a4a),.4);{const cu=xC(0xb8702e),cy=S+3.4;vPst('xGold',0,S+1.4,z,.1,1.2,cu);kput('xDiscG',[0,cy,z],qEuler(Math.PI/2,0,0),[1.1,.16,1.1],cu);   // the copper sun: a disc, a face, sixteen rays
  kput('xDiscG',[0,cy,z+.09],qEuler(Math.PI/2,0,0),[.5,.06,.5],cu.clone().multiplyScalar(1.2));for(let k=0;k<16;k++){const a=k/16*TAU,L=k%2?1.0:1.5;const r=1.05+L/2;
   kput('xGoldB',[Math.cos(a)*r,cy+Math.sin(a)*r,z],qEuler(0,0,a),[L,.16,.14],cu);}}}
 // the gardens: cypress avenues either side of the pool, parterres beyond them, hedges, lamps at night
 for(const s of[-1,1]){for(let k=0;k<7;k++)xnCypress(s*5.6,BZ-3-k*4,rr(6,9));xnCharBagh(s*15,0,BZ-14,12,22,0,{r:1.6,channel:.8});vB('xPaint',s*9,0,BZ-14,.4,.6,26,0,xC(xPick(XPAL.leaf)).multiplyScalar(.8));}
 if(lit){for(const s of[-1,1]){vnLampPost(s*6,0,HZ+HD/2+9,3.4);vnLampPost(s*4.6,0,BZ-24,3.2);}for(let i=0;i<NX;i++)for(const s of[-1,1])vBall('vBulb',px[i],PH-2.2,HZ+s*(HD/2-.9),.09);}
 vnFolk(0,HZ+HD/2+8,4,3);vnFolk(0,BZ-10,3,2);}

XA.def({key:'xa_grand_bath',name:'Grand Baths',family:'Public',tags:{type:['religious','infrastructure'],wealth:'civic',lit:true,landmark:true},w:62,d:88,h:26,fw:44,fd:82,eye:[1,30,0,13],eyes:[['garden',0,-72,0,-52],['pavilion',4,-35,0,-46],['hall',-13,12,3,-14]],build:buildXaGrandBath});
