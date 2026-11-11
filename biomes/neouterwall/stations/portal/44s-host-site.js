// ================================================================= HOST — the site: the Portal Valley's head (station 5a)
// The Portal's own site functions (the cauldrons' are src/44s): the same interface the frame reads (siteBuild, sitePoint, siteRelief,
// siteApron, stairAt, SITE_RECS, SITE_SPRINGS, SITE_STAIR, SITE_MOUTHS, DIKES, TALUS, SITE_DIKE_MID), on its own landforms:
//   the HEADWALL   KRELIEF.scarp (core/terrain 38) across the valley's head, standing over the model's floor
//   the PORTAL     the cave's outer mouth at the headwall's foot on the valley's axis (SITE_MOUTHS: 47 cuts it with KCARVE)
//   the CAIRNS     small KSTACKS piles (37, 'balanced') down the floor from the portal, each KRAND-hashed by its index
//   the floor      the model's own (edit 1 carved the valley): its axis is where the ground is lowest across the box
let SITE_RECS=null,SITE_SPRINGS=[],SITE_STAIR=null,DIKES=[],TALUS=null,SITE_MOUTHS=[],CAIRNS=[];
function siteSwell(x,z){return 2.5*(KRAND.fbm(x*.002+5.1,z*.002-2.3,0,3,6602)-.5)*2+.8*(KRAND.fbm(x*.02,z*.02,0,2,6603)-.5)*2;}
let HEAD=null;
function siteBuild(ground){const g0=(x,z)=>ground(x,z)+siteSwell(x,z),H=SITE.head;
 HEAD=KRELIEF.scarp({pts:H.pts,side:1,h:H.h,run:H.run,talus:{h:6,reach:16},seed:H.seed});
 const gA=(x,z)=>KRELIEF.shape(HEAD,x,z,g0(x,z));
 // the valley's axis at a row z: the lowest ground across x
 const axis=z=>{let bx=0,by=1e9;for(let x=-1400;x<=1400;x+=20){const y=gA(x,z);if(y<by){by=y;bx=x;}}return [bx,by];};
 // the portal: at the headwall's foot on the axis, walking up the valley until the face begins (KRELIEF.at: 'face')
 const P=SITE.portal;let c=null;for(let z=400;z<1100;z+=2){const a=KRELIEF.at(HEAD,P.x,z);if(a&&a.part==='face'){c=[P.x,z-1];break;}}
 if(!c)c=[P.x,H.pts[1][1]-H.run];
 SITE_MOUTHS=[{id:'portal',name:P.name,c,n:[0,-1],hw:P.hw,depth:P.depth,h:P.h,floorY:g0(c[0],c[1]-6)+.3}];
 // the cairns: down the axis from the portal, each a little off it, on the floor
 const Q=SITE.cairns;CAIRNS=[];
 for(let k=0;k<Q.n;k++){const s=KRAND.stream(KRAND.hash(Q.seed,k)),z=c[1]-60-(k+.5)*Q.every,A=axis(z),x=A[0]+s.range(-25,25),H0=s.range(1.4,2.4),r=s.range(.55,.8);
  const B=KSTACKS.make({id:'cairn'+k,kind:'balanced',x,z,y0:gA(x,z)-.3,seed:KRAND.hash(Q.seed,k,9),H:H0,r,e:1,ry:s.range(0,TAU),taper:.4,lean:0});
  B.key='landform.cairn';B.col=[0x8a8680,0x6e6a66];B.name='A cairn (stones piled by the pilgrims and prospectors who walk up to the Portal: proposed, PLAN.md section 5)';CAIRNS.push(B);}
 DIKES=CAIRNS.slice();
 SITE_RECS={head:HEAD,portal:SITE_MOUTHS[0],cairns:CAIRNS.map(B=>({id:B.id,x:B.x,z:B.z,y0:B.y0,top:B.top})),floor:[-1200,-600,0,400].map(z=>{const A=axis(z);return [A[0],z,A[1]];})};
 return SITE_RECS;}
function SITE_DIKE_MID(){return [0,0];}
function siteApron(){return 0;}
function stairAt(){return null;}
const _sp={x:NaN,z:NaN,P:null};
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const m=tarnBed(MODEL(x,z)),g0=m+siteSwell(x,z),a=KRELIEF.at(HEAD,x,z);
 let y=KRELIEF.shape(HEAD,x,z,g0),part=a?(a.part==='talus'?'talus':'cliff'):'model';
 let dk=null;const f=DIKES.length?KSTACKS.foot(DIKES,x,z):null;if(f&&f.d<.3){dk=f.S;part='dike';}
 const P={m,d:0,y,rel:y-m,part,tread:null,dike:dk?dk.id:null,dikeD:f?f.d:1e9,talus:0};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
function siteRelief(x,z){return sitePoint(x,z).rel;}
