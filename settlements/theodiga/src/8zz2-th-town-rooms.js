// ================================================================= THEODIGA TODAY — the town's interiors on the kit's cut-away
// T-town-7 (the owner, 2026-11-16: "Town interiors"). TH_TOWN_ROOMS (src/46-th-town-rooms.js, [G data]) plans every scrap building's
// rooms from the Scrap Xanadu interior set and furnishes each kind once; this host makes each QUARTER of the town a site of the
// Ancients kit's interiors pass (src/8zz-interiors.js AIK), beside the arcology's ten parts, so the select "Interior" opens a
// quarter: `[` `]` a storey, `x` closes it. Like the arcology's, the furniture is RECORDS at load (core/furnish, tagged in
// core/tags with every building and room) and drawn only when the quarter is opened; the rooms' walls and floors are drawn then
// too (this host's aikDraw for a town site: the plan's partitions and a lining inside the exterior walls, in the reclaimed
// Ancient panel, with their door and window openings; the floors in timber), as the town's own meshes ('theodiga:town ...',
// which core/ruins skips). The cut-away's clipping cuts the town's buildings as it cuts the dam.
// Furnished from one catalog adapter for every room (Xanadu, the Eastern Abyssal it chains to, Scrap, the generic goods), so the
// page's audit (kits/ancients verify.py interiors-audit) re-places each template room with the adapter that placed it.
// Loaded after 8zz1-th-arc-host.js (its name sorts after it), so the dam's split runs first; nothing without the bundle and the town.
if(typeof KratorAncientsInteriors!=='undefined'&&typeof TH_TOWN_ROOMS!=='undefined'&&typeof interiorPass==='function'&&typeof thTownDraw==='function'){
 (function(){const AI=KratorAncientsInteriors,ip=interiorPass,ad0=aikDraw;
  interiorPass=function(m,G){ip(m,G);if(!m||m.k!=='dam'||!thTownDraw.placed||!thTownDraw.placed.length)return;
   try{townSites(m);}catch(e){AIK.errors.push('the town\'s interiors: '+(e&&e.message||e));if(typeof reportErr==='function')reportErr('town interiors: '+(e&&e.stack||e));}};
  function townSites(m){const IX=KratorInteriors;
   const ALL=AI.cultureAdapter(AIK.adapter,['xanadu','eastabyss','scrap','generic','generic-goods']);
   const T=TH_TOWN_ROOMS.make({placed:thTownDraw.placed,IX,name:q=>'Theodiga, the town: '+((typeof THCITY!=='undefined'&&THCITY.town&&THCITY.town.QUARTER_NAME[q])||'below the rim'),
    /* a room whose program's required piece fits nowhere in it (the Panel Row's kitchens: 2.2 m wide with the stair in them,
       no hearth fits at any seed; the set's to fix, kits/ancients KNOWN_ISSUES) is furnished as a store, and says so */
    furnish:R=>{let p=IX.furnishRoom(R,ALL);
     if(p.report.required.some(q=>q.placed<q.n&&p.report.missing.some(m=>m.need===q.need&&m.reason==='no-fit'))){R.planned=R.kind;R.kind='store';p=IX.furnishRoom(R,ALL);AIK.townRekinded=(AIK.townRekinded||0)+1;}
     return p;}});
   AIK.townSkipped=T.skipped;AIK.townKinds=T.kinds;
   for(const S of T.sites){let rooms=0;
    const site={id:S.id,type:'town',d:0,state:'intact',name:S.name,gx:m.gx,gz:m.gz,plan:{buildings:S.buildings,furnish:true,type:'town',culture:'xanadu',state:'intact'},
     G:null,rooms:0,box:S.box,storeys:S.storeys,furniture:Object.assign(S.furniture,{adapter:ALL,catalog:AIK.adapter}),group:null,recs:[],town:S};
    /* core/tags: each building, then its rooms */
    for(const B of S.buildings){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of B.outer){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
     const top=Math.max(...B.storeys.map(st=>st.y+st.h)),y0=B.storeys[0].y;
     const brec=AIK.T.add({'class':'building',key:'town.'+B.id,name:'Theodiga — '+B.name,at:[m.gx+(x0+x1)/2,y0,m.gz+(z0+z1)/2],size:[x1-x0,z1-z0,top-y0],
      /* the culture xanadu, the scrap set's poor tier as its set (core/tags reads 'scrap' as a set, not a culture) */
      tags:Object.assign({culture:'xanadu',state:'intact',types:B.types},B.culture==='scrap'?{set:'scrap'}:{}),frag:'8zz2-th-town-rooms.js'});
     for(const st of B.storeys)for(const R of st.rooms){const n=R.poly.length,c=R.poly.reduce((s,p)=>[s[0]+p[0]/n,s[1]+p[1]/n],[0,0]);
      AIK.T.child(brec.id,{'class':'part',kind:'room',key:R.kind,name:R.id,at:[m.gx+c[0],R.y,m.gz+c[1]],tags:{room:R.kind,state:'intact',culture:brec.tags.culture},frag:'8zz2-th-town-rooms.js'});rooms++;}}
    site.rooms=rooms;
    /* the furniture's records (drawn on opening) */
    for(const r of S.furniture.rooms)for(const p of r.placements){const rec=AIK.F.place(p.key,m.gx+p.x,p.y,m.gz+p.z,p.ry,{v:p.variant|0,setting:'indoor',room:r.R.id},[p.x,p.y,p.z,p.ry],{building:'town.'+r.R.building,room:r.R.id});if(rec)site.recs.push(rec);}
    AIK.furnished++;AIK.pieces+=S.furniture.pieces;
    AIK.sites.push(site);AIK.byId[site.id]=site;}}
  /* the walls of one plan wall (partition or exterior), its openings left open: a box a run between them, under a window's sill
     and over every opening; an exterior wall as a lining 0.12 m thick inside the building's own wall */
  function wallGeos(W,geos,cx,cz){const dx=W.b[0]-W.a[0],dz=W.b[1]-W.a[1],L=Math.hypot(dx,dz);if(L<.05)return;
   const tx=dx/L,tz=dz/L;let nx=-tz,nz=tx;const ext=W.kind==='exterior',th=ext?.12:Math.max(.1,W.thick||.12);
   /* inward: toward the building's centre */
   const mx=(W.a[0]+W.b[0])/2,mz=(W.a[1]+W.b[1])/2;if((cx-mx)*nx+(cz-mz)*nz<0){nx=-nx;nz=-nz;}
   const off=ext?(W.thick||.4)/2+.08:0,ox=nx*off,oz=nz*off,ang=Math.atan2(-dz,dx);
   const piece=(u0,u1,y0,y1)=>{if(u1-u0<.04||y1-y0<.04)return;const u=(u0+u1)/2,g=new THREE.BoxGeometry(u1-u0,y1-y0,th);g.rotateY(ang);
    g.translate(W.a[0]+tx*u+ox,W.y+(y0+y1)/2,W.a[1]+tz*u+oz);geos.push(g.toNonIndexed());};
   const ops=W.openings.map(o=>({u0:Math.max(0,o.u-o.w/2),u1:Math.min(L,o.u+o.w/2),y0:o.y0||0,y1:o.y1==null?2.1:o.y1})).sort((a,b)=>a.u0-b.u0);
   let u=0;for(const o of ops){piece(u,o.u0,0,W.h);piece(o.u0,o.u1,0,o.y0);piece(o.u0,o.u1,o.y1,W.h);u=Math.max(u,o.u1);}
   piece(u,L,0,W.h);}
  aikDraw=function(site){if(!site.town)return ad0(site);if(site.group)return site.group;
   /* one quarter drawn at a time (a quarter's rooms are a million and more triangles): the last one opened is let go */
   for(const T of AIK.sites)if(T.town&&T.group&&T!==site){T.group.parent&&T.group.parent.remove(T.group);T.group.traverse(o=>{if(o.isMesh&&o.geometry)o.geometry.dispose();});T.group=null;}
   const g=new THREE.Group(),local=new THREE.Group();g.name='theodiga:town interiors: '+site.name;local.position.set(site.gx,0,site.gz);g.add(local);
   const walls=[],floors=[];
   for(const B of site.town.buildings){const n=B.outer.length,c=B.outer.reduce((s,p)=>[s[0]+p[0]/n,s[1]+p[1]/n],[0,0]);
    for(const W of B.walls)wallGeos(W,walls,c[0],c[1]);
    for(const F of B.floorPolys)try{floors.push(aikSlab(F.poly,F.y-.2,.2,F.holes&&F.holes[0]).toNonIndexed());}catch(e){}}
   const wm=meshMerged(walls,MAT.whiteWorn||MAT.white,local),fm=meshMerged(floors,MAT.timber||MAT.plank||MAT.concrete,local);
   for(const o of [wm,fm])if(o){o.name='theodiga:town interiors: '+(o===wm?'walls':'floors');o.userData.probeSkip=true;o.userData.lodSkip=true;}
   /* the furniture: its records into one batch */
   const Bt=KratorFurniture.batch({indexed:true});
   for(const r of site.recs)Bt.place(r.key,r.x,r.y,r.z,r.ry,{variant:r.variant,seed:r.seed,wealth:.5,building:r.building,setting:'indoor'});
   const fg=Bt.flush(scene);if(fg){fg.parent&&fg.parent.remove(fg);fg.traverse(o=>{if(o.isMesh){KFURN.linearColours(o.geometry);o.userData.probeSkip=true;}});g.add(fg);}
   scene.add(g);site.group=g;aikClipAll();return g;};})();}
