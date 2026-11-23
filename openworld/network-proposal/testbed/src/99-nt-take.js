// ================================================================= HOST — the test bed handed to core/host; its checks  [web]
// verify.py --assert runs hostChecks (each road holds its class grade, every junction one level, the way meets its decks, the clearances
// under the viaduct and the guideway, no surface under water) and hostNegatives (a broken input each check must fail on).
const BUDGET={showcase:{tris:6000000,calls:600,rendered:5000000},cls:{pass:5000000,host:2500000},type:{host:'host'}};
const NT_grade=Rd=>{let g=0;Rd.segs.forEach(sg=>{const d=Math.hypot(sg.x1-sg.x0,sg.z1-sg.z0);if(d>0.5)g=Math.max(g,Math.abs(sg.y1-sg.y0)/d);});return g;};
const NT_under=(H,Rd,x,z)=>H.deckAt(H.path.project(x,z).s)-H.deck-Rd.yAt(Rd.path.project(x,z).s);
/* the ground AS THE MESH DRAWS IT (47-host-land: 4 km in 180 cells, a refined cell 12 x 12 sub-quads, each cut q-s), not the smooth terrainH: a triangle spanning a cutting's shoulder or a fill's edge can stand where the function does not */
const NT_meshH=(H,x,z)=>{const h=4000/180/12,a=Math.floor((x+2000)/h),b=Math.floor((z+2000)/h),x0=-2000+a*h,z0=-2000+b*h,u=(x-x0)/h,v=(z-z0)/h,yp=H(x0,z0),yq=H(x0+h,z0),yr=H(x0+h,z0+h),ys=H(x0,z0+h);return u+v<=1?yp+(yq-yp)*u+(ys-yp)*v:yr+(ys-yr)*(1-u)+(yq-yr)*(1-v);};
/* a junction draws its own surface (at the crossing road's level) over each arm's cut-back, so the arm's edge is not read there */
const NT_inJunction=(i,s)=>NT_NET.junctions.some(J=>J.arms.some(a=>a.road===i&&Math.abs(s-a.s)<a.cut+0.5));
/* every road's surface, edge to edge (nine points across, every `step` m along), against the mesh's ground; the junctions' cut-backs skipped */
const NT_meshHigh=(H,step)=>{const out=[];NT_ROADS.forEach((Rd,i)=>{const e=Rd.width/2+(Rd.pavement==null?0:Rd.pavement);for(let s=2;s<Rd.L-2;s+=step){if(i<TR_ROADS.length&&NT_inJunction(i,s))continue;
 const p=Rd.path.at(s),cx=Math.cos(p.yaw),sz=-Math.sin(p.yaw);for(let k=-4;k<=4;k++){const o=e*k/4,x=p.x+cx*o,z=p.z+sz*o,top=Rd.levelAt(x,z)+0.06,g=NT_meshH(H,x,z);if(g>top+0.02)out.push({id:NT_DEFS[i].id,s:Math.round(s),d:g-top});}}});return out;};
function hostChecks(){const R=[],add=(name,ok,detail)=>R.push({name,ok:!!ok,detail:detail||''}),N=NT_NET;
 add('the stage built',TRS.ready,TRS.ms+' ms');if(!TRS.ready)return R;
 NT_ROADS.forEach((Rd,i)=>{const c=NT_CLASS[NT_DEFS[i].cls],g=NT_grade(Rd);let cut=0,fill=0;Rd.segs.forEach(sg=>{cut=Math.min(cut,sg.fill);fill=Math.max(fill,sg.fill);});
  add(NT_DEFS[i].id+' holds its class grade ('+(c.maxGrade*100).toFixed(0)+' %)',g<=c.maxGrade+0.002,(g*100).toFixed(1)+' %; deepest cut '+(-cut).toFixed(1)+' m, highest fill '+fill.toFixed(1)+' m');});
 add('every junction has one level across its arms, met at every cut',N.junctions.every(J=>J.arms.every(a=>Math.abs(TR_ROADS[a.road].yAt(a.s+a.dir*a.cut)-J.y)<0.05)),N.junctions.map(J=>J.kind+' '+J.arms.map(a=>NT_DEFS[a.road].cls).join('x')).join(', '));
 const steps=[['way-w end / viaduct',TR_ROADS[0].yAt(TR_ROADS[0].L),NT_VIADUCT.deckAt(0)],['viaduct / way-m start',TR_ROADS[1].yAt(0),NT_VIADUCT.deckAt(NT_VIADUCT.L)],
  ['way-m end / trestle',TR_ROADS[1].yAt(TR_ROADS[1].L),NT_TRESTLE.deckAt(0)],['trestle / way-e start',TR_ROADS[2].yAt(0),NT_TRESTLE.deckAt(NT_TRESTLE.L)]];
 add('the way meets the viaduct and the trestle decks without a step',steps.every(q=>Math.abs(q[1]-q[2])<0.3),steps.map(q=>q[0]+' '+(q[1]-q[2]).toFixed(2)+' m').join('; '));
 {const v=NT_under(NT_VIADUCT,TR_ROADS[4],350,0);add('the Vothic road passes under the viaduct with 5 m clear',v>=5,v.toFixed(1)+' m');}
 {const J=N.junctions.find(J=>J.arms.some(a=>NT_DEFS[a.road].cls==='izani')&&J.arms.some(a=>NT_DEFS[a.road].cls==='way')),c=J?NT_GUIDE.deckAt(NT_GUIDE.path.project(J.x,J.z).s)-NT_GUIDE.deck-J.y:-1;add('the guideway clears the way x Izani junction by 5 m',c>=5,c.toFixed(1)+' m');}
 {let low=1e9;for(let s=0;s<NT_TRESTLE.L;s+=10){const p=NT_TRESTLE.path.at(s);if(waterH(p.x,p.z)>-1e5)low=Math.min(low,NT_TRESTLE.deckAt(s)-NT_TRESTLE.deck-NT_WATER);}add('the trestle stands 3 m over the water',low>=3,low.toFixed(1)+' m at its lowest');}
 {const off=NT_TRAIL.crossPins.map(p=>(p.y+0.04)-NT_TRAIL.yAt(p.s));add('the trail crosses its roads at their level (never above, at most 15 cm under), with no junction',NT_TRAIL.crossPins.length>=2&&off.every(v=>v>-0.02&&v<0.15)&&!N.junctions.some(J=>J.arms.some(a=>NT_DEFS[a.road]&&NT_DEFS[a.road].cls==='trail')),NT_TRAIL.crossPins.length+' crossings, under by '+off.map(v=>v.toFixed(2)).join('/')+' m');}
 {const deep=N.junctions.map(J=>({J,d:J.y-terrainH(J.x,J.z)})).filter(q=>q.d>0.6);add('no trench at a junction: the ground at each junction\'s heart lies at its level or above',!deep.length,deep.map(q=>q.J.id+' '+q.d.toFixed(1)+' m').join(', '));}
 {const wet=[];TR_ROADS.forEach((Rd,i)=>{for(let s=0;s<Rd.L;s+=8){const p=Rd.path.at(s);if(waterH(p.x,p.z)>-1e5&&Rd.yAt(s)<NT_WATER+0.3)wet.push(NT_DEFS[i].id+'@'+Math.round(s));}});add('no road surface lies under the marsh\'s water',!wet.length,wet.slice(0,6).join(', '));}
 {const hi=NT_meshHigh(terrainH,2);add('the ground mesh stays under every road surface, edge to edge (no sawtooth through it)',!hi.length,hi.length?hi.length+' points, worst '+hi.sort((p,q)=>q.d-p.d).slice(0,4).map(q=>q.id+'@'+q.s+' +'+q.d.toFixed(2)+' m').join(', '):'');}
 TRS.groups.forEach(G=>add(G.name+': under 2.5 M triangles',(G.userData.tris||0)<2500000,Math.round(G.userData.tris||0)+' tris'));
 return R;}
function hostNegatives(){const R=[];
 /* a road allowed 25 % over the ridge must break the 4 % check */
 R.push({name:'a road built at 25 % fails the way\'s grade check',failed:NT_grade(KTRANSIT.road([[-900,300],[-500,300]],{ground:TR_RELIEF,maxGrade:0.25,width:30}))>0.042});
 /* a road raised to just under the deck must fail the 5 m under-pass check */
 {const V=TR_ROADS[4],up={path:V.path,yAt:s=>NT_VIADUCT.deckAt(NT_VIADUCT.path.project(350,0).s)-NT_VIADUCT.deck-2};R.push({name:'a road 2 m under the viaduct\'s soffit fails the under-pass check',failed:NT_under(NT_VIADUCT,up,350,0)<5});}
 /* summed cuttings (the old ground) must fail the junction trench check somewhere */
 {const sum=(x,z)=>{let h=TR_RELIEF(x,z);for(let i=0;i<TR_ROADS.length;i++)h+=KTRANSIT.lineH(TR_ROADS[i],x,z);return h;};R.push({name:'summed cuttings dig deeper than the deepest single cut at a junction',failed:NT_NET.junctions.some(J=>sum(J.x,J.z)<terrainH(J.x,J.z)-0.5)});}
 /* the old fill envelope (discs round road samples, the highest within the road's half width) must push the mesh through a road somewhere */
 {const S=[];NT_ROADS.forEach(Rd=>{const half=Rd.width/2+(Rd.pavement==null?0:Rd.pavement)+0.5;for(let s=0;s<=Rd.L;s+=3){const p=Rd.path.at(s),y=Rd.yAt(s);if(y-TR_RELIEF(p.x,p.z)>=0.3)S.push([p.x,p.z,y-0.25,half]);}});
  const G=new Map(),C=24,kk=(i,j)=>i*100003+j;S.forEach(a=>{const k=kk(Math.floor(a[0]/C),Math.floor(a[1]/C));if(!G.has(k))G.set(k,[]);G.get(k).push(a);});
  const disc=(x,z)=>{let lo=-1e9;const i0=Math.floor(x/C),j0=Math.floor(z/C);for(let i=i0-2;i<=i0+2;i++)for(let j=j0-2;j<=j0+2;j++){const L=G.get(kk(i,j));if(L)for(const a of L){const v=a[2]-Math.max(0,Math.hypot(x-a[0],z-a[1])-a[3])/1.5;if(v>lo)lo=v;}}return lo;};
  const H0=(x,z)=>Math.max(TR_RELIEF(x,z)+NT_cut(x,z),disc(x,z));R.push({name:'the old disc fill envelope pushes the mesh through a road',failed:NT_meshHigh(H0,4).length>0});}
 return R;}
KHOST.on(SKY.view,'view');
const HOSTED=KHOST.take({build:'network-testbed',title:'Krator — the Ancient network road test bed',hint:'Pick a view. Fly (W A S D, Q E, Shift), F to walk. Every road class of the network on uneven ground, crossing each other; the Ancient way cuts a ridge, crosses a valley on a viaduct and a marsh on a trestle.',
 scene,camera,renderer,ground:terrainH,clear:1.2,registry:REG,views:VIEWS,ticks:TICKS,start:'From the air',
 clock:{hour:ATMOS.SKY.viewHour},draw:location.search.indexOf('nosky')>=0?undefined:SKY.draw,
 stats:()=>TRS.ready?('built in '+TRS.ms+' ms; '+TRS.groups.length+' groups, '+Math.round(TRS.groups.reduce((a,G)=>a+(G.userData.tris||0),0)/1000)+' k tris'):'building',
 budget:BUDGET,types:()=>BIO.stats,guards:false,layers:{'the ground':{on:true,objects:()=>[GROUND]}},
 api:{hostChecks,hostNegatives,stage:()=>({ready:TRS.ready,ms:TRS.ms,groups:TRS.groups.map(G=>({name:G.name,tris:Math.round(G.userData.tris||0),meshes:G.children.length}))}),
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};}}});
