// ================================================================= IZIZ VERNACULAR — registry + building blocks
// Every vernacular building is a named function build*(G,o) registered with
// VERN.def(). It builds in a LOCAL frame: origin at the plot centre on the
// ground, +z is the front (door side), y up, metres. VERN.place() sets up the
// group transform (position + yaw) and the kit transform (useGroupXF), so a
// builder never sees world coordinates and the same function serves a
// showcase row and a city lot.
//
// o = {w: 0 poor | 1 middle | 2 rich, v: variant index, lit: override}
const VERN={defs:{},order:[],cur:null,
 def(D){if(!D.key||!D.build)throw new Error('VERN.def needs key+build');D.tags=Object.assign({culture:'iziz-vernacular'},D.tags||{});D.cls=D.cls||'building';VERN.defs[D.key]=D;VERN.order.push(D.key);return D;},
 // key, world x/z, yaw, options. Returns the group. Registers nothing itself:
 // the builder calls vnReg() for its inspector volume(s).
 place(scene,key,x,z,ry,o){const D=VERN.defs[key];if(!D){reportErr('VERN.place: no such key '+key);return null;}
  o=Object.assign({w:1,v:0,scale:1,y:0},o||{});const G=new THREE.Group();G.position.set(x,o.y,z);G.rotation.y=ry||0;if(o.scale!==1)G.scale.setScalar(o.scale);scene.add(G);G.updateMatrix();
  KOFF=[0,0,0];useGroupXF(G);if(o.scale!==1)KXF.s=o.scale;VERN.cur={D,G,x,z,ry:ry||0,o,r0:REG.length};
  try{D.build(G,o);}catch(e){reportErr(key+' '+e.stack);}
  endGroupXF();VERN.cur=null;return G;},
 wealthName:w=>['poor','middle','rich','civic'][w]||'poor',
};
// Inspector volume in the building's local frame (x,z = centre, r radius, h height). Honours o.scale.
function vnReg(name,lx,lz,r,h,tags){const c=VERN.cur;const s=c.o.scale||1;const p=loc(c.x,c.z,lx*s,lz*s,c.ry);
 REG.push({name,x:p[0],y:c.o.y||0,z:p[1],r:r*s,h:h*s,cls:c.D.cls,key:c.D.key,tags:Object.assign({},c.D.tags,tags||{})});}
// A builder that wraps an Ancients-kit builder (which calls REGISTER in its own local frame with KOFF) hands the
// REG entries it produced to this, which moves them into the world frame and stamps the project tags on them.
function vnAdoptREG(r0,nameFn,tags){const c=VERN.cur;const s=c.o.scale||1;for(let i=r0;i<REG.length;i++){const r=REG[i];const p=loc(c.x,c.z,r.x*s,r.z*s,c.ry);
 r.x=p[0];r.z=p[1];r.y=(r.y||0)*s+(c.o.y||0);r.r*=s;r.h*=s;r.cls=c.D.cls;r.key=c.D.key;r.tags=Object.assign({},c.D.tags,tags||{});if(nameFn)r.name=nameFn(r.name);}}
// kput with a uniform scale in the group transform (KXF.s): the vendored kit scales positions through the matrix
// but not the per-instance size, so the size is scaled here. Assignment, not redeclaration — build.py's rule.
// Nested group transforms. The vendored kit's useGroupXF/endGroupXF assume one level: several kit builders open a
// body group of their own (bodyGroup, the sky builders), which REPLACED the placer's transform and then nulled it,
// so a skyscraper placed at a plot rebuilt itself at the world origin at full size. Assignment, not redeclaration:
// the same functions, now a stack that composes the child's local matrix onto the parent's.
const _XFSTACK=[];
useGroupXF=function(P){P.updateMatrix();const parent=KXF;_XFSTACK.push(parent);
 if(parent){KXF={m:parent.m.clone().multiply(P.matrix),q:parent.q.clone().multiply(P.quaternion),s:(parent.s||1)*P.scale.x};if(KXF.s===1)delete KXF.s;}
 else{KXF={m:P.matrix.clone(),q:P.quaternion.clone()};if(P.scale.x!==1)KXF.s=P.scale.x;}};
endGroupXF=function(){KXF=_XFSTACK.length?_XFSTACK.pop():null;};
// Run a kit builder as if the ground were flat at the group's origin. Kit builders ask terrainH() for their aprons and
// fallen fragments in THEIR local frame; in a world with real terrain that returned the ground at the world origin
// (the city plateau, 18 m up) and floated every apron that far above the building.
function withFlatGround(fn){const t=terrainH;terrainH=function(){return 0;};try{return fn();}finally{terrainH=t;}}
const _kputBase=kput;
kput=function(name,p,q,s,c){if(KXF&&KXF.s&&KXF.s!==1){s=typeof s==='number'?s*KXF.s:[s[0]*KXF.s,s[1]*KXF.s,s[2]*KXF.s];}return _kputBase(name,p,q,s,c);};
// local (lx,lz) rotated by ry about Y, then translated — same convention as THREE's rotation.y
function loc(x,z,lx,lz,ry){return[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];}
// yaw, then a tilt about the piece's own x, then a roll about its own z
function vQ(ry,tx,rz){const q=qEuler(0,ry||0,0);if(tx)q.multiply(qEuler(tx,0,0));if(rz)q.multiply(qEuler(0,0,rz));return q;}
const vLit=()=>{const c=VERN.cur;return !!(c&&(c.o.lit!==undefined?c.o.lit:c.D.tags.lit));};   // the lighting rule: a def is tagged lit:true only if rich or civic

// ---------------------------------------------------------------- primitives (local frame; y = BASE of the piece)
function vB(item,x,y,z,w,h,d,ry,c){kput(item,[x,y+h/2,z],ry?qEuler(0,ry,0):null,[w,h,d],c||null);}          // box standing on y
function vBq(item,x,y,z,w,h,d,q,c){kput(item,[x,y,z],q||null,[w,h,d],c||null);}                                // box centred at y, any quaternion
function vPst(item,x,y,z,r,h,c,q){kput(item,[x,y,z],q||null,[r,h,r],c||null);}                                 // post/cylinder, base at y
function vPl(item,x,y,z,w,h,ry,c,tilt){kput(item,[x,y,z],vQ(ry,tilt||0,0),[w,h,1],c||null);}                   // plane centred at y, facing local +z
function vBall(item,x,y,z,r,c,sy){kput(item,[x,y,z],null,[r,sy||r,r],c||null);}
// a beam from a to b (local), timber unless another item is named
function vBeam(a,b,w,c,item){beam(item||'vWood',a,b,w,w,c||null);}

// ---------------------------------------------------------------- walls, frames, plinths
// Timber frame: corner posts, intermediate posts every ~2.4 m, sill and head rails on all four faces.
function vnFrame(x,y,z,w,h,d,ry,c,pr){pr=pr||.14;const nx=Math.max(1,Math.round(w/2.4)),nz=Math.max(1,Math.round(d/2.4));
 for(let i=0;i<=nx;i++){const lx=-w/2+w*i/nx;for(const s of[-1,1]){const p=loc(x,z,lx,s*d/2,ry);vPst('vPost',p[0],y,p[1],pr,h,c);}}
 for(let j=1;j<nz;j++){const lz=-d/2+d*j/nz;for(const s of[-1,1]){const p=loc(x,z,s*w/2,lz,ry);vPst('vPost',p[0],y,p[1],pr,h,c);}}
 for(const yy of y>=.15?[y+h-.12]:[y+.12,y+h-.12]){   // head rails on all four faces; a sill rail too, unless the frame stands on a plinth (the plinth's top is the sill)
  // the long-face rails run through; the end-face rails butt into them (they used to cross at every corner)
  for(const s of[-1,1]){const p=loc(x,z,0,s*d/2,ry);vB('vWood',p[0],yy-.1,p[1],w+pr*2,.2,pr*2.2,ry,c);const q=loc(x,z,s*w/2,0,ry);vB('vWood',q[0],yy-.1,q[1],pr*2.2,.2,Math.max(.2,d-pr*2.2),ry,c);}}}
// Stilts under a raised floor: posts at the corners and along the long sides, with a diagonal brace on each face.
function vnStilts(x,y,z,w,d,h,ry,c,pr){pr=pr||.18;const nx=Math.max(1,Math.round(w/2.6)),nz=Math.max(1,Math.round(d/2.6));const pts=[];
 for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){if(i>0&&i<nx&&j>0&&j<nz&&rng()<.5)continue;const p=loc(x,z,-w/2+w*i/nx,-d/2+d*j/nz,ry);vPst('vPostB',p[0],y-.3,p[1],pr,h+.3,c);pts.push(p);}
 for(const s of[-1,1]){const a=loc(x,z,-w/2,s*d/2,ry),b=loc(x,z,w/2*.6,s*d/2,ry);vBeam([a[0],y+.2,a[1]],[b[0],y+h-.2,b[1]],.1,c);}
 // pad stones under the posts
 for(const p of pts)vB('vStone',p[0],y-.35,p[1],pr*3.2,.35,pr*3.2,ry,vC(0x9a8a78));}
// Battered stone/plaster plinth the wealthy build on (item vBatterS / vBatterP).
function vnPlinth(item,x,y,z,w,h,d,ry,c){kput(item,[x,y,z],ry?qEuler(0,ry,0):null,[w,h,d],c||null);vB(item==='vBatterS'?'vStone':'vPlaster',x,y+h-.05,z,w*.86+.3,.28,d*.86+.3,ry,c);}
// Mayan stepped cornice in the set's materials: `steps` overhanging bands, each further out, then a cap band set back.
function vnCornice(item,x,y,z,w,d,ry,c,steps,cap){steps=steps||2;let yy=y;for(let k=0;k<steps;k++){const o=.18+.22*k;vB(item,x,yy,z,w+2*o,.32,d+2*o,ry,c);yy+=.32;}
 if(cap!==false)vB(item,x,yy,z,w+.1,.26,d+.1,ry,c&&c.clone().multiplyScalar(1.08));return yy+.26;}
// deco vertical strip: a tall narrow recess with horizontal fins, the old Iziz motif carried into stone or timber
function vnStrip(x,y,z,ry,w,h,frameItem,c){const f=loc(x,z,0,.06,ry);vB('vDarkB',f[0],y,f[1],w,h,.12,ry);
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.08),.1,ry);vB(frameItem,p[0],y-.1,p[1],.16,h+.2,.22,ry,c);}
 const n=Math.max(2,Math.round(h/.9));for(let k=1;k<n;k++){const p=loc(x,z,0,.12,ry);vB(frameItem,p[0],y+h*k/n-.05,p[1],w+.1,.1,.26,ry,c);}}
// Salvage patchwork over a face: n mismatched sheets, proud of the wall and a few degrees off square.
function vnPatch(x,y,z,ry,w,h,n){const ITEMS=['vSheet','vSheet','vPlate','vPlateW','vBoard'];
 for(let i=0;i<n;i++){const lx=rr(-w/2+.8,w/2-.8),ly=y+rr(.6,h-.6),pw=rr(1.2,2.8),ph=rr(.9,2.2);const p=loc(x,z,lx,.09+i*.012,ry);
  kput(vPick(ITEMS),[p[0],ly,p[1]],vQ(ry,0,rr(-.09,.09)),[pw,ph,1],null);}}

// ---------------------------------------------------------------- roofs (ridge along local x unless noted)
// Gable: a wall-material wedge closes the gable ends flush with the walls; two roof slabs sit on it and overhang.
function vnGableRoof(x,y,z,w,d,rise,ry,slabItem,slabC,over,endItem,endC,thick){over=over===undefined?.9:over;thick=thick||.24;
 if(endItem)kput(endItem,[x,y,z],ry?qEuler(0,ry,0):null,[w,rise,d],endC||null);
 const a=Math.atan2(rise,d/2),ext=d/2+over,S=Math.hypot(ext,rise*ext/(d/2))+.15;
 for(const s of[-1,1]){const zc=s*ext/2,yc=y+(rise-over*rise/(d/2))/2;const p=loc(x,z,0,zc,ry);
  const q=vQ(ry,s*a,0);const n=new THREE.Vector3(0,1,0).applyQuaternion(q).multiplyScalar(thick*.5);
  kput(slabItem,[p[0]+n.x,yc+n.y,p[1]+n.z],q,[w+2*over,thick,S],slabC||null);}
 // the ridge fill: the slabs are pushed out along their normals, so on a steep pitch their tops part in a V that the
 // cap hides from the side but not from above. A slab-material bar, rotated to a diamond, closes it
 {const p=loc(x,z,0,0,ry);kput(slabItem,[p[0],y+rise+thick*.15,p[1]],vQ(ry,Math.PI/4,0),[w+2*over,thick*1.5,thick*1.5],slabC||null);}
 vB('vWood',x,y+rise+thick*.35,z,w+2*over+.1,.22,.5,ry,slabC?slabC.clone().multiplyScalar(.8):vC(0x6a4a30));     // ridge cap
 for(const s of[-1,1]){const p=loc(x,z,0,s*(ext+.02),ry);vB('vWood',p[0],y-over*rise/(d/2)-.32+thick*.2,p[1],w+2*over,.28,.12,ry,vC(0x6a4a30));}   // fascia
 if(slabItem==='vThatchB')vnThatchDress(x,y,z,w,d,rise,ry,slabC,over,thick,S,a,ext);}
// THATCH (Round 1 issue: a stripe field at eye level): a second frond layer laid over the first, a touch shorter and
// darker so its lower edge reads as a course, and a ragged eave — a fringe of short tilted bundles of uneven length
function vnThatchDress(x,y,z,w,d,rise,ry,c,over,thick,S,a,ext){const c2=c?c.clone().multiplyScalar(.86):vC(0x8a7448);const ye=y-over*rise/(d/2);
 for(const s of[-1,1]){const zc=s*ext/2*.92,yc=y+(rise-over*rise/(d/2))/2+.05;const p=loc(x,z,0,zc,ry);const q=vQ(ry,s*a,0);
  const n=new THREE.Vector3(0,1,0).applyQuaternion(q).multiplyScalar(thick*1.15);kput('vThatchB',[p[0]+n.x,yc+n.y+rise*.04,p[1]+n.z],q,[w+2*over-.3,thick*.7,S*.84],c2);
  const L=w+2*over,nb=Math.max(4,Math.round(L/.55));for(let i=0;i<nb;i++){const lx=-L/2+(i+.5)*L/nb,len=rr(.35,.8);const e=loc(x,z,lx,s*(ext-.05),ry);
   kput('vThatchB',[e[0],ye-len*.35,e[1]],vQ(ry,s*(a+rr(-.15,.25)),rr(-.12,.12)),[L/nb+.08,.1,len],(i%3?c2:c)||null);}}}
// Shed: one slab, high at the back (-z), low at the front (+z).
function vnShedRoof(x,y,z,w,d,rise,ry,item,c,over,thick){over=over===undefined?.7:over;thick=thick||.2;const a=Math.atan2(rise,d);const ext=d+2*over,S=ext/Math.cos(a);
 const p=loc(x,z,0,0,ry);const q=vQ(ry,a,0);const n=new THREE.Vector3(0,1,0).applyQuaternion(q).multiplyScalar(thick*.5);
 kput(item,[p[0]+n.x,y+rise/2+n.y,p[1]+n.z],q,[w+2*over,thick,S],c||null);}
// Solid hipped / pyramidal roofs (the wedge items). `over` widens the base; the base drops a little so the wall top is buried.
function vnHipRoof(item,x,y,z,w,d,rise,ry,c,over){over=over===undefined?.8:over;kput(item,[x,y-.35,z],ry?qEuler(0,ry,0):null,[w+2*over,rise+.35,d+2*over],c||null);
 vB('vWood',x,y-.62,z,w+2*over+.06,.28,d+2*over+.06,ry,c?c.clone().multiplyScalar(.75):vC(0x5a3e2a));   // eaves board
 // a thatched hip: a second, steeper frond layer and a ragged fringe round all four eaves
 if(item==='vHipT'||item==='vPyrT'){const c2=c?c.clone().multiplyScalar(.86):vC(0x8a7448);kput(item,[x,y+rise*.18,z],ry?qEuler(0,ry,0):null,[(w+2*over)*.8,rise*.85,(d+2*over)*.8],c2);
  vnThatchFringe(x,y-.5,z,w+2*over,d+2*over,ry,c);}}
// a ragged fringe of short tilted thatch bundles round the four eaves of a W x D roof whose eave line is at y
function vnThatchFringe(x,y,z,W,D,ry,c){const c2=c?c.clone().multiplyScalar(.86):vC(0x8a7448);
 for(const [L,lz,rot] of[[W,D/2,0],[W,-D/2,Math.PI],[D,W/2,Math.PI/2],[D,-W/2,-Math.PI/2]]){const nb=Math.max(4,Math.round(L/.55));
  for(let i=0;i<nb;i++){const lx=-L/2+(i+.5)*L/nb,len=rr(.3,.7);const e=loc(x,z,...(rot===0?[lx,lz]:rot===Math.PI?[-lx,lz]:rot>0?[lz,-lx]:[lz,lx]),ry);
   kput('vThatchB',[e[0],y-len*.3,e[1]],vQ(ry+rot,.5+rr(-.15,.2),rr(-.1,.1)),[L/nb+.08,.1,len],(i%3?c2:c)||null);}}}
function vnPyrRoof(item,x,y,z,w,d,rise,ry,c,over){vnHipRoof(item,x,y,z,w,d,rise,ry,c,over);}
// A thatch cone on a round building; ragged eave by a second slightly larger, shorter cone.
function vnThatchCone(x,y,z,r,rise,c){kput('vConeT',[x,y-.3,z],null,[r*1.18,rise+.3,r*1.18],c||null);kput('vConeT',[x,y-.55,z],null,[r*1.28,.9,r*1.28],c?c.clone().multiplyScalar(.85):null);}

// ---------------------------------------------------------------- openings
// Window on a wall face. (x,z) is the point ON the face, ry the outward direction of the face.
// kind: 'lit' (electric, rich/civic only), 'glass' (dark glazing), 'open' (unglazed dark), 'shut' (boarded)
function vnWin(x,y,z,ry,w,h,kind,frameItem,c,shutters){const f=loc(x,z,0,.05,ry);
 if(kind==='lit')vB('vWinLit',f[0],y,f[1],w,h,.1,ry);else if(kind==='glass')vB('vWinGlass',f[0],y,f[1],w,h,.1,ry);else vB('vDarkB',f[0],y,f[1],w,h,.1,ry);
 if(kind==='shut'){const p=loc(x,z,0,.12,ry);for(let k=0;k<Math.round(h/.3);k++)vB('vWood',p[0],y+k*.3,p[1],w+.1,.26,.08,ry,c);}
 frameItem=frameItem||'vWood';const p=loc(x,z,0,.14,ry);
 for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.07),.14,ry);vB(frameItem,q[0],y-.08,q[1],.14,h+.16,.16,ry,c);}
 vB(frameItem,p[0],y+h,p[1],w+.3,.14,.18,ry,c);vB(frameItem,p[0],y-.12,p[1],w+.34,.12,.28,ry,c);   // head, sill
 if(kind==='glass'||kind==='lit'){vB(frameItem,p[0],y,p[1],.06,h,.1,ry,c);vB(frameItem,p[0],y+h*.5,p[1],w,.06,.1,ry,c);}   // glazing bars
 if(shutters){for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.15+w*.22),.2,ry);kput('vWood',[q[0],y+h/2,q[1]],vQ(ry,0,0).multiply(qEuler(0,-s*.55,0)),[w*.48,h,.05],c||null);}}}
// Door: dark recess, board leaf, jambs + lintel, a threshold step. Optional electric lamp above (lit rule applies).
function vnDoor(x,y,z,ry,w,h,frameItem,c,leafC,step){frameItem=frameItem||'vWood';const f=loc(x,z,0,.03,ry);vB('vDarkB',f[0],y,f[1],w,h,.1,ry);
 const l=loc(x,z,-w*.06,.1,ry);kput('vWood',[l[0],y+h/2,l[1]],vQ(ry,0,0).multiply(qEuler(0,.22,0)),[w*.92,h-.05,.06],leafC||c||null);   // leaf, slightly ajar
 for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.09),.12,ry);vB(frameItem,q[0],y,q[1],.18,h+.18,.2,ry,c);}
 const p=loc(x,z,0,.12,ry);vB(frameItem,p[0],y+h+.06,p[1],w+.5,.2,.26,ry,c);
 if(step!==false){const s=loc(x,z,0,.5,ry);vB(frameItem==='vStone'?'vStone':'vWood',s[0],y-.18,s[1],w+.6,.18,.8,ry,c);}
 if(vLit()){vnLamp(x,y+h+.5,z,ry);}
 // pathing layer: every door is an agent target. World frame, recorded for the city's Paths overlay / life layer.
 if(window.DOORS&&VERN.cur){const c=VERN.cur,sc=c.o.scale||1;const wp=loc(c.x,c.z,x*sc,z*sc,c.ry);DOORS.push({x:wp[0],z:wp[1],ry:ry+c.ry,y:(c.o.y||0)+y*sc,key:c.D.key});}}
// Electric lamp: an iron bracket out of the wall and a bulb under a small hood. Only ever placed through vLit().
function vnLamp(x,y,z,ry){const a=loc(x,z,0,.05,ry),b=loc(x,z,0,.55,ry);vBeam([a[0],y,a[1]],[b[0],y+.02,b[1]],.05,vC(0x2e2a26),'vIron');
 vB('vIron',b[0],y-.02,b[1],.32,.06,.32,ry,vC(0x2e2a26));vBall('vBulb',b[0],y-.16,b[1],.11);}
// A lamp on a post (yards, drill grounds, gates) — electric.
function vnLampPost(x,y,z,h){vPst('vPipe',x,y,z,.07,h,vC(0x2e2a26));vB('vIron',x,y+h,z,.5,.08,.5,0,vC(0x2e2a26));vBall('vBulb',x,y+h-.16,z,.13);}

// ---------------------------------------------------------------- porches, stairs, yards
// Veranda deck on posts along the front; rail with balusters; posts carry up to `postH` for the roof above.
function vnVeranda(x,y,z,w,d,ry,deckH,postH,c,railC){const zc=d/2;vB('vWood',x,y+deckH-.22,z,w,.22,d,ry,c);
 const n=Math.max(2,Math.round(w/2.6));for(let i=0;i<=n;i++){const p=loc(x,z,-w/2+w*i/n,zc-.15,ry);vPst('vPost',p[0],y,p[1],.12,postH,c);
  if(i<n&&deckH>.3){const q=loc(x,z,-w/2+w*(i+.5)/n,zc-.15,ry);vB('vWood',q[0],y+deckH+.85,q[1],w/n-.28,.1,.1,ry,railC||c);   // rail
   for(let k=1;k<4;k++){const b=loc(x,z,-w/2+w*(i+k/4)/n,zc-.15,ry);vB('vWood',b[0],y+deckH,b[1],.06,.85,.06,ry,railC||c);}}}
 if(deckH>.3)for(let k=0;k<Math.round(w/2.6);k++){const p=loc(x,z,-w/2+.2,-d/2+d*(k+.5)/Math.round(w/2.6),ry);vPst('vPostB',p[0],y-.2,p[1],.13,deckH,c);}}
// Straight stair up to a deck: treads and two stringers. Rises `rise` over `steps` treads toward -z (into the building).
function vnStairs(x,y,z,ry,w,rise,steps,item,c){const run=steps*.32;for(let k=0;k<steps;k++){const t=(k+.5)/steps;const p=loc(x,z,0,run/2-run*t,ry);vB(item||'vWood',p[0],y+rise*k/steps,p[1],w,.08,.34,ry,c);}
 for(const s of[-1,1]){const a=loc(x,z,s*w/2,run/2,ry),b=loc(x,z,s*w/2,-run/2,ry);vBeam([a[0],y-.05,a[1]],[b[0],y+rise-.1,b[1]],.12,c);}}
function vnLadder(x,y,z,ry,h,c){const lean=.25;for(const s of[-1,1]){const p=loc(x,z,s*.3,0,ry);kput('vWood',[p[0],y+h/2,p[1]],vQ(ry,lean,0),[.08,h,.08],c||null);}
 for(let k=1;k<h/.36;k++){const t=k*.36;const p=loc(x,z,0,-Math.sin(lean)*(t-h/2),ry);vB('vWood',p[0],y+t*Math.cos(lean)-.03,p[1],.7,.06,.06,ry,c);}}
function vnBarrel(x,y,z,r,h,c){vPst('vBarrel',x,y,z,r,h,c);vBq('vHoop',x,y+h*.25,z,r*1.02,r*1.02,1,qEuler(Math.PI/2,0,0),vC(0x2e2a26));vBq('vHoop',x,y+h*.78,z,r*1.02,r*1.02,1,qEuler(Math.PI/2,0,0),vC(0x2e2a26));}
function vnWaterButt(x,y,z,r,h){vPst('vTank',x,y,z,r,h,null);vB('vIron',x,y+h,z,r*1.9,.08,r*1.9,0,vC(0x2e2a26));}
function vnCrate(x,y,z,s,ry,c){vB('vWood',x,y,z,s,s*.8,s*.9,ry,c||vC(vPick(VPAL.woodMid)));}
function vnSacks(x,y,z,n){for(let i=0;i<n;i++)kput('vSack',[x+rr(-.6,.6),y+.32+((i>2)?.45:0),z+rr(-.5,.5)],qEuler(0,rng()*TAU,0),[.42,.32,.36],vC(vPick([0xb8a080,0xa89070,0xc8b898])));}
function vnPlanter(x,y,z,w,d,ry,c){vB('vWood',x,y,z,w,.55,d,ry,c);for(let k=0;k<Math.max(1,Math.round(w*d/1.2));k++)kput('vLeaf',[x+rr(-w*.35,w*.35),y+.62,z+rr(-d*.3,d*.3)],null,[rr(.28,.5),rr(.22,.42),rr(.28,.5)],vC(vPick([0x3f7a34,0x4f9a3a,0x2f6a2a,0x6aa04a])));}
function vnDryingRack(x,y,z,ry,L){for(const s of[-1,1]){const p=loc(x,z,s*L/2,0,ry);vPst('vPost',p[0],y,p[1],.06,2.2,vC(0x8a7a66));}
 const a=loc(x,z,-L/2,0,ry),b=loc(x,z,L/2,0,ry);vBeam([a[0],y+2.1,a[1]],[b[0],y+2.1,b[1]],.03,vC(0xb8a888),'vRope');
 for(let k=0;k<Math.round(L/.9);k++){const p=loc(x,z,-L/2+.5+k*.9,0,ry);kput('vCloth',[p[0],y+1.55,p[1]],vQ(ry,0,0),[.6,1.05,1],vC(vPick(VPAL.awning)));}}
// Striped awning on two poles, sloping down and out from the wall at (x,z,ry-face).
function vnAwning(x,y,z,ry,w,out,c){const q=vQ(ry,.42,0);const p=loc(x,z,0,out/2,ry);const n=new THREE.Vector3(0,1,0).applyQuaternion(q);
 kput('vClothB',[p[0]+n.x*.03,y-Math.tan(.42)*out/2+.35,p[1]+n.z*.03],q,[w,.06,out/Math.cos(.42)],c||vC(vPick(VPAL.awning)));
 for(const s of[-1,1]){const pp=loc(x,z,s*(w/2-.1),out-.1,ry);vPst('vPost',pp[0],y-3,pp[1],.05,y-Math.tan(.42)*out+.3-(y-3),vC(0x6a5a48));}}
function vnBannerPole(x,y,z,ry,h,c){vPst('vPost',x,y,z,.08,h,vC(0x5a4632));const p=loc(x,z,.55,0,ry);vB('vWood',p[0],y+h-.2,p[1],1.1,.08,.08,ry,vC(0x5a4632));
 kput('vCloth',[p[0],y+h-1.6,p[1]],vQ(ry+Math.PI/2,0,0),[.7,2.7,1],c||vC(vPick(VPAL.orange)));}
function vnChimney(x,y,z,h,r,rusty){vPst(rusty?'vPipeR':'vPipe',x,y,z,r,h,null);vB('vIron',x,y+h+.1,z,r*3,.08,r*3,0,vC(0x2e2a26));for(const s of[-1,1])vB('vIron',x+s*r*1.1,y+h-.05,z,.06,.2,.06,0,vC(0x2e2a26));
 // a world that keeps a CHIMNEYS list (the city: smoke) gets every chimney top, in world space, like DOORS
 if(window.CHIMNEYS&&VERN.cur){const c=VERN.cur,sc=c.o.scale||1;const wp=loc(c.x,c.z,x*sc,z*sc,c.ry);CHIMNEYS.push([wp[0],(c.o.y||0)+(y+h+.2)*sc,wp[1],0]);}}
// Fence of posts and two rails around a rectangle (gap at the front centre of width `gate`).
function vnFence(x,y,z,w,d,ry,c,gate,h){h=h||1.3;const segs=[[[-w/2,-d/2],[w/2,-d/2]],[[w/2,-d/2],[w/2,d/2]],[[-w/2,d/2],[-w/2,-d/2]]];
 if(gate){segs.push([[-w/2,d/2],[-gate/2,d/2]],[[gate/2,d/2],[w/2,d/2]]);}else segs.push([[w/2,d/2],[-w/2,d/2]]);
 for(const s of segs){const L=Math.hypot(s[1][0]-s[0][0],s[1][1]-s[0][1]);const n=Math.max(1,Math.round(L/2.2));
  for(let i=0;i<=n;i++){const p=loc(x,z,s[0][0]+(s[1][0]-s[0][0])*i/n,s[0][1]+(s[1][1]-s[0][1])*i/n,ry);vPst('vPost',p[0],y,p[1],.07,h,c);}
  const a=loc(x,z,s[0][0],s[0][1],ry),b=loc(x,z,s[1][0],s[1][1],ry);for(const yy of[.5,1.1])vBeam([a[0],y+yy*h/1.3,a[1]],[b[0],y+yy*h/1.3,b[1]],.07,c);}}
// Palisade: close-set sharpened logs on a low earth bank, with a walkway rail behind.
function vnPalisade(x,y,z,w,d,ry,h,gate){const c=vC(0x7a5a3e);const segs=[[[-w/2,-d/2],[w/2,-d/2]],[[w/2,-d/2],[w/2,d/2]],[[-w/2,d/2],[-w/2,-d/2]],[[-w/2,d/2],[-gate/2,d/2]],[[gate/2,d/2],[w/2,d/2]]];
 for(const s of segs){const L=Math.hypot(s[1][0]-s[0][0],s[1][1]-s[0][1]);const n=Math.round(L/.42);
  for(let i=0;i<=n;i++){const p=loc(x,z,s[0][0]+(s[1][0]-s[0][0])*i/n,s[0][1]+(s[1][1]-s[0][1])*i/n,ry);vPst('vPostB',p[0],y-.2,p[1],.2,h+rr(-.25,.25),c.clone().multiplyScalar(rr(.85,1.1)));kput('vConeI',[p[0],y+h-.15,p[1]],null,[.2,.5,.2],c);}
  const a=loc(x,z,s[0][0],s[0][1],ry),b=loc(x,z,s[1][0],s[1][1],ry);vBeam([a[0],y+h*.55,a[1]],[b[0],y+h*.55,b[1]],.14,c);}}
// A few townsfolk for scale (the kit's own figure items), tinted like Iziz robes.
function vnFolk(x,z,n,spread){for(let i=0;i<n;i++){const px=x+rr(-spread,spread),pz=z+rr(-spread,spread);kput('figB',[px,0,pz],qEuler(0,rng()*TAU,0),1,vC(vPick([0xe8d9b8,0xc9442a,0x2f8f8a,0x7a3d8a,0xe0a030,0x3b4a8a,0x8a6a3a])));kput('figH',[px,0,pz],null,1,vC(0xc9a17e));}}
// paved yard / threshold slabs
function vnPaving(x,y,z,w,d,ry,c,n){n=n||Math.round(w*d/4);for(let i=0;i<n;i++){const p=loc(x,z,rr(-w/2,w/2),rr(-d/2,d/2),ry);vB('vFlag',p[0],y-.06,p[1],rr(1.1,2.2),.1,rr(.9,1.8),ry+rr(-.1,.1),c||vC(vPick(VPAL.stoneDark)));}}
