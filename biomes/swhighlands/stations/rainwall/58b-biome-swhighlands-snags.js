// ================================================================= SW HIGHLANDS — the drowned trees (station 2, the landslide lake): a kit pass
// PLAN.md section 4: the landslide lake "the old valley's drowned trees standing in the water" (Sarez's). The trees of the valley floor
// the lake rose over (lattice oaks, by their braided boles) stand dead and bleached where the water is under 18 m deep, broken off a few
// metres over the surface, a few stubs of limb left. A kit pass of this station's (it ships in stations/rainwall, read only on its page):
// it wraps SWHI.buildRainwall so the drowned trees are placed in the same build, by the host's field `snag` (the drowned floor shallow
// enough, 0..1) and BIO.host.waterH; one candidate a 15 m cell, KRAND by (world, cell, salt) only. Not BIO.mask: the mask keeps the living
// flora out of the water, which is where these stand.
(function(){const {TAU,lerp}=BIO.fn,SP=SWHI.SPECIES,KEY=SWHI.KEY,FL=SWHI.FL,curve=FL.curve,reg=FL.reg,PICK=SWHI.PICK;
const Y=(x,z)=>BIO.terrainH(x,z);
const TAGS=Object.assign({},SWHI.TAGS,{riparian:'yes',harvest:{wood:'timber (drowned: sound under the water, rotten above it)',edible:[],medicinal:false,notes:'dead trees of the old valley floor, standing in the landslide lake'}});
SWHI.PLANTS.push({label:'Drowned tree',name:'Drowned tree (a lattice oak of the old valley floor)',tags:TAGS});
const BK=SWHI.BKMAT;BK.swsnag=BIO.barkMat(SWHI.TX.cord);
BIO.bucket('swsnag',BK.swsnag,{label:'Drowned tree',uvScale:[1.5,2]});
const PAL=[0x9c968a,0x8e897e,0xaaa498,0x7e786c];
// one snag: a braided bole from the lake bed up through the water, broken at its top, two to four stubs of limb from the upper third
function snag(x,z,bed,w,s,st){const H=(w-bed)+s.range(2.5,9),rb=s.range(.35,.7),lx=s.range(-.04,.04)*H,lz=s.range(-.04,.04)*H,c=PICK(PAL,s.next());
 const P=[];for(let i=0;i<=6;i++){const t=i/6;P.push({x:x+lx*t*t,y:bed-.4+H*t,z:z+lz*t*t,r:rb*(1-.55*t)});}
 st.trunk+=BIO.tube('swsnag',P,c,{seg:7});
 const n=s.int(2,4);for(let k=0;k<n;k++){const t=s.range(.6,.92),p=P[Math.round(t*6)],a=s.range(0,TAU),L=s.range(1,3.2)*(1-t*.4),e=[p.x+Math.cos(a)*L,p.y+L*s.range(.2,.7),p.z+Math.sin(a)*L];
  if(p.y<w+.5)continue;st.limb+=BIO.tube('swsnag',curve([p.x,p.y,p.z],[(p.x+e[0])/2,(p.y+e[1])/2+.2,(p.z+e[2])/2],e,3,p.r*.55,p.r*.25),c,{seg:5});}
 reg({name:'Drowned tree (a lattice oak of the old valley floor)',key:'flora.drowned',kind:'tree',x,z,y:bed,r:Math.max(1.5,rb*3),h:H});return 1;}
SWHI.buildSnags=function(box,q){q=q==null?1:q;const st={trunk:0,limb:0,n:0},W=BIO.host.seed>>>0,cell=15/Math.sqrt(q),salt=811,u=(i,j,k)=>KRAND.unit(KRAND.hash(W,i,j,salt,k));
 SWHI.SNAGS=[];
 for(let j=Math.floor(box[1]/cell);j<=Math.floor(box[3]/cell);j++)for(let i=Math.floor(box[0]/cell);i<=Math.floor(box[2]/cell);i++){
  const x=(i+u(i,j,1))*cell,z=(j+u(i,j,2))*cell;if(x<box[0]||x>box[2]||z<box[1]||z>box[3])continue;
  const a=BIO.field('snag',x,z)*.55;if(a<=0||u(i,j,3)>a)continue;
  const bed=Y(x,z),w=BIO.host.waterH?BIO.host.waterH(x,z):-1e9;if(!(w>bed+.5))continue;
  st.n+=snag(x,z,bed,w,KRAND.stream(KRAND.hash(W,i,j,salt,4)),st);SWHI.SNAGS.push({x,z,bed,w});}
 return st;};
// the station's pass, run inside SWHI.build's station 2: the rain wall's own, then the drowned trees
const RW=SWHI.buildRainwall;
SWHI.buildRainwall=function(box,q,bridges){const out=RW(box,q,bridges);const s=SWHI.buildSnags(box,q);out.snags=s.n;out.tris.snags=s.trunk+s.limb;return out;};
})();
