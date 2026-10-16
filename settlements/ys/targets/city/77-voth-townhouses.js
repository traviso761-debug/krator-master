// ================================================================= YS CITY — the Voth townhouses (the foreign quarter's Voth plots)
// The Voth compound is the ported embassy (75-port-embassy.js, 36 x 34 m, "a Voth clan compound in Iziz"); the Voth
// plots of the foreign quarter are 16 x 14 and 20 x 16 m (88 PL_FOREIGN), so the quarter needs the townhouse kinds the
// embassy re-describes inside its wall as houses of their own: the hlaalu house (stacked, shrinking, corniced flat
// blocks: stone below, pale plaster above, a timber balcony on brackets), the Velothi tower (tapering octagonal
// drums, banded, a gilt dome) and the domed hall (a corniced stone block under a ribbed drum, a corbelled bay on the
// front). Same palette as the embassy (grey-brown ashlar, pale plaster, dark pantile, gilt, the clan red and purple),
// the embassy's own vp* kit items and window/door helpers, so the quarter reads as one culture. Local frame as every
// VERN builder: origin at the plot centre on the ground, +z the front, metres. Registered through VERN.def with
// culture 'voth' (88c stamps the inspector tags). Seeds 7821, 7831, 7841 (+ the variant), after the embassy's 7801
// and the chapterhouse's 7811.
const VT_ST=[0x8c8579,0x958e80,0x8b8069,0x7e776b],VT_TILE=[0x5a4a48,0x4e4a52,0x6b5a58];
// a Voth door that also records its mark (the embassy's vpVDoor draws; the vern vnDoor records: this does both)
function vtDoor(x,y,z,ry,w,h,c,steps){vpVDoor(x,y,z,ry,w,h,c,steps);
 if(window.DOORS&&VERN.cur){const C=VERN.cur,sc=C.o.scale||1;const wp=loc(C.x,C.z,x*sc,z*sc,C.ry);DOORS.push({x:wp[0],z:wp[1],ry:ry+C.ry,y:(C.o.y||0)+y*sc,key:C.D.key});}}
// a timber balcony on brackets across a face: (x,y,z) the face's foot at the balcony's height, ry the face's outward yaw
function vtBalcony(x,y,z,ry,w,out,timber,cop){const f=loc(x,z,0,out/2,ry);vB('vStone',f[0],y,f[1],w,.28,out,ry,cop);
 for(const u of[-w/2+.6,w/2-.6]){const a=loc(x,z,u,0,ry),b=loc(x,z,u,out-.2,ry);vBeam([a[0],y,a[1]],[b[0],y-1.1,b[1]],.3,timber);}
 const r=loc(x,z,0,out-.08,ry);vB('vWood',r[0],y+.28,r[1],w,.8,.12,ry,timber);for(const u of[-w/2+.07,w/2-.07]){const s=loc(x,z,u,out/2,ry);vB('vWood',s[0],y+.28,s[1],.12,.8,out,ry,timber);}
 for(let k=-Math.floor(w/1.2);k<=Math.floor(w/1.2);k++){const p=loc(x,z,k*.6,out-.08,ry);vB('vWood',p[0],y+.28,p[1],.07,.8,.07,ry,timber);}}
// A — the hlaalu townhouse: three shrinking storeys, stone then plaster with stone quoins, cornices, a balcony, a flat roof with a parapet and a stair turret
function buildVothTownhouseA(G,o){reseed(7821+(o.v|0));const W=11,D=9,H1=3.6,H2=3.1,H3=2.7,Y0=.3;
 const st=vC(vPick(VT_ST)),cop=st.clone().multiplyScalar(.86),pl=vC(vPick([0xb8b0a2,0xc2b9aa,0xb0a89c])),timber=vC(0x4a3a28),dome=vC(0xb08d3c),ban=vC(vPick([0xa8241c,0x5a3586,0x7a2a3a])),iron=vC(0x3a2f22);
 vnReg('Hlaalu townhouse',0,0,7.2,Y0+H1+H2+H3+2.4);
 vB('vStone',0,0,0,W+1.0,Y0,D+1.0,0,cop);
 const lev=[];let x=0,z=0,y=Y0,fw=W,fd=D;const hs=[H1,H2,H3];const side=o.v%2?1:-1;
 hs.forEach((fh,i)=>{if(i>0){x+=side*rr(.2,.6);z-=rr(.3,.7);}const item=i===0?'vStone':'vPlaster',c=i===0?st:pl;vB(item,x,y,z,fw,fh,fd,0,c);
  if(i>0)for(const sx of[-1,1])for(const sz of[-1,1])vB('vStone',x+sx*(fw/2-.3),y,z+sz*(fd/2-.3),.6,fh,.6,0,st.clone().multiplyScalar(.92));
  vB('vStone',x,y+fh-.26,z,fw+.36,.34,fd+.36,0,cop);lev.push({x,z,y,w:fw,d:fd,h:fh});y+=fh;fw*=.82;fd*=.82;});
 const L0=lev[0],L1=lev[1],L2=lev[2];
 // the parapet on the top block, a dome-capped stair turret at its back corner, a chimney on the middle block's roof
 for(const s of[-1,1]){vB('vStone',L2.x+s*(L2.w/2-.15),y,L2.z,.3,.7,L2.d,0,cop);vB('vStone',L2.x,y,L2.z+s*(L2.d/2-.15),L2.w,.7,.3,0,cop);}
 vPst('vpDrumS',L2.x-side*(L2.w/2-1.1),y,L2.z-L2.d/2+1.1,.9,1.3,st);kput('vDomeP',[L2.x-side*(L2.w/2-1.1),y+1.3,L2.z-L2.d/2+1.1],null,[.95,.7,.95],dome);vBall('vpGilt',L2.x-side*(L2.w/2-1.1),y+2.05,L2.z-L2.d/2+1.1,.16);
 {const cx=L1.x+side*(L1.w/2-.8),cz=L1.z-L1.d/2+.9;vB('vStone',cx,L1.y+L1.h,cz,.8,2.4,.8,0,st.clone().multiplyScalar(.8));vB('vStone',cx,L1.y+L1.h+2.4,cz,1.05,.4,1.05,0,cop);vPst('vPipe',cx,L1.y+L1.h+2.8,cz,.2,.4,iron);}
 // openings: rows on every elevation, the front's lit when the def is
 const lit=vLit();const row=(L,sd,ys,n,spread,ww,wh,lt)=>{for(let i=0;i<n;i++){const u=n===1?0:-spread+2*spread*i/(n-1);
  if(sd===0)vpVWin(L.x+u,L.y+ys,L.z+L.d/2,0,ww,wh,st,lt);else if(sd===1)vpVWin(L.x+u,L.y+ys,L.z-L.d/2,Math.PI,ww,wh,st,false);
  else if(sd===2)vpVWin(L.x+L.w/2,L.y+ys,L.z+u,Math.PI/2,ww,wh,st,lt);else vpVWin(L.x-L.w/2,L.y+ys,L.z+u,-Math.PI/2,ww,wh,st,lt);}};
 row(L0,0,1.6,2,3.3,1.2,1.6,lit);row(L0,2,1.6,2,2.2,1.1,1.5,false);row(L0,3,1.6,2,2.2,1.1,1.5,false);row(L0,1,1.7,2,2.8,1.0,1.4,false);
 row(L1,0,1.3,3,2.9,1.1,1.6,lit);row(L1,2,1.3,2,1.9,1.0,1.4,false);row(L1,3,1.3,2,1.9,1.0,1.4,false);row(L1,1,1.3,2,2.2,1.0,1.4,false);
 row(L2,0,1.0,2,1.7,.9,1.3,lit);row(L2,2,1.0,1,0,.9,1.2,false);row(L2,3,1.0,1,0,.9,1.2,false);
 vtDoor(L0.x+side*2.2,L0.y,L0.z+L0.d/2,0,1.6,2.6,st,2);
 vtBalcony(L1.x-side*.6,L0.y+L0.h-.1,L0.z+L0.d/2,0,5.4,1.4,timber,cop);
 // a clan banner on a pole at the front corner, a drain pipe, a bench by the door
 vpBannerPole(L0.x-side*(L0.w/2-.5),L0.y+L0.h+L1.h-.4,L0.z+L0.d/2-.5,0,3.2,ban);
 vPst('vPipe',L0.x+side*(L0.w/2+.18),Y0,L0.z+L0.d/2-.7,.1,L0.h+L1.h-.4,st.clone().multiplyScalar(.7));
 vB('vWood',L0.x-side*2.6,Y0,L0.z+L0.d/2+.6,2.2,.45,.5,0,timber);
 if(lit)vnLamp(L0.x+side*3.6,Y0+3.2,L0.z+L0.d/2,0);}
// B — the Velothi tower house: an octagonal base band, two tapering drums with string bands, a gilt dome; a porch on the front flat, a
// bracketed balcony over it, a low stone annex with a pantile hip roof at one side
function buildVothTownhouseB(G,o){reseed(7831+(o.v|0));const Y0=.3;
 const st=vC(vPick(VT_ST)),cop=st.clone().multiplyScalar(.86),tile=vC(vPick(VT_TILE)),dome=vC(vPick([0xb08d3c,0xa8803a,0x9a7a44])),timber=vC(0x4a3a28),ban=vC(vPick([0xa8241c,0x5a3586])),iron=vC(0x3a2f22);
 const drums=[[3.3,7.2+rr(-.4,.6)],[2.7,4.6]];const side=o.v%2?1:-1;const apo=Math.cos(Math.PI/8);const faceAt=(r,h,t)=>(r*(1-.14*t/h))*apo;
 vnReg('Velothi tower house',0,0,5.6,Y0+1+drums[0][1]+drums[1][1]+4.6);
 vB('vStone',0,0,0,9.4,Y0,9.4,0,cop);let y=Y0;kput('vpOctBand',[0,y,0],null,[3.6,1.0,3.6],cop);y+=1.0;const face0=[];
 drums.forEach((d,i)=>{kput('vpOctS',[0,y,0],null,[d[0],d[1],d[0]],st.clone().multiplyScalar(1+i*.03));face0.push(y);const rt=d[0]*.86;y+=d[1];kput('vpOctBand',[0,y,0],null,[rt+.12,.42,rt+.12],cop);y+=.42;});
 kput('vpOctBand',[0,y,0],null,[2.0,.45,2.0],st);y+=.45;kput('vDomeP',[0,y,0],null,[1.85,1.55,1.85],dome);vBall('vpGilt',0,y+1.7,0,.34);vPst('vPipe',0,y+1.5,0,.05,1.2,iron);vpHang(.3,y+2.6,0,Math.PI/2,.5,1.2,ban);
 const lit=vLit();
 drums.forEach((d,i)=>{const yb=face0[i];const rows=i===0?[2.4,5.0]:[d[1]*.5];for(const yy of rows)for(let k=0;k<8;k++){if(i===0&&k===0&&yy<4)continue;if(i===1&&k%2===1)continue;const a=k*Math.PI/4;const r=faceAt(d[0],d[1],yy)+.02;
  vpVWin(Math.sin(a)*r,yb+yy-.7,Math.cos(a)*r,a,k%2?.55:.9,1.3,st,lit&&k===0);}});
 // porch on the front flat, a balcony on the second drum's front flat over it
 {const g0=faceAt(drums[0][0],drums[0][1],1.5);vtDoor(0,Y0+1.0,g0,0,1.6,2.6,st,2);
  for(const s of[-1,1]){vPst('vpDrumS',s*1.6,Y0+1.0,g0+.9,.26,3.6,st.clone().multiplyScalar(.9));vB('vStone',s*1.6,Y0+4.6,g0+.9,.75,.28,.75,0,cop);}vB('vStone',0,Y0+4.9,g0+.45,4.0,.36,1.5,0,cop);
  for(let k=0;k<3;k++)vB('vStone',0,Y0+1.0-(k+1)*.33,g0+1.5+k*.4,3.2-k*.3,.33,.5,0,cop);}
 {const yb=face0[1]+1.1;const b0=faceAt(drums[1][0],drums[1][1],1.1);vtBalcony(0,yb,b0,0,3.8,1.4,timber,cop);}
 // the annex: a stone box under a dark pantile hip, a stable door toward the front, a water butt at its foot
 {const ax=side*4.1,az=-1.4,AW=2.8,AD=5.4,AH=3.1;vB('vStone',ax,Y0,az,AW,AH,AD,0,st.clone().multiplyScalar(.95));vB('vStone',ax,Y0+AH-.1,az,AW+.3,.26,AD+.3,0,cop);
  vnHipRoof('vpTileHip',ax,Y0+AH+.5,az,AW,AD,1.5,0,tile,.6);vB('vDarkB',ax,Y0,az+AD/2+.01,1.3,2.2,.2,0);kput('vWood',[ax,Y0+1.1,az+AD/2+.12],null,[1.15,2.1,.08],vC(0x2a221a));
  vpVWin(ax+side*(AW/2),Y0+1.6,az-1.2,side>0?Math.PI/2:-Math.PI/2,.8,.9,st,false);vnBarrel(ax+side*.2,Y0,az-AD/2-.6,.36,.85,timber);}
 vpBannerPole(-side*3.6,Y0,3.4,0,4.4,ban);if(lit)vnLampPost(side*2.9,0,4.2,3.2);}
// C — the domed hall house: a corniced stone block under a ribbed drum and a gilt-ochre dome, a corbelled bay on the front, corner urns,
// a timber gallery along one flank
function buildVothTownhouseC(G,o){reseed(7841+(o.v|0));const HW=13.6,HD=9.6,HH=5.0,Y0=.3;
 const st=vC(vPick(VT_ST)),cop=st.clone().multiplyScalar(.86),dome=vC(vPick([0xb08d3c,0xa8803a])),timber=vC(0x4a3a28),ban=vC(vPick([0xa8241c,0x5a3586])),iron=vC(0x3a2f22),tile=vC(vPick(VT_TILE));
 const side=o.v%2?1:-1;const lit=vLit();
 vnReg('Domed hall house',0,0,8.4,Y0+HH+6.6);
 vB('vStone',0,0,0,HW+1.2,Y0,HD+1.2,0,cop);vB('vStone',0,Y0,0,HW,HH,HD,0,st);
 vB('vStone',0,Y0+HH*.5,0,HW+.3,.24,HD+.3,0,cop);vB('vStone',0,Y0+HH-.2,0,HW+.4,.4,HD+.4,0,cop);vB('vStone',0,Y0+HH+.2,0,HW-.8,.5,HD-.8,0,st.clone().multiplyScalar(.95));
 const dy=Y0+HH+.7;vPst('vpDrumS',0,dy,0,2.5,2.2,st.clone().multiplyScalar(1.04));
 for(let i=0;i<8;i++){const a=i/8*TAU;vB('vStone',Math.sin(a)*2.5,dy,Math.cos(a)*2.5,.28,2.2,.28,-a,cop);if(i%2===0)vB(lit?'vWinLit':'vDarkB',Math.sin(a)*2.48,dy+.6,Math.cos(a)*2.48,.8,1.1,.3,-a);}
 vB('vStone',0,dy+2.2,0,5.5,.3,5.5,0,cop);kput('vDomeP',[0,dy+2.5,0],null,[2.65,2.3,2.65],dome);vBall('vpGilt',0,dy+4.9,0,.32);
 for(const p of[[-1,-1],[1,-1],[-1,1],[1,1]]){const ux=p[0]*(HW/2-.6),uz=p[1]*(HD/2-.6);vB('vStone',ux,Y0+HH+.2,uz,.8,.8,.8,0,cop);vBall('vpGilt',ux,Y0+HH+1.3,uz,.28);}
 // the front: a door off-centre, windows, the corbelled bay with a dark window; the back and the far flank: windows
 vtDoor(-side*3.4,Y0,HD/2,0,1.6,2.6,st,2);
 for(const x of[-side*.6,side*2.4,side*5.0])vpVWin(x,Y0+1.8,HD/2,0,1.1,1.6,st,lit);
 for(const x of[-4.4,-1.5,1.5,4.4])vpVWin(x,Y0+1.8,-HD/2,Math.PI,1.0,1.5,st,false);
 for(const z of[-2.6,0,2.6])vpVWin(-side*HW/2,Y0+1.8,z,side>0?-Math.PI/2:Math.PI/2,1.0,1.5,st,false);
 {const bx=side*2.6,bz=HD/2+.65;vB('vStone',bx,Y0+3.1,bz,2.6,1.8,1.3,0,st.clone().multiplyScalar(1.03));vB('vStone',bx,Y0+4.9,bz,2.9,.26,1.6,0,cop);vBeam([bx,Y0+3.1,HD/2],[bx,Y0+2.1,bz+.55],.42,timber);
  vB(lit?'vWinLit':'vDarkB',bx,Y0+3.5,bz+.66,1.5,1.1,.1,0);}
 // the timber gallery along the flank nearer the door: posts, a plank floor at first-floor height, a rail, a pantile lean-to over it
 {const gx=side*(HW/2+.7),gw=1.3;const gy=Y0+3.3;vB('vWood',gx,gy,0,gw,.2,HD-1.0,0,timber);
  for(const z of[-HD/2+.8,-HD/6,HD/6,HD/2-.8]){vPst('vPostB',gx+side*.5,Y0,z,.14,gy-Y0,timber);vPst('vPostB',gx+side*.5,gy+.2,z,.1,2.0,timber);}
  vB('vWood',gx+side*.55,gy+.2,0,.1,.9,HD-1.0,0,timber);for(let k=-6;k<=6;k++)vB('vWood',gx+side*.55,gy+.2,k*.7,.06,.9,.06,0,timber);
  vnHipRoof('vpTileHip',gx-side*.2,gy+2.3,0,gw+1.2,HD-.6,.9,0,tile,.3);
  vpVWin(side*HW/2,gy+.9,-2.4,side>0?Math.PI/2:-Math.PI/2,1.0,1.4,st,false);vB('vDarkB',side*HW/2+side*.02,gy+.2,1.4,.2,2.1,1.1,0);}
 for(const s of[-1,1])vpBannerPole(s*(HW/2-.9),Y0+HH+.7,HD/2-.9,0,3.2,ban);
 if(lit){vnLampPost(-side*5.6,0,HD/2+1.4,3.4);vnLamp(side*.5,Y0+3.3,HD/2,0);}
 vnPaving(0,Y0+.02,HD/2+1.4,HW-2,1.6,0,cop,10);}
VERN.def({key:'voth_townhouse_a',name:'Hlaalu townhouse',family:'ported',tags:{culture:'voth',type:['single-family dwelling'],wealth:'middle',lit:false},w:13,d:11,h:13,build:buildVothTownhouseA});
VERN.def({key:'voth_townhouse_b',name:'Velothi tower house',family:'ported',tags:{culture:'voth',type:['single-family dwelling'],wealth:'middle',lit:false},w:11,d:11,h:17,build:buildVothTownhouseB});
VERN.def({key:'voth_townhouse_c',name:'Domed hall house',family:'ported',tags:{culture:'voth',type:['single-family dwelling'],wealth:'rich',lit:true},w:17,d:13,h:13,build:buildVothTownhouseC});
