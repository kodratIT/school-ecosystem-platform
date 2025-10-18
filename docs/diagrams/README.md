# UML Diagrams - Ekosistem Sekolah

Folder ini berisi diagram arsitektur untuk sistem Ekosistem Sekolah menggunakan **C4 Model** dan **PlantUML**.

## 📁 Diagram Files

### C4 Model Diagrams

#### 1. **c4-level1-system-context.puml**
**System Context Diagram** - Big picture dari ekosistem
- Menampilkan semua user personas (admin, guru, siswa, orangtua, dll)
- Menampilkan semua aplikasi dalam ekosistem
- Hubungan dengan external systems (payment gateway, email, SMS, OAuth)
- **Use case**: Understanding overall system landscape

#### 2. **c4-level2-container.puml**
**Container Diagram** - Teknologi dan database architecture
- Detail setiap aplikasi Next.js
- Database terpisah per Service Provider
- Shared packages (@repo/*)
- Deployment pada Vercel dan Supabase
- Inter-app communication patterns
- **Use case**: Understanding tech stack and data architecture

#### 3. **c4-level3-identity-provider.puml**
**Component Diagram - Identity Provider**
- Frontend components (login, register, profile)
- API layer (auth, user, school, role, permission APIs)
- Business logic (Better Auth, JWT, RBAC services)
- Data access layer (repositories)
- Middleware (auth, rate limiting, CSRF)
- **Use case**: Understanding IdP internal architecture

#### 4. **c4-level3-service-provider.puml**
**Component Diagram - Service Provider (Generic)**
- Template architecture untuk semua Service Providers
- Middleware chain (auth → RBAC → tenant → RLS)
- Business logic patterns
- Integration dengan Identity Provider
- Shared package usage
- **Use case**: Blueprint untuk membangun Service Provider baru

### Sequence Diagrams

#### 5. **sequence-sso-flow.puml**
**SSO Authentication Flow**
- Complete authentication journey dari user visit hingga authenticated
- JWT generation dan verification
- School context extraction
- Cross-app SSO (login sekali, akses semua app)
- JWT expiration dan refresh flow
- Logout flow
- **Use case**: Understanding authentication implementation

### Database Diagrams

#### 6. **database-identity-schema.puml**
**Identity Database ERD**
- Semua tabel di Identity Database
- Relationships antar tabel
- RBAC model (roles, permissions, user_school_roles)
- Multi-tenancy (schools, user_schools)
- Audit logs dan OAuth accounts
- **Use case**: Database design reference

#### 7. **database-federation-architecture.puml**
**Database Federation Strategy**
- Visualisasi multiple Supabase projects
- Foreign Data Wrapper (FDW) connections
- Inter-app API calls
- Analytics read replicas
- Benefits dari separated databases
- **Use case**: Understanding scalability strategy

### Deployment Diagrams

#### 8. **deployment-architecture.puml**
**Production Deployment Architecture**
- Vercel deployment untuk semua apps
- Supabase database projects
- Cloudflare DNS/CDN
- External services integration
- Monitoring stack (Sentry, PostHog)
- Domain strategy (subdomain per school)
- **Use case**: Infrastructure planning dan deployment

---

## 🔧 How to View/Render Diagrams

### Option 1: VS Code Extension (Recommended)
1. Install extension: **PlantUML** by jebbs
2. Install Java (required for PlantUML)
3. Open any `.puml` file
4. Press `Alt + D` (Windows/Linux) atau `Option + D` (Mac)
5. Preview akan muncul di side panel

### Option 2: Online Viewer
1. Copy isi file `.puml`
2. Buka [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
3. Paste dan lihat hasilnya

### Option 3: CLI (Generate PNG/SVG)
```bash
# Install PlantUML
brew install plantuml  # macOS
# atau
sudo apt-get install plantuml  # Linux

# Generate all diagrams as PNG
cd uml/
plantuml *.puml

# Generate as SVG
plantuml -tsvg *.puml

# Generate as PDF
plantuml -tpdf *.puml
```

### Option 4: IntelliJ IDEA / WebStorm
1. Install plugin: **PlantUML integration**
2. Open `.puml` file
3. Diagram akan auto-render di side panel

---

## 📚 C4 Model Overview

C4 Model adalah hierarchical approach untuk visualisasi software architecture:

### Level 1: System Context
- **Audience**: Everyone (non-technical stakeholders)
- **Zoom level**: Entire system + external dependencies
- **Shows**: What the system does, who uses it

### Level 2: Container
- **Audience**: Technical team, architects
- **Zoom level**: Applications and databases
- **Shows**: Technology choices, how containers communicate

### Level 3: Component
- **Audience**: Developers, architects
- **Zoom level**: Inside a container
- **Shows**: Classes, modules, components, and their responsibilities

### Level 4: Code (Not included)
- **Audience**: Developers only
- **Zoom level**: Class diagrams, code structure
- **Shows**: Implementation details

---

## 🎨 Diagram Notation

### C4 PlantUML Shapes

```
Person(alias, "Label", "Description")
Person_Ext(alias, "Label", "Description")  # External person

System(alias, "Label", "Description")
System_Ext(alias, "Label", "Description")  # External system

Container(alias, "Label", "Tech", "Description")
ContainerDb(alias, "Label", "Tech", "Description")

Component(alias, "Label", "Tech", "Description")

Rel(from, to, "Label", "Technology")
```

### Arrow Styles
- `-->` : Solid arrow (direct connection)
- `-[dashed]->` : Dashed arrow (indirect/async)
- `-[#Color]->` : Colored arrow (categorization)

---

## 🔄 Keeping Diagrams Updated

**When to update:**
- ✅ Adding new Service Provider application
- ✅ Changing authentication flow
- ✅ Modifying database schema
- ✅ Adding new external integration
- ✅ Changing deployment strategy

**Best practices:**
- Update diagrams BEFORE implementing changes
- Include diagram updates in PRs for architecture changes
- Review diagrams during sprint planning
- Version diagrams with code (in Git)

---

## 📖 Related Documentation

- Main roadmap: `../ROADMAP.md`
- Architecture decisions: `../docs/architecture/` (to be created)
- API documentation: `../docs/api/` (to be created)
- Database migrations: `../supabase/*/migrations/`

---

## 🤝 Contributing

When adding new diagrams:

1. **Use consistent naming:**
   - `c4-level{N}-{component-name}.puml` for C4 diagrams
   - `sequence-{flow-name}.puml` for sequence diagrams
   - `database-{schema-name}.puml` for database diagrams

2. **Include metadata:**
   - Title with `title` directive
   - Legend if using colors/symbols
   - Notes for complex areas

3. **Keep it simple:**
   - Focus on one aspect per diagram
   - Don't overcrowd with details
   - Use appropriate abstraction level

4. **Document in this README:**
   - Add entry to diagram list
   - Explain use case
   - Note any special conventions

---

## 🛠️ Diagram Generation Scripts

### Generate all diagrams as images:

```bash
#!/bin/bash
# scripts/generate-diagrams.sh

cd uml/

# Generate PNG
for file in *.puml; do
  plantuml -tpng "$file"
  echo "Generated: ${file%.puml}.png"
done

# Generate SVG
for file in *.puml; do
  plantuml -tsvg "$file"
  echo "Generated: ${file%.puml}.svg"
done

echo "All diagrams generated!"
```

### Generate specific diagram:

```bash
# PNG
plantuml c4-level1-system-context.puml

# SVG (better for web)
plantuml -tsvg c4-level2-container.puml

# PDF (for documentation)
plantuml -tpdf sequence-sso-flow.puml
```

---

## 📝 Notes

- **PlantUML syntax**: See [official documentation](https://plantuml.com/)
- **C4 Model**: See [c4model.com](https://c4model.com/)
- **C4-PlantUML**: See [GitHub repo](https://github.com/plantuml-stdlib/C4-PlantUML)

---

**Last Updated**: 2024  
**Maintainer**: Development Team
