const fs = require('fs');
let code = fs.readFileSync('core/audio/tools/soundtrack_engine_code.js', 'utf8');

// Replace the literal broken newline inside L.join(' with L.join('\\n')
code = code.replace(/return L\.join\('\r?\n'\) \+ '\r?\n';/g, "return L.join('\\n') + '\\n';");

fs.writeFileSync('core/audio/tools/soundtrack_engine_code.js', code, 'utf8');
console.log('Fixed L.join in soundtrack_engine_code.js');
