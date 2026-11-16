// Mount Hood: the page's own extras and models after the ground (main.js runs them in this order). Each module
// owns its own file and its own block of data/cities/mthood.json.
//   water.js      the lakes' ice, the streams, the waterfalls, the fumaroles' steam
//   landmarks.js  Timberline Lodge, Silcox Hut, Cloud Cap Inn and the other buildings, as engine models (MODELS)
//   lifts.js      the chairlifts with their towers and moving chairs, skiers on the runs in winter
//   trails.js     the trails drawn on the ground, the Trail map, a trail's card, walking a trail; hikers and climbers
//   events.js     what happens on the mountain (src/core/happenings.js)
import {water} from './water.js';
import {landmarks} from './landmarks.js';
import {lifts} from './lifts.js';
import {trails} from './trails.js';
import {events} from './events.js';
export const MODELS=[landmarks];
export const EXTRAS=[{name:'water',fn:water},{name:'lifts',fn:lifts},{name:'trails',fn:trails},{name:'events',fn:events}];
