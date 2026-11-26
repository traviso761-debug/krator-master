// node biomes/copperglacier/res_site.js <px> <py> [<half-width m>]: the resource data round one station, read at build time (build.py writes it into
// the page as CG_RES; geology.json is 4.4 MB, too big to carry). From kits/resources (RES_GEO, the 2026-11-03 rebake), nothing invented:
//   nodes   every node (all families) inside the page's square, in the page's frame (x = gx - px*2000, z = gz - py*2000), with id, kind and grade
//   cells   the prospectivity bytes on the data's own 4 km cells over the square and one cell round it (copper, iron, gold, tin, silver, skarn, stone,
//           marble), with each cell's province: the page reads copper ground from them, nearest cell, as the node field does
// The same input gives the same output (KRAND, integer hashes): the page is deterministic.
const fs=require('fs'),path=require('path');global.window=global;
const ROOT=path.join(__dirname,'..','..');
eval(fs.readFileSync(path.join(ROOT,'core','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(ROOT,'kits','resources','src','45r-res-field.js'),'utf8')+';global.RES_GEO=RES_GEO;');
RES_GEO.load(JSON.parse(fs.readFileSync(path.join(ROOT,'kits','resources','data','geology.json'),'utf8')));
const px=+process.argv[2],py=+process.argv[3],HW=process.argv[4]==null?3000:+process.argv[4],cx=px*2000,cz=py*2000;
const nodes=RES_GEO.nodesIn({x0:cx-HW,z0:cz-HW,x1:cx+HW,z1:cz+HW},{}).map(n=>({id:n.id,kind:n.kind,grade:n.grade,x:Math.round(n.x-cx),z:Math.round(n.z-cz)}))
 .sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
const FAM=['copper','iron','gold','tin','silver','skarn','stone','marble'],cells=[];
for(let gz=cz-HW-4000;gz<=cz+HW+4000;gz+=4000)for(let gx=cx-HW-4000;gx<=cx+HW+4000;gx+=4000){const a=RES_GEO.at(gx,gz);if(!a)continue;
 const c={x:Math.round(gx-cx),z:Math.round(gz-cz),province:a.province};FAM.forEach(f=>c[f]=a.p[f]|0);cells.push(c);}
const at=RES_GEO.at(cx,cz);
process.stdout.write(JSON.stringify({site:{px,py},province:at?at.province:null,p:at?at.p:null,nodes,cells}));
