// ================================================================= THEODIGA — the water on core/water: the records
// The owner, 2026-11-15: "make sure this build is on core/water and all other relevant core modules". buildDam hands each site
// its numbers (THEOWATER.dam, at the end of the builder) and the water is made here as core/water's records, in world
// coordinates; 90w-theodiga-water.js draws them once core/atmos is bound. Nothing of the kit's own water is drawn on this page.
//   intact: the full lake at 378 m (still), and the two outlets' falls at the foot (24 m)
//   ruin:   the lake at the Notch's sill (still), the overflow across the sill (a flow), the CASCADE down the battered face to
//           the canyon floor (a fall that follows the face: WATER.fall's `face`), its plunge pool (still) and the river down the
//           canyon (a flow along the channel buildDam cut into the mud)
// THEOWATER.ground(x, z) is the ruin's ground for core/ruins: the lake bed, the canyon floor's mud, else 0.
// [G data]: no three.js, no DOM.
const THEOWATER={sites:[],records:[]};
THEOWATER.dam=function(d,c){
 const gx=c.gx,gz=c.gz,W=(x,z,y)=>[x+gx,z+gz,y],ruin=d>0,site={d:d,c:c,still:[],flow:[],fall:[]};
 const zc=c.zc,th=c.th;
 // the lake: from the page's upstream edge to the dam's upstream face
 const poly=[];
 for(let i=0;i<=24;i++){const x=-c.SPAN/2-40+(c.SPAN+80)*i/24;poly.push([x+gx,gz-700]);}
 for(let i=24;i>=0;i--){const x=-c.SPAN/2-40+(c.SPAN+80)*i/24;poly.push([x+gx,gz+zc(x)-4]);}
 site.still.push(WATER.still({name:ruin?'The lake, at the Notch\'s sill':'The lake',level:c.WL,poly:poly}));
 if(!ruin){
  for(const x of c.outlets){const z=c.zf(26)+6;
   site.fall.push(WATER.fall({name:'The outlet\'s fall',lip:[W(x-7,z,26),W(x+7,z,26)],dir:[0,1],speed:3,drop:24,spread:5}));}
 }else{
  const NX=c.NX,wN=c.wN,zUp=zc(NX)-2,zLip=zc(NX)+th(c.NB),zToe=zc(NX)+th(0),lipY=c.WL-.6;
  // over the sill: the lake runs through the Notch to its downstream lip
  site.flow.push(WATER.flow({name:'The overflow at the Notch',pts:[W(NX,zUp-6,c.WL),W(NX,zLip,lipY)],width:2*wN,speed:3}));
  // the cascade: down the battered face (its height at a point is where the face stands there), from the lip to the canyon floor
  const faceY=(x,z)=>{const t=(z-gz)-zc(x-gx);return Math.max(0,Math.min(c.NB,c.H*(1-(t-50)/110)));};
  site.fall.push(WATER.fall({name:'The cascade',lip:[W(NX-wN,zLip,lipY),W(NX+wN,zLip,lipY)],dir:[0,1],speed:3,drop:lipY-1,
   foot:W(NX,zToe+4,1),face:faceY,faceLift:1.2,spread:9}));
  // its plunge pool, and the river from it down the canyon
  const pp=[];for(let i=0;i<20;i++){const a=i/20*2*Math.PI;pp.push([NX+gx+28*Math.cos(a),zToe+18+gz+20*Math.sin(a)]);}
  site.still.push(WATER.still({name:'The plunge pool',level:1.05,poly:pp}));
  const pts=[],wid=[];
  for(let z=c.zf(0)+62;z<=c.zf(0)+572;z+=30){pts.push(W(c.RIVX(z),z,1));wid.push(2*c.RIVW(z));}
  site.flow.push(WATER.flow({name:'The river',pts:pts,width:wid,speed:1.6}));
 }
 THEOWATER.sites.push(site);
 return site;};
// the ruin's ground at a world point (for core/ruins): upstream of the dam the lake bed, downstream the canyon floor's mud
THEOWATER.ground=function(site,x,z){const c=site.c,lx=x-c.gx,lz=z-c.gz;
 if(Math.abs(lx)>c.SPAN/2)return 0;
 if(lz<c.zc(lx)-2)return c.bedY(lx,lz);
 const z0=c.zf(0)+60;if(lz>=z0&&lz<=z0+500&&Math.abs(lx)<(c.SPAN-40)/2)return Math.max(c.floorY(lx,lz),0);   /* the scene's ground plane is at 0 */
 return 0;};
