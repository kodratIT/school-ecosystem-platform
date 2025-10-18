# 🤖 AI Quick Start - Copy & Paste Prompts

**Purpose**: Copy-paste prompts untuk AI assistant  
**Usage**: Copy salah satu prompt di bawah sesuai kebutuhan

---

## ⚡ PROMPT 1: Cek Status Project (Paling Sering Dipakai)

```
Saya mengerjakan project "Ekosistem Sekolah" - SaaS platform untuk school management.

Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

TASK: Cek status project saat ini

Tolong:
1. Baca file: .meta/PROGRESS-TRACKER.md
2. Report:
   - Overall progress (%)
   - Last completed story
   - Current/next task
   - Any blockers
3. Suggest apa yang harus dikerjakan next

Mulai dengan baca PROGRESS-TRACKER.md
```

---

## 🚀 PROMPT 2: Mulai Development Baru

```
PROJECT: Ekosistem Sekolah SaaS
Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

CONTEXT:
- Tech: Next.js 14, Turborepo, PNPM, Supabase, TypeScript
- Structure: Federated Identity (1 IdP + 16 SPs)
- Documentation: Phase 0 & 1 complete (21 stories)

TASK: Start implementation dari awal

Steps:
1. Read: .meta/PROGRESS-TRACKER.md (cek progress)
2. Read: README.md (understand project)
3. Identify: Next story to work on (should be STORY-001)
4. Read: Story file
5. Guide me: Step-by-step implementation

Let's begin!
```

---

## 🔄 PROMPT 3: Lanjutkan Development yang Ada

```
PROJECT: Ekosistem Sekolah
Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

CONTEXT:
Saya sudah mulai development tapi lupa sampai mana.

TASK:
1. Baca: .meta/PROGRESS-TRACKER.md
2. Identify: Last completed story
3. Verify: Apakah benar sudah complete (check files)
4. Tell me: What's next to do
5. Start: Next story implementation

Tolong mulai dengan cek progress tracker.
```

---

## 📝 PROMPT 4: Implement Story Spesifik

```
PROJECT: Ekosistem Sekolah
Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

TASK: Implement STORY-[NUMBER]

Steps:
1. Read: .meta/PROGRESS-TRACKER.md (verify prerequisites)
2. Read: stories/phase-XX-name/STORY-[NUMBER]-description.md
3. Summarize: What this story will build
4. Confirm: Should we proceed?
5. Implement: Step by step
6. Verify: All acceptance criteria met
7. Update: Progress tracker

Tolong mulai dengan baca story file.
```

*(Replace [NUMBER] dan phase-XX-name dengan yang sesuai)*

---

## 🐛 PROMPT 5: Debug/Fix Error

```
PROJECT: Ekosistem Sekolah
Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

PROBLEM: [Describe error/issue]

CONTEXT:
- Working on: STORY-[NUMBER]
- Error message: [paste error]
- What I tried: [what you tried]

FILES TO CHECK:
1. Story file: stories/phase-XX-name/STORY-[NUMBER]-*.md
2. Section: "Common Errors" in story
3. Phase guide: phases/phase-XX-name/IMPLEMENTATION.md

TASK:
1. Read "Common Errors" section
2. Identify the issue
3. Provide solution
4. Help me fix it step-by-step

Tolong bantu debug issue ini.
```

---

## 📊 PROMPT 6: Update Progress After Completion

```
PROJECT: Ekosistem Sekolah
Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

COMPLETED: STORY-[NUMBER] - [Title]

STATUS: ✅ DONE

WHAT WAS DONE:
- [List what you did]
- [Files created]
- [Commands run]

VERIFICATION PASSED:
- [x] All acceptance criteria met
- [x] Commands run successfully
- [x] No errors

TASK:
Update file .meta/PROGRESS-TRACKER.md:
- Mark STORY-[NUMBER] as ✅ DONE
- Add completion date
- Add any notes

Then tell me what's next.
```

---

## 🎯 PROMPT 7: Plan Next Sprint

```
PROJECT: Ekosistem Sekolah
Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

TASK: Plan what to work on this week

Steps:
1. Read: .meta/PROGRESS-TRACKER.md
2. Analyze: Current progress
3. Identify: Stories that can be done this week
4. Estimate: Time for each story
5. Suggest: Priority order
6. Create: Weekly plan

Provide:
- List of stories to complete this week
- Priority order
- Estimated hours per story
- Dependencies to watch

Mulai dengan analisa progress tracker.
```

---

## 📚 PROMPT 8: Understand Project Architecture

```
PROJECT: Ekosistem Sekolah
Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

TASK: Explain project architecture to me

Read:
1. README.md (overview)
2. ROADMAP.md (16 phases)
3. docs/diagrams/README.md (architecture)

Explain:
1. What is this project about?
2. What's the architecture pattern? (Federated Identity)
3. How many applications? (1 IdP + 16 SPs)
4. What's the tech stack?
5. What's the development approach?

Make it easy to understand with diagrams/examples.
```

---

## 🔍 PROMPT 9: Review Code Quality

```
PROJECT: Ekosistem Sekolah
Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

TASK: Review completed work

Check:
1. .meta/PROGRESS-TRACKER.md (what's completed)
2. Files created in completed stories
3. Code quality:
   - TypeScript types correct?
   - Following conventions?
   - Proper error handling?
   - Tests included?

Provide:
- Quality assessment
- Issues found
- Suggestions for improvement
- What should be refactored

Start review.
```

---

## 📋 PROMPT 10: Generate Report

```
PROJECT: Ekosistem Sekolah
Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

TASK: Generate progress report

Read: .meta/PROGRESS-TRACKER.md

Generate report:
1. Executive Summary
   - Overall progress %
   - Phases completed
   - Stories completed
2. This Week
   - What was completed
   - Time spent
   - Issues encountered
3. Next Week
   - What's planned
   - Estimated completion
   - Potential blockers
4. Timeline
   - On track? (yes/no)
   - Estimated completion date
   - Risk assessment

Format: Professional markdown report.
```

---

## 🎓 PROMPT 11: Onboard New Developer

```
PROJECT: Ekosistem Sekolah
Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

SCENARIO: New developer joining the project

TASK: Prepare onboarding guide

Include:
1. Project overview (from README.md)
2. Current progress (from PROGRESS-TRACKER.md)
3. Tech stack & setup
4. How to start contributing
5. Where to find documentation
6. Who to ask for help
7. First task recommendation

Create: Complete onboarding document for new team member.
```

---

## 🚨 PROMPT 12: Emergency - Project Stuck

```
PROJECT: Ekosistem Sekolah
Location: /Users/kodrat/Public/Source Code/ekosistem-sekolah

SITUATION: Project is stuck, need help

CONTEXT:
- Stuck on: [describe what you're stuck on]
- Last completed: [last story number]
- Error/blocker: [describe issue]
- What tried: [what you've tried]

TASK: Analyze and unblock

Steps:
1. Read current status
2. Understand the blocker
3. Check if it's a known issue
4. Provide multiple solutions
5. Recommend best approach
6. Help implement the fix

URGENT - please help debug this ASAP!
```

---

## 💡 Tips for Using These Prompts

### 1. Personalize the Prompt
- Replace `[NUMBER]` with actual story number
- Replace `[describe...]` with your specific situation
- Add more context if needed

### 2. Give AI Time to Read
- AI needs to read files first
- Don't rush the response
- Let AI ask questions if unclear

### 3. Verify AI Understanding
- Check if AI read the right files
- Confirm AI understands the task
- Ask AI to summarize before implementing

### 4. Update Progress
- Always update PROGRESS-TRACKER.md
- Keep status current
- Document learnings

---

## 📂 Essential Files Reference

```
MUST READ FIRST:
.meta/PROGRESS-TRACKER.md      ← Current status

PROJECT OVERVIEW:
README.md                      ← What is this project
ROADMAP.md                     ← 16 phases plan

IMPLEMENTATION:
stories/phase-XX/STORY-*.md    ← Task details
phases/phase-XX/IMPLEMENTATION.md ← Phase guide

AI GUIDES:
.meta/AI-PROMPT-TEMPLATE.md    ← More prompt templates
.meta/AI-CONTEXT.md            ← AI context guide
AI-QUICK-START.md              ← This file
```

---

## 🎯 Most Common Use Cases

### Use Case 1: "Saya baru mulai project"
→ Use **PROMPT 2**: Mulai Development Baru

### Use Case 2: "Saya lupa progress nya"
→ Use **PROMPT 1**: Cek Status Project

### Use Case 3: "Lanjutin yang kemarin"
→ Use **PROMPT 3**: Lanjutkan Development

### Use Case 4: "Error, tolong fix"
→ Use **PROMPT 5**: Debug/Fix Error

### Use Case 5: "Udah selesai 1 story"
→ Use **PROMPT 6**: Update Progress

---

## ⚡ One-Liner Prompts

For quick tasks:

```
Check status:
"Baca .meta/PROGRESS-TRACKER.md dan report current status"

Next task:
"Baca PROGRESS-TRACKER.md, apa next story yang harus dikerjakan?"

Continue:
"Lanjutkan development project Ekosistem Sekolah dari terakhir kali"

Update progress:
"Update PROGRESS-TRACKER.md, mark STORY-[X] as done"

Verify:
"Verify STORY-[X] completed correctly according to acceptance criteria"
```

---

## 📊 Success Indicators

AI is working correctly if:
- ✅ Always reads PROGRESS-TRACKER.md first
- ✅ Reports current status clearly
- ✅ Follows story guides step-by-step
- ✅ Updates progress after completion
- ✅ Asks for clarification when needed

---

## 🔗 Quick Links

### Files AI Should Know
- `.meta/PROGRESS-TRACKER.md` - Current status
- `README.md` - Project overview
- `stories/phase-XX-name/STORY-*.md` - Task details

### More Resources
- [AI Prompt Template](./.meta/AI-PROMPT-TEMPLATE.md) - More detailed templates
- [AI Context Guide](./.meta/AI-CONTEXT.md) - Complete AI guide
- [Documentation Index](./.meta/DOCUMENTATION-INDEX.md) - All docs

---

**Quick Start Version**: 1.0  
**Last Updated**: 2024  
**Usage**: Copy any prompt above and paste to your AI assistant  
**Tip**: Add specific details for better results 🎯
