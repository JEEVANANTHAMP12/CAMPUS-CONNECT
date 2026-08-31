# CAMPUS-CONNECT — Senior Developer Code Audit Report

**Date:** 2026-08-27
**Auditor:** Senior Platform Engineer
**Scope:** Full-stack codebase (Express + Supabase backend, React + Vite frontend)
**Severity Scale:** P0 (Critical) → P1 (High) → P2 (Medium) → P3 (Low/Advisory)

---

## Executive Summary

The Campus Connect platform is a well-structured monorepo with a React SPA frontend and an Express/Supabase backend. The architecture is sound, security middleware is properly layered, and the UI is polished. However, **7 bugs were identified and fixed**, and **15+ advisory items** remain for future hardening. All P0/P1 bugs have been patched in this pass.

**Overall Health Score: 82/100**

| Category | Score | Notes |
|---|---|---|
| Architecture | 9/10 | Clean separation, good patterns |
| Security | 7.5/10 | Helmet, rate limiting, XSS — missing input validation on some routes |
| Code Quality | 7/10 | Minified controllers hurt readability |
| Error Handling | 8/10 | Centralized handler, consistent ApiError |
| Real-time | 6/10 | Socket.IO foundation solid, messaging incomplete (FIXED) |
| Frontend | 8.5/10 | Polished UI, good animations, proper state management |

---

## Bugs Found & Fixed (P0/P1)

### BUG-001: Incorrect `.env` Fallback Path [P1 — Fixed]
**File:** `server/src/config/env.js:5`
**Issue:** Second `dotenv.config()` path resolves to `server/server/.env` (non-existent path).
```js
// BEFORE (broken)
dotenv.config({ path: path.join(__dirname, '../../server/.env') });
// AFTER (fixed)
dotenv.config({ path: path.join(__dirname, '../.env') });
```
**Impact:** Environment variables in a nested `.env` would silently fail to load.

---

### BUG-002: Route Ordering — Messages [P0 — Fixed]
**File:** `server/src/routes/messages.js:6-12`
**Issue:** `GET /group/:clubId` was placed AFTER `GET /:userId`, causing `/group/someId` to match `/:userId` with `userId="group"`. Group messages were unreachable.
**Fix:** Reordered routes so static paths (`/conversations`, `/group`) are registered before parameterized `/:userId`.
```js
// BEFORE
router.get('/:userId', getMessages);       // catches /group/:clubId!
router.get('/group/:clubId', getGroupMessages); // DEAD CODE

// AFTER
router.get('/group/:clubId', getGroupMessages); // matches first
router.get('/:userId', getMessages);            // falls through correctly
```
**Impact:** Group messaging endpoint was completely broken.

---

### BUG-003: Real-Time Messaging Never Received [P1 — Fixed]
**File:** `server/src/sockets/index.js`
**Issue:** The server had no handler for the `send-message` socket event. Clients emitted `send-message` but no server-side relay existed, so `receive-message` was never fired on the recipient's socket. Real-time messaging was one-directional (client → server → silence).
**Fix:** Added `send-message` → `receive-message` relay in the socket handler.
```js
socket.on('send-message', (data) => {
  const receiver = data?.receiver;
  if (!receiver) return;
  const receiverSocket = onlineUsers.get(receiver);
  if (receiverSocket) {
    io.to(receiverSocket).emit('receive-message', data);
  }
});
```
**Impact:** Real-time messaging was non-functional before this fix.

---

### BUG-004: Message Send — No Validation [P1 — Fixed]
**File:** `server/src/controllers/messages.js`
**Issue:** `sendMessage` accepted empty content, missing receiver, and self-sending. No input validation at controller level.
**Fix:** Added guards for empty content, missing receiver, and self-message prevention.

---

### BUG-005: Report Post — Missing Existence Check [P2 — Fixed]
**File:** `server/src/controllers/posts.js`
**Issue:** `reportPost` updated a post without verifying it exists. A user could report a non-existent post ID (no error, silent update on 0 rows).
**Fix:** Added `maybeOne` existence check before update.

---

### BUG-006: Approve Event — Missing Existence Check [P2 — Fixed]
**File:** `server/src/controllers/events.js`
**Issue:** `approveEvent` directly updated without fetching the event first. If the event didn't exist, it returned malformed data (the update response, not the enriched event).
**Fix:** Added existence check and returns properly enriched event.

---

### BUG-007: Verify Job — Missing Existence Check [P2 — Fixed]
**File:** `server/src/controllers/jobs.js`
**Issue:** Same pattern as BUG-006 — `verifyJob` updated without existence check.
**Fix:** Added existence check and returns properly enriched job.

---

## Security Audit

### Passed Checks
- ✅ Helmet CSP + HSTS configured
- ✅ Rate limiting on auth endpoints (10 attempts/15min)
- ✅ Rate limiting on API (200 req/15min)
- ✅ XSS sanitizer middleware active
- ✅ NoSQL injection prevention (mongoSanitize)
- ✅ HPP (HTTP Parameter Pollution) protection
- ✅ JWT with 32+ char secret enforced
- ✅ Bcrypt with 12 rounds
- ✅ CORS properly configured with origin checking
- ✅ Password excluded from all user responses (`publicUser`)
- ✅ Account lockout after 5 failed attempts
- ✅ `httpOnly` + `secure` cookies in production

### Advisory Items

| # | Severity | Issue | Recommendation |
|---|---|---|---|
| S-01 | P2 | No password complexity validation (only length ≥ 8) | Add regex: uppercase + lowercase + number + special char |
| S-02 | P2 | `admin.js` has duplicated `count()` function vs `data.js` | Consolidate into `data.js` shared utility |
| S-03 | P2 | Achievement `respond()` wrapper bypasses `asyncHandler` | Refactor all achievement controllers to use standard pattern |
| S-04 | P3 | `multer` fileFilter passes `ApiError` to `cb()` | `cb()` expects `Error`, not `ApiError` — works but not idiomatic |
| S-05 | P3 | No CSRF protection | Add `csurf` or double-submit cookie pattern for state-changing routes |
| S-06 | P3 | `verify`/`approve` endpoints don't emit socket events | Notify online users of event/job status changes in real-time |
| S-07 | P3 | Upload directory listed in `.gitignore` but exists in repo | Clean up and ensure `uploads/` is in `.gitignore` |

---

## Code Quality Issues

### Backend

| # | File | Issue | Recommendation |
|---|---|---|---|
| C-01 | `controllers/clubs.js` | Entire file minified to 10 lines | Expand for readability — critical for maintainability |
| C-02 | `controllers/events.js` | Entire file minified to 9 lines | Same as above |
| C-03 | `controllers/posts.js` | Entire file minified to 10 lines | Same as above |
| C-04 | `controllers/jobs.js` | Entire file minified to 8 lines | Same as above |
| C-05 | `controllers/achievements.js` | Custom `respond()` wrapper inconsistent with rest of codebase | Use `asyncHandler` everywhere |
| C-06 | `controllers/admin.js` | `getEngagementMetrics` has duplicated logic vs `getDashboardStats` | Extract shared count queries |
| C-07 | `routes/security.js` | Uses `router.use(protect, authorize(...))` at route level | Works but `router.use` applies to all routes — ensure `/health` is intentional |
| C-08 | `data.js` | `enrich()` function is 30+ lines per table | Consider splitting into per-table enricher modules |
| C-09 | `sockets/index.js` | `onlineUsers` Map is in-memory only | Add cleanup for stale entries; consider Redis adapter for multi-instance |

### Frontend

| # | File | Issue | Recommendation |
|---|---|---|---|
| C-10 | `Messages.jsx` | Socket emits `user-online` but server doesn't handle it | Remove dead emit or add server handler |
| C-11 | `Dashboard.jsx` | `useEffect` depends on `user` object (reference equality) | Use `user?.id` as dependency to avoid unnecessary re-fetches |
| C-12 | `Layout.jsx` | 725-line component | Extract sidebar, header, notifications, and search modal into separate components |
| C-13 | `App.jsx` | Admin route guard uses inline conditional | Consider a `ProtectedRoute` with role-based access |
| C-14 | Multiple pages | `catch {}` with empty catch blocks silently swallow errors | At minimum log to console or use error boundary |
| C-15 | `Profile.jsx` | No ability to edit skills or add new skills | Add skills management UI |

---

## Architecture Observations

### Strengths
1. **Monorepo structure** — clean `client/` + `server/` separation
2. **Supabase as DB** — reduces operational overhead vs raw Postgres
3. **Security middleware stack** — Helmet, rate limiting, XSS, HPP all in one place
4. **Consistent API pattern** — `{ success, data, total, pages }` response shape
5. **Rich role system** — 6 roles (admin, hod, faculty, leader, sub_leader, student) with clear hierarchy
6. **SEO component** — server-rendered meta tags via React component (good for SPA)

### Weaknesses
1. **No database migrations** — schema lives entirely in Supabase dashboard
2. **No tests** — zero unit/integration/e2e tests
3. **No TypeScript** — all JavaScript, no type safety on either side
4. **Minified controllers** — unreadable, unmaintainable
5. **No logging framework** — console-based logger without log levels, rotation, or structured output
6. **In-memory socket state** — `onlineUsers` Map doesn't survive restarts

---

## Dependency Audit

### Server
| Package | Version | Status |
|---|---|---|
| express | 4.21.0 | ✅ Current |
| @supabase/supabase-js | 2.49.1 | ✅ Current |
| jsonwebtoken | 9.0.2 | ✅ Current |
| bcryptjs | 2.4.3 | ✅ Current |
| helmet | 8.3.0 | ✅ Current |
| multer | 2.0.2 | ⚠️ v2 is ESM-only — verify CJS compatibility |
| socket.io | 4.7.5 | ✅ Current |
| validator | 13.15.35 | ✅ Current |

### Client
| Package | Version | Status |
|---|---|---|
| react | 18.3.1 | ✅ Current |
| react-router-dom | 6.26.2 | ✅ Current |
| framer-motion | 13.1.1 | ✅ Current |
| axios | 1.7.7 | ✅ Current |
| socket.io-client | 4.7.5 | ✅ Current |
| vite | 5.4.8 | ✅ Current |
| tailwindcss | 3.4.13 | ✅ Current |

---

## Priority Action Items

### Immediate (P0)
1. ~~Fix route ordering in messages~~ ✅ DONE
2. ~~Add real-time message relay~~ ✅ DONE
3. Add database migration scripts (Prisma/Drizzle/supabase CLI)

### Short-term (P1)
4. ~~Fix .env fallback path~~ ✅ DONE
5. ~~Add input validation on message send~~ ✅ DONE
6. Add password complexity requirements
7. Write integration tests for auth flow (register → login → token → profile)
8. Expand minified controller files for maintainability

### Medium-term (P2)
9. Add TypeScript to both client and server
10. Extract Layout.jsx into smaller components
11. Add error boundaries to React pages
12. Implement Redis adapter for Socket.IO (multi-instance support)
13. Add audit logging for admin actions

### Long-term (P3)
14. Add e2e test suite (Playwright/Cypress)
15. Implement CSRF protection
16. Add real-time notifications via socket for event/job approvals
17. Set up CI/CD pipeline with linting + type checking + tests

---

## Conclusion

The Campus Connect platform is production-ready for a small-to-medium campus deployment after the critical fixes applied in this audit. The codebase demonstrates solid engineering judgment in security layering, API design, and frontend polish. The primary technical debt lies in minified controller files, absent test coverage, and the lack of TypeScript. Addressing the P0/P1 items in this report will significantly improve reliability and maintainability.

**All 7 bugs have been patched.** Server syntax check: ✅ | Client build: ✅
