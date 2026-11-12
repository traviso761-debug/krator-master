// ================================================================= STRONGBOW — the builder
// buildStrongbow draws the plan (8aw0) as the Ancients built it (d = 0) and as a thousand years have left it (d = 1: the plan with
// STRONGBOW.ruin's deltas). Everything placed is registered in core/tags first, then drawn from the record. The cliff, the Bow,
// the crown, the Nock and the stays are 8aw1's parts; the rest is here. Only the plain's trees and the scree's loose rubble come
// off the kit's reseed() stream.
const SB_SITE={};
function buildStrongbow(scene,gx,gz,d){reseed(9040+d);KOFF=[gx,0,gz];
 /* SB_TODAY (settlements/strongbow's page): the town is the settlement's (its rings on core/city), so the placeholder town here is left out */
 const sbTown=!(typeof SB_TODAY!=='undefined'&&SB_TODAY);
 const dd=d>0?1:0,P=STRONGBOW.plan({seed:1647}),F=P.frame,D=P.dim,RU=dd?STRONGBOW.ruin(P):null,G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const h=(a,b,c,e)=>STRONGBOW.h(1647,a,b,c,e),ST=dd?'ruined':'intact',W=a=>[a[0]+gx,a[1],a[2]+gz],LY=F.lipY;
 if(typeof camera!=='undefined'&&camera.far<30000){camera.far=30000;camera.updateProjectionMatrix();}
 if(typeof sky!=='undefined')sky.renderOrder=-1;
 // a morning sun from the east-north-east: the face looks south and Krator's noon sun stands in the north, so the face is in
 // shade but for the hull's east flank and the decks (the heliostats' reason)
 if(typeof sun!=='undefined')sun.position.set(1100,900,-260);
 // the lean: about the hinge at the crown's back, out (about x) and the roll (about z)
 let M=null;if(RU){const L=RU.lean,c=L.hinge;M=new THREE.Matrix4().makeTranslation(c[0],c[1],c[2]).multiply(new THREE.Matrix4().makeRotationZ(L.az*Math.PI/180))
  .multiply(new THREE.Matrix4().makeRotationX(L.ax*Math.PI/180)).multiply(new THREE.Matrix4().makeTranslation(-c[0],-c[1],-c[2]));}
 const Lst={};for(const k of ['res','glass','lglass','frab','teal','shade','white','whiteW','deck','pave','cut','pool','poolR','grass'])Lst[k]=[];
 const X={P,F,D,RU,dd,M,L:Lst,h};
 const gone=new Set(RU?RU.gone.concat(RU.spineGone,RU.nockGone):[]);

 // ---- core/tags: one record per placed thing, before anything is drawn --------------------------------------------
 {const T=KTAGS.strongbow||(KTAGS.strongbow=KTAGS.create({build:'ancients-strongbow'})),pre=(dd?'ruin':'intact')+'/';
  const B=T.add({id:pre+P.id,'class':'building',kind:'arcology',key:'ancients:strongbow',name:'Strongbow',at:[gx,F.FL,gz],r:600,h:P.stats.height,
   tags:{culture:'ancient',types:['dwelling-multi','civic','infrastructure','transport'],state:ST,landmark:true}});
  const part=(id,kind,at,o)=>T.child(B.id,Object.assign({'class':'part',kind,key:id,at:W(at)},o||{}));
  part(P.bow.id,'hull',[0,F.tip,F.back+F.d(.3)/2],{h:F.top-F.tip,tags:{role:'the tower',state:ST}});
  part(P.landing.id,'landing-pad',P.landing.at,{r:P.landing.r});
  part(P.crown.id,'deck',[0,P.crown.y1,F.back+F.d(0)/2],{tags:{role:'crown'}});
  part(P.mast.id,'mast',P.mast.foot,{h:P.mast.h});
  part(P.ramp.id,'ramp',P.ramp.pts[0].slice(0,3));
  for(const n of P.nock.parts)if(!gone.has(n.id))part(n.id,'deck',[(n.x0+n.x1)/2,P.nock.y,0],{tags:{role:'the Nock'}});
  if(RU)for(const q of RU.quiver.pieces)T.child(B.id,{'class':'feature',kind:'debris',key:q.id,at:W(q.at),name:'the fallen lower hull'});
  else part(P.quiver.id,'hull',[P.quiver.x,P.quiver.tip,P.quiver.back],{h:P.quiver.top-P.quiver.tip,tags:{role:'lower hull'}});
  for(const r of P.drums)if(!gone.has(r.id))part(r.id,'tower-segment',r.at,{r:r.r,h:r.h});
  for(const s of P.saucers)if(!gone.has(s.id))part(s.id,'deck',s.at,{r:s.r,tags:{role:'terrace'}});
  for(const r of P.rotors)if(!gone.has(r.terrace))T.child(B.id,{'class':'fixture',kind:'rotor',key:r.id,at:W(r.hub),r:r.r,tags:{state:ST}});
  for(const g of P.galleries)part(g.id,'gallery',[(g.x0+g.x1)/2,g.y0,0]);
  part(P.pad.id,'landing-pad',P.pad.at,{r:P.pad.r});if(P.spinePad&&!gone.has(P.spinePad.terrace))part(P.spinePad.id,'landing-pad',P.spinePad.at,{r:P.spinePad.r});
  part(P.rim.id,'gallery',[(P.rim.x0+P.rim.x1)/2,P.rim.y0,(P.rim.z0+P.rim.z1)/2],{tags:{role:'rim gallery'}});
  part(P.term.id,'terminus',[(P.term.x0+P.term.x1)/2,P.term.y0,(P.term.z0+P.term.z1)/2],{tags:{role:'the Rift line, station 11',state:ST}});
  {const Lb=P.foot.lobby;part(Lb.id,'lobby',Lb.at,{r:Lb.r,h:Lb.y1-Lb.y0,tags:{role:'the lobby round the foot of the Spine',state:ST}});
   for(const g of Lb.galleries)part(g.id,'gallery',[Lb.at[0],g.y,Lb.at[2]],{r:g.r1,tags:{role:'a gallery of the lobby'}});
   part(Lb.stair.id,'stair',Lb.at,{h:Lb.y1-Lb.y0});
   for(const w of P.foot.wings)part(w.id,'wing',[(w.x0+w.x1)/2,w.y0,(w.z0+w.z1)/2],{h:w.y1-w.y0,tags:{role:w.role}});
   part(P.foot.plaza.id,'plaza',[(P.foot.plaza.x0+P.foot.plaza.x1)/2,P.foot.plaza.y,(P.foot.plaza.z0+P.foot.plaza.z1)/2]);}
  for(const l of P.lifts)part(l.id,'lift',[l.x,l.y0,P.spine.nodes[P.spine.nodes.length-1][2]],{h:l.y1-l.y0,tags:{role:'in the Spine'}});
  T.child(B.id,{'class':'infrastructure',kind:'guideway',key:P.line.id,at:W(P.line.pts[0])});
  T.child(B.id,{'class':'infrastructure',kind:'road',key:P.road.id,at:W(P.road.pts[0])});
  for(const s of P.stays)if(!gone.has(s.id))T.child(B.id,{'class':'fixture',kind:'stay',key:s.id,at:W(s.a==='mast'?P.mast.head:s.a),tags:{role:s.fan}});
  for(const m of P.helio)T.child(B.id,{'class':'fixture',kind:'heliostat',key:m.id,at:W(m.at),tags:{state:ST}});
  if(RU){const Tn={culture:'xanadu',state:'reclaimed'};
   if(sbTown)for(const hs of RU.town.houses)T.child(B.id,{'class':'building',kind:'house',key:hs.id,at:W(hs.at),tags:Object.assign({types:['dwelling']},Tn)});
   if(sbTown)T.child(B.id,{'class':'building',kind:'caravanserai',key:RU.town.han.id,name:'the han',at:W(RU.town.han.at),tags:Object.assign({types:['inn','market']},Tn)});
   if(sbTown)T.child(B.id,{'class':'building',kind:'watchtower',key:RU.town.tower.id,name:'the garrison',at:W(RU.town.tower.at),tags:Object.assign({types:['military']},Tn)});
   T.child(B.id,{'class':'building',kind:'monastery',key:RU.order.id,name:"the Order's sealed house",at:W([0,P.crown.y1,F.back+40]),tags:{culture:'order',state:'reclaimed',types:['civic']}});
   for(const b of RU.order.banners)T.child(B.id,{'class':'fixture',kind:'banner',key:b.id,at:W(b.at),tags:{culture:'order'}});}}

 REGISTER({name:'Strongbow ('+STATE(d)+')',x:0,z:0,r:620,y:F.FL,h:P.stats.height});
 REGISTER({name:'Strongbow — the tower',x:0,z:F.back+F.d(.3)/2,r:F.w(0),y:F.tip,h:F.top-F.tip});
 REGISTER({name:'Strongbow — the crown and the mast',x:0,z:F.back+40,r:110,y:F.top,h:P.mast.head[1]-F.top});
 REGISTER({name:'Strongbow — the Nock',x:0,z:P.nock.zc/2,r:P.nock.wx,y:P.nock.y-P.nock.th,h:P.nock.th+2});
 {const st=P.drums.filter(r=>!gone.has(r.id)),xs=st.map(r=>r.at[0]),zs=st.map(r=>r.at[2]),y0=Math.min(...st.map(r=>r.at[1])),y1=Math.max(...st.map(r=>r.at[1]+r.h));
  const cx=(Math.min(...xs)+Math.max(...xs))/2,cz=(Math.min(...zs)+Math.max(...zs))/2;
  REGISTER({name:'Strongbow — the Spine',x:cx,z:cz,r:D.SPINE.r+Math.hypot(Math.max(...xs)-cx,Math.max(...zs)-cz)+30,y:y0,h:y1-y0});}
 REGISTER({name:'Strongbow — the terminus hall (station 11)',x:(P.term.x0+P.term.x1)/2,z:(P.term.z0+P.term.z1)/2,r:(P.term.x1-P.term.x0)/2,y:P.term.y0,h:P.term.y1-P.term.y0});
 {const Lb=P.foot.lobby;REGISTER({name:'Strongbow — the lobby',x:Lb.at[0],z:Lb.at[2],r:Lb.r+2,y:Lb.y0,h:Lb.y1-Lb.y0+2});
  for(const w of P.foot.wings)REGISTER({name:'Strongbow — the foot: '+w.role,x:(w.x0+w.x1)/2,z:(w.z0+w.z1)/2,r:Math.hypot(w.x1-w.x0,w.z1-w.z0)/2,y:w.y0,h:w.y1-w.y0});}
 if(RU)REGISTER({name:'Strongbow — the town at the foot',x:-40,z:220,r:360,y:F.FL,h:40});

 // ---- the cliff, the Bow, the crown, the Nock, the stays (8aw1) ---------------------------------------------------
 sbCliff(X,G);sbBow(X);sbCrown(X);sbNock(X);sbStays(X);
 /* the rubble heaps (core/terrain KRUBBLE); hy(x, z) is their surface, so what lies in them lies on it */
 const HEAPS=sbHeaps(X,G),hy=(x,z)=>HEAPS.length?KRUBBLE.at(HEAPS,x,z):-Infinity;

 // ---- the lower hull: hung on the face west of the bay; in the ruin three pieces in the scree -----------------------
 {const Q=P.quiver,n=Math.max(8,Math.round((Q.top-Q.tip)/D.STO)),wq=t=>Q.W/2*Math.pow(Math.max(0,1-t),.55),dq=t=>Q.D*(1+.3*Math.sin(.9*Math.PI*t))*Math.pow(Math.max(0,1-t),.4);
  const qp=(t,s,u)=>[Q.x+s*wq(t)*Math.pow(1-u,.85),lerp(Q.top,Q.tip,t),Q.back+dq(t)*Math.sin(u*Math.PI/2)];
  const loft=(t0,t1)=>{const gs=[];for(const s of [-1,1])gs.push(['res',gridSurface((u,v)=>qp(lerp(t0,t1,v),s,u),8,Math.max(2,Math.round(n*(t1-t0))),{uS:4,vS:(Q.top-Q.tip)*(t1-t0)/25.6})]);
   gs.push(['white',gridSurface((u,v)=>{const t=lerp(t0,t1,v),q=qp(t,1,1);return[q[0],q[1],q[2]+4*u];},1,12,{uS:1,vS:8})]);
   if(t0<=0)gs.push(['deck',gridSurface((u,v)=>{const s=u<.5?-1:1,q=qp(0,s,u<.5?u*2:2-u*2);return[lerp(Q.x,q[0],v),Q.top,lerp(Q.back+dq(0)*.3,q[2],v)];},24,2,{uS:8,vS:2})]);
   return gs;};
  if(!RU)for(const [k,g] of loft(0,1))Lst[k].push(g);
  else for(const pc of RU.quiver.pieces){const t0=pc.i/3,t1=(pc.i+1)/3,mid=qp((t0+t1)/2,1,.3);
   const MQ=new THREE.Matrix4().makeTranslation(pc.at[0],Math.max(pc.at[1],hy(pc.at[0],pc.at[2])-wq((t0+t1)/2)*.5)+wq((t0+t1)/2)*.6,pc.at[2]).multiply(new THREE.Matrix4().makeRotationY(pc.ry))
    .multiply(new THREE.Matrix4().makeRotationZ(Math.PI/2+pc.tilt*.3)).multiply(new THREE.Matrix4().makeRotationX(pc.roll))
    .multiply(new THREE.Matrix4().makeTranslation(-mid[0],-mid[1],-mid[2]));
   for(const [k,g] of loft(t0,t1)){g.applyMatrix4(MQ);Lst[k].push(g);}
  }}

 // ---- the Spine: drums on necks down from the keel, a terrace at every turn, struts to the bay's walls, the rotors, the pad ----
 {const SP=D.SPINE,col0=dd?'whiteW':'white',above=new Map();
  for(let i=1;i<P.drums.length;i++)above.set(P.drums[i].id,P.drums[i-1]);
  for(const r of P.drums){if(gone.has(r.id))continue;const c=r.at,y0=c[1],y1=y0+r.h;
   Lst.res.push(SBG.cyl(c,r.r,y0+2.5,y1-2.5));
   for(const yy of [y0,y1-2.5])Lst[col0].push(SBG.cyl(c,r.r+1.4,yy,yy+2.5));
   Lst[col0].push(SBG.disc(c,0,r.r+1.4,y1),SBG.disc(c,0,r.r+1.4,y0));
   // the neck up to the drum (or terrace, or keel) above: where the run steps out it leans across
   const up=above.get(r.id),ty=up?up.at[1]:F.tip;
   if(ty>y1+.5&&!(up&&gone.has(up.id))&&!(!up&&dd)){const a=[c[0],y1,c[2]],b=up?[up.at[0],ty,up.at[2]]:SBG.tp(X,[c[0],ty,c[2]]);
    Lst[col0].push(gridSurface((u,v)=>{const th=u*TAU;return[lerp(a[0],b[0],v)+r.nr*Math.cos(th),lerp(a[1],b[1],v),lerp(a[2],b[2],v)+r.nr*Math.sin(th)];},20,1,{uS:4,vS:1}));}
   /* the break: the Spine's broken head is a rubble heap on the highest standing drum (RU.heaps) */}
  for(const t of P.spine.terraces)if(!gone.has(t.id)&&t.struts)for(const st of t.struts)beam('acBox',st.a,st.b,4,5,new THREE.Color(dd?0x8e887a:0xe6e0d2));
  // the town's lamps in the Spine's lower drums
  if(RU)for(const id of RU.lit){const r=P.drums.find(q=>q.id===id);for(let j=0;j<14;j++){if(h(505,r.run,r.i,j)>.4)continue;const a=-Math.PI*(j+.5)/14,
   y=r.at[1]+3.5+3.66*Math.floor(h(506,r.run,r.i,j)*Math.max(1,Math.floor(r.h/3.66)-1));
   kput('acPane',[r.at[0]+Math.cos(a)*(r.r+.4),y,r.at[2]-Math.sin(a)*(r.r+.4)],qFacing([Math.cos(a),0,-Math.sin(a)]),[4,2,1],new THREE.Color(0xffb862).multiplyScalar(.9));}}
  for(const s of P.saucers){if(gone.has(s.id))continue;const c=s.at,y=c[1],r0=SP.r+1,col=col0;
   Lst[col].push(gridSurface((u,v)=>{const a=u*TAU,r=lerp(r0,s.r,v);return[c[0]+r*Math.cos(a),y-7*(1-v*v),c[2]+r*Math.sin(a)];},40,6,{uS:20,vS:4}));
   Lst[col].push(SBG.cyl(c,s.r,y,y+1.6,40));
   Lst.grass.push(SBG.disc(c,s.r-9,s.r-.5,y+1.6,40));Lst.deck.push(SBG.disc(c,r0,s.r-9,y+1.6,40));
   Lst.res.push(SBG.cyl(c,s.r-12,y+1.6,y+8,40));Lst[col].push(SBG.disc(c,r0,s.r-8,y+8.4,40));}
  for(const ro of P.rotors){if(gone.has(ro.terrace))continue;const rs=RU?RU.rotors.find(q=>q.id===ro.id):null,col=new THREE.Color(dd?0x9a9486:0xece6d8);
   beam('acBox',ro.at,ro.hub,4,4,col);kput('sbCyl',[ro.hub[0],ro.hub[1],ro.hub[2]+3],qEuler(Math.PI/2,0,0),[3.4,14,3.4],col);
   kput('finial',[ro.hub[0],ro.hub[1],ro.hub[2]+11],null,[2.6,2.6,2.6],col);
   for(let b=0;b<ro.blades;b++){const a=ro.ph+b*TAU/ro.blades,len=rs&&rs.blades===0?5:ro.r,hb=[ro.hub[0],ro.hub[1],ro.hub[2]+10];
    beam('acBox',hb,[hb[0]+Math.cos(a)*len,hb[1]+Math.sin(a)*len,hb[2]],len>6?4.5:3,1.2,col);}}
  if(P.spinePad&&!gone.has(P.spinePad.terrace)){const pd=P.spinePad,dr=P.spine.terraces.find(t=>t.id===pd.terrace);
   Lst.pave.push(SBG.disc(pd.at,0,pd.r,pd.at[1]+.3,40));Lst[dd?'whiteW':'white'].push(SBG.cyl(pd.at,pd.r,pd.at[1]-3,pd.at[1]+.3,40));
   for(const o of [-1,1])beam('acBox',[dr.at[0]+o*dr.r*.5,dr.at[1]-6,dr.at[2]+dr.r*.8],[pd.at[0]+o*pd.r*.5,pd.at[1]-3,pd.at[2]],3,3,new THREE.Color(dd?0x8e887a:0xe0dacc));
   kput('strip',[pd.at[0],pd.at[1]+.5,pd.at[2]],null,[pd.r*1.4,2,6],CYAN);}}

 // ---- the galleries: curved glazed fronts on the face, white lips above and below --------------------------------
 for(const g of P.galleries){const xa=Math.min(g.x0,g.x1),xb=Math.max(g.x0,g.x1),ym=(g.y0+g.y1)/2,fz=(x,u)=>F.faceZ(x,ym)+4+8*Math.sin(Math.PI*u);
  Lst.res.push(gridSurface((u,v)=>{const x=lerp(xa,xb,u);return[x,lerp(g.y0,g.y1,v),fz(x,u)];},16,1,{uS:(xb-xa)/25.6,vS:(g.y1-g.y0)/25.6}));
  for(const [y,k] of [[g.y0,0],[g.y1,1]])Lst[dd?'whiteW':'white'].push(gridSurface((u,v)=>{const x=lerp(xa,xb,u);return[x,y+(k?.0:-1.4)+1.4*k,lerp(F.faceZ(x,y)-3,fz(x,u)+3,v)];},16,1,{uS:10,vS:1}),
   gridSurface((u,v)=>{const x=lerp(xa,xb,u);return[x,y-1.4+2.8*v,fz(x,u)+3];},16,1,{uS:10,vS:1}));}

 // ---- the plateau: the pad and its craft, the rim gallery, the heliostats -----------------------------------------
 {const pd=P.pad,col=dd?'whiteW':'white';Lst.pave.push(SBG.disc(pd.at,0,pd.r,pd.at[1]+.6,48));Lst[col].push(SBG.cyl(pd.at,pd.r,pd.at[1]-4,pd.at[1]+.6,48));
  kput('strip',[pd.at[0],pd.at[1]+.9,pd.at[2]],null,[pd.r*1.5,2,6],CYAN);kput('strip',[pd.at[0],pd.at[1]+.9,pd.at[2]],qEuler(0,Math.PI/2,0),[pd.r*1.5,2,6],CYAN);
  const cc=new THREE.Color(dd?0x9a8a74:0xf2ece0),ch=pd.craft.h;
  {kput('sbCraft',[pd.at[0],pd.at[1]+.6,pd.at[2]],qEuler(dd?.08:0,0,dd?.05:0),[7,ch,7],cc);
   for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;kput('acBox',[pd.at[0]+Math.cos(a)*7,pd.at[1]+7,pd.at[2]+Math.sin(a)*7],qEuler(0,-a,0),[9,14,.8],new THREE.Color(dd?0x6a5a48:0x3a6a9a));}}
  const R=P.rim;Lst.res.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),lerp(R.y0,R.y1,v),R.z1],40,1,{uS:(R.x1-R.x0)/25.6,vS:(R.y1-R.y0)/25.6}));
  Lst[col].push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),lerp(R.y0,R.y1+1.5,v),R.z0],20,1,{uS:30,vS:2}));
  for(const x of [R.x0,R.x1])Lst[col].push(gridSurface((u,v)=>[x,lerp(R.y0,R.y1+1.5,v),lerp(R.z0,R.z1,u)],2,1,{uS:2,vS:2}));
  Lst.deck.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),R.y1,lerp(R.z0,R.z1,v)],40,2,{uS:(R.x1-R.x0)/14,vS:3}));
  Lst[col].push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),R.y1+lerp(0,1.5,v),R.z1+.2],40,1,{uS:30,vS:1}));
  const hs=new Map(RU?RU.helio.map(q=>[q.id,q]):[]),HL=D.HELIO;
  for(const m of P.helio){const q=hs.get(m.id),pc=new THREE.Color(dd?0x6e6a62:0xbdb6a8);
   if(q&&q.fallen){kput('sbMirror',[m.at[0],m.at[1]-m.post+.4,m.at[2]+2],qEuler(Math.PI/2,0,q.tilt),[HL.w*.8,HL.h*.8,.2],new THREE.Color(0x8a9298));
    kput('sbCyl',[m.at[0],m.at[1]-m.post*.75,m.at[2]],null,[.22,m.post*.5,.22],pc);continue;}
   let n=m.n;if(q)n=[n[0]+q.tilt*.5,n[1],n[2]-q.tilt*.3];const nl=Math.hypot(n[0],n[1],n[2]);n=[n[0]/nl,n[1]/nl,n[2]/nl];
   const t=[n[2],0,-n[0]],tl=Math.hypot(t[0],t[2])||1,tx=[t[0]/tl,0,t[2]/tl],ty=[n[1]*tx[2]-n[2]*tx[1],n[2]*tx[0]-n[0]*tx[2],n[0]*tx[1]-n[1]*tx[0]];
   const Q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...tx),new THREE.Vector3(...ty),new THREE.Vector3(...n)));
   kput('sbMirror',m.at,Q,[HL.w,HL.h,.22],dd?new THREE.Color(0xa8b0b4):new THREE.Color(0xe6eef2));
   kput('sbCyl',[m.at[0],m.at[1]-m.post/2,m.at[2]],null,[.22,m.post,.22],pc);}}

 // ---- the foot: the lobby, the terminus hall, the wings, the plaza (8aw3); the guideway and the road ------------------------
 sbFoot(X);
 {const col=dd?'whiteW':'white';
  /* the lifts run up inside the Spine (P.lifts): nothing of them shows outside */
  Lst[col].push(SBG.ribbon(P.line.pts.map(p=>[p[0],p[1]+1.6,p[2]]),P.line.w,0));
  for(const s of [-1,1])Lst[col].push(gridSurface((u,v)=>{const n=P.line.pts.length-1,f=u*n,i=Math.min(n-1,Math.floor(f)),q=f-i,a=P.line.pts[i],b=P.line.pts[i+1];
   const dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz);return[lerp(a[0],b[0],q)-dz/l*s*P.line.w/2,lerp(F.FL,F.FL+1.6,v),lerp(a[2],b[2],q)+dx/l*s*P.line.w/2];},n3(P.line.pts),1,{uS:40,vS:1}));
  for(let i=1;i<P.line.pts.length;i++)beam('acBox',[P.line.pts[i-1][0],F.FL+2.2,P.line.pts[i-1][2]],[P.line.pts[i][0],F.FL+2.2,P.line.pts[i][2]],1.4,1.2,new THREE.Color(dd?0x6a665e:0xb8b2a4));
  Lst.shade.push(SBG.ribbon(P.road.pts,P.road.w,.12));}
 function n3(p){return Math.max(2,(p.length-1)*8);}

 // ---- as built: people on the decks; in the ruin, the town at the foot and the Order above -------------------------
 if(!dd){for(let i=0;i<60;i++){const s=h(480,i)<.5?-1:1,x=s*(D.BAY.w/2+20+100*h(481,i)),z=8+30*h(482,i),y=P.nock.y;
   kput('figB',[x,y,z],qEuler(0,h(483,i)*6.28,0),1,new THREE.Color().setHSL(h(484,i)*.1,.35,.4));kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));}}
 else{const XC=[0xebe4d4,0xdcb67e,0xc6805e,0xe8e0cc],TR=[0x9a2a1e,0xc89a3a,0x3a5a8a,0x7a3a5a],tw=RU.town;
  for(const hs of (sbTown?tw.houses:[])){const s=hs.size,c=hs.at,q=qEuler(0,hs.ry,0);
   kput('acBox',[c[0],c[1]+s[1]/2,c[2]],q,s,new THREE.Color(XC[hs.colour]));
   kput('acBox',[c[0],c[1]+s[1]+.35,c[2]],q,[s[0]+.6,.7,s[2]+.6],new THREE.Color(TR[(hs.colour+1)%4]));
   kput('acBox',[c[0]+Math.sin(hs.ry)*0,c[1]+1.2,c[2]+s[2]/2+.05],q,[1.4,2.4,.2],new THREE.Color(0x5a3a24));}
  if(sbTown){const H=tw.han,c=H.at;for(const [ox,oz,w,dp] of [[0,-H.d/2+4,H.w,8],[0,H.d/2-4,H.w,8],[-H.w/2+4,0,8,H.d-16],[H.w/2-4,0,8,H.d-16]]){
    kput('acBox',[c[0]+ox,c[1]+3.6,c[2]+oz],null,[w,7.2,dp],new THREE.Color(0xe6dcc6));kput('acBox',[c[0]+ox,c[1]+7.5,c[2]+oz],null,[w+.6,.6,dp+.6],new THREE.Color(0x9a2a1e));}
   kput('acBox',[c[0],c[1]+5,c[2]+H.d/2+.5],null,[10,10,2],new THREE.Color(0xc89a3a));
   for(let i=0;i<10;i++)kput('figB',[c[0]+(h(490,i)-.5)*H.w*.6,c[1],c[2]+(h(491,i)-.5)*H.d*.5],qEuler(Math.PI/2,h(492,i)*6,0),[2.2,1.6,2.2],new THREE.Color(0x6a4a2e));}
  if(sbTown){const T=tw.tower,c=T.at;kput('acBox',[c[0],c[1]+T.h/2,c[2]],null,[T.w,T.h,T.w],new THREE.Color(0xe2d8c2));
   for(let i=0;i<4;i++){const a=i*Math.PI/2;kput('acBox',[c[0]+Math.cos(a)*T.w*.4,c[1]+T.h+1.4,c[2]+Math.sin(a)*T.w*.4],null,[3,2.8,3],new THREE.Color(0x9a2a1e));}
   kput('acBox',[c[0],c[1]+T.h+7,c[2]],null,[.4,12,.4],new THREE.Color(0x5a4630));kput('acBox',[c[0]+2.2,c[1]+T.h+11,c[2]],null,[4.4,2.6,.1],new THREE.Color(0xc8302a));}
  for(let i=0;i<(sbTown?120:0);i++){const x=(h(493,i)-.5)*700,z=60+280*h(494,i);if(F.scree(x,z)>14||(Math.abs(x)<160&&z<70))continue;
   kput('figB',[x,F.ground(x,z),z],qEuler(0,h(495,i)*6.28,0),1,new THREE.Color().setHSL(.02+.1*h(496,i),.45,.38));kput('figH',[x,F.ground(x,z),z],null,1,new THREE.Color(0xa87a56));}
  // lamps in the Bow's lowest storeys (the town's), and a few in the Order's house at the top
  if(M)KXF={m:M,q:new THREE.Quaternion().setFromRotationMatrix(M)};
  const lamp=(k,s,j)=>{const y=P.storeys[k].y0+1.6,t=F.t(y),u=(j+.5)/D.HULL.NSEG,q=F.flank(t,s,u),q2=F.flank(t,s,Math.min(1,u+.02)),tx=q2[0]-q[0],tz=q2[1]-q[1],l=Math.hypot(tx,tz)||1;
   kput('acPane',[q[0]+tz/l*s*.6,y,q[1]-tx/l*s*.6],qFacing([tz/l*s,0,-tx/l*s]),[5,2.2,1],new THREE.Color(0xffb862).multiplyScalar(.9));};
  for(const k of RU.order.lit)for(const s of [-1,1])for(let j=2;j<D.HULL.NSEG;j+=3)if(h(501,k,s+2,j)<.5)lamp(k,s,j);
  for(const b of RU.order.banners){kput('acBox',[b.at[0],b.at[1]+11,b.at[2]],null,[.5,22,.5],new THREE.Color(0x5a4630));kput('acBox',[b.at[0]+2.5,b.at[1]+15,b.at[2]],null,[5,12,.15],new THREE.Color(0xe0901a));}
  KXF=null;
  {const g=RU.order.gate.at;kput('acBox',[g[0],g[1]+2.6,g[2]],null,[16,5.2,1.2],new THREE.Color(0x7a5a34));kput('acBox',[g[0],g[1]+5.6,g[2]],null,[17,.8,1.6],new THREE.Color(0xe0901a));}
  // the fallen: the west Spine's drums, the east wing's slab
  for(const db of RU.debris){const yh=Math.max(db.at[1],hy(db.at[0],db.at[2]));if(db.kind==='drum'){
    /* a drum that fell 400 m does not lie whole: curved shards of its glazed wall (with a collar), tipped and half buried in its heap */
    for(let k=0;k<4;k++){const a0=h(520,k,Math.round(db.at[0]))*TAU,da=.7+.6*h(521,k,Math.round(db.at[2])),hh=6+9*h(522,k,Math.round(db.at[0])),rr=db.r*(.9+.15*h(523,k,1));
     const off=[(h(524,k,2)-.5)*db.r*1.4,0,(h(525,k,3)-.5)*db.r*1.1],ox=db.at[0]+off[0],oz=db.at[2]+off[2],oy=Math.max(db.at[1],hy(ox,oz))-1.5;
     const MS=new THREE.Matrix4().makeTranslation(ox,oy,oz).multiply(new THREE.Matrix4().makeRotationY(h(526,k,4)*TAU)).multiply(new THREE.Matrix4().makeRotationX((h(527,k,5)-.5)*1.6+Math.PI/2*(k%2)))
      .multiply(new THREE.Matrix4().makeTranslation(-rr*Math.cos(a0+da/2),-hh/2,-rr*Math.sin(a0+da/2)));
     const arc=(r0,list,uS)=>{const g=gridSurface((u,v)=>{const a=a0+da*u;return[r0*Math.cos(a),hh*v,r0*Math.sin(a)];},8,2,{uS:r0*da/25.6*uS,vS:hh/25.6*uS});g.applyMatrix4(MS);Lst[list].push(g);};
     arc(rr,'res',1);arc(rr-2,'frab',4);
     const gc=gridSurface((u,v)=>{const a=a0+da*u;return[(rr+1.2)*Math.cos(a),hh-2.2+2.2*v,(rr+1.2)*Math.sin(a)];},8,1,{uS:4,vS:1});gc.applyMatrix4(MS);Lst.whiteW.push(gc);}
   }
   else kput('acBox',[db.at[0],yh,db.at[2]],qEuler(db.roll*.4,db.ry,db.roll),db.size,new THREE.Color(0xa8a294));}
  // stains down the Bow's flanks and the face under the sockets
  for(let i=0;i<40;i++){const s=h(520,i)<.5?-1:1,y=F.tip+60+(F.top-F.tip-80)*h(521,i),t=F.t(y),u=.1+.8*h(522,i),q=F.flank(t,s,u);
   const p=SBG.tp(X,[q[0],y,q[1]+.4]);kput('stain',p,qFacing([s*.5,0,.8]),[6+8*h(523,i),30+40*h(524,i),1],null);}}

 // ---- the plain's trees and the scree's loose stones (the kit's stream) ---------------------------------------------
 for(let i=0;i<150;i++){const x=rr(-1080,1080),z=rr(150,900);if(dd&&Math.abs(x+40)<420&&z<400)continue;if(Math.abs(z-P.road.pts[0][2])<14||Math.abs(z-P.line.pts[0][2])<14)continue;
  const ht=rr(6,13),u=rng();kput('trunk',[x,F.FL,z],qEuler(0,u*6.28,0),[ht*.12,ht*.6,ht*.12],new THREE.Color().setHSL(.07,.3,.2));
  kput('leafCard',[x,F.FL+ht*.55,z],qEuler(0,u*6.28,0),[ht*.4,ht*.55,ht*.4],new THREE.Color().setHSL(.22+.08*u,.3,.2+.06*u));}
 for(let i=0;i<220;i++){const x=rr(-1080,1080),z=rr(0,135),y=F.ground(x,z);if(F.scree(x,z)<6)continue;
  kput('rubble',[x,y+.5,z],qEuler(rng()*3,rng()*3,0),[2+rng()*6,1.5+rng()*3,2+rng()*5],new THREE.Color().setHSL(.08,.08,.5+.15*rng()));}

 // ---- merge -----------------------------------------------------------------------------------------------------------
 const WW=typeof wornMaterial==='function'?wornMaterial():MAT.white;
 meshMerged(Lst.res,dd?MAT.acResR:MAT.acRes,G);
 meshMerged(Lst.glass,dd?MAT.sbPoolR:MAT.sbPool,G);
 meshMerged(Lst.frab,MAT.acBreak,G);
 meshMerged(Lst.teal,dd?MAT.sbTealR:MAT.sbTeal,G);
 meshMerged(Lst.shade,dd?MAT.acShadeR:MAT.acShade,G);
 meshMerged(Lst.white,MAT.white,G);
 meshMerged(Lst.whiteW,WW,G);
 meshMerged(Lst.deck,dd?MAT.acDeckR:MAT.acDeck,G);
 meshMerged(Lst.pave,dd?MAT.acPaveR:MAT.acPave,G);
 meshMerged(Lst.cut,dd?MAT.hillCutR:MAT.hillCut,G);
 meshMerged(Lst.pool,MAT.sbPool,G);
 meshMerged(Lst.poolR,MAT.sbPoolR,G);
 meshMerged(Lst.grass,dd?MAT.whGrassR:MAT.whGrass,G);
 meshMerged(Lst.lglass,dd?MAT.sbLobbyGlassR:MAT.sbLobbyGlass,G);
 SB_SITE[d]={x:gx,z:gz,d,lip:LY,floor:F.FL,top:F.top,tip:F.tip,back:F.back,prow:F.prowZ(0),bayW:D.BAY.w,
  nock:{y:P.nock.y,zc:P.nock.zc,wx:P.nock.wx},landing:P.landing.at,crown:{y:P.crown.y1},mast:{foot:P.mast.foot,head:X.mastHead},
  spine:P.spine.nodes,pad:P.pad.at,term:{z1:P.term.z1,y1:P.term.y1,x0:P.term.x0,x1:P.term.x1},lobby:{at:P.foot.lobby.at,r:P.foot.lobby.r,y1:P.foot.lobby.y1},plaza:{z1:P.foot.plaza.z1},
  quiver:{x:P.quiver.x,top:P.quiver.top,tip:P.quiver.tip},galleries:P.galleries.map(g=>({x:(g.x0+g.x1)/2,y:g.y0})),
  stats:P.stats,gone:RU?RU.gone.length:0,town:RU?RU.town.houses.length:0,tags:KTAGS.strongbow?KTAGS.strongbow.audit():null};
 KOFF=[0,0,0];return G;}
