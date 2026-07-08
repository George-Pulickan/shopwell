# Shop Well — MVP prototype

A working prototype of the Shop Well organic produce marketplace, built for the Reply work experience project. One self-contained web page covers the landing page, the customer shop, the supplier portal, an admin console and a support chatbot — all driven by the requirements captured in the client interview on 6 July.

Built with plain HTML/CSS/JavaScript (no frameworks, no build step) so it runs identically from a double-click, inside Docker, or deployed to the cloud.

## Run it

**Option 1 — just open it.** Double-click `index.html`. That's the whole app.

**Option 2 — Docker (the required task).**

```bash
docker build -t shopwell .
docker run --rm -p 8080:80 shopwell
# open http://localhost:8080
```

**Option 3 — pull from the registry** (after the CI pipeline has run once on GitHub):

```bash
docker run --rm -p 8080:80 ghcr.io/<your-username>/<repo>/shopwell:latest
```

## Project structure

```
shopwell/
├── index.html                       # the entire prototype (HTML + CSS + JS)
├── Dockerfile                       # nginx-based container (required task)
├── .github/workflows/ci.yml         # CI/CD pipeline (stretch goal 1 + notes for 2)
├── diagrams/
│   ├── customer-journey.mermaid     # process flow 1 (Retail deliverable)
│   ├── supplier-journey.mermaid     # process flow 2 (Retail deliverable)
│   └── solution-map.mermaid         # system map (Glue deliverable)
└── README.md
```

## How the prototype answers the requirements

Every behaviour below traces back to the Requirements Capture Document or a client interview answer. This table doubles as a checklist for the demo.

| Requirement / client answer | Where to see it in the prototype |
|---|---|
| Suppliers create and manage their own listings (FR, Must) | Supplier portal → My listings / ＋ New listing: name, description, price, unit, stock, best-before, ambient/chilled |
| Stock at zero cannot be ordered (FR, Must / NFR2) | Set any item's stock to 0 in the portal — it shows "Sold out" in the shop instantly and the button disables; quantities are also capped at available stock |
| Browse and search with filters (FR, Must) | Shop page: search box + category, supplier, dietary-tag and price-per-unit information on every card |
| Customers see which supplier each item comes from (client answer) | Every product card: "From **Greenfield Organics** · Devon, UK" |
| One basket, one payment across suppliers (FR, Must) | Basket groups items by supplier but shows a single total; checkout takes one payment |
| Payment split behind the scenes, Shop Well takes commission (client answer) | Checkout summary and supplier Payouts stat show the 10% commission; admin console shows commission earned |
| Suppliers notified with only their items (FR, Must) | Supplier portal → Orders shows just that supplier's lines from each order |
| Order confirmation + tracking per shipment (FR, Should) | Confirmation page and My orders: per-supplier status Placed → Packed → Shipped → Delivered with tracking refs |
| One supplier fails → refund that item, rest proceeds, flag for admin (client answer) | Portal → Orders → "Can't fulfil — refund": customer sees a refund notice on their order, total adjusts, admin console shows a fulfilment flag |
| Admin approves suppliers before they can list (FR, Should) | Admin console → Supplier approvals: Nordisk Roots is seeded as pending, with the cross-border risk noted |
| Admin dashboard of orders/payments/refunds (FR, Should) | Admin console → Orders & refunds |
| Chatbot answers order status from live data (FR, Should) | "Ask Shop Well" → "Where's my order?" reads the actual latest order state, including tracking numbers |
| Chatbot escalates to a human with context (FR, Should) | Ask for a refund, or say anything twice it can't parse — it raises a Customer Care reference and notes the conversation context is attached |
| Supplier self-serve chatbot help (FR, Could) | Chatbot → "I'm a supplier" switches to listing/stock/order-issue guidance |
| Usable by non-technical suppliers (NFR1) | Portal copy is plain English; price and stock edit in-place in the table |
| Secure payments, card data never stored (NFR4) | Checkout payment box + site footer state the third-party provider handles card data |
| Accessible (NFR3) and mobile-friendly (NFR5) | Skip link, labels on all inputs, visible focus rings, aria-labels on icon buttons, reduced-motion support, responsive down to phone widths |
| UK-only launch, international flagged as risk | Checkout postcode label, chatbot delivery answer, and the pending Danish supplier in admin |

Deliberately out of scope, matching the MoSCoW "Won't": recurring subscription boxes.

## Chatbot: prototype vs production (integration & data requirements)

The prototype chatbot is rule-based so it can run offline, but it is wired the way the real one would be, which is the point of the Retail deliverable on chatbot integration:

- **Data it reads:** live order records (status, tracking, items per supplier), delivery lead times per supplier, and policy/FAQ content. In the prototype it reads the in-memory order store; in production this becomes **read-only REST APIs** over the order, delivery and knowledge-base services — the chatbot never gets write access and never sees payment data.
- **Escalation rules:** refunds, complaints, explicit requests for a human, or two consecutive failed understandings all hand over to Customer Care **with the full conversation context attached** (shown in the chat as a system note with a CS reference).
- **Privacy watch-outs:** conversations should not be used to train models without consent, the bot only surfaces the signed-in user's own orders, and it identifies itself as automated. These carry over directly to an LLM-backed version — swap the rules engine for a model, keep the same APIs and guardrails.

## CI/CD (stretch goal 1) and cloud deployment (stretch goal 2)

`.github/workflows/ci.yml` runs on every push: it syntax-checks the JavaScript, builds the Docker image, curl-tests that the container actually serves the page, and on `main` publishes the image to GitHub Container Registry. From there, deploying is a one-liner on any container host (Azure Container Instances, AWS App Runner, Google Cloud Run) — commands are in the workflow file's footer. The image is fully self-contained: no database, no environment variables, nothing to configure.

## Suggested 5-minute demo script (Friday)

1. **Landing page** — brand (pine/beetroot palette, Fraunces display type, the scalloped market-awning header), the three-step "how it works", vetted supplier strip.
2. **Shop** — search "kale", filter by supplier, point out supplier names on cards and the sold-out strawberries that can't be added.
3. **Basket → checkout** — add items from three suppliers, show the basket grouped by supplier but with one total; place the order and show the confirmation splitting into three shipments.
4. **Supplier portal** — switch to Greenfield Organics: the new order shows only their items; mark it packed → shipped (tracking auto-generated). Then the money moment: set Cavolo Nero stock to 0, flip to the shop, it's instantly sold out.
5. **The client rule** — in another order, click "Can't fulfil — refund" and show all three consequences: customer's order note + adjusted total, and the flag in the admin console.
6. **Admin** — approve the pending Danish supplier, mentioning the international-launch risk from the requirements doc.
7. **Chatbot** — ask "where's my order?" (live data), then "I want a refund" (escalation with context). Close on the solution map diagram to show where each piece sits.

## Development challenges (and how they were overcome)

- **Splitting one payment across suppliers.** The order model stores a single paid total but generates independent per-supplier shipments, each with its own status and tracking, and commission is calculated per sale. Getting refunds to adjust the order total, the shipment, and the supplier flag consistently took a dedicated `cantFulfil` routine rather than ad-hoc edits.
- **Stock integrity (NFR2).** Overselling is blocked in three places: the add-to-basket guard, the quantity stepper cap, and a final check at checkout that then decrements stock — so the shop and portal can never disagree.
- **A one-character bug.** An apostrophe inside a JavaScript template string broke the whole app; it was caught by running `node --check` on the extracted script — which then became a permanent step in the CI pipeline, a nice example of a bug turning into automation.
- **Working offline-first.** AI image tools and external photo CDNs would break in Docker without internet, so product imagery uses emoji on category-tinted tiles — consistent, fast, and on-brand for a prototype.
- **Chatbot scope.** A live LLM needs an API key and network access; a rules engine demos the *integration pattern* (read-only order API, escalation with context) without either, and the production swap is documented above.

## Future development

Real authentication and per-supplier accounts, a database with the REST APIs sketched in the solution map, a real payment-provider integration (e.g. Stripe Connect for split payouts), the LLM-backed chatbot behind the same guardrails, supplier photo uploads with an approval step, per-supplier delivery charges and cut-off times, and — post-launch, as agreed — subscription boxes and international expansion.
