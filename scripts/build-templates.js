const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'views');
const templates = {};
const partialNames = [];

function scanDir(dir, prefix) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, prefix + entry.name + '/');
    } else if (entry.name.endsWith('.hbs')) {
      const name = prefix + entry.name.replace('.hbs', '');
      const source = fs.readFileSync(fullPath, 'utf8');
      templates[name] = Handlebars.precompile(source);
      if (prefix === 'partials/') {
        partialNames.push(entry.name.replace('.hbs', ''));
      }
    }
  }
}

scanDir(viewsDir, '');

let output = `import Handlebars from 'handlebars/runtime';\n\n`;

for (const name of partialNames) {
  output += `Handlebars.registerPartial('${name}', Handlebars.template(${templates['partials/' + name]}));\n`;
}

output += `\nconst templates = {};\n`;

for (const [name, spec] of Object.entries(templates)) {
  output += `templates['${name}'] = Handlebars.template(${spec});\n`;
}

output += `\nexport default templates;\n`;

const outDir = path.join(__dirname, '..', 'src');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'templates.js'), output);
console.log(`Pre-compiled ${Object.keys(templates).length} templates`);
