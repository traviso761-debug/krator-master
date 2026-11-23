// ================================================================= VIRIDIAN — the ground at 1:1: the hollow, the terraces, the pads
// settlements/viridian/PLAN.md sections 1 and 6. The page stands on the scale model's cut round px 962,1562 (region/data,
// gen/39vt-world-data.js) through the open world's fields (core/world/41-world-fields.js: WORLD.H), in world metres x = (px -
// origin)*2000, z likewise, the page's origin the house's court (VT_SITE, 89z-rows.js). On it:
//   the terraces  the tea gardens (src/40-vt-estate.js, VTE.terraces): core/terrain's KRELIEF.terraces records, each held to
//                 its polygon and to the heights its ground really has here (read off WORLD.H)
//   the pads      VT_PADS: a level each (the mean of the ground under it, cut and filled), blended over a skirt by terrainH, over
//                 the terraces; 90vb draws the retaining faces where one stands off the ground
//   the places    vtPut: a building at (x, z) turned ry (0: its front south; -PI/2: west, down the hollow), on its own pad
//   the hedges    VT_HEDGES: every row of tea on every tread (VTE.hedges on the ground under the terraces): painted on the near
//                 ground everywhere (90va) and drawn whole on the fine ground (90vb)
// Nothing here draws. [G data]: no THREE, no DOM.
reseed(34363);
const VT_O=WORLD_DATA.meta.frame.origin_px,vtWx=px=>(px-VT_O[0])*2000,vtWz=py=>(py-VT_O[1])*2000;
const VT={PX:VT_SITE.PX,BOX:VT_SITE.BOX,FINE:VT_SITE.FINE};
VT.WX=vtWx(VT.PX[0]);VT.WZ=vtWz(VT.PX[1]);   /* the page's origin in world metres */
const vtSm=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
WORLD.init(WORLD_R);
const vtBase=(x,z,mw)=>WORLD.H(x+VT.WX,z+VT.WZ,mw==null?0:mw);
// ---------------------------------------------------------------- the terraces: the plan's gardens on this ground
// each garden's band: the heights of the ground over its polygon (a 20 m grid), so the treads run to its edges and no further
const VT_BANDS={};
for(const G of VTE.GARDENS){let lo=1e9,hi=-1e9;const P=G.poly,x0=Math.min(...P.map(p=>p[0])),x1=Math.max(...P.map(p=>p[0])),z0=Math.min(...P.map(p=>p[1])),z1=Math.max(...P.map(p=>p[1]));
 for(let x=x0;x<=x1;x+=20)for(let z=z0;z<=z1;z+=20){const h=vtBase(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}
 VT_BANDS[G.id]=[Math.floor(lo)-12,Math.ceil(hi)+12];}
const VT_TERR=VTE.terraces(VT_BANDS);
const vtTerraced=(x,z,g)=>{for(const R of VT_TERR)g=KRELIEF.shape(R,x,z,g);return g;};
// ---------------------------------------------------------------- the pads
const VT_PADS=[];
function vtLevel(x0,z0,x1,z1){let s=0,n=0;for(let i=0;i<=4;i++)for(let j=0;j<=4;j++){s+=vtTerraced(x0+(x1-x0)*i/4,z0+(z1-z0)*j/4,vtBase(x0+(x1-x0)*i/4,z0+(z1-z0)*j/4));n++;}return Math.round(s/n*2)/2;}
function vtPad(id,x0,z0,x1,z1,y,skirt){const P={id,x0:Math.min(x0,x1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),z1:Math.max(z0,z1),skirt:skirt==null?5:skirt};P.y=y==null?vtLevel(P.x0,P.z0,P.x1,P.z1):y;VT_PADS.push(P);return P;}
function vtPadAt(x,z){for(let i=VT_PADS.length-1;i>=0;i--){const p=VT_PADS[i];if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1)return p;}return null;}
const _vtT={x:NaN,z:NaN,h:0};
terrainH=function(x,z){if(x===_vtT.x&&z===_vtT.z)return _vtT.h;let h=vtTerraced(x,z,vtBase(x,z));
 for(const p of VT_PADS){const dx=Math.max(p.x0-x,0,x-p.x1),dz=Math.max(p.z0-z,0,z-p.z1);if(dx>=p.skirt||dz>=p.skirt)continue;const d=Math.hypot(dx,dz);if(d>=p.skirt)continue;h+=(p.y-h)*(1-vtSm(0,p.skirt,d));}
 _vtT.x=x;_vtT.z=z;_vtT.h=h;return h;};
// ---------------------------------------------------------------- the places
const VT_PLACE=[];
// a building at page (x, z), its front turned by ry, o its options; pad: its own pad (its footprint turned, plus 3 m, at the
// mean under it) unless o.y gives its level (it stands on a terrace's pad)
function vtPut(key,x,z,ry,o,kind,id,pad){const D=VERN.defs[key];if(!D)throw new Error('viridian: no def '+key);
 const q={key,x,z,ry,o:Object.assign({v:0},o||{}),kind,id:id||kind+':'+key+':'+x+','+z,h:D.h==null?10:D.h,w:D.fw==null?D.w:D.fw,d:D.fd==null?D.d:D.fd};
 if(pad!==false&&q.o.y==null){const side=Math.abs(Math.sin(ry))>.5,hw=(side?q.d:q.w)/2+3,hd=(side?q.w:q.d)/2+3;q.pad=vtPad('pad:'+q.id,q.x-hw,q.z-hd,q.x+hw,q.z+hd,null,6);q.o.y=q.pad.y;}
 VT_PLACE.push(q);return q;}
// ---------------------------------------------------------------- the hedges (traced by 89zvb once every pad is cut)
// every row on every tread, traced on the ground under the terraces (4 m contouring for the paint over the whole estate; 2 m
// for the rows drawn whole on the fine ground); a hedge where a pad was cut into the garden is dropped
function vtHedges(){const off=p=>!vtPadAt(p.x,p.z);
 return{paint:VT_TERR.map(R=>VTE.hedges(R,vtBase,{cell:4,step:1}).filter(off)),fine:VT_TERR.map(R=>VTE.hedges(R,vtBase,{cell:2,step:1.6,box:VT.FINE}).filter(off))};}
// ---------------------------------------------------------------- the flora's mask and fields (the Vale of Xanadu's biome)
// the forest and the coppice on the open slopes (1); in the tea gardens a shade tree here and there (.05: the tea estates'
// own); nothing on a pad, a way, a court or a building's footprint, or off the near ground. The fields as the biome reads them:
// 'wet' over .7 (the mist belt: forest), 'upland' by height (the scarp's face upward), mist rising toward the cloud bank
const vtSegD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;let t=l?((x-a[0])*dx+(z-a[1])*dz)/l:0;t=t<0?0:t>1?1:t;return Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z);};
const vtInGarden=(x,z)=>VT_TERR.some(R=>{const a=KRELIEF.at(R,x,z,vtBase(x,z));return !!a;});
function vtBioMask(x,z){const B=VT.BOX;if(x<B[0]+20||x>B[2]-20||z<B[1]+20||z>B[3]-20)return 0;
 for(const p of VT_PLACE){const r=Math.hypot(p.w==null?10:p.w,p.d==null?10:p.d)/2+3;if(Math.abs(x-p.x)<r&&Math.abs(z-p.z)<r&&Math.hypot(x-p.x,z-p.z)<r)return 0;}
 if(vtPadAt(x,z))return 0;
 for(const b of VT_PAVED)if(x>=b[0]-2&&x<=b[2]+2&&z>=b[1]-2&&z<=b[3]+2)return 0;
 for(const [k,w,P] of VT_WAYS)for(let i=0;i+1<P.length;i++)if(vtSegD(x,z,P[i],P[i+1])<w/2+2)return 0;
 if(vtInGarden(x,z))return .05;
 return 1;}
const VT_WOODN=KRELIEF.noise(34364);
if(typeof BIO!=='undefined'&&BIO.host)Object.assign(BIO.host,{mask:x=>0,origin:VT_SITE.bio.origin,center:VT_SITE.bio.center,
 fields:{wet:(x,z)=>Math.min(1,.7+.3*VT_WOODN.fbm(x/500+1.3,z/500-4.1,3)),salt:()=>0,upland:(x,z)=>Math.max(0,Math.min(1,(terrainH(x,z)-600)/3000)),flow:()=>0,
  mist:(x,z)=>Math.max(0,Math.min(.6,(terrainH(x,z)-750)/700))}});
