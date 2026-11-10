// ================================================================= 90. THE KIT SHEET: the scene, the rows, the build
// The sheet of a kit on the Vernacular's contract (VERN.def / VERN.place over the Ancients core): kits/iziz-vernacular,
// kits/highlands and kits/xanadu read this file in place (kits/iziz-vernacular/sheet.py; README.md, "Its own sheet"). It
// replaced the sheets' run on a settlement's page shell (Iziz's, Highlands' and Xanadu's 90-scene.js, 91-probe.js,
// 92-camera.js, 93-labels.js and 99-start.js, 2026-11-09): the camera, the frame, the probe, the inspector and the marks are
// core/host's (99-vsheet-start.js hands them over), the sky the placeholder sky (core/atmos/placeholder: KratorSky), the doors
// core/door's (95-vsheet-doors.js), the records core/tags' (the kit's targets/sheet/91t-*-tags.js). What stays here is what a
// sheet is: the rows laid out, every site built once, the kit baked.
//
// The kit's targets/sheet/89z-rows.js gives
//   SHEET = {title, build,                     the page's title and its host key (KHOST.take build)
//            rows: [{family, branch?, keys: [key | {key, o, label}], gapAfter?}],   one row each, fronts (+z) toward the camera
//            branches?: {branch: 'Name'},       an overview per branch (Highlands' Republican, Rustic, Tribal)
//            spreadAll?: true,                  widen every gap for the row camera behind it (else only before a tall row)
//            ground: 'MAT key', groundRepeat,   the ground plane's material and its map's repeat over 3200 m
//            hour?, haze?, exposure?,           the placeholder sky's hour (?hour= on the URL wins), fog density, exposure
//            budget: {showcase: {tris, calls}}, panes: ['kit item', ...]}   the probe's budget; the glass items the doors count
// ?only=key,key builds just those defs. A def that throws is reported (#errs and window._sheetFails) and the rest still build.
const SHEET_Q=new URLSearchParams(location.search);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=SHEET.exposure==null?1:SHEET.exposure;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xc8c0b0,SHEET.haze==null?.0005:SHEET.haze);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.3,6000);
// the frame hooks a kit pushes onto (69e5's leaves, 94-hl-anim.js's clocks and orreries, 87c's beacon): f(dt, nowMs), every frame
const FRAME_HOOKS=[];
// ---------------------------------------------------------------- light: the placeholder sky's sun (a kit's pieces are lit by their site's sky in the world)
const hemi=new THREE.HemisphereLight(0xe8ecff,0x5a4a36,.7);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0dc,1.6);scene.add(sun);scene.add(sun.target);
const fill=new THREE.DirectionalLight(0xb8c8ff,.3);fill.position.set(500,300,-600);scene.add(fill);
const SHEET_SKY={hour:SHEET_Q.get('hour')!=null?+SHEET_Q.get('hour'):(SHEET.hour==null?10.5:SHEET.hour),day:200,dens:1.6};
const SHEET_SKYG=KratorSky.attach(scene,4800);SHEET_SKYG.traverse(o=>{o.userData.probeSkip=true;o.raycast=()=>{};});
const SHEET_SUN0=new THREE.Vector3(-.5,.7,.45).normalize();
function sheetSky(){KratorSky.update(camera.position,SHEET_SKY.hour,SHEET_SKY.day,SHEET_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir.y>.05?L.sunDir:SHEET_SUN0).multiplyScalar(900);sun.color.copy(L.sunColor);sun.intensity=Math.max(.35,L.sunIntensity*.95);
 hemi.intensity=.3+L.ambient*.7;scene.fog.color.copy(L.fog);}
sheetSky();
// ---------------------------------------------------------------- the rows: by family, fronts (+z) toward the camera
// A row's camera stands sheetRowCam() in front of it (+z); before a tall row (or every row with SHEET.spreadAll) the gap is
// widened, as the settlements' sheets did. An eye-level camera stands
// sheetEyeCam() in front of its plot. (The layout the Highlands and Xanadu sheets had in their settlements' 90-scene.js.)
const SITES=[],SHEET_ROWS=[];
const SHEET_ONLY=SHEET_Q.get('only')?new Set(SHEET_Q.get('only').split(',')):null;
const sheetSite=k=>typeof k==='string'?{key:k,o:{v:0}}:{key:k.key,o:Object.assign({v:0},k.o||{}),label:k.label};
const sheetRowCam=w=>Math.max(40,Math.min(w*.55,260));
const sheetEyeCam=D=>Math.max(10,Math.max(D.w,D.h||0)*.9+D.d*.5);
(function sheetLayout(){let z=0,prev=null;const GAP=SHEET.gap==null?9:SHEET.gap;
 for(const F of SHEET.rows){const ks=F.keys.map(sheetSite).filter(s=>VERN.defs[s.key]&&(!SHEET_ONLY||SHEET_ONLY.has(s.key)));if(!ks.length)continue;
  const D=s=>VERN.defs[s.key],ws=ks.map(s=>D(s).w+GAP),total=ws.reduce((a,c)=>a+c,0);
  const dmax=Math.max(...ks.map(s=>D(s).d||D(s).w)),hmax=Math.max(...ks.map(s=>D(s).h||0));
  if(prev&&(SHEET.spreadAll||hmax>22))z+=Math.max(0,Math.max(sheetRowCam(prev.w),prev.h*1.7)+(SHEET.spreadAll?10:8)-22);
  z+=dmax/2;let x=-total/2;
  ks.forEach((s,i)=>{SITES.push({key:s.key,x:x+ws[i]/2,z,ry:0,o:s.o,label:s.label});x+=ws[i];});
  prev={branch:F.branch||null,family:F.family,z,d:dmax,w:total,h:hmax,keys:ks.map(s=>s.key)};SHEET_ROWS.push(prev);
  const eyeNeed=Math.max(...ks.map(s=>sheetEyeCam(D(s))))-dmax/2+6;
  z+=dmax/2+Math.max(22,eyeNeed)+(F.gapAfter||0);}
 // the rows run north (-z) from the first, as core/engine's sheets do: the opening camera, in front of the first row, has
 // open ground behind it, and a row's camera stands in the gap toward the row before it
 for(const S of SITES)S.z=-S.z;for(const r of SHEET_ROWS)r.z=-r.z;})();
// ---------------------------------------------------------------- the views: an opening, an overview (and one per branch), one per row, one per site
const VIEWS={};
(function sheetViews(){const R=SHEET_ROWS;if(!R.length){VIEWS.Origin=[0,30,60,0,0,0];return;}const mid=R[R.length>>1],B=SHEET.branches||{};
 const put=(k,v)=>{let n=k,i=2;while(VIEWS[n])n=k+' ('+(i++)+')';VIEWS[n]=v;};
 put('Opening',[R[0].w*.25,Math.max(24,R[0].d*.9),R[0].z+R[0].d*.5+44,0,5,R[0].z]);
 put('Overview',[-900,520,mid.z+80,0,10,mid.z]);
 {const w=Math.min(R[0].w,220);put('Front rows',[-w*.35,Math.max(40,w*.3),R[0].z+R[0].d/2+Math.max(70,w*.6),0,0,R[0].z-60]);}   // the sheet's picture: the first rows from in front and above
 for(const b in B){const rs=R.filter(r=>r.branch===b);if(!rs.length)continue;const zc=(rs[0].z+rs[rs.length-1].z)/2,span=Math.abs(rs[rs.length-1].z-rs[0].z)+80;
  put(B[b]+' — overview',[-span*.7,span*.55,zc+span*.35,0,5,zc]);}
 for(const r of R){const dist=Math.max(sheetRowCam(r.w),(r.h||0)*1.7);
  put((B[r.branch]?B[r.branch]+' — ':'')+r.family,[0,Math.max(18,dist*.45),r.z+r.d/2+dist,0,Math.min(4+(r.h||0)*.35,20),r.z]);}
 for(const S of SITES){const D=VERN.defs[S.key],nm=(S.label||D.name)+(S.o.v&&!S.label?' v'+S.o.v:''),E=D.eye;
  for(const X of(D.eyes||[]))put(nm+' — '+X[0],[S.x+X[1],1.7+(X[5]||0),S.z+X[2],S.x+X[3],Math.min(D.h==null?6:D.h,14)*.3,S.z+X[4]]);   // a def's own extra stances
  put(nm+' — eye level',E?[S.x+E[0],1.7+(E[4]||0),S.z+E[1],S.x+E[2],Math.min(D.h==null?6:D.h,14)*.3,S.z+E[3]]
                          :[S.x+D.w*.18,1.7,S.z+sheetEyeCam(D),S.x,Math.min(D.h==null?6:D.h,14)*.4,S.z]);}})();
// ---------------------------------------------------------------- the ground: the kit's own ground material, a flat placeholder for its site
const SHEET_ZC=SHEET_ROWS.length?SHEET_ROWS[SHEET_ROWS.length-1].z/2:0;   // the ground's centre: halfway down the rows
if(TEX[SHEET.ground]&&SHEET.groundRepeat)TEX[SHEET.ground].repeat.set(SHEET.groundRepeat,SHEET.groundRepeat);
const groundM=new THREE.Mesh(new THREE.PlaneGeometry(3200,Math.max(3200,Math.abs(SHEET_ZC)*2+1000)),MAT[SHEET.ground]||MAT.dirt);
groundM.rotation.x=-Math.PI/2;groundM.position.set(0,-.05,SHEET_ZC);groundM.userData.probeSkip=true;groundM.userData.isGround=true;scene.add(groundM);
// ---------------------------------------------------------------- build every site once, then bake the kit items
const SITE_GROUPS=[];window._sheetFails=[];
for(const S of SITES){const k=S.key+'/'+((S.o&&S.o.v)||0);TSTAT.cur=k;const r0=REG.length;
 try{const G=VERN.place(scene,S.key,S.x,S.z,S.ry||0,S.o);if(G)SITE_GROUPS.push({S,G});}
 catch(e){window._sheetFails.push(k+': '+String(e&&e.message||e));reportErr(k+': '+((e&&e.stack)||e));}
 for(let i=r0;i<REG.length;i++)REG[i].type=S.key;TSTAT.cur=null;}
window._registered=REG.length;window._sites=SITES.length;
kbake(scene);
