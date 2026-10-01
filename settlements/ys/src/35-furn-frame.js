// ================================================================= FURNITURE — the Ancients-lineage F adapter (kits/furniture/SPEC.md)
// A furniture piece is data (FURN) plus a build(F) that draws only through F.*: instanced primitives in a local frame
// (origin at the footprint centre on the anchor plane, +z the front, y up, metres) and merged shell surfaces for lathes
// and tubes. buildFurn(key,x,z,ry,{y,seed,variant,wealth}) draws one piece in WORLD space (the interior placer's call;
// a builder placing its own furniture converts with hykW first). The spec's name buildFurn is an alias of placeFurn
// (build.py's rule: a function named build… must open with a seed). Promote to kits/furniture/host/ when a second
// build needs it.
const FURNS=[],FURN_BY_KEY={},FURN_PLACED=[];
const FURN_TYPES=['table','chair','bench','bed','storage','shelf','lamp','stove','altar','fountain','statue','planter','rug','screen','rack','jar','basin','cradle','chest','stool','niche','counter','tool'];
const FURN_CULTURES=['hykkousoi','ancients','iziz','republic','voth'];
function FURN(o){if(!o||!o.key){reportErr('FURN: no key');return null;}if(FURN_BY_KEY[o.key]){reportErr('FURN: duplicate key '+o.key);return null;}
 if(FURN_CULTURES.indexOf(o.culture)<0)reportErr('FURN '+o.key+': culture must be one of '+FURN_CULTURES.join(' '));
 if(FURN_TYPES.indexOf(o.type)<0)reportErr('FURN '+o.key+': type must be one of '+FURN_TYPES.join(' '));
 if(['indoor','outdoor','both'].indexOf(o.setting)<0)reportErr('FURN '+o.key+': setting is indoor|outdoor|both');
 if(!o.rooms||!o.rooms.length)reportErr('FURN '+o.key+': rooms is required');
 if(!(o.w>0&&o.d>0&&o.h>0))reportErr('FURN '+o.key+': w, d, h must be positive');
 if(typeof o.build!=='function')reportErr('FURN '+o.key+': build must be a function');
 o.variants=o.variants||1;o.anchor=o.anchor||'floor';o.clearance=o.clearance||{};o.materials=o.materials||['shell'];FURNS.push(o);FURN_BY_KEY[o.key]=o;return o;}
// the primitives, one kdef per shape and material family (shell matte, nacre, bone, weed cloth, lens glass, barnacle, dark).
// Called from the end of 60-hyk-mat.js: the Hykkousoi materials do not exist when this fragment loads.
function hykFurnKitDefs(){const G={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(.5,.5,1,14),cone:new THREE.CylinderGeometry(0,.5,1,14),ball:new THREE.SphereGeometry(.5,14,10),dome:new THREE.SphereGeometry(.5,14,8,0,TAU,0,Math.PI/2)};
 const M={shell:'hkFloorI',nacre:'hkNacreI',bone:'hkBoneI',weed:'hkWeedI',lens:'hkLens',barn:'hkBarnI',dark:'guts'};
 for(const g in G)for(const m in M){const mat=MAT[M[m]];if(!mat){reportErr('furniture: no material '+M[m]);continue;}kdef('furn_'+g+'_'+m,G[g],mat);}}
function furnFrame(x,z,ry,opt){opt=opt||{};const F={x,z,ry:ry||0,y:opt.y!=null?opt.y:terrainH(x,z),seed:opt.seed||1,variant:opt.variant||0,wealth:opt.wealth==null?.5:opt.wealth,name:opt.name||''};
 let st=(F.seed*2654435761)>>>0;F.rnd=()=>{st=(Math.imul(st,1664525)+1013904223)>>>0;return st/4294967296;};
 F.rr=(a,b)=>a+(b-a)*F.rnd();F.chance=p=>F.rnd()<p;
 F.pick=k=>{const v=HPAL[k];const arr=Array.isArray(k)?k:Array.isArray(v)?v:v!=null?[v]:HPAL.shell;return hC(arr[Math.floor(F.rnd()*arr.length)%arr.length]);};   // a THREE.Color from a palette key (an array or one hex) or an array of hexes
 F.p=(lx,lz)=>loc(F.x,F.z,lx,lz,F.ry);F.P=(lx,ly,lz)=>{const q=loc(F.x,F.z,lx,lz,F.ry);return [q[0],F.y+ly,q[1]];};
 F.dir=(lx,lz)=>[lx*Math.cos(F.ry)+lz*Math.sin(F.ry),-lx*Math.sin(F.ry)+lz*Math.cos(F.ry)];
 const q=(rot)=>Array.isArray(rot)?qEuler(rot[0]||0,F.ry+(rot[1]||0),rot[2]||0):qEuler(0,F.ry+(rot||0),0);const mk=(m)=>m||'shell';   // rot: a yaw, or [rx,ry,rz] (a leaning piece)
 // instanced primitives: (lx,ly,lz) the centre (ly = height of the centre above the anchor plane), sizes in metres
 F.box=(lx,ly,lz,w,h,d,rot,col,m)=>{const p=F.P(lx,ly,lz);kput('furn_box_'+mk(m),p,q(rot),[w,h,d],col);};
 F.cyl=(lx,ly,lz,r,h,col,m,rot)=>{const p=F.P(lx,ly,lz);kput('furn_cyl_'+mk(m),p,q(rot),[r*2,h,r*2],col);};
 F.cone=(lx,ly,lz,r,h,col,m)=>{const p=F.P(lx,ly,lz);kput('furn_cone_'+mk(m),p,null,[r*2,h,r*2],col);};
 F.ball=(lx,ly,lz,r,col,m)=>{const p=F.P(lx,ly,lz);kput('furn_ball_'+mk(m),p,null,[r*2,r*2,r*2],col);};
 F.blob=(lx,ly,lz,rx,ry2,rz,col,m,rot)=>{const p=F.P(lx,ly,lz);kput('furn_ball_'+mk(m),p,q(rot),[rx*2,ry2*2,rz*2],col);};
 F.dome=(lx,ly,lz,r,h,col,m)=>{const p=F.P(lx,ly,lz);kput('furn_dome_'+mk(m),p,null,[r*2,h*2,r*2],col);};
 // merged shell surfaces, in world space: a lathe (profile [[r,y],...] bottom to top about a vertical axis at lx,lz) and a tube
 const matOf=m=>({shell:'hkFloor',nacre:'hkNacre',bone:'hkBone',weed:'hkWeed',lens:'hkLens',barn:'hkBarn',dark:'guts'})[m||'shell']||'hkFloor';
 // lathe options pass through to hykLathe (lobes flute rings noise twist tilt ops flip); scale:[sx,sz] stretches the lathe
 // about its axis before the put (an oval basin); flip winds the surface inward (a bowl's inner skin: draw the profile twice)
 F.lathe=(lx,lz,prof,col,m,o)=>{o=o||{};const H=prof[prof.length-1][1]-prof[0][1];const y0=prof[0][1];const rAt=y=>{const yy=y0+y;for(let i=1;i<prof.length;i++){if(yy<=prof[i][1]){const a=prof[i-1],b=prof[i];const t=(yy-a[1])/Math.max(1e-6,b[1]-a[1]);return a[0]+(b[0]-a[0])*t;}}return prof[prof.length-1][0];};
  const w=F.P(lx,0,lz);const lo={H:Math.max(.01,H),cx:w[0],cz:w[2],yBase:w[1]+y0,rFn:rAt,nu:o.nu||20,nv:o.nv||Math.max(4,prof.length*3),col};
  for(const k of ['lobes','flute','rings','noise','twist','tilt','ops','flip'])if(o[k]!=null)lo[k]=o[k];
  const g=hykLathe(lo);if(o.scale){const sx=o.scale[0]||1,sz=o.scale[1]||1;if(sx!==1||sz!==1){g.translate(-w[0],0,-w[2]);if(F.ry)g.rotateY(-F.ry);g.scale(sx,1,sz);if(F.ry)g.rotateY(F.ry);g.translate(w[0],0,w[2]);}}
  hykPutRaw(matOf(m),g,!!o.inside);return g;};
 F.tube=(pts,r,col,m,o)=>{o=o||{};const P=pts.map(p=>F.P(p[0],p[1],p[2]));const g=hykTube(P,typeof r==='function'?r:()=>r,{seg:o.seg||8,col,flip:o.flip});hykPutRaw(matOf(m),g,!!o.inside);return g;};
 // a lamp; o.bracket is in the piece's frame like everything else here (hykLight takes it in its own frame)
 F.light=(lx,ly,lz,o)=>{const p=F.P(lx,ly,lz);o=Object.assign({kind:'jar'},o||{});if(o.bracket){const b=F.P(o.bracket[0],o.bracket[1],o.bracket[2]);o.bracket=b;}
  const mk2=hykLight(p[0],p[1],p[2],o);if(mk2&&F.bld){mk2.bld=F.bld.id;mk2.key=F.bld.key;mk2.name=F.bld.name;}return mk2;};
 return F;}
function placeFurn(key,x,z,ry,opt){const D=FURN_BY_KEY[key];if(!D){reportErr('placeFurn: no such piece '+key);return null;}opt=opt||{};
 const F=furnFrame(x,z,ry,Object.assign({name:D.name},opt));const c=HYK.cur;const t0=TSTAT.cur;if(!t0)TSTAT.cur='furn/'+key;
 // every F path lands in world space: a builder's frame (HYK.cur.G), KXF and KOFF are stood down round the build
 if(c)F.bld={id:c.id,key:c.key,name:c.name};const kx=KXF,ko=KOFF;KXF=null;KOFF=[0,0,0];HYK.cur=null;
 try{D.build(F);}catch(e){reportErr('furniture '+key+' '+e.stack);}
 KXF=kx;KOFF=ko;HYK.cur=c;TSTAT.cur=t0;const rec={key,x,z,ry:ry||0,y:F.y,w:D.w,d:D.d,h:D.h,variant:F.variant,bld:c?c.id:null,room:opt.room!=null?opt.room:null};FURN_PLACED.push(rec);return rec;}
const buildFurn=placeFurn;
