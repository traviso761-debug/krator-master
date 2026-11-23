// ================================================================= 69n. MARR: architectural & courtyard helpers (prefix ma)
// Built on the Iziz Vernacular's vn* helpers (69c). Every face helper takes the face's outward yaw ry like vnWin and
// vnDoor: (x, z) is a point ON the face, +z of the face is outward. No direct THREE.* or Geometry calls: pure [G data].

// a slab on a face: (x, z) on the face, yc centre height, `out` how far its front stands proud, d depth back from there
function maSlab(item,x,yc,z,ry,w,h,out,d,c){const f=loc(x,z,0,out-d/2,ry);vBq(item,f[0],yc,f[1],w,h,d,vQ(ry,0,0),c);}

// a string course / belt moulding round a block w x d centred at (x, z)
function maBand(x,y,z,w,d,ry,c,proud,h,item){const pr=proud==null?.14:proud,hh=h==null?.2:h;
 if(VERN.cur&&VERN.cur.hollow)vnBand(item||'vPlaster',x,y,z,w+2*pr,hh,d+2*pr,ry,c,.32);
 else vB(item||'vPlaster',x,y,z,w+2*pr,hh,d+2*pr,ry,c);}

// carved volcanic cantera stone corner quoins up all 4 corners of a block w x d from y to y+h
function maQuoins(x,y,z,w,h,d,ry,c,qw){const q=qw==null?.48:qw,n=Math.max(3,Math.floor(h/.55)),sh=h/n;
 for(const sx of[-1,1])for(const sz of[-1,1]){
  for(let k=0;k<n;k++){const long=(k&1)===0,qx=long?q:q*.68,qz=long?q*.68:q;
   const p=loc(x,z,sx*(w/2-qx/2+.04),sz*(d/2-qz/2+.04),ry);
   vB('maCantera',p[0],y+k*sh+.02,p[1],qx,sh-.04,qz,ry,c);}}}

// flat colonial roof parapet around a block w x d with moulded coping and optional corner ceramic urn finials
function maParapet(x,y,z,w,d,ry,wallC,capC,h,urns){const hh=h==null?.78:h,cc=capC||wallC;
 for(const [lx,lz,a,L] of[[0,d/2-.14,0,w],[0,-d/2+.14,0,w],[w/2-.14,0,Math.PI/2,d],[-w/2+.14,0,Math.PI/2,d]]){
  const p=loc(x,z,lx,lz,ry);
  vB('vPlaster',p[0],y,p[1],L,hh,.26,ry+a,wallC);
  vB('maCantera',p[0],y+hh,p[1],L+.12,.1,.36,ry+a,cc);}
 if(urns){for(const sx of[-1,1])for(const sz of[-1,1]){
  const p=loc(x,z,sx*(w/2-.18),sz*(d/2-.18),ry);
  vB('maCantera',p[0],y+hh+.1,p[1],.42,.18,.42,ry,cc);
  kput('maUrn',[p[0],y+hh+.28,p[1]],null,[.38,.62,.38],cc);}}}

// an arc band of n straight segments on a face centred at (x, yc, z), radius K
function maArcBand(x,yc,z,ry,K,bw,dp,out,c,a0,a1,n,item){const nn=n==null?Math.max(5,Math.round((a1-a0)*K*3)):n,seg=(a1-a0)/nn,L=2*K*Math.sin(seg/2)+bw*.55;
 for(let k=0;k<nn;k++){const a=a0+(k+.5)*seg,p=loc(x,z,Math.cos(a)*K,out-dp/2,ry);
  vBq(item||'maCantera',p[0],yc+Math.sin(a)*K,p[1],bw,L,dp,vQ(ry,0,a),c);}}

// Spanish Colonial round-headed or flat-headed window/door/arch on a face
// o = {fill:'G'|'L'|'DOOR'|'O' (open), band:c, key:c, sill:c, shutters:c, reja:c, leafC:c, bw:.15, front:bool, gate:bool, attic:bool, cut:bool, card:bool}
function maArch(x,y,z,ry,w,h,o){o=o||{};const r=w/2,hb=Math.max(.1,h-r),yc=y+hb/2,bw=o.bw==null?.15:o.bw,out=.08;
 const fill=o.fill||((h>=2.0&&!o.sill&&!o.reja)?'DOOR':'G');
 const F=(!o.blind&&!o.attic&&!o.gate&&typeof vnOnHollow==='function')?vnOnHollow(x,y,z,ry):null,wt=F?F.B.t:.28;
 const bandC=o.band||MA_CANT(),bi=o.bandItem||'maCantera',wood=o.leafC||MA_WOOD();
 if(fill==='DOOR'&&o.sill==null&&!o.attic&&!o.gate&&y<1.5)vnStoopLater(x,y,z,ry,w,'maCantera',bandC);
 let cut=false;
 if(fill==='O'){
  cut=o.card===false||((!!o.cut||!!F)&&vnHole(x,y,z,ry,w,h,false));
 }else if(fill==='DOOR'){
  cut=o.card===false||(!o.attic&&!o.gate&&vnHole(x,y,z,ry,w,h,true));
  const open=cut||o.gate||(o.open&&!o.attic),dz=cut?.04-wt/2:.05;
  if(open){const s=loc(x,z,0,cut?-wt/2:0,ry);vB('maCantera',s[0],y-.02,s[1],w+.1,.06,wt+.12,ry,bandC);}
  else{const b=loc(x,z,0,.02,ry);vB(o.attic?'vWood':'vPlaster',b[0],y,b[1],w,hb,.04,ry,o.attic?wood:IZ_ROOMC);}
  // glazed fanlight (or wooden tympanum on attic hoist doors) in the round head + timber double/single door leaf below
  const g=loc(x,z,0,dz,ry);
  if(o.attic){
   kput('maHalfW',[g[0],y+hb,g[1]],vQ(ry,0,0),[r,r,.06],wood);
  }else{
   if(!cut&&!o.gate){const b=loc(x,z,0,.015,ry);kput('maHalfP',[b[0],y+hb,b[1]],vQ(ry,0,0),[r,r,.03],IZ_ROOMC);}
   kput(o.lit?'maHalfL':'maHalfG',[g[0],y+hb,g[1]],vQ(ry,0,0),[r,r,.024],null);
   for(const a of[Math.PI/4,Math.PI/2,3*Math.PI/4]){const mp=loc(x,z,Math.cos(a)*r*.48,dz,ry);
    vBq('vWood',mp[0],y+hb+Math.sin(a)*r*.48,mp[1],.038,r*.92,.06,vQ(ry,0,a-Math.PI/2),wood);}
  }
  const tr=loc(x,z,0,dz,ry);vB('vWood',tr[0],y+hb-.08,tr[1],w,.09,.14,ry,wood);
  const m=loc(x,z,0,dz+.01,ry);
  const leaf=IZDOOR.leaf(m[0],y,m[1],ry,w-.04,hb-.09,.08,wood,{locked:!open,pair:w>1.35,style:o.attic?'plank+banded':'panel+pull'});
  if(open&&leaf&&o.front)leaf._front=true;
 }else{
  const lit=fill==='L';
  cut=o.card===false||(!o.blind&&vnHole(x,y,z,ry,w,h,false));
  const gz=cut?.04-wt/2:.05,g=loc(x,z,0,gz,ry);
  if(!cut){
   const b=loc(x,z,0,.015,ry);
   vB('vPlaster',b[0],y,b[1],w,hb,.03,ry,IZ_ROOMC);
   kput('maHalfP',[b[0],y+hb,b[1]],vQ(ry,0,0),[r,r,.03],IZ_ROOMC);
  }
  vB(lit?'vWinLit':'vWinClear',g[0],y,g[1],w,hb,.03,ry,null);
  kput(lit?'maHalfL':'maHalfG',[g[0],y+hb,g[1]],vQ(ry,0,0),[r,r,.024],null);
  // outer wooden casement frame, springline transom bar, center mullion, horizontal muntins & radial fanlight bars
  for(const s of[-1,1]){const jf=loc(x,z,s*(w/2-.035),gz,ry);vB('vWood',jf[0],y,jf[1],.07,hb,.09,ry,wood);}
  vB('vWood',g[0],y,g[1],w,.06,.1,ry,wood);
  vB('vWood',g[0],y+hb-.04,g[1],w,.07,.1,ry,wood);
  vB('vWood',g[0],y,g[1],.055,hb,.08,ry,wood);
  for(const f of[.34,.68])vB('vWood',g[0],y+hb*f,g[1],w,.042,.07,ry,wood);
  for(const a of[Math.PI/4,Math.PI/2,3*Math.PI/4]){const mp=loc(x,z,Math.cos(a)*r*.48,gz,ry);
   vBq('vWood',mp[0],y+hb+Math.sin(a)*r*.48,mp[1],.036,r*.92,.06,vQ(ry,0,a-Math.PI/2),wood);}
 }
 // deep stone/plaster reveal jambs & arch voussoirs spanning the full wall reveal when cut, plus exact 1-piece MASPANDREL fill
 const dp=cut?wt+out+.04:.16;
 if(F&&cut){
  const spItem=(F.B.item==='maCantera'||F.B.item==='vStone')?'maSpandrelC':(F.B.item==='vIron'?'maSpandrelI':'maSpandrelP');
  const sp=loc(x,z,0,-wt/2,ry);
  kput(spItem,[sp[0],y+hb,sp[1]],vQ(ry,0,0),[r+.01,r+.01,wt],F.B.c);
 }
 if(o.band||cut){
  maArcBand(x,y+hb,z,ry,r+bw/2,bw,dp,out,bandC,0,Math.PI,14,bi);
  for(const s of[-1,1]){const p=loc(x,z,s*(r+bw/2),out-dp/2,ry);vB(bi,p[0],y-.02,p[1],bw,hb+.02,dp,ry,bandC);}
  if(o.key){const k=loc(x,z,0,out+.03,ry);vB(bi,k[0],y+h-bw*.35,k[1],bw*1.5,bw*1.9,.16,ry,o.key);}}
 if(o.sill||(fill!=='DOOR'&&fill!=='O'&&o.sill!==false))maSlab('maCantera',x,y-.06,z,ry,w+2*bw+.14,.12,out+.08,dp+.08,o.sill||bandC);
 if(o.shutters){const sc=o.shutters,sw=Math.min(.44,w*.38);
  for(const s of[-1,1]){const p=loc(x,z,s*(w/2+sw/2+.04),.06,ry);
   vB('vWood',p[0],y+.04,p[1],sw,hb-.06,.05,ry,sc);
   for(const f of[.12,.5,.88])vB('vWood',p[0],y+hb*f,p[1],sw+.03,.05,.07,ry,sc);}}
 // Spanish wrought-iron window grille (reja) standing proud on corbels
 if(o.reja){const ic=o.reja,ro=.18,f=loc(x,z,0,ro,ry);
  vB('vIron',f[0],y-.02,f[1],w+.16,.04,.2,ry,ic);
  vB('vIron',f[0],y+hb*.48,f[1],w+.16,.035,.2,ry,ic);
  vB('vIron',f[0],y+hb-.04,f[1],w+.16,.04,.2,ry,ic);
  const nb=Math.max(3,Math.round(w/.2));
  for(let k=0;k<=nb;k++){const p=loc(x,z,-w/2+k*w/nb,ro,ry);vB('vIron',p[0],y-.02,p[1],.028,hb+.04,.028,ry,ic);}}
 return y+h;}

// rectangular shuttered colonial casement window with deep reveal, multi-pane muntin grid, louvered shutters & optional iron reja
function maShutterWin(x,y,z,ry,w,h,lit,frameC,shutterC,rejaC){
 const F=typeof vnOnHollow==='function'?vnOnHollow(x,y,z,ry):null,wt=F?F.B.t:.25,fc=frameC||MA_CANT(),wc=shutterC||MA_WOOD();
 vnWin(x,y,z,ry,w,h,lit?'lit':'glass','maCantera',fc,false);
 // deep stone reveal lining through the cut wall + multi-pane colonial casement muntins
 if(F){const dp=wt+.12;
  for(const s of[-1,1]){const j=loc(x,z,s*(w/2+.06),.08-dp/2,ry);vB('maCantera',j[0],y-.06,j[1],.12,h+.12,dp,ry,fc);}
  const l=loc(x,z,0,.08-dp/2,ry);vB('maCantera',l[0],y+h,l[1],w+.24,.12,dp,ry,fc);
  vB('maCantera',l[0],y-.1,l[1],w+.28,.1,dp+.08,ry,fc);}
 const gz=F?.05-wt/2:.06,g=loc(x,z,0,gz,ry);
 for(const f of[.25,.75])vB('vWood',g[0],y+h*f,g[1],w,.04,.07,ry,wc);
 for(const s of[-1,1]){const jf=loc(x,z,s*(w/2-.03),gz,ry);vB('vWood',jf[0],y,jf[1],.06,h,.08,ry,wc);}
 if(shutterC){const sw=Math.min(.44,w*.4);
  for(const s of[-1,1]){const p=loc(x,z,s*(w/2+sw/2+.05),.06,ry);
   vB('vWood',p[0],y+.04,p[1],sw,h-.08,.05,ry,shutterC);
   for(const f of[.12,.5,.88])vB('vWood',p[0],y+h*f,p[1],sw+.03,.05,.07,ry,shutterC);}}
 if(rejaC){const f=loc(x,z,0,.18,ry),rh=h*.88;
  vB('vIron',f[0],y,f[1],w+.14,.04,.2,ry,rejaC);
  vB('vIron',f[0],y+rh*.5,f[1],w+.14,.035,.2,ry,rejaC);
  vB('vIron',f[0],y+rh,f[1],w+.14,.04,.2,ry,rejaC);
  const nb=Math.max(3,Math.round(w/.2));
  for(let k=0;k<=nb;k++){const p=loc(x,z,-w/2+k*w/nb,.18,ry);vB('vIron',p[0],y,p[1],.026,rh+.04,.026,ry,rejaC);}}}

// circular rose window or oculus on a face: cuts hollow wall, fills upper & lower spandrels, places clear/lit glass + wheel spokes + stone ring
function maOculus(x,yc,z,ry,r,lit,bandC,spokeC){
 const F=typeof vnOnHollow==='function'?vnOnHollow(x,yc,z,ry):null,cut=!!F&&vnHole(x,yc-r,z,ry,2*r,2*r,false),wt=F?F.B.t:.24,gz=cut?.04-wt/2:.05;
 const sc=spokeC||MA_WOOD(),bc=bandC||MA_CANT();
 if(cut){
  const spItem=(F.B.item==='maCantera'||F.B.item==='vStone')?'maSpandrelC':'maSpandrelP';
  const sp=loc(x,z,0,-wt/2,ry);
  kput(spItem,[sp[0],yc,sp[1]],vQ(ry,0,0),[r+.01,r+.01,wt],F.B.c);
  kput(spItem,[sp[0],yc,sp[1]],vQ(ry,0,Math.PI),[r+.01,r+.01,wt],F.B.c);
 }
 else{const b=loc(x,z,0,.015,ry);kput('maDisc',[b[0],yc,b[1]],vQ(ry,0,0),[r,r,.03],IZ_ROOMC);}
 const g=loc(x,z,0,gz,ry);kput(lit?'maDiscL':'maDiscG',[g[0],yc,g[1]],vQ(ry,0,0),[r,r,.03],null);
 for(let k=0;k<4;k++)vBq('vWood',g[0],yc,g[1],.045,r*1.92,.06,vQ(ry,0,k*Math.PI/4),sc);
 kput('maRing',[g[0],yc,g[1]],vQ(ry,Math.PI/2,0),[r*.45,r*.45,.8],sc);
 maArcBand(x,yc,z,ry,r+.07,.14,cut?wt+.14:.18,.07,bc,0,TAU,16,'maCantera');}

// Antiguan / Havana Baroque carved volcanic-stone portal (portada) around an arched zaguán doorway
function maCanteraPortal(x,y,z,ry,w,h,stoneC,accentC,woodC,o){o=o||{};
 const pw=w+1.35,ph=h+.85,f=loc(x,z,0,.14,ry);
 // stepped stone surround piers and rusticated pilasters
 for(const s of[-1,1]){
  const p=loc(x,z,s*(w/2+.32),.14,ry);vB('maCantera',p[0],y,p[1],.56,h+.35,.28,ry,stoneC);
  const q=loc(x,z,s*(w/2+.36),.26,ry);vPst('maCol',q[0],y+.35,q[1],.16,h-.1,stoneC);
  vB('maCantera',q[0],y,q[1],.4,.35,.38,ry,stoneC);vB('maCantera',q[0],y+h+.25,q[1],.42,.22,.4,ry,accentC||stoneC);}
 // arched doorway with studded mahogany double doors
 maArch(x,y,z,ry,w,h,{fill:'DOOR',band:accentC||stoneC,key:stoneC,leafC:woodC,bw:.18,open:o.open,front:o.front,gate:o.gate,attic:o.attic,sill:o.sill,lit:o.lit});
 // heavy entablature & baroque scrolled broken pediment with central finial or niche
 vB('maCantera',f[0],y+h+.46,f[1],pw+.3,.24,.36,ry,stoneC);
 vB('maYeseria',f[0],y+h+.7,f[1],pw+.18,.22,.32,ry,accentC||stoneC);
 vB('maCantera',f[0],y+h+.92,f[1],pw+.48,.16,.44,ry,stoneC);
 if(o.pediment!==false){
  for(const s of[-1,1]){const p=loc(x,z,s*(pw*.28),.18,ry);
   vBq('maCantera',p[0],y+h+1.32,p[1],pw*.38,.22,.34,vQ(ry,0,-s*.36),stoneC);
   const c=loc(x,z,s*(pw*.42),.2,ry);kput('maDiscC',[c[0],y+h+1.22,c[1]],vQ(ry,0,0),[.26,.26,.34],stoneC);}
  // central baroque medallion & urn finial in the broken pediment gap
  const m=loc(x,z,0,.2,ry);
  vB('maCantera',m[0],y+h+1.08,m[1],.78,.72,.3,ry,stoneC);
  kput('maDisc',[m[0],y+h+1.45,m[1]],vQ(ry,0,0),[.28,.36,.34],accentC||stoneC);
  kput('maUrn',[m[0],y+h+1.82,m[1]],null,[.32,.55,.32],stoneC);}
 if(o.lamps!==false){for(const s of[-1,1]){const lp=loc(x,z,s*(w/2+.75),.28,ry);vnLamp(lp[0],y+h*.72,lp[1],ry);}}
 return y+ph+.9;}

// Spanish Colonial ground or upper stone arcade along a face: n arches of span `span` with piers/columns & full spandrel masonry wall
function maArcade(x,y,z,ry,n,span,h,pierW,stoneC,accentC,o){o=o||{};
 const L=n*span+(n+1)*pierW,r=span/2,hb=Math.max(.4,h-r);
 for(let k=0;k<=n;k++){const u=-L/2+pierW/2+k*(span+pierW),p=loc(x,z,u,.08,ry);
  if(o.col){vB('maCantera',p[0],y,p[1],pierW*.95,.32,pierW*.95,ry,stoneC);
   vPst('maCol',p[0],y+.32,p[1],pierW*.38,hb-.52,stoneC);
   vB('maCantera',p[0],y+hb-.2,p[1],pierW,0.22,pierW,ry,accentC||stoneC);
   vB('maCantera',p[0],y+hb,p[1],pierW,r+.02,.32,ry,stoneC);}
  else vB('maCantera',p[0],y,p[1],pierW,h,.32,ry,stoneC);}
 for(let k=0;k<n;k++){const u=-L/2+pierW+span/2+k*(span+pierW),p=loc(x,z,u,0,ry);
  const onH=typeof vnOnHollow==='function'?vnOnHollow(p[0],y,p[1],ry):null;
  if(!onH){const sp=loc(x,z,u,.08,ry);kput('maSpandrelC',[sp[0],y+hb,sp[1]],vQ(ry,0,0),[r+.02,r+.02,.32],stoneC);}
  maArch(p[0],y,p[1],ry,span,h,{fill:o.fill||'G',band:accentC||stoneC,key:stoneC,bw:.16,leafC:o.leafC});}
 const topP=loc(x,z,0,.08,ry);
 vB('maCantera',topP[0],y+h,topP[1],L+.16,.2,.42,ry,accentC||stoneC);
 return L;}

// New Orleans wrought-iron gallery (galería de hierro) projecting `depth` in front of a face at (x, y, z)
// o = {storeys:1|2, h2:3.2, roof:true, tileC, pots:true, col:true, groundPosts:bool, y0:number}
function maIronGallery(x,y,z,ry,len,depth,h,ironC,deckC,o){o=o||{};
 const st=o.storeys==null?1:o.storeys,h2=o.h2==null?h:o.h2,nb=Math.max(2,Math.round(len/2.8));
 const drawCorbels=yy=>{
  for(let k=0;k<=nb;k++){const u=-len/2+k*len/nb,c=loc(x,z,u,depth*.32,ry);
   vB('vIron',c[0],yy-.50,c[1],.08,.36,depth*.84,ry,ironC);
   const d2=loc(x,z,u,depth*.22,ry);
   vB('vIron',d2[0],yy-.66,d2[1],.08,.22,depth*.56,ry,ironC);}};
 const drawDeck=(yy, rail)=>{
  const d=loc(x,z,0,depth/2,ry);
  vB('vWood',d[0],yy-.14,d[1],len+.16,.14,depth,ry,deckC);
  vB('vIron',d[0],yy-.2,d[1],len+.2,.06,depth+.06,ry,ironC);
  maWalkFloor(d[0],yy,d[1],len,depth,ry,'iron gallery');
  if(!rail)return;
  // front railing + side return railings with tight vertical iron pickets and double scroll rails
  const fr=loc(x,z,0,depth-.04,ry);
  vB('vIron',fr[0],yy+.92,fr[1],len,.045,.045,ry,ironC);
  vB('vIron',fr[0],yy+.76,fr[1],len,.03,.035,ry,ironC);
  vB('vIron',fr[0],yy+.12,fr[1],len,.03,.035,ry,ironC);
  const np=Math.max(6,Math.round(len/.22));
  for(let i=0;i<=np;i++){const p=loc(x,z,-len/2+i*len/np,depth-.04,ry);
   vB('vIron',p[0],yy,p[1],.024,.92,.024,ry,ironC);}
  for(const s of[-1,1]){const sr=loc(x,z,s*(len/2-.04),depth/2,ry);
   vB('vIron',sr[0],yy+.92,sr[1],.045,.045,depth,ry,ironC);
   for(let j=1;j<4;j++){const sp=loc(x,z,s*(len/2-.04),j*depth/4,ry);vB('vIron',sp[0],yy,sp[1],.024,.92,.024,ry,ironC);}}
  // hanging ferns & terracotta flower pots along the iron gallery
  if(o.pots!==false){for(let i=0;i<nb;i++){const u=-len/2+(i+.5)*(len/nb),pp=loc(x,z,u,depth-.16,ry);
   kput('vClayPot',[pp[0],yy,pp[1]],null,[.2,.28,.2],MA_TILE());
   kput('vLeaf',[pp[0],yy+.32,pp[1]],null,[.28,.22,.28],vC(vPick(MPAL.foliage)));}}
 };
 // gallery floor at y (if y > .5, draw iron rail, connected under-corbels & aligned ground posts; if ground level, posts rest on plinth)
 if(y>.5){
  drawDeck(y,true);
  drawCorbels(y);
  if(o.groundPosts!==false&&y<6.0){
   const yBase=o.y0==null?.25:o.y0,gh=Math.max(.5,y-.14-yBase);
   for(let k=0;k<=nb;k++){const u=-len/2+k*len/nb;
    if(Math.abs(u)<1.35)continue; // keep center portal clear
    const gp=loc(x,z,u,depth-.06,ry);
    vPst('vIron',gp[0],yBase,gp[1],.06,gh,ironC);}}
 }else{
  const d=loc(x,z,0,depth/2,ry);
  maWalkFloor(d[0],y,d[1],len,depth,ry,'porch');
 }
 // slender iron posts & lacework frieze valance on storey 1 (y .. y+h)
 for(let k=0;k<=nb;k++){const u=-len/2+k*len/nb,p=loc(x,z,u,depth-.06,ry);
  vPst('vIron',p[0],y,p[1],.055,h,ironC);
  // scrolled iron corner brackets at top of each post
  for(const s of[-1,1]){if((k===0&&s<0)||(k===nb&&s>0))continue;
   const b=loc(x,z,u+s*.28,depth-.06,ry);vB('vIron',b[0],y+h-.38,b[1],.48,.26,.03,ry,ironC);}}
 const fv1=loc(x,z,0,depth-.06,ry);vB('vIron',fv1[0],y+h-.22,fv1[1],len,.2,.035,ry,ironC);
 if(st>=2){
  const y2=y+h;drawDeck(y2,true);drawCorbels(y2);
  for(let k=0;k<=nb;k++){const u=-len/2+k*len/nb,p=loc(x,z,u,depth-.06,ry);
   vPst('vIron',p[0],y2,p[1],.05,h2,ironC);
   for(const s of[-1,1]){if((k===0&&s<0)||(k===nb&&s>0))continue;
    const b=loc(x,z,u+s*.26,depth-.06,ry);vB('vIron',b[0],y2+h2-.36,b[1],.44,.24,.03,ry,ironC);}}
  vB('vIron',fv1[0],y2+h2-.2,fv1[1],len,.18,.035,ry,ironC);
 }
 const yTop=y+h+(st>=2?h2:0);
 if(o.roof!==false){const r=loc(x,z,0,depth/2,ry);
  vB('vWood',r[0],yTop,r[1],len+.24,.12,depth+.18,ry,deckC);
  vBq('maTileB',r[0],yTop+.22,r[1],len+.3,.12,depth+.28,vQ(ry,.18,0),o.tileC||MA_TILE());}}

// Individual corbelled Spanish stone balcony with wrought-iron railing (corbels embedded -0.10*d into wall)
function maBalcony(x,y,z,ry,w,depth,stoneC,ironC){const d=depth==null?.78:depth,f=loc(x,z,0,d*.38,ry);
 vB('maCantera',f[0],y-.14,f[1],w,.14,d+.24,ry,stoneC);
 for(const s of[-1,1]){
  const c=loc(x,z,s*(w/2-.22),d*.28,ry);vB('maCantera',c[0],y-.46,c[1],.24,.32,d*.84,ry,stoneC);
  const c2=loc(x,z,s*(w/2-.22),d*.16,ry);vB('maCantera',c2[0],y-.66,c2[1],.22,.20,d*.56,ry,stoneC);}
 const fr=loc(x,z,0,d-.03,ry);vB('vIron',fr[0],y+.9,fr[1],w,.04,.04,ry,ironC);
 const np=Math.max(4,Math.round(w/.2));
 for(let i=0;i<=np;i++){const p=loc(x,z,-w/2+i*w/np,d-.03,ry);vB('vIron',p[0],y,p[1],.022,.9,.022,ry,ironC);}
 for(const s of[-1,1]){const sr=loc(x,z,s*(w/2-.03),d/2,ry);vB('vIron',sr[0],y+.9,sr[1],.04,.04,d,ry,ironC);
  const sp=loc(x,z,s*(w/2-.03),d*.5,ry);vB('vIron',sp[0],y,sp[1],.022,.9,.022,ry,ironC);}}

// Barcelona-style projecting glazed bay window (mirador / tribuna) on carved stone corbels
function maMirador(x,y,z,ry,w,h,out,frameC,stoneC,tileC,lit){
 const d=out==null?.85:out,f=loc(x,z,0,d/2,ry),F=typeof vnOnHollow==='function'?vnOnHollow(x,y+.85,z,ry):null;
 const cut=!!F&&vnHole(x,y+.85,z,ry,w-.16,h-.95,false),wt=F?F.B.t:.24,gh=h-.98;
 // stone corbelled base & moulded apron (embedded into wall)
 const fb=loc(x,z,0,d*.4,ry);
 vB('maCantera',fb[0],y-.2,fb[1],w+.16,.2,d+.24,ry,stoneC);
 for(const s of[-1,1]){const c=loc(x,z,s*(w/2-.25),d*.30,ry);vB('maCantera',c[0],y-.62,c[1],.26,.42,d*.84,ry,stoneC);}
 // 3-sided hollow panelled timber apron below + interior wooden window-seat sill & ceiling soffit
 const fr=loc(x,z,0,d-.03,ry),inC= loc(x,z,0,(d-wt)/2,ry);
 vB('vWood',fr[0],y,fr[1],w,.85,.07,ry,frameC);
 for(const s of[-1,1]){const sp=loc(x,z,s*(w/2-.035),d/2,ry);vB('vWood',sp[0],y,sp[1],.07,.85,d-.06,ry,frameC);
  const rj=loc(x,z,s*(w/2-.06),-wt/2,ry);vB('vWood',rj[0],y,rj[1],.12,h,wt+.12,ry,frameC);}
 vB('vWood',inC[0],y+.81,inC[1],w-.04,.07,d+wt,ry,frameC);
 vB('vWood',inC[0],y+h-.07,inC[1],w-.04,.08,d+wt,ry,frameC);
 if(!cut){const bk=loc(x,z,0,.02,ry);vB('vPlaster',bk[0],y+.85,bk[1],w-.2,h-.95,.03,ry,IZ_ROOMC);}
 // clear or warm-lit multi-pane casement glass on front & both sides (NEVER opaque vWinGlass!)
 const pane=lit?'vWinLit':'vWinClear';
 vB(pane,fr[0],y+.88,fr[1],w-.16,gh,.025,ry,null);
 for(const s of[-1,0,1]){const m=loc(x,z,s*(w*.31),d-.01,ry);vB('vWood',m[0],y,m[1],.065,h,.07,ry,frameC);}
 for(const fy of[.36,.72])vB('vWood',fr[0],y+.88+gh*fy,fr[1],w-.08,.045,.065,ry,frameC);
 for(const s of[-1,1]){const sw=loc(x,z,s*(w/2-.025),d/2,ry);
  vB(pane,sw[0],y+.88,sw[1],.025,gh,d-.14,ry,null);
  vB('vWood',sw[0],y+.85,sw[1],.06,h-.95,.055,ry,frameC);
  for(const fy of[.36,.72])vB('vWood',sw[0],y+.88+gh*fy,sw[1],.06,.045,d-.08,ry,frameC);
  const cr=loc(x,z,s*(w/2-.04),d-.04,ry);vB('vWood',cr[0],y,cr[1],.1,h,.1,ry,frameC);}
 // cornice & tiled hip hood
 vB('vWood',f[0],y+h,f[1],w+.24,.14,d+.2,ry,frameC);
 kput('maHipTile',[f[0],y+h+.14,f[1]],vQ(ry,0,0),[w+.36,.55,d+.32],tileC||MA_TILE());}

// Bruges-style stepped brick/plaster canal gable (escalonado) with cantera coping, cut-through glazed attic window & cargo hoist beam
function maBrugesGable(x,y,z,ry,w,rise,steps,wallC,capC,hoist){const n=steps==null?5:steps,sh=rise/n,f=loc(x,z,0,-.16,ry);
 const mw=Math.min(1.18,w*.22),mh=Math.min(1.6,rise*.52),wy=.25,wood=MA_WOOD(),r=mw/2,hb=Math.max(.1,mh-r);
 for(let k=0;k<n;k++){const sw=w*(1-k/(n+.4)),y0=k*sh,y1=(k+1)*sh;
  if(y1>wy&&y0<wy+mh&&sw>mw+.24){
   const yTop=Math.min(y1,wy+mh),lw=(sw-mw)/2;
   if(yTop>y0+.01){
    for(const s of[-1,1]){const sp=loc(x,z,s*(mw/2+lw/2),-.16,ry);vB('vPlaster',sp[0],y+y0,sp[1],lw,yTop-y0+.02,.34,ry,wallC);}
   }
   if(y1>wy+mh+.01)vB('vPlaster',f[0],y+wy+mh,f[1],sw,y1-(wy+mh)+.02,.34,ry,wallC);
  }else vB('vPlaster',f[0],y+y0,f[1],sw,sh+.02,.34,ry,wallC);
  vB('maCantera',f[0],y+y1-.06,f[1],sw+.18,.08,.42,ry,capC);}
 // 1-piece smooth extruded arch spandrel above the round arch head in the gable wall
 kput('maSpandrelP',[f[0],y+wy+hb,f[1]],vQ(ry,0,0),[r+.01,r+.01,.34],wallC);
 // recessed plastered attic room alcove behind the cut gable window so looking through the glass shows a real attic interior
 const bk=loc(x,z,0,-1.15,ry),md=loc(x,z,0,-.62,ry);
 vB('vPlaster',bk[0],y+.1,bk[1],mw+.8,mh+.35,.12,ry,IZ_ROOMC);
 for(const s of[-1,1]){const sw=loc(x,z,s*(mw/2+.34),-.62,ry);vB('vPlaster',sw[0],y+.1,sw[1],.12,mh+.35,1.05,ry,IZ_ROOMC);}
 vB('vWood',md[0],y+.1,md[1],mw+.7,.1,1.05,ry,wood);
 vB('vWood',md[0],y+wy+mh+.05,md[1],mw+.7,.1,1.05,ry,wood);
 maArch(x,y+wy,z,ry,mw,mh,{fill:vLit()?'L':'G',band:capC,shutters:wood,bw:.12,card:false});
 if(hoist!==false){const hp=loc(x,z,0,.45,ry);
  vB('vIron',hp[0],y+rise-.35,hp[1],.1,.1,1.2,ry,MA_IRON());
  const hk=loc(x,z,0,.95,ry);vPst('vIron',hk[0],y+rise-.95,hk[1],.02,.6,MA_IRON());}}

// Spanish Colonial pierced bell-gable (espadaña) with bronze bells
function maEspadana(x,y,z,ry,w,h,wallC,trimC,bells){const nb=bells==null?2:bells,f=loc(x,z,0,0,ry);
 vB('vPlaster',f[0],y,f[1],w,h*.68,.44,ry,wallC);
 vB('maCantera',f[0],y+h*.68,f[1],w+.28,.14,.54,ry,trimC);
 const bw=w/(nb+.6);
 for(let k=0;k<nb;k++){const u=(k-(nb-1)/2)*bw*1.05,p=loc(x,z,u,0,ry);
  maArch(p[0],y+.25,p[1],ry,bw*.65,h*.52,{fill:'O',band:trimC,bw:.1});
  kput('vDomeC',[p[0],y+h*.42,p[1]],null,[bw*.22,bw*.28,bw*.22],vC(0x7a6236));}
 // upper single bell arch crown
 if(nb>=2){vB('vPlaster',f[0],y+h*.82,f[1],w*.52,h*.36,.4,ry,wallC);
  vB('maCantera',f[0],y+h*1.18,f[1],w*.6,.12,.48,ry,trimC);
  kput('vDomeC',[f[0],y+h*.95,f[1]],null,[bw*.18,bw*.24,bw*.18],vC(0x7a6236));}
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2-.1),0,ry);kput('maUrn',[p[0],y+h*.82,p[1]],null,[.26,.45,.26],trimC);}}

// Hollow circular/octagonal drum wall with cut window/door gaps, floor & ceiling discs, and real see-through arched windows
function maRingWall(cx,cz,rm,t,y,h,gaps,item,c,box){
 const raw=(gaps||[]).map(g=>{const a=((g.a%TAU)+TAU)%TAU;return{a,a0:a-(g.w/2+.04)/rm,a1:a+(g.w/2+.04)/rm,g};}).sort((p,q)=>p.a-q.a);
 const cols=[];
 for(const r of raw){const prev=cols[cols.length-1];
  if(prev&&Math.abs(r.a-prev.a)<.06){prev.a0=Math.min(prev.a0,r.a0);prev.a1=Math.max(prev.a1,r.a1);prev.gs.push(r.g);}
  else cols.push({a:r.a,a0:r.a0,a1:r.a1,gs:[r.g]});}
 const put=(a,L,y0,hh)=>{const px=cx+Math.sin(a)*rm,pz=cz+Math.cos(a)*rm;if(L<.02||hh<.02||(box&&px>box[0]+.05&&px<box[1]-.05&&pz>box[2]+.05&&pz<box[3]-.05))return;vB(item||'vPlaster',px,y0,pz,L,hh,t,a,c);};
 const arc=(a0,a1)=>{const k=Math.max(1,Math.ceil((a1-a0)*rm/.95)),s=(a1-a0)/k;for(let i=0;i<k;i++)put(a0+(i+.5)*s,2*rm*Math.sin(s/2)+.05,y,h);};
 if(!cols.length){arc(0,TAU);return;}
 for(let i=0;i<cols.length;i++){const g=cols[i],e=i+1<cols.length?cols[i+1].a0:cols[0].a0+TAU;if(e>g.a1)arc(g.a1,e);
  const L=2*rm*Math.sin((g.a1-g.a0)/2),gs=g.gs.slice().sort((p,q)=>p.y0-q.y0);
  let vy=0;
  for(const o of gs){if(o.y0>vy+.02)put(g.a,L,y+vy,o.y0-vy);vy=Math.max(vy,o.y1);}
  if(vy<h-.02)put(g.a,L,y+vy,h-vy);}}

function maHollowDrum(cx,y,cz,r,h,item,c,wins,o){o=o||{};
 const t=o.t==null?.24:o.t,rm=r-t/2,st=o.band||MA_CANT(),wood=o.wood||MA_WOOD();
 kput('maDiscC',[cx,y+.04,cz],qEuler(Math.PI/2,0,0),[r-.04,r-.04,.08],st);
 kput('maDisc',[cx,y+h-.06,cz],qEuler(Math.PI/2,0,0),[r-.04,r-.04,.08],c);
 for(const fy of o.floors||[])kput('maDisc',[cx,y+fy,cz],qEuler(Math.PI/2,0,0),[r-.06,r-.06,.12],wood);
 const gaps=(wins||[]).map(w=>({a:w.a,w:w.w,y0:w.y0,y1:w.y0+w.h}));
 maRingWall(cx,cz,rm,t,y,h,gaps,item||'vPlaster',c,o.box);
 for(const w of wins||[]){const wx=cx+Math.sin(w.a)*rm,wz=cz+Math.cos(w.a)*rm;
  maArch(wx,y+w.y0,wz,w.a,w.w,w.h,{fill:w.lit?'L':'G',band:w.band||st,leafC:w.wood||wood,bw:w.bw==null?.11:w.bw,sill:w.sill!==false?(w.band||st):false,card:false});}}

// Baroque octagonal drum & glazed azulejo or terracotta ribbed dome with lantern cupola
function maBaroqueDome(x,y,z,r,drumH,drumC,domeItem,domeC,ribC,lantern){
 const rc=ribC||drumC,wc=MA_WOOD(),wins=[];
 for(let k=0;k<8;k++){const b=(k+.5)*TAU/8;wins.push({a:b,y0:drumH*.26,w:Math.min(.92,r*.34),h:Math.min(1.45,drumH*.52),lit:true,band:rc,wood:wc,bw:.1});}
 maHollowDrum(x,y,z,r,drumH,'vPlaster',drumC,wins,{band:rc,wood:wc});
 kput('maRing',[x,y+drumH,z],null,[r+.1,r+.1,1.4],rc);
 for(let k=0;k<8;k++){const a=k*TAU/8;vB('maCantera',x+Math.sin(a)*r,y,z+Math.cos(a)*r,.34,drumH,.24,a,rc);}
 const hDome=r*1.08;
 kput(domeItem||'maDomeAz',[x,y+drumH,z],null,[r+.06,hDome,r+.06],domeC);
 for(let k=0;k<8;k++)kput('maRib',[x,y+drumH,z],vQ(k*TAU/8,0,0),[r+.09,hDome+.04,r+.09],rc);
 let top=y+drumH+hDome;
 if(lantern!==false){const lr=Math.max(.55,r*.26),lh=Math.max(1.1,r*.48);
  vPst('maDrum',x,top-.08,z,lr,lh,drumC);
  kput(domeItem||'maDomeAz',[x,top+lh-.08,z],null,[lr+.08,lr*.95,lr+.08],domeC);
  vPst('vIron',x,top+lh+lr*.85,z,.05,.95,MA_IRON());
  top+=lh+lr*.95+.9;}
 return top;}

// ================================================================= INHABITED INTERIOR COURTYARDS (User Request #3)
// Courtyards in Marr are never bare dirt or empty gaps between wings: every patio is furnished according to its tier:
// 1. maPatioPleasure  — Korta de Plejar (azulejo fountain pool, citrus/palm planters, stone benches, iron lamps)
// 2. maPatioVegetable — Korta de Gardon (raised vegetable beds, grape trellis pergola, wellhead, tinaja jars, tool shed)
// 3. maPatioWorking   — Yarda de Guorka (lean-to summer kitchen with chimney, beehive bread oven, laundry pila, clotheslines)

function vnTree(x,y,z,h){
 const cols=[0,1,2,3,4].map(()=>vC(vPick(MPAL.foliage)));
 const th=h*.64,r=h*.34,r0=Math.max(.11,h*.048),bark=vC(0x684a32);
 // If in city mode with real biome plants enabled, register this spot for real HYPERJUNGLE palm/fern/aroid planting
 if(typeof window!=='undefined'&&window.CITY&&VERN.cur){
  const C=VERN.cur,sc=C.o.scale||1,wp=loc(C.x,C.z,x*sc,z*sc,C.ry);
  (window.MARR_COURTYARD_FLORA=window.MARR_COURTYARD_FLORA||[]).push({x:wp[0],y:(C.o.y||0)+y*sc,z:wp[1],h:h*sc,kind:'palm'});
 }
 // Tapered ringed palm/citrus trunk (3 segments with slight natural lean)
 const aLean=((Math.round(x*13+z*17)&7)/8)*TAU,dx=Math.cos(aLean)*h*.06,dz=Math.sin(aLean)*h*.06;
 for(let s=0;s<3;s++){
  const f0=s/3,f1=(s+1)/3,sx=x+dx*f0*f0,sz=z+dz*f0*f0,sy=y+th*f0;
  vPst('vPostB',sx,sy,sz,r0*(1-.22*f0),th/3+.05,bark);}
 const tx=x+dx,ty=y+th,tz=z+dz;
 // Date/coconut cluster under the crown + 8 radiating arched palm fronds
 vBall('vGourd',tx,ty-.08,tz,r0*1.45,vC(0x8e6228),.9);
 for(let k=0;k<8;k++){
  const a=aLean+k*TAU/8,fl=r*1.18,c=cols[k%5];
  const fx=tx+Math.sin(a)*fl*.52,fz=tz+Math.cos(a)*fl*.52;
  vBq('vLeaf',fx,ty+.18,fz,r*.28,.08,fl,vQ(a,.28,0),c);
  const fx2=tx+Math.sin(a)*fl*.92,fz2=tz+Math.cos(a)*fl*.92;
  vBq('vLeaf',fx2,ty-.06,fz2,r*.22,.06,fl*.65,vQ(a,.62,0),c);}}

function maPatioPleasure(x,y,z,w,d,ry,o){o=o||{};
 const st=MA_CANT(),az=MA_AZ(),wat=vC(vPick(MPAL.water)),or=MA_OR(),iron=MA_IRON();
 maWalkFloor(x,y,z,w,d,ry,'pleasure courtyard','courtyard');
 // flagstone court floor + zellige & azulejo mosaic border ring
 vnPaving(x,y+.02,z,w-.4,d-.4,ry,vC(0x9a8e7c),Math.max(14,Math.round(w*d/4)));
 for(const [lx,lz,lw,ld] of[[0,d*.38,w*.78,.28],[0,-d*.38,w*.78,.28],[w*.38,0,.28,d*.78],[-w*.38,0,.28,d*.78]]){
  const p=loc(x,z,lx,lz,ry);vB('maZellige',p[0],y+.03,p[1],lw,.03,ld,ry,az);}
 // central octagonal azulejo-tiled fountain basin + tiered stone pedestal & water jet
 const fr=Math.min(w,d)*.2;
 vPst('maDrumC',x,y,z,fr+.22,.48,st);
 vPst('maDrum',x,y+.02,z,fr+.04,.5,az);
 kput('maDisc',[x,y+.44,z],qEuler(Math.PI/2,0,0),[fr-.12,fr-.12,.04],wat);
 vPst('maCol',x,y+.4,z,.24,1.15,st);
 kput('maDiscC',[x,y+1.15,z],qEuler(Math.PI/2,0,0),[fr*.55,fr*.55,.14],st);
 kput('maUrnAz',[x,y+1.22,z],null,[.28,.52,.28],az);
 // 4 symmetrical stone-coped planter beds with citrus/palm trees and flowering shrubs
 const px=w*.27,pz=d*.27,pw=Math.max(1.2,w*.22),pd=Math.max(1.2,d*.22);
 for(const sx of[-1,1])for(const sz of[-1,1]){
  const p=loc(x,z,sx*px,sz*pz,ry);
  vnPlanter(p[0],y,p[1],pw,pd,ry,st);
  if((sx+sz===0)||w>=10)vnTree(p[0],y+.35,p[1],Math.min(3.6,Math.min(w,d)*.32));
  else if(typeof window!=='undefined'&&window.CITY&&VERN.cur){
   const C=VERN.cur,sc=C.o.scale||1,wp=loc(C.x,C.z,p[0]*sc,p[1]*sc,C.ry);
   (window.MARR_COURTYARD_FLORA=window.MARR_COURTYARD_FLORA||[]).push({x:wp[0],y:(C.o.y||0)+(y+.35)*sc,z:wp[1],h:2.2,kind:'shrub'});}
  const q=loc(x,z,sx*(px-pw*.35),sz*(pz-pd*.35),ry);
  kput('maUrn',[q[0],y,q[1]],null,[.24,.42,.24],or);
  kput('vLeaf',[q[0],y+.45,q[1]],null,[.32,.26,.32],vC(vPick(MPAL.foliage)));}
 // carved stone benches & wrought-iron courtyard lamps
 for(const s of[-1,1]){const bp=loc(x,z,s*(w*.34),0,ry);
  vB('maCantera',bp[0],y,bp[1],.55,.46,1.6,ry,st);}
 if(o.lamps!==false){const lp=loc(x,z,0,d*.36,ry);vnLampPost(lp[0],y,lp[1],3.1);}}

function maPatioVegetable(x,y,z,w,d,ry,o){o=o||{};
 const st=MA_CANT(),wood=MA_WOOD(),tile=MA_TILE(),soil=vC(0x4a3828),grn=vC(vPick(MPAL.foliage)),or=MA_OR();
 maWalkFloor(x,y,z,w,d,ry,'vegetable courtyard','courtyard');
 vnPaving(x,y+.02,z,w-.4,d-.4,ry,vC(0x8c8070),14);
 // 4 raised timber-and-stone kitchen garden beds with rows of cabbages, herbs, and staked tomatoes
 const bw=Math.max(1.4,w*.28),bd=Math.max(1.1,d*.2);
 for(const sx of[-1,1])for(const sz of[-1,1]){
  const bx=sx*(w*.23),bz=sz*(d*.22)-.4,p=loc(x,z,bx,bz,ry);
  vB('maCantera',p[0],y,p[1],bw,.34,bd,ry,st);
  vB('vClayB',p[0],y+.04,p[1],bw-.2,.32,bd-.2,ry,soil);
  if(typeof window!=='undefined'&&window.CITY&&VERN.cur){
   const C=VERN.cur,sc=C.o.scale||1,wp=loc(C.x,C.z,p[0]*sc,p[1]*sc,C.ry);
   (window.MARR_COURTYARD_FLORA=window.MARR_COURTYARD_FLORA||[]).push({x:wp[0],y:(C.o.y||0)+(y+.36)*sc,z:wp[1],h:1.8,kind:'fern'});}
  const nc=Math.max(2,Math.round(bw/.55));
  for(let i=0;i<nc;i++)for(const r of[-.22,.22]){
   const cp=loc(p[0],p[1],-bw*.35+i*(bw*.7/Math.max(1,nc-1)),r*bd,ry);
   kput('vLeaf',[cp[0],y+.42,cp[1]],null,[.26,.22,.26],vC(vPick(MPAL.foliage)));}}
 // central stone wellhead with wrought-iron pulley arch
 {const wp=loc(x,z,0,-.3,ry);
  vPst('maDrumC',wp[0],y,wp[1],.72,.82,st);kput('maDisc',[wp[0],y+.68,wp[1]],qEuler(Math.PI/2,0,0),[.52,.52,.04],vC(0x245868));
  for(const s of[-1,1]){const ip=loc(wp[0],wp[1],s*.62,0,ry);vPst('vIron',ip[0],y+.8,ip[1],.035,1.15,MA_IRON());}
  vB('vIron',wp[0],y+1.9,wp[1],1.3,.05,.05,ry,MA_IRON());}
 // timber grape/bean trellis pergola along the +z side of the court
 {const tx=0,tz=d*.28,tw=Math.min(w*.62,5.6),td=Math.min(d*.24,2.2),tp=loc(x,z,tx,tz,ry);
  for(const sx of[-1,1])for(const sz of[-1,1]){const pp=loc(tp[0],tp[1],sx*(tw/2-.15),sz*(td/2-.15),ry);
   vPst('vPost',pp[0],y,pp[1],.09,2.35,wood);}
  vB('vWood',tp[0],y+2.25,tp[1],tw+.3,.1,td+.2,ry,wood);
  for(let i=0;i<4;i++){const lp=loc(tp[0],tp[1],(i-1.5)*tw*.22,0,ry);
   kput('vLeaf',[lp[0],y+2.4,lp[1]],null,[.65,.22,td*.45],grn);}}
 // small lean-to potting & tool outbuilding (casita de huerta) in the -x,-z corner + clay tinaja jars
 if(o.shed!==false&&w>=7&&d>=7){
  const sw=Math.min(2.6,w*.26),sd=Math.min(2.2,d*.24),sp=loc(x,z,-w/2+sw/2+.25,-d/2+sd/2+.25,ry);
  vB('vPlaster',sp[0],y,sp[1],sw,2.1,sd,ry,MA_OCHRE());
  vBq('maTileB',sp[0],y+2.2,sp[1],sw+.28,.12,sd+.28,vQ(ry,.2,0),tile);
  const dp=loc(sp[0],sp[1],0,sd/2+.04,ry);vB('vWood',dp[0],y,dp[1],.78,1.75,.06,ry,wood);}
 for(let k=0;k<3;k++){const jp=loc(x,z,w/2-.55,-d*.2+k*.68,ry);
  kput('vClayPot',[jp[0],y,jp[1]],null,[.28,.52,.28],or);}}

function maPatioWorking(x,y,z,w,d,ry,o){o=o||{};
 const st=MA_CANTD(),pl=MA_CORAL(),wood=MA_WOOD(),tile=MA_TILE(),iron=MA_IRON();
 maWalkFloor(x,y,z,w,d,ry,'working courtyard','courtyard');
 vnPaving(x,y+.02,z,w-.4,d-.4,ry,vC(0x7c7264),12);
 // 1. Lean-to summer kitchen outbuilding (cocina de humo) with tiled shed roof & smoking brick chimney
 {const kw=Math.min(3.4,w*.36),kd=Math.min(2.4,d*.28),kp=loc(x,z,-w/2+kw/2+.2,-d/2+kd/2+.2,ry);
  vB('vPlaster',kp[0],y,kp[1],kw,2.25,kd,ry,pl);
  vBq('maTileB',kp[0],y+2.35,kp[1],kw+.3,.14,kd+.3,vQ(ry,.2,0),tile);
  const dp=loc(kp[0],kp[1],.3,kd/2+.04,ry);vB('vWood',dp[0],y,dp[1],.85,1.85,.06,ry,wood);
  const cp=loc(kp[0],kp[1],-kw*.32,-kd*.25,ry);vnChimney(cp[0],y+2.2,cp[1],1.6,.18,true);}
 // 2. Domed clay beehive bread oven (horno) on a stone waist-high plinth
 {const op=loc(x,z,w/2-1.15,-d/2+1.15,ry);
  vB('maCantera',op[0],y,op[1],1.55,.85,1.55,ry,st);
  kput('maDomeTile',[op[0],y+.85,op[1]],null,[.68,.65,.68],MA_OR());
  const om=loc(op[0],op[1],0,.65,ry);vB('vIron',om[0],y+.88,om[1],.42,.42,.12,ry,iron);}
 // 3. Communal stone laundry wash-trough (pila) filled with water
 {const pp=loc(x,z,-w/2+1.0,d*.18,ry);
  vB('maCantera',pp[0],y,pp[1],1.35,.82,2.1,ry,st);
  vB('maWater',pp[0],y+.76,pp[1],1.05,.1,1.8,ry,vC(vPick(MPAL.water)));}
 // 4. Overhead laundry line strung diagonally across the yard with drying sheets & shirts
 {const a=loc(x,z,-w*.36,d*.28,ry),b=loc(x,z,w*.36,-d*.05,ry);
  vBeam([a[0],y+2.85,a[1]],[b[0],y+2.75,b[1]],.02,vC(0xc8b898),'vRope');
  const ang=Math.atan2(b[0]-a[0],b[1]-a[1]);
  for(let k=1;k<=4;k++){const t=k/5,lx=a[0]+(b[0]-a[0])*t,lz=a[1]+(b[1]-a[1])*t;
   kput('vCloth',[lx,y+2.35,lz],vQ(ang+Math.PI/2,0,0),[.58,.72,1],vC(vPick(MPAL.laundry)));}}
 // 5. Stacked cargo crates & rum barrels in the +x,+z corner
 {const cp=loc(x,z,w*.26,d*.24,ry);
  vnCrate(cp[0],y,cp[1],.72,.2,wood);vnBarrel(cp[0]-.85,y,cp[1]+.2,.34,.85,wood);}}

// ================================================================= HOLLOW CEILINGS, WALK SURFACES & REG METADATA
function maHollowTidy(C,snap){const H=C.hollow;if(!H||!H.length)return;
 const y0=Math.min(...H.map(B=>B.y)),lit=!!(C.D&&C.D.tags&&C.D.tags.lit),poor=!!(C.D&&C.D.tags&&C.D.tags.wealth==='poor');
 const stC=vC(MPAL.cantera[0]),woodC=vC(MPAL.wood[0]),ironC=vC(MPAL.iron[0]);
 const inB=(B,px,pz,pad)=>{const dx=px-B.x,dz=pz-B.z,c=Math.cos(B.ry),s=Math.sin(B.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;
  return Math.abs(lx)<B.w/2+(pad||0)&&Math.abs(lz)<B.d/2+(pad||0);};
 const snapMap={};for(const [n,n0] of snap||[])snapMap[n]=n0;
 const hitSolid=(lx,ly,lz)=>{if(typeof IZDOOR==='undefined')return false;
  const wp=IZDOOR._w(lx,ly,lz);
  for(const n of['vPlaster','maCantera','vWood','maDrum','maDrumC']){const it=KIT.items[n],n0=snapMap[n];if(!it||n0==null)continue;
   for(let i=n0;i<it.length;i++){const r=it[i],s=r.s;if(!s||typeof s==='number')continue;
    const rx=Math.max(s[0],s[2])/2+.35,ry=s[1]/2+.2;
    if(Math.abs(wp[1]-r.p[1])<ry&&Math.abs(wp[0]-r.p[0])<rx&&Math.abs(wp[2]-r.p[2])<rx&&s[1]>1.1&&(s[0]>1.1||s[2]>1.1))return true;}}
  return false;};
 const ibs=(C.ixItem&&C.ixItem.bodies)||[];
 for(const B of H){
  vB(B.item,B.x,B.y+B.h-.22,B.z,B.w-2*B.t+.02,.2,B.d-2*B.t+.02,B.ry,B.c);
  const ib=ibs.find(b=>{if(!b.poly||!b.poly.length)return false;
   const bx=b.poly.map(p=>p[0]),bz=b.poly.map(p=>p[1]),cx=(Math.min(...bx)+Math.max(...bx))/2,cz=(Math.min(...bz)+Math.max(...bz))/2;
   return Math.hypot(B.x-cx,B.z-cz)<1.2&&Math.abs((b.y||0)-B.y)<1.0;});
  const lvs=[];
  if(ib&&ib.levels&&ib.levels.length){let yy=B.y;for(const L of ib.levels){lvs.push({y:yy,h:L.h});yy+=L.h;}}
  else{
   if(B.y>y0+1)vB('vWood',B.x,B.y,B.z,B.w-2*B.t+.02,.16,B.d-2*B.t+.02,B.ry,woodC);
   const ns=B.h>=8.5?3:B.h>=5.5?2:1,sh=B.h/ns;
   for(let s=0;s<ns;s++){lvs.push({y:B.y+s*sh,h:sh});
    if(s>0)vB('vWood',B.x,B.y+s*sh-.16,B.z,B.w-2*B.t+.02,.18,B.d-2*B.t+.02,B.ry,woodC);}}
  if(C.D&&C.D.key==='mar_governor_palace')continue;
  for(let f=0;f<4;f++){const along=f<2,L=along?B.w:B.d;if(L<3.4||B.h<2.4)continue;
   const n=f===0?[0,1]:f===1?[0,-1]:f===2?[1,0]:[-1,0],fr=along?B.d/2:B.w/2;
   const ux=f===0?1:f===1?-1:0,uz=f===2?-1:f===3?1:0;
   const ryF=B.ry+(f===0?0:f===1?Math.PI:f===2?Math.PI/2:-Math.PI/2);
   const nb=Math.max(1,Math.min(5,Math.floor((L-1.8)/3.6))),step=L/(nb+1);
   for(let li=0;li<lvs.length;li++){const lv=lvs[li],y0L=lv.y-B.y,y1L=y0L+lv.h;
    if(B.ops.some(o=>!o.door&&o.face===f&&o.y1>y0L+.3&&o.y0<y1L-.3))continue;
    const wh=Math.min(li===0?1.65:2.15,lv.h-1.15),ww=Math.min(1.25,step*.46),wy=lv.y+Math.min(.82,(lv.h-wh)*.45);
    if(wh<.75||ww<.65)continue;
    for(let k=1;k<=nb;k++){const u=-L/2+k*step;
     if(B.ops.some(o=>o.face===f&&o.y1>y0L+.1&&o.y0<y1L-.1&&Math.abs(o.u-u)<(o.w+ww)/2+.8))continue;
     const wp=loc(B.x,B.z,n[0]*fr+ux*u,n[1]*fr+uz*u,B.ry),outP=loc(wp[0],wp[1],0,1.0,ryF);
     if(H.some(B2=>B2!==B&&wy+wh/2>=B2.y-.2&&wy+wh/2<=B2.y+B2.h+.2&&(inB(B2,outP[0],outP[1],ww/2+.35)||inB(B2,wp[0],wp[1],ww/2+.2))))continue;
     if(hitSolid(outP[0],wy+wh/2,outP[1]))continue;
     if(li>0||lit)maArch(wp[0],wy,wp[1],ryF,ww,wh,{fill:lit?'L':'G',band:stC,shutters:woodC,bw:.12});
     else maShutterWin(wp[0],wy,wp[1],ryF,ww,wh,false,stC,woodC,poor?null:ironC);}}}}}

function maWalkOn(){return typeof KWALK!=='undefined'&&typeof window!=='undefined'&&!!window.MARR_WALK;}
function maWalkFloor(x,y,z,w,d,ry,name,tag){if(!maWalkOn()||!VERN.cur)return;
 const C=VERN.cur,sc=C.o.scale==null?1:C.o.scale,by=C.o.y||0,a=(ry||0)+C.ry,hw=w*sc/2,hd=d*sc/2;
 const p=loc(C.x,C.z,x*sc,z*sc,C.ry),c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a)),ex=hw*c+hd*s,ez=hw*s+hd*c;
 KWALK.floor({rect:[p[0]-ex,p[0]+ex,p[1]-ez,p[1]+ez],y:by+y*sc,name:name||C.D.key+' deck',tag:tag||'terrace'});}

function maWalkSolids(snap){if(!maWalkOn())return;
 for(const [name,n0] of snap){if(['maCantera','vStone','vPlaster','vWood','maAzulejo','maZellige'].indexOf(name)<0)continue;
  const it=KIT.items[name];if(!it)continue;
  for(let i=n0;i<it.length;i++){const r=it[i],s=r.s;if(typeof s==='number'||s[1]<.1||s[1]>2.8||s[0]*s[2]<3)continue;
   const top=r.p[1]+s[1]/2;if(top<.12||top>3.6)continue;
   const q=r.q||null;if(q&&(Math.abs(q.x)>1e-3||Math.abs(q.z)>1e-3))continue;
   const yaw=q?2*Math.atan2(q.y,q.w):0,c=Math.abs(Math.cos(yaw)),sn=Math.abs(Math.sin(yaw));
   const ex=(s[0]*c+s[2]*sn)/2,ez=(s[0]*sn+s[2]*c)/2;
   KWALK.floor({rect:[r.p[0]-ex,r.p[0]+ex,r.p[2]-ez,r.p[2]+ez],y:top,name:'solid top',tag:'terrace'});}}}
(function(){
 const _vp0=vPst;
 vPst=function(item,x,y,z,r,h,c,q){
  if(KIT.defs[item]&&KIT.defs[item].geo===VBOX){
   return kput(item,[x,y+h/2,z],q||null,[r*1.35,h,r*1.35],c||null);
  }
  return _vp0.apply(this,arguments);};
 const _vs=vnStairs;
 vnStairs=function(x,y,z,ry,w,rise,steps,item,c){_vs.apply(this,arguments);if(!maWalkOn()||!VERN.cur||!(rise>.1))return;
  const K=VERN.cur,sc=K.o.scale==null?1:K.o.scale,run=steps*.32,a=loc(x,z,0,run/2,ry),b=loc(x,z,0,-run/2,ry),wa=loc(K.x,K.z,a[0]*sc,a[1]*sc,K.ry),wb=loc(K.x,K.z,b[0]*sc,b[1]*sc,K.ry),by=K.o.y||0;
  KWALK.strip({a:[wa[0],wa[1],by+y*sc],b:[wb[0],wb[1],by+(y+rise)*sc],w:w*sc,name:K.D.key+' steps',tag:'stair'});};
 // Fix vnLadder side-rail tilt angle (-lean so side rails lean into the platform matching the rungs, never inverted!)
 vnLadder=function(x,y,z,ry,h,c){
  const lean=.25;
  for(const s of[-1,1]){const p=loc(x,z,s*.3,0,ry);kput('vWood',[p[0],y+h/2,p[1]],vQ(ry,-lean,0),[.08,h,.08],c||null);}
  for(let k=1;k<h/.36;k++){const t=k*.36;const p=loc(x,z,0,-Math.sin(lean)*(t-h/2),ry);vB('vWood',p[0],y+t*Math.cos(lean)-.03,p[1],.7,.06,.06,ry,c);}
  if(maWalkOn()&&VERN.cur){const K=VERN.cur,sc=K.o.scale==null?1:K.o.scale,by=K.o.y||0,run=Math.sin(lean)*h;
   const a=loc(x,z,0,run/2+.2,ry),b=loc(x,z,0,-run/2-.2,ry),wa=loc(K.x,K.z,a[0]*sc,a[1]*sc,K.ry),wb=loc(K.x,K.z,b[0]*sc,b[1]*sc,K.ry);
   KWALK.strip({a:[wa[0],wa[1],by+y*sc],b:[wb[0],wb[1],by+(y+h)*sc],w:.85*sc,name:K.D.key+' ladder',tag:'ladder'});}};
 // Fix vnVeranda so raised porch railings leave the entryway & stair bays open instead of blocking the porch and door
 vnVeranda=function(x,y,z,w,d,ry,deckH,postH,c,railC){
  const zc=d/2;vB('vWood',x,y+deckH-.22,z,w,.22,d,ry,c);
  maWalkFloor(x,y+deckH,z,w,d,ry,'veranda');
  const n=Math.max(2,Math.round(w/2.6));
  for(let i=0;i<=n;i++){
   const p=loc(x,z,-w/2+w*i/n,zc-.15,ry);vPst('vPost',p[0],y,p[1],.12,postH,c);
   if(i<n&&deckH>.85){
    // Only add front rails on high verandas (deckH > 0.85 m), leaving the center/entry bays open
    const isEntryBay=(n<=2)||(i===0||i===1);
    if(!isEntryBay){
     const q=loc(x,z,-w/2+w*(i+.5)/n,zc-.15,ry);vB('vWood',q[0],y+deckH+.85,q[1],w/n-.28,.1,.1,ry,railC||c);
     for(let k=1;k<4;k++){const b=loc(x,z,-w/2+w*(i+k/4)/n,zc-.15,ry);vB('vWood',b[0],y+deckH,b[1],.06,.85,.06,ry,railC||c);}}}}
  if(deckH>.3)for(let k=0;k<Math.round(w/2.6);k++){const p=loc(x,z,-w/2+.2,-d/2+d*(k+.5)/Math.round(w/2.6),ry);vPst('vPostB',p[0],y-.2,p[1],.13,deckH,c);}};
})();

function maFinishReg(C,D,d0,j0){if(!REG||C.r0>=REG.length)return;
 const r=REG[C.r0],sc=C.o.scale==null?1:C.o.scale,by=C.o.y||0;
 for(let i=C.r0+1;i<REG.length;i++)REG[i].parent=r;
 r.tid=r.tid||('marr.'+C.r0);
 const hw=(D.w||r.r*2)*sc/2,hd=(D.d||r.r*2)*sc/2,c=Math.abs(Math.cos(C.ry)),s=Math.abs(Math.sin(C.ry));
 const dh=D.h||r.h,ex=hw*c+hd*s,ez=hw*s+hd*c,hh=(dh==null?10:dh)*sc;
 r.bbox={mn:[C.x-ex,by,C.z-ez],mx:[C.x+ex,by+hh,C.z+ez]};
 if(typeof VHOLLOW!=='undefined'&&VHOLLOW.jobs&&VHOLLOW.jobs.length>j0){
  r.children=r.children||[];
  for(let j=j0;j<VHOLLOW.jobs.length;j++)r.children.push({key:'iziz.'+VHOLLOW.jobs[j].key+'.'+j});}
 if(typeof KDOOR!=='undefined'&&KDOOR.list&&KDOOR.list.length>d0){
  const ds=[];
  for(let i=d0;i<KDOOR.list.length;i++){const kd=KDOOR.list[i];if(!kd||kd.locked)continue;
   if(kd.at[1]-by>2.8&&!kd._front&&D.key!=='mar_castillo_bastion')continue;
   ds.push({wx:kd.at[0],wy:kd.at[1],wz:kd.at[2],yaw:kd.yaw,w:kd.w,h:kd.h,_front:!!kd._front});}
  if(ds.length){
   r.doors=ds;
   let fd=ds.find(d=>d._front)||ds[0],best=-1e9;
   if(!fd._front){for(const d of ds){const dz=(d.wx-C.x)*Math.sin(C.ry)+(d.wz-C.z)*Math.cos(C.ry);if(dz>best){best=dz;fd=d;}}}
   r.front={source:'door',world:{x:fd.wx,y:fd.wy,z:fd.wz,yaw:fd.yaw}};}}}

(function(){
 const _face0=vnFaceOf,_flush0=vnHollowFlush,_ix0=typeof vnIxStructure==='function'?vnIxStructure:null;
 if(_ix0){vnIxStructure=function(C,item){
  // Ensure no interior partition wall stands across or right behind any wide exterior doorway
  if(C&&C.hollow&&item&&typeof KratorInteriors!=='undefined'){
   const IX=KratorInteriors,inst=VHOLLOW.plans[item.key]||(VHOLLOW.plans[item.key]=IX.sets.instantiate(item,0,0,0,{baseY:0,register:false,seed:0,prefix:'local.'}));
   for(const Bd of inst.buildings){
    const doors=(Bd.body&&Bd.body.doors)||[];
    for(const d of doors){const dx=d.at[0],dz=d.at[1],dw=d.w||1.4;
     for(const Wl of Bd.walls){if(Wl.kind!=='partition'||Wl.y>2.8)continue;
      const ax=Wl.a[0],az=Wl.a[1],bx=Wl.b[0],bz=Wl.b[1],ux=bx-ax,uz=bz-az,L=Math.hypot(ux,uz)||1;
      const t=Math.max(0,Math.min(1,((dx-ax)*ux+(dz-az)*uz)/(L*L))),px=ax+ux*t,pz=az+uz*t;
      if(Math.hypot(dx-px,dz-pz)<dw*.55+.55){
       const uD=t*L,opW=Math.min(L-.1,dw+.8);
       Wl.openings=Wl.openings||[];
       if(!Wl.openings.some(o=>Math.abs(o.u-uD)<.5))Wl.openings.push({u:uD,w:opW,y1:2.35});}}}}}
  const w0=(KIT.items.vWood&&KIT.items.vWood.length)||0;
  const res=_ix0.apply(this,arguments);
  if(C&&C.D&&typeof C.D.key==='string'&&C.D.key.indexOf('mar_')===0&&KIT.items.vWood){
   const W=KIT.items.vWood;
   for(let i=w0;i<W.length;i++){const r=W[i],s=r.s;
    if(Array.isArray(s)&&s[2]>=.15&&s[2]<=.45&&s[0]>=.6&&s[1]>.26){const topY=r.p[1]+s[1]/2;s[1]=.22;r.p[1]=topY-.11;}}
  }
  return res;};}
 vnFaceOf=function(x,y,z,ry){const C=VERN.cur;
  if(!C||!C.hollow||!C.D||typeof C.D.key!=='string'||C.D.key.indexOf('mar_')!==0)return _face0.apply(this,arguments);
  let best=null,bestD=0.42;
  for(const B of C.hollow){if(y<B.y-.35||y>B.y+B.h)continue;
   const dx=x-B.x,dz=z-B.z,c=Math.cos(B.ry),s=Math.sin(B.ry);
   const lx=dx*c-dz*s,lz=dx*s+dz*c,a=((ry-B.ry)%TAU+TAU)%TAU;
   const dir=t=>Math.min(Math.abs(a-t),TAU-Math.abs(a-t))<.35;
   const f=B.k?Math.max(0,Math.min(1,(y-B.y)/B.h)):0,hd=B.d/2*(1-B.k*f),hw=B.w/2*(1-B.k*f);
   if(Math.abs(lx)<B.w/2&&dir(0)&&Math.abs(lz-hd)<bestD){bestD=Math.abs(lz-hd);best={B,face:0,u:lx};}
   if(Math.abs(lx)<B.w/2&&dir(Math.PI)&&Math.abs(lz+hd)<bestD){bestD=Math.abs(lz+hd);best={B,face:1,u:-lx};}
   if(Math.abs(lz)<B.d/2&&dir(Math.PI/2)&&Math.abs(lx-hw)<bestD){bestD=Math.abs(lx-hw);best={B,face:2,u:-lz};}
   if(Math.abs(lz)<B.d/2&&dir(3*Math.PI/2)&&Math.abs(lx+hw)<bestD){bestD=Math.abs(lx+hw);best={B,face:3,u:lz};}}
  return best;};
 vnHollowFlush=function(C){
  if(!C||!C.hollow||!C.hollow.length||!C.D||typeof C.D.key!=='string'||C.D.key.indexOf('mar_')!==0)return _flush0.apply(this,arguments);
  if(C.ixItem&&typeof vaPlanDoors==='function'){try{vaPlanDoors(C);}catch(e){reportErr('vaPlanDoors '+(C.D&&C.D.key)+': '+e);}}
  // Propagate openings across overlapping/coplanar hollow bodies (e.g. corner pavilions overlapping main hall walls)
  for(const B1 of C.hollow){for(const o of B1.ops.slice()){
   const f=o.face,along=f<2,n=f===0?[0,1]:f===1?[0,-1]:f===2?[1,0]:[-1,0];
   const fr=along?B1.d/2:B1.w/2,ux=f===0?1:f===1?-1:0,uz=f===2?-1:f===3?1:0;
   const wp=loc(B1.x,B1.z,n[0]*fr+ux*o.u,n[1]*fr+uz*o.u,B1.ry);
   const ryW=B1.ry+(f===0?0:f===1?Math.PI:f===2?Math.PI/2:3*Math.PI/2),wy=B1.y+o.y0;
   for(const B2 of C.hollow){if(B2===B1||wy<B2.y-.35||wy>B2.y+B2.h)continue;
    const dx=wp[0]-B2.x,dz=wp[1]-B2.z,c=Math.cos(B2.ry),s=Math.sin(B2.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;
    for(const [f2,fa,lim,v,t2,u2] of[[0,0,B2.w/2,lx,B2.d/2,lx],[1,Math.PI,B2.w/2,lx,-B2.d/2,-lx],[2,Math.PI/2,B2.d/2,lz,B2.w/2,-lz],[3,3*Math.PI/2,B2.d/2,lz,-B2.w/2,lz]]){
     const da=Math.abs(((ryW-(B2.ry+fa))%TAU+TAU)%TAU);
     if((da<.35||Math.abs(da-TAU)<.35||Math.abs(da-Math.PI)<.35)&&Math.abs(v)<lim&&Math.abs((f2<2?lz:lx)-t2)<.55){
      B2.ops.push({face:f2,u:u2,w:o.w,y0:wy-B2.y,y1:B1.y+o.y1-B2.y,door:o.door});}}}}}
  // 2D multi-storey strip cut per hollow body face so stacked upper-storey windows are never buried in ground-floor lintel slabs
  const y0=Math.min(...C.hollow.map(B=>B.y));
  for(const B of C.hollow){const t=B.t;if(B.y>y0+1)B.floor=false;
   for(let f=0;f<4;f++){const along=f<2,L=along?B.w:B.d-2*t,n=f===0?[0,1]:f===1?[0,-1]:f===2?[1,0]:[-1,0];
    const fr=along?B.d/2-t/2:B.w/2-t/2,cx=n[0]*fr,cz=n[1]*fr,ux=f===0?1:f===1?-1:0,uz=f===2?-1:f===3?1:0;
    const half=along?B.d/2:B.w/2,tilt=B.k?Math.atan(B.k*half/B.h):0,sg=f===0||f===3?-1:1;
    const at=(u,y,len,h)=>{if(len<.02||h<.02)return;let lx=cx+ux*u,lz=cz+uz*u;
     if(tilt){const r=B.k*half*Math.max(0,Math.min(1,(y+h/2-B.y)/B.h));lx-=n[0]*r;lz-=n[1]*r;const p=loc(B.x,B.z,lx,lz,B.ry);
      kput(B.item,[p[0],y+h/2,p[1]],along?vQ(B.ry,sg*tilt,0):vQ(B.ry,0,sg*tilt),[along?len:t,h/Math.cos(tilt),along?t:len],B.c);VHOLLOW.walls++;return;}
     const p=loc(B.x,B.z,lx,lz,B.ry);vB(B.item,p[0],y,p[1],along?len:t,h,along?t:len,B.ry,B.c);VHOLLOW.walls++;};
    const ops=B.ops.filter(o=>o.face===f).map(o=>({a:Math.max(-L/2,o.u-o.w/2),b:Math.min(L/2,o.u+o.w/2),y0:Math.max(0,o.y0),y1:Math.min(B.h,o.y1)}))
     .filter(o=>o.b-o.a>.03&&o.y1-o.y0>.03);
    const xSet=new Set([-L/2,L/2]);
    for(const o of ops){xSet.add(+o.a.toFixed(4));xSet.add(+o.b.toFixed(4));}
    const xs=[...xSet].sort((a,b)=>a-b);
    for(let xi=0;xi+1<xs.length;xi++){const x0=xs[xi],x1=xs[xi+1],xm=(x0+x1)/2,xw=x1-x0;if(xw<.02)continue;
     const col=ops.filter(o=>o.a<xm&&o.b>xm).sort((p,q)=>p.y0-q.y0);
     let vy=0;
     for(const o of col){if(o.y0>vy+.02)at(xm,B.y+vy,xw,o.y0-vy);vy=Math.max(vy,o.y1);}
     if(vy<B.h-.02)at(xm,B.y+vy,xw,B.h-vy);}}
   if(B.floor)vB(B.floor,B.x,B.y-.02,B.z,B.w-2*t+.02,.04,B.d-2*t+.02,B.ry,B.floorC||vC(VPAL.woodMid[0]).multiplyScalar(.82));}};
 const prev=VERN.def;
 VERN.def=function(D){if(D&&typeof D.key==='string'&&D.key.indexOf('mar_')===0&&typeof D.build==='function'){const b=D.build;
   D.build=function(G,o){const C=VERN.cur,snap=KIT.order.filter(n=>KIT.defs[n].geo===VBOX||n==='maDrum'||n==='maDrumC').map(n=>[n,KIT.items[n].length]);
    const out=b.apply(this,arguments);if(C&&C.hollow)maHollowTidy(C,snap);if(typeof maWalkSolids==='function')maWalkSolids(snap);return out;};}
  const res=prev.apply(this,arguments);
  if(D&&typeof D.key==='string'&&D.key.indexOf('mar_')===0&&typeof D.build==='function'){const b2=D.build;
   D.build=function(G,o){const C=VERN.cur,d0=(typeof KDOOR!=='undefined'&&KDOOR.list)?KDOOR.list.length:0,j0=(typeof VHOLLOW!=='undefined'&&VHOLLOW.jobs)?VHOLLOW.jobs.length:0;
    const out=b2.apply(this,arguments);if(C)maFinishReg(C,D,d0,j0);return out;};}
  return res;};})();
