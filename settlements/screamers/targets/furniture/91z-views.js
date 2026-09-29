const N=(typeof FURN!=='undefined'&&FURN.list)?FURN.list.length:10, SP=11, MID=(N-1)*SP*.5;
const ONE=i=>[i*SP+5,4.2,9,i*SP,2.4,0];
const VIEWS={
 'The set':[MID,26,64,MID,3,0],
 'Along the row':[-9,5,13,MID,3,0],
 'Bunk':ONE(0),'Hammock':ONE(1),'Chest':ONE(2),'Basket':ONE(3),'Drying rack':ONE(4),
 'Hearth':ONE(5),'Stool':ONE(6),'Ladder':ONE(7),'Water jar':ONE(8),'Loom':ONE(9),
};
