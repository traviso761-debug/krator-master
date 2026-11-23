// ================================================================= HOST — station 6, the Tiguantin cloud-terraces: the ground's colours and layers (84-host-ground.js's hooks)
// Replaces station 2's file of the same name. The paint: the cloud forest's dark moss and litter on the sheet's top, green moss and grass on the terraces'
// treads, black-wet moss at the contact springs, the winch camp trodden bare, moss over the spur's megabreccia (its blocks show on its steep faces). Three KGROUND layers on the three
// weights (STATION_GL): x the cloud forest's mossy floor (ground.meadow, station 1's, tinted by the paint: the mulch read as bare tan litter from above), y the treads' and the springs' moss and grass (ground.lush), z the spur: the crater
// wall's megabreccia as KGROUND's `clast` kind (station 1's, with the library's rock.megabreccia as its grain), on the spur alone (the gully's walls are
// the KSTRATA column, 88t-host-tiguantin.js). STATION_STEEP: the steep faces OUTSIDE the near patch (the sheet's front far down the map) read the same
// column's contacts as plain colours by stratigraphic height (TIG.ZONES; the near cliffs draw it in full).
const STATION_PAINT=(function(){const FOR=new THREE.Color(0x34482a),FOR2=new THREE.Color(0x46582e),TREAD=new THREE.Color(0x5a7a34),TREAD2=new THREE.Color(0x6a8a3c),
  WETM=new THREE.Color(0x2c3e22),CAMP=new THREE.Color(0x5a4a38),SPUR=new THREE.Color(0x4e6634),SPUR2=new THREE.Color(0x66704e),TUFF=new THREE.Color(0xc2b296),q=new THREE.Color();
 return(c,x,z,n,n2,n3,sl)=>{const te=FIELD.terrace(x,z),sh=FIELD.sheet(x,z),sp=FIELD.spur(x,z),kp=FIELD.keep(x,z),wt=FIELD.spring(x,z),cf=FIELD.cliff(x,z);
  q.copy(FOR).lerp(FOR2,clamp(.5+n2*2.4,0,1));c.lerp(q,.75*Math.max(sh,.6));
  c.lerp(q.copy(TREAD).lerp(TREAD2,clamp(.5+n3*3,0,1)),smooth(.25,.6,te)*.85);
  c.lerp(WETM,smooth(.3,.7,wt)*.8);
  c.lerp(q.copy(SPUR).lerp(SPUR2,clamp(.5+n2*2.6,0,1)),smooth(.3,.7,sp)*.85);
  c.lerp(TUFF,smooth(.3,.8,cf)*smooth(.6,1.2,sl)*.6);
  c.lerp(CAMP,smooth(.4,.8,kp)*.7);};})();
const STATION_GL=(x,z)=>{const te=FIELD.terrace(x,z),wt=FIELD.spring(x,z),sp=FIELD.spur(x,z),kp=FIELD.keep(x,z);
 const g=Math.max(smooth(.25,.6,te),smooth(.3,.6,wt));return[(1-g)*(1-sp)*(1-smooth(.4,.8,kp))*.85,g*.9,smooth(.25,.6,sp)];};
const STATION_GLY=()=>{const L=[KGROUND.layer('nhighlands','ground.meadow',{w:'vGL.x',amt:.6,gain:1.1,tint:'diffuse'}),KGROUND.layer('nhighlands','ground.lush',{w:'vGL.y',amt:.75,gain:1.05})].filter(Boolean);
 const BRG=KGROUND.layer('nhighlands','rock.megabreccia',{});
 L.push({map:BRG?BRG.map:undefined,k:BRG?BRG.k:undefined,kind:'clast',w:'vGL.z*smoothstep(0.22,0.6,1.0-clamp(normalize(vGWN).y,0.0,1.0))',amt:.88,gain:.82,size:7,matrix:.07,sub:.2,fleck:.05,fleckDensity:.25,
  palette:BRECCIA_KINDS.blocks,matrixColor:BRECCIA_KINDS.matrix,vary:.12,seed:KRAND.hash(86079,0,1,7)%997,name:'megabreccia (clast): the spur'});
 return L;};
// the steep, far from the near patch: the column's contacts by stratigraphic height (yy = y - .055 s), linear colours; the spur keeps its clasts (vGL.z)
const STATION_STEEP=(function(){const Z=TIG.ZONES,f=v=>v.toFixed(2),lin=h=>{const c=new THREE.Color(h).convertSRGBToLinear();return'vec3('+[c.r,c.g,c.b].map(v=>v.toFixed(3)).join(',')+')';};
 return'mix(mix(mix(mix('+lin(0xd8ceb6)+','+lin(0xa4422a)+',step('+f(Z.paleosol)+',yyS))'+
  ','+lin(0xc8b89a)+'*(0.85+0.15*sin(yyS*0.9)),step('+f(Z.tuff)+',yyS)),'+lin(0x28262a)+',step('+f(Z.basalt)+',yyS))*(0.8+0.4*texture2D(uDetail,vec2(vGWP.x+vGWP.z,vGWP.y*3.0)*0.05).r),diffuseColor.rgb,vGL.z)';})()
 .replace(/yyS/g,'(vGWP.y-'+(TIG.rampK).toFixed(3)+'*(vGWP.x+vGWP.z)*0.7071)');
