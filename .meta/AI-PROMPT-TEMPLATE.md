# 🤖 AI Prompt Template - Ekosistem Sekolah

**Purpose**: Template prompt untuk AI agar bisa memahami project context dan melanjutkan development  
**Version**: 1.0  
**Last Updated**: 2024

---

## 📋 Quick AI Context Prompt

Copy-paste prompt ini ke AI untuk context lengkap:

```
Saya sedang mengerjakan project Ekosistem Sekolah - sebuah SaaS platform untuk school management dengan 16 aplikasi terintegrasi.

CONTEXT PROJECT:
- Tech Stack: Next.js 14, Turborepo, PNPM, Supabase, TypeScript
- Architecture: Federated Identity (1 IdP + 16 Service Providers)
- Total: 16 phases, 54 minggu development
- Documentation: Phase 0 & 1 complete (21 stories)

STRUKTUR PROJECT:
- README.md: Project overview
- ROADMAP.md: 16 phases development plan
- phases/: Phase documentation (nested per phase)
- stories/: Development stories (grouped by phase)
- docs/: Architecture diagrams & guides

CURRENT STATUS:
Cek file: .meta/PROGRESS-TRACKER.md

Tolong:
1. Baca PROGRESS-TRACKER.md untuk tau progress saat ini
2. [Sebutkan task spesifik yang kamu mau AI kerjakan]
```

---

## 🎯 Scenario-Based Prompts

### Scenario 1: Mulai Development Baru

```
PROJECT: Ekosistem Sekolah SaaS

CURRENT STATUS:
- Progress: [lihat .meta/PROGRESS-TRACKER.md]
- Next Task: [dari PROGRESS-TRACKER.md]

TASK: Mulai implementasi STORY-XXX

STEPS:
1. Baca file: stories/phase-XX-name/STORY-XXX-description.md
2. Follow step-by-step guide di story tersebut
3. Implement sesuai acceptance criteria
4. Update PROGRESS-TRACKER.md setelah selesai

Tolong mulai dengan membaca story file dan implementasi task pertama.
```

---

### Scenario 2: Melanjutkan Development yang Sudah Ada

```
PROJECT: Ekosistem Sekolah SaaS

CONTEXT:
1. Baca struktur project di: README.md
2. Cek progress saat ini di: .meta/PROGRESS-TRACKER.md
3. Review last completed story

QUESTION:
Apa yang terakhir dikerjakan dan apa next step nya?

Tolong:
1. Analyze progress tracker
2. Identify last completed task
3. Suggest next task to work on
4. Provide implementation steps
```

---

### Scenario 3: Check Project Status

```
PROJECT: Ekosistem Sekolah SaaS

TASK: Analyze current project status

ANALYZE:
1. File: .meta/PROGRESS-TRACKER.md
2. Completed stories
3. Current phase progress
4. Next milestone

OUTPUT:
- Summary of what's done
- What's currently in progress
- What's next to do
- Estimated completion time
```

---

### Scenario 4: Implement Specific Story

```
PROJECT: Ekosistem Sekolah SaaS

TASK: Implement STORY-[NUMBER]

CONTEXT:
1. Project root: /Users/kodrat/Public/Source Code/ekosistem-sekolah
2. Story file: stories/phase-XX-name/STORY-[NUMBER]-description.md
3. Current progress: [check PROGRESS-TRACKER.md]

REQUIREMENTS:
1. Read story file completely
2. Follow acceptance criteria
3. Implement step by step
4. Run verification commands
5. Update progress tracker

Tolong baca story file dan mulai implementasi.
```

---

### Scenario 5: Debug/Fix Issues

```
PROJECT: Ekosistem Sekolah SaaS

CONTEXT:
Working on: STORY-[NUMBER]
Issue: [describe issue]

FILES TO CHECK:
1. Story guide: stories/phase-XX-name/STORY-[NUMBER]-description.md
2. Common errors section in story
3. Phase implementation guide: phases/phase-XX-name/IMPLEMENTATION.md

TASK:
1. Read "Common Errors" section
2. Identify the issue
3. Provide solution
4. Verify fix works
```

---

### Scenario 6: Review & Update Documentation

```
PROJECT: Ekosistem Sekolah SaaS

TASK: Update project documentation after completing story

FILES TO UPDATE:
1. .meta/PROGRESS-TRACKER.md - Update story status
2. phases/phase-XX-name/README.md - Update if needed
3. Add any lessons learned

COMPLETED:
- Story: STORY-[NUMBER]
- Status: [completed/blocked/issues]
- Notes: [any notes]

Tolong update PROGRESS-TRACKER.md dengan status terbaru.
```

---

## 📖 AI Reading Order

Untuk AI memahami project dengan baik, baca files ini dalam urutan:

### Level 1: High-Level Overview (Wajib)
```
1. README.md (5 min read)
   - Project overview
   - Tech stack
   - Quick start

2. .meta/PROGRESS-TRACKER.md (2 min read)
   - Current status
   - Next task
   - Progress percentage

3. ROADMAP.md (10 min read)
   - 16 phases overview
   - Architecture
   - Timeline
```

### Level 2: Current Phase Context (When Starting)
```
4. phases/phase-XX-name/README.md (3 min read)
   - Phase overview
   - Deliverables
   - Stories list

5. phases/phase-XX-name/IMPLEMENTATION.md (15 min read)
   - Detailed implementation guide
   - Code examples
   - Testing procedures
```

### Level 3: Story Details (When Implementing)
```
6. stories/phase-XX-name/STORY-XXX-description.md (10 min read)
   - Story details
   - Acceptance criteria
   - Step-by-step tasks
   - Common errors
```

### Level 4: Architecture (When Needed)
```
7. docs/diagrams/README.md
   - UML diagrams
   - Architecture overview

8. phases/transitions/phase-XX-to-YY.md
   - Transition guides between phases
```

---

## 🔍 AI Analysis Prompts

### Analyze Project Structure
```
TASK: Analyze project structure

Analyze:
1. Folder structure at root
2. phases/ organization
3. stories/ organization
4. File naming conventions

Provide:
- Structure overview
- File count by type
- Organization quality assessment
```

---

### Analyze Progress
```
TASK: Analyze implementation progress

Read: .meta/PROGRESS-TRACKER.md

Provide:
- Overall progress percentage
- Completed vs remaining stories
- Current phase status
- Estimated completion time
- Blockers if any
```

---

### Analyze Next Steps
```
TASK: What should I work on next?

Context:
1. Read PROGRESS-TRACKER.md
2. Find last completed story
3. Check dependencies

Provide:
- Next story to implement
- Why this story is next
- Prerequisites check
- Estimated time to complete
```

---

## 🛠️ AI Implementation Workflow

### Step-by-Step Workflow Prompt

```
PROJECT: Ekosistem Sekolah SaaS

WORKFLOW: Implement next story

STEPS:

1. CHECK CURRENT STATUS
   - Read: .meta/PROGRESS-TRACKER.md
   - Identify: Next story to work on
   
2. PREPARE
   - Read: Story file completely
   - Understand: Acceptance criteria
   - Check: Prerequisites completed
   
3. IMPLEMENT
   - Follow: Step-by-step in story
   - Create: Required files
   - Write: Code with examples
   
4. VERIFY
   - Run: All verification commands
   - Check: Acceptance criteria met
   - Test: Manually if needed
   
5. UPDATE
   - Update: PROGRESS-TRACKER.md
   - Mark: Story as complete
   - Note: Any issues or learnings

Execute this workflow step by step. Start with step 1.
```

---

## 📊 AI Progress Update Template

After completing a story, use this template:

```
STORY COMPLETED: STORY-[NUMBER]

STATUS: ✅ DONE / ⚠️ PARTIAL / ❌ BLOCKED

WHAT WAS DONE:
- [List main accomplishments]
- [Files created/modified]
- [Commands run]

VERIFICATION:
- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] No errors or warnings
- [ ] Documentation updated

ISSUES ENCOUNTERED:
- [List any issues and how resolved]

LESSONS LEARNED:
- [Any insights or tips]

NEXT STORY:
- STORY-[NEXT-NUMBER]: [description]

TIME SPENT:
- [Estimated time]

UPDATE PROGRESS-TRACKER:
Please update .meta/PROGRESS-TRACKER.md with this information.
```

---

## 🎯 AI Task Templates

### Task 1: Read and Summarize Story

```
Read file: stories/phase-XX-name/STORY-[NUMBER]-description.md

Provide summary:
1. Story title and goal
2. Main deliverables (3-5 bullet points)
3. Acceptance criteria (key points)
4. Dependencies or prerequisites
5. Estimated complexity (low/medium/high)
6. Ready to start? (yes/no with reason)
```

---

### Task 2: Implement Story Step-by-Step

```
Implement: stories/phase-XX-name/STORY-[NUMBER]-description.md

Process:
1. Read entire story first
2. For each task in story:
   a. Explain what we're doing
   b. Show the code/command
   c. Explain why
   d. Run verification
3. After all tasks:
   - Run final verification
   - Update progress tracker

Start with task 1.
```

---

### Task 3: Verify Implementation

```
Verify: STORY-[NUMBER] implementation

Checklist:
1. All files created as required
2. All commands in story executed successfully
3. All acceptance criteria met
4. No TypeScript errors
5. No lint warnings
6. Tests passing (if applicable)

Run verification and report status.
```

---

## 📝 Example: Complete AI Session

### Example 1: Starting Fresh

```
Hi! Saya mau mulai implement project Ekosistem Sekolah.

PROJECT CONTEXT:
- Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah
- Type: SaaS platform dengan 16 aplikasi
- Tech: Next.js, Turborepo, PNPM, Supabase
- Documentation: Phase 0 & 1 complete

CURRENT STATUS:
Tolong baca file: .meta/PROGRESS-TRACKER.md

THEN:
1. Tell me current progress
2. What's the next story to implement?
3. Provide step-by-step guide to start

Let's begin!
```

**Expected AI Response:**
- Read PROGRESS-TRACKER.md
- Report current status (0%)
- Identify STORY-001 as next
- Provide implementation steps

---

### Example 2: Continue Development

```
PROJECT: Ekosistem Sekolah
Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

CONTEXT:
Saya sudah selesai STORY-001 dan STORY-002.

TASK:
1. Verify STORY-001 & STORY-002 completed correctly
2. Update PROGRESS-TRACKER.md
3. Start STORY-003

Tolong:
1. Check apakah ada files yang diharapkan dari STORY-001 & 002
2. Update progress tracker
3. Read STORY-003 dan mulai implementasi
```

---

### Example 3: Troubleshooting

```
PROJECT: Ekosistem Sekolah

ISSUE: Error saat run `pnpm install`
Working on: STORY-001

ERROR MESSAGE:
[paste error message]

CONTEXT:
Story file: stories/phase-00-foundation/STORY-001-initialize-monorepo.md

Tolong:
1. Read "Common Errors" section in story
2. Identify the issue
3. Provide solution
4. Help me fix it
```

---

## 💡 Best Practices for AI Prompts

### DO ✅
- Always mention project name: "Ekosistem Sekolah"
- Reference PROGRESS-TRACKER.md for current status
- Specify exact file paths
- Ask AI to read relevant docs first
- Break complex tasks into steps
- Update progress tracker after completion

### DON'T ❌
- Don't assume AI knows previous context (always provide)
- Don't skip reading story files
- Don't forget to update progress tracker
- Don't implement without understanding requirements
- Don't skip verification steps

---

## 🔗 Quick Reference

### Essential Files
```
.meta/PROGRESS-TRACKER.md          ← Current status
README.md                          ← Project overview
ROADMAP.md                         ← All phases plan
phases/phase-XX-name/README.md     ← Phase overview
stories/phase-XX-name/STORY-XXX... ← Story details
```

### Common Commands
```bash
# Check current directory
pwd

# List project structure
ls -la

# Check package.json exists
ls package.json

# Check story file
cat stories/phase-XX-name/STORY-XXX-*.md
```

---

## 📞 Questions to Ask AI

### Understanding Project
```
1. What is the current status of the project?
2. What has been completed so far?
3. What's the next task to work on?
4. What are the dependencies for the next task?
5. How long will it take to complete current phase?
```

### During Implementation
```
1. What does this error mean?
2. Is this implementation correct according to the story?
3. Have I met all acceptance criteria?
4. What's the next step after this?
5. Should I update any documentation?
```

### After Completion
```
1. Did I complete all requirements?
2. Should I run any verification?
3. What needs to be updated in progress tracker?
4. What's the next story?
5. Any cleanup needed?
```

---

**Template Version**: 1.0  
**Last Updated**: 2024  
**Usage**: Copy relevant sections and customize for your needs
