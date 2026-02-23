#!/usr/bin/env python3
"""
Feature-Based Architecture Audit Script

Scans the codebase for architectural violations per SKILL.md:
1. SHARED code importing from FEATURES (upward dependency)
2. Features importing from other features (cross-feature contamination)

Usage:
    python scripts/audit.py [--fix]
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Tuple, Set

# Define zone paths
SHARED_PATHS = [
    'src/components',
    'src/hooks',
    'src/utils',
    'src/lib',
    'src/api',
    'src/types',
    'src/services',
    'src/constants',
    'src/config',
    'src/context',
]

FEATURES_PATH = 'src/features'
APP_PATHS = ['src/app', 'src/pages', 'src/routes', 'src/App.tsx', 'src/AppRouter.tsx']

# Regex patterns for imports
IMPORT_PATTERNS = [
    re.compile(r"from\s+['\"](@/features/[^'\"]+)['\"]"),  # @/ alias
    re.compile(r"from\s+['\"](\.\.\/.*features\/[^'\"]+)['\"]"),  # Relative to features
    re.compile(r"from\s+['\"](@/[^'\"]+)['\"]"),  # Any @/ import for context
]


class Violation:
    def __init__(self, file_path: str, line_num: int, line_content: str, 
                 violation_type: str, imported_path: str):
        self.file_path = file_path
        self.line_num = line_num
        self.line_content = line_content.strip()
        self.violation_type = violation_type
        self.imported_path = imported_path

    def __str__(self):
        return f"{self.violation_type}: {self.file_path}:{self.line_num}\n  {self.line_content}"


def get_zone(file_path: str) -> str:
    """Determine which zone a file belongs to."""
    rel_path = file_path.replace('\\', '/')
    
    # Check if in FEATURES
    if '/features/' in rel_path or rel_path.startswith('src/features/'):
        return 'FEATURES'
    
    # Check if in SHARED
    for shared in SHARED_PATHS:
        if shared.replace('\\', '/') in rel_path or rel_path.startswith(shared):
            return 'SHARED'
    
    # Check if in APP
    for app in APP_PATHS:
        if app.replace('\\', '/') in rel_path or rel_path.startswith(app):
            return 'APP'
    
    return 'UNKNOWN'


def get_feature_name(file_path: str) -> str:
    """Extract feature name from a features path."""
    match = re.search(r'features[/\\]([^/\\]+)', file_path)
    return match.group(1) if match else ''


def extract_feature_from_import(import_path: str) -> str:
    """Extract feature name from an import path."""
    match = re.search(r'@/features/([^/]+)', import_path)
    if match:
        return match.group(1)
    match = re.search(r'features/([^/]+)', import_path)
    return match.group(1) if match else ''


def scan_file(file_path: str, root_dir: str) -> List[Violation]:
    """Scan a single file for violations."""
    violations = []
    rel_path = os.path.relpath(file_path, root_dir)
    zone = get_zone(rel_path)
    feature_name = get_feature_name(rel_path) if zone == 'FEATURES' else ''
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}", file=sys.stderr)
        return []
    
    for line_num, line in enumerate(lines, 1):
        # Look for feature imports
        for pattern in IMPORT_PATTERNS[:2]:  # Only check feature-specific patterns
            match = pattern.search(line)
            if match:
                imported_path = match.group(1)
                imported_feature = extract_feature_from_import(imported_path)
                
                # Check for SHARED importing from FEATURES
                if zone == 'SHARED':
                    violations.append(Violation(
                        rel_path, line_num, line,
                        "🚨 UPWARD DEPENDENCY (SHARED → FEATURES)",
                        imported_path
                    ))
                
                # Check for cross-feature imports
                elif zone == 'FEATURES' and imported_feature and imported_feature != feature_name:
                    violations.append(Violation(
                        rel_path, line_num, line,
                        "🚨 CROSS-FEATURE CONTAMINATION",
                        imported_path
                    ))
    
    return violations


def scan_directory(root_dir: str) -> List[Violation]:
    """Recursively scan directory for violations."""
    all_violations = []
    src_dir = os.path.join(root_dir, 'src')
    
    if not os.path.exists(src_dir):
        print(f"Error: {src_dir} not found", file=sys.stderr)
        return []
    
    for dirpath, dirnames, filenames in os.walk(src_dir):
        # Skip node_modules and hidden directories
        dirnames[:] = [d for d in dirnames if not d.startswith('.') and d != 'node_modules']
        
        for filename in filenames:
            if filename.endswith(('.ts', '.tsx', '.js', '.jsx')):
                file_path = os.path.join(dirpath, filename)
                violations = scan_file(file_path, root_dir)
                all_violations.extend(violations)
    
    return all_violations


def main():
    # Find project root (assumes script is in scripts/ directory)
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent
    
    print(f"Scanning {root_dir}...")
    print("=" * 60)
    
    violations = scan_directory(str(root_dir))
    
    if not violations:
        print("✅ No architectural violations found!")
        return 0
    
    # Group by type
    upward = [v for v in violations if "UPWARD" in v.violation_type]
    cross = [v for v in violations if "CROSS-FEATURE" in v.violation_type]
    
    if upward:
        print(f"\n🚨 UPWARD DEPENDENCIES (SHARED → FEATURES): {len(upward)}")
        print("-" * 60)
        for v in upward:
            print(f"  {v.file_path}:{v.line_num}")
            print(f"    → imports: {v.imported_path}")
    
    if cross:
        print(f"\n🚨 CROSS-FEATURE CONTAMINATION: {len(cross)}")
        print("-" * 60)
        for v in cross:
            print(f"  {v.file_path}:{v.line_num}")
            print(f"    → imports: {v.imported_path}")
    
    print("\n" + "=" * 60)
    print(f"Total violations: {len(violations)}")
    
    return 1 if violations else 0


if __name__ == "__main__":
    sys.exit(main())
