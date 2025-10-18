# Stories - Development Tasks

Welcome to the **Stories** folder! This contains all development tasks (user stories) for the Ekosistem Sekolah project, organized by phase.

---

## 📂 Folder Structure

```
stories/
├── README.md (this file)
├── phase-00-foundation/
│   ├── README.md
│   └── STORY-001 to STORY-011 (11 stories)
├── phase-01-identity-provider/
│   ├── README.md
│   └── STORY-012 to STORY-021 (10 stories)
└── _templates/
    └── STORY-TEMPLATE.md (for creating new stories)
```

---

## 📖 What is a Story?

A **story** is a detailed development task that describes:
- **What** needs to be built
- **Why** it's needed
- **How** to implement it (step-by-step)
- **How** to verify it's done correctly

Each story includes:
- Description & Goals
- Acceptance Criteria
- Step-by-step Tasks with code examples
- Testing Instructions
- Common Errors & Solutions
- Definition of Done

---

## 📂 Story Naming Convention

```
STORY-{NNN}-{short-description}.md
```

**Examples:**
- `STORY-001-initialize-monorepo.md`
- `STORY-012-setup-supabase.md`
- `STORY-021-implement-sso.md`

---

## 📋 Stories by Phase

### Phase 0: Foundation & Setup

**Folder**: [phase-00-foundation/](./phase-00-foundation/)  
**Stories**: 11 total  
**Status**: All documented ✅

| ID Range | Description | Count |
|----------|-------------|-------|
| 001-005 | Setup & Configuration (Week 1) | 5 stories |
| 006-009 | Shared Packages (Week 2) | 4 stories |
| 010-011 | Development Environment | 2 stories |

**Quick Links:**
- 📖 [Phase 0 Stories Index](./phase-00-foundation/README.md)
- 📝 [Phase 0 Implementation](../phases/phase-00-foundation/IMPLEMENTATION.md)
- ▶️ [Start: STORY-001](./phase-00-foundation/STORY-001-initialize-monorepo.md)

---

### Phase 1: Identity Provider

**Folder**: [phase-01-identity-provider/](./phase-01-identity-provider/)  
**Stories**: 10 total  
**Status**: All documented ✅

| ID Range | Description | Count |
|----------|-------------|-------|
| 012-015 | Database & Auth Foundation (Week 3) | 4 stories |
| 016-018 | RBAC & Application (Week 4) | 3 stories |
| 019-021 | JWT & SSO (Week 5) | 3 stories |

**Quick Links:**
- 📖 [Phase 1 Stories Index](./phase-01-identity-provider/README.md)
- 📝 [Phase 1 Implementation](../phases/phase-01-identity-provider/IMPLEMENTATION.md)
- 🔄 [Transition from Phase 0](../phases/transitions/phase-00-to-01.md)
- ▶️ [Start: STORY-012](./phase-01-identity-provider/STORY-012-setup-supabase.md)

---

### Phase 2: Service Provider Foundation

**Folder**: [phase-02-service-provider-foundation/](./phase-02-service-provider-foundation/)  
**Stories**: 9 total  
**Status**: All documented ✅

| ID Range | Description | Count |
|----------|-------------|-------|
| 022-025 | Core Packages (Week 1) | 4 stories |
| 026-028 | Template & Layouts (Week 2) | 3 stories |
| 029-030 | Demo & Documentation | 2 stories |

**Key Stories:**
- **STORY-022**: Database Package Template (detailed 700+ lines)
- **STORY-023**: Auth Client Package  
- **STORY-024**: Middleware Package (auth, RBAC, tenant)
- **STORY-025**: API Client Package
- **STORY-026**: Service Provider App Template
- **STORY-027**: SSO Flow Implementation
- **STORY-028**: Shared Layouts Package
- **STORY-029**: Test Demo Service Provider
- **STORY-030**: Documentation & Guidelines

**Quick Links:**
- 📖 [Phase 2 Stories Index](./phase-02-service-provider-foundation/README.md)
- 📝 [Phase 2 Implementation](../phases/phase-02-service-provider-foundation/IMPLEMENTATION.md)
- 🔄 [Transition from Phase 1](../phases/transitions/phase-01-to-02.md)
- ▶️ [Start: STORY-022](./phase-02-service-provider-foundation/STORY-022-create-database-package-template.md)

---

## 📊 Overall Progress

```
Total Stories: 30
Phase 0: 11/11 (100%) ✅
Phase 1: 10/10 (100%) ✅
Phase 2: 9/9 (100%) ✅
Documentation Quality: Comprehensive (400-800+ lines per detailed story)
Total Documentation: ~15,000+ lines
```

---

## 🚀 How to Use Stories

### For Developers

#### 1. **Pick a Story**

```bash
# Check available stories
ls stories/

# Open a story
open stories/STORY-001-initialize-monorepo.md
# or
code stories/STORY-001-initialize-monorepo.md
```

#### 2. **Update Story Status**

Update the status in this README:
- Change 📋 TODO to 🏗️ IN PROGRESS
- Add your name to Owner column

#### 3. **Follow the Story**

- Read the entire story first
- Understand acceptance criteria
- Follow tasks step-by-step
- Run verification commands
- Check off completed tasks

#### 4. **Test Your Work**

- Follow testing instructions in the story
- Verify acceptance criteria are met
- Run automated checks

#### 5. **Mark as Complete**

- Update status to ✅ DONE
- Commit your changes
- Move to next story

---

### For Managers/Tech Leads

#### **Track Progress**

```bash
# Count stories by status
grep -r "📋 TODO" stories/ | wc -l        # Not started
grep -r "🏗️ IN PROGRESS" stories/ | wc -l # In progress
grep -r "✅ DONE" stories/ | wc -l        # Completed
```

#### **Assign Stories**

1. Check developer availability
2. Match skill level to story complexity
3. Update Owner column in README
4. Notify developer

#### **Review Completed Stories**

- Verify all acceptance criteria met
- Check Definition of Done
- Review code changes
- Approve and merge

---

## 📊 Story Point Estimation

| Points | Complexity | Time Estimate |
|--------|------------|---------------|
| 1 | Trivial | < 2 hours |
| 2 | Simple | 2-4 hours |
| 3 | Medium | 4-8 hours |
| 5 | Complex | 1-2 days |
| 8 | Very Complex | 2-3 days |
| 13 | Epic | 3-5 days |

---

## 🎨 Story Template

When creating new stories, use this template:

```markdown
# STORY-{ID}: {Title}

**Epic**: {Phase/Feature}
**Sprint**: {Week X}
**Story Points**: {1-13}
**Priority**: {P0-P3}
**Status**: 📋 TODO

---

## 📖 Description

As a **{role}**, I want to **{action}** so that **{benefit}**.

---

## 🎯 Goals

- Goal 1
- Goal 2

---

## ✅ Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

---

## 📋 Tasks

### Task 1: {Task Name}

Steps and code examples...

---

## 🧪 Testing Instructions

How to verify the story is complete...

---

## 📸 Expected Results

What the output should look like...

---

## ❌ Common Errors & Solutions

Known issues and how to fix them...

---

## 🔗 Dependencies

- **Depends on**: STORY-XXX
- **Blocks**: STORY-YYY

---

## 📚 Resources

- Links to documentation
- Reference materials

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Changes committed

---

**Created**: {Date}
**Last Updated**: {Date}
**Story Owner**: {Name}
```

---

## 🔄 Story Workflow

```
1. TODO (📋)
   ↓
2. Developer picks story
   ↓
3. IN PROGRESS (🏗️)
   ↓
4. Developer implements
   ↓
5. Developer tests
   ↓
6. Developer commits
   ↓
7. Code review
   ↓
8. DONE (✅)
```

---

## 📝 Commit Message Format

When committing changes from a story:

```bash
git commit -m "feat: implement STORY-001 - initialize monorepo

- Setup Turborepo with PNPM
- Configure workspace
- Add base scripts

Closes #STORY-001"
```

**Commit prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

---

## 🐛 Reporting Issues

If you encounter issues not covered in the story:

1. **Document the error:**
   ```bash
   # Copy error message
   # Include steps to reproduce
   # Note your environment (OS, Node version, etc.)
   ```

2. **Try to solve it:**
   - Check common errors section
   - Search GitHub issues
   - Ask in team chat

3. **Update the story:**
   - Add the error to "Common Errors" section
   - Include your solution
   - Commit changes

4. **Create an issue if needed:**
   - For recurring problems
   - For bugs in dependencies
   - For unclear requirements

---

## 📊 Story Metrics

Track these metrics for each story:

| Metric | How to Track |
|--------|--------------|
| **Actual Time** | Log hours spent |
| **Blockers** | Note any blockers in story |
| **Dependencies** | Track story dependencies |
| **Rework** | Count times had to redo work |

---

## 🎓 Learning Resources

### General
- [User Story Best Practices](https://www.atlassian.com/agile/project-management/user-stories)
- [Acceptance Criteria](https://www.productplan.com/glossary/acceptance-criteria/)
- [Story Points](https://www.atlassian.com/agile/project-management/estimation)

### Technical
- [Turborepo Guide](https://turbo.build/repo/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)

---

## 💡 Tips for Success

1. **Read the entire story before starting** - Understand the big picture
2. **Follow tasks in order** - They're sequenced for a reason
3. **Verify each step** - Don't skip verification commands
4. **Ask questions early** - Don't waste time being stuck
5. **Update status regularly** - Keep team informed
6. **Test thoroughly** - Follow all testing instructions
7. **Document issues** - Help future developers

---

## 📞 Getting Help

### Story-related Questions
- Check story's "Common Errors" section
- Search other stories for similar issues
- Ask tech lead

### Technical Questions
- Check linked resources in story
- Search project documentation
- Ask in team chat

### Blocked?
- Document the blocker in story
- Update status
- Notify tech lead immediately

---

## 🔄 Story Updates

Stories are living documents:

- Add new common errors as discovered
- Update testing instructions
- Improve task descriptions
- Add clarifications

**When updating a story:**
```bash
git commit -m "docs: update STORY-001 with new troubleshooting tip"
```

---

## 📅 Sprint Planning

### Week 1 Focus
- STORY-001 through STORY-005 (Setup & Configuration)
- Goal: Complete monorepo foundation

### Week 2 Focus
- STORY-006 through STORY-011 (Shared Packages & Documentation)
- Goal: Complete all Phase 0 deliverables

---

## ✅ Phase 0 Completion Checklist

Before moving to Phase 1:

- [ ] All 11 stories completed
- [ ] All packages installed and working
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Setup scripts tested
- [ ] Team trained on workflow
- [ ] Code reviewed and approved

---

## 📈 Progress Dashboard

Create a quick progress report:

```bash
# Run from project root
cat stories/README.md | grep "📋\|🏗️\|✅" | wc -l
```

**Current Status (Update Daily):**

| Phase | Total | TODO | In Progress | Done | % Complete |
|-------|-------|------|-------------|------|------------|
| Phase 0 | 11 | 11 | 0 | 0 | 0% |
| Phase 1 | 10 | 10 | 0 | 0 | 0% |
| **Total** | **21** | **21** | **0** | **0** | **0%** |

---

## 🎯 Phase 1 Stories (Identity Provider)

⚠️ **Prerequisites**: Complete all Phase 0 stories first!

**Read before starting:**
- [Transition Guide](../phases/TRANSITION-PHASE-0-TO-1.md)
- [PHASE-1.md](../phases/PHASE-1.md)

### Database Setup

| ID | Story | Priority | Status | Owner |
|----|-------|----------|--------|-------|
| [012](./STORY-012-setup-supabase.md) | Setup Supabase Identity Project | P0 | 📋 | - |
| [013](#) | Implement Identity Database Schema | P0 | 📋 | - |
| [014](#) | Create Database Package | P0 | 📋 | - |

### Authentication & Authorization

| ID | Story | Priority | Status | Owner |
|----|-------|----------|--------|-------|
| [015](#) | Setup Better Auth | P0 | 📋 | - |
| [016](#) | Create RBAC Engine Package | P0 | 📋 | - |
| [019](#) | Implement JWT Service | P1 | 📋 | - |

### Identity Provider App

| ID | Story | Priority | Status | Owner |
|----|-------|----------|--------|-------|
| [017](#) | Initialize IdP Next.js App | P0 | 📋 | - |
| [018](#) | Build Auth Pages (Login/Register) | P0 | 📋 | - |
| [020](#) | Build Dashboard & Profile | P1 | 📋 | - |
| [021](#) | Implement SSO Flow | P1 | 📋 | - |

---

## 🎯 Next Steps

### After completing Phase 0:

1. ✅ Verify all acceptance criteria met
2. ✅ Run `pnpm type-check && pnpm lint`
3. ✅ Update progress dashboard above
4. ✅ Read [Transition Guide](../phases/TRANSITION-PHASE-0-TO-1.md)
5. ✅ Start with [STORY-012](./STORY-012-setup-supabase.md)

### After completing Phase 1:

1. ✅ Test Identity Provider thoroughly
2. ✅ Verify authentication working
3. ✅ Test RBAC functionality
4. ✅ Deploy to staging
5. ✅ Proceed to Phase 2

---

## 🎉 Documentation Complete!

### What We Have

✅ **21 Comprehensive Stories Created**
- Phase 0: 11 stories (Foundation)
- Phase 1: 10 stories (Identity Provider)
- Each story: 400-800+ lines of detailed instructions
- Total: ~13,000+ lines of documentation

✅ **Complete Coverage**
- Step-by-step implementation guides
- Code examples and configurations
- Testing instructions
- Error solutions and troubleshooting
- Tips and best practices

### Ready for Implementation

All documentation is complete and ready for:
1. Development teams to start implementation
2. Following the detailed guides
3. Building the entire school ecosystem

### Next Phase Documentation

**Phase 2**: Service Provider Foundation (coming soon)
**Phase 3**: PPDB Application (coming soon)

---

**Last Updated**: 2024  
**Maintained By**: Development Team  
**Version**: 2.0 (Phase 0 & 1 Complete - 21/21 Stories)  
**Questions**: Contact Tech Lead
