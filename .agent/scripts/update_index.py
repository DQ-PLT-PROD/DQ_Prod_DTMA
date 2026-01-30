
import os
import re

# Paths relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
SKILLS_DIR = os.path.join(PROJECT_ROOT, ".agent", "skills")
AGENTS_MD_PATH = os.path.join(PROJECT_ROOT, "AGENTS.md")

MARKER_START = "<!-- SKILLS_START -->"
MARKER_END = "<!-- SKILLS_END -->"

def parse_skill_frontmatter(file_path):
    """Simple parser for YAML frontmatter in SKILL.md"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = re.search(r'^---\s+(.*?)\s+---', content, re.DOTALL)
    if not match:
        return None
        
    frontmatter = match.group(1)
    data = {}
    for line in frontmatter.split('\n'):
        if ':' in line:
            key, val = line.split(':', 1)
            data[key.strip()] = val.strip()
    return data

def get_skills():
    skills = []
    if not os.path.exists(SKILLS_DIR):
        return skills

    for item in os.listdir(SKILLS_DIR):
        skill_path = os.path.join(SKILLS_DIR, item)
        if os.path.isdir(skill_path):
            md_path = os.path.join(skill_path, "SKILL.md")
            if os.path.exists(md_path):
                meta = parse_skill_frontmatter(md_path)
                if meta:
                    name = meta.get('name', item)
                    desc = meta.get('description', 'No description.')
                    # Escape pipes for markdown table
                    desc = desc.replace('|', '\|')
                    skills.append({
                        'name': name,
                        'path': f".agent/skills/{item}/SKILL.md",
                        'desc': desc
                    })
    return skills

def generate_table(skills):
    lines = [
        "| Skill Domain | Source Path (`.agent/skills/...`) | Key Description |",
        "|--------------|-----------------------------------|-----------------|"
    ]
    for s in skills:
        lines.append(f"| **{s['name']}** | `{s['path']}` | {s['desc']} |")
    return "\n".join(lines)

def update_agents_md():
    if not os.path.exists(AGENTS_MD_PATH):
        print(f"Error: {AGENTS_MD_PATH} not found.")
        return

    skills = get_skills()
    new_table = generate_table(skills)

    with open(AGENTS_MD_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to replace content between markers
    pattern = re.compile(f"({re.escape(MARKER_START)}).*?({re.escape(MARKER_END)})", re.DOTALL)
    
    if not pattern.search(content):
        print("Error: Markers not found in AGENTS.md. Please add <!-- SKILLS_START --> and <!-- SKILLS_END -->.")
        return

    new_content = pattern.sub(f"\\1\n{new_table}\n\\2", content)

    with open(AGENTS_MD_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Successfully updated AGENTS.md with {len(skills)} skills.")

if __name__ == "__main__":
    update_agents_md()
