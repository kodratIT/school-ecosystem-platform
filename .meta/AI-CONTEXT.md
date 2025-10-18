# 🤖 AI Context Guide - Quick Reference

**Purpose**: Panduan cepat untuk AI memahami project dan melanjutkan development  
**Target**: AI assistants (ChatGPT, Claude, etc.)  
**Version**: 1.0

---

## ⚡ Quick Start (30 seconds)

### Copy This Prompt to AI:

```
Saya mengerjakan project "Ekosistem Sekolah" - SaaS platform untuk school management.

Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

FILES PENTING:
1. README.md - Project overview
2. .meta/PROGRESS-TRACKER.md - Current progress & next task
3. ROADMAP.md - 16 phases plan

TASK: [sebutkan task spesifik]

Tolong baca PROGRESS-TRACKER.md untuk tau status saat ini, lalu [lanjutkan dengan task].
```

---

## 📂 Project Structure at a Glance

```
ekosistem-sekolah/
├── README.md               ← Start here for overview
├── ROADMAP.md              ← 16 phases, 54 weeks plan
├── GET-STARTED.md          ← Quick start guide
│
├── .meta/                  ← PROJECT STATUS & AI GUIDES
│   ├── PROGRESS-TRACKER.md ← 🔥 CHECK THIS FIRST!
│   ├── AI-PROMPT-TEMPLATE.md
│   ├── AI-CONTEXT.md       ← You are here
│   └── DOCUMENTATION-INDEX.md
│
├── phases/                 ← Phase documentation
│   ├── phase-00-foundation/
│   │   ├── README.md       ← Phase 0 overview
│   │   ├── IMPLEMENTATION.md ← Detailed guide
│   │   └── SUMMARY.md
│   └── phase-01-identity-provider/
│       └── (same structure)
│
├── stories/                ← Development tasks
│   ├── phase-00-foundation/
│   │   └── STORY-001 to STORY-011 (11 files)
│   └── phase-01-identity-provider/
│       └── STORY-012 to STORY-021 (10 files)
│
└── docs/                   ← Architecture & diagrams
    ├── architecture/
    ├── development/
    └── diagrams/ (8 UML files)
```

---

## 🎯 AI First Steps Checklist

Ketika AI pertama kali diminta help dengan project ini:

### Step 1: Read Current Status (MANDATORY)
```bash
Read: .meta/PROGRESS-TRACKER.md
```

Output yang kamu cari:
- Overall progress percentage
- Current phase
- Last completed story
- Next story to work on
- Any blockers

### Step 2: Understand Context
```bash
Read: README.md (if need overview)
Read: ROADMAP.md (if need to understand phases)
```

### Step 3: Read Relevant Story
```bash
Read: stories/phase-XX-name/STORY-[NUMBER]-description.md
```

### Step 4: Start Implementation
Follow step-by-step guide in story file.

---

## 📊 How to Check Progress

### Quick Status Check

**File to read**: `.meta/PROGRESS-TRACKER.md`

**Information available:**
- ✅ Overall progress (X%)
- ✅ Current phase status
- ✅ Completed stories count
- ✅ Next task to work on
- ✅ Blockers or issues

### Example Status Reading

```
Current Status from PROGRESS-TRACKER.md:

Overall Progress: 15% (3/21 stories)
Current Phase: Phase 0
Last Completed: STORY-003
Next Task: STORY-004 - Setup Git Hooks
Status: 🏗️ Ready to start
```

---

## 🎯 Common AI Tasks

### Task 1: "Apa yang harus dikerjakan sekarang?"

**AI should:**
1. Read `.meta/PROGRESS-TRACKER.md`
2. Find "Current Task" section
3. Identify next story number
4. Report back with: Story number, title, and link to file

**Response template:**
```
Current status: [X]% complete
Next task: STORY-[NUMBER] - [Title]
File: stories/phase-XX-name/STORY-[NUMBER]-description.md

Siap untuk start? Saya akan baca story file dan guide implementasinya.
```

---

### Task 2: "Lanjutkan development"

**AI should:**
1. Read PROGRESS-TRACKER.md untuk context
2. Identify last completed task
3. Verify completion (check if files exist)
4. Move to next task
5. Read next story file
6. Start implementation

**Response template:**
```
Progress check:
✅ Last completed: STORY-[X]
📋 Files verified: [list key files]
⏳ Next: STORY-[Y] - [Title]

Reading story file...
[Then provide implementation steps]
```

---

### Task 3: "Implement STORY-XXX"

**AI should:**
1. Read story file completely
2. List acceptance criteria
3. Explain what will be built
4. Ask for confirmation to proceed
5. Implement step-by-step
6. Run verifications
7. Update PROGRESS-TRACKER.md

**Response template:**
```
Story: STORY-[X] - [Title]

Goal: [Brief goal]

Acceptance Criteria:
- [Criteria 1]
- [Criteria 2]
...

I will implement this in [N] steps:
1. [Step 1]
2. [Step 2]
...

Ready to proceed? (yes/no)
```

---

### Task 4: "Cek status project"

**AI should:**
1. Read PROGRESS-TRACKER.md
2. Calculate completion percentage
3. List completed stories
4. Identify current task
5. Report any blockers

**Response template:**
```
📊 Project Status: Ekosistem Sekolah

Overall Progress: [X]%
━━━━━━━━━━━━━━━━━━━━

Phase 0 (Foundation):
✅ Completed: [X]/11 stories
🏗️ In Progress: STORY-[Y]
⏳ Remaining: [Z] stories

Phase 1 (Identity Provider):
⏳ Not started (waiting for Phase 0)

Next Milestone:
🎯 Complete Phase 0 ([X] stories remaining)

Estimated time: [Y] days

Blockers: [None / List if any]
```

---

## 🔍 File Reading Priority

### Priority 1: MUST READ (Always)
```
.meta/PROGRESS-TRACKER.md
```
**Why**: Tells you exactly where we are and what's next

### Priority 2: Context (When starting new)
```
README.md
ROADMAP.md (if need understanding)
phases/phase-XX-name/README.md (for phase overview)
```

### Priority 3: Implementation (When working)
```
stories/phase-XX-name/STORY-[NUMBER]-description.md
phases/phase-XX-name/IMPLEMENTATION.md (if need detail)
```

### Priority 4: Reference (When needed)
```
docs/diagrams/ (architecture understanding)
docs/architecture/ (design decisions)
```

---

## 💡 AI Smart Behaviors

### ✅ DO This

1. **Always read PROGRESS-TRACKER.md first**
   - It's the source of truth for current status

2. **Confirm before implementing**
   - Show what you'll do
   - Ask for confirmation
   - Then execute

3. **Update progress after completing**
   - Update PROGRESS-TRACKER.md
   - Mark story as complete
   - Add any notes

4. **Follow story guide exactly**
   - Don't skip steps
   - Run all verifications
   - Check acceptance criteria

5. **Report issues immediately**
   - If blocked, say so
   - Explain the blocker
   - Suggest solutions

### ❌ DON'T Do This

1. **Don't assume previous context**
   - Always read current status
   - Don't rely on memory

2. **Don't skip reading story files**
   - Each story has specific requirements
   - Common errors are documented

3. **Don't implement without understanding**
   - Read first
   - Understand requirements
   - Then implement

4. **Don't forget to update tracker**
   - Progress tracker must be current
   - Update after each story

5. **Don't work on wrong story**
   - Check dependencies
   - Follow sequence

---

## 🎓 Understanding the Project

### High-Level Concept

**What**: School management SaaS platform  
**Architecture**: Federated Identity (1 IdP + 16 Service Providers)  
**Tech Stack**: Next.js, Turborepo, PNPM, Supabase, TypeScript  

### Development Approach

**Phases**: 16 phases total, 54 weeks  
**Stories**: Each phase has multiple stories (tasks)  
**Current**: Phase 0 & 1 documented (21 stories)  

### Implementation Status

**Documentation**: 13% (2/16 phases done)  
**Implementation**: Check PROGRESS-TRACKER.md  

---

## 🔗 Quick Links

### For AI to Check Status
```
.meta/PROGRESS-TRACKER.md          ← Current status
```

### For AI to Understand Project
```
README.md                          ← Overview
ROADMAP.md                         ← All phases
```

### For AI to Implement
```
stories/phase-XX-name/STORY-XXX... ← Story details
phases/phase-XX-name/IMPLEMENTATION.md ← Phase guide
```

---

## 📋 AI Workflow Template

### Standard Workflow for Any Task

```
1. CHECK STATUS
   Read: .meta/PROGRESS-TRACKER.md
   Output: Current progress, next task

2. READ REQUIREMENTS
   Read: stories/phase-XX/STORY-[NUMBER].md
   Output: Understanding of what to build

3. CONFIRM
   Show: What will be done
   Ask: Proceed? (yes/no)

4. IMPLEMENT
   Follow: Story step-by-step
   Create: Required files
   Run: Commands

5. VERIFY
   Check: Acceptance criteria
   Run: Verification commands
   Test: Manually if needed

6. UPDATE
   Update: PROGRESS-TRACKER.md
   Mark: Story complete
   Note: Any issues

7. REPORT
   Summary: What was done
   Status: Complete/Partial/Blocked
   Next: What's next
```

---

## 🚨 Error Handling

### If AI is Confused

**AI should:**
1. Read PROGRESS-TRACKER.md again
2. Identify what's unclear
3. Ask specific questions:
   - "What story should I work on?"
   - "Where is file X located?"
   - "What's the prerequisite for this?"

### If Story is Blocked

**AI should:**
1. Report the blocker clearly
2. Check story's "Common Errors" section
3. Suggest solutions
4. Mark in PROGRESS-TRACKER.md as blocked
5. Ask what to do next

### If Implementation Fails

**AI should:**
1. Read "Common Errors" in story file
2. Check if prerequisites met
3. Try to fix
4. If can't fix, report issue
5. Don't proceed to next story

---

## 📊 Progress Update Format

After completing a story, AI should update PROGRESS-TRACKER.md like this:

```markdown
| 001 | Initialize Monorepo | ✅ DONE | 2024-XX-XX | 2024-XX-XX | Completed successfully |
```

Status options:
- ⏳ **TODO** - Not started
- 🏗️ **IN PROGRESS** - Currently working
- ✅ **DONE** - Completed and verified
- ⚠️ **BLOCKED** - Blocked by something
- ❌ **FAILED** - Failed, needs rework

---

## 💬 Example AI Conversations

### Example 1: First Time
```
User: "Help me with Ekosistem Sekolah project"

AI Response:
"I'll help you! Let me check the project status first.

Reading: .meta/PROGRESS-TRACKER.md...

Current Status:
- Overall Progress: 0%
- Current Phase: Phase 0 (Foundation)
- Next Task: STORY-001 - Initialize Monorepo

The project is at the beginning. Should I:
1. Give you an overview of the project?
2. Start implementing STORY-001?
3. Explain the development plan?

What would you like to do?"
```

---

### Example 2: Continue Work
```
User: "Lanjutkan development"

AI Response:
"Checking current progress...

From PROGRESS-TRACKER.md:
✅ Completed: STORY-001, STORY-002 (2/11)
🏗️ Next: STORY-003 - Setup ESLint & Prettier

Would you like me to:
1. Verify STORY-001 & 002 are correctly done
2. Start STORY-003 implementation
3. Show what STORY-003 requires

Which one?"
```

---

### Example 3: Status Check
```
User: "Sampai mana progress nya?"

AI Response:
"Reading progress tracker...

📊 Project Status:

Phase 0 (Foundation):
██████░░░░░░░░░░░░░░ 27% (3/11 stories)
✅ STORY-001: Initialize Monorepo
✅ STORY-002: Setup TypeScript  
✅ STORY-003: Setup ESLint & Prettier
⏳ STORY-004: Setup Git Hooks (NEXT)

Phase 1: Not started (waiting for Phase 0)

Overall: ██░░░░░░░░░░░░░░░░░░ 14% (3/21 stories)

Next task: STORY-004 - Setup Git Hooks
Estimated time to Phase 0 complete: 8 more stories

Ready to continue with STORY-004?"
```

---

## 🎯 Success Indicators

AI is doing well if:
- ✅ Always reads PROGRESS-TRACKER.md first
- ✅ Follows story guides step-by-step
- ✅ Updates progress after each story
- ✅ Reports clear status
- ✅ Asks for clarification when needed
- ✅ Verifies work before marking complete

---

## 📞 When AI Needs Help

If AI encounters any of these, ask user:

1. **Ambiguous requirements** - "Story file unclear about X, can you clarify?"
2. **Missing files** - "Expected file X not found, should I create it?"
3. **External dependencies** - "Need API key for X, where do I get it?"
4. **Design decisions** - "Multiple approaches possible, which one to use?"
5. **Blocking errors** - "Hit error X, tried solution Y, still blocked. Help?"

---

**Guide Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Project documentation  
**For**: AI Assistants helping with development
