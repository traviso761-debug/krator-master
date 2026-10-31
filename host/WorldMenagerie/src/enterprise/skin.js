// ---------- Galaxy class: the skin ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used: every texture here is
// painted by this file, texel by texel, when the page loads.
//
// Each part of the hull gets two textures. The first is its colour (a canvas, so the lettering can be set on it
// with fillText). The second is data: red is height (the panel lines, read by the bump map), green is roughness,
// and blue is which windows are lit (read by the emissive map; the shader is told to take blue only). A texel is
// painted by asking the part's surface function where it is on the ship, so the patterns are laid out in metres
// on the hull, not in texture space:
//
//   - The panelling is the "aztec" pattern the Galaxy class is known for: a field of plates in two or three
//     close greys, each plate split once more into an L, laid in rings and spokes on the saucer and in courses
//     along the stardrive. Up close it is what the hull is; from a kilometre off it is a faint mottle, which is
//     what it should be.
//   - The windows are where the decks meet the skin. On the saucer the decks are flat floors and the dish slopes
//     through them, so each deck shows as one ring of windows, and the rings crowd together where the dish is
//     steepest and stop where it is flat, as on the ship. On the stardrive they are courses along the sides.
//   - The phaser strips are dark grey bands let into the dish, scored across, broken where the impulse deck is.
//   - The escape pods are tan hatches in twos, threes and fours, in rings across the dish.
//   - The registry is dark grey edged in red, in a wide face; the name over it is red. A red pinstripe runs down
//     the neck's back and the spine of the engineering hull, and along the top of each nacelle behind its delta.
import {ell,halfBeam,saucerTop,saucerBot,rho,clamp,smooth,normalAt,rimSurf,mono} from './hull.js';
import {SAUCER} from './dims.js';
import {NACZ} from './hull.js';

const HASH=(a,b,c)=>{let h=Math.imul(a|0,0x27d4eb2d)^Math.imul(b|0,0x165667b1)^Math.imul(c|0,0x2c1b3c6d);
  h=Math.imul(h^(h>>>15),0x85ebca6b);h=Math.imul(h^(h>>>13),0xc2b2ae35);return ((h^(h>>>16))>>>0)/4294967296;};
const fr=x=>x-Math.floor(x);

// the hull's greys, linear; the plates are set a few per cent either side, warmer and cooler
const BASE=[0.585,0.615,0.64],GLASS=[0.05,0.055,0.065],STRIP=[0.25,0.265,0.285],HATCH=[0.62,0.55,0.38],RED=[0.55,0.07,0.05],GOLD=[0.72,0.55,0.22];
const TONES=[[0.955,0.965,0.99],[0.99,0.993,1.0],[1.02,1.017,1.0],[1.045,1.04,1.03]];

// The aztec field at (a, b) in metres, cells cw by ch, every course offset: the tone of the plate it is on and how
// far it is (in metres) from a plate's edge and from the split inside the plate.
function aztec(a,b,cw,ch,seed,o){
  const row=Math.floor(b/ch),a2=a+HASH(row,seed,7)*cw,col=Math.floor(a2/cw);
  const fa=a2/cw-col,fb=b/ch-row,h=HASH(col,row,seed);
  o.edge=Math.min(Math.min(fa,1-fa)*cw,Math.min(fb,1-fb)*ch);
  const vert=h<0.5,sp=0.28+0.44*HASH(col,row,seed+1),f=vert?fa:fb,side=f<sp?0:1;
  let sub=Math.abs(f-sp)*(vert?cw:ch);
  // one half split again across, which makes the interlocking L of the pattern
  const g=vert?fb:fa,sp2=0.3+0.4*HASH(col,row,seed+3);let part=side*2;
  if(side===(h<0.25||h>0.75?0:1)){part+=g<sp2?0:1;sub=Math.min(sub,Math.abs(g-sp2)*(vert?ch:cw));}
  o.tone=Math.floor(HASH(col*4+part,row,seed+2)*4);o.sub=sub;
  return o;
}
const AZ={edge:0,sub:0,tone:0};

// A texture pair: colour as ImageData on a canvas, data as bytes.
function pair(W,H){
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;
  const ctx=cv.getContext('2d'),img=ctx.createImageData(W,H),dat=new Uint8Array(W*H*4);
  return {W,H,cv,ctx,img,dat,
    set(i,c,k,height,rough,lit){
      const o=i*4;img.data[o]=clamp(c[0]*k[0]*255,0,255);img.data[o+1]=clamp(c[1]*k[1]*255,0,255);img.data[o+2]=clamp(c[2]*k[2]*255,0,255);img.data[o+3]=255;
      dat[o]=clamp(height*255,0,255);dat[o+1]=clamp(rough*255,0,255);dat[o+2]=lit?255:0;dat[o+3]=255;}};
}
function finish(THREE,renderer,T){
  T.ctx.putImageData(T.img,0,0);
  if(T.after)T.after(T.ctx);
  const aniso=renderer.capabilities.getMaxAnisotropy?renderer.capabilities.getMaxAnisotropy():1;
  const map=new THREE.CanvasTexture(T.cv);map.flipY=false;map.anisotropy=aniso;
  const data=new THREE.DataTexture(T.dat,T.W,T.H,THREE.RGBAFormat);
  data.minFilter=THREE.LinearMipmapLinearFilter;data.magFilter=THREE.LinearFilter;data.generateMipmaps=true;data.anisotropy=aniso;data.needsUpdate=true;
  map.wrapS=data.wrapS=THREE.RepeatWrapping;
  return {map,data};
}
const ONE=[1,1,1];
// what a plate looks like: its tone, and the panel lines as grooves in the height
function plate(T,i,az,shade,lit){
  const k=TONES[az.tone];
  const line=1-0.3*(1-smooth(0.04,0.2,az.edge))-0.1*(1-smooth(0.02,0.12,az.sub));
  const s=shade*(0.96+0.04*line);
  T.set(i,lit===1?GLASS:BASE,lit===1?ONE:[k[0]*s,k[1]*s,k[2]*s],line,0.52+0.05*az.tone-(lit===1?0.35:0),lit===1&&LIT);
}
let LIT=true;

// ---------- the saucer, top and underside: a plan projection ----------
// The texture is laid flat over the saucer's plan, x from -206 to 194 down it and z from -234 to 234 across.
export const PLAN={x0:-206,x1:194,z0:-234,z1:234};
export function planUV(g){
  const p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,(p.getZ(i)-PLAN.z0)/(PLAN.z1-PLAN.z0),(p.getX(i)-PLAN.x0)/(PLAN.x1-PLAN.x0));
  uv.needsUpdate=true;
}
function saucerTex(THREE,renderer,top,N){
  const T=pair(N,N),prof=top?SAUCER.top:SAUCER.bot;
  // the profile and its slope against e, tabulated: the decks are read off the bare dish, without the dorsal
  const PR=new Float32Array(1025),DP=new Float32Array(1025);
  for(let i=0;i<=1024;i++){const e=i/1024;PR[i]=top?saucerTopBare(e):saucerBotBare(e);}
  for(let i=0;i<=1024;i++)DP[i]=(PR[Math.min(1024,i+1)]-PR[Math.max(0,i-1)])/((Math.min(1024,i+1)-Math.max(0,i-1))/1024);
  const y00=PR[0],sgn=top?1:-1,DECK=3.6,seed=top?11:23;
  const rimE=top?0.69:0.745;
  for(let j=0;j<N;j++){
    const x=PLAN.x0+(j+0.5)/N*(PLAN.x1-PLAN.x0),hb=halfBeam(x);
    for(let i=0;i<N;i++){
      const z=PLAN.z0+(i+0.5)/N*(PLAN.z1-PLAN.z0),idx=j*N+i;
      if(Math.abs(z)>hb+2){T.set(idx,BASE,ONE,1,0.55,false);continue;}
      const e=ell(x,z),r=Math.hypot(x,z),R=e>1e-4?r/e:212,th=Math.atan2(z,x);
      // the plates: courses out from the centre, each cut into as many plates as fit round it
      const b=e*212,ch=11,row=Math.floor(b/ch),Rr=(row+0.5)*ch,ncol=Math.max(6,Math.round(2*Math.PI*Rr/17)),cw=2*Math.PI*Rr/ncol;
      aztec((th/(2*Math.PI)+0.5)*ncol*cw,b,cw,ch,seed,AZ);
      // the dorsal plate round the bridge (on top) and the sensor platform (under) are one smooth piece each,
      // ringed by a single joint: the spokes of the field would otherwise all meet in a smudge at the centre
      {const db=top?Math.hypot(x-SAUCER.bridge.x,z):Math.hypot(x-SAUCER.sensor.x,z),rr=top?SAUCER.bridge.r+4:SAUCER.sensor.r+6;
       if(db<rr){AZ.edge=Math.abs(db-rr*0.82)*2+0.02;AZ.sub=9;AZ.tone=1;}}
      const ei=Math.min(1024,Math.round(Math.min(1,e)*1024)),y0=PR[ei],sl=Math.abs(DP[ei])/R;
      let lit=0;
      // a deck of windows where a floor meets the dish
      if(sl>0.035&&e<0.985){
        const df=(y00+0.6-y0)*sgn/DECK,dk=Math.floor(df),off=Math.abs(fr(df)-0.5)*DECK;
        if(off<0.62*sl){
          const s=th*r,col=Math.floor(s/2.7);
          if(fr(s/2.7)<0.48&&HASH(Math.floor(s/19+HASH(dk,seed,5)*7),dk,seed+9)>0.3)lit=HASH(col,dk,seed+4)<0.86?1:2;
        }
      }
      // the escape pods: tan hatches 2.4 m square, in groups of two to four, on rings across the dish
      if(!lit&&x>-150){
        for(const pe of PODS){const dr=(e-pe)*R;if(Math.abs(dr)>1.3)continue;
          const s=th*r,g=Math.floor(s/24),k=2+Math.floor(HASH(g,pe*1000,seed+12)*3),o=(s/24-g)*24-3;
          if(HASH(g,pe*1000,seed+13)<0.55&&o>0&&o<k*3.1&&fr(o/3.1)<0.78){T.set(idx,HATCH,ONE,0.8,0.5,false);lit=-1;}
          break;}
        if(lit===-1)continue;
      }
      // the phaser strip, broken over the impulse deck: a dark band scored across every metre
      {const ds=Math.abs(e-rimE)*R;
       if(ds<1.4&&!(x<-95&&Math.abs(z)<150)){const sc=fr(th*r/1.1)<0.18||ds>1.1;T.set(idx,STRIP,sc?[0.7,0.7,0.72]:ONE,ds>1.1?0.45:0.8,0.35,false);continue;}}
      if(lit===2){T.set(idx,GLASS,ONE,0.8,0.15,false);continue;}
      plate(T,idx,AZ,1,lit);
    }
  }
  T.after=ctx=>lettering(ctx,N,top);
  return finish(THREE,renderer,T);
}
const PODS=[0.57,0.82,0.935];
const TOPP=mono(SAUCER.top),BOTP=mono(SAUCER.bot);
const saucerTopBare=e=>TOPP(e),saucerBotBare=e=>BOTP(e);
// The registry, set in the plan's own metres. The canvas is the plan seen from below (z across, x down it), so
// on the top it is set mirrored to read right from above; on the underside it is turned to read from below.
function lettering(ctx,N,top){
  const px=z=>(z-PLAN.z0)/(PLAN.z1-PLAN.z0)*N,py=x=>(x-PLAN.x0)/(PLAN.x1-PLAN.x0)*N,mpp=N/(PLAN.z1-PLAN.z0);
  const set=(text,x,z,h,flipX,turn,wide,red)=>{
    ctx.save();ctx.translate(px(z),py(x));if(turn)ctx.rotate(Math.PI);ctx.scale((flipX?-1:1)*mpp*(wide||1),mpp);
    ctx.font='700 '+h+'px "Arial Narrow","Helvetica Neue",Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    if(red){ctx.fillStyle='rgb(150,34,30)';ctx.fillText(text,0,0);}
    else{ctx.lineJoin='round';ctx.lineWidth=h*0.055;ctx.strokeStyle='rgb(160,36,30)';ctx.strokeText(text,0,0);ctx.fillStyle='rgb(36,40,48)';ctx.fillText(text,0,0);}
    ctx.restore();};
  if(top){set('NCC-1701-D',84,0,12,true,false,1.55);set('U.S.S. ENTERPRISE',71,0,3.6,true,false,1.5,true);}
  else{set('NCC-1701-D',70,0,15,false,true,1.55);}
}

// ---------- the rim ----------
// u round (as the saucer's angle), v down the band. Two decks of windows, the upper the taller (Ten Forward's).
function rimTex(THREE,renderer){
  const W=4096,H=64,T=pair(W,H);
  // the arc length round the rim, for spacing the windows in metres
  const S=new Float32Array(W+1),p={x:0,y:0,z:0},q={x:0,y:0,z:0};
  rimSurf(0,0.5,q);for(let i=1;i<=W;i++){rimSurf(i/W,0.5,p);S[i]=S[i-1]+Math.hypot(p.x-q.x,p.z-q.z);q.x=p.x;q.z=p.z;}
  for(let i=0;i<W;i++){
    const u=(i+0.5)/W,a=u*Math.PI*2,r=rho(a),x=r*Math.cos(a),z=r*Math.sin(a),s=S[i];
    const yT=saucerTop(x,z),yB=saucerBot(x,z),hgt=yT-yB;
    for(let j=0;j<H;j++){
      const v=(j+0.5)/H,y=yT-v*hgt,idx=j*W+i;
      aztec(s,y+40,9,3,31,AZ);
      let lit=0;
      if(x>-185){
        const up=Math.abs(y-1.15)<0.85,lo=Math.abs(y+1.55)<0.6;
        const k=up?0:lo?1:-1;
        if(k>=0&&fr(s/2.4)<(k?0.42:0.5)&&HASH(Math.floor(s/23),k,41)>0.12)lit=HASH(Math.floor(s/2.4),k,43)<0.88?1:2;
        // the groove between the two decks
        if(Math.abs(y+0.05)<0.28){T.set(idx,BASE,[0.5,0.52,0.55],0.4,0.6,false);continue;}
      }
      if(lit===2){T.set(idx,GLASS,ONE,0.8,0.15,false);continue;}
      plate(T,idx,AZ,1.0,lit);
    }
  }
  return finish(THREE,renderer,T);
}

// ---------- the lofted parts ----------
// A sampler: the surface and its normals on a grid, read back bilinearly, so a texture of millions of texels does
// not call the surface function millions of times.
function sampler(f,flip,gu,gv){
  const P=new Float32Array((gu+1)*(gv+1)*3),Nn=new Float32Array((gu+1)*(gv+1)*3),p={x:0,y:0,z:0},n={x:0,y:0,z:0};
  let k=0;
  for(let i=0;i<=gu;i++)for(let j=0;j<=gv;j++,k++){f(i/gu,j/gv,p);normalAt(f,i/gu,j/gv,n,flip);
    P[k*3]=p.x;P[k*3+1]=p.y;P[k*3+2]=p.z;Nn[k*3]=n.x;Nn[k*3+1]=n.y;Nn[k*3+2]=n.z;}
  return (u,v,o,on)=>{
    const fu=clamp(u,0,1)*gu,fv=clamp(v,0,1)*gv,i=Math.min(gu-1,Math.floor(fu)),j=Math.min(gv-1,Math.floor(fv)),tu=fu-i,tv=fv-j;
    const a=(i*(gv+1)+j)*3,b=a+(gv+1)*3,c=a+3,d=b+3;
    for(const [arr,out] of [[P,o],[Nn,on]]){
      const w0=(1-tu)*(1-tv),w1=tu*(1-tv),w2=(1-tu)*tv,w3=tu*tv;
      out.x=arr[a]*w0+arr[b]*w1+arr[c]*w2+arr[d]*w3;out.y=arr[a+1]*w0+arr[b+1]*w1+arr[c+1]*w2+arr[d+1]*w3;out.z=arr[a+2]*w0+arr[b+2]*w1+arr[c+2]*w2+arr[d+2]*w3;}
  };
}
// The stardrive's skin: plates in courses along the hull (on the sides they run with the decks, on the top and
// underside with the keel), and the decks of windows along the sides.
export function hullPainter({windows=true,seed=51,cw=16,ch=9,skip,spine=false,nacelle=false}={}){
  return (T,idx,p,n)=>{
    // the pinstripe: red edged in white, down the middle of the neck's back and the engineering hull's spine
    if(spine&&n.y>0.35&&p.x<-150&&Math.abs(p.z)<0.85){T.set(idx,Math.abs(p.z)<0.5?RED:[0.8,0.8,0.8],ONE,0.9,0.4,false);return;}
    if(nacelle&&n.y>0.5){
      const a=-(p.x+250),b=Math.abs(p.z)-NACZ;
      // the delta, and the red line running aft from it
      if(a>0&&a<14&&Math.abs(b)<(14-a)*0.42&&!(a>10&&Math.abs(b)<1.1)){T.set(idx,GOLD,ONE,0.9,0.35,false);return;}
      if(a>16&&a<170&&Math.abs(b)<0.45){T.set(idx,RED,ONE,0.9,0.4,false);return;}
      if(a>16&&a<150&&Math.abs(Math.abs(b)-2.4)<0.22){T.set(idx,RED,ONE,0.9,0.4,false);return;}
    }
    const side=Math.abs(n.y)<0.72;
    if(side)aztec(p.x,p.y,cw,ch,seed,AZ);else aztec(p.x,Math.abs(p.z),cw,ch*1.4,seed+1,AZ);
    let lit=0;
    if(windows&&Math.abs(n.y)<0.6&&!(skip&&skip(p))){
      const df=(p.y+0.6)/3.5,dk=Math.floor(df);
      if(Math.abs(fr(df)-0.5)<0.15){
        const c=Math.floor(p.x/2.5);
        if(fr(p.x/2.5)<0.48&&HASH(Math.floor(p.x/16+HASH(dk,seed,3)*5),dk*2+(p.z>0?1:0),seed+5)>0.32)lit=HASH(c,dk,seed+6)<0.85?1:2;
      }
    }
    if(lit===2){T.set(idx,GLASS,ONE,0.8,0.15,false);return;}
    plate(T,idx,AZ,1,lit);
  };
}
export function loftTex(THREE,renderer,f,flip,W,H,paint,after){
  const T=pair(W,H),S=sampler(f,flip,Math.min(W,384),Math.min(H,192)),p={x:0,y:0,z:0},n={x:0,y:0,z:0};
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){S((i+0.5)/W,(j+0.5)/H,p,n);const l=Math.hypot(n.x,n.y,n.z)||1;n.x/=l;n.y/=l;n.z/=l;paint(T,j*W+i,p,n);}
  if(after)T.after=ctx=>after(ctx,W,H);
  return finish(THREE,renderer,T);
}

// ---------- the materials ----------
// Physically based, lit by the star and by an environment map; the emissive map reads blue only (the lit windows).
export function hullMaterial(THREE,tex,env,o={}){
  const m=new THREE.MeshStandardMaterial({map:tex.map,bumpMap:tex.data,bumpScale:o.bump===undefined?0.25:o.bump,roughnessMap:tex.data,roughness:1,
    metalness:o.metal===undefined?0.18:o.metal,emissive:new THREE.Color(o.window||0xffd8a0),emissiveMap:tex.data,emissiveIntensity:o.glow===undefined?1.6:o.glow,
    envMap:env,envMapIntensity:o.env===undefined?1.3:o.env});
  m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>',
    '#ifdef USE_EMISSIVEMAP\n totalEmissiveRadiance *= texture2D( emissiveMap, vUv ).b;\n#endif');};
  m.customProgramCacheKey=()=>'krator-galaxy-hull';
  return m;
}
export function saucerTextures(THREE,renderer){
  return {top:saucerTex(THREE,renderer,true,2048),bot:saucerTex(THREE,renderer,false,1536),rim:rimTex(THREE,renderer)};
}
export function setLit(v){LIT=v;}
