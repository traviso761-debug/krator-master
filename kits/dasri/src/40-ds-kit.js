// prefix: ds
// ================================================================= DASRI STRUCTURAL TOOLKIT: walls, plinths, cliff skirts, roofs, doors, stairs, spouts ([draw])
// Draws in the builder's local frame (origin = plot centre at y = 0, +z = street/valley front, -z = rear/cliff side).
// Supports BOTH standalone in-the-round placement (!o.cliff) and flush cliff-locked placement (o.cliff = true):
//   - Standalone: all 4 faces articulated, shallow below-grade footing (-0.10 m) unless o.lo asks for a slope plinth.
//   - Cliff mode (o.cliff): suppresses any protrusion past z = -d/2 on the rear (-z) face, adds rock-keying side-rear
//     collar nibs, and extends a battered stone retaining skirt (dsCliffSkirt) down to o.lo (default -DS_CFG.CLIFF_SKIRT)
//     so buildings lock seamlessly into steep desert cliffs and rock pinnacles without floating or z-fighting.

function dsInitRec(o,reg){
 o=o||{};
 if(!CURREC)return null;
 if(!CURREC.ds){
  CURREC.ds={
   register:reg||'urban',
   cliff:!!o.cliff,
   shibam:!!(o.shibam||(reg==='urban'&&(o.v|0)===1)),
   qamariya:0,
   jussBands:0,
   mashrabiya:0,
   mizab:0,
   domes:0,
   horns:0,
   skirtDepth:0,
   rearClear:true
  };
 }
 return CURREC.ds;
}

function dsTarget(x,y,z,name){
 if(PLACE_DRY||!CURREC)return;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 (CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name:name||'floor'});
}

/* dsPlinth(w, d, o): grounded masonry base + deep battered stone cliff/slope skirt when o.cliff or o.lo < -0.15 */
function dsPlinth(w,d,o){
 o=o||{};
 const cliff=!!o.cliff,reg=o.register||'urban';
 const mk=o.mk||(reg==='urban'?'basalt':'rubble'),col=o.col==null?P(mk==='basalt'?'basalt':mk==='ashlar'?'ashlar':'rubble'):o.col;
 const lo=o.lo!=null?Math.min(-.1,o.lo):(cliff?-DS_CFG.CLIFF_SKIRT:-.1);
 const depth=-lo;
 if(CURREC&&CURREC.ds)CURREC.ds.skirtDepth=Math.max(CURREC.ds.skirtDepth,depth);
 /* Rear Z stays strictly >= -d/2 in cliff mode so it never pokes behind a flush rock plane */
 const zBack=cliff?-d/2:-d/2-.08,zFront=d/2+.08;
 const zMid=(zBack+zFront)/2,pd=zFront-zBack,pw=w+.16;
 svNoWalk(()=>{
  if(depth<=.35){
   box(mk,0,lo,zMid,pw,depth,pd,col);
  }else{
   /* Stepped battered stone courses down into the cliff ledge / slope */
   const tiers=Math.min(4,Math.max(2,Math.ceil(depth/1.6)));
   for(let i=0;i<tiers;i++){
    const ya=lo+depth*(i/tiers),yb=lo+depth*((i+1)/tiers),grow=(tiers-1-i)*.14;
    const zb=cliff?-d/2:zBack-grow*.6,zf=zFront+grow;
    box(mk,0,ya,(zb+zf)/2,pw+grow*2,yb-ya+.02,zf-zb,col);
   }
   /* Battered stone buttress ribs on front and side faces for Dar al-Hajar rock-locked look */
   if(cliff){
    for(const sx of [-1,1]){
     box(mk,sx*(w/2+.1),lo*.85,0,.32,-lo*.85,d*.76,P(mk==='basalt'?'basalt':'rubble'));
     /* Rock-keying anchor nibs flush at rear corners (inside z >= -d/2) */
     box(mk,sx*(w/2+.18),0,-d/2+.28,.28,Math.min(2.4,o.anchorH==null?1.8:o.anchorH),.54,col);
    }
    box(mk,0,lo*.75,d/2+.12,w*.52,-lo*.75,.28,col);
   }
  }
 });
 /* Walkable ground floor slab inside the plinth */
 box('floor',0,0,0,w-.24,.08,d-.24,P('floor'));
}

/* dsWall(x0, z0, x1, z1, y0, h, o): straight wall with cut holes [{at, w, y, h}], optional stone socle & interior plaster */
function dsWall(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?DS_CFG.WALL_URB:o.t,soc=o.socle==null?0:o.socle;
 const mk=o.mk||'brick',col=o.col==null?P(mk==='qadad'?'qadad':mk==='banco'?'banco':mk==='basalt'?'basalt':mk==='ashlar'?'ashlar':mk==='rubble'?'rubble':'brick'):o.col;
 const smk=o.socleMk||'basalt',scol=o.socleCol==null?P(smk==='ashlar'?'ashlar':smk==='rubble'?'rubble':'basalt'):o.socleCol;
 const L=Math.hypot(x1-x0,z1-z0);if(L<.05||h<.05)return;
 const yaw=Math.atan2(z0-z1,x1-x0);
 const holes=(o.holes||[]).map(q=>({a:q.at-q.w/2,b:q.at+q.w/2,y0:y0+(q.y==null?0:q.y),y1:y0+(q.y==null?0:q.y)+q.h}));
 const p0=o.trim==null?0:o.trim,p1=L-p0;
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  const X=s=>s-L/2;
  const run=(a,b,ya,yb)=>{
   if(b-a<.01||yb-ya<.01)return;
   const sa=Math.max(ya,y0),sh=Math.min(yb,y0+soc);
   if(soc>0&&sh>sa){
    const szOff=o.flushOut?-.015:0,st=o.flushOut?t:t+.05;
    box(smk,X((a+b)/2),sa,szOff,b-a,sh-sa,st,scol);
   }
   const ba=Math.max(ya,y0+soc);
   if(yb>ba)box(mk,X((a+b)/2),ba,0,b-a,yb-ba,t,col);
   const ia=Math.max(a,p0),ib=Math.min(b,p1);
   if(o.inner&&ib-ia>.02)box('qadad',X((ia+ib)/2),Math.max(ya,y0)+.02,o.inner*(t/2+.01),ib-ia,yb-Math.max(ya,y0)-.02,.018,P('qadadWarm'));
  };
  const xs=[...new Set([0,L].concat(...holes.map(q=>[q.a,q.b])).filter(v=>v>=0&&v<=L))].sort((p,q)=>p-q);
  for(let i=1;i<xs.length;i++){
   const a=xs[i-1],b=xs[i],m=(a+b)/2;
   const open=holes.filter(q=>q.a<m&&q.b>m).map(q=>[q.y0,q.y1]).sort((p,q)=>p[0]-q[0]);
   let y=y0;
   for(const r of open){if(r[0]>y)run(a,b,y,r[0]);y=Math.max(y,r[1]);}
   run(a,b,y,y0+h);
  }
  /* Optional horizontal madamik mudbrick course ribs on village banco walls */
  if(o.madamik&&!o.flushOut){
   svNoWalk(()=>{
    for(let yy=y0+Math.max(.55,soc+.45);yy<y0+h-.25;yy+=.58){
     const blocked=holes.some(q=>yy>q.y0-.08&&yy<q.y1+.08);
     if(!blocked)box('banco',0,yy,t/2+.014,L-.08,.055,.026,P('bancoL'));
    }
   });
  }
 });
}

/* dsRing(x0, z0, x1, z1, y0, h, o): 4-wall hollow shell over outer rectangle [x0..x1, z0..z1]; outward is each line's left (+z local in W) */
function dsRing(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?DS_CFG.WALL_URB:o.t,e=t/2,H=o.holes||{},skip=o.skip||'';
 const side=(k,ax,az,bx,bz,flushOut)=>{
  if(skip.indexOf(k)>=0)return;
  const hs=(H[k]||[]).map(q=>Object.assign({},q,{at:q.at}));
  dsWall(ax,az,bx,bz,y0,h,Object.assign({},o,{holes:hs,inner:o.plaster===false?0:-1,trim:t,flushOut}));
 };
 /* s (+z front), e (+x right), n (-z rear), w (-x left): outer faces sit cleanly at z1, x1, z0, x0 */
 side('s',x0,z1-e,x1,z1-e,false);
 side('e',x1-e,z1,x1-e,z0,false);
 side('n',x1,z0+e,x0,z0+e,!!o.cliffRear);
 side('w',x0+e,z0,x0+e,z1,false);
}

/* dsSolidTier(x0, z0, x1, z1, y0, h, o): solid upper tower tier (saves interior triangles while keeping crisp exterior masonry & quoins) */
function dsSolidTier(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;
 const mk=o.mk||'brick',col=o.col==null?P(mk==='qadad'?'qadad':mk==='banco'?'banco':mk==='basalt'?'basalt':mk==='ashlar'?'ashlar':'brick'):o.col;
 svNoWalk(()=>{
  if(o.ablaq){
   /* Alternating dark basalt & buff sandstone ashlar courses */
   const ch=.38,n=Math.max(2,Math.round(h/ch)),step=h/n;
   for(let i=0;i<n;i++){
    const odd=i%2===1;
    box(odd?'ashlar':'basalt',cx,y0+i*step,cz,w,step+.004,d,P(odd?'ashlar':'basalt'));
   }
  }else{
   box(mk,cx,y0,cz,w,h,d,col);
  }
  /* Dressed stone corner quoins when o.quoins is set */
  if(o.quoins){
   const qmk=o.quoinMk||'ashlar',qcol=P(qmk==='qadad'?'qadad':'ashlar'),ch=.44,n=Math.floor(h/ch);
   for(let i=0;i<n;i++){
    const longX=i%2===0,qw=longX?.38:.24,qd=longX?.24:.38;
    for(const sx of [-1,1])for(const sz of [-1,1]){
     if(o.cliffRear&&sz<0)continue;
     const qx=sx>0?x1-qw/2+.015:x0+qw/2-.015,qz=sz>0?z1-qd/2+.015:z0+qd/2-.015;
     box(qmk,qx,y0+i*ch+.02,qz,qw,ch-.04,qd,qcol);
    }
   }
  }
  /* Subtle horizontal madamik ridges for village mudbrick volumes */
  if(o.madamik){
   for(let yy=y0+.56;yy<y0+h-.25;yy+=.58){
    box('banco',cx,yy,z1+.012,w-.08,.05,.024,P('bancoL'));
    box('banco',x0-.012,yy,cz,.024,.05,d-.08,P('bancoL'));
    box('banco',x1+.012,yy,cz,.024,.05,d-.08,P('bancoL'));
    if(!o.cliffRear)box('banco',cx,yy,z0-.012,w-.08,.05,.024,P('bancoL'));
   }
  }
 });
}

/* dsRoof(x0, z0, x1, z1, y, o): flat qadad waterproofed roof (urban) or packed-earth roof on juniper pole ends (village) */
function dsRoof(x0,z0,x1,z1,y,o){
 o=o||{};
 const w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2,t=o.t==null?.22:o.t;
 const vil=o.style==='village';
 const mk=vil?'roof':'qadad',col=o.col==null?P(vil?'roofVil':'qadadWarm'):o.col;
 if(vil&&o.poles!==false){
  /* Exposed juniper/tamarisk beam ends projecting under village roof eaves (never past -z in cliff mode) */
  svNoWalk(()=>{
   const over=.18,n=Math.max(3,Math.round(w/.62));
   for(let i=0;i<n;i++){
    const px=x0+(i+.5)*w/n,zb=o.cliffRear?z0+.08:z0-over;
    pole('timber',[px,y-.07,zb],[px,y-.07,z1+over],.065,P('timber'),7);
   }
  });
 }
 if(o.walk===false){
  svNoWalk(()=>box(mk,cx,y,cz,w,t,d,col));
 }else{
  svWell(mk,cx,y,cz,w,t,d,col,o.hole||null);
 }
 return y+t;
}

/* dsArchPortal(x, y, zf, yaw, w, h, o): Yemeni dressed-stone arched street portal with operable studded cedar KDOOR leaf
   and optional qamariya stained-glass over-transom fanlight! */
function dsArchPortal(x,y,zf,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?DS_CFG.WALL_URB:o.t,smk=o.stoneMk||'ashlar',scol=P(smk==='basalt'?'basalt':smk==='rubble'?'rubble':'ashlar');
 const hollow=o.hollow!==false,openPortal=!!o.open;
 W(x,y,zf,yaw,()=>{
  svNoWalk(()=>{
   /* Stone jambs, threshold step, and lintel beam */
   for(const s of [-1,1])box(smk,s*(w/2+.14),0,-.02,.28,h+.18,t+.1,scol);
   box(smk,0,-.02,.04,w+.42,.1,t+.18,scol);
   box('cedar',0,h,-.02,w+.32,.14,t+.12,P('cedar'));
   /* Semicircular stone voussoir arch + crisp white qadad hood over the doorway */
   if(o.arch!==false){
    const R=w*.54,nV=9;
    for(let i=0;i<nV;i++){
     const a=PI*(i+.5)/nV,vx=Math.cos(a)*(R+.11),vy=h+.14+Math.sin(a)*(R+.11);
     const vcol=(o.ablaq&&i%2===1)?P('basalt'):scol,vmk=(o.ablaq&&i%2===1)?'basalt':smk;
     box(vmk,vx,vy-.09,.03,.2,.22,.12,vcol,0,0,a-PI/2);
    }
    /* Qamariya fanlight lunette inside the portal arch */
    if(o.fanlight!==false){
     const gcol=o.glassHex==null?DS_GLASS_HEX[(Math.abs(Math.round(x*7+zf*3))%DS_GLASS_HEX.length)]:o.glassHex;
     const pts=[];
     for(let i=0;i<=10;i++){const a=PI*i/10;pts.push([-Math.cos(a)*(R-.03),h+.14+Math.sin(a)*(R-.03),-.02]);}
     svPanePoly(pts,{kind:'stained',color:gcol,solid:!hollow});
     /* White gypsum radial spokes inside portal lunette */
     for(let i=1;i<5;i++){
      const a=PI*i/5;
      beam('qadad',[0,h+.15,.01],[Math.cos(a)*(R-.05),h+.14+Math.sin(a)*(R-.05),.01],.028,P('qadad'));
     }
     if(CURREC&&CURREC.ds)CURREC.ds.qamariya++;
    }
   }
  });
  if(openPortal){
   if(!hollow)svRoom(0,0,-.06,0,w,h);
  }else{
   svLeaf(0,.08,-.04,0,w-.06,h-.08,{
    mk:'cedar',
    col:P('cedar'),
    style:o.style||'plank',
    hwCol:0xb88c44,
    locked:!hollow,
    split:o.split!=null?o.split:w>1.45,
    name:o.name||'street door'
   });
  }
  door(0,0,.02,0,w,h);
 });
}

/* dsMizab(x, yTop, yBot, zf, yaw, o): vertical white qadad lime-plastered rain runoff channel + projecting stone/wood mizab spout */
function dsMizab(x,yTop,yBot,zf,yaw,o){
 o=o||{};
 W(x,0,zf,yaw,()=>{
  svNoWalk(()=>{
   /* Projecting rain-spout gargoyle just below the roof scupper */
   const spL=o.spoutLen==null?.52:o.spoutLen,mk=o.wood?'timber':'ashlar',col=P(o.wood?'timber':'ashlar');
   box(mk,0,yTop-.18,spL/2-.02,.15,.11,spL,col);
   box('qadad',0,yTop-.12,.04,.24,.18,.1,P('qadad'));
   /* Vertical white qadad limewash drainage strip down the wall (Sana'a & Shibam signature) */
   if(o.chute!==false&&yTop-yBot>1.5){
    const h=yTop-.22-yBot;
    box('qadad',0,yBot+.1,.018,.26,h,.032,P('qadad'));
    for(const s of [-1,1])box('qadad',s*.11,yBot+.1,.032,.04,h,.022,P('qadadWarm'));
   }
  });
 });
 if(CURREC&&CURREC.ds)CURREC.ds.mizab++;
}
