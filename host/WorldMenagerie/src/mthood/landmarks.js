// ---------- Mount Hood: the buildings on the mountain ----------
//   timberline  Timberline Lodge (built 1936-38 by the Works Progress Administration, dedicated by Roosevelt on
//               28 September 1937): the six-sided head house under its tall hexagonal roof, the great stone chimney
//               through its apex, the west wing of rooms and the east wing of the dining room, angled off it as the
//               OpenStreetMap outline has them (registered to it by the outline's middle): the west wing stepping
//               down at its outer half, with cross gables north and south and one across its end; the Ski Lounge
//               wing south-east from the head, the Cascade Dining Room's east wing branching off it at the same
//               ridge, a lower hall between. Every wing's roof starts inside the head, so its ridge meets the
//               six-sided roof in a valley; a ground storey of the mountain's own andesite, board and batten over
//               it, steep shingle roofs with dormers (none under the head's roof), windows lit at night
//   silcox      Silcox Hut (1939), the top station of the first Magic Mile chairlift: a stone storey, a timber one,
//               a steep gable roof and a stone chimney, 2,111 m up
//   cloudcap    Cloud Cap Inn (1889) on the north-east side: two storeys of logs under a steep shake roof, a wing,
//               and the steel cables over the roof anchored in the rock either side, against the winter's winds
//   aframe      the Tilly Jane A-frame below Cloud Cap: a ski cabin that is all roof
//   footlodge   a lodge drawn from its own OpenStreetMap outline: a stone base, stained timber walls, a hipped roof
//               raised from the outline (the Wy'East Day Lodge, Mount Hood Meadows' lodges)
//   lodge       a lodge as blocks over its OpenStreetMap outline (named, or the nearest unnamed one): gable or A-frame
//               roofs, glass gable ends, a deck, a cupola (Skibowl West, Skibowl's Multorpor lodge, Hood River Meadows)
//   shelter     the stone shelters the Civilian Conservation Corps built on the Timberline Trail in the 1930s:
//               square with a gable roof (McNeil Point, Cairn Basin), or round with a conical one (Cooper Spur)
// The roofs take snow in winter (lifts.js puts ground.js's snowOnTop on every building's materials). Map data (c)
// OpenStreetMap contributors, ODbL.
import {landkit} from '../core/landkit.js';
import {hash3} from '../core/rng.js';

export function landmarks(api){
  const {THREE,gh,OSM,nightF,hour,animHooks}=api;
  const K=landkit(api,{andesite:0x7a756c,andesiteDark:0x5e5a54,board:0x6a4a30,boardDark:0x553a26,shingle:0x4a443c,shingleDark:0x3a352f,
    trim:0xd8ccb0,trimRed:0x7a2e22,log:0x7a5a3a,logDark:0x5a4028,shake:0x5a5048,steel:0x3a3c3e,glass:0x2a3238,timber:0x6a5038,concrete:0x8a8680});
  const {Model,setMat}=K;
  // the windows: dark by day, lit warm after dark (the lodges are lived in all night)
  const lit=new THREE.MeshLambertMaterial({color:0x2a3238,emissive:0x000000});setMat('glassLit',lit);
  animHooks.push(()=>{const n=nightF(hour());lit.emissive.setRGB(n*0.95,n*0.72,n*0.4);});
  // a gable roof along local x: length, width (with the eaves), rise
  const gable=(len,w,rise)=>{const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,rise);s.lineTo(-w/2,0);
    return new THREE.ExtrudeGeometry(s,{depth:len,bevelEnabled:false}).translate(0,0,-len/2).rotateY(Math.PI/2);};
  // the nearest OpenStreetMap outline with this name, in metres
  // (name null: the nearest outline of any name, within 40 m: an unnamed building)
  const outline=(name,x,z)=>{let best=null,bd=1e9;for(const b of OSM.buildings||[]){if(name!=null&&b.n!==name)continue;const p=b.p,n=p.length/2;let cx=0,cz=0;for(let i=0;i<p.length;i+=2){cx+=p[i]/10;cz+=p[i+1]/10;}cx/=n;cz/=n;const d=Math.hypot(cx-x,cz-z);if(d<bd){bd=d;best=b;}}
    if(!best||bd>(name==null?40:150))return null;const r=[];for(let i=0;i<best.p.length;i+=2)r.push([best.p[i]/10,best.p[i+1]/10]);return r;};
  // a wing from a to b (local x, z), w wide: its ground storey of stone (down to the ground on the low side), its
  // upper storeys of board and batten, a steep gable roof with dormers on both faces, windows in rows
  function wing(M,ox,oz,g0,a,b,w,o={}){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,nx=-uz,nz=ux,ry=Math.atan2(-dz,dx),cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2;
    const at=(u,v)=>[cx+ux*u+nx*v,cz+uz*u+nz*v];
    // the floor stands at the ground's highest corner; the stone runs down to its lowest
    let hi=-1e9,lo=1e9;for(const u of [-L/2,0,L/2])for(const v of [-w/2,w/2]){const [px,pz]=at(u,v),g=gh(ox+px,oz+pz)-g0;hi=Math.max(hi,g);lo=Math.min(lo,g);}
    const F=hi+(o.lift||0.3),ST=o.stone==null?3.6:o.stone,UP=o.up==null?6.2:o.up,RISE=o.rise==null?w*0.62:o.rise;
    M.box('andesite',cx,lo-1.5,cz,L,F-lo+1.5+ST,w,ry);M.box('andesiteDark',cx,F+ST-0.35,cz,L+0.3,0.35,w+0.3,ry);   // the stone, and its coping
    M.box(o.wall||'board',cx,F+ST,cz,L,UP,w,ry);
    M.put('shingle',gable(L+1.6,w+2.2,RISE),cx,F+ST+UP,cz,ry);
    // the windows: paired in the timber, deep set and smaller in the stone; the ground storey's light at night too
    const nW=Math.max(2,Math.floor(L/4.2));
    for(const sd of [-1,1])for(let i=0;i<nW;i++){const u=-L/2+(i+0.5)*L/nW,[px,pz]=at(u,sd*(w/2+0.04));
      for(let f=0;f<(UP>4.5?2:1);f++){M.box('trim',px,F+ST+0.75+f*2.9,pz,1.5,1.75,0.08,ry);M.box('glassLit',px+nx*sd*0.03,F+ST+0.85+f*2.9,pz+nz*sd*0.03,1.2,1.5,0.08,ry);}
      if(i%2===0)M.box('glassLit',px+nx*sd*0.02,F+0.9,pz+nz*sd*0.02,1.1,1.5,0.1,ry);}
    // dormers: small gables on both faces of the roof
    const nD=o.dormers==null?Math.max(1,Math.floor(L/9)):o.dormers;
    for(const sd of [-1,1])for(let i=0;i<nD;i++){const u=-L/2+(i+0.5)*L/nD,[px,pz]=at(u,sd*w*0.24),y=F+ST+UP+RISE*0.22;
      M.box('board',px,y,pz,2.6,2.2,2.8,ry);M.put('shingle',gable(3.4,3.2,1.7).rotateY(Math.PI/2),px,y+2.2,pz,ry);
      const [gx,gz]=at(u,sd*(w*0.24+1.42));M.box('glassLit',gx,y+0.5,gz,1.6,1.2,0.06,ry);}
    // the ends' gables in board, and a chimney
    if(o.chimney!==false){const [px,pz]=at(L*0.28,0);M.box('andesite',px,F+ST+UP-1,pz,1.8,RISE+3,1.6,ry);}
    return {F,ST,UP,RISE};}
  return {
  timberline(L,x,z){const g0=gh(x,z),M=Model();
    // Everything below is drawn in the frame of the OpenStreetMap outline as it was surveyed (metres from the landmark's
    // point, x east, z south); the outline's own middle (CD) registers it to the outline the page has, so the wings
    // stand on their footprint whatever the projection. The head house's north apex, the west wing of rooms with its
    // two cross gables and its end, the Ski Lounge wing running south-east, and the east wing of the Cascade Dining
    // Room branching off it: the outline's shapes.
    const ring=outline('Timberline Lodge',x,z),CD=[-0.39,25.12];let sx=0,sz=0;
    if(ring){let ax=0,az=0;for(const [px,pz] of ring){ax+=px;az+=pz;}sx=ax/ring.length-x-CD[0];sz=az/ring.length-z-CD[1];}
    const P=([a,b])=>[a+sx,b+sz];
    const H=L.head||{},[hx,hz]=P(H.at||[-1,19.4]),R=H.r==null?15.5:H.r;
    let hi=-1e9,lo=1e9;for(let k=0;k<6;k++){const a=k/6*Math.PI*2,g=gh(x+hx+Math.sin(a)*R,z+hz+Math.cos(a)*R)-g0;hi=Math.max(hi,g);lo=Math.min(lo,g);}
    const F=hi+0.3,ST=4.2,WALL=H.wall==null?10.5:H.wall,RISE=H.rise==null?16:H.rise,ER=R+2.2;
    // the head house: six-sided with its corners north and south (the outline's apex), the stone storey, the timber,
    // the tall six-sided roof
    M.put('andesite',new THREE.CylinderGeometry(R,R+0.4,F-lo+1.5+ST,6).translate(0,(F-lo+1.5+ST)/2,0),hx,lo-1.5,hz);
    M.put('board',new THREE.CylinderGeometry(R-0.1,R-0.1,WALL-ST,6).translate(0,(WALL-ST)/2,0),hx,F+ST,hz);
    M.put('shingle',new THREE.ConeGeometry(ER,RISE,6).translate(0,RISE/2,0),hx,F+WALL,hz);
    const coneY=r=>F+WALL+RISE*(1-r/ER);   // the head's roof over a point r from its middle
    for(let k=0;k<6;k++){const a=(k+0.5)/6*Math.PI*2,c=Math.sin(a),s=Math.cos(a),ry=Math.atan2(c,s);   // the faces' middles
      const rr=ER*0.55,y=F+WALL+RISE*0.38;M.box('board',hx+c*rr,y,hz+s*rr,2.6,2.4,2.6,ry);M.put('shingle',gable(3.2,3.4,1.8),hx+c*rr,y+2.4,hz+s*rr,ry+Math.PI/2);
      M.box('glassLit',hx+c*(rr+1.32),y+0.6,hz+s*(rr+1.32),1.6,1.3,0.06,ry);
      const wr=R*Math.cos(Math.PI/6)+0.05;for(const off of [-3.2,0,3.2]){const px=hx+c*wr-s*off,pz=hz+s*wr+c*off;M.box('trim',px,F+5,pz,1.8,4.4,0.1,ry);M.box('glassLit',px+c*0.04,F+5.15,pz+s*0.04,1.5,4.1,0.1,ry);}
      const b=k/6*Math.PI*2;M.box('andesite',hx+Math.sin(b)*(R+0.2),lo-1.5,hz+Math.cos(b)*(R+0.2),1.6,F-lo+1.5+6.5,1.6,b);}   // the buttresses at the corners
    M.box('andesite',hx,F,hz,4.6,WALL+RISE+3.5,4.6);M.box('andesiteDark',hx,F+WALL+RISE+3.5,hz,5.0,0.6,5.0);
    M.cyl('steel',hx+3.2,F+WALL+RISE-0.6,hz,0.06,0.06,3.4,4);M.box('steel',hx+3.2,F+WALL+RISE+2.6,hz,1.4,0.05,0.05);   // the weathervane
    // ---- the wings ----
    // a wing from a to b: a gable roof whose near end runs into the head's roof (it starts inside the head, so its ridge
    // meets the cone in a valley and its gable end is under the cone); stone to the ground, timber above, dormers off
    // the head's roof, windows in rows, cross gables (each a short wing off the axis, its ridge lower, meeting the
    // main roof the same way)
    function seg(a,b,w,o){a=P(a);b=P(b);const dx=b[0]-a[0],dz=b[1]-a[1],Ln=Math.hypot(dx,dz),ux=dx/Ln,uz=dz/Ln,nx=-uz,nz=ux,ry=Math.atan2(-dz,dx),cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2;
      const at=(u,v)=>[cx+ux*u+nx*v,cz+uz*u+nz*v];
      let lw=1e9;for(const u of [-Ln/2,0,Ln/2])for(const v of [-w/2,w/2]){const [px,pz]=at(u,v);lw=Math.min(lw,gh(x+px,z+pz)-g0);}
      const f=F+(o.dF||0),up=o.up,rise=o.rise==null?w*0.62:o.rise,ov=o.over==null?0.8:o.over,inHead=(px,pz,m)=>Math.hypot(px-hx,pz-hz)<R+(m||0);
      M.box('andesite',cx,Math.min(lw,f)-1.5,cz,Ln,f-Math.min(lw,f)+1.5+ST,w,ry);M.box('andesiteDark',cx,f+ST-0.35,cz,Ln+0.3,0.35,w+0.3,ry);
      M.box(o.wall||'board',cx,f+ST,cz,Ln,up,w,ry);
      // the roof: hangs over the far end only (the near end is in the head or in another wing's roof)
      {const g=gable(Ln+(o.open?0:ov)+(o.openNear?0:ov),w+2.2,rise),sh=((o.openNear?0:ov)-(o.open?0:ov))/2;M.put(o.roof||'shingle',g,cx-ux*sh,f+ST+up,cz-uz*sh,ry);}
      const nW=Math.max(1,Math.floor(Ln/4.2));
      for(const sd of [-1,1])for(let i=0;i<nW;i++){const u=-Ln/2+(i+0.5)*Ln/nW,[px,pz]=at(u,sd*(w/2+0.04));if(inHead(px,pz,1))continue;
        for(let fl=0;fl<(up>4.5?2:1);fl++){M.box('trim',px,f+ST+0.75+fl*2.9,pz,1.5,1.75,0.08,ry);M.box('glassLit',px+nx*sd*0.03,f+ST+0.85+fl*2.9,pz+nz*sd*0.03,1.2,1.5,0.08,ry);}
        if(i%2===0)M.box('glassLit',px+nx*sd*0.02,Math.max(f,lw)+0.9,pz+nz*sd*0.02,1.1,1.5,0.1,ry);}
      // the dormers, none where the head's roof is over them
      const nD=o.dormers==null?Math.max(1,Math.floor(Ln/9)):o.dormers;
      for(const sd of (o.dormerSides||[-1,1]))for(let i=0;i<nD;i++){const u=-Ln/2+(i+0.5)*Ln/nD,[px,pz]=at(u,sd*w*0.24),y=f+ST+up+rise*0.22;
        if(inHead(px,pz,4)||(o.noDormer&&o.noDormer(u,Ln)))continue;
        M.box('board',px,y,pz,2.6,2.2,2.8,ry);M.put('shingle',gable(3.4,3.2,1.7).rotateY(Math.PI/2),px,y+2.2,pz,ry);
        const [gx,gz]=at(u,sd*(w*0.24+1.42));M.box('glassLit',gx,y+0.5,gz,1.6,1.2,0.06,ry);}
      if(o.chimney){const [px,pz]=at(Ln*o.chimney,0);   // (a fraction of the length from the middle, under a half)
        M.box('andesite',px,f+ST+up-1,pz,1.8,rise+3,1.6,ry);}
      // a point on the axis, t metres from a, and the frame, for the cross gables
      return {pt:t=>[a[0]+ux*t,a[1]+uz*t],n:[nx,nz],f,up,rise,ridge:f+ST+up+rise};}
    const unP=([a,b])=>[a-sx,b-sz];   // back to the surveyed frame, for a cross gable's ends
    function cross(W,t,sd,len,cw,o={}){const p0=W.pt(t),p1=[p0[0]+W.n[0]*sd*len,p0[1]+W.n[1]*sd*len];
      // the cross gable's ridge stays under the wing's, so the two roofs meet in valleys
      const rise=Math.min(cw*0.62,W.rise+(W.up-(o.up==null?W.up:o.up))-0.6);
      return seg(unP(p0),unP(p1),cw,Object.assign({up:W.up,dF:W.f-F,rise,openNear:true,dormers:o.dormers==null?0:o.dormers},o));}
    const Wd=L.wings||{};
    // the west wing of rooms: three storeys by the head, stepping down a metre and a half and a storey's eaves at its
    // outer half, two cross gables (north and south) and a cross gable across its end
    const w1=seg([-4,18.1],[-33,24.8],12.4,{up:6.2,openNear:true,open:true,chimney:0.35});
    const w2=seg([-33,24.8],[-58.5,30.7],12.4,{up:4.8,dF:-1.2,rise:12.4*0.62,openNear:true,open:true});
    cross(w1,22.5,-1,13.5,11,{up:6.2,dormers:1,chimney:0.25});                       // the north cross gable
    cross(w2,2.5,1,12.5,11.5,{up:4.8,dormers:0});                                   // the south one
    {const t=24,p0=w2.pt(t),a=[p0[0]-w2.n[0]*9,p0[1]-w2.n[1]*9],b=[p0[0]+w2.n[0]*9,p0[1]+w2.n[1]*9];seg(unP(a),unP(b),7,{up:4.8,dF:-1.2,rise:w2.rise,dormers:0});}   // the end, its ridge as high as the wing's, which runs into it
    // the Ski Lounge wing to the south-east, from the head to its end over the slope, and the east wing of the
    // Cascade Dining Room off it, as broad and as high in the ridge: the two meet in a valley
    const se=seg([7.5,19.2],[33.6,47.8],14,{up:4.4,openNear:true,rise:8.7,chimney:0.3,dormers:2});
    seg([24.6,28.4],[64.5,12.6],18,{up:4.4,openNear:true,rise:8.7,chimney:0.22,dormers:3,noDormer:(u,Ln)=>u<-Ln/2+9});
    // the hall from the head's east face along to the dining room: lower, its roof under both
    seg([9,11],[24,14.8],10.5,{up:4.4,openNear:true,rise:5.2,dormers:0});
    // the front door on the south: a stone portal under a timber porch roof on log posts, at the head's south corner
    {const pz=hz+R+1.2;M.box('andesite',hx-3.2,F,pz-1,1.2,3.6,2.4);M.box('andesite',hx+3.2,F,pz-1,1.2,3.6,2.4);M.box('andesiteDark',hx,F+3.6,pz-1,7.6,0.9,2.6);
      M.box('timber',hx,F-0.4,pz+2.5,8,0.4,6);for(const sxp of [-3.4,3.4])M.cyl('log',hx+sxp,F,pz+4.8,0.32,0.28,3.4,8);M.put('shingle',gable(8.6,7,2.6).rotateY(Math.PI/2),hx,F+3.4,pz+2.4);}
    return M.finish(L,x,g0,z,0);},

  silcox(L,x,z){const g0=gh(x,z),M=Model(),LEN=L.len==null?19:L.len,D=L.depth==null?9:L.depth,ry=K.turn(L.face==null?0:L.face);
    let lo=1e9,hi=-1e9;for(const u of [-1,1])for(const v of [-1,1]){const c=Math.cos(ry),s=Math.sin(ry),px=u*LEN/2*c+v*D/2*s,pz=-u*LEN/2*s+v*D/2*c,g=gh(x+px,z+pz)-g0;lo=Math.min(lo,g);hi=Math.max(hi,g);}
    M.box('andesite',0,lo-1,0,LEN,hi-lo+1+3.3,D);M.box('board',0,hi+3.3,0,LEN,2.8,D);M.put('shingle',gable(LEN+1.4,D+2,D*0.75),0,hi+6.1,0);
    M.box('andesite',LEN*0.32,hi+2,0,1.8,D*0.75+5.2,1.6);   // the chimney
    // the old bull-wheel room of the Magic Mile on its uphill end, and the windows
    M.box('andesite',-LEN/2-3,lo-1,0,6,hi-lo+1+4.2,7);M.put('shingle',gable(7,8,3).rotateY(Math.PI/2),-LEN/2-3,hi+4.2,0);
    for(const sd of [-1,1])for(let i=0;i<5;i++){const lx=-LEN/2+2+i*(LEN-4)/4;M.box('glassLit',lx,hi+1.0,sd*(D/2+0.03),1.1,1.4,0.06);M.box('trimRed',lx,hi+3.9,sd*(D/2+0.04),1.4,1.6,0.06);M.box('glassLit',lx,hi+4.0,sd*(D/2+0.06),1.1,1.3,0.06);}
    return M.finish(L,x,g0,z,ry);},

  cloudcap(L,x,z){const g0=gh(x,z),M=Model(),LEN=L.len==null?22:L.len,D=L.depth==null?10:L.depth,ry=K.turn(L.face==null?0:L.face),RISE=D*0.62;
    let lo=1e9,hi=-1e9;for(const u of [-1,1])for(const v of [-1,1]){const c=Math.cos(ry),s=Math.sin(ry),g=gh(x+u*LEN/2*c+v*D/2*s,z-u*LEN/2*s+v*D/2*c)-g0;lo=Math.min(lo,g);hi=Math.max(hi,g);}
    // the walls: hewn logs, every course its own shade, on a footing of rubble stone
    M.box('andesite',0,lo-1,0,LEN+0.6,hi-lo+1.6,D+0.6);const WH=5.6,CO=16;
    for(let i=0;i<CO;i++){const y=hi+0.6+i*WH/CO,k=hash3(i,1,31)<0.5?'log':'logDark';M.box(k,0,y,0,LEN+0.5*(i%2),WH/CO,D+0.5*((i+1)%2));}
    M.put('shake',gable(LEN+1.6,D+2.2,RISE),0,hi+0.6+WH,0);
    // the wing at the west end, one storey of logs
    M.box('logDark',-LEN/2-4,lo-0.5,1.5,8,hi-lo+0.5+3.4,7);M.put('shake',gable(7.8,9,3.4).rotateY(Math.PI/2),-LEN/2-4,hi+3.4,1.5);
    M.box('andesite',LEN*0.3,hi,0,1.8,WH+RISE+1.5,1.6);   // the stone chimney
    for(const sd of [-1,1])for(let i=0;i<6;i++){const lx=-LEN/2+2+i*(LEN-4)/5;for(let f=0;f<2;f++){M.box('trim',lx,hi+1.4+f*2.7,sd*(D/2+0.12),1.2,1.5,0.08);M.box('glassLit',lx,hi+1.5+f*2.7,sd*(D/2+0.16),0.95,1.3,0.08);}}
    // the cables: steel over the ridge, from an anchor in the rock on one side to one on the other
    for(let i=0;i<4;i++){const lx=-LEN/2+2.5+i*(LEN-5)/3,top=hi+0.6+WH+RISE+0.08,ey=hi+0.6+WH,eave=D/2+1.1;
      for(const sd of [-1,1]){const gx=sd*(D/2+7);const gy=lo-0.4;
        // ridge to eave along the roof, eave down to the anchor
        const s1=Math.hypot(eave,top-ey);M.put('steel',new THREE.BoxGeometry(0.07,0.07,s1),lx,(top+ey)/2+0.06,sd*eave/2,0,sd*Math.atan2(top-ey,eave),0);
        const s2=Math.hypot(gx-sd*eave,ey-gy);M.put('steel',new THREE.BoxGeometry(0.07,0.07,s2),lx,(ey+gy)/2,(gx+sd*eave)/2,0,sd*Math.atan2(ey-gy,Math.abs(gx)-eave),0);
        M.box('concrete',lx,gy-0.2,gx,0.6,0.6,0.6);}}
    return M.finish(L,x,g0,z,ry);},

  aframe(L,x,z){const g0=gh(x,z),M=Model(),LEN=L.len==null?13:L.len,W=L.w==null?8:L.w,H=L.h==null?8.5:L.h,ry=K.turn(L.face==null?0:L.face);
    let lo=1e9,hi=-1e9;for(const u of [-1,1])for(const v of [-1,1]){const g=gh(x+u*LEN/2*Math.cos(ry)+v*W/2*Math.sin(ry),z-u*LEN/2*Math.sin(ry)+v*W/2*Math.cos(ry))-g0;lo=Math.min(lo,g);hi=Math.max(hi,g);}
    M.box('andesite',0,lo-0.5,0,LEN,hi-lo+1.3,W);M.put('shake',gable(LEN,W+0.6,H),0,hi+0.8,0);
    // the glazed gable ends, a timber frame, a deck on the downhill end
    for(const sd of [-1,1]){const s=new THREE.Shape();s.moveTo(-W/2+0.6,0);s.lineTo(W/2-0.6,0);s.lineTo(0,H-1.2);s.lineTo(-W/2+0.6,0);
      M.put(sd>0?'glassLit':'board',new THREE.ShapeGeometry(s).rotateY(Math.PI/2*sd),sd*(LEN/2+0.05),hi+0.8,0);}
    M.box('timber',LEN/2+1.6,hi+0.2,0,3,0.3,W-1);M.box('andesite',-LEN*0.25,hi+0.8,W*0.15,1.2,H+0.6,1.2);
    return M.finish(L,x,g0,z,ry);},

  footlodge(L,x,z){const ring=outline(L.osm||L.name,x,z);if(!ring)return null;const g0=gh(x,z),M=Model();
    let cx=0,cz=0;for(const [px,pz] of ring){cx+=px;cz+=pz;}cx/=ring.length;cz/=ring.length;
    let lo=1e9,hi=-1e9;for(const [px,pz] of ring){const g=gh(px,pz)-g0;lo=Math.min(lo,g);hi=Math.max(hi,g);}
    const loc=ring.map(([px,pz])=>[px-x,pz-z]),ST=L.stone==null?2.2:L.stone,WH=L.wall==null?7.5:L.wall,RISE=L.rise==null?6:L.rise,EAVE=L.eave==null?1.4:L.eave;
    const prism=(pts,y0,h,k)=>{const s=new THREE.Shape(pts.map(([a,b])=>new THREE.Vector2(a,-b)));M.put(k,new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false}).rotateX(-Math.PI/2),0,y0,0);};
    prism(loc,lo-1.5,hi-lo+1.5+ST,'andesite');prism(loc,hi+ST,WH,'board');
    // the roof: the outline pushed out to the eaves, raised and drawn in toward its middle
    {const lcx=cx-x,lcz=cz-z,out=loc.map(([a,b])=>{const dx=a-lcx,dz=b-lcz,d=Math.hypot(dx,dz)||1;return [a+dx/d*EAVE,b+dz/d*EAVE];}),top=loc.map(([a,b])=>[lcx+(a-lcx)*0.18,lcz+(b-lcz)*0.18]);
      const y0=hi+ST+WH,pos=[],n=out.length;for(let i=0;i<n;i++){const j=(i+1)%n,A=out[i],B=out[j],Cc=top[j],D=top[i];
        pos.push(A[0],y0,A[1],Cc[0],y0+RISE,Cc[1],B[0],y0,B[1],A[0],y0,A[1],D[0],y0+RISE,D[1],Cc[0],y0+RISE,Cc[1]);}
      const tri=THREE.ShapeUtils.triangulateShape(top.map(([a,b])=>new THREE.Vector2(a,b)),[]);for(const [a,b,c] of tri)for(const k of [a,c,b])pos.push(top[k][0],y0+RISE,top[k][1]);
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
      // a ring that winds the other way makes the faces point in; flip it so the roof faces out and up
      let up=0;const nm=g.attributes.normal;for(let i=0;i<nm.count;i++)up+=nm.getY(i);if(up<0){const p=g.attributes.position;for(let i=0;i<p.count;i+=3){const t=[p.getX(i+1),p.getY(i+1),p.getZ(i+1)];p.setXYZ(i+1,p.getX(i+2),p.getY(i+2),p.getZ(i+2));p.setXYZ(i+2,...t);}g.computeVertexNormals();}
      M.put('shingleDark',g,0,0,0);}
    // the glass of the big rooms along each side long enough to have them
    for(let i=0;i<loc.length;i++){const a=loc[i],b=loc[(i+1)%loc.length],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<6)continue;
      const ry=Math.atan2(-dz,dx),n=Math.floor(len/3.5);for(let k=0;k<n;k++){const f=(k+0.5)/n;M.box('glassLit',a[0]+dx*f,hi+ST+1.2,a[1]+dz*f,2.2,WH*0.55,0.5,ry);}}
    return M.finish(L,x,g0,z,0);},

  // a lodge as blocks on its OpenStreetMap outline (L.blocks: [[ax,az],[bx,bz],w,{...}] in metres from the outline's
  // middle): each a stone footing to the ground, walls of timber, a gable roof (steep as an A-frame when o.aframe),
  // windows in rows that light at night, glass in a gable end (o.glassEnd: 1 at b, -1 at a), a deck (o.deck: the
  // side, 1 or -1). The blocks cross one another as the outline's parts do; their roofs meet where they cross.
  lodge(L,x,z){const ring=outline(L.osm===undefined?L.name:L.osm,x,z);if(!ring)return null;const g0=gh(x,z),M=Model();
    let cx=0,cz=0;for(const [px,pz] of ring){cx+=px;cz+=pz;}cx=cx/ring.length-x;cz=cz/ring.length-z;
    let hi=-1e9;for(const [px,pz] of ring)hi=Math.max(hi,gh(px,pz)-g0);const F0=hi+0.3;
    for(const [A,B,w,o0] of L.blocks||[]){const o=o0||{},a=[A[0]+cx,A[1]+cz],b=[B[0]+cx,B[1]+cz],dx=b[0]-a[0],dz=b[1]-a[1],Ln=Math.hypot(dx,dz),ux=dx/Ln,uz=dz/Ln,nx=-uz,nz=ux,ry=Math.atan2(-dz,dx),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
      const at=(u,v)=>[mx+ux*u+nx*v,mz+uz*u+nz*v];let lw=1e9;for(const u of [-Ln/2,0,Ln/2])for(const v of [-w/2,w/2]){const [px,pz]=at(u,v);lw=Math.min(lw,gh(x+px,z+pz)-g0);}
      const F=F0+(o.dF||0),ST=o.stone==null?1.2:o.stone,UP=o.up==null?(o.aframe?1.6:5.6):o.up,RISE=o.rise==null?w*(o.aframe?1.15:0.5):o.rise,EV=o.eave==null?1.2:o.eave,lo=Math.min(lw,F);
      M.box('andesite',mx,lo-1.2,mz,Ln,F-lo+1.2+ST,w,ry);M.box(o.wall||'timber',mx,F+ST,mz,Ln,UP,w,ry);
      M.put(o.roof||'shingleDark',gable(Ln+EV*2,w+EV*2+(o.aframe?1.2:0),RISE+(o.aframe?0.6:0)),mx,F+ST+UP-(o.aframe?0.6:0),mz,ry);
      // the gable ends' triangles, in timber or glass
      for(const sd of [-1,1]){const tri=new THREE.Shape();tri.moveTo(-w/2,0);tri.lineTo(w/2,0);tri.lineTo(0,RISE*0.96);tri.lineTo(-w/2,0);
        const glassy=o.glassEnd===sd||o.glassEnd===2;const [ex,ez]=at(sd*(Ln/2+0.02),0);M.put(glassy?'glassLit':(o.wall||'timber'),new THREE.ShapeGeometry(tri).rotateY(Math.PI/2*sd),ex,F+ST+UP,ez,ry);
        if(glassy)M.box('glassLit',...at(sd*(Ln/2+0.03),0).flatMap((v,i)=>i?[F+ST+0.4,v]:[v]),0.08,UP-0.6,w-1.4,ry);
        if(glassy)for(let k=-2;k<=2;k++){const [qx,qz]=at(sd*(Ln/2+0.1),k*w/6);M.box('timber',qx,F+ST+UP,qz,0.2,RISE*(1-Math.abs(k)/3)*0.95,0.2,ry);}}
      // windows: tall in the big rooms, in rows along both sides; a band of glass on the deck side
      const nW=Math.max(1,Math.floor(Ln/(o.bay||3.6)));
      for(const sd of [-1,1])for(let i=0;i<nW;i++){const u=-Ln/2+(i+0.5)*Ln/nW,[px,pz]=at(u,sd*(w/2+0.04)),big=o.deck===sd;
        M.box('trim',px,F+ST+0.6,pz,big?2.9:1.6,big?Math.min(UP-1,3.6)+0.2:1.9,0.08,ry);M.box('glassLit',px+nx*sd*0.03,F+ST+0.7,pz+nz*sd*0.03,big?2.6:1.3,big?Math.min(UP-1,3.6):1.6,0.08,ry);
        if(!o.aframe&&UP>5)M.box('glassLit',px+nx*sd*0.03,F+ST+3.4,pz+nz*sd*0.03,1.3,1.4,0.08,ry);}
      if(o.deck){const sd=o.deck,[px,pz]=at(0,sd*(w/2+2.6));M.box('timber',px,F+ST-0.3,pz,Ln-1,0.3,5,ry);
        for(let i=0;i<=Math.floor(Ln/4);i++){const [qx,qz]=at(-Ln/2+0.5+i*(Ln-1)/Math.floor(Ln/4),sd*(w/2+5));M.box('timber',qx,F+ST-0.3,qz,0.15,1.1,0.15,ry);
          const [rx,rz]=at(-Ln/2+0.5+i*(Ln-1)/Math.floor(Ln/4),sd*(w/2+4.9));const gy=gh(x+rx,z+rz)-g0;if(F+ST-0.3-gy>0.4)M.box('timber',rx,gy-0.3,rz,0.3,F+ST-gy,0.3,ry);}
        const [hx2,hz2]=at(0,sd*(w/2+5.05));M.box('timber',hx2,F+ST+0.75,hz2,Ln-1,0.12,0.12,ry);}
      if(o.chimney!=null){const [px,pz]=at(Ln*o.chimney,o.aframe?0:w*0.2);M.box('andesite',px,F+ST,pz,1.7,UP+RISE+1.6,1.5,ry);}
      // a cupola on the ridge (Skibowl West's, the old lodge's)
      if(o.cupola!=null){const [px,pz]=at(Ln*o.cupola,0),y=F+ST+UP+RISE-0.6;M.box('timber',px,y,pz,2.4,2.2,2.4,ry);M.box('glassLit',px,y+0.6,pz,2.5,1.0,2.5,ry);M.put(o.roof||'shingleDark',new THREE.ConeGeometry(2.3,2,4).translate(0,1,0),px,y+2.2,pz,ry+Math.PI/4);}}
    return M.finish(L,x,g0,z,0);},

  shelter(L,x,z){const g0=gh(x,z),M=Model(),ry=K.turn(L.face==null?0:L.face),S=L.size==null?5:L.size;
    if(L.round){M.cyl('andesite',0,-0.6,0,S/2,S/2,2.8,12);M.put('andesiteDark',new THREE.ConeGeometry(S/2+0.4,2.2,12).translate(0,1.1,0),0,2.2,0);M.box('glass',0,0.2,S/2-0.1,0.9,1.8,0.4);}
    else{M.box('andesite',0,-0.6,0,S,2.8,S*0.8);M.put(L.roof===false?'andesiteDark':'shake',gable(S+0.6,S*0.8+1,1.9),0,2.2,0);M.box('glass',0,0.2,S*0.4,0.9,1.8,0.2);}
    // the cairns of loose stone round it
    for(let i=0;i<5;i++){const a=hash3(i,2,41)*6.28,r=S*0.9+hash3(i,3,41)*3;M.put('andesiteDark',new THREE.DodecahedronGeometry(0.5+hash3(i,4,41)*0.6,0),Math.cos(a)*r,gh(x+Math.cos(a)*r,z+Math.sin(a)*r)-g0,Math.sin(a)*r);}
    return M.finish(L,x,g0,z,ry);},
  };
}
