// ================================================================= STRONGBOW TODAY — the layout's rules and its area
// SB.checks(L) -> [{name, pass, detail}]: plain functions over the layout's records (30-sb-layout.js). test-strongbow-town.js runs
// each on the layout and on a copy broken in that one way (the negative). SB.area(L): each part's footprint, floor and people.
// [G data]: no three.js, no DOM.
const SB={};
SB.foot=function(s){if(s[0]==='box')return (s[2]-s[1])*(s[4]-s[3]);if(s[0]==='circ')return Math.PI*s[3]*s[3];return Math.PI*(s[4]*s[4]-s[3]*s[3]);};
SB.bounds=function(s){if(s[0]==='box')return[s[1],s[2],s[3],s[4]];const r=s[0]==='circ'?s[3]:s[4];return[s[1]-r,s[1]+r,s[2]-r,s[2]+r];};
// do two footprints overlap (by more than tol m)? boxes exactly; a circle or ring by its outer circle (a ring's hole counts as open)
SB.overlap=function(a,b,tol){tol=tol==null?.5:tol;
 const circ=s=>s[0]==='box'?null:[s[1],s[2],s[0]==='circ'?s[3]:s[4],s[0]==='ring'?s[3]:0];
 const ca=circ(a),cb=circ(b);
 if(!ca&&!cb)return a[1]<b[2]-tol&&b[1]<a[2]-tol&&a[3]<b[4]-tol&&b[3]<a[4]-tol;
 if(ca&&cb){const d=Math.hypot(ca[0]-cb[0],ca[1]-cb[1]);if(d>ca[2]+cb[2]-tol)return false;
  /* one inside the other's hole */ if(d+cb[2]<ca[3]+tol||d+ca[2]<cb[3]+tol)return false;return true;}
 const c=ca||cb,bx=ca?b:a,nx=Math.max(bx[1],Math.min(c[0],bx[2])),nz=Math.max(bx[3],Math.min(c[1],bx[4]));
 if(Math.hypot(nx-c[0],nz-c[1])>c[2]-tol)return false;
 /* the box wholly inside a ring's hole */ const far=Math.max(...[[bx[1],bx[3]],[bx[1],bx[4]],[bx[2],bx[3]],[bx[2],bx[4]]].map(q=>Math.hypot(q[0]-c[0],q[1]-c[1])));
 return !(c[3]>0&&far<c[3]+tol);};
SB.inside=function(child,parent){const a=SB.bounds(child),b=SB.bounds(parent);return a[0]>=b[0]-1&&a[1]<=b[1]+1&&a[2]>=b[2]-1&&a[3]<=b[3]+1;};
// the reach over open ways from a start, keeping to the ways a filter allows
SB.reach=function(L,start,ok){const adj={};for(const w of L.ways){if(!w.open||(ok&&!ok(w)))continue;(adj[w.a]=adj[w.a]||[]).push(w);(adj[w.b]=adj[w.b]||[]).push(w);}
 const seen=new Set([start]),q=[start],via={};while(q.length){const a=q.shift();for(const w of adj[a]||[]){const b=w.a===a?w.b:w.a;if(!seen.has(b)){seen.add(b);via[b]=w.id;q.push(b);}}}
 return{seen,via};};
SB.path=function(L,from,to,ok){const r=SB.reach(L,from,ok);if(!r.seen.has(to))return null;const W={};for(const w of L.ways)W[w.id]=w;
 const out=[];let at=to;while(at!==from){const w=W[r.via[at]];out.unshift(w);at=w.a===at?w.b:w.a;}return out;};

SB.checks=function(L){const R=[],P={};for(const p of L.parts)P[p.id]=p;const add=(name,pass,detail)=>R.push({name,pass:!!pass,detail:detail||''});
 // 1. ids, states, zones, holders
 {const ids=L.parts.map(p=>p.id).concat(L.ways.map(w=>w.id)),dup=ids.filter((x,i)=>ids.indexOf(x)!==i);add('unique ids',!dup.length,dup.slice(0,4).join(' '));}
 {const bad=L.parts.filter(p=>SB_STATES.indexOf(p.state)<0||SB_ZONES.indexOf(p.zone)<0||SB_BY.indexOf(p.by)<0);add('states, zones and holders from their lists',!bad.length,bad.slice(0,4).map(p=>p.id).join(' '));}
 // 2. every way's ends exist (or are the world's)
 {const bad=L.ways.filter(w=>[w.a,w.b].some(e=>!P[e]&&e.indexOf('world:')!==0));add('every way joins two parts',!bad.length,bad.slice(0,4).map(w=>w.id).join(' '));}
 // 3. children inside their parents
 {const bad=L.parts.filter(p=>p.in&&(!P[p.in]||!SB.inside(p.shape,P[p.in].shape)));add('children inside their parents',!bad.length,bad.slice(0,4).map(p=>p.id).join(' '));}
 // 4. no two parts overlap at one height (a drum passes through its terrace; a part and its parent; walls are lines)
 {const bad=[],ps=L.parts.filter(p=>p.kind!=='wall'&&p.zone!=='town'&&p.state!=='gone');
  for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j];
   if(a.in===b.id||b.in===a.id||(a.in&&a.in===b.in&&false))continue;
   const k=[a.kind,b.kind].sort().join('/');if(k==='drum/terrace')continue;
   /* the Nock's deck is built round the tower's foot */ if((a.kind==='tower'&&b.zone==='Z5')||(b.kind==='tower'&&a.zone==='Z5'))continue;
   if(a.y>=b.y+Math.max(b.h,.5)-.01||b.y>=a.y+Math.max(a.h,.5)-.01)continue;
   if(SB.overlap(a.shape,b.shape))bad.push(a.id+'/'+b.id);}
  add('no two parts overlap at one height',!bad.length,bad.slice(0,6).join(' '));}
 // 5. the owner: Xanadu holds the structure up to the third terrace; above it only the elevator's lifts and landings, and the post at the lip
 {const t3=L.terraces[3].y,bad=L.parts.filter(p=>p.by==='xanadu'&&p.zone!=='town'&&p.y>t3+1&&['landing','post','yard','gallery'].indexOf(p.kind)<0);
  add('Xanadu holds nothing above the third terrace but the elevator and the lip\'s post',!bad.length,bad.map(p=>p.id).join(' '));}
 // 6. every part Xanadu holds is reached from the plaza by open ways, without the salvagers' gated lift or the Order's ways
 {const r=SB.reach(L,'sb.plaza',w=>!w.gated&&w.by!=='order'&&w.by!=='outcasts'),bad=L.parts.filter(p=>p.by==='xanadu'&&!r.seen.has(p.id));
  add('every part Xanadu holds is reached from the plaza',!bad.length,bad.slice(0,6).map(p=>p.id).join(' '));}
 // 7. the elevator: from the lobby to the lip's post on Xanadu's ways alone, never through the Order's parts or the outcasts'
 {const pth=SB.path(L,'sb.lobby','sb.lip.post',w=>w.by==='xanadu'&&!w.gated&&[w.a,w.b].every(e=>!P[e]||(P[e].by!=='order'&&P[e].by!=='outcasts')));
  add('the elevator runs from the lobby to the lip on Xanadu\'s ways, round the outcasts and the Order',!!pth,pth?pth.map(w=>w.id).join(' > '):'no way');}
 // 8. the Order's house is reached only by its own ramp: no way from the plaza reaches its parts without the Order's ways
 {const r=SB.reach(L,'sb.plaza',w=>w.by!=='order'),bad=L.parts.filter(p=>p.by==='order'&&p.kind!=='gate'&&r.seen.has(p.id));
  add('the Order\'s house, beyond its gate, is reached only by its ramp and stair',!bad.length,bad.map(p=>p.id).join(' '));}
 // 9. the outcasts: with the salvagers' lift shut, their drums are reached from the town only by their rope ways
 {const r=SB.reach(L,'sb.plaza',w=>!w.gated&&w.kind!=='rope'&&w.by!=='order'),bad=L.parts.filter(p=>p.zone==='Z3'&&r.seen.has(p.id));
  const r2=SB.reach(L,'sb.plaza',w=>!w.gated&&w.by!=='order'),some=L.parts.some(p=>p.by==='outcasts'&&r2.seen.has(p.id));
  add('the outcasts\' drums are reached only by their rope ways (or the gated lift)',!bad.length&&some,bad.map(p=>p.id).join(' ')+(some?'':' (no rope way reaches them)'));}
 // 10. a part cut off is reached by no way at all
 {const bad=L.parts.filter(p=>p.state==='cutoff'&&L.ways.some(w=>w.open&&(w.a===p.id||w.b===p.id)));add('a part cut off has no way to it',!bad.length,bad.map(p=>p.id).join(' '));}
 // 11. the lifts: each a girder frame of at most 160 m, its ends at the heights of the parts it joins
 {const bad=L.ways.filter(w=>w.kind==='lift'&&(w.y1-w.y0>160||w.y1<=w.y0||[[w.a,w.y0],[w.b,w.y1]].some(([e,y])=>P[e]&&Math.abs(P[e].y-y)>2)));
  add('every lift is one girder frame of at most 160 m, landing level with its ends',!bad.length,bad.map(w=>w.id+' '+(w.y1-w.y0).toFixed(0)).join(' '));}
 // 12. the elevator's wall lifts stand clear of the standing stays (6 m from every cable)
 {const segd=(p,a,b)=>{const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l2=d[0]*d[0]+d[1]*d[1]+d[2]*d[2];let t=((p[0]-a[0])*d[0]+(p[1]-a[1])*d[1]+(p[2]-a[2])*d[2])/l2;t=Math.max(0,Math.min(1,t));
   return Math.hypot(a[0]+d[0]*t-p[0],a[1]+d[1]*t-p[1],a[2]+d[2]*t-p[2]);};
  const bad=[];for(const w of L.ways)if(w.elevator)for(let y=w.y0;y<=w.y1;y+=5)for(const s of L.stays){if(segd([w.frame[0],y,w.frame[1]],s.a,s.b)<6){bad.push(w.id+'/'+s.id);break;}}
  add('the wall lifts stand clear of the stays',!bad.length,[...new Set(bad)].slice(0,6).join(' '));}
 // 13. the people: the plan's numbers by zone, and the census's
 {const by={};for(const p of L.parts)by[p.zone]=(by[p.zone]||0)+p.people;const C=L.people,A=C.arcology;
  const want={Z0:A.foot,Z1:A.lowerSpine,Z2:A.middleSpine,Z3:C.upperSpine,Z6:C.order,Z7:A.face,town:C.town};
  const bad=Object.keys(want).filter(z=>(by[z]||0)!==want[z]);add('the people by zone match the plan and the census',!bad.length,bad.map(z=>z+' '+(by[z]||0)+' of '+want[z]).join(', '));}
 // 14. people live only in parts that are held: reclaimed, kept or squatted
 {const bad=L.parts.filter(p=>p.people>0&&['reclaimed','kept','squatted'].indexOf(p.state)<0);add('people live only in held parts',!bad.length,bad.map(p=>p.id).join(' '));}
 return R;};

// the area: each part's footprint, floor (by its storeys) and people now
SB.area=function(L){const rows=L.parts.filter(p=>p.zone!=='town').map(p=>{const fp=SB.foot(p.shape);return{id:p.id,name:p.name,zone:p.zone,state:p.state,by:p.by,st:p.st,footprint:fp,floor:fp*Math.max(p.st,0),people:p.people};});
 const sum=k=>rows.reduce((a,r)=>a+r[k],0);return{rows,floor:sum('floor'),people:sum('people')};};
