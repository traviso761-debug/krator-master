// ---------- Chernobyl: the people and machines the events bring ----------
// route(a, b): the shortest way by the mapped roads between two points [x, z] (Dijkstra over the ways' points, joined
// where they meet to the metre), as a line; path(line): its length and the point and heading at a distance along it.
// fireEngine(ladder): a ZIL-130 tanker in red with a white band and a blue light, or (ladder) an AL-30 with its 30 m
// ladder on a turntable (eng.ladder: a pivot to raise, its child to extend). person(suit, helmet): a figure 1.8 m
// tall, its legs swinging while it walks (walk(p, k)). heli(): a Mi-8 in olive, its rotors turning (spin(dt)).
// All plain meshes, tagged out of the layout fingerprint by the caller's `tag`.
export function makeCrews(api,{tag}){
  const {THREE,ROADS}=api;
  let G=null;
  function graph(){if(G)return G;const id=new Map(),xy=[],adj=[];
    const node=(x,z)=>{const k=Math.round(x)+','+Math.round(z);let i=id.get(k);if(i===undefined){i=xy.length;id.set(k,i);xy.push([x,z]);adj.push([]);}return i;};
    for(const r of ROADS||[]){const p=r.pts;if(!p||p.length<2)continue;let a=node(p[0][0],p[0][1]);
      for(let i=1;i<p.length;i++){const b=node(p[i][0],p[i][1]);if(a!==b){const d=Math.hypot(xy[a][0]-xy[b][0],xy[a][1]-xy[b][1]);adj[a].push(b,d);adj[b].push(a,d);}a=b;}}
    return G={xy,adj};}
  const nearest=(x,z)=>{const {xy}=graph();let bi=0,bd=Infinity;for(let i=0;i<xy.length;i++){const d=(xy[i][0]-x)**2+(xy[i][1]-z)**2;if(d<bd){bd=d;bi=i;}}return bi;};
  function route(a,b){const {xy,adj}=graph();if(!xy.length)return [a,b];const s=nearest(a[0],a[1]),e=nearest(b[0],b[1]),n=xy.length;
    const dist=new Float64Array(n).fill(Infinity),prev=new Int32Array(n).fill(-1),H=[];
    const push=(d,i)=>{H.push([d,i]);let k=H.length-1;while(k>0){const p=(k-1)>>1;if(H[p][0]<=H[k][0])break;[H[p],H[k]]=[H[k],H[p]];k=p;}};
    const pop=()=>{const top=H[0],last=H.pop();if(H.length){H[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<H.length&&H[l][0]<H[m][0])m=l;if(r<H.length&&H[r][0]<H[m][0])m=r;if(m===k)break;[H[m],H[k]]=[H[k],H[m]];k=m;}}return top;};
    dist[s]=0;push(0,s);while(H.length){const [d,i]=pop();if(i===e)break;if(d>dist[i])continue;const A=adj[i];
      for(let k=0;k<A.length;k+=2){const j=A[k],nd=d+A[k+1];if(nd<dist[j]){dist[j]=nd;prev[j]=i;push(nd,j);}}}
    const mid=[];if(s===e||prev[e]>=0)for(let i=e;i>=0;i=prev[i])mid.push(xy[i]);return [a,...mid.reverse(),b];}
  function path(line){const cum=[0];for(let i=1;i<line.length;i++)cum.push(cum[i-1]+Math.hypot(line[i][0]-line[i-1][0],line[i][1]-line[i-1][1]));const LEN=cum[cum.length-1];
    return {LEN,line,at(s){s=Math.max(0,Math.min(LEN-0.01,s));let i=1;while(i<cum.length-1&&cum[i]<s)i++;const u=(s-cum[i-1])/Math.max(1e-6,cum[i]-cum[i-1]),[ax,az]=line[i-1],[bx,bz]=line[i];
      return [ax+(bx-ax)*u,az+(bz-az)*u,Math.atan2(bx-ax,bz-az)];}};}
  // ---- the fire engines ----
  const M=c=>new THREE.MeshLambertMaterial({color:c});
  const RED=M(0xb8261e),WHITE=M(0xe8e4dc),DARK=M(0x24221e),GLASS=M(0x2a3440),STEEL=M(0x9aa0a4),HOSE=M(0xd8d0b0);
  const box=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);return o;};
  const lightTex=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),gr=g.createRadialGradient(16,16,0,16,16,16);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(c);})();
  function fireEngine(ladder){const g=new THREE.Group();
    g.add(box(2.4,0.5,7.6,DARK,0,0.9,0),box(2.4,2.2,2.0,RED,0,2.2,2.7),box(2.3,0.8,0.1,GLASS,0,2.7,3.71),box(2.5,2.4,5.0,RED,0,2.3,-1.0),box(2.52,0.3,5.02,WHITE,0,2.0,-1.0));
    for(const z of [2.6,-1.4,-2.9])for(const x of [-1.1,1.1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.4,10).rotateZ(Math.PI/2),DARK);w.position.set(x,0.5,z);g.add(w);}
    const beacon=new THREE.Sprite(new THREE.SpriteMaterial({map:lightTex,color:0x4a7aff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));beacon.position.set(0,3.6,2.9);beacon.scale.setScalar(2.4);g.add(beacon);
    const e={g,beacon,ladder:null,ext:null};
    if(ladder){const piv=new THREE.Group();piv.position.set(0,3.6,-3.2);const ext=new THREE.Group();
      for(const x of [-0.35,0.35])ext.add(box(0.12,0.16,1,STEEL,x,0,0.5));for(let z=0.1;z<1;z+=0.1)ext.add(box(0.7,0.06,0.05,STEEL,0,0,z));
      ext.scale.z=8;piv.add(ext);piv.add(box(1.2,0.6,1.2,STEEL,0,-0.3,0));g.add(piv);e.ladder=piv;e.ext=ext;}
    tag(g);return e;}
  // ---- people ----
  function person(suit,helmet){const g=new THREE.Group(),S=M(suit),Hm=M(helmet);
    const legL=box(0.22,0.85,0.25,S,-0.13,0.43,0),legR=box(0.22,0.85,0.25,S,0.13,0.43,0);legL.geometry.translate(0,-0.43,0);legR.geometry.translate(0,-0.43,0);legL.position.y=legR.position.y=0.86;
    g.add(legL,legR,box(0.52,0.7,0.3,S,0,1.2,0));const head=new THREE.Mesh(new THREE.SphereGeometry(0.13,8,6),M(0xd8b49a));head.position.y=1.68;g.add(head);
    const hat=new THREE.Mesh(new THREE.SphereGeometry(0.17,8,6,0,Math.PI*2,0,Math.PI/2),Hm);hat.position.y=1.72;g.add(hat);
    g.userData.walk=(p,k)=>{const a=Math.sin(p)*0.5*k;legL.rotation.x=a;legR.rotation.x=-a;};return tag(g);}
  // ---- the Mi-8 ----
  function heli(){const g=new THREE.Group(),O=M(0x5a6648),D=M(0x3e4636);
    g.add(box(2.4,2.4,10,O,0,0,0.5),box(2.2,1.2,1.4,GLASS,0,0.4,6.0),box(0.7,0.7,9,O,0,0.6,-8.5),box(0.25,2.6,1.4,O,0,1.6,-12.6),box(1.4,0.8,3.4,D,0,1.6,0.8));
    for(const x of [-1.2,1.2])g.add(box(0.15,0.15,3,D,x,-1.6,1));
    const rot=new THREE.Group();rot.position.set(0,2.2,0.6);for(let i=0;i<5;i++){const b=box(0.5,0.08,10.6,D,0,0,5.3);const k=new THREE.Group();k.rotation.y=i/5*Math.PI*2;k.add(b);rot.add(k);}g.add(rot);
    const tr=new THREE.Group();tr.position.set(0.35,1.6,-12.6);for(let i=0;i<3;i++){const b=box(0.05,1.95,0.25,D,0,0.97,0);const k=new THREE.Group();k.rotation.x=i/3*Math.PI*2;k.add(b);tr.add(k);}g.add(tr);
    return {g:tag(g),spin(dt){rot.rotation.y+=dt*20;tr.rotation.x+=dt*40;}};}
  // a hose: a line through points, its points set each frame
  function hose(n=3){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));
    const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xd8d0b0}));l.frustumCulled=false;
    l.userData.set=pts=>{const a=geo.attributes.position.array;pts.forEach((p,i)=>{a[i*3]=p[0];a[i*3+1]=p[1];a[i*3+2]=p[2];});geo.attributes.position.needsUpdate=true;};return tag(l);}
  return {route,path,fireEngine,person,heli,hose,HOSE};
}
