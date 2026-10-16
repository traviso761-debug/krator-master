// prefix: is
// ================================================================= YARDS: the open-air works both styles share
// The new trades' outdoor gear (owner, 2026-10-14: a building for every trade the Voth city carries, in both sets), drawn the
// same in the West and in Kautoa; the roofs over them are each style's own (58-iw-trades.js, 67-ie-trades.js).
//   isUmu(x,z,s)            an earth oven: a ring of hearth stones round a low mound of leaves and earth, smoking
//   isSmokeRack(x,z,ry,L)   a smoking rack: a pole frame over a smouldering trench, fish and pork hung on it
//   isDryRack(x,z,ry,L,k)   a drying frame: hides (k 'hide') or beaten bark-cloth (k 'tapa') stretched between poles
//   isSaltPans(x,z,nx,nz,s) evaporating pans: shallow clay beds in a grid with low walls, brine, salt raked into heaps
//   isQuarryFace(x,z,ry,w,h) a cut face of coral rock, squared blocks on the floor, a lifting tripod
//   isSulphurVent(x,z,s)    a fuming vent in a crust of yellow sulphur, the diggings round it, baskets of it
//   isBeacon(x,y,z,s)       a fire basket of iron on a stone hearth, its glow and smoke
//   isCargo(x,z,ry,n)       a pile of trade goods under a net: bales, storage jars, crates
//   isPen(x,z,w,d,o)        a stock pen: a bamboo fence round w x d (o.gate the gap on +z), a trough, straw
//   isAdit, isWindlass, isOrePile  the mine's workings (the mines in 58-iw-trades.js, 67-ie-trades.js); isOreLinks() each
//                           placed mine's source by resSource (kits/resources, read in place by build.py)
// Frame: as the caller's; y is the ground unless given.
const IS_SULPHUR=0xd6c23a,IS_SALT=0xeee9dc,IS_BRINE=0x7a9a96;
function isUmu(x,z,s){s=s==null?1:s;W(x,0,z,0,()=>{const n=11;for(let i=0;i<n;i++){const a=i/n*TAU;sph('stone',Math.cos(a)*1.0*s,0,Math.sin(a)*1.0*s,.22*s,P('stoneD'),.7,7);}
 ellip('earth',0,0,0,.85*s,.32*s,.85*s,P('earth'),0,12);for(let i=0;i<7;i++){const a=i/7*TAU+.3;WX(Math.cos(a)*.45*s,.18*s,Math.sin(a)*.45*s,a,-.5,0,()=>psurf('flag',(u,v)=>[(u-.5)*.5*s,0,v*.6*s],2,2,P('leaf')));}
 smokeAt(0,.4*s,0,{r:.18*s});});}
function isSmokeRack(x,z,ry,L){W(x,0,z,ry,()=>{box('earth',0,0,0,L,.08,.9,0x3a3028);for(let i=0;i<Math.round(L/.8);i++)sph('glow',-L/2+.4+i*.8,.06,rr(-.2,.2),.08,0xff7a2a,1,5);
 for(const s of [-1,1])for(const e of [-1,1])pole('wood',[s*L/2,0,e*.45],[s*L/2,1.9,e*.3],.05,P('wood'),5);
 for(const y of [1.25,1.8])pole('wood',[-L/2,y,0],[L/2,y,0],.035,P('woodD'),5);
 for(let i=0;i<Math.round(L/.35);i++){const xx=-L/2+.25+i*.35,y=i%2?1.25:1.8;
  if(i%3===2)box('plain',xx,y-.55,0,.22,.45,.14,0x8a3a28);else WX(xx,y-.05,0,0,0,0,()=>{tube('plain',t=>[0,-t*.5,0],t=>{const r=.06+.05*Math.sin(PI*t);return [r,r*.5];},6,6,0x9a8a6a,{caps:true});});}
 smokeAt(0,.5,0,{r:.3});});}
function isDryRack(x,z,ry,L,k){W(x,0,z,ry,()=>{const n=Math.max(2,Math.round(L/1.7)+1);for(const xx of isSpan(-L/2,L/2,n))pole('wood',[xx,0,0],[xx,2.2,0],.05,P('wood'),5);
 pole('wood',[-L/2,2.1,0],[L/2,2.1,0],.04,P('woodD'),5);
 for(let i=0;i<n-1;i++){const x0=lerp(-L/2,L/2,i/(n-1))+.12,x1=lerp(-L/2,L/2,(i+1)/(n-1))-.12;
  if(k==='tapa')psurf('tapa',(u,v)=>[lerp(x0,x1,u),2.0-v*1.5,.02+.05*Math.sin(PI*u)],4,3,WHITE);
  else psurf('plain',(u,v)=>{const w=1-.25*Math.pow(2*v-1,2);return [lerp((x0+x1)/2-(x1-x0)/2*w,(x0+x1)/2+(x1-x0)/2*w,u),2.0-v*1.4,.03*Math.sin(PI*u)];},4,4,i%2?0x8a6a48:0x7a5a3a);
  for(const xx of [x0,x1])sagRope('rope',[xx,2.05,0],[xx,.5,0],.02,.012,P('rope'),2);}});}
function isSaltPans(x,z,nx,nz,s){s=s==null?3:s;W(x,0,z,0,()=>{const W0=nx*s,D0=nz*s;box('earth',0,0,0,W0+.6,.1,D0+.6,0x8e7a5c);
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const cx=-W0/2+(i+.5)*s,cz=-D0/2+(j+.5)*s,dry=(i*3+j*5)%4;
  if(dry===0)box('sand',cx,.1,cz,s-.3,.04,s-.3,IS_SALT);else box('water',cx,.1,cz,s-.3,.05,s-.3,IS_BRINE);
  if(dry===0)for(let k=0;k<2;k++)cone('sand',cx+rr(-.6,.6),.12,cz+rr(-.6,.6),rr(.3,.5),rr(.35,.55),IS_SALT,8);}
 for(let i=0;i<=nx;i++)box('earth',-W0/2+i*s,.1,0,.18,.14,D0,0x7a6648);for(let j=0;j<=nz;j++)box('earth',0,.1,-D0/2+j*s,W0,.14,.18,0x7a6648);});}
function isQuarryFace(x,z,ry,w,h){W(x,0,z,ry,()=>{for(let i=0;i<6;i++){const xx=lerp(-w/2,w/2,i/5),hh=h*(.7+.3*h3(i,2,3)),dd=rr(1.4,2.2);box('coral',xx,0,-dd/2,w/5+.3,hh,dd,P('coral'));}
 for(let i=0;i<7;i++)box('coral',rr(-w/2+.6,w/2-.6),0,rr(.8,2.4),.7,.45,.5,P('coral'),rr(-.4,.4));
 for(let i=0;i<14;i++)sph('coral',rr(-w/2,w/2),0,rr(.2,1.4),rr(.08,.18),P('coral'),.5,5);
 for(let k=0;k<3;k++){const a=k/3*TAU;pole('wood',[w*.25+Math.cos(a)*1.0,0,1.6+Math.sin(a)*1.0],[w*.25,3.2,1.6],.06,P('wood'),5);}sagRope('rope',[w*.25,3.15,1.6],[w*.25,.5,1.6],.02,.02,P('rope'),2);
 box('coral',w*.25,.3,1.6,.6,.4,.5,P('coral'));});}
function isSulphurVent(x,z,s){s=s==null?1:s;W(x,0,z,0,()=>{ellip('stone',0,0,0,2.2*s,.18*s,2.0*s,IS_SULPHUR,0,14);ellip('stone',0,0,0,1.0*s,.32*s,.9*s,0xc8a828,0,12);
 cyl('earth',0,.25*s,0,.32*s,.12*s,0x3a3020,10);for(let i=0;i<9;i++){const a=i/9*TAU;sph('stone',Math.cos(a)*2.4*s,0,Math.sin(a)*2.2*s,rr(.18,.32)*s,i%2?IS_SULPHUR:P('stoneD'),.6,6);}
 smokeAt(0,.45*s,0,{r:.35*s});});}
function isBeacon(x,y,z,s){s=s==null?1:s;W(x,y,z,0,()=>{cyl('stone',0,0,0,.9*s,.5*s,P('stone'),10);for(let k=0;k<4;k++){const a=k/4*TAU+PI/4;beam('iron',[Math.cos(a)*.5*s,.5*s,Math.sin(a)*.5*s],[Math.cos(a)*.7*s,1.4*s,Math.sin(a)*.7*s],.04*s,P('iron'),true,4);}
 ring('iron',0,1.35*s,0,.7*s,.04*s,P('iron'),0,PI/2);ring('iron',0,.9*s,0,.6*s,.04*s,P('iron'),0,PI/2);for(let i=0;i<6;i++)beam('wood',[rr(-.4,.4)*s,.6*s,rr(-.4,.4)*s],[rr(-.3,.3)*s,1.1*s,rr(-.3,.3)*s],.06*s,P('woodD'),true,4);
 sph('glow',0,1.05*s,0,.32*s,0xffa040,1.2,8);haloAt(0,1.2*s,0,0xffa040,true);smokeAt(0,1.5*s,0,{r:.3*s});});}
function isCargo(x,z,ry,n){W(x,0,z,ry,()=>{const S={setting:'outdoor'};for(let i=0;i<(n==null?4:n);i++){const xx=(i%3-1)*1.1,zz=Math.floor(i/3)*1.0;
 FURNISH(i%3===0?'job_bales':i%3===1?'generic_storage_jar':'generic_crate',xx,0,zz,rr(-.3,.3),S);}});}
function isPen(x,z,w,d,o){o=o||{};W(x,0,z,0,()=>{const g=o.gate===undefined?1.6:o.gate;
 W(0,0,-d/2,0,()=>isFenceRun(w,1.0));for(const s of [-1,1])W(s*w/2,0,0,PI/2,()=>isFenceRun(d,1.0));
 for(const s of [-1,1])W(s*(w/4+g/4),0,d/2,0,()=>isFenceRun(w/2-g/2,1.0));
 box('earth',0,0,0,w,.04,d,0x6a5236);FURNISH('generic_trade_trough',-w/2+1.2,0,-d/2+.8,0,{setting:'outdoor'});
 for(let i=0;i<5;i++)ellip('plain',rr(-w/2+.6,w/2-.6),0,rr(-d/2+.6,d/2-.6),rr(.3,.6),.08,rr(.3,.5),0xc8b070,0,6);});}
/* FURNISH a list: [key, x, y, z, ry, opts] (the same as Kautoa's ieFurn, for both styles) */
function isFurn(list){for(const e of list)FURNISH(e[0],e[1],e[2],e[3],e[4]||0,e[5]);}
/* ---------------------------------------------------------------- the mine's workings, both styles */
function isAdit(x,z,ry,o){o=o||{};const w=o.w==null?2.4:o.w,h=o.h==null?2.6:o.h;W(x,0,z,ry,()=>{
 for(let i=0;i<7;i++){const xx=lerp(-5,5,i/6),hh=rr(4,6.2)*(1-Math.abs(xx)/12);if(Math.abs(xx)<w/2+.3)continue;box('stone',xx,0,-1.6,1.9,hh,2.6,i%2?P('stoneD'):P('stone'),rr(-.1,.1));}
 box('stone',0,h+.35,-1.6,w+1.4,rr(2.6,3.4),2.6,P('stoneD'));
 box('earth',0,0,-1.6,w,.04,2.6,0x2a2420);box('plain',0,.05,-2.85,w,h,.05,0x0e0c0a);
 for(const s of [-1,1])box('wood',s*(w/2-.12),0,-.4,.24,h,.24,P('woodD'));box('wood',0,h,-.4,w+.2,.26,.3,P('woodD'));
 for(const s of [-1,1])box('wood',s*(w/2-.12),0,-1.8,.2,h,.2,P('wood'));box('wood',0,h-.05,-1.8,w,.22,.24,P('wood'));
 for(let i=0;i<9;i++)ellip('stone',5.4+rr(-.6,.6),0,1.2+rr(-1,1.2),rr(.8,1.6),rr(.4,1),rr(.8,1.4),P('stoneD'),rr(0,TAU),6);});}
function isWindlass(x,z,ry){W(x,0,z,ry,()=>{cyl('stone',0,0,0,1.1,.45,P('stone'),12);cyl('plain',0,.4,0,.85,.06,0x0e0c0a,12);
 for(const s of [-1,1]){beam('wood',[s*1.3,0,-.5],[s*1.1,1.6,0],.1,P('woodD'),false);beam('wood',[s*1.3,0,.5],[s*1.1,1.6,0],.1,P('woodD'),false);}
 W(0,1.55,0,0,()=>{tube('wood',t=>[(t-.5)*2.3,0,0],()=>[.12,.12],4,8,P('wood'),{caps:true});for(const s of [-1,1])beam('wood',[s*1.2,0,0],[s*1.2,-.45,.4],.04,P('woodD'),true,4);});
 sagRope('rope',[0,1.55,.12],[0,.7,0],.01,.02,P('rope'),2);cyl('wood',0,.45,0,.22,.28,P('wood'),8);});}
function isOrePile(x,z,metal,s){s=s==null?1:s;const L=RES_LOOK[metal]||RES_LOOK.iron;W(x,0,z,0,()=>{cone('stone',0,0,0,.9*s,.7*s,L.pile,10);
 for(let i=0;i<10;i++){const a=rr(0,TAU),r=rr(.2,.85)*s;sph('stone',Math.cos(a)*r,rr(0,.2)*s,Math.sin(a)*r,rr(.06,.12)*s,i%3?L.pile:L.lump,.7,5);}});}
function isOreLinks(){const nodes=REG.filter(r=>r.kind==='res-node').map(r=>({id:r.tid||r.key,key:r.key,kind:r.tags.rock,grade:r.tags.level,x:r.x,z:r.z}));
 const mines=REG.filter(r=>!r.parent&&resWorksOf(r)).map(r=>({id:r.tid||r.key,key:r.key,works:resWorksOf(r),x:r.x,z:r.z}));
 return {nodes,mines:mines.map(m=>Object.assign({},m,{source:resSource(m,nodes)}))};}
globalThis.isOreLinks=isOreLinks;
