// ================================================================= DASRI DATA & STEPPED / CLIFF PLANNERS ([G data])
// Pure data and pure functions: no three.js, no DOM. Shared by the kit builders, the host API (80-ds-host.js),
// settlements/jabal, oasis/village placement on core/hamlet, and node unit tests (tests/test-dasri.js).

const DS_BOX={
 /* ---- Register 1: Urban Jabal (ds_jabal_*) ---- */
 ds_jabal_house_poor:     {w:6.8, d:7.4, h:13.8, register:'urban', floors:4, stepped:false, role:'house',     types:['dwelling-single']},
 ds_jabal_house_mid:      {w:8.6, d:9.2, h:17.6, register:'urban', floors:5, stepped:true,  role:'house',     types:['dwelling-single']},
 ds_jabal_house_rich:     {w:11.4,d:11.8,h:22.4, register:'urban', floors:6, stepped:true,  role:'house',     types:['dwelling-multi']},
 ds_jabal_corner_tower:   {w:9.6, d:9.6, h:20.6, register:'urban', floors:6, stepped:true,  role:'house',     types:['dwelling-multi']},
 ds_jabal_mansion_stepped:{w:14.8,d:16.4,h:23.8, register:'urban', floors:7, stepped:true,  role:'mansion',   types:['dwelling-multi']},
 ds_jabal_souq_row:       {w:12.6,d:8.4, h:14.6, register:'urban', floors:4, stepped:false, role:'market',    types:['market','shop','dwelling-multi']},
 ds_jabal_salt_warehouse: {w:13.4,d:11.6,h:12.8, register:'urban', floors:3, stepped:true,  role:'warehouse', types:['industry','market']},
 ds_jabal_brazier:        {w:9.4, d:8.8, h:12.4, register:'urban', floors:3, stepped:false, role:'smith',     types:['industry','shop']},
 ds_jabal_bakery:         {w:8.8, d:8.6, h:11.8, register:'urban', floors:3, stepped:false, role:'bakery',    types:['industry','shop']},
 ds_jabal_weaver_dyer:    {w:10.2,d:9.6, h:14.2, register:'urban', floors:4, stepped:true,  role:'weaver',    types:['industry','shop']},
 ds_jabal_spice_khan:     {w:12.0,d:11.2,h:15.6, register:'urban', floors:4, stepped:true,  role:'inn',       types:['inn','tavern','market']},
 ds_jabal_caravanserai:   {w:22.0,d:22.0,h:18.5, register:'urban', floors:4, stepped:true,  role:'funduq',    types:['inn','market','civic']},
 ds_jabal_rock_palace:    {w:18.4,d:20.0,h:25.8, register:'urban', floors:7, stepped:true,  role:'palace',    types:['civic','dwelling-multi']},
 ds_jabal_hammam_cistern: {w:14.4,d:13.6,h:10.6, register:'urban', floors:2, stepped:true,  role:'hammam',    types:['civic','infrastructure','religious']},
 ds_jabal_bazaar_gate:    {w:13.6,d:8.6, h:15.8, register:'urban', floors:4, stepped:false, role:'gate',      types:['civic','infrastructure']},
 ds_jabal_call_tower:     {w:6.8, d:6.8, h:24.8, register:'urban', floors:6, stepped:false, role:'tower',     types:['civic','religious','infrastructure']},
 /* ---- Register 2: Dasri Village & Oasis (ds_vil_*) ---- */
 ds_vil_house_poor:       {w:6.4, d:6.8, h:4.8,  register:'village', floors:1, stepped:false, role:'house',   types:['dwelling-single']},
 ds_vil_house_mid:        {w:8.6, d:9.2, h:7.8,  register:'village', floors:2, stepped:true,  role:'house',   types:['dwelling-single']},
 ds_vil_house_elder:      {w:10.8,d:11.4,h:10.6, register:'village', floors:3, stepped:true,  role:'house',   types:['dwelling-multi','civic']},
 ds_vil_compound:         {w:13.6,d:13.2,h:7.6,  register:'village', floors:2, stepped:true,  role:'compound',types:['dwelling-single','farm']},
 ds_vil_granary:          {w:8.4, d:7.6, h:6.4,  register:'village', floors:1, stepped:false, role:'granary', types:['farm','industry']},
 ds_vil_shade_loggia:     {w:9.6, d:6.8, h:4.6,  register:'village', floors:1, stepped:false, role:'sablah',  types:['civic','inn']},
 ds_vil_saqiya_well:      {w:9.8, d:9.8, h:5.8,  register:'village', floors:1, stepped:false, role:'well',    types:['infrastructure','farm']},
 ds_vil_salt_shed:        {w:12.4,d:9.6, h:5.6,  register:'village', floors:1, stepped:false, role:'salt',    types:['industry']},
 ds_vil_potter_kiln:      {w:9.2, d:8.6, h:6.2,  register:'village', floors:1, stepped:false, role:'kiln',    types:['industry']},
 ds_vil_cliff_stair:      {w:3.6, d:8.0, h:6.4,  register:'village', floors:2, stepped:true,  role:'stair',   types:['infrastructure']},
 ds_vil_watch_post:       {w:6.6, d:6.6, h:11.2, register:'village', floors:3, stepped:false, role:'watch',   types:['civic','infrastructure']},
 ds_vil_oasis_qasr:       {w:24.4,d:23.0,h:12.6, register:'village', floors:3, stepped:true,  role:'qasr',    types:['civic','inn','infrastructure']}
};

function dsDims(key){
 const b=DS_BOX[key];
 return b?{w:b.w,d:b.d,h:b.h}:null;
}

/* dsStepPlan(spec): rear-high stepped massing along z (+z front toward street/valley, -z rear spine against cliff or lane).
   Each tier i has z0..z1 (z0 at -d/2 rear), width w_i, base y0, top y1, so front roofs become walled terraces of upper tiers
   and the rear spine rises highest — locking naturally against a cliff on -z while reading in the round when freestanding. */
function dsStepPlan(spec){
 spec=spec||{};
 const W0=spec.w==null?10:spec.w,D0=spec.d==null?12:spec.d,tiers=spec.tiers||[];
 const zRear=-D0/2,zFront=D0/2,out=[];
 for(let i=0;i<tiers.length;i++){
  const t=tiers[i],fBack=t.back==null?0:t.back,fFront=t.front==null?1:t.front,wf=t.wFrac==null?1:t.wFrac,xo=t.xOff==null?0:t.xOff;
  const z0=+(zRear+fBack*D0).toFixed(3),z1=+(zRear+fFront*D0).toFixed(3),tw=+(W0*wf).toFixed(3);
  const y0=+(t.y0==null?0:t.y0).toFixed(3),h=+(t.h==null?3.4:t.h).toFixed(3);
  out.push({index:i,x0:+(xo-tw/2).toFixed(3),x1:+(xo+tw/2).toFixed(3),z0,z1,w:tw,d:+(z1-z0).toFixed(3),y0,h,y1:+(y0+h).toFixed(3),
   rearFlush:Math.abs(z0-zRear)<.02,terraceDepth:i>0?+(out[i-1].z1-z1).toFixed(3):0});
 }
 return {w:W0,d:D0,zRear,zFront,tiers:out,maxH:out.length?Math.max(...out.map(q=>q.y1)):0};
}

/* dsCliffSeat(rec, box, groundFn, o): seats a building on flat, sloped, ledge, or cliff-backed ground.
   Samples front (+z), middle (0), and rear (-z) along the oriented footprint:
   - In cliff mode (rec.cliff / o.cliff, or when rear rock rises > 2.2 m above the front ledge), the main floor y sits cleanly
     at the front/mid ledge height (never buried in the cliff top!) while `skirt` reaches down past the lowest front/side corner
     so no foundation ever floats over a steep drop. */
function dsCliffSeat(rec,box,groundFn,o){
 o=o||{};
 const G=typeof groundFn==='function'?groundFn:()=>0;
 const B=box||(DS_BOX[rec.key]||{w:8,d:8,h:8});
 const ry=rec.ry==null?0:rec.ry,c=Math.cos(ry),s=Math.sin(ry);
 const wx=(lx,lz)=>[rec.x+lx*c+lz*s,rec.z-lx*s+lz*c];
 const frontY=[],midY=[],rearY=[];
 for(const sx of [-1,0,1]){
  const pf=wx(sx*B.w*.46,B.d*.46),pm=wx(sx*B.w*.46,0),pr=wx(sx*B.w*.46,-B.d*.46);
  frontY.push(G(pf[0],pf[1]));midY.push(G(pm[0],pm[1]));rearY.push(G(pr[0],pr[1]));
 }
 const fMax=Math.max(...frontY),fMin=Math.min(...frontY),mMax=Math.max(...midY),mMin=Math.min(...midY);
 const rMax=Math.max(...rearY),rMin=Math.min(...rearY);
 const rearRise=+(rMax-fMax).toFixed(3);
 const cliff=rec.cliff!=null?!!rec.cliff:(o.cliff!=null?!!o.cliff:rearRise>2.2);
 const floorY=rec.y!=null?rec.y:(cliff?Math.max(fMax,Math.min(mMax,fMax+1.2)):Math.max(fMax,mMax,rMax));
 const low=Math.min(fMin,mMin,cliff?fMin:rMin);
 const drop=Math.max(0,floorY-low);
 const defSkirt=typeof DS_CFG!=='undefined'&&DS_CFG.CLIFF_SKIRT!=null?DS_CFG.CLIFF_SKIRT:4.8;
 const minSkirt=cliff?Math.max(defSkirt,drop+1.2):Math.max(.55,drop+.55);
 return {
  y:+floorY.toFixed(3),
  low:+low.toFixed(3),
  lo:+(-minSkirt).toFixed(3),
  skirt:+minSkirt.toFixed(3),
  rearRise,
  cliff,
  gl:(lx,lz)=>{const p=wx(lx,lz);return G(p[0],p[1])-floorY;}
 };
}

/* Ready-to-consume core/hamlet rows for Dasri foothill villages and Catch/Bowl salt oases */
const DS_HAMLET_ROWS={
 dasri_village:{
  kit:'dasri',
  culture:'dasri',
  household:[4,7],
  houses:{poor:'ds_vil_house_poor',mid:'ds_vil_house_mid',rich:'ds_vil_house_elder'},
  civic:'ds_vil_shade_loggia',
  religious:'ds_vil_oasis_qasr',
  well:'ds_vil_saqiya_well',
  watch:'ds_vil_watch_post',
  works:{
   farming:['ds_vil_granary','ds_vil_saqiya_well','ds_vil_compound'],
   herding:['ds_vil_compound','ds_vil_shade_loggia','ds_vil_saqiya_well'],
   salt:['ds_vil_salt_shed','ds_vil_saqiya_well','ds_vil_granary']
  }
 },
 dasri_oasis:{
  kit:'dasri',
  culture:'dasri',
  household:[4,6],
  houses:{poor:'ds_vil_house_poor',mid:'ds_vil_house_mid',rich:'ds_vil_house_elder'},
  civic:'ds_vil_oasis_qasr',
  religious:'ds_vil_shade_loggia',
  well:'ds_vil_saqiya_well',
  watch:'ds_vil_watch_post',
  trade:{serai:'ds_vil_oasis_qasr',stall:'ds_vil_shade_loggia',cistern:'ds_vil_saqiya_well',store:'ds_vil_salt_shed'},
  works:{
   salt:['ds_vil_salt_shed','ds_vil_granary','ds_vil_saqiya_well'],
   farming:['ds_vil_saqiya_well','ds_vil_granary','ds_vil_compound']
  }
 }
};

if(typeof module!=='undefined'&&module.exports){
 module.exports={DS_BOX,dsDims,dsStepPlan,dsCliffSeat,DS_HAMLET_ROWS};
}
