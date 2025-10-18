# 🗺️ Roadmap - Ekosistem Sekolah SaaS

**Version**: 2.0  
**Last Updated**: 2024  
**Total Duration**: 54 weeks (~13 months)  
**Total Phases**: 16

---

## 🎯 Vision

Membangun ekosistem aplikasi SaaS terintegrasi untuk lingkungan sekolah dengan arsitektur **Federated Identity**, **multi-tenant**, dan **scalable**.

### Key Features
- 🔐 **Centralized Authentication** - Single Sign-On (SSO) untuk semua aplikasi
- 🏫 **Multi-tenant** - Support multiple schools dalam satu sistem
- 📊 **16 Integrated Applications** - Dari PPDB hingga Alumni Management
- 🚀 **Scalable Architecture** - Database federation, microservices-ready
- 💰 **Production-ready SaaS** - Ready untuk commercialization

---

## 🛠️ Tech Stack

### Core Technologies
- **Monorepo**: Turborepo + PNPM
- **Frontend/Backend**: Next.js 14+ (App Router, Server Actions)
- **Database**: Supabase (PostgreSQL) - Multiple projects untuk scalability
- **Authentication**: Better Auth dengan Federated Identity
- **Authorization**: RBAC (Role-Based Access Control)
- **UI**: Tailwind CSS + shadcn/ui
- **Type Safety**: TypeScript + Zod
- **State Management**: React Query + Zustand

### Architecture Pattern
- **Identity Provider (IdP)**: Centralized authentication & authorization
- **Service Providers (SP)**: 16 aplikasi dengan database terpisah
- **Communication**: JWT-based SSO + Internal APIs
- **Database**: Federated (1 Identity DB + 16 Service DBs)

---

## 📋 Development Phases Overview

```
Phase 0: Foundation (2 weeks)
    ↓
Phase 1: Identity Provider (3 weeks)
    ↓
Phase 2: Service Provider Foundation (2 weeks)
    ↓
Phase 3-16: Service Applications (46 weeks)
```

---

## 📦 Phase 0: Foundation & Setup

**Duration**: 2 weeks  
**Status**: 📘 DOCUMENTED  
**Stories**: 11

### Objectives
Setup monorepo structure, tooling, dan shared packages yang akan digunakan oleh semua aplikasi.

### Deliverables
- ✅ Turborepo + PNPM monorepo
- ✅ TypeScript strict configuration
- ✅ ESLint + Prettier + Git hooks
- ✅ 5 Shared packages (`@repo/ui`, `@repo/utils`, `@repo/validators`, `@repo/types`, `@repo/config`)
- ✅ Development environment setup
- ✅ Documentation structure

### Key Packages
```
packages/
├── ui/          # React component library
├── utils/       # Utility functions
├── validators/  # Zod validation schemas
├── types/       # TypeScript type definitions
└── config/      # Shared configurations
```

**Documentation**: [Phase 0 Details](./phases/phase-00-foundation/README.md)

---

## 🔐 Phase 1: Identity Provider

**Duration**: 3 weeks  
**Status**: 📘 DOCUMENTED  
**Stories**: 10

### Objectives
Membangun Identity Provider (IdP) - sistem autentikasi dan autorisasi terpusat untuk seluruh ekosistem.

### Deliverables
- ✅ Identity Database (11 tables) dengan Row Level Security
- ✅ Better Auth integration (Email/Password + OAuth)
- ✅ RBAC engine dengan 8 default roles
- ✅ JWT token service untuk SSO
- ✅ Identity Provider Next.js app
- ✅ Authentication pages & dashboard
- ✅ SSO implementation

### Database Schema
```
Identity Database:
├── users                # User accounts
├── schools              # School entities (tenants)
├── user_schools         # User-School mapping (multi-tenant)
├── roles                # Role definitions
├── permissions          # Permission definitions
├── role_permissions     # Role-Permission mapping
├── user_roles           # User-Role assignments
├── sessions             # Better Auth sessions
├── accounts             # OAuth accounts
├── verifications        # Email verifications
└── audit_logs           # Activity tracking
```

### Default Roles
1. **Super Admin** - Full system access
2. **School Admin** - School-wide management
3. **Admin** - Department management
4. **Teacher** - Teaching & grading
5. **Student** - Learning & assignments
6. **Parent** - Child monitoring
7. **Staff** - School operations
8. **Guest** - Limited public access

**Documentation**: [Phase 1 Details](./phases/phase-01-identity-provider/README.md)

---

## 🏗️ Phase 2: Service Provider Foundation

**Duration**: 2 weeks  
**Status**: 📘 DOCUMENTED  
**Priority**: HIGH

### Objectives
Membuat template dan pattern untuk Service Provider yang akan digunakan oleh 16 aplikasi.

### Deliverables
- ✅ Database package template with RLS & multi-tenant utilities
- ✅ Auth client package with React hooks & JWT utilities
- ✅ Middleware package (auth → RBAC → tenant chain)
- ✅ API client package for inter-service communication
- ✅ Service Provider app template (Next.js)
- ✅ SSO integration pattern & implementation
- ✅ Shared layouts package with navigation
- ✅ Test demo Service Provider for validation
- ✅ Complete documentation & guidelines

### Stories (9 Total)
- **STORY-022**: Database Package Template (detailed)
- **STORY-023**: Auth Client Package
- **STORY-024**: Middleware Package
- **STORY-025**: API Client Package
- **STORY-026**: SP App Template
- **STORY-027**: SSO Flow Implementation
- **STORY-028**: Layouts Package
- **STORY-029**: Test Demo SP
- **STORY-030**: Documentation

### Key Features
- SSO login redirect flow
- Token validation & refresh
- Permission checking utilities
- Multi-tenant data isolation with RLS
- Audit logging integration
- Bootstrap new SP in <30 minutes

**Documentation**: [Phase 2 Details](./phases/phase-02-service-provider-foundation/README.md)  
**Stories**: [Phase 2 Stories](./stories/phase-02-service-provider-foundation/)  
**Transition**: [From Phase 1 to 2](./phases/transitions/phase-01-to-02.md)

---

## 📝 Phase 3: PPDB (Penerimaan Peserta Didik Baru)

**Duration**: 4 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: HIGH

### Objectives
Sistem pendaftaran siswa baru online dengan workflow approval.

### Deliverables
- [ ] Public registration form
- [ ] Document upload system
- [ ] Payment integration
- [ ] Application workflow (Draft → Submit → Review → Accept/Reject)
- [ ] Admin dashboard untuk review
- [ ] Reporting & analytics
- [ ] Email notifications

### Database
- PPDB Database (separate from Identity)
- Applications, Documents, Payments, Announcements

**Tech**: First Service Provider implementation

---

## 📚 Phase 4: SIS (Student Information System)

**Duration**: 4 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: HIGH

### Objectives
Core student data management system.

### Deliverables
- [ ] Student profile management
- [ ] Parent/Guardian management
- [ ] Class & section management
- [ ] Academic year configuration
- [ ] Student enrollment tracking
- [ ] Transfer & withdrawal process
- [ ] Student reports

### Database
- SIS Database
- Students, Parents, Classes, Enrollments, Transfers

**Note**: Foundation untuk semua academic features

---

## 📖 Phase 5: Academic Management

**Duration**: 3 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: MEDIUM

### Deliverables
- [ ] Curriculum management
- [ ] Subject setup
- [ ] Class scheduling (timetable)
- [ ] Teacher assignments
- [ ] Room allocation
- [ ] Academic calendar

### Database
- Academic Database
- Subjects, Schedules, Assignments, Rooms

---

## ✅ Phase 6: Attendance System

**Duration**: 2 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: MEDIUM

### Deliverables
- [ ] Daily attendance marking
- [ ] Student attendance tracking
- [ ] Teacher attendance
- [ ] Staff attendance
- [ ] Attendance reports
- [ ] Absence notifications to parents

### Database
- Attendance Database
- Daily records, Leave requests, Reports

---

## 💰 Phase 7: Finance & Billing

**Duration**: 4 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: HIGH

### Deliverables
- [ ] Fee structure setup
- [ ] Student billing
- [ ] Payment collection
- [ ] Receipt generation
- [ ] Payment reminders
- [ ] Financial reports
- [ ] Integration with payment gateways

### Database
- Finance Database
- Fees, Invoices, Payments, Transactions

---

## 🎓 Phase 8: LMS (Learning Management System)

**Duration**: 5 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: MEDIUM

### Deliverables
- [ ] Course content management
- [ ] Assignment creation & submission
- [ ] Online quizzes
- [ ] Discussion forums
- [ ] Resource library
- [ ] Student progress tracking
- [ ] Teacher feedback system

### Database
- LMS Database
- Courses, Materials, Assignments, Submissions, Discussions

---

## 📝 Phase 9: Examination & Grading

**Duration**: 3 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: MEDIUM

### Deliverables
- [ ] Exam schedule management
- [ ] Grade entry system
- [ ] Report card generation
- [ ] GPA calculation
- [ ] Grade approval workflow
- [ ] Transcript generation
- [ ] Result publication

### Database
- Exam Database
- Exams, Grades, Report Cards, Transcripts

---

## 🏢 Phase 10: HR & Payroll (Supporting Systems)

**Duration**: 4 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: LOW

### Deliverables
- [ ] Employee management
- [ ] Payroll processing
- [ ] Leave management
- [ ] Performance evaluation
- [ ] Document management
- [ ] Payslip generation

### Database
- HR Database
- Employees, Payroll, Leave, Performance

---

## 💬 Phase 11: Communication Hub

**Duration**: 3 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: MEDIUM

### Deliverables
- [ ] Announcements system
- [ ] Messaging (Teacher-Parent, Teacher-Student)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Push notifications
- [ ] News & events

### Database
- Communication Database
- Messages, Announcements, Notifications

---

## 📊 Phase 12: Analytics & Reporting

**Duration**: 3 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: LOW

### Deliverables
- [ ] Student performance analytics
- [ ] Attendance analytics
- [ ] Financial analytics
- [ ] Custom report builder
- [ ] Dashboard widgets
- [ ] Data export (Excel, PDF)

### Database
- Analytics Database (Data Warehouse)
- Aggregated data from all systems

---

## 👨‍👩‍👧 Phase 13: Parent Portal

**Duration**: 2 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: MEDIUM

### Deliverables
- [ ] Child dashboard view
- [ ] Attendance monitoring
- [ ] Grade viewing
- [ ] Fee payment
- [ ] Communication with teachers
- [ ] Event calendar

### Note
Primarily frontend - uses APIs from other systems

---

## 📚 Phase 14: Library Management

**Duration**: 2 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: LOW

### Deliverables
- [ ] Book catalog management
- [ ] Book issue/return
- [ ] Fine calculation
- [ ] Member management
- [ ] Reports

### Database
- Library Database
- Books, Members, Transactions, Fines

---

## 🚍 Phase 15: Transport Management

**Duration**: 2 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: LOW

### Deliverables
- [ ] Route management
- [ ] Vehicle management
- [ ] Driver management
- [ ] Student transport assignment
- [ ] Fee calculation
- [ ] GPS tracking integration (optional)

### Database
- Transport Database
- Routes, Vehicles, Drivers, Assignments

---

## 🎓 Phase 16: Alumni Management

**Duration**: 2 weeks  
**Status**: 📝 PENDING DOCUMENTATION  
**Priority**: LOW

### Deliverables
- [ ] Alumni registration
- [ ] Alumni directory
- [ ] Event management
- [ ] Job board
- [ ] Donation tracking
- [ ] Newsletter

### Database
- Alumni Database
- Alumni, Events, Jobs, Donations

---

## 📊 Overall Progress

### Documentation Status

```
Phase 0:  ████████████████████ 100% (11/11 stories) ✅
Phase 1:  ████████████████████ 100% (10/10 stories) ✅
Phase 2:  ████████████████████ 100% (9/9 stories) ✅
Phase 3:  ░░░░░░░░░░░░░░░░░░░░   0% (Not documented)
...
Phase 16: ░░░░░░░░░░░░░░░░░░░░   0% (Not documented)

Total: ████░░░░░░░░░░░░░░░░  19% (3 of 16 phases documented)
```

### Implementation Status

```
Phase 0:  ░░░░░░░░░░░░░░░░░░░░   0% (Ready to implement)
Phase 1:  ░░░░░░░░░░░░░░░░░░░░   0% (Ready to implement)
Phase 2:  ░░░░░░░░░░░░░░░░░░░░   0% (Documentation pending)
...

Total: ░░░░░░░░░░░░░░░░░░░░   0% (Not started)
```

---

## 🎯 Critical Path

### Must Complete First (Blocking)

1. **Phase 0** → Foundation
   - Blocks: Everything
   - Status: ✅ Documented

2. **Phase 1** → Identity Provider
   - Blocks: All Service Providers
   - Status: ✅ Documented

3. **Phase 2** → Service Provider Template
   - Blocks: Phase 3-16
   - Status: ⏳ Next to document

4. **Phase 3** → PPDB
   - Blocks: Phase 4 (SIS)
   - Status: ⏳ Waiting for Phase 2

5. **Phase 4** → SIS
   - Blocks: Most academic features
   - Status: ⏳ Waiting for Phase 3

### Can Be Done in Parallel

After Phase 4 (SIS) complete:
- Phase 5, 6, 7, 8, 9 can run in parallel (different teams)
- Phase 10-16 can be done after core features

---

## 📅 Timeline Estimate

### By Phase
| Phase | Duration | Dependencies | Priority |
|-------|----------|--------------|----------|
| 0 | 2 weeks | None | P0 |
| 1 | 3 weeks | Phase 0 | P0 |
| 2 | 2 weeks | Phase 1 | P0 |
| 3 | 4 weeks | Phase 2 | P0 |
| 4 | 4 weeks | Phase 3 | P0 |
| 5-9 | 17 weeks | Phase 4 | P1 |
| 10-16 | 18 weeks | Phase 4 | P2 |
| **Total** | **54 weeks** | | |

### By Priority

**P0 (Critical)**: 15 weeks
- Phase 0, 1, 2, 3, 4

**P1 (High)**: 17 weeks
- Phase 5, 6, 7, 8, 9

**P2 (Medium/Low)**: 18 weeks
- Phase 10, 11, 12, 13, 14, 15, 16

### Realistic Timeline

**Minimum Viable Product (MVP)**: 20 weeks (~5 months)
- Phase 0-4: Core identity + PPDB + SIS

**Full Featured v1.0**: 54 weeks (~13 months)
- All 16 phases complete

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  End Users (Browser)                     │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ↓                       ↓
┌─────────────────┐    ┌─────────────────────────┐
│  Identity       │    │  Service Providers      │
│  Provider (IdP) │◄───┤  (16 Applications)      │
│  - Auth         │ SSO│  - PPDB, SIS, LMS, etc. │
│  - RBAC         │    │                         │
└────────┬────────┘    └────────┬────────────────┘
         │                      │
         ↓                      ↓
┌─────────────────┐    ┌─────────────────────────┐
│  Identity DB    │    │  Service DBs            │
│  (Supabase)     │    │  (1 DB per service)     │
│  - 1 Project    │    │  - 16 Projects          │
└─────────────────┘    └─────────────────────────┘
```

### Database Federation

**Why Separate Databases?**
- ✅ Scalability - Each service can scale independently
- ✅ Performance - No single database bottleneck
- ✅ Security - Data isolation per service
- ✅ Maintenance - Updates don't affect other services
- ✅ Cost - Only pay for what you use

**Structure:**
```
Identity Database (Supabase Project 1)
├── Core identity tables
└── RBAC tables

PPDB Database (Supabase Project 2)
├── Applications
└── Documents

SIS Database (Supabase Project 3)
├── Students
└── Enrollments

... (14 more service databases)
```

---

## 🔒 Security & Multi-Tenancy

### Row Level Security (RLS)

Every query automatically filtered by:
```sql
WHERE school_id = current_user_school_id()
```

### JWT Token Structure

```json
{
  "user_id": "uuid",
  "school_id": "uuid",
  "roles": ["teacher", "admin"],
  "permissions": ["students.read", "grades.write"],
  "exp": "timestamp"
}
```

### SSO Flow

```
1. User visits Service Provider (e.g., PPDB)
2. SP redirects to IdP for authentication
3. User logs in at IdP
4. IdP generates JWT token
5. User redirected back to SP with token
6. SP validates token
7. User logged in to SP
```

---

## 🎯 Success Criteria

### Phase 0-1 Complete When:
- ✅ Monorepo structure working
- ✅ Users can register & login
- ✅ SSO working between IdP and test app
- ✅ RBAC enforced

### MVP Complete When:
- ✅ Schools can register
- ✅ Students can apply online (PPDB)
- ✅ Student data managed (SIS)
- ✅ Multi-tenant isolation verified

### v1.0 Complete When:
- ✅ All 16 applications deployed
- ✅ Integration tests passing
- ✅ Performance benchmarks met
- ✅ Security audit passed
- ✅ Production ready

---

## 📚 Documentation

### Main Documents
- **[Get Started](./GET-STARTED.md)** - Quick start guide
- **[Documentation Index](./.meta/DOCUMENTATION-INDEX.md)** - Complete index
- **[Project Status](./.meta/PROJECT-STATUS.md)** - Current status

### Phase Documentation
- **[All Phases](./phases/README.md)** - Phase navigation
- **[Phase 0](./phases/phase-00-foundation/README.md)** - Foundation
- **[Phase 1](./phases/phase-01-identity-provider/README.md)** - Identity Provider

### Architecture
- **[Architecture Diagrams](./docs/diagrams/README.md)** - UML & C4 diagrams
- **[Architecture Docs](./docs/architecture/README.md)** - Design documents

---

## 🚀 Getting Started

### For Developers

1. **Understand the Architecture**
   - Read this roadmap
   - Review [architecture diagrams](./docs/diagrams/README.md)

2. **Start with Phase 0**
   - Follow [Phase 0 guide](./phases/phase-00-foundation/README.md)
   - Complete all 11 stories

3. **Move to Phase 1**
   - Read [transition guide](./phases/transitions/phase-00-to-01.md)
   - Follow [Phase 1 guide](./phases/phase-01-identity-provider/README.md)

4. **Build Service Providers**
   - Wait for Phase 2 template
   - Then build Phase 3-16

### For Project Managers

1. **Track Progress**
   - Use [Project Status](./.meta/PROJECT-STATUS.md)
   - Monitor story completion

2. **Plan Resources**
   - Phase 0-4: 2-3 developers (15 weeks)
   - Phase 5-9: 3-5 developers (17 weeks)
   - Phase 10-16: 2-3 developers (18 weeks)

3. **Manage Dependencies**
   - Don't start Phase X without completing dependencies
   - Use critical path for scheduling

---

## 💡 Key Decisions

### Why Monorepo?
- ✅ Code sharing between apps
- ✅ Consistent tooling
- ✅ Easier refactoring
- ✅ Single source of truth

### Why Federated Identity?
- ✅ Single login for all apps
- ✅ Centralized user management
- ✅ Consistent permissions
- ✅ Better security

### Why Database Federation?
- ✅ Better scalability
- ✅ Performance isolation
- ✅ Independent updates
- ✅ Cost optimization

### Why Supabase?
- ✅ PostgreSQL (reliable & powerful)
- ✅ Row Level Security (multi-tenant built-in)
- ✅ Real-time capabilities
- ✅ Good developer experience
- ✅ Reasonable pricing

---

## 🎓 Learning Resources

### Architecture Patterns
- [Federated Identity](https://en.wikipedia.org/wiki/Federated_identity)
- [Multi-tenant Architecture](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Microservices](https://microservices.io/)

### Technologies
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Better Auth](https://better-auth.com/docs)

---

## 📞 Questions?

- Check [Documentation Index](./.meta/DOCUMENTATION-INDEX.md)
- Review [Get Started Guide](./GET-STARTED.md)
- Read phase-specific documentation

---

**Roadmap Version**: 2.0  
**Last Updated**: 2024  
**Status**: Phase 0 & 1 Documented ✅  
**Next**: Document Phase 2 📝
