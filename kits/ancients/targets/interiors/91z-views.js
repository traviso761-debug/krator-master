// Views for the interiors target, made from the sites the interior pass drew (AIK.sites: 90-scene.js has run every
// builder before this file loads). The first is the opening shot. Per type: the row (intact west, rehabilitated in the
// middle, ruined east), then each state opened at its ground storey, and the intact one at an upper storey. The eighth
// element opens a building (92z-interior-ui.js): { site: 'police/0', storey: 0 }.
const VIEWS=(function(){const V={},names=Object.keys(ROWS);
 const zs=names.map(k=>ROWS[k].z),zm=(Math.min(...zs)+Math.max(...zs))/2,span=Math.max(...zs)-Math.min(...zs)+800;
 V['Overview']=[1400,span*.55,zm+span*.25,0,0,zm];
 const S=typeof AIK!=='undefined'?AIK.sites:[];
 for(const k of names){const R=ROWS[k],own=S.filter(s=>s.type===k);
  const nm=own.length?own[0].name:k;
  V[nm+': the row']=[0,R.r*1.3+40,R.z+R.r*2.6+120,0,10,R.z];
  for(const s of own){if(!s.box)continue;const w=Math.max(s.box[1]-s.box[0],s.box[3]-s.box[2]),cx=s.gx+(s.box[0]+s.box[1])/2,cz=s.gz+(s.box[2]+s.box[3])/2;
   const cam=(st)=>{const y=(s.storeys[st]||{y:0}).y;return [cx+w*.18,y+w*.42+8,cz+w*.5,cx,y,cz-w*.04];};
   V[nm+', '+s.state+': inside, storey 1']=cam(0).concat([0,{site:s.id,storey:0}]);
   if(s.d===0&&s.storeys.length>1){const top=Math.min(s.storeys.length-1,Math.max(1,Math.floor(s.storeys.length/2)));V[nm+', intact: inside, storey '+(top+1)]=cam(top).concat([0,{site:s.id,storey:top}]);}}}
 return V;})();
