// prefix: yt
// ================================================================= PROPS: the trades' and the state's fittings (Y4)
// Drawn by the kit (the khaayken catalog culture file takes them over in Y5 where they are furniture). Each stands at
// (x, y, z) turned ry in the current frame; y is the floor it stands on.
//   ytForge, ytAnvil       the smith's stone forge (a firepot, a hood flue, hide bellows) and an iron anvil on a larch block
//   ytLoom                 the upright loom of the qiviut weavers, a felt length on it
//   ytRack(w, h, hang)     a larch drying rack; hang: 'hide' (scraped hides), 'root' (bundles), 'meat' (strips), 'fish'
//   ytIceBlocks(n, m)      a stack of sawn ice or pycrete blocks, n long and m high
//   ytDrum                 the shaman's or the song house's frame drum on its stand
//   ytBenchRing(r, a0, a1) a ring of benches (slab seat, larch backrest, musk-ox robe), from angle a0 to a1
//   ytMaskWall(R, H, y, a0, a1, n)  carved masks round a dome's inner face (the catenary R, H) at height y
//   ytFence(pts, h)        a larch post-and-rail fence along a polyline
//   ytStoneStove(w, d, h)  a heat-storing stone stove block with its firebox glowing (the bath's, the kitchen's)
const YT_IRON=0x3a3632;
function ytForge(x,y,z,ry){W(x,y,z,ry||0,()=>{box('slab',0,0,0,1.3,.85,1.0,P('slab'));box('earth',0,.85,0,1.0,.06,.7,jc(0x4a3a30,.04));
 box('glow',0,.9,0,.5,.05,.4,P('ember'));haloAt(0,1.1,0,0xff8a30,true);
 box('slab',0,.91,-.4,1.1,1.3,.2,P('slab'));cyl('slab',0,2.2,-.35,.24,1.6,P('slab'),8,.16);smokeAt(0,3.9,-.35,{r:.15,kind:'chimney'});
 W(.95,0,.1,0,()=>{box('larch',0,0,0,.5,.45,.7,P('larch'));ellip('hide',0,.6,0,.24,.12,.34,P('hide'),0,10);});});}
function ytAnvil(x,y,z,ry){W(x,y,z,ry||0,()=>{cyl('larch',0,0,0,.24,.55,P('larch'),10);box('plain',0,.55,0,.5,.18,.2,jc(YT_IRON,.03));
 box('plain',.3,.6,0,.2,.08,.12,jc(YT_IRON,.03));box('plain',0,.73,0,.42,.04,.22,jc(0x4a4642,.03));});}
function ytLoom(x,y,z,ry){W(x,y,z,ry||0,()=>{for(const s of [-1,1])box('larch',s*.75,0,0,.08,1.9,.1,P('larch'));
 box('larch',0,1.8,0,1.6,.08,.1,P('larch'));box('larch',0,.35,.05,1.6,.08,.1,P('larch'));box('felt',0,.45,.02,1.35,1.25,.02,P('felt'));
 for(let i=0;i<14;i++)pole('plain',[-.65+i*.1,.42,.03],[-.65+i*.1,1.78,.03],.004,jc(0xd8ccb2,.05));});}
function ytRack(x,y,z,ry,w,h,hang){W(x,y,z,ry||0,()=>{for(const s of [-1,1])pole('larch',[s*w/2,0,0],[s*w/2,h,0],.04,P('larch'));
 for(const yy of [h-.05,h*.55])pole('larch',[-w/2,yy,0],[w/2,yy,0],.03,P('larch'));
 const n=Math.max(2,Math.round(w/.35));for(let i=0;i<n;i++){const xx=-w/2+(i+.5)*w/n;
  if(hang==='hide')box('hide',xx,h*.25,0,w/n*.85,h*.7,.015,P('hide'));
  else if(hang==='meat')box('plain',xx,h-.55,0,.06,.45,.03,jc(0x6a2a20,.08));
  else if(hang==='fish')box('plain',xx,h-.5,0,.12,.4,.02,jc(0x9a9488,.06));
  else{cyl('plain',xx,h-.45,0,.07,.4,jc(0xb89a6a,.08),6);cyl('plain',xx,h*.55-.38,0,.07,.33,jc(0xc8a878,.08),6);}}});}
function ytIceBlocks(x,y,z,ry,n,m,mk){mk=mk||'pycrete';W(x,y,z,ry||0,()=>{for(let k=0;k<m;k++)for(let i=0;i<n-k%2;i++)
 box(mk,(i-(n-1)/2+(k%2)*.5)*.82,k*.42,0,.8,.4,.42,P('ice'));});}
function ytDrum(x,y,z,ry){W(x,y,z,ry||0,()=>{pole('larch',[0,0,0],[0,.9,0],.03,P('larch'));pole('larch',[-.25,0,.15],[0,.6,0],.02,P('larch'));pole('larch',[.25,0,.15],[0,.6,0],.02,P('larch'));
 WX(0,1.25,0,0,PI/2,0,()=>{cyl('gut',0,-.04,0,.42,.08,P('ice'),20);ring('larch',0,0,0,.42,.03,P('larch'),0,0,0,24);});});}
function ytBenchRing(r,a0,a1,yF){const n=Math.max(2,Math.round((a1-a0)*r/1.6));for(let i=0;i<n;i++){const a=a0+(a1-a0)*(i+.5)/n,ry=-a+PI/2;
 /* local +z faces the wall: a slab seat 0.42 high on two slab legs, a larch backrest against the wall, a musk-ox robe over
    the seat falling down its front, so it reads as a bench, not a table */
 const w=(a1-a0)*r/n-.2;W(Math.cos(a)*r,yF||0,Math.sin(a)*r,ry,()=>{for(const s of [-1,1])box('slab',s*(w/2-.15),0,0,.22,.36,.42,P('slab'));
  box('slab',0,.36,0,w,.08,.46,P('slab'));box('larch',0,.44,.26,w,.62,.06,P('larch'));
  box('muskox',0,.44,-.02,w-.12,.05,.44,P('ice'));box('muskox',0,.1,-.25,w-.12,.36,.03,P('ice'));});}}
/* a carved mask: an oval (half-widths a, b) bulging d toward +z, its UVs the sheet laid flat across it (a different part of
   the sheet for each mask k), its back closed flat */
function ytMaskFace(mk,a,b,d,col,k){const tl=TILE[mk]||1,ou=(k*.37)%1*tl,ov=(k*.53)%1*tl;
 const pt=(u,v)=>{const th=u*TAU,r=v,x=Math.cos(th)*a*r,y=Math.sin(th)*b*r;return [x,y,d*Math.sqrt(Math.max(0,1-r*r))];};
 psurf(mk,(u,v)=>pt(u,1-v),20,5,col,{uvf:(u,v)=>{const p=pt(u,1-v);return [ou+p[0],ov+p[1]];}});
 psurf(mk,(u,v)=>{const th=u*TAU;return [Math.cos(th)*a*v,Math.sin(th)*b*v,0];},20,1,col,{flip:true,uvf:(u,v)=>{const th=u*TAU;return [ou+Math.cos(th)*a*v,ov+Math.sin(th)*b*v];}});}
function ytMaskWall(R,H,y,a0,a1,n,off){off=off==null?.12:off;for(let i=0;i<n;i++){const a=a0+(a1-a0)*(i+.5)/n,r=ytCatR(R,H,y)-off;
 W(Math.cos(a)*r,y,Math.sin(a)*r,-a-PI/2,()=>{ytMaskFace(i%2?'carved':'antler',.2,.28,.06,P(i%2?'larch':'ice'),i);
  box('plain',-.07,.05,.045,.06,.025,.025,jc(0x1a1816,.02));box('plain',.07,.05,.045,.06,.025,.025,jc(0x1a1816,.02));box('plain',0,-.13,.03,.1,.025,.025,jc(0x1a1816,.02));});}}
function ytFence(pts,h){h=h||1.3;for(let i=0;i<pts.length;i++){const p=pts[i];pole('larch',[p[0],0,p[1]],[p[0],h,p[1]],.06,P('larch'));
 if(i){const q=pts[i-1];for(const yy of [h*.45,h*.85])pole('larch',[q[0],yy,q[1]],[p[0],yy,p[1]],.035,P('larch'));}}}
function ytStoneStove(x,y,z,ry,w,d,h){W(x,y,z,ry||0,()=>{box('slab',0,0,0,w,h,d,P('slab'));for(let i=0;i<10;i++)sph('slab',rr(-w*.35,w*.35),h+.06,rr(-d*.35,d*.35),rr(.08,.14),P('slab'),.7,6);
 box('plain',0,.12,d/2+.005,w*.4,h*.28,.01,jc(0x1a1412,.02));box('glow',0,.16,d/2+.01,w*.3,h*.16,.005,P('ember'));haloAt(0,.4,d/2+.3,0xff8a30,true);});}
