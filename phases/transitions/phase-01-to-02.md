# Transition Guide: Phase 1 to Phase 2

**From**: Identity Provider (Phase 1)  
**To**: Service Provider Foundation (Phase 2)

---

## 📋 Overview

Phase 1 focused on building the Identity Provider - the centralized authentication and authorization system.

Phase 2 will build the **Service Provider Foundation** - reusable templates and packages that all Service Provider applications (PPDB, SIS, LMS, etc.) will use.

---

## ✅ Pre-Transition Checklist

Before starting Phase 2, verify Phase 1 is complete:

### 1. Identity Provider Running

```bash
cd apps/identity-provider
pnpm dev

# Should start on http://localhost:3000
# Test: http://localhost:3000/auth/login
```

### 2. Database Accessible

```bash
cd supabase/identity

# Check connection
supabase status

# Should show: Status: LINKED
```

### 3. Key Features Working

Test these in Identity Provider:

- [ ] User registration works
- [ ] Email/password login works
- [ ] OAuth login works (optional)
- [ ] School creation works
- [ ] Role assignment works
- [ ] JWT token generated on login
- [ ] User dashboard accessible

### 4. Code Quality

```bash
# From project root
pnpm type-check
pnpm lint

# Should pass with 0 errors
```

---

## 🎯 What Changes in Phase 2?

### Mindset Shift

**Phase 1 Mindset:**
- Building one centralized application (IdP)
- Focus on authentication & authorization
- Single database for all identity data

**Phase 2 Mindset:**
- Building reusable templates & libraries
- Focus on patterns & consistency
- Enabling 15+ future applications

### Key Differences

| Aspect | Phase 1 | Phase 2 |
|--------|---------|---------|
| **Goal** | Build Identity Provider | Build reusable foundation |
| **Output** | 1 working application | Templates + packages |
| **Database** | 1 Identity database | Template for service DBs |
| **Auth** | Better Auth implementation | Auth client for consumers |
| **Focus** | Authentication logic | Integration patterns |

---

## 📦 New Concepts in Phase 2

### 1. Service Provider (SP)

A Service Provider is any application that:
- Uses Identity Provider for authentication (SSO)
- Manages its own domain data (students, courses, etc.)
- Has its own database
- Serves specific business needs

Examples: PPDB, SIS, LMS, Academic, Finance, etc.

### 2. Template-Based Development

Instead of building each SP from scratch:
```bash
# Copy template
cp -r packages/templates/service-provider apps/new-service

# Configure (5 minutes)
# ... update name, database, etc ...

# Start developing business logic immediately!
```

### 3. Middleware Chain

Every Service Provider will use this middleware chain:

```
Request
  ↓
[1. Auth Middleware]
  - Verify JWT token
  - Extract user info
  ↓
[2. RBAC Middleware]
  - Check permissions
  - Validate roles
  ↓
[3. Tenant Middleware]
  - Set school context
  - Enable RLS filtering
  ↓
[Your Business Logic]
  - Student CRUD
  - Course management
  - etc.
```

### 4. Inter-Service Communication

Services will talk to each other:

```
PPDB Service
  ↓ (API call)
SIS Service
  ↓ (get student data)
Academic Service
```

Phase 2 builds the API client for this.

---

## 🛠️ What You'll Build

### Week 1: Core Packages

1. **Database Template** (`@repo/database-template`)
   - Pattern for service databases
   - RLS helpers
   - Multi-tenant utilities

2. **Auth Client** (`@repo/auth-client`)
   - JWT token handling
   - React hooks (useAuth)
   - Permission checking

3. **Middleware** (`@repo/middleware`)
   - Auth middleware
   - RBAC middleware
   - Tenant middleware

4. **API Client** (`@repo/api-client`)
   - Inter-service communication
   - Type-safe API calls

### Week 2: Template & Demo

5. **SP Template** (`packages/templates/service-provider`)
   - Next.js app template
   - Pre-configured middleware
   - SSO integration ready

6. **Layouts Package** (`@repo/layouts`)
   - Shared UI layouts
   - Navigation
   - User menu

7. **Demo App** (`apps/test-service`)
   - Working example
   - Test SSO flow
   - Validate everything works

8. **Documentation**
   - How to use templates
   - Best practices
   - Troubleshooting

---

## 🔄 Workflow Changes

### Phase 1 Workflow

```bash
1. Design feature
2. Implement in IdP app
3. Test
4. Done
```

### Phase 2 Workflow

```bash
1. Design reusable pattern
2. Build as package/template
3. Document usage
4. Test with demo app
5. Verify another dev can use it
```

The goal: **Make it easy for others to use**

---

## 📖 New Technologies

### Already Know (from Phase 1)

- ✅ Next.js
- ✅ TypeScript
- ✅ Supabase
- ✅ Better Auth
- ✅ JWT tokens
- ✅ RBAC concepts

### Will Learn (in Phase 2)

- 🆕 Middleware patterns in Next.js
- 🆕 React Context for auth state
- 🆕 Custom React hooks
- 🆕 Template-based development
- 🆕 Package architecture
- 🆕 Inter-service communication patterns

**Good news**: All new concepts build on what you know!

---

## 🎓 Recommended Reading

Before starting Phase 2, read:

1. **Next.js Middleware**
   - https://nextjs.org/docs/app/building-your-application/routing/middleware
   - How middleware works
   - Middleware chain execution

2. **React Context API**
   - https://react.dev/reference/react/createContext
   - Why we need it for auth
   - Best practices

3. **Monorepo Packages**
   - https://turbo.build/repo/docs/handbook/sharing-code
   - How to structure shared packages
   - Internal vs external packages

**Time**: ~2 hours of reading

---

## 🚀 Getting Started

### Step 1: Review Phase 1 Code

Spend 1-2 hours reviewing:
- How Better Auth is set up
- How JWT tokens are generated
- Database schema structure
- RBAC implementation

**Why?** You'll be creating client-side versions of these.

### Step 2: Understand the Goal

The goal of Phase 2:
> "Make it possible to create a new Service Provider in 30 minutes"

Keep this in mind while building templates.

### Step 3: Read Phase 2 Documentation

- [Phase 2 Overview](../phase-02-service-provider-foundation/README.md)
- [Implementation Guide](../phase-02-service-provider-foundation/IMPLEMENTATION.md)
- [Summary](../phase-02-service-provider-foundation/SUMMARY.md)

### Step 4: Start with STORY-022

[STORY-022: Create Database Package Template](../../stories/phase-02-service-provider-foundation/STORY-022-create-database-package-template.md)

This is foundational for everything else.

---

## 🎯 Success Criteria

You'll know Phase 2 is successful when:

1. ✅ Demo app authenticates via IdP (SSO works)
2. ✅ Middleware chain executes correctly
3. ✅ Multi-tenancy filtering works
4. ✅ Another developer can bootstrap new SP using template
5. ✅ Documentation clear enough to follow
6. ✅ All packages pass type-check and lint
7. ✅ Tests pass

**Key Test**: Can a new developer create a working Service Provider in 30 minutes?

---

## 💡 Tips for Success

### 1. Think "Reusable"

Every time you write code, ask:
- "Will other services need this?"
- "How can I make this configurable?"
- "Is this specific to one service or general?"

### 2. Document As You Go

Don't leave documentation for later:
- Add inline comments
- Write README for each package
- Create code examples

### 3. Test with Demo App

After each package:
- Use it in demo app
- Verify it works
- Check for edge cases

### 4. Get Feedback Early

After Week 1 (core packages done):
- Have another developer try using them
- Collect feedback
- Improve before Week 2

---

## ❓ Common Questions

### Q: Why not build PPDB directly (Phase 3)?

**A**: Without Phase 2, every Service Provider would:
- Re-implement authentication (15x duplication)
- Create their own middleware (inconsistent)
- Figure out SSO individually (slow)

Phase 2 does this work once, all services benefit.

### Q: How is this different from Phase 0?

**A**: 
- Phase 0: General utilities (UI, utils, types)
- Phase 2: Service Provider specific (auth, middleware, templates)

### Q: Can I skip any stories?

**A**: No, they build on each other. But you can adjust the order slightly:
- STORY-022, 023, 024 must be first (dependencies)
- STORY-025, 028 can be parallel
- STORY-026, 027 must be after 022-025
- STORY-029, 030 must be last (testing & docs)

---

## 🔗 Resources

- [Phase 2 Overview](../phase-02-service-provider-foundation/README.md)
- [Phase 2 Stories](../../stories/phase-02-service-provider-foundation/)
- [Architecture Diagrams](../../docs/diagrams/)
- [Project Roadmap](../../ROADMAP.md)

---

## 🎉 Ready to Start?

You've completed Phase 1 - great work! 🎊

Phase 2 will be different but equally important. You're not building features for end-users, you're building tools for developers (including future you!).

**Remember**: Good templates and packages pay dividends for all future development.

Let's build the foundation that will power 15+ applications! 💪

---

**Next**: [Phase 2 README](../phase-02-service-provider-foundation/README.md)  
**Start**: [STORY-022](../../stories/phase-02-service-provider-foundation/STORY-022-create-database-package-template.md)
