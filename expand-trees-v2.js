const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src/lib/data.ts');
const bnccPath = path.join(__dirname, 'src/lib/bncc-data.ts');

const dataContent = fs.readFileSync(dataPath, 'utf8');
const bnccContent = fs.readFileSync(bnccPath, 'utf8');

// Parse BNCC Data for Skill Tree
// { id: "bncc-ef-ef01lp01-0", type: "skill", code: "EF01LP01", name: "Leitura/escuta...", description: "...", isBNCC: true, subGroup: "Língua Portuguesa", grade: "1ano" }
const skillItems = [];
const skillRegex = /{ id: "(bncc-ef-[^"]+)",[^}]*name: "([^"]+)"[^}]*subGroup: "([^"]+)"/g;
let match;
while ((match = skillRegex.exec(bnccContent)) !== null) {
    skillItems.push({ id: match[1], name: match[2], subGroup: match[3] });
}

// Parse Mock Library Items for Content Tree
// { id: "lib-cg-1", type: "content", name: "Busca por Aprendizado", ... }
const contentItems = [];
const contentRegex = /{ id: "(lib-(?:cg|custom)-[^"]+)",[^}]*name: "([^"]+)"[^}]*subGroup: "([^"]+)"/g;
while ((match = contentRegex.exec(dataContent)) !== null) {
    contentItems.push({ id: match[1], name: match[2], subGroup: match[3] });
}

console.log(`Found ${skillItems.length} skills and ${contentItems.length} contents.`);

// Builders
function createAtomicos(prefix, count) {
    const atomicos = [];
    for (let i = 1; i <= count; i++) {
        atomicos.push({
            id: `ato-${prefix}-${i}`,
            level: "atomico",
            type: prefix.includes('sk') ? 'skill' : 'content',
            name: `Evidência ${i} para a habilidade/conteúdo.`,
            children: []
        });
    }
    return atomicos;
}

function createMicros(prefix, type, l1Name, l2Name, count, libraryPool) {
    const micros = [];
    for (let i = 1; i <= count; i++) {
        // Pick an item from the pool round-robin
        const poolIndex = (micros.length + libraryPool.length * Math.floor(Math.random() * 10)) % libraryPool.length;
        const libItem = libraryPool[poolIndex] || libraryPool[0];

        micros.push({
            id: `mic-${prefix}-${i}`,
            level: "micro",
            type: type,
            name: libItem.name || `${type === 'skill' ? 'Habilidade' : 'Conteúdo'} ${i}`,
            libraryItemId: libItem.id,
            children: createAtomicos(`${prefix}-${i}`, 3)
        });
    }
    return micros;
}

function createMesclados(prefix, type, l1Name, names, count, libraryPool) {
    const mesclados = [];
    for (let i = 0; i < count; i++) {
        const name = names[i] || `Subárea ${i + 1}`;
        mesclados.push({
            id: `mes-${prefix}-${i + 1}`,
            level: "mesclado",
            type: type,
            name: name,
            children: createMicros(`${prefix}-${i + 1}`, type, l1Name, name, 3, libraryPool)
        });
    }
    return mesclados;
}

function createMacro(id, name, type, mescladoNames, libraryPool) {
    return {
        id: id,
        level: "macro",
        type: type,
        name: name,
        classId: "jardim-i",
        children: createMesclados(id.replace('macro-', ''), type, name, mescladoNames, 3, libraryPool)
    };
}

// 5 Macros each
const skillMacros = [
    createMacro("macro-sk-ciencias", "Ciências da Natureza e Humanas", "skill", ["Ciências", "História", "Geografia"], skillItems),
    createMacro("macro-sk-linguagens", "Linguagens", "skill", ["Língua Portuguesa", "Arte", "Educação Física"], skillItems),
    createMacro("macro-sk-matematica", "Matemática e Lógica", "skill", ["Aritmética", "Geometria", "Medidas"], skillItems),
    createMacro("macro-sk-socioemocional", "Socioemocional", "skill", ["Autoconhecimento", "Empatia", "Colaboração"], skillItems),
    createMacro("macro-sk-expressao", "Expressão Corporal e Artística", "skill", ["Dança", "Teatro", "Música"], skillItems)
];

const contentMacros = [
    createMacro("macro-ct-identidade", "Identidade e Autonomia", "content", ["Eu e o Outro", "Cuidado Pessoal", "Estando no Mundo"], contentItems),
    createMacro("macro-ct-linguagem", "Linguagem Oral e Escrita", "content", ["Fala e Escuta", "Práticas de Leitura", "Escrita Inicial"], contentItems),
    createMacro("macro-ct-matematica", "Matemática", "content", ["Números", "Espaço e Forma", "Grandezas"], contentItems),
    createMacro("macro-ct-natureza", "Natureza e Sociedade", "content", ["Seres Vivos", "Fenômenos Naturais", "A Sociedade"], contentItems),
    createMacro("macro-ct-movimento", "Movimento", "content", ["Coordenação Grossa", "Coordenação Fina", "Expressão Livre"], contentItems)
];

// Read existing file, replace just the arrays
let stringContent = fs.readFileSync(dataPath, 'utf8');

const skillsStartStr = 'export const mockSkillsTree: KnowledgeNode[] = [';
const skillsStart = stringContent.indexOf(skillsStartStr);
let skillsEnd = stringContent.indexOf('];\n\n// Initial mock contents', skillsStart);
if (skillsEnd === -1) {
    skillsEnd = stringContent.indexOf('];', skillsStart);
}

if (skillsStart > -1 && skillsEnd > -1) {
    const skillsTreeStr = `export const mockSkillsTree: KnowledgeNode[] = ${JSON.stringify(skillMacros, null, 4)}`;
    stringContent = stringContent.substring(0, skillsStart) + skillsTreeStr + stringContent.substring(skillsEnd + 1);
}

const contentsStartStr = 'export const mockContentsTree: KnowledgeNode[] = [';
const contentsStart = stringContent.indexOf(contentsStartStr);
let contentsEnd = stringContent.indexOf('];\n\nexport const mockFinalProductTypes', contentsStart);
if (contentsEnd === -1) {
    contentsEnd = stringContent.indexOf('];', contentsStart);
}

if (contentsStart > -1 && contentsEnd > -1) {
    const contentsTreeStr = `export const mockContentsTree: KnowledgeNode[] = ${JSON.stringify(contentMacros, null, 4)}`;
    stringContent = stringContent.substring(0, contentsStart) + contentsTreeStr + stringContent.substring(contentsEnd + 1);
}

fs.writeFileSync(dataPath, stringContent, 'utf8');
console.log("Written data.ts successfully.");
