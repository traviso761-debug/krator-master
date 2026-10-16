// ---------------------------------------------------------------- v3: inspector registry + group transforms
const REG=[];function REGISTER(o){REG.push({name:o.name,x:o.x+KOFF[0],y:o.y||0,z:o.z+KOFF[2],r:o.r,h:o.h});}
function useGroupXF(P){P.updateMatrix();KXF={m:P.matrix.clone(),q:P.quaternion.clone()};}
function endGroupXF(){KXF=null;}
kdef('tube',new THREE.CylinderGeometry(1,1,1,8),MAT.darkSurf);
kdef('boxD',new THREE.BoxGeometry(1,1,1),MAT.dark);
kdef('boxW',new THREE.BoxGeometry(1,1,1),MAT.white);kdef('boxR',new THREE.BoxGeometry(1,1,1),MAT.rust);
const STATE=d=>d===3?'repaired':d>0?'ruined':'intact';

