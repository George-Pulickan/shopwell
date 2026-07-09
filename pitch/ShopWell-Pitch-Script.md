# Shop Well — Client Pitch: Presenter Script

**Deck:** `ShopWell-Pitch.pptx` (15 slides)
**Total time:** ~20 minutes (12–13 min talking + 5-min live demo + questions)
**Before you start:** open `index.html` in a browser tab behind the slides, signed out, so the demo is one Cmd+Tab away. No network needed — everything runs locally.

---

## Slide 1 — Title (30 seconds)

> "Good morning, and thank you for your time. This is **Shop Well** — the organic produce marketplace we've built from the requirements you gave us in the interview on the 6th of July.
>
> One thing before we begin: everything you'll see today is **not a mock-up**. It's a working product. Every screen in this deck is clickable, and at the end I'll show it to you live."

*Beat. Let the produce photography land — it's the brand.*

---

## Slide 2 — The problem (90 seconds)

> "Let's start with the problem we heard from you.
>
> **Customers** want organic produce, and they increasingly want to know exactly which farm it came from. But today, shopping that way means juggling separate farm shops — separate baskets, separate deliveries, separate payments for every single farm.
>
> **Suppliers** — small, independent organic farms — rarely have the time or the budget to run their own online store. And on the big marketplaces they get buried. They lose their identity, and they lose control of their own pricing and stock.
>
> And critically — **nobody joins those two sides together.** There's no UK marketplace where one basket can span many vetted organic farms with a single checkout, while each farm still ships its own produce under its own name.
>
> That gap — the connection — is Shop Well."

---

## Slide 3 — The solution (90 seconds)

> "Shop Well stands on four pillars.
>
> **One basket, one payment.** A customer fills a single basket from any number of farms and pays once. Behind the scenes we split that payment per supplier automatically — and Shop Well retains a ten percent commission on each sale. That's the business model, and it's already working in the prototype.
>
> **Vetted suppliers only.** Nobody lists a single item until a Shop Well admin has approved them — organic certification, food safety, shipping capability. Trust *is* the product.
>
> **Suppliers stay in control.** Each farm manages its own listings, photos, prices and stock in a portal written in plain English for non-technical users. And when stock hits zero, the item shows 'Sold out' in the shop instantly — overselling is impossible.
>
> **And support is built in.** 'Ask Shop Well', our assistant, answers order questions from live order data — and hands over to a human, with the full conversation attached, the moment it should."

---

## Slide 4 — What we've built (60 seconds)

> "Here's the product as it exists today. Six surfaces, all live:
> the **landing page** with the brand; the **customer shop** with search, filters and live stock; **basket and checkout** with a single payment that splits into per-supplier shipments; the **supplier portal**; the **admin console**; and the **chatbot**.
>
> And sign-in and sign-up work for all three roles — customer, supplier and admin — with every page guarded by role. It runs from a double-click on one file, in Docker, or in the cloud. Same code, all three."

---

## Slide 5 — Navigating as a customer (2 minutes)

*Walk the numbered boxes left to right, then the second row.*

> "Let me walk you through the site as each kind of user sees it. First, your customer.
>
> **One** — they land on the brand page and click 'Shop the market'. **Two** — they browse: there's a search box plus filters for category, supplier, dietary tags, and every card shows the price per unit. **Three** — every product card names the farm it comes from — 'From Greenfield Organics, Devon' — with stock and best-before. If it's sold out, the button is disabled; it cannot be added. **Four** — one basket across every farm, with quantities capped at what's actually in stock.
>
> **Five** — checkout, and this is the highlighted box because it's where trust matters most: they sign in or create an account, their details prefill, and they pay **once**. Card data never touches Shop Well — a third-party payment provider handles it.
>
> **Six** — confirmation: the order splits into per-supplier shipments, each with its own status and tracking. **Seven** — 'My orders' tracks every shipment: Placed, Packed, Shipped, Delivered — and if anything is refunded, it shows there too. **Eight** — and if they need help at any point, they ask the chatbot, which reads their real order status.
>
> The demo account is on the slide — we'll use it live in a few minutes."

---

## Slide 6 — Navigating as a supplier (2 minutes)

> "Now the same journey for a farm — your supply side.
>
> **One** — they create an account and choose 'I want to sell'. That application goes straight into the admin approval queue. **Two** — highlighted, because it's the brand promise: the portal stays locked until an admin approves them. They can sign in, but they can't list anything.
>
> **Three** — once approved, the portal is their home: My listings, Orders, Payouts — locked to their own account. **Four** — they manage listings themselves: name, description, price, unit, stock, best-before, ambient or chilled shipping — and they can upload a product photo with a live preview, on a new listing or any existing one, straight from the listings table.
>
> **Five** — stock control is in-place: set stock to zero and the shop shows 'Sold out' *instantly*. **Six** — when an order comes in, they're notified with **only their items** — never another farm's. **Seven** — they mark it Packed, then Shipped — tracking is generated automatically — then Delivered. And if they can't fulfil something, one click refunds the customer for just that item while the rest of the order continues.
>
> **Eight** — they get paid: the item total minus our ten percent commission, visible right in their Payouts figure."

---

## Slide 7 — Navigating as an admin (90 seconds)

> "And the third role: your own team.
>
> Admins sign in and land in the console. The heart of it is **supplier approvals** — every 'I want to sell' sign-up lands in this queue, and your team approves or rejects with reasons. That's how the 'vetted marketplace' promise stays true at scale.
>
> There's a dashboard of **every order, payment and refund** across the marketplace, with commission earned per sale. And when a supplier clicks 'Can't fulfil', the customer's refund is automatic — but the supplier is **flagged** here, so repeated failures are visible and your team can intervene.
>
> One detail worth mentioning: there's a Danish supplier sitting in the approval queue right now — a deliberate nod to the international-expansion question we flagged as a risk in the requirements document."

---

## Slide 8 — How the pieces fit together (60 seconds)

> "Briefly, under the hood. Three layers: the **web app** your users see; the **core platform services** — catalogue, orders, stock, accounts, notifications over a single database; and the **external integrations** — the payment provider, courier tracking, email, and the chatbot with its knowledge base.
>
> Two things to note. The chatbot's access is **read-only** — it can never write, and it never sees payment data. And this same map is the production blueprint: each service becomes a REST API over the platform database. The prototype runs all of it in one self-contained page — which is why the demo needs no network and no setup."

---

## Slide 9 — 'Ask Shop Well' (90 seconds)

> "A word on the chatbot, because we built it the way we'd want to inherit it.
>
> It answers from **live data** — ask 'where's my order?' and it reads the actual current order state, tracking numbers included. Suppliers get their own self-serve help for listings and stock.
>
> It **knows when to hand over**: refunds, complaints, an explicit ask for a human, or two answers it can't parse — all escalate to Customer Care with a reference number and the full conversation attached, so no customer ever repeats themselves.
>
> And the **guardrails are in from day one**: it only sees the signed-in customer's own orders, it identifies itself as automated, and conversations aren't used for training without consent.
>
> In the prototype it's rule-based so it runs offline. In production we swap in an LLM behind the *same* read-only APIs and the *same* escalation rules. The integration pattern is the hard part — and it's done."

---

## Slide 10 — Trust, safety, accessibility (60 seconds)

> "These aren't extras — each one traces to a numbered requirement.
>
> **Payments**: card data is handled by the provider, never stored by us. **Stock**: overselling is blocked in three separate places — the add-to-basket guard, the quantity cap, and a final check at checkout. **Accessibility**: skip links, labelled inputs, visible focus rings, reduced-motion support. **Mobile**: fully responsive. **Vetting**: no unapproved supplier can list. **Privacy**: role-guarded pages, hashed passwords, and order data scoped to its owner."

---

## Slide 11 — Everything delivered to date (90 seconds)

> "Here's the work, milestone by milestone.
>
> **One**: the full prototype — the complete marketplace built directly from your interview and the requirements capture. **Two**: real accounts and sign-in for all three roles, with role-guarded pages and sessions that survive a reload — plus real produce photography, openly licensed. **Three**: a CI/CD pipeline — every code push is automatically tested, built into a Docker container, smoke-tested, and published to a container registry. **Four and five**: photo uploads for suppliers, first on new listings, then on existing ones.
>
> And the numbers on the right tell the story: three roles, **fourteen automated tests all green**, the whole app in one file with zero dependencies, and a Docker image that deploys with zero configuration."

---

## Slide 12 — Engineering quality (60 seconds)

> "Two habits I want to highlight.
>
> First, we **test like a user**: the automated suite boots the real page and drives it the way a person would — filling forms, clicking through checkout, uploading photos — and asserts on what actually renders. Sign-in, all four role guards, the approval flow, chatbot privacy — all covered, on every push.
>
> Second, **bugs become automation**. Early on, a single apostrophe broke the page. The check that caught it is now a permanent step in the pipeline — that class of bug can never reach you again."

---

## Slide 13 — Requirements traceability (60 seconds)

> "The scorecard. Every **Must**: delivered. Every **Should**: delivered. The **Could** — supplier self-serve chatbot help: also delivered.
>
> And just as important, the **Won't** is honoured: subscription boxes are consciously deferred to post-launch, exactly as we agreed in the MoSCoW scoping. We built what was asked — no more, no less — and everything traces back to a line in the requirements document or an answer you gave us in the interview."

---

## Slide 14 — Roadmap (90 seconds)

> "So where next? Four phases.
>
> **Today** — the working prototype you're about to see.
>
> **Next: production foundations.** The client-side accounts move behind a real API — bcrypt or argon2, proper sessions — the platform database goes in with the REST APIs from the architecture map, and Stripe Connect gives us genuine split payouts to farms.
>
> **Then: launch hardening.** The LLM chatbot behind the guardrails we already have, moderation and server-side storage for supplier photos, per-supplier delivery charges and cut-off times, and courier API integration.
>
> **Post-launch: growth.** Subscription boxes and international expansion — in that order, as agreed. The Danish supplier in the queue is our reminder that the demand is already knocking."

---

## Slide 15 — Close (30 seconds, then demo)

> "That's Shop Well: one basket, every farm, and a working product — not a promise.
>
> Let me show it to you live. It runs from a double-click — no install, no network."

*Cmd+Tab to the browser.*

---

## Live demo (5 minutes)

Follow this order — it builds to the strongest moment:

1. **Landing page** — point out the market-awning header, the real photography, the three-step "how it works", the vetted-supplier strip.
2. **Shop** — search "kale"; filter by supplier; show supplier names on cards; show the sold-out strawberries with the disabled button.
3. **Customer flow** — add items from three different farms; open the basket (grouped by supplier, **one total**); checkout prompts sign-in → `alex.morgan@example.com` / `veg4life`; details prefill; confirm → the order splits into three shipments.
4. **Supplier portal** — sign in as Greenfield Organics (`greenfield@example.com` / `grow2026`): the new order shows **only their items**; mark it Packed → Shipped (tracking auto-generates). Then the money moment: set Cavolo Nero stock to **0**, flip to the shop — instantly Sold out.
5. **The client rule** — on another order, click **"Can't fulfil — refund"** and show all three consequences: the customer's refund note and adjusted total, and the flag in the admin console.
6. **Admin** — sign in (`admin@shopwell.example` / `marketday2026`); approve the pending Danish supplier; mention the international-launch risk.
7. **Chatbot** — as the customer: "Where's my order?" (live answer, tracking numbers) → "I want a refund" (escalation with a CS reference and context attached).

**Demo accounts (also on the closing slide):**

| Role | Email | Password |
|---|---|---|
| Customer | `alex.morgan@example.com` | `veg4life` |
| Supplier (Greenfield Organics) | `greenfield@example.com` | `grow2026` |
| Admin | `admin@shopwell.example` | `marketday2026` |

---

## Anticipated questions & answers

**"Is the payment real?"**
No — the prototype simulates it, but the *shapes* are real: one payment, split per supplier, 10% commission calculated per sale, refunds adjusting totals. Production swaps in Stripe Connect; the order model doesn't change.

**"How secure is the login?"**
It's prototype-grade by design: passwords are hashed, never stored in plain text, and every page is role-guarded — but it lives in the browser. Production moves it server-side behind bcrypt/argon2 with real sessions. The flows and rules you saw are exactly what production keeps.

**"What happens when a supplier lets a customer down?"**
Three things, automatically: the customer is refunded for that item and notified, the rest of the order continues untouched, and the supplier is flagged in the admin console. Repeated flags are your signal to intervene.

**"Can the chatbot go rogue / leak data?"**
Its access is read-only, scoped to the signed-in user's own orders, and it never sees payment data. Refunds and complaints always go to a human. Those guardrails carry over unchanged when the LLM goes in.

**"How fast can we deploy this?"**
Today. The CI pipeline already publishes a self-contained Docker image on every merge — no database, no configuration. It's a one-line deploy on Azure, AWS or Google Cloud.

**"Why no subscription boxes?"**
Agreed scope — it's the MoSCoW "Won't" for this phase, and it's first on the post-launch growth list.

**"What did this *not* cover?"**
Real payments, server-side accounts, and the LLM chatbot — all deliberately deferred, all mapped on the roadmap slide, and none of them change the flows you saw today.

---

## Timing summary

| Section | Slides | Time |
|---|---|---|
| Opening + problem + solution | 1–3 | 3.5 min |
| Product + three navigation journeys | 4–7 | 6 min |
| Architecture, chatbot, trust | 8–10 | 3.5 min |
| Work done + quality + traceability | 11–13 | 3.5 min |
| Roadmap + close | 14–15 | 2 min |
| **Live demo** | — | **5 min** |
| Questions | — | remainder |
