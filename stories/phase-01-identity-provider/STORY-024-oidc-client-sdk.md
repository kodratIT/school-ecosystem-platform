# STORY-024: Create OIDC Client SDK Package

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 4  
**Story Points**: 2  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create an OIDC client SDK package** so that **Service Provider applications can easily integrate with the Identity Provider using standard OIDC flows**.

This SDK simplifies OIDC implementation for all Service Provider apps.

---

## 🎯 Goals

- Create `@repo/oidc-client` package
- Implement auto-discovery
- Handle authorization flow
- Token exchange and validation
- UserInfo requests
- Token refresh
- Logout helpers
- Type-safe interfaces

---

## ✅ Acceptance Criteria

- [ ] Package `@repo/oidc-client` created
- [ ] Auto-discovery working
- [ ] Authorization URL generation working
- [ ] Code exchange for tokens working
- [ ] ID token validation working
- [ ] Access token validation working
- [ ] UserInfo requests working
- [ ] Token refresh working
- [ ] Logout flow working
- [ ] Type-safe API
- [ ] Documentation complete
- [ ] Tests with >85% coverage

---

## 📋 Quick Implementation

Create package with these key features:

```typescript
// packages/oidc-client/src/index.ts
export class OIDCClient {
  async discover(): Promise<void>;
  getAuthorizationUrl(options: AuthOptions): string;
  async handleCallback(url: string): Promise<Tokens>;
  async validateIdToken(token: string): Promise<User>;
  async getUserInfo(accessToken: string): Promise<UserInfo>;
  async refreshTokens(refreshToken: string): Promise<Tokens>;
  getLogoutUrl(idToken?: string): string;
}
```

**Full implementation**: See `docs/oidc-implementation-plan.md` Task section for STORY-024.

---

## 🧪 Testing

```bash
pnpm test
# All tests should pass
```

---

## 📚 References

- Implementation plan: `/docs/oidc-implementation-plan.md`
- OIDC design: `/docs/oidc-design.md`
- OpenID Connect Core Spec

---

**Next**: STORY-020 - Build Dashboard Features
