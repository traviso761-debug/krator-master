// ================================================================= HOST — the site: the badlands' landforms on the model (station 3)
// The badlands' own site functions (the cauldrons' are src/44s): the same interface the frame reads (siteBuild, sitePoint, siteRelief,
// siteApron, stairAt, SITE_RECS, SITE_SPRINGS, SITE_STAIR, DIKES, TALUS, SITE_DIKE_MID), on its own landforms:
//   the GULLIES   KRELIEF.gully (core/terrain 38c), `liang` tops: the trunk systems cut into the slope, their floors never climbing downstream
//   the RIBS      KSTACKS.row fins (37): the dike_lattice, low walls across the slope; a fin whose footprint would stand in a gully is left
//                 out (the gully has cut the dike through), its foot under the lowest ground round it
//   the ORE       KSTACKS.cluster (37): the magnetite outcrops, black knobs and rust-stained spires
//   the TALUS     KRELIEF.talus (38) against the ribs' and the outcrops' feet
// The site is DATA the stage (45) reads: siteBuild(ground) makes the records once the model's ground exists; siteRelief(x, z) is then
// metres over the model's ground; sitePoint(x, z) each record's part there (the zones' fields: 47).
let SITE_RECS=null,SITE_SPRINGS=[],SITE_STAIR=null,DIKES=[],TALUS=null,SITE_MOUTHS=[];
// the slope's own swells and its fine roughness, under the gullies: core/rand's noise, never a page fbm
function siteSwell(x,z){return 6*(KRAND.fbm(x*.0009+3.1,z*.0009-7.3,0,3,6302)-.5)*2+1.4*(KRAND.fbm(x*.008-2.2,z*.008+5.8,0,2,6303)-.5)*2;}
const _cut=p=>p==='floor'||p==='head'||p==='wall'||p==='rim';
function siteBuild(ground){const g0=(x,z)=>ground(x,z)+siteSwell(x,z);
 const G=SITE.gullies.map(Q=>KRELIEF.gully({pts:KRELIEF.meander(Q.a,Q.b,{amp:Q.amp,wave:Q.wave,seed:Q.seed+1}),ground:g0,depth:Q.depth,w:Q.w,tops:'liang',
  branches:6,blen:[100,360],seed:Q.seed+2}));
 SITE_RECS={gullies:G,gully:G[0]};
 const cutAt=(x,z)=>{let g=g0(x,z);for(const R of G){const a=KRELIEF.at(R,x,z,g);if(a&&_cut(a.part))return true;g=KRELIEF.shape(R,x,z,g);}return false;};
 const g1=(x,z)=>{let g=g0(x,z);for(const R of G)g=KRELIEF.shape(R,x,z,g);return g;};
 const low=(x,z,r)=>{let m=g1(x,z);for(let i=0;i<12;i++){const a=i/12*TAU;m=Math.min(m,g1(x+Math.cos(a)*r,z+Math.sin(a)*r));}return m;};
 // a body is kept only where none of its footprint (its centre and eight points round it at its reach) lies in a gully's cut
 const clear=(B)=>{const R=B.R==null?10:B.R;if(cutAt(B.x,B.z))return false;for(let i=0;i<8;i++){const a=i/8*TAU;if(cutAt(B.x+Math.cos(a)*R*.8,B.z+Math.sin(a)*R*.8))return false;}return true;};
 DIKES=[];SITE.dikes.forEach(D=>{KSTACKS.row({id:D.id,seed:D.seed,a:D.a,b:D.b,n:D.n,kind:'fin',H:D.H,r:D.r,e:D.e,jitter:14,taper:[.3,.5],
   ground:(x,z)=>low(x,z,D.r[1]*D.e[1]*.8)}).forEach(B=>{if(!clear(B))return;B.dike=D.id;B.name='A dike rib (basalt standing out of the skarn, '+(B.top-B.y0).toFixed(0)+' m)';DIKES.push(B);});});
 const O=SITE.ore;KSTACKS.cluster({id:'ore',seed:O.seed,c:O.c,rad:O.rad,n:O.n,kinds:{spire:.55,balanced:.45},H:O.H,r:O.r,gap:6,ground:(x,z)=>low(x,z,3),
   accept:(x,z,r)=>!cutAt(x,z)}).forEach(B=>{B.key='landform.ore';B.col=O.col;B.name='A magnetite outcrop (black iron ore, rust-stained: the skarn\'s ore, '+(B.top-B.y0).toFixed(0)+' m)';DIKES.push(B);});
 TALUS=KRELIEF.talus({bodies:DIKES,h:4,reach:14,seed:SITE.seed+7});
 SITE_RECS.ribs=DIKES.map(B=>({id:B.id,dike:B.dike||null,key:B.key||'landform.dike',x:B.x,z:B.z,y0:B.y0,top:B.top}));
 SITE_RECS.camp=SITE.camp;
 return SITE_RECS;}
// a point at u (0 head .. 1 mouth) along the first trunk's thalweg (the views)
function SITE_TRUNK_AT(u){if(!SITE_RECS)return [0,0];const L=SITE_RECS.gully.lines[0].pts,i=Math.min(L.length-1,Math.round(u*(L.length-1)));return [L[i][0],L[i][1]];}
function SITE_DIKE_MID(id){const D=SITE.dikes.find(q=>q.id===id);return [(D.a[0]+D.b[0])/2,(D.a[1]+D.b[1])/2];}
function siteApron(){return 0;}
function stairAt(){return null;}
// ---------------------------------------------------------------- one record a point (memo of the last): the height and each record's part
// the model and its swells, then each gully system cut into it (the deeper cut's part wins), then the talus at the bodies' feet; a body's
// footprint marked (KSTACKS.foot: the body is its own mesh, 47)
const _sp={x:NaN,z:NaN,P:null};
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const m=tarnBed(MODEL(x,z)),g0=m+siteSwell(x,z);
 let y=g0,part='model',order=-1,cut=0;
 for(const R of SITE_RECS.gullies){const a=KRELIEF.at(R,x,z,y),y2=KRELIEF.shape(R,x,z,y);if(a&&_cut(a.part)&&y-y2>=cut){part=a.part;order=R.lines[a.line].order;cut=y-y2;}else if(a&&part==='model')part=a.part;y=y2;}
 const tal=TALUS?TALUS(x,z):0;if(tal>.05&&part!=='floor'){y+=tal;if(tal>1.5)part='talus';}
 let dk=null;const f=DIKES.length?KSTACKS.foot(DIKES,x,z):null;if(f&&f.d<.5){dk=f.S;part='dike';}
 const P={m,d:0,y,rel:y-m,part,order,cut:Math.max(0,g0-y),tread:null,dike:dk?dk.id:null,dikeD:f?f.d:1e9,talus:tal};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
function siteRelief(x,z){return sitePoint(x,z).rel;}
