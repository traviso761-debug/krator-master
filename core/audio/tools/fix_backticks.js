const fs = require('fs');
let code = fs.readFileSync('core/audio/tools/soundtrack_engine_code.js', 'utf8');

// Replace \` with `
code = code.replace(/\\`/g, '`');
// Replace \${ with ${
code = code.replace(/\\\${/g, '${');

fs.writeFileSync('core/audio/tools/soundtrack_engine_code.js', code, 'utf8');
console.log('Fixed backticks in soundtrack_engine_code.js');
