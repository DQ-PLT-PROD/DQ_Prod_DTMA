
import os
import sys

def cleanup(target_dir="."):
    """
    Removes empty directories and zero-byte files.
    """
    deleted_files = 0
    deleted_dirs = 0

    for root, dirs, files in os.walk(target_dir, topdown=False):
        for name in files:
            path = os.path.join(root, name)
            try:
                if os.path.getsize(path) == 0:
                    os.remove(path)
                    deleted_files += 1
            except OSError:
                pass

        for name in dirs:
            path = os.path.join(root, name)
            try:
                os.rmdir(path) # Only removes if empty
                deleted_dirs += 1
            except OSError:
                pass
    
    # print(f"Cleanup: Removed {deleted_files} files, {deleted_dirs} dirs")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    cleanup(target)
