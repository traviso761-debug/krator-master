// ---------- Rama: the inside ----------
// Built in Rama's own frame (src/rama/shape.js) and hung off the group that spins, so it turns with the hull.
// Nothing in here is lit by the scene: the only light inside Rama is its own, the six Straight Valleys, and it
// falls on every square metre of the plains from across the axis. So the shading is baked into the vertices
// (a face toward the axis full, a face along the drum less), and the light LEVEL is one number every baked
// material is multiplied by. That number is what the Dawn, the darkness and the lightning change.
//
//   Northern Plain   textured by sector (the three strips between the valleys): Raman ground in muted plates,
//                    the roads, and the six "cities" the explorers named London, Paris, Peking, Tokyo, Rome
//                    and Moscow, windowless buildings set down in threes. Camp Alpha at the foot of Alpha
//   the valleys      trenches the length of each plain with the suns in their floors
//   the Sea          a ring of water (or ice) round the waist; New York on its island, three identical sectors
//   Southern Plain   a patchwork of tiles, the same in each of its three sectors
//   the bowls        the Northern Bowl's terraces and its three stairways, the hub's airlocks; the Southern
//                    Bowl and its horns, the Big Horn on the axis and six Little Horns held by flying buttresses
//   the air          clouds that gather toward the axis once the Sea thaws; the lightning round the horns
import {mkRng,hash3} from '../core/rng.js';
import {trackKeys,trackPointers,FAST} from '../core/input.js';
import {createCylinderWalker} from '../core/cylinder.js';

export function buildInterior(api,O){
  const {THREE,scene,camera,renderer,animHooks}=api;
  const {SPIN,cut,S,LS}=O;
  const rnd=mkRng(S.seed+1);
  const IN=new THREE.Group();IN.visible=false;IN.name='interior';SPIN.add(IN);
  const col=h=>new THREE.Color(h);
  const TAU=Math.PI*2;

  // ---------- materials ----------
  // Every material in here is multiplied by the light level each frame; `baked` is the list of them.
  const baked=[];
  const vM=(side,extra)=>{const m=new THREE.MeshBasicMaterial(Object.assign({vertexColors:true,side:side||THREE.DoubleSide,clippingPlanes:[cut],fog:true},extra||{}));baked.push(m);return m;};
  const tM=(map,extra)=>{const m=new THREE.MeshBasicMaterial(Object.assign({map,side:THREE.DoubleSide,clippingPlanes:[cut],fog:true},extra||{}));baked.push(m);return m;};
  // The close-up texture of the plains. A MeshBasicMaterial's light map multiplies its colour, so a grey
  // texture in it, tiled every 24 m on its own coordinates, puts slabs, joints and grit under your feet
  // without changing the plains' colours from a distance (it fades into its mipmaps).
  const detailT=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),R=mkRng(4242);
    g.fillStyle='#e6e6e6';g.fillRect(0,0,256,256);
    for(let y=0;y<256;y+=64)for(let x=0;x<256;x+=(y/64)%2?64:128){const v=210+Math.floor(R()*40);g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(x+2,y+2,((y/64)%2?64:128)-4,60);}
    for(let k=0;k<2200;k++){const v=150+Math.floor(R()*110);g.fillStyle='rgba('+v+','+v+','+v+',0.5)';g.fillRect(R()*256,R()*256,1+R()*2,1+R()*2);}
    g.strokeStyle='rgba(120,120,120,0.9)';g.lineWidth=2;for(let y=0;y<=256;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();}
    for(let y=0;y<256;y+=64)for(let x=0;x<=256;x+=(y/64)%2?64:128){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+64);g.stroke();}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;})();
  const plainM=map=>tM(map,{lightMap:detailT,lightMapIntensity:1.16});
  const greyTex=(w,h,paint,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');paint(g,w,h);
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;};
  // Raman walls: no windows and no doors, only panels - seams up them every few metres, a band across every
  // storey's height, the odd recessed panel. It multiplies the baked colour, so it is greys a little under white.
  const facadeT=greyTex(128,128,(g,W,H)=>{const R=mkRng(808);g.fillStyle='rgb(236,236,236)';g.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=32)for(let y=0;y<H;y+=64){const v=222+Math.floor(R()*30);g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(x+2,y+3,28,58);
      if(R()<0.2){g.fillStyle='rgb(196,196,196)';g.fillRect(x+8,y+14,16,36);}}
    g.fillStyle='rgb(168,168,168)';for(let x=0;x<W;x+=32)g.fillRect(x,0,2,H);for(let y=0;y<H;y+=64)g.fillRect(0,y,W,3);
    g.fillStyle='rgb(250,250,250)';for(let y=0;y<H;y+=64)g.fillRect(0,y+3,W,1);});
  // New York's towers: taller, so ribs - close vertical fins the height of the tower, and a dark band every
  // so often. The towers' tops are the same texture seen flat, which reads as roof plating.
  const towerT=greyTex(128,128,(g,W,H)=>{g.fillStyle='rgb(228,230,232)';g.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=16){g.fillStyle='rgb(160,164,168)';g.fillRect(x,0,3,H);g.fillStyle='rgb(252,252,252)';g.fillRect(x+3,0,2,H);}
    g.fillStyle='rgba(90,94,100,0.55)';g.fillRect(0,56,W,10);g.fillStyle='rgba(255,255,255,0.4)';g.fillRect(0,66,W,2);});
  // The Sea's surface, in its light map as the plains' detail is: ripples, drawn out round the world by the wind,
  // and drifting; and the ice that was there first, white with dark cracks.
  const rippleT=greyTex(256,256,(g,W,H)=>{const R=mkRng(919);g.fillStyle='rgb(214,214,214)';g.fillRect(0,0,W,H);
    for(let k=0;k<700;k++){const x=R()*W,y=R()*H,l=6+R()*26,v=R()<0.5?255:150;g.fillStyle='rgba('+v+','+v+','+v+',0.35)';
      for(const dx of [-W,0,W])for(const dy of [-H,0,H]){g.beginPath();g.ellipse(x+dx,y+dy,l,1.2+R()*1.5,0,0,Math.PI*2);g.fill();}}});
  const iceT=greyTex(256,256,(g,W,H)=>{const R=mkRng(920);g.fillStyle='rgb(240,240,240)';g.fillRect(0,0,W,H);
    for(let k=0;k<160;k++){const v=200+Math.floor(R()*50);g.fillStyle='rgba('+v+','+v+','+v+',0.6)';g.beginPath();g.arc(R()*W,R()*H,4+R()*20,0,Math.PI*2);g.fill();}
    g.strokeStyle='rgba(110,118,124,0.8)';g.lineWidth=1.2;for(let k=0;k<40;k++){let x=R()*W,y=R()*H;g.beginPath();g.moveTo(x,y);for(let q=0;q<8;q++){x+=(R()-0.5)*50;y+=(R()-0.5)*50;g.lineTo(x,y);}g.stroke();}});
  // the suns and the crew's lamps are not lit by anything: they are the light
  const sunMat=new THREE.MeshBasicMaterial({color:0xfffaf0,side:THREE.DoubleSide,clippingPlanes:[cut],fog:true});
  const glareMat=new THREE.MeshBasicMaterial({color:0xfff2d8,transparent:true,opacity:0.2,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,clippingPlanes:[cut],fog:true});
  const lampMat=new THREE.MeshBasicMaterial({color:0xffe6b0,clippingPlanes:[cut],fog:true});
  const beamMat=new THREE.MeshBasicMaterial({map:(()=>{const c=document.createElement('canvas');c.width=128;c.height=4;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,128,0);
      gr.addColorStop(0,'rgb(255,244,214)');gr.addColorStop(0.08,'rgb(150,140,120)');gr.addColorStop(0.4,'rgb(40,36,30)');gr.addColorStop(1,'rgb(0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,4);return new THREE.CanvasTexture(c);})(),
    transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,clippingPlanes:[cut],fog:true});

  // ---------- building blocks ----------
  // A surface of the drum seen from inside: angles[] round, ys[] along, its radius rf(a,y) and its colour
  // paint(a,y,c); keep(a,y) drops the quads it says no to (New York out of the Sea).
  function drumSurface(angles,ys,rf,paint,mat,keep){
    const na=angles.length,ny=ys.length,pos=new Float32Array(na*ny*3),cl=new Float32Array(na*ny*3),c=new THREE.Color();
    let k=0;for(const y of ys)for(const a of angles){const r=rf(a,y);pos[k]=Math.cos(a)*r;pos[k+1]=y;pos[k+2]=Math.sin(a)*r;
      c.setRGB(1,1,1);if(paint)paint(a,y,c);cl[k]=c.r;cl[k+1]=c.g;cl[k+2]=c.b;k+=3;}
    const idx=[];for(let j=0;j<ny-1;j++)for(let i=0;i<na-1;i++){
      if(keep&&!keep((angles[i]+angles[i+1])/2,(ys[j]+ys[j+1])/2))continue;const q=j*na+i;idx.push(q,q+1,q+na,q+1,q+na+1,q+na);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(cl,3));
    g.setIndex(idx);g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.frustumCulled=false;return m;}
  // the same with texture coordinates: u across the angles, v along the ys, from 0 to 1; and a second set in
  // metres over DETAIL, for the close-up texture the plains carry in their light map
  const DETAIL=24;
  function drumPatch(a0,a1,na,y0,y1,ny,r,mat){
    const pos=[],uv=[],uv2=[],idx=[];for(let j=0;j<=ny;j++){const y=y0+(y1-y0)*j/ny;for(let i=0;i<=na;i++){const a=a0+(a1-a0)*i/na;
      pos.push(Math.cos(a)*r,y,Math.sin(a)*r);uv.push(i/na,j/ny);uv2.push((a-a0)*r/DETAIL,(y-y0)/DETAIL);}}
    for(let j=0;j<ny;j++)for(let i=0;i<na;i++){const q=j*(na+1)+i;idx.push(q,q+1,q+na+1,q+1,q+na+2,q+na+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.setAttribute('uv2',new THREE.Float32BufferAttribute(uv2,2));
    g.setIndex(idx);g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.frustumCulled=false;return m;}
  const range=(a,b,n)=>{const o=[];for(let i=0;i<=n;i++)o.push(a+(b-a)*i/n);return o;};

  // Where a thing stands: on the inside of the drum at (a, y), its foot at radius r, its +y toward the axis and
  // its +z along the axis, turned `rot` about its own up.
  const _x=new THREE.Vector3(),_u=new THREE.Vector3(),_z=new THREE.Vector3(),_rot=new THREE.Matrix4();
  function placeOn(a,y,r,rot){const M=new THREE.Matrix4();
    _x.set(-Math.sin(a),0,Math.cos(a));_u.set(-Math.cos(a),0,-Math.sin(a));_z.set(0,-1,0);
    M.makeBasis(_x,_u,_z);M.setPosition(Math.cos(a)*r,y,Math.sin(a)*r);if(rot)M.multiply(_rot.makeRotationY(rot));return M;}
  // the same for something that moves: heading 0 is along +axis (north), PI/2 round the drum; +z is forward
  const _f=new THREE.Vector3(),_m4=new THREE.Matrix4();
  function orient(o,a,y,r,head,pitch){_u.set(-Math.cos(a),0,-Math.sin(a));const tx=-Math.sin(a),tz=Math.cos(a);
    _f.set(tx*Math.sin(head),Math.cos(head),tz*Math.sin(head));
    if(pitch){_f.multiplyScalar(Math.cos(pitch)).addScaledVector(_u,Math.sin(pitch)).normalize();_u.addScaledVector(_f,-_u.dot(_f)).normalize();}
    _x.crossVectors(_u,_f);_m4.makeBasis(_x,_u,_f);o.quaternion.setFromRotationMatrix(_m4);o.position.set(Math.cos(a)*r,y,Math.sin(a)*r);}

  // A batch of solid things merged into one mesh, each shaded once by how far its face turns to the axis
  // (where the light comes from, across the drum) - flat-shaded, because Raman buildings are all planes.
  // Each vertex also gets texture coordinates in its part's own metres (over UVS): a wall's run along it and its
  // height, a roof's plan. So one facade texture tiles at the same size on a hut and on a tower.
  const UVS=12;
  function Batch(){const pos=[],cl=[],uvs=[];const v=new THREE.Vector3(),n=new THREE.Vector3(),nm=new THREE.Matrix3(),inw=new THREE.Vector3(),c=new THREE.Color(),lp=new THREE.Vector3(),ln=new THREE.Vector3();
    return {add(geo,M,colour,amb){const g=geo.index?geo.toNonIndexed():geo.clone();g.computeVertexNormals();nm.getNormalMatrix(M);
        const p=g.attributes.position,nn=g.attributes.normal,A=amb===undefined?0.5:amb;
        for(let i=0;i<p.count;i++){lp.fromBufferAttribute(p,i);ln.fromBufferAttribute(nn,i);
          if(Math.abs(ln.y)>0.7)uvs.push(lp.x/UVS,lp.z/UVS);else uvs.push((Math.abs(ln.x)>Math.abs(ln.z)?lp.z:lp.x)/UVS,lp.y/UVS);
          v.copy(lp).applyMatrix4(M);n.copy(ln).applyMatrix3(nm).normalize();
          inw.set(-v.x,0,-v.z).normalize();const k=A+(1-A)*Math.max(0,n.dot(inw))+0.12*Math.max(0,n.y)-0.08*Math.max(0,-n.y);
          c.copy(colour).multiplyScalar(Math.max(0.2,k));pos.push(v.x,v.y,v.z);cl.push(c.r,c.g,c.b);}
        g.dispose();},
      mesh(mat){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));
        g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
        g.computeBoundingSphere();const m=new THREE.Mesh(g,mat||vM(THREE.FrontSide));m.frustumCulled=false;return m;},
      get count(){return pos.length/3;}};}
  // a rod between two points in the drum frame
  function rod(batch,p,q,r0,r1,colour,seg){const d=new THREE.Vector3().subVectors(q,p),L=d.length();
    const g=new THREE.CylinderGeometry(r1,r0,L,seg||8);const M=new THREE.Matrix4();
    const quat=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());
    M.compose(p.clone().addScaledVector(d,0.5),quat,new THREE.Vector3(1,1,1));batch.add(g,M,colour,0.55);}
  // a surface of revolution about the axis, baked: profile [[r, y]...]
  function latheBaked(batch,profile,seg,colour,M){const pts=profile.map(([r,y])=>new THREE.Vector2(Math.max(0.01,r),y));
    if(pts.length>1&&pts[pts.length-1].y<pts[0].y)pts.reverse();
    batch.add(new THREE.LatheGeometry(pts,seg),M||new THREE.Matrix4(),colour,0.45);}

  // ---------- painting the plains ----------
  const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const texOf=c=>{const t=new THREE.CanvasTexture(c);t.flipY=false;t.anisotropy=8;t.minFilter=THREE.LinearMipmapLinearFilter;return t;};
  const hw=S.VW/2, wallA=(R)=>(hw+6)/R;

  function litEdges(g,W,H){for(const [x0,dir] of [[0,1],[W,-1]]){
      let gr=g.createLinearGradient(x0,0,x0+dir*260,0);gr.addColorStop(0,'rgba(255,238,196,0.34)');gr.addColorStop(0.3,'rgba(255,232,186,0.11)');gr.addColorStop(1,'rgba(255,232,186,0)');
      g.fillStyle=gr;g.fillRect(Math.min(x0,x0+dir*260),0,260,H);
      gr=g.createLinearGradient(x0,0,x0+dir*7,0);gr.addColorStop(0,'rgba(40,34,28,0.6)');gr.addColorStop(1,'rgba(40,34,28,0)');g.fillStyle=gr;g.fillRect(Math.min(x0,x0+dir*7),0,7,H);}}
  // the six cities of the Northern Plain, two to a sector, and what each is built of
  const CITIES=[
    {name:'London',sector:0,a:S.STAIRS[0].a+0.11,y:14200,r:900,style:'blocks',info:'Named by the explorers, like the rest: low windowless blocks in a rough grid, set down in threes. The last expedition cut its way into one of London\'s buildings with a laser and found it full of holograms, among them a uniform for something with three arms and three legs.'},
    {name:'Paris',sector:0,a:S.STAIRS[0].a-0.13,y:8600,r:800,style:'drums',info:'Drums and domes, and long sheds between them, in threes. Nothing in it has a window or a door anyone could find.'},
    {name:'Peking',sector:1,a:S.STAIRS[1].a+0.12,y:14600,r:950,style:'stepped',info:'Stepped blocks round a square in nested rings, like a plan of a walled city, which is where the name came from.'},
    {name:'Tokyo',sector:1,a:S.STAIRS[1].a-0.12,y:9000,r:750,style:'prisms',info:'Three-sided prisms packed close, the densest of the six. Ramans built in threes.'},
    {name:'Rome',sector:2,a:S.STAIRS[2].a+0.1,y:13300,r:850,style:'domes',info:'Domes and rings round a great central dome.'},
    {name:'Moscow',sector:2,a:S.STAIRS[2].a-0.11,y:8900,r:800,style:'spires',info:'Tall cones and spires, the tallest structures on the Northern Plain.'},
  ];
  const sectorN=i=>{const a0=S.VAL_N[i]+wallA(S.RI),a1=(i<2?S.VAL_N[i+1]:TAU)-wallA(S.RI);return [a0,a1];};
  const sectorS=i=>{const a0=S.VAL_S[i]+wallA(S.RS),a1=(i<2?S.VAL_S[i+1]:S.VAL_S[0]+TAU)-wallA(S.RS);return [a0,a1];};

  // The Northern Plain, one canvas per sector: Raman ground in large muted plates, a finer grid of seams, the
  // roads from the foot of the stairway past both cities to the cliff, the cities' paved grounds, and Camp Alpha.
  const NW=2048,NH=1024;
  function paintNorth(i){const [a0,a1]=sectorN(i),c=canvas(NW,NH),g=c.getContext('2d'),R=mkRng(S.seed*7+i);
    const X=a=>(a-a0)/(a1-a0)*NW,Y=y=>(y-S.SH)/(S.PE-S.SH)*NH;
    const tones=['#8a8274','#837b6e','#91897a','#7c7568','#968d7c','#867f73'];
    g.fillStyle='#878071';g.fillRect(0,0,NW,NH);
    // the big plates: rectangles of slightly different stone, a few hundred metres across
    for(let y=0;y<NH;){const h=18+R()*40;for(let x=0;x<NW;){const w=30+R()*70;g.fillStyle=tones[Math.floor(R()*tones.length)];g.fillRect(x,y,w,h);x+=w;}y+=h;}
    // patterns in some of them: rings, hatched squares and herringbone, the kind of thing that looks meant
    for(let k=0;k<70;k++){const x=R()*NW,y=R()*NH,s=20+R()*50;g.strokeStyle='rgba(60,54,46,0.35)';g.lineWidth=1.2;
      const t=R();if(t<0.33){for(let q=1;q<=3;q++){g.beginPath();g.arc(x,y,s*q/3,0,TAU);g.stroke();}}
      else if(t<0.66){for(let q=0;q<s;q+=5){g.beginPath();g.moveTo(x+q,y);g.lineTo(x+q,y+s);g.stroke();}}
      else{for(let q=0;q<s;q+=6){g.beginPath();g.moveTo(x,y+q);g.lineTo(x+s/2,y+q+6);g.lineTo(x+s,y+q);g.stroke();}}}
    // the seams: a grid every half kilometre, which is how the plain reads from the hub
    g.strokeStyle='rgba(48,44,38,0.45)';g.lineWidth=1;
    for(let y=S.SH;y<S.PE;y+=500){g.beginPath();g.moveTo(0,Y(y));g.lineTo(NW,Y(y));g.stroke();}
    for(let a=a0;a<a1;a+=500/S.RI){g.beginPath();g.moveTo(X(a),0);g.lineTo(X(a),NH);g.stroke();}
    // the valleys' edges: a scorched lip, then the ground beside a sun lit warm and bright for a kilometre or two
    litEdges(g,NW,NH);
    // the cities' grounds and the roads
    const st=S.STAIRS[i],cs=CITIES.filter(q=>q.sector===i).sort((p,q)=>q.y-p.y);
    for(const q of cs){g.fillStyle='#a49c8a';g.beginPath();g.ellipse(X(q.a),Y(q.y),q.r/S.RI/(a1-a0)*NW,q.r/(S.PE-S.SH)*NH,0,0,TAU);g.fill();
      g.strokeStyle='#b8b09c';g.lineWidth=1.5;g.stroke();}
    const road=(pts,w)=>{g.strokeStyle='#bdb5a2';g.lineWidth=w;g.lineCap='round';g.beginPath();pts.forEach(([a,y],k)=>k?g.lineTo(X(a),Y(y)):g.moveTo(X(a),Y(y)));g.stroke();
      g.strokeStyle='rgba(70,64,54,0.5)';g.lineWidth=0.6;g.stroke();};
    road([[st.a,S.PE],[st.a,S.PE-1500],[cs[0].a,cs[0].y+cs[0].r],[cs[0].a,cs[0].y],[cs[1].a,cs[1].y],[cs[1].a,cs[1].y-cs[1].r],[st.a,S.SH+900],[st.a,S.SH]],3);
    for(const q of cs){road([[q.a,q.y],[a0+0.004,q.y+300]],2);road([[q.a,q.y],[a1-0.004,q.y-300]],2);}
    // Camp Alpha's ground, at the foot of the stairway
    if(i===0){g.fillStyle='#9a9384';g.fillRect(X(st.a)-10,Y(S.PE-400),20,Y(S.PE)-Y(S.PE-400));}
    return c;}

  // The Southern Plain: a patchwork. One canvas, the same in all three sectors, because everything here comes
  // in threes. Squares of colour, some checkered and some striped, some with a ring or a cross in them - the
  // explorers compared it to a chessboard, or a quilt.
  const SW=2048,SHh=2048;
  function paintSouth(){const c=canvas(SW,SHh),g=c.getContext('2d'),R=mkRng(S.seed*11);
    const pal=['#7a5a44','#8a7a4a','#5d6a5a','#6a6f7c','#9a8a6a','#7c4a3a','#a49478','#4f5e66','#8c6c4c','#6c7a52','#b0a283','#5a4e44'];
    g.fillStyle='#6d665c';g.fillRect(0,0,SW,SHh);
    const cell=64;
    for(let j=0;j<SHh/cell;j++)for(let i=0;i<SW/cell;i++){const x=i*cell,y=j*cell,t=R(),cA=pal[Math.floor(R()*pal.length)],cB=pal[Math.floor(R()*pal.length)];
      g.fillStyle=cA;g.fillRect(x+1,y+1,cell-2,cell-2);
      if(t<0.28){const n=[4,8][Math.floor(R()*2)],s=(cell-2)/n;g.fillStyle=cB;for(let p=0;p<n;p++)for(let q=0;q<n;q++)if((p+q)%2)g.fillRect(x+1+p*s,y+1+q*s,s,s);}
      else if(t<0.5){g.fillStyle=cB;const n=3+Math.floor(R()*4),w=(cell-2)/(n*2);for(let p=0;p<n;p++){if(R()<0.5)g.fillRect(x+1+p*2*w,y+1,w,cell-2);else g.fillRect(x+1,y+1+p*2*w,cell-2,w);}}
      else if(t<0.62){g.strokeStyle=cB;g.lineWidth=4;g.beginPath();g.arc(x+cell/2,y+cell/2,cell*0.3,0,TAU);g.stroke();}
      else if(t<0.72){g.fillStyle=cB;g.fillRect(x+cell*0.44,y+2,cell*0.12,cell-4);g.fillRect(x+2,y+cell*0.44,cell-4,cell*0.12);}
      else if(t<0.78){g.fillStyle=cB;g.beginPath();g.moveTo(x+cell/2,y+6);g.lineTo(x+cell-6,y+cell-6);g.lineTo(x+6,y+cell-6);g.closePath();g.fill();}}
    // the joints between the squares, dark
    g.strokeStyle='rgba(30,26,22,0.6)';g.lineWidth=1.5;for(let k=0;k<=SW;k+=cell){g.beginPath();g.moveTo(k,0);g.lineTo(k,SHh);g.stroke();g.beginPath();g.moveTo(0,k);g.lineTo(SW,k);g.stroke();}
    litEdges(g,SW,SHh);
    // and by the cliff, a strip of lighter ground where the flower grew
    const yc=(-S.SH-300-(-S.PE))/(S.PE-S.SH)*SHh;g.fillStyle='rgba(190,180,150,0.5)';g.fillRect(0,yc-10,SW,30);
    return c;}

  // ================= the Northern Plain =================
  {const city=new Batch(),camp=new Batch();
    for(let i=0;i<3;i++){const [a0,a1]=sectorN(i);IN.add(drumPatch(a0,a1,Math.ceil((a1-a0)*S.RI/120),S.SH,S.PE,120,S.RI,plainM(texOf(paintNorth(i)))));}
    // the cities: buildings in threes round points scattered over each city's ground
    const stone=['#cdc8bc','#bdb8ac','#d8d3c6','#aeb0ae','#c4bfb0','#9fa3a3'].map(col);
    for(const q of CITIES){const R=mkRng(Math.round(q.a*1e4)+q.y);
      const at=(dx,dy)=>({a:q.a+dx/S.RI,y:q.y+dy});
      // the centre: one large thing per city
      const C0=placeOn(q.a,q.y,S.RI,0);
      if(q.style==='domes')city.add(new THREE.SphereGeometry(160,24,12,0,TAU,0,Math.PI/2),C0,stone[2],0.5);
      else if(q.style==='spires'){for(let j=0;j<3;j++){const p=at(Math.cos(j*TAU/3)*70,Math.sin(j*TAU/3)*70);city.add(new THREE.ConeGeometry(30,320,6).translate(0,160,0),placeOn(p.a,p.y,S.RI,j),stone[0],0.5);}}
      else if(q.style==='stepped'){for(let s=0;s<4;s++)city.add(new THREE.BoxGeometry(260-s*55,22,260-s*55).translate(0,11+s*22,0),C0,stone[s%stone.length],0.5);}
      else city.add(new THREE.CylinderGeometry(90,110,60,3).translate(0,30,0),C0,stone[1],0.5);
      const N=q.style==='prisms'?95:70;
      for(let k=0;k<N;k++){const rr=q.r*Math.sqrt(0.06+R()*0.94)*0.92,th=R()*TAU;let dx=Math.cos(th)*rr,dy=Math.sin(th)*rr;
        if(q.style==='stepped'||q.style==='blocks'){const gs=q.style==='blocks'?120:90;dx=Math.round(dx/gs)*gs;dy=Math.round(dy/gs)*gs;}
        const ph=R()*TAU,sp=14+R()*26,colr=stone[Math.floor(R()*stone.length)];
        const w=8+R()*16,h=8+R()*(q.style==='spires'?90:40),d=8+R()*20;
        for(let j=0;j<3;j++){const ang=ph+j*TAU/3,p=at(dx+Math.cos(ang)*sp,dy+Math.sin(ang)*sp),M=placeOn(p.a,p.y,S.RI,-ang);
          let geo;
          switch(q.style){
            case 'blocks':geo=new THREE.BoxGeometry(w*1.4,h,d*1.4).translate(0,h/2,0);break;
            case 'drums':geo=R()<0.5?new THREE.CylinderGeometry(w,w,h*0.6,16).translate(0,h*0.3,0):new THREE.SphereGeometry(w,16,8,0,TAU,0,Math.PI/2);break;
            case 'stepped':geo=new THREE.BoxGeometry(w*1.3,h*0.5,w*1.3).translate(0,h*0.25,0);city.add(new THREE.BoxGeometry(w*0.8,h*0.5,w*0.8).translate(0,h*0.75,0),M,colr,0.5);break;
            case 'prisms':geo=new THREE.CylinderGeometry(w,w,h,3).translate(0,h/2,0);break;
            case 'domes':geo=R()<0.6?new THREE.SphereGeometry(w,16,8,0,TAU,0,Math.PI/2):new THREE.TorusGeometry(w,w*0.25,6,18).rotateX(Math.PI/2).translate(0,w*0.25,0);break;
            default:geo=new THREE.ConeGeometry(w*0.7,h*1.6,6).translate(0,h*0.8,0);}
          city.add(geo,M,colr,0.5);}
        // the long sheds that join one triplet to the next, in some cities
        if((q.style==='drums'||q.style==='blocks')&&R()<0.25){const p=at(dx,dy);city.add(new THREE.BoxGeometry(6,5,90).translate(0,2.5,0),placeOn(p.a,p.y,S.RI,R()*Math.PI),stone[3],0.5);}}}
    // Camp Alpha: the crew's base at the foot of Alpha stairway - domes, a mast, crates, a three-wheeled
    // cart, and the lamps they brought because there was no light here until the Dawn
    {const st=S.STAIRS[0],R=mkRng(31);
      for(let k=0;k<5;k++){const p={a:st.a+(k-2)*7/S.RI,y:S.PE-120-(k%2)*16};camp.add(new THREE.SphereGeometry(4.5,14,7,0,TAU,0,Math.PI/2),placeOn(p.a,p.y,S.RI,0),col(k%2?'#d8dce0':'#e8c070'),0.6);}
      camp.add(new THREE.CylinderGeometry(0.25,0.3,22,6).translate(0,11,0),placeOn(st.a+18/S.RI,S.PE-140,S.RI,0),col('#9aa0a6'),0.6);
      for(let k=0;k<14;k++)camp.add(new THREE.BoxGeometry(1.2,1,1.8).translate(0,0.5,0),placeOn(st.a+(R()-0.5)*40/S.RI,S.PE-100-R()*80,S.RI,R()*3),col(['#6a7a8a','#8a6a4a','#c0c4c8'][k%3]),0.6);
      // the cart
      camp.add(new THREE.BoxGeometry(2.2,1.2,4).translate(0,1.1,0),placeOn(st.a-22/S.RI,S.PE-170,S.RI,0.4),col('#c84a30'),0.6);
      IN.add(camp.mesh());
      const lamps=new Batch();for(let k=0;k<6;k++)lamps.add(new THREE.SphereGeometry(0.6,8,6),placeOn(st.a+((k%3)-1)*12/S.RI,S.PE-110-Math.floor(k/3)*40,S.RI-6,0),col('#ffe8b0'),1);
      lamps.add(new THREE.SphereGeometry(1.1,8,6),placeOn(st.a+18/S.RI,S.PE-140,S.RI-22.5,0),col('#fff0c8'),1);
      IN.add(lamps.mesh(lampMat));}
    IN.add(city.mesh(vM(THREE.FrontSide,{map:facadeT})));}

  // ================= the Straight Valleys: the suns =================
  // A trench 300 m wide and 60 m deep the length of each plain, with the light in its floor. Three to a plain,
  // a third of the way round from each other, the south's turned sixty degrees from the north's.
  const valleys=[];
  {const walls=new Batch();
    const one=(c,R,y0,y1,north)=>{const e0=c-wallA(R),e1=c-hw/R,e2=c+hw/R,e3=c+wallA(R);
      IN.add(drumSurface([e0,e1,e2,e3],range(y0,y1,8),(a)=>(a===e0||a===e3)?R:R+S.VD,(a,y,cc)=>{cc.set((a===e0||a===e3)?'#b8ab90':'#3a3631');},vM()));
      // the ends of the trench, and the ground beyond them up to the cliff and the bowl
      const ends=north?[[S.SH,y0],[y1,S.PE]]:[[-S.PE,y0],[y1,-S.SH]];
      for(const [ya,yb] of ends)IN.add(drumSurface(range(e0,e3,4),[ya,yb],()=>R,(a,y,cc)=>cc.set('#7d766a'),vM()));
      for(const y of [y0,y1]){const g=new THREE.BoxGeometry((e3-e0)*R,S.VD,3).translate(0,-S.VD/2,0);walls.add(g,placeOn(c,y,R,0),col('#a89c84'),0.6);}
      const sun=drumSurface(range(e1+3/R,e2-3/R,4),range(y0,y1,4),()=>R+S.VD-0.8,null,sunMat);sun.material=sunMat;IN.add(sun);
      // the glare above it: a wider sheet, faint and additive, which is most of what makes a strip of light
      // read as a sun rather than as a white stripe
      const gl=drumSurface(range(c-(hw*2.2)/R,c+(hw*2.2)/R,6),range(y0,y1,4),()=>R-25,null,glareMat);gl.material=glareMat;gl.renderOrder=2;IN.add(gl);
      // and the light standing up off it into the haze: a sheet from the valley floor toward the axis, bright at
      // the foot and gone by a kilometre and a half up. From the plain beside it, it is the sun's glow in the air.
      {const pos=[],uv=[],idx=[],ys=range(y0,y1,6);ys.forEach((y,j)=>{for(const [k,r] of [[0,R+S.VD-2],[1,R-1500]]){pos.push(Math.cos(c)*r,y,Math.sin(c)*r);uv.push(k,j);}});
        for(let j=0;j<ys.length-1;j++){const q=j*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();
        const b=new THREE.Mesh(g,beamMat);b.frustumCulled=false;b.renderOrder=3;IN.add(b);}
      valleys.push({c,R,y0,y1,north,sun});};
    for(const c of S.VAL_N)one(c,S.RI,S.SH+150,S.PE-100,true);
    for(const c of S.VAL_S)one(c,S.RS,-S.PE+100,-S.SH-150,false);
    IN.add(walls.mesh());}

  // ================= the Southern Plain =================
  {const tex=texOf(paintSouth()),mat=plainM(tex);
    for(let i=0;i<3;i++){const [a0,a1]=sectorS(i);IN.add(drumPatch(a0,a1,Math.ceil((a1-a0)*S.RS/120),-S.PE,-S.SH,120,S.RS,mat));}
    // a few structures, fewer and stranger than the north's: rings standing on edge, low pyramids, a field of
    // posts. The same in every sector.
    const b=new Batch(),R0=S.seed*13;
    for(let i=0;i<3;i++){const [a0,a1]=sectorS(i),R=mkRng(R0);
      for(let k=0;k<26;k++){const a=a0+0.02+R()*(a1-a0-0.04),y=-S.PE+800+R()*(S.PE-S.SH-1600),t=R(),M=placeOn(a,y,S.RS,R()*TAU);
        if(t<0.3)b.add(new THREE.TorusGeometry(40+R()*40,5,6,24).translate(0,46,0),M,col('#a8a090'),0.5);
        else if(t<0.6)b.add(new THREE.ConeGeometry(60+R()*50,50+R()*40,4).translate(0,35,0),M,col('#8a7a64'),0.5);
        else{const n=6+Math.floor(R()*6);for(let p=0;p<n;p++)for(let q=0;q<3;q++)b.add(new THREE.BoxGeometry(3,18+R()*14,3).translate(p*14-n*7,10,q*14),M,col('#b4ac9c'),0.5);}}}
    IN.add(b.mesh());}

  // ================= the cliffs =================
  // North: 50 m from the plain to the Sea. South: 500 m, banded - the cliff the Sea is thrown against.
  {const n=new THREE.RingGeometry(S.RI,S.SEA+40,360,2).rotateX(-Math.PI/2).translate(0,S.SH,0);
    const s=new THREE.RingGeometry(S.RS,S.SEA+40,360,12).rotateX(-Math.PI/2).translate(0,-S.SH,0);
    const paint=(g,f)=>{const p=g.attributes.position,c=new Float32Array(p.count*3),cc=new THREE.Color();
      for(let i=0;i<p.count;i++){const r=Math.hypot(p.getX(i),p.getZ(i));f(r,cc);c[i*3]=cc.r;c[i*3+1]=cc.g;c[i*3+2]=cc.b;}g.setAttribute('color',new THREE.BufferAttribute(c,3));return g;};
    IN.add(new THREE.Mesh(paint(n,(r,c)=>c.set('#8a8274').multiplyScalar(0.8+0.2*(r-S.RI)/50)),vM()));
    IN.add(new THREE.Mesh(paint(s,(r,c)=>{const band=Math.floor((r-S.RS)/42)%3;c.set(['#9a8e7a','#857a68','#a89c86'][band]);if(r>S.SEA-10)c.multiplyScalar(0.7);}),vM()));}

  // ================= the Sea =================
  // A ring of water 10 km wide round the waist, New York left out of it. Its colour is the state's: white ice
  // when Rama arrives, a dark green-blue soup when the Sun has thawed it. Its rows are 100 m apart so a wave
  // can run along it; `wave(t)` moves the surface.
  const seaAng=range(0,TAU,720),seaY=range(-S.SH,S.SH,100);
  const seaMat=vM(THREE.DoubleSide,{lightMap:rippleT,lightMapIntensity:1.08});
  const sea=drumSurface(seaAng,seaY,()=>S.SEA,(a,y,c)=>{const h=hash3(Math.floor(a*300),Math.floor(y/60),5);c.setRGB(0.9+0.1*h,0.92+0.08*h,0.95+0.05*h);},seaMat,(a,y)=>!S.inNY(a,y));
  IN.add(sea);
  {const uv2=[];for(const y of seaY)for(const a of seaAng)uv2.push(a*S.SEA/90,y/40);sea.geometry.setAttribute('uv2',new THREE.Float32BufferAttribute(uv2,2));}
  animHooks.push(now=>{if(!IN.visible)return;seaMat.lightMap=LS.ice>0.5?iceT:rippleT;rippleT.offset.set(now*0.000012,now*0.000004);});
  const seaPos=sea.geometry.attributes.position,seaCol=sea.geometry.attributes.color,seaCol0=seaCol.array.slice();
  let waveWas=false;
  // fn(a,y) -> metres the surface stands up toward the axis, or null to lay it flat. Nothing in here is lit by
  // the scene, so a wave has no shading of its own: its height is painted on instead, the crest paler and
  // foaming white at the top, the trough darker.
  function setWave(fn){
    if(!fn&&!waveWas)return;waveWas=!!fn;let k=0;
    for(const y of seaY)for(const a of seaAng){const h=fn?fn(a,y):0,r=S.SEA-h;seaPos.setXYZ(k,Math.cos(a)*r,y,Math.sin(a)*r);
      const f=Math.max(0.7,Math.min(1.9,1+h*0.03)),foam=Math.max(0,Math.min(1,(h-22)/14));
      seaCol.setXYZ(k,seaCol0[k*3]*f+foam*1.9,seaCol0[k*3+1]*f+foam*1.5,seaCol0[k*3+2]*f+foam*1.3);k++;}
    seaPos.needsUpdate=true;seaCol.needsUpdate=true;}

  // ================= New York =================
  // An island in the middle of the Sea, 10 km round and 3 across, walled. Three identical sectors of towers,
  // laid out by the same stream of numbers three times: that is the threefold Raman way, and it was the first
  // thing about New York anyone noticed.
  const NY=new Batch();
  {const a0=S.NYA-S.NYARC/S.SEA,a1=S.NYA+S.NYARC/S.SEA;
    const nyG=drumSurface(range(a0,a1,400),range(-S.NYW,S.NYW,120),()=>S.SEA-25,(a,y,c)=>{const du=S.nyDu(a);
        const street=(Math.abs(((du%140)+140)%140-70)>62)||(Math.abs(((y%140)+140)%140-70)>62);c.set(street?'#8e9298':'#a7aaae');
        if(Math.abs(Math.abs(du)-S.NYARC/3)<30)c.set('#6e7278');},vM(THREE.DoubleSide,{lightMap:detailT,lightMapIntensity:1.12}),(a,y)=>S.inNY(a,y));
    {const uv2=[];for(const y of range(-S.NYW,S.NYW,120))for(const a of range(a0,a1,400))uv2.push(a*S.SEA/24,y/24);nyG.geometry.setAttribute('uv2',new THREE.Float32BufferAttribute(uv2,2));IN.add(nyG);}
    // the wall round it, standing out of the Sea
    {const pts=[];for(let k=0;k<=360;k++){const t=k/360*TAU,core=S.NYARC-S.NYW;let du,dy;
        const per=2*core*2+TAU*S.NYW,s=t/TAU*per;
        if(s<2*core){du=-core+s;dy=S.NYW;}else if(s<2*core+Math.PI*S.NYW){const q=(s-2*core)/S.NYW;du=core+Math.sin(q)*S.NYW;dy=Math.cos(q)*S.NYW;}
        else if(s<4*core+Math.PI*S.NYW){du=core-(s-2*core-Math.PI*S.NYW);dy=-S.NYW;}else{const q=(s-4*core-Math.PI*S.NYW)/S.NYW;du=-core-Math.sin(q)*S.NYW;dy=-Math.cos(q)*S.NYW;}
        pts.push([S.NYA+du/S.SEA,dy]);}
      const pos=[],cl=[];for(let k=0;k<pts.length-1;k++){const [aA,yA]=pts[k],[aB,yB]=pts[k+1];
        for(const [a,y,r] of [[aA,yA,S.SEA-32],[aB,yB,S.SEA-32],[aA,yA,S.SEA+30],[aB,yB,S.SEA-32],[aB,yB,S.SEA+30],[aA,yA,S.SEA+30]]){pos.push(Math.cos(a)*r,y,Math.sin(a)*r);const v=r<S.SEA?0.78:0.55;cl.push(v,v*1.01,v*1.03);}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));g.computeBoundingSphere();
      const m=new THREE.Mesh(g,vM());m.frustumCulled=false;IN.add(m);}
    const silver=['#c8ccd0','#a9aeb4','#dfe2e4','#8f959c','#b8bcc0'].map(col);
    for(let sct=-1;sct<=1;sct++){const R=mkRng(S.seed*17);     // the same stream for each sector
      const duC=sct*S.NYARC*2/3;
      for(let gx=-11;gx<=11;gx++)for(let gy=-10;gy<=10;gy++){const t=R(),hgt=R(),typ=R(),wob=R();
        if(t<0.22)continue;
        const du=duC+gx*140,y=gy*140;const a=S.NYA+du/S.SEA;if(!S.inNY(a,y)||!S.inNY(a,y+60)||!S.inNY(a,y-60)||!S.inNY(a+70/S.SEA,y))continue;
        const near=1-Math.min(1,Math.hypot(gx/11,gy/10));const h=30+hgt*hgt*260*(0.35+near),w=24+wob*36,M=placeOn(a,y,S.SEA-25,0),c=silver[Math.floor(typ*97)%silver.length];
        if(typ<0.4)NY.add(new THREE.BoxGeometry(w,h,w).translate(0,h/2,0),M,c,0.45);
        else if(typ<0.6)NY.add(new THREE.CylinderGeometry(w*0.55,w*0.6,h,12).translate(0,h/2,0),M,c,0.45);
        else if(typ<0.75)NY.add(new THREE.CylinderGeometry(w*0.7,w*0.7,h,3).translate(0,h/2,0),M,c,0.45);
        else if(typ<0.87){NY.add(new THREE.BoxGeometry(w,h*0.6,w).translate(0,h*0.3,0),M,c,0.45);NY.add(new THREE.BoxGeometry(w*0.6,h*0.4,w*0.6).translate(0,h*0.8,0),M,c,0.45);}
        else{NY.add(new THREE.CylinderGeometry(3,3,h,6).translate(0,h/2,0),M,c,0.45);NY.add(new THREE.SphereGeometry(w*0.5,14,10).translate(0,h+w*0.4,0),M,c,0.45);}}
      // each sector's centrepiece: three great towers in a triangle
      for(let j=0;j<3;j++){const ang=j*TAU/3,a=S.NYA+(duC+Math.cos(ang)*120)/S.SEA,y=Math.sin(ang)*120;NY.add(new THREE.CylinderGeometry(26,40,480,3).translate(0,240,0),placeOn(a,y,S.SEA-25,-ang),silver[2],0.45);}}
    IN.add(NY.mesh(vM(THREE.FrontSide,{map:towerT})));}

  // ================= the Northern Bowl, the hub and the stairways =================
  // The bowl from the plain to the hub, drawn as a drum surface whose radius falls to nothing: lighter rings at
  // the terraces, where each stairway levels off. Three stairways, a third of the way round from each other,
  // ladders for the first kilometre from the hub (there is almost no weight up there to climb against) and
  // stairs the rest of the way, the steps getting shallower toward the plain as the weight comes on.
  const bowlTh=range(0,Math.PI/2,90);
  {const ys=bowlTh.map(t=>S.PE+S.BD*Math.sin(t)),ang=range(0,TAU,360);
    IN.add(drumSurface(ang,ys,(a,y)=>Math.max(S.HUBR,S.bowlN(y)),(a,y,c)=>{const r=S.bowlN(y);let v=0.78+0.06*Math.sin(r/90);
        for(const T of S.TERR)if(Math.abs(r-T)<70)v=1.02;c.set('#8e877a').multiplyScalar(v);
        for(const st of S.STAIRS)if(S.angDist(a,st.a)*r<50)c.multiplyScalar(0.85);},vM()));
    const terr=new Batch();
    for(const T of S.TERR){const y=S.yN(T);
      // a shelf: a short cylinder at the terrace's radius, a lip and a wall back up to the bowl
      terr.add(new THREE.CylinderGeometry(T,T,90,180,1,true).translate(0,y-45,0),new THREE.Matrix4(),col('#a39b8a'),0.5);
      terr.add(new THREE.RingGeometry(T-16,T,180,1).rotateX(Math.PI/2).translate(0,y-90,0),new THREE.Matrix4(),col('#b8b09e'),0.6);}
    IN.add(terr.mesh(vM()));
    // the stairways: a ribbon down each meridian, steps drawn on it
    const stepC=canvas(64,64),sg=stepC.getContext('2d');sg.fillStyle='#b4ab98';sg.fillRect(0,0,64,64);sg.fillStyle='#6a6458';sg.fillRect(0,0,64,10);sg.fillStyle='#d0c8b4';sg.fillRect(0,10,64,6);
    const stepT=new THREE.CanvasTexture(stepC);stepT.wrapS=stepT.wrapT=THREE.RepeatWrapping;stepT.anisotropy=8;
    const rungC=canvas(64,64),rg=rungC.getContext('2d');rg.clearRect(0,0,64,64);rg.fillStyle='#9aa0a4';rg.fillRect(0,0,6,64);rg.fillRect(58,0,6,64);rg.fillRect(0,26,64,10);
    const rungT=new THREE.CanvasTexture(rungC);rungT.wrapS=rungT.wrapT=THREE.RepeatWrapping;
    const stairM=tM(stepT),ladM=tM(rungT,{transparent:true,alphaTest:0.5});
    const rails=new Batch(),land=new Batch();
    for(const st of S.STAIRS){
      const rib=(r0,r1,w,mat,stepLen)=>{const pos=[],uv=[],idx=[],n=Math.ceil((r1-r0)/25);let s=0,prev=null;
        for(let i=0;i<=n;i++){const r=r0+(r1-r0)*i/n,y=S.yN(r),rr=r-2.5;const p=new THREE.Vector3(Math.cos(st.a)*rr,y,Math.sin(st.a)*rr);if(prev)s+=p.distanceTo(prev);prev=p;
          const da=w/2/Math.max(30,r);for(const sd of [-1,1]){const a=st.a+sd*da;pos.push(Math.cos(a)*rr,y,Math.sin(a)*rr);uv.push(sd<0?0:1,s/stepLen);}}
        for(let i=0;i<n;i++){const q=i*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();
        const m=new THREE.Mesh(g,mat);m.frustumCulled=false;IN.add(m);};
      rib(S.HUBR+20,S.TERR[0],4,ladM,0.6);rib(S.TERR[0],S.RI-2,32,stairM,1.4);
      // the handrails: posts every fifty metres and a rail along each side
      for(let r=S.TERR[0];r<S.RI-60;r+=50)for(const sd of [-1,1]){const a=st.a+sd*16/r;rails.add(new THREE.CylinderGeometry(0.15,0.15,1.2,4).translate(0,0.6,0),placeOn(a,S.yN(r),r-2.5,0),col('#c8ccd0'),0.6);}
      for(const sd of [-1,1]){let prev=null;for(let r=S.TERR[0];r<S.RI-10;r+=100){const a=st.a+sd*16/r,y=S.yN(r),p=new THREE.Vector3(Math.cos(a)*(r-3.7),y,Math.sin(a)*(r-3.7));if(prev)rod(rails,prev,p,0.12,0.12,col('#c8ccd0'),4);prev=p;}}
      // a landing at each terrace
      for(const T of S.TERR)land.add(new THREE.BoxGeometry(44,2,60).translate(0,1,-20),placeOn(st.a,S.yN(T)-50,T,0),col('#bcb4a2'),0.6);}
    IN.add(rails.mesh(),land.mesh());
    // the hub from inside: a boss round the airlock shaft and three airlock doors, one at the head of each ladder
    const hub=new Batch();
    latheBaked(hub,[[S.HUBR+90,S.HUBY+10],[S.HUBR+90,S.HUBY-60],[S.HUBR+40,S.HUBY-120],[S.HUBR,S.HUBY-130]],48,col('#9a9890'));
    for(const st of S.STAIRS){const M=placeOn(st.a,S.HUBY-80,S.HUBR+40,0);hub.add(new THREE.BoxGeometry(14,30,2).translate(0,0,-30),M,col('#3a3c40'),0.4);hub.add(new THREE.BoxGeometry(18,34,1).translate(0,0,-29),M,col('#c8c4b8'),0.6);}
    IN.add(hub.mesh());
    const hl=new Batch();for(const st of S.STAIRS)for(const sd of [-1,1])hl.add(new THREE.SphereGeometry(1.4,8,6),placeOn(st.a+sd*0.06,S.HUBY-100,S.HUBR+52,0),col('#ffe8b0'),1);
    IN.add(hl.mesh(lampMat));}

  // ================= the Southern Bowl and the horns =================
  // The bowl, darker, ribbed in six; the Big Horn on the axis, 8 km of it pointing north at the hub; six Little
  // Horns round it, each held to it and to the bowl by flying buttresses. The crew guessed it was part of the
  // drive. The lightning plays between their tips.
  const hornTips=[];
  {const ys=bowlTh.map(t=>-S.PE-S.BD*Math.sin(t)),ang=range(0,TAU,360);
    IN.add(drumSurface(ang,ys,(a,y)=>Math.max(60,S.bowlS(y)),(a,y,c)=>{const r=S.bowlS(y);const rib=Math.abs(Math.sin(a*3))<0.04;
        c.set(rib?'#77736c':'#625e58').multiplyScalar(0.85+0.15*Math.sin(r/300));},vM()));
    const h=new Batch(),metal=col('#6e7178'),collar=col('#a4a29c');
    latheBaked(h,S.BIG_PROFILE,48,metal);
    for(const k of [2,5,8])latheBaked(h,[[S.BIG_PROFILE[k][0]+40,S.BIG_PROFILE[k][1]-60],[S.BIG_PROFILE[k][0]+40,S.BIG_PROFILE[k][1]+60]],48,collar);
    hornTips.push(new THREE.Vector3(0,-S.HUBY+S.BIG,0));
    for(const a of S.LITTLE_A){const b=S.littleBase(a),M=new THREE.Matrix4().makeTranslation(b.x,b.y,b.z);
      latheBaked(h,S.LITTLE_PROFILE,24,metal,M);
      hornTips.push(new THREE.Vector3(b.x,b.y+S.LITTLE,b.z));
      // the buttresses: one in from near the tip to the Big Horn, one out from the foot to the bowl
      const ui=new THREE.Vector3(b.x*0.95,b.y+1850,b.z*0.95),bi=new THREE.Vector3(Math.cos(a)*560,-S.HUBY+4600,Math.sin(a)*560);
      rod(h,ui,bi,70,45,collar,8);
      const mid=new THREE.Vector3(b.x,b.y+700,b.z).multiplyScalar(1),out=new THREE.Vector3(Math.cos(a)*6000,S.yS(6000)+40,Math.sin(a)*6000);
      mid.x*=1.05;mid.z*=1.05;rod(h,mid,out,90,60,collar,8);
      const lo=new THREE.Vector3(b.x*0.9,b.y+1850,b.z*0.9);rod(h,lo,new THREE.Vector3(Math.cos(a+Math.PI/3)*S.LHR*0.9,b.y+1850,Math.sin(a+Math.PI/3)*S.LHR*0.9),30,30,collar,6);}
    IN.add(h.mesh());}

  // ================= the air =================
  // Cloud: once the Sea has thawed and the plains warmed, hot air rises toward the axis and cloud gathers there,
  // a ragged tube down the middle of the world, turning a little slower than Rama does (the wind).
  const soft=(()=>{const c=canvas(128,128),g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,'rgba(255,255,255,0.9)');gr.addColorStop(0.5,'rgba(255,255,255,0.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
  const cloud=new THREE.Group();IN.add(cloud);
  const cloudMat=new THREE.PointsMaterial({map:soft,color:0xe8ecef,size:1100,transparent:true,opacity:0,depthWrite:false,sizeAttenuation:true,clippingPlanes:[cut],fog:true});
  {const n=2600,pos=new Float32Array(n*3),R=mkRng(S.seed*19);
    for(let i=0;i<n;i++){const band=Math.floor(R()*7),y=-17000+band*5600+(R()-0.5)*5200,a=R()*TAU+y*0.00008,r=2400+R()*3200*(0.6+0.4*Math.sin(a*3+y*0.0003));
      pos[i*3]=Math.cos(a)*r;pos[i*3+1]=y;pos[i*3+2]=Math.sin(a)*r;}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const p=new THREE.Points(g,cloudMat);p.frustumCulled=false;cloud.add(p);}

  // The lightning: bolts between the horns' tips, jagged, a few at a time, each gone in a tenth of a second,
  // and a flash that lights the whole south of the world.
  const BOLT_SEG=16,BOLTS=6;
  const boltMat=new THREE.MeshBasicMaterial({color:0xd8ecff,clippingPlanes:[cut],fog:false});
  const bolts=new THREE.InstancedMesh(new THREE.CylinderGeometry(1,1,1,5).translate(0,0.5,0),boltMat,BOLT_SEG*BOLTS);bolts.frustumCulled=false;bolts.visible=false;IN.add(bolts);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:soft,color:0xbfdcff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
  glow.scale.setScalar(9000);glow.position.copy(hornTips[0]).add(new THREE.Vector3(0,-2500,0));IN.add(glow);
  let nextBolt=0,boltOff=0;
  const _o=new THREE.Object3D(),_p=new THREE.Vector3(),_q=new THREE.Vector3(),_d=new THREE.Vector3(),_n1=new THREE.Vector3(),_n2=new THREE.Vector3();
  function strike(now){const R=Math.random;let k=0;if(O.onStrike)O.onStrike();
    for(let b=0;b<BOLTS;b++){
      // from the Big Horn's tip to a Little Horn's, or between two Little Horns, or down a buttress
      const i=1+Math.floor(R()*6),j=R()<0.6?0:1+((i)%6);const A=hornTips[j],B=hornTips[i];
      _d.subVectors(B,A);const L=_d.length();_n1.set(1,0,0).cross(_d).normalize();_n2.crossVectors(_d,_n1).normalize();
      _p.copy(A);
      for(let s=1;s<=BOLT_SEG;s++){const t=s/BOLT_SEG,j2=s===BOLT_SEG?0:L*0.07*Math.sin(t*Math.PI);
        _q.copy(A).addScaledVector(_d,t).addScaledVector(_n1,(R()-0.5)*j2*2).addScaledVector(_n2,(R()-0.5)*j2*2);
        const seg=_q.clone().sub(_p),len=seg.length();_o.position.copy(_p);_o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),seg.normalize());_o.scale.set(14+R()*10,len,14+R()*10);_o.updateMatrix();
        bolts.setMatrixAt(k++,_o.matrix);_p.copy(_q);}}
    bolts.instanceMatrix.needsUpdate=true;bolts.visible=true;LS.flash=1;boltOff=now+70+Math.random()*90;nextBolt=now+(LS.lightning>0.5?160:600)+Math.random()*700;}
  animHooks.push(now=>{if(LS.lightning>0&&now>nextBolt)strike(now);
    if(bolts.visible&&now>boltOff){bolts.visible=false;}
    LS.flash=Math.max(0,(LS.flash||0)*0.86-0.01);glow.material.opacity=LS.flash*0.8;});

  // Flares: in the dark before the Dawn the crew fired flares down from the hub to see the plain at all. Each
  // falls slowly, burning, lighting a circle under it.
  const flareMat=new THREE.SpriteMaterial({map:soft,color:0xfff0d0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
  const flares=[];for(let k=0;k<4;k++){const sp=new THREE.Sprite(flareMat.clone());sp.visible=false;sp.scale.setScalar(900);IN.add(sp);flares.push({sp,t0:0});}
  function fireFlare(now,k){const f=flares[k%flares.length];f.t0=now;f.a=S.STAIRS[0].a+(Math.random()-0.5)*0.25;f.y=S.PE-1500-Math.random()*6000;f.sp.visible=true;}
  animHooks.push(now=>{let lit=0;for(const f of flares){if(!f.sp.visible)continue;const t=(now-f.t0)/1000;if(t>26){f.sp.visible=false;continue;}
      const r=600+t*t*11;const rr=Math.min(S.RI-80,r);f.sp.position.set(Math.cos(f.a)*rr,f.y,Math.sin(f.a)*rr);const life=Math.min(1,t/0.6)*Math.max(0,1-Math.max(0,t-20)/6);
      f.sp.material.opacity=life;f.sp.scale.setScalar(500+300*Math.sin(now*0.03+f.y));lit=Math.max(lit,life);}
    LS.flare=lit;});

  IN.traverse(o=>{o.userData.noWire=true;});

  // ================= the light =================
  const fogCol=new THREE.Color(),dark=new THREE.Color(0x040508),haze=new THREE.Color(0xaeb6ba),ice=new THREE.Color(0xd9e6ee),water=new THREE.Color(0x1e5560),tmp=new THREE.Color(),sunOff=new THREE.Color(0x1a1b1e),sunOn=new THREE.Color(0xfffbf0);
  animHooks.push(()=>{const L=Math.min(1.25,0.03+0.97*LS.sun+0.22*LS.flare+0.55*(LS.flash||0));
    for(const m of baked)m.color.setScalar(L);
    tmp.copy(water).lerp(ice,LS.ice);seaMat.color.copy(tmp).multiplyScalar(L);
    sunMat.color.copy(sunOff).lerp(sunOn,Math.min(1,LS.sun));
    // the valleys come on one by one in the Dawn: LS.sunEach, if set, gives each its own level
    if(LS.sunEach){for(let i=0;i<valleys.length;i++){const v=valleys[i];if(!v.own){v.own=sunMat.clone();v.sun.material=v.own;}v.own.color.copy(sunOff).lerp(sunOn,LS.sunEach[i]);}}
    else for(const v of valleys)if(v.own){v.sun.material=sunMat;v.own.dispose();v.own=null;}
    glareMat.opacity=0.2*LS.sun;beamMat.opacity=0.22*Math.min(1,LS.sun);
    cloudMat.opacity=0.5*LS.cloud;cloudMat.color.setScalar(0.25+0.75*Math.min(1,L));
    fogCol.copy(dark).lerp(haze,Math.min(1,LS.sun)).lerp(tmp.set(0xc8d8ff),Math.min(0.5,(LS.flash||0)*0.5));
    if(W.on&&scene.fog){scene.fog.color.copy(fogCol);renderer.setClearColor(fogCol);scene.fog.density=0.000032+0.00002*LS.cloud;}});
  animHooks.push(now=>{if(IN.visible)cloud.rotation.y=-now*0.0000035;});

  // ================= being inside =================
  // One walker for the whole of it (src/core/cylinder.js, as Kyrene and Babylon 5's Garden have): it stands at
  // (y, a), `h` metres above whatever ground is there, with up toward the axis. Raise h far enough and you are
  // floating at the axis, where there is no weight at all; walk off the plain and you are on the Sea's ice, or
  // climbing the bowl.
  const W={on:false,where:'hub',y:S.HUBY-200,a:S.STAIRS[0].a,h:10,yaw:Math.PI,pitch:0,follow:null};
  const eyeR=()=>S.ground(W.y,W.a)-W.h;
  const walker=createCylinderWalker(THREE,{axis:new THREE.Vector3(0,1,0),along:'y',
    at:(y,a)=>{const r=Math.max(25,S.ground(y,a)-W.h);return new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);}});
  // ================= London's hall of holograms =================
  // The last expedition's find: Norton had a laser cut a way into one of London's buildings, and inside, in rows
  // of transparent pillars, were images of things - tools, containers, instruments no one could name - and among
  // them a uniform cut for a body with three arms and three legs. This hall stands at London's northern edge, the
  // side toward Camp Alpha. Its local frame: x round the drum, y up, z along the axis (+z south, toward London).
  // The hall's walls take Rama's light like everything else; the holograms make their own.
  const HALL={a:CITIES[0].a,y:CITIES[0].y+1150,w:30,l:70,h:9};
  {const solid=(parts,shade)=>{const pos=[],cl=[],n=new THREE.Vector3(),v=new THREE.Vector3(),c=new THREE.Color();
      for(const [geo,M,col] of parts){const g=(geo.index?geo.toNonIndexed():geo.clone()).applyMatrix4(M);g.computeVertexNormals();const P=g.attributes.position,N=g.attributes.normal;
        for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);n.fromBufferAttribute(N,i);const k=shade?shade(n):1;c.set(col).multiplyScalar(k);pos.push(v.x,v.y,v.z);cl.push(c.r,c.g,c.b);}g.dispose();}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));g.computeBoundingSphere();return g;};
    const T=(x,y,z,ry,s)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry||0,0)),new THREE.Vector3(s||1,s||1,s||1));
    const TR=(x,y,z,rx,ry,rz)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(1,1,1));
    const lit=n=>0.55+0.3*Math.max(0,n.y)+0.15*Math.abs(n.x)-0.2*Math.max(0,-n.y);
    const hall=new THREE.Group();hall.applyMatrix4(placeOn(HALL.a,HALL.y,S.RI,0));IN.add(hall);
    const {w,l,h}=HALL,X=w/2,Z=l/2,parts=[],wall='#c8c8c4',floor='#5a5c60',trim='#9a9c9e';
    // walls, roof and floor; the north wall has the hole the laser cut, three metres by four
    parts.push([new THREE.BoxGeometry(w,0.3,l),T(0,0.15,0),floor],[new THREE.BoxGeometry(w+1,1,l+1),T(0,h+0.5,0),wall]);
    for(const sd of [-1,1])parts.push([new THREE.BoxGeometry(1,h,l),T(sd*(X+0.5),h/2,0),wall]);
    parts.push([new THREE.BoxGeometry(w+2,h,1),T(0,h/2,Z+0.5),wall]);
    parts.push([new THREE.BoxGeometry(X-1.5+1,h,1),T(-(1.5+(X-1.5+1)/2),h/2,-Z-0.5),wall],[new THREE.BoxGeometry(X-1.5+1,h,1),T(1.5+(X-1.5+1)/2,h/2,-Z-0.5),wall],
      [new THREE.BoxGeometry(3,h-4,1),T(0,4+(h-4)/2,-Z-0.5),wall]);
    // the plug the laser cut out, lying where it fell, and the scorch round the hole
    parts.push([new THREE.BoxGeometry(3,0.95,4),TR(0.6,0.5,-Z-4,0,0.2,0),'#b8b8b2'],[new THREE.BoxGeometry(3.6,0.08,0.3),T(0,4.1,-Z-1.05),'#2a2622'],
      [new THREE.BoxGeometry(0.3,4,0.08),T(-1.6,2,-Z-1.05),'#2a2622'],[new THREE.BoxGeometry(0.3,4,0.08),T(1.6,2,-Z-1.05),'#2a2622']);
    // inside: a band of trim at head height, and the plinths in four rows with an aisle down the middle
    for(const sd of [-1,1])parts.push([new THREE.BoxGeometry(0.2,0.4,l-1),T(sd*(X-0.1),3.2,0),trim]);
    const COLS=[-10.5,-4.5,4.5,10.5],ROWS=[];for(let z=-27;z<=24;z+=6.4)ROWS.push(z);
    for(const x of COLS)for(const z of ROWS)parts.push([new THREE.CylinderGeometry(1.1,1.2,0.6,12),T(x,0.6,z),'#3a3c40']);
    parts.push([new THREE.CylinderGeometry(2.4,2.6,0.9,24),T(0,0.75,Z-4),'#3a3c40']);         // the dais at the end
    const shell=new THREE.Mesh(solid(parts,lit),vM(THREE.DoubleSide));shell.frustumCulled=false;hall.add(shell);
    // the pillars of light the images stand in: one sheet of glass each, additive, faintly blue
    const glass=[];for(const x of COLS)for(const z of ROWS)glass.push([new THREE.CylinderGeometry(1,1,3.2,16,1,true),T(x,2.5,z),'#3a6a88']);
    glass.push([new THREE.CylinderGeometry(2.2,2.2,5,24,1,true),T(0,3.7,Z-4),'#3a6a88']);
    const glassMat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,clippingPlanes:[cut],fog:false});
    const gm=new THREE.Mesh(solid(glass,n=>0.5+0.5*Math.abs(n.x)),glassMat);gm.frustumCulled=false;gm.renderOrder=4;hall.add(gm);
    // the images: each its own small thing, turning slowly in its pillar, drawn in its own light
    const holoMat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0.88,side:THREE.DoubleSide,clippingPlanes:[cut],fog:false});
    const R=mkRng(1311),holos=[],tint=['#cfe8ff','#ffe8c8','#d8ffe8','#f0d8ff','#ffffff'];
    const kinds=[
      c=>[[new THREE.CylinderGeometry(0.06,0.06,1.4,6),T(0,0,0),c],[new THREE.BoxGeometry(0.5,0.18,0.12),T(0,0.7,0),c]],                     // a tool with a cross-head
      c=>[[new THREE.CylinderGeometry(0.06,0.06,1.2,6),T(0,0,0),c],[new THREE.ConeGeometry(0.2,0.4,3),TR(0,0.75,0,0,0,0),c],[new THREE.TorusGeometry(0.18,0.04,6,12),TR(0,-0.4,0,Math.PI/2,0,0),c]],
      c=>[[new THREE.CylinderGeometry(0.35,0.4,0.7,3),T(0,0,0),c],[new THREE.CylinderGeometry(0.2,0.2,0.15,3),T(0,0.42,0),c]],               // a three-sided canister
      c=>[[new THREE.BoxGeometry(0.8,0.5,0.5),T(0,0,0),c],[new THREE.BoxGeometry(0.84,0.08,0.54),T(0,0.29,0),c],[new THREE.BoxGeometry(0.2,0.12,0.06),T(0,0.1,0.28),c]],
      c=>[[new THREE.TorusGeometry(0.4,0.05,6,24),T(0,0,0),c],[new THREE.TorusGeometry(0.4,0.05,6,24),TR(0,0,0,0,Math.PI/3,0),c],[new THREE.TorusGeometry(0.4,0.05,6,24),TR(0,0,0,0,2*Math.PI/3,0),c],[new THREE.SphereGeometry(0.1,8,6),T(0,0,0),c]],
      c=>[[new THREE.CylinderGeometry(0.05,0.05,0.9,6),TR(0,0,0,0,0,0.5),c],[new THREE.CylinderGeometry(0.05,0.05,0.9,6),TR(0,0,0,0,0,-0.5),c],[new THREE.CylinderGeometry(0.05,0.05,0.9,6),TR(0,0,0,0.5,0,0),c],[new THREE.SphereGeometry(0.14,8,6),T(0,0.4,0),c]],
      c=>[[new THREE.SphereGeometry(0.3,12,8),T(0,0,0),c],[new THREE.CylinderGeometry(0.1,0.12,0.5,8),T(0,-0.4,0),c],[new THREE.CylinderGeometry(0.03,0.03,0.6,4),TR(0.3,0.2,0,0,0,-0.8),c]],
      c=>[[new THREE.BoxGeometry(0.12,1.1,0.12),T(0,0,0),c],[new THREE.BoxGeometry(0.6,0.1,0.1),T(0,0.35,0),c],[new THREE.BoxGeometry(0.6,0.1,0.1),T(0,-0.35,0),c],[new THREE.BoxGeometry(0.1,0.3,0.3),T(0.3,0.35,0),c],[new THREE.BoxGeometry(0.1,0.3,0.3),T(-0.3,-0.35,0),c]],
    ];
    const holo=(parts,x,y,z,spin)=>{const m=new THREE.Mesh(solid(parts,n=>0.6+0.4*Math.max(0,n.y)+0.2*Math.abs(n.z)),holoMat);m.position.set(x,y,z);m.userData.spin=spin;m.frustumCulled=false;m.renderOrder=5;hall.add(m);holos.push(m);return m;};
    for(const x of COLS)for(const z of ROWS){const c=tint[Math.floor(R()*tint.length)];holo(kinds[Math.floor(R()*kinds.length)](c),x,2.5,z,(R()<0.5?-1:1)*(0.15+R()*0.2));}
    // the uniform, on the dais: a harness for a body with three arms and three legs, round a short trunk -
    // straps, pockets, the sleeves a third of the way round from each other, the legs between them
    {const c='#e8f0ff',dk='#9ab8d8',u=[];u.push([new THREE.CylinderGeometry(0.45,0.5,1.1,9),T(0,0,0),c],[new THREE.CylinderGeometry(0.47,0.47,0.12,9),T(0,0.25,0),dk],[new THREE.CylinderGeometry(0.52,0.52,0.12,9),T(0,-0.45,0),dk]);
      for(let k=0;k<3;k++){const a=k*TAU/3,b=a+TAU/6,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
        u.push([new THREE.CylinderGeometry(0.13,0.16,1.1,8),new THREE.Matrix4().compose(new THREE.Vector3(ca*0.75,0.35,sa*0.75),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(ca,0.35,sa).normalize()),new THREE.Vector3(1,1,1)),c]);
        u.push([new THREE.CylinderGeometry(0.11,0.13,0.25,8),new THREE.Matrix4().compose(new THREE.Vector3(ca*1.28,0.53,sa*1.28),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(ca,0.35,sa).normalize()),new THREE.Vector3(1,1,1)),dk]);
        u.push([new THREE.CylinderGeometry(0.17,0.14,1.3,8),new THREE.Matrix4().compose(new THREE.Vector3(cb*0.35,-1.15,sb*0.35),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-cb*0.25,1,-sb*0.25).normalize()),new THREE.Vector3(1,1,1)),c]);
        u.push([new THREE.BoxGeometry(0.22,0.26,0.1),new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a+TAU/12)*0.5,-0.1,Math.sin(a+TAU/12)*0.5),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,-(a+TAU/12)+Math.PI/2,0)),new THREE.Vector3(1,1,1)),dk]);}
      HALL.uniform=holo(u,0,3.6,Z-4,0.12);HALL.uniform.scale.setScalar(1.15);}
    // a glow at each pillar's foot, so the floor round it is lit
    for(const x of COLS)for(const z of ROWS){const g=new THREE.Sprite(new THREE.SpriteMaterial({map:soft,color:0x5a8ab0,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));g.position.set(x,1.2,z);g.scale.setScalar(4.5);hall.add(g);}
    animHooks.push(now=>{if(!IN.visible)return;const t=now/1000;for(const m of holos)m.rotation.y=t*m.userData.spin;
      holoMat.opacity=0.8+0.08*Math.sin(t*7.3)+0.04*Math.sin(t*23.1);glassMat.opacity=0.42+0.06*Math.sin(t*1.7);});
    hall.traverse(o=>{o.userData.noWire=true;});      // built after the interior was marked, so marked here
    HALL.group=hall;}

  const PLACES={
    hub:{label:'The hub, at the head of Alpha',y:S.HUBY-260,a:S.STAIRS[0].a,r:240,yaw:Math.PI,pitch:-0.08},
    stairs:{label:'Halfway down Alpha stairway',y:S.yN(4400)-60,a:S.STAIRS[0].a,h:1.7,yaw:Math.PI,pitch:-0.05},
    camp:{label:'Camp Alpha, under the stairway',y:S.PE-260,a:S.STAIRS[0].a-0.0012,h:1.7,yaw:0.25,pitch:0.32},
    london:{label:'The road into London',y:14200+1300,a:S.STAIRS[0].a+0.11,h:1.7,yaw:Math.PI,pitch:0.03},
    valley:{label:'The rim of a Straight Valley',y:12000,a:S.VAL_N[1]+(S.VW/2+90)/S.RI,h:1.7,yaw:-Math.PI/2-0.5,pitch:-0.06},
    shore:{label:'The northern shore, facing New York',y:S.SH+40,a:S.NYA+0.07,h:1.7,yaw:Math.PI,pitch:0.02},
    newyork:{label:'The streets of New York',y:-210,a:S.NYA+0.004,h:1.7,yaw:Math.PI/2,pitch:0.12},
    cliff:{label:'The top of the southern cliff',y:-S.SH-30,a:S.NYA+0.55,h:1.7,yaw:0,pitch:-0.12},
    south:{label:'The Southern Plain',y:-12500,a:S.VAL_S[0]+0.5,h:1.7,yaw:Math.PI,pitch:0.04},
    horns:{label:'Before the Big Horn',y:-13500,a:0.3,r:2600,yaw:Math.PI,pitch:-0.05},
    axis:{label:'The axis, over the Sea',y:0,a:S.NYA,r:80,yaw:Math.PI,pitch:-0.2},
    hall:{label:'London: the hall of holograms',y:HALL.y+HALL.l/2-6,a:HALL.a,h:1.7,yaw:Math.PI,pitch:0.02},
    tour:{label:'Fly the axis, hub to horns (two minutes)',y:S.HUBY-400,a:S.STAIRS[0].a,r:600,yaw:Math.PI,pitch:-0.15},
  };
  const el=renderer.domElement;
  trackPointers(el,{drag:(dx,dy)=>{if(W.on&&!W.follow)walker.look(W,dx,dy,0.004,1.5);},
    wheel:dy=>{if(W.on&&!W.follow){W.h=Math.max(1.7,Math.min(S.ground(W.y,W.a)-25,W.h*Math.exp(dy*0.0012)));}}});
  const keys=trackKeys({onKey:k=>{if(W.on&&k==='escape')exit();}});
  const panel=document.createElement('div');panel.id='ramainside';
  panel.style.cssText='position:fixed;right:10px;top:46px;display:none;flex-direction:column;gap:3px;z-index:6;font:12px Helvetica,Arial,sans-serif;max-height:calc(100vh - 120px);overflow:auto';
  const PB={};
  for(const [k,P] of [...Object.entries(PLACES),['out',{label:'Back outside'}]]){
    const b=document.createElement('button');b.type='button';b.textContent=P.label;b.style.cssText='background:rgba(14,16,20,.88);color:#e8e4da;border:1px solid #5a5446;padding:5px 9px;cursor:pointer;text-align:left';
    b.onclick=()=>{if(k==='out')exit();else go(k);};panel.appendChild(b);PB[k]=b;}
  const tip=document.createElement('div');tip.style.cssText='color:#cfc8b8;background:rgba(14,16,20,.7);padding:4px 8px;max-width:200px;line-height:1.35';
  tip.textContent='Drag to look. W A S D to walk, Q and E (or the wheel) to sink and rise: rise far enough and you float at the axis. Shift to hurry. Esc goes back outside.';panel.appendChild(tip);
  document.body.appendChild(panel);
  function place(P){W.follow=null;W.y=P.y;W.a=P.a;W.yaw=P.yaw||0;W.pitch=P.pitch||0;W.h=P.r!==undefined?S.ground(P.y,P.a)-P.r:(P.h||1.7);}
  // The tour: from the hub down the axis, the whole length of the world to the horns, turning slowly to look
  // at the plains on either side - the flight Jimmy Pak made, without the lightning.
  function tour(){let t0=null;W.follow=(now,W)=>{if(t0===null)t0=now;const t=(now-t0)/1000,u=Math.min(1,t/120),e=u*u*(3-2*u);
      W.y=S.HUBY-400+(-15200-(S.HUBY-400))*e;W.a=S.STAIRS[0].a+t*0.012;W.h=S.ground(W.y,W.a)-(600+1700*Math.sin(u*Math.PI));
      W.yaw=Math.PI+0.55*Math.sin(t*0.06);W.pitch=-0.12-0.3*Math.max(0,Math.sin(t*0.045));if(u>=1)W.follow=null;};}
  function go(where){W.where=PLACES[where]?where:'hub';place(PLACES[W.where]);if(W.where==='tour')tour();for(const [k,b] of Object.entries(PB))b.style.borderColor=k===W.where?'#e8c98a':'#5a5446';}
  const saved={near:0,far:0,fov:0};let fog0=null,bg0=0,showOutside=false,last=0;
  function enter(where){if(!W.on){W.on=true;IN.visible=true;saved.near=camera.near;saved.far=camera.far;saved.fov=camera.fov;fog0=scene.fog;bg0=renderer.getClearColor(new THREE.Color()).getHex();
      camera.near=0.4;camera.far=160000;camera.fov=68;camera.updateProjectionMatrix();cut.set(new THREE.Vector3(0,1,0),1e9);panel.style.display='flex';
      scene.fog=new THREE.FogExp2(0xaeb6ba,0.000032);if(O.onEnter)O.onEnter(true);}
    if(typeof where==='string')go(where);else if(where){W.where='event';place(where);for(const b of Object.values(PB))b.style.borderColor='#5a5446';}}
  function exit(){if(!W.on)return;W.on=false;W.follow=null;IN.visible=showOutside;scene.fog=fog0;renderer.setClearColor(bg0);camera.near=saved.near;camera.far=saved.far;camera.fov=saved.fov;camera.updateProjectionMatrix();panel.style.display='none';if(O.onEnter)O.onEnter(false);}
  const pos=new THREE.Vector3(),tgt=new THREE.Vector3(),up=new THREE.Vector3();
  function camFrame(now){if(!W.on){last=now;return false;}
    const dt=Math.min(0.1,(now-last)/1000);last=now;
    if(W.follow)W.follow(now,W);
    else if(keys.size){const sp=(4+W.h*0.7)*dt*(keys.has('shift')?FAST*2:1);
      walker.walk(W,(keys.has('w')?1:0)-(keys.has('s')?1:0),(keys.has('d')?1:0)-(keys.has('a')?1:0),sp);
      if(keys.has('q'))W.h=Math.max(1.7,W.h-sp*0.8);if(keys.has('e'))W.h=W.h+sp*0.8;
      W.y=Math.max(-S.HUBY+300,Math.min(S.HUBY-140,W.y));W.h=Math.min(W.h,S.ground(W.y,W.a)-25);W.a=((W.a%TAU)+TAU)%TAU;}
    const v=walker.view(W);
    SPIN.updateMatrixWorld(true);const M=SPIN.matrixWorld;
    pos.copy(v.pos).applyMatrix4(M);tgt.copy(v.dir).transformDirection(M).multiplyScalar(1000).add(pos);up.copy(v.up).transformDirection(M);
    camera.position.copy(pos);camera.up.copy(up);camera.lookAt(tgt);return true;}
  const hud=()=>{const r=eyeR(),g=S.gAt(Math.max(0,r));
    const where=W.where==='event'?'':(PLACES[W.where]?PLACES[W.where].label+' · ':'');
    const lights=LS.sun>0.5?'the suns are lit':LS.flare>0.1?'flarelight':'dark';
    return where+(W.h<4?'standing':Math.round(W.h)+' m up')+' · '+(r/1000).toFixed(2)+' km from the axis · '+g.toFixed(2)+' g · '+lights+(LS.ice>0.5?' · the Sea is ice':'');};

  return {group:IN,W,PLACES,valleys,hornTips,CITIES,HALL,
    active:()=>W.on,enter,exit,camFrame,hud,where:()=>W.where,
    showFromOutside:on=>{showOutside=on;if(!W.on)IN.visible=on;},
    follow:fn=>{W.follow=fn;},setWave,fireFlare,strike,placeOn,orient,Batch,vM,lampMat,soft};
}
