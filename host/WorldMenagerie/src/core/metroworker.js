// ---------- the metro tile builder: a Web Worker ----------
// Given a tile of a streamed city (tools/metro-tiler.py), it fetches it, unpacks it and builds everything in it as
// plain arrays - the ground, the land cover, the roads and the rail, the buildings walled and roofed in the engine's
// own facade styles - and hands them back to the page (src/core/metro.js) to wrap in meshes. Nothing here touches
// the scene, so the main thread never stalls on a tile, however dense.
// A classic worker, so three.js comes in by importScripts and its triangulator is the one the engine uses.
/* global THREE */
importScripts(new URL('../../vendor/three/three.min.js', self.location.href).href);

let CFG=null;
const KINDS=["yes","house","detached","residential","apartments","commercial","retail","office","industrial","warehouse","school","university","hospital","hotel","train_station","temple","shrine","garage","roof","other"];
const hex=c=>{const n=parseInt(c.slice(1),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
const AREA_COL={water:'#3c5a5c',park:'#5a7444',garden:'#557040',wood:'#3f6034',grass:'#64774a',golf:'#6a8a50',cemetery:'#6a7458',pitch:'#5f7f48',farm:'#7a7a5a',
  railyard:'#6a665e',industrial:'#7a766e',parking:'#5a5a5c',stadium:'#6a6a64'};
const ROAD_COL={motorway:'#3a3b3f',trunk:'#3c3d41',primary:'#3e3f43',secondary:'#424347',tertiary:'#46474b',residential:'#4c4d50',unclassified:'#4c4d50',living_street:'#55565a',
  pedestrian:'#a8a49c',service:'#58595c'};
const hash=(x,z,k)=>{const v=Math.sin(x*12.9898+z*78.233+k*37.719)*43758.5453;return v-Math.floor(v);};

// a server may send a .gz as it is, or mark it gzip-encoded and let the browser unzip it on the way: unzip here
// only what still starts with gzip's magic bytes
async function gunzipJSON(r){const buf=new Uint8Array(await r.arrayBuffer());
  if(buf[0]===0x1f&&buf[1]===0x8b){const ds=new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));return JSON.parse(await new Response(ds).text());}
  return JSON.parse(new TextDecoder().decode(buf));}
self.gunzipJSON=gunzipJSON;
async function load(url){const r=await fetch(url);if(!r.ok)throw new Error(r.status+' '+url);return gunzipJSON(r);}

// a growing typed buffer of [x,y,z] / [nx,ny,nz] / [u,v] / [r,g,b]
function Buf(uv){return {p:[],n:[],u:uv?[]:null,c:[]};}
function pushTri(b,a,c,d,n,col,uvs){for(const [v,i] of [[a,0],[c,1],[d,2]]){b.p.push(v[0],v[1],v[2]);b.n.push(n[0],n[1],n[2]);b.c.push(col[0],col[1],col[2]);if(b.u)b.u.push(uvs?uvs[i][0]:0,uvs?uvs[i][1]:0);}}

// a convex polygon cut to a rectangle (Sutherland-Hodgman)
function clipRect(poly,x0,z0,x1,z1){let P=poly;for(const [ax,s,v] of [[0,1,x0],[0,-1,x1],[1,1,z0],[1,-1,z1]]){if(!P.length)break;const Q=[];
    for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],ia=(a[ax]-v)*s>=0,ib=(b[ax]-v)*s>=0;if(ia)Q.push(a);if(ia!==ib){const t=(v-a[ax])/(b[ax]-a[ax]);Q.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}P=Q;}
  return P;}
// a line with no piece longer than d, so what is laid along it follows the ground
function densify(pts,d){const o=[pts[0]];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/d);for(let k=1;k<=n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}return o;}

// a box turned about y: centre, size, turn, colour
function box(b,cx,cy,cz,w,h,d,ry,col){const c=Math.cos(ry),s=Math.sin(ry),P=(x,y,z)=>[cx+x*c+z*s,cy+y,cz-x*s+z*c],N=(x,y,z)=>[x*c+z*s,y,-x*s+z*c],W=w/2,H=h/2,D=d/2;
  const f=(n,a,bb,cc,dd)=>{pushTri(b,a,bb,cc,n,col);pushTri(b,a,cc,dd,n,col);};
  f(N(0,1,0),P(-W,H,-D),P(-W,H,D),P(W,H,D),P(W,H,-D));f(N(1,0,0),P(W,-H,-D),P(W,H,-D),P(W,H,D),P(W,-H,D));f(N(-1,0,0),P(-W,-H,D),P(-W,H,D),P(-W,H,-D),P(-W,-H,-D));
  f(N(0,0,1),P(W,-H,D),P(W,H,D),P(-W,H,D),P(-W,-H,D));f(N(0,0,-1),P(-W,-H,-D),P(-W,H,-D),P(W,H,-D),P(W,-H,-D));}
const SIGN_COLS=['#e8202a','#f2c020','#2a8ae8','#f4f4f0','#18b060','#e83a9a','#ff7a1a','#9a3ae8'].map(hex),AWN=['#2a5a8a','#8a2a2a','#2a6a3a','#d8d2c4','#3a3a40','#c87a1a'].map(hex);

function build(T,tx,tz){const S=CFG.tile,G=T.g?Math.round(Math.sqrt(T.g.length)):0,ox=tx*S,oz=tz*S,step=S/(G-1),SEA=-CFG.datum+0.3;
  const gh=(x,z)=>{if(!G)return 0;let fx=(x-ox)/step,fz=(z-oz)/step;fx=Math.max(0,Math.min(G-1.001,fx));fz=Math.max(0,Math.min(G-1.001,fz));const i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,h=T.g;
    return ((h[j*G+i]*(1-u)+h[j*G+i+1]*u)*(1-v)+(h[(j+1)*G+i]*(1-u)+h[(j+1)*G+i+1]*u)*v)/10;};
  const out={};const B=k=>out[k]||(out[k]=Buf(k.startsWith('w:')));
  // ---- the ground: the grid, the sea left out (the engine's sea shows through) ----
  if(G&&!T.core){const g=B('ground'),L=hex(CFG.ground||'#8a8678');
    for(let j=0;j+1<G;j++)for(let i=0;i+1<G;i++){const P=(a,b)=>[ox+a*step,T.g[b*G+a]/10,oz+b*step],a=P(i,j),b=P(i+1,j),c=P(i+1,j+1),d=P(i,j+1);
      if(a[1]<SEA&&b[1]<SEA&&c[1]<SEA&&d[1]<SEA)continue;
      const n=(()=>{const ux=b[0]-a[0],uy=b[1]-a[1],vz=d[2]-a[2],vy=d[1]-a[1];const nx=-uy*vz,ny=ux*vz,nz=-ux*vy;const l=Math.hypot(nx,ny,nz)||1;return [nx/l,ny/l,nz/l];})();
      pushTri(g,a,d,c,n,L);pushTri(g,a,c,b,n,L);}}
  // ---- the land cover: each area at the ground, flat per vertex, a little above it ----
  for(const [p,kind] of T.a||[]){const ring=[];for(let i=0;i<p.length;i+=2)ring.push([ox+p[i]/10,oz+p[i+1]/10]);if(ring.length<3)continue;
    let tri;try{tri=THREE.ShapeUtils.triangulateShape(ring.map(([x,z])=>new THREE.Vector2(x,z)),[]);}catch(e){continue;}
    const col=hex(AREA_COL[kind]||'#6a7a5a'),b=B('area'),y=kind==='water'?0.12:0.2;
    // cut to the ground's cells, so a field or a yard lies on the slope instead of bridging over the streets in a dip
    for(const f of tri){const t=f.map(k=>ring[k]);const cx0=Math.floor((Math.min(t[0][0],t[1][0],t[2][0])-ox)/step),cx1=Math.floor((Math.max(t[0][0],t[1][0],t[2][0])-ox)/step),cz0=Math.floor((Math.min(t[0][1],t[1][1],t[2][1])-oz)/step),cz1=Math.floor((Math.max(t[0][1],t[1][1],t[2][1])-oz)/step);
      for(let cj=cz0;cj<=cz1;cj++)for(let ci=cx0;ci<=cx1;ci++){const q=clipRect(t,ox+ci*step,oz+cj*step,ox+(ci+1)*step,oz+(cj+1)*step);if(q.length<3)continue;
        const v=q.map(([x,z])=>[x,gh(x,z)+y,z]);for(let k=1;k+1<v.length;k++)pushTri(b,v[0],v[k+1],v[k],[0,1,0],col);}}}
  // ---- the roads and the rail: ribbons over the ground, or on a deck (six metres a layer) ----
  // a road's heights: the ground along it, averaged over ~60 m either way (~180 m for a deck), never below the
  // ground; so a road runs smooth over what is left of the elevation's noise instead of dipping with each pit
  const profile=(pts,deck)=>{const g=pts.map(([x,z])=>gh(x,z)),K=deck?6:2,o=new Array(pts.length);
    for(let i=0;i<pts.length;i++){let a=0,n=0;for(let k=Math.max(0,i-K);k<=Math.min(pts.length-1,i+K);k++){a+=g[k];n++;}o[i]=deck?a/n+deck*6:Math.max(a/n,g[i])+0.3;}return o;};
  const ribbon=(pts0,w,col,deck,b)=>{const pts=pts0.length>1?densify(pts0,step):pts0,Y=profile(pts,deck);for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz);if(L<0.2)continue;const nx=-dz/L*w/2,nz=dx/L*w/2;
      const ya=Y[i],yb=Y[i+1],A=[ax+nx,ya,az+nz],Bv=[bx+nx,yb,bz+nz],Cv=[bx-nx,yb,bz-nz],D=[ax-nx,ya,az-nz];
      pushTri(b,A,Cv,Bv,[0,1,0],col);pushTri(b,A,D,Cv,[0,1,0],col);
      if(deck){const g2=B('deck'),dc=hex('#a8a69e');pushTri(g2,[A[0],ya-1.2,A[2]],[Bv[0],yb-1.2,Bv[2]],Bv,[nz,0,-nx],dc);pushTri(g2,[A[0],ya-1.2,A[2]],Bv,A,[nz,0,-nx],dc);
        pushTri(g2,D,Cv,[Cv[0],yb-1.2,Cv[2]],[-nz,0,nx],dc);pushTri(g2,D,[Cv[0],yb-1.2,Cv[2]],[D[0],ya-1.2,D[2]],[-nz,0,nx],dc);
        if(i%3===0){const h=ya-gh(ax,az)-1.2;if(h>2){const px=ax,pz=az,s=0.9;for(const [q,r] of [[s,s],[-s,s],[-s,-s],[s,-s]]){}const pc=hex('#9a988f');const P0=[px-s,gh(px,pz),pz-s],P1=[px+s,gh(px,pz),pz-s],P2=[px+s,ya-1.2,pz-s],P3=[px-s,ya-1.2,pz-s];
          pushTri(g2,P0,P1,P2,[0,0,-1],pc);pushTri(g2,P0,P2,P3,[0,0,-1],pc);const Q0=[px-s,gh(px,pz),pz+s],Q1=[px+s,gh(px,pz),pz+s],Q2=[px+s,ya-1.2,pz+s],Q3=[px-s,ya-1.2,pz+s];pushTri(g2,Q0,Q2,Q1,[0,0,1],pc);pushTri(g2,Q0,Q3,Q2,[0,0,1],pc);}}}}};
  // the roads, and their lines with heights for what moves on them (src/core/metrolife.js)
  const LIFE_C={motorway:1,trunk:1,primary:1,secondary:1,tertiary:1,residential:2,unclassified:2,living_street:3,pedestrian:3};out._lines=[];
  // the main roads' edges, by 50 m cell, for the shopfronts; the streets' poles, cables and vending machines
  // how many of the walls on a street of each class have a shop in them
  const SHOP_SHARE={primary:0.8,secondary:0.8,tertiary:0.7,trunk:0.5,pedestrian:0.95,living_street:0.5,residential:0.3,unclassified:0.3};
  const FRONT=new Map(),FC=50,fkey=(x,z)=>Math.floor(x/FC)+','+Math.floor(z/FC);
  const furnish=(pts,w,c)=>{if(c==='residential'||c==='unclassified'||c==='tertiary'){const fb=B('furn'),sb=B('sign'),pole=hex('#6a6862'),wire=hex('#1a1a1c');let run=0,last=null,n=0;
      for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.5)continue;const ux=(bx-ax)/L,uz=(bz-az)/L,sd=(hash(ax,az,5)<0.5?1:-1),off=w/2+0.9;
        for(let u=(30-run%30)%30;u<L;u+=30){const x=ax+ux*u-uz*off*sd,z=az+uz*u+ux*off*sd,g=gh(x,z);box(fb,x,g+4.5,z,0.32,9,0.32,0,pole);box(fb,x,g+8.2,z,1.6,0.12,0.12,Math.atan2(-uz,ux)+Math.PI/2,pole);
          if(last&&Math.hypot(x-last[0],z-last[2])<40){const mx=(x+last[0])/2,mz=(z+last[2])/2,my=(g+8.4+last[1])/2-0.35,ll=Math.hypot(x-last[0],z-last[2]);box(fb,mx,my,mz,ll,0.05,0.05,-Math.atan2(z-last[2],x-last[0]),wire);box(fb,mx,my-0.5,mz,ll,0.05,0.05,-Math.atan2(z-last[2],x-last[0]),wire);}
          last=[x,g+8.4,z];if((n++%4)===2&&hash(x,z,7)<0.6){const vx=x+ux*1.2,vz=z+uz*1.2;box(sb,vx,gh(vx,vz)+0.9,vz,1.0,1.8,0.75,-Math.atan2(uz,ux),SIGN_COLS[Math.floor(hash(vx,vz,9)*4)%2?3:Math.floor(hash(vx,vz,9)*8)]);}}
        run+=L;}}};
  // a landmark that is a bridge brings its own decks (clearDecks): the mapped ones there are left out
  const deckGone=(pts,deck)=>deck&&(CFG.deckClears||[]).some(([lx,lz,r])=>pts.some(([x,z])=>(x-lx)**2+(z-lz)**2<r*r));
  for(const [p,c,w,deck] of T.r||[]){const pts=[];for(let i=0;i<p.length;i+=2)pts.push([ox+p[i]/10,oz+p[i+1]/10]);if(deckGone(pts,deck))continue;ribbon(pts,w,hex(ROAD_COL[c]||'#4c4d50'),deck,B('road'));
    if(!deck&&pts.length>1){const dp=densify(pts,20);const share=SHOP_SHARE[c]||0;if(share)for(let i=0;i+1<dp.length;i++){const k=fkey((dp[i][0]+dp[i+1][0])/2,(dp[i][1]+dp[i+1][1])/2);if(!FRONT.has(k))FRONT.set(k,[]);FRONT.get(k).push([dp[i][0],dp[i][1],dp[i+1][0],dp[i+1][1],w,share]);}
      furnish(pts,w,c);}
    if(LIFE_C[c]&&pts.length>=2){const dp=densify(pts,step),Y=profile(dp,deck);out._lines.push([LIFE_C[c],w,dp.flatMap(([x,z],i)=>[Math.round(x*10)/10,Math.round(Y[i]*10)/10,Math.round(z*10)/10])]);}}
  for(const [p,c,deck] of T.l||[]){const pts=[];for(let i=0;i<p.length;i+=2)pts.push([ox+p[i]/10,oz+p[i+1]/10]);ribbon(pts,c==='rail'?4:3,hex('#5a544c'),deck||(c==='monorail'?2:0),B('road'));}
  // ---- the buildings: walls in the engine's facade styles (by kind, height, share), roofs flat ----
  const STY=CFG.styles||[];
  // a wall facing a main road within a few metres: a lit shop window, an awning over it, and on one in two a
  // vertical sign (the tategaki boards up the side of every shotengai building)
  const ST=out._stats={walls:0,listed:0,fronts:0,segs:0};for(const v of FRONT.values())ST.segs+=v.length;
  const front=(a,b,L,nx,nz,g0,H,hs)=>{ST.walls++;const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,list=FRONT.get(fkey(mx,mz));if(!list)return;ST.listed++;let ok=false;
    let share=0;for(const [x1,z1,x2,z2,w,sh] of list){const dx=x2-x1,dz=z2-z1,l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((mx-x1)*dx+(mz-z1)*dz)/l2)),px=x1+dx*t-mx,pz=z1+dz*t-mz,d=Math.hypot(px,pz);
      // the wall must face the road (either way round: the shop is put on the road's side of it)
      if(d<w/2+9&&Math.abs(px*nx+pz*nz)>0.6*d){ok=true;share=sh;if(px*nx+pz*nz<0){nx=-nx;nz=-nz;}break;}}
    if(!ok||((hs*389)%1)>share)return;ST.fronts++;if(!ST.at)ST.at=[Math.round(mx),Math.round(g0),Math.round(mz),Math.round(nx*100)/100,Math.round(nz*100)/100];const sb=B('sign'),fb=B('furn'),ry=-Math.atan2(b[1]-a[1],b[0]-a[0]),W=Math.min(L-1,14);
    box(sb,mx+nx*0.06,g0+1.5,mz+nz*0.06,W,2.4,0.1,ry,hex(['#f2e6c8','#e8f0f2','#f8e0b0'][Math.floor(hs*7)%3]));
    box(fb,mx+nx*0.7,g0+3.0,mz+nz*0.7,W,0.12,1.4,ry,AWN[Math.floor(hs*31)%AWN.length]);
    if(H>9&&((hs*53)%1)<0.5){const e=((hs*71)%1)<0.5?0.15:0.85,sx=a[0]+(b[0]-a[0])*e+nx*0.7,sz=a[1]+(b[1]-a[1])*e+nz*0.7,sh=Math.min(H-4.5,4+((hs*91)%1)*7);
      box(sb,sx,g0+4+sh/2,sz,0.25,sh,1.2,ry,SIGN_COLS[Math.floor(hs*977)%SIGN_COLS.length]);}};
  for(const [p,h10,m10,kc,cc] of T.b||[]){const ring=[];for(let i=0;i<p.length;i+=2)ring.push([ox+p[i]/10,oz+p[i+1]/10]);if(ring.length<3)continue;
    let cx=0,cz=0;for(const [x,z] of ring){cx+=x;cz+=z;}cx/=ring.length;cz/=ring.length;
    if((CFG.clears||[]).some(([lx,lz,r])=>(cx-lx)**2+(cz-lz)**2<r*r))continue;   // a landmark's own model stands here
    let g0=1e9;for(const [x,z] of ring)g0=Math.min(g0,gh(x,z));
    const H=h10/10,h=g0+H,m0=g0+(m10||0)/10,kind=KINDS[kc]||'yes',hs=hash(cx,cz,3);
    let st=null;for(const s of STY){if(s.types&&!s.types.includes(kind))continue;if(H<s.minH||H>s.maxH)continue;if(s.share<1&&((hs*977+s.salt*0.37)%1)>=s.share)continue;st=s;break;}
    const key=st?st.key:(H>30?'tower':'low'),bay=st?st.bay*4:(H>30?3:(CFG.bay||3.5)),fl=st?st.floor*4:(H>30?3.6:(CFG.floor||3.6));
    const col=cc&&/^#[0-9a-f]{6}$/i.test(cc)?hex(cc):st&&st.colours.length?hex(st.colours[Math.floor((hs*313)%1*st.colours.length)]):hex((H>30?CFG.stone:CFG.brick)[Math.floor(hs*997)%(H>30?CFG.stone:CFG.brick).length]);
    const wb=B('w:'+key);let area=0;for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];area+=a[0]*b[1]-b[0]*a[1];}const sg=area>0?1:-1;let per=0;
    for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<0.05)continue;const nx=(b[1]-a[1])/L*sg,nz=-(b[0]-a[0])/L*sg,u0=per/bay,u1=(per+L)/bay;per+=L;
      const A=[a[0],h,a[1]],Bv=[b[0],h,b[1]],Cv=[b[0],m0,b[1]],D=[a[0],m0,a[1]],vt=(h-g0)/fl,vb=(m0-g0)/fl;
      pushTri(wb,A,Bv,Cv,[nx,0,nz],col,[[u0,vt],[u1,vt],[u1,vb]]);pushTri(wb,A,Cv,D,[nx,0,nz],col,[[u0,vt],[u1,vb],[u0,vb]]);
      if(L>4&&H>5&&H<60&&m0-g0<1)front(a,b,L,nx,nz,g0,H,hs+i*0.137);}
    let tri;try{tri=THREE.ShapeUtils.triangulateShape(ring.map(([x,z])=>new THREE.Vector2(x,z)),[]);}catch(e){tri=[];}
    const rc=[col[0]*0.72,col[1]*0.72,col[2]*0.72],rb=B('roof');for(const f of tri){const v=f.map(k=>[ring[k][0],h,ring[k][1]]);pushTri(rb,v[0],v[2],v[1],[0,1,0],rc);}}
  return out;}

// the skyline: the tall buildings of a block as plain prisms (walls in the tower style, roofs), the ground taken from the tile they were in
function skyline(SK,bx,bz){const SB=CFG.skylineBlock,ox=bx*SB,oz=bz*SB,out={};const B=k=>out[k]||(out[k]=Buf(k.startsWith('w:')));
  for(const [p,h10,g10,cc] of SK.b){const ring=[];for(let i=0;i<p.length;i+=2)ring.push([ox+p[i]/10,oz+p[i+1]/10]);const g0=g10/10,h=g0+h10/10;
    {let cx=0,cz=0;for(const [x,z] of ring){cx+=x;cz+=z;}cx/=ring.length;cz/=ring.length;if((CFG.clears||[]).some(([lx,lz,r])=>(cx-lx)**2+(cz-lz)**2<r*r))continue;}   // a landmark's own model
    const col=cc&&/^#[0-9a-f]{6}$/i.test(cc)?hex(cc):hex(CFG.stone[Math.floor(hash(ring[0][0],ring[0][1],5)*CFG.stone.length)]),wb=B('w:tower');let area=0;for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];area+=a[0]*b[1]-b[0]*a[1];}const sg=area>0?1:-1;let per=0;
    for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<0.05)continue;const nx=(b[1]-a[1])/L*sg,nz=-(b[0]-a[0])/L*sg,u0=per/3,u1=(per+L)/3;per+=L;
      pushTri(wb,[a[0],h,a[1]],[b[0],h,b[1]],[b[0],g0,b[1]],[nx,0,nz],col,[[u0,(h-g0)/3.6],[u1,(h-g0)/3.6],[u1,0]]);pushTri(wb,[a[0],h,a[1]],[b[0],g0,b[1]],[a[0],g0,a[1]],[nx,0,nz],col,[[u0,(h-g0)/3.6],[u1,0],[u0,0]]);}
    let tri;try{tri=THREE.ShapeUtils.triangulateShape(ring.map(([x,z])=>new THREE.Vector2(x,z)),[]);}catch(e){tri=[];}const rb=B('roof'),rc=[col[0]*0.72,col[1]*0.72,col[2]*0.72];for(const f of tri){const v=f.map(k=>[ring[k][0],h,ring[k][1]]);pushTri(rb,v[0],v[2],v[1],[0,1,0],rc);}}
  return out;}

function pack(out){const msg={},tr=[];for(const k in out){if(k==='_lines'||k==='_stats'){msg[k]=out[k];continue;}const b=out[k];if(!b.p.length)continue;const o={p:new Float32Array(b.p),n:new Float32Array(b.n),c:new Float32Array(b.c)};if(b.u)o.u=new Float32Array(b.u);msg[k]=o;tr.push(o.p.buffer,o.n.buffer,o.c.buffer);if(o.u)tr.push(o.u.buffer);}return [msg,tr];}

self.onmessage=async e=>{const m=e.data;
  if(m.cfg){CFG=m.cfg;return;}
  try{if(m.tile){const [tx,tz]=m.tile,T=await load(m.url),[msg,tr]=pack(build(T,tx,tz));self.postMessage({id:m.id,tile:m.tile,geo:msg,ground:T.g},tr);}
    else if(m.sky){const [bx,bz]=m.sky,SK=await load(m.url),[msg,tr]=pack(skyline(SK,bx,bz));self.postMessage({id:m.id,sky:m.sky,geo:msg},tr);}}
  catch(err){self.postMessage({id:m.id,error:String(err),tile:m.tile,sky:m.sky});}};
