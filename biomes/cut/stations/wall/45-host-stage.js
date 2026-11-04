// ================================================================= HOST — stage (the Cut, station 2: THE WALL, over the crater mouth)
// [web] The same host as station 1's (src/47 and the rest) with another STAGE.
// WHERE (PLAN.md section 8): the west side of the crater mouth, bearing 196 from the bowl's centre, 56 km out (CUT.SITES.wall):
// about -140 m on the bowl's one sweep (1.64 atm, Cfa and BWh, 720-830 mm, +23-27 degC). The warp is moderate here (s ~.2-.3).
// Below to the north the floor and its lakes; across, the far walls; to the east the mouth opening toward the crater, Dilihan
// in it (not drawn: settlements/dilihan is not built).
// THE PAGE (x east, z south, y up from the site's ground; R 2,400 m):
//   THE SWEEP        the bowl's wall rising to the south-south-west at ~11 degrees, smooth (no noise inside the lip)
//   THE COLUMNS      nwlowlands' wall species (the plan's list): ghost and blue gums, tower ash in the gullies, column kauri,
//                    banksias, grass trees, wattles, each leaning a little along the field and half again its height in the air
//   THE TERRACES     the measure melon's terraces cut across the sweep below the page's middle, a cistern at their head
//   THE RAVINE       one ravine down the wall, hyperbamboo in it
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const {TAU,clamp,lerp,mix,smooth,fbm}=BIO.fn;
/* exchange 6's check: the read-in great trumpets the station keeps, all within the ravine's band */
const trumpetCheck=R=>{const T=R.filter(r=>r.name==='Great trumpet'),far=T.filter(r=>STAGE.ravD&&STAGE.ravD(r.x,r.z)>160);
 return{ok:T.length>0&&!far.length,detail:T.length+' great trumpets kept'+(far.length?', '+far.length+' outside the ravine':', all in the ravine')};};
const STAGE=(function(){const site=CUT.SITES.wall,yRef=CUT.bowl.h(site.x,site.z),R=2400;
 const toBowl=(x,z)=>[x+site.x,z+site.z];
 const bowlY=(x,z)=>{const b=toBowl(x,z);return CUT.bowl.h(b[0],b[1])-yRef;};
 const g=(()=>{const e=40,a=bowlY(e,0)-bowlY(-e,0),b=bowlY(0,e)-bowlY(0,-e),l=Math.hypot(a,b);return[a/l,b/l];})();
 const up=g,ac=[-g[1],g[0]],U=(x,z)=>x*up[0]+z*up[1],V=(x,z)=>x*ac[0]+z*ac[1],P=(u,v)=>[up[0]*u+ac[0]*v,up[1]*u+ac[1]*v];
 // THE RAVINE: a line down the sweep 700 m to one side, wandering; its bed 14 m down at the middle of the page, shallower above and below
 const ravV=u=>-700+40*Math.sin(u*.0031+.4)+16*Math.sin(u*.009+2.1),ravD=(x,z)=>Math.abs(V(x,z)-ravV(U(x,z)));
 // THE TERRACES: a field of them centred 300 m below the site and 250 m to the other side; treads 3 m a step
 const TER={c:P(-300,260),r:200,step:3},terK=(x,z)=>smooth(TER.r,TER.r*.75,Math.hypot(x-TER.c[0],z-TER.c[1]));
 const CIS={c:P(-300+TER.r*.82,260),w:14,d:7,depth:1.4};   /* the cistern at the terraces' head (uphill) */
 const cisIn=(x,z)=>{const u=U(x,z)-U(...CIS.c),v=V(x,z)-V(...CIS.c);return Math.max(Math.abs(u)/(CIS.d/2),Math.abs(v)/(CIS.w/2));};
 function ground(x,z){let h=bowlY(x,z);
  const rd=ravD(x,z),u=U(x,z);h-=14*smooth(60,6,rd)*smooth(-2400,-400,u)*smooth(2400,600,u)+3*smooth(120,40,rd);
  const k=terK(x,z);if(k>0){const s=TER.step,f=h/s,i=Math.floor(f),fr=f-i,t=s*(i+smooth(.74,1,fr));h=mix(h,t,k);}
  const ci=cisIn(x,z);if(ci<1.4)h-=CIS.depth*smooth(1.15,.95,ci);
  return h;};
 const tread=(x,z)=>{const k=terK(x,z);if(k<.5)return 0;const h=bowlY(x,z),fr=((h/TER.step)%1+1)%1;return k*smooth(.7,.6,fr)*smooth(.03,.1,fr)*(cisIn(x,z)<1.6?0:1);};
 const patch=(x,z)=>{const b=toBowl(x,z);return KRAND.fbm(b[0]*.0021+7.7,b[1]*.0021-2.3,0,3,CUT.SEED+9);};
 const dryK=(x,z)=>smooth(.42,.62,patch(x,z));   /* the BWh patches: banksia, grass trees and wattles there; the gums and kauri between */
 const pool={name:'The melon terraces\' cistern',level:-CIS.depth+.35+bowlY(...CIS.c)*0,box:null};
 return{key:'wall',ravD,name:'The Cut: the wall, over the crater mouth',title:'Krator biome — the Cut: the wall',
  hint:'The Cut\'s wall over the crater mouth (-140 m, 1.64 atm): nwlowlands\' columns combed along the field, the measure melons\' terraces, the curve of the bowl across',
  site,yRef,R,px:[CUT.PX0[0]+site.x/CUT.PXM,CUT.PX0[1]+site.z/CUT.PXM],air:{pressure:1.64,humidity:.6},toBowl,alt:y=>y+yRef,ground,bowlY,up,across:ac,
  water:null,cutQ:1,
  pool:(function(){const c=CIS.c,lv=ground(c[0],c[1])+CIS.depth-.4,cs=[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[c[0]+up[0]*q[0]*CIS.d/2+ac[0]*q[1]*CIS.w/2,c[1]+up[1]*q[0]*CIS.d/2+ac[1]*q[1]*CIS.w/2]);
   return{name:'The melon terraces\' cistern (fed from the ravine)',level:lv,poly:cs};})(),
  floorLabel:y=>'The wall of the Cut (the bowl\'s one smooth sweep)',
  fields:{cold:(x,z)=>.3,wet:(x,z)=>clamp(.58+.3*smooth(140,10,ravD(x,z))-.12*dryK(x,z),0,1),tropic:(x,z)=>.25,dry:(x,z)=>.65*dryK(x,z),flow:(x,z)=>clamp(smooth(50,8,ravD(x,z)),0,1),upland:(x,z)=>clamp(.3+bowlY(x,z)/1200,0,1)},
  zone:(x,z)=>{const k=terK(x,z),rd=ravD(x,z);return{grove:smooth(46,20,rd)*smooth(.45,.52,patch(x*1.7,z*1.7)),reed:0,rank:0,melon:k,nw:(1-k)*(1-smooth(40,12,rd)),
   nhl:(1-k)*smooth(120,40,rd)*smooth(10,24,rd)};},   /* exchange 6: the great trumpet's colonies down the ravine beside the hyperbamboo (cold .3: the wall's warm temperate band) */
  nwAllow:['ghostgum','bluegum','towerash','kauri','banksia','grasstree','wattle'],nwQ:1.6,
  nhlAllow:['greattrumpet'],nhlQ:1,nhlOpt:{flora:false},
  groves:true,reeds:false,rank:false,
  melons:P=>CUT.planMelons({at:TER.c,r:TER.r*.95,tread,ground,toBowl,clear:(x,z,r)=>BIO.clearOf(x,z,r)}),
  layers:['ground.efflor','ground.salt','ground.shore','ground.litter'],layerMul:[1,1,0,1],
  weights:(x,z)=>{const k=terK(x,z),d=dryK(x,z);return[.35*d*(1-k),0,0,(1-k)*(1-.6*d)*.7+.5*k];},
  paint:(x,z)=>{const d=dryK(x,z),k=terK(x,z);let c=[.36,.38,.24].map((v,i)=>mix(v,[.62,.52,.36][i],d));c=c.map((v,i)=>mix(v,[.44,.34,.24][i],k*.8));return c;},
  views:()=>{const Y=(x,z)=>ground(x,z),Vw=(c,cy,t,ty)=>[c[0],Y(c[0],c[1])+cy,c[1],t[0],Y(t[0],t[1])+ty,t[1]];
   const toward=(a,b,d)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return[a[0]+dx/l*d,a[1]+dz/l*d];};
   const M=(CUT.PLANTS&&CUT.PLANTS.melons)||[],m0=M[Math.floor(M.length/2)]||{x:TER.c[0],z:TER.c[1]};
   const G=(CUT.PLANTS&&CUT.PLANTS.groves||[])[0]||{x:P(0,-700)[0],z:P(0,-700)[1],r:30};
   /* the crater mouth: toward Dilihan (px 472,333) from the site */
   const dl=CUT.px(472,333),dm=[dl[0]-site.x,dl[1]-site.z],dml=Math.hypot(...dm),mouth=[dm[0]/dml*6000,dm[1]/dml*6000];
   return{
    'The terraces of measure melons':Vw(P(-300-TER.r-60,260+120),26,TER.c,0),
    'Measure melons (three sizes, the stuck ones green)':Vw([m0.x+up[0]*-5+ac[0]*3,m0.z+up[1]*-5+ac[1]*3],1.6,[m0.x,m0.z],0),
    'The columns leaning along the field':Vw(P(250,250),6,P(700,500),40),
    'Across the bowl (the curve of the far walls)':Vw(P(300,0),260,P(-9000,0),-1500),
    'Down the crater mouth':Vw(P(-100,-200),40,mouth,-300),
    'The great trumpets by the ravine (exchange 6)':(function(){const T=(typeof REG!=='undefined'?REG:[]).filter(r=>r.name==='Great trumpet')[0];if(!T)return Vw(toward([G.x,G.z],P(0,0),-(G.r+60)),8,[G.x,G.z],30);return Vw([T.x+70,T.z+40],12,[T.x,T.z],22);})(),
    'Hyperbamboo in the ravine':Vw(toward([G.x,G.z],P(0,0),-(G.r+60)),8,[G.x,G.z],30),
    'The cistern at the terraces\' head':Vw(P(-300+TER.r*.82-30,260+24),5,CIS.c,0),
    'The wall from above':Vw(P(-900,300),420,P(600,0),0)};},
  checks:add=>{add('measure melons in exactly three sizes, a share stuck',CUT.checkMelons(CUT.PLANTS.melons));add('the great trumpet in the ravine (exchange 6)',trumpetCheck(REG));},
  negatives:add=>{add('no great trumpet on the page',trumpetCheck(REG.filter(r=>r.name!=='Great trumpet')));add('a melon of a fourth size',CUT.checkMelons(CUT.PLANTS.melons.slice(0,50).map((v,i)=>i?v:Object.assign({},v,{fruit:v.fruit.map(q=>Object.assign({},q,{d:.4}))}))));},
  start:'The terraces of measure melons',budgetTris:10500000,seed:12};})();
