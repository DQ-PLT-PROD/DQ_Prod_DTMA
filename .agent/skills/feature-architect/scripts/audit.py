import os
import re
import json

# CONFIG: Adjust these to match the user's actual folder names if they differ
ROOT = "src"
FEATURES_DIR = "features"
SHARED_DIRS = ["components", "hooks", "utils", "lib", "api", "types", "ui"]

def get_import_source(line):
    # Regex to capture content inside quotes: import ... from "CAPTURE"
    match = re.search(r'from\s+[\'"](.*?)[\'"]', line)
    return match.group(1) if match else None

def analyze_file(file_path, root_context):
    violations = []
    
    # Determine which zone this file belongs to
    rel_path = os.path.relpath(file_path, root_context)
    path_parts = rel_path.split(os.sep)
    
    current_zone = "UNKNOWN"
    current_feature = None

    if path_parts[0] == FEATURES_DIR:
        current_zone = "FEATURE"
        current_feature = path_parts[1] # e.g., 'auth'
    elif path_parts[0] in SHARED_DIRS:
        current_zone = "SHARED"
    
    # Read imports
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception:
        return []

    for i, line in enumerate(lines):
        if "import" not in line: continue
        
        import_path = get_import_source(line)
        if not import_path or import_path.startswith("."): continue # Ignore relative for now unless strict
        
        # Check Rule: SHARED cannot import FEATURES
        if current_zone == "SHARED" and f"{FEATURES_DIR}/" in import_path:
            violations.append({
                "file": rel_path,
                "line": i + 1,
                "rule": "SHARED code cannot import FEATURES",
                "bad_import": import_path
            })

        # Check Rule: FEATURE cannot import OTHER FEATURE
        if current_zone == "FEATURE" and f"{FEATURES_DIR}/" in import_path:
            # Extract target feature from import string
            # Assumes alias format like @/features/target OR relative ../target
            target_parts = import_path.split(f"{FEATURES_DIR}/")
            if len(target_parts) > 1:
                target_feature = target_parts[1].split("/")[0]
                if target_feature != current_feature:
                    violations.append({
                        "file": rel_path,
                        "line": i + 1,
                        "rule": f"Feature '{current_feature}' cannot import Feature '{target_feature}'",
                        "bad_import": import_path
                    })

    return violations

def main():
    all_violations = []
    if not os.path.exists(ROOT):
        print(json.dumps({"error": f"Root directory '{ROOT}' not found."}))
        return

    for root, _, files in os.walk(ROOT):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                full_path = os.path.join(root, file)
                all_violations.extend(analyze_file(full_path, ROOT))
    
    print(json.dumps({"violations": all_violations}, indent=2))

if __name__ == "__main__":
    main()