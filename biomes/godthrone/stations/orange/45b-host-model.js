// ================================================================= HOST — the ground model: THE ORANGE BELT (station 3)
// PLAN.md section 4 ("The dry-cold line and the orange belt", "Palagonite ridges", "Debris-covered ice") on map 5.1's site (px
// 736,1325: 8,347 m, the flank falling west-north-west at ~0.22). Its own frame (x east, z south, origin at the site); every form a
// height function or a core/terrain record (KRELIEF), composed in baseH:
//   THE FLOWS     upslope (east), over the dry-cold line: thin black titanium-basalt flows in lobes down the slope, frost in their
//                 shade, the black bead sand of old fountains drifted in their hollows
//   THE LINE      8,500 m (KSTRATA's alteration, wandering 400 m): below it the bead beds and every drift are palagonite, ochre to
//                 rust-orange; the black fades out downslope over a few hundred metres
//   THE CLIFF     a scarp across the slope just under the line (KRELIEF.scarp, 95 m, two benches, ravines): the old palagonite tuff
//                 (hyaloclastite, `palagonite-tuff`) under the flows that capped it, honeycombed with tafoni, talus at its foot
//   THE RIDGES    under the cliff the soft palagonite weathered into knife-edged ridges running down the slope and deep gullies
//                 between them that hold snow all summer on their shaded sides
//   THE ICE       at the map's foot (~7.3-7.6 km, EF): two debris-covered tongues, cold-based glaciers buried under rubble, lobate,
//                 their surfaces ridged and pitted where the ice sublimes through a thin cover
const DOWN=[-.902,-.431],ACROSS=[.431,-.902],OB={y0:8347,slope:.205,line:8500};
const dOf=(x,z)=>x*DOWN[0]+z*DOWN[1],aOf=(x,z)=>x*ACROSS[0]+z*ACROSS[1],xzDA=(d,a)=>[d*DOWN[0]+a*ACROSS[0],d*DOWN[1]+a*ACROSS[1]];
// the slope: the flank's own (5.1's ~0.22 over 10 km), a little concave, swells and old flow lobes (2-6 m tongues down it)
function slopeH(x,z){const d=dOf(x,z),a=aOf(x,z);
 const lobes=5*(1-Math.abs(fb(a*.0019+fb(d*.0005,a*.0005,2,WORLD+50)*2,d*.0005,2,WORLD+51)*2-1));
 return OB.y0-OB.slope*d+1.4e-5*d*d*Math.sign(d)*.5+22*(fb(x*.0004,z*.0004,2,WORLD+52)-.5)+lobes+1.1*(vn(x*.03,z*.03,WORLD+53)-.5);}
// THE CLIFF: across the slope at d ~ 450-650 (~8.2 km), its rim wandering; the flows above stand 95 m over the ridged ground below
const CLIFF=KRELIEF.scarp({pts:[-5600,-3600,-1500,600,2700,4800,6000].map((a,i)=>xzDA(520+90*Math.sin(i*1.7)+40*Math.cos(i*3.1),a)),side:1,h:95,run:70,power:1.15,drop:true,
 benches:{n:2,w:9},ravines:{n:5,w:[22,40],head:[60,160],depth:[20,45],fan:{r:70,h:6}},buttresses:{sp:260,w:.28,amp:14},talus:{h:9,reach:38},rough:.03,ends:400,seed:KR.hash(WORLD,31,0,0xC11F)});
// the side the floor lies: KRELIEF.scarp's side 1 has the plateau on n = (-uz, ux); its line runs along ACROSS, so n points down the slope
// (checked by the page: the cliff's foot is downslope of its rim, 98-host-orange.js)
// THE RIDGES: from the cliff's foot down, knife-edged palagonite ridges between gullies, both running down the slope; their depth grows
// downslope from nothing at the cliff to ~55 m, their spacing 180-260 m, the line between them wandering
const RIDGE={sp:220,D:55,from:700,full:1700};
function ridgeAt(x,z,o){const d=dOf(x,z),a=aOf(x,z),k=smooth(RIDGE.from,RIDGE.full,d)*(1-smooth(3300,3900,d)*.6);o.k=k;
 const w=a/RIDGE.sp+.9*(fb(d*.0011,a*.0004,2,WORLD+55)-.5)+.25*(vn(d*.004,a*.002,WORLD+56)-.5),f=w-Math.floor(w),t=Math.abs(f-.5)*2;   /* t 0 on the crest, 1 in the gully */
 o.t=t;o.cell=Math.floor(w);const D=RIDGE.D*(.7+.6*KR.unit(KR.hash(WORLD,o.cell,0,0x51D)));o.cut=k*D*(1-Math.pow(1-t,1.5));return o;}
// THE ICE: two tongues of debris-covered ice down the ridged ground's foot, [a centre, d head, d snout, half-width, thickness]
const TONGUES=[[-1300,2500,4500,520,30],[1500,2900,4300,420,24]].map((t,i)=>({i,a:t[0],d0:t[1],d1:t[2],w:t[3],T:t[4],name:i?'The south tongue of debris-covered ice':'The north tongue of debris-covered ice'}));
function iceAt(x,z,o){const d=dOf(x,z),a=aOf(x,z);let best=0,bi=-1,edge=0,snout=0;
 for(const t of TONGUES){const c=t.a+60*Math.sin(d*.0018+t.i*2),u=Math.abs(a-c)/t.w;if(d<t.d0-400||d>t.d1+60)continue;
  const lobe=t.d1-t.w*.35*u*u;   /* the snout's lobe: rounded in plan */
  const k=smooth(1,.72,u)*smooth(t.d0-400,t.d0+200,d)*smooth(lobe+40,lobe-60,d);if(k>best){best=k;bi=t.i;edge=u;snout=smooth(lobe-120,lobe+20,d);}}
 o.k=best;o.i=bi;o.u=edge;o.snout=snout;if(best<=0){o.y=0;o.pit=0;o.ridge=0;return o;}
 const T=TONGUES[bi],pc=KR.hash(WORLD,Math.floor(x/38),Math.floor(z/38),0x917),pit=KR.unit(pc)<.22?smooth(16,4,Math.hypot(x-(Math.floor(x/38)+.5)*38,z-(Math.floor(z/38)+.5)*38)):0;
 const arc=d+.0009*Math.pow(a-T.a,2);   /* arcuate ridges, bowed downslope as the ice flowed */
 o.ridge=1.8*Math.sin(arc/38+2*fb(x*.004,z*.004,2,WORLD+57));o.pit=pit;
 o.y=T.T*Math.pow(best,.6)+o.ridge*best-4.5*pit;return o;}
const _ri={},_ic={};
function preH(x,z){const g=slopeH(x,z);ridgeAt(x,z,_ri);let y=g-_ri.cut;iceAt(x,z,_ic);if(_ic.k>0)y=Math.max(y,g-_ri.cut*(1-_ic.k)+_ic.y);return y;}
// the rock: palagonite tuff (the old subglacial glass, altered) under the titanium basalt's flows; the bead beds of the flows altered too
// under the line (KSTRATA's alteration, the recipe's own at 8,500 m)
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,3,0x57A7),formations:[{recipe:'palagonite-tuff',top:8290},{recipe:'tibasalt'}],range:[6600,9800],
 dip:[DOWN[0],DOWN[1],.02],warp:[5,1.4],wash:{m:2},regolith:.45,dust:0x5a4630});
const _ground=KRELIEF.apply(preH,[CLIFF]);
/* past the map the scale model's own relief (station.json "region", src/45a5-host-region.js): the far country is 5.1's */
function baseH(x,z){const g=_ground(x,z);return REGION?REGION.blend(g,x,z,5400,9500,OB.y0):g;}
// THE FIELDS (45c caches them): the line's alteration on the ground (palag), the black bead drifts above it, the cliff's faces and talus,
// snow in the gullies' shade, the ice, the crusts
const VENT={x:1e6,z:1e6,r:0,h:0,throat:0,crater:0,cd:0,base:0,top:0,lavaY:0,name:'(no vent on this station)'};
const lineAt=(x,z)=>OB.line+180*(fb(x*.0007,z*.0007,2,WORLD+58)-.5);
const MODEL={fieldsAt(x,z,sl,hollow,o){const g=slopeH(x,z),c=KRELIEF.at(CLIFF,x,z,g),y=terrainH(x,z),R=ridgeAt(x,z,{}),I=iceAt(x,z,{});
  const below=smooth(lineAt(x,z)+60,lineAt(x,z)-260,y);   /* 0 above the line, 1 a few hundred metres under it */
  o.face=c&&(c.part==='face'||c.part==='ravine')?1:R.k>.3&&sl>.75?smooth(.75,1.1,sl)*.8:0;
  o.talus=c&&(c.part==='talus'||c.part==='fan')?1:R.k>.3?.25*smooth(.4,.9,R.t):0;
  o.rampart=0;o.vent=0;o.glass=0;
  /* the drifts: black bead sand in the hollows over the line; under it the same drifts are palagonite (they went first) */
  const drift=clamp(.25+.75*hollow,0,1)*smooth(.95,.4,sl)*(1-I.k);
  o.halo=drift*(1-below)*.85;o.orange=0;
  o.palag=clamp(Math.max(below*(.55+.45*drift),c&&c.part!=='rim'?below:0)*(1-.85*I.k),0,1);
  /* snow: in the gullies' floors on their shaded (north-facing: the noon sun stands north at 50 S... here the sky's sun) sides, and the cliff's foot */
  const north=clamp(-(terrainH(x,z+12)-terrainH(x,z-12))/24/.5,-1,1);
  o.snow=clamp(R.k*smooth(.65,.95,R.t)*(.5+.5*smooth(-.1,.5,-north))*smooth(7400,8100,y)*(.6+.4*vn(x*.01,z*.01,WORLD+59)),0,1);
  /* the ice: rubble over most of it (the debris cover is the ground), bare ice in the pits and on the snouts' steep fronts */
  o.ice=I.k>0?clamp(.15+.85*Math.max(I.pit,I.snout*smooth(.3,.7,sl)),0,1)*smooth(.2,.6,I.k):0;
  /* the crusts: black and orange lichen on stable stony ground under ~8.6 km, out of the snow and off the ice and the faces */
  o.crust=clamp(smooth(8650,8300,y)*smooth(.8,.3,sl)*(1-o.snow)*(1-I.k)*smooth(.45,.7,vn(x*.02,z*.02,WORLD+60)),0,1)*.8;
  return o;},
 /* the far country in the station's colours: ochre palagonite under the line, black flows over it, snow in the shade */
 farColor(x,z,h,sl,c,K){const pal=K.L([176,122,52]),below=smooth(OB.line+60,OB.line-260,h);let q=K.mixC(c,pal,.75*below);return q;},
 after(){}};
var PORTAL=null;
