// ================================================================= UNIVERSITY v2 — "the Hill School" (one interconnected terrace structure)
function buildCampus(scene,gx,gz,d){reseed(9810+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'University — the Hill School ('+STATE(d)+')',x:-40,z:60,r:330,h:90});
 const hill=(x,z)=>{const t=clamp((330-z)/600,0,1);const ex=clamp((290-Math.abs(x))/110,0,1),ez=clamp((360-Math.abs(z))/60,0,1);const e=ex*ex*(3-2*ex)*ez*ez*(3-2*ez);return (58*t*t*(3-2*t)+4*fbm(x/60+3,z/60,1.5,2))*e;};
 // The hill is 600 m wide, not 780: the row puts the three variants 600 m apart,
 // so a 780 m hill overlapped each neighbour by 180 m - two terrains cutting
 // through each other in a seam, and coplanar turf z-fighting where both were 0.
 const hm=gridSurface((u,v)=>{const x=(u-.5)*596,z=(v-.5)*740;return[x,hill(x,z),z];},70,86,{uS:23,vS:28});mesh(hm,d>0?MAT.turfR:MAT.turf,G);
 const SH=4.2,DEP=18,SB=3.2;const wings=[];const GREEN=new THREE.Color().setHSL(.29,.5,d>0?.14:.24);
 // wing: bar from P0→P1 (horizontal), floors nf, base y0, terraces stepping toward `up` (unit vector, uphill).
 // BENT (round 2, after UFM): the bar follows a bow, f(T)=bow*(1-cos 2πT)/2, pushed
 // DOWNHILL (-up), so each wing swells toward the valley like a contour line while
 // its ends keep the straight bar's position AND tangent - the joints to the next
 // wing in the chain are exactly where they were. bow <= 10 m stays inside the
 // forest's 12 m keep-clear margin. Every loop and every rng draw is the one the
 // straight bar made; long boxes become chord segments along the curve.
 // `sub` [ta,tb] builds only that stretch of the P0→P1 bar (the ruin's broken wing).
 function wingBow(P0,P1){return Math.min(10,Math.hypot(P1[0]-P0[0],P1[1]-P0[1])*.045);}
 function wing(P0,P1,nf,y0,up,name,sub){const ta=sub?sub[0]:0,tb=sub?sub[1]:1;const DX=P1[0]-P0[0],DZ=P1[1]-P0[1];const LF=Math.hypot(DX,DZ);const bow=wingBow(P0,P1);
  const L=LF*(tb-ta);
  const at=(t,off)=>{const T=ta+(tb-ta)*t;const f=bow*.5*(1-Math.cos(TAU*T)),fp=bow*Math.PI*Math.sin(TAU*T);
   let tx=DX-up[0]*fp,tz=DZ-up[1]*fp;const tl=Math.hypot(tx,tz);tx/=tl;tz/=tl;let nx=-tz,nz=tx;if(nx*up[0]+nz*up[1]<0){nx=-nx;nz=-nz;}
   return{x:P0[0]+DX*T-up[0]*f+nx*off,z:P0[1]+DZ*T-up[1]*f+nz*off,ang:Math.atan2(tz,tx),n:[nx,nz],t:[tx,tz]};};
  const qa=t=>qEuler(0,-at(t,0).ang,0);
  const p0=[P0[0]+DX*ta,P0[1]+DZ*ta],p1=[P0[0]+DX*tb,P0[1]+DZ*tb];
  // a long box laid as chord segments of the bow at offset `off`; `ext` lengthens its two ends
  const segBox=(nm,off,y,h,dp,ext,c,t0,t1,noLap)=>{t0=t0||0;t1=t1==null?1:t1;const S=Math.max(1,Math.round(L*(t1-t0)/26));
   for(let s=0;s<S;s++){const a=at(t0+(t1-t0)*s/S,off),b=at(t0+(t1-t0)*(s+1)/S,off);const vx=b.x-a.x,vz=b.z-a.z,len=Math.hypot(vx,vz),ux=vx/len,uz=vz/len;
    const e0=s===0?ext:0,e1=s===S-1?ext:0;kput(nm,[(a.x+b.x)/2+ux*(e1-e0)/2,y,(a.z+b.z)/2+uz*(e1-e0)/2],qEuler(0,-Math.atan2(uz,ux),0),[len+e0+e1+(S>1&&!noLap?.8:0),h,dp],c);}};
  const mid=[(p0[0]+p1[0])/2,(p0[1]+p1[1])/2];wings.push({p0,p1,y0,nf,up});REGISTER({name,x:mid[0],z:mid[1],y:y0-8,r:L/2+10,h:nf*SH+14});
  // platform cut into the hill: retaining walls
  segBox(BOXC(d),-4,y0-6,12,DEP+12,3,null);
  for(let f=0;f<=nf;f++){const y=y0+f*SH;const off=f*SB;const gone=d>0&&f===nf&&rng()<.5;
   if(!gone){segBox(BOXC(d),off+DEP/2,y,.6,DEP+1.5,1,null);
    // planted front edge on every terrace, parapet on the top
    for(let k=0;k<Math.round(L/6);k++){const t=(k+.5)/Math.round(L/6);const p=at(t,off+.8);if(d>0&&rng()<.3)continue;if(rng()<.55)kput('hedge',[p.x,y+.7,p.z],qa(t),[5.4,.9,1.6],GREEN);
     if(d>0){const pv=at(t,off+.2);kput('vine',[pv.x,y+.3,pv.z],qEuler(rr(-.1,.1),0,rr(-.1,.1)),[1.2,rr(3,SH*2),1.2],null);}}
    if(f===nf){segBox('brick',off+DEP-.5,y+.6,1.2,.5,1,null);for(let k=0;k<3;k++){const t=.5+(k-1)*.3,p=at(t,off+DEP*.6);kput('hedge',[p.x,y+1.1,p.z],qa(t),[8,1,3],GREEN);}}}
   if(f<nf){const ff=f*SB;
    segBox('boxD',ff+DEP/2,y+SH/2,SH-.8,DEP-2,-.5,null);
    // front: columns + spandrel brick + glass; back wall brick; ends brick
    const nx=Math.round(L/5);for(let k=0;k<=nx;k++){const t=k/nx;const p=at(t,ff+1.2);if(d>0&&rng()<.06)continue;kput(BOXC(d),[p.x,y+SH/2,p.z],qa(t),[.7,SH,.7],null);}
    segBox('brick',ff+1.4,y+.9,1.2,.4,0,null);
    if(d===0)segBox('pane',ff+1.4,y+2.8,2.8,1,0,null,0,1,true);else if(rng()<.5)segBox('paneD',ff+1.4,y+2.7,2.4,1,0,null,.2,.8,true);
    segBox('brick',ff+DEP-.6,y+SH/2,SH,.6,.5,null);
    for(const s of [-1,1]){const t=s<0?0:1,p=at(t,ff+DEP/2);kput('brick',[p.x,y+SH/2,p.z],qa(t),[.6,SH,DEP-1],null);}
    for(let k=0;k<Math.round(L/10);k++){const t=(k+.5)/Math.round(L/10);const lit=d>0?rng()<.1:true;const p=at(t,ff+4);kput('strip',[p.x,y+SH-.5,p.z],qa(t),[7,1,1],lit?CYAN:DEAD);}
    if(f===0){const p=at(.5,ff+1.3);kput('archOpen',[p.x,y+2.4,p.z],qFacing([-p.n[0],0,-p.n[1]]),[.45,.45,1],null);}}}
  // external stair down the front at one end
  {const e=at(1,0);for(let k=0;k<8;k++)kput(BOXC(d),[e.x-e.t[0]*3-e.n[0]*(2+k*1.5),y0-.4-k*.9,e.z-e.t[1]*3-e.n[1]*(2+k*1.5)],qa(1),[3,.4,1.5],null);}
  if(d>0){for(let k=0;k<4;k++){const t=rng();const p=at(t,.8);kput('vine',[p.x,y0+nf*SH,p.z],null,[1.4,rr(6,nf*SH),1.4],null);}}}
 // the chain: zigzag up the hill (uphill = −z); each wing's base is the hill height at its downhill face
 const chain=[[[-190,230],[30,230],3,'Wing 1 — academic'],[[30,150],[30,230],3,'Wing 2 — link'],[[30,150],[-170,150],4,'Wing 3 — library floors'],[[-170,60],[-170,150],3,'Wing 4 — link'],[[-170,60],[70,60],4,'Wing 5 — laboratories'],[[70,-30],[70,60],3,'Wing 6 — link'],[[70,-30],[-130,-30],3,'Wing 7 — halls']];
 chain.forEach((c,i)=>{const isX=c[0][1]===c[1][1];const up=isX?[0,-1]:[(c[0][0]<0?1:-1),0];const zf=Math.max(c[0][1],c[1][1]);const y0=Math.round(hill((c[0][0]+c[1][0])/2,zf+2)+1);
  // RUIN: the library floors (wing 3) have come down across a 40 m bay and the
  // west end stands one storey high, so the ruin changes the skyline instead of
  // repeating the intact terraces in rust. Upper slabs lie tilted in the bay.
  if(d>0&&i===2){wing(c[0],c[1],c[2],y0,up,'Campus '+c[3],[0,.45]);wing(c[0],c[1],1,y0,up,'Campus '+c[3]+' (fallen end)',[.65,1]);
   // the debris follows the bow (wing 3 swells toward +z, downhill)
   const bw=wingBow(c[0],c[1]),fz=x=>bw*.5*(1-Math.cos(TAU*(c[0][0]-x)/(c[0][0]-c[1][0])));
   for(let k=0;k<9;k++){const x=rr(-98,-62),z=rr(128,150)+fz(x);kput('boxCR',[x,y0+rr(1,5),z],qEuler(rr(-.6,.6),rr(-.3,.3),rr(-.7,.7)),[rr(8,16),.7,rr(6,12)],null);}
   for(let k=0;k<80;k++){const q=rng(),x=rr(-100,-60),z=150-q*34+fz(x),sz=rr(.8,2.6);kput('rubble',[x,y0+(1-q)*4+sz*.3,z],qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(.8,1.5),sz*rr(.5,1),sz*rr(.8,1.5)],new THREE.Color().setHSL(rr(.03,.08),rr(.15,.35),rr(.3,.5)));}
   for(let k=0;k<6;k++){const x=rr(-165,-105);kput('brick',[x,y0+SH+rr(.5,1.5),rr(132,148)+fz(x)],qEuler(rr(-.4,.4),rng()*3,rr(-.4,.4)),[rr(4,9),rr(1.5,3),.6],null);}}
  else wing(c[0],c[1],c[2],y0,up,'Campus '+c[3]);});
 // courtyards between wings: big trees, paths, an atrium bridge across each
 [[-70,190,-190,150,30,230],[-70,105,-170,60,30,150],[-50,15,-130,-30,70,60]].forEach((c,i)=>{const [cx,cz,x0,z0,x1,z1]=c;const y=hill(cx,cz);REGISTER({name:'Campus courtyard '+(i+1),x:cx,z:cz,y:y-2,r:60,h:30});
  // The courtyard's trees and hedges are drawn as before but mapped into the box
  // the wings actually leave open (round 2): the old box ran 8-30 m into the
  // terraces of the wing behind it and the link wing beside it, so trunks grew
  // through the floors. Same draws, so nothing else moves.
  const S=[[-180,-4,166,198],[-136,24,76,116],[-120,36,-14,26]][i],mx=(v,a,b)=>S[0]+(v-a)/(b-a)*(S[1]-S[0]),mz=(v,a,b)=>S[2]+(v-a)/(b-a)*(S[3]-S[2]);
  for(let k=0;k<5;k++){const x=mx(rr(x0+20,x1-20),x0+20,x1-20),z=mz(rr(z0+20,z1-20),z0+20,z1-20);const h=rr(18,30);kput('trunk',[x,y-2,z],null,[4,h,4],null);for(let j=0;j<4;j++){const s=rr(8,14);kput('moss',[x+rr(-4,4),y+h*.6+j*3,z+rr(-4,4)],qEuler(rng(),rng(),rng()),[s,s*.55,s],new THREE.Color().setHSL(rr(.25,.34),rr(.4,.55),rr(.15,.26)));}}
  for(let k=0;k<12;k++)kput('hedge',[mx(rr(x0+8,x1-8),x0+8,x1-8),y+.4,mz(rr(z0+8,z1-8),z0+8,z1-8)],qEuler(0,rng()*3,0),[rr(3,8),.8,rr(2,4)],GREEN);
  kput(BOXC(d),[cx,y+.1,cz],qEuler(0,rr(0,.6),0),[3,.3,Math.abs(z1-z0)-10],null);kput(BOXC(d),[cx,y+.1,cz],qEuler(0,rr(0,.6),0),[Math.abs(x1-x0)-10,.3,3],null);});
  // The atrium bridge that used to run diagonally over each courtyard is gone.
  // It cut across the one open void in the plan at a 0.5 rad angle that matched
  // nothing else on the hill, and closed the courtyards off from above.
  // Both rr() calls above are kept so the paths land where they always did.
 // curving concrete steps at the foot; a summit drum
 // (the rectangular lawn terrace that used to sit here is gone: a hard-edged
 //  260x140 slab of flat green laid across a rolling hill read as a decal, not
 //  as ground. The steps and the hill mesh carry the approach on their own.)
 for(let s=0;s<5;s++){const zb=280+s*14;mesh(gridSurface((u,v)=>{const x=-180+u*170;const z=zb+18*Math.sin(u*4+s*.6)+v*1.2-s*3*Math.sin(u*2);return[x,hill(x,z)+.4+s*.05,z];},60,1,{}),CONC(d),G);}
 for(let k=0;k<6;k++)kput(BOXC(d),[-40,hill(-40,330)+.3,330-k*2],null,[20,.4,1.6],null);
 {const cx=-40,cz=-110;const y=hill(cx,cz)+1;REGISTER({name:'Campus — summit hall',x:cx,z:cz,y:y-4,r:30,h:16});kput(SLABC(d),[cx,y-4,cz],null,[30,8,30],null);
  mesh(lathe({rFn:()=>24,H:11,nu:48,nv:4,hole:holeFn(d*.6,2100,null,2)}),MAT.brick,G,cx,y,cz);mesh(lathe({rFn:()=>22,H:11,nu:24,nv:1}),MAT.dark,G,cx,y,cz);
  kput(SLABC(d),[cx,y+11,cz],null,[25,.8,25],null);for(let k=0;k<20;k++){const th=(k+.5)/20*TAU;if(d===0)kput('pane',[cx+24.2*Math.cos(th),y+6,cz+24.2*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[5,4,1],null);kput(BOXC(d),[cx+24.4*Math.cos(th+.16),y+5.5,cz+24.4*Math.sin(th+.16)],qEuler(0,-th-.16,0),[1,11,1.4],null);}
  for(let k=0;k<8;k++)kput('hedge',[cx+18*Math.cos(k/8*TAU),y+12,cz+18*Math.sin(k/8*TAU)],qEuler(0,-k/8*TAU,0),[8,1,2.5],GREEN);kput('archOpen',[cx,y+2.6,cz+23.8],qFacing([0,0,1]),[.6,.6,1],null);stripRing(cx,y+9.5,cz,20,d,24);
  for(let k=0;k<6;k++)kput(BOXC(d),[cx+k*5,hill(cx+k*5,cz+40)+.4,cz+40],null,[4,.4,6],null);}
 // forest — big canopies, none on platforms/lawn
 for(let i=0;i<300;i++){const x=rr(-290,290),z=rr(-350,350);let on=z>240&&x>-200&&x<70;for(const w of wings){const minx=Math.min(w.p0[0],w.p1[0])-12,maxx=Math.max(w.p0[0],w.p1[0])+12,minz=Math.min(w.p0[1],w.p1[1])-12-(w.up[1]<0?DEP+w.nf*SB:0),maxz=Math.max(w.p0[1],w.p1[1])+12;const wx=w.up[0];const mx0=minx-(wx>0?0:DEP+w.nf*SB),mx1=maxx+(wx>0?DEP+w.nf*SB:0);if(x>mx0&&x<mx1&&z>minz&&z<maxz)on=true;}
  if(on||(Math.abs(x+40)<36&&Math.abs(z+110)<36))continue;const y=hill(x,z);const h=rr(16,34);kput('trunk',[x,y,z],null,[3.5,h,3.5],null);for(let k=0;k<4;k++){const s=(4-k)*2.6*(h/24);kput('moss',[x+rr(-2,2),y+h*.5+k*h*.14,z+rr(-2,2)],qEuler(0,rng()*TAU,0),[s,s*.65,s],new THREE.Color().setHSL(rr(.25,.35),rr(.35,.5),rr(.1,.2)));}}
 figures(-80,300,10,30);figures(-70,190,6,20);civFlatten(G);KOFF=[0,0,0];return G;}

