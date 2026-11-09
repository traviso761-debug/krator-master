// ================================================================= HOST — station 3: the season bound to the clock (core/clock, BIO.bindSeason)
// The page's clock (core/host's KCLOCK, the day and hour the panel shows) drives BIO.SEASON, how far into the dry season the edge stands: its
// grass (50: BIO.host.seasons) thins and turns straw in the dry, green again in the wet. eastabyss's savannah binds the same way
window._season=BIO.host.seasons&&BIO.bindSeason?BIO.bindSeason(null,{sharp:1.5}):false;
