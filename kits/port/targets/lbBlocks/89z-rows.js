// TARGET: lbBlocks - the three land blocks side by side behind three plain
// quay110s, one run per decay, with lbTanks behind the middle block: half
// streets between blocks, block-to-block N/S, natural land at the run ends.
const TITLE='Krator Ancient Port — land blocks';
const PORT_LAYOUT_DEF=lbLayoutDev(['lbStores','lbAuthority','lbTanks'].filter(k=>PORT_REG.seg[k]),{back:'lbTanks'});
