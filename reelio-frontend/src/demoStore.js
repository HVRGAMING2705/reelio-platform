const ACCOUNTS_KEY = "reelio_demo_accounts_v1";
const SESSION_KEY = "reelio_demo_session_v1";
const WORKSPACE_PREFIX = "reelio_demo_workspace_v1:";
const ENQUIRIES_KEY = "reelio_enquiries_v1";

export const DEMO_EMAIL = "demo@reelio.agency";
export const DEMO_PASSWORD = "ReelioDemo@2026";

function storageAvailable() {
  try {
    const testKey = "__reelio_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function readJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The UI remains usable for the current page view if storage is blocked.
  }
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function hashPassword(email, password) {
  const value = `${normalizeEmail(email)}::${String(password || "")}`;
  if (window.crypto?.subtle) {
    const digest = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value),
    );
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  // Non-secure demo-only fallback for very old browsers. This is not used
  // to protect a real account or a server-side secret.
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fallback-${(hash >>> 0).toString(16)}`;
}

function readAccounts() {
  if (!storageAvailable()) return [];
  const accounts = readJson(ACCOUNTS_KEY, []);
  return Array.isArray(accounts) ? accounts : [];
}

function writeAccounts(accounts) {
  writeJson(ACCOUNTS_KEY, accounts);
}

function publicUser(account) {
  if (!account) return null;
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    createdAt: account.createdAt,
  };
}

function saveSession(email) {
  writeJson(SESSION_KEY, {
    email: normalizeEmail(email),
    signedInAt: new Date().toISOString(),
  });
}

export function getSessionUser() {
  if (!storageAvailable()) return null;
  const session = readJson(SESSION_KEY, null);
  if (!session?.email) return null;
  const account = readAccounts().find(
    (item) => normalizeEmail(item.email) === normalizeEmail(session.email),
  );
  return publicUser(account);
}

export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing else is required for a local demo sign-out.
  }
}

export async function registerDemoUser({ name, email, password }) {
  const cleanName = String(name || "").trim();
  const cleanEmail = normalizeEmail(email);
  const accounts = readAccounts();
  if (accounts.some((item) => normalizeEmail(item.email) === cleanEmail)) {
    throw new Error("An account with this email already exists in this browser. Try logging in.");
  }

  const account = {
    id: `user-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash: await hashPassword(cleanEmail, password),
    createdAt: new Date().toISOString(),
  };
  writeAccounts([...accounts, account]);
  saveSession(cleanEmail);
  return publicUser(account);
}

export async function loginDemoUser({ email, password }) {
  const cleanEmail = normalizeEmail(email);
  const accounts = readAccounts();
  let account = accounts.find((item) => normalizeEmail(item.email) === cleanEmail);

  if (!account && cleanEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
    account = {
      id: "user-demo",
      name: "Reelio Demo Lead",
      email: DEMO_EMAIL,
      passwordHash: await hashPassword(DEMO_EMAIL, DEMO_PASSWORD),
      createdAt: "2026-10-22T00:00:00.000Z",
    };
    writeAccounts([...accounts, account]);
  }

  if (!account) {
    throw new Error("No demo account was found for that email. Create one or use the demo login.");
  }

  const passwordHash = await hashPassword(cleanEmail, password);
  if (passwordHash !== account.passwordHash) {
    throw new Error("The password does not match this demo account.");
  }

  saveSession(cleanEmail);
  return publicUser(account);
}

export function createSeedWorkspace(user) {
  const owner = user?.name || "Reelio workspace";
  return {
    version: 1,
    owner,
    clients: [
      {
        id: "client-rithm",
        name: "Rithm Cafe",
        niche: "Cafe · Hyderabad",
        stage: "Launch sprint",
        health: "On track",
        progress: 86,
        nextStep: "Approve Diwali reel cover frame",
        deliverables: "4 reels · 6 stories",
      },
      {
        id: "client-savana",
        name: "Savana",
        niche: "Beauty & fashion",
        stage: "Creator PR",
        health: "Needs input",
        progress: 72,
        nextStep: "Confirm creator shortlist",
        deliverables: "3 creator posts · 1 live session",
      },
      {
        id: "client-casa",
        name: "Casa Verde",
        niche: "Restaurant",
        stage: "Content engine",
        health: "On track",
        progress: 64,
        nextStep: "Shoot weekend chef special",
        deliverables: "2 reels · menu photography",
      },
      {
        id: "client-northline",
        name: "Northline Fitness",
        niche: "Fitness studio",
        stage: "Lead campaign",
        health: "In review",
        progress: 58,
        nextStep: "Review trial-class ad copy",
        deliverables: "3 ad creatives · landing clip",
      },
    ],
    contentItems: [
      {
        id: "content-1",
        title: "Barista pours the signature Diwali latte",
        client: "Rithm Cafe",
        format: "Reel",
        due: "Today · 4:00 PM",
        status: "Review",
        owner: "Content lead",
      },
      {
        id: "content-2",
        title: "Three looks, one festive edit",
        client: "Savana",
        format: "Creator reel",
        due: "Tomorrow · 11:00 AM",
        status: "Editing",
        owner: "Editor",
      },
      {
        id: "content-3",
        title: "Chef plates the weekend special",
        client: "Casa Verde",
        format: "Reel",
        due: "Friday · 6:30 PM",
        status: "Filming",
        owner: "Shoot team",
      },
      {
        id: "content-4",
        title: "Member transformation: first 30 days",
        client: "Northline Fitness",
        format: "Testimonial clip",
        due: "Saturday · 9:00 AM",
        status: "Scripting",
        owner: "Strategist",
      },
      {
        id: "content-5",
        title: "New menu carousel: five plates in five seconds",
        client: "Casa Verde",
        format: "Carousel",
        due: "Sunday · 12:00 PM",
        status: "Scheduled",
        owner: "Designer",
      },
      {
        id: "content-6",
        title: "Creator unboxing and first impression",
        client: "Savana",
        format: "Story set",
        due: "Monday · 3:00 PM",
        status: "Idea",
        owner: "Outreach lead",
      },
    ],
    campaigns: [
      {
        id: "campaign-1",
        name: "Festive Footfall Sprint",
        client: "Rithm Cafe",
        objective: "Turn weekend reach into cafe visits and menu enquiries.",
        budget: 75000,
        spent: 45750,
        reach: "482K",
        leads: 318,
        status: "Active",
        progress: 61,
      },
      {
        id: "campaign-2",
        name: "Creator Seeding Wave",
        client: "Savana",
        objective: "Build social proof through local creator first impressions.",
        budget: 40000,
        spent: 18400,
        reach: "216K",
        leads: 142,
        status: "Paused",
        progress: 46,
      },
      {
        id: "campaign-3",
        name: "Trial Class Lead Push",
        client: "Northline Fitness",
        objective: "Promote a limited trial offer with short trainer-led clips.",
        budget: 55000,
        spent: 31900,
        reach: "354K",
        leads: 264,
        status: "Active",
        progress: 58,
      },
    ],
    tasks: [
      { id: "task-1", label: "Approve Rithm Cafe reel cover", done: false },
      { id: "task-2", label: "Send Savana creator shortlist", done: false },
      { id: "task-3", label: "Confirm Casa Verde shoot call time", done: true },
      { id: "task-4", label: "Review Northline ad copy", done: false },
    ],
    activity: [
      "Content calendar seeded with six production items.",
      "Festive Footfall Sprint moved into active delivery.",
      "Casa Verde shoot checklist marked ready.",
      "Creator Seeding Wave paused for client input.",
    ],
  };
}

export function loadWorkspace(user) {
  if (!user?.email) return createSeedWorkspace(user);
  const key = `${WORKSPACE_PREFIX}${normalizeEmail(user.email)}`;
  const saved = readJson(key, null);
  if (saved?.version === 1 && Array.isArray(saved.clients)) return saved;
  const seeded = createSeedWorkspace(user);
  writeJson(key, seeded);
  return seeded;
}

export function saveWorkspace(user, workspace) {
  if (!user?.email) return;
  writeJson(`${WORKSPACE_PREFIX}${normalizeEmail(user.email)}`, workspace);
}

export function saveEnquiry(enquiry) {
  const existing = readJson(ENQUIRIES_KEY, []);
  const next = Array.isArray(existing) ? [...existing, enquiry] : [enquiry];
  writeJson(ENQUIRIES_KEY, next);
  return next.length;
}

export function inr(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}
