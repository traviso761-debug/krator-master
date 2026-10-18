// TARGET: kit — the Pylon sheet's preset views. Each row from the front and above; each building at eye level from its
// front, found from the site the rows put it on (never from an index).
const PYL_EYE=(key,dist,dx,zrow)=>{const S=SITES.find(s=>s.key===key&&(zrow==null||s.z===zrow));return[S.x+(dx||0),1.7,S.z+dist,S.x,3.2,S.z];};
const PYL_ROWV=(z,dist,h)=>[0,h,z+dist,0,4,z];
const VIEWS={
 'Opening':[-28,14,ROWZ[0]+34,0,5,ROWZ[0]],
 'Overview':[-160,90,ROWZ[ROWZ.length-1]+90,0,4,(ROWZ[0]+ROWZ[ROWZ.length-1])/2],
 'Folk house — eye level':PYL_EYE('pyl_folk_house',16,4,ROWZ[0]),
 'Folk house — three quarters':[12,7,ROWZ[0]+17,0,4.5,ROWZ[0]],
 'Mixed street':PYL_ROWV(PYL_MIXED_Z[0],46,20),
 'Mixed street — eye level':[-4,1.7,PYL_MIXED_Z[0]+22,0,4,PYL_MIXED_Z[0]],
};
