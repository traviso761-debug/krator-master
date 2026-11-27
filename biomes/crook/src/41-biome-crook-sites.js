// ================================================================= THE CROOK — station site records ([G data])
// Verified Scale-Model 5.1 survey records across the three Crook sub-regions (CROOK-RIA-DECISIONS.md section 1.6; PLAN.md section 3):
//   shore (default, dist/crook.html):      Crookshore (rmw4wknusgc7h, px 123, 659, 0..+950 m, 1.60-1.46 atm, +22..+27 degC)
//   wash  (--station wash, crook-wash):    Crookwash  (rmwet8ethscuf, px 116, 920, +950..+2,800 m, 1.20 atm, +11 degC)
//   head  (--station head, crook-head):    Crookhead  (rmwetb495tgzt, px 107, 1038 -> 121, 1004, +1,800..+6,000 m, 1.07 atm, +4 degC)
// Also exports survey sub-site records (crater, gorge, skarn, tarn, hushpass) so any Scale-Model 5.1 site lookup resolves cleanly.
(function(root){
 'use strict';
 var SITES={
  shore:{
   key:'shore',
   id:'rmw4wknusgc7h',
   subregion:'crookshore',
   name:'Crookshore Spray-Cliff and Spongiform Rainforest',
   region:'The Crook - Cascade-Caldera and Kopa-Kawa Mouth',
   px:[123,659],
   sky:[-149,329],
   elevRangeM:[0,950],
   baseElevM:0,
   atm:1.60,
   atmMedian:1.46,
   tempC:24.0,
   rainMm:1725,
   koppen:['Cfa','Am'],
   wind:[-6.8,2.4],
   trimElevM:65.0,
   strata:{
    recipe:'arch-rift-basalt',
    lateral:'secondary-ejecta',
    dir:[0.82,0.57],
    d0:-40,
    d1:190,
    tongue:6,
    range:[-90,420]
   },
   minerals:{silica:150,jade:200,coal:209,iron:180,tin:200,clay:255,ultramafic:0},
   caldera:{x:210,z:-170,rx:165,rz:145,level:0.2,floor:-34},
   mouth:{x:-40,z:-60,qM3s:920},
   reserve:{id:'site:hueru-kuran-kopa',culture:'hueru-kuran',name:'Hueru-Kuran Safe Terrace Reserve',x:195,z:165,r:48,minElevM:65.0}
  },
  wash:{
   key:'wash',
   id:'rmwet8ethscuf',
   subregion:'crookwash',
   name:'Crookwash Nephrite-Skarn Gorge and Rimstone Steps',
   region:'The Crook - Vardzieti Montane Gorge',
   px:[116,920],
   sky:[-156,590],
   elevRangeM:[950,2800],
   baseElevM:1480,
   atm:1.20,
   atmMedian:1.20,
   tempC:11.0,
   rainMm:1180,
   koppen:['Dfb','Cfb','Csa'],
   wind:[4.8,-1.8],
   trimElevM:0,
   strata:{
    recipe:'rift-basement',
    lateral:'contact-marble',
    dir:[0.18,0.98],
    d0:-110,
    d1:85,
    tongue:6,
    range:[-80,520]
   },
   minerals:{iron:255,jade:200,skarn:200,tin:200,copper:130,silica:120,ultramafic:0},
   gorge:{strike:0.22,halfW:68,wallH:245,qM3s:240},
   rimstoneSteps:(function(){
    var out=[],i;
    // 16 strictly monotone-descending cold-seep travertine/iron-jade rimstone pools down the shaded south-facing seep alcove
    for(i=0;i<16;i++){
     var t=i/15;
     var sx=-148+t*118+((i%2===0)?-5.5:5.5);
     var sz=-118+t*66;
     var r=6.8+2.6*((i*37)%5)/4;
     var drop=i*0.62;
     var stain=(i%3===0)?'terracotta':(i%3===1)?'celadon':'ochre';
     out.push({i:i,x:+sx.toFixed(2),z:+sz.toFixed(2),r:+r.toFixed(2),dropM:+drop.toFixed(2),lipH:0.58,stain:stain});
    }
    return out;
   })(),
   reserve:{id:'site:dzagh-vardzi-chasm',culture:'dzagh-vardzi',name:'Dzagh-Vardzi Chasm-Spur Reserve',x:168,z:-122,r:42,minElevM:0}
  },
  head:{
   key:'head',
   id:'rmwetb495tgzt',
   subregion:'crookhead',
   name:'Crookhead Malachite Tundra, Hearth-Rings and Hush Pass',
   region:'The Crook - Alpine Tarn and Silent Vales Threshold',
   px:[107,1038],
   sky:[-165,708],
   elevRangeM:[1800,6000],
   baseElevM:3140,
   atm:1.07,
   atmMedian:1.07,
   tempC:4.0,
   rainMm:1180,
   koppen:['ET','Dfb','Dfc'],
   wind:[7.2,-2.2],
   trimElevM:0,
   strata:{
    recipe:'rift-basement',
    lateral:null,
    range:[-60,480]
   },
   minerals:{iron:255,tin:200,jade:200,copper:130,peat:140,saltpeter:121,ultramafic:0},
   tarn:{x:-125,z:35,rx:135,rz:105,level:-4.2,floor:-19.5},
   hushPass:{lineX:195,normalXZ:[1,0],bandWidthM:120,colZ:-35,colElevLocal:58},
   meltWells:(function(){
    var out=[],i,ang,rad,wx,wz,wR;
    // 48 deterministic colonial thermogenic (+15 degC) hearth-ring snow-melt wells (1.1..2.1 m diameter) across the snowfield bench
    for(i=0;i<48;i++){
     ang=i*2.399963;
     rad=22+142*Math.sqrt((i+0.5)/48);
     wx=18+Math.cos(ang)*rad*0.88;
     wz=55+Math.sin(ang)*rad*0.74;
     // Keep clear of the western moraine tarn basin and far eastern granite col
     if(wx<-28)wx=-28+(wx+28)*0.25;
     if(wx>158)wx=158-(wx-158)*0.35;
     wR=0.62+0.36*((i*29+11)%13)/12;
     out.push({i:i,x:+wx.toFixed(2),z:+wz.toFixed(2),r:+wR.toFixed(3),diamM:+(wR*2).toFixed(3),coreTempC:+(14.8+1.1*((i*17)%7)/6).toFixed(2)});
    }
    return out;
   })(),
   reserve:{id:'site:hush-kin-col',culture:'hush-kin',name:'Silent Vales Boundary Cairn Line',x:195,z:-35,r:22,minElevM:0}
  }
 };

 // Survey sub-site aliases from PLAN.md section 3
 SITES.crater=Object.assign({},SITES.shore,{subKey:'crater',px:[96,676],sky:[-176,346],tempC:22.0,rainMm:1757});
 SITES.gorge=SITES.wash;
 SITES.skarn=Object.assign({},SITES.wash,{subKey:'skarn',px:[64,956],sky:[-208,626],atm:1.18,tempC:9.0,rainMm:680});
 SITES.tarn=SITES.head;
 SITES.hushpass=Object.assign({},SITES.head,{subKey:'hushpass',px:[121,1004],sky:[-151,674],atm:0.88,tempC:-4.0,rainMm:1569});

 root.CROOK_SITES=SITES;
 if(typeof module!=='undefined'&&module.exports)module.exports=SITES;
})(typeof globalThis!=='undefined'?globalThis:this);
