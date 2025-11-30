import fs from 'fs';
const p = 'src/server.js';
let s = fs.readFileSync(p, 'utf8');

// remove any CommonJS require for answers.routes
s = s.replace(/^\s*const\s+answersRouter\s*=\s*require\((['"]).*answers\.routes.*\1\);\s*$/m, '');

// keep only the first ESM import for answersRouter
const impRe = /^\s*import\s+answersRouter\s+from\s+(['"].*answers\.routes.*['"])\s*;?\s*$/mg;
const imports = [...s.matchAll(impRe)];
if (imports.length > 1) {
  let kept = false;
  s = s.replace(impRe, (m, g1) => {
    if (kept) return '';
    kept = true;
    return `import answersRouter from ${g1};`;
  });
}

fs.writeFileSync(p, s);
console.log('Patched', p);
