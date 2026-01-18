# Universal Skill Genesis Template

## Purpose
This document is the **Master Blueprint** for creating new AI Agent Skills. When the user asks to "create a new skill," you (the Agent) must follow this protocol strictly to generate a complete, robust skill package.

---

## Phase 1: The Interview Protocol
Before generating any code, you must ask the user the following clarifying questions to define the skill's requirements:

1.  **Intent & Trigger:** "What is the specific 'verb-noun' action (e.g., 'Refactor Code')? What phrases should trigger this skill?"
2.  **Mechanics:** "Does this skill need to read files, write files, or execute terminal commands? Does it require any external inputs?"
3.  **Logic:** "Do we need a Python script for complex logic (recommended for safety), or just text instructions?"
4.  **Guardrails:** "What are the specific safety constraints? (e.g., 'Never delete without asking')."

---

## Phase 2: The Generation Protocol
Once the interview is complete, you must generate the skill files. 

**CRITICAL INSTRUCTION:** You must output **three distinct files**. For each file, you must explicitly state the **File Path**, the **Purpose**, and the **File Content** in a code block.

### Follow this exact output format for every new skill:

#### 1. The Manifest File (`SKILL.md`)
* **Store at:** `skills/<skill-name>/SKILL.md`
* **Why:** This file tells the AI when to load the skill and how to use it.
* **Content Template:**
    ```markdown
    ---
    name: <kebab-case-name>
    description: <Action-oriented description for semantic discovery>
    ---

    # Goal
    <Concise summary of what this skill achieves>

    # Usage
    Use this skill when the user asks to <trigger phrases>.

    # Steps
    1.  **Prepare**: <Pre-flight checks>
    2.  **Execute**: Run `scripts/<main_script>.py`.
    3.  **Cleanup**: Run `scripts/cleanup.py` to ensure no artifacts remain.

    # Constraints
    - <Constraint 1: Safety>
    - <Constraint 2: Formatting>
    - **CLEANUP RULE:** Always run the cleanup script after execution.
    ```

#### 2. The Logic Script (`<action>.py`)
* **Store at:** `skills/<skill-name>/scripts/<action>.py`
* **Why:** Performs the actual work (parsing, calculating, API calls) safely and deterministically.
* **Content Requirements:**
    * Must be standard Python 3.
    * Must use `if __name__ == "__main__":` block.
    * Must output JSON to stdout.
    * **NO** external pip dependencies unless explicitly requested.

#### 3. The Cleanup Script (`cleanup.py`)
* **Store at:** `skills/<skill-name>/scripts/cleanup.py`
* **Why:** Ensures no empty folders or zero-byte files are left behind.
* **Content Template:**
    ```python
    import os

    def cleanup(target_dir):
        # Recursive logic to delete empty dirs and 0-byte files
        pass

    if __name__ == "__main__":
        # Logic to trigger cleanup
        pass
    ```

---

## Phase 3: Final Verification
After generating the files, ask the user:
"I have generated the 3 required files. Please save them to the paths indicated above. Would you like me to explain how to test this new skill?"