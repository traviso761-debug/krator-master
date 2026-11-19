// Old Town and the Burnside Bridge: the models for Portland's oldest blocks, by the west end of the Burnside Bridge.
//   burnside    the Burnside Bridge (1926): a double-leaf Strauss bascule between two Italian Renaissance operator
//               towers, steel deck trusses over the fixed river spans, concrete piers, the concrete arches of the
//               approaches over both banks, the lamp standards along its rails; fitted to the engine's own deck
//   castiron    a cast-iron Italianate front on the mapped building under L.at: pilasters, arched windows, a
//               storefront arcade, the belt courses and the bracketed cornice (the Skidmore, Blagen and Bickel
//               blocks, the New Market Theater, the Merchant Hotel, the Fleischner Block)
//   skidmore    the Skidmore Fountain (1888): two bronze caryatids holding up the bronze basin over the granite one
//   whitestag   the White Stag sign (1940) on the White Stag Building's roof, facing the bridge: the state of Oregon,
//               the leaping stag, PORTLAND OREGON, OLD TOWN; neon at night
//   market      the Saturday Market's stalls in the park and under the bridge's west end, in the daytime
//   maxstop     the MAX stop at Skidmore Fountain: two side platforms with their shelters
//   storefront  a shop's own front on a mapped building: Voodoo Doughnut's pink, with its sign
//   lanterns    red lanterns strung across a street (NW 4th Avenue through Chinatown), lit at night
//   alley       Ankeny Alley: the string lights across it and the tables under them
// and the extra oldtown, the people of Old Town (src/core/crowds.js, kept to Old Town), when the config has no crowds.
// Each model is handed (L,x,z) as the engine's own are (src/engine/stages/04-landmarks.js); L is its entry in
// data/cities/portland.json's landmarks.
import {hash3} from '../core/rng.js';
import {crowds} from '../core/crowds.js';

const BEAR=b=>{const a=(b||0)*Math.PI/180;return [Math.sin(a),-Math.cos(a)];};   // a compass bearing as a direction in x (east), z (south)

// a pile of meshes binned by material, merged into one mesh per material at the end
function pile(api){const {THREE,mergeParts}=api,bins=new Map();
  const put=(mat,geo,x,y,z,ry=0,rx=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz,'YXZ');let b=bins.get(mat);if(!b)bins.set(mat,b=[]);b.push(m);return m;};
  // a box with its foot at y
  const bx=(mat,x,y,z,w,h,d,ry=0)=>put(mat,new THREE.BoxGeometry(w,h,d).translate(0,h/2,0),x,y,z,ry);
  const bar=(mat,a,b,t)=>{const d=new THREE.Vector3().subVectors(b,a),len=d.length();if(len<0.01)return;const m=new THREE.Mesh(new THREE.BoxGeometry(t,t,len),mat);m.position.copy(a).add(b).multiplyScalar(0.5);m.lookAt(b);let q=bins.get(mat);if(!q)bins.set(mat,q=[]);q.push(m);};
  const done=()=>[...bins].map(([mat,ms])=>mergeParts(ms,mat));
  return {put,bx,bar,done};}

export function oldtown(api){
  const {THREE,ROADS,RAILS,animHooks,nightF,windowF,hour,group,gh,riverCrossing,buildingsAt,roadsNear,inPoly,inWater}=api;
  const M=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
  const night=()=>nightF(hour());
  // materials whose glow follows the hour: lamps and neon by the dark, windows by the windows' own curve
  const glowing=[];
  const glow=(c,lit,how)=>{const m=M(c,{emissive:0x000000});glowing.push([m,new THREE.Color(lit),how||'dark']);return m;};
  let lastF=-1;
  animHooks.push(()=>{const h=hour(),n=nightF(h),w=Math.min(1,windowF(h)*1.4),k=Math.round((n+w)*50);if(k===lastF)return;lastF=k;
    for(const [m,c,how] of glowing){const f=how==='win'?w:Math.min(1,n*1.6);m.emissive.copy(c).multiplyScalar(f);}});
  const glass=glow(0x24292e,0xffcf86,'win');

  // ---------- the Burnside Bridge ----------
  function burnside(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const ux=c.ux,uz=c.uz,ry=-Math.atan2(uz,ux);
    const at=(u,v)=>[c.x+ux*u-uz*v,c.z+uz*u+ux*v],U=(px,pz)=>(px-c.x)*ux+(pz-c.z)*uz,V=(px,pz)=>-(px-c.x)*uz+(pz-c.z)*ux;
    const mine=ROADS.filter(r=>r.name&&r.name.toLowerCase().startsWith(L.name.toLowerCase())&&r.ys);if(!mine.length)return null;
    // the deck's height along the axis, from the engine's own deck (02-ground.js: r.ys), and its half width
    const prof=new Map();let W2=0,leaf0=1e9,leaf1=-1e9;
    for(const r of mine)for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx2,bz]=r.pts[i+1],len=Math.hypot(bx2-ax,bz-az);
      for(let s=0;s<=len;s+=1.5){const t=len?s/len:0,px=ax+(bx2-ax)*t,pz=az+(bz-az)*t,y=r.ys[i]+(r.ys[i+1]-r.ys[i])*t,u=Math.round(U(px,pz)),v=V(px,pz);
        if(Math.abs(v)>20)continue;W2=Math.max(W2,Math.abs(v)+(r.w+(r.c==='trail'?1:4))/2);
        if(r.c!=='trail'){prof.set(u,Math.max(prof.get(u)||0,y));if(r.bridge===2){leaf0=Math.min(leaf0,u);leaf1=Math.max(leaf1,u);}}}}
    W2=Math.max(10,Math.min(18,W2));
    const us=[...prof.keys()].sort((a,b)=>a-b),U0=us[0],U1=us[us.length-1],D=new Float32Array(U1-U0+1);
    {let pu=U0,py=prof.get(U0);for(const u of us){const y=prof.get(u);for(let k=pu;k<=u;k++)D[k-U0]=u===pu?y:py+(y-py)*(k-pu)/(u-pu);pu=u;py=y;}}
    const deckY=u=>D[Math.max(0,Math.min(D.length-1,Math.round(u)-U0))],TH=2.4;
    if(!(leaf1>leaf0)){const h=(L.leaf||76)/2;leaf0=-h;leaf1=h;}
    const lc=(leaf0+leaf1)/2,uW=-c.half,uE=c.half;
    const P=pile(api),con=M(0xcfc6b4),conD=M(0xb3aa98),steel=M(0x6c7676),stucco=M(0xe2d6bc),tile=M(0xa4563a),trim=M(0xc4b494),iron=M(0x2e3134),
      globe=glow(0xe8e4d8,0xfff0c8),win=glow(0x2a2c30,0xffd890),lamp=glow(0x8a8a80,0xfff2d0);
    const sea=u=>{const [px,pz]=at(u,0);return Math.min(0,gh(px,pz))-2;};
    // the bascule piers (each holds a leaf's heel and its counterweight pit) and the fixed spans' piers
    const PB=L.pierLen||16;
    const bigPier=(u0,u1)=>{const um=(u0+u1)/2,[px,pz]=at(um,0),top=Math.min(deckY(u0),deckY(u1))-TH,foot=sea(um),wv=W2*2+10;
      P.bx(con,px,foot,pz,u1-u0,top-foot,wv,ry);
      for(const s of [-1,1]){const [qx,qz]=at(um,s*wv/2);P.put(con,new THREE.CylinderGeometry((u1-u0)/2,(u1-u0)/2,top-2-foot,20).translate(0,(top-2-foot)/2,0),qx,foot,qz);}
      P.bx(conD,px,top-1.2,pz,u1-u0+1,1.2,wv+1,ry);
      // the panels and the string course on its faces
      for(const s of [-1,1]){const [qx,qz]=at(um,s*(wv/2+0.15));P.bx(conD,qx,top-5,qz,u1-u0-3,0.5,0.3,ry);}
      // out beyond the rails the pier comes up to the road as a balcony round the tower, with its balustrade
      const yd=Math.min(deckY(u0),deckY(u1)),bw=wv/2-W2;
      for(const s of [-1,1]){const [bx2,bz]=at(um,s*(W2+bw/2));P.bx(con,bx2,top,bz,u1-u0,yd-0.2-top,bw,ry);
        const [ox,oz]=at(um,s*(wv/2-0.3));P.bx(conD,ox,yd-0.2,oz,u1-u0,1.1,0.5,ry);
        for(const e of [u0+0.3,u1-0.3]){const [ex,ez]=at(e,s*(W2+bw/2));P.bx(conD,ex,yd-0.2,ez,0.5,1.1,bw,ry);}}};
    bigPier(leaf0-PB,leaf0+1);bigPier(leaf1-1,leaf1+PB);
    const smallPier=u=>{const [px,pz]=at(u,0),top=deckY(u)-TH-(L.truss||7),foot=sea(u);
      P.bx(con,px,foot,pz,5,top-foot,W2*2+3,ry);P.bx(conD,px,top-0.8,pz,6,0.8,W2*2+4,ry);
      for(const s of [-1,1]){const [qx,qz]=at(u,s*(W2+1.5));P.put(con,new THREE.CylinderGeometry(2.5,2.5,top-1-foot,14).translate(0,(top-1-foot)/2,0),qx,foot,qz);}};
    const pW=uW+3,pE=uE-3;smallPier(pW);smallPier(pE);
    // the fixed spans: two Warren deck trusses under the deck, braced across at each panel point
    const truss=(u0,u1)=>{const n=Math.max(4,Math.round((u1-u0)/9)),TD=L.truss||7;
      for(const s of [-1,1]){const v=s*(W2-3);let pt=null,pb=null;
        for(let k=0;k<=n;k++){const u=u0+(u1-u0)*k/n,yt=deckY(u)-TH,[px,pz]=at(u,v),top=new THREE.Vector3(px,yt,pz),bot=new THREE.Vector3(px,yt-TD,pz);
          if(pt){P.bar(steel,pt,top,0.9);P.bar(steel,pb,bot,0.9);P.bar(steel,k%2?pt:pb,k%2?bot:top,0.55);}
          P.bar(steel,top,bot,0.5);pt=top;pb=bot;}}
      for(let k=0;k<=n;k++){const u=u0+(u1-u0)*k/n,yt=deckY(u)-TH,[ax,az]=at(u,-(W2-3)),[bx2,bz]=at(u,W2-3);
        P.bar(steel,new THREE.Vector3(ax,yt-TD,az),new THREE.Vector3(bx2,yt-TD,bz),0.4);P.bar(steel,new THREE.Vector3(ax,yt-0.3,az),new THREE.Vector3(bx2,yt-0.3,bz),0.4);}};
    truss(pW,leaf0-PB);truss(leaf1+PB,pE);
    // the leaves: plate girders deepest at the heel, over the pier, thinning to the joint at the middle
    for(const [h0,h1] of [[leaf0-PB*0.6,lc-0.15],[leaf1+PB*0.6,lc+0.15]])for(const v of [-(W2-3),-(W2-3)/3,(W2-3)/3,W2-3]){
      const n=14;for(let k=0;k<n;k++){const ua=h0+(h1-h0)*k/n,ub=h0+(h1-h0)*(k+1)/n,um=(ua+ub)/2,t=(um-h0)/(h1-h0),dep=6.5-4.6*t,[px,pz]=at(um,v);
        P.bx(Math.abs(v)>W2/2?steel:iron,px,deckY(um)-TH-dep,pz,Math.abs(ub-ua)+0.05,dep,0.6,ry);}}
    // the joint between the leaves and the heel joints, on the road
    for(const u of [lc,leaf0,leaf1]){const [px,pz]=at(u,0);P.bx(iron,px,deckY(u)-0.02,pz,0.35,0.06,W2*2-4,ry);}
    // the approaches: concrete arches on column bents, clear of the streets underneath
    const clear=u=>[-W2*0.6,0,W2*0.6].every(v=>{const [px,pz]=at(u,v);return !inWater(px,pz)&&!roadsNear(px,pz,1.5,r=>!mine.includes(r)&&!(r.name||'').toLowerCase().startsWith(L.name.toLowerCase())).length;});
    const high=u=>{const [px,pz]=at(u,0),[ax,az]=at(u,-W2+1),[bx2,bz]=at(u,W2-1);return deckY(u)-Math.max(gh(px,pz),gh(ax,az),gh(bx2,bz))>4.5;};
    const bents=(ua,ub,dir)=>{const out=[];let u=ua;const B=L.bay||21;
      while(dir>0?u<ub:u>ub){let got=null;for(let k=0;k<=8&&got==null;k++)for(const s of [1,-1]){const q=u+dir*k*s;if((dir>0?q<=ub:q>=ub)&&high(q)&&clear(q)){got=q;break;}}
        if(got!=null&&(!out.length||Math.abs(got-out[out.length-1])>12))out.push(got);u=(got==null?u:got)+dir*B;}
      return out;};
    const fascia=(ua,ub)=>{const len=Math.abs(ub-ua),u0=Math.min(ua,ub),u1=Math.max(ua,ub),[ax,az]=at(u0,0),[bx2,bz]=at(u1,0);
      let yb=1e9;for(let s=0;s<=len;s+=3){const [px,pz]=at(u0+s,0);yb=Math.min(yb,gh(px,pz));}yb-=0.4;
      const t0=deckY(u0)-0.25,t1=deckY(u1)-0.25,pad=1.6,top=Math.min(t0,t1)-TH-0.6,rise=Math.min((len-2*pad)/2,(top-yb)*0.42),spring=top-rise;
      if(spring-yb<1.5||len<8)return;
      const sh=new THREE.Shape();sh.moveTo(0,yb);sh.lineTo(0,t0);sh.lineTo(len,t1);sh.lineTo(len,yb);sh.lineTo(len-pad,yb);sh.lineTo(len-pad,spring);
      const mid=len/2,hw=mid-pad;for(let k=0;k<=18;k++){const a=k/18*Math.PI;sh.lineTo(mid+hw*Math.cos(a),spring+rise*Math.sin(a));}
      sh.lineTo(pad,yb);sh.lineTo(0,yb);
      const geo=new THREE.ExtrudeGeometry(sh,{depth:0.8,bevelEnabled:false});
      for(const s of [-1,1]){const [px,pz]=at(u0,s>0?W2-0.8:-W2);P.put(con,geo.clone(),px,0,pz,ry);}
      // the keystone, the band at the deck's edge and the bents' columns, four across
      for(const s of [-1,1]){const [kx,kz]=at(u0+mid,s*(W2+0.15));P.bx(conD,kx,top-0.2,kz,1.2,1.4,0.5,ry);const [ex,ez]=at(u0+mid,s*(W2+0.2));P.bx(conD,ex,Math.min(t0,t1)-0.9,ez,len,0.6,0.4,ry);}};
    const columns=u=>{const [px,pz]=at(u,0),yt=deckY(u)-TH;for(const v of [-W2+1.4,-W2/3,W2/3,W2-1.4]){const [qx,qz]=at(u,v),g0=gh(qx,qz)-0.3;P.bx(con,qx,g0,qz,1.6,yt-g0,1.6,ry);}
      P.bx(conD,px,yt-1.4,pz,2,1.4,W2*2,ry);};
    for(const [ua,ub,dir] of [[pW,U0,-1],[pE,U1,1]]){const bs=[ua,...bents(ua+dir*14,ub,dir)];for(let i=0;i<bs.length;i++){if(i)columns(bs[i]);if(i+1<bs.length)fascia(bs[i],bs[i+1]);}}
    // the operator towers, on diagonally opposite corners of the leaves' span: a stuccoed shaft rising from the
    // pier, a belt course, the operator's room with three round-arched windows a side, a bracketed eave, a hipped tile roof
    const tower=(u,s)=>{const yd=deckY(u),[cx,cz]=at(u,s*(W2+4.2)),TW=8,TD2=7,base=yd-TH-2,H1=11,H2=4.6;
      P.bx(stucco,cx,base,cz,TW,H1+TH+2,TD2,ry);P.bx(trim,cx,yd+H1,cz,TW+0.6,0.5,TD2+0.6,ry);
      P.bx(stucco,cx,yd+H1+0.5,cz,TW-0.4,H2,TD2-0.4,ry);P.bx(trim,cx,yd+H1+0.5+H2,cz,TW+1.6,0.45,TD2+1.6,ry);
      P.put(tile,new THREE.ConeGeometry(1,1,4).rotateY(Math.PI/4).translate(0,0.5,0).scale((TW+1.8)*0.7072,3.6,(TD2+1.8)*0.7072),cx,yd+H1+0.95+H2,cz,ry);
      P.put(trim,new THREE.SphereGeometry(0.4,8,6),cx,yd+H1+0.95+H2+3.6,cz);
      // the corner pilasters, the brackets under the eave
      for(const a of [-1,1])for(const b of [-1,1]){const px=cx+ux*a*(TW/2-0.2)-uz*b*(TD2/2-0.2),pz=cz+uz*a*(TW/2-0.2)+ux*b*(TD2/2-0.2);P.bx(trim,px,yd-1,pz,0.8,H1+1,0.8,ry);}
      // the windows: three arched a side up in the operator's room, one tall arched light lower on the shaft
      const face=(nu,nv,n)=>{const nx=ux*nu-uz*nv,nz=uz*nu+ux*nv,dep=(nu?TW:TD2)/2+0.07,wid=(nu?TD2:TW)-1.6,tx=-nz,tz=nx,fr=Math.atan2(nx,nz);
        for(let k=0;k<n;k++){const off=(k-(n-1)/2)*wid/n,px=cx+nx*dep+tx*off,pz=cz+nz*dep+tz*off;
          P.bx(win,px,yd+H1+1.2,pz,1.1,2.3,0.12,fr);P.put(win,new THREE.CircleGeometry(0.55,10,0,Math.PI),px,yd+H1+3.5,pz,fr);
          if(k===(n-1)/2){P.bx(win,px,yd+2.5,pz,1.2,5,0.12,fr);P.put(win,new THREE.CircleGeometry(0.6,10,0,Math.PI),px,yd+7.5,pz,fr);}}};
      face(1,0,3);face(-1,0,3);face(0,1,3);face(0,-1,3);};
    const tw=L.towers||[1,-1];tower(leaf0-PB/2,tw[0]);tower(leaf1+PB/2,tw[1]);
    // the lamp standards: a fluted post on a pedestal, two arms, two globes
    for(const s of [-1,1])for(let u=U0+24;u<U1-20;u+=L.lampStep||26){if(Math.abs(u-(leaf0-PB/2))<8||Math.abs(u-(leaf1+PB/2))<8)continue;const y=deckY(u),[px,pz]=at(u,s*(W2-0.6));
      P.bx(conD,px,y,pz,0.7,1.1,0.7,ry);P.put(lamp,new THREE.CylinderGeometry(0.12,0.18,4.6,8).translate(0,2.3,0),px,y+1.1,pz);
      for(const a of [-1,1]){const [qx,qz]=at(u+a*0.7,s*(W2-0.6));P.bx(lamp,(px+qx)/2,y+5.4,(pz+qz)/2,1.5,0.1,0.1,ry);P.put(globe,new THREE.SphereGeometry(0.34,10,8),qx,y+5.2,qz);}
      P.put(globe,new THREE.SphereGeometry(0.3,10,8),px,y+5.95,pz);}
    return group(L,P.done());}

  // ---------- a cast-iron front on the mapped building under L.at ----------
  const footAt=(x,z)=>buildingsAt(x,z,0).filter(b=>inPoly(x,z,b.ring)).sort((a,b)=>b.h-a.h)[0]||buildingsAt(x,z,6).sort((a,b)=>Math.hypot((a.x0+a.x1)/2-x,(a.z0+a.z1)/2-z)-Math.hypot((b.x0+b.x1)/2-x,(b.z0+b.z1)/2-z))[0];
  // the building's faces: each edge with its outward normal; a street face has no building against it and a street before it
  function faces(b){const out=[],R=b.ring;
    for(let i=0;i<R.length;i++){const [ax,az]=R[i],[bx2,bz]=R[(i+1)%R.length],len=Math.hypot(bx2-ax,bz-az);if(len<5)continue;
      let nx=(bz-az)/len,nz=-(bx2-ax)/len;const mx=(ax+bx2)/2,mz=(az+bz)/2;if(inPoly(mx+nx*0.5,mz+nz*0.5,R)){nx=-nx;nz=-nz;}
      const street=!buildingsAt(mx+nx*2.5,mz+nz*2.5,0).some(q=>q!==b&&inPoly(mx+nx*2.5,mz+nz*2.5,q.ring))&&(roadsNear(mx+nx*9,mz+nz*9,5).length>0||roadsNear(mx+nx*16,mz+nz*16,4).length>0);
      out.push({ax,az,bx:bx2,bz,len,nx,nz,mx,mz,street});}
    return out;}
  const mats=new Map(),mat=c=>{let m=mats.get(c);if(!m)mats.set(c,m=M(c));return m;};
  function castiron(L,x,z){const b=footAt(x,z);if(!b)return null;const P=pile(api);
    const top=b.h,body=mat(L.colour?parseInt(L.colour.slice(1),16):0xd9ceb2),dk=mat(L.trim?parseInt(L.trim.slice(1),16):0x8a7e68),door=mat(0x3a2a20);
    const want=L.faces?L.faces.map(BEAR):null;
    for(const f of faces(b)){if(want?!want.some(([dx,dz])=>dx*f.nx+dz*f.nz>0.8):!f.street)continue;
      const g0=Math.min(gh(f.ax,f.az),gh(f.bx,f.bz)),H=top-g0;if(H<5)continue;
      const fr=Math.atan2(f.nx,f.nz),tx=(f.bx-f.ax)/f.len,tz=(f.bz-f.az)/f.len;
      const at=(s,o)=>[f.ax+tx*s+f.nx*o,f.az+tz*s+f.nz*o];
      const GF=Math.min(5,H*0.36),n=L.storeys||Math.max(1,Math.round((H-GF)/4.4)),SH=(H-GF-0.9)/n,nb=Math.max(2,Math.round(f.len/(L.bay||3.4))),bw=f.len/nb;
      // the skin over the engine's wall, then everything stands proud of it
      {const [px,pz]=at(f.len/2,0.08);P.bx(body,px,g0,pz,f.len+0.2,H+0.9,0.16,fr);}
      // the storefront: cast-iron columns, the glazing between them (or round arches: an arcade), a transom, the fascia
      for(let k=0;k<=nb;k++){const [px,pz]=at(k*bw,0.3);P.bx(dk,px,g0,pz,0.42,GF,0.36,fr);P.bx(dk,px,g0+GF-0.5,pz,0.62,0.5,0.46,fr);}
      for(let k=0;k<nb;k++){const [px,pz]=at((k+0.5)*bw,0.18),gw=bw-0.6;
        if(L.arcade){const r=gw/2,hs=GF-0.9-r;P.bx(glass,px,g0,pz,gw,hs,0.1,fr);P.put(glass,new THREE.CircleGeometry(r,12,0,Math.PI),px,g0+hs,pz,fr);}
        else{P.bx(glass,px,g0+0.45,pz,gw,GF-1.5,0.1,fr);P.bx(dk,px,g0,pz,gw,0.45,0.14,fr);}
        if(hash3(px,pz,7)<0.3){const [qx,qz]=at((k+0.5)*bw,0.22);P.bx(door,qx,g0,qz,Math.min(1.3,gw*0.5),2.4,0.1,fr);}}
      {const [px,pz]=at(f.len/2,0.35);P.bx(dk,px,g0+GF-0.1,pz,f.len+0.3,0.55,0.5,fr);}
      // the upper storeys: pilasters with their capitals, a sill course, round-arched windows with hood mouldings
      for(let s=0;s<n;s++){const y0=g0+GF+0.45+s*SH;
        {const [px,pz]=at(f.len/2,0.28);P.bx(dk,px,y0,pz,f.len+0.2,0.22,0.3,fr);}
        for(let k=0;k<=nb;k++){const [px,pz]=at(k*bw,0.24);P.bx(body,px,y0,pz,0.5,SH-0.3,0.3,fr);P.bx(dk,px,y0+SH-0.55,pz,0.72,0.3,0.38,fr);}
        for(let k=0;k<nb;k++){const [px,pz]=at((k+0.5)*bw,0.18),ww=Math.min(1.5,bw*0.52),r=ww/2,wh=SH*0.62-r;
          P.bx(glass,px,y0+0.55,pz,ww,wh,0.08,fr);P.put(glass,new THREE.CircleGeometry(r,10,0,Math.PI),px,y0+0.55+wh,pz,fr);
          {const [hx,hz]=at((k+0.5)*bw,0.24);P.put(dk,new THREE.TorusGeometry(r+0.12,0.09,4,10,Math.PI),hx,y0+0.55+wh,hz,fr);}
          const [sx,sz]=at((k+0.5)*bw,0.28);P.bx(dk,sx,y0+0.42,sz,ww+0.4,0.14,0.22,fr);}}
      // the cornice: a frieze, the brackets, the projecting crown, a parapet with a pediment (or a name panel) at the middle
      {const yc=top-0.35,[px,pz]=at(f.len/2,0.3);P.bx(body,px,yc-0.6,pz,f.len+0.3,0.6,0.4,fr);
        for(let k=0;k<=nb*2;k++){const [qx,qz]=at(k*bw/2,0.45);P.bx(dk,qx,yc-0.55,qz,0.2,0.55,0.55,fr);}
        const [cx,cz]=at(f.len/2,0.6);P.bx(dk,cx,yc,cz,f.len+0.9,0.42,1.1,fr);
        const [qx,qz]=at(f.len/2,0.12);P.bx(body,qx,yc+0.42,qz,f.len,0.6,0.28,fr);
        if(L.pediment!==false&&f.len>10){const pw=Math.min(8,f.len*0.4),sh=new THREE.Shape();sh.moveTo(-pw/2,0);sh.lineTo(pw/2,0);sh.lineTo(0,pw*0.22);sh.lineTo(-pw/2,0);
          P.put(body,new THREE.ExtrudeGeometry(sh,{depth:0.3,bevelEnabled:false}),qx,yc+1.02,qz,fr);}}}
    const g=group(L,P.done());return g;}

  // ---------- the Skidmore Fountain ----------
  function skidmore(L,x,z){const g0=gh(x,z),P=pile(api),gran=M(0x9c9690),granD=M(0x837d78),bronze=M(0x5a5a3c),water=new THREE.MeshPhongMaterial({color:0x5a8aa8,specular:0xffffff,shininess:90,transparent:true,opacity:0.85});
    const S=(L.w||8)/8,cy=(r0,r1,h,n=24)=>new THREE.CylinderGeometry(r1*S,r0*S,h*S,n).translate(0,h*S/2,0);
    // the granite steps and the octagonal lower basin, its rim, the water in it
    P.put(granD,cy(4.2,4.2,0.25,8),x,g0,z,Math.PI/8);P.put(gran,cy(3.6,3.6,0.9,8),x,g0+0.25*S,z,Math.PI/8);P.put(water,cy(3.25,3.25,0.05,8),x,g0+1.05*S,z,Math.PI/8);
    // the four horse troughs at its foot, and the drinking cups
    for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4,px=x+Math.cos(a)*4.3*S,pz=z+Math.sin(a)*4.3*S;P.bx(gran,px,g0,pz,1.8*S,0.75*S,0.8*S,-a);P.bx(water,px,g0+0.7*S,pz,1.5*S,0.05,0.5*S,-a);}
    // the pedestal, the two caryatids back to back on it, the bronze basin they hold up, its spouts and the finial
    P.put(gran,cy(1.1,0.85,1.6,8),x,g0+1.1*S,z,Math.PI/8);P.put(granD,cy(1.15,1.15,0.25,8),x,g0+2.7*S,z,Math.PI/8);
    for(const s of [-1,1]){const fx=x+s*0.42*S,fy=g0+2.95*S;
      P.put(bronze,cy(0.36,0.26,1.15,10),fx,fy,z);P.put(bronze,cy(0.22,0.18,0.55,10),fx,fy+1.15*S,z);P.put(bronze,new THREE.SphereGeometry(0.17*S,10,8),fx,fy+1.85*S,z);
      for(const a of [-1,1])P.put(bronze,new THREE.CylinderGeometry(0.06*S,0.06*S,0.85*S,6),fx,fy+1.95*S,z+a*0.2*S,0,a*0.35);}
    P.put(bronze,new THREE.CylinderGeometry(1.75*S,0.55*S,0.45*S,24).translate(0,0.22*S,0),x,g0+5.0*S,z);
    P.put(water,cy(1.6,1.6,0.04),x,g0+5.42*S,z);P.put(bronze,cy(0.12,0.05,0.9,8),x,g0+5.4*S,z);P.put(bronze,new THREE.SphereGeometry(0.14*S,8,6),x,g0+6.35*S,z);
    // the sheet falling from the basin's lip into the granite basin
    const fall=new THREE.Mesh(new THREE.CylinderGeometry(1.72*S,2.1*S,3.9*S,24,1,true).translate(0,-1.95*S,0),new THREE.MeshBasicMaterial({color:0xdcecf4,transparent:true,opacity:0.14,side:THREE.DoubleSide,depthWrite:false}));
    fall.position.set(x,g0+5.0*S,z);
    const g=group(L,[...P.done(),fall]);fall.castShadow=false;
    animHooks.push(now=>{fall.material.opacity=0.12+0.04*Math.sin((now||0)*0.007);});return g;}

  // ---------- the White Stag sign ----------
  // Oregon's outline as [lon, lat]: the coast, the California line, the Snake, the Columbia back to Astoria
  const OREGON=[[-123.95,46.2],[-123.9,45.55],[-124.07,44.6],[-124.2,43.4],[-124.55,42.82],[-124.2,42.0],[-117.03,42.0],[-117.03,43.8],[-116.92,44.2],[-117.2,44.35],[-116.9,44.9],[-116.46,45.6],[-116.92,46.0],[-118.98,46.0],[-119.6,45.92],[-120.6,45.72],[-121.2,45.62],[-122.2,45.56],[-122.75,45.66],[-122.95,46.12],[-123.4,46.22],[-123.95,46.2]];
  function signCanvas(lit){const cv=document.createElement('canvas');cv.width=1024;cv.height=768;const g=cv.getContext('2d');
    const X=lo=>80+(lo+124.6)/(124.6-116.4)*860,Y=la=>70+(46.3-la)/(46.3-41.95)*390;
    const glowOn=(col,b)=>{if(lit){g.shadowColor=col;g.shadowBlur=b;}else g.shadowBlur=0;};
    g.lineJoin='round';
    // the state: a gold field with a rim of bulbs
    g.beginPath();OREGON.forEach(([lo,la],i)=>i?g.lineTo(X(lo),Y(la)):g.moveTo(X(lo),Y(la)));g.closePath();
    g.fillStyle=lit?'#3a2a08':'#d8b048';g.fill();glowOn('#ffd24a',30);g.strokeStyle=lit?'#ffd860':'#f4ecd8';g.lineWidth=14;g.stroke();
    g.font='bold 120px Arial, Helvetica, sans-serif';g.textAlign='center';g.textBaseline='middle';
    glowOn('#ff3020',26);g.fillStyle=lit?'#ff4a32':'#b42a20';g.fillText('OREGON',X(-120.6),Y(44.0));
    g.lineWidth=3;g.strokeStyle=lit?'#ffd2c8':'#f4ecd8';g.strokeText('OREGON',X(-120.6),Y(44.0));
    // the leaping stag, at the north-west corner of the state
    {const ox=X(-123.3),oy=Y(46.15)-6;g.save();g.translate(ox,oy);g.scale(1.25,1.25);glowOn('#ffffff',22);g.strokeStyle=lit?'#ffffff':'#f6f2ea';g.fillStyle=g.strokeStyle;g.lineWidth=7;g.lineCap='round';
      g.beginPath();g.ellipse(0,0,46,17,-0.18,0,Math.PI*2);g.fill();
      g.beginPath();g.moveTo(36,-10);g.lineTo(58,-42);g.stroke();g.beginPath();g.ellipse(64,-46,12,7,-0.4,0,Math.PI*2);g.fill();
      for(const [a,b,c2,d] of [[60,-52,52,-86],[54,-70,40,-80],[56,-78,68,-96],[62,-52,74,-82],[70,-70,84,-76]]){g.beginPath();g.moveTo(a,b);g.lineTo(c2,d);g.stroke();}
      for(const [a,b,c2,d,e,f] of [[30,6,62,26,88,22],[22,10,48,34,76,44],[-32,6,-66,18,-96,8],[-38,2,-60,30,-90,36]]){g.beginPath();g.moveTo(a,b);g.lineTo(c2,d);g.lineTo(e,f);g.stroke();}
      g.beginPath();g.moveTo(-44,-6);g.lineTo(-58,-16);g.stroke();g.restore();}
    // PORTLAND under the state, in big letters; OLD TOWN over the stag
    g.font='bold 150px Arial, Helvetica, sans-serif';glowOn('#ffffff',30);g.fillStyle=lit?'#fff8ec':'#f6f2ea';g.fillText('PORTLAND',512,600);
    g.lineWidth=6;g.strokeStyle=lit?'#ff3a2a':'#b42a20';g.strokeText('PORTLAND',512,600);
    g.font='bold 64px Arial, Helvetica, sans-serif';glowOn('#ff3020',20);g.fillStyle=lit?'#ff5a40':'#b42a20';g.fillText('OLD TOWN',800,712);
    return cv;}
  function whitestag(L,x,z){const P=pile(api),top=(api.roofAt&&api.roofAt(x,z))||gh(x,z)+15,frame=M(0x3c3e40),W=L.w||20,H=W*0.75;
    const [fx,fz]=BEAR(L.face==null?110:L.face),fr=Math.atan2(fx,fz),tx=fz,tz=-fx;
    // the steel frame behind the face: legs, girts, braces, the catwalk
    for(let k=0;k<=4;k++){const s=(k/4-0.5)*W*0.9,px=x+tx*s-fx*1.2,pz=z+tz*s-fz*1.2;P.bx(frame,px,top,pz,0.35,H+2,0.35,fr);P.bx(frame,px-fx*1.6,top,pz-fz*1.6,0.3,H*0.7,0.3,fr);
      P.bar(frame,new THREE.Vector3(px,top+H+1.6,pz),new THREE.Vector3(px-fx*1.6,top+0.2,pz-fz*1.6),0.2);}
    for(const y of [top+2.2,top+H*0.5+2,top+H+1.6])P.bx(frame,x-fx*1.2,y,z-fz*1.2,W*0.92,0.25,0.3,fr);
    P.bx(frame,x-fx*0.4,top+1.8,z-fz*0.4,W*0.95,0.12,1.2,fr);
    const tex=[signCanvas(false),signCanvas(true)].map(cv=>{const t=new THREE.CanvasTexture(cv);if(THREE.SRGBColorSpace)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;});
    const fm=new THREE.MeshBasicMaterial({map:tex[0],transparent:true,alphaTest:0.25});
    const face=new THREE.Mesh(new THREE.PlaneGeometry(W,H),fm);face.position.set(x-fx*0.9,top+2+H/2,z-fz*0.9);face.rotation.y=fr;
    // its back: the letters' and the state's sheet metal, painted dark
    const back=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshLambertMaterial({color:0x3a3c3e,alphaMap:tex[0],alphaTest:0.25}));back.position.set(x-fx*0.95,top+2+H/2,z-fz*0.95);back.rotation.y=fr+Math.PI;back.scale.x=-1;
    const g=group(L,[...P.done(),face,back]);face.castShadow=false;
    let on=-1;animHooks.push(()=>{const o=night()>0.3?1:0;if(o===on)return;on=o;fm.map=tex[o];fm.color.setHex(o?0xffffff:0xd8d8d8);fm.needsUpdate=true;});return g;}

  // ---------- the Saturday Market ----------
  const CANOPY=[0xf2f0ea,0xf2f0ea,0x2f6a9a,0x2f7a4a,0xb8322a,0xe0b43a,0x7a4a8a,0xf2f0ea];
  function market(L,x,z){const P=pile(api),post=M(0x5a5c60),table=M(0x8a6a48),cl=CANOPY.map(c=>M(c)),goods=[0xc85a3a,0x3a7ab8,0xe8d4a0,0x6a9a4a,0x9a5aa8,0x3a3a3a].map(c=>M(c));
    const [dx,dz]=BEAR(L.rot||0),ex=-dz,ez=dx;let n=0;
    for(const [la0,lo0,la1,lo1,cover] of L.areas||[]){const [ax,az]=api.P([la0,lo0]),[bx2,bz]=api.P([la1,lo1]),x0=Math.min(ax,bx2),x1=Math.max(ax,bx2),z0=Math.min(az,bz),z1=Math.max(az,bz);
      const cx=(x0+x1)/2,cz=(z0+z1)/2,hu=Math.max(x1-x0,z1-z0);
      for(let ri=-Math.ceil(hu/3.6);ri*3.6<=hu;ri++){if(((ri%3)+3)%3===2)continue;const i=ri*3.6;for(let j=-hu;j<=hu;j+=3.4){const px=cx+dx*i+ex*j,pz=cz+dz*i+ez*j;
        if(px<x0||px>x1||pz<z0||pz>z1||inWater(px,pz)||roadsNear(px,pz,2.2,r=>r.c!=='trail').length||buildingsAt(px,pz,2).some(b=>inPoly(px,pz,b.ring)))continue;
        if(hash3(px,pz,41)<0.12)continue;n++;const y=gh(px,pz),fr=Math.atan2(dx,dz),k=Math.floor(hash3(px,pz,42)*CANOPY.length);
        for(const a of [-1,1])for(const b of [-1,1])P.bx(post,px+dx*a*1.4+ex*b*1.4,y,pz+dz*a*1.4+ez*b*1.4,0.06,cover?2.1:2.4,0.06,fr);
        if(!cover){P.put(cl[k],new THREE.ConeGeometry(2.1,0.75,4).rotateY(Math.PI/4).translate(0,0.37,0),px,y+2.4,pz,fr);P.bx(cl[k],px,y+2.15,pz,2.9,0.28,2.9,fr);}
        else P.bx(cl[k],px+ex*1.4,y+1.4,pz+ez*1.4,2.9,0.7,0.04,fr);
        P.bx(table,px-ex*0.7,y,pz-ez*0.7,2.4,0.78,0.9,fr);
        for(let q=0;q<4;q++){const s=(q-1.5)*0.55,h2=0.12+hash3(px,pz,50+q)*0.3;P.bx(goods[Math.floor(hash3(px,pz,60+q)*goods.length)],px+dx*s-ex*0.75,y+0.78,pz+dz*s-ez*0.75,0.42,h2,0.5,fr);}}}}
    // the market's own pavilion in the park: an open steel frame on posts, a shallow gable of fabric over the stalls
    let pav=null;if(L.pavilion){const [ax,az]=api.P(L.pavilion.slice(0,2)),[bx2,bz]=api.P(L.pavilion.slice(2,4)),x0=Math.min(ax,bx2),x1=Math.max(ax,bx2),z0=Math.min(az,bz),z1=Math.max(az,bz),y=gh((x0+x1)/2,(z0+z1)/2),Q=pile(api),fs=M(0x50565c),fab=new THREE.MeshLambertMaterial({color:0xf2efe6,side:THREE.DoubleSide});
      const ns=Math.max(2,Math.round((z1-z0)/6));for(let k=0;k<=ns;k++){const zz=z0+(z1-z0)*k/ns;for(const xx of [x0,x1])Q.bx(fs,xx,y,zz,0.3,4.6,0.3);Q.bx(fs,(x0+x1)/2,y+4.5,zz,x1-x0+0.6,0.3,0.25);Q.bx(fs,(x0+x1)/2,y+5.9,zz,0.25,0.25,0.25);}
      for(const xx of [x0,x1])Q.bx(fs,xx,y+4.4,(z0+z1)/2,0.3,0.3,z1-z0);
      const hw=(x1-x0)/2+0.8,rise=1.6,sl=Math.hypot(hw,rise),a2=Math.atan2(rise,hw);
      for(const s2 of [-1,1])Q.put(fab,new THREE.BoxGeometry(sl,0.06,z1-z0+1.2),(x0+x1)/2+s2*hw/2,y+4.75+rise/2,(z0+z1)/2,0,0,-s2*a2);
      pav=Q.done();}
    if(!n&&!pav)return null;const g=group(L,P.done());if(pav)group(L,pav);
    // up from ten until five; packed away at night
    animHooks.push(()=>{const h=hour();g.visible=h>=9.5&&h<=17.75;});return g;}

  // ---------- the MAX stop at Skidmore Fountain ----------
  function maxstop(L,x,z){let best=null;for(const r of RAILS)for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx2,bz]=r.pts[i+1],d=api.segDist(x,z,ax,az,bx2,bz);if(d<30&&(!best||d<best.d))best={d,dx:bx2-ax,dz:bz-az};}
    if(!best)return null;const l=Math.hypot(best.dx,best.dz),dx=best.dx/l,dz=best.dz/l,ex=-dz,ez=dx,fr=Math.atan2(dx,dz)+Math.PI/2,P=pile(api),con=M(0xa8a49c),edge=M(0xe6c83a),steel=M(0x3e4a52),gl=new THREE.MeshLambertMaterial({color:0xa8c8d4,transparent:true,opacity:0.35}),blue=M(0x1a4a8a),light=glow(0xdedad0,0xfff6e0);
    const LEN=L.len||26,OFF=L.off||5.4,g0=gh(x,z);
    for(const s of [-1,1]){const px=x+ex*s*OFF,pz=z+ez*s*OFF,y=Math.max(g0,gh(px,pz));
      P.bx(con,px,y-0.3,pz,LEN,0.65,3,fr);P.bx(edge,px-ex*s*1.35,y+0.35,pz-ez*s*1.35,LEN,0.02,0.3,fr);
      // the shelter: posts, a glass back, a shallow canopy; the lamp under it; the stop's blue pylon
      for(const t of [-1,0,1]){const qx=px+dx*t*4+ex*s*1.1,qz=pz+dz*t*4+ez*s*1.1;P.bx(steel,qx,y+0.35,qz,0.12,2.9,0.12,fr);}
      P.bx(gl,px+ex*s*1.15,y+0.35,pz+ez*s*1.15,8.2,2.2,0.04,fr);P.bx(steel,px+ex*s*0.4,y+3.25,pz+ez*s*0.4,8.8,0.14,2.4,fr);P.bx(light,px+ex*s*0.4,y+3.18,pz+ez*s*0.4,6,0.06,0.3,fr);
      const sx=px+dx*(LEN/2-1.2),sz=pz+dz*(LEN/2-1.2);P.bx(blue,sx,y+0.35,sz,0.5,3.2,0.5,fr);P.bx(M(0xf2f2f2),sx,y+2.6,sz,0.52,0.6,0.52,fr);
      P.bx(steel,px-dx*(LEN/2-2),y+0.35,pz-dz*(LEN/2-2),0.6,1.5,0.45,fr);}
    return group(L,P.done());}

  // ---------- a shop's own front: Voodoo Doughnut ----------
  function signFace(text,bg,fg,w,h,lit){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,w,h);
    g.textAlign='center';g.textBaseline='middle';g.fillStyle=fg;if(lit){g.shadowColor=fg;g.shadowBlur=18;}
    const lines=text.split('\n'),vert=h>w*1.5;
    if(vert){const ch=text.replace(/\n/g,'').split('');g.font='bold '+Math.round(w*0.62)+'px Arial, sans-serif';ch.forEach((c,i)=>g.fillText(c,w/2,(i+0.5)*h/ch.length));}
    else{g.font='bold '+Math.round(h/(lines.length+0.6))+'px Arial, sans-serif';lines.forEach((t,i)=>g.fillText(t,w/2,(i+0.8)*h/(lines.length+0.6)));}
    g.lineWidth=8;g.strokeStyle=fg;g.strokeRect(6,6,w-12,h-12);
    const t=new THREE.CanvasTexture(cv);if(THREE.SRGBColorSpace)t.colorSpace=THREE.SRGBColorSpace;return t;}
  function storefront(L,x,z){const b=footAt(x,z);if(!b)return null;const [wx,wz]=BEAR(L.face==null?270:L.face);
    const f=faces(b).filter(q=>q.len>3).sort((p,q)=>(q.nx*wx+q.nz*wz)-(p.nx*wx+p.nz*wz))[0];if(!f)return null;
    const P=pile(api),fr=Math.atan2(f.nx,f.nz),g0=Math.min(gh(f.ax,f.az),gh(f.bx,f.bz)),H=b.h-g0,col=L.colour?parseInt(L.colour.slice(1),16):0xf06aa8;
    const tx=(f.bx-f.ax)/f.len,tz=(f.bz-f.az)/f.len,at=(s,o)=>[f.ax+tx*s+f.nx*o,f.az+tz*s+f.nz*o];
    {const [px,pz]=at(f.len/2,0.1);P.bx(mat(col),px,g0,pz,f.len+0.1,H+0.4,0.2,fr);}
    {const [px,pz]=at(f.len/2,0.25);P.bx(glass,px,g0+0.4,pz,f.len*0.7,2.6,0.08,fr);P.bx(mat(0x2a1a24),px,g0+3.1,pz,f.len*0.85,0.9,0.5,fr);}
    const tx2=[0,1].map(lit=>signFace(L.text||'VOODOO\nDOUGHNUT',lit?'#3a0a24':'#f4a0c8',lit?'#ff6ac0':'#7a1048',512,256,lit));
    const tv=[0,1].map(lit=>signFace(L.blade||'VOODOO',lit?'#2a0a1e':'#f06aa8',lit?'#fff0f8':'#ffffff',128,512,lit));
    const sm=new THREE.MeshBasicMaterial({map:tx2[0]}),vm=new THREE.MeshBasicMaterial({map:tv[0],side:THREE.DoubleSide});
    const [sx,sz]=at(f.len/2,0.42),board=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(f.len*0.8,8),Math.min(f.len*0.4,4)*0.5),sm);board.position.set(sx,g0+3.55+0.25,sz);board.rotation.y=fr;
    const bh=Math.min(H-1,7),[bx2,bz2]=at(Math.min(1.5,f.len*0.2),1.2),blade=new THREE.Mesh(new THREE.PlaneGeometry(1.6,bh),vm);blade.position.set(bx2,g0+4.4+bh/2,bz2);blade.rotation.y=fr+Math.PI/2;
    const g=group(L,[...P.done(),board,blade]);board.castShadow=blade.castShadow=false;
    let on=-1;animHooks.push(()=>{const o=night()>0.3?1:0;if(o===on)return;on=o;sm.map=tx2[o];vm.map=tv[o];sm.needsUpdate=vm.needsUpdate=true;});return g;}

  // ---------- red lanterns strung across a street ----------
  function lanterns(L,x,z){const R=L.r||250,name=(L.street||'').toLowerCase(),P=pile(api),red=glow(0xb0201a,0xff3a24),gold=M(0xc8a040),wire=M(0x2a2a2a),pole=M(0x9a2a22);let n=0;
    for(const r of ROADS){if((r.name||'').toLowerCase()!==name||r.c==='trail'||r.ys)continue;
      for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx2,bz]=r.pts[i+1],len=Math.hypot(bx2-ax,bz-az),tx=(bx2-ax)/len,tz=(bz-az)/len,nx=-tz,nz=tx;
        for(let s=(L.step||14)/2;s<len;s+=L.step||14){const px=ax+tx*s,pz=az+tz*s;if(Math.hypot(px-x,pz-z)>R)continue;const hw=r.w/2+2.2,y=gh(px,pz);
          const A=new THREE.Vector3(px-nx*hw,y+6.2,pz-nz*hw),B=new THREE.Vector3(px+nx*hw,y+6.2,pz+nz*hw);P.bar(wire,A,B,0.04);
          for(const e of [A,B]){P.bx(pole,e.x,y,e.z,0.22,6.4,0.22);P.put(gold,new THREE.SphereGeometry(0.18,8,6),e.x,y+6.5,e.z);}
          const k=Math.max(3,Math.round(hw*2/3.2));for(let q=1;q<k;q++){const t=q/k,lx=A.x+(B.x-A.x)*t,lz=A.z+(B.z-A.z)*t,sag=Math.sin(t*Math.PI)*0.6,ly=y+6.2-sag-0.7;
            P.put(red,new THREE.SphereGeometry(0.34,10,8).scale(1,1.25,1),lx,ly,lz);P.put(gold,new THREE.CylinderGeometry(0.2,0.2,0.08,8),lx,ly+0.42,lz);P.put(gold,new THREE.CylinderGeometry(0.2,0.2,0.08,8),lx,ly-0.42,lz);
            P.put(red,new THREE.CylinderGeometry(0.03,0.03,0.4,4),lx,ly-0.62,lz);n++;}}}}
    if(!n)return null;return group(L,P.done());}

  // ---------- Ankeny Alley: lights strung across it, tables under them ----------
  function alley(L,x,z){const name=(L.street||'').toLowerCase(),R=L.r||60,P=pile(api),bulb=glow(0xd8d0b8,0xffe2a0),wire=M(0x222222),tab=M(0x5a4636),chair=M(0x2a2c2e),umb=[0x2a5a3a,0x8a2a24,0xe8e0cc].map(c=>M(c));let n=0;
    for(const r of ROADS){if((r.name||'').toLowerCase()!==name||r.ys)continue;
      for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx2,bz]=r.pts[i+1],len=Math.hypot(bx2-ax,bz-az),tx=(bx2-ax)/len,tz=(bz-az)/len,nx=-tz,nz=tx;
        for(let s=2;s<len;s+=4.5){const px=ax+tx*s,pz=az+tz*s;if(Math.hypot(px-x,pz-z)>R)continue;const y=gh(px,pz),hw=(L.half||5.2),zig=(Math.round(s/4.5)%2?1:-1)*2.2;
          const A=new THREE.Vector3(px-nx*hw-tx*zig,y+5.6,pz-nz*hw-tz*zig),B=new THREE.Vector3(px+nx*hw+tx*zig,y+5.6,pz+nz*hw+tz*zig);P.bar(wire,A,B,0.025);
          for(let q=1;q<10;q++){const t=q/10,sag=Math.sin(t*Math.PI)*0.45;P.put(bulb,new THREE.SphereGeometry(0.07,6,4),A.x+(B.x-A.x)*t,y+5.5-sag,A.z+(B.z-A.z)*t);}n++;
          if(Math.round(s/4.5)%2===0){for(const side of [-1,1]){if(hash3(px,pz,side+5)<0.35)continue;const qx=px+nx*side*(hw-1.6),qz=pz+nz*side*(hw-1.6);
            P.put(tab,new THREE.CylinderGeometry(0.42,0.42,0.05,10),qx,y+0.74,qz);P.put(tab,new THREE.CylinderGeometry(0.05,0.05,0.74,6).translate(0,0.37,0),qx,y,qz);
            for(const c of [-1,1])P.bx(chair,qx+tx*c*0.62,y,qz+tz*c*0.62,0.42,0.45,0.42);
            const u=umb[Math.floor(hash3(px,pz,side+9)*umb.length)];P.put(chair,new THREE.CylinderGeometry(0.025,0.025,2.2,4).translate(0,1.1,0),qx,y,qz);P.put(u,new THREE.ConeGeometry(1.1,0.45,8).translate(0,0.22,0),qx,y+2.0,qz);}}}}}
    if(!n)return null;return group(L,P.done());}

  return {burnside,castiron,skidmore,whitestag,market,maxstop,storefront,lanterns,alley};}

// the people of Old Town: the pavements busier round Skidmore, the market, Ankeny Alley, the Voodoo queue and the
// Chinatown gate, fading out to a few across the rest of the city (a city config with its own crowds keeps those)
export function oldtownPeople(api){if(api.C.crowds)return;
  const K={seed:1872,centre:[45.5228,-122.6712,650,60],pedestrians:0.4,pedestrianMul:2,maxPedestrians:1400,far:320,touristFar:360,piece:200,
    keepOut:[[45.52241,-122.67109,5]],
    sites:[[45.52241,-122.67109,16,30],[45.52286,-122.67001,30,110],[45.52308,-122.66996,22,70],[45.52254,-122.67283,24,40],[45.52272,-122.67336,6,22],[45.52329,-122.67441,14,16],[45.52205,-122.6711,18,24]]};
  return crowds(Object.assign({},api,{C:Object.assign(Object.create(api.C),{crowds:K})}));}
