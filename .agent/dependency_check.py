import sys
import os
import pathlib

def validate_path(file_path):
    path = pathlib.Path(file_path)
    parts = path.parts
    
    # Normalize path separator
    file_path_str = str(path).replace('\\', '/')

    print(f"Checking placement for: {file_path_str}")

    # Rule: Skill files must be in .agent/
    if ".agent" in parts:
        # Check if inside 'skills' directory
        if "skills" in parts:
            try:
                # parts: ('.agent', 'skills', 'skill_name', ...)
                skills_index = parts.index("skills")
                if len(parts) > skills_index + 1:
                    skill_name = parts[skills_index + 1]
                    relative_path_in_skill = parts[skills_index + 2:]
                    
                    if not relative_path_in_skill:
                         # Creating the folder itself
                         return True, "Skill directory creation."

                    # Rule: Root of skill folder can only contain SKILL.md or README.md
                    if len(relative_path_in_skill) == 1:
                        filename = relative_path_in_skill[0]
                        if filename not in ["SKILL.md", "README.md"]:
                            return False, f"Invalid file in skill root: {filename}. Scripts must go in 'scripts/'."
                    
                    # Rule: Python scripts must be in scripts/
                    if path.suffix == '.py':
                        if "scripts" not in relative_path_in_skill:
                             return False, "Skill logic (Python) must be in 'scripts/' subdirectory."

            except ValueError:
                pass
        
        return True, "Valid .agent file location."

    # Rule: Documentation vs Feature-Specific Files
    if path.suffix == '.md':
        # Feature-specific docs MUST be in docs/features
        if "src" in parts and "features" in parts:
             return False, "Feature specs must move to 'docs/features/'. Do not nest in src/."
        
        # General docs or Feature docs in docs/
        if "docs" in parts:
             return True, "Valid documentation location."
        
        # Walkthroughs/Artifacts in .gemini/ brain are excluded/allowed generally, 
        # but if the user creates a doc in root, it's a violation.
        if "src" not in parts and "docs" not in parts and ".gemini" not in parts and ".agent" not in parts:
             return False, "Markdown files must be in 'docs/' (general) or 'src/features/<feature>/' (specific). Root-level docs are forbidden."

    # Rule: Feature-Based Architecture (Code)
    if path.suffix in ['.ts', '.tsx', '.js', '.jsx', '.css']:
        if "src" not in parts:
             # Allow config files in root?
             if file_path_str.endswith(".config.ts") or file_path_str.endswith(".config.js"):
                 return True, "Config file allowed."
             return False, "Source code must be in 'src/'."
        
        # Check for orphans in src root
        # parts index of src
        try:
            src_index = parts.index("src")
            if len(parts) == src_index + 2: # src/file.ts
                 if parts[-1] not in ["App.tsx", "main.tsx", "vite-env.d.ts", "index.css", "index.tsx"]:
                     return False, "Code files should not exist in src root. Use features/, components/, lib/, etc."
        except ValueError:
            pass

    # Rule: Root File Restrictions (Default Deny)
    # If the file is in the root directory (not in a subfolder)
    # We check if 'parts' has length 1 (filename only) or if it's explicitly absolute path to root
    
    # Heuristic: If path doesn't start with a known top-level directory
    top_level_dirs = ["src", "docs", ".agent", ".gemini", "public", "scripts", "supabase", "k8s", "api", "dist", "node_modules", ".git", ".github", ".vscode"]
    
    is_in_subfolder = any(d in parts for d in top_level_dirs)
    
    if not is_in_subfolder:
        # It's likely a root file. Check Allow List.
        allowed_root_files = [
            "package.json", "package-lock.json", "tsconfig.json", "tsconfig.node.json", 
            "vite.config.ts", "vitest.config.ts", "tailwind.config.js", "postcss.config.js",
            ".eslintrc.cjs", ".gitignore", ".env", ".env.example", ".env.local",
            "README.md", "LICENSE", "Dockerfile", "knip.json", "vercel.json",
            "azure-pipelines.yml", "sonar-project.properties"
        ]
        
        filename = parts[-1] 
        
        # Exact match
        if filename in allowed_root_files:
            return True, "Trusted root configuration file."
            
        # Pattern match
        if filename.endswith(".config.js") or filename.endswith(".config.ts"):
            return True, "Config file allowed."
            
        return False, f"❌ ROOT ACCESS DENIED: '{filename}' is not in the allowed root file list. Put implementation code in src/ or docs in docs/."

    return True, "Path looks acceptable."

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python dependency_check.py <file_path>")
        sys.exit(1)

    target_path = sys.argv[1]
    is_valid, message = validate_path(target_path)

    if is_valid:
        print(f"✅ PASSED: {message}")
        sys.exit(0)
    else:
        print(f"❌ FAILED: {message}")
        sys.exit(1)
