// prefix: zf
// ================================================================= THE ZEIJANI FORMS: the shapes every builder draws with
// PLAN.md 6.2: dwellings are rounded (domes, drums, round doorways), civic buildings larger and blockier, the rich ornate
// (relief bands, stepped lintels, columns, pierced lattice). All in the builder's local frame (CM); a lathe's angle a puts
// x = cos a, z = sin a, so the front (+z) is a = PI/2.
const ZF_FRONT=PI/2;
/* the finish key of a carved surface (27-mat.js families) */
function zfFinish(f){return f==='polished'?'tuffPol':f==='plaster'?'plaster':f==='hewn'?'tuffHewn':f==='basalt'?'basalt':'tuff';}
/* a dome: a quarter ellipse of radius r and height h from y0, swept round (cx, cz); o.hole: a smoke hole's radius;
   o.a0, o.a1: a part sweep (a door's gap); o.seg, o.rows */
function zfDome(mk,cx,y0,cz,r,h,col,o){o=o||{};const rows=o.rows||9,t1=o.hole?Math.acos(Math.min(.99,o.hole/r)):PI/2,P=[];
 for(let i=0;i<=rows;i++){const t=t1*i/rows;P.push([Math.max(.02,r*Math.cos(t)),y0+h*Math.sin(t)]);}
 return lathe(mk,cx,cz,P,o.seg||28,col,{a0:o.a0,a1:o.a1,uv:'arc'});}
/* a drum: a vertical round wall (one face: the outside), a door gap from a0..a1 left open */
function zfDrum(mk,cx,y0,cz,r,h,col,o){o=o||{};return lathe(mk,cx,cz,[[r,y0],[r,y0+h]],o.seg||28,col,{a0:o.a0,a1:o.a1,inward:o.inward});}
/* a thick round wall with a doorway: two sectors either side of the door at angle da (default the front), width dw */
function zfRingWall(mk,cx,cz,r0,r1,y0,y1,col,dw,da){da=da===undefined?ZF_FRONT:da;const g=dw?dw/2/r1:0;
 sector(mk,cx,cz,r0,r1,da+g,da+TAU-g,y0,y1,col);}
/* a cone (thatch, a granary's cap): r at y0 to its apex at y0+h; o.layers draws stepped thatch skirts */
function zfCone(mk,cx,y0,cz,r,h,col,o){o=o||{};lathe(mk,cx,cz,[[r,y0],[r*.55,y0+h*.48],[.03,y0+h]],o.seg||24,col,{uv:'cone'});
 for(let i=1;i<=(o.layers||0);i++){const t=i/((o.layers||0)+1),rr_=r*(1-t*.92),yy=y0+h*t;lathe(mk,cx,cz,[[rr_+.12,yy-.18],[rr_,yy+.04]],o.seg||24,col);}}
/* an oval wall or roof by a sheet: rx across x, rz across z, from y0 to y1, its radii scaled to k1 at the top (a cone: k1 ~ 0) */
function zfOval(mk,cx,cz,rx,rz,y0,y1,col,o){o=o||{};const k1=o.k1===undefined?1:o.k1,a0=o.a0||0,a1=o.a1===undefined?TAU:o.a1,ex=o.ex||1;
 psurf(mk,(u,v)=>{const a=a0+(a1-a0)*u,k=1+(k1-1)*Math.pow(v,ex);return [cx+Math.cos(a)*rx*k,y0+(y1-y0)*v,cz+Math.sin(a)*rz*k];},o.seg||28,o.rows||1,col,{flip:!o.noflip,up:o.up});}
/* stilts: n posts on a ring of radius r (or rx, rz), from the ground to y */
function zfStilts(mk,cx,cz,rx,rz,y,n,col,rad){for(let i=0;i<n;i++){const a=i*TAU/n+.2;cyl(mk,cx+Math.cos(a)*rx,0,cz+Math.sin(a)*rz,rad||.11,y,col,7);}}
/* a stepped lintel (the dwarves' deep lintels, Aksum's steps): n courses over a doorway of width w at height y, on a face at z */
function zfStepLintel(mk,x,y,z,w,col,o){o=o||{};const n=o.n||3,th=o.h||.3,d=o.d||.3;for(let i=0;i<n;i++)box(mk,x,y+i*th,z-d/2+i*.02,w+.6*(n-i),th,d+i*.04,col);}
/* a pattern band: a sheet (pat* key) mapped once across its height and repeated along its width, on a face */
function zfBand(mk,x,y,z,w,h,ry,col){const L=KMAT.mode==='lib'?KMAT.packed('zeijani',ZJ_LIB[mk]):null,sx=L?L.scale[0]:(TILE[mk]||1),sy=L?(L.scale[1]||L.scale[0]):h;
 const m=TF(x,y+h/2,z,ry||0);m.scale(new THREE.Vector3(w,h,1));emit(mk,gplane(),m,col===undefined?WHITE:col,{su:w/sx,sv:h/sy});}
/* a round ribbed door (the earth-mound house): a disc of planks with radial ribs and an iron ring, facing +z, its centre at (x,y,z) */
function zfRoundDoor(x,y,z,r,col){const m=TF(x,y,z,0,PI/2,0);m.scale(new THREE.Vector3(r,.08,r));emit('carved',gcyl(20),m,col);
 for(let i=0;i<8;i++){const a=i*TAU/8;beam('wood',[x+Math.cos(a)*r*.15,y+Math.sin(a)*r*.15,z+.06],[x+Math.cos(a)*r*.95,y+Math.sin(a)*r*.95,z+.06],.06,P('woodD'));}
 ring('copper',x+r*.55,y,z+.1,.09,.018,P('copper'),0,PI/2,0);}
/* a column carved from the face: base, shaft (round or square), capital; o.square, o.flutes */
function zfColumn(mk,x,y,z,r,h,col,o){o=o||{};box(mk,x,y,z,r*2.6,.25,r*2.6,col);
 if(o.square)box(mk,x,y+.25,z,r*2,h-.6,r*2,col);else cyl(mk,x,y+.25,z,r,h-.6,col,o.seg||12);
 box(mk,x,y+h-.35,z,r*2.4,.12,r*2.4,col);box(mk,x,y+h-.23,z,r*2.9,.23,r*2.9,col);}
/* steps up to a door: n steps of rise and tread, width w, the top one at y, rising toward -z from z (+z the street) */
function zfSteps(mk,x,y,z,w,n,col,rise,tread){rise=rise||.17;tread=tread||.32;for(let i=0;i<n;i++)box(mk,x,y-rise*(i+1),z+tread*i,w+.1*i,rise,tread,col);}
/* a timber door leaf (closed) in a doorway of width w, height h, its face at z, slightly open by `open` radians toward -z */
function zfLeaf(x,y,z,w,h,col,open){const m=TF(x-w/2,y,z,open||0);W(x-w/2,y,z,open||0,()=>{box('plank',w/2,0,-.03,w,h,.06,col);for(const yy of [h*.2,h*.75])box('wood',w/2,yy,-.07,w*.92,.1,.04,P('woodD'));});}
/* a lamp niche (a dark recess) on a face at z: w by h at height y */
function zfNiche(x,y,z,w,h){box('basaltPol',x,y,z-.02,w,h,.04,P('soot'));box('tuffPol',x,y-.06,z+.03,w+.16,.06,.1,P('white'));}
/* a carved block of host rock for a carved def on the sheet (cvMass): its plan [x0,x1] x [z0,z1] with the front at z1 */
function zfRockBlock(x0,x1,z0,z1,h,o){o=o||{};return cvMass({id:'rock',poly:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],y0:-.5,y1:h,taper:o.taper||0,cap:o.cap===undefined?1.2:o.cap,rock:o.rock||'tuff',finish:'raw'});}
/* a round-headed arch on a face at z: jambs and a ring of voussoirs round a doorway w wide, its springing at y+h-w/2 */
function zfArch(mk,x,y,z,w,h,d,col,o){o=o||{};const t=o.t||.32,r=w/2,ys=y+h-r,n=o.n||9;
 for(const s of [-1,1])box(mk,x+s*(r+t/2),y,z,t,h-r,d,col);
 for(let i=0;i<n;i++){const a0=PI*i/n,a1=PI*(i+1)/n,am=(a0+a1)/2,rm=r+t/2;W(x+Math.cos(am)*rm,ys+Math.sin(am)*rm,z,0,()=>{
  const m=TF(0,0,0,0,0,am-PI/2);m.scale(new THREE.Vector3(rm*(a1-a0)*1.04,t,d));emit(mk,gbox(),m,col);});}
 if(o.key)box(o.keyMk||mk,x,ys+r,z+.02,t*.9,t*1.3,d+.08,o.keyCol||col);}
/* dovecote holes and painted rings on a face at z (Cappadocia's pigeon houses): rows x cols of small dark arched holes */
function zfDovecote(x,y,z,cols,rows,o){o=o||{};const dx=o.dx||.55,dy=o.dy||.6;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const px=x+(i-(cols-1)/2)*dx,py=y+j*dy;
 box('basaltPol',px,py,z-.01,.18,.24,.04,P('soot'));box('plaster',px,py-.05,z+.01,.3,.05,.06,P('plaster'));if(o.paint)box('plain',px,py+.28,z+.005,.26,.04,.02,P(o.paint));}}
/* the carved furniture of a carved def's rooms (its interiors item's fixtures): structure, drawn here; a fleece lies on each
   bed shelf (a catalog piece); the kiva's burner smokes */
function zfFixtures(item){if(!item)return;for(const r of item.rooms||[]){if(!(r.carved===true||(item.carved&&r.carved!==false)))continue;const y=r.y||0,fin=zfFinish(r.finish||'hewn'),c=P('white');
 for(const f of r.fixtures||[]){const w=f.w,d=f.d,h=f.h||.5,x=f.x,z=f.z,ry=f.ry||0;
  if(f.kind==='bedshelf'){box(fin,x,y,z,w,h,d,c,ry);FURNISH('zeijani_fleece_bed',x,y+h,z,ry+(w>d?PI/2:0),{v:0,setting:'room'});}
  else if(f.kind==='hearth'){box(fin,x,y,z,w,.22,d,c,ry);box(fin,x,y+.22,z-d*.35,w,h-.22,d*.3,c,ry);sph('glow',x,y+.3,z,.12,P('ember'),.5,8);smokeAt(x,y+h,z,{r:.1});haloAt(x,y+.4,z,0xff8a40,false);}
  else if(f.kind==='bench'||f.kind==='deflector')box(fin,x,y,z,w,h,d,c,ry);
  else if(f.kind==='ventilator'){box('basaltPol',x,y,z,w,h,d*.4,P('soot'),ry);box(fin,x,y+h,z,w+.2,.15,d,c,ry);}
  else if(f.kind==='sipapu')cyl('basaltPol',x,y+.004,z,Math.min(w,d)/2,.01,P('soot'),12);
  else if(f.kind==='incense-burner'){const R=Math.min(w,d)/2;cyl('tuffPol',x,y,z,R,.25,c,14);cyl('tuffPol',x,y+.25,z,R*.55,h-.55,c,12);cyl('copper',x,y+h-.3,z,R*.8,.3,P('copper'),14);
   cyl('glow',x,y+h-.02,z,R*.62,.03,P('ember'),12);cone('copper',x,y+h+.9,z,R*.7,.6,P('copper'),12);smokeAt(x,y+h+.2,z,{r:.25,kind:'incense'});haloAt(x,y+h+.1,z,0xd04a2a,true);}
  else if(f.kind==='pool'){/* a basin: its floor, a rim 0.15 m thick round dark water (fixtures are square to the room: ry 0 or a quarter) */
   const q=Math.abs(Math.round(ry/(PI/2)))%2===1,W2=(q?d:w)+.3,D2=(q?w:d)+.3;box(fin,x,y,z,W2,.12,D2,c);
   for(const s of [-1,1]){box(fin,x+s*(W2-.15)/2,y,z,.15,h,D2,c);box(fin,x,y,z+s*(D2-.15)/2,W2-.3,h,.15,c);}box('water',x,y+h-.1,z,W2-.3,.02,D2-.3,P('water'));}
  else if(f.kind==='pillar'||f.kind==='column')zfColumn(fin,x,y,z,Math.min(w,d)/2,f.h||r.h||3,c,{square:f.square});
  else if(f.kind==='niche')zfNiche(x,y+(f.y0||1.2),z,w,h);
  else box(fin,x,y,z,w,h,d,c,ry);}}}
