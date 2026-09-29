// ================================================================ PORT DRESSING
// Props and the reclaimed-life vocabulary, shared by every segment. All take
// LOCAL coordinates (KOFF is added by kput) and draw from the builder's own
// seeded rng(). `y` is always explicit: pass PORT.DECK on a deck, portH(x,z)
// on open ground, 0 on the water.
const PK_CONT_COL=[0xdcd8cf,0x2f5f8a,0x9a3a28,0xc89a3a,0x3a6a5a,0x80807c,0xb8532e,0x4a5070,0xe8e4da,0x2a4a6a].map(c=>new THREE.Color(c));
const PK_RUST=new THREE.Color(0x7a4630);
function portContColor(d){const c=PK_CONT_COL[(rng()*PK_CONT_COL.length)|0].clone();
 if(d>0)c.lerp(PK_RUST,rr(.3,.6));return c;}
// One container, bottom centre at (x,y,z), long axis along yaw (0 = along x).
function portContainer(x,y,z,yaw,big,d,col,tilt){
 kput((big?'pkCont40':'pkCont20')+(d>0?'R':''),[x,y,z],tilt?qEuler(tilt[0]||0,yaw,tilt[1]||0):qEuler(0,yaw,0),1,col||portContColor(d));}
// A block of containers: nRow side by side (across their length), up to
// nTier high, ragged on top. Returns the tallest tier count used.
function portContainerStack(x,y,z,yaw,nRow,nTier,d,o){o=o||{};const big=o.big!==undefined?o.big:rng()<.6;
 const c=Math.cos(yaw),s=Math.sin(yaw);let top=0;
 for(let r=0;r<nRow;r++){const off=(r-(nRow-1)/2)*2.74;const px=x+off*s,pz=z+off*c;
  const nt=Math.max(1,Math.min(nTier,Math.round(rr(.5,nTier+.49))));top=Math.max(top,nt);
  for(let t=0;t<nt;t++){const tilt=d===1&&t===nt-1&&rng()<.2?[rr(-.05,.05),rr(-.08,.08)]:null;
   portContainer(px+rr(-.06,.06),y+t*2.6,pz+rr(-.06,.06),yaw+rr(-.012,.012),big,d,null,tilt);}}
 return top;}

// ---------------------------------------------------------------- the stacked-container house
// portContainerHouse(G, x,y,z, yaw, d, o) -> {h, top:[x,y,z]}
// The reclaimed port's house: 1-3 containers stacked and skewed, cut with
// windows and a door, a timber stair, an awning over the door, and on the
// roof some of: solar panels, a dish, a water butt, planters, a washing line.
// o = {levels (1-3, random), big, lit (fraction of windows lit, .45), roof (true)}.
// REGISTERs itself as 'Container house' unless o.noReg.
function portContainerHouse(G,x,y,z,yaw,d,o){o=Object.assign({lit:.45,roof:true},o||{});
 const lv=o.levels||(1+Math.floor(rng()*2.6));const big=o.big!==undefined?o.big:rng()<.55;const Lc=big?12.19:6.06;
 const loc=(yw,lx,lz)=>{const c=Math.cos(yw),s=Math.sin(yw);return[lx*c+lz*s,-lx*s+lz*c];};
 let yy=y,yw=yaw;const col=new THREE.Color(PK_CONT_COL[(rng()*PK_CONT_COL.length)|0]).lerp(PK_RUST,rr(.1,.35));
 for(let l=0;l<lv;l++){
  if(l>0)yw=yaw+(rng()<.35?Math.PI/2:rr(-.25,.25));
  const ox=l>0?rr(-Lc*.18,Lc*.18):0;const o0=loc(yw,ox,0);const cx=x+o0[0],cz=z+o0[1];
  const cc=l===0?col:new THREE.Color(PK_CONT_COL[(rng()*PK_CONT_COL.length)|0]).lerp(PK_RUST,rr(.1,.4));
  kput(big?'pkCont40R':'pkCont20R',[cx,yy,cz],qEuler(0,yw,0),1,cc);
  const q=qEuler(0,yw,0),qb=qEuler(0,yw+Math.PI,0);
  // windows on both long sides, a door on one
  const nw=big?3:1;
  for(const side of [1,-1])for(let k=0;k<nw;k++){const u=(k-(nw-1)/2)*(Lc/(nw+.6))+(side<0&&!big?1.2:0);
   if(side>0&&l===0&&k===0&&big)continue;
   const p=loc(yw,ox+u,side*1.25);
   const lit=rng()<o.lit;kput(lit?'dot':'cellD',[x+p[0],yy+1.45,z+p[1]],side>0?q:qb,lit?[.8,1.3,.3]:[1.1,.9,.25],lit?WARM:null);}
  if(l===0){const dp=loc(yw,ox+(big?-Lc*.31:-1.6),1.26);kput('pkDoor',[x+dp[0],yy+1.05,z+dp[1]],q,[.95,2.05,1],new THREE.Color().setHSL(rr(0,1),.35,.35));
   const ap=loc(yw,ox+(big?-Lc*.31:-1.6),2.1);kput('pkAwn',[x+ap[0],yy+2.45,z+ap[1]],qEuler(-.22,yw,0).multiply(qEuler(0,0,0)),[2.6,1,1.8],new THREE.Color().setHSL(rr(0,1),rr(.3,.6),rr(.45,.7)));}
  if(l>0){const sp=loc(yw,ox+Lc/2+.7,-.4);kput('pkStair',[x+sp[0],yy-2.6,z+sp[1]],qEuler(0,yw+Math.PI,0),[1.1,1.3,1],null);}
  yy+=2.6;}
 if(o.roof){const r=rng();const tp=loc(yw,0,0);const rx=x+tp[0],rz=z+tp[1];
  if(r<.45){for(let k=0;k<(big?4:2);k++){const p=loc(yw,(k-(big?1.5:.5))*1.9,0);kput('pkSolar',[x+p[0],yy+.55,z+p[1]],qEuler(0,yw,0).multiply(qEuler(-.45,0,0)),1,null);}}
  else if(r<.7){kput('planter',[rx,yy+.3,rz],qEuler(0,yw,0),[Lc*.6,.6,1.6],null);
   for(let k=0;k<4;k++){const p=loc(yw,rr(-Lc*.28,Lc*.28),rr(-.5,.5));kput('leafCard',[x+p[0],yy+1.1,z+p[1]],qEuler(0,rng()*TAU,0),[rr(.6,1),rr(.5,.8),rr(.6,1)],new THREE.Color().setHSL(rr(.22,.32),.45,rr(.4,.6)));}}
  else{kput('waterButt',[rx,yy+.9,rz],null,[.9,1.8,.9],null);}
  if(rng()<.35){const p=loc(yw,Lc*.35,.6);kput('pkDish',[x+p[0],yy,z+p[1]],qEuler(0,rng()*TAU,0),1,null);}
  if(rng()<.3){const a=loc(yw,-Lc*.45,-.9),b=loc(yw,Lc*.45,-.9);portWashLine(x+a[0],z+a[1],x+b[0],z+b[1],yy+1.9,4);}}
 if(!o.noReg)REGISTER({name:'Container house',x,z,r:Lc*.6,h:yy-y+1,y});
 return {h:yy-y,top:[x,yy,z]};}

// ---------------------------------------------------------------- lamps, rails, boats
// A 14 m lamp mast standing at (x,y,z), arm toward yaw's local +z.
// d=0 lit with the Ancients' cyan; d=1 dark, leaning or fallen; d>=3 some
// relit warm by the new people.
function portLamp(x,y,z,yaw,d){
 if(d===1){const r=rng();
  if(r<.35){kput('pkLamp',[x,y+.3,z],qEuler(0,rng()*TAU,0).multiply(qEuler(0,0,Math.PI/2-.04)),1,new THREE.Color(0x8a5a40));return;}
  kput('pkLamp',[x,y,z],qEuler(rr(-.18,.18),yaw,rr(-.18,.18)),1,new THREE.Color(0x9a6a50));return;}
 const q=qEuler(0,yaw,0);
 kput('pkLamp',[x,y,z],q,1,d>0?new THREE.Color(0xa88a74):null);
 if(d===0)kput('pkLampGlow',[x,y,z],q,1,CYAN);else if(rng()<.5)kput('pkLampGlow',[x,y,z],q,1,WARM);}
// Rail track along x from xa to xb at z, top of sleepers at y+0.14.
function portRail(xa,xb,z,y,d){const n=Math.max(1,Math.round(Math.abs(xb-xa)/20)),L=(xb-xa)/n;
 const rc=d>0?new THREE.Color(0x7a4a32):null,sc=d>0?new THREE.Color(0x9a948a):null;
 for(let i=0;i<n;i++){const x=xa+(i+.5)*L;
  kput('pkSleepers',[x,y,z],null,[Math.abs(L)/20,1,1],sc);
  if(d===1&&rng()<.18)continue;
  kput('pkRail',[x,y,z],null,[Math.abs(L)/20,1,1],rc);}
 if(d>0)for(let i=0;i<n*3;i++)kput('moss',[rr(Math.min(xa,xb),Math.max(xa,xb)),y+.1,z+rr(-1.5,1.5)],null,[rr(.3,.8),.12,rr(.3,.7)],new THREE.Color().setHSL(rr(.2,.3),.4,rr(.08,.15)));}
const PK_BOAT_COL=[0xe8e4dc,0x2f6f9a,0xb8442e,0x3a7a5a,0xd8b04a,0x8a5a3a].map(c=>new THREE.Color(c));
// A skiff on the water at (x,z), bow along yaw's local +z. y defaults to 0.
function portSkiff(x,z,yaw,col,y){kput('pkSkiff',[x,y||0,z],qEuler(rr(-.04,.04),yaw,rr(-.06,.06)),1,col||PK_BOAT_COL[(rng()*PK_BOAT_COL.length)|0]);}
function portBuoy(x,z,col){kput('pkBuoy',[x,0,z],qEuler(rr(-.06,.06),rng()*TAU,rr(-.06,.06)),1,col||new THREE.Color(rng()<.5?0xc8402a:0xd8b030));}
// People for scale, standing at height y (or on the ground if y is null).
function portFigures(x,y,z,n,spread){for(let i=0;i<n;i++){const px=x+rr(-spread,spread),pz=z+rr(-spread,spread);
 const py=y==null?portH(px,pz):y;const c=new THREE.Color().setHSL(rr(0,.12),rr(.2,.55),rr(.22,.5));
 kput('figB',[px,py,pz],qEuler(0,rng()*TAU,0),1,c);kput('figH',[px,py,pz],null,1,new THREE.Color(0xc9a17e));}}
// A washing line between two points at height y, with n things pegged on it.
function portWashLine(ax,az,bx,bz,y,n){const L=Math.hypot(bx-ax,bz-az);if(L<.5)return;const yaw=Math.atan2(-(bz-az),bx-ax);
 kput('pkLine',[(ax+bx)/2,y,(az+bz)/2],qEuler(0,yaw,0),[L,1,1],null);
 for(let i=0;i<n;i++){const t=(i+.5)/n+rr(-.04,.04);kput('pkCloth',[ax+(bx-ax)*t,y,az+(bz-az)*t],qEuler(0,yaw,0),[rr(.5,1.1),rr(.5,1.1),1],new THREE.Color().setHSL(rng(),rr(.2,.6),rr(.45,.75)));}}
// A market stall: trestle, four poles, a striped awning, goods.
function portStall(x,y,z,yaw,col){const q=qEuler(0,yaw,0),c=Math.cos(yaw),s=Math.sin(yaw);
 const L=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
 let p=L(0,0);kput('plank',[p[0],y+.85,p[1]],q,[2.6,.1,1.1],null);
 for(const a of [[-1.25,-.5],[1.25,-.5],[-1.25,.5],[1.25,.5]]){p=L(a[0],a[1]);kput('plank',[p[0],y+.42,p[1]],q,[.08,.84,.08],null);}
 for(const a of [[-1.4,-.9],[1.4,-.9],[-1.4,1],[1.4,1]]){p=L(a[0],a[1]);kput('postR',[p[0],y+1.25,p[1]],null,[.05,2.5,.05],null);}
 p=L(0,.05);kput('pkAwn',[p[0],y+2.55,p[1]],q.clone().multiply(qEuler(.2,0,0)),[3.1,1,2.3],col||new THREE.Color().setHSL(rng(),rr(.35,.7),rr(.45,.65)));
 for(let i=0;i<5;i++){p=L(rr(-1.1,1.1),rr(-.35,.35));kput('plank',[p[0],y+1,p[1]],qEuler(0,rng()*TAU,0),[rr(.3,.6),rr(.2,.35),rr(.3,.5)],new THREE.Color().setHSL(rr(0,.2),rr(.4,.8),rr(.35,.6)));}}
// A garden bed: timber planters with crops, a tree or two. Centre (x,z), size w x dp.
function portGarden(x,y,z,w,dp,d){const n=Math.max(1,Math.round(w*dp/14));
 for(let i=0;i<n;i++){const px=x+rr(-w/2+1,w/2-1),pz=z+rr(-dp/2+.8,dp/2-.8),bw=rr(2,3.6),bd=rr(1,1.6),yw=Math.round(rng())*Math.PI/2;
  kput('planter',[px,y+.3,pz],qEuler(0,yw,0),[bw,.6,bd],null);
  for(let k=0;k<3;k++)kput('leafCard',[px+rr(-bw/3,bw/3)*Math.cos(yw),y+.95,pz+rr(-bd/3,bd/3)],qEuler(0,rng()*TAU,0),[rr(.4,.8),rr(.35,.6),rr(.4,.8)],new THREE.Color().setHSL(rr(.2,.34),rr(.4,.6),rr(.4,.62)));}
 if(w*dp>60)VEG.tree(x+rr(-w/3,w/3),y,z+rr(-dp/3,dp/3),(rng()*3)|0,rr(4,7));}

// Trees over a local rect, on the ground (y null) or on a deck at y. Use this,
// not the ancients' trees(): that one samples terrainH at LOCAL coordinates.
function portTrees(x0,z0,x1,z1,n,y,hMin,hMax){for(let i=0;i<n;i++){const x=rr(x0,x1),z=rr(z0,z1);
 VEG.tree(x,y==null?portH(x,z):y,z,i%3,rr(hMin||5,hMax||12));}}
// Weeds, shrubs and moss taking a surface back: a ruin's paving, a deck.
function portWeeds(x0,z0,x1,z1,n,y){for(let i=0;i<n;i++){const x=rr(x0,x1),z=rr(z0,z1),py=y==null?portH(x,z):y;
 if(rng()<.55)kput('moss',[x,py+.05,z],qEuler(0,rng()*TAU,0),[rr(.6,2.4),rr(.12,.3),rr(.6,2)],new THREE.Color().setHSL(rr(.2,.32),rr(.3,.5),rr(.07,.14)));
 else kput('leafCard',[x,py+.45,z],qEuler(0,rng()*TAU,0),[rr(.4,1),rr(.35,.6),rr(.4,1)],new THREE.Color().setHSL(rr(.18,.3),rr(.35,.55),rr(.35,.55)));}}
// Rubble in a heap at (x,y,z), radius r.
function portRubble(x,y,z,r,n){for(let i=0;i<n;i++){const a=rng()*TAU,q=Math.pow(rng(),1.5),s=rr(.4,1.6)*(1.2-q*.6);
 kput('rubble',[x+Math.cos(a)*r*q,y+s*.3+(1-q)*r*.15,z+Math.sin(a)*r*q],qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.8,1.4),s*rr(.5,.9),s*rr(.8,1.3)],new THREE.Color().setHSL(rr(.06,.1),rr(.05,.15),rr(.4,.58)));}}

// ---------------------------------------------------------------- the shed
// portShed(G, x,z, w,dp,h, d, o): a barrel-vaulted transit shed standing on
// the deck (o.y, default DECK), long axis along x: panelled walls, a vaulted
// roof (holed at d>0), gable ends under the vault, two big doors on the +z
// face (o.doorSide -1 puts them on -z), a clerestory band of panes.
// REGISTERs itself as o.name (default 'Transit shed').
function portShed(G,x,z,w,dp,h,d,o){o=Object.assign({y:PORT.DECK,rise:dp*.22,name:'Transit shed',doorSide:1},o||{});
 const y0=o.y,mat=SHELL(d),rise=o.rise,sd=rr(0,90);
 const roofY=zz=>h+rise*(1-Math.pow(zz/(dp/2),2));
 for(const s of [-1,1])pbBox(G,mat,x,y0+h/2,z+s*(dp/2-.15),w,h,.3,0,8);
 const hole=d>0?holeFn(d,sd,null,1.4):null;
 pbAdd(gridSurface((u,v)=>{const zz=(v-.5)*dp;return[x+(u-.5)*w,y0+roofY(zz)+.05,z+zz];},Math.max(4,Math.round(w/6)),10,
  {uS:w/8,vS:dp/8,hole:hole?(u,v)=>hole(u,v*dp*.6+h):null}),mat,G);
 for(const s of [-1,1])pbAdd(gridSurface((u,v)=>{const zz=(u-.5)*dp;return[x+s*w/2,y0+v*roofY(zz),z+zz];},10,4,{uS:dp/8,vS:h/8}),mat,G);
 const ds=o.doorSide;
 for(const f of [-.25,.25])kput('pkDoor',[x+f*w,y0+2.6,z+ds*(dp/2+.02)],null,[Math.min(7,w*.2),5.2,1],d===1?new THREE.Color(0x6a3a2a):new THREE.Color(0x3a4a5a));
 const nP=Math.round(w/3.2);
 for(let i=0;i<nP;i++){const px=x+(i+.5-nP/2)*3.2;if(d===1&&rng()<.5)continue;
  for(const s of [-1,1])kput(d===0?'pane':'paneD',[px,y0+h-1.1,z+s*(dp/2+.03)],null,[2.8,1.3,1],null);}
 if(d>0){scatterMoss(x,y0,z,dp*.4,dp*.7,12,2);}
 const nr=Math.max(1,Math.ceil(w/dp));for(let i=0;i<nr;i++)REGISTER({name:o.name,x:x+(i+.5-nr/2)*w/nr,z,r:Math.max(dp/2,w/nr/2)*1.04,h:h+rise,y:y0});}
