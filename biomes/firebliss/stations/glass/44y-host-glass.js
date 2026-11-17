// ================================================================= HOST — the dome: STATION 8, SOUTH GLASS (PLAN.md section 11.2; 2026-11-16)
// [G data] The shape of the pancake dome dome_fb_south (5.1 px 175,1335) as plain maths of (x, z): no THREE, no DOM, its noise from core/rand
// (KRAND.fbm round the circle, baked once into tables by the angle), so a port draws the same dome. The numbers are scale model 5.1 edit 2's record
// (tools/scale-model/edit_512.py on origin/claude/firebliss-patera-domes, d6c00c3e0: 14 km across, its top 5,053 m, flat to 72% of its radius on the
// model's 2 km cells). Edit 2 is not on this branch's model, so the page raises the dome on today's ground (KNOWN_ISSUES.md: once the model carries
// it, this reads the model's ground without the dome's cells, or drops its own rise). What 2 km cells cannot hold is the kit's (PLAN.md 1c, 11.2):
//   THE TOP      flat at 5,053 m, swelling 18 m to the middle; concentric pressure ridges (ogives, 3-7 m, ~70 m apart) in its outer 1.4 km
//   THE CREST    6,350 m from the middle in lobes (the flow lobes) and flutes (~40 m apart); the lip rounded over ~10 m
//   THE WALL     the glass carapace and the flow-banded core, ~65 degrees, 150-570 m high by the lobe (84s paints it: KSTRATA obsidian-pancake)
//   THE APRON    autobreccia and perlite talus at 36 degrees down to the moat (the rest of the drop: ~800 m from the top to the moat here)
//   THE WAY UP   one lobe slumped (bearing 110 degrees from the middle): its wall gone to a talus ramp at ~29 degrees, the knappers' path
//   THE CRACKS   radial cracks through the apron into the moat, 14 m wide and 4 m deep, steaming at their feet (44z: the thermal layout)
//   THE BENCH    a dry pumice bench on the moat, 2.5 m high: the knapping camp's (44z)
// Bearings are from north, clockwise, measured at the dome's middle; the page's frame is x east, z south. Needs KRAND; MODEL (45) at call time only.
const GLASS=(function(){const M=FB_MODEL,C=[(175-M.px)*M.cell,(1335-M.py)*M.cell];
 const TOP=5053,RC=6350,G1=2.2,G2=.72,HC=360,LIP=10,K=6,TAU=Math.PI*2,N=16384;
 const sm=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
 const rad=b=>b*Math.PI/180;
 /* a bearing to the angle atan2(z, x) of the page's frame, and back */
 const angOf=b=>Math.atan2(-Math.cos(rad(b)),Math.sin(rad(b))),bearOf=a=>(Math.atan2(Math.cos(a),-Math.sin(a))*180/Math.PI+360)%360;
 /* the tables: noise round the circle (periodic, no seam), k its frequency in turns' radius, so the lobes, flutes and ridges are one draw each */
 const tab=(k,o,s)=>{const t=new Float32Array(N);for(let i=0;i<N;i++){const a=i/N*TAU;t[i]=2*KRAND.fbm(Math.cos(a)*k,.5,Math.sin(a)*k,o,s)-1;}return t;};
 const LOBE=tab(1.7,3,8101),FLUTE=tab(160,2,8102),HCT=tab(3,2,8103),OGV=tab(5,2,8104);
 const look=(t,a)=>{let u=a/TAU*N;u=((u%N)+N)%N;const i=Math.floor(u),f=u-i;return t[i]+(t[(i+1)%N]-t[i])*f;};
 const SLUMP=110,SL_A=angOf(SLUMP);
 /* the dome at a point, before the ground: its radius r and angle a, the crest's radius rc there, d = r - rc (in: < 0), the wall's height hc, its
    width wc, the apron's gradient g2, and how far the point is into the slumped lobe */
 function shape(x,z){const dx=x-C[0],dz=z-C[1],r=Math.hypot(dx,dz),a=Math.atan2(dz,dx);
  let da=a-SL_A;da-=TAU*Math.round(da/TAU);const sl=sm(.15,.05,Math.abs(da));
  const rc=RC+620*look(LOBE,a)+34*look(FLUTE,a)*(1-sl),hc=Math.max(0,HC*(1+.75*look(HCT,a))*(1-sl)),g2=G2+(.55-G2)*sl;
  return{r,a,d:r-rc,rc,hc,wc:hc/G1,g2,slump:sl};}
 /* the pressure ridges: their phase across the top (0..1, the crests at .5) */
 const ogive=s=>{const u=-s.d/70+.9*look(OGV,s.a);return u-Math.floor(u);};
 const smin=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k/4;};
 /* the dome's surface, absolute: the top with its swell and ridges; past the crest the wall (G1, rounded at the lip) and the apron (g2) */
 function surf(s){const d=s.d;
  if(d<=0){const t=ogive(s),A=6*sm(1400,300,-d)*sm(0,50,-d);return TOP+18*Math.max(0,1-(s.r/s.rc)*(s.r/s.rc))+A*(4*t*(1-t)-.55);}
  return TOP-smin(G1*(Math.sqrt(d*d+LIP*LIP)-LIP),s.hc+s.g2*(d-s.wc),12);}
 /* the pumice bench (the knapping camp's): an ellipse along the foot, 2.5 m high, its edges eased over a fifth of it */
 const BENCH={x:350,z:1350,u:[Math.sin(rad(32)),-Math.cos(rad(32))],a:120,b:65,h:2.5};
 function benchW(x,z){const dx=x-BENCH.x,dz=z-BENCH.z,p=(dx*BENCH.u[0]+dz*BENCH.u[1])/BENCH.a,q=(dx*BENCH.u[1]-dz*BENCH.u[0])/BENCH.b;return sm(1,.8,Math.hypot(p,q));}
 /* where the dome meets the ground along a bearing (the first point past the crest where its surface is under the model's ground) */
 function foot(b){const a=angOf(b),ca=Math.cos(a),sa=Math.sin(a);let r=RC-1000;
  for(;r<RC+3200;r+=8){const x=C[0]+ca*r,z=C[1]+sa*r,s=shape(x,z);if(s.d>0&&surf(s)<=MODEL.h(x,z)+.5)return{x,z,r,b,rc:s.rc,hc:s.hc};}
  return{x:C[0]+ca*r,z:C[1]+sa*r,r,b,rc:RC,hc:0};}
 /* a point on the crest along a bearing, `inset` metres in from the lip */
 function crest(b,inset){const a=angOf(b),ca=Math.cos(a),sa=Math.sin(a),s=shape(C[0]+ca*RC,C[1]+sa*RC),r=s.rc-(inset||0);return{x:C[0]+ca*r,z:C[1]+sa*r,r,b,hc:s.hc};}
 /* the radial cracks: from the wall's foot (the apron's top) to 120 m past the dome's foot; found on their first use (MODEL is the stage's, 45) */
 const CRACK_B=[118,132,141,149];let CR=null;
 const cracks=()=>CR||(CR=CRACK_B.map(b=>{const f=foot(b),a=angOf(b);return{b,a,r0:f.rc+f.hc/G1+40,r1:f.r+120,foot:f};}));
 function crackAt(s){if(s.d<0)return 0;let g=0;for(const c of cracks()){let da=s.a-c.a;da-=TAU*Math.round(da/TAU);if(Math.abs(da)>.004)continue;
  const w=s.r*da/7;if(Math.abs(w)>=1)continue;const q=1-w*w;g=Math.max(g,4*q*q*sm(c.r0,c.r0+60,s.r)*sm(c.r1,c.r1-90,s.r));}return g;}
 /* what the dome adds to the model's ground at a point: its surface over the ground (eased at the foot over K m), the bench, less the cracks */
 function bench(x,z){const s=shape(x,z),v=surf(s)-MODEL.h(x,z),b=v>=K?v:v<=-K?0:(v+K)*(v+K)/(4*K);return b+BENCH.h*benchW(x,z)-crackAt(s);}
 /* the dome's rise over the model's ground at a point (the fields read it: the apron is where the dome stands on the moat) */
 const raise=(x,z,s)=>surf(s||shape(x,z))-MODEL.h(x,z);
 return{C,TOP,RC,G1,SLUMP,BENCH,shape,surf,ogive,bench,benchW,foot,crest,cracks,raise,angOf,bearOf,sm};})();
