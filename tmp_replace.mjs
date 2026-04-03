import fs from 'fs';
import path from 'path';

const pagesDir = './frontend/src/pages';
const importStatement = "import { API_BASE_URL } from '../config';\n";

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    let modified = false;

    // Pattern 1: `"http://127.0.0.1:5000/api..."` -> `${API_BASE_URL}/api...`
    // Basically just replacing the base URL
    const patterns = ['http://127.0.0.1:5000', 'http://localhost:5000'];

    for (const pattern of patterns) {
        if (content.includes(pattern)) {
            modified = true;
            
            // First we handle occurrences inside template literals:
            // e.g. `http://127.0.0.1:5000/api...`
            let regex = new RegExp(`\\b` + pattern + `\\b`, 'g');
            content = content.replace(regex, '${API_BASE_URL}');
        }
    }
    
    // Convert regular strings that contain the pattern into template literals
    // e.g. "http://127.0.0.1:5000/api/auth/register"
    // Wait, the regex replaced it with " ${API_BASE_URL}/api..."
    // Let's refine the replacement to fix quotes.
    // If it was "http://127.0.0.1:5000..." it will end up as "${API_BASE_URL}..."
    // which is not a template literal if it's currently inside a " ".
    // So we need to replace all " ${API... " with ` ${API... `
    let fixQuotesRegex = /"(\$\{API_BASE_URL\}[^"]*)"/g;
    content = content.replace(fixQuotesRegex, '`$1`');
    
    let fixSingleQuotesRegex = /'(\$\{API_BASE_URL\}[^']*)'/g;
    content = content.replace(fixSingleQuotesRegex, '`$1`');

    if (modified) {
        // add import at top if not exists
        if (!content.includes('API_BASE_URL')) {
            console.log(`WARN: modified ${file} but no API_BASE_URL found inside?`);
        }
        if (!content.includes("import { API_BASE_URL }")) {
            // insert at top
            content = importStatement + content;
        }
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${file}`);
    }
}

console.log("Done");
