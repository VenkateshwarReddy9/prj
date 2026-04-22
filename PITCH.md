# CareerCompass — Pitch

## The one-line pitch

**CareerCompass is Claude AI as your personal career team — coach, resume expert, interview trainer, and recruiter — for 1% of the cost of a human advisor.**

---

## The problem

Career coaching today is broken:

- **Cost**: Good human career coaches charge $200–$500 per session. A full engagement runs $2,000–$5,000. Most people who need help the most can't afford it.
- **Generic advice**: Most "career content" online is one-size-fits-all. It doesn't know your specific skills, target role, or local market.
- **Fragmented tools**: Job search on LinkedIn, resume tools on Rezi, interview prep on Pramp, coaching on Topmate. Five tabs, five logins, no single picture of your career trajectory.
- **No feedback loop**: Applied to 50 jobs, got no response. Was it the resume? The match? Your LinkedIn profile? You don't know.

Meanwhile, AI has quietly become good enough to do most of this work better, faster, and cheaper — but nobody has put it all together in a product a regular job seeker can use.

---

## The solution

CareerCompass is an AI-powered career platform that gives every professional a personal coaching team:

1. **Career Assessment** — 8-question adaptive assessment → Claude generates your career archetype, 10 hand-matched jobs, a personalized skill roadmap, and an ATS-scored resume breakdown. All in under 30 seconds.
2. **Smart Job Matching** — Semantic search across Adzuna + JSearch. Match scores based on your actual profile, not keyword soup.
3. **Resume Optimizer** — Upload PDF → get ATS score, section-by-section feedback, AI-rewritten weak sections.
4. **Interview Prep** — Role-specific behavioral + technical questions. Practice with real-time Claude evaluation (clarity, depth, STAR compliance).
5. **AI Career Coach** — 24/7 streaming chat with Claude, injected with your full profile context. Asks follow-up questions. Remembers prior sessions.
6. **Skill Roadmap** — Auto-generated learning path from current role → target role, with curated resources, progress tracking, milestone badges.
7. **Market Insights** — Real salary data, hiring trends, demand scores for your role and location.

The whole platform is built on a modern, boring-tech stack (Next.js + Express + Postgres + Redis + BullMQ + Claude) — ready for production on day one.

---

## Why now

1. **Claude is finally good enough.** Long-context coaching conversations, structured JSON outputs, streaming responses — all work reliably at a cost point ($0.10–$0.50 per user per month at free tier usage) that makes a consumer product viable.
2. **The labor market is fractured.** Layoffs, AI disruption, return-to-office whiplash — professionals have never needed career guidance more.
3. **AI-native trust.** Gen Z and Millennial knowledge workers now prefer AI advice for structured tasks (resume review, salary research) over human advice. The behavioral barrier is gone.

---

## Business model

Freemium SaaS with hard gates on the expensive AI features:

| Plan | Price | Assessments | Job matches | Chat msgs | Resume uploads |
|------|-------|-------------|-------------|-----------|----------------|
| Free | $0 | 1 | 5 | 20 total | 1 |
| Starter | $19/mo | 3/mo | 20/mo | 100/mo | 3 |
| Pro | $49/mo | ∞ | ∞ | ∞ | 10 |
| Enterprise | Custom | ∞ | ∞ | ∞ | ∞ |

Unit economics on Pro: ~$4/mo AI cost, $45 gross margin, 92% margin.

Secondary monetization to layer on later: career coach marketplace (take rate), recruiter ATS integrations, corporate L&D licensing.

---

## Traction (what's built)

The platform is **production-ready from day one**:

- ✅ Full-stack monorepo (Next.js 14 + Express + Postgres + Redis)
- ✅ 13 API route modules, 4 Claude AI services, 4 BullMQ background workers
- ✅ 17 authenticated web pages covering every feature
- ✅ Stripe subscriptions with plan-based feature gating
- ✅ Socket.IO real-time progress updates during AI generation
- ✅ Sentry + Pino observability, Playwright E2E tests, CI/CD
- ✅ PDF resume parsing, Pinecone vector search infrastructure, Resend transactional email

This is not a prototype. It's a SaaS you can deploy to Vercel + Railway today and start signing up users tomorrow.

---

## The ask

If you see value here, here's how you can help:

1. **Try it.** I'll send you a signup link. Do the 5-minute assessment. Tell me what surprised you.
2. **Break it.** Edge cases, empty states, weird flows — I want to know what feels janky.
3. **Intros.** Know a career coach, HR leader, or bootcamp founder? A 20-minute intro goes a long way.
4. **Advice.** GTM strategy, pricing, design — I'm open to sharp opinions.

---

## One last thing

The best career coaches don't just give advice — they see patterns across hundreds of people and tell you what you can't see yourself. That's literally what an AI trained on millions of career trajectories is built to do.

I'm not trying to replace human coaches for the 1% who can afford them. I'm trying to give the other 99% a fighting chance.
