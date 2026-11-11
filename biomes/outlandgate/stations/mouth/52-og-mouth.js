// ================================================================= OUTLAND GATE — station 4's kin and its silk (PLAN.md section 4)
// The gap's mouth is the crater side's wettest ground: Spider Lake's silk-forest trees are not built (biomes/spiderlake is a plan), so the
// plan's fallback, the NEIGHBOURS' SPECIES read in place (station.json "kin": the north-west lowlands' paperbark, poplar and ghost
// gum), grown by core/biome's BIO.kin in 60. The kit's own: SILK, the gilded orb spiders' webs (an orb on a card, hung between two trunks:
// {free: true}, the attach audit's rule for what no structure holds), drawn with a procedural thread texture. Data and kit items only.
OGATE.KINX=[
 {from:'nwlowlands.paperbark',key:'swamppaperbark',name:'Swamp paperbark',scale:{H:.75,rb:.85,crownR:.8},where:'the delta\'s backswamps, standing in the wet',tags:{riparian:'yes',koppen:['Cfa']}},
 {from:'nwlowlands.poplar',key:'leveepoplar',name:'Levee poplar',scale:{H:.75,rb:.85,crownR:.85},where:'the channels\' levees and the coves\' runs',tags:{riparian:'yes',koppen:['Cfa']}},
 {from:'nwlowlands.ghostgum',key:'ghostgum',name:'Ghost gum',scale:{H:.6,rb:.7,crownR:.65},where:'the rises, north and south of the delta',tags:{riparian:'no',koppen:['Cfa']}},
];
(function(){const T3=BIO.host.THREE,TAU=Math.PI*2;
/* the orb: radii from a hub, a spiral of capture thread round them, beaded with dew; its own KRAND stream (no other draw moves) */
const TX=BIO.alphaTex(256,(g,S)=>{const s=KRAND.stream(6421),c=S/2,n=26;g.lineCap='round';g.strokeStyle='rgba(245,240,225,0.95)';
 for(let k=0;k<n;k++){const a=k/n*TAU+(s.next()-.5)*.08;g.lineWidth=1.1;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.cos(a)*c*.97,c+Math.sin(a)*c*.97);g.stroke();}
 g.lineWidth=.9;g.beginPath();for(let t=0;t<38*TAU;t+=.05){const r=c*(.08+.88*t/(38*TAU)),x=c+Math.cos(t)*r,y=c+Math.sin(t)*r;t?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();
 g.fillStyle='rgba(255,252,240,1)';for(let k=0;k<160;k++){const a=s.next()*TAU,r=c*Math.sqrt(s.next())*.95;g.beginPath();g.arc(c+Math.cos(a)*r,c+Math.sin(a)*r,.9+s.next(),0,TAU);g.fill();}},[240,236,222]);
const M=OGATE.MAT.silk=BIO.leafMat(TX,'silk',{swayW:'(position.y)',swayA:.04,alphaTest:.3});M.side=T3.DoubleSide;
const g=new T3.PlaneGeometry(1,1);g.translate(0,.5,0);   /* a unit card, its base at the origin (BIO.put scales and turns it) */
BIO.def('silk',g,M,{label:'Silk: a gilded orb spider\'s web',free:true});
})();
