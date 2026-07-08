// Shop Well — automated tests for authentication, role guards and the
// sign-up → approval flow. Runs the real index.html in jsdom, driving
// the same forms and views a browser user would.
//
//   npm install && npm test
//
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { JSDOM, VirtualConsole } from 'jsdom';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

// Boot a fresh copy of the app. External resources (fonts, images) are
// not fetched by jsdom, so this runs offline like the CI syntax check.
// The muted VirtualConsole hides jsdom's "not implemented: scrollTo" noise.
function boot() {
  return new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: new VirtualConsole(),
  });
}

const q = (dom, sel) => dom.window.document.querySelector(sel);
const viewText = dom => q(dom, '#view').textContent;

// jsdom delivers hashchange asynchronously; drive the router directly
// so tests stay deterministic. render() still applies the real guards.
function nav(dom, view) {
  dom.window.__sw.state.view = view;
  dom.window.render();
}

function fill(dom, sel, value) {
  const el = q(dom, sel);
  assert.ok(el, `expected input ${sel} to exist`);
  el.value = value;
}

function submit(dom, formSel) {
  const form = q(dom, formSel);
  assert.ok(form, `expected form ${formSel} to exist`);
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
}

function loginAs(dom, email, pass) {
  nav(dom, 'login');
  fill(dom, '#liemail', email);
  fill(dom, '#lipass', pass);
  submit(dom, 'form[onsubmit="login(event)"]');
}

// ---------------------------------------------------------------------------

test('app boots signed out, with a Sign in link in the nav', () => {
  const dom = boot();
  assert.match(viewText(dom), /One basket/);
  assert.equal(dom.window.__sw.state.user, null);
  assert.match(q(dom, '#navAuth').textContent, /Sign in/);
});

test('every seeded product has a real photo that exists on disk', async () => {
  const dom = boot();
  const products = dom.window.__sw.PRODUCTS;
  assert.ok(products.length >= 14);
  for (const p of products) {
    assert.ok(p.img, `${p.name} should have an img`);
    await access(new URL('../' + p.img, import.meta.url)); // throws if missing
  }
  nav(dom, 'shop');
  const cards = dom.window.document.querySelectorAll('#view .product .art img');
  assert.equal(cards.length, products.filter(p => p.stock >= 0).length);
});

test('guarded views bounce a signed-out visitor to the login page', () => {
  const dom = boot();
  for (const [view, hint] of [
    ['account', /sign in to see your orders/i],
    ['checkout', /basket is safe/i],
    ['supplier', /supplier account/i],
    ['admin', /admin account/i],
  ]) {
    nav(dom, view);
    assert.match(viewText(dom), /Sign in/, `${view} should show login`);
    assert.match(viewText(dom), hint, `${view} should say why`);
  }
});

test('login rejects a wrong password and keeps the user signed out', () => {
  const dom = boot();
  loginAs(dom, 'alex.morgan@example.com', 'not-the-password');
  assert.equal(dom.window.__sw.state.user, null);
  const err = q(dom, '#loginErr');
  assert.ok(err.classList.contains('show'));
  assert.match(err.textContent, /don’t match/);
});

test('customer can sign in, sees only their own orders, and can sign out', () => {
  const dom = boot();
  loginAs(dom, 'alex.morgan@example.com', 'veg4life');
  const user = dom.window.__sw.state.user;
  assert.equal(user?.role, 'customer');

  nav(dom, 'account'); // jsdom delivers go()'s hashchange async — render directly
  assert.match(q(dom, '#navAuth').textContent, /Alex Morgan/);
  assert.match(viewText(dom), /SW-1041/);
  assert.match(viewText(dom), /SW-1042/);

  dom.window.logout();
  assert.equal(dom.window.__sw.state.user, null);
  nav(dom, 'account');
  assert.match(viewText(dom), /Sign in/);
});

test('signed-in customer can check out; the order is stamped with their account', () => {
  const dom = boot();
  loginAs(dom, 'alex.morgan@example.com', 'veg4life');

  dom.window.addToBasket('p1');
  dom.window.addToBasket('p1');
  dom.window.addToBasket('p8');
  const stockBefore = dom.window.__sw.PRODUCTS.find(p => p.id === 'p1').stock;

  nav(dom, 'checkout');
  assert.equal(q(dom, '#custname').value, 'Alex Morgan');
  assert.equal(q(dom, '#custemail').value, 'alex.morgan@example.com');
  fill(dom, '#addr1', '14 Orchard Lane');
  fill(dom, '#city', 'Bristol');
  fill(dom, '#postcode', 'BS1 4ND');
  submit(dom, 'form[onsubmit="placeOrder(event)"]');

  const orders = dom.window.__sw.ORDERS;
  const placed = orders[orders.length - 1];
  assert.equal(placed.email, 'alex.morgan@example.com');
  assert.equal(placed.shipments.length, 2); // two suppliers, one payment
  assert.equal(dom.window.__sw.PRODUCTS.find(p => p.id === 'p1').stock, stockBefore - 2);
  nav(dom, 'confirmation'); // placeOrder go()es here; render it synchronously
  assert.match(viewText(dom), /Order placed/);

  nav(dom, 'account');
  assert.match(viewText(dom), new RegExp(placed.id));
});

test('supplier signs in to their own locked portal — no switching accounts', () => {
  const dom = boot();
  loginAs(dom, 'greenfield@example.com', 'grow2026');
  assert.equal(dom.window.__sw.state.user?.sup, 's1');

  nav(dom, 'supplier');
  assert.match(viewText(dom), /Greenfield Organics/);
  assert.match(viewText(dom), /Rainbow Carrot Bunch/);      // their listing
  assert.doesNotMatch(viewText(dom), /Discovery Apples/);   // someone else's
  assert.equal(q(dom, '#view select[aria-label="Switch supplier account"]'), null);

  nav(dom, 'admin'); // wrong role → login page
  assert.match(viewText(dom), /admin account/i);
});

test('admin signs in and sees the approvals queue', () => {
  const dom = boot();
  loginAs(dom, 'admin@shopwell.example', 'marketday2026');
  assert.equal(dom.window.__sw.state.user?.role, 'admin');
  nav(dom, 'admin');
  assert.match(viewText(dom), /Supplier approvals/);
  assert.match(viewText(dom), /Nordisk Roots/); // seeded pending supplier
});

test('customer sign-up validates, signs in, and survives a "reload"', () => {
  const dom = boot();
  nav(dom, 'signup');

  // password mismatch is caught
  fill(dom, '#sucust', 'Sam Field');
  fill(dom, '#suemail', 'sam.field@example.com');
  fill(dom, '#supass', 'lettuce-pray1');
  fill(dom, '#supass2', 'different-pass');
  submit(dom, 'form[onsubmit="signup(event)"]');
  assert.match(q(dom, '#signupErr').textContent, /don’t match/);
  assert.equal(dom.window.__sw.state.user, null);

  // duplicate email is caught
  fill(dom, '#suemail', 'alex.morgan@example.com');
  fill(dom, '#supass2', 'lettuce-pray1');
  submit(dom, 'form[onsubmit="signup(event)"]');
  assert.match(q(dom, '#signupErr').textContent, /already has an account/);

  // valid sign-up works and is persisted
  fill(dom, '#suemail', 'sam.field@example.com');
  submit(dom, 'form[onsubmit="signup(event)"]');
  assert.equal(dom.window.__sw.state.user?.name, 'Sam Field');
  const saved = JSON.parse(dom.window.localStorage.getItem('sw_reg_users'));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].email, 'sam.field@example.com');

  // "reload": fresh DOM, carry the storage over, restore the session
  const dom2 = boot();
  for (const key of ['sw_reg_users', 'sw_reg_suppliers', 'sw_session']) {
    const v = dom.window.localStorage.getItem(key);
    if (v !== null) dom2.window.localStorage.setItem(key, v);
  }
  dom2.window.loadRegistry();
  dom2.window.restoreSession();
  dom2.window.render();
  assert.equal(dom2.window.__sw.state.user?.email, 'sam.field@example.com');
  loginAs(dom2, 'sam.field@example.com', 'lettuce-pray1'); // password round-trips
  assert.equal(dom2.window.__sw.state.user?.name, 'Sam Field');
});

test('supplier sign-up joins the approval queue; approval unlocks the portal', () => {
  const dom = boot();
  nav(dom, 'signup');
  dom.window.setSignupRole('supplier');

  fill(dom, '#subiz', 'Hilltop Growers');
  fill(dom, '#suregion', 'Cumbria, UK');
  fill(dom, '#subio', 'Organic salad leaves and herbs.');
  fill(dom, '#suemail', 'hello@hilltop.example');
  fill(dom, '#supass', 'salad-days-2026');
  fill(dom, '#supass2', 'salad-days-2026');
  submit(dom, 'form[onsubmit="signup(event)"]');

  const user = dom.window.__sw.state.user;
  assert.equal(user?.role, 'supplier');
  const sup = dom.window.__sw.SUPPLIERS.find(s => s.id === user.sup);
  assert.equal(sup.status, 'pending');

  // portal is locked while pending, and their produce can't reach the shop
  nav(dom, 'supplier');
  assert.match(viewText(dom), /under review/);
  assert.doesNotMatch(viewText(dom), /My listings/);

  // admin sees and approves the application
  loginAs(dom, 'admin@shopwell.example', 'marketday2026');
  nav(dom, 'admin');
  assert.match(viewText(dom), /Hilltop Growers/);
  dom.window.approveSupplier(sup.id, true);
  assert.equal(sup.status, 'approved');
  // approval is persisted for sign-up suppliers
  const savedSup = JSON.parse(dom.window.localStorage.getItem('sw_reg_suppliers'));
  assert.equal(savedSup[0].status, 'approved');

  // back as the supplier: portal now unlocked, and they can list produce
  loginAs(dom, 'hello@hilltop.example', 'salad-days-2026');
  nav(dom, 'supplier');
  assert.match(viewText(dom), /My listings/);
  dom.window.__sw.state.portalTab = 'new';
  dom.window.render();
  fill(dom, '#lname', 'Heritage Salad Mix');
  fill(dom, '#lunit', '150g');
  fill(dom, '#lprice', '2.60');
  fill(dom, '#lstock', '20');
  fill(dom, '#ldesc', 'Cut-and-come-again leaves, picked to order.');
  submit(dom, 'form[onsubmit="addListing(event)"]');
  const listed = dom.window.__sw.PRODUCTS.find(p => p.name === 'Heritage Salad Mix');
  assert.equal(listed?.sup, sup.id);

  // and the new listing is live in the shop
  dom.window.logout();
  nav(dom, 'shop');
  assert.match(viewText(dom), /Heritage Salad Mix/);
});

test('supplier can upload a photo for a new listing; shop shows it', async () => {
  const dom = boot();
  loginAs(dom, 'greenfield@example.com', 'grow2026');
  nav(dom, 'supplier');
  dom.window.__sw.state.portalTab = 'new';
  dom.window.render();

  // a tiny valid PNG (1×1 transparent pixel)
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64');
  const file = new dom.window.File([png], 'broccoli.png', { type: 'image/png' });
  const input = q(dom, '#lphoto');
  Object.defineProperty(input, 'files', { value: [file] });
  dom.window.onPhotoPicked(input);

  // FileReader is async — wait for the photo to land in state
  for (let i = 0; i < 50 && !dom.window.__sw.state.newPhoto; i++) {
    await new Promise(r => setTimeout(r, 20));
  }
  assert.match(dom.window.__sw.state.newPhoto, /^data:image\/png;base64,/);
  assert.match(q(dom, '#photoPreview').innerHTML, /<img/); // live preview

  fill(dom, '#lname', 'Purple Sprouting Broccoli');
  fill(dom, '#lunit', '400g');
  fill(dom, '#lprice', '2.60');
  fill(dom, '#lstock', '12');
  fill(dom, '#ldesc', 'Tender stems, best steamed.');
  submit(dom, 'form[onsubmit="addListing(event)"]');

  const listed = dom.window.__sw.PRODUCTS.find(p => p.name === 'Purple Sprouting Broccoli');
  assert.match(listed?.img, /^data:image\/png;base64,/);
  assert.equal(dom.window.__sw.state.newPhoto, null); // cleared after publish

  nav(dom, 'shop');
  const card = [...dom.window.document.querySelectorAll('#view .product')]
    .find(el => el.textContent.includes('Purple Sprouting Broccoli'));
  assert.ok(card, 'new listing should appear in the shop');
  assert.match(card.querySelector('.art img').src, /^data:image\/png/);
});

test('supplier can change the photo on an existing listing from the table', async () => {
  const dom = boot();
  loginAs(dom, 'greenfield@example.com', 'grow2026');
  nav(dom, 'supplier'); // default tab is My listings

  const input = q(dom, '#photo-p1');
  assert.ok(input, 'each listing row should have a photo input');
  assert.match(q(dom, 'label[for="photo-p1"]').textContent, /Change photo/); // p1 already has one

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64');
  const file = new dom.window.File([png], 'carrots-new.png', { type: 'image/png' });
  Object.defineProperty(input, 'files', { value: [file] });
  dom.window.onListingPhotoPicked('p1', input);

  const p1 = dom.window.__sw.PRODUCTS.find(p => p.id === 'p1');
  for (let i = 0; i < 50 && !p1.img.startsWith('data:'); i++) {
    await new Promise(r => setTimeout(r, 20));
  }
  assert.match(p1.img, /^data:image\/png;base64,/);

  // the shop card now uses the uploaded photo
  nav(dom, 'shop');
  const card = [...dom.window.document.querySelectorAll('#view .product')]
    .find(el => el.textContent.includes('Rainbow Carrot Bunch'));
  assert.match(card.querySelector('.art img').src, /^data:image\/png/);
});

test('photo picker rejects non-image files', () => {
  const dom = boot();
  loginAs(dom, 'greenfield@example.com', 'grow2026');
  nav(dom, 'supplier');
  dom.window.__sw.state.portalTab = 'new';
  dom.window.render();

  const file = new dom.window.File(['not an image'], 'notes.txt', { type: 'text/plain' });
  const input = q(dom, '#lphoto');
  Object.defineProperty(input, 'files', { value: [file] });
  dom.window.onPhotoPicked(input);
  assert.equal(dom.window.__sw.state.newPhoto, null);
});

test('chatbot only reads orders for the signed-in customer', () => {
  const dom = boot();
  dom.window.toggleChat(true);
  dom.window.handleIntent('status'); // signed out
  assert.match(q(dom, '#chatLog').textContent, /sign in with your customer account/);

  loginAs(dom, 'alex.morgan@example.com', 'veg4life');
  dom.window.handleIntent('status');
  assert.match(q(dom, '#chatLog').textContent, /SW-1042/);
});
