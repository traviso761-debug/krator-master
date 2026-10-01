// ---------- the inside of a cylinder ----------
// Every other place in the menagerie is built on a plane with gravity pointing down it. This one is not.
// It is a rotating habitat: a cylinder several kilometres across, spun so that what is bolted to the inside
// of the hull is held against it, and the ground is therefore the inside surface of the tube. Walk far
// enough in any direction across it and you come back. Look up and you see the far side of the country
// hanging over you, with its rivers running the wrong way round the sky.
//
// So the whole model is built in cylinder coordinates and mapped into world space once, by one function:
//
//     u   along the axis, in metres, 0 at the south cap
//     a   around the axis, in radians
//     h   height above the hull's inner surface - "up" is towards the axis, so this is subtracted from R
//
//   at(u, a, h) -> (x, y, z), with the axis lying along world x and the world origin at the middle of it
//
// Everything else - the land, the water, the towns, the rail, the end caps - is written in (u, a) and knows
// nothing about the mapping. What makes the place read as what it is: the strips of land and window
// alternating round the circumference, so you always have sky on two sides and country overhead; the sun
// tube down the axis, because there is nowhere else to put a sun; and the fact that the far valleys are
// lit by the same tube from underneath.
//
// And it turns. Everything that belongs to the habitat hangs off one group (ctx.hab.group), which is spun
// about the axis once every `spin` seconds; the stars, the planet and the sun outside it do not. From outside
// you see it turn. From inside you turn with it, and it is the stars that go past the windows - which is the
// only way anyone living here would ever know it was turning.
import { mkRng } from '../core/rng.js';

export function world(api){
  const {THREE,C,ctx,scene,camera,animHooks,mergeParts}=api;
  const K=C.hab||{};
  const R=K.radius||3200, L=K.length||19000, VALLEYS=K.valleys||3;
  const RNG=mkRng(K.seed||1974);
  const R2=mkRng((K.seed||1974)+7);                     // for everything added since the towns were laid out,
                                                        // so the towns' own stream - and their golden - is untouched
  const SEGA=K.segA||168;

  // everything that turns
  const hab=new THREE.Group();hab.name='habitat';scene.add(hab);

  // ---- the one mapping ----
  const at=(u,a,h)=>{const r=R-(h||0);
    return new THREE.Vector3(u-L/2, Math.cos(a)*r, Math.sin(a)*r);};
  const put=(m,u,a,h)=>{const p=at(u,a,h);m.position.copy(p);
    // "down" is outwards, so everything standing on the ground is turned to face the axis
    m.rotation.set(0,0,0);m.rotateX(Math.PI/2);m.rotateY(0);m.up.set(0,0,0);
    m.lookAt(new THREE.Vector3(p.x,0,0));m.rotateX(-Math.PI/2);return m;};
  // The same, for things that move. lookAt works in world space, and once the habitat is turning the world is
  // not the habitat's frame; this builds the orientation from the habitat's own axes instead: y towards the
  // axis, x the way it is heading (an angle off the axis direction, measured towards increasing a).
  const _m=new THREE.Matrix4(),_x=new THREE.Vector3(),_y=new THREE.Vector3(),_z=new THREE.Vector3();
  const orient=(o,u,a,h,head,roll)=>{o.position.copy(at(u,a,h));
    _y.set(0,-Math.cos(a),-Math.sin(a));                              // up: towards the axis
    const tx=0,ty=-Math.sin(a),tz=Math.cos(a);                        // round the hull, increasing a
    _x.set(Math.cos(head),ty*Math.sin(head),tz*Math.sin(head));       // heading
    _z.crossVectors(_x,_y);
    if(roll){const c=Math.cos(roll),s=Math.sin(roll),y2=_y.clone().multiplyScalar(c).addScaledVector(_z,s);_z.multiplyScalar(c).addScaledVector(_y,-s);_y.copy(y2);}
    _m.makeBasis(_x,_y,_z);o.quaternion.setFromRotationMatrix(_m);};

  // which strip of the circumference a bearing falls in: land, or window
  const STRIP=Math.PI*2/(VALLEYS*2);
  const wrap=a=>((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  const stripOf=a=>Math.floor(wrap(a)/STRIP);
  const isLand=a=>stripOf(a)%2===0;
  const landMid=k=>(k*2+0.5)*STRIP;

  // ---- the light ----
  // Inside a spun cylinder every surface faces the same lamp down the middle, so a directional sun is useless:
  // the light here is the tube itself, a row of point lights down the axis, and the fill is what bounces off
  // the far valleys - blue-grey from the sky strips and green from the land. All of it follows the tube as it
  // dims, which the old version forgot: its night was a dark tube over a country still lit at noon.
  const ambient=new THREE.AmbientLight(0xdfe4ea,0.3);scene.add(ambient);
  const hemi=new THREE.HemisphereLight(0xc8d8ff,0x46503a,0.22);scene.add(hemi);
  const axisLights=[];
  for(let i=0;i<9;i++){const p=new THREE.PointLight(0xfff0cf,0.34,0,0);p.position.set((i/8-0.5)*L*0.96,0,0);scene.add(p);axisLights.push(p);}
  // Air: nineteen kilometres of it end to end. Without haze the far cap is as sharp as your own feet and the
  // place has no size. The stars and the planet are not fogged - they are outside.
  const HAZE=K.haze||0.000055;
  scene.fog=new THREE.FogExp2(0xa9bccb,HAZE);

  const parts=[];
  const GREEN=[0x4a6b3a,0x55753f,0x3f5f36,0x6a7d42,0x51683a];
  const CROP=[0x8a8a4a,0x9a8f52,0x77803f,0xa39a5e];
  const fieldHash=(fu,fa,k)=>Math.abs(Math.sin(fu*12.9898+fa*78.233+k*37.719)*43758.5453)%1;

  // ---- the land ----
  // A height field in (u, a), a few tens of metres of relief on a hull several kilometres across: enough to
  // make a valley read as a valley without pretending the place has mountains. Rivers run down the middle of
  // each valley strip because that is where the water would end up; the lakes are where it stops.
  const relief=(u,a)=>{
    const k=stripOf(a), t=wrap(a)/STRIP-k;              // across the strip, 0..1
    const s=u/L;
    if(k%2)return 0;                                    // a window is a window
    const across=Math.sin(t*Math.PI);                   // it rises at the seams and falls in the middle
    let h=34*(1-across)+6*Math.sin(s*31+k)+4*Math.sin(s*57+t*9);
    h+=16*Math.sin(s*9.1+k*2.1)*across;
    h-=22*Math.exp(-(((t-0.5)/0.10)**2))*(0.55+0.45*Math.sin(s*13+k));  // the river's own trench
    return h;
  };
  const riverAt=(u,k)=>landMid(k)+STRIP*0.5*0.06*Math.sin(u/L*11+k);   // the line the river takes
  const riverW=(u,k)=>STRIP*(0.011+0.006*Math.sin(u/L*7+k)+0.055*Math.max(0,Math.sin(u/L*3.1+k*2)-0.86)*7);

  // ---- the land's paint ----
  // The fields used to be a colour per vertex of the hull, which is one colour every hundred and thirty metres:
  // from a distance a patchwork, close to a smear of jagged stairs. Each valley is painted instead, onto a
  // canvas the size of the strip - three metres a pixel across, five along - with the fields on their 420 m
  // grid, the plough lines in them, the hedges round them, the river banks, the road, the towns' streets and
  // the woods. The canvases are drawn on as the rest of the valley is built, and sent to the GPU at the end.
  const TW=1024,TH=4096,paint=[];
  const hexCss=(h,m)=>{const c=new THREE.Color(h);if(m!==undefined)c.multiplyScalar(m);return '#'+c.getHexString();};
  const tx=(k,a)=>(wrap(a)/STRIP-k*2)*TW, ty=u=>u/L*TH;
  for(let k=0;k<VALLEYS;k++){
    const cv=document.createElement('canvas');cv.width=TW;cv.height=TH;const g=cv.getContext('2d');
    const FU=Math.ceil(L/420),FA=26,fw=TW/FA,fh=420/L*TH;
    for(let fu=0;fu<FU;fu++)for(let fa=0;fa<FA;fa++){
      const hsh=fieldHash(fu,fa,k);
      const col=hsh<0.42?CROP[Math.floor(hsh*9)%CROP.length]:GREEN[Math.floor(hsh*13)%GREEN.length];
      const x=fa*fw,y=fu*fh;g.fillStyle=hexCss(col,0.86+0.14*(hsh*7%1));g.fillRect(x,y,fw+1,fh+1);
      // plough lines or mowing stripes, one way or the other across each field
      g.strokeStyle=hsh<0.42?'rgba(60,48,20,0.16)':'rgba(255,255,220,0.06)';g.lineWidth=1;g.beginPath();
      if(hsh*31%1<0.5)for(let q=x+2;q<x+fw;q+=3){g.moveTo(q,y);g.lineTo(q,y+fh);}
      else for(let q=y+2;q<y+fh;q+=3){g.moveTo(x,q);g.lineTo(x+fw,q);}
      g.stroke();
      // a field left fallow, or grazed, is not one flat colour
      for(let q=0;q<14;q++){g.fillStyle=`rgba(${q%2?40:200},${q%2?60:190},${q%2?30:120},0.07)`;
        g.beginPath();g.arc(x+R2()*fw,y+R2()*fh,2+R2()*9,0,6.3);g.fill();}}
    // the hedges, on the same grid as the fields and as the hedge meshes
    g.strokeStyle='#2c4424';g.lineWidth=2;g.beginPath();
    for(let fu=0;fu<=FU;fu++){g.moveTo(0,fu*fh);g.lineTo(TW,fu*fh);}
    for(let fa=0;fa<=FA;fa++){g.moveTo(fa*fw,0);g.lineTo(fa*fw,TH);}g.stroke();
    // hedgerow trees, dotted along them
    g.fillStyle='#29401f';for(let q=0;q<5000;q++){const onU=R2()<0.5,x=onU?R2()*TW:Math.floor(R2()*FA)*fw,y=onU?Math.floor(R2()*FU)*fh:R2()*TH;g.beginPath();g.arc(x,y,1.5+R2()*2,0,6.3);g.fill();}
    // the margins, where the land turns up to meet the glass: rough grass and rock
    for(const [x0,x1] of [[0,0.035],[0.965,1]]){const gr=g.createLinearGradient(x0*TW,0,x1*TW,0);
      gr.addColorStop(x0?0:1,'rgba(98,104,78,0)');gr.addColorStop(x0?1:0,'rgba(118,116,100,1)');g.fillStyle=gr;g.fillRect(x0*TW,0,(x1-x0)*TW,TH);}
    // the river: its banks and the reeds along them (the water itself is a mesh laid over this)
    const a0=k*2*STRIP;
    for(const [wid,col] of [[3.2,'#3d5a34'],[1.6,'#5a5a40'],[1.05,'#2a3c3a']]){g.strokeStyle=col;g.beginPath();
      for(let j=0;j<=400;j++){const u=L*j/400,x=tx(k,riverAt(u,k)),w=riverW(u,k)/STRIP*TW*wid;if(!j)g.moveTo(x,ty(u));else g.lineTo(x,ty(u));g.lineWidth=Math.max(2,w*2);}
      g.stroke();}
    // the road, a field's width off the river, and the line's shadow on its viaduct
    for(const [off,w,col] of [[0.085,4,'#5f5c55'],[0.30,5,'rgba(30,34,26,0.35)']]){g.strokeStyle=col;g.lineWidth=w;g.beginPath();
      for(let j=0;j<=200;j++){const u=L*(0.03+0.94*j/200),x=tx(k,riverAt(u,k)+STRIP*off);if(!j)g.moveTo(x,ty(u));else g.lineTo(x,ty(u));}g.stroke();}
    paint.push({cv,g,a0});
  }
  const paintTown=(k,u,a,side)=>{const P=paint[k],g=P.g,BLK=56,ST=14,x=tx(k,a+side*STRIP*0.05),y=ty(u);
    const wu=(BLK+ST)*7/L*TH,wa=(BLK+ST)*5/R/STRIP*TW;
    g.fillStyle='#8a847a';g.fillRect(x-wa/2,y-wu/2,wa,wu);
    g.fillStyle='#4b4a46';for(let i=-3;i<=3;i++){g.fillRect(x-wa/2,y+i*(BLK+ST)/L*TH-ST/L*TH/2,wa,Math.max(2,ST/L*TH));}
    for(let i=-2;i<=2;i++){g.fillRect(x+i*(BLK+ST)/R/STRIP*TW-ST/R/STRIP*TW/2,y-wu/2,Math.max(2,ST/R/STRIP*TW),wu);}
    // gardens behind the terraces
    g.fillStyle='rgba(70,110,50,0.5)';for(let q=0;q<30;q++){g.fillRect(x+(R2()-0.5)*wa,y+(R2()-0.5)*wu,3+R2()*4,3+R2()*4);}};
  const paintBlob=(k,u,a,ru,ra,col,n)=>{const g=paint[k].g;g.fillStyle=col;
    for(let q=0;q<(n||30);q++){g.beginPath();g.arc(tx(k,a+(R2()-0.5)*ra*2),ty(u+(R2()-0.5)*ru*2),2+R2()*6,0,6.3);g.fill();}};

  // ---- the hull under the land: one strip mesh per valley, painted ----
  // The window strips are not hull at all any more. They used to be painted a dark grey under the glass, which
  // made them read as tarmac; now there is nothing under the glass but space, and the stars and the planet in it.
  const landMats=[];
  for(let k=0;k<VALLEYS;k++){
    const a0=k*2*STRIP,NA=56,NU=Math.max(140,Math.round(L/60));
    const pos=[],uv=[],idx=[];
    for(let j=0;j<=NU;j++){const u=L*j/NU;
      for(let i=0;i<=NA;i++){const t=i/NA,a=a0+STRIP*t,p=at(u,a,relief(u,a));pos.push(p.x,p.y,p.z);uv.push(t,1-u/L);}}
    for(let j=0;j<NU;j++)for(let i=0;i<NA;i++){const A=j*(NA+1)+i,Bv=A+1,Cv=A+NA+1,D=Cv+1;idx.push(A,Cv,D,A,D,Bv);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
    const tex=new THREE.CanvasTexture(paint[k].cv);tex.anisotropy=Math.min(8,api.renderer.capabilities.getMaxAnisotropy());tex.flipY=true;
    const m=new THREE.MeshLambertMaterial({map:tex});landMats.push(m);
    const mesh=new THREE.Mesh(g,m);mesh.name='land';parts.push(mesh);paint[k].tex=tex;
    // the retaining walls along both long edges, where the land stands above the glass
    const wp=[],wi=[];
    for(const sd of [0,1]){const a=a0+STRIP*sd,base=wp.length/3;
      for(let j=0;j<=NU;j++){const u=L*j/NU,p0=at(u,a,relief(u,a)),p1=at(u,a,-3);wp.push(p0.x,p0.y,p0.z,p1.x,p1.y,p1.z);}
      for(let j=0;j<NU;j++){const A=base+j*2;wi.push(A,A+2,A+1,A+1,A+2,A+3);}}
    const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wp,3));wg.setIndex(wi);wg.computeVertexNormals();
    parts.push(new THREE.Mesh(wg,new THREE.MeshLambertMaterial({color:0x8d8a80,side:THREE.DoubleSide})));
  }

  const waterM=new THREE.MeshPhongMaterial({color:0x1d3d4a,specular:0x141c20,shininess:18,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});

  // ---- the windows ----
  // Three strips of glass the length of the hull, and the frame that holds them: mullions running the length
  // and transoms across every seven hundred metres, in dark metal. They were white boxes with gaps between,
  // which from the valley floor read as the dashes down a road.
  const glassM=new THREE.MeshPhongMaterial({color:0x0c1422,specular:0x8aa4c0,shininess:90,side:THREE.DoubleSide,transparent:true,opacity:0.16,depthWrite:false});
  const frameM=new THREE.MeshLambertMaterial({color:0x30353b,flatShading:true});
  const frames=[];
  for(let k=0;k<VALLEYS;k++){
    const a0=(k*2+1)*STRIP,a1=a0+STRIP;
    const pos=[],idx=[],rows=[];
    for(let j=0;j<=40;j++){
      const u=L*j/40,row=[];
      for(let i=0;i<=16;i++){const a=a0+(a1-a0)*i/16,p=at(u,a,-2);row.push(pos.length/3);pos.push(p.x,p.y,p.z);}
      rows.push(row);
    }
    for(let j=0;j<40;j++)for(let i=0;i<16;i++){
      const A=rows[j][i],B=rows[j][i+1],Cc=rows[j+1][i],D=rows[j+1][i+1];idx.push(A,Cc,D,A,D,B);
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
    g.computeVertexNormals();g.computeBoundingSphere();
    const glass=new THREE.Mesh(g,glassM);glass.renderOrder=5;parts.push(glass);
    for(let j=0;j<=26;j++){const u=L*j/26;                                // transoms
      for(let i=0;i<12;i++){const aa=a0+(a1-a0)*i/12,ab=a0+(a1-a0)*(i+1)/12,p0=at(u,aa,0),p1=at(u,ab,0);
        const m=new THREE.Mesh(new THREE.BoxGeometry(8,10,p0.distanceTo(p1)+2),frameM);
        m.position.copy(p0.clone().add(p1).multiplyScalar(0.5));m.lookAt(new THREE.Vector3(m.position.x,0,0));frames.push(m);}}
    for(let i=0;i<=6;i++){const a=a0+(a1-a0)*i/6,w=i%6?9:40;           // mullions, and the heavy seams at the edges
      for(let j=0;j<40;j++){const p0=at(L*j/40,a,0),p1=at(L*(j+1)/40,a,0);
        const m=new THREE.Mesh(new THREE.BoxGeometry(L/40+2,i%6?12:34,w),frameM);
        m.position.copy(p0.clone().add(p1).multiplyScalar(0.5));m.lookAt(new THREE.Vector3(m.position.x,0,0));frames.push(m);}}
  }
  parts.push(mergeParts(frames,frameM));

  // ---- the outside of it ----
  // A shell over each strip of land, with the window strips left open, because those are the only places you
  // are meant to be able to see in. It carries what a hull carries - ring frames, longerons, and the radiator
  // fins that get rid of the heat, which for a place this size are the biggest thing on the outside of it.
  {
    // Double-sided, and not because the winding is in doubt: a shell this size seen edge-on across a
    // kilometre of curvature shows its inside face at the horizon of itself, and a one-sided one goes
    // transparent exactly there - which is the seam you saw the far valleys through.
    const skinM=new THREE.MeshPhongMaterial({color:0x9aa1a8,specular:0x444a50,shininess:18,flatShading:true,side:THREE.DoubleSide});
    const plateM=new THREE.MeshLambertMaterial({color:0x585f67,flatShading:true});
    const radM=new THREE.MeshPhongMaterial({color:0xe2e5e8,specular:0x888888,shininess:30,flatShading:true});
    const OUT_R=R+(K.skin||46);
    for(let k=0;k<VALLEYS;k++){
      const a0=k*2*STRIP, a1=a0+STRIP;
      const pos=[],nor=[],idx=[],rows=[];
      for(let j=0;j<=44;j++){
        const u=L*j/44,row=[];
        for(let i=0;i<=22;i++){
          const a=a0+(a1-a0)*i/22;
          const r=OUT_R+8*Math.sin(u/L*37+i*0.7);
          row.push(pos.length/3);
          pos.push(u-L/2,Math.cos(a)*r,Math.sin(a)*r);
          nor.push(0,Math.cos(a),Math.sin(a));
        }
        rows.push(row);
      }
      for(let j=0;j<44;j++)for(let i=0;i<22;i++){
        const A=rows[j][i],Bv=rows[j][i+1],Cv=rows[j+1][i],D=rows[j+1][i+1];
        idx.push(A,D,Cv,A,Bv,D);
      }
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
      g.setIndex(idx);g.computeBoundingSphere();
      parts.push(new THREE.Mesh(g,skinM));
    }
    const out=[];
    for(let j=0;j<=24;j++){
      const u=L*j/24;
      const t=new THREE.Mesh(new THREE.TorusGeometry(OUT_R+16,26,6,SEGA/3),plateM);
      t.position.set(u-L/2,0,0);t.rotation.y=Math.PI/2;out.push(t);
    }
    for(let k=0;k<VALLEYS*2;k++){
      const a=k*STRIP;
      for(let j=0;j<44;j++){
        const u=L*(j+0.5)/44;
        const m=new THREE.Mesh(new THREE.BoxGeometry(L/44,40,70),plateM);
        m.position.set(u-L/2,Math.cos(a)*(OUT_R+10),Math.sin(a)*(OUT_R+10));
        m.lookAt(new THREE.Vector3(m.position.x,0,0));out.push(m);
      }
    }
    parts.push(mergeParts(out,plateM));
    const rads=[],arms=[];
    for(let k=0;k<VALLEYS;k++){
      const a=k*2*STRIP+STRIP*0.5;
      for(let j=0;j<16;j++){
        const u=L*(0.08+0.84*j/15);
        for(const sd of [-1,1]){
          const m=new THREE.Mesh(new THREE.BoxGeometry(420,16,600),radM);
          const rr=OUT_R+380;
          m.position.set(u-L/2,Math.cos(a+sd*0.16)*rr,Math.sin(a+sd*0.16)*rr);
          m.lookAt(new THREE.Vector3(m.position.x,0,0));m.rotateZ(sd*0.5);rads.push(m);
          const arm=new THREE.Mesh(new THREE.BoxGeometry(30,30,360),plateM);
          arm.position.set(u-L/2,Math.cos(a+sd*0.16)*(OUT_R+180),Math.sin(a+sd*0.16)*(OUT_R+180));
          arm.lookAt(new THREE.Vector3(arm.position.x,0,0));arms.push(arm);
        }
      }
    }
    parts.push(mergeParts(rads,radM),mergeParts(arms,plateM));
  }

  // ---- the end caps ----
  // They used to be cones stepping *inwards* from the rim, drawn back-faced - so from inside, looking down the
  // length of the place, each end was a black disc with stars in it: the one view that should show the whole
  // habitat closing round you showed a hole. Now each cap bulges outwards, the way a pressure vessel's end has
  // to, and is terraced: a great amphitheatre of planted steps rising from the rim to the hub, with the rock
  // showing on the risers. Outside it is a second, plated shell. Through the hub runs the spindle, where the
  // sun tube is anchored and where ships dock.
  const CAPD=R*(K.capDepth||0.42),HUB=R*0.07,NT=K.terraces||11;
  {
    const prof=[],cols=[];
    const d=r=>CAPD*Math.sqrt(Math.max(0,1-(r/R)**2));
    const green=[new THREE.Color(0x4f6e3a),new THREE.Color(0x3f5c31),new THREE.Color(0x6d7340),new THREE.Color(0x857a48)],rock=new THREE.Color(0x5e584f),rim=new THREE.Color(0x77736a);
    prof.push(new THREE.Vector2(R,0));cols.push(rim);
    for(let n=0;n<NT;n++){const r0=R-(R-HUB)*n/NT,r1=R-(R-HUB)*(n+1)/NT,flat=r0-(r0-r1)*0.78;
      // the step's tread, then its riser up to the next
      prof.push(new THREE.Vector2(r0,d(r0)+2),new THREE.Vector2(flat,d(r0)+2));cols.push(green[n%4],green[n%4]);
      prof.push(new THREE.Vector2(flat-1,d(r0)+4),new THREE.Vector2(r1,d(r1)));cols.push(rock,rock);}
    prof.push(new THREE.Vector2(HUB,CAPD+40));cols.push(rim);
    // outside, the cap is a smooth plated dome over the terraces, not a copy of them
    const outer=[];for(let q=0;q<=24;q++){const r=R+(K.skin||46)-(R+(K.skin||46)-HUB)*q/24;outer.push(new THREE.Vector2(r,d(Math.min(R,r))+70+40*Math.sin(q/24*Math.PI)));}
    const inM=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
    const outM=new THREE.MeshPhongMaterial({color:0x8e959c,specular:0x333333,shininess:14,flatShading:true,side:THREE.DoubleSide});
    for(const end of [0,1]){
      const lg=new THREE.LatheGeometry(prof,SEGA/2);
      // the treads are farmed in patches round the ring, some of them wood, so the cap is a landscape and not a target
      const cc=[],SEG=SEGA/2;
      for(let i=0;i<=SEG;i++)for(let j=0;j<prof.length;j++){let c=cols[j];
        if(c!==rock&&c!==rim){const q=Math.floor((i%SEG)/3),hs=Math.abs(Math.sin(q*12.9898+Math.floor(j/4)*78.233+end*9.1)*43758.5453)%1;c=hs<0.3?green[1]:hs<0.55?green[2]:hs<0.75?green[3]:green[0];}
        const v=0.88+0.12*Math.sin(i*1.7+j);cc.push(c.r*v,c.g*v,c.b*v);}
      lg.setAttribute('color',new THREE.Float32BufferAttribute(cc,3));lg.computeVertexNormals();
      lg.rotateZ(end?-Math.PI/2:Math.PI/2);
      const m=new THREE.Mesh(lg,inM);m.position.x=end?L/2:-L/2;parts.push(m);
      const og=new THREE.LatheGeometry(outer,SEGA/2);og.rotateZ(end?-Math.PI/2:Math.PI/2);
      const o=new THREE.Mesh(og,outM);o.position.x=end?L/2:-L/2;parts.push(o);
      // the hub, and the spindle standing out of it
      const dir=end?1:-1,spM=new THREE.MeshPhongMaterial({color:0xa4abb2,specular:0x666666,shininess:40,flatShading:true});
      const sp=new THREE.Mesh(new THREE.CylinderGeometry(HUB*0.8,HUB,R*0.55,20).rotateZ(Math.PI/2),spM);
      sp.position.x=dir*(L/2+CAPD+R*0.25);parts.push(sp);
      for(let q=0;q<4;q++){const ring=new THREE.Mesh(new THREE.TorusGeometry(HUB*1.15,22,6,24),frameM);ring.rotation.y=Math.PI/2;ring.position.x=dir*(L/2+CAPD+R*0.06+q*R*0.13);parts.push(ring);}
      // ribs down the dome from the hub to the rim, which is what makes a dome read as built rather than blown
      const ribs=[];
      for(let q=0;q<18;q++){const ph=q/18*Math.PI*2;
        for(let j=0;j+1<outer.length;j++){const A=outer[j],B=outer[j+1],l=Math.hypot(B.x-A.x,B.y-A.y);
          const m=new THREE.Mesh(new THREE.BoxGeometry(l+4,30,40),frameM);
          const mx=(A.y+B.y)/2+6,mr=(A.x+B.x)/2;m.position.set(dir*(L/2+mx),Math.cos(ph)*mr,Math.sin(ph)*mr);
          m.rotation.set(ph,0,0);m.rotateZ(Math.atan2(B.x-A.x,dir*(B.y-A.y)));ribs.push(m);}}
      parts.push(mergeParts(ribs,frameM));
    }
  }

  // ---- the dock ----
  // At the end of the north spindle, and not turning: a ship coming in matches the spin of nothing, so the
  // dock is on a bearing that the spindle turns inside, and the ships tie up to that. Lights on it, a few ships
  // alongside, and the ferries coming and going along the axis.
  {
    const dockX=L/2+CAPD+R*0.58,dock=new THREE.Group();dock.name='dock';scene.add(dock);
    const dm=new THREE.MeshPhongMaterial({color:0xb4bac0,specular:0x555555,shininess:30,flatShading:true});
    const shipM=new THREE.MeshPhongMaterial({color:0xd8d4cc,specular:0x444444,shininess:20,flatShading:true});
    const litM=new THREE.MeshBasicMaterial({color:0xff5040});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(620,70,8,36),dm);ring.rotation.y=Math.PI/2;ring.position.x=dockX;dock.add(ring);
    const hubB=new THREE.Mesh(new THREE.CylinderGeometry(HUB*1.3,HUB*1.3,260,24).rotateZ(Math.PI/2),dm);hubB.position.x=dockX;dock.add(hubB);
    for(let q=0;q<6;q++){const ph=q/6*Math.PI*2;
      const spoke=new THREE.Mesh(new THREE.BoxGeometry(60,620-HUB*1.3,50),dm);spoke.position.set(dockX,Math.cos(ph)*(620+HUB*1.3)/2,Math.sin(ph)*(620+HUB*1.3)/2);spoke.rotation.x=ph-Math.PI/2;dock.add(spoke);
      if(q%2){const sh=new THREE.Mesh(new THREE.BoxGeometry(420,70,90),shipM);sh.position.set(dockX+300,Math.cos(ph)*700,Math.sin(ph)*700);dock.add(sh);}
      const lamp=new THREE.Mesh(new THREE.SphereGeometry(28,8,6),litM);lamp.position.set(dockX,Math.cos(ph+0.5)*700,Math.sin(ph+0.5)*700);dock.add(lamp);}
    const ferries=[];
    for(let q=0;q<3;q++){const f=new THREE.Mesh(new THREE.ConeGeometry(45,240,6).rotateZ(-Math.PI/2),shipM);scene.add(f);ferries.push({f,ph:q/3,off:(q-1)*260});}
    animHooks.push(now=>{litM.color.setRGB((now%1400)<700?1:0.25,0.2,0.15);
      for(const q of ferries){const t=((now/1000)/90+q.ph)%1,out=t<0.5,x=dockX+700+(out?t*2:(1-t)*2)*16000;
        q.f.position.set(x,q.off,q.off*0.6);q.f.rotation.y=out?0:Math.PI;}});
  }

  // ---- the sun ----
  // A tube down the axis, anchored in both hubs. There is nowhere else to put a sun in a place like this, and
  // it is why the far valleys are lit from underneath: the light comes from the middle of the sky.
  const SR=K.sunR||34;
  const sunM=new THREE.MeshBasicMaterial({color:0xfff0cf,fog:false});
  const sunTube=new THREE.Mesh(new THREE.CylinderGeometry(SR,SR,L+CAPD*2,16).rotateZ(Math.PI/2),sunM);sunTube.name='sun tube';
  hab.add(sunTube);
  const haloM=new THREE.MeshBasicMaterial({color:0xffe9b8,transparent:true,opacity:0.16,depthWrite:false,fog:false});
  const halo=new THREE.Mesh(new THREE.CylinderGeometry(SR*4.6,SR*4.6,L+CAPD*2,16).rotateZ(Math.PI/2),haloM);
  hab.add(halo);
  const halo2M=new THREE.MeshBasicMaterial({color:0xfff2d0,transparent:true,opacity:0.06,depthWrite:false,fog:false});
  hab.add(new THREE.Mesh(new THREE.CylinderGeometry(SR*14,SR*14,L+CAPD*2,16).rotateZ(Math.PI/2),halo2M));

  // ---- the water ----
  for(let k=0;k<VALLEYS;k++){
    const pos=[],idx=[],rows=[];
    for(let j=0;j<=140;j++){
      const u=L*j/140,a=riverAt(u,k),w=riverW(u,k);
      const l=at(u,a-w,relief(u,a)+1.2),r=at(u,a+w,relief(u,a)+1.2);
      rows.push([pos.length/3,pos.length/3+1]);pos.push(l.x,l.y,l.z,r.x,r.y,r.z);
    }
    for(let j=0;j<140;j++){const [a0,b0]=rows[j],[a1,b1]=rows[j+1];idx.push(a0,a1,b1,a0,b1,b0);}
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
    g.computeVertexNormals();g.computeBoundingSphere();
    parts.push(new THREE.Mesh(g,waterM));
  }

  // ---- the field boundaries ----
  // The paint gives the land its hedges at every distance; these are the hedges themselves, for when you are
  // standing in the field. Along the same 420 m grid.
  {
    const hedgeM=new THREE.MeshLambertMaterial({color:0x35502c,flatShading:true});
    const hedges=[];
    for(let k=0;k<VALLEYS;k++){
      const a0=k*2*STRIP, a1=a0+STRIP;
      for(let fu=0;fu<L/420;fu++){
        const u=fu*420;
        if(u<L*0.03||u>L*0.97)continue;
        for(let i=0;i<20;i++){
          const aa=a0+(a1-a0)*(i+0.5)/20;
          if(Math.abs((aa-a0)/(a1-a0)-0.5)<0.06)continue;
          const m=new THREE.Mesh(new THREE.BoxGeometry(2.5,3,(a1-a0)/20*R*0.98),hedgeM);
          put(m,u,aa,relief(u,aa)+1.5);hedges.push(m);
        }
      }
      for(let i=0;i<=26;i++){
        const aa=a0+(a1-a0)*i/26;
        if(Math.abs(i/26-0.5)<0.07)continue;
        for(let fu=0;fu<L/500;fu++){
          const u=fu*500+250;
          if(u<L*0.03||u>L*0.97)continue;
          const m=new THREE.Mesh(new THREE.BoxGeometry(500*0.98,3,2.5),hedgeM);
          put(m,u,aa,relief(u,aa)+1.5);hedges.push(m);
        }
      }
    }
    parts.push(mergeParts(hedges,hedgeM));
  }

  // ---- what people built ----
  // Towns strung along each valley, the terrace blocks facing the river, and the line that runs the length
  // of the hull past all of them. Everything is small: the hull is the landscape here, and a ten-storey
  // block three kilometres overhead has to read as a town rather than as a smudge.
  // (This section's draws on RNG are the layout the golden file fingerprints: change them and the golden moves.)
  const WALLC=[0xd8cfbc,0xcfc7b4,0xe2d9c4,0xc4b9a2,0xd9d2c6];
  const wallMs=WALLC.map(c=>new THREE.MeshLambertMaterial({color:c,flatShading:true}));
  const roofM=new THREE.MeshLambertMaterial({color:0x8a5a44,flatShading:true});
  const roof2M=new THREE.MeshLambertMaterial({color:0x5c6064,flatShading:true});
  const steelM=new THREE.MeshLambertMaterial({color:0x9aa0a6,flatShading:true});
  const roadM=new THREE.MeshLambertMaterial({color:0x4b4a46,flatShading:true});
  const glow=new THREE.MeshBasicMaterial({color:0xffd9a0,fog:false});
  const walls=WALLC.map(()=>[]),roofs=[],roofs2=[],rails=[],streets=[],lamps=[],lots=[];
  const TOWNS=K.towns||9;
  let nb=0;
  for(let k=0;k<VALLEYS;k++){
    for(let t=0;t<TOWNS;t++){
      const u=L*(0.08+0.84*(t+0.5)/TOWNS),a0=riverAt(u,k);
      const side=(t%2)?1:-1;
      const n=26+Math.floor(RNG()*34);
      // A town here is a grid of blocks on a street plan, not a scatter: land is the one thing this place
      // has none of - twenty-seven square kilometres for the whole world - so nothing is built loose.
      const BLK=56,ST=14;
      paintTown(k,u,a0,side);
      for(let b=0;b<n;b++){
        const bu=Math.floor(RNG()*7)-3, ba=Math.floor(RNG()*5)-2;
        const du=bu*(BLK+ST)+(RNG()-0.5)*(BLK-16);
        const da=side*(STRIP*0.05)+ba*((BLK+ST)/R)+(RNG()-0.5)*(BLK-16)/R;
        const uu=u+du,aa=a0+da;
        const gh=relief(uu,aa);
        const w=14+RNG()*22,d=11+RNG()*16,hh=9+RNG()*26;
        const m=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d).translate(0,hh/2,0),wallMs[nb%WALLC.length]);
        put(m,uu,aa,gh);walls[nb%WALLC.length].push(m);nb++;
        lots.push({x:uu,z:aa*1000,w:w,dpt:d,h:hh,ry:0,kind:'town'});   // the shape probe.py hashes
        // a pitched roof on the low ones and a flat one with plant on the tall; a pitched roof is what makes
        // a box a house from above
        if(hh<22){const rf=new THREE.Mesh(new THREE.CylinderGeometry(0.01,1,1,4,1).rotateY(Math.PI/4),roofM);rf.scale.set(w*0.74,6,d*0.74);put(rf,uu,aa,gh+hh+3);roofs.push(rf);}
        else{const rf=new THREE.Mesh(new THREE.BoxGeometry(w*1.04,1.6,d*1.04),roof2M);put(rf,uu,aa,gh+hh);roofs2.push(rf);
          const pl=new THREE.Mesh(new THREE.BoxGeometry(w*0.3,3,d*0.3),steelM);put(pl,uu,aa,gh+hh+2);rails.push(pl);}
        // the windows: what makes a town a town once the tube dims
        const win=new THREE.Mesh(new THREE.BoxGeometry(w*1.01,hh*0.1,d*1.01),glow);
        for(let f=0;f<Math.floor(hh/4.5);f++){const wm=win.clone();put(wm,uu,aa,gh+2.2+f*4.5);lamps.push(wm);}
        if(RNG()<0.2){const sp=new THREE.Mesh(new THREE.ConeGeometry(3,18,6),roofM);
          put(sp,uu,aa,gh+hh+2);roofs.push(sp);}
      }
      for(let g2=-3;g2<=3;g2++){
        const uu=u+g2*(BLK+ST);
        const strip=new THREE.Mesh(new THREE.BoxGeometry(ST,1.2,(BLK+ST)*5),roadM);
        put(strip,uu,a0+side*STRIP*0.05,relief(uu,a0)+0.6);streets.push(strip);
      }
      for(let g2=-2;g2<=2;g2++){
        const aa=a0+side*STRIP*0.05+g2*((BLK+ST)/R);
        const strip=new THREE.Mesh(new THREE.BoxGeometry((BLK+ST)*7,1.2,ST),roadM);
        put(strip,u,aa,relief(u,aa)+0.6);streets.push(strip);
      }
      const br=new THREE.Mesh(new THREE.BoxGeometry(70,4,STRIP*R*0.14),steelM);
      put(br,u,a0,relief(u,a0)+12);rails.push(br);
    }
    for(let j=0;j<120;j++){
      const u=L*(0.04+0.92*j/120),a=riverAt(u,k)+STRIP*0.30;
      const gh=relief(u,a);
      const deck=new THREE.Mesh(new THREE.BoxGeometry(L*0.92/120,3,14),steelM);
      put(deck,u,a,gh+22);rails.push(deck);
      if(j%2===0){const pier=new THREE.Mesh(new THREE.BoxGeometry(5,22,5).translate(0,11,0),steelM);
        put(pier,u,a,gh);rails.push(pier);}
    }
  }
  walls.forEach((w,i)=>{if(w.length)parts.push(mergeParts(w,wallMs[i]));});
  parts.push(mergeParts(roofs,roofM),mergeParts(roofs2,roof2M),mergeParts(rails,steelM),mergeParts(streets,roadM));
  if(lamps.length)parts.push(mergeParts(lamps,glow));

  // ---- woods, farms and the road ----
  // A valley of nothing but fields reads as a carpet. Woodland in the corners the plough cannot reach, a
  // farmstead to every few fields, and one road down each valley joining the towns to each other. The trees are
  // instanced now - two thousand cones merged into one buffer was the heaviest thing on the page - and each
  // wood is painted onto the land under it too, so it is still a wood from the other side of the sky.
  {
    const leafG=new THREE.ConeGeometry(0.6,1.7,6).translate(0,0.85,0),trunkG=new THREE.CylinderGeometry(0.09,0.13,0.8,5).translate(0,0.4,0);
    const leafM=new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),trunkM=new THREE.MeshLambertMaterial({color:0x3e3226,flatShading:true});
    const farmM=new THREE.MeshLambertMaterial({color:0xcac2ae,flatShading:true});
    const barnM=new THREE.MeshLambertMaterial({color:0x7a4a36,flatShading:true});
    const roadM2=new THREE.MeshLambertMaterial({color:0x5a5852,flatShading:true});
    const trees=[],farms=[],barns=[],road=[];
    const LEAF=[0x2f4a26,0x3a5a2c,0x284020,0x4a6230,0x35522a].map(c=>new THREE.Color(c));
    for(let k=0;k<VALLEYS;k++){
      const a0=k*2*STRIP;
      for(let w=0;w<(K.woods||26);w++){
        const cu=L*(0.05+0.9*R2()), side=R2()<0.5?0.1:0.9;
        const ca=a0+STRIP*(side+(R2()-0.5)*0.12);
        paintBlob(k,cu,ca,380,STRIP*0.07,'#23381c',220);
        for(let t=0;t<90;t++){
          const u=cu+(R2()-0.5)*700, a=ca+(R2()-0.5)*STRIP*0.12;
          trees.push([u,a,9+R2()*11,R2()]);
        }
      }
      // trees along the river, the one place nobody ploughs
      for(let t=0;t<260;t++){const u=L*(0.03+0.94*R2()),a=riverAt(u,k)+(R2()<0.5?-1:1)*(riverW(u,k)*1.4+R2()*0.004);trees.push([u,a,7+R2()*9,R2()]);}
      for(let f=0;f<(K.farms||40);f++){
        const u=L*(0.05+0.9*R2()), a=a0+STRIP*(0.16+0.68*R2());
        if(Math.abs((a-a0)/STRIP-0.5)<0.09)continue;
        const h=relief(u,a);
        paintBlob(k,u+15,a,40,0.0006,'#7a7466',12);
        const ho=new THREE.Mesh(new THREE.BoxGeometry(16,9,11).translate(0,4.5,0),farmM);
        put(ho,u,a,h);farms.push(ho);
        const ba=new THREE.Mesh(new THREE.BoxGeometry(24,11,14).translate(0,5.5,0),barnM);
        put(ba,u+22+R2()*14,a+(R2()-0.5)*0.004,h);barns.push(ba);
      }
      for(let j=0;j<150;j++){
        const u=L*(0.03+0.94*j/150), a=riverAt(u,k)+STRIP*0.085;
        const m=new THREE.Mesh(new THREE.BoxGeometry(L*0.94/150,1.4,9),roadM2);
        put(m,u,a,relief(u,a)+0.7);road.push(m);
      }
    }
    const lf=new THREE.InstancedMesh(leafG,leafM,trees.length),tk=new THREE.InstancedMesh(trunkG,trunkM,trees.length),o=new THREE.Object3D();
    trees.forEach(([u,a,sz,c],i)=>{orient(o,u,a,relief(u,a)-0.5,c*6,0);o.scale.setScalar(sz);o.updateMatrix();lf.setMatrixAt(i,o.matrix);tk.setMatrixAt(i,o.matrix);lf.setColorAt(i,LEAF[Math.floor(c*5)%5]);});
    for(const m of [lf,tk]){m.geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(),Math.hypot(L/2,R)+100);parts.push(m);}
    parts.push(mergeParts(farms,farmM),mergeParts(barns,barnM),mergeParts(road,roadM2));
    ctx.details=Object.assign(ctx.details||{},{trees:trees.length});
  }
  // the paint is finished: send it
  for(const P of paint)P.tex.needsUpdate=true;

  // ---- cloud ----
  // Weather in a cylinder is a ring: the air is held against the hull by the same spin everything else is,
  // so cloud forms in a band at a height and goes round rather than over. They were faceted grey spheres; they
  // are soft now, a cluster of billboards each, in a layer at about a fifth of the radius, and the layer turns a
  // little faster than the hull, because the air at that height is not quite keeping up with it.
  const clouds=new THREE.Group();hab.add(clouds);
  let cloudM;
  {
    const cc=document.createElement('canvas');cc.width=cc.height=128;const g=cc.getContext('2d');
    for(let q=0;q<7;q++){const x=64+(q?Math.cos(q)*26:0),y=64+(q?Math.sin(q*1.7)*14:0),r=q?34:46;
      const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,0.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);}
    cloudM=new THREE.PointsMaterial({map:new THREE.CanvasTexture(cc),size:360,sizeAttenuation:true,transparent:true,depthWrite:false,color:0xf4f6f8,opacity:0.6});
    const pos=[];
    for(let k=0;k<(K.clouds||120);k++){
      const kk=Math.floor(R2()*VALLEYS),a=kk*2*STRIP+STRIP*(0.12+0.76*R2());
      const u=L*(0.04+0.92*R2()),h=R*(0.13+0.09*R2()),n=8+Math.floor(R2()*12),su=180+R2()*380,sa=(90+R2()*200)/R;
      for(let q=0;q<n;q++){const p=at(u+(R2()-0.5)*su,a+(R2()-0.5)*sa,h+(R2()-0.5)*40);pos.push(p.x,p.y,p.z);}
    }
    const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    const pts=new THREE.Points(g2,cloudM);pts.name='cloud';pts.renderOrder=6;clouds.add(pts);
  }

  // ---- the gliders ----
  // At a tenth of a gravity, a hundred metres under the axis, a person with wings can stay up all afternoon.
  // Everyone who has ever drawn one of these has drawn somebody flying in it, and they were right to.
  {
    const wingM=new THREE.MeshLambertMaterial({color:0xe8e2d0,side:THREE.DoubleSide,flatShading:true});
    const stripeM=new THREE.MeshLambertMaterial({color:0xb03a2a,side:THREE.DoubleSide,flatShading:true});
    const pilotM=new THREE.MeshLambertMaterial({color:0x40464e});
    const gliders=[];
    for(let k=0;k<(K.gliders||7);k++){
      const g=new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(3.2,0.3,17),k%2?stripeM:wingM));
      const tail=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.25,5),wingM);tail.position.x=-4.4;g.add(tail);
      const fin=new THREE.Mesh(new THREE.BoxGeometry(1.4,2.2,0.2),wingM);fin.position.set(-4.4,1,0);g.add(fin);
      g.add(new THREE.Mesh(new THREE.BoxGeometry(6,0.9,0.9),pilotM));
      g.scale.setScalar(2);hab.add(g);
      gliders.push({g,u:L*(0.1+0.8*R2()),a:R2()*Math.PI*2,h:R*(0.55+0.3*R2()),
        va:(R2()<0.5?-1:1)*(0.00006+R2()*0.00009),ph:R2()*6.28});
    }
    animHooks.push(now=>{for(const q of gliders){
      const a=q.a+now*q.va, h=q.h+Math.sin(now*0.0003+q.ph)*R*0.06;
      const u=q.u+Math.sin(now*0.00012+q.ph)*1400;
      orient(q.g,u,a,h,q.va>0?Math.PI/2:-Math.PI/2,0.4*Math.sign(q.va));
    }});
  }

  // ---- the boats on the river ----
  {
    const boatM=new THREE.MeshLambertMaterial({color:0xd9d2c0,flatShading:true});
    const sailM=new THREE.MeshLambertMaterial({color:0xf2eee4,side:THREE.DoubleSide,flatShading:true});
    const boats=[];
    for(let k=0;k<(K.boats||18);k++){
      const kk=Math.floor(R2()*VALLEYS);
      const g=new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(11,1.6,3.4),boatM));
      if(k%3){const cab=new THREE.Mesh(new THREE.BoxGeometry(4,1.8,2.6),boatM);cab.position.set(-1,1.7,0);g.add(cab);}
      else{const s=new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3,1,0),new THREE.Vector3(2,1,0),new THREE.Vector3(1.5,12,0)]),sailM);s.geometry.computeVertexNormals();g.add(s);}
      hab.add(g);boats.push({g,k:kk,s:R2(),dir:R2()<0.5?-1:1});
    }
    animHooks.push(()=>{for(const b of boats){
      b.s=(b.s+b.dir*0.00002+1)%1;
      const u=L*(0.06+0.88*b.s),a=riverAt(u,b.k);
      orient(b.g,u,a,relief(u,a)+1.5,b.dir>0?0:Math.PI,0);
    }});
  }

  // ---- the trains ----
  const trains=[];
  {const carM=new THREE.MeshLambertMaterial({color:0xc9ccd0,flatShading:true}),bandM=new THREE.MeshLambertMaterial({color:0x2f5f8a,flatShading:true});
  for(let k=0;k<VALLEYS;k++){
    const g=new THREE.Group();
    for(let c=0;c<6;c++){
      const car=new THREE.Mesh(new THREE.BoxGeometry(46,8,10),carM);car.position.x=c*48;g.add(car);
      const band=new THREE.Mesh(new THREE.BoxGeometry(46.2,1.2,10.2),bandM);band.position.set(c*48,-2.5,0);g.add(band);
      const win=new THREE.Mesh(new THREE.BoxGeometry(40,2.2,10.4),glow);win.position.set(c*48,1.2,0);g.add(win);
    }
    hab.add(g);trains.push({g,k,s:R2(),dir:R2()<0.5?-1:1});
  }}

  // ---- everything into the habitat ----
  for(const p of parts){p.castShadow=false;p.receiveShadow=false;hab.add(p);}

  // ---- the day, and the spin ----
  // The tube dims and brightens on a cycle rather than rising and setting, because it cannot set: it runs
  // the length of the sky. Nothing else in the menagerie has a sky that goes dark all at once - and now the
  // country goes dark with it, the towns light up, and the haze goes from blue to the colour of the lamps.
  const t0=performance.now(),SPIN=K.spin||114,DAY=K.day||240;
  const fogDay=new THREE.Color(0xa9bccb),fogNight=new THREE.Color(0x0c1018);
  const H={R,L,at,relief,riverAt,STRIP,VALLEYS,landMid,group:hab,spin:0,lit:1,day:0,
    fog:HAZE,orient,CAPD,shift:0,ambient};
  animHooks.push(now=>{
    const t=(now-t0)/1000;
    H.spin=(t/SPIN)*Math.PI*2;hab.rotation.x=H.spin;
    clouds.rotation.x=t*0.0009;                          // the air, not quite keeping up with the hull
    const day=(t/DAY+(K.dayStart||0.3)+H.shift+1)%1;H.day=day;
    const lit=Math.max(0.05,Math.sin(day*Math.PI*2)*0.5+0.5);H.lit=lit;
    sunM.color.setRGB(1*lit,0.94*lit,0.81*lit);
    haloM.opacity=0.04+0.16*lit;halo2M.opacity=0.015+0.05*lit;
    for(const p of axisLights)p.intensity=0.2*lit;
    ambient.intensity=0.06+0.16*lit;hemi.intensity=0.03+0.14*lit;
    if(scene.fog)scene.fog.color.copy(fogNight).lerp(fogDay,lit);
    cloudM.color.setRGB(0.07+0.9*lit,0.08+0.9*lit,0.1+0.88*lit);
    const n=Math.max(0,Math.min(1,(0.55-lit)/0.35));   // the towns light as the tube dims
    glow.color.setRGB(0.25+0.75*n,0.2+0.65*n,0.14+0.46*n);
    for(const tr of trains){
      tr.s=(tr.s+tr.dir*(now-(tr.last||now))/1000*0.0016+1)%1;tr.last=now;
      const u=L*(0.04+0.92*tr.s),a=riverAt(u,tr.k)+STRIP*0.30;
      orient(tr.g,u,a,relief(u,a)+28,tr.dir>0?0:Math.PI,0);
    }
  });

  ctx.hab=H;
  // the same fingerprint every other page keeps, so tools/probe.py can tell whether the place moved:
  // where every building in every town stands, in cylinder coordinates
  ctx.lotList=lots;
  ctx.details=Object.assign(ctx.details||{},{
    hull:(R*2/1000).toFixed(1)+' km across, '+(L/1000).toFixed(0)+' km long',
    valleys:VALLEYS,towns:VALLEYS*TOWNS,buildings:lots.length,
    spinGravity:((R*Math.pow(Math.PI*2/SPIN,2))/9.81).toFixed(2)+' g at the hull'});
}
