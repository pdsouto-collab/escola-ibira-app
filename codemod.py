import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip files that don't use currentUser or setCurrentUser
    if 'currentUser' not in content and 'setCurrentUser' not in content:
        return

    # Skip store.tsx and this script itself
    if 'store.tsx' in filepath or filepath.endswith('.py'):
        return

    print(f"Modifying {filepath}")
    original_content = content

    # Add import if needed
    if 'useSession' not in content:
        # insert after last import
        imports = list(re.finditer(r'^import .*;\n', content, re.MULTILINE))
        if imports:
            last_import = imports[-1]
            content = content[:last_import.end()] + 'import { useSession } from "next-auth/react";\n' + content[last_import.end():]
        else:
            content = 'import { useSession } from "next-auth/react";\n' + content
            
    # Remove currentUser from useAppStore
    content = re.sub(r'currentUser,\s*', '', content)
    content = re.sub(r',\s*currentUser', '', content)
    content = re.sub(r'setCurrentUser,\s*', '', content)
    content = re.sub(r',\s*setCurrentUser', '', content)
    
    # If useAppStore() is empty because we removed the only things, we remove it
    content = re.sub(r'const\s*{\s*}\s*=\s*useAppStore\(\);?\n?', '', content)

    # Inject useSession in components
    # Find components (export function ..., export default function ..., const ... = () => ...)
    # This regex is a simple heuristic -> finding the first block after the destructure or function def
    # Alternatively, just inject `const { data: session } = useSession();\n    const currentUser = session?.user as any;` right after `useAppStore()`
    
    # Let's find useAppStore() calls and insert next to it
    if 'useAppStore()' in content:
        content = re.sub(
            r'(const\s+{[^}]*}\s*=\s*useAppStore\(\);?)',
            r'\1\n    const { data: session } = useSession();\n    const currentUser = session?.user as any;',
            content
        )
    else:
        # If no useAppStore but had currentUser (e.g. from props?), skip or try to find a place
        # Actually most are from useAppStore
        pass
        
    if original_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

src_dir = os.path.join(os.path.dirname(__file__), 'src')
for root, _, files in os.walk(src_dir):
    for filename in files:
        if filename.endswith('.tsx') or filename.endswith('.ts'):
            filepath = os.path.join(root, filename)
            process_file(filepath)
