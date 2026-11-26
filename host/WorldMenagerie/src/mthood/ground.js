// ---------- Mount Hood: the ground through the year, and the forest on it ----------
// OpenStreetMap maps the mountain's glaciers, some of its meadows and rock, and none of the rest of its ground. What
// is drawn here (C.ground; the masks from data/cities/mthood-mtn.json, tools/make-mthood.py):
//   forest     the west side's Douglas-fir, western hemlock and redcedar in the valleys; Pacific silver and noble fir
//              higher; mountain hemlock and subalpine fir to the tree line (about 1800 m on the north side, 1950 m
//              on the south), whitebark pine in krummholz above it; the dry east side's ponderosa, lodgepole and
//              western larch; red alder and bigleaf maple along the streams; vine maple under the trees
//   meadows    the subalpine parks (Paradise Park, Elk Cove, Cairn Basin, Yocum Ridge, Heather Canyon): green as the
//              snow goes, in flower a few hundred metres under it (lupine, paintbrush, beargrass, aster, arnica),
//              gold in late summer, the huckleberry red in October
//   bare       the pumice sands of the south side (Timberline to Crater Rock), scree, the andesite cliffs, the
//              hydrothermally altered rock of Steel Cliff and Crater Rock (the tints)
//   glaciers   the mapped ice: white under the winter's snow, bare blue-grey ice with crevasses across the flow in late
//              summer, and the debris-covered tongues of the Eliot, Coe and Ladd grey with rubble
//   snow       down to the season's snow line (season.js), lower on the north faces, ragged with the ground, shed
//              by the cliffs; on the trees too, and on the far Cascades (the backdrop)
// The colours are drawn by one shader on the terrain, the fine ground and the backdrop, from what lies at each point
// (attributes aCov, aCov2) and the season's uniforms, so the year turns without repainting a vertex.
// The trees are planted a tile at a time near the camera; their shader puts snow on the crowns and turns and drops
// the leaves. api.ctx.ground.winter(k) is fresh snow from the weather. None of it is in the layout fingerprint.
import {hash3} from '../core/rng.js';

const GLSL_NOISE=`float mhHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float mhNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mhHash(i),mhHash(i+vec2(1,0)),f.x),mix(mhHash(i+vec2(0,1)),mhHash(i+vec2(1,1)),f.x),f.y);}
`;
const UNI='uniform float uSnowLine,uGlacier,uBloom,uBloomH,uAutumn,uTurn,uLeaf,uCure,uFresh;\n';

// chain a shader patch onto a material, keeping whatever patch it already has
export function patchMaterial(mat,key,U,fn){const prev=mat.onBeforeCompile,k0=mat.customProgramCacheKey?mat.customProgramCacheKey():'';
  mat.onBeforeCompile=(sh,r)=>{if(prev)prev.call(mat,sh,r);Object.assign(sh.uniforms,U);fn(sh);};mat.customProgramCacheKey=()=>k0+'|'+key;mat.needsUpdate=true;return mat;}

// snow on whatever faces up, above the season's snow line: the buildings' roofs, the lodges, the lift huts
export function snowOnTop(mat,U,o={}){mat.extensions=Object.assign({},mat.extensions,{derivatives:true});   // a mesh with no normals (the engine's merged roofs) takes its faces' own
  return patchMaterial(mat,'mhsnow'+(o.k||''),U,sh=>{
  sh.vertexShader='varying vec3 vMhW;varying vec3 vMhN;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n{vec4 w=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nw=instanceMatrix*w;\n#endif\nvMhW=(modelMatrix*w).xyz;vec3 nn=objectNormal;\n#ifdef USE_INSTANCING\nnn=mat3(instanceMatrix)*nn;\n#endif\nvMhN=mat3(modelMatrix)*nn;}');
  sh.fragmentShader=UNI+GLSL_NOISE+'varying vec3 vMhW;varying vec3 vMhN;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','{float mhUp=dot(vMhN,vMhN)>0.01?normalize(vMhN).y:abs(normalize(cross(dFdx(vMhW),dFdy(vMhW))).y);float sl=uSnowLine-uFresh*400.0+(mhNoise(vMhW.xz*0.01)-0.5)*120.0;float s=smoothstep(sl-50.0,sl+50.0,vMhW.y)*'+(o.flat?'1.0':'smoothstep(0.35,0.7,abs(mhUp))')   /* the engine's roofs may carry their normals upside down; a face seen from below is rare */+'*'+(o.k2||'0.92')+';diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.93,0.95,0.98),s);}\n#include <emissivemap_fragment>');});}   // the snow goes on after every other patch's colour work (the engine's walls darken after color_fragment)

export function ground(api){
  const {THREE,C,scene,P,groundH,inWater,animHooks,camera,buildingsAt,roadsNear}=api;const K=C.ground||{};
  const S=api.ctx.season,U=S?S.U:{uSnowLine:{value:2000},uGlacier:{value:1},uBloom:{value:0},uBloomH:{value:1800},uAutumn:{value:0},uTurn:{value:0},uLeaf:{value:1},uCure:{value:0},uFresh:{value:0}};
  const M=api.ctx.mtn||{},CAN=api.ctx.canopy;const t0=performance.now();
  const vn=(x,z,s,salt=91)=>{const X=x/s,Z=z/s,i=Math.floor(X),j=Math.floor(Z),fx=X-i,fz=Z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz),
    a=hash3(i,j,salt),b=hash3(i+1,j,salt),c=hash3(i,j+1,salt),d=hash3(i+1,j+1,salt);return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;};
  const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};

  // ---- masks: the mapped glaciers, meadows, rock and the debris on the ice, wet ground by the streams, rasterised ----
  const B=C.bounds,[mx0,mz0]=P([B[2],B[1]]),[mx1,mz1]=P([B[0],B[3]]),CELL=20,GX=Math.ceil((mx1-mx0)/CELL)+2,GZ=Math.ceil((mz1-mz0)/CELL)+2;
  const mask=()=>new Uint8Array(GX*GZ);
  function fill(m,rings,val=255){   // even-odd scanline fill of rings ([x,z] in metres) into the mask
    let z0=Infinity,z1=-Infinity;for(const r of rings)for(const p of r){if(p[1]<z0)z0=p[1];if(p[1]>z1)z1=p[1];}
    const j0=Math.max(0,Math.floor((z0-mz0)/CELL)),j1=Math.min(GZ-1,Math.ceil((z1-mz0)/CELL));
    for(let j=j0;j<=j1;j++){const zc=mz0+(j+0.5)*CELL,xs=[];
      for(const r of rings)for(let k=0;k<r.length;k++){const a=r[k],b=r[(k+1)%r.length];if((a[1]>zc)!==(b[1]>zc))xs.push(a[0]+(zc-a[1])/(b[1]-a[1])*(b[0]-a[0]));}
      xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const i0=Math.max(0,Math.ceil((xs[k]-mx0)/CELL-0.5)),i1=Math.min(GX-1,Math.floor((xs[k+1]-mx0)/CELL-0.5));for(let i=i0;i<=i1;i++)m[j*GX+i]=val;}}}
  function line(m,pts,w,val=255){for(let k=0;k+1<pts.length;k++){const [ax,az]=pts[k],[bx,bz]=pts[k+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/(CELL*0.5))),R=Math.ceil(w/2/CELL);
    for(let s=0;s<=n;s++){const x=ax+(bx-ax)*s/n,z=az+(bz-az)*s/n,ci=Math.floor((x-mx0)/CELL),cj=Math.floor((z-mz0)/CELL);
      for(let dj=-R;dj<=R;dj++)for(let di=-R;di<=R;di++){const i=ci+di,j=cj+dj;if(i<0||j<0||i>=GX||j>=GZ)continue;if(Math.hypot(di,dj)*CELL>w/2+CELL*0.5)continue;m[j*GX+i]=Math.max(m[j*GX+i],val);}}}}
  const dec=a=>{const o=[];for(let i=0;i<a.length;i+=2)o.push([a[i]/10,a[i+1]/10]);return o;};
  const ringsOf=p=>[dec(p.o),...(p.i||[]).map(dec)];
  const GLA=mask(),MEA=mask(),ROC=mask(),DEB=mask(),WET=mask(),PUM=mask(),CLR=mask();
  for(const g of M.glaciers||[])fill(GLA,ringsOf(g));
  for(const g of M.meadows||[])fill(MEA,ringsOf(g));
  for(const g of M.rock||[])fill(ROC,ringsOf(g));
  for(const g of M.debris||[])fill(DEB,ringsOf(g));
  for(const s of M.streams||[])line(WET,dec(s.p),s.w>6?90:45,255);
  for(const p of K.pumice||[]){const [x,z]=P([p[0],p[1]]);const r=p[2],pts=[];for(let k=0;k<24;k++){const a=k/24*Math.PI*2;pts.push([x+Math.cos(a)*r*(0.8+vn(x+k*50,z,1,97)*0.4),z+Math.sin(a)*r*(0.8+vn(z+k*50,x,1,98)*0.4)]);}fill(PUM,[pts],p[3]==null?255:Math.round(p[3]*255));}
  // the ski runs and the lift lines: no trees on them, grass in summer, groomed snow in winter
  for(const r of M.pistes||[]){if(r.k!=='downhill')continue;if(r.area)fill(CLR,ringsOf(r));else line(CLR,dec(r.p),r.w||28,255);}   // the nordic trails run on roads and through the trees
  for(const l of M.lifts||[])line(CLR,dec(l.p),14,255);
  const samp=(m,x,z)=>{const fx=(x-mx0)/CELL-0.5,fz=(z-mz0)/CELL-0.5,i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j;if(i<0||j<0||i+1>=GX||j+1>=GZ)return 0;
    return ((m[j*GX+i]*(1-u)+m[j*GX+i+1]*u)*(1-v)+(m[(j+1)*GX+i]*(1-u)+m[(j+1)*GX+i+1]*u)*v)/255;};

  // ---- what lies at a point ----
  const [SX,SZ]=P(K.summit||C.origin),TINTS=(K.tints||[]).map(([la,lo,r,c,s])=>{const [x,z]=P([la,lo]);return [x,z,r,new THREE.Color(c),s==null?0.7:s];});
  const TL=K.treeLine||{north:1780,south:1960},EAST=K.eastDry||6000;
  const treeLineAt=(x,z)=>{const r=Math.hypot(x-SX,z-SZ)||1,south=((z-SZ)/r+1)/2;return TL.north+(TL.south-TL.north)*south+(vn(x,z,900,90)-0.5)*220;};
  // weights: forest, meadow, bare (rock, scree, pumice), glacier; and the deciduous share, debris, larch share
  function cover(x,z,h,slope,out){const g=samp(GLA,x,z),tl=treeLineAt(x,z),n=vn(x,z,600,92)*0.6+vn(x,z,150,93)*0.4,east=sm(EAST-3000,EAST+4000,x-SX);
    const alp=sm(tl-160,tl+120,h),steep=sm(0.8,1.15,slope),osmM=samp(MEA,x,z),osmR=samp(ROC,x,z);
    // the parkland: meadows mixed into the forest's top few hundred metres on gentle ground, and in the openings
    let mead=Math.max(osmM*(1-steep),sm(tl-420,tl-120,h)*(1-sm(tl+150,tl+350,h))*sm(0.42,0.6,n)*(1-sm(0.35,0.7,slope)));
    const pum=samp(PUM,x,z)*sm(1640+(n-0.5)*160,1880+(n-0.5)*160,h);   // the sands start round the tree line, ragged with the ground
    mead=Math.max(mead,samp(CLR,x,z)*(1-alp)*(1-sm(1650,1800,h))*0.55);   // the ski runs are grass in summer, down in the forest
    mead*=1-pum*0.75;   // the pumice sands: a few lupines and grasses in the grey
    let bare=Math.max(alp,steep*0.9,osmR,pum);
    let forest=Math.max(0,1-bare-mead);if(pum>0.3)forest*=1-pum*0.6;
    // the surveyed canopy (data/cities/mthood-canopy.json, the Forest Service's at 30 m), where there is one, is the
    // forest: the clearcuts, the burns (Dollar Lake, 2011, on the north side), the river bars and the parkland's
    // clumps as they are. What the rules called forest and the survey finds open is brush and young growth: meadow.
    const cc=CAN?CAN.at(x,z):null;
    if(cc!=null){const f2=sm(0.03,0.72,cc);mead=Math.max(mead*(f2<0.5?1:0.6),Math.max(0,forest-f2)*(1-alp)*0.75);forest=f2*(1-Math.max(steep*0.9,osmR,pum*0.8)*0.85);}
    if(g>0){forest*=1-g;mead*=1-g;bare*=1-g;}
    const wet=samp(WET,x,z)*(1-sm(1100,1400,h)),dec=Math.min(1,wet*0.75+(1-sm(500,900,h))*0.25*n)*forest;
    const larch=east*sm(850,1000,h)*(1-sm(1450,1650,h))*sm(0.45,0.7,vn(x,z,400,94))*forest*0.7;
    out[0]=forest;out[1]=mead;out[2]=bare;out[3]=g;out[4]=dec;out[5]=samp(DEB,x,z)*g;out[6]=larch;out[7]=n;return out;}
  // the summer's colour (the vertex colour); the season's changes are the shader's
  const col=h=>new THREE.Color(h),F_LOW=col('#1f3520'),F_MID=col('#233c25'),F_HIGH=col('#2c4630'),F_EAST=col('#3a4a2a'),MEADC=col('#56703a'),
    PUMC=col('#9a948a'),SCREE=col('#7a7068'),ROCK=[col('#5e5a58'),col('#6e6862'),col('#7a6a60'),col('#6a5a52'),col('#857a70')],RIVER=col('#8a8478'),tmp=new THREE.Color();
  function paint(x,z,h,slope,W,c){
    const fz=h<900?F_LOW:h<1500?F_MID:F_HIGH;tmp.copy(fz).lerp(F_EAST,sm(EAST-2000,EAST+5000,x-SX)*(1-sm(1300,1700,h))*0.7);
    tmp.multiplyScalar(0.85+hash3(Math.floor(x/40),Math.floor(z/40),95)*0.3);c.copy(tmp).multiplyScalar(W[0]);
    c.r+=MEADC.r*W[1];c.g+=MEADC.g*W[1];c.b+=MEADC.b*W[1];
    // bare ground: pumice sand where it is gentle and on the pumice fields, scree, and the rock of the cliffs banded with height
    const rk=ROCK[Math.floor((vn(x*0.15,h*2.5,1,96)*0.7+vn(x,z,120,97)*0.3)*ROCK.length)%ROCK.length];
    const pum=Math.max(samp(PUM,x,z),1-sm(0.35,0.7,slope))*(1-sm(0.6,0.9,slope));tmp.copy(rk).lerp(SCREE,sm(0.5,0.8,slope)*(1-sm(0.95,1.2,slope))*0.6).lerp(PUMC,pum*0.85);
    c.r+=tmp.r*W[2];c.g+=tmp.g*W[2];c.b+=tmp.b*W[2];
    c.r+=0.7*W[3];c.g+=0.78*W[3];c.b+=0.84*W[3];   // the ice under the snow; the shader draws it
    for(const [tx,tz,r,tc,s] of TINTS){const d=Math.hypot(x-tx,z-tz);if(d<r)c.lerp(tc,s*Math.min(1,(1-d/r)*1.8)*(1-W[3]));}
    c.multiplyScalar(0.94+vn(x,z,40,98)*0.12);return c;}

  // ---- the shader: the season on the ground ----
  const groundFrag=`
{vec3 base=diffuseColor.rgb;float y=vMhW.y;vec3 n=normalize(vMhN);float sl0=sqrt(max(0.0,1.0-n.y*n.y))/max(0.05,n.y);
 float nn=mhNoise(vMhW.xz*0.0033)*0.55+mhNoise(vMhW.xz*0.013)*0.3+mhNoise(vMhW.xz*0.06)*0.15;
 float north=clamp(-n.z*1.8,0.0,1.0)*smoothstep(0.06,0.3,sl0);
 float meadow=vMhC.y,gl=vMhC.w,bare=vMhC.z,forest=vMhC.x,below=uSnowLine-y;
 float dist=length(vMhW-cameraPosition);
 // the meadows: brown and matted as the snow goes, green, gold as they cure, red with huckleberry in autumn
 vec3 mc=mix(vec3(0.30,0.40,0.19),vec3(0.42,0.38,0.27),1.0-smoothstep(0.0,260.0,below));
 float grassN=mhNoise(vMhW.xz*0.02)*0.6+mhNoise(vMhW.xz*0.11)*0.4;
 mc=mix(mc,mix(vec3(0.56,0.48,0.28),vec3(0.66,0.55,0.32),grassN),uCure*smoothstep(120.0,700.0,below)*0.85);
 // huckleberry, mountain ash and vine maple: crimson and scarlet in clumps, not a wash over the whole park
 float shrubs=smoothstep(0.5,0.68,mhNoise(vMhW.xz*0.035)*0.4+mhNoise(vMhW.xz*0.16)*0.35+mhNoise(vMhW.xz*0.9)*0.25);
 mc=mix(mc,mix(vec3(0.48,0.10,0.07),vec3(0.62,0.22,0.08),mhNoise(vMhW.xz*0.3)),uAutumn*shrubs*0.9);
 mc=mix(mc,vec3(0.46,0.40,0.28),uAutumn*(1.0-shrubs)*0.35);
 base=mix(base,mc,meadow*0.9);
 // the flowers: a band a few hundred metres under the melting snow, dots near, a tint far
 float fb=uBloom*exp(-pow((y-uBloomH)/230.0,2.0))*meadow*step(0.0,below);
 if(fb>0.01){vec2 cell=floor(vMhW.xz*1.8);float h1=mhHash(cell),h2=mhHash(cell+17.3);
   vec3 fc=h2<0.32?vec3(0.40,0.34,0.80):h2<0.5?vec3(0.86,0.20,0.14):h2<0.72?vec3(0.96,0.95,0.86):h2<0.86?vec3(0.93,0.78,0.18):vec3(0.68,0.48,0.84);
   float nearF=1.0-smoothstep(120.0,520.0,dist);
   base=mix(base,fc,step(h1,fb*0.6*mhNoise(vMhW.xz*0.04+3.0)*1.6)*nearF);
   base=mix(base,vec3(0.52,0.44,0.62),fb*0.28*(1.0-nearF)*mhNoise(vMhW.xz*0.01));}
 // the forest seen as ground: its maples and alders yellow then bare, the larches gold, the vine maple red
 float dec=vMhD.x,larch=vMhD.z;
 base=mix(base,mix(vec3(0.66,0.50,0.12),vec3(0.62,0.26,0.08),nn),dec*uTurn*uLeaf*0.75+forest*uAutumn*0.14*smoothstep(0.55,0.8,nn));
 base=mix(base,vec3(0.72,0.56,0.16),larch*uTurn*uLeaf*0.85);
 base=mix(base,vec3(0.36,0.31,0.27),(dec+larch)*(1.0-uLeaf)*0.6);
 // the glaciers: bare ice in late summer, crevassed across the flow, grey with rubble on the debris-covered tongues
 vec2 fl=normalize(n.xz+vec2(1e-4));float cr=sin(dot(vMhW.xz,fl)*0.31+nn*11.0+mhNoise(vMhW.xz*0.02)*6.0);
 float crev=smoothstep(0.84,0.97,cr)*smoothstep(0.1,0.35,sl0)*(1.0-smoothstep(180.0,1400.0,dist)*0.7);
 vec3 ice=mix(vec3(0.66,0.76,0.83),vec3(0.80,0.86,0.90),smoothstep(2300.0,2800.0,y));
 ice=mix(ice,vec3(0.25,0.36,0.46),crev*0.85);ice=mix(ice,vec3(0.34,0.31,0.29)*(0.8+0.4*nn),vMhD.y*0.92);
 base=mix(base,ice,gl);
 // the ground close to: grass and litter mottled at a metre or two; the forest from afar: its crowns and the gaps between
 {float nearF=1.0-smoothstep(60.0,400.0,dist),m1=mhNoise(vMhW.xz*0.7),m2=mhNoise(vMhW.xz*0.17);
  base*=mix(1.0,0.8+0.4*(m1*0.6+m2*0.4),nearF*(1.0-gl));
  float crowns=mhNoise(vMhW.xz*0.09)*0.65+mhNoise(vMhW.xz*0.31)*0.35;base*=mix(1.0,0.72+0.5*crowns,forest*(1.0-nearF*0.6));
  // under the trees, close to: needles, duff and moss, not the canopy's green seen from above
  base=mix(base,mix(vec3(0.22,0.19,0.13),vec3(0.20,0.27,0.13),m2),forest*nearF*0.8);
  base*=mix(1.0,0.85+0.3*mhNoise(vMhW.xz*0.045),bare);
  base*=0.9+0.2*(mhNoise(vMhW.xz*0.028)*0.6+mhNoise(vMhW.xz*0.009)*0.4);}
 // the snow: the season's line, ragged with the ground, lower on the north faces and with fresh snow, shed by cliffs
 float sn2=mhNoise(vMhW.xz*0.0011)*0.5+mhNoise(vMhW.xz*0.0047)*0.3+mhNoise(vMhW.xz*0.021)*0.2;
 float sl=uSnowLine+(sn2-0.5)*300.0-north*260.0-uFresh*420.0;
 float sn=smoothstep(sl-160.0,sl+160.0,y);
 {float pn=mhNoise(vMhW.xz*0.006)*0.6+mhNoise(vMhW.xz*0.025)*0.4,ridge=smoothstep(0.0,0.35,-dot(n.xz,vec2(0.0))+sl0*0.4);
  float patchy=smoothstep(0.32,0.62,pn+(y-sl)/1400.0-ridge*0.12);sn*=mix(1.0,patchy,(1.0-uGlacier)*0.9);}
 sn=max(sn,gl*max(uGlacier,smoothstep(2650.0,2950.0,y)));   // the glaciers under winter snow; the firn up high all year
 sn=max(sn,north*smoothstep(2300.0,2600.0,y)*smoothstep(0.1,0.3,sl0)*0.9);   // the summer's snowfields on high north faces
 sn*=1.0-smoothstep(0.9,1.35,sl0)*0.85;
 {float crowns=mhNoise(vMhW.xz*0.09)*0.65+mhNoise(vMhW.xz*0.31)*0.35;sn*=1.0-forest*(0.25+0.35*crowns)*(1.0-smoothstep(0.5,1.0,uFresh)*0.5)*smoothstep(250.0,900.0,dist);}   // seen from afar the trees stand dark in it, crown by crown; under them it is snow
 base=mix(base,vec3(0.93,0.95,0.98)*(0.96+0.04*nn),clamp(sn,0.0,1.0));
 diffuseColor.rgb=base;}
`;
  const patchGround=mat=>patchMaterial(mat,'mhground',U,sh=>{
    sh.vertexShader='attribute vec4 aCov;attribute vec4 aCov2;varying vec4 vMhC;varying vec4 vMhD;varying vec3 vMhW;varying vec3 vMhN;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvMhC=aCov;vMhD=aCov2;vMhW=(modelMatrix*vec4(transformed,1.0)).xyz;vMhN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader=UNI+GLSL_NOISE+'varying vec4 vMhC;varying vec4 vMhD;varying vec3 vMhW;varying vec3 vMhN;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+groundFrag);});
  // the far Cascades: snow by the season's line, the glaciers of the big volcanoes white all year
  const patchFar=mat=>patchMaterial(mat,'mhfar',U,sh=>{
    sh.vertexShader='varying vec3 vMhW;varying vec3 vMhN;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvMhW=(modelMatrix*vec4(transformed,1.0)).xyz;vMhN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader=UNI+GLSL_NOISE+'varying vec3 vMhW;varying vec3 vMhN;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n{float y=vMhW.y;float nn=mhNoise(vMhW.xz*0.0011);float sl=uSnowLine+150.0+(nn-0.5)*400.0-uFresh*420.0;float sn=max(smoothstep(sl-120.0,sl+120.0,y),smoothstep(2350.0,2800.0,y+(nn-0.5)*300.0));sn*=1.0-smoothstep(0.75,1.0,1.0-vMhN.y)*0.0;'+
      'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.92,0.94,0.97),clamp(sn,0.0,1.0)*0.95);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.55,0.38,0.14),uTurn*uLeaf*0.12*(1.0-sn));}');});

  // ---- paint and tag every piece of ground: the 40 m grid, the fine patch over the mountain ----
  const W=new Float32Array(8),c=new THREE.Color();let painted=0;const done=new Set();
  function tagGround(m){if(done.has(m))return;done.add(m);const g=m.geometry,p=g.attributes.position,cl=g.attributes.color,nr=g.attributes.normal;if(!p||!cl)return;
    const A=new Uint8Array(p.count*4),A2=new Uint8Array(p.count*4);
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ny=nr?Math.max(0.05,nr.getY(i)):1,slope=Math.sqrt(Math.max(0,1-ny*ny))/ny;
      cover(x,z,y,slope,W);paint(x,z,y,slope,W,c);cl.setXYZ(i,c.r,c.g,c.b);
      A[i*4]=W[0]*255;A[i*4+1]=W[1]*255;A[i*4+2]=W[2]*255;A[i*4+3]=W[3]*255;A2[i*4]=W[4]*255;A2[i*4+1]=W[5]*255;A2[i*4+2]=W[6]*255;A2[i*4+3]=W[7]*255;painted++;}
    cl.needsUpdate=true;g.setAttribute('aCov',new THREE.BufferAttribute(A,4,true));g.setAttribute('aCov2',new THREE.BufferAttribute(A2,4,true));
    if(!m.material.userData.mh){patchGround(m.material);m.material.userData.mh=true;}}
  scene.traverse(m=>{if(m.isMesh&&(m.name==='terrain'||/^fine:/.test(m.name)))tagGround(m);});
  // the trails and tracks go under the snow in winter (the highways are ploughed: the streets keep their colour)
  let snowTr=0,snowTk=0;{const seen=new Set();scene.traverse(m=>{if(m.isMesh&&m.name==='trails'&&!seen.has(m.material)){seen.add(m.material);snowOnTop(m.material,U,{k:'trail',k2:'1.0',flat:true});snowTr++;}});}
  // and the forest roads and tracks (drawn brown, roadColours) go under it too; the grey asphalt is ploughed
  {const seen=new Set();scene.traverse(m=>{if(!m.isMesh||!/^(streets|sidewalks|bridges)$/.test(m.name))return;for(const mt of [].concat(m.material)){if(!mt||seen.has(mt)||mt.isShaderMaterial)continue;seen.add(mt);snowTk++;
    snowOnTop(mt,U,{k:'track',flat:true,k2:mt.vertexColors?'smoothstep(0.025,0.07,vColor.r-vColor.b)':'0.0'});}});}
  // the far ring past the backdrop, and the backdrop when it arrives (it is fetched)
  let farDone=false;const farHook=()=>{if(farDone)return;const b=scene.getObjectByName('backdrop');if(b){farDone=true;patchFar(b.material);}};

  // ---- the trees ----
  // each species: parts merged with vertex colours and a part code (0 bark, 1 evergreen, 2 deciduous leaves,
  // 3 shrub leaves that go red, 4 larch needles that go gold and fall)
  function merge(list){const pos=[],cl=[],pt=[];for(const [g,h,part] of list){const a=g.toNonIndexed().attributes.position.array,cc=new THREE.Color(h);for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);cl.push(cc.r,cc.g,cc.b);pt.push(part);}}
    const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));ge.setAttribute('aPart',new THREE.Float32BufferAttribute(pt,1));ge.computeVertexNormals();return ge;}
  const cyl=(r0,r1,h,s=5)=>new THREE.CylinderGeometry(r0,r1,h,s,1,true).translate(0,h/2,0),cone=(r,h,s=7)=>new THREE.ConeGeometry(r,h,s,1,true).translate(0,h/2,0);   // open-ended: the caps and the cones' bases are never seen
  // tiers of cones up a trunk: the conifers' silhouettes. [radius at the bottom, height, droop of the top]
  function conifer(H,R,tiers,bark,greens,o={}){const L=o.noTrunk?[]:[[cyl(H*0.012,H*0.022,H*(o.bole||0.3),5),bark,0]];
    for(let k=0;k<tiers;k++){const f=k/(tiers-1||1),y=H*(o.base||0.22)+(H*(1-(o.base||0.22))-H*0.16)*f,r=R*(1-f*0.82)*(o.taper?1-f*f*0.2:1),h=H*(o.tierH||0.24)*(1-f*0.4);
      const g=cone(r,h,o.sides||7).rotateY(k*0.9).translate((hash3(k,1,7)-0.5)*r*0.12,y,(hash3(k,2,7)-0.5)*r*0.12);L.push([g,greens[k%greens.length],o.part==null?1:o.part]);}
    const top=cone(R*0.16,H*0.2,5).translate(0,H*0.8,0);if(o.droop)top.rotateZ(o.droop);L.push([top,greens[0],o.part==null?1:o.part]);return merge(L);}
  function broad(H,R,bark,greens,part,o={}){const L=[[cyl(H*0.03,H*0.05,H*0.55,5),bark,0],[cyl(H*0.015,H*0.025,H*0.35,4).rotateZ(0.6).translate(H*0.05,H*0.4,0),bark,0],[cyl(H*0.015,H*0.025,H*0.33,4).rotateZ(-0.7).translate(-H*0.05,H*0.38,0.02),bark,0],[cyl(H*0.012,H*0.02,H*0.3,4).rotateX(0.7).translate(0,H*0.42,H*0.04),bark,0]];
    const n=o.blobs||5;for(let k=0;k<n;k++){const a=k/n*Math.PI*2+0.4,rr=R*(0.45+hash3(k,3,8)*0.3),g=new THREE.IcosahedronGeometry(R*(0.5+hash3(k,4,8)*0.25),1).scale(1,o.flat||0.75,1).translate(Math.cos(a)*rr,H*(0.62+hash3(k,5,8)*0.2),Math.sin(a)*rr);L.push([g,greens[k%greens.length],part]);}
    L.push([new THREE.IcosahedronGeometry(R*0.7,1).scale(1,0.8,1).translate(0,H*0.82,0),greens[0],part]);return merge(L);}
  function shrub(R,H,greens,part){const L=[];for(let k=0;k<4;k++){const a=k*1.7,g=new THREE.IcosahedronGeometry(R*(0.55+hash3(k,6,9)*0.3),0).scale(1,H/R*0.7,1).translate(Math.cos(a)*R*0.45,H*0.35,Math.sin(a)*R*0.45);L.push([g,greens[k%greens.length],part]);}return merge(L);}
  const SP={
    dfir:  {geo:conifer(46,5.2,7,'#5a4434',['#203a22','#243f26','#1d351f'],{bole:0.4,base:0.32,tierH:0.22}),h:[0.7,1.25]},          // Douglas-fir: tall, a long clear bole, ragged tiers
    whem:  {geo:conifer(38,4.8,7,'#5e4c40',['#243e26','#28442a'],{droop:0.35,tierH:0.25}),h:[0.7,1.2]},                                 // western hemlock: the leader droops
    cedar: {geo:conifer(36,5.6,6,'#7a4a34',['#2c4626','#30502c'],{bole:0.25,base:0.18,tierH:0.3,sides:8}),h:[0.7,1.2]},                 // western redcedar: broad, buttressed, by the water
    sfir:  {geo:conifer(34,3.6,8,'#6e6458',['#223c2c','#26422f'],{tierH:0.2,taper:true}),h:[0.75,1.2]},                                 // Pacific silver fir, noble fir: stiff tiers
    mhem:  {geo:conifer(20,3.0,7,'#5a4a40',['#2a4430','#2e4a34'],{droop:0.4,base:0.08,tierH:0.26}),h:[0.6,1.25]},                       // mountain hemlock: drooping, skirted to the ground
    subfir:{geo:conifer(16,1.5,8,'#7a7468',['#2a4434','#2e4a38'],{base:0.06,tierH:0.18,sides:6}),h:[0.6,1.3]},                          // subalpine fir: a narrow spire
    wbp:   {geo:broad(5,2.6,'#8a8478',['#3a5432','#425c38'],1,{blobs:4,flat:0.55}),h:[0.5,1.3]},                                          // whitebark pine: low, many-stemmed krummholz
    lodge: {geo:conifer(22,1.8,6,'#7a6a52',['#3a5634','#3e5a38'],{bole:0.5,base:0.5,tierH:0.2}),h:[0.7,1.2]},                           // lodgepole pine: a pole with a short crown
    pond:  {geo:conifer(34,4.4,5,'#a06a40',['#3c5630','#42603a'],{bole:0.55,base:0.55,tierH:0.22,sides:8}),h:[0.7,1.2]},                // ponderosa pine: orange bark, an open crown up high
    larch: {geo:conifer(32,3.4,7,'#6a4a34',['#5a7a3a','#62823e'],{base:0.3,tierH:0.2,part:4}),h:[0.75,1.2]},                            // western larch: needles that go gold and fall
    maple: {geo:broad(22,7,'#5a5040',['#3e6a2a','#467432','#3a6228'],2,{blobs:6}),h:[0.7,1.2]},                                           // bigleaf maple
    alder: {geo:broad(20,4.2,'#9a968c',['#3a5e2a','#406630'],2,{blobs:4,flat:0.9}),h:[0.7,1.2]},                                          // red alder: pale bark, by the streams and the roads
    vmaple:{geo:shrub(2.4,3.2,['#4a7a30','#527e34'],3),h:[0.7,1.3]},                                                                      // vine maple, under the trees: red in October
    huck:  {geo:shrub(0.9,0.8,['#3e6a2e','#46722e'],3),h:[0.7,1.4]}};                                                                     // huckleberry, in the openings: crimson in autumn
  const NAMES=Object.keys(SP);
  // the same trees in a few faces, for the tiles further off: three tiers of five-sided cones, a crown of two blobs
  const LO={dfir:conifer(46,5.2,3,'#5a4434',['#213b23'],{bole:0.4,base:0.32,tierH:0.34,sides:5,noTrunk:true}),whem:conifer(38,4.8,3,'#5e4c40',['#253f27'],{tierH:0.36,sides:5,noTrunk:true}),
    cedar:conifer(36,5.6,3,'#7a4a34',['#2d4727'],{bole:0.25,base:0.18,tierH:0.4,sides:5,noTrunk:true}),sfir:conifer(34,3.6,3,'#6e6458',['#233d2d'],{tierH:0.32,sides:5,noTrunk:true}),
    mhem:conifer(20,3.0,3,'#5a4a40',['#2b4531'],{base:0.08,tierH:0.38,sides:5,noTrunk:true}),subfir:conifer(16,1.5,3,'#7a7468',['#2b4535'],{base:0.06,tierH:0.34,sides:4,noTrunk:true}),
    lodge:conifer(22,1.8,2,'#7a6a52',['#3b5735'],{bole:0.5,base:0.5,tierH:0.3,sides:4,noTrunk:true}),pond:conifer(34,4.4,2,'#a06a40',['#3d5731'],{bole:0.55,base:0.55,tierH:0.3,sides:5,noTrunk:true}),
    larch:conifer(32,3.4,3,'#6a4a34',['#5b7b3b'],{base:0.3,tierH:0.32,part:4,sides:5,noTrunk:true}),maple:broad(22,7,'#5a5040',['#3f6b2b'],2,{blobs:2}),alder:broad(20,4.2,'#9a968c',['#3b5f2b'],2,{blobs:2,flat:0.9}),
    wbp:SP.wbp.geo,vmaple:SP.vmaple.geo,huck:SP.huck.geo};
  const treeMat=new THREE.MeshLambertMaterial({vertexColors:true});
  patchMaterial(treeMat,'mhtrees',U,sh=>{
    sh.vertexShader='attribute float aPart;varying float vPart;varying vec3 vMhW;varying float vUp;varying float vSeed;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n{vec4 w=vec4(transformed,1.0);vec3 nn=objectNormal;\n#ifdef USE_INSTANCING\nw=instanceMatrix*w;nn=mat3(instanceMatrix)*nn;vSeed=fract(sin(dot(instanceMatrix[3].xz,vec2(12.9898,78.233)))*43758.5453);\n#else\nvSeed=0.5;\n#endif\nvMhW=(modelMatrix*w).xyz;vUp=normalize(mat3(modelMatrix)*nn).y;vPart=aPart;}');
    sh.fragmentShader=UNI+GLSL_NOISE+'varying float vPart;varying vec3 vMhW;varying float vUp;varying float vSeed;\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
{float leafy=step(1.5,vPart);
 if(leafy>0.5){float shrubP=step(2.5,vPart)*step(vPart,3.5),larchP=step(3.5,vPart);
   float keep=uLeaf+(vSeed-0.5)*0.35;if(mhHash(floor(vMhW.xz*1.3)+floor(vMhW.y*1.3)*7.1)>keep)discard;
   vec3 ac=larchP>0.5?vec3(0.80,0.62,0.16):shrubP>0.5?mix(vec3(0.72,0.10,0.06),vec3(0.86,0.36,0.08),vSeed):mix(vec3(0.88,0.66,0.12),vec3(0.80,0.40,0.08),vSeed*vSeed);
   float t=shrubP>0.5?smoothstep(vSeed*0.45,vSeed*0.45+0.45,uAutumn+uTurn*0.5):smoothstep(vSeed*0.55,vSeed*0.55+0.4,uTurn);
   diffuseColor.rgb=mix(diffuseColor.rgb,ac,t);
   diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.15,1.2,0.9),(1.0-smoothstep(0.0,0.4,uLeaf-0.6))*(1.0-t)*0.5);}   // the light new green of spring
 float sl=uSnowLine-uFresh*420.0+(vSeed-0.5)*140.0;float s=smoothstep(sl-60.0,sl+60.0,vMhW.y)*smoothstep(0.05,0.55,vUp);
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.92,0.94,0.97),s*(leafy>0.5?0.5:0.88));}`);});
  // which tree grows here, from the cover and the height, the side of the mountain and the streams
  function species(x,z,h,W,r){const f=W[0],dec=W[4],lar=W[6],east=sm(EAST-2500,EAST+3500,x-SX),tl=treeLineAt(x,z);
    if(r<lar*0.9)return 'larch';
    if(r<dec*0.7)return hash3(x,z,61)<0.55?'alder':'maple';
    if(h>tl-60)return hash3(x,z,62)<0.6?'wbp':'subfir';
    if(h>tl-350)return hash3(x,z,63)<0.6?'mhem':(east>0.5&&hash3(x,z,64)<0.5?'wbp':'subfir');
    if(east>0.5&&h<1250){const q=hash3(x,z,65);return q<0.45?'pond':q<0.7?'dfir':q<0.88?'lodge':'sfir';}
    if(h>1250){const q=hash3(x,z,66);return q<0.45?'sfir':q<0.75?'mhem':east>0.3&&q<0.9?'lodge':'dfir';}
    const q=hash3(x,z,67);if(samp(WET,x,z)>0.4&&q<0.35)return 'cedar';return q<0.5?'dfir':q<0.85?'whem':q<0.93?'sfir':'cedar';}
  const TILE=K.tile||400,NEAR=K.near||1700,SPC=K.spacing||9,o3=new THREE.Object3D(),tiles=new Map();let nTrees=0;
  const CLEAR=(K.clearings||[]).map(([la,lo,r])=>{const [x,z]=P([la,lo]);return [x,z,r];});
  for(const [f] of Object.values(C.views||{})){const [x,z]=P(f);if(f[2]-groundH(x,z)<40)CLEAR.push([x,z,35]);}   // a viewpoint on the ground stands in an opening
  const slopeAt=(x,z)=>{const e=6,a=groundH(x+e,z)-groundH(x-e,z),b=groundH(x,z+e)-groundH(x,z-e);return Math.hypot(a,b)/(2*e);};
  const open=(x,z)=>samp(CLR,x,z)>0.4||CLEAR.some(([cx,cz,r])=>(x-cx)**2+(z-cz)**2<r*r)||(buildingsAt&&buildingsAt(x,z,7).length)||(roadsNear&&roadsNear(x,z,6).length);
  function build(T){const L={};for(const n of NAMES)L[n]=[];const sp=SPC*T.thin;
    for(let j=0;j<TILE/sp;j++)for(let i=0;i<TILE/sp;i++){const x=T.x0+(i+hash3(i,j,T.k))*sp,z=T.z0+(j+hash3(j,i,T.k+1))*sp;if(inWater(x,z))continue;
      const h=groundH(x,z),sl=slopeAt(x,z);cover(x,z,h,sl,W);const r=hash3(x,z,68);
      let n=null;
      if(r<W[0]*(1-sm(0.9,1.3,sl))*0.95){if(open(x,z))continue;n=species(x,z,h,W,hash3(z,x,69));}
      else if(W[1]>0.3&&r<W[0]+W[1]*0.08){if(open(x,z))continue;n=h>treeLineAt(x,z)-250?(hash3(x,z,70)<0.5?'mhem':'subfir'):'sfir';}   // tree islands in the parks
      else if(W[2]>0.5&&h<treeLineAt(x,z)+180&&r<0.05){const q=hash3(x,z,79);n=q<0.3?'wbp':q<0.65?'subfir':'mhem';}   // tree islands above the line: stunted fir and hemlock, a few whitebark pines
      else continue;
      const s=(SP[n].h[0]+hash3(x,z,71)*(SP[n].h[1]-SP[n].h[0]))*(h>treeLineAt(x,z)-200?0.75:1)*T.grow;
      o3.position.set(x,h-0.4,z);o3.rotation.set((hash3(x,z,72)-0.5)*0.04,hash3(x,z,73)*6.28,(hash3(z,x,74)-0.5)*0.04);o3.scale.set(s,s*(0.9+hash3(z,x,75)*0.25),s);o3.updateMatrix();L[n].push(o3.matrix.clone());
      // under the trees: vine maple in the lower forest, huckleberry in the openings and the parks
      if(T.thin===1){const r2=hash3(x,z,76);if(h<1300&&W[0]>0.5&&r2<0.12){o3.position.set(x+3,groundH(x+3,z+2)-0.2,z+2);o3.scale.setScalar(0.8+r2*3);o3.updateMatrix();L.vmaple.push(o3.matrix.clone());}
        else if(h>1150&&h<2000&&(W[1]>0.25||W[0]<0.7)&&r2<0.35){const dx=(hash3(x,z,77)-0.5)*8,dz=(hash3(z,x,78)-0.5)*8;if(!open(x+dx,z+dz)){o3.position.set(x+dx,groundH(x+dx,z+dz)-0.1,z+dz);o3.scale.setScalar(0.8+r2);o3.updateMatrix();L.huck.push(o3.matrix.clone());}}}}
    let y0=Infinity,y1=-Infinity;for(const [a,b] of [[0,0],[1,0],[0,1],[1,1],[0.5,0.5]]){const y=groundH(T.x0+a*TILE,T.z0+b*TILE);y0=Math.min(y0,y);y1=Math.max(y1,y);}T.y0=y0-40;T.y1=y1+40;T.inRange=true;
    const g=new THREE.Group();for(const n of NAMES){if(!L[n].length)continue;const im=new THREE.InstancedMesh(T.thin===1?SP[n].geo:LO[n],treeMat,L[n].length);L[n].forEach((m,i)=>im.setMatrixAt(i,m));im.castShadow=T.thin===1;im.receiveShadow=true;im.frustumCulled=false;im.userData.noFingerprint=true;im.userData.wireCat='trees';g.add(im);nTrees+=L[n].length;}
    g.userData.noFingerprint=true;scene.add(g);T.g=g;}

  // ---- the clock ----
  // each tile is culled whole against the view: an instanced mesh's own bounds are its template's, at the origin
  const frus=new THREE.Frustum(),pv=new THREE.Matrix4(),tbox=new THREE.Box3();let next=0;
  animHooks.push(()=>{camera.updateMatrixWorld();pv.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frus.setFromProjectionMatrix(pv);
    for(const T of tiles.values())if(T.g){if(!T.inRange){T.g.visible=false;continue;}tbox.min.set(T.x0,T.y0-5,T.z0);tbox.max.set(T.x0+TILE,T.y1+60,T.z0+TILE);T.g.visible=frus.intersectsBox(tbox);}});
  animHooks.push(now=>{farHook();
    // late ground: a page's own ground drawn after this ran (the fine patch's levels are all there from the start)
    if(now<next)return;next=now+120;const p=camera.position,ci=Math.floor(p.x/TILE),cj=Math.floor(p.z/TILE),R=Math.ceil(NEAR/TILE),hh=p.y-groundH(p.x,p.z),tb=performance.now();
    // the tiles that want building or rebuilding, nearest first, as many as 7 ms a tick allows (at least one)
    const todo=[];for(let dj=-R;dj<=R;dj++)for(let di=-R;di<=R;di++){const k=(ci+di)+','+(cj+dj),cx=(ci+di+0.5)*TILE-p.x,cz=(cj+dj+0.5)*TILE-p.z,d=Math.hypot(cx,cz),T=tiles.get(k);
      const want=d>NEAR+TILE*0.7||hh>NEAR*1.5?0:d<750?1:2;   // 1: full density near, 2: fewer trees, a little larger, further off
      if(want&&(!T||T.want!==want))todo.push([d,k,di,dj,want]);}
    todo.sort((a,b)=>a[0]-b[0]);
    for(const [d,k,di,dj,want] of todo){if(performance.now()-tb>7&&todo[0][1]!==k)break;const T0=tiles.get(k);if(T0&&T0.g){scene.remove(T0.g);T0.g.children.forEach(m=>m.dispose&&m.dispose());}
      const T={x0:(ci+di)*TILE,z0:(cj+dj)*TILE,k:(ci+di)*7919+(cj+dj)*104729,g:null,want,thin:want===1?1:2.1,grow:want===1?1:1.15};tiles.set(k,T);build(T);}
    for(const [k,T] of tiles){const d=Math.hypot(T.x0+TILE/2-p.x,T.z0+TILE/2-p.z);
      if(d>NEAR*2.6){if(T.g){scene.remove(T.g);T.g.children.forEach(m=>{nTrees-=m.count;m.dispose&&m.dispose();});}tiles.delete(k);continue;}   // let go of the forest left behind
      T.inRange=d<NEAR+TILE*1.5&&hh<NEAR*1.6;}
    api.ctx.details.ground={painted,ms:paintMs,tiles:tiles.size,trees:nTrees,snowTr,snowTk};});
  const paintMs=Math.round(performance.now()-t0);
  api.ctx.ground={winter:k=>{if(S&&S.freshSnow)S.freshSnow(k);},cover:(x,z)=>{const h=groundH(x,z);return Array.from(cover(x,z,h,slopeAt(x,z),W));},
    glacierAt:(x,z)=>samp(GLA,x,z),clearAt:(x,z)=>samp(CLR,x,z),snowOnTop:(m,o)=>snowOnTop(m,U,o),treeLineAt,patchMaterial:(m,k,fn)=>patchMaterial(m,k,U,fn),U};
  api.ctx.details=Object.assign(api.ctx.details||{},{ground:{painted,ms:paintMs,tiles:0,trees:0}});
}
