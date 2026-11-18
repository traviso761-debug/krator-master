// ================================================================= THE KIT: Shumari identity, library families, palette, and clearance contracts
// Kingdom of Shumar (catalog and core/tags culture `shumari`, kits/shumari/PLAN.md): Mamluk Cairene carved and spiral-fluted
// stone domes, soaring recessed pishtaq portals, horizontal ablaq ashlar (dark highland basalt + warm cream travertine + crimson
// ironstone), battered ishigaki flood plinths, crimson-lacquered mashrabiya winter bays, and Free Giant dual-scale clearances.
const KIT={id:'shumari',title:'Shumari Kit',pack:'shumari',culture:'shumari',faction:'Kingdom of Shumar',band:'the western dry plateau',
 frag:'kits/shumari',ground:0x8e8468,groundProc:0x867c62,fog:0xc8d2dc,furnDetail:.6};

/* Free Giant & human architectural clearance constants (PLAN.md section 1.2) */
const SM_GIANT_DOOR=4.4;
const SM_GIANT_MIN_DOOR=4.2;
const SM_GIANT_VAULT=5.2;
const SM_GIANT_MIN_VAULT=5.0;
const SM_HUMAN_DOOR=2.25;
const SM_HUMAN_MAX_DOOR=3.0;
const SM_STAIR_MIN_W=2.4;

/* Caste and architectural style vocabulary (PLAN.md section 5) */
const SM_CASTES={sword:'sword',hearth:'hearth',cadet:'cadet',outlander:'outlander'};
const SM_STYLES={sword:'sword',hearth:'hearth',cadet:'cadet',state:'state'};

/* Library pack mapping (materials.json -> tex/ -> 26-matlib-pack.js) */
const SV_LIB={
 basalt:'basalt',rubble:'rubble',tuff:'tuff',travertine:'travertine',ashlar:'ashlar',ironstone:'ironstone',
 chiselled:'chiselled',domeCarved:'domeCarved',paving:'paving',cobble:'cobble',bathLens:'bathLens',
 lacquer:'lacquer',cedar:'cedar',timber:'timber',tarred:'tarred',
 bronzeCast:'bronzeCast',bronze:'bronze',gold:'gold',iron:'iron',tracery:'tracery',
 slate:'slate',thatch:'thatch',jali:'jali',frieze:'frieze',kilim:'kilim',earth:'earth'
};
const SV_TILE0={
 basalt:1.8,rubble:2.4,tuff:2.2,travertine:2.0,ashlar:2.2,ironstone:1.8,
 chiselled:1.6,domeCarved:1.8,paving:2.2,cobble:2.0,bathLens:1.6,
 lacquer:1.4,cedar:1.4,timber:1.8,tarred:1.8,
 bronzeCast:.9,bronze:.8,gold:.8,iron:.9,tracery:1.2,
 slate:1.5,thatch:1.8,jali:1.1,frieze:2.4,kilim:2.2,earth:3.6
};
const SV_CLOTH={flag:1,kilim:1};
const SV_CUT={
 basalt:1,rubble:1,tuff:1,travertine:1,ashlar:1,ironstone:1,chiselled:1,domeCarved:1,bathLens:1,
 lacquer:1,cedar:1,timber:1,tarred:1,bronzeCast:1,bronze:1,gold:1,iron:1,tracery:1,
 slate:1,thatch:1,jali:1,frieze:1,plain:1,brass:1,bone:1,glass:1,flag:1
};
const KIT_FALLBACK=[];
const KIT_HAS=k=>KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);

/* Highland basalt, cream travertine, crimson lacquer & bronze palette (sRGB hex, PLAN.md section 7) */
const SVPAL={
 basalt:[0x36383e,0x303238,0x3d4047],
 basaltDark:[0x23252a,0x1e2025],
 rubble:[0x42444a,0x3b3d43,0x494b52],
 travertine:[0xd8cdb8,0xdfd5c1,0xd0c4ae],
 travShade:[0xc2b69f,0xb8ac95],
 ashlar:[0xe2dac8,0xdad1be,0xe8e0cf],
 ironstone:[0x7c2b28,0x86312d,0x722623],
 domeStone:[0xdacfc0,0xd2c6b4,0xe1d7c8],
 domeShade:[0xbdb19e,0xb3a794],
 lacquer:[0x9e2a2b,0xa83031,0x912425],
 cedar:[0x6e472b,0x784e30,0x644026],
 timber:[0x523928,0x4a3323,0x5b402d],
 tarred:[0x2c2623,0x25201d],
 bronze:[0x9a7432,0xa47d38,0x8f6b2d],
 bronzeDark:[0x6c5124,0x61481f],
 gold:[0xb8861b,0xc49022],
 iron:[0x38383c,0x2f3034],
 slate:[0x454a52,0x3e434b,0x4d525b],
 thatch:[0xa89670,0x9e8c66],
 paving:[0x8c8578,0x827b6e,0x958e80],
 cobble:[0x5d5b58,0x54524f],
 earth:[0x8e8468,0x857b60],
 kilim:[0x9e2a2b,0xb8861b,0x2b3c4e],
 glass:[0x2b3640,0x33404c],
 glassAmber:[0xd89b3c,0xe4a848],
 glassLit:[0xf2c982],
 flame:[0xffa83e],
 ember:[0xff6e24]
};
function P(k){return jc(pick(SVPAL[k]),.04);}

/* Pure [G data] Mamluk pointed high-shouldered dome profile: u in [0,1] -> radius in metres */
function smDomeRadius(u,span){
 const R=span*.5;
 const cl=u<0?0:(u>1?1:u);
 if(cl<=.18){
  const q=cl/.18;
  return R*(1-.032*q*q);
 }
 const s=(cl-.18)/.82;
 const ogive=Math.pow(Math.max(0,1-Math.pow(s,1.52)),.74);
 return R*.968*ogive;
}

/* Sample n+1 profile rings [{u, y, r}] for a high-shouldered Mamluk dome of diameter span and height h */
function smDomeProfile(span,h,steps){
 const n=steps==null?20:steps;
 const H=h==null?span*.82:h;
 const out=[];
 for(let i=0;i<=n;i++){
  const u=i/n;
  out.push({u,y:u*H,r:smDomeRadius(u,span)});
 }
 return out;
}

/* Validate a placed dome record {key, style, hand, span, h} against Shumari architectural rules */
function smDomeValid(rec){
 if(!rec||typeof rec.span!=='number'||typeof rec.h!=='number'||rec.span<=0)return false;
 if(rec.style!=='spiral'&&rec.style!=='carved')return false;
 const ratio=rec.h/rec.span;
 if(ratio<.72||ratio>.92)return false;
 const rMid=smDomeRadius(.55,rec.span)/(rec.span*.5);
 if(rMid<.60||rMid>.85)return false;
 if(rec.style==='spiral'){
  const want=rec.key==='sm_doriyan_stele'?-1:1;
  if(rec.hand!==want)return false;
 }
 return true;
}

/* Validate a building record {key, giant, doors:[{h,locked}], vaultH} against Free Giant / human clearance rules */
function smGiantValid(rec){
 if(!rec||typeof rec.giant!=='boolean'||!Array.isArray(rec.doors))return false;
 if(rec.giant){
  const hasGiantDoor=rec.doors.some(d=>d&&!d.locked&&typeof d.h==='number'&&d.h>=SM_GIANT_MIN_DOOR);
  const vaultOk=typeof rec.vaultH==='number'&&rec.vaultH>=SM_GIANT_MIN_VAULT;
  return hasGiantDoor&&vaultOk;
 }
 if(!rec.doors.length)return false;
 return rec.doors.every(d=>d&&typeof d.h==='number'&&d.h>1.5&&d.h<SM_HUMAN_MAX_DOOR);
}

/* Live registry populated during buildWorld() for verification and inspection */
const SM_DOMES=[];
