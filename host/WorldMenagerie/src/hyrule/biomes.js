// ---------- the biomes, as the page reads them ----------
// The generator (tools/make-hyrule.py, BIOMES) lays the country out in biomes read off the map - grassland,
// highland evergreens, temperate woods, the Lost Woods, jungle, wetland marsh, desert dunes, red-rock canyon, arid
// highland, tundra, snowfield, autumn woods, volcanic ash - and writes them as a raster of 48 m cells. This reads it:
//   biomeKit(plan).w(x,z)    -> {g:..,H:..,...}: how much of each biome there is here, softened over the
//                              neighbouring cells so edges blend over a hundred-odd metres, not a step
//   biomeKit(plan).at(x,z)   -> the one key of the cell
export function biomeKit(PL){
  const B=PL&&PL.biomes;
  if(!B)return {w:()=>({g:1}),at:()=>'g'};
  const {step,x0,z0,nx,nz,rows}=B;
  const at=(x,z)=>{const i=Math.floor((x-x0)/step),j=Math.floor((z-z0)/step);if(i<0||j<0||i>=nx||j>=nz)return 'g';return rows[j][i];};
  // a 5x5 tent kernel over the cells round the point
  const K=[];for(let dj=-2;dj<=2;dj++)for(let di=-2;di<=2;di++)K.push([di,dj,(3-Math.abs(di))*(3-Math.abs(dj))]);
  const KS=K.reduce((s,k)=>s+k[2],0);
  const w=(x,z)=>{const o={};for(const [di,dj,k] of K){const key=at(x+di*step,z+dj*step);o[key]=(o[key]||0)+k/KS;}return o;};
  return {w,at};
}
