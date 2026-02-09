
import os
import sys
import fnmatch

# Configuration
DOCS_ROOT = "docs"
VALID_CATEGORIES = [
    "architecture", "features", "guides", "reports", 
    "planning", "specs", "reference", "system-specs", 
    "archive", "testing", "data", "ai"
]

def find_docs(keyword):
    """
    Search for documents containing the keyword in filename or path.
    """
    matches = []
    for root, dirs, files in os.walk(DOCS_ROOT):
        for filename in files:
            if filename.endswith(".md"):
                path = os.path.join(root, filename)
                # Simple case-insensitive match on path
                if keyword.lower() in path.lower():
                    matches.append(path)
    
    return matches

def check_path(proposed_path):
    """
    Validate if a proposed path adheres to hygiene rules.
    """
    # Normalize
    path = proposed_path.replace("\\", "/")
    parts = path.split("/")
    
    if not path.startswith("docs/"):
        return False, "All documents must start with 'docs/'."
    
    if len(parts) < 3:
         # docs/filename.md -> parts length 2
         return False, f"Root 'docs/' is forbidden. valid folders: {', '.join(VALID_CATEGORIES)}"
    
    category = parts[1]
    if category not in VALID_CATEGORIES:
        return False, f"Invalid category '{category}'. Valid: {', '.join(VALID_CATEGORIES)}"
        
    return True, "Valid path."

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage:")
        print("  doc_manager.py find <keyword>")
        print("  doc_manager.py check <path>")
        sys.exit(1)
        
    command = sys.argv[1]
    arg = sys.argv[2]
    
    if command == "find":
        results = find_docs(arg)
        if results:
            print("Found matches:")
            for r in results:
                print(f"- {r}")
        else:
            print("No matches found.")
            
    elif command == "check":
        valid, msg = check_path(arg)
        if valid:
            print(f"✅ PASSED: {msg}")
        else:
            print(f"❌ FAILED: {msg}")
            sys.exit(1)
            
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
