// ---------- Rama: the one shape everything else reads ----------
// The hull, the cross-section, the interior and the events all work in Rama's own frame: y along the axis,
// north (the hub, the bow) at +y, and an angle `a` round it. A point at radius r is (cos a * r, y, sin a * r).
// Spin gravity points outwards, so "down" on the plain is away from the axis and a larger r is lower ground.
//
// The profile, north to south (metres, from data/cities/rama.json):
//
//   the hub          on the axis at the north pole; the airlock shaft runs through the hull to it
//   Northern Bowl    an ellipse from the hub (r 0, y +24500) down to the plain (r 8000, y +20000): 8 km of
//                    stairway, and it is steep only at the bottom, where the spin is strongest
//   Northern Plain   r 8000 from +20000 to +5000, its three Straight Valleys (the suns) cut 60 m into it
//   northern cliff   50 m down to the Sea
//   Cylindrical Sea  r 8050 at the surface, 10 km wide, round the waist; New York an island in the middle
//   southern cliff   500 m up from the Sea: Rama accelerates toward its north pole, the water piles up against
//                    the south shore, and the high cliff is what keeps it off the Southern Plain
//   Southern Plain   r 7550 from -5000 to -20000, its own three valleys turned sixty degrees from the north's
//   Southern Bowl    an ellipse to the south pole, where the Big Horn stands on the axis among six Little Horns
//
// The novel gives 50 km by 20 km outside and a plain 16 km across inside; so the hull here is 2 km thick.
export function ramaShape(K){
  const S={};
  S.seed=K.seed||2131;
  S.RO=K.outerR||10000;                 // outside radius
  S.L2=(K.length||50000)/2;             // half the length
  S.RI=K.plainR||8000;                  // the Northern Plain
  S.RS=K.southPlainR||7550;             // the Southern Plain
  S.SEA=K.seaSurfaceR||8050;            // the Sea's surface
  S.BED=K.seaBedR||8350;                // its bed
  S.SH=K.seaHalf||5000;                 // the shores at +-SH
  S.PE=K.plainEnd||20000;               // where the plains meet the bowls
  S.BD=K.bowlDepth||4500;
  S.HUBY=S.PE+S.BD;                     // the bowls' apexes, at +-HUBY on the axis
  S.HUBR=150;                           // the airlock shaft
  S.HUBO=260;                           // the hub's drum, outside
  S.PERIOD=K.period||240;
  S.OMEGA=Math.PI*2/S.PERIOD;
  S.VW=K.valleyWidth||300;S.VD=K.valleyDepth||60;
  const T=Math.PI*2/3;
  S.VAL_N=[0,T,2*T];                    // the Northern Plain's three suns
  S.VAL_S=[T/2,T*1.5,T*2.5];            // the Southern Plain's, turned sixty degrees
  S.STAIRS=[{name:'Alpha',a:T/2},{name:'Beta',a:T*1.5},{name:'Gamma',a:T*2.5}];
  S.NYA=0;                              // New York's bearing
  S.NYARC=K.nyHalfArc||5000;            // half its length round the Sea
  S.NYW=K.nyHalfWidth||1500;            // half its width along the axis
  S.BIG=K.bigHorn||8000;S.LITTLE=K.littleHorn||3000;S.LHR=3200;   // the horns: lengths, and the ring of six
  S.TERR=[1000,2600,4400,6200];         // the Northern Bowl's terraces (radius), where the stairways level off

  S.angDist=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
  S.bowlN=y=>S.RI*Math.sqrt(Math.max(0,1-((y-S.PE)/S.BD)**2));
  S.bowlS=y=>S.RS*Math.sqrt(Math.max(0,1-((-S.PE-y)/S.BD)**2));
  S.yN=r=>S.PE+S.BD*Math.sqrt(Math.max(0,1-(r/S.RI)**2));
  S.yS=r=>-S.PE-S.BD*Math.sqrt(Math.max(0,1-(r/S.RS)**2));
  // which valley a bearing is in (its centre), or null
  S.valleyAt=(a,y)=>{const north=y>0,list=north?S.VAL_N:S.VAL_S,R=north?S.RI:S.RS;
    const inY=north?(y>S.SH+150&&y<S.PE-100):(y<-S.SH-150&&y>-S.PE+100);if(!inY)return null;
    for(const c of list)if(S.angDist(a,c)*R<S.VW/2+0.5)return c;return null;};
  // New York: a stadium, 10 km round the Sea and 3 km across it. du is metres round the Sea from its middle.
  S.nyDu=a=>Math.atan2(Math.sin(a-S.NYA),Math.cos(a-S.NYA))*S.SEA;
  S.inNY=(a,y)=>{const du=Math.abs(S.nyDu(a)),core=S.NYARC-S.NYW;
    if(du<=core)return Math.abs(y)<=S.NYW;return (du-core)**2+y*y<=S.NYW*S.NYW;};
  // the ground's radius under (y, a): the floor you stand on, wherever you are inside
  S.ground=(y,a)=>{
    if(y>=S.PE)return Math.max(S.HUBR+30,S.bowlN(Math.min(y,S.HUBY)));
    if(y>S.SH)return S.RI+(S.valleyAt(a,y)!==null?S.VD:0);
    if(y>=-S.SH)return S.inNY(a,y)?S.SEA-25:S.SEA;
    if(y>=-S.PE)return S.RS+(S.valleyAt(a,y)!==null?S.VD:0);
    return Math.max(60,S.bowlS(Math.max(y,-S.HUBY)));};
  S.gAt=r=>S.OMEGA*S.OMEGA*r/9.81;     // spin gravity at radius r, in g
  // The Big Horn, base to tip, as [r, y]: collars where the flying buttresses meet it
  S.BIG_PROFILE=[[1100,-S.HUBY],[1060,-S.HUBY+400],[1180,-S.HUBY+800],[900,-S.HUBY+1000],[780,-S.HUBY+2400],
    [860,-S.HUBY+2700],[620,-S.HUBY+2950],[500,-S.HUBY+4400],[560,-S.HUBY+4600],[360,-S.HUBY+4850],
    [240,-S.HUBY+6200],[110,-S.HUBY+7400],[0,-S.HUBY+S.BIG]];
  S.LITTLE_PROFILE=[[340,0],[310,260],[360,460],[230,700],[170,1700],[190,1850],[110,2000],[60,2700],[0,S.LITTLE]];
  S.littleBase=a=>({x:Math.cos(a)*S.LHR,y:S.yS(S.LHR)-40,z:Math.sin(a)*S.LHR});
  S.LITTLE_A=[0,1,2,3,4,5].map(i=>i*Math.PI/3+Math.PI/6);
  return S;
}
