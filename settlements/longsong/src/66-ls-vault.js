// ================================================================= LONGSONG — the forbidden depths: the Vault and the Procrastinator
// [draw] Under the rock (BLUEPRINT.md, LV; LORE.md 6.15). One stair goes down, from the Red Palace through the Warden's
// gate; the open vault's relics stand on their shelves under their cards, the closed vault's eight doors are sealed, the
// three quiet cells keep the time relics, the Sealed Library has one desk. Far under them, down the Long Stair, the
// Procrastinator turns in its drum-shaped hall: a prayer wheel the size of a tower, its glyphs burning, and round the
// hall's wall the eight seals in which the Order's worst things stand slowed to a ten-thousandth of our time. Only the
// eldest keepers know the full extent of what it holds back.
//
// The depths are lit by their own lamps alone: every surface here takes a shader that knows only the Vault's lights
// (the butter lamps, the generator's bulbs, the wheel's glyphs), never the sun over the rock. The ground layer can be
// hidden to see the rooms in place under it ('the ground (see the Vault)').
const VLIGHTS=[];   // {p:[x,y,z], c:[r,g,b], r: range}
// THE LIGHTS OF THE DEPTHS: every lamp is a texel pair in one float texture (position and range; colour), uLN of them;
// a fragment loops over the uLN, skipping those out of range. VNL is only the loop's ceiling (GLSL wants a constant):
// a lamp past it is not dropped quietly, the page's check fails (VCHK.lit). 2026-10-19: they were 64 uniform slots,
// and a lamp past 64 vanished.
const VNL=256,VLT=new Float32Array(VNL*2*4),VLTEX=new THREE.DataTexture(VLT,VNL*2,1,THREE.RGBAFormat,THREE.FloatType);
VLTEX.magFilter=VLTEX.minFilter=THREE.NearestFilter;VLTEX.generateMipmaps=false;
const VU={uT:{value:0},uLights:{value:VLTEX},uLN:{value:0},uAmb:{value:new THREE.Color(0x0b0a0d)},uPulse:{value:1}};
function vaultMat(fam,o){o=o||{};const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib')?KMAT.packed('longsong',fam||'vault'):null,T=L?KMAT.textures(L,{aniso:4}):{};
 return new THREE.ShaderMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:!!o.alpha,depthWrite:!o.alpha,
  uniforms:Object.assign({uMap:{value:T.map||null},uHasMap:{value:T.map?1:0},uSpec:{value:o.spec||0},uAlpha:{value:o.alpha||1},uEmis:{value:o.emis||0}},VU),
  vertexShader:'varying vec3 vWP;varying vec3 vN;varying vec3 vC;varying vec2 vUv;void main(){vC=color;vUv=uv;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*wp;}',
  fragmentShader:'uniform sampler2D uMap;uniform float uHasMap,uSpec,uAlpha,uEmis,uPulse;uniform sampler2D uLights;uniform int uLN;uniform vec3 uAmb;varying vec3 vWP;varying vec3 vN;varying vec3 vC;varying vec2 vUv;'+
   'void main(){vec3 base=vC;if(uHasMap>0.5)base*=pow(texture2D(uMap,vUv).rgb,vec3(2.2))*1.45;vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;vec3 V=normalize(cameraPosition-vWP);vec3 L=uAmb;vec3 S=vec3(0.0);'+
   'for(int i=0;i<'+VNL+';i++){if(i>=uLN)break;vec4 lp=texture2D(uLights,vec2((float(i*2)+0.5)/'+(VNL*2)+'.0,0.5));vec3 lc=texture2D(uLights,vec2((float(i*2)+1.5)/'+(VNL*2)+'.0,0.5)).rgb;'+
   ' vec3 d=lp.xyz-vWP;float r=length(d);if(r>lp.w)continue;vec3 l=d/r;float att=pow(1.0-r/lp.w,2.0);L+=lc*(max(dot(n,l),0.0)*0.85+0.15)*att;'+
   ' S+=lc*pow(max(dot(n,normalize(l+V)),0.0),40.0)*att*uSpec;}'+
   'vec3 col=base*L+S+base*uEmis*uPulse;gl_FragColor=vec4(pow(col,vec3(1.0/2.2)),uAlpha);}'});}
// the vault's materials go into the kit's accumulators under keys of their own (62: 'v-*' meshes carry userData.vault)
Object.assign(ARCH.MATS,{'v-stone':()=>vaultMat('vault'),'v-paving':()=>vaultMat('paving'),'v-wood':()=>vaultMat('wood',{spec:.2}),'v-bronze':()=>vaultMat(null,{spec:.9}),
 'v-gilt':()=>vaultMat('gilt',{spec:1.2}),'v-dark':()=>vaultMat(null),'v-cloth':()=>vaultMat(null,{side:THREE.DoubleSide}),'v-lead':()=>vaultMat('lead',{spec:.4}),'v-mandala':()=>vaultMat('mandala',{spec:.5}),
 'v-shade':()=>vaultMat(null,{spec:.1})});
const vlight=(x,y,z,hex,k,r)=>{const c=new THREE.Color(hex).convertSRGBToLinear();VLIGHTS.push({p:[x,y,z],c:[c.r*k,c.g*k,c.b*k],r});};
// a room: its floor, walls and ceiling facing in; beams under the ceiling; o.cls the finish
const VAULT_ROOMS=[];
function vRoom(R){const x0=R.x0,x1=R.x1,z0=R.z0,z1=R.z1,y0=R.y0,y1=R.y0+R.h,W=0x8a8478,F=0x6e6a62;
 ARCH.quad('v-paving',[x0,y0,z1],[x1,y0,z1],[x1,y0,z0],[x0,y0,z0],F);
 ARCH.quad('v-stone',[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],0x5a564e);
 // the four walls, each with its doorways cut (LS.VAULT_DOORS: a doorway in a wall this room shares), a lacquered frame
 const doorsOn=(axis,at)=>LS.VAULT_DOORS.filter(D=>(D.a===R.id||D.b===R.id)&&D.axis===axis&&Math.abs(D.at-at)<.01);
 const side=(ax,az,bx,bz,axis,at)=>{const L=Math.hypot(bx-ax,bz-az),tx=(bx-ax)/L,tz=(bz-az)/L,P=(s,y)=>[ax+tx*s,y,az+tz*s];
  const D=doorsOn(axis,at).map(d=>{const u0=axis==='z'?(d.s0-ax)*tx:(d.s0-az)*tz,u1=axis==='z'?(d.s1-ax)*tx:(d.s1-az)*tz;return [Math.min(u0,u1),Math.max(u0,u1),d.y0+d.h];}).sort((p,q)=>p[0]-q[0]);
  let s0=0;for(const [u0,u1,yt] of D){if(u0>s0)ARCH.quad('v-stone',P(s0,y0),P(u0,y0),P(u0,y1),P(s0,y1),W);ARCH.quad('v-stone',P(u0,yt),P(u1,yt),P(u1,y1),P(u0,y1),W);
   const fx=(u)=>P(u,y0);for(const u of [u0,u1]){const q=fx(u);ARCH.box('v-wood',q[0],y0,q[2],axis==='z'?.22:.5,yt-y0,axis==='z'?.5:.22,{col:0x4a2418});}
   const m=P((u0+u1)/2,yt);ARCH.box('v-wood',m[0],yt,m[2],axis==='z'?u1-u0+.44:.5,.24,axis==='z'?.5:u1-u0+.44,{col:0x3a1e14});s0=u1;}
  if(s0<L)ARCH.quad('v-stone',P(s0,y0),P(L,y0),P(L,y1),P(s0,y1),W);};
 side(x0,z0,x1,z0,'z',z0);side(x1,z1,x0,z1,'z',z1);side(x0,z1,x0,z0,'x',x0);side(x1,z0,x1,z1,'x',x1);
 if(!R.shaft&&R.h<12){const lx=x1-x0>z1-z0;for(let s=(lx?x0:z0)+3;s<(lx?x1:z1)-1;s+=3.4){if(lx)ARCH.box('v-wood',s,y1-.45,(z0+z1)/2,.4,.45,z1-z0-.1,{col:0x4a2418,top:false,bottom:true});
   else ARCH.box('v-wood',(x0+x1)/2,y1-.45,s,x1-x0-.1,.45,.4,{col:0x4a2418,top:false,bottom:true});}}
 VAULT_ROOMS.push(R);
 REGISTER({name:R.name,cls:'part',kind:'room',key:'longsong_vault_'+R.id,x:(x0+x1)/2,z:(z0+z1)/2,y:y0,r:Math.hypot(x1-x0,z1-z0)/2,h:R.h,tags:{culture:'order',setting:'room'},note:'the Vault (forbidden): under the rock'});}
// a butter lamp on a ledge: a gilt bowl, a flame, a warm light
function vLamp(x,y,z,k){ARCH.cyl('v-gilt',x,y,z,.12,.2,.14,{seg:8,col:0xd8b048});ARCH.cyl('glow',x,y+.14,z,.05,.0,.18,{seg:5,col:0xffd890});vlight(x,y+.4,z,0xffb860,k==null?1.2:k,11);}
// a seal strip across a door (the paper talisman, glowing faintly in the dark)
function vSeal(x,y,z,nx,nz,label){lsDecal(SIGNS.SEAL,x+nx*.04,y,z+nz*.04,.42,1.7,nx,nz,{label:label||'A seal strip of the Order',basic:true});}

(function(){
 LS.VAULT.forEach(vRoom);
 // a lamp in each of the two passages (they have no furniture of their own)
 for(const id of ['unmaking-passage','stair-foot']){const R=LS.VAULT.find(r=>r.id===id);vLamp(R.x0+.35,R.y0+2.1,(R.z0+R.z1)/2,.9);}
 // ---------------------------------------------------------------- the Deep Stair: a straight stair down the shaft, one lamp at each landing
 {const R=LS.VAULT[0],n=Math.floor(R.h/.2),zL=R.z1-R.z0;for(let k=0;k<n;k++){const y=R.y0+R.h-(k+1)*.2,f=(k*.32)%(zL-2),z=R.z1-1-f;ARCH.box('v-stone',(R.x0+R.x1)/2,y-.2,z,R.x1-R.x0-.2,.22,.34,{col:0x7a766c});}
  for(let y=R.y0+2;y<R.y0+R.h;y+=9)vLamp(R.x0+.4,y,(R.z0+R.z1)/2,.9);}
 // ---------------------------------------------------------------- the Warden's gate: the register on its desk, the gate of bars, the seals
 {const R=LS.VAULT[1],y=R.y0,cx=(R.x0+R.x1)/2,cz=(R.z0+R.z1)/2;
  ARCH.box('v-wood',cx,y,cz+3,5,1,1.6,{col:0x5a2a1a});ARCH.box('v-cloth',cx,y+1,cz+3,1.6,.12,1.1,{col:0xe8dcc0});   // the register, open
  for(let x=R.x0+1;x<R.x1-1;x+=.5)ARCH.box('v-bronze',x,y,R.z0+.6,.08,R.h-.2,.08,{col:0x6a5a40});
  lsDecal(SIGNS.sign('The Warden\'s gate','Write your name, the hour, and what you carry down. Write it again when you come up.'),cx-4.5,y+2.4,R.z1-.06,3,1.5,0,-1,{label:'The Warden\'s gate\'s board',basic:true});
  vLamp(cx-1.8,y+1,cz+3);vLamp(R.x1-.5,y+2.2,cz);vlight(cx,y+5.5,cz,0xfff0d0,1.4,16);}
 // ---------------------------------------------------------------- the open vault: shelves along both walls, each relic under its card
 {const R=LS.VAULT[2],y=R.y0;
  for(const zw of [R.z0+.9,R.z1-.9])for(let x=R.x0+2;x<R.x1-2;x+=3.4){
   ARCH.box('v-wood',x,y,zw,3.1,.12,1.3,{col:0x4a2418});for(let s=1;s<4;s++)ARCH.box('v-wood',x,y+s*1.4,zw,3.1,.08,1.3,{col:0x5a2a1a});
   for(const e of [-1.5,1.5])ARCH.box('v-wood',x+e,y,zw,.1,4.4,1.3,{col:0x3a1c12});
   for(let s=0;s<3;s++){const S=KRAND.stream(KRAND.hash(131,Math.round(x),s,Math.round(zw)));const kind=S.int(0,4),px=x+S.range(-.9,.9),py=y+s*1.4+.1;
    if(kind===0)ARCH.box('v-lead',px,py,zw,.6,.5,.5,{col:0x6a6a70});
    else if(kind===1){ARCH.cyl('v-bronze',px,py,zw,.22,.16,.6,{seg:10,col:0x8a6a3a});}
    else if(kind===2){ARCH.dome('v-gilt',px,py,zw,.28,{seg:10,rows:4,col:0xc8a050});}
    else if(kind===3){ARCH.box('v-wood',px,py,zw,.5,.7,.35,{col:0x6a3a20});ARCH.cyl('glow',px,py+.35,zw-.18,.12,.12,.01,{seg:10,col:0x9ab0c0});}
    else ARCH.box('v-cloth',px,py,zw,.7,.12,.45,{col:0xc0a878});
    // the card under it (the register's number)
    ARCH.quad('v-cloth',[px-.14,py+.02,zw-(zw<0?-1:1)*.66],[px+.14,py+.02,zw-(zw<0?-1:1)*.66],[px+.14,py+.12,zw-(zw<0?-1:1)*.66],[px-.14,py+.12,zw-(zw<0?-1:1)*.66],0xefe6cf);}}
  for(let x=R.x0+6;x<R.x1-4;x+=12)vlight(x,y+R.h-1,(R.z0+R.z1)/2,0xfff0d8,1.5,15);   // the generator's bulbs
  for(let x=R.x0+6;x<R.x1-4;x+=12)ARCH.cyl('glow',x,y+R.h-1.2,(R.z0+R.z1)/2,.12,.12,.3,{seg:8,col:0xfff0c8});
  lsDecal(SIGNS.sign('The open vault','What is on the register is on these shelves. What is not on the register is not here.'),R.x1-.06,y+2.6,(R.z0+R.z1)/2+6,3.2,1.6,-1,0,{label:'The open vault\'s board',basic:true});
  // the relics named in the register: a card each (the inspector reads them)
  LS.RELICS.forEach((t,i)=>REGISTER({name:t,cls:'prop',kind:'relic',key:'longsong_relic_'+i,x:R.x0+4+i*(R.x1-R.x0-8)/LS.RELICS.length,z:i%2?R.z1-1:R.z0+1,y:R.y0,r:1.6,h:4,tags:{culture:'order'},note:'on the open vault\'s shelves, under its card'}));}
 // ---------------------------------------------------------------- the closed vault: eight lead doors, sealed
 {const R=LS.VAULT[3],y=R.y0;for(let i=0;i<8;i++){const x=R.x0+5+(i>>1)*(R.x1-R.x0-10)/3,zw=i%2?R.z1:R.z0,nz=i%2?-1:1;
   ARCH.box('v-lead',x,y,zw+nz*.15,2.2,3.6,.3,{col:0x5a5a62});ARCH.box('v-bronze',x,y+3.6,zw+nz*.2,2.8,.4,.4,{col:0x7a6a4a});
   vSeal(x-.6,y+1.8,zw+nz*.32,0,nz);vSeal(x+.6,y+1.8,zw+nz*.32,0,nz);
   ARCH.cyl('v-bronze',x+1.6,y+2.8,zw+nz*.4,.18,.08,.3,{seg:8,col:0x9a7a40});}   // the bell at the door
  for(let x=R.x0+6;x<R.x1-2;x+=14)vLamp(x,y+.1,(R.z0+R.z1)/2,1.1);}
 // ---------------------------------------------------------------- the quiet cells: three, lead-lined, a bell at each door, no clocks in the passage
 {const R=LS.VAULT[4],y=R.y0;for(let i=0;i<3;i++){const z=R.z0+6+i*(R.z1-R.z0-8)/2;ARCH.box('v-lead',R.x0+.3,y,z,.4,3.4,2.2,{col:0x60606a});
   ARCH.cyl('v-bronze',R.x0+.6,y+3.1,z+1.4,.16,.08,.26,{seg:8,col:0x9a7a40});vSeal(R.x0+.52,y+1.7,z,1,0,'A seal on a quiet cell (a time relic inside: do not knock)');}
  vLamp(R.x1-.6,y+1.2,(R.z0+R.z1)/2,.7);}
 // ---------------------------------------------------------------- the Unmaking Room: a black circle in the floor, the chains, nothing else
 {const R=LS.VAULT[5],y=R.y0,cx=(R.x0+R.x1)/2,cz=(R.z0+R.z1)/2;ARCH.cyl('v-dark',cx,y+.02,cz,3.2,3.2,.01,{seg:36,col:0x020204});
  ARCH.ring('v-bronze',cx,y,cz,3.2,.12,.1,{seg:36,col:0x6a5a40});for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;ARCH.box('v-bronze',cx+Math.cos(a)*4.6,y,cz+Math.sin(a)*4.6,.25,.6,.25,{col:0x5a4a30});}
  vLamp(R.x0+.6,y+1.5,cz,.5);}
 // ---------------------------------------------------------------- the Oath Room and the Sealed Library: a lectern, the stacks, one desk
 {const R=LS.VAULT[6],y=R.y0,cx=(R.x0+R.x1)/2,cz=(R.z0+R.z1)/2;ARCH.box('v-wood',cx,y,cz,1.1,1.3,.8,{col:0x5a2a1a});ARCH.box('v-cloth',cx,y+1.3,cz,.9,.06,.6,{col:0xe8dcc0});
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ARCH.cyl('v-cloth',cx+Math.cos(a)*3.2,y,cz+Math.sin(a)*3.2,.45,.45,.16,{seg:10,col:0xb07a20});}
  vLamp(cx+.6,y+1.3,cz,1.2);vLamp(R.x0+.5,y+1.6,cz,.8);}
 {const R=LS.VAULT[7],y=R.y0;for(let x=R.x0+2.5;x<R.x1-6;x+=3.2)for(const zr of [R.z0+2,R.z0+8,R.z0+14]){ARCH.box('v-wood',x,y,zr,2.6,5.6,.7,{col:0x3a1c12});
   for(let s=0;s<5;s++)for(let b=0;b<7;b++){const S=KRAND.unit(KRAND.hash(151,Math.round(x*10),zr,s*8+b));ARCH.box('v-cloth',x-1.15+b*.36,y+.2+s*1.1,zr-.38,.3,.75+S*.2,.04,{col:[0x5a2a1a,0x2a3a5a,0x6a5a3a,0x3a4a2a][Math.floor(S*4)]});}}
  const dx=R.x1-3.4,dz=R.z1-5;ARCH.box('v-wood',dx,y,dz,2.2,.85,1.2,{col:0x5a2a1a});ARCH.box('v-cloth',dx,y+.85,dz,.8,.04,.6,{col:0xe8dcc0});ARCH.box('v-wood',dx,y,dz+1.3,.6,.5,.6,{col:0x4a2418});
  vLamp(dx+.7,y+.85,dz-.3,1.4);vlight((R.x0+R.x1)/2,y+R.h-1,(R.z0+R.z1)/2,0xc0c8d8,.5,18);
  vSeal(R.x0+.08,y+1.7,dz,1,0,'The Sealed Library\'s seal (the quarantine of knowledge: one reading room, one desk)');}
 // ---------------------------------------------------------------- the Long Stair down to the Procrastinator: a spiral round a newel
 {const R=LS.VAULT[8],cx=(R.x0+R.x1)/2,cz=(R.z0+R.z1)/2,n=Math.floor(R.h/.22);
  ARCH.cyl('v-stone',cx,R.y0,cz,.7,.7,R.h,{seg:12,col:0x7a766c});
  for(let k=0;k<n;k++){const a=k*.38,y=R.y0+R.h-(k+1)*.22;ARCH.box('v-stone',cx+Math.cos(a)*3.6,y,cz+Math.sin(a)*3.6,5.2,.22,1.2,{col:0x8a8478,ry:-a});}
  for(let y=R.y0+4;y<R.y0+R.h;y+=11)vLamp(R.x0+.4,y,cz,.7);}
 _mark('vault-rooms');})();

// ---------------------------------------------------------------- THE PROCRASTINATOR
const PROC=(function(){const P=LS.PROCRASTINATOR,y0=P.y0,R=P.hallR,H=P.hallH,cx=P.x,cz=P.z,N=8;
 // the hall: a drum cut in the rock, a ribbed dome over it, a gallery round it halfway up, the floor's mandala
 const nicheW=7.6,nicheA=k=>(k+.5)/N*Math.PI*2-Math.PI/2;
 for(let i=0;i<64;i++){const a=i/64*Math.PI*2,b=(i+1)/64*Math.PI*2;
  // leave the niches' mouths open
  const inNiche=k=>{let d=Math.abs(((a+b)/2-nicheA(k)+Math.PI*3)%(Math.PI*2)-Math.PI);return d<nicheW/2/R;};
  let open=false;for(let k=0;k<N;k++)if(inNiche(k))open=true;
  const P0=[cx+Math.cos(a)*R,cz+Math.sin(a)*R],P1=[cx+Math.cos(b)*R,cz+Math.sin(b)*R];
  // (the north door from the Long Stair's foot: open below its lintel)
  const door=Math.abs(((a+b)/2+Math.PI/2+Math.PI*3)%(Math.PI*2)-Math.PI)<1.9/R;
  ARCH.quad('v-stone',[P1[0],open?y0+11:door?y0+4.6:y0,P1[1]],[P0[0],open?y0+11:door?y0+4.6:y0,P0[1]],[P0[0],y0+H,P0[1]],[P1[0],y0+H,P1[1]],0x7a7468);
  ARCH.quad('v-paving',[cx,y0,cz],[P0[0],y0,P0[1]],[P1[0],y0,P1[1]],[cx,y0,cz],0x5a564e);}
 ARCH.dome('v-stone',cx,y0+H,cz,R,{seg:64,rows:10,col:0x625e56,k:.42});   // the vault's materials are two-sided: seen from inside
 for(let i=0;i<16;i++){if(i===12)continue;const a=i/16*Math.PI*2;ARCH.box('v-stone',cx+Math.cos(a)*(R-.6),y0,cz+Math.sin(a)*(R-.6),1.2,H,1.2,{col:0x8a8478,ry:-a});}
 // the way in: the Long Stair comes down north of the hall; its door in the north wall, a bronze frame, two seals
 {const zd=cz-R+.12;
  for(const s of [-1,1])ARCH.box('v-bronze',cx+s*1.95,y0,zd+.15,.5,5,.4,{col:0x6a5232});ARCH.box('v-bronze',cx,y0+4.6,zd+.15,4.4,.5,.4,{col:0x6a5232});
  vSeal(cx-2.6,y0+2.2,zd+.2,0,1,'The seal on the hall\'s door (renewed at every bell)');vSeal(cx+2.6,y0+2.2,zd+.2,0,1,'The seal on the hall\'s door (renewed at every bell)');}
 ARCH.ring('v-stone',cx,y0+H*.55,cz,R-3.6,3.4,.5,{seg:64,col:0x6a665e,inside:false});
 // the floor's mandala: concentric rings of inlaid bronze and the Order's blue, eight spokes to the seals
 // (the library's inlaid mandala when packed, delivered 2026-10-19: one picture over the floor, its rim at the seals)
 if(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed('longsong','mandala')){const Rm=R-1.5,NM=64;
  for(let i=0;i<NM;i++){const a=i/NM*Math.PI*2,b=(i+1)/NM*Math.PI*2,P=t=>[cx+Math.cos(t)*Rm,y0+.02,cz+Math.sin(t)*Rm],U=t=>[.5+Math.cos(t)*.5,.5-Math.sin(t)*.5];
   ARCH.quadUV('v-mandala',[cx,y0+.02,cz],P(b),P(a),[cx,y0+.02,cz],[.5,.5],U(b),U(a),[.5,.5],0xd8d0c4);}}
 else for(let r=6;r<=R-2;r+=3)ARCH.ring('v-bronze',cx,y0+.01,cz,r,.18,.03,{seg:64,col:r%2?0x8a6a3a:0x2e4a7a});
 for(let k=0;k<N;k++){const a=nicheA(k);ARCH.box('v-bronze',cx+Math.cos(a)*(R/2+4),y0+.01,cz+Math.sin(a)*(R/2+4),R-12,.03,.3,{col:0x8a6a3a,ry:-a});}
 // ---------------------------------------------------------------- the wheel: a bronze drum on its axle, gilt rims, four glyph bands
 const wheel=new THREE.Group();wheel.position.set(cx,0,cz);scene.add(wheel);
 const WR=P.wheelR,WH=P.wheelH,wy0=y0+5;
 ARCH.cyl('v-bronze',cx,y0,cz,1.1,1.1,H+1,{seg:16,col:0x6a5232});   // the axle, floor to the dome
 ARCH.cyl('v-stone',cx,y0,cz,WR+2.6,WR+2.2,1.4,{seg:48,col:0x7a7468});ARCH.ring('v-gilt',cx,y0+1.4,cz,WR+2.2,.2,.2,{seg:48,col:0xd8b048});   // the plinth
 const D=(()=>{const geo=new THREE.CylinderGeometry(WR,WR,WH,64,1,true);geo.translate(0,wy0+WH/2,0);return geo;})();
 const bodyMat=vaultMat(null,{spec:1.1});const body=new THREE.Mesh(D,bodyMat);
 {const c=new Float32Array(D.attributes.position.count*3),col=new THREE.Color(0x7a5a2e).convertSRGBToLinear();for(let i=0;i<c.length;i+=3){c[i]=col.r;c[i+1]=col.g;c[i+2]=col.b;}D.setAttribute('color',new THREE.BufferAttribute(c,3));}
 wheel.add(body);
 // the glyph bands: the band texture burning gold-white, pulsing slowly, the glyphs crawling round as it turns
 const bandMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uMap:{value:SIGNS.BAND},uT:VU.uT,uPulse:VU.uPulse},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform sampler2D uMap;uniform float uT,uPulse;varying vec2 vUv;void main(){float g=texture2D(uMap,vec2(vUv.x*3.0,vUv.y)).r;'+
   'float w=0.55+0.45*sin(uT*0.9-vUv.x*18.85);vec3 c=mix(vec3(1.0,0.62,0.18),vec3(1.0,0.95,0.78),w)*g*(0.7+0.6*uPulse);gl_FragColor=vec4(c,g);}'});
 for(let k=0;k<4;k++){const g=new THREE.CylinderGeometry(WR+.04,WR+.04,1.6,96,1,true);g.translate(0,wy0+2.4+k*4.4,0);const m=new THREE.Mesh(g,bandMat);m.renderOrder=3;wheel.add(m);}
 // the rims and the ribs, gilt
 const rimMat=vaultMat(null,{spec:1.4});
 for(const yy of [wy0,wy0+WH]){const g=new THREE.TorusGeometry(WR+.2,.35,8,64);g.rotateX(Math.PI/2);g.translate(0,yy,0);const c=new Float32Array(g.attributes.position.count*3).fill(.7);for(let i=0;i<c.length;i+=3){c[i]=.75;c[i+1]=.55;c[i+2]=.22;}g.setAttribute('color',new THREE.BufferAttribute(c,3));wheel.add(new THREE.Mesh(g,rimMat));}
 {const g=new THREE.ConeGeometry(WR+.6,3.2,64,1,true);g.translate(0,wy0+WH+1.6,0);const c=new Float32Array(g.attributes.position.count*3);for(let i=0;i<c.length;i+=3){c[i]=.62;c[i+1]=.45;c[i+2]=.2;}g.setAttribute('color',new THREE.BufferAttribute(c,3));wheel.add(new THREE.Mesh(g,rimMat));}
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2,g=new THREE.BoxGeometry(.3,WH,.3);g.translate(Math.cos(a)*(WR+.1),wy0+WH/2,Math.sin(a)*(WR+.1));const c=new Float32Array(g.attributes.position.count*3);for(let k=0;k<c.length;k+=3){c[k]=.75;c[k+1]=.55;c[k+2]=.22;}g.setAttribute('color',new THREE.BufferAttribute(c,3));wheel.add(new THREE.Mesh(g,rimMat));}
 // the keepers' handles: three spokes at the drum's foot, worn bright
 for(let i=0;i<3;i++){const a=i/3*Math.PI*2,g=new THREE.CylinderGeometry(.14,.14,4.4,8);g.rotateZ(Math.PI/2);g.translate(WR+2.2,wy0+.6,0);g.rotateY(a);const c=new Float32Array(g.attributes.position.count*3);for(let k=0;k<c.length;k+=3){c[k]=.5;c[k+1]=.3;c[k+2]=.16;}g.setAttribute('color',new THREE.BufferAttribute(c,3));wheel.add(new THREE.Mesh(g,rimMat));}
 wheel.traverse(o=>{if(o.isMesh){o.userData.vault=true;o.userData.host=true;o.userData.cls='landmark';o.userData.inspectLabel='The Procrastinator';}});
 // its light: the glyphs throw a warm gold round the hall, rising and falling with the pulse
 const WL=[];for(let k=0;k<6;k++){const a=k/6*Math.PI*2;vlight(cx+Math.cos(a)*(WR+1.5),wy0+WH*.5,cz+Math.sin(a)*(WR+1.5),0xffb040,1.6,30);WL.push(VLIGHTS.length-1);}
 vlight(cx,wy0+WH+6,cz,0xffd890,1.2,34);
 // the gallery's lamps
 for(let k=0;k<8;k++){const a=(k+.0)/8*Math.PI*2;vLamp(cx+Math.cos(a)*(R-2.2),y0+H*.55+.5,cz+Math.sin(a)*(R-2.2),.8);}
 REGISTER({name:P.name+' (a prayer wheel the size of a tower; its glyphs burn; it is never stopped)',cls:'landmark',kind:'procrastinator',key:'longsong_procrastinator',x:cx,z:cz,y:y0,r:WR+3,h:WH+8,tags:{culture:'order',types:['religious']},note:P.note});
 REGISTER({name:'The hall of the Procrastinator (the deepest room of Longsong)',cls:'part',kind:'room',key:'longsong_vault_procrastinator-hall',x:cx,z:cz,y:y0,r:R,h:H+R*.42,tags:{culture:'order',setting:'room'}});
 VAULT_ROOMS.push({id:'procrastinator-hall',name:'The hall of the Procrastinator',x0:cx-R,x1:cx+R,z0:cz-R,z1:cz+R,y0,h:H+6,round:{cx,cz,r:R-1}});

 // ---------------------------------------------------------------- the eight seals and what each holds, slowed
 const SLOWED=[];   // the meshes whose motion runs at P.slow of the keepers' time
 const field=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{uT:VU.uT,uCol:{value:new THREE.Color(0x6a9ad8)}},
  vertexShader:'varying vec3 vP;varying vec3 vN;varying vec3 vWP;void main(){vP=position;vN=normalize(mat3(modelMatrix)*normal);vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}',
  fragmentShader:'uniform float uT;uniform vec3 uCol;varying vec3 vP;varying vec3 vN;varying vec3 vWP;void main(){vec3 V=normalize(cameraPosition-vWP);float f=pow(1.0-abs(dot(normalize(vN),V)),2.5);'+
   'float r=0.5+0.5*sin(vP.y*2.2-uT*0.35+sin(vP.x*1.3+uT*0.21)*1.7);float k=f*0.42+0.06*r;gl_FragColor=vec4(uCol*k,k);}'});
 const latticeMat=new THREE.MeshBasicMaterial({color:0xffc060,toneMapped:false});
 LS.SEALED.forEach((E,k)=>{const a=nicheA(k),dx=Math.cos(a),dz=Math.sin(a),mx=cx+dx*R,mz=cz+dz*R,tx=-dz,tz=dx,D=8.5,yN=y0,HN=11;
  // the niche: a recess D deep behind the hall's wall
  const P0=(u,v,d)=>[mx+tx*u+dx*d,v,mz+tz*u+dz*d];
  ARCH.quad('v-stone',P0(-nicheW/2,yN,D),P0(nicheW/2,yN,D),P0(nicheW/2,yN+HN,D),P0(-nicheW/2,yN+HN,D),0x6a665e);
  ARCH.quad('v-stone',P0(-nicheW/2,yN,0),P0(-nicheW/2,yN,D),P0(-nicheW/2,yN+HN,D),P0(-nicheW/2,yN+HN,0),0x726c62);
  ARCH.quad('v-stone',P0(nicheW/2,yN,D),P0(nicheW/2,yN,0),P0(nicheW/2,yN+HN,0),P0(nicheW/2,yN+HN,D),0x726c62);
  ARCH.quad('v-stone',P0(-nicheW/2,yN+HN,0),P0(-nicheW/2,yN+HN,D),P0(nicheW/2,yN+HN,D),P0(nicheW/2,yN+HN,0),0x5a564e);
  ARCH.quad('v-paving',P0(nicheW/2,yN,0),P0(nicheW/2,yN,D),P0(-nicheW/2,yN,D),P0(-nicheW/2,yN,0),0x4e4a44);
  // the lattice: bronze bars and glyph discs that burn; LS-008's stands open
  const open=E.form==='empty';
  for(let i=0;i<=8;i++){const u=-nicheW/2+.3+i*(nicheW-.6)/8,uu=open?u*.25+(u<0?-nicheW*.38:nicheW*.38):u;ARCH.box('v-bronze',mx+tx*uu+dx*.3,yN,mz+tz*uu+dz*.3,.14,HN,.14,{col:0x6a5232});}
  for(const v of [2.5,6,9.5])ARCH.box('v-bronze',mx+dx*.3+(open?tx*nicheW*.38:0),yN+v,mz+dz*.3+(open?tz*nicheW*.38:0),Math.abs(tx)*(open?1.5:nicheW)+.14,.14,Math.abs(tz)*(open?1.5:nicheW)+.14,{col:0x6a5232});
  if(!open)for(let i=0;i<3;i++){const g=new THREE.CircleGeometry(.55,20),m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:SIGNS.SEAL,color:0xffe0a0,toneMapped:false}));
   m.position.set(mx+tx*(i-1)*2.2+dx*.2,yN+HN*.62,mz+tz*(i-1)*2.2+dz*.2);m.lookAt(cx,m.position.y,cz);m.userData.vault=true;m.userData.inspectLabel='A seal of the lattice (the glyph burns while the wheel turns)';scene.add(m);}
  // the field: a pale shell filling the niche, rippling at the keepers' pace (the thing inside does not)
  if(!open){const g=new THREE.CylinderGeometry(nicheW*.46,nicheW*.46,HN-.6,24,1,true),m=new THREE.Mesh(g,field);m.position.set(mx+dx*D*.52,yN+HN/2,mz+dz*D*.52);m.scale.z=D/nicheW*1.0;m.rotation.y=-a;m.renderOrder=4;m.userData.vault=true;m.userData.inspectLabel='The field of the seal (time inside runs at a ten-thousandth)';scene.add(m);}
  // the plaque at the seal's foot
  lsDecal(SIGNS.plaque(E),mx+tx*(nicheW/2+1.3)-dx*.05,yN+1.9,mz+tz*(nicheW/2+1.3)-dz*.05,1.8,1.35,-dx,-dz,{label:E.id+' · '+E.name+' (its plaque)',basic:true});
  // the thing itself, drawn in its frozen moment at the niche's middle
  const ix=mx+dx*D*.55,iz=mz+dz*D*.55,face=Math.atan2(-dx,-dz);   // facing the wheel
  const G=new THREE.Group();G.position.set(ix,yN,iz);G.rotation.y=face;scene.add(G);
  sealedForm(E.form,G);
  G.traverse(o=>{if(o.isMesh||o.isPoints){o.userData.vault=true;o.userData.host=true;o.userData.cls='prop';o.userData.inspectLabel=E.id+' · '+E.name;}});
  SLOWED.push({E,G,base:G.rotation.y,a});
  // its light: the niche lit dimly, the Second Sun bright (seen through the blue glass)
  vlight(ix-dx*2,yN+HN-1.2,iz-dz*2,E.form==='sun'?0xffe0a0:E.form==='fire'?0x8a40c0:0x8aa0c8,E.form==='sun'?2.2:.55,E.form==='sun'?20:11);
  REGISTER({name:E.id+' · '+E.name,cls:'prop',kind:'sealed',key:'longsong_sealed_'+E.id,x:ix,z:iz,y:yN,r:4,h:HN,tags:{culture:'order'},sealed:E,note:'held by the Procrastinator'});});
 // motes: dust hanging still in every closed seal, drifting at our pace in the hall and in the open one
 const motes=(n,cxm,cym,czm,s,slow)=>{const pos=new Float32Array(n*3),ph=new Float32Array(n);const S=KRAND.stream(KRAND.hash(171,Math.round(cxm),Math.round(czm)));
  for(let i=0;i<n;i++){pos[i*3]=cxm+S.range(-s,s);pos[i*3+1]=cym+S.range(-s,s);pos[i*3+2]=czm+S.range(-s,s);ph[i]=S.range(0,6.28);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aPh',new THREE.BufferAttribute(ph,1));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uT:VU.uT,uK:{value:slow}},
   vertexShader:'uniform float uT,uK;attribute float aPh;void main(){vec3 p=position;float t=uT*uK;p+=vec3(sin(t*.31+aPh)*.6,sin(t*.17+aPh*1.7)*.4-mod(t*.05+aPh,2.0)*.2,cos(t*.23+aPh)*.6);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(22.0/-mv.z,1.0,4.0);}',
   fragmentShader:'void main(){vec2 d=gl_PointCoord-0.5;float a=smoothstep(0.5,0.0,length(d));gl_FragColor=vec4(vec3(1.0,0.9,0.7)*a*0.8,a);}'});
  const p=new THREE.Points(g,m);p.userData.vault=true;p.userData.inspectLabel=slow<.01?'dust, hanging still (slowed)':'dust';scene.add(p);return p;};
 LS.SEALED.forEach((E,k)=>{const a=nicheA(k),x=cx+Math.cos(a)*(R+4.5),z=cz+Math.sin(a)*(R+4.5);motes(90,x,y0+5.5,z,3,E.form==='empty'?1:P.slow);});
 motes(500,cx,y0+H*.5,cz,R*.8,1);
 // the turning: the wheel at its pace; the glyphs' pulse; the sealed things at a ten-thousandth of it (their breathing
 // over a century: nothing a visitor will see move)
 const lights0=VLIGHTS.map(L=>L.c.slice());
 TICKS.push((dt,t)=>{wheel.rotation.y=t*P.turn;VU.uT.value=t;const pulse=.75+.25*Math.sin(t*.9)+.08*Math.sin(t*3.7);VU.uPulse.value=pulse;
  WL.forEach(i=>{const c=lights0[i],o=(i*2+1)*4;VLT[o]=c[0]*pulse;VLT[o+1]=c[1]*pulse;VLT[o+2]=c[2]*pulse;});VLTEX.needsUpdate=true;
  SLOWED.forEach(S=>{const ts=t*P.slow;S.G.rotation.y=S.base+.02*Math.sin(ts);});});
 return {wheel,SLOWED,lights:VLIGHTS};})();

// the sealed things' forms (each a few primitives; their pose is the moment the seal closed)
function sealedForm(form,G){const add=(geo,hex,o)=>{o=o||{};const c=new Float32Array(geo.attributes.position.count*3),C=new THREE.Color(hex).convertSRGBToLinear();
  for(let i=0;i<c.length;i+=3){c[i]=C.r;c[i+1]=C.g;c[i+2]=C.b;}geo.setAttribute('color',new THREE.BufferAttribute(c,3));
  const m=new THREE.Mesh(geo,o.mat||vaultMat(null,{spec:o.spec||.2,emis:o.emis||0,side:o.side,alpha:o.alpha}));G.add(m);return m;};
 if(form==='shade'){// the Hungry Hour: a tall dark body leaning into a lunge, many arms reaching for the lattice
  const b=new THREE.SphereGeometry(1,14,10);b.scale(.9,2.6,.7);b.rotateX(-.5);b.translate(0,4.2,.6);add(b,0x08060c,{emis:.0});
  const h=new THREE.SphereGeometry(.7,12,10);h.translate(0,7.1,2.1);add(h,0x0a0810);
  for(let i=0;i<9;i++){const a=(i-4)*.22,L=3.4+((i*37)%5)*.4,g=new THREE.CylinderGeometry(.08,.2,L,6);g.translate(0,L/2,0);g.rotateX(Math.PI/2-.2+((i*13)%7-3)*.06);g.rotateY(a);g.translate(Math.sin(a)*.6,4.6+((i*7)%5)*.4,1.2);add(g,0x0c0812);}
  const e=new THREE.SphereGeometry(.12,8,6);for(const s of [-1,1]){const g=e.clone();g.translate(s*.28,7.2,2.7);add(g,0xff3020,{emis:3});}}
 else if(form==='bell'){// the Bell That Rings Backward: in mid-swing, the ripple of its stroke round it
  const fr=new THREE.BoxGeometry(5,.3,.3);fr.translate(0,8.2,0);add(fr,0x4a2a18);for(const s of [-2.4,2.4]){const p=new THREE.BoxGeometry(.3,8.2,.3);p.translate(s,4.1,0);add(p,0x4a2a18);}
  const bell=new THREE.CylinderGeometry(.9,1.7,2.6,24,1,true);bell.translate(0,-1.3,0);bell.rotateZ(.6);bell.translate(.6,7.6,0);add(bell,0x7a5a2e,{spec:1,side:THREE.DoubleSide});
  const ring=new THREE.TorusGeometry(2.8,.05,6,48);ring.rotateZ(.6);ring.translate(1.2,6.2,0);add(ring,0xb0c8ff,{emis:1.2,alpha:.5});}
 else if(form==='fire'){// the Unfinished Fire: a bronze brazier, black flames still as glass
  const bowl=new THREE.CylinderGeometry(1.4,.8,.8,20,1,true);bowl.translate(0,2.6,0);add(bowl,0x6a4a24,{spec:.8,side:THREE.DoubleSide});
  for(let i=0;i<3;i++){const l=new THREE.CylinderGeometry(.08,.08,2.4,5);l.translate(0,1.2,0);l.rotateZ(.25);l.rotateY(i*2.09);l.translate(Math.cos(i*2.09)*.7,0,Math.sin(i*2.09)*.7);add(l,0x4a3418);}
  for(let i=0;i<9;i++){const h=1.2+((i*29)%7)*.32,c=new THREE.ConeGeometry(.3+((i*5)%3)*.1,h,7);c.translate(Math.cos(i*.7)*.6*(i%3)/2,3+h/2,Math.sin(i*.7)*.6*(i%3)/2);add(c,0x0a0612,{emis:.0});}
  const glow=new THREE.SphereGeometry(1.1,12,8);glow.translate(0,3.4,0);add(glow,0x6a20a0,{emis:1.4,alpha:.25});}
 else if(form==='moth'){// the Moth of Many Eyes: wings half raised, an eye on every scale
  const body=new THREE.SphereGeometry(.6,12,8);body.scale(1,1,3.2);body.translate(0,4.6,0);add(body,0x3a3020);
  const eyes=document.createElement('canvas');eyes.width=eyes.height=128;const x=eyes.getContext('2d');x.fillStyle='#4a3a28';x.fillRect(0,0,128,128);
  for(let i=0;i<22;i++){const S=KRAND.stream(KRAND.hash(181,i)),ex=S.range(10,118),ey=S.range(10,118),r=S.range(4,11);x.fillStyle='#e8d8a8';x.beginPath();x.ellipse(ex,ey,r,r*.6,0,0,7);x.fill();x.fillStyle='#1a1410';x.beginPath();x.arc(ex,ey,r*.4,0,7);x.fill();}
  const et=new THREE.CanvasTexture(eyes);et.encoding=THREE.sRGBEncoding;const wm=new THREE.MeshBasicMaterial({map:et,side:THREE.DoubleSide,color:0x8a7a68});
  for(const s of [-1,1]){const w=new THREE.PlaneGeometry(4.2,3.2);w.translate(s*2.2,0,0);w.rotateZ(s*.5);w.translate(0,4.9,.4);const m=new THREE.Mesh(w,wm);G.add(m);
   const w2=new THREE.PlaneGeometry(3,2.4);w2.translate(s*1.6,0,0);w2.rotateZ(-s*.15);w2.translate(0,4.3,-1.2);G.add(new THREE.Mesh(w2,wm));}}
 else if(form==='drop'){// the Falling Drop: a stone basin, a hand over it one black drop
  const bs=new THREE.CylinderGeometry(1.8,1.4,1.4,24);bs.translate(0,.7,0);add(bs,0x6a665e);
  const d=new THREE.SphereGeometry(.22,14,10);d.scale(1,1.35,1);d.translate(0,2.4,0);add(d,0x020204,{spec:2.5});
  const ln=new THREE.BoxGeometry(.02,.02,3.4);ln.translate(0,2.38,0);add(ln,0xd0c8a0,{emis:1});}   // the scribed line
 else if(form==='sun'){// the Second Sun: a small sun stopped mid-flare, its loops frozen; the keepers' blue glass before it
  const s=new THREE.SphereGeometry(1.3,24,16);s.translate(0,5.4,0);add(s,0xfff0b0,{mat:new THREE.MeshBasicMaterial({color:0xfff4c8,toneMapped:false})});
  for(let i=0;i<6;i++){const t=new THREE.TorusGeometry(1.4+i*.18,.07,6,24,Math.PI*(.6+(i%3)*.2));t.rotateY(i*1.05);t.rotateX(.4*i);t.translate(0,5.4,0);G.add(new THREE.Mesh(t,new THREE.MeshBasicMaterial({color:0xffb050,toneMapped:false})));}
  const glass=new THREE.PlaneGeometry(6.4,9.4);glass.translate(0,5,2.8);add(glass,0x2a4a9a,{alpha:.35,side:THREE.DoubleSide});}
 else if(form==='door'){// the Smiling Door: a door with no wall, a finger's width ajar, something pressing
  const fr=new THREE.BoxGeometry(2.6,4.6,.4);fr.translate(0,2.3,0);add(fr,0x2a1a12);
  const op=new THREE.PlaneGeometry(2,4);op.translate(0,2.2,-.21);add(op,0x000000);
  const leaf=new THREE.BoxGeometry(2,4,.16);leaf.translate(1,2.2,0);leaf.rotateY(.06);leaf.translate(-1,0,.12);add(leaf,0x5a3020);
  const slit=new THREE.PlaneGeometry(.06,3.9);slit.translate(.95,2.2,.25);add(slit,0xff2a10,{emis:4});
  for(let i=0;i<4;i++){const f=new THREE.SphereGeometry(.09,6,4);f.translate(1.02,1.2+i*.5,.3);add(f,0xd8c8b0);}}   // fingertips round the edge
 else if(form==='empty'){// the eighth seal: an empty plinth, its seal strips torn and lying on the floor; the dust moves at our speed
  const pl=new THREE.BoxGeometry(2.4,.9,2.4);pl.translate(0,.45,0);add(pl,0x6a665e);
  for(let i=0;i<5;i++){const st=new THREE.PlaneGeometry(.4,1.4);st.rotateX(-Math.PI/2);st.rotateY(i*1.3);st.translate(Math.cos(i*2.1)*1.9,.03+i*.004,Math.sin(i*2.1)*1.6+.4);
   const m=new THREE.Mesh(st,new THREE.MeshBasicMaterial({map:SIGNS.SEAL,color:0x6a6458,side:THREE.DoubleSide}));G.add(m);}}
}

// ---------------------------------------------------------------- the lights' arrays for the shader (fixed after the build)
(function(){const n=Math.min(VLIGHTS.length,VNL);VU.uLN.value=n;
 for(let i=0;i<n;i++){const L=VLIGHTS[i],a=i*8;VLT[a]=L.p[0];VLT[a+1]=L.p[1];VLT[a+2]=L.p[2];VLT[a+3]=L.r;VLT[a+4]=L.c[0];VLT[a+5]=L.c[1];VLT[a+6]=L.c[2];}
 VLTEX.needsUpdate=true;})();

// ---------------------------------------------------------------- the Vault's checks (verify.py --assert)
const VCHK={
 // the depths are under the ground: every room below the terrain over it, the Procrastinator the deepest
 under(rooms){const bad=rooms.filter(R=>{const x=(R.x0+R.x1)/2,z=(R.z0+R.z1)/2;return R.y0+Math.min(R.h,R.shaft?0:R.h)>terrainH(x,z)-1&&!R.shaft;});
  const deep=rooms.reduce((m,R)=>Math.min(m,R.y0),1e9);
  return{ok:!bad.length&&deep===LS.PROCRASTINATOR.y0,detail:rooms.length+' rooms under the rock'+(bad.length?'; not under it: '+bad.map(R=>R.id).join(', '):'')+'; the deepest floor '+deep+' m (the Procrastinator\'s '+LS.PROCRASTINATOR.y0+')'};},
 // the Procrastinator turns and its seals are slowed: the wheel's angle moves at its pace, the sealed things at P.slow
 turning(P,S){const ok=P.turn>0&&P.slow>0&&P.slow<=1e-3&&S.length===8&&S.filter(e=>e.cls!=='UNWRITTEN').length===7;
  return{ok,detail:'one turn in '+(2*Math.PI/P.turn/60).toFixed(1)+' min; the seals at '+P.slow+' of the keepers\' time; '+S.length+' seals ('+S.map(e=>e.cls[0]).join('')+')'};},
 // one way down: a single stair from the Red Palace (the Deep Stair) and one to the hall
 oneWay(V){const st=V.filter(R=>R.shaft);return{ok:st.length===2&&st[0].y0+st[0].h>LS.ROCK.top,detail:st.length+' stairs: '+st.map(R=>R.id+' to '+(R.y0+R.h).toFixed(0)+' m').join(', ')};}};
// every lamp of the depths lights them: all of them in the light texture (none past the shader's ceiling)
VCHK.lit=(n,cap,shown)=>({ok:n>0&&n<=cap&&shown===n,detail:n+' lamps in the depths, '+shown+' in the shader (its ceiling '+cap+')'});
// the rooms all join: from the Deep Stair, through the doors, every room of the depths is reached
VCHK.joined=(rooms,doors)=>{const ids=rooms.map(R=>R.id),seen=new Set(['deep-stair']),q=['deep-stair'];
 while(q.length){const r=q.pop();for(const D of doors){const o=D.a===r?D.b:D.b===r?D.a:null;if(o&&!seen.has(o)){seen.add(o);q.push(o);}}}
 const miss=ids.filter(i=>!seen.has(i));return{ok:!miss.length&&ids.length>8,detail:ids.length+' rooms, '+doors.length+' doors'+(miss.length?'; not reached: '+miss.join(', '):'; every room reached from the Deep Stair')};};
function vaultChecks(add){add('the Vault is under the rock, the Procrastinator deepest',VCHK.under(VAULT_ROOMS));
 add('every lamp of the depths lights them',VCHK.lit(VLIGHTS.length,VNL,VU.uLN.value));
 add('the rooms of the depths all join (their doors)',VCHK.joined(VAULT_ROOMS,LS.VAULT_DOORS));
 add('the Procrastinator turns; its seals are slowed',VCHK.turning(LS.PROCRASTINATOR,LS.SEALED));
 add('one stair down',VCHK.oneWay(LS.VAULT));}
function vaultNegatives(add){add('a lamp past the shader\'s ceiling',VCHK.lit(VNL+1,VNL,VNL));
 add('the closed vault\'s door bricked up',VCHK.joined(VAULT_ROOMS,LS.VAULT_DOORS.filter(D=>D.b!=='closed-vault')));
 add('a vault room above ground',VCHK.under(VAULT_ROOMS.concat([{id:'up',x0:-200,x1:-190,z0:-150,z1:-140,y0:0,h:4}])));
 add('a wheel that does not slow its seals',VCHK.turning(Object.assign({},LS.PROCRASTINATOR,{slow:1}),LS.SEALED));
 add('a second way down',VCHK.oneWay(LS.VAULT.concat([{id:'back-stair',shaft:true,y0:-14,h:60}])));}
_mark('vault');
