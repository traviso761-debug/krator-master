// ---------- the photograph on the Ponte degli Annibaldi ----------
// A couple at the railing of the footbridge, the Colosseum behind them, on a hazy summer evening: the photograph,
// put back into the model. The figures are stylised, not portraits, but posed and dressed as they stood:
//   him   1.85 m, dark hair swept up and back; a navy short-sleeved shirt in a small white print, its collar open and
//         its buttons down the placket, worn out; slim charcoal trousers; white trainers with a red flash at the heel.
//         His right hand in his pocket, his left arm round her, behind her back; turned a little toward her.
//   her   1.63 m, long straight dark-brown hair parted in the middle and falling in front of her shoulders, thin
//         metal glasses, a fine chain at her neck; a grey long-sleeved scoop-neck top tucked into high-waisted light
//         jeans (a rip at the left knee, her phone in the front pocket); a white ruched bag on her left shoulder; white
//         trainers. Leaning into him, her left knee bent, her left hand on her thigh, her right arm behind him.
// The railing behind them, the padlocks heaped at its foot, the grey paving; the view from where the phone was, in
// the photograph's 3:4 frame and its lens (#photo in the address, or the button among the viewpoints).
// C.photo: {t (where along the bridge, 0..1), hour, camBack (metres from them), eyeH, pitch (degrees), vfov}.
export function photo(api){
  const {THREE,C,scene,P,animHooks,camera}=api;const K=C.photo,L=(C.landmarks||[]).find(l=>l.model==='annibaldi');if(!K||!L)return;
  const [ax,az]=P(L.ends[0]),[bx,bz]=P(L.ends[1]),[ha,hb]=L.deck,len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len,W=L.width||4.2,sag=len*len/(8*(L.radius||123));
  const deckAt=t=>ha+(hb-ha)*t+sag*4*t*(1-t);
  // the railing on the Colosseum's side: the deck's normal that points at it
  const CO=(C.landmarks||[]).find(l=>l.model==='colosseum'),[cx,cz]=CO?P(CO.at):[ax,az+100],T=K.t??0.5,mx=ax+(bx-ax)*T,mz=az+(bz-az)*T;
  let nx=-uz,nz=ux;if(nx*(cx-mx)+nz*(cz-mz)<0){nx=-nx;nz=-nz;}
  const deckY=deckAt(T);
  // the photograph's line: from the couple to the Colosseum; the phone stands back along it, on the deck
  const px0=mx+nx*(W/2-0.62),pz0=mz+nz*(W/2-0.62);let dx=cx-px0,dz=cz-pz0;{const l=Math.hypot(dx,dz);dx/=l;dz/=l;}
  let seed=5;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};

  // ================================================================ cloth, hair and stone, painted
  const canvasTex=(w,h,draw,rep=[1,1])=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);
    t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);t.anisotropy=4;if('colorSpace' in t&&THREE.SRGBColorSpace)t.colorSpace=THREE.SRGBColorSpace;return t;};
  const noise=(g,w,h,a)=>{const d=g.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const n=(R()-0.5)*a;d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n;}g.putImageData(d,0,0);};
  // his shirt: navy, a ditsy print of tiny four-petalled flowers in white and pale blue
  const shirtT=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#1d2a55';g.fillRect(0,0,w,h);noise(g,w,h,10);
    for(let i=0;i<300;i++){const x=R()*w,y=R()*h,a=R()*6.3,c=R()<0.6?'#c4cee0':'#7e96c0';g.fillStyle=c;
      for(let k=0;k<4;k++){const b=a+k*Math.PI/2;g.beginPath();g.arc(x+Math.cos(b)*1.1,y+Math.sin(b)*1.1,0.75,0,7);g.fill();}g.fillStyle='#d8c070';g.fillRect(x-0.5,y-0.5,1,1);}},[3,2.5]);
  // light-wash denim: the twill, the fading, a darker seam now and then
  const denimT=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#a6c0d8';g.fillRect(0,0,w,h);
    for(let y=-w;y<h;y+=3){g.strokeStyle=R()<0.5?'rgba(70,100,140,0.18)':'rgba(255,255,255,0.14)';g.lineWidth=1;g.beginPath();g.moveTo(0,y);g.lineTo(w,y+w);g.stroke();}
    for(let i=0;i<40;i++){g.fillStyle=`rgba(255,255,255,${0.05+R()*0.08})`;g.beginPath();g.ellipse(R()*w,R()*h,4+R()*16,10+R()*30,0,0,7);g.fill();}noise(g,w,h,14);},[2,3]);
  const charcoalT=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#24262b';g.fillRect(0,0,w,h);noise(g,w,h,12);},[2,4]);
  const greyT=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#7c7f84';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=2){g.fillStyle='rgba(0,0,0,0.06)';g.fillRect(x,0,1,h);}noise(g,w,h,8);},[4,2]);
  // hair: fine strands, darker at the roots, a few lighter ones catching the light
  const hairTex=(base,light)=>canvasTex(128,256,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);
    for(let i=0;i<500;i++){const x=R()*w;g.strokeStyle=R()<0.25?light:'rgba(0,0,0,0.35)';g.lineWidth=0.6+R()*0.8;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+(R()-0.5)*6,h*0.3,x+(R()-0.5)*8,h*0.7,x+(R()-0.5)*10,h);g.stroke();}},[3,1]);
  const herHairT=hairTex('#3b2318','rgba(140,90,60,0.55)'),hisHairT=hairTex('#2a1c15','rgba(110,80,60,0.45)');
  // the rip at her knee: white cross threads over a little skin
  const ripT=canvasTex(64,64,(g,w,h)=>{g.fillStyle='#e8c2a6';g.fillRect(0,0,w,h);for(let y=2;y<h;y+=3+R()*2){g.strokeStyle=`rgba(250,250,246,${0.75+R()*0.25})`;g.lineWidth=1.2+R();g.beginPath();g.moveTo(0,y);g.lineTo(w,y+(R()-0.5)*4);g.stroke();}
    g.fillStyle='#a6c0d8';g.fillRect(0,0,w,5);g.fillRect(0,h-5,w,5);g.fillRect(0,0,5,h);g.fillRect(w-5,0,5,h);});
  // the paving: dark grey setts in running bond, the joints darker, the odd paler stone
  const paveT=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#3c3d40';g.fillRect(0,0,w,h);const rh=32,cw=96;
    for(let r=0;r<h/rh;r++)for(let c=-1;c<w/cw+1;c++){const x=c*cw+(r%2?cw/2:0),y=r*rh,v=100+R()*34;g.fillStyle=`rgb(${v},${v},${v+3})`;g.fillRect(x+2,y+2,cw-4,rh-4);
      g.fillStyle='rgba(255,255,255,0.05)';for(let k=0;k<12;k++)g.fillRect(x+4+R()*(cw-8),y+4+R()*(rh-8),2,2);}noise(g,w,h,10);});

  // ================================================================ the figure kit
  const MC=new Map();
  const mat=(c,o={})=>{const k=c+'|'+(o.map?o.map.uuid:'')+'|'+(o.r??'')+'|'+(o.m??'')+'|'+(o.op??'');if(!MC.has(k))MC.set(k,new THREE.MeshStandardMaterial({color:c,map:o.map||null,roughness:o.r??0.85,metalness:o.m??0,
    transparent:o.op!==undefined,opacity:o.op??1,side:o.side||THREE.FrontSide}));return MC.get(k);};
  const V=(x,y,z)=>new THREE.Vector3(x,y,z),UP=V(0,1,0);
  const add=(g,geo,m,pos,q)=>{const me=new THREE.Mesh(geo,m);if(pos)me.position.copy(pos);if(q)me.quaternion.copy(q);me.castShadow=true;me.receiveShadow=true;g.add(me);return me;};
  const ball=(g,p,r,m,s=[1,1,1],seg=16)=>add(g,new THREE.SphereGeometry(r,seg,Math.max(8,seg*0.75|0)).scale(...s),m,p);
  // a limb from a to b, its radius r0 at a and r1 at b, rounded at both ends
  const limb=(g,a,b,r0,r1,m,caps=true)=>{const d=b.clone().sub(a),l=d.length();const me=add(g,new THREE.CylinderGeometry(r1,r0,l,16,1,true),m,a.clone().addScaledVector(d,0.5),new THREE.Quaternion().setFromUnitVectors(UP,d.normalize()));
    if(caps){ball(g,a,r0,m);ball(g,b,r1,m);}return me;};
  // a body of revolution from a profile [[radius, y], ...], flattened front to back; its seam at the back
  const lathe=(g,prof,m,depth=0.62,sx=1)=>add(g,new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(r,y)),32,Math.PI,Math.PI*2).scale(sx,1,depth),m);
  const radAt=(prof,y)=>{for(let i=0;i+1<prof.length;i++){const [r0,y0]=prof[i],[r1,y1]=prof[i+1];if(y>=y0&&y<=y1)return r0+(r1-r0)*(y-y0)/Math.max(1e-6,y1-y0);}return 0;};
  // a trainer: the sole, the upper, the laces, the heel; at the ankle, pointing at angle `ang` (0 = toward the camera)
  function shoe(g,ank,ang,o){const s=new THREE.Group();s.position.set(ank.x,0,ank.z);s.rotation.y=ang;g.add(s);const L=o.len||0.28,Wd=o.w||0.1,sole=o.sole||0.035,white=mat('#f2f2ee',{r:0.55});
    add(s,new THREE.BoxGeometry(Wd,sole,L),mat('#e6e4de',{r:0.7}),V(0,sole/2,L*0.28));ball(s,V(0,sole/2,L*0.28+L/2-0.02),Wd/2,mat('#e6e4de',{r:0.7}),[1,sole/Wd,0.6]);
    add(s,new THREE.SphereGeometry(0.5,18,10,0,Math.PI*2,0,Math.PI/2).scale(Wd*0.98,o.h||0.085,L*0.98),white,V(0,sole,L*0.28));
    add(s,new THREE.CylinderGeometry(Wd*0.42,Wd*0.46,0.05,14),white,V(0,sole+0.05,-0.02));                                    // the heel collar
    for(let k=0;k<4;k++)add(s,new THREE.BoxGeometry(Wd*0.5,0.005,0.008),mat('#d8d8d4'),V(0,sole+0.062-k*0.006,L*0.18+k*0.022));   // the laces
    if(o.stripe)for(const sd of [-1,1])add(s,new THREE.BoxGeometry(0.004,0.035,0.06),mat(o.stripe,{r:0.6}),V(sd*Wd*0.49,sole+0.03,0.0),new THREE.Quaternion().setFromAxisAngle(V(1,0,0),-0.35));
    return s;}
  // a hand: the palm along `dir`, the back of it facing `out`, four fingers and a thumb; nails if asked
  function hand(g,wr,dir,out,skin,o={}){const h=new THREE.Group();h.position.copy(wr);const d=dir.clone().normalize(),n=out.clone().normalize(),sd=new THREE.Vector3().crossVectors(d,n).normalize();
    h.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(sd,n,d));g.add(h);const sk=mat(skin,{r:0.6});
    ball(h,V(0,0,0.04),0.04,sk,[1.05,0.42,1.1]);const len=[0.07,0.078,0.074,0.06];
    for(let k=0;k<4;k++){const x=-0.027+k*0.018,a=V(x,0,0.075),b=V(x*1.15,-0.008*(o.curl||0),0.075+len[k]);limb(h,a,b,0.009,0.0075,sk);if(o.nails)ball(h,V(b.x,0.004,b.z),0.0075,mat(o.nails,{r:0.35}),[1,0.5,1.3]);}
    limb(h,V(0.04*(o.thumb||1),0,0.03),V(0.055*(o.thumb||1),-0.012,0.08),0.011,0.009,sk);return h;}
  // ---- a head ----
  // One sphere, shaped: the jaw drawn in, the chin forward, the cheekbones, the eye sockets set back under a brow
  // ridge, the nose and its tip, the lips. Its face is painted onto it (the sphere's own UVs, so a feature at a point
  // of the face lands where that point went): the brows, the lids' line, the lips, a little colour in the cheeks, the
  // shadow under the nose, his jaw's shade. The eyes are eyeballs in the sockets (white, iris, pupil, the light in
  // them) under lids of skin. The hair is a second, larger shell of the same shape, painted with hair where it grows
  // and cut away (alpha) at the face and, for him, at the ears and the nape.
  // Everything is in the head's unit frame first: x across (+ to the figure's left), y up, z forward; then scaled.
  const deform=(x,y,z)=>{if(y<0){const k=1-0.26*Math.pow(-y,1.6);x*=k;if(z>0)z*=1-0.1*y*y;}x*=1+0.05*Math.exp(-(((y+0.05)/0.25)**2));
    if(z>0){const ax=Math.abs(x),f=Math.min(1,z*1.7);
      const nose=0.24*Math.exp(-((x/0.1)**2))*Math.exp(-(((y+0.2)/0.19)**2))+0.1*Math.exp(-((x/0.12)**2)-(((y+0.37)/0.07)**2));
      const sock=0.075*Math.exp(-(((ax-0.38)/0.15)**2)-(((y-0.06)/0.11)**2)),brow=0.04*Math.exp(-(((y-0.24)/0.07)**2))*(ax<0.75?1:0);
      const lips=0.055*Math.exp(-((x/0.27)**2)-(((y+0.54)/0.085)**2)),chin=0.08*Math.exp(-((x/0.3)**2)-(((y+0.83)/0.12)**2));
      z+=(nose-sock+brow+lips+chin)*f;z*=0.93;}
    return [x,y,z];};
  const shaped=(sx,sy,sz,extra)=>{const g=new THREE.SphereGeometry(1,72,52),p=g.attributes.position;for(let i=0;i<p.count;i++){let [x,y,z]=deform(p.getX(i),p.getY(i),p.getZ(i));if(extra)[x,y,z]=extra(x,y,z);p.setXYZ(i,x*sx,y*sy,z*sz);}g.computeVertexNormals();return g;};
  // the canvas point of a face point (fx, fy on the unit sphere's front)
  const FW=1024,FH=512,toUV=(fx,fy)=>{const th=Math.acos(Math.max(-1,Math.min(1,fy))),st=Math.max(1e-3,Math.sin(th)),ph=Math.acos(Math.max(-1,Math.min(1,-fx/st)));return [ph/(2*Math.PI)*FW,th/Math.PI*FH];};
  const stroke=(k,pts,w,col)=>{k.strokeStyle=col;k.lineWidth=w;k.lineCap='round';k.lineJoin='round';k.beginPath();pts.forEach(([x,y],i)=>{const [u,v]=toUV(x,y);i?k.lineTo(u,v):k.moveTo(u,v);});k.stroke();};
  const fill=(k,pts,col)=>{k.fillStyle=col;k.beginPath();pts.forEach(([x,y],i)=>{const [u,v]=toUV(x,y);i?k.lineTo(u,v):k.moveTo(u,v);});k.closePath();k.fill();};
  const blob=(k,fx,fy,r,col)=>{const [u,v]=toUV(fx,fy),rr=r*FW/(2*Math.PI),g=k.createRadialGradient(u,v,0,u,v,rr);g.addColorStop(0,col);g.addColorStop(1,col.replace(/[\d.]+\)$/,'0)'));k.fillStyle=g;k.fillRect(u-rr,v-rr,2*rr,2*rr);};
  const curve=(a,b,c,n=14)=>{const out=[];for(let i=0;i<=n;i++){const t=i/n,m=1-t;out.push([m*m*a[0]+2*m*t*b[0]+t*t*c[0],m*m*a[1]+2*m*t*b[1]+t*t*c[1]]);}return out;};
  function faceTex(o){const c=document.createElement('canvas');c.width=FW;c.height=FH;const k=c.getContext('2d');k.fillStyle=o.skin;k.fillRect(0,0,FW,FH);
    for(let i=0;i<5000;i++){k.fillStyle=`rgba(${R()<0.5?255:120},${R()<0.5?200:90},${R()<0.5?180:80},${R()*0.04})`;k.fillRect(R()*FW,R()*FH,2,2);}
    for(const sd of [-1,1]){blob(k,sd*0.47,-0.22,0.24,o.blush);blob(k,sd*0.38,0.05,0.13,'rgba(120,70,60,0.13)');}               // the cheeks' colour; the sockets' shade
    blob(k,0,-0.43,0.07,'rgba(110,60,50,0.28)');for(const sd of [-1,1])blob(k,sd*0.065,-0.39,0.022,'rgba(70,35,30,0.45)');      // under the nose, the nostrils
    if(o.stubble){const g0=k.globalAlpha;k.globalAlpha=1;for(let y=-0.95;y<-0.42;y+=0.025)for(let x=-0.6;x<=0.6;x+=0.025){if(Math.abs(y+0.54)<0.06&&Math.abs(x)<0.28)continue;const [u,v]=toUV(x,y);k.fillStyle=`rgba(70,60,70,${0.05+R()*0.05})`;k.fillRect(u,v,3,3);}k.globalAlpha=g0;}
    for(const sd of [-1,1]){const S=x=>sd*x;
      stroke(k,curve([S(0.13),0.255],[S(0.36),0.335+o.arch],[S(0.66),0.25]),o.browW,o.brow);                                    // the brow
      stroke(k,curve([S(0.24),0.11],[S(0.38),0.165],[S(0.54),0.105]),o.liner,o.lash);                                         // the upper lid's line
      stroke(k,curve([S(0.27),0.01],[S(0.38),-0.015],[S(0.5),0.015]),1.6,'rgba(120,70,60,0.35)');}                           // the lower lid
    // the lips: the upper with its bow, the lower fuller, the line between turned up at the corners
    const lw=o.lipW,ly=-0.54;fill(k,[[-lw,ly],[-lw*0.5,ly+0.045],[-0.05,ly+0.06],[0,ly+0.045],[0.05,ly+0.06],[lw*0.5,ly+0.045],[lw,ly],[0,ly-0.005]],o.lips);
    fill(k,[[-lw,ly],[0,ly-0.005],[lw,ly],[lw*0.55,ly-0.055],[0,ly-0.075],[-lw*0.55,ly-0.055]],o.lips);
    stroke(k,[[-lw-0.01,ly+0.012*o.smile],...curve([-lw*0.7,ly],[0,ly-0.012],[lw*0.7,ly]),[lw+0.01,ly+0.012*o.smile]],2,'rgba(90,40,40,0.75)');
    blob(k,0,ly-0.03,0.05,'rgba(255,255,255,0.12)');
    const t=new THREE.CanvasTexture(c);t.anisotropy=8;if('colorSpace' in t&&THREE.SRGBColorSpace)t.colorSpace=THREE.SRGBColorSpace;return t;}
  // the hair's paint: strands where it grows; transparent where it does not (o.grows(x, y, z) on the unit sphere)
  function hairTexFor(o){const c=document.createElement('canvas');c.width=FW;c.height=FH;const k=c.getContext('2d'),img=k.createImageData(FW,FH),b=new THREE.Color(o.colour);
    for(let py=0;py<FH;py++){const th=py/FH*Math.PI,sy=Math.cos(th),st=Math.sin(th);for(let px=0;px<FW;px++){const ph=px/FW*2*Math.PI,x=-Math.cos(ph)*st,z=Math.sin(ph)*st,i=(py*FW+px)*4;
      const on=o.grows(x,sy,z),n=(Math.sin(px*0.9+Math.sin(py*0.05)*6)*0.5+0.5)*0.22+R()*0.12+(o.part&&Math.abs(x)<0.02&&z>-0.3&&sy>0.4?-0.5:0);
      img.data[i]=Math.max(0,Math.min(255,b.r*255*(0.75+n)));img.data[i+1]=Math.max(0,Math.min(255,b.g*255*(0.75+n)));img.data[i+2]=Math.max(0,Math.min(255,b.b*255*(0.75+n)));img.data[i+3]=on?255:0;}}
    k.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);if('colorSpace' in t&&THREE.SRGBColorSpace)t.colorSpace=THREE.SRGBColorSpace;return t;}
  function head(g,c,o){const h=new THREE.Group();h.position.copy(c);g.add(h);const hw=o.w||0.075,hh=o.h||0.115,hd=0.098,sk=mat(o.skin,{r:0.6});
    const skin=add(h,shaped(hw,hh,hd),new THREE.MeshStandardMaterial({map:faceTex(o),roughness:0.6}));
    const surf=(fx,fy)=>{const z0=Math.sqrt(Math.max(0,1-fx*fx-fy*fy)),[x,y,z]=deform(fx,fy,z0);return V(x*hw,y*hh,z*hd);};
    // the eyes: a white ball in each socket, the iris and pupil on its front, the light in it, the lid over it
    for(const sd of [-1,1]){const e=surf(sd*0.38,0.06),r=0.0118,cz=e.z-r*0.62;
      ball(h,V(e.x,e.y,cz),r,mat('#f2eee8',{r:0.25}),[1,1,1],16);
      const iris=add(h,new THREE.CircleGeometry(r*0.5,20),mat(o.eyes,{r:0.3}),V(e.x,e.y-0.0006,cz+r+0.0003));add(h,new THREE.CircleGeometry(r*0.22,14),mat('#0c0a0a',{r:0.2}),V(e.x,e.y-0.0006,cz+r+0.0006));
      add(h,new THREE.CircleGeometry(r*0.09,8),new THREE.MeshBasicMaterial({color:0xffffff}),V(e.x-r*0.18,e.y+r*0.18,cz+r+0.0009));
      const lid=add(h,new THREE.SphereGeometry(r*1.08,20,10,0,Math.PI*2,0,Math.PI*0.36),sk,V(e.x,e.y,cz));lid.rotation.x=0.55;          // the upper lid, over the iris's top
      const low=add(h,new THREE.SphereGeometry(r*1.05,20,8,0,Math.PI*2,Math.PI*0.74,Math.PI*0.26),sk,V(e.x,e.y,cz));low.rotation.x=-0.3;
      if(o.ears){const ear=ball(h,V(sd*hw*0.97,-0.004,-0.008),0.012,sk,[0.55,2.3,1.35],12);ear.rotation.z=sd*0.12;}}
    h.userData.surf=surf;h.userData.dims=[hw,hh,hd];return h;}
  // the hair over a head: the same shape a little larger, its paint deciding where it grows; o.lift(x, y, z) shapes it
  function hairShell(h,o){const [hw,hh,hd]=h.userData.dims,m=new THREE.MeshStandardMaterial({map:hairTexFor(o),roughness:0.7,alphaTest:0.5,side:THREE.DoubleSide});
    return add(h,shaped(hw*o.s[0],hh*o.s[1],hd*o.s[2],o.lift),m,V(0,o.dy||0,o.dz||0));}

  // ================================================================ him
  // his frame: feet at the origin, facing +z (the camera); his right is -x
  function him(){const g=new THREE.Group(),SK='#d9a98a',shirt=mat('#ffffff',{map:shirtT,r:0.8}),trou=mat('#ffffff',{map:charcoalT,r:0.85}),skin=mat(SK,{r:0.62});
    // the legs, in slim trousers, a little apart; his left foot turned out
    const hipR=V(-0.098,0.95,0),hipL=V(0.098,0.95,0),kneeR=V(-0.12,0.53,0.025),kneeL=V(0.125,0.53,-0.005),ankR=V(-0.15,0.105,0.02),ankL=V(0.16,0.105,-0.03);
    limb(g,hipR,kneeR,0.082,0.06,trou);limb(g,kneeR,ankR,0.06,0.05,trou);limb(g,hipL,kneeL,0.082,0.06,trou);limb(g,kneeL,ankL,0.06,0.05,trou);
    const seat=[[0,0.8],[0.15,0.82],[0.172,0.9],[0.17,0.97],[0,0.98]];lathe(g,seat,trou,0.66);
    shoe(g,ankR,-0.08,{stripe:'#c8282a',len:0.29});shoe(g,ankL,0.75,{stripe:'#c8282a',len:0.29});
    // the shirt, worn out over the trousers: the body, the placket and its buttons, the open collar
    const prof=[[0,0.84],[0.176,0.85],[0.181,0.93],[0.172,1.04],[0.18,1.17],[0.2,1.3],[0.214,1.41],[0.205,1.47],[0.16,1.515],[0.075,1.545],[0,1.55]];
    lathe(g,prof,shirt,0.6);const fz=y=>radAt(prof,y)*0.6;
    for(let y=0.87;y<1.47;y+=0.06)add(g,new THREE.BoxGeometry(0.026,0.062,0.004),mat('#202e5e',{r:0.8}),V(0.004,y+0.03,fz(y+0.03)+0.002));
    for(let k=0;k<6;k++){const y=0.92+k*0.095;add(g,new THREE.CylinderGeometry(0.0055,0.0055,0.003,10).rotateX(Math.PI/2),mat('#f0f0ec',{r:0.4}),V(0.004,y,fz(y)+0.005));}
    {const v=add(g,new THREE.CircleGeometry(0.03,3).scale(1,1.6,1),skin,V(0,1.505,fz(1.5)+0.003));v.rotation.set(-0.3,0,Math.PI/2*3);}   // the open neck, a V
    for(const sd of [-1,1]){const cp=add(g,new THREE.BoxGeometry(0.06,0.008,0.075),mat('#ffffff',{map:shirtT,r:0.8}),V(sd*0.045,1.53,0.065));cp.rotation.set(-0.5,sd*0.55,sd*0.35);}   // the collar's points
    add(g,new THREE.CylinderGeometry(0.068,0.075,0.05,18,1,true),mat('#ffffff',{map:shirtT,r:0.8,side:THREE.DoubleSide}),V(0,1.555,-0.008));                // and its band
    // the arms: short sleeves; the right hand in his pocket, the left behind her back
    const shR=V(-0.205,1.44,-0.005),shL=V(0.205,1.44,-0.005),elR=V(-0.27,1.16,-0.03),wrR=V(-0.165,0.94,0.085),elL=V(0.285,1.19,-0.07),wrL=V(0.47,1.04,-0.17);
    for(const [sh,el] of [[shR,elR],[shL,elL]]){const mid=sh.clone().lerp(el,0.46);limb(g,sh,mid,0.058,0.054,shirt);limb(g,sh,el,0.046,0.04,skin,false);ball(g,el,0.04,skin);}
    limb(g,elR,wrR,0.04,0.031,skin);limb(g,elL,wrL,0.04,0.031,skin);
    ball(g,wrR.clone().add(V(-0.008,0.012,0.004)),0.026,skin,[1.1,0.7,0.8]);                                                       // his knuckles, at the pocket's mouth
    add(g,new THREE.BoxGeometry(0.004,0.075,0.03),mat('#141518'),V(-0.152,0.915,0.1)).rotation.z=-0.35;                            // the pocket
    // the neck and the head, his hair swept up and back
    limb(g,V(0,1.5,-0.01),V(0,1.64,-0.004),0.064,0.06,skin);
    const hd=head(g,V(0,1.728,0.008),{h:0.108,skin:SK,lips:'#b06a62',brow:'#20150f',browW:9,arch:0.02,lash:'rgba(40,25,20,0.7)',liner:2.2,eyes:'#4a3626',blush:'rgba(200,110,100,0.10)',lipW:0.27,smile:1,stubble:true,ears:true});
    // short at the sides and the back, full on top and swept up and back off the forehead
    hairShell(hd,{colour:'#2a1c15',s:[1.08,1.05,1.07],dy:0.004,
      grows:(x,y,z)=>{if(y<-0.42)return false;if(Math.abs(x)>0.8&&y<0.28&&z>-0.35)return false;if(z>0&&y<0.42-0.08*x*x+0.12*Math.max(0,x)&&Math.abs(x)<0.86)return false;return true;},
      lift:(x,y,z)=>{const up=Math.max(0,y-0.3)*(z>-0.5?1:0.35),fr=Math.max(0,z+0.2);return [x*(1+up*0.28),y+up*0.5+fr*up*0.45,z+up*fr*0.4];}});   // the volume on top, highest over the forehead
    g.rotation.y=0.14;return g;}

  // ================================================================ her
  function her(){const g=new THREE.Group(),SK='#ecc6ab',jean=mat('#ffffff',{map:denimT,r:0.9}),top=mat('#ffffff',{map:greyT,r:0.85}),skin=mat(SK,{r:0.6});
    // the legs in straight jeans: her right straight, her left bent at the knee and crossed a little in front
    const hipR=V(-0.088,0.86,0),hipL=V(0.088,0.86,0),kneeR=V(-0.085,0.47,0.01),kneeL=V(0.03,0.485,0.115),ankR=V(-0.08,0.085,0.0),ankL=V(0.125,0.085,0.12);
    limb(g,hipR,kneeR,0.088,0.058,jean);limb(g,kneeR,ankR,0.057,0.049,jean);limb(g,hipL,kneeL,0.088,0.058,jean);limb(g,kneeL,ankL,0.057,0.049,jean);
    for(const a of [ankR,ankL])add(g,new THREE.TorusGeometry(0.05,0.008,6,16).rotateX(Math.PI/2),jean,V(a.x,a.y+0.035,a.z));      // the hems, a little turned up
    {const k=kneeL.clone().lerp(hipL,0.12),d=hipL.clone().sub(kneeL).normalize(),out=V(0.25,0.15,1).normalize();
      const rip=add(g,new THREE.PlaneGeometry(0.06,0.05),mat('#ffffff',{map:ripT,r:0.9}),k.clone().addScaledVector(out,0.059));rip.lookAt(k.clone().addScaledVector(out,1));}   // the rip at her left knee
    const hips=[[0,0.76],[0.15,0.775],[0.172,0.84],[0.158,0.93],[0.128,0.985],[0.0,0.995]];lathe(g,hips,jean,0.68);
    add(g,new THREE.CylinderGeometry(0.129,0.137,0.032,24,1,true).scale(1,1,0.68),mat('#98b4cc',{r:0.9}),V(0,0.972,0));             // the waistband
    add(g,new THREE.CylinderGeometry(0.008,0.008,0.004,10).rotateX(Math.PI/2),mat('#b8a070',{m:0.6,r:0.4}),V(0,0.972,0.091));     // its button
    {const ph=add(g,new THREE.BoxGeometry(0.068,0.12,0.012),mat('#1c1c1e',{r:0.35}),V(0.07,0.915,0.103));ph.rotation.set(-0.12,0.18,0.22);   // her phone, in the front pocket
      add(g,new THREE.BoxGeometry(0.03,0.03,0.004),mat('#2c2c30',{r:0.3}),V(0.058,0.955,0.11)).rotation.z=0.22;}
    for(const sd of [-1,1])add(g,new THREE.BoxGeometry(0.004,0.07,0.02),mat('#7e9ab4'),V(sd*0.1,0.905,0.098)).rotation.z=sd*0.5;   // the pockets' openings
    shoe(g,ankR,-0.15,{len:0.26,w:0.095,sole:0.045,h:0.09});shoe(g,ankL,0.5,{len:0.26,w:0.095,sole:0.045,h:0.09});
    // the grey top, tucked in; its scoop neck
    const prof=[[0,0.9],[0.132,0.905],[0.12,0.96],[0.116,1.02],[0.132,1.11],[0.156,1.18],[0.152,1.24],[0.165,1.3],[0.152,1.335],[0.1,1.356],[0.058,1.37],[0,1.372]];
    lathe(g,prof,top,0.63);const fz=y=>radAt(prof,y)*0.63;
    {const sc=add(g,new THREE.CircleGeometry(0.062,24,0,Math.PI).scale(1,0.55,1),skin,V(0,1.355,fz(1.33)+0.004));sc.rotation.set(Math.PI-0.35,0,Math.PI);}   // the scoop neck, a shallow curve of skin
    add(g,new THREE.TorusGeometry(0.058,0.0015,5,32).scale(1,1,0.8).rotateX(Math.PI/2+0.5),mat('#c8a860',{m:0.8,r:0.3}),V(0,1.33,0.03));   // a fine chain
    // the arms in long sleeves: her left down to her thigh, her right round behind him
    const shR=V(-0.162,1.31,-0.005),shL=V(0.165,1.31,-0.01),elL=V(0.27,1.04,-0.05),wrL=V(0.155,0.835,0.088),elR=V(-0.215,1.07,-0.1),wrR=V(-0.36,0.98,-0.17);
    limb(g,shL,elL,0.044,0.037,top);limb(g,elL,wrL,0.037,0.029,top);limb(g,shR,elR,0.044,0.037,top);limb(g,elR,wrR,0.037,0.029,top);
    hand(g,wrL,V(-0.2,-1,0.12),V(0.65,0.05,0.75),SK,{nails:'#f6f4f0',curl:1,thumb:-1});
    // the bag: a white ruched crescent on its scrunched strap, at her left side under the arm
    {const bag=mat('#f2f0ea',{r:0.45}),top0=V(0.14,1.355,0.035),bot=V(0.175,1.13,0.11);
      const pts=[];for(let k=0;k<=12;k++){const t=k/12;pts.push(top0.clone().lerp(bot,t).add(V(Math.sin(t*Math.PI)*0.02,0,Math.sin(t*Math.PI)*0.04)));}
      add(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,0.016,8),bag);for(let k=1;k<12;k++)ball(g,pts[k],0.02,bag,[1.1,0.55,1.1],10);   // the strap, scrunched
      const b=ball(g,V(0.19,1.08,0.105),0.1,bag,[0.95,0.6,0.46],24);b.rotation.z=-0.25;                                         // the crescent, under her arm
      for(let k=0;k<3;k++)ball(g,V(0.155+0.03*k,1.11-0.012*k,0.142),0.03,bag,[0.4,1.2,0.4],10).rotation.z=-0.25;}               // its gathers
    // the neck, the head (tilted toward him), the hair, the glasses
    limb(g,V(0,1.34,-0.012),V(0,1.44,-0.006),0.054,0.051,skin);
    const hd=head(g,V(0,1.522,0.006),{skin:SK,lips:'#c4767a',brow:'#3a2418',browW:6.5,arch:0.035,lash:'rgba(30,18,14,0.95)',liner:3.6,eyes:'#5a3e2c',blush:'rgba(230,120,120,0.16)',lipW:0.25,smile:0.6,w:0.072,h:0.1});hd.rotation.z=0.09;hd.rotation.y=-0.06;
    const hairM=mat('#ffffff',{map:herHairT,r:0.7,side:THREE.DoubleSide});
    // parted in the middle, close over the crown, down past the ears; the curtain below carries it to her shoulders
    hairShell(hd,{colour:'#3b2318',s:[1.06,1.04,1.05],dy:0.002,part:true,grows:(x,y,z)=>{if(z>0&&((x/0.66)**2+((y+0.12)/0.74)**2)<1)return false;if(y<-0.55&&z>-0.2)return false;return true;}});
    // the long hair: a curtain open at the face, falling past her shoulders in front and down her back
    {const cur=add(hd,new THREE.CylinderGeometry(0.084,0.165,0.44,28,3,true,0.62,Math.PI*2-1.24).scale(1,1,0.72),hairM,V(0,-0.2,-0.01));
      const pos=cur.geometry.attributes.position;for(let i=0;i<pos.count;i++){const y=pos.getY(i);if(y<-0.1){const ang=Math.atan2(pos.getX(i),pos.getZ(i));if(Math.abs(ang)<1.1)pos.setZ(i,pos.getZ(i)+0.03);}}pos.needsUpdate=true;cur.geometry.computeVertexNormals();}
    for(const sd of [-1,1])ball(hd,V(sd*0.07,-0.02,0.04),0.03,hairM,[0.45,2.2,0.8]);                                               // framing her face
    // her glasses: thin metal rims, a little oversized and softly squared, on the bridge of her nose, the arms back to her ears
    {const gl=mat('#5a5a60',{m:0.8,r:0.3}),lens=mat('#e8eef2',{op:0.14,r:0.05}),S=hd.userData.surf,nb=S(0,0.02),gz=Math.max(S(0.38,0.06).z+0.012,nb.z-0.004);
      for(const sd of [-1,1]){const cx=sd*0.031,cy=0.0045;add(hd,new THREE.TorusGeometry(0.0205,0.0014,6,28).scale(1.2,0.95,1),gl,V(cx,cy,gz));add(hd,new THREE.CircleGeometry(0.0205,22).scale(1.2,0.95,1),lens,V(cx,cy,gz-0.0005));
        limb(hd,V(sd*0.0555,cy+0.006,gz-0.002),V(sd*0.072,cy+0.008,-0.025),0.0011,0.0011,gl,false);}
      limb(hd,V(-0.0068,0.008,gz+0.002),V(0.0068,0.008,gz+0.002),0.0012,0.0012,gl,false);}
    g.rotation.z=0.045;g.rotation.y=-0.2;return g;}

  // ---- the two of them, at the railing: their frame's +z toward the phone, its +x to the right in the picture ----
  const couple=new THREE.Group();couple.position.set(px0,deckY,pz0);couple.rotation.y=Math.atan2(-dx,-dz);
  const H=him(),E=her();H.position.set(-0.27,0,-0.02);E.position.set(0.245,0,0.07);couple.add(H,E);
  couple.traverse(o=>{o.userData.info={name:'The photograph',info:'On the Ponte degli Annibaldi, the Colosseum behind them, on a summer evening.'};o.userData.noFingerprint=true;});scene.add(couple);

  // ---- the paving on the deck, the padlocks heaped at the railing's foot, the stickers on the rail ----
  {const N=24,ry=-Math.atan2(uz,ux);for(let k=0;k<N;k++){const t0=k/N,t1=(k+1)/N,tm=(t0+t1)/2,seg=len/N+0.02,pitch=Math.atan2(deckAt(t1)-deckAt(t0),len/N);
      const t=paveT.clone();t.needsUpdate=true;t.repeat.set(seg/1.6,(W-0.34)/1.6);t.offset.set(k*seg/1.6,0);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(seg,W-0.34).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:t,roughness:0.9}));
      m.position.set(ax+(bx-ax)*tm,deckAt(tm)-0.055,az+(bz-az)*tm);m.rotation.set(0,ry,pitch,'YXZ');m.receiveShadow=true;m.userData.noFingerprint=true;scene.add(m);}}
  const LC=['#c8a040','#d4b050','#b89038','#b8bcc0','#a4a8ac','#8a8e92','#c8282a','#e85a8a','#3a7ac8','#1e1e20','#e8c040'].map(c=>new THREE.Color(c));
  const NL=900,lm=new THREE.InstancedMesh(new THREE.BoxGeometry(0.042,0.05,0.016),new THREE.MeshStandardMaterial({color:0xffffff,metalness:0.55,roughness:0.4}),NL),o=new THREE.Object3D();
  const sh=new THREE.InstancedMesh(new THREE.TorusGeometry(0.013,0.0035,5,10,Math.PI),new THREE.MeshStandardMaterial({color:0xb8bcc0,metalness:0.7,roughness:0.3}),NL);
  lm.castShadow=true;
  for(let i=0;i<NL;i++){const side=R()<0.72?1:-1,near=R()<0.55,t=Math.min(0.98,Math.max(0.02,T+(R()-0.5)*(near?0.4:1.0))),low=R()<0.68;
    const off=W/2-0.06-(low?R()*0.08:0),px=ax+(bx-ax)*t+nx*side*off,pz=az+(bz-az)*t+nz*side*off,y=deckAt(t)-0.03+(low?0.03+R()*0.12:0.15+R()*0.85);
    o.position.set(px,y,pz);o.rotation.set((R()-0.5)*0.9,-Math.atan2(uz,ux)+(R()-0.5)*1.2,(R()-0.5)*0.7);o.scale.setScalar(0.8+R()*0.6);o.updateMatrix();lm.setMatrixAt(i,o.matrix);
    o.position.y+=0.03*o.scale.y;o.updateMatrix();sh.setMatrixAt(i,o.matrix);
    const r=R();lm.setColorAt(i,LC[r<0.45?Math.floor(R()*3):r<0.75?3+Math.floor(R()*3):6+Math.floor(R()*5)]);}
  lm.userData.noFingerprint=sh.userData.noFingerprint=true;scene.add(lm,sh);
  {const SC=['#f4f4f0','#1e1e20','#c8282a','#f0d040','#3a7ac8','#e8e0d0','#58a050'].map(c=>new THREE.Color(c)),NS=90,st=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0315,0.0315,1,10,1,true),new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.6}),NS);
    for(let i=0;i<NS;i++){const side=R()<0.8?1:-1,t=0.03+R()*0.94,px=ax+(bx-ax)*t+nx*side*(W/2-0.06),pz=az+(bz-az)*t+nz*side*(W/2-0.06);
      o.position.set(px,deckAt(t)+1.06,pz);o.rotation.set(0,-Math.atan2(uz,ux),Math.PI/2,'YXZ');o.scale.set(1,0.04+R()*0.1,1);o.updateMatrix();st.setMatrixAt(i,o.matrix);st.setColorAt(i,SC[Math.floor(R()*SC.length)]);}
    st.userData.noFingerprint=true;scene.add(st);}

  // ---- the view from the phone: back from them along the photograph's line, at a phone's height, level but a touch down ----
  const back=K.camBack||2.25;let ex=px0-dx*back,ez=pz0-dz*back;
  {const off=(ex-mx)*nx+(ez-mz)*nz,lim=W/2-0.35;if(off<-lim){ex+=nx*(-lim-off);ez+=nz*(-lim-off);}}   // kept on the deck
  const ey=deckY+(K.eyeH||1.42),pit=(K.pitch??-2)*Math.PI/180,view=[ex,ey,ez,ex+dx*12,ey+12*Math.tan(pit),ez+dz*12];
  api.PHOTO_VIEW=view;
  // the photograph's frame: 3:4, upright, its lens (C.photo.vfov, the long side), the rest of the screen dimmed. It
  // goes when the camera leaves the spot.
  const frame=document.createElement('div');Object.assign(frame.style,{position:'fixed',inset:'0',pointerEvents:'none',display:'none',zIndex:'1'});
  const win=document.createElement('div');Object.assign(win.style,{position:'absolute',top:'2vh',height:'96vh',left:'50%',transform:'translateX(-50%)',aspectRatio:'3 / 4',
    boxShadow:'0 0 0 200vmax rgba(12,12,14,0.74)',outline:'1px solid rgba(255,255,255,0.4)'});frame.appendChild(win);document.body.appendChild(frame);
  const EYE=new THREE.Vector3(ex,ey,ez);let framed=false,pending=false,fov0=camera.fov;
  const setFrame=on=>{if(on===framed)return;framed=on;frame.style.display=on?'block':'none';
    if(on){fov0=camera.fov;camera.fov=2*Math.atan(Math.tan((K.vfov||74)*Math.PI/360)/0.96)*180/Math.PI;}else camera.fov=fov0;camera.updateProjectionMatrix();};
  const go=(animate=true)=>{if(api.setHour)api.setHour(K.hour||17.6);api.setView(...view,animate);pending=true;};
  {let added=false,opened=!/(^|&)photo($|&)/.test(api.HASH0||'');animHooks.push(()=>{if(!api.setView)return;
    if(!added&&api.mkBtn&&api.viewsEl){added=true;api.mkBtn('The photograph',api.viewsEl,()=>go(true));}
    if(!opened){opened=true;go(false);}
    const d=camera.position.distanceTo(EYE);if(pending&&d<0.15){pending=false;setFrame(true);}else if(framed&&d>0.4)setFrame(false);});}
  api.ctx.details=Object.assign(api.ctx.details||{},{photo:[Math.round(px0),Math.round(deckY*10)/10,Math.round(pz0)],photoView:view.map(v=>Math.round(v*100)/100),photoAt:[px0,deckY,pz0].map(v=>Math.round(v*100)/100),photoAxis:[ux,uz,nx,nz,dx,dz].map(v=>Math.round(v*1000)/1000)});
}
