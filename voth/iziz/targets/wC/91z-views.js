// TARGET: wC — views. SITES[0] salvagers @1, [1] mercenaries @1, [2] salvagers @.5, [3] mercenaries @.6. Names carry no commas (verify splits on them).
const VQS=i=>SITES[i];
const VIEWS={'Overview':[60,260,ROWZ[3]+330,0,20,ROWZ[1]+80]};
{const S=VQS(0);
 VIEWS['Salvagers Guild']=[S.x+60,95,S.z+235,S.x+10,28,S.z+10];
 VIEWS['Salvagers Guild — eye level']=[S.x+4,1.7,S.z+71,S.x-4,16,S.z+20];         // inside the gate, up the yard to the arcade
 VIEWS['Salvagers Guild — street']=[S.x-14,1.7,S.z+96,S.x+4,12,S.z+40];          // from the street, gate and palisade
 VIEWS['Salvagers Guild — yard']=[S.x+40,11,S.z+92,S.x-4,3,S.z+58];               // over the palisade corner into the yard
 VIEWS['Salvagers Guild — shed']=[S.x-2,1.7,S.z+68,S.x-20,3,S.z+50];}
{const S=VQS(1);
 VIEWS['Mercenary Guild']=[S.x+30,85,S.z+230,S.x,14,S.z+20];
 VIEWS['Mercenary Guild — eye level']=[S.x+5,2.6,S.z+80,S.x-3,10,S.z+36];         // inside the gate, across the muster yard to the Watch
 VIEWS['Mercenary Guild — street']=[S.x+18,1.7,S.z+104,S.x-2,10,S.z+50];
 VIEWS['Mercenary Guild — yard']=[S.x-58,12,S.z+98,S.x+6,3,S.z+58];
 VIEWS['Mercenary Guild — rostrum']=[S.x+14,2.6,S.z+70,S.x-2,4,S.z+50];}
{const S=VQS(2);
 VIEWS['Salvagers @.5']=[S.x+30,50,S.z+120,S.x+5,12,S.z+5];
 VIEWS['Salvagers @.5 — eye level']=[S.x+2,1.7,S.z+35,S.x-2,8,S.z+10];}
{const S=VQS(3);
 VIEWS['Mercenaries @.6']=[S.x+20,55,S.z+140,S.x,9,S.z+12];
 VIEWS['Mercenaries @.6 — eye level']=[S.x+3,2.2,S.z+48,S.x-2,6,S.z+22];}
