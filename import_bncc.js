const fs = require('fs');
const path = require('path');

// Helper to escape special chars for string literals
function escape(str) {
    if (!str) return '';
    // Remove extra quotes that might be coming from CSV
    let cleaned = str.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
    // Escape backslashes first, then single quotes, then double quotes
    return cleaned
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\r/g, '')
        .replace(/\n/g, ' ');
}

// Function to read and parse CSV (semicolon delimited)
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim() !== '');
    const headers = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
        const values = line.split(';');
        const obj = {};
        headers.forEach((h, i) => {
            obj[h] = values[i] ? values[i].trim() : '';
        });
        return obj;
    });
}

const infantilItems = parseCSV('infantil.csv');
const fundamentalItems = parseCSV('bncc_fundamental_1_ao_5.csv');

let output = `import { LibraryItem } from "./data";

export const bnccData: LibraryItem[] = [
`;

// Map Infantil
infantilItems.forEach((item, idx) => {
    let grade = "infantil";

    // Slop matching for headers
    const codeRaw = item['C¢digo'] || item['Código'] || '';
    const code = codeRaw.replace(/^"|"$/g, '').trim();

    const campoRaw = item['Campo de Experiˆncia'] || item['Campo de Experiência'] || '';
    const campo = campoRaw.replace(/^"|"$/g, '').trim();

    const descRaw = item['Objetivo de Aprendizagem'] || '';
    const desc = descRaw.replace(/^"|"$/g, '').trim();

    if (!code || code === 'C¢digo' || code === 'Código') return;

    output += `    { id: "bncc-ei-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}", type: "skill", code: "${code}", name: "${escape(campo)}", description: "${escape(desc)}", isBNCC: true, subGroup: "Educação Infantil", grade: "infantil" },\n`;
});

// Map Fundamental
fundamentalItems.forEach((item, idx) => {
    const disc = (item['Disciplina'] || '').replace(/^"|"$/g, '').trim();
    const anoRaw = (item['Ano'] || '').replace(/^"|"$/g, '').trim();
    const unidadeRaw = item['Unidade Tem tica'] || item['Unidade Temática'] || '';
    const unidade = unidadeRaw.replace(/^"|"$/g, '').trim();
    const habRaw = (item['Habilidade'] || '').replace(/^"|"$/g, '').trim();

    if (!habRaw || disc === 'Disciplina') return;

    // Pattern for codes like EF01LP01 or (EF01LP01)
    let code = "";
    let desc = habRaw;

    const match = habRaw.match(/^\(?([A-Z0-9]{7,})\)?[\s:-]*(.*)/i);
    if (match) {
        code = match[1].toUpperCase();
        desc = match[2].trim();
    } else {
        // Fallback if no code detected
        code = `HAB-${idx}`;
    }

    // Map "1º ano" to "1ano"
    let grade = "1ano";
    if (anoRaw.includes('2')) grade = "2ano";
    else if (anoRaw.includes('3')) grade = "3ano";
    else if (anoRaw.includes('4')) grade = "4ano";
    else if (anoRaw.includes('5')) grade = "5ano";

    output += `    { id: "bncc-ef-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}", type: "skill", code: "${code}", name: "${escape(unidade || disc)}", description: "${escape(desc)}", isBNCC: true, subGroup: "${escape(disc)}", grade: "${grade}" },\n`;
});

output += `];\n`;

fs.writeFileSync('src/lib/bncc-data.ts', output);
console.log('Successfully updated src/lib/bncc-data.ts');
