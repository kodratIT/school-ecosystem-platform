# STORY-004: Setup Git Hooks with Husky

**Epic**: Phase 0 - Foundation & Setup  
**Sprint**: Week 1  
**Story Points**: 2  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **setup Git hooks with Husky and lint-staged** so that **code quality checks run automatically before commits and pushes, preventing bad code from entering the repository**.

Git hooks are scripts that Git executes before or after events such as commit, push, and receive. By automating quality checks, we ensure:
- No code with linting errors gets committed
- All code is properly formatted
- Type checking passes before pushing
- Team maintains consistent code quality

---

## 🎯 Goals

- Install Husky for Git hooks management
- Install lint-staged for efficient pre-commit checks
- Setup pre-commit hook to run linting and formatting on staged files only
- Setup pre-push hook to run full type checking
- Configure lint-staged to handle different file types appropriately
- Ensure all hooks are executable and working correctly
- Test hooks prevent bad code from being committed

---

## ✅ Acceptance Criteria

- [ ] Husky v8+ installed and initialized
- [ ] lint-staged installed and configured
- [ ] Pre-commit hook created and executable
- [ ] Pre-push hook created and executable
- [ ] lint-staged config in package.json
- [ ] Pre-commit runs ESLint fix on staged .ts/.tsx files
- [ ] Pre-commit runs Prettier on staged files
- [ ] Pre-push runs full type-check across workspace
- [ ] Hooks can be bypassed with --no-verify if needed
- [ ] Hooks tested with intentionally bad code
- [ ] No hooks committed to git (in .gitignore)

---

## 📋 Tasks

### Task 1: Install Dependencies

**Prerequisites check:**
```bash
# Ensure STORY-003 (ESLint & Prettier) is complete
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Verify ESLint works
pnpm lint || echo "⚠️ Complete STORY-003 first!"

# Verify Git is initialized
git status || echo "⚠️ Complete STORY-001 first!"
```

**Install Husky and lint-staged:**

```bash
# Install dependencies
pnpm add -D husky@^8.0.0 lint-staged@^15.0.0

# Verify installation
pnpm list husky lint-staged
```

**Expected output:**
```
husky 8.0.3
lint-staged 15.2.0
```

---

### Task 2: Initialize Husky

```bash
# Initialize Husky (creates .husky directory)
pnpm exec husky init

# This creates:
# .husky/_/husky.sh
# .husky/pre-commit (default, we'll replace it)
```

**Verify directory created:**
```bash
ls -la .husky/

# Should show:
# drwxr-xr-x  _/
# -rwxr-xr-x  pre-commit
```

**Understanding Husky structure:**
- `.husky/_/` - Internal Husky scripts (don't modify)
- `.husky/pre-commit` - Runs before `git commit`
- `.husky/pre-push` - Runs before `git push` (we'll create)
- `.husky/commit-msg` - Can validate commit messages (optional)

---

### Task 3: Configure lint-staged

**Edit:** `package.json` (root)

Add this configuration at the root level:

```json
{
  "name": "ekosistem-sekolah",
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.css": [
      "prettier --write"
    ],
    "package.json": [
      "prettier --write"
    ]
  }
}
```

**Configuration explained:**

| Pattern | Actions | Why |
|---------|---------|-----|
| `*.{js,jsx,ts,tsx}` | ESLint fix + Prettier | JavaScript/TypeScript files need linting |
| `*.{json,md,yml,yaml}` | Prettier only | Config files only need formatting |
| `*.css` | Prettier only | Styles only need formatting |
| `package.json` | Prettier only | Keep dependencies formatted |

**Why lint-staged?**
- Only checks files you're committing (fast!)
- Doesn't slow down with large codebase
- Fixes issues automatically when possible

---

### Task 4: Create Pre-commit Hook

**File:** `.husky/pre-commit`

Replace the default content with:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."
echo ""

# Run lint-staged
pnpm lint-staged

# Check if lint-staged succeeded
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Pre-commit checks failed!"
  echo "💡 Fix the errors above or use 'git commit --no-verify' to skip (not recommended)"
  exit 1
fi

echo ""
echo "✅ Pre-commit checks passed!"
```

**Make executable:**
```bash
chmod +x .husky/pre-commit

# Verify
ls -l .husky/pre-commit
# Should show: -rwxr-xr-x (x means executable)
```

**What this hook does:**
1. Sources Husky's helper script
2. Prints friendly message
3. Runs lint-staged on staged files
4. Exits with error if checks fail
5. Prevents commit if there are issues

---

### Task 5: Create Pre-push Hook

**File:** `.husky/pre-push`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-push checks..."
echo ""

# Run type checking across all packages
echo "📘 Type checking..."
pnpm type-check

# Check if type-check succeeded
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Type check failed!"
  echo "💡 Fix TypeScript errors before pushing"
  echo "💡 Or use 'git push --no-verify' to skip (not recommended)"
  exit 1
fi

echo ""
echo "✅ Pre-push checks passed!"
```

**Make executable:**
```bash
chmod +x .husky/pre-push

# Verify
ls -l .husky/pre-push
```

**Why separate hooks?**

| Hook | What it checks | Speed | Why |
|------|----------------|-------|-----|
| `pre-commit` | Linting & formatting (staged files only) | Fast (~2-5s) | Quick feedback, auto-fixes |
| `pre-push` | Type checking (entire workspace) | Slower (~10-30s) | Comprehensive, catches type errors |

**Philosophy:**
- Pre-commit: Fast, runs often, auto-fixes
- Pre-push: Thorough, runs less often, prevents broken code on remote

---

### Task 6: Update .gitignore

Ensure `.husky/_` is NOT ignored (it's needed), but we want to ensure Husky is set up for all developers.

Verify `.gitignore` doesn't have:
```gitignore
.husky/
```

The `.husky/` directory SHOULD be committed so all team members get the hooks.

---

### Task 7: Add Prepare Script

Add to `package.json` scripts:

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

**Why?**
- Runs automatically after `pnpm install`
- Ensures Husky is set up for new developers
- They get hooks without extra steps

---

## 🧪 Testing Instructions

### Test 1: Pre-commit Hook with Bad Formatting

```bash
# Create a file with bad formatting
cat > test-format.ts << 'EOF'
const   foo=123;
const bar={a:1,b:2};
function   test(  ){return   "hello";}
EOF

# Stage it
git add test-format.ts

# Try to commit
git commit -m "test: bad formatting"
```

**Expected behavior:**
```
🔍 Running pre-commit checks...

✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...

✅ Pre-commit checks passed!
[main abc1234] test: bad formatting
 1 file changed, 3 insertions(+)
```

**Verify formatting was fixed:**
```bash
cat test-format.ts

# Should now be properly formatted:
# const foo = 123;
# const bar = { a: 1, b: 2 };
# function test() {
#   return 'hello';
# }
```

**Cleanup:**
```bash
git reset HEAD~1
rm test-format.ts
```

---

### Test 2: Pre-commit Hook with ESLint Errors

```bash
# Create a file with linting errors
cat > test-lint.ts << 'EOF'
const unused = 123;  // unused variable
const foo: any = "test";  // any type
function bar() {
  console.log("test")
}
EOF

# Stage and try to commit
git add test-lint.ts
git commit -m "test: lint errors"
```

**Expected behavior:**
```
🔍 Running pre-commit checks...

✖ eslint --fix --max-warnings 0:
  test-lint.ts
    1:7   error  'unused' is assigned a value but never used  @typescript-eslint/no-unused-vars
    2:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

❌ Pre-commit checks failed!
💡 Fix the errors above or use 'git commit --no-verify' to skip (not recommended)
```

**Fix the errors:**
```bash
# Remove the file
rm test-lint.ts

# Or fix manually and retry
```

---

### Test 3: Pre-push Hook with Type Errors

```bash
# Create a file with type errors
cat > packages/utils/src/type-error.ts << 'EOF'
export function badFunction() {
  const x: string = 123;  // Type error!
  return x;
}
EOF

# Commit it (skip pre-commit for testing)
git add packages/utils/src/type-error.ts
git commit -m "test: type error" --no-verify

# Try to push
git push
```

**Expected behavior:**
```
🔍 Running pre-push checks...

📘 Type checking...

packages/utils/src/type-error.ts:2:9 - error TS2322: Type 'number' is not assignable to type 'string'.

2   const x: string = 123;
          ~

❌ Type check failed!
💡 Fix TypeScript errors before pushing
```

**Cleanup:**
```bash
git reset HEAD~1
rm packages/utils/src/type-error.ts
```

---

### Test 4: Bypass Hooks (Emergency)

```bash
# Sometimes you need to bypass hooks (use sparingly!)

# Bypass pre-commit
git commit -m "emergency fix" --no-verify

# Bypass pre-push
git push --no-verify
```

**When to bypass:**
- ✅ Emergency hotfix
- ✅ WIP commit (but don't push!)
- ❌ To skip fixing errors (bad practice!)

---

### Test 5: Verify Hooks for New Developers

```bash
# Simulate new developer
rm -rf .husky/_
rm -rf node_modules

# Fresh install
pnpm install

# Hooks should be restored automatically
ls -la .husky/

# Should show:
# .husky/_/
# .husky/pre-commit
# .husky/pre-push
```

---

## 📸 Expected Results

After completing this story:

```
.husky/
├── _/
│   └── husky.sh              ✅ Husky internal script
├── pre-commit                ✅ Executable (runs lint-staged)
└── pre-push                  ✅ Executable (runs type-check)

package.json
├── "lint-staged": {...}      ✅ Configured
└── "prepare": "husky install" ✅ Auto-setup script

.git/hooks/
└── (symlinks to .husky/)     ✅ Git hooks installed
```

**Terminal output on commit:**
```bash
$ git commit -m "feat: add new feature"
🔍 Running pre-commit checks...

✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...

✅ Pre-commit checks passed!
[main abc1234] feat: add new feature
 2 files changed, 10 insertions(+)
```

**Terminal output on push:**
```bash
$ git push
🔍 Running pre-push checks...

📘 Type checking...
✓ Type check passed

✅ Pre-push checks passed!
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
```

---

## ❌ Common Errors & Solutions

### Error: "command not found: pnpm"

**Cause:** Husky can't find pnpm in PATH

**Solution 1:** Add pnpm to PATH
```bash
# In .husky/pre-commit, add:
export PATH="$HOME/.local/share/pnpm:$PATH"
pnpm lint-staged
```

**Solution 2:** Use npx
```bash
# In .husky/pre-commit:
npx pnpm lint-staged
```

---

### Error: "Permission denied: .husky/pre-commit"

**Cause:** Hook is not executable

**Solution:**
```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push

# Verify
ls -l .husky/
```

---

### Error: ".husky/pre-commit: No such file or directory"

**Cause:** Husky not initialized

**Solution:**
```bash
# Reinitialize
pnpm exec husky install

# Recreate hooks
# Copy content from this story
```

---

### Error: "lint-staged: command not found"

**Cause:** lint-staged not installed

**Solution:**
```bash
pnpm add -D lint-staged
pnpm install
```

---

### Error: Hooks not running for other developers

**Cause:** They didn't run `pnpm install` or `.husky/` not committed

**Solution:**

1. **Ensure .husky/ is committed:**
```bash
git add .husky/
git commit -m "chore: add git hooks"
git push
```

2. **Team members run:**
```bash
git pull
pnpm install  # This runs "prepare" script
```

---

### Error: "husky - pre-commit hook exited with code 1"

**Cause:** Lint-staged found issues that couldn't be auto-fixed

**Solution:**

1. **See what failed:**
```bash
# Run manually to see errors
pnpm lint-staged
```

2. **Fix the issues:**
```bash
# Fix linting errors
pnpm lint --fix

# Fix TypeScript errors manually
```

3. **Retry commit:**
```bash
git add .
git commit -m "your message"
```

---

## 🔍 Code Review Checklist

Reviewer should verify:

- [ ] `.husky/pre-commit` is executable (`chmod +x`)
- [ ] `.husky/pre-push` is executable
- [ ] `lint-staged` config in package.json
- [ ] `prepare` script in package.json
- [ ] Hooks have friendly error messages
- [ ] Hooks tested with bad code (actually prevents commit)
- [ ] `.husky/` directory is committed to git
- [ ] Documentation updated if needed

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-001 (Git initialized)
  - STORY-002 (TypeScript setup)
  - STORY-003 (ESLint & Prettier)
- **Blocks**: None (but improves quality for all future work)

---

## 📚 Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged GitHub](https://github.com/okonet/lint-staged)
- [Git Hooks Guide](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 💡 Tips

1. **Don't overload pre-commit hook** - Keep it fast (< 5 seconds)
2. **Use pre-push for slow checks** - Type checking, tests
3. **Provide bypass option** - Sometimes developers need `--no-verify`
4. **Test hooks thoroughly** - Before committing to team
5. **Document bypass usage** - When it's okay to skip hooks
6. **Keep hooks simple** - Easy to understand and debug
7. **Add friendly messages** - Helps developers know what's happening

---

## 📝 Notes for Next Story

After this story, you have:
- ✅ Automated code quality checks
- ✅ Pre-commit linting and formatting
- ✅ Pre-push type checking
- ✅ Protection against bad code

Next (STORY-005) will setup .gitignore and environment files to protect sensitive data.

**Hooks are now enforcing quality!** 🎉

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] Husky installed and initialized
- [ ] Pre-commit hook created and tested
- [ ] Pre-push hook created and tested
- [ ] lint-staged configured
- [ ] Hooks are executable
- [ ] Tested with intentionally bad code
- [ ] Hooks prevent bad commits/pushes
- [ ] Team members can clone and get hooks automatically
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Changes committed to Git

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
