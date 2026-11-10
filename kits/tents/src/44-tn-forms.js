// prefix: tn
// ================================================================= THE FORMS: one builder per form, drawn in the dress
// Each takes S (tnSpec(key): the size's numbers from 33-tn-table.js) after tnBegin, draws the structure in the def's local
// frame (origin on the ground at the centre, +z the front), and returns {zf: the front of its cover, door: {w, h} | null}.
// The bell, the yurt, the black tent and the marquee are the Scyvoi tent toolkit's shapes (kits/scyvoi/src/40-tk-tentkit.js,
// read in place), their material keys swapped to the dress's (tnKeys); ridge, cone, wedge, fly, awning, round-ended, wagon
// tilt and screen are drawn here on the same primitives.
function tnPanels(L,per){const p=TN_CUR.dress.pattern;return p==='stripes'?Math.max(4,Math.round(L/(per==null?.7:per))):p==='panels'?Math.max(3,Math.round(L/1.3)):1;}
function tnPole(a,b,r,seg){pole(TN_CUR.poleKey,a,b,r==null?.06:r,TN_CUR.poleCol,seg==null?8:seg);}
/* ---------------------------------------------------------------- ridge (wall) tent: walls, a gabled roof on a ridge pole and
   shear poles at each end, the door in the front gable */
function tnRidge(S){const C=TN_CUR,W2=S.W/2,D2=S.D/2,wl=S.wall,rg=S.ridge,ov=.15,ea=.12,dw=S.door,dh=Math.min(1.95,rg-.3),np=tnPanels(S.D);
 const top=x=>wl+(rg-wl)*(1-Math.abs(x)/W2),ctr=[0,wl*.6,0];
 for(const s of [-1,1]){tnCloth((u,v)=>[s*lerp(W2+ea,0,v),lerp(wl-.06,rg,v)-Math.sin(PI*v)*.04,lerp(-D2-ov,D2+ov,u)],Math.round(S.D*2),4,{key:C.roofKey,col:C.dress.roof?C.roof:null,panels:np,out:ctr});
  tnCloth((u,v)=>[s*W2,v*(wl-.04),lerp(-D2,D2,u)],Math.round(S.D*1.5),2,{panels:np,band:true,bv0:.04,bv1:.26,out:ctr});}
 tnCloth((u,v)=>{const x=lerp(-W2,W2,u);return [x,v*top(x),-D2];},Math.round(S.W*2),3,{band:true,bv0:.02,bv1:.12,out:ctr});
 for(const s of [-1,1]){tnCloth((u,v)=>{const x=s*lerp(W2,dw/2,u);return [x,v*top(x),D2];},4,3,{band:true,bv0:.02,bv1:.12,out:ctr});}
 tnCloth((u,v)=>{const x=lerp(-dw/2,dw/2,u);return [x,lerp(dh,top(x),v),D2];},3,2,{out:ctr,patches:false});
 for(const z of [-D2-ov+.05,D2+ov-.05]){for(const s of [-1,1])tnPole([s*(W2-.22),0,z],[0,rg+.06,z],.05,7);}
 tnPole([0,rg,-D2-ov],[0,rg,D2+ov],.05,7);
 tnFinial(0,rg+.04,D2+ov);tnPennant(0,rg+.35,-D2-ov);
 const ng=Math.max(2,Math.round(S.D/1.8));for(const s of [-1,1])for(let i=0;i<ng;i++){const z=lerp(-D2+.3,D2-.3,ng===1?.5:i/(ng-1));tkGuy([s*(W2+ea),wl-.08,z],s*(W2+1.6),z);}
 for(const e of [-1,1])for(const s of [-1,1])tkGuy([0,rg+.02,e*(D2+ov)],s*.55,e*(D2+1.3));
 for(const s of [-1,1]){const vp=[];for(let i=0;i<=8;i++)vp.push([s*(W2+ea+.01),wl-.07,lerp(-D2-ov,D2+ov,i/8)]);tnValance(vp,.22,2);}
 const F=tnFloorOf();tkFloor(F.key,F.col,0,S.W-.1,S.D-.1);
 tnFlap(0,D2+.02,0,dw,dh,'ridge');door(0,0,D2,0,dw,dh);
 return {zf:D2+ov,door:{w:dw,h:dh}};}
/* ---------------------------------------------------------------- bell tent (the toolkit's tkBell): gores, one pole, a valance */
function tnBell(S){const C=TN_CUR,V=C.dress.valance,p=C.dress.pattern,F=tnFloorOf(),r=S.r,g=(S.door/2)/r;
 tnKeys({lacq:C.poleKey==='lacq'?null:C.poleKey},()=>tkBell({r,wallH:S.wall,peakH:S.peak,cover:C.coverKey,col:C.cover,col2:(p==='stripes'||p==='panels')&&C.alt?C.alt:null,
  valKey:V?'flag':C.coverKey,val:V?tnWorn(tnPick(V.cols,C.seed,7),C.wear):tnWorn(C.cover,'worn'),tassels:V?V.tassels:tnWorn(C.cover,'ragged'),
  poleCol:C.poleCol,guys:Math.round(r*3.2),doorW:S.door,floor:F.key,floorCol:F.col}));
 const A0=PI/2+g,A1=PI/2+TAU-g,wall=(u,v)=>{const a=lerp(A0,A1,u);return [Math.cos(a)*(r+.004),v*S.wall,Math.sin(a)*(r+.004)];};
 if(C.dress.band&&p==='border')psurf(C.dress.band,(u,v)=>tnLift(wall,u,lerp(.03,.24,v),.012),Math.round(r*10),1,null);
 tnPatches(wall,{});
 tnPennant(.1,S.peak+.18,0);
 tnFlap(0,r+.01,0,S.door-.06,S.wall-.06,'bell');
 return {zf:r,door:{w:S.door,h:S.wall-.06}};}
/* ---------------------------------------------------------------- yurt (the toolkit's tkYurt): lattice, roof poles, crown, door */
function tnYurt(S){const C=TN_CUR,F=tnFloorOf(),r=S.r,g=(S.door/2+.1)/r;
 tnKeys({felt:C.coverKey==='felt'?null:C.coverKey,lacq:C.poleKey==='lacq'?null:C.poleKey},()=>tkYurt({r,wallH:S.wall,crownH:S.crown,felt:C.cover,band:C.dress.band||null,
  skirt:C.alt||tnWorn(C.cover,'ragged'),ropes:C.rope,posts:!!S.posts,floor:F.key,floorCol:F.col,lining:C.dress.lining||null,lattice:C.poleCol||null,doorW:S.door}));
 const A0=PI/2+g,A1=PI/2+TAU-g;tnPatches((u,v)=>{const a=lerp(A0,A1,u);return [Math.cos(a)*(r+.075),.3+v*(S.wall-.4),Math.sin(a)*(r+.075)];},{});
 tnPennant(.12,S.crown+.2,0);
 return {zf:r+.2,door:{w:S.door,h:Math.min(1.6,S.wall-.12)}};}
/* ---------------------------------------------------------------- conical tent: poles crossed over the smoke hole, a cover
   wrapped round them, two smoke flaps on their own poles, pegs at the hem, a door flap low in front */
function tnCone(S){const C=TN_CUR,r=S.r,H=S.h,top=H*.86,dH=1.15,rad=y=>r*(1-y/top)+.18*(y/top),zL=rad(dH)+.03,g=(S.door/2+.1)/rad(dH),A0=PI/2+g,A1=PI/2+TAU-g;
 const np=tnPanels(TAU*r,1.1),ctr=[0,top*.3,0];
 tnCloth((u,v)=>{const a=lerp(A0,A1,u),y=v*dH;return [Math.cos(a)*rad(y),y,Math.sin(a)*rad(y)];},Math.round(r*9),2,{panels:np,band:true,bv0:.25,bv1:.7,out:ctr});
 tnCloth((u,v)=>{const a=PI/2+u*TAU,y=lerp(dH,top,v);return [Math.cos(a)*rad(y),y,Math.sin(a)*rad(y)];},Math.round(r*9),6,{panels:np,out:ctr});
 if(C.dress.lining)lathe(C.dress.lining,0,0,[[rad(.05)-.06,.05],[rad(1.5)-.06,1.5]],Math.round(r*9),null,{a0:A0,a1:A1,inward:true});
 /* the poles: from the hem through the crossing and on past it */
 const n=Math.max(10,Math.round(r*4));for(let i=0;i<n;i++){const a=(i+.5)/n*TAU+.05,p0=[Math.cos(a)*(r-.05),0,Math.sin(a)*(r-.05)],c=[Math.cos(a+.6)*.07,top+.05,Math.sin(a+.6)*.07],t=(H+.85)/(top+.05);
  tnPole(p0,[p0[0]+(c[0]-p0[0])*t,H+.85,p0[2]+(c[2]-p0[2])*t],.035,6);}
 /* the smoke flaps either side of the front, each held out by its own pole */
 for(const s of [-1,1]){const yb=top-1.5,a0=PI/2+s*.18,a1=PI/2+s*.55,b0=[Math.cos(a0)*rad(yb),yb,Math.sin(a0)*rad(yb)],b1=[Math.cos(a1)*rad(yb+.3),yb+.3,Math.sin(a1)*rad(yb+.3)],
  t0=[Math.cos(a0)*.3,top+.35,Math.sin(a0)*.3+.1],t1=[Math.cos(a1+.25)*.75,top+.45,Math.sin(a1+.25)*.75];
  psurf(C.coverKey,(u,v)=>{const A=[lerp(b0[0],b1[0],u),lerp(b0[1],b1[1],u),lerp(b0[2],b1[2],u)],B=[lerp(t0[0],t1[0],u),lerp(t0[1],t1[1],u),lerp(t0[2],t1[2],u)];return [lerp(A[0],B[0],v),lerp(A[1],B[1],v),lerp(A[2],B[2],v)];},2,2,C.cover);
  const fa=PI/2+s*1.05;tnPole([Math.cos(fa)*(r+.55),0,Math.sin(fa)*(r+.55)],[t1[0]*1.05,t1[1]+.15,t1[2]*1.05],.03,5);}
 const ng=Math.round(TAU*(r+.1)/.75);for(let i=0;i<ng;i++){const a=(i+.5)/ng*TAU;if(Math.abs(((a-PI/2+PI)%TAU+TAU)%TAU-PI)<g*rad(dH)/r+.08)continue;tnPeg(Math.cos(a)*(r+.1),Math.sin(a)*(r+.1));}
 const F=tnFloorOf();tkFloor(F.key,F.col,r*.82);
 tnPennant(.3,H+.55,.1);
 tnFlap(0,zL,0,S.door,dH,'cone');door(0,0,zL,0,S.door,dH);
 return {zf:r,door:{w:S.door,h:dH}};}
/* ---------------------------------------------------------------- black tent (the toolkit's tkBlack): a long low roof on rows of
   poles, open to the front */
function tnBlack(S){const C=TN_CUR,p=C.dress.pattern,V=C.dress.valance,w2=S.w/2,d2=S.d/2;
 const rows=S.rows===1?[{z:-.3,h:S.ph,n:3}]:[{z:-1,h:S.ph,n:4},{z:1,h:S.ph-.2,n:4}];
 let H=null;tnKeys({goat:C.coverKey==='goat'?null:C.coverKey},()=>{H=tkBlack({w:S.w,d:S.d,rows,frontH:S.front,backH:S.back,stripes:p==='stripes'?[2,5]:p==='panels'?[3]:null,
  col:C.cover,pale:C.alt||undefined,valance:V?tnWorn(tnPick(V.cols,C.seed,7),C.wear):null});});
 tnPatches((u,v)=>{const x=lerp(-w2+.2,w2-.2,u),z=lerp(-d2+.2,d2-.3,v);return [x,H(x,z)+.005,z];},{out:[0,-20,0]});
 if(C.dress.band){const y0=.04;psurf(C.dress.band,(u,v)=>{const x=lerp(-w2+.1,w2-.1,u);return [x,lerp(y0,y0+.36,v),-d2-.2+(.36*v)*.25];},Math.round(S.w*2),1,null);}
 tnPennant(-w2+.3,S.front+.45,d2);
 const F=tnFloorOf();if(F.key!=='earth')tkFloor(F.key,F.col,0,S.w*.7,S.d*.7);
 return {zf:d2,door:null};}
/* ---------------------------------------------------------------- marquee (the toolkit's tkPavilion): square walls, a pyramid
   roof on a centre pole, valance and tassels, curtains for a door */
function tnMarquee(S){const C=TN_CUR,V=C.dress.valance,F=tnFloorOf(),s2=S.s/2;
 tnKeys({canvas:C.roofKey==='canvas'?null:C.roofKey,patFelt:C.coverKey},()=>tkPavilion({s:S.s,wallH:S.wall,peakH:S.peak,roofCol:C.roof,wallCol:C.cover,lining:C.dress.lining||null,
  val:V?tnWorn(tnPick(V.cols,C.seed,7),C.wear):tnWorn(C.cover,'worn'),tassels:V?V.tassels:tnWorn(C.cover,'ragged'),doorW:S.door,poleKey:C.poleKey,floor:F.key,floorCol:F.col}));
 const sides=[[[-s2,s2],[s2,s2]],[[s2,s2],[s2,-s2]],[[s2,-s2],[-s2,-s2]],[[-s2,-s2],[-s2,s2]]];
 sides.forEach((sd,i)=>{const a=sd[0],b=sd[1],segs=i===0?[[0,.5-S.door/2/S.s],[.5+S.door/2/S.s,1]]:[[0,1]];
  for(const [t0,t1] of segs){const Sf=(u,v)=>{const t=lerp(t0,t1,u);return [lerp(a[0],b[0],t),v*S.wall,lerp(a[1],b[1],t)];};
   if(C.dress.band)psurf(C.dress.band,(u,v)=>tnLift(Sf,u,lerp(.04,.16,v),.015),Math.max(2,Math.round((t1-t0)*S.s*2)),1,null);
   if(C.dress.pattern==='stripes'||C.dress.pattern==='panels'){const n=Math.max(2,Math.round((t1-t0)*S.s/.8));for(let k=1;k<n;k+=2)psurf(C.coverKey,(u,v)=>tnLift(Sf,lerp(k/n,(k+1)/n,u),lerp(.2,.92,v),.012),1,2,C.alt);}
   tnPatches(Sf,{u0:.05,u1:.95});}});
 tnPennant(.12,S.peak+.25,0);
 tnFlap(0,s2+.03,0,S.door-.1,S.wall-.1,'marquee');
 return {zf:s2,door:{w:S.door,h:S.wall-.1}};}
/* ---------------------------------------------------------------- wedge (pup) tent: an A of cloth on a ridge line, crawled into */
function tnWedge(S){const C=TN_CUR,W2=S.W/2,D2=S.D/2,h=S.h,sod=.16,a=S.door*.28,ctr=[0,h*.3,0];
 for(const s of [-1,1]){tnCloth((u,v)=>[s*lerp(W2,0,v),lerp(sod,h,v),lerp(-D2,D2,u)],Math.round(S.D*2),3,{panels:tnPanels(S.D),out:ctr});
  tnCloth((u,v)=>[s*W2,v*sod,lerp(-D2,D2,u)],Math.round(S.D*2),1,{col:C.alt||tnWorn(C.cover,'ragged'),patches:false,out:ctr});}
 poly(C.coverKey,[[-W2,0,-D2],[W2,0,-D2],[W2,sod,-D2],[0,h,-D2],[-W2,sod,-D2]],C.cover,true);
 for(const s of [-1,1]){const q=x=>s*x;
  poly(C.coverKey,[[q(W2),0,D2],[q(a),0,D2],[q(a),h*.5,D2]],C.cover,true);poly(C.coverKey,[[q(W2),0,D2],[q(a),h*.5,D2],[q(W2),sod,D2]],C.cover,true);
  poly(C.coverKey,[[q(W2),sod,D2],[q(a),h*.5,D2],[0,h,D2]],C.cover,true);}
 poly(C.coverKey,[[-a,h*.5,D2],[a,h*.5,D2],[0,h,D2]],C.cover,true);
 for(const e of [-1,1]){for(const s of [-1,1])tnPole([s*W2*.55,0,e*(D2+.02)],[0,h+.06,e*(D2+.02)],.03,6);
  for(const s of [-1,1])tkGuy([0,h+.04,e*(D2+.02)],s*.35,e*(D2+1.05));}
 tnPole([0,h+.02,-D2],[0,h+.02,D2],.025,6);
 const np=Math.max(2,Math.round(S.D/.7));for(const s of [-1,1])for(let i=0;i<np;i++)tnPeg(s*(W2+.08),lerp(-D2+.15,D2-.15,i/(np-1)));
 tnFlap(0,D2+.02,0,a*2,h*.5,'wedge');door(0,0,D2,0,Math.max(.62,a*2),h*.5);
 return {zf:D2,door:{w:a*2,h:h*.5}};}
/* ---------------------------------------------------------------- fly (lean-to): one sheet from tall front poles to a low back */
function tnFly(S){const C=TN_CUR,W2=S.W/2,D2=S.D/2,f=S.front,b=S.back,np=tnPanels(S.W,.8);
 const Sf=(u,v)=>[lerp(-W2-.15,W2+.15,u),lerp(b,f,v)-Math.sin(PI*v)*.06,lerp(-D2,D2+.2,v)];
 tnCloth(Sf,Math.round(S.W*2),4,{panels:np,out:[0,-10,0]});
 const nf=S.W>4?3:2;for(let i=0;i<nf;i++){const x=lerp(-W2,W2,i/(nf-1));tnPole([x,0,D2+.15],[x,f+.12,D2+.15],.05,7);tkGuy([x,f+.1,D2+.15],x*1.12,D2+1.6);}
 for(const s of [-1,1]){tnPole([s*W2,0,-D2],[s*W2,b+.04,-D2],.045,6);tkGuy([s*W2,b+.02,-D2],s*(W2+.15),-D2-.6);}
 const vp=[];for(let i=0;i<=8;i++)vp.push([lerp(-W2-.15,W2+.15,i/8),f-.04,D2+.2]);tnValance(vp,.22,2);
 tnPennant(-W2,f+.32,D2+.15);door(0,0,D2+.2,0,S.W);
 const F=tnFloorOf();if(F.key!=='earth')tkFloor(F.key,F.col,0,S.W-.4,S.D-.4);
 return {zf:D2+.2,door:null};}
/* ---------------------------------------------------------------- awning: a stall's cloth on four poles, a valance round it */
function tnAwning(S){const C=TN_CUR,W2=S.W/2,D2=S.D/2,h=S.h,np=tnPanels(S.W,.6);
 const y=v=>h+.22-.3*v,Sf=(u,v)=>[lerp(-W2-.1,W2+.1,u),y(v)+Math.sin(PI*u)*.05,lerp(-D2-.1,D2+.1,v)];
 tnCloth(Sf,Math.round(S.W*2),3,{panels:np,out:[0,-10,0]});
 for(const sx of [-1,1])for(const sz of [-1,1]){const yt=y(sz>0?1:0);tnPole([sx*W2,0,sz*D2],[sx*W2,yt+.05,sz*D2],.045,7);tkGuy([sx*W2,yt,sz*D2],sx*(W2+1.05),sz*(D2+1.05));}
 const e=[[-W2-.1,0],[W2+.1,0],[W2+.1,1],[-W2-.1,1],[-W2-.1,0]].map(q=>[q[0],y(q[1])-.02,lerp(-D2-.1,D2+.1,q[1])]);tnValance(e,.2,2.2);
 tnPennant(W2,y(1)+.32,D2);door(0,0,D2,0,S.W);
 return {zf:D2,door:null};}
/* ---------------------------------------------------------------- round-ended tent: a ridge tent with half-cone ends (a mess, a
   barracks); its long axis along x, the door in the middle of the front (+z) side */
function tnRoundend(S){const C=TN_CUR,hl=(S.L-S.B)/2,b2=S.B/2,wl=S.wall,rg=S.ridge,ea=.12,dw=S.door,dh=wl-.05,np=tnPanels(S.L),ctr=[0,wl*.6,0];
 for(const s of [-1,1]){tnCloth((u,v)=>[lerp(-hl,hl,u),lerp(wl-.06,rg,v)-Math.sin(PI*v)*.04,s*lerp(b2+ea,0,v)],Math.round(S.L*1.5),4,{key:C.roofKey,col:C.dress.roof?C.roof:null,panels:np,out:ctr});
  if(s<0)tnCloth((u,v)=>[lerp(-hl,hl,u),v*(wl-.04),-b2],Math.round(S.L),2,{panels:np,band:true,bv0:.04,bv1:.26,out:ctr});
  else for(const q of [-1,1])tnCloth((u,v)=>[q*lerp(hl,dw/2,u),v*(wl-.04),b2],Math.round(S.L*.6),2,{panels:Math.max(1,Math.round(np/2)),band:true,bv0:.04,bv1:.26,out:ctr});}
 for(const e of [-1,1]){const a0=e>0?-PI/2:PI/2,a1=a0+PI,cx=e*hl;
  tnCloth((u,v)=>{const a=lerp(a0,a1,u);return [cx+Math.cos(a)*b2,v*(wl-.04),Math.sin(a)*b2];},Math.round(b2*7),2,{panels:Math.max(1,Math.round(np/3)),band:true,bv0:.04,bv1:.26,out:[cx,wl*.6,0]});
  tnCloth((u,v)=>{const a=lerp(a0,a1,u),rr=lerp(b2+ea,.03,v);return [cx+Math.cos(a)*rr,lerp(wl-.06,rg,v),Math.sin(a)*rr];},Math.round(b2*7),4,{key:C.roofKey,col:C.dress.roof?C.roof:null,panels:Math.max(1,Math.round(np/3)),out:[cx,0,0]});
  tnPole([cx,0,0],[cx,rg+.2,0],.07,8);
  for(const da of [-PI/3,0,PI/3]){const a=(e>0?0:PI)+da;tkGuy([cx+Math.cos(a)*(b2+ea),wl-.08,Math.sin(a)*(b2+ea)],cx+Math.cos(a)*(b2+1.5),Math.sin(a)*(b2+1.5));}}
 tnPole([-hl,rg+.02,0],[hl,rg+.02,0],.05,7);
 tnCloth((u,v)=>{const x=lerp(-dw/2,dw/2,u);return [x,lerp(dh,wl-.04,v),b2];},2,1,{patches:false,out:ctr});
 const ng=Math.max(2,Math.round(S.L/2.2));for(const s of [-1,1])for(let i=0;i<ng;i++){const x=lerp(-hl,hl,ng===1?.5:i/(ng-1));if(s>0&&Math.abs(x)<dw*.9)continue;tkGuy([x,wl-.08,s*(b2+ea)],x,s*(b2+1.6));}
 for(const s of [-1,1]){const vp=[];for(let i=0;i<=8;i++)vp.push([lerp(-hl,hl,i/8),wl-.07,s*(b2+ea+.01)]);tnValance(vp,.22,2);}
 tnFinial(-hl,rg+.2,0);tnPennant(hl+.08,rg+.28,0);
 const F=tnFloorOf();tkFloor(F.key,F.col,0,S.L-S.B*.4,S.B-.3);
 tnFlap(0,b2+.02,0,dw,dh,'roundend');door(0,0,b2,0,dw,dh);
 return {zf:b2+ea,door:{w:dw,h:dh}};}
/* ---------------------------------------------------------------- wagon tilt: a cart bed on four wheels, hoops and a cover */
function tnWheel(x,y,z,r){const C=TN_CUR;WX(x,y,z,0,0,PI/2,()=>{ring('wood',0,0,0,r-.04,.045,0x5a4430,0,0,0,22);cyl('iron',0,-.06,0,.1,.12,0x3a3632,10);
 for(let i=0;i<10;i++){const a=i/10*TAU;beam('wood',[0,0,0],[Math.cos(a)*(r-.06),0,Math.sin(a)*(r-.06)],.03,0x6a5038,true,5);}});}
function tnWagon(S){const C=TN_CUR,L2=S.L/2,B2=S.B/2,bed=.95,bt=bed+.32,h=S.h,np=tnPanels(S.L,.8);
 box('wood',0,bed,0,S.B,.1,S.L-.6,0x7a5a3c);for(const s of [-1,1])box('wood',s*(B2-.03),bed+.1,0,.06,.24,S.L-.6,0x6a4a30);box('wood',0,bed+.1,-L2+.33,S.B,.24,.06,0x6a4a30);
 for(const [z,r] of [[-L2+1.05,.58],[L2-1.15,.46]]){for(const s of [-1,1])tnWheel(s*(B2+.1),r,z,r);beam('wood',[-B2-.05,r,z],[B2+.05,r,z],.07,0x5a4430,false);}
 for(const s of [-1,1])beam('wood',[s*.4,bed,L2-.4],[s*.48,.72,L2+.85],.06,0x6a4a30,true,6);
 const arc=(u,v,z)=>{const a=PI*(1-v);return [Math.cos(a)*(B2+.05),bt+Math.sin(a)*(h-bt),z];},z0=-L2+.55,z1=L2-.75;
 for(let i=0;i<5;i++){const z=lerp(z0+.1,z1-.1,i/4),pts=[];for(let k=0;k<=10;k++)pts.push(arc(0,k/10,z));cord('wood',pts,.025,0x6a5038);}
 tnCloth((u,v)=>arc(0,v,lerp(z0,z1,u)),Math.round(S.L*2),8,{panels:np,band:true,bv0:.02,bv1:.1,out:[0,bt,0]});
 for(const e of [-1,1]){const zE=e>0?z1:z0;psurf(C.coverKey,(u,v)=>{const q=arc(0,v,0),k=lerp(1,.55,u);return [q[0]*k,bt+(q[1]-bt)*k,zE+e*.22*u];},2,8,C.cover);}
 tnPennant(-B2-.02,h-.12,z1+.1);door(0,0,L2,0,S.B);
 return {zf:L2,door:null};}
/* ---------------------------------------------------------------- screen: cloth on four posts round a pit, the way in at a side */
function tnScreen(S){const C=TN_CUR,W2=S.W/2,D2=S.D/2,h=S.h;
 for(const [x,z] of [[-W2,-D2],[W2,-D2],[W2,D2],[-W2,D2],[0,D2]])tnPole([x,-.05,z],[x,h,z],.04,6);
 const wall=(a,b)=>tnCloth((u,v)=>[lerp(a[0],b[0],u),lerp(.12,h-.08,v),lerp(a[1],b[1],u)],3,2,{out:[0,h/2,0]});
 wall([-W2,-D2],[W2,-D2]);wall([W2,-D2],[W2,D2]);wall([-W2,D2],[-W2,-D2]);wall([-W2,D2],[0,D2]);
 box('plain',0,.005,-.1,.9,.02,.7,0x2a2018);door(W2/2,0,D2,0,W2-.1);for(const x of [-.3,.3])box('wood',x,.02,-.1,.18,.05,.9,0x7a5a3c);
 return {zf:D2,door:null};}
const TN_BUILD={ridge:tnRidge,bell:tnBell,yurt:tnYurt,cone:tnCone,black:tnBlack,marquee:tnMarquee,wedge:tnWedge,fly:tnFly,awning:tnAwning,roundend:tnRoundend,wagon:tnWagon,screen:tnScreen};
