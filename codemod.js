const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');
    const originalContent = content;

    // Skip files that don't use currentUser or setCurrentUser
    if (!content.includes('currentUser') && !content.includes('setCurrentUser')) {
        return;
    }

    // Skip store.tsx and this script itself
    if (filepath.includes('store.tsx') || filepath.endsWith('.js')) {
        return;
    }

    console.log(`Modifying ${filepath}`);

    // Add useSession import if needed
    if (!content.includes('useSession')) {
        const importRegex = /^import .*;\n?/gm;
        let lastMatch = null;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            lastMatch = match;
        }
        
        const importStr = 'import { useSession } from "next-auth/react";\n';
        if (lastMatch) {
            content = content.slice(0, lastMatch.index + lastMatch[0].length) + importStr + content.slice(lastMatch.index + lastMatch[0].length);
        } else {
            content = importStr + content;
        }
    }
            
    // Remove currentUser from useAppStore mapping
    content = content.replace(/currentUser,\s*/g, '');
    content = content.replace(/,\s*currentUser/g, '');
    content = content.replace(/setCurrentUser,\s*/g, '');
    content = content.replace(/,\s*setCurrentUser/g, '');
    
    // Remove empty useAppStore
    content = content.replace(/const\s*\{\s*\}\s*=\s*useAppStore\(\);?\n?/g, '');

    // Inject useSession
    if (content.includes('useAppStore()')) {
        content = content.replace(
            /(const\s+\{.*\}\s*=\s*useAppStore\(\);?)/,
            '$1\n    const { data: session } = useSession();\n    const currentUser = session?.user as any;'
        );
    } else {
        // If there's no useAppStore(), we try to inject at the start of the component
        // Typically it matches `export function ... {` or `export default function ... {`
        content = content.replace(
            /(export\s+(?:default\s+)?function\s+\w+\([^)]*\)\s*\{)/,
            '$1\n    const { data: session } = useSession();\n    const currentUser = session?.user as any;'
        );
    }
        
    if (originalContent !== content) {
        fs.writeFileSync(filepath, content, 'utf-8');
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walkDir(filepath);
        } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
            processFile(filepath);
        }
    }
}

const srcDir = path.join(__dirname, 'src');
walkDir(srcDir);
