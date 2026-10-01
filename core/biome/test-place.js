// node core/biome/test-place.js: BIO.faceSamples' contract (40-core-place.js), each check with a negative.
// A plain list of geometries draws exactly what the sampler drew before shells existed (the
// pre-shell sampler is rebuilt below from the same core, so a change to it shows here); shells
// split the samples by share; without shells a big roof takes nearly all of them.
const fs=require('fs'),path=require('path'),vm=require('vm');
const D=__dirname,read=f=>fs.readFileSync(path.join(D,f),'utf8');
function core(placeSrc){const ctx={console,Math};vm.createContext(ctx);
 vm.runInContext(read('10-core-head.js')+'\nthis.BIO=BIO;',ctx);
 // 40 reads qEuler.. from BIO.fn (20-core-kit exports them); this test needs none of them
 vm.runInContext('Object.assign(BIO.fn,{qEuler:null,qFacing:null,qUp:null});',ctx);
 vm.runInContext(placeSrc,ctx);ctx.BIO.host={obstacles:[]};ctx.BIO.__ctx=ctx;return ctx.BIO;}
// a geometry: triangles given as [[x,y,z]x3...], with getX/getY/getZ like a BufferAttribute
function geo(tris){const a=[];tris.forEach(t=>t.forEach(p=>a.push(...p)));
 return{attributes:{position:{count:a.length/3,getX:i=>a[i*3],getY:i=>a[i*3+1],getZ:i=>a[i*3+2]}},index:null};}
const quad=(x0,z0,x1,z1,y)=>[[[x0,y,z0],[x0,y,z1],[x1,y,z1]],[[x0,y,z0],[x1,y,z1],[x1,y,z0]]];
const roof=geo(quad(0,0,100,100,20));                                  // 10,000 m^2
const ledges=geo([].concat(...Array.from({length:10},(_,i)=>quad(i*3,-5,i*3+1,-4,5))));   // 10 m^2
let fails=0;const check=(name,ok,detail)=>{console.log((ok?'ok   ':'FAIL ')+name+(detail?'  ('+detail+')':''));if(!ok)fails++;};
const NEW=core(read('40-core-place.js'));
// the pre-shell sampler, FROZEN here as the kits ran it before shells (core/biome at fbcda04), over the
// same core: a plain list must draw exactly what it drew
const PRE_SHELL=`BIO.faceSamples=function(geos,n,filt){const out=[];const F=[];let tot=0;
 for(const g of geos){const p=g.attributes.position;if(!p)continue;const idx=g.index?g.index.array:null;const cnt=idx?idx.length:p.count;
  for(let i=0;i<cnt;i+=3){const a=idx?idx[i]:i,b=idx?idx[i+1]:i+1,c=idx?idx[i+2]:i+2;
   const ax=p.getX(a),ay=p.getY(a),az=p.getZ(a),bx=p.getX(b),by=p.getY(b),bz=p.getZ(b),cx=p.getX(c),cy=p.getY(c),cz=p.getZ(c);
   const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az;
   let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz);if(l<1e-9)continue;nx/=l;ny/=l;nz/=l;
   if(filt&&!filt(nx,ny,nz))continue;
   const ar=l*.5;tot+=ar;F.push([ax,ay,az,bx,by,bz,cx,cy,cz,nx,ny,nz,ar,tot]);}}
 if(!F.length)return out;
 for(let k=0;k<n;k++){const r=rng()*tot;let lo=0,hi=F.length-1;while(lo<hi){const m=(lo+hi)>>1;if(F[m][13]<r)lo=m+1;else hi=m;}
  const f=F[lo];let u=rng(),v=rng();if(u+v>1){u=1-u;v=1-v;}const w=1-u-v;
  out.push({p:[f[0]*w+f[3]*u+f[6]*v,f[1]*w+f[4]*u+f[7]*v,f[2]*w+f[5]*u+f[8]*v],n:[f[9],f[10],f[11]],a:f[12]});}
 return out;};
`;
const OLD=core(read('40-core-place.js'));
vm.runInContext('(function(){const {rng}=BIO.fn;'+PRE_SHELL+'})();',OLD.__ctx);
check('the frozen pre-shell sampler is the one in use',!/geos\.some/.test(OLD.faceSamples.toString()));
NEW.fn.reseed(42);OLD.fn.reseed(42);
const a=NEW.upFaces([roof,ledges],400),b=OLD.upFaces([roof,ledges],400);
check('a plain list draws exactly what the pre-shell sampler drew',JSON.stringify(a)===JSON.stringify(b),a.length+' samples');
const onLedge=s=>s.p[1]<10;
check('without shells, the roof takes nearly all of them (the negative)',a.filter(onLedge).length<10,a.filter(onLedge).length+' of 400 on the ledges');
NEW.fn.reseed(42);
const c=NEW.upFaces([{geos:[roof],share:.2},{geos:[ledges],share:.8}],400),led=c.filter(onLedge).length;
check('shells split the samples by share',c.length===400&&led===320,led+' of '+c.length+' on the ledges');
NEW.fn.reseed(42);
const d=NEW.upFaces([{geos:[roof]},{geos:[ledges]}],401);
check('shells with no share split evenly, the last shell takes the remainder (round(200.5)=201 to the roof, 200 left)',d.length===401&&d.filter(onLedge).length===200,d.filter(onLedge).length+' of '+d.length);
NEW.fn.reseed(42);
const e=NEW.upFaces([{geos:[roof],share:1},ledges],100);
check('a plain geometry beside a shell is a shell of its own',e.length===100&&e.filter(onLedge).length===50,e.filter(onLedge).length+' of '+e.length);
// a shell with no face the filter accepts (a vertical wall asked for up-faces) takes no share
const wall=geo([[[0,0,0],[0,10,0],[10,10,0]],[[0,0,0],[10,10,0],[10,0,0]]]);
NEW.fn.reseed(42);
const g=NEW.upFaces([{geos:[ledges],share:.5},{geos:[wall],share:.5}],100);
check('a shell with no qualifying face gives its share to the others',g.length===100&&g.every(onLedge),g.length+' samples, '+g.filter(onLedge).length+' on the ledges');
NEW.fn.reseed(42);
const g2=NEW.upFaces([{geos:[wall]}],50);
check('only empty shells: no samples (nothing to place, nothing invented)',g2.length===0,g2.length+' samples');
const f=NEW.ledgePoints([{geos:[roof],share:.5},{geos:[ledges],share:.5}],40,2.5);
check('ledgePoints takes shells',Array.isArray(f)&&f.length>0,f.length+' points');
process.exit(fails?1:0);
