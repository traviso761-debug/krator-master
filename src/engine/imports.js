import {report,section,stage,LOAD} from '../core/diag.js';
import {createLcg,makeNoise,clamp,smooth,hash3,mkRng} from '../core/rng.js';
import {DATA_FN,dataValue,resolveCity} from '../core/data.js';
import {createEnv} from '../core/env.js';
import {installMenagerie} from '../core/menagerie.js';
