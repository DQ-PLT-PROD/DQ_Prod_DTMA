import os

# CONFIG: Directories to scan
ROOT_DIR = "src" 

def is_directory_effectively_empty(path):
    """
    Checks if a directory is empty or only contains system junk files 
    like .DS_Store or Thumbs.db.
    """
    if not os.path.exists(path):
        return False
        
    items = os.listdir(path)
    if not items:
        return True # Truly empty
        
    # List of junk files to ignore when deciding if a folder is "empty"
    junk_files = {'.DS_Store', 'Thumbs.db', '.gitkeep'}
    
    # If the set of items in the folder is a subset of junk_files, it's effectively empty
    if set(items).issubset(junk_files):
        return True
        
    return False

def cleanup_empty_artifacts(start_path):
    deleted_files = []
    deleted_dirs = []

    # 1. Remove Zero-Byte Files first
    for root, dirs, files in os.walk(start_path):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                if os.path.getsize(file_path) == 0:
                    os.remove(file_path)
                    deleted_files.append(file_path)
            except OSError:
                pass

    # 2. Remove Empty Directories (Bottom-Up)
    # topdown=False is critical: we must delete children before parents
    for root, dirs, files in os.walk(start_path, topdown=False):
        for name in dirs:
            dir_path = os.path.join(root, name)
            if is_directory_effectively_empty(dir_path):
                # If it had junk files, we need to delete them first before rmdir works
                for item in os.listdir(dir_path):
                    os.remove(os.path.join(dir_path, item))
                
                try:
                    os.rmdir(dir_path)
                    deleted_dirs.append(dir_path)
                except OSError:
                    pass

    return {
        "status": "complete",
        "deleted_files_count": len(deleted_files),
        "deleted_dirs_count": len(deleted_dirs),
        "deleted_dirs": deleted_dirs
    }

if __name__ == "__main__":
    import json
    if os.path.exists(ROOT_DIR):
        result = cleanup_empty_artifacts(ROOT_DIR)
        print(json.dumps(result, indent=2))
    else:
        print(json.dumps({"error": f"Directory '{ROOT_DIR}' not found."}, indent=2))