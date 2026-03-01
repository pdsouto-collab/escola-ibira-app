const fs = require('fs');
const path = require('path');

// Helper to escape special chars for string literals
function escape(str) {
    if (!str) return '';
    let cleaned = str.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
    return cleaned
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\r/g, '')
        .replace(/\n/g, ' ');
}

// Function to read and parse CSV (semicolon delimited)
function parseCSV(filePath) {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    // Remove BOM if present
    const content = rawContent.replace(/^\uFEFF/, '');
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');

    const headers = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));

    return lines.slice(1).map(line => {
        const values = line.split(';');
        const obj = {};
        headers.forEach((h, i) => {
            obj[h] = values[i] ? values[i].trim().replace(/^"|"$/g, '') : '';
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
    const codeRaw = item['C¢digo'] || item['Código'] || '';
    const campoRaw = item['Campo de Experiˆncia'] || item['Campo de Experiência'] || '';
    const descRaw = item['Objetivo de Aprendizagem'] || '';

    if (!codeRaw || codeRaw === 'C¢digo' || codeRaw === 'Código') return;

    output += `    { id: "bncc-ei-${codeRaw.toLowerCase().replace(/[^a-z0-9]/g, '-')}", type: "skill", code: "${codeRaw}", name: "${escape(campoRaw)}", description: "${escape(descRaw)}", isBNCC: true, subGroup: "Educação Infantil", grade: "infantil" },\n`;
});

// Map Fundamental
fundamentalItems.forEach((item, idx) => {
    const disc = item['Disciplina'] || '';
    const anoRaw = item['Ano'] || '';
    const unidadeRaw = item['Unidade Tem tica'] || item['Unidade Temática'] || '';
    const habRaw = item['Habilidade'] || '';

    if (!habRaw || disc === 'Disciplina') return;

    // The Habilidade field contains " (CODE) DESCRIPTION "
    // Note: The screenshot shows (EF01MA01) inside the 'Habilidade' column.
    // Our previous regex was match(/^\(?([A-Z0-9]{7,})\)?[\s:-]*(.*)/i)
    // But if there's a leading space or it's formatted differently, it might fail.

    let code = "";
    let desc = habRaw;

    // Looking for EFXXLLXX or similar patterns
    const codeMatch = habRaw.match(/EF\d{2}[A-Z]{2}\d{2}/i);
    if (codeMatch) {
        code = codeMatch[0].toUpperCase();
        // Remove the code part from the description
        desc = habRaw.replace(new RegExp(`\\(?${code}\\)?[:\\s-]*`, 'i'), '').trim();
    } else {
        code = `HAB-${idx}`;
    }

    // Map "1º ano" to "1ano"
    let grade = "1ano";
    if (anoRaw.includes('2')) grade = "2ano";
    else if (anoRaw.includes('3')) grade = "3ano";
    else if (anoRaw.includes('4')) grade = "4ano";
    else if (anoRaw.includes('5')) grade = "5ano";

    output += `    { id: "bncc-ef-${code.toLowerCase()}-${idx}", type: "skill", code: "${code}", name: "${escape(unidadeRaw || disc)}", description: "${escape(desc)}", isBNCC: true, subGroup: "${escape(disc)}", grade: "${grade}" },\n`;
});

output += `];\n`;

fs.writeFileSync('src/lib/bncc-data.ts', output);
console.log('Successfully updated src/lib/bncc-data.ts');
