// ================================================================= HOST — the crag pillars
// A few free-standing rock pillars below the crag steps, the reference's pines-
// on-a-pillar: rock (megabreccia since pair 7, below; granite before) stacked in irregular, ledged drums, rust-stained,
// flat-topped. Host geometry like the tower: they are handed to NHL.dress(...,
// {kind:'crag'}) so the biome grows its crag pines, heath and lichen on them.
// Host-only. No plant is placed in this file.
const PILLARS=[];
// THE CRATER WALL'S ROCK (the final rebuild, pair 7, 2026-11-03; kits/resources/ROCK-PROPOSAL.md, "Where the biomes must change" 1): this flank is the Inner
// Wall's, and the geology bake (kits/resources/data/geology.json, 5.1) puts the wall in the `impact` province, so its crag steps (the 5.1 model's slump
// terraces) and the pillars below them are MEGABRECCIA, not granite: blocks of every rock (basalt black and red, gneiss, tuff, red sandstone, limestone,
// a finer breccia) at every angle in a grey matrix flecked with impact glass. The pillars draw KSTRATA's `megabreccia` recipe (swhighlands' `crest`) in
// full (strataColor, five texture units on their own material); the ground's steep faces draw it as KGROUND's `clast` kind in the same rocks
// (84-host-ground.js: no texture unit, the ground is near its sixteen). ?strata=0: the old granite on both
let STRATA=null;
function crestStrata(){if(STRATA||!BRECCIA_ON||!BIO.strata||typeof KSTRATA==='undefined')return STRATA;
 /* the recipe at the crags' scale: its blocks are 60 m (a crest's), so a pillar 10-25 m across stood inside one; 8 m blocks with a nested generation of
    1.4 m, the same rocks and matrix, so a pillar shows a dozen (a page recipe: KSTRATA.add; the Godthrone's crest keeps the 60 m one) */
 try{const R0=KSTRATA.recipe('megabreccia');if(R0&&!KSTRATA.RECIPES['nhl-crag-breccia'])KSTRATA.add(Object.assign({},R0,{name:'nhl-crag-breccia',blocks:Object.assign({},R0.blocks,{size:8,nest:{kind:'fine',size:1.4}})}));}catch(e){reportErr('strata recipe: '+e.stack);}
 try{STRATA=BIO.strata({recipe:KSTRATA.RECIPES['nhl-crag-breccia']?'nhl-crag-breccia':'megabreccia',seed:86077,range:[-400,2800],dip:[.55,.83,.006],warp:[7,2],dust:0x8a8676,res:.25,private:true});}catch(e){reportErr('strata: '+e.stack);STRATA=null;}
 return STRATA;}
function buildPillars(){const geos=[],rock=[],pal=[0x8a8c86,0x7a7c76,0x9a9a92,0x6e706a];reseed(86031);
 // the spots: just under each scarp's foot, away from the stream, where the step is tall
 for(const Sc of SCARPS){for(let t=-1500;t<=1500;t+=270){const k=scarpAt(Sc,Sc.s0,t);if(k.a<Sc.amp*.7)continue;if(Math.abs(t-tStream(k.sc))<190)continue;if(rng()<.45)continue;
  const s=k.sc-rr(35,70),p=xzOf(s,t+rr(-60,60));if(Math.abs(p[0])>3000||Math.abs(p[1])>3000)continue;if(PILLARS.some(q=>Math.hypot(q.x-p[0],q.z-p[1])<220))continue;
  PILLARS.push({x:p[0],z:p[1],H:rr(28,62),R:rr(7,13)});if(PILLARS.length>=6)break;}}
 PILLARS.forEach((P,pi)=>{let y0=1e9;for(let a=0;a<TAU;a+=.5)y0=Math.min(y0,terrainH(P.x+Math.cos(a)*P.R,P.z+Math.sin(a)*P.R));y0-=2;P.y0=y0;
  const ns=9,drums=Math.round(P.H/7),pos=[],col=[],c=new THREE.Color();let y=y0,rc=P.R;const rad=[];for(let k=0;k<ns;k++)rad.push(rr(.75,1.15));
  const ring=(yy,r,ph)=>{const o=[];for(let k=0;k<=ns;k++){const a=k/ns*TAU+ph,rk=rad[k%ns]*(1+.12*Math.sin(a*3+yy*.07));o.push([P.x+Math.cos(a)*r*rk,yy,P.z+Math.sin(a)*r*rk]);}return o;};
  const quad=(a,b,cc,d,col0)=>{[a,b,cc,a,cc,d].forEach(q=>{pos.push(q[0],q[1],q[2]);});for(let i=0;i<6;i++)col.push(col0.r,col0.g,col0.b);};
  for(let dI=0;dI<drums;dI++){const h=P.H/drums*rr(.8,1.2),r0=rc,r1=r0*rr(.96,1),ph=0,ledge=r1*rr(.9,.96);rc=Math.min(r1*.995,ledge*rr(1.02,1.08));   // each drum within the one below: no overhang shows its hollow underside
   const A=ring(y,r0,ph),Bq=ring(y+h,r1,ph),L=ring(y+h,ledge,ph);
   c.set(pick(pal)).lerp(new THREE.Color(0x8a5a3a),rr(0,.25));c.convertSRGBToLinear();
   for(let k=0;k<ns;k++){quad(A[k],Bq[k],Bq[k+1],A[k+1],c);quad(Bq[k],L[k],L[k+1],Bq[k+1],c);}
   y+=h;if(dI<drums-1)for(let k=0;k<=ns;k++)rad[k%ns]*=rr(.97,1.03);}
  // the flat top
  const top=ring(y,rc,0);c.set(0x6a6c64).convertSRGBToLinear();for(let k=0;k<ns;k++){[top[k],[P.x,y+.4,P.z],top[k+1]].forEach(q=>pos.push(q[0],q[1],q[2]));for(let i=0;i<3;i++)col.push(c.r,c.g,c.b);}
  P.top=y;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const uvs=[];for(let i=0;i<pos.length;i+=3)uvs.push((pos[i]+pos[i+2])/7,pos[i+1]/7);g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.computeVertexNormals();
  geos.push(g);
  OBSTACLES.push({x:P.x,z:P.z,r:P.R*1.2+2,y0:y0-5,y1:y+30});
  REGISTER({name:'Crag pillar '+(pi+1),kind:'rock',x:P.x,z:P.z,y:y0,r:P.R*1.2,h:y-y0+20});});
 if(geos.length){const tex=NHL.ROCKTEX,m=new THREE.MeshLambertMaterial({map:tex,vertexColors:true});
  const S=crestStrata();
  /* the megabreccia: the block's colour from KSTRATA over the drums' rust and lichen tint (the vertex colour, about its grey mean), the old granite map as
     the grain (about its mean); the glass flecks and the blocks' edges are the recipe's (35-core-strata-shade.js) */
  if(S)m.onBeforeCompile=sh=>{S.inject(sh);sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',['#include <color_fragment>',
    /* the grain: the map's texel against its own mean (its last mip, decoded as map_fragment decodes it); the drums' tint against the palette's mean (.23) */
    '{vec3 kb=strataColor(vSWP,vSWN);vec3 mm=mapTexelToLinear(texture2D(map,vUv,16.0)).rgb;float gr=clamp(dot(texelColor.rgb,vec3(0.333))/max(dot(mm,vec3(0.333)),0.02),0.5,1.6);',
    ' diffuseColor.rgb=kb*gr*clamp(vColor/0.23,vec3(0.7),vec3(1.3));}'].join('\n'));};
  if(S)m.customProgramCacheKey=()=>'nhl-pillar-breccia';
  geos.forEach(g=>{const mm=new THREE.Mesh(g,m);mm.userData.inspectLabel=S?'Crag pillar (megabreccia: the crater wall)':'Crag pillar (granite)';mm.userData.host=true;mm.userData.rock=true;scene.add(mm);});}
 return geos;}
