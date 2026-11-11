// node kits/ancients/targets/parabola/test-parabola.js — Parabola's plan in node (no browser): it is [G data].
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..','..');
const ctx={Math,console};vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','kits/ancients/targets/parabola/8av0-parabola-plan.js'])
 vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;this.PARABOLA=typeof PARABOLA!=="undefined"?PARABOLA:this.PARABOLA;',ctx,{filename:f});
const C=ctx.PARABOLA;let fails=0;
const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
const P=C.plan(),F=P.frame,D=P.dim,S=P.stats,RU=C.ruin(P),DR=C.dress(P);
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],len=a=>Math.sqrt(dot(a,a));
console.log(JSON.stringify({terraces:S.terraces,segs:S.segs,mirrors:S.mirrors,pop:S.pop,floor:(S.floor/1e4).toFixed(0)+' ha',farm:(S.farm/1e4).toFixed(0)+' ha',
 lowest:F.ymin.toFixed(1),lip:S.lip.toFixed(1),back:S.height.toFixed(0),focus:S.focus.toFixed(0),piers:S.piers,fallen:RU.fallen.length,orchard:RU.orchard.length}));

ok(JSON.stringify(P)===JSON.stringify(C.plan())&&JSON.stringify(RU)===JSON.stringify(C.ruin(C.plan())),'the plan and the ruin are deterministic');
{const ids=[].concat(P.terraces,P.segs,P.mirrors,P.ribs,P.panels,P.piers,P.legs,[P.receiver,P.hall,P.basin,P.boss,P.viaduct],P.viaduct.spans,P.hall.platforms,DR,
  RU.fan,RU.sand,RU.orchard,RU.post.serai.stalls,RU.post.serai.beasts,[RU.post.gate,RU.post.house,RU.post.serai,RU.lake]).map(r=>r.id);
 ok(new Set(ids).size===ids.length,'unique ids ('+ids.length+' records)');}

// the dish: 1 800 m across the rim, 320 m deep, its axis 30 degrees off the vertical toward the north
{const c=F.at(0,0,D.DEPTH);let bad=0;for(let i=0;i<72;i++){const a=i*Math.PI/36,p=F.surf(D.R*Math.sin(a),D.R*Math.cos(a)),d=sub(p,c);
  if(Math.abs(len(d)-D.R)>1e-6||Math.abs(dot(d,F.A))>1e-6)bad++;}
 ok(!bad,'the rim is a circle 1 800 m across, 320 m up the axis from the vertex');
 ok(Math.abs(Math.acos(F.A[1])*180/Math.PI-30)<1e-9&&F.A[2]<0&&Math.abs(F.A[0])<1e-12,'the axis leans 30 degrees north, toward the noon sun');}
ok(S.span>880&&S.span<940,'the back rim stands about 910 m over the lowest point ('+S.span.toFixed(0)+' m)');

// the terraces: level, stepped, lips on the paraboloid
{let bad=0;for(const g of P.segs)for(const a of [g.a0,(g.a0+g.a1)/2,g.a1]){const q=F.uvC(g.rho,a);if(Math.abs(F.height(q[0],q[1])-g.y1)>1e-6)bad++;}
 ok(!bad,'every lip is level and on the true paraboloid ('+P.segs.length+' segments)');
 let step=0;for(let i=1;i<P.terraces.length;i++){const a=P.terraces[i-1],b=P.terraces[i];if(Math.abs(a.rhoN-b.rho)>1e-9||Math.abs(a.y1-b.y0)>1e-9)step++;}
 ok(!step,'each riser stands at the back of the tread below it ('+P.K+' terraces of '+D.NS+' storeys)');
 ok(Math.abs(P.terraces[0].y0-F.ymin)<1e-9,'the first riser stands on the basin');}
ok(S.pop>110000&&S.pop<130000,'about 120 000 people as built ('+S.pop+')');

// the mirrors focus: light along the axis, reflected off each panel, passes the focus
{let worst=0;for(const m of P.mirrors){const d=[-F.A[0],-F.A[1],-F.A[2]],k=2*dot(d,m.n),r=[d[0]-k*m.n[0],d[1]-k*m.n[1],d[2]-k*m.n[2]];
  const w=sub(F.focus,m.at),t=dot(w,r),miss=len(sub(w,[r[0]*t,r[1]*t,r[2]*t]));if(t>0)worst=Math.max(worst,miss);else worst=1e9;}
 ok(worst<1,'every mirror sends light along the axis to the focus (worst miss '+worst.toFixed(2)+' m of a '+D.RX.r+' m receiver)');}

// the basin, the hall and the lake
const inPoly=(x,z,P2)=>{let c=false;for(let i=0,j=P2.length-1;i<P2.length;j=i++)if((P2[i][1]>z)!==(P2[j][1]>z)&&x<(P2[j][0]-P2[i][0])*(z-P2[i][1])/(P2[j][1]-P2[i][1])+P2[i][0])c=!c;return c;};
{const H=P.hall,out=F.outer(0,F.v0);
 ok(inPoly(F.low[0],F.low[2],P.basin.poly)&&inPoly((H.x0+H.x1)/2,H.z1,P.basin.poly)&&inPoly(H.x0+2,(H.z0+H.z1)/2,P.basin.poly),'the terminus hall lies under the basin, at the lowest point');
 ok(H.y1<P.basin.y&&H.y0>out[1]&&H.z0<=F.surf(0,D.R)[2],'inside the shell: under the plaza, over the outer skin, its portal through the north lip');}
ok(RU.lake.level>P.basin.y&&RU.lake.depth<P.basin.parapet-2,'the rain lake ('+RU.lake.depth+' m) is held by the north parapet ('+P.basin.parapet.toFixed(1)+' m)');

// the structure: the piers carry the dish, the mast carries the receiver
{const tri=P.piers.map(p=>[p.at[0],p.at[2]]);let cx=0,cz=0,n=0;
 for(let i=0;i<40;i++)for(let j=0;j<40;j++){const u=-D.R+(i+.5)*D.R/20,v=-D.R+(j+.5)*D.R/20;if(!F.inRim(u,v))continue;const p=F.surf(u,v);cx+=p[0];cz+=p[2];n++;}
 cx/=n;cz/=n;
 const sgn=(a,b,c)=>(a[0]-c[0])*(b[1]-c[1])-(b[0]-c[0])*(a[1]-c[1]),q=[cx,cz],s1=sgn(q,tri[0],tri[1]),s2=sgn(q,tri[1],tri[2]),s3=sgn(q,tri[2],tri[0]);
 ok((s1<0&&s2<0&&s3<0)||(s1>0&&s2>0&&s3>0),'the dish stands inside the triangle of its three piers');
 ok(P.piers.every(p=>p.h>50&&P.ribs.find(r=>r.id===p.rib).pier===p.id),'every pier stands on the ground under its rib ('+S.piers.join(', ')+' m)');}
ok(P.legs.length===3&&P.legs.every(l=>Math.abs(len(sub(l.head,P.receiver.at))-P.receiver.r)<1e-6&&l.foot[1]>=F.ymin-1e-9),'three legs from the treads to the receiver');

// the ruin
{const fr=RU.fallen.length/P.mirrors.length;ok(fr>.8&&fr<.88,'most mirrors fallen ('+(100*fr).toFixed(1)+'%; '+RU.fallen.filter(f=>f.where!=='tread').length+' in the scree and the fan)');
 const inW=phi=>C.angDist(phi,D.RUIN.wind)<=D.RUIN.quarter/2;
 const sh=RU.shell.map(id=>P.panels.find(p=>p.id===id));
 ok(sh.every(p=>inW((p.phi0+p.phi1)/2))&&RU.shell.length/P.panels.length>.2&&RU.shell.length/P.panels.length<=.25,'a quarter of the shell down, all on the windward side ('+RU.shell.length+' of '+P.panels.length+' panels)');
 ok(RU.ribs.length>0&&RU.ribs.every(r=>inW(P.ribs.find(q=>q.id===r.id).phi)),'the windward ribs broken ('+RU.ribs.length+')');
 ok(RU.gone.length>0&&RU.gone.every(id=>{const g=P.segs.find(q=>q.id===id);return inW(g.phi)&&g.k>D.RUIN.breach*P.K;}),'the upper terraces of that quarter slumped ('+RU.gone.length+' segments)');
 ok(RU.receiver.lean>10&&RU.legs.length===3,'the receiver leans in its mast, the stairs gone');
 ok(RU.sand.some(s=>s.on===P.hall.id)&&RU.sand.filter(s=>/^pb\.t\./.test(s.on)).every(s=>+s.on.split('.')[2]<=D.RUIN.sandK),'sand drifted on the lower decks and in the hall');
 const gone=new Set(RU.gone);ok(RU.orchard.length>2000&&RU.orchard.every(t=>!gone.has(t.on)&&P.segs.find(g=>g.id===t.on).use==='farm'),'the standing farm treads gone to orchard ('+RU.orchard.length+' trees)');
 ok(RU.post.proposed&&RU.post.serai.stalls.every(s=>s.at[2]>P.hall.z0&&s.at[2]<P.hall.z1),'the Izani post and caravanserai (proposed) in the hall');}
{const bad=[];const walk=(o,pth)=>{if(typeof o==='number'){if(!isFinite(o))bad.push(pth);}else if(o&&typeof o==='object')for(const k in o)if(typeof o[k]!=='function')walk(o[k],pth+'.'+k);};
 walk(P,'plan');walk(RU,'ruin');walk(DR,'dress');ok(!bad.length,'every number in the plan, the ruin and the dress is finite'+(bad.length?' ('+bad.slice(0,3).join(' ')+')':''));}
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
