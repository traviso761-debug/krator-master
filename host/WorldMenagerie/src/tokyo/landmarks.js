// Tokyo: the buildings that are shapes rather than heights, modelled from their published dimensions on the shared
// landmark kit (src/core/landkit.js), each placed from its entry in tokyo.json.
//
//   tokyotower   Tokyo Tower (1958): 332.9 m of steel lattice in international orange and white, four legs on an 80 m
//                square rising to the two-storey main deck at 150 m and the top deck at 250 m, the antenna above
//   scramble     Shibuya Crossing: the zebra of the scramble across every arm of the junction and the two diagonals,
//                Hachikō on his plinth, and the video screens on the buildings round it, playing
//   station      Tokyo Station's Marunouchi building (Tatsuno Kingo, 1914; restored 2012): 335 m of red brick and white
//                stone, three storeys, its two octagonal domes at the north and south ends
//   diet         the National Diet Building (1936): two granite wings and the stepped central tower, 65 m
//   nijubashi    the Imperial Palace's front: the stone Seimon Ishibashi on its two arches over the moat, lamps on it
//   yagura       a turret on the palace wall (the Fushimi-yagura): white plaster on a stone base, two tiled roofs
//   wako         the Wakō building at Ginza 4-chōme: its curved corner and the clock tower over it
//   kabukicho    the red gate of Kabukichō Ichiban-gai, its sign lit
//   godzilla     Godzilla, looking over the Hotel Gracery Shinjuku from its terrace
//   sanmon       Zōjō-ji's Sanmon (1622): two storeys of vermilion gate under its great roofs
//   torii        a shrine gate of plain cypress (Meiji Jingū's): two pillars, the nuki, the kasagi with its upturned ends
//
// Map data (c) OpenStreetMap contributors, ODbL. The geometry here is this project's own.
import {mkRng} from '../core/rng.js';
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,animHooks,gh,nightF,hour}=api;
  const {Model,mat,turn}=landkit(api,{orange:0xe8552a,towerWhite:0xeeece6,glassDark:0x2a3440,brickRed:0x8a3a2a,stoneWhite:0xe6e0d2,slate:0x40464e,
    copper:0x6f9a88,granite2:0xcfc7bb,plaster:0xf0ede6,tileDark:0x3c4048,vermilion:0xc8401e,cypress:0xb48c64,dogBronze:0x6a5a44,zilla:0x3a3e3a,zillaDark:0x262a28,
    zebra:0xf2f2ee,screenFrame:0x1a1c20,signRed:0xc81e28,asphaltT:0x3a3b3f,skyWhite:0xdfe6ec,chochin:0xc8201e,
    bridgeWhite:0xeef0ee,steelGrey:0xb8bcc0,gWhite:0xf2f2ee,gFrame:0xb81e24,gBlue:0x2a3a6a,gGold:0xd8a830,gFace:0x2a3a30});
  const V3=THREE.Vector3,Q=new THREE.Quaternion(),E=new THREE.Euler(),UP=new V3(0,0,1);
  // a straight member between two points, t thick (a lattice bar, a brace)
  function beam(M,k,a,b,t){const d=new V3().subVectors(b,a),len=d.length();if(len<0.01)return;Q.setFromUnitVectors(UP,d.normalize());E.setFromQuaternion(Q,'YXZ');
    M.put(k,new THREE.BoxGeometry(t,t,len),(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,E.y,E.x,E.z);}
  // an animated video screen (its own mesh, with UVs, outside the merged model): adverts in colour, cycling
  const SCREENS=[];function screenTex(seed){const cv=document.createElement('canvas');cv.width=256;cv.height=192;const t=new THREE.CanvasTexture(cv);SCREENS.push({cv,t,seed,k:0});return t;}
  const ADS=[['#ff2a6a','#ffd23a','渋谷'],['#2a7aff','#ffffff','TOKYO'],['#18c070','#0a2a18','新作'],['#ffffff','#e8202a','SALE'],['#7a2aff','#ffe0ff','LIVE'],['#ffb020','#2a1a00','カフェ']];
  {let last=0;animHooks.push(now=>{if(now-last<700)return;last=now;for(const s of SCREENS){const g=s.cv.getContext('2d'),a=ADS[(s.k+s.seed)%ADS.length];s.k++;
    const grd=g.createLinearGradient(0,0,256,192);grd.addColorStop(0,a[0]);grd.addColorStop(1,a[1]);g.fillStyle=grd;g.fillRect(0,0,256,192);
    g.fillStyle=a[1];g.globalAlpha=0.35;for(let i=0;i<6;i++){g.beginPath();g.arc((s.k*37+i*61)%256,(i*47+s.k*13)%192,18+i*6,0,7);g.fill();}g.globalAlpha=1;
    g.fillStyle=a[1]==='#ffffff'?'#101418':a[1];g.font='bold 64px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(a[2],128,100);s.t.needsUpdate=true;}});}
  function screen(w,h,seed){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:screenTex(seed),toneMapped:false}));m.userData.noWire=true;return m;}

  return {

  // ================================================================ Tokyo Tower
  tokyotower(L,x,z){const g0=gh(x,z),M=Model(),H=332.9,DECK=145,TOP=249.9,ANT=253;
    const w=h=>80*Math.pow(1-h/340,1.45)+(h>200?2:0);                       // the width across the legs at a height
    const band=h=>Math.floor(h/(H/11))%2===0?'orange':'towerWhite';          // eleven bands, orange at the foot and the top
    const lv=[];for(let h=0;h<ANT;h+=h<60?12:h<160?10:8)lv.push(h);lv.push(ANT);
    const P=(h,sx,sz)=>new V3(sx*w(h)/2,h,sz*w(h)/2),C4=[[1,1],[-1,1],[-1,-1],[1,-1]];
    for(let i=0;i+1<lv.length;i++){const h0=lv[i],h1=lv[i+1],k=band((h0+h1)/2),t=h0<60?2.4:h0<160?1.5:1.0;
      for(let c=0;c<4;c++){const [ax,az]=C4[c],[bx,bz]=C4[(c+1)%4];beam(M,k,P(h0,ax,az),P(h1,ax,az),t);   // the legs
        if(h0>=DECK-12&&h0<DECK+16)continue;
        beam(M,k,P(h1,ax,az),P(h1,bx,bz),t*0.5);beam(M,k,P(h0,ax,az),P(h1,bx,bz),t*0.4);beam(M,k,P(h0,bx,bz),P(h1,ax,az),t*0.4);}}   // the struts and the cross-bracing of each face
    // the great arches between the legs at the foot
    for(let c=0;c<4;c++){const [ax,az]=C4[c],[bx,bz]=C4[(c+1)%4];let prev=null;for(let s=0;s<=12;s++){const u=s/12,h=8+Math.sin(u*Math.PI)*34,p=new V3(ax*w(0)/2*(1-u)+bx*w(0)/2*u,h,az*w(0)/2*(1-u)+bz*w(0)/2*u);if(prev)beam(M,'orange',prev,p,2.0);prev=p;}}
    // the main deck: two storeys, glazed all round; the top deck; the antenna, a lattice and then a mast
    {const d=w(DECK)+10;M.box('towerWhite',0,DECK,0,d,1.2,d);M.box('glassDark',0,DECK+1.2,0,d-0.6,9,d-0.6);M.box('towerWhite',0,DECK+10.2,0,d,1.0,d);M.box('glassDark',0,DECK+11.2,0,d-4,5,d-4);M.box('towerWhite',0,DECK+16.2,0,d-3,1.0,d-3);}
    {const d=w(TOP)+5;M.box('towerWhite',0,TOP-1,0,d,1,d);M.box('glassDark',0,TOP,0,d-0.4,5,d-0.4);M.box('towerWhite',0,TOP+5,0,d,0.8,d);}
    for(let h=ANT;h<300;h+=6){const k=band(h+3),a=2.6*(1-(h-ANT)/70);for(let c=0;c<4;c++){const [ax,az]=C4[c];beam(M,k,new V3(ax*a,h,az*a),new V3(ax*a*0.92,h+6,az*a*0.92),0.5);}M.box(k,0,h+5.5,0,a*2,0.3,a*2);}
    M.cyl('orange',0,300,0,0.9,0.6,18,8);M.cyl('towerWhite',0,318,0,0.6,0.4,9,8);M.cyl('orange',0,327,0,0.4,0.2,5.9,8);
    const g=M.finish(L,x,g0,z,turn(L.face||0));
    // the Landmark Light: after dark the whole tower is floodlit a warm orange, the decks bright, and it is Tokyo's beacon
    const lit=new Set();g.traverse(o=>{if(o.isMesh&&o.material&&o.material.emissive)lit.add(o.material);});
    animHooks.push(()=>{const n=nightF(hour());for(const m of lit){const w=m===mat('orange')?0.95:m===mat('towerWhite')?0.75:m===mat('glassDark')?0.6:0;m.emissive.setRGB(n*w,n*w*0.5,n*w*0.16);}});
    return g;},

  // ================================================================ Shibuya Crossing
  scramble(L,x,z){const g0=gh(x,z),M=Model(),y=0.14,R=L.radius||17;
    // the arms: the roads that meet here, a direction for each (near-parallel ways are one arm)
    // the arms: every road segment that passes near the centre gives the direction from the centre to its far end
    // (near-parallel ones are one arm)
    const arms=[];for(const r of api.ROADS||[]){if(!['primary','secondary','tertiary','trunk','residential','unclassified'].includes(r.c))continue;
      for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1];if(api.segDist(x,z,ax,az,bx,bz)>16)continue;
        for(const [px,pz] of [[ax,az],[bx,bz]]){if(Math.hypot(px-x,pz-z)<R)continue;const a=Math.atan2(pz-z,px-x);if(!arms.some(q=>Math.abs(Math.atan2(Math.sin(q.a-a),Math.cos(q.a-a)))<0.5))arms.push({a,w:Math.max(r.w,12)});}}}
    api.ctx.details=Object.assign(api.ctx.details||{},{scrambleArms:arms.length});
    // each stripe on the ground under it (Shibuya is a valley: the arms climb away from the middle)
    const zebra=(cx,cz,along,len,width)=>{const n=Math.floor(len/0.9);for(let k=0;k<n;k++){const s=-len/2+(k+0.5)*0.9,px=cx+Math.cos(along)*s,pz=cz+Math.sin(along)*s;M.put('zebra',new THREE.BoxGeometry(0.45,0.03,width),px,gh(x+px,z+pz)-g0+y,pz,-along);}};
    for(const a of arms){const cx=Math.cos(a.a)*R,cz=Math.sin(a.a)*R;zebra(cx,cz,a.a+Math.PI/2,a.w+2,4.5);}                // across each arm
    for(const d of [Math.PI/4,-Math.PI/4]){const dir=(L.diagonal||0)*Math.PI/180+d;zebra(0,0,dir,R*2-6,4.5);}                  // and the diagonals, the scramble
    // Hachikō, waiting
    if(L.hachiko){const [hx,hz]=api.P(L.hachiko);const ox=hx-x,oz=hz-z;M.box('granite2',ox,0,oz,1.6,1.3,0.9);M.put('dogBronze',new THREE.SphereGeometry(1,8,6),ox,1.75,oz,0,0,0,[0.6,0.32,0.26]);
      M.box('dogBronze',ox+0.42,1.3,oz,0.18,0.5,0.22);M.box('dogBronze',ox-0.42,1.3,oz,0.18,0.45,0.22);M.put('dogBronze',new THREE.SphereGeometry(1,8,6),ox+0.6,2.15,oz,0,0,0,[0.22,0.24,0.2]);M.put('dogBronze',new THREE.ConeGeometry(0.08,0.2,4),ox+0.6,2.4,oz+0.1);M.put('dogBronze',new THREE.ConeGeometry(0.08,0.2,4),ox+0.6,2.4,oz-0.1);}
    const g=M.finish(L,x,g0,z,0);
    // the screens: on the face of each named building toward the crossing, playing
    for(const [la,lo,w,h,yb,seed] of L.screens||[]){const [sx,sz]=api.P([la,lo]),f=(api.FOOTPRINTS||[]).find(b=>api.inPoly(sx,sz,b.ring));const top=f?f.h:g0+30,dx=x-sx,dz=z-sz,d=Math.hypot(dx,dz)||1;
      // the wall: the edge of the footprint whose outward side faces the crossing best
      let px=sx,pz=sz,ry=Math.atan2(dx,dz);if(f){let best=-2;const r=f.ring;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],ex=b[0]-a[0],ez=b[1]-a[1],el=Math.hypot(ex,ez)||1;let nx=ez/el,nz=-ex/el;const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
        if(api.inPoly(mx+nx*0.5,mz+nz*0.5,r)){nx=-nx;nz=-nz;}const s=(nx*(x-mx)+nz*(z-mz))/(Math.hypot(x-mx,z-mz)||1)+Math.min(el,40)/400;if(s>best){best=s;px=mx+nx*0.4;pz=mz+nz*0.4;ry=Math.atan2(nx,nz);}}}
      const m=screen(w,h,seed||0);m.position.set(px-x,Math.min(top-h/2-1,(yb||8)+h/2)+(f?f.g:g0)-g0,pz-z);m.rotation.y=ry;g.add(m);
      const fr=new THREE.Mesh(new THREE.BoxGeometry(w+1,h+1,0.3),mat('screenFrame'));fr.position.copy(m.position).add(new V3(-Math.sin(ry)*0.2,0,-Math.cos(ry)*0.2));fr.rotation.y=ry;g.add(fr);}
    return g;},

  // ================================================================ Tokyo Station, the Marunouchi building
  station(L,x,z){const g0=gh(x,z),M=Model(),LEN=L.length||335,D=L.depth||22,H=L.height||20;
    // along local x; the front (to the palace) is +z
    M.box('brickRed',0,0,0,LEN,H,D);M.box('slate',0,H,0,LEN-1,2.5,D-4);
    for(const sz of [-1,1]){for(let y=4.2;y<H;y+=6.2)M.box('stoneWhite',0,y,sz*D/2,LEN+0.2,0.7,0.4);                                // the white stone bands
      for(let s=-LEN/2+6;s<LEN/2-6;s+=6.2)for(let fl=0;fl<3;fl++){M.box('glassDark',s,1.4+fl*6.2,sz*(D/2+0.05),2.0,3.2,0.1);M.box('stoneWhite',s,4.6+fl*6.2,sz*(D/2+0.12),2.4,0.3,0.15);}}   // the windows and their heads, both fronts
    // the central pavilion, higher, for the imperial entrance
    M.box('brickRed',0,0,0,40,H+6,D+4);M.box('slate',0,H+6,0,38,4,D);M.box('stoneWhite',0,H+3,D/2+2,40.2,0.8,0.4);
    // the two domes: octagonal drums, the domes over them in slate, lanterns
    for(const sx of [-1,1]){const cx=sx*(LEN/2-18);M.box('brickRed',cx,0,0,30,H+6,D+8);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;M.box('brickRed',cx+Math.cos(a)*11,H+6,Math.sin(a)*11,9.3,7,1.2,-a+Math.PI/2);M.box('stoneWhite',cx+Math.cos(a)*11.2,H+12.4,Math.sin(a)*11.2,9.5,0.6,1.4,-a+Math.PI/2);}
      M.put('slate',new THREE.SphereGeometry(12,8,6,0,Math.PI*2,0,Math.PI/2).scale(1,1.15,1),cx,H+13,0);M.cyl('stoneWhite',cx,H+26.8,0,1.6,1.2,2.4,8);M.cyl('slate',cx,H+29.2,0,1.2,0.1,3.4,8);}
    return M.finish(L,x,g0,z,turn(L.face||280));},

  // ================================================================ the National Diet Building
  diet(L,x,z){const g0=gh(x,z),M=Model(),W=206,D=L.depth||89;
    // two wings (the houses), the central block; local x across, the front +z
    M.box('granite2',0,0,0,W,20,D*0.55);for(const sx of [-1,1])M.box('granite2',sx*(W/2-22),0,0,44,22,D);M.box('granite2',0,0,0,60,24,D*0.8);
    for(let s=-W/2+4;s<W/2-4;s+=4.4)for(let fl=0;fl<3;fl++)M.box('glassDark',s,2+fl*6,D*0.275+0.05,1.6,3.6,0.1);
    // the tower: the colonnaded drum, then the steps up to the pyramid
    M.box('granite2',0,24,0,28,12,28);for(let k=-3;k<=3;k++)for(const [a,b] of [[0,1],[0,-1],[1,0],[-1,0]])M.box('glassDark',a*14.1+(b?k*3.6:0),27,b*14.1+(a?k*3.6:0),a?0.1:1.4,6,b?0.1:1.4);
    let y=36,s=26;for(let k=0;k<5;k++){M.box('granite2',0,y,0,s,2.4,s);y+=2.4;s-=3;}M.put('granite2',new THREE.ConeGeometry(s*0.72,13,4).rotateY(Math.PI/4),0,y+6.5,0);M.box('granite2',0,y+13,0,1.2,2.8,1.2);
    return M.finish(L,x,g0,z,turn(L.face||90));},

  // ================================================================ the Imperial Palace: Nijūbashi, a yagura
  nijubashi(L,x,z){const g0=gh(x,z),M=Model(),LEN=L.length||30,W=L.width||9,y=L.deck||4;
    // two arches (the "spectacles bridge"), the parapets, the lamps; along local x
    for(const sx of [-1,1]){const s=new THREE.Shape();s.moveTo(-LEN/4,0);s.lineTo(LEN/4,0);s.lineTo(LEN/4,y);s.lineTo(-LEN/4,y);s.lineTo(-LEN/4,0);const p=new THREE.Path();p.absarc(0,0.2,LEN/4-1.4,0,Math.PI,false);s.holes.push(p);
      M.put('granite2',new THREE.ExtrudeGeometry(s,{depth:W,bevelEnabled:false,curveSegments:10}).translate(0,0,-W/2),sx*LEN/4,-1.5,0);}
    for(const sz of [-1,1]){M.box('granite2',0,y-1.5,sz*(W/2-0.25),LEN+2,1.1,0.5);for(const sx of [-1,-0.33,0.33,1]){M.box('granite2',sx*LEN/2,y-1.5,sz*(W/2-0.25),0.7,2.2,0.7);if(Math.abs(sx)===1){M.cyl('dark',sx*LEN/2,y+0.7,sz*(W/2-0.25),0.12,0.12,2.4,6);M.box('stoneWhite',sx*LEN/2,y+3.1,sz*(W/2-0.25),0.6,0.7,0.6);}}}
    return M.finish(L,x,g0,z,turn(L.face||0));},
  yagura(L,x,z){const g0=gh(x,z),M=Model(),W=L.w||16,D=L.d||9,B=L.base||12;
    const roof=(y,w,d,h)=>{M.put('tileDark',new THREE.ConeGeometry(Math.hypot(w,d)/2*1.12,h,4).rotateY(Math.PI/4).scale(w/Math.hypot(w,d)*1.41,1,d/Math.hypot(w,d)*1.41),0,y+h/2,0);};
    M.put('granite2',new THREE.CylinderGeometry(Math.hypot(W,D)/2*0.9,Math.hypot(W,D)/2*1.15,B,4).rotateY(Math.PI/4).scale(W/Math.hypot(W,D)*1.41,1,D/Math.hypot(W,D)*1.41),0,B/2,0);   // the battered stone base
    M.box('plaster',0,B,0,W,6,D);roof(B+6,W+3,D+3,3.2);M.box('plaster',0,B+8.2,0,W*0.7,4.5,D*0.7);roof(B+12.7,W*0.7+3,D*0.7+3,3.6);
    for(let s=-W/2+2;s<W/2-1;s+=3)M.box('dark',s,B+2.4,D/2+0.05,1.0,1.4,0.1);
    if(L.wall){for(const sx of [-1,1])M.box('plaster',sx*(W/2+L.wall/2),B,0,L.wall,3.4,3);M.box('tileDark',0,B+3.4,0,W+L.wall*2,0.8,3.8);}   // the tamon wall either side
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Wakō clock tower, Ginza
  wako(L,x,z){const g0=gh(x,z),M=Model(),R=L.r||22,H=L.height||30;
    // the curved corner: a quarter of a drum, faced in granite, windows in bands; the tower over it with its four clocks
    for(let k=0;k<12;k++){const a=k/12*Math.PI/2-Math.PI/4,a1=(k+1)/12*Math.PI/2-Math.PI/4,am=(a+a1)/2;M.box('granite2',Math.sin(am)*R,0,Math.cos(am)*R,R*Math.PI/2/12+0.2,H,3,am);
      for(let fl=0;fl<6;fl++)M.box('glassDark',Math.sin(am)*(R+1.55),2+fl*4.6,Math.cos(am)*(R+1.55),R*Math.PI/2/12-1.2,2.4,0.1,am);}
    M.box('granite2',0,0,R*0.55,R*1.2,H,R*0.9);M.box('granite2',0,H,R*0.6,10,8,10);M.box('granite2',0,H+8,R*0.6,8,4,8);
    for(const [a,b] of [[0,1],[0,-1],[1,0],[-1,0]]){M.cyl('stoneWhite',a*4.05,H+4.2,R*0.6+b*4.05,1.6,1.6,0.2,16,Math.atan2(a,b));}
    M.put('copper',new THREE.SphereGeometry(4.2,10,6,0,Math.PI*2,0,Math.PI/2),0,H+12,R*0.6);M.cyl('copper',0,H+16,R*0.6,0.4,0.1,3,6);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ Kabukichō Ichiban-gai's gate
  kabukicho(L,x,z){const g0=gh(x,z),M=Model(),W=L.width||13;
    for(const sx of [-1,1])M.box('signRed',sx*W/2,0,0,0.6,7.5,0.6);M.box('signRed',0,7.2,0,W+1.2,2.4,0.8);
    const g=M.finish(L,x,g0,z,turn(L.face||0));
    const cv=document.createElement('canvas');cv.width=512;cv.height=96;const c=cv.getContext('2d');c.fillStyle='#c81e28';c.fillRect(0,0,512,96);c.fillStyle='#fff';c.font='bold 62px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('歌舞伎町一番街',256,50);
    const s=new THREE.Mesh(new THREE.PlaneGeometry(W,2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),toneMapped:false,side:THREE.DoubleSide}));s.position.set(0,8.4,0.42);g.add(s);
    return g;},

  // ================================================================ Godzilla, over the Hotel Gracery
  godzilla(L,x,z){const g0=gh(x,z),M=Model(),y=L.terrace||40,R=mkRng(1954);
    M.put('zilla',new THREE.SphereGeometry(1,10,8),0,y+6,0,0,0,0.3,[3.2,4.2,3.0]);                 // the neck and shoulders
    M.put('zilla',new THREE.SphereGeometry(1,10,8),2.6,y+11,0,0,0,-0.2,[3.4,2.4,2.4]);             // the head, low and long
    M.put('zillaDark',new THREE.BoxGeometry(3.2,0.8,2.0),3.6,y+9.4,0,0,0,-0.35);                   // the open jaw
    for(const sz of [-1,1])M.put('signRed',new THREE.SphereGeometry(0.22,6,5),4.2,y+11.8,sz*1.1);    // the eyes
    for(let k=0;k<7;k++){const s=0.8+R()*0.9;M.put('zillaDark',new THREE.ConeGeometry(0.8*s,2.6*s,4),-1.2-k*0.9,y+9+Math.sin(k*0.5)*2.2-k*0.6,0,0,0,0.4+k*0.08);}   // the dorsal plates
    M.put('zilla',new THREE.SphereGeometry(1,8,6),2.4,y+3,1.8,0,0,0,[0.8,2.2,0.8]);M.put('zilla',new THREE.SphereGeometry(1,8,6),2.6,y+1.2,2.2,0,0,0.6,[1.4,0.5,0.6]);   // an arm and its claws
    return M.finish(L,x,g0,z,turn(L.face||180));},

  // ================================================================ Zōjō-ji's Sanmon
  sanmon(L,x,z){const g0=gh(x,z),M=Model(),W=28,D=17;
    const roof=(y,w,d,h,lift)=>{M.put('tileDark',new THREE.ConeGeometry(Math.hypot(w,d)/2*1.15,h,4).rotateY(Math.PI/4).scale(w/Math.hypot(w,d)*1.41,1,d/Math.hypot(w,d)*1.41),0,y+h/2,0);M.box('tileDark',0,y+h*0.85,0,w*0.55,h*0.35,1.2);};
    M.box('granite2',0,0,0,W+2,1.2,D+2);
    for(let i=-2;i<=2;i++)for(const zz of [-1,0,1])M.cyl('vermilion',i*6,1.2,zz*D*0.42,0.45,0.45,7.5,10);   // the pillars: three bays wide
    M.box('vermilion',0,8.7,0,W,1.6,D);roof(10.3,W+5,D+5,3);M.box('vermilion',0,12.4,0,W*0.86,5.2,D*0.8);M.box('plaster',0,13,D*0.4+0.05,W*0.8,3,0.1);roof(17.6,W+6,D+6,5.6);
    for(let i=-2;i<=2;i++)M.box('dark',i*6,1.2,D*0.42+0.3,3.6,6,0.1);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ Tokyo Skytree
  // 634 m (2012): three legs on a triangle of 68 m, the section turning from triangle to circle by 300 m; the Tembo
  // Deck at 350 m, the Tembo Galleria's ring at 445-450 m, the antenna mast to the top. Painted 'Skytree white', a
  // pale blue-white; at night lit in Iki, the pale blue of the Sumida.
  skytree(L,x,z){const g0=gh(x,z),M=Model(),H=634,TR=300;
    const R=h=>h<TR?39*Math.pow(1-h/(TR*1.9),1.35)+3:Math.max(2.2,17*(1-(h-TR)/220));   // the radius of the shaft at a height
    const lv=[];for(let h=0;h<500;h+=h<100?14:h<300?12:10)lv.push(h);lv.push(497);
    const P=(h,k,n)=>{const a=k/n*Math.PI*2+Math.PI/2,r=R(h);return new V3(Math.cos(a)*r,h,Math.sin(a)*r);};
    for(let i=0;i+1<lv.length;i++){const h0=lv[i],h1=lv[i+1],n=h0<TR?3:8,t=h0<100?2.6:h0<TR?1.8:1.1;
      for(let k=0;k<n;k++){beam(M,'skyWhite',P(h0,k,n),P(h1,k,n),t);beam(M,'skyWhite',P(h0,k,n),P(h1,k+1,n),t*0.45);beam(M,'skyWhite',P(h0,k+1,n),P(h1,k,n),t*0.45);beam(M,'skyWhite',P(h1,k,n),P(h1,k+1,n),t*0.5);}}
    M.cyl('skyWhite',0,0,0,8,6,500,16);                                                                  // the core column (the shimbashira, after a pagoda's)
    M.cyl('skyWhite',0,337,0,21,23,4,24);M.cyl('glassDark',0,341,0,23,23,9,24);M.cyl('skyWhite',0,350,0,23,21,3,24);M.cyl('glassDark',0,353,0,20,20,5,24);M.cyl('skyWhite',0,358,0,20,16,3,24);   // the Tembo Deck
    M.cyl('skyWhite',0,442,0,15,16,2,24);M.cyl('glassDark',0,444,0,16,16,6,24);M.cyl('skyWhite',0,450,0,16,14,2.5,24);   // the Galleria
    M.cyl('skyWhite',0,497,0,4.2,2.6,80,12);M.cyl('skyWhite',0,577,0,2.6,1.4,40,10);M.cyl('skyWhite',0,617,0,1.4,0.5,17,8);
    const g=M.finish(L,x,g0,z,0);
    const lit=new Set();g.traverse(o=>{if(o.isMesh&&o.material&&o.material.emissive)lit.add(o.material);});
    animHooks.push(()=>{const n=nightF(hour());for(const m of lit){const w=m===mat('skyWhite')?0.7:m===mat('glassDark')?0.9:0;m.emissive.setRGB(n*w*0.45,n*w*0.75,n*w);}});   // Iki
    return g;},

  // ================================================================ Sensō-ji: the Kaminarimon, Nakamise, the Hōzōmon, the pagoda, the hall
  // Asakusa's temple, the oldest in Tokyo: in through the Thunder Gate under its great red lantern (3.9 m), up
  // Nakamise's 250 m of stalls to the two-storey Hōzōmon, the five-storey pagoda to the west, the main hall ahead.
  // Placed by the gate (at) and the hall (hall); the approach runs between them.
  sensoji(L,x,z){const g0=gh(x,z),M=Model(),[hx,hz]=api.P(L.hall),dx=hx-x,dz=hz-z,len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len,ry=-Math.atan2(uz,ux)+Math.PI/2;
    // a local frame: +z up the approach (toward the hall), +x across it
    const at=(ax,az)=>[ux*az+uz*ax,uz*az-ux*ax];const B=(k,ax,y,az,w,h,d)=>{const [px,pz]=at(ax,az);M.box(k,px,y,pz,w,h,d,ry);},C2=(k,ax,y,az,r0,r1,h,seg)=>{const [px,pz]=at(ax,az);M.cyl(k,px,y,pz,r0,r1,h,seg||10);};
    const roof=(ax,az,y,w,d,h)=>{const [px,pz]=at(ax,az);M.put('tileDark',new THREE.ConeGeometry(Math.hypot(w,d)/2*1.15,h,4).rotateY(Math.PI/4).scale(w/Math.hypot(w,d)*1.41,1,d/Math.hypot(w,d)*1.41),px,y+h/2,pz,ry);M.box('tileDark',px,y+h*0.82,pz,w*0.5,h*0.3,1.2,ry);};
    const gate=(az,W,D,H,storeys)=>{for(const ax of [-W/2+0.6,-W/6,W/6,W/2-0.6])for(const zz of [-D/2+0.6,D/2-0.6])C2('vermilion',ax,0,az+zz,0.45,0.45,H*0.55,10);
      B('vermilion',0,H*0.55,az,W,1.2,D);roof(0,az,H*0.55+1.2,W+4,D+4,H*0.18);if(storeys>1){B('vermilion',0,H*0.55+1.2+H*0.12,az,W*0.85,H*0.16,D*0.8);roof(0,az,H*0.84,W+5,D+5,H*0.2);}};
    // the Kaminarimon and its lantern, the Hōzōmon and its
    gate(0,11.4,8,11.7,1);C2('chochin',0,2.6,0,1.65,1.65,3.9,16);B('dark',0,2.45,0,3.6,0.2,3.6);B('dark',0,6.5,0,3.6,0.2,3.6);
    const hz2=len*0.62;gate(hz2,21,9,22.7,2);C2('chochin',0,4.5,hz2,1.4,1.4,3.8,16);
    // Nakamise: the stalls either side of the approach, low, under their vermilion eaves
    for(let s2=10;s2<hz2-8;s2+=4.2)for(const sd of [-1,1]){B('plaster',sd*5.2,0,s2,3.2,3.4,4.0);B('vermilion',sd*4.2,3.3,s2,1.6,0.25,4.1);B('tileDark',sd*5.2,3.4,s2,3.6,0.5,4.2);B('glassDark',sd*3.58,0.4,s2,0.05,2.2,3.4);}
    // the pagoda, west of the Hōzōmon: five storeys, each roof a little smaller, the sōrin spire
    {const ax=28,az=hz2+18;   /* +x in this frame is west when the approach runs north */let y=0;B('granite2',ax,0,az,12,1.2,12);y=1.2;for(let k=0;k<5;k++){const w=10-k*1.1;B('vermilion',ax,y,az,w*0.75,5.2,w*0.75);roof(ax,az,y+5.2,w+5,w+5,2.2);y+=7.0;}C2('gold',ax,y,az,0.35,0.15,12,8);}
    // the main hall: a broad platform, the hall, its great roof
    {const az=len;B('granite2',0,0,az,38,1.8,32);for(let i=-3;i<=3;i++)C2('vermilion',i*5,1.8,az+14,0.5,0.5,9,10);B('vermilion',0,1.8,az,34,10,28);roof(0,az,11.8,44,38,17);}
    return M.finish(L,x,g0,z,0);},

  // ================================================================ the Asahi Beer Hall's golden flame (Philippe Starck, 1989)
  asahi(L,x,z){const g0=gh(x,z),M=Model(),top=(L.roof||22);
    M.box('dark',0,0,0,L.w||27,top,L.d||27);                                                              // the black hall, an inverted-cup shape simplified
    M.put('gold',new THREE.SphereGeometry(1,16,10),4,top+7,0,0,0,-0.35,[22,6.5,6.5]);M.put('gold',new THREE.ConeGeometry(4,10,12).rotateZ(Math.PI/2),-18,top+10,0,0,0,0.5);   // the flame, the tail
    return M.finish(L,x,g0,z,turn(L.face||270));},

  // ================================================================ a torii of plain cypress
  torii(L,x,z){
    // no face given: the gate turns to the path through it (the nearest footway or road), its beam across the path
    if(L.face===undefined){let best=1e9,brg=0;for(const r of api.ROADS||[])for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],d=api.segDist(x,z,ax,az,bx,bz);if(d<best){best=d;brg=Math.atan2(bx-ax,-(bz-az))*180/Math.PI;}}L.face=brg;}
    const g0=gh(x,z),M=Model(),H=L.height||12,S=L.span||9.1,r=L.pillar?L.pillar/2:0.6,k=L.wood||'cypress';
    for(const sx of [-1,1])M.cyl(k,sx*S/2,0,0,r*1.05,r*0.92,H,14);
    M.box(k,0,H*0.74,0,S+r*5,r*0.9,r*0.8);                                                     // the nuki, through the pillars
    M.box(k,0,H-0.2,0,S+r*7,r*0.9,r*1.4);M.box(k,0,H+0.7,0,S+r*9,r*0.7,r*1.6);                 // the shimaki and the kasagi
    for(const sx of [-1,1])M.put(k,new THREE.BoxGeometry(r*3,r*0.7,r*1.6),sx*(S/2+r*4.5),H+0.85,0,0,0,sx*0.12);   // its ends turning up
    M.box(k,0,H*0.74+r*0.9,0,r*1.2,H*0.26-r*1.6,r*0.8);                                        // the gakuzuka, the strut at the centre
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Rainbow Bridge
  // The Tokyo Port Connector Bridge (1993): a suspension bridge of 798 m, its main span 570 m between two white towers
  // of 126 m, the Shuto expressway on the upper deck and the Yurikamome and the road on the lower, a truss between.
  // Placed by its two ends (from, to: the upper deck's way in OSM); built from the water, which is where the streamed
  // ground seats it. After dark the cables are strung with lamps and the towers floodlit white.
  rainbow(L,x,z){const M=Model(),[ax,az]=api.P(L.from),[bx,bz]=api.P(L.to),len=Math.hypot(bx-ax,bz-az),HALF=len/2,ry=-Math.atan2(bz-az,bx-ax);
    const TW=126,SPAN=570,SIDE=114,UP=L.deck||52,LOW=UP-9,W=28,TX=SPAN/2,AX=TX+SIDE;
    const deckY=u=>{const a=Math.abs(u);return a<=AX?UP:UP-(a-AX)/(HALF-AX)*(UP-(L.landDeck??24));};
    // the decks: upper and lower, a truss of diagonals between them along both sides
    for(let u=-HALF;u<HALF;u+=20){const u1=Math.min(HALF,u+20),y0=deckY(u),y1=deckY(u1),m=(u+u1)/2,ym=(y0+y1)/2,ln=Math.hypot(u1-u,y1-y0)+0.2,pitch=Math.atan2(y1-y0,u1-u);
      M.put('bridgeWhite',new THREE.BoxGeometry(ln,1.6,W),m,ym,0,0,0,pitch);M.put('asphaltT',new THREE.BoxGeometry(ln,0.1,W-3),m,ym+0.85,0,0,0,pitch);
      if(Math.abs(m)<AX+10){M.put('bridgeWhite',new THREE.BoxGeometry(ln,1.2,W-2),m,ym-9,0,0,0,pitch);
        for(const sd of [-1,1]){beam(M,'bridgeWhite',new V3(u,y0-9,sd*(W/2-1)),new V3(u1,y1,sd*(W/2-1)),0.7);beam(M,'bridgeWhite',new V3(u,y0,sd*(W/2-1)),new V3(u,y0-9,sd*(W/2-1)),0.6);}}}
    // the towers: two legs, three cross-beams, the saddles on top
    for(const tx of [-TX,TX]){for(const sd of [-1,1]){M.box('bridgeWhite',tx,0,sd*(W/2+1.5),7,TW,5.5);M.box('bridgeWhite',tx,TW,sd*(W/2+1.5),8,2.5,6.5);}
      for(const h of [UP-14,UP+28,TW-8])M.box('bridgeWhite',tx,h,0,6,5,W+3);
      M.box('stoneWhite',tx,-4,0,20,4,W+16);}
    // the anchorages, where the cables come down at the ends of the side spans
    for(const sd of [-1,1])M.box('stoneWhite',sd*AX,0,0,32,UP-2,W+12);
    // the cables: the main span's catenary, low point 8 m over the deck; the side spans straight down to the anchorages
    const cab=u=>{const a=Math.abs(u);if(a<=TX){const t=u/TX;return UP+8+(TW+1-(UP+8))*t*t;}return TW+1-(a-TX)/SIDE*(TW+1-(UP+4));};
    const lamps=[];
    for(const sd of [-1,1]){const zc=sd*(W/2+1.5);let prev=null;for(let u=-AX;u<=AX+0.1;u+=10){const p=new V3(u,cab(u),zc);if(prev)beam(M,'bridgeWhite',prev,p,0.9);prev=p;lamps.push(p.clone());
        if(Math.abs(u)>4&&Math.abs(Math.abs(u)-TX)>4)beam(M,'bridgeWhite',new V3(u,deckY(u)+0.8,zc),new V3(u,cab(u),zc),0.15);}}
    const g=M.finish(L,x,0,z,ry);
    // the lamps along the cables: their own instanced mesh, lit only after dark
    const lm=new THREE.InstancedMesh(new THREE.SphereGeometry(0.9,6,4),new THREE.MeshBasicMaterial({color:0xfff4e0,transparent:true,opacity:0}),lamps.length),o=new THREE.Object3D();
    lamps.forEach((p,i)=>{o.position.copy(p);o.updateMatrix();lm.setMatrixAt(i,o.matrix);});lm.userData.noWire=true;lm.userData.noFingerprint=true;g.add(lm);
    const lit=new Set();g.traverse(q=>{if(q.isMesh&&q.material&&q.material.emissive&&q.material===mat('bridgeWhite'))lit.add(q.material);});
    animHooks.push(()=>{const n=nightF(hour());lm.material.opacity=n;lm.visible=n>0.02;for(const m of lit)m.emissive.setRGB(n*0.55,n*0.55,n*0.6);});
    return g;},

  // ================================================================ the Fuji Television building, Odaiba
  // Tange Kenzō (1996): two blocks of 25 storeys (123 m) joined by a lattice of corridors three storeys apart, and in
  // the gap, at the 25th floor, the titanium sphere (32 m) of the observation deck.
  fujitv(L,x,z){const g0=gh(x,z),M=Model(),H=123,DW=L.depth||28,LEN=L.length||80,GAP=L.gap||34;
    for(const sd of [-1,1]){const zc=sd*(GAP/2+DW/2);M.box('steelGrey',0,0,zc,LEN,H,DW);
      for(let h=12;h<H;h+=4.2)M.box('glassDark',0,h,zc,LEN+0.3,1.6,DW+0.3);}
    // the corridors: every third floor, and the columns at the open ends
    const SU=LEN/2-13,SY=H-30;   // the sphere: in the gap at the end facing the bay, the corridors left out round it
    for(let h=14;h<H-4;h+=13)for(let u=-LEN/2+8;u<=LEN/2-8;u+=16)if(Math.abs(u-SU)>19||Math.abs(h+2-SY)>19)M.box('steelGrey',u,h,0,4,4,GAP+2);
    for(let u=-LEN/2+2;u<=LEN/2-2;u+=LEN/4)M.box('steelGrey',u,0,0,2.4,H,2.4);
    M.box('steelGrey',0,H-6,0,LEN,6,GAP+2*DW);
    const sp=new THREE.Mesh(new THREE.SphereGeometry(16,28,18),new THREE.MeshPhongMaterial({color:0xc8ccd0,specular:0xffffff,shininess:60}));sp.position.set(SU,SY,0);sp.castShadow=true;
    const g=M.finish(L,x,g0,z,turn(L.face||0));g.add(sp);sp.userData.info=L;return g;},

  // ================================================================ the Unicorn Gundam, DiverCity Tokyo Plaza
  // RX-0 at 1:1, 19.7 m: white armour over a red psycho-frame that glows after dark, the gold V-fin on its head, the
  // shield on its left arm. Built of boxes, as the real one is of panels.
  gundam(L,x,z){const g0=gh(x,z),M=Model(),S=19.7/18.5;const b=(k,px,py,pz,w,h,d)=>M.box(k,px*S,py*S,pz*S,w*S,h*S,d*S);
    for(const sd of [-1,1]){b('gWhite',0,0,sd*1.6,2.4,1.2,3.2);b('gWhite',0,1.2,sd*1.6,1.8,4.2,1.8);b('gFrame',0.95,1.6,sd*1.6,0.2,3.2,0.6);b('gWhite',0,5.4,sd*1.6,2.1,4,2.1);b('gFrame',1.06,5.8,sd*1.6,0.2,3,0.6);}
    b('gWhite',0,9.4,0,2.6,1.6,5.2);b('gFrame',0,10.4,0,2.2,1.4,3.6);b('gWhite',0,11.6,0,3.4,3.8,5.6);b('gFrame',1.72,12.2,0,0.2,2.6,1.2);
    b('gBlue',0.2,11,0,2.8,0.8,4.6);b('gWhite',0,15.4,0,2.6,0.8,7.6);
    for(const sd of [-1,1]){b('gWhite',0,13.2,sd*4.4,2.6,2.8,2.4);b('gWhite',0,9.6,sd*4.6,1.8,3.6,1.8);b('gFrame',0.9,10,sd*4.6,0.2,2.6,0.5);b('gWhite',0.4,8.2,sd*4.6,1.6,1.4,1.6);}
    b('gWhite',0.6,6.2,-5.9,1,6.6,3.4);b('gFrame',1.12,7.8,-5.9,0.1,3.2,0.5);   // the shield
    b('gWhite',0,16.2,0,2,2,2);b('gFace',1.0,16.6,0,0.1,0.6,1.4);b('gGold',0.4,17.8,0,0.3,0.6,0.3);M.put('gGold',new THREE.ConeGeometry(0.22*S,1.9*S,5),0.3*S,19*S,0,0,0,-0.35);
    b('stoneWhite',0,-0.6,0,7,0.6,9);
    const g=M.finish(L,x,g0,z,turn(L.face||0));
    // the psycho-frame and the eyes glow after dark
    const fr=new Set();g.traverse(q=>{if(q.isMesh&&q.material&&q.material.emissive&&(q.material===mat('gFrame')||q.material===mat('gFace')||q.material===mat('gWhite')))fr.add(q.material);});
    // floodlit, the frame pulsing
    animHooks.push(now=>{const n=nightF(hour()),pulse=0.75+0.25*Math.sin(now/600);for(const m of fr){if(m===mat('gWhite')){m.emissive.setRGB(n*0.32,n*0.33,n*0.36);continue;}m.emissive.setRGB(m===mat('gFace')?n*0.2:n*0.95*pulse,m===mat('gFace')?n*0.95:n*0.08,m===mat('gFace')?n*0.4:n*0.12);}});
    return g;},

  };
}
