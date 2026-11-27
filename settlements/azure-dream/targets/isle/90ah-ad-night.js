// ================================================================= GRĒṬ-ĀIL — the Hall's night on core/sched
// PLAN.md section 5, "A night in the hall" and "Light at night". The night is a set of timetables over the day's 24 hours
// (core/sched's KSCHED.timeline, period 24, the sky's hour as its clock: AD_SKY.hour, ?hour=21), evaluated by AD_NIGHTLY.at(h)
// as plain data, and applied to the page each frame (only where a state changes):
//   the Lulling   19.0-19.5: the gallery's wheels braked one by one, the great wheel last (brake 0 -> 1): they turn by day and
//                 stop as the brake rises (AD_WHEELS, below)
//   the door      shut 19.5 (after the Lulling) to 6.0 (dawn): the Hall's two drawn doors through core/door (KDOOR.close,
//                 open), so a walker cannot get in at night (core/walk's blocks follow the leaves)
//   the lamps     the azure lamps and the clerestory's blue window from the Lulling to dawn (19.0-6.0); the censers' embers
//                 from the Lulling to the first watch's end (19.0-22.5)
//   the watches   the first 19.5-22.5, the second 22.5-1.5, the third 1.5-6.0: a keeper walks the Keepers' Walk with a hooded
//                 lamp (a timetable in seconds down the walk and back, its lamp in the light pool, 90af)
//   the Station   the broken station's passes over the isle tonight, from core/atmos's sky model (ATMOS.skyState at the page's
//                 site, every 2 minutes from 19.5 h to 6.0 h: core/atmos/sky/89-atmos-e-skymodel.js). A Station's night is one
//                 whose best lit pass peaks at AD_STATION_PEAK or higher (66.3 degrees: the isle is at 59.5 S, so the Station,
//                 on a 52-degree orbit, never stands overhead; about 21 nights a year reach this, PLAN.md section 5); on it the
//                 clerestory's shutters open while that pass stands over 40 degrees, and its light comes down on the sleepers.
//                 The night is the sky model's dayCount (0 the game's start): ?day=N, or ?station=1 for the next Station's night
// [G data] the timetables and AD_NIGHTLY.at; [web] the frame hook that applies them.
reseed(34171);
const AD_STATION_PEAK=66.3;   /* a Station's night: its best lit pass this high or higher (degrees); about 21 nights a year here */
const AD_NIGHTLY=(function(){const K=KSCHED,T=s=>K.timeline({period:24,segments:s});
 const tt={
  brake:T([{dur:5.5,from:1,name:'the night'},{dur:.5,from:1,to:0,name:'dawn: the wheels freed'},{dur:13,from:0,name:'the day'},
           {dur:.5,from:0,to:1,name:'the Lulling: the wheels braked one by one, the great wheel last'},{dur:4.5,from:1,name:'the night'}]),
  door:T([{dur:6,from:1,name:'shut until dawn'},{dur:13.5,from:0,name:'open'},{dur:4.5,from:1,name:'shut after the Lulling'}]),
  azure:T([{dur:6,from:1},{dur:13,from:0},{dur:5,from:1}]),
  censer:T([{dur:19,from:0},{dur:3.5,from:1,name:'the censers lit'},{dur:1.5,from:0}]),
  watch:T([{dur:1.5,from:2,name:'the second watch'},{dur:4.5,from:3,name:'the third watch'},{dur:13.5,from:0,name:'the day'},
           {dur:3,from:1,name:'the first watch'},{dur:1.5,from:2,name:'the second watch'}]),
};
 /* the keeper down the Keepers' Walk and back, in seconds: the walk's local z (the azure lamps run -22.5 .. 22.5) */
 const keeper=K.timeline({period:180,segments:[{dur:80,from:-22.5,to:22.5,ease:'linear',name:'down the walk'},{dur:10,from:22.5,name:'at the Porlock Screen'},
  {dur:80,from:22.5,to:-22.5,ease:'linear',name:'up the walk'},{dur:10,from:-22.5,name:'at the shrine'}]});
 /* the Station's passes by night (core/atmos's sky model): night(d) the lit passes from 19.5 h on day d to 6.0 h on d + 1, each
    {h0, h1, at, peak, lit, alt: [[h, degrees], ...]}; festival(d) the best of them when it reaches AD_STATION_PEAK */
 const SKY=typeof ATMOS!=='undefined'&&ATMOS.skyState&&ATMOS.siteAt?ATMOS:null,site=SKY?SKY.siteAt(AD_SITE.PX[0],AD_SITE.PX[1]):null,nights={};
 function night(d){if(nights[d])return nights[d];const out=[];let cur=null;if(!SKY)return nights[d]=out;
  for(let h=19.5;h<=30.001;h+=1/30){const st=SKY.skyState(site,h%24,d+Math.floor(h/24)).station,alt=Math.asin(st.dir[1])*180/Math.PI;
   if(alt>10){if(!cur)cur={h0:h,h1:h,at:h,peak:alt,lit:st.lit,alt:[]};cur.alt.push([h,alt]);cur.h1=h;if(alt>cur.peak){cur.peak=alt;cur.at=h;cur.lit=st.lit;}}
   else if(cur){out.push(cur);cur=null;}}
  if(cur)out.push(cur);return nights[d]=out.filter(p=>p.lit>.5);}
 function festival(d){const P=night(d);let b=null;for(const p of P)if(!b||p.peak>b.peak)b=p;return b&&b.peak>=AD_STATION_PEAK?b:null;}
 const q=typeof location!=='undefined'?location.search:'',qd=/[?&]day=(\d+)/.exec(q);let day=qd?+qd[1]:0;
 if(/[?&]station=1/.test(q))for(let d=day;d<day+366;d++)if(festival(d)){day=d;break;}
 /* hour h of the night that began on day d (an hour before noon belongs to the night before): the shutters' opening, 0..1 */
 function shutters(h,d){const n=h<12?d-1:d,F=festival(n);if(!F)return 0;const hh=h<12?h+24:h;if(hh<F.h0||hh>F.h1)return 0;
  let a=0;for(const s of F.alt)if(Math.abs(s[0]-hh)<=1/60)a=Math.max(a,s[1]);return a>=40?1:0;}
 function at(h,d){h=((h%24)+24)%24;d=d==null?S.day:d;const v=k=>tt[k].at(h);const b=v('brake'),w=v('watch'),F=festival(h<12?d-1:d);
  return{hour:h,day:d,brake:b.value,phase:b.name,doorShut:v('door').value>.5,azure:v('azure').value>.5,censers:v('censer').value>.5,
   watch:Math.round(w.value),watchName:w.name,stationNight:!!F,stationPass:F?{at:+(F.at%24).toFixed(2),peak:+F.peak.toFixed(1)}:null,shutters:shutters(h,d)};}
 const S={at,night,festival,day,sky:!!SKY,keeper,state:null,applied:{},lamp:null,stationLamps:[]};
 /* the keeper's lamp and the Station's light join the lamp pool (AD_LAMPS, 90ae) as entries the hook moves and switches */
 const HP=AD_PLACE.find(p=>p.id==='hall-of-dreaming'),A=AD_HALL;
 if(HP){S.lamp=[HP.x,HP.o.y+A.P+1.0,HP.z,'keeper','keeper'];AD_LAMPS.push(S.lamp);
  for(const z of[-18,-6,6,18])for(const x of[-9,9]){const w=loc(HP.x,HP.z,x,z,HP.ry),L=[w[0],HP.o.y+A.P+7.5,w[1],'station','station'];AD_LAMPS.push(L);S.stationLamps.push(L);}}
 S.tick=function(t){const st=S.state=at(AD_SKY.hour),L=window._adWalk&&window._adWalk.leaves||[];
  if(S.applied.doorShut!==st.doorShut&&typeof KDOOR!=='undefined'){for(const D of L){if(st.doorShut)KDOOR.close(D);else KDOOR.open(D,{by:'npc'});}S.applied.doorShut=st.doorShut;}
  if(S.lamp&&HP){const z=st.watch?keeper.at(t||0).value:0,w=loc(HP.x,HP.z,.6,z,HP.ry);S.lamp[0]=w[0];S.lamp[2]=w[1];}
  return st;};
 return S;})();
// which lamps burn: 90af asks per kind (the night's own lamps by the timetables; the rest by the sky's night, as before)
function AD_LAMPON(kind,night){const st=AD_NIGHTLY.state||AD_NIGHTLY.at(AD_SKY.hour);
 if(kind==='azure'||kind==='pane')return st.azure;if(kind==='censer')return st.censers;if(kind==='keeper')return st.watch>0;
 if(kind==='station')return st.shutters>.5;return night||kind==='gold';}
{let t0=performance.now();AD_NIGHTLY.tick(0);FRAME_HOOKS.push(()=>AD_NIGHTLY.tick((performance.now()-t0)/1000));}
window._adNightly=AD_NIGHTLY;
// ---------------------------------------------------------------- the wheels
// The kora's 96 wheels and the great wheel (AD_HALL.wheels, .great: 89qa keeps them out of the bake) as one instanced mesh of the
// kit's prayer-wheel item (qSongDrum: its geometry and material), each turned about its own axis while the pilgrims turn them
// by day. At the Lulling they are braked one by one as the brake rises (wheel i stops once the brake passes (i+1)/(n+1)), the
// great wheel last; at dawn they are freed. [web]: the matrices; the brake is AD_NIGHTLY's.
const AD_WHEELS=(function(){const HP=AD_PLACE.find(p=>p.id==='hall-of-dreaming'),A=AD_HALL,D=typeof KIT!=='undefined'&&KIT.defs.qSongDrum;
 const S={n:0,turning:0,mesh:null};if(!HP||!D||!A.wheels.length)return S;
 const all=A.wheels.concat(A.great?[A.great]:[]),n=all.length,mat=D.mat.clone();if(D.mat.onBeforeCompile)mat.onBeforeCompile=D.mat.onBeforeCompile;
 const im=new THREE.InstancedMesh(D.geo,mat,n);im.name='the Hall\'s prayer wheels';im.frustumCulled=false;scene.add(im);
 const m=new THREE.Matrix4(),q=new THREE.Quaternion(),pos=new THREE.Vector3(),sc=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
 const W=all.map((w,i)=>{const c=loc(HP.x,HP.z,w[0],w[2],HP.ry);return{p:[c[0],HP.o.y+w[1],c[1]],r:w[3],h:w[4],a:(i*2.39996)%6.2832,w:i<A.wheels.length?.9:.35,great:i>=A.wheels.length};});
 /* which turn at the brake b: the gallery's wheel i while b < (i+1)/(n+1); the great wheel while b < 1 */
 S.turningAt=b=>W.filter((w,i)=>w.great?b<1:b<(i+1)/(W.length)).length;
 const pose=()=>{W.forEach((w,i)=>{pos.set(w.p[0],w.p[1],w.p[2]);q.setFromAxisAngle(UP,w.a);m.compose(pos,q,sc.set(w.r,w.h,w.r));im.setMatrixAt(i,m);});im.instanceMatrix.needsUpdate=true;};
 pose();let last=performance.now();
 FRAME_HOOKS.push(()=>{const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;const b=(AD_NIGHTLY.state||AD_NIGHTLY.at(AD_SKY.hour)).brake;let k=0;
  W.forEach((w,i)=>{if(w.great?b<1:b<(i+1)/W.length){w.a+=w.w*dt;k++;}});S.turning=k;if(k)pose();});
 S.n=n;S.mesh=im;S.wheels=W;return S;})();
window._adWheels=AD_WHEELS;
