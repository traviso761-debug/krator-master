// ================================================================= HYKKOUSOI — industry (agent F2): warehouses, scrap smithies, shipwright, granary, windmill, generator
// The working buildings of Ys. Every one is grown (DESIGN §4): lathes, pods, overlapping shell bands, bone-ribs,
// lipped holes; no box massing, nothing floating, a fillet wherever a shell meets the ground or another shell.
// The scrap smithies are the one place salvaged Ancient metal lies in the open, as a heap (DESIGN §1: the Hykkousoi
// prefer unrusted metal, so the smithies make new of old); the generator's visible parts are the other. Rooms are
// data (DESIGN §7): a 'store' room with store spots in rows, a 'workshop' with its tool, work and store spots.
// Seeds 30760–30799, builders 4 apart. Prefix hykInd.
// ---------------------------------------------------------------- shared helpers
// a surface whose winding is chosen for it: `hint(p)` gives the outward direction at a point, the default winding's
// normal (dv x du, 61-hyk-shell.js) is tested against it, and the quads are flipped when they face the wrong way;
// o.inward builds an inner skin facing the other way
function hykIndSurf(fn,nu,nv,o,hint){o=o||{};const d=1e-3,u=.37,v=.41;const p=fn(u,v),pu=fn(u+d,v),pv=fn(u,v+d);
 const n=new THREE.Vector3(pv[0]-p[0],pv[1]-p[1],pv[2]-p[2]).cross(new THREE.Vector3(pu[0]-p[0],pu[1]-p[1],pu[2]-p[2]));
 const h=hint(p);const out=n.x*h[0]+n.y*h[1]+n.z*h[2]>0;const flip=o.inward?out:!out;return hykSurf(fn,nu,nv,Object.assign({},o,{flip}));}
// the point and outward normal of a parametric surface at (u,v); `hint` says which way is out
function hykIndAt(fn,u,v,hint){const d=1e-3;const p=fn(u,v),pu=fn(u+d,v),pv=fn(u,v+d);
 const n=new THREE.Vector3(pu[0]-p[0],pu[1]-p[1],pu[2]-p[2]).cross(new THREE.Vector3(pv[0]-p[0],pv[1]-p[1],pv[2]-p[2])).normalize();
 if(n.x*hint[0]+n.y*hint[1]+n.z*hint[2]<0)n.negate();return {p,n:[n.x,n.y,n.z]};}
// a rail where people stand: a bone tube at hand height along a polyline, on posts, a knob at each end
function hykIndRail(pts,o){o=o||{};const col=o.col||hC(hPick(HPAL.bone));const h=o.h||1.15;if(pts.length<2)return;
 hykPut('hkBone',hykTube(pts.map(p=>[p[0],p[1]+h,p[2]]),()=>.07,{seg:6,col}));
 const ev=o.every||2;for(let i=0;i<pts.length;i+=ev){const p=pts[i];kput('hkPost',[p[0],p[1]+h/2,p[2]],null,[.06,h,.06],col);}
 for(const p of [pts[0],pts[pts.length-1]])kput('hkBall',[p[0],p[1]+h,p[2]],null,[.14,.12,.14],col);}
// a raised lobed platform (a loading landing, a granary pad): a superellipse plan Lx by Lz, a faintly domed top at y, a
// fillet skirt down to the ground, a rolled lip round the edge; o:{col,mat,e,lobes, rail:{a0,gap} (a rail round the rim,
// open `gap` radians about bearing a0), steps:{a} (treads down to the ground at bearing a, each on its own stalk)}
function hykIndPlatform(cx,cz,Lx,Lz,y,o){o=o||{};const col=o.col||hC(hPick(HPAL.shell)),mat=o.mat||'hkShell';const e=o.e||.72,ln=o.lobes||9,la=o.lobeAmp!=null?o.lobeAmp:.045;
 const edge=th=>{const c=Math.cos(th),s=Math.sin(th);const k=1+la*Math.cos(ln*th);return [Lx*Math.sign(c)*Math.pow(Math.abs(c),e)*k,Lz*Math.sign(s)*Math.pow(Math.abs(s),e)*k];};
 hykPut(mat,hykIndSurf((u,v)=>{const E=edge(u*TAU);return [cx+E[0]*v,y+.05*(1-v*v),cz+E[1]*v];},56,4,{col},()=>[0,1,0]));
 const f=Math.min(y*.9,1.4),Lm=Math.min(Lx,Lz);
 hykPut(mat,hykIndSurf((u,v)=>{const E=edge(u*TAU);const s=v*Math.PI/2;const k=1+f*(1-Math.sin(s))/Lm;return [cx+E[0]*k,y*.97*(1-Math.cos(s))-.1*(1-v),cz+E[1]*k];},56,6,{col},p=>[p[0]-cx,0,p[2]-cz]));
 const lip=[];for(let i=0;i<=56;i++){const E=edge(i/56*TAU);lip.push([cx+E[0],y-.02,cz+E[1]]);}hykPut(mat,hykTube(lip,()=>.11,{seg:7,col}));
 if(o.rail){const a0=o.rail.a0||0,gap=o.rail.gap||0;const n=Math.max(12,Math.round((TAU-gap)*(Lx+Lz)*.5/1.1));const pts=[];
  for(let i=0;i<=n;i++){const a=a0+gap/2+(TAU-gap)*i/n;const E=edge(a);pts.push([cx+E[0]*.93,y,cz+E[1]*.93]);}hykIndRail(pts,{col:o.rail.col});}
 if(o.steps){const a=o.steps.a;const E=edge(a);const dx=E[0],dz=E[1];const L=Math.hypot(dx,dz)||1;const ux=dx/L,uz=dz/L;const rise=.27,nst=Math.round(y/rise);const bc=hC(hPick(HPAL.bone));
  for(let i=1;i<=nst;i++){const yt=y-i*rise;const px=cx+dx+ux*(i*.3+.1),pz=cz+dz+uz*(i*.3+.1);kput('hkTread',[px,yt-.05,pz],qEuler(0,Math.atan2(ux,uz),0),[1.5,.1,.34],bc);
   kput('hkPost',[px,yt/2-.05,pz],null,[.07,Math.max(.05,yt-.05),.07],bc);}}
 return {edge};}
// the scrap heap: a low crust-black mound with salvaged Ancient metal bedded in it, the kit's rusted pieces tumbled at
// every angle and a few more lying flat at its foot. The one place in the kit salvage lies as scrap, never as a wall.
function hykIndHeap(cx,cz,R,o){o=o||{};const n=o.n||Math.round(R*9);const H=R*.5;
 const M={H,cx,cz,yBase:-.25,rFn:y=>R*Math.sqrt(Math.max(0,1-Math.pow(y/H,1.6)))+.06,nu:30,nv:8,noise:{amp:.08,su:3,sv:1,seed:7},col:hC(0x8a6e58)};
 hykPut('hkCrust',hykLathe(M));hykPut('hkCrust',hykFlare([cx,-.02,cz],[0,1,0],R*.98,R*.3,{col:hC(0x7a6250)}));
 const pick=()=>{const k=(rng()*8)|0;switch(k){case 0:return ['strutR',[.28,rr(.9,2.2),.22]];case 1:return ['boxR',[rr(.4,.9),rr(.3,.6),rr(.4,.9)]];case 2:return ['pipeR',[.13,rr(.8,2.0),.13]];
  case 3:return ['mullR',[.3,.9,.3]];case 4:return ['pierR',[.45,.45,.45]];case 5:return ['ringR',[.55,.55,.55]];case 6:return ['postR',[.1,1.5,.1]];default:return ['strutR',[.3,rr(1.2,2.6),.3]];}};
 for(let i=0;i<n;i++){const a=rng()*TAU,rad=Math.sqrt(rng())*R*.88;const px=cx+rad*Math.cos(a),pz=cz+rad*Math.sin(a);
  const yS=M.yBase+H*Math.pow(Math.max(0,1-Math.pow(rad/R,2)),.625);const it=pick();const s=it[1];const L=Math.max(s[0],s[1],s[2]);
  kput(it[0],[px,yS-.18*L,pz],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),s,null);}
 const m=o.foot!=null?o.foot:4;for(let i=0;i<m;i++){const a=rr(0,TAU),rad=R*rr(1.05,1.35);const it=pick();const s=it[1];const th=Math.min(s[0],s[2]);
  kput(it[0],[cx+rad*Math.cos(a),th*.5-.02,cz+rad*Math.sin(a)],qEuler(0,rr(0,TAU),Math.PI/2+rr(-.08,.08)),s,null);}}
// a weed-cloth awning on bone spars: the sheet runs from a line high on a shell (A1–A2) out to two posts (P1–P2), sagging
// between its spars; the posts stand on the ground with a knob at the top, the spars knuckle into the shell
function hykIndAwning(A1,A2,P1,P2,o){o=o||{};const col=o.col||hC(hPick(HPAL.weed)),bone=o.bone||hC(hPick(HPAL.bone));
 for(const P of [P1,P2]){kput('hkPost',[P[0],P[1]/2-.1,P[2]],null,[.09,P[1]+.2,.09],bone);kput('hkBall',[P[0],P[1]+.02,P[2]],null,[.16,.14,.16],bone);kput('hkBall',[P[0],.02,P[2]],null,[.3,.14,.3],bone);}
 for(const [A,P] of [[A1,P1],[A2,P2]]){const n=[A[0]-P[0],A[1]-P[1],A[2]-P[2]];const L=Math.hypot(n[0],n[1],n[2])||1;const B=[A[0]+n[0]/L*.35,A[1]+n[1]/L*.35,A[2]+n[2]/L*.35];   // the spar ends inside the shell
  hykPut('hkBone',hykTube([B,A,[A[0]*.6+P[0]*.4,A[1]*.6+P[1]*.4,A[2]*.6+P[2]*.4],P],t=>.07+.03*Math.max(0,Math.cos(t*4*TAU)),{seg:6,col:bone}));kput('hkBall',A,null,[.16,.16,.16],bone);}
 hykPut('hkWeed',hykSurf((u,v)=>{const a=[A1[0]+(A2[0]-A1[0])*u,A1[1]+(A2[1]-A1[1])*u,A1[2]+(A2[2]-A1[2])*u],p=[P1[0]+(P2[0]-P1[0])*u,P1[1]+(P2[1]-P1[1])*u,P1[2]+(P2[2]-P1[2])*u];
  const sag=.22*Math.sin(u*Math.PI)*Math.sin(v*Math.PI)+.05*Math.sin(v*Math.PI);return [a[0]+(p[0]-a[0])*v,a[1]+(p[1]-a[1])*v-sag,a[2]+(p[2]-a[2])*v];},10,8,{col}));
 hykPut('hkBone',hykTube([P1,[(P1[0]+P2[0])/2,(P1[1]+P2[1])/2-.06,(P1[2]+P2[2])/2],P2],()=>.05,{seg:6,col:bone}));}   // the outer hem on its bar
// the forge hearth: a shell basin with a crust-black bowl and a bed of coals, an ember glow that shows at night, and the
// forge's own glow-pearl over the coals on a bracket from the rim (the warm light the smithy is lit by)
function hykIndForge(cx,cz,R,o){o=o||{};const col=o.col||hC(hPick(HPAL.shell));const H=R*.6;
 hykPut(o.mat||'hkShell',hykLathe({H,cx,cz,yBase:0,rFn:y=>R*(.66+.34*Math.pow(y/H,.7)),nu:30,nv:6,rings:{n:3,amp:.03},noise:{amp:.02,su:3,sv:1,seed:3},col}));
 hykPut('hkCrust',hykLathe({H:H*.72,cx,cz,yBase:H*.28,rFn:y=>R*.9*(.3+.7*Math.pow(y/(H*.72),.7)),nu:30,nv:5,flip:true,col:hC(0x241c16)}),true);
 hykPut('hkCrust',hykDisc(cx,H*.3,cz,R*.9*.32,{col:hC(0x3a2418)}),true);
 hykPut(o.mat||'hkShell',hykFlare([cx,.02,cz],[0,1,0],R*.66,R*.3,{col}));
 kput('hkLip',[cx,H,cz],qEuler(Math.PI/2,0,0),[R*.92,R*.92,R*.75],col);
 kput('emberB',[cx,H*.6,cz],null,[R*.55,R*.4,R*.55],hC(0xff9a50));
 const A=[cx+R*.9*Math.cos(.8),H,cz+R*.9*Math.sin(.8)];hykLight(cx,H*.62+.25,cz,{r:.19,bracket:A});return {H};}
// wall shelves over a store spot: two bone bars on knuckled brackets rooted in the wall (n = the wall's inward normal)
function hykIndShelf(ax,az,bx,bz,nx,nz,ys,col){for(const y of ys){hykPut('hkBone',hykTube([[ax,y,az],[bx,y,bz]],()=>.045,{seg:6,col}));
 for(const t of [.1,.5,.9]){const px=ax+(bx-ax)*t,pz=az+(bz-az)*t;hykPut('hkBone',hykTube([[px-nx*.45,y-.3,pz-nz*.45],[px-nx*.1,y-.12,pz-nz*.1],[px,y,pz]],()=>.035,{seg:5,col}));kput('hkBall',[px-nx*.4,y-.28,pz-nz*.4],null,[.09,.09,.09],col);}}}
// ---------------------------------------------------------------- the armoured hall
// Transverse shell bands along an axis, each a half-elliptic arch (half-width W, crown H above the springing yB), every
// band's leading edge rolled and riding proud over the one before (a chiton's plates), a knuckled bone-rib over every
// seam rooted in the ground with a ball and a flare (and standing as the legs when the hall is raised), the ends capped
// with rounded heads or left as open mouths with a thick lip, an inner skin wound inward, a floor, a fillet skirt.
// o:{axis:'x'|'z', a0,a1 (the extent along the axis), W,H,yB,nb,cap,col,mat,ops:(at)=>[...], vents, head,tail (false =
// open), inner, floor, skirt, ribEnds}. `at(s,y,side)` -> {p,n,u,v,k}: the outer skin at axis coordinate s, height y, on
// the +side flank (+z for an x hall, +x for a z hall) or the -side.
function hykIndHall(o){const a0=o.a0,a1=o.a1,W=o.W,H=o.H,yB=o.yB||0,nb=o.nb||5,mat=o.mat||'hkShell',col=o.col,cap=o.cap||0;const zax=o.axis==='z';
 const bc=o.bc||0;const M=zax?(s,y,b)=>[b+bc,y,s]:(s,y,b)=>[s,y,b+bc];const Q=zax?p=>[p[2],p[1],p[0]-bc]:p=>[p[0],p[1],p[2]-bc];   // (along, up, across) <-> local points
 const Md=zax?(s,y,b)=>[b,y,s]:(s,y,b)=>[s,y,b];   // the same for directions
 const L=(a1-a0)/nb,ov=Math.min(1.2,L*.22);const xa=k=>a0+k*L-(k?ov:0),xb=k=>a0+(k+1)*L;
 const prof=(ph,s)=>[W*Math.cos(ph)*s,yB+H*Math.pow(Math.max(0,Math.sin(ph)),.92)*s];
 const band=(k,t)=>{const A=xa(k),B=xb(k);return (u,v)=>{const ph=v*Math.PI;const x=A+u*(B-A);
   let s=1+(k?.04*(1-u):0)+.02*Math.sin(u*Math.PI)-.012*Math.cos(ph*2)+.006*Math.sin(u*5*TAU);
   s*=1+.02*(fbm(x/3,ph*2,7,2)-.5)*2;s*=1-(t||0);const zy=prof(ph,s);return M(x,zy[1],zy[0]);};};
 const capFn=(xe,dir,t)=>(u,v)=>{const ph=v*Math.PI;const ps=u*Math.PI/2;const cs=Math.pow(Math.cos(ps),.85)*(1-(t||0)),ex=Math.pow(Math.sin(ps),.85);
   const zy=prof(ph,cs*(1+.015*(fbm(u*3,ph*2,5,2)-.5)*2));return M(xe+dir*cap*ex,zy[1],zy[0]);};
 const hint=p=>{const q=Q(p);return Md(0,q[1]-yB,q[2]);};const capHint=xe=>p=>{const q=Q(p);return Md(q[0]-xe,q[1]-yB,q[2]);};
 const at=(s,y,side)=>{let k=0;for(let i=0;i<nb;i++)if(s>=xa(i))k=i;const f=band(k,0);const u=clamp((s-xa(k))/(xb(k)-xa(k)),0,1);
  let ph=Math.asin(Math.pow(clamp((y-yB)/H,0,.999),1/.92));if((side||1)<0)ph=Math.PI-ph;const r=hykIndAt(f,u,ph/Math.PI,Md(0,0,side||1));r.u=u;r.v=ph/Math.PI;r.k=k;return r;};
 const ops=o.ops?o.ops(at):[];
 if(o.vents){for(let k=0;k<nb;k++)for(const sd of [1,-1]){if(rng()<.3)continue;const s=xa(k)+(xb(k)-xa(k))*rr(.42,.7);const r=at(s,yB+H*rr(.4,.55),sd);ops.push({p:r.p,n:r.n,r:rr(.34,.46),kind:'vent'});}}
 const hole=hykHoleOf(ops);const per=Math.PI*(W+H)/2;const nv=Math.max(24,Math.round(per/.45));
 for(let k=0;k<nb;k++){const nu=Math.max(8,Math.round((xb(k)-xa(k))/.45));
  hykPut(mat,hykIndSurf(band(k,0),nu,nv,{col,hole,uS:(xb(k)-xa(k))/4,vS:per/4},hint));
  if(o.inner!==false)hykPut('hkIn',hykIndSurf(band(k,.07),nu,nv,{col:o.colIn||col,hole,inward:true,uS:(xb(k)-xa(k))/4,vS:per/4},hint),true);
  const lips=[];if(k>0||o.head===false)lips.push([0,k?.17:.3]);if(k===nb-1&&o.tail===false)lips.push([1,.3]);   // the rolled leading edge; a thick lip on an open mouth
  for(const [uu,rl] of lips){const f=band(k,0);const pts=[];for(let i=0;i<=28;i++)pts.push(f(uu,i/28));hykPut(mat,hykTube(pts,()=>rl,{seg:7,col}));
   for(const p of [pts[0],pts[28]])kput('hkBall',p,null,[rl*1.4,rl*1.2,rl*1.4],col);}}
 if(cap>0){const nu=Math.max(8,Math.round(cap*1.6/.45));
  for(const [xe,dir,on] of [[a0,-1,o.head!==false],[a1,1,o.tail!==false]]){if(!on)continue;
   hykPut(mat,hykIndSurf(capFn(xe,dir,0),nu,nv,{col,hole,uS:cap/4,vS:per/4},capHint(xe)));
   if(o.inner!==false)hykPut('hkIn',hykIndSurf(capFn(xe,dir,.07),nu,nv,{col:o.colIn||col,hole,inward:true,uS:cap/4,vS:per/4},capHint(xe)),true);}}
 // the ribs over the seams, and the legs under them when the hall stands on them
 const bone=o.bone||hC(hPick(HPAL.bone));const seams=[];for(let k=1;k<nb;k++)seams.push([xa(k)+ov*.5,1.04]);if(o.ribEnds)seams.push([a0+.5,1.0],[a1-.5,1.0]);
 for(const [s,sb] of seams){const S=sb+.02+.26/W;const pts=[M(s,-.4,W*S)];if(yB>0)pts.push(M(s,yB*.55,W*S*1.01));
  for(let i=0;i<=26;i++){const ph=i/26*Math.PI;const zy=prof(ph,S);pts.push(M(s,zy[1],zy[0]));}
  if(yB>0)pts.push(M(s,yB*.55,-W*S*1.01));pts.push(M(s,-.4,-W*S));
  hykPut('hkBone',hykTube(pts,t=>(.3-.1*Math.sin(t*Math.PI))*(1+.22*Math.max(0,Math.cos(t*8*TAU))),{seg:8,col:bone}));
  for(const sd of [1,-1]){const q=M(s,.02,sd*W*S);kput('hkBall',q,null,[.44,.3,.44],bone);hykPut('hkBone',hykFlare(q,[0,1,0],.3,.55,{col:bone}));}}
 // the fillet skirt round the footprint (a hall on the ground), cut where the doors reach the ground
 if(o.skirt!==false&&yB===0){const f=.9,Wk=W*1.03;const cx=(a0+a1)/2;
  const loop=t=>{t=((t%1)+1)%1;if(t<.25)return [a0+t/.25*(a1-a0),Wk];
   if(t<.5){const s2=(t-.25)/.25;const ps=Math.PI/2*(1-Math.abs(2*s2-1));return [a1+(o.tail===false?.3*ps:cap*Math.pow(Math.sin(ps),.85)),(s2<.5?1:-1)*Wk*Math.pow(Math.cos(ps),.85)];}
   if(t<.75)return [a1-(t-.5)/.25*(a1-a0),-Wk];
   const s2=(t-.75)/.25;const ps=Math.PI/2*(1-Math.abs(2*s2-1));return [a0-(o.head===false?.3*ps:cap*Math.pow(Math.sin(ps),.85)),(s2<.5?-1:1)*Wk*Math.pow(Math.cos(ps),.85)];};
  hykPut(mat,hykIndSurf((u,v)=>{const E=loop(u);const A=loop(u-2e-3),B=loop(u+2e-3);let nx=B[1]-A[1],nz=-(B[0]-A[0]);const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;if((E[0]-cx)*nx+E[1]*nz<0){nx=-nx;nz=-nz;}
   const s=v*Math.PI/2;const k=f*(1-Math.sin(s))-.4*v;return M(E[0]+nx*k,f*(1-Math.cos(s))-.12*(1-v),E[1]+nz*k);},180,6,{col,hole,uS:(a1-a0)/2,vS:.3},p=>{const q=Q(p);return Md(q[0]-cx,0,q[2]);}));}
 if(o.floor!==false){const f0=a0-cap*.8,f1=a1+cap*.8;hykPut('hkFloor',hykIndSurf((u,v)=>M(f0+(f1-f0)*u,yB+.05,(v-.5)*W*1.9),Math.max(2,Math.round((f1-f0)/4)),2,{col:o.colFloor||hC(hPick(HPAL.floor)),uS:(f1-f0)/4,vS:W/2},()=>[0,1,0]),true);}
 return {at,xa,xb,band,seams,prof,M,ops};}
// ---------------------------------------------------------------- warehouses: armoured halls with lipped cart doors and a loading landing
// The large one: six bands and two heads, 40 m, two cart doors on the front flank and a people door between them onto a
// raised loading landing with its rail and steps; vents high on the flanks; a 'store' room with its spots in rows.
function hykIndWarehouseL(G,o){reseed(30762+(o.v|0));const col=hC(hPick(HPAL.shell)),colIn=hC(hPick(HPAL.shellWarm),.9),bone=hC(hPick(HPAL.bone));
 const W=7.8,H=8.0,a0=-16.2,a1=16.2,cap=2.9,bc=-1.5;
 const hall=hykIndHall({axis:'x',a0,a1,W,H,nb:6,cap,bc,col,colIn,bone,vents:true,ribEnds:true,
  ops:at=>{const r1=at(-9.6,1.8,1),r2=at(9.6,1.8,1),r3=at(0,2.08,1);return [{p:r1.p,n:r1.n,r:1.6,ky:1.1,kind:'cart'},{p:r2.p,n:r2.n,r:1.6,ky:1.1,kind:'cart'},{p:r3.p,n:r3.n,r:1.08,ky:1.08,kind:'door'}];}});
 for(const op of hall.ops){if(op.kind==='cart')hykDoor(op,{level:'ground',depth:.9,name:'cart door'});else if(op.kind==='door')hykDoor(op,{level:'ground',depth:.6});else hykWin(op,{open:true});}
 // the loading landing: a lobed platform at cart-bed height against the front, railed, with steps down at its +x end
 hykIndPlatform(0,bc+W+1.5,5.4,2.7,.9,{col,rail:{a0:-Math.PI/2,gap:Math.PI*1.3,col:bone},steps:{a:0}});
 // a few barnacle specks at the foot, as on everything that stands long in the damp
 for(let i=0;i<40;i++){const s=rr(a0-cap,a1+cap),sd=rng()<.5?1:-1;const r=.08+rng()*.14;kput('hkBarnB',[s,rr(.05,.9),bc+sd*(W*1.03-.1)],null,[r,r*.7,r],hC(hPick(HPAL.barnacle)));}
 // the store room: the hall's floor, the store spots in two rows down its back half, a tally desk by the people door
 const poly=[[a0-cap*.5,bc-W*.84],[a1+cap*.5,bc-W*.84],[a1+cap*.5,bc+W*.84],[a0-cap*.5,bc+W*.84]];
 const room=hykRoom('store',poly,.05,H*.9,{doors:hall.ops.filter(p=>p.kind!=='vent').map(p=>[p.p[0],p.p[2],p.r*2]),wealth:.5});
 for(const z of [bc-4.9,bc-3.3])for(let x=-13;x<=13.01;x+=2.0)hykSpot(room,'store',x,z,0,1.2,.7);
 hykSpot(room,'work',3.8,bc+4.6,0,1.2,.7);
 hykReg('Warehouse',0,0,21,H+1.2);}
HYK.def({key:'hyk_warehouse_large',name:'Warehouse',family:'industry',row:'Industry',w:40,d:21,h:9.3,inside:true,tags:{type:['industry'],wealth:'middle',lit:false},build:hykIndWarehouseL});
// The small one: three bands, 18 m, one cart door and a people door onto a landing at the other end of the front.
function hykIndWarehouseS(G,o){reseed(30766+(o.v|0));const col=hC(hPick(HPAL.shellWarm)),colIn=hC(hPick(HPAL.shell),.9),bone=hC(hPick(HPAL.bone));
 const W=5.0,H=5.6,a0=-6.4,a1=6.4,cap=2.2,bc=-1.2;
 const hall=hykIndHall({axis:'x',a0,a1,W,H,nb:3,cap,bc,col,colIn,bone,vents:true,
  ops:at=>{const r1=at(-2.6,1.65,1),r2=at(3.9,2.0,1),r3=at(-.5,H*.5,-1);return [{p:r1.p,n:r1.n,r:1.5,ky:1.08,kind:'cart'},{p:r2.p,n:r2.n,r:1.05,ky:1.06,kind:'door'},{p:r3.p,n:r3.n,r:.5,kind:'vent'}];}});
 for(const op of hall.ops){if(op.kind==='cart')hykDoor(op,{level:'ground',depth:.8,name:'cart door'});else if(op.kind==='door')hykDoor(op,{level:'ground',depth:.5});else hykWin(op,{open:true});}
 hykIndPlatform(3.9,bc+W+1.3,2.6,2.3,.9,{col,lobes:7,rail:{a0:-Math.PI/2,gap:Math.PI*1.25,col:bone},steps:{a:0}});
 for(let i=0;i<18;i++){const s=rr(a0-cap,a1+cap),sd=rng()<.5?1:-1;const r=.08+rng()*.12;kput('hkBarnB',[s,rr(.05,.8),bc+sd*(W*1.03-.1)],null,[r,r*.7,r],hC(hPick(HPAL.barnacle)));}
 const poly=[[a0-cap*.5,bc-W*.84],[a1+cap*.5,bc-W*.84],[a1+cap*.5,bc+W*.84],[a0-cap*.5,bc+W*.84]];
 const room=hykRoom('store',poly,.05,H*.9,{doors:hall.ops.filter(p=>p.kind!=='vent').map(p=>[p.p[0],p.p[2],p.r*2]),wealth:.5});
 for(let x=-6;x<=6.01;x+=1.5)hykSpot(room,'store',x,bc-2.9,0,1.2,.7);
 for(const x of [-5.2,-3.6,5.0])hykSpot(room,'store',x,bc-1.3,0,1.2,.7);
 hykReg('Small warehouse',0,0,10,H+1.2);}
HYK.def({key:'hyk_warehouse_small',name:'Small warehouse',family:'industry',row:'Industry',w:18,d:16,h:6.8,inside:true,tags:{type:['industry'],wealth:'middle',lit:false},build:hykIndWarehouseS});
// ---------------------------------------------------------------- the scrap smithies
// the operculum: a domed plate over a tilted barnacle rim (the mock hut's lid), with a hole where a vent or chimney rises
function hykIndLid(L,o){const hAt=th=>L.H*(L.tilt?1-L.tilt.amp*.5*(1+Math.cos(th-(L.tilt.dir||0))):1);
 const rtAt=th=>L.rFn(hAt(th))*(1+(L.flute?L.flute.amp*Math.pow(.5+.5*Math.cos(L.flute.n*th+(L.twist||0)*hAt(th)),L.flute.sharp||2):0));
 return hykSurf((u,v)=>{const th=u*TAU;const r=rtAt(th)*v;return [L.cx+r*Math.cos(th),L.yBase+hAt(th)+(o.dome||.6)*(1-v*v)-.04,L.cz+r*Math.sin(th)];},40,6,{col:o.col,flip:true,hole:o.hole});}
// The large smithy (middle): a fluted shell forge-house with a sooted chimney spire out of its lid, the forge basin glowing
// under it, shelves on the walls, a weed-cloth awning over the yard, a quench trough, a store pod grown on its flank,
// and the scrap heap of salvaged Ancient metal beside the yard.
function hykIndSmithyL(G,o){reseed(30770+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone)),soot=hC(0x3a332c);
 const cx=0,cz=-1.5,rb=5.0,rt=3.8,h=5.4;
 const L={H:h,cx,cz,yBase:-.4,rFn:y=>rb+(rt-rb)*Math.pow(clamp(y/h,0,1),.75),nu:52,nv:20,flute:{n:14,amp:.05,sharp:1.5},rings:{n:8,amp:.02},noise:{amp:.03,su:5,sv:1.2,seed:21},tilt:{amp:.12,dir:-Math.PI/2},col};
 const dr=hykLatheAt(L,Math.PI/2,1.65),w1=hykLatheAt(L,Math.PI/2+1.5,3.0),w2=hykLatheAt(L,Math.PI/2-1.5,2.9),sd=hykLatheAt(L,Math.PI+.12,1.6);
 const ops=[{p:dr.p,n:dr.n,r:1.65,ky:.72,kind:'door'},{p:w1.p,n:w1.n,r:.46,kind:'window'},{p:w2.p,n:w2.n,r:.42,kind:'window'},{p:sd.p,n:sd.n,r:.95,ky:1.12,kind:'inner'}];
 L.ops=ops;hykPut('hkShell',hykLathe(L));hykPut('hkIn',hykLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*.9,flip:true,col:hC(hPick(HPAL.shellWarm),.85)})),true);
 hykPut('hkShell',hykFlare([cx,-.3,cz],[0,1,0],rb*.98,1.5,{col}));
 for(const op of ops){if(op.kind==='door')hykDoor(op,{level:'ground',depth:.7});else if(op.kind==='inner')hykDoor(op,{level:'ground',depth:.5,name:'store door'});else hykWin(op,{});}
 hykFloor(cx,cz,.05,rb*.86,{});
 // the lid and the chimney: a twisted fluted spire from the back of the lid, sooted at the top, a lipped smoke hole
 const chx=0,chz=-3.3,chY=L.yBase+h*.88,CH=6.6;
 hykPut('hkShell',hykIndLid(L,{col:col2,dome:.9,hole:(u,v,p)=>Math.hypot(p[0]-chx,p[2]-chz)<1.35}));
 const sootAt=v=>new THREE.Color().copy(col2).lerp(soot,clamp((v-.55)/.4,0,1));
 hykPut('hkShell',hykLathe({H:CH,cx:chx,cz:chz,yBase:chY-.4,rFn:y=>1.35*Math.pow(1-y/CH,.7)+.4,nu:22,nv:14,flute:{n:9,amp:.12,sharp:1.3},twist:.45,rings:{n:9,amp:.02},col:(u,v)=>sootAt(v)}));
 hykPut('hkShell',hykFlare([chx,chY+.55,chz],[0,1,0],1.55,.9,{col:col2}));
 kput('hkLip',[chx,chY-.4+CH-.02,chz],qEuler(Math.PI/2,0,0),[.42,.42,1.3],soot);kput('hkDisc',[chx,chY-.4+CH-.08,chz],qEuler(-Math.PI/2,0,0),[.4,.4,1],null);
 // inside: the forge basin under the chimney, shelves on the walls over the store spots, the lamp by the door
 const F=hykIndForge(chx,chz,1.25,{col:col2});
 for(const sx of [-1,1]){const rs=3.95,c=sx>0?0:Math.PI;const A=[cx+rs*Math.cos(c-.42),cz+rs*Math.sin(c-.42)],B=[cx+rs*Math.cos(c+.42),cz+rs*Math.sin(c+.42)];
  hykIndShelf(A[0],A[1],B[0],B[1],-Math.cos(c),-Math.sin(c),[1.35,1.95],bone);}
 const lp=hykLatheAt(L,Math.PI/2-.52,3.1);hykLight(lp.p[0]+lp.n[0]*.45,lp.p[1]+lp.n[1]*.45+.1,lp.p[2]+lp.n[2]*.45,{r:.2,bracket:lp.p});
 // the yard: shell paving, the awning on bone spars from the face, the quench trough, the scrap heap
 hykPut('hkFloor',hykDisc(.6,.03,4.6,4.4,{col:hC(hPick(HPAL.floor),.92),lobes:{n:9,amp:.07}}));
 const aw=hykLatheAt(L,Math.PI/2+.62,3.45),aw2=hykLatheAt(L,Math.PI/2-.62,3.45);hykIndAwning(aw.p,aw2.p,[-3.3,2.6,5.8],[3.4,2.6,5.8],{bone});
 hykPut('hkShell',hykLathe({H:.75,cx:-2.4,cz:4.1,yBase:0,rFn:y=>.72+.1*Math.pow(y/.75,.6),nu:22,nv:4,rings:{n:2,amp:.03},col}));hykPut('hkShell',hykFlare([-2.4,.02,4.1],[0,1,0],.7,.3,{col}));
 hykPut('hkFloor',hykDisc(-2.4,.62,4.1,.66,{col:hC(hPick(HPAL.teal))}));kput('hkLip',[-2.4,.75,4.1],qEuler(Math.PI/2,0,0),[.76,.76,.6],col);
 hykIndHeap(5.3,3.6,2.1,{n:22});
 // the store pod on the -x flank, rooted into the ground and the forge-house, with its window
 const P={a:2.0,b:1.85,c:2.0,e1:.9,e2:.92,cy:1.6,nu:40,nv:22,noise:{amp:.03,su:4,sv:3,seed:12},col:col2,hollow:{t:.08,col:col2},
  openings:[{th:Math.PI/2,el:0,r:.95,ky:1.12,kind:'door'},{th:-Math.PI/2,el:.15,r:.4,kind:'window'},{th:Math.PI,el:.4,r:.3,kind:'window'}]};
 const pd=hykPod(P);const px=-5.7,pz=-2.2;pd.geo.translate(px,0,pz);hykPut('hkShell',pd.geo);pd.inner.translate(px,0,pz);hykPut('hkIn',pd.inner,true);
 for(const op of pd.openings){op.p=[op.p[0]+px,op.p[1],op.p[2]+pz];if(op.kind==='window')hykWin(op,{});}
 hykPut('hkShell',hykFlare([px,0,pz],[0,1,0],P.a*.96,.9,{col:col2}));hykPut('hkShell',hykFlare([cx-L.rFn(1.6)*.97,1.6,-2.0],[-1,0,0],1.55,1.0,{col:col2}));
 hykFloor(px,pz,.07,P.a*.86,{});
 // rooms: the workshop (the forge-house) and the store pod
 const ws=hykRoom('workshop',hykCirclePoly(cx,cz,3.9,16),.05,h*.85,{doors:[[dr.p[0],dr.p[2],3.3],[sd.p[0],sd.p[2],1.9,'store']],wealth:.5});
 hykSpot(ws,'hearth',chx,chz,0,.8,.8);hykSpot(ws,'tool',1.4,-2.2,.3,.8,.5);hykSpot(ws,'work',-1.4,.3,0,1.4,.7);
 hykSpot(ws,'store',3.05,-1.5,Math.PI/2,1.2,.7);hykSpot(ws,'store',-3.05,-1.0,Math.PI/2,1.2,.7);
 const st=hykRoom('store',hykCirclePoly(px,pz,1.6,12),.07,P.b*1.6,{doors:[[px+P.a,pz,1.9,'workshop']],wealth:.5});
 hykSpot(st,'store',px-.95,pz,Math.PI/2,1.2,.7);
 hykReg('Scrap smithy',0,0,9,chY+CH);}
HYK.def({key:'hyk_smithy_large',name:'Scrap smithy',family:'industry',row:'Industry',w:17,d:16,h:11.6,inside:true,tags:{type:['industry'],wealth:'middle',lit:true},build:hykIndSmithyL});
// The small smithy (poor): one grey barnacle cone whose oblique vent is the chimney, the forge under it, a lean-to awning
// over the door and the heap at its side.
function hykIndSmithyS(G,o){reseed(30774+(o.v|0));const col=hC(hPick(HPAL.barnacle)),col2=hC(hPick(HPAL.barnacle),.92),bone=hC(hPick(HPAL.bone)),soot=hC(0x332e28);
 const cx=-.6,cz=-1.2,rb=3.6,rt=2.5,h=4.4;
 const L={H:h,cx,cz,yBase:-.4,rFn:y=>rb+(rt-rb)*Math.pow(clamp(y/h,0,1),.75),nu:44,nv:18,flute:{n:16,amp:.07,sharp:1.5},rings:{n:7,amp:.025},noise:{amp:.035,su:5,sv:1.2,seed:31},tilt:{amp:.2,dir:-Math.PI/2+.5},col:(u,v)=>new THREE.Color().copy(col).lerp(soot,clamp((v-.72)/.3,0,1)*.6)};
 const dr=hykLatheAt(L,Math.PI/2,1.3),w1=hykLatheAt(L,Math.PI/2+1.7,2.4);
 const ops=[{p:dr.p,n:dr.n,r:1.3,ky:.92,kind:'door'},{p:w1.p,n:w1.n,r:.4,kind:'window'}];L.ops=ops;
 hykPut('hkBarn',hykLathe(L));hykPut('hkIn',hykLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*.9,flip:true,col:hC(hPick(HPAL.barnacle),.85)})),true);
 hykPut('hkBarn',hykFlare([cx,-.3,cz],[0,1,0],rb*.98,1.1,{col}));
 for(const op of ops){if(op.kind==='door')hykDoor(op,{level:'ground',depth:.6});else hykWin(op,{});}
 hykFloor(cx,cz,.04,rb*.86,{});
 // the lid with the vent: the smoke hole, lipped and sooted
 hykPut('hkBarn',hykIndLid(L,{col:col2,dome:rt*.3,hole:(u,v)=>v<.26}));
 const hAt=th=>h*(1-L.tilt.amp*.5*(1+Math.cos(th-L.tilt.dir)));const vy=L.yBase+hAt(L.tilt.dir+Math.PI)*.5+hAt(L.tilt.dir)*.5+rt*.28;
 kput('hkLip',[cx,vy,cz],qEuler(Math.PI/2,0,0),[rt*.26,rt*.26,1.3],soot);kput('hkDisc',[cx,vy-.1,cz],qEuler(-Math.PI/2,0,0),[rt*.25,rt*.25,1],null);
 // inside: the forge under the vent, a shelf, the anvil's place; outside: the awning over the door and the heap
 hykIndForge(cx,cz-.9,.95,{col:col2,mat:'hkBarn'});
 {const rs=2.95;const A=[cx+rs*Math.cos(Math.PI+.35),cz+rs*Math.sin(Math.PI+.35)],B=[cx+rs*Math.cos(Math.PI-.5),cz+rs*Math.sin(Math.PI-.5)];const mx=(A[0]+B[0])/2-cx,mz=(A[1]+B[1])/2-cz;const ml=Math.hypot(mx,mz)||1;hykIndShelf(A[0],A[1],B[0],B[1],-mx/ml,-mz/ml,[1.25,1.8],bone);}
 const aw=hykLatheAt(L,Math.PI/2+.7,3.0),aw2=hykLatheAt(L,Math.PI/2-.7,3.0);hykIndAwning(aw.p,aw2.p,[-3.3,2.35,4.3],[2.0,2.35,4.3],{bone});
 hykPut('hkFloor',hykDisc(-.4,.03,3.6,3.0,{col:hC(hPick(HPAL.floor),.9),lobes:{n:7,amp:.07}}));
 hykIndHeap(3.7,2.6,1.7,{n:15,foot:3});
 const ws=hykRoom('workshop',hykCirclePoly(cx,cz,2.9,14),.04,h*.8,{doors:[[dr.p[0],dr.p[2],2.6]],wealth:.15});
 hykSpot(ws,'hearth',cx,cz-.9,0,.8,.8);hykSpot(ws,'tool',cx+1.5,cz-.3,.4,.8,.5);hykSpot(ws,'store',cx-2.15,cz+.1,Math.PI/2,1.2,.7);
 hykReg('Scrap forge',0,0,7,vy+.5);}
HYK.def({key:'hyk_smithy_small',name:'Scrap forge',family:'industry',row:'Industry',w:12,d:12,h:6.2,inside:true,tags:{type:['industry'],wealth:'poor',lit:true},build:hykIndSmithyS});
// ---------------------------------------------------------------- the shipwright: a slipway under an open shed, a workshop pod beside it
// The slip runs toward +z (the Harbour row's water side): two bone stringers on knuckled stalks with rib sleepers between
// them, descending from the shed to the front edge of the plot, a hull in frame on it (keel, ribs, the first strakes),
// rails along both sides where the wrights stand. The shed is the armoured hall raised on its seam ribs, open at both
// ends. The workshop is a pod grown against the shed's -x legs, with the building's door.
function hykIndShipwright(G,o){reseed(30778+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone)),dark=hC(hPick(HPAL.bone),.8);
 const sx=2.2;   // the slip's centre line (x)
 const hall=hykIndHall({axis:'z',a0:-11.5,a1:1.5,W:4.6,H:3.6,yB:3.1,nb:4,bc:sx,col,colIn:col2,bone,head:false,tail:false,floor:false,skirt:false,inner:true});
 // the slipway: y from 1.3 under the shed down to .15 at the front edge; stringers, sleepers, stalks; the rails beside it
 const z0=-9.5,z1=13.0,y0=1.3,y1=.15;const yAt=z=>y0+(y1-y0)*(z-z0)/(z1-z0);const hw=1.7;
 for(const s of [-1,1]){const pts=[];for(let z=z0;z<=z1+.01;z+=1.5)pts.push([sx+s*hw,yAt(z),z]);
  hykPut('hkBone',hykTube(pts,(t,i)=>.16*(1+.2*Math.max(0,Math.cos(t*pts.length*TAU/2))),{seg:7,col:bone}));
  for(let z=z0+.75;z<z1;z+=3.0){const y=yAt(z);kput('hkPost',[sx+s*hw,y/2-.08,z],null,[.11,y+.16,.11],bone);kput('hkBall',[sx+s*hw,.02,z],null,[.3,.14,.3],bone);}
  for(const p of [pts[0],pts[pts.length-1]])kput('hkBall',p,null,[.22,.2,.22],bone);
  const rail=[];for(let z=z0-.5;z<=z1-1.5;z+=1.4)rail.push([sx+s*(hw+1.1),0,z]);hykIndRail(rail,{col:bone,every:3});}
 for(let z=z0+.4;z<z1;z+=1.1){const y=yAt(z);hykPut('hkBone',hykRib([sx-hw,y-.04,z],[sx+hw,y-.04,z],{rise:-.16,r0:.11,r1:.09,n:8,seg:6,col:dark}));}
 // the hull in frame: a keel rising at both ends, bone ribs every .8 m, three strakes a side, on chocks
 const kz0=-8.0,kz1=1.6,kl=kz1-kz0;const keelY=z=>yAt(z)+.55+1.1*Math.pow(Math.abs((z-(kz0+kz1)/2)/(kl/2)),3);const beam=z=>1.35*Math.sqrt(Math.max(0,1-Math.pow((z-(kz0+kz1)/2)/(kl/2),2)))+.08;
 const keel=[];for(let z=kz0;z<=kz1+.01;z+=.6)keel.push([sx,keelY(z),z]);hykPut('hkBone',hykTube(keel,t=>.13-.04*Math.sin(t*Math.PI),{seg:7,col:bone}));
 for(const p of [keel[0],keel[keel.length-1]])kput('hkBall',p,null,[.2,.2,.2],bone);
 const ribs=[];for(let z=kz0+.8;z<kz1-.4;z+=.8){const b=beam(z),y=keelY(z);const h=1.25*(b/1.4)+.25;
  for(const s of [-1,1]){const pts=[];for(let i=0;i<=8;i++){const t=i/8;const ph=t*Math.PI/2;pts.push([sx+s*b*Math.sin(ph)*(1+.15*t),y+h*(1-Math.cos(ph)),z]);}hykPut('hkBone',hykTube(pts,t=>.07-.02*t,{seg:6,col:dark}));ribs.push(pts);}
  kput('hkBall',[sx,yAt(z)+.25,z],null,[.26,.26,.26],col);}   // the chock under the keel
 for(const s of [-1,1])for(const k of [2,4,6]){const pts=[];for(let z=kz0+.5;z<=kz1-.3;z+=.6){const b=beam(z),y=keelY(z);const h=1.25*(b/1.4)+.25;const ph=k/8*Math.PI/2;pts.push([sx+s*b*Math.sin(ph)*(1+.15*k/8)+s*.05,y+h*(1-Math.cos(ph)),z]);}
  hykPut('hkBone',hykTube(pts,()=>.055,{seg:5,col:col2}));}
 // the workshop pod against the shed's -x legs, rooted into the ground and into the leg line with a fillet
 const P={a:3.1,b:2.8,c:3.0,e1:.88,e2:.92,cy:2.4,nu:48,nv:26,noise:{amp:.028,su:4,sv:3,seed:16},col:col2,hollow:{t:.07,col:col2},
  openings:[{th:0,el:-.08,r:1.1,ky:1.05,kind:'door'},{th:Math.PI/2,el:.15,r:.5,kind:'window'},{th:-Math.PI/2+.5,el:.2,r:.45,kind:'window'},{th:Math.PI,el:.5,r:.4,kind:'window'}]};
 const px=sx-4.6-2.4,pz=-6.0;const pd=hykPod(P);pd.geo.translate(px,0,pz);hykPut('hkShell',pd.geo);pd.inner.translate(px,0,pz);hykPut('hkIn',pd.inner,true);
 let door=null;for(const op of pd.openings){op.p=[op.p[0]+px,op.p[1],op.p[2]+pz];if(op.kind==='door'){door=op;hykDoor(op,{level:'ground',depth:.5});}else hykWin(op,{});}
 hykPut('hkShell',hykFlare([px,0,pz],[0,1,0],P.a*.96,1.3,{col:col2}));hykPut('hkShell',hykFlare([sx-4.6*1.07,2.6,pz],[-1,0,0],1.2,1.0,{col:col2}));
 hykFloor(px,pz,.08,P.a*.86,{});
 // a lamp on the pod by its door (the yard works late), on a bracket from the shell
 const sp=pd.surf(((.45/TAU)%1+1)%1,clamp(.5/Math.PI+.5,.02,.98));const A=[sp[0]+px,sp[1],sp[2]+pz];const vl=Math.hypot(A[0]-px,A[1]-P.cy,A[2]-pz)||1;
 hykLight(A[0]+(A[0]-px)/vl*.45,A[1]+(A[1]-P.cy)/vl*.45+.1,A[2]+(A[2]-pz)/vl*.45,{r:.2,bracket:A});
 // the yard paving under the shed's open back and in front of the pod
 hykPut('hkFloor',hykDisc(px+1.5,.03,pz+5.2,3.6,{col:hC(hPick(HPAL.floor),.9),lobes:{n:8,amp:.07}}));
 // the room: the workshop pod, with the wright's bench, a tool place and the stores
 const ws=hykRoom('workshop',hykCirclePoly(px,pz,P.a*.8,14),.08,P.b*1.3,{doors:[[door.p[0],door.p[2],2.2]],wealth:.5});
 hykSpot(ws,'work',px-.2,pz-1.4,0,1.5,.7);hykSpot(ws,'tool',px+1.5,pz+.2,Math.PI/2,.8,.5);hykSpot(ws,'store',px-1.7,pz+.3,Math.PI/2,1.2,.7);hykSpot(ws,'store',px+.6,pz-.1,0,.8,.8);
 hykReg('Shipwright',0,0,14,7.5);}
HYK.def({key:'hyk_shipwright',name:'Shipwright',family:'industry',row:'Industry',w:18,d:28,h:7.6,inside:true,tags:{type:['industry'],wealth:'middle',lit:false},build:hykIndShipwright});
// ---------------------------------------------------------------- the granary: sealed silos on a raised pad, the store pod at their feet
// Three bulging fluted silos, each sealed by a rimmed dome lid with a knob, a lipped loading port high on its front with a
// peg ladder up to it, stand on a lobed pad a metre and a quarter above the damp. A low store pod on the pad in front of
// them takes their spouts and holds the building's door; steps and a rail at the pad's front edge.
function hykIndGranary(G,o){reseed(30782+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone));
 const PY=1.25;hykIndPlatform(0,0,7.2,5.8,PY,{col,lobes:11,rail:{a0:Math.PI/2,gap:.9,col:bone},steps:{a:Math.PI/2}});
 const silos=[[-4.3,-2.3,6.6],[0,-2.4,7.6],[4.3,-2.3,6.9]];
 silos.forEach(([x,z,H],i)=>{const L={H,cx:x,cz:z,yBase:PY-.1,rFn:y=>1.55+.5*Math.pow(Math.sin(Math.PI*clamp(y/H,0,1)),.9)*(1-.25*y/H),nu:40,nv:20,flute:{n:12,amp:.04,sharp:1.6},rings:{n:9,amp:.025},twist:.12,noise:{amp:.02,su:4,sv:1.5,seed:40+i},col:i===1?col2:col};
  const port=hykLatheAt(L,Math.PI/2,H*.74);L.ops=[{p:port.p,n:port.n,r:.5,kind:'port'}];
  hykPut('hkShell',hykLathe(L));hykPut('hkIn',hykLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*.9,flip:true,col:hC(hPick(HPAL.shellWarm),.85)})),true);
  hykPut('hkShell',hykFlare([x,PY+.02,z],[0,1,0],L.rFn(0)*.97,.75,{col:L.col}));
  hykWin(L.ops[0],{open:true,depth:.4});
  // the rimmed lid: a lip at the rim, a dome lid seated in it, a knob
  const rt=L.rFn(H),yt=PY-.1+H;kput('hkLip',[x,yt-.04,z],qEuler(Math.PI/2,0,0),[rt*1.04,rt*1.04,1.5],col2);
  hykPut('hkShell',hykLathe({H:1.35,cx:x,cz:z,yBase:yt-.12,rFn:y=>(rt+.28)*Math.sqrt(Math.max(0,1-Math.pow(y/1.35,2.2)))+.06,nu:32,nv:10,rings:{n:3,amp:.03},col:col2}));
  kput('hkBall',[x,yt+1.3,z],null,[.3,.26,.3],col2);
  // the peg ladder up the front to the port
  for(let y=PY+.9;y<H*.74+PY-.9;y+=.42){const q=hykLatheAt(L,Math.PI/2,y-PY+.1);kput('hkPost',[q.p[0]+q.n[0]*.12,q.p[1],q.p[2]+q.n[2]*.12],qEuler(Math.PI/2,0,0),[.045,.5,.045],bone);}
  // the spout into the store pod
  const sp=hykLatheAt(L,Math.PI/2,.5);hykPut('hkBone',hykTube([[sp.p[0],sp.p[1]+.2,sp.p[2]-.3],[sp.p[0],sp.p[1]+.1,sp.p[2]+.4],[sp.p[0],sp.p[1]-.25,sp.p[2]+.9]],t=>.2-.05*t,{seg:7,col:bone}));
  kput('hkBall',[sp.p[0],sp.p[1]-.25,sp.p[2]+.9],null,[.22,.2,.22],bone);});
 // the store pod, bedded into the pad in front of the silos, with the door and two windows
 const P={a:5.0,b:2.5,c:3.2,e1:.8,e2:.8,cy:PY+2.05,nu:56,nv:26,noise:{amp:.02,su:4,sv:3,seed:44},col,hollow:{t:.07,col:col2},
  openings:[{th:0,el:-.1,r:1.08,ky:1.08,kind:'door'},{th:Math.PI/2,el:.2,r:.45,kind:'window'},{th:-Math.PI/2,el:.2,r:.45,kind:'window'},{th:.6,el:.6,r:.32,kind:'window'}]};
 const pz=1.7;const pd=hykPod(P);pd.geo.translate(0,0,pz);hykPut('hkShell',pd.geo);pd.inner.translate(0,0,pz);hykPut('hkIn',pd.inner,true);
 let door=null;for(const op of pd.openings){op.p=[op.p[0],op.p[1],op.p[2]+pz];if(op.kind==='door'){door=op;hykDoor(op,{level:'ground',depth:.5});}else hykWin(op,{});}
 hykPut('hkShell',hykFlare([0,PY+.02,pz],[0,1,0],P.a*.9,.9,{col}));hykFloor(0,pz,PY+.06,P.a*.84,{});
 // the store room: the pod's floor, stores in a row at the back under the spouts, the tally desk by the door
 const poly=[];for(let i=0;i<16;i++){const a=i/16*TAU;const c=Math.cos(a),s=Math.sin(a);poly.push([P.a*.82*Math.sign(c)*Math.pow(Math.abs(c),.8),pz+P.c*.82*Math.sign(s)*Math.pow(Math.abs(s),.8)]);}
 const st=hykRoom('store',poly,PY+.06,P.b*1.5,{doors:[[door.p[0],door.p[2],2.2]],wealth:.5});
 for(const x of [-2.9,-1.3,1.3,2.9])hykSpot(st,'store',x,pz-.7+(Math.abs(x)>2?.3:0),0,1.2,.7);hykSpot(st,'work',0,pz+1.0,0,1.0,.7);
 hykReg('Granary',0,-.5,8.5,PY+8.9);}
HYK.def({key:'hyk_granary',name:'Granary',family:'industry',row:'Industry',w:16,d:14,h:10.2,inside:true,tags:{type:['industry'],wealth:'middle',lit:false},build:hykIndGranary});
// ---------------------------------------------------------------- the windmill: a sail-wheel of weed-cloth fins on bone spars, on a shell tower
// The wheel is the one moving part in the kit: it is built into its own group under the building's group and turned by
// hykIndTick every frame (window.YS_TICKS, run by the scene). Its meshes are tagged like the exterior shells so the
// Inside view hides them, and charged to the building's triangle tally.
const HYK_IND_WHEELS=[];const HYK_IND_TICK={on:false};
function hykIndTick(dt){dt=Math.min(.1,Math.max(0,dt||0));for(const w of HYK_IND_WHEELS)w.g.rotation.z=(w.g.rotation.z+dt*w.om)%TAU;}
function hykIndWindmill(G,o){reseed(30786+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone)),weed=hC(hPick(HPAL.weed));
 const H=13.5,rb=3.7,rt=2.3;
 const L={H,cx:0,cz:0,yBase:-.4,rFn:y=>rb+(rt-rb)*Math.pow(clamp(y/H,0,1),.85),nu:48,nv:28,flute:{n:11,amp:.06,sharp:1.5},twist:.08,rings:{n:14,amp:.02},noise:{amp:.025,su:5,sv:1.5,seed:51},col};
 const dr=hykLatheAt(L,Math.PI/2,1.3),w1=hykLatheAt(L,Math.PI/2+2.2,5.2),w2=hykLatheAt(L,Math.PI/2-2.0,8.4),w3=hykLatheAt(L,Math.PI/2+.9,10.8);
 const ops=[{p:dr.p,n:dr.n,r:1.1,ky:1.05,kind:'door'},{p:w1.p,n:w1.n,r:.45,kind:'window'},{p:w2.p,n:w2.n,r:.42,kind:'window'},{p:w3.p,n:w3.n,r:.4,kind:'window'}];L.ops=ops;
 hykPut('hkShell',hykLathe(L));hykPut('hkIn',hykLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*.9,flip:true,col:hC(hPick(HPAL.shellWarm),.85)})),true);
 hykPut('hkShell',hykFlare([0,-.3,0],[0,1,0],rb*.98,1.6,{col}));
 for(const op of ops){if(op.kind==='door')hykDoor(op,{level:'ground',depth:.6});else hykWin(op,{});}
 hykFloor(0,0,.05,rb*.86,{});
 // the cap: a dome seated in the tower's rim, a snout pod toward +z housing the axle, rooted into the dome
 const yt=L.yBase+H,DR=rt*1.12;
 hykPut('hkShell',hykLathe({H:2.4,cx:0,cz:0,yBase:yt-.3,rFn:y=>DR*Math.sqrt(Math.max(0,1-Math.pow(y/2.4,2.4)))+.06,nu:36,nv:12,rings:{n:3,amp:.025},col:col2}));
 kput('hkLip',[0,yt-.28,0],qEuler(Math.PI/2,0,0),[DR*1.02,DR*1.02,1.2],col2);
 const S={a:1.5,b:1.35,c:2.3,e1:.9,e2:.9,cy:yt+.75,nu:32,nv:18,noise:{amp:.025,su:3,sv:2,seed:52},col:col2};const sn=hykPod(S);sn.geo.translate(0,0,1.4);hykPut('hkShell',sn.geo);
 hykPut('hkShell',hykFlare([0,yt+.75,DR*.35],[0,0,1],1.3,.9,{col:col2}));
 kput('hkLens',[0,yt+2.4,0],null,.4,hC(hPick(HPAL.lens)));   // a lens at the crown lights the loft
 // the axle out of the snout, the hub, and the wheel
 const hy=yt+.78,hz=1.4+S.c+.55;
 hykPut('hkBone',hykTube([[0,hy,hz-2.6],[0,hy,hz]],t=>.26-.05*t,{seg:8,col:bone}));kput('hkBall',[0,hy,hz],null,[.62,.62,.55],bone);
 const wheel=new THREE.Group();wheel.position.set(0,hy,hz);wheel.rotation.z=rr(0,TAU);G.add(wheel);
 const geos={bone:[],weed:[]};const NS=6,RS=5.6;
 for(let i=0;i<NS;i++){const a=i/NS*TAU;const ux=Math.cos(a),uy=Math.sin(a),px=-uy,py=ux;
  const pts=[];for(let j=0;j<=10;j++){const t=j/10;const r=.3+t*(RS-.3);pts.push([ux*r,uy*r,.06*Math.sin(t*Math.PI)]);}
  geos.bone.push(hykTube(pts,t=>(.12-.06*t)*(1+.25*Math.max(0,Math.cos(t*6*TAU))),{seg:6,col:bone}));
  geos.weed.push(hykSurf((u,v)=>{const r=1.1+u*(RS-1.3);const w=(.35+.95*u)*(1-.18*u*u);const bil=.26*Math.sin(v*Math.PI)*Math.sin(u*Math.PI*.9+.15);return [ux*r+px*w*v,uy*r+py*w*v,-bil-.05];},8,5,{col:weed}));
  const hem=[];for(let j=0;j<=8;j++){const u=j/8;const r=1.1+u*(RS-1.3);const w=(.35+.95*u)*(1-.18*u*u);hem.push([ux*r+px*w,uy*r+py*w,-.05]);}geos.bone.push(hykTube(hem,()=>.035,{seg:4,col:bone}));
  geos.bone.push(hykTube([[ux*RS,uy*RS,0],[ux*RS*.98+px*(.35+.95)*(1-.18),uy*RS*.98+py*(.35+.95)*(1-.18),-.05]],()=>.035,{seg:4,col:bone}));}
 const ring=[];for(let i=0;i<=36;i++){const a=i/36*TAU;ring.push([Math.cos(a)*(RS-.1),Math.sin(a)*(RS-.1),0]);}geos.bone.push(hykTube(ring,()=>.05,{seg:5,col:bone}));
 for(const k of ['bone','weed']){const g=hykMerge(geos[k]);const m=new THREE.Mesh(g,k==='bone'?MAT.hkBone:MAT.hkWeed);m.userData.hyk='out';m.frustumCulled=false;wheel.add(m);
  if(typeof HYK_MESHES!=='undefined')HYK_MESHES.push(m);const ts=tcur();if(ts){ts.tris+=triOf(g);ts.meshes++;}}
 HYK_IND_WHEELS.push({g:wheel,om:.32+rr(-.05,.08)});
 if(!HYK_IND_TICK.on){HYK_IND_TICK.on=true;(window.YS_TICKS=window.YS_TICKS||[]).push(hykIndTick);}
 // the mill room on the ground floor: the stones' place, the sacks, the miller's bench
 const mr=hykRoom('workshop',hykCirclePoly(0,0,3.0,16),.05,4.5,{doors:[[dr.p[0],dr.p[2],2.2]],wealth:.5});
 hykSpot(mr,'tool',0,-1.3,0,.8,.5);hykSpot(mr,'store',-1.95,.3,Math.PI/2,1.2,.7);hykSpot(mr,'store',1.95,.3,Math.PI/2,1.2,.7);hykSpot(mr,'work',0,1.4,0,1.2,.7);
 hykReg('Windmill',0,0,7,hy+RS);}
HYK.def({key:'hyk_windmill',name:'Windmill',family:'industry',row:'Industry',w:14,d:14,h:19.6,inside:true,tags:{type:['industry'],wealth:'middle',lit:false},build:hykIndWindmill});
// ---------------------------------------------------------------- the generator: an Ancient machine reclaimed inside a grown shell housing
// A fluted drum with a domed lid grown round a salvaged core: the core's rusted shaft, rings, cage and base are the kit's
// own pieces (the other place salvage shows), seen through a great lipped aperture in the front. Cool humming lamps on
// brackets round the drum and on the core's rings; rusted conduits leave the back through fillets and go to ground; a
// workshop pod on the -x flank holds the keeper's bench and the building's door.
function hykIndGenerator(G,o){reseed(30790+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone)),crust=hC(hPick(HPAL.crust));
 const cx=1.6,cz=-1.0,rb=5.8,rt=4.9,H=6.0;
 const L={H,cx,cz,yBase:-.4,rFn:y=>rb+(rt-rb)*Math.pow(clamp(y/H,0,1),.8),nu:56,nv:22,flute:{n:14,amp:.045,sharp:1.6},rings:{n:7,amp:.02},noise:{amp:.025,su:5,sv:1.3,seed:61},col};
 const ap=hykLatheAt(L,Math.PI/2-.3,3.0),dr=hykLatheAt(L,Math.PI/2+1.0,1.3),w1=hykLatheAt(L,-Math.PI/2+.6,3.8),w2=hykLatheAt(L,-Math.PI/2-.7,3.4);
 const ops=[{p:ap.p,n:ap.n,r:2.15,ky:.9,kind:'mouth'},{p:dr.p,n:dr.n,r:1.1,ky:1.05,kind:'door'},{p:w1.p,n:w1.n,r:.42,kind:'window'},{p:w2.p,n:w2.n,r:.4,kind:'window'}];L.ops=ops;
 hykPut('hkShell',hykLathe(L));hykPut('hkIn',hykLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*.92,flip:true,col:hC(hPick(HPAL.shellWarm),.85)})),true);
 hykPut('hkShell',hykFlare([cx,-.3,cz],[0,1,0],rb*.98,1.7,{col}));
 for(const op of ops){if(op.kind==='door')hykDoor(op,{level:'ground',depth:.6});else if(op.kind==='mouth')hykWin(op,{open:true,depth:.55});else hykWin(op,{});}
 hykFloor(cx,cz,.05,rb*.88,{});
 // the domed lid, lipped, with a knob and a ring of lenses
 const yt=L.yBase+H;hykPut('hkShell',hykLathe({H:2.1,cx,cz,yBase:yt-.25,rFn:y=>(rt+.3)*Math.sqrt(Math.max(0,1-Math.pow(y/2.1,2.3)))+.08,nu:40,nv:12,rings:{n:3,amp:.03},col:col2}));
 kput('hkLip',[cx,yt-.22,cz],qEuler(Math.PI/2,0,0),[rt*1.06,rt*1.06,1.4],col2);kput('hkBall',[cx,yt+1.9,cz],null,[.42,.36,.42],col2);
 for(let i=0;i<8;i++){const a=i/8*TAU;const r=(rt+.3)*.8;kput('hkLens',[cx+r*Math.cos(a),yt+.85,cz+r*Math.sin(a)],null,.28,hC(hPick(HPAL.lens)));}
 // the core: the kit's rusted shaft, rings, cage posts and radial struts on a base block
 kput('pierR',[cx,.3,cz],null,[3.2,.6,3.2],null);kput('pipeR',[cx,2.9,cz],null,[1.25,5.0,1.25],null);kput('slab',[cx,5.45,cz],null,[1.7,.3,1.7],null);
 for(const y of [1.35,2.9,4.45])kput('ringR',[cx,y,cz],qEuler(Math.PI/2,0,0),[2.05,2.05,2.05],null);
 for(let i=0;i<8;i++){const a=(i+.5)/8*TAU;const c=Math.cos(a),s=Math.sin(a);kput('mullR',[cx+2.55*c,2.5,cz+2.55*s],null,[.26,4.4,.26],null);
  for(const y of [1.0,3.9])beam('strutR',[cx+.6*c,y,cz+.6*s],[cx+2.55*c,y,cz+2.55*s],.22,.18);}
 // the humming lamps: cool jars on brackets round the drum, two on the core's middle ring
 for(const th of [Math.PI/2-1.25,Math.PI/2+1.9,-Math.PI/2+1.2,-Math.PI/2-.2]){const q=hykLatheAt(L,th,4.3);hykLight(q.p[0]+q.n[0]*.45,q.p[1]+q.n[1]*.45+.1,q.p[2]+q.n[2]*.45,{r:.2,cool:true,bracket:q.p});}
 for(const a of [.4,Math.PI+.9]){const c=Math.cos(a),s=Math.sin(a);hykLight(cx+2.75*c,3.35,cz+2.75*s,{r:.18,cool:true,bracket:[cx+2.05*c,2.9,cz+2.05*s]});}
 // rusted conduits out of the back, through fillets in the shell, rooted into the ground under crust collars
 for(const th of [-Math.PI/2-.55,-Math.PI/2+.1,-Math.PI/2+.75]){const rs=L.rFn(1.6);const c=Math.cos(th),s=Math.sin(th);const A=[cx+rs*.75*c,2.3,cz+rs*.75*s],B=[cx+(rs+3.6)*c,-.7,cz+(rs+3.6)*s];
  beam('pipeR',A,B,.3,.3);const t=.25*rs/(3.6+.25*rs);const yx=2.3-3.0*t;const q=hykLatheAt(L,th,yx+.4);hykPut('hkShell',hykFlare(q.p,q.n,.36,.7,{col}));
  const tg=(2.3+.0)/3.0;hykPut('hkCrust',hykFlare([A[0]+(B[0]-A[0])*tg,.02,A[2]+(B[2]-A[2])*tg],[0,1,0],.36,.55,{col:crust}));}
 // the keeper's workshop pod on the -x flank, rooted into the ground and the drum
 const P={a:2.7,b:2.4,c:2.6,e1:.9,e2:.92,cy:2.05,nu:44,nv:24,noise:{amp:.028,su:4,sv:3,seed:63},col:col2,hollow:{t:.07,col:col2},
  openings:[{th:0,el:-.08,r:1.08,ky:1.06,kind:'door'},{th:-Math.PI/2,el:.15,r:.45,kind:'window'},{th:Math.PI,el:.45,r:.34,kind:'window'}]};
 const px=cx-rb-1.4,pz=cz+.2;const pd=hykPod(P);pd.geo.translate(px,0,pz);hykPut('hkShell',pd.geo);pd.inner.translate(px,0,pz);hykPut('hkIn',pd.inner,true);
 let pdoor=null;for(const op of pd.openings){op.p=[op.p[0]+px,op.p[1],op.p[2]+pz];if(op.kind==='door'){pdoor=op;hykDoor(op,{level:'ground',depth:.5});}else hykWin(op,{});}
 hykPut('hkShell',hykFlare([px,0,pz],[0,1,0],P.a*.96,1.1,{col:col2}));const ct=hykLatheAt(L,Math.PI,2.0);hykPut('hkShell',hykFlare(ct.p,ct.n,1.5,1.0,{col:col2}));
 hykFloor(px,pz,.08,P.a*.86,{});
 // rooms: the machine hall round the core, and the keeper's workshop
 const hall=hykRoom('workshop',hykCirclePoly(cx,cz,4.9,18),.05,H*.9,{doors:[[dr.p[0],dr.p[2],2.2]],wealth:.5});
 hykSpot(hall,'work',cx+3.9,cz-.6,Math.PI/2,1.2,.7);hykSpot(hall,'store',cx-1.0,cz-4.0,0,1.2,.7);hykSpot(hall,'tool',cx+2.2,cz+3.4,0,.8,.5);
 const ws=hykRoom('workshop',hykCirclePoly(px,pz,2.15,14),.08,P.b*1.3,{doors:[[pdoor.p[0],pdoor.p[2],2.2]],wealth:.5});
 hykSpot(ws,'work',px,pz-1.2,0,1.3,.7);hykSpot(ws,'store',px-1.3,pz+.4,Math.PI/2,1.2,.7);hykSpot(ws,'tool',px+1.3,pz+.3,Math.PI/2,.8,.5);
 hykReg('Generator',0,0,9.5,yt+2.3);}
HYK.def({key:'hyk_generator',name:'Generator',family:'industry',row:'Industry',w:18,d:16,h:8.2,inside:true,tags:{type:['industry','infrastructure'],wealth:'middle',lit:true},build:hykIndGenerator});
