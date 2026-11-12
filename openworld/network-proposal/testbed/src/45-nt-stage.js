// ================================================================= HOST — the network test bed: the ground, the road classes, the network  [web]
/* The road classes of the Ancient network (openworld/ANCIENT-NETWORK.md section 8) on uneven ground, crossing each other, drawn with the
   Ancient Transit kit read in place. The Ancient way is a 30 m concrete way at 4 %: it cuts the ridge, crosses the valley on a viaduct and
   the marsh on a trestle (KTRANSIT.highway, held mostly intact), and comes up to both decks on embankments (its alignment pinned to the
   deck ends), with its guideway on low piers over the median. The modern classes are graded roads of their own width, grade and surface. */
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=a.map(String).join(' ');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+((m.match(/ERROR:[^\n]*/g)||[m.slice(0,200)]).slice(0,4).join(' | ')));}catch(e){}_ce.apply(console,a);};}
const TICKS=[];function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xbcc6cc,.00010);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,14000);
const hemi=new THREE.HemisphereLight(0xc4d4e0,0x56524a,.7);scene.add(hemi);
const SUN_POS=[-900,1000,700];
const sun=new THREE.DirectionalLight(0xfff0d8,1.5);sun.position.set(...SUN_POS);scene.add(sun);
const TR_SEED=5113;
/* THE GROUND: a ridge (x -700, 45 m), a north-south valley (x 350, 38 m deep), a marsh (1150, 0) under water at -4 m, a hill (-1100, -900,
   30 m) and a knoll (-300, -800, 22 m) on a gentle relief */
const NT_bump=(x,z,cx,cz,r,h)=>{const d=Math.hypot(x-cx,z-cz)/r;return d<1?h*(1-d*d)*(1-d*d):0;};
const NT_WATER=-4,NT_MARSH={x:1150,z:0,r:330};
const TR_RELIEF=(x,z)=>(KRAND.fbm(x/420+3,0,z/420+7,3,TR_SEED)-.5)*8+45*Math.exp(-Math.pow((x+700)/170,2))-38*Math.exp(-Math.pow((x-350)/120,2))
 -12*Math.max(0,1-Math.hypot(x-NT_MARSH.x,z-NT_MARSH.z)/NT_MARSH.r)+NT_bump(x,z,-1100,-900,260,30)+NT_bump(x,z,-300,-800,200,22);
/* THE CLASSES (section 8): width, pavement, lines, ruling grade, surface family and tint */
const NT_CLASS={
 way:{width:30,pavement:0,lines:'both',maxGrade:0.04,surf:'concrete',tint:0xc4beb2,label:'Ancient way (30 m, 4 %)'},
 izani:{width:11,pavement:2,lines:'edges',maxGrade:0.08,surf:'pave',tint:0xd6b07a,label:'Izani highway (11 m paved, 8 %)'},
 vothic:{width:8,pavement:1.2,lines:'none',maxGrade:0.08,surf:'pave',tint:0xa89c92,label:'Vothic highway (8 m, 8 %)'},
 xanadu:{width:9,pavement:1,lines:'none',maxGrade:0.09,surf:'pave',tint:0xe4c494,label:'Xanadu road (9 m, 9 %)'},
 yuni:{width:7.5,pavement:0,lines:'edges',maxGrade:0.09,surf:'asphalt',tint:0x8a8680,label:'Yuni road (7.5 m asphalt, 9 %)'},
 trade:{width:7,pavement:0,lines:'none',maxGrade:0.10,surf:'rubble',tint:0xb09a7a,label:'Trade highway (7 m packed earth, 10 %)'},
 dirt:{width:5,pavement:0,lines:'none',maxGrade:0.12,surf:'rubble',tint:0x9a7c58,label:'Dirt road (5 m, 12 %)'},
 trail:{width:2.4,pavement:0,lines:'none',maxGrade:0.18,surf:'rubble',tint:0x7a8a50,label:'Beast Rider trail (2.4 m, 18 %)'}};
/* THE ANCIENT WAY'S STRUCTURES first, on the bare relief (their decks set the way's pins): the viaduct over the valley, the trestle over the marsh */
const NT_HELD={intact:0.85,cracked:0.15,collapsed:0,gone:0};
const NT_VIADUCT=KTRANSIT.highway([[200,0],[520,0]],{id:'viaduct',seed:31,ground:TR_RELIEF,width:30,lanes:4,clearance:9,span:32,radius:0,ruin:NT_HELD});
const NT_TRESTLE=KTRANSIT.highway([[850,0],[1450,0]],{id:'trestle',seed:32,ground:(x,z)=>Math.max(TR_RELIEF(x,z),NT_WATER),width:30,lanes:4,clearance:6,span:30,radius:0,ruin:NT_HELD});
/* THE NETWORK: the way in three stretches (pinned to the deck ends), and the modern roads crossing it and each other */
const NT_WAY=(id,pts,pins)=>({id:id,cls:'way',pts:pts,pins:pins});
const NT_DEFS=[
 NT_WAY('way-w',[[-1500,0],[200,0]],[{s:1700,y:NT_VIADUCT.deckAt(0)}]),
 NT_WAY('way-m',[[520,0],[850,0]],[{s:0,y:NT_VIADUCT.deckAt(NT_VIADUCT.L)},{s:330,y:NT_TRESTLE.deckAt(0)}]),
 NT_WAY('way-e',[[1450,0],[1800,0]],[{s:0,y:NT_TRESTLE.deckAt(NT_TRESTLE.L)}]),
 {id:'izani',cls:'izani',pts:[[-200,-1400],[-200,1400]]},
 {id:'vothic',cls:'vothic',pts:[[350,-1400],[350,1400]]},
 {id:'xanadu',cls:'xanadu',pts:[[-1400,-700],[-200,-700]]},
 {id:'yuni',cls:'yuni',pts:[[-200,700],[350,700]]},
 {id:'trade',cls:'trade',pts:[[-1450,400],[-200,400]]},
 {id:'dirt',cls:'dirt',pts:[[-1100,-1450],[-1100,0]]},
 {id:'trail',cls:'trail',pts:[[-1450,-450],[-800,-1150]]}].map(d=>{const c=NT_CLASS[d.cls];return Object.assign({width:c.width,pavement:c.pavement,lines:c.lines,maxGrade:c.maxGrade,radius:d.cls==='way'?0:30,surface:{fam:c.surf,col:c.tint}},d);});
/* THE ORDER OF LEVELLING (found by this bed: a junction takes the level of the first road through it, from that road's alignment before the
   regrade, so a weak road crossing two stricter ones close together was pinned to two heights it could not join: the dirt road at 44 %). The
   network is built from the strictest classes, then each weaker class JOINS it (KTRANSIT.join), so a new road meets the others' finished
   levels and regrades itself to them: the weaker class always gives way */
const NT_STRICT=5;
const NT_NET=KTRANSIT.network(NT_DEFS.slice(0,NT_STRICT),{ground:TR_RELIEF});
NT_DEFS.slice(NT_STRICT).filter(d=>d.cls!=='trail').forEach(d=>KTRANSIT.join(NT_NET,d));
const TR_ROADS=NT_NET.roads;
/* A TRAIL CROSSES AT GRADE, WITH NO JUNCTION (found by this bed: a trail joined as a junction held the dirt road flat across it on an 11 %
   slope, and the dirt road had to drop 16 % beyond). A trail takes the crossed road's level at the crossing and never flattens that road */
/* held at the crossed road's level from kerb to kerb (the kit's o.crosses: KTRANSIT.crossPins), not only on its centre line: pinned at the
   centre alone, the trail climbed 18 % across the road's own width, and between sparse pins it followed the hillside over the road's surface */
const NT_TRAIL=(()=>{const d=NT_DEFS.find(q=>q.cls==='trail');
 const T=KTRANSIT.road(d.pts,{id:d.id,ground:TR_RELIEF,width:d.width,pavement:0,lines:'none',kind:'lane',maxGrade:d.maxGrade,radius:0,crosses:TR_ROADS,surface:d.surface});T.crossPins=T.crossings;return T;})();
const NT_ROADS=TR_ROADS.concat([NT_TRAIL]);
/* the ground under the roads: the DEEPEST single cutting where two roads' cuttings overlap, not their sum (summed, the ground at a junction
   was carved twice), and RAISED under a road on fill, junctions included, falling away at 1 : 1.5 (found by this bed: the kit draws a road's
   embankment along its runs but not under a junction, so a junction on fill stood over a hole) */
const NT_cut=(x,z)=>{let c=0;for(let i=0;i<NT_ROADS.length;i++)c=Math.min(c,KTRANSIT.lineH(NT_ROADS[i],x,z));return c;};
const NT_FILL=(()=>{const C=24,H=new Map(),key=(i,j)=>i*100003+j;let reach=0;
 /* the hash says which roads are on fill near a cell; the envelope is then read from each such road AT THE POINT'S PROJECTION across it (found
    by this bed: an envelope of discs round road samples took the highest sample within the road's half width, which on the 30 m way at 4 %
    reaches 15 m upslope, and the ground stood up to 0.3 m through the surface in a sawtooth) */
 NT_ROADS.forEach((Rd,ri)=>{const half=Rd.width/2+(Rd.pavement==null?0:Rd.pavement)+0.5;for(let s=0;s<=Rd.L;s+=3){const p=Rd.path.at(s),up=Rd.yAt(s)-TR_RELIEF(p.x,p.z);if(up<0.3)continue;
  reach=Math.max(reach,half+up*1.5);const k=key(Math.floor(p.x/C),Math.floor(p.z/C));if(!H.has(k))H.set(k,[]);const L=H.get(k);if(L.indexOf(ri)<0)L.push(ri);}});
 const R=Math.ceil(reach/C);
 return (x,z)=>{let lo=-1e9;const seen=[],i0=Math.floor(x/C),j0=Math.floor(z/C);for(let i=i0-R;i<=i0+R;i++)for(let j=j0-R;j<=j0+R;j++){const L=H.get(key(i,j));if(!L)continue;
  for(let q=0;q<L.length;q++){const ri=L[q];if(seen.indexOf(ri)>=0)continue;seen.push(ri);const Rd=NT_ROADS[ri],half=Rd.width/2+(Rd.pavement==null?0:Rd.pavement)+0.5;
   if(!Rd.path.near(x,z,reach))continue;const pr=Rd.path.project(x,z),v=Rd.yAt(pr.s)-0.25-Math.max(0,pr.d-half)/1.5;if(v>lo)lo=v;}}return lo;};})();
const terrainH=(x,z)=>Math.max(TR_RELIEF(x,z)+NT_cut(x,z),NT_FILL(x,z));
const waterH=(x,z)=>Math.hypot(x-NT_MARSH.x,z-NT_MARSH.z)<NT_MARSH.r?NT_WATER:-1e6;
/* THE GUIDEWAY over the way's median, on low piers: its ground is the way's own surface, the viaduct's and the trestle's decks on theirs */
const NT_WAYSURF=(x,z)=>{if(x>=200&&x<=520)return NT_VIADUCT.deckAt(NT_VIADUCT.path.project(x,z).s);if(x>=850&&x<=1450)return NT_TRESTLE.deckAt(NT_TRESTLE.path.project(x,z).s);
 const k=x<200?0:x<850?1:2;return TR_ROADS[k].levelAt(x,z);};
const NT_GUIDE=KTRANSIT.rail([[-1500,0],[1800,0]],{id:'guideway',seed:33,ground:NT_WAYSURF,elevated:true,clearance:6.5,span:24,radius:0,maxGrade:0.04,ruin:NT_HELD});
/* where the ground mesh refines itself (47): along every road's cutting and fill, and round the structures' feet */
const TR_CARVED=[];
NT_ROADS.forEach(L=>{const half=L.width/2+(L.pavement==null?0:L.pavement)+1;for(let s=0;s<L.L;s+=14){const p=L.path.at(s),cx=Math.cos(p.yaw),sz=-Math.sin(p.yaw);let cut=0,fill=0;
 [-half,0,half].forEach(o=>{cut=Math.min(cut,KTRANSIT.lineH(L,p.x+cx*o,p.z+sz*o));});fill=L.yAt(s)-TR_RELIEF(p.x,p.z);
 if(cut<-0.15||fill>0.5)TR_CARVED.push({x:p.x,z:p.z,r:half+Math.max(-cut,fill)*2+6});else TR_CARVED.push({x:p.x,z:p.z,r:half+3});}});
