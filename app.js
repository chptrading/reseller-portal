const { useState, useEffect, useRef, useContext, createContext } = React;

// =====================================================================
// CONFIG — fill these in before hosting
// =====================================================================

// Gemini is called through the server-side API route.
// IMPORTANT: never put the Gemini API key in this browser file.
//
// After deploying the backend, replace this URL with your backend URL.
// Example: https://your-project.vercel.app/api/gemini
const GEMINI_API_URL = "/api/gemini";
const GEMINI_MODEL = "gemini-3.6-flash";

// Get this from Firebase Console -> Project settings -> General -> Your apps -> SDK setup and config
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDZkYEGp0cUE0tu4qUivfRRo_c9wCufQEA",
  authDomain: "vinted-sales-proj.firebaseapp.com",
  projectId: "vinted-sales-proj",
  storageBucket: "vinted-sales-proj.firebasestorage.app",
  messagingSenderId: "718298819830",
  appId: "1:718298819830:web:69817798c4e0d8a46a90d7",
};

// =====================================================================

firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();
const auth = firebase.auth();
const sharedDocRef = db.collection("resellerApp").doc("sharedData");
const inventoryColRef = sharedDocRef.collection("inventory");

// ---------- Design tokens ----------
const LIGHT = {
  primary: "#1B5FE0",
  primaryDark: "#0F3E9E",
  primaryLight: "#EAF1FF",
  bg: "#F4F7FC",
  card: "#FFFFFF",
  text: "#0E2440",
  muted: "#5B7192",
  border: "#DCE6F5",
  yellow: "#B8860B",
  yellowBg: "#FFF6DE",
  yellowBorder: "#F0D896",
  green: "#127A4E",
  greenBg: "#E3F7ED",
  greenBorder: "#9BDDBA",
  red: "#C23B3B",
  redBg: "#FDEBEB",
  redBorder: "#F0B4B4",
  lincoln: "#7A3FB8",
  lincolnBg: "#F1E9FB",
  lincolnBorder: "#D9C4F0",
  shadow: "0 1px 2px rgba(15,62,158,0.04)",
  overlay: "rgba(14,36,64,0.45)",
};

const DARK = {
  primary: "#5B93FF",
  primaryDark: "#0A162B",
  primaryLight: "#182A4A",
  bg: "#0A0F1C",
  card: "#121A2C",
  text: "#EAF0FC",
  muted: "#93A6C6",
  border: "#233252",
  yellow: "#E3BA5E",
  yellowBg: "#3A2E11",
  yellowBorder: "#5C4A1D",
  green: "#4FD397",
  greenBg: "#0F2E22",
  greenBorder: "#1E5B3F",
  red: "#F17B78",
  redBg: "#3A1717",
  redBorder: "#5C2626",
  lincoln: "#C29BF2",
  lincolnBg: "#251A3D",
  lincolnBorder: "#3E2C60",
  shadow: "0 1px 2px rgba(0,0,0,0.3)",
  overlay: "rgba(0,0,0,0.6)",
};

// ---------- Theme context ----------
const ThemeContext = createContext({ C: LIGHT, dark: false });
function useTheme() {
  const { C, dark } = useContext(ThemeContext);
  const S = {
    input: {
      width: "100%", padding: "9px 12px", borderRadius: 8,
      border: `1px solid ${C.border}`, fontSize: 14, color: C.text,
      background: C.card, outline: "none", boxSizing: "border-box",
    },
    label: { fontSize: 12.5, fontWeight: 600, color: C.muted, marginBottom: 5, display: "block" },
    btnPrimary: {
      background: C.primary, color: "#fff", border: "none", borderRadius: 8,
      padding: "9px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 6,
    },
    btnGhost: {
      background: C.card, color: C.primary, border: `1px solid ${C.border}`, borderRadius: 8,
      padding: "9px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 6,
    },
    card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadow },
  };
  return { C, S, dark };
}

// ---------- iOS safe-area helpers ----------
const SAFE_TOP = "env(safe-area-inset-top, 0px)";
const SAFE_BOTTOM = "env(safe-area-inset-bottom, 0px)";
const SAFE_LEFT = "env(safe-area-inset-left, 0px)";
const SAFE_RIGHT = "env(safe-area-inset-right, 0px)";

// ---------- Icons (Font Awesome wrapper, replaces lucide-react) ----------
function Icon({ name, size = 16, color, style = {} }) {
  return (
    <i
      className={name}
      style={{
        fontSize: size, color, width: size, display: "inline-flex",
        alignItems: "center", justifyContent: "center", lineHeight: 1, ...style,
      }}
    />
  );
}
const LayoutDashboard = (p) => <Icon name="fa-solid fa-table-columns" {...p} />;
const TrendingUp = (p) => <Icon name="fa-solid fa-arrow-trend-up" {...p} />;
const Receipt = (p) => <Icon name="fa-solid fa-receipt" {...p} />;
const Package = (p) => <Icon name="fa-solid fa-box" {...p} />;
const Sparkles = (p) => <Icon name="fa-solid fa-wand-magic-sparkles" {...p} />;
const ScanLine = (p) => <Icon name="fa-solid fa-barcode" {...p} />;
const Boxes = (p) => <Icon name="fa-solid fa-boxes-stacked" {...p} />;
const CheckCircle2 = (p) => <Icon name="fa-solid fa-circle-check" {...p} />;
const ShieldCheck = (p) => <Icon name="fa-solid fa-shield-halved" {...p} />;
const SettingsIcon = (p) => <Icon name="fa-solid fa-gear" {...p} />;
const LogOut = (p) => <Icon name="fa-solid fa-right-from-bracket" {...p} />;
const Plus = (p) => <Icon name="fa-solid fa-plus" {...p} />;
const Pencil = (p) => <Icon name="fa-solid fa-pen" {...p} />;
const Trash2 = (p) => <Icon name="fa-solid fa-trash" {...p} />;
const X = (p) => <Icon name="fa-solid fa-xmark" {...p} />;
const Upload = (p) => <Icon name="fa-solid fa-upload" {...p} />;
const Copy = (p) => <Icon name="fa-solid fa-copy" {...p} />;
const Check = (p) => <Icon name="fa-solid fa-check" {...p} />;
const AlertTriangle = (p) => <Icon name="fa-solid fa-triangle-exclamation" {...p} />;
const ExternalLink = (p) => <Icon name="fa-solid fa-arrow-up-right-from-square" {...p} />;
const Menu = (p) => <Icon name="fa-solid fa-bars" {...p} />;
const Monitor = (p) => <Icon name="fa-solid fa-desktop" {...p} />;
const Smartphone = (p) => <Icon name="fa-solid fa-mobile-screen" {...p} />;
const Wallet = (p) => <Icon name="fa-solid fa-wallet" {...p} />;
const RefreshCw = (p) => <Icon name="fa-solid fa-arrows-rotate" {...p} />;
const Search = (p) => <Icon name="fa-solid fa-magnifying-glass" {...p} />;
const Moon = (p) => <Icon name="fa-solid fa-moon" {...p} />;
const Sun = (p) => <Icon name="fa-solid fa-sun" {...p} />;
const MessageSquare = (p) => <Icon name="fa-solid fa-comment" {...p} />;
const ArchiveIcon = (p) => <Icon name="fa-solid fa-box-archive" {...p} />;
const Tag = (p) => <Icon name="fa-solid fa-tag" {...p} />;
const UserCircle2 = (p) => <Icon name="fa-solid fa-circle-user" {...p} />;
const ListChecks = (p) => <Icon name="fa-solid fa-list-check" {...p} />;
const CloudSun = (p) => <Icon name="fa-solid fa-cloud-sun" {...p} />;

function statusMeta(C) {
  return {
    listed: { label: "Listed", color: C.yellow, bg: C.yellowBg, border: C.yellowBorder },
    sold: { label: "Sold", color: C.green, bg: C.greenBg, border: C.greenBorder },
    ready: { label: "Ready to List", color: C.red, bg: C.redBg, border: C.redBorder },
  };
}
function packageMeta(C) {
  return {
    waiting: { label: "Waiting to Package", color: C.red, bg: C.redBg, border: C.redBorder },
    packaged: { label: "Packaged", color: C.yellow, bg: C.yellowBg, border: C.yellowBorder },
    shipped: { label: "Shipped", color: C.green, bg: C.greenBg, border: C.greenBorder },
  };
}
function ownerMeta(C) {
  return {
    Charlie: { label: "Charlie", color: C.primary, bg: C.primaryLight, border: C.border },
    Lincoln: { label: "Lincoln", color: C.lincoln, bg: C.lincolnBg, border: C.lincolnBorder },
    Both: { label: "Shared 50/50", color: C.muted, bg: C.bg, border: C.border },
  };
}

const CATEGORY_OPTIONS = [
  "Women's Tops", "Women's Dresses", "Women's Bottoms", "Women's Outerwear",
  "Men's Tops", "Men's Bottoms", "Men's Outerwear",
  "Kids' Clothing", "Shoes", "Bags & Accessories", "Jewellery", "Other",
];

const QUOTES = [
  "Every bale is a story waiting to be sold.",
  "Small daily wins build a big resale business.",
  "The best photo you take is the sale you make.",
  "Sort today, ship tomorrow, profit always.",
  "A clean listing sells itself.",
  "Consistency beats a lucky bale every time.",
  "Your next best seller is still in the bag.",
  "Price it fair, describe it honest, sell it fast.",
  "Turnover is vanity, profit is sanity.",
  "Good stock, good photos, good money.",
  "Every item priced right is a problem solved.",
  "The bale doesn't know its value — you decide it.",
  "Slow and steady sells the wardrobe.",
  "Reselling rewards the organised.",
  "One more listing, one step closer.",
  "Fold it, shoot it, list it, done.",
  "Margins are made at the buying stage.",
  "A tidy inventory is a profitable inventory.",
  "Today's effort is tomorrow's payout.",
  "Great descriptions sell the story, not just the item.",
  "Ship fast, get repeat buyers.",
  "Every sold tag is proof the system works.",
  "Know your numbers, grow your business.",
  "Authenticity checked once saves a refund later.",
  "The best time to list was this morning. The next best time is now.",
];

// ---------- Date helpers (Europe/London aware) ----------
function ukDateString() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}
function londonISODate(offsetDays = 0) {
  const now = new Date(Date.now() + offsetDays * 86400000);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year").value;
  const m = parts.find((p) => p.type === "month").value;
  const d = parts.find((p) => p.type === "day").value;
  return `${y}-${m}-${d}`;
}
function daysBetweenISO(a, b) {
  if (!a || !b) return 0;
  const d1 = new Date(a + "T00:00:00Z");
  const d2 = new Date(b + "T00:00:00Z");
  return Math.round((d2 - d1) / 86400000);
}
function dailyQuote() {
  const s = ukDateString();
  let sum = 0;
  for (const c of s) sum += c.charCodeAt(0);
  return QUOTES[sum % QUOTES.length];
}
function fmtMoney(n) {
  const v = Number(n) || 0;
  return `£${v.toFixed(2)}`;
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}
function isArchived(item) {
  if (!item) return false;
  if (item.archived) return true;
  if (item.packageStatus !== "shipped" || !item.dateShipped) return false;
  return daysBetweenISO(item.dateShipped, londonISODate(0)) >= 21;
}

function resizeImage(file, maxWidth = 700, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- Gemini API call (replaces callClaude) ----------
async function callGemini(promptText, images = [], jsonMode = false) {
  const parts = [];

  for (const img of images) {
    const match = img.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) continue;
    parts.push({
      inline_data: {
        mime_type: match[1],
        data: match[2],
      },
    });
  }

  parts.push({ text: promptText });

  const body = {
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts }],
    jsonMode,
  };

  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`AI server returned HTTP ${res.status}`);
  }

  if (!res.ok || data.error) {
    throw new Error(data.error || `AI server returned HTTP ${res.status}`);
  }

  if (!data.text) throw new Error("No response from AI");
  return data.text.trim();
}

// Revenue attributed to a given person for a sold item, splitting
// "Both"-owned items 50/50. Items without an owner set (legacy data)
// are treated as shared/Both.
function revenueShare(item, person) {
  const sp = Number(item.soldPrice ?? item.price) || 0;
  const owner = item.owner || "Both";
  if (owner === person) return sp;
  if (owner === "Both") return sp / 2;
  return 0;
}

const DEFAULT_DATA = {
  profiles: {}, // email -> { displayName }
  inventory: [],
  bales: [],
  expenses: [],
  payout: { baselineDate: null, balance: 0 },
  settings: { darkMode: false },
  taskCompletions: {}, // `${dateISO}|${itemId}|${type}` -> true
  messages: [], // { id, author, text, date }
  templates: [], // { id, name, text }
  seasonalInsight: { text: "", generatedAt: null },
};

// ---------- Small UI primitives ----------
function Field({ label, children }) {
  const { S } = useTheme();
  return <div style={{ marginBottom: 14 }}><span style={S.label}>{label}</span>{children}</div>;
}

function Badge({ meta }) {
  return (
    <span style={{
      background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
      padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
      whiteSpace: "nowrap",
    }}>{meta.label}</span>
  );
}

function Modal({ title, onClose, children, wide }) {
  const { C } = useTheme();
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: C.overlay,
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
      padding: 16,
      paddingTop: `max(16px, ${SAFE_TOP})`,
      paddingBottom: `max(16px, ${SAFE_BOTTOM})`,
      paddingLeft: `max(16px, ${SAFE_LEFT})`,
      paddingRight: `max(16px, ${SAFE_RIGHT})`,
      boxSizing: "border-box",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.card, borderRadius: 16, width: "100%", maxWidth: wide ? 680 : 460,
        maxHeight: "calc(100dvh - max(24px, var(--safe-top, 0px)) - max(24px, var(--safe-bottom, 0px)) - 20px)",
        height: "auto", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        display: "flex", flexDirection: "column", boxSizing: "border-box",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0,
          background: C.card, borderRadius: "16px 16px 0 0",
        }}>
          <h3 style={{ margin: 0, fontSize: 16, color: C.text, fontFamily: "Sora, sans-serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 6 }}>
            <X size={20} />
          </button>
        </div>
        <div style={{
          padding: "20px 20px max(28px, env(safe-area-inset-bottom, 28px))",
          overflowY: "auto", WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain", minHeight: 0, boxSizing: "border-box",
        }}>{children}</div>
      </div>
    </div>
  );
}

function PhotoPicker({ photos, setPhotos, multiple = true }) {
  const { C } = useTheme();
  const ref = useRef(null);
  const onPick = async (e) => {
    const files = Array.from(e.target.files || []);
    const resized = await Promise.all(files.map((f) => resizeImage(f)));
    setPhotos(multiple ? [...photos, ...resized] : resized.slice(0, 1));
    e.target.value = "";
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        {photos.map((p, i) => (
          <div key={i} style={{ position: "relative" }}>
            <img src={p} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />
            <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} style={{
              position: "absolute", top: -6, right: -6, background: C.red, color: "#fff",
              border: "2px solid #fff", borderRadius: "50%", width: 20, height: 20, fontSize: 12,
              cursor: "pointer", lineHeight: "16px",
            }}>×</button>
          </div>
        ))}
        <button onClick={() => ref.current.click()} style={{
          width: 64, height: 64, borderRadius: 8, border: `1.5px dashed ${C.border}`,
          background: C.primaryLight, color: C.primary, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><Upload size={18} /></button>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple={multiple} onChange={onPick} style={{ display: "none" }} />
    </div>
  );
}

// ---------- Login ----------
function LoginScreen() {
  const { C } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const submit = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError("");
    setResetSent(false);
    try {
      await auth.signInWithEmailAndPassword(cleanEmail, password);
    } catch (e) {
      const messages = {
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/user-not-found": "Incorrect email or password.",
        "auth/wrong-password": "Incorrect email or password.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please wait and try again.",
        "auth/user-disabled": "This account has been disabled.",
      };
      setError(messages[e.code] || e.message || "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Enter your email address first, then click Forgot password.");
      return;
    }
    try {
      await auth.sendPasswordResetEmail(cleanEmail);
      setError("");
      setResetSent(true);
    } catch (e) {
      setResetSent(false);
      setError(e.code === "auth/user-not-found"
        ? "No Firebase Authentication account exists for that email."
        : (e.message || "Unable to send the reset email."));
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div style={{
      minHeight: "100vh", background: `linear-gradient(160deg, ${C.primaryDark}, ${C.primary})`,
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
      padding: 16,
      paddingTop: `max(16px, ${SAFE_TOP})`,
      paddingBottom: `max(16px, ${SAFE_BOTTOM})`,
      paddingLeft: `max(16px, ${SAFE_LEFT})`,
      paddingRight: `max(16px, ${SAFE_RIGHT})`,
    }}>
      <div style={{
        background: C.card, borderRadius: 18, padding: "36px 32px", width: "100%", maxWidth: 380,
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)", boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: C.primary, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800,
            fontFamily: "Sora, sans-serif", fontSize: 18,
          }}>V</div>
          <div>
            <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 17, color: C.text }}>Reseller Portal</div>
            <div style={{ fontSize: 12, color: C.muted }}>Sign in to continue</div>
          </div>
        </div>
        <Field label="Email">
          <input style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.text, background: C.card, outline: "none", boxSizing: "border-box" }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={onKeyDown} autoComplete="email" />
        </Field>
        <Field label="Password">
          <input style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.text, background: C.card, outline: "none", boxSizing: "border-box" }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKeyDown} autoComplete="current-password" />
        </Field>
        {error && <div style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {resetSent && <div style={{ color: C.green, fontSize: 13, marginBottom: 12 }}>Password reset email sent.</div>}
        <button type="button" onClick={submit} disabled={busy} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontSize: 14, fontWeight: 600, cursor: busy ? "wait" : "pointer", width: "100%", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Signing in..." : "Log in"}
        </button>
        <button type="button" onClick={resetPassword} style={{ background: "none", border: "none", color: C.primary, fontSize: 12.5, cursor: "pointer", width: "100%", marginTop: 12 }}>
          Forgot password?
        </button>
      </div>
    </div>
  );
}

// ---------- Sidebar ----------
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pnl", label: "Profit and Loss", icon: TrendingUp },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "balepnl", label: "Per Bale PnL", icon: Package },
  { id: "payout", label: "Payout", icon: Wallet },
  { id: "ai", label: "Ai Descriptions", icon: Sparkles },
  { id: "scanner", label: "Price Scanner", icon: ScanLine },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "sold", label: "Sold Items", icon: CheckCircle2 },
  { id: "labels", label: "Label Printing", icon: Tag },
  { id: "templates", label: "Messaging Templates", icon: MessageSquare },
  { id: "archive", label: "Archive", icon: ArchiveIcon },
  { id: "auth", label: "Authentication Help", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function displayNameFor(data, email) {
  const p = data.profiles && data.profiles[email];
  return (p && p.displayName) ? p.displayName : email;
}

function Sidebar({ active, setActive, currentUser, data, onLogout, isDrawer, onClose }) {
  const { C } = useTheme();
  return (
    <div style={{
      width: 232, minWidth: 232, background: C.primaryDark, color: "#fff",
      display: "flex", flexDirection: "column", boxSizing: "border-box",
      height: isDrawer ? "100%" : "auto",
      padding: "20px 12px",
      paddingTop: `max(20px, ${SAFE_TOP})`,
      paddingBottom: `max(20px, ${SAFE_BOTTOM})`,
      paddingLeft: `max(12px, ${SAFE_LEFT})`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: "#fff", color: C.primaryDark,
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800,
            fontFamily: "Sora, sans-serif", fontSize: 16,
          }}>V</div>
          <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 15.5 }}>Reseller Portal</div>
        </div>
        {isDrawer && (
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 6 }}>
            <X size={20} />
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {TABS.map((t) => {
          const IconComp = t.icon;
          const isActive = active === t.id;
          return (
            <button key={t.id} onClick={() => { setActive(t.id); if (isDrawer) onClose(); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", marginBottom: 3, borderRadius: 9, border: "none",
              background: isActive ? "rgba(255,255,255,0.14)" : "transparent",
              color: isActive ? "#fff" : "rgba(255,255,255,0.72)",
              fontSize: 13.5, fontWeight: isActive ? 700 : 500, cursor: "pointer", textAlign: "left",
            }}>
              <IconComp size={17} />{t.label}
            </button>
          );
        })}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 12, marginTop: 12 }}>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", padding: "0 8px 8px" }}>{displayNameFor(data, currentUser)}</div>
        <button onClick={onLogout} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
          borderRadius: 9, border: "none", background: "rgba(255,255,255,0.08)", color: "#fff",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}><LogOut size={15} /> Log out</button>
      </div>
    </div>
  );
}

function TopBar({ mode, setMode, onMenuClick, title, dark, onToggleDark }) {
  const { C } = useTheme();
  const toggleBtn = (isOn) => ({
    border: "none", borderRadius: 6, padding: "6px 9px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: isOn ? C.primary : "transparent", color: isOn ? "#fff" : C.primary,
  });
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {mode === "mobile" && (
          <button onClick={onMenuClick} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 8,
            cursor: "pointer", color: C.text, flexShrink: 0,
          }}><Menu size={19} /></button>
        )}
        <div style={{
          fontFamily: "Sora, sans-serif", fontWeight: 800, color: C.text,
          fontSize: mode === "mobile" ? 17 : 20, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{title}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <button title={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={onToggleDark} style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 9px",
          cursor: "pointer", color: C.primary, display: "flex", alignItems: "center",
        }}>{dark ? <Sun size={15} /> : <Moon size={15} />}</button>
        <div style={{ display: "flex", gap: 3, background: C.primaryLight, padding: 3, borderRadius: 8 }}>
          <button title="Desktop mode" onClick={() => setMode("desktop")} style={toggleBtn(mode === "desktop")}><Monitor size={15} /></button>
          <button title="Mobile mode" onClick={() => setMode("mobile")} style={toggleBtn(mode === "mobile")}><Smartphone size={15} /></button>
        </div>
      </div>
    </div>
  );
}

// ---------- Daily tasks (Overview) ----------
function buildDailyTasks(data) {
  const today = londonISODate(0);
  const tasks = [];
  data.inventory.forEach((item) => {
    if (isArchived(item)) return;
    if (item.status === "sold" && item.packageStatus !== "shipped" && item.dateSold) {
      const age = daysBetweenISO(item.dateSold, today);
      if (age >= 1) {
        const key = `${item.id}|ship`;
        const urgent = age >= 3;
        tasks.push({
          key, itemId: item.id, type: "ship",
          title: `Ship: ${item.title || "Untitled item"}`,
          subtitle: urgent
            ? `Day ${age} unshipped — URGENT: ship today or relist this item`
            : `Day ${age} since sold — ship this out`,
          urgent,
          done: !!data.taskCompletions[`${today}|${key}`],
        });
      }
    }
    if (item.status === "listed") {
      const listedSince = item.dateListed || item.dateAdded || today;
      const age = daysBetweenISO(listedSince, today);
      if (age >= 3) {
        const key = `${item.id}|relist`;
        tasks.push({
          key, itemId: item.id, type: "relist",
          title: `Relist: ${item.title || "Untitled item"}`,
          subtitle: `Listed ${age} days ago with no sale — refresh photos or price`,
          urgent: age >= 7,
          done: !!data.taskCompletions[`${today}|${key}`],
        });
      }
    }
  });
  tasks.sort((a, b) => (b.urgent === a.urgent ? 0 : b.urgent ? 1 : -1));
  return tasks;
}

function DailyTasksCard({ data, setData }) {
  const { C, S } = useTheme();
  const tasks = buildDailyTasks(data);
  const toggleTask = (task) => {
    setData((d) => {
      const today = londonISODate(0);
      const ckey = `${today}|${task.key}`;
      const wasDone = !!d.taskCompletions[ckey];
      const taskCompletions = { ...d.taskCompletions, [ckey]: !wasDone };
      let inventory = d.inventory;
      if (!wasDone) {
        inventory = d.inventory.map((i) => {
          if (i.id !== task.itemId) return i;
          if (task.type === "ship") return { ...i, packageStatus: "shipped", dateShipped: today };
          if (task.type === "relist") return { ...i, dateListed: today };
          return i;
        });
      }
      return { ...d, taskCompletions, inventory };
    });
  };
  return (
    <div style={{ ...S.card, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <ListChecks size={17} color={C.primary} />
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, color: C.text }}>Today's tasks</div>
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
        Resets at midnight. Unticked tasks carry over — shipping tasks turn urgent on day 3.
      </div>
      {tasks.length === 0 && <div style={{ fontSize: 13.5, color: C.muted }}>Nothing outstanding — nice work!</div>}
      {tasks.map((t) => (
        <label key={t.key} style={{
          display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 10px", borderRadius: 9,
          marginBottom: 6, cursor: "pointer",
          background: t.urgent ? C.redBg : C.bg,
          border: `1px solid ${t.urgent ? C.redBorder : C.border}`,
        }}>
          <input type="checkbox" checked={t.done} onChange={() => toggleTask(t)} style={{ width: 16, height: 16, marginTop: 2, cursor: "pointer" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.urgent ? C.red : C.text, display: "flex", alignItems: "center", gap: 6 }}>
              {t.urgent && <AlertTriangle size={13} />} {t.title}
            </div>
            <div style={{ fontSize: 12, color: t.urgent ? C.red : C.muted, marginTop: 1 }}>{t.subtitle}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

// ---------- Message board (Overview) ----------
function MessageBoardCard({ data, setData, currentUser }) {
  const { C, S } = useTheme();
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    const msg = { id: genId(), author: displayNameFor(data, currentUser), text: text.trim(), date: new Date().toISOString() };
    setData((d) => ({ ...d, messages: [msg, ...(d.messages || [])] }));
    setText("");
  };
  const remove = (id) => setData((d) => ({ ...d, messages: d.messages.filter((m) => m.id !== id) }));
  const messages = data.messages || [];
  return (
    <div style={{ ...S.card, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <MessageSquare size={17} color={C.primary} />
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, color: C.text }}>Notes to each other</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input style={S.input} placeholder="Leave a message or to-do…" value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()} />
        <button style={S.btnPrimary} onClick={add}><Plus size={15} /></button>
      </div>
      <div style={{ maxHeight: 210, overflowY: "auto" }}>
        {messages.length === 0 && <div style={{ fontSize: 13, color: C.muted }}>No messages yet.</div>}
        {messages.map((m) => (
          <div key={m.id} style={{ padding: "8px 0", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div>
              <div style={{ fontSize: 13.5, color: C.text }}>{m.text}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{m.author} · {new Date(m.date).toLocaleString("en-GB")}</div>
            </div>
            <button onClick={() => remove(m.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", flexShrink: 0 }}><X size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Seasonal trends (Overview) ----------
function SeasonalTrendsCard({ data, setData }) {
  const { C, S } = useTheme();
  const [loading, setLoading] = useState(false);
  const insight = data.seasonalInsight || { text: "", generatedAt: null };
  const refresh = async () => {
    setLoading(true);
    try {
      const month = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", month: "long" }).format(new Date());
      const prompt = `You are a second-hand clothing resale market analyst for a UK-based Vinted/eBay reseller. It is currently ${month}. Based on your general knowledge of seasonal demand patterns in the UK second-hand clothing market, give:
1. The 3-4 categories/item types that typically sell best right now this time of year
2. 1-2 categories to avoid overstocking on right now
3. One quick actionable tip for this month
Be clear this is a general seasonal pattern estimate from training knowledge, not live sales data. Keep it under 120 words, plain text, no headers with markdown symbols.`;
      const text = await callGemini(prompt, []);
      setData((d) => ({ ...d, seasonalInsight: { text, generatedAt: new Date().toISOString() } }));
    } catch (e) {
      setData((d) => ({ ...d, seasonalInsight: { text: "Couldn't generate an insight right now — try again shortly.", generatedAt: new Date().toISOString() } }));
    }
    setLoading(false);
  };
  return (
    <div style={{ ...S.card, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CloudSun size={17} color={C.primary} />
          <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, color: C.text }}>Seasonal trends</div>
        </div>
        <button style={S.btnGhost} onClick={refresh} disabled={loading}><RefreshCw size={13} /> {loading ? "Thinking…" : "Refresh"}</button>
      </div>
      {insight.text ? (
        <>
          <div style={{ whiteSpace: "pre-wrap", fontSize: 13.5, color: C.text, lineHeight: 1.5 }}>{insight.text}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
            AI estimate from general market knowledge, not live sold-listing data. Generated {new Date(insight.generatedAt).toLocaleString("en-GB")}.
          </div>
        </>
      ) : <div style={{ fontSize: 13, color: C.muted }}>Press refresh to get an AI read on what's selling best this month.</div>}
    </div>
  );
}

// ---------- Overview ----------
function OverviewTab({ data, setData, currentUser }) {
  const { C, S } = useTheme();
  const inv = data.inventory;
  const counts = {
    listed: inv.filter((i) => i.status === "listed").length,
    sold: inv.filter((i) => i.status === "sold").length,
    ready: inv.filter((i) => i.status === "ready").length,
  };
  const revenue30 = inv
    .filter((i) => i.status === "sold" && i.dateSold && (Date.now() - new Date(i.dateSold).getTime()) < 30 * 86400000)
    .reduce((s, i) => s + (Number(i.soldPrice) || 0), 0);

  const yesterday = londonISODate(-1);
  const yesterdaySold = inv.filter((i) => i.status === "sold" && i.dateSold === yesterday);
  const yesterdayRevenue = yesterdaySold.reduce((s, i) => s + (Number(i.soldPrice ?? i.price) || 0), 0);

  const name = displayNameFor(data, currentUser);

  return (
    <div>
      <div style={{
        ...S.card, background: `linear-gradient(120deg, ${C.primary}, ${C.primaryDark})`, color: "#fff",
        padding: "26px 28px", marginBottom: 20, border: "none",
      }}>
        <div style={{ fontSize: 12.5, letterSpacing: 0.5, opacity: 0.8, marginBottom: 8, textTransform: "uppercase" }}>
          Welcome back, {name} · Quote of the day
        </div>
        <div style={{ fontFamily: "Sora, sans-serif", fontSize: 21, fontWeight: 700, lineHeight: 1.4, maxWidth: 640 }}>"{dailyQuote()}"</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        {[
          ["Ready to List", counts.ready, C.red],
          ["Listed", counts.listed, C.yellow],
          ["Sold", counts.sold, C.green],
          ["Revenue (30d)", fmtMoney(revenue30), C.primary],
          [`Sales (${yesterday})`, `${yesterdaySold.length} · ${fmtMoney(yesterdayRevenue)}`, C.lincoln],
        ].map(([label, val, color]) => (
          <div key={label} style={{ ...S.card, padding: "18px 20px" }}>
            <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "Sora, sans-serif" }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 20 }}>
        <DailyTasksCard data={data} setData={setData} />
        <SeasonalTrendsCard data={data} setData={setData} />
        <MessageBoardCard data={data} setData={setData} currentUser={currentUser} />
      </div>

      <div style={{ ...S.card, padding: "20px 22px", marginTop: 20 }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 10, color: C.text }}>Total inventory</div>
        <div style={{ color: C.muted, fontSize: 14 }}>{inv.length} items tracked across {data.bales.length} bales.</div>
      </div>
    </div>
  );
}

// ---------- Simple SVG line chart (replaces recharts) ----------
function SimpleLineChart({ data, xKey, yKey, color, height = 260 }) {
  const { C } = useTheme();
  const padding = { top: 16, right: 16, bottom: 30, left: 56 };
  const width = 800;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  if (!data || data.length === 0) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height, color: C.muted, fontSize: 13 }}>No sales in this range yet.</div>;
  }

  const values = data.map((d) => Number(d[yKey]) || 0);
  const maxV = Math.max(...values, 1);
  const minV = 0;
  const xStep = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padding.left + (data.length > 1 ? i * xStep : innerW / 2);
    const y = padding.top + innerH - ((Number(d[yKey]) || 0) - minV) / (maxV - minV || 1) * innerH;
    return { x, y, label: d[xKey], value: Number(d[yKey]) || 0 };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const yTicks = 4;
  const tickVals = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxV / yTicks) * i));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid meet">
      {tickVals.map((tv, i) => {
        const y = padding.top + innerH - (tv / (maxV || 1)) * innerH;
        return (
          <g key={i}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke={C.border} strokeWidth={1} />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={10.5} fill={C.muted}>{fmtMoney(tv)}</text>
          </g>
        );
      })}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill={color} />
          <title>{`${p.label}: ${fmtMoney(p.value)}`}</title>
        </g>
      ))}
      {points.map((p, i) => {
        if (points.length > 10 && i % Math.ceil(points.length / 8) !== 0) return null;
        return (
          <text key={i} x={p.x} y={height - padding.bottom + 18} textAnchor="middle" fontSize={10} fill={C.muted}>
            {p.label ? p.label.slice(5) : ""}
          </text>
        );
      })}
    </svg>
  );
}

// ---------- P&L ----------
function PnLTab({ data }) {
  const { C, S } = useTheme();
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); });
  const [to, setTo] = useState(todayISO());

  const soldInRange = data.inventory.filter((i) => i.status === "sold" && i.dateSold && i.dateSold >= from && i.dateSold <= to);
  const expensesInRange = data.expenses.filter((e) => e.date && e.date >= from && e.date <= to);

  const revenue = soldInRange.reduce((s, i) => s + (Number(i.soldPrice) || 0), 0);
  const cogs = soldInRange.reduce((s, i) => {
    let cost = Number(i.buyPrice) || 0;
    if (i.baleId) {
      const bale = data.bales.find((b) => b.id === i.baleId);
      if (bale && Number(bale.itemsReceived) > 0) cost = Number(bale.price) / Number(bale.itemsReceived);
    }
    return s + cost;
  }, 0);
  const expensesTotal = expensesInRange.reduce((s, e) => s + (Number(e.amount) || 0) * (Number(e.quantity) || 1), 0);
  const profit = revenue - cogs - expensesTotal;

  const charlieRevenue = soldInRange.reduce((s, i) => s + revenueShare(i, "Charlie"), 0);
  const lincolnRevenue = soldInRange.reduce((s, i) => s + revenueShare(i, "Lincoln"), 0);

  const byDay = {};
  soldInRange.forEach((i) => {
    byDay[i.dateSold] = byDay[i.dateSold] || { date: i.dateSold, revenue: 0 };
    byDay[i.dateSold].revenue += Number(i.soldPrice) || 0;
  });
  const chartData = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Field label="From"><input type="date" style={S.input} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="To"><input type="date" style={S.input} value={to} onChange={(e) => setTo(e.target.value)} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 20 }}>
        {[["Revenue", revenue, C.primary], ["Cost of goods", cogs, C.muted], ["Expenses", expensesTotal, C.muted], ["Profit", profit, profit >= 0 ? C.green : C.red]].map(([l, v, c]) => (
          <div key={l} style={{ ...S.card, padding: "16px 18px" }}>
            <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c, fontFamily: "Sora, sans-serif" }}>{fmtMoney(v)}</div>
          </div>
        ))}
      </div>

      <div style={{ ...S.card, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 4, color: C.text }}>Split revenue</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>Items owned by one person count fully towards them; items marked "Shared" are split 50/50, for the selected date range.</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ padding: "12px 14px", borderRadius: 10, background: C.primaryLight }}>
            <div style={{ fontSize: 12.5, color: C.primaryDark, fontWeight: 700, marginBottom: 6 }}>Charlie</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.primary, fontFamily: "Sora, sans-serif" }}>{fmtMoney(charlieRevenue)}</div>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 10, background: C.lincolnBg }}>
            <div style={{ fontSize: 12.5, color: C.lincoln, fontWeight: 700, marginBottom: 6 }}>Lincoln</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.lincoln, fontFamily: "Sora, sans-serif" }}>{fmtMoney(lincolnRevenue)}</div>
          </div>
        </div>
      </div>

      <div style={{ ...S.card, padding: "18px 20px", height: 320 }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 12, color: C.text }}>Revenue over time</div>
        <div style={{ height: "88%" }}>
          <SimpleLineChart data={chartData} xKey="date" yKey="revenue" color={C.primary} height={260} />
        </div>
      </div>
    </div>
  );
}

// ---------- Expenses ----------
function ExpensesTab({ data, setData, mode }) {
  const { C, S } = useTheme();
  const [modal, setModal] = useState(null);
  const save = (row) => {
    setData((d) => {
      const list = d.expenses.some((e) => e.id === row.id)
        ? d.expenses.map((e) => (e.id === row.id ? row : e))
        : [...d.expenses, row];
      return { ...d, expenses: list };
    });
    setModal(null);
  };
  const remove = (id) => setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
  const toggleSettled = (id) => setData((d) => ({
    ...d, expenses: d.expenses.map((e) => (e.id === id ? { ...e, settled: !e.settled } : e)),
  }));
  const total = data.expenses.reduce((s, e) => s + (Number(e.amount) || 0) * (Number(e.quantity) || 1), 0);

  const unsettled = data.expenses.filter((e) => !e.settled);
  const charliePaid = unsettled.filter((e) => e.paidBy === "Charlie").reduce((s, e) => s + (Number(e.amount) || 0) * (Number(e.quantity) || 1), 0);
  const lincolnPaid = unsettled.filter((e) => e.paidBy === "Lincoln").reduce((s, e) => s + (Number(e.amount) || 0) * (Number(e.quantity) || 1), 0);
  const diff = charliePaid - lincolnPaid;
  let balanceText = "Expenses are settled up";
  if (diff > 0.004) balanceText = `Lincoln owes Charlie ${fmtMoney(diff / 2)}`;
  else if (diff < -0.004) balanceText = `Charlie owes Lincoln ${fmtMoney(-diff / 2)}`;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ color: C.muted, fontSize: 14 }}>Total: <b style={{ color: C.text }}>{fmtMoney(total)}</b></div>
        <button style={S.btnPrimary} onClick={() => setModal({ id: genId(), name: "", amount: "", quantity: 1, who: "", date: todayISO(), paidBy: "Charlie", settled: false })}>
          <Plus size={16} /> Add expense
        </button>
      </div>
      <div style={{ ...S.card, overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: mode === "mobile" ? 680 : "auto", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: C.primaryLight, textAlign: "left" }}>
              {["Expense", "Amount", "Qty", "Who", "Paid by", "Date", "Paid off", ""].map((h) => (
                <th key={h} style={{ padding: "10px 14px", color: C.primaryDark, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.expenses.map((e) => (
              <tr key={e.id} style={{ borderTop: `1px solid ${C.border}`, opacity: e.settled ? 0.55 : 1 }}>
                <td style={{ padding: "10px 14px", color: C.text }}>{e.name}</td>
                <td style={{ padding: "10px 14px", color: C.text }}>{fmtMoney(e.amount)}</td>
                <td style={{ padding: "10px 14px", color: C.text }}>{e.quantity}</td>
                <td style={{ padding: "10px 14px", color: C.text }}>{e.who}</td>
                <td style={{ padding: "10px 14px", color: C.text }}>{e.paidBy || "—"}</td>
                <td style={{ padding: "10px 14px", color: C.text }}>{e.date}</td>
                <td style={{ padding: "10px 14px" }}>
                  <input type="checkbox" checked={!!e.settled} onChange={() => toggleSettled(e.id)} style={{ width: 16, height: 16, cursor: "pointer" }} />
                </td>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  <button onClick={() => setModal(e)} style={{ ...S.btnGhost, padding: "5px 8px", marginRight: 6 }}><Pencil size={13} /></button>
                  <button onClick={() => remove(e.id)} style={{ ...S.btnGhost, padding: "5px 8px", color: C.red }}><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
            {data.expenses.length === 0 && <tr><td colSpan={8} style={{ padding: 20, textAlign: "center", color: C.muted }}>No expenses yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {modal && (
        <Modal title={data.expenses.some((e) => e.id === modal.id) ? "Edit expense" : "Add expense"} onClose={() => setModal(null)}>
          <Field label="Expense"><input style={S.input} value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></Field>
          <Field label="Amount (£)"><input type="number" step="0.01" style={S.input} value={modal.amount} onChange={(e) => setModal({ ...modal, amount: e.target.value })} /></Field>
          <Field label="Quantity"><input type="number" style={S.input} value={modal.quantity} onChange={(e) => setModal({ ...modal, quantity: e.target.value })} /></Field>
          <Field label="Who"><input style={S.input} value={modal.who} onChange={(e) => setModal({ ...modal, who: e.target.value })} /></Field>
          <Field label="Paid by">
            <select style={S.input} value={modal.paidBy || "Charlie"} onChange={(e) => setModal({ ...modal, paidBy: e.target.value })}>
              <option value="Charlie">Charlie</option>
              <option value="Lincoln">Lincoln</option>
            </select>
          </Field>
          <Field label="Date"><input type="date" style={S.input} value={modal.date} onChange={(e) => setModal({ ...modal, date: e.target.value })} /></Field>
          <button style={{ ...S.btnPrimary, width: "100%", justifyContent: "center" }} onClick={() => save(modal)}>Save</button>
        </Modal>
      )}
      <div style={{
        position: "fixed",
        bottom: `max(18px, ${SAFE_BOTTOM})`,
        right: `max(18px, ${SAFE_RIGHT})`,
        zIndex: 40,
        background: C.primaryDark, color: "#fff", padding: "12px 16px", borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)", maxWidth: 240,
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.7, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>Expense balance</div>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{balanceText}</div>
      </div>
    </div>
  );
}

// ---------- Per Bale P&L ----------
function BalePnLTab({ data, setData, mode }) {
  const { C, S } = useTheme();
  const [modal, setModal] = useState(null);
  const save = (row) => {
    setData((d) => {
      const list = d.bales.some((b) => b.id === row.id) ? d.bales.map((b) => (b.id === row.id ? row : b)) : [...d.bales, row];
      return { ...d, bales: list };
    });
    setModal(null);
  };
  const remove = (id) => setData((d) => ({ ...d, bales: d.bales.filter((b) => b.id !== id) }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button style={S.btnPrimary} onClick={() => setModal({ id: genId(), name: "", price: "", itemsReceived: "" })}>
          <Plus size={16} /> Add bale
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 14 }}>
        {data.bales.map((bale) => {
          const items = data.inventory.filter((i) => i.baleId === bale.id);
          const sold = items.filter((i) => i.status === "sold");
          const revenue = sold.reduce((s, i) => s + (Number(i.soldPrice) || 0), 0);
          const received = Number(bale.itemsReceived) || 0;
          const costPerItem = received > 0 ? Number(bale.price) / received : 0;
          const cost = costPerItem * sold.length;
          const profit = revenue - cost;
          const pctSold = received > 0 ? (sold.length / received) * 100 : 0;
          return (
            <div key={bale.id} style={{ ...S.card, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 15.5, color: C.text }}>{bale.name}</div>
                  <div style={{ fontSize: 12.5, color: C.muted }}>Bale cost {fmtMoney(bale.price)} · {received} items received</div>
                </div>
                <div>
                  <button onClick={() => setModal(bale)} style={{ ...S.btnGhost, padding: "5px 8px", marginRight: 6 }}><Pencil size={13} /></button>
                  <button onClick={() => remove(bale.id)} style={{ ...S.btnGhost, padding: "5px 8px", color: C.red }}><Trash2 size={13} /></button>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.muted, marginBottom: 4 }}>
                  <span>Sold</span><span>{sold.length} / {received} ({pctSold.toFixed(0)}%)</span>
                </div>
                <div style={{ height: 7, borderRadius: 999, background: C.bg, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, pctSold)}%`, background: C.green, borderRadius: 999 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                <div><div style={{ fontSize: 11.5, color: C.muted }}>Cost / item</div><div style={{ fontWeight: 700, color: C.text }}>{fmtMoney(costPerItem)}</div></div>
                <div><div style={{ fontSize: 11.5, color: C.muted }}>Revenue</div><div style={{ fontWeight: 700, color: C.text }}>{fmtMoney(revenue)}</div></div>
                <div><div style={{ fontSize: 11.5, color: C.muted }}>Profit</div><div style={{ fontWeight: 800, color: profit >= 0 ? C.green : C.red }}>{fmtMoney(profit)}</div></div>
              </div>
            </div>
          );
        })}
        {data.bales.length === 0 && <div style={{ color: C.muted }}>No bales added yet.</div>}
      </div>
      {modal && (
        <Modal title={data.bales.some((b) => b.id === modal.id) ? "Edit bale" : "Add bale"} onClose={() => setModal(null)}>
          <Field label="Bale name"><input style={S.input} value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></Field>
          <Field label="Bale price (£)"><input type="number" step="0.01" style={S.input} value={modal.price} onChange={(e) => setModal({ ...modal, price: e.target.value })} /></Field>
          <Field label="Items received"><input type="number" style={S.input} value={modal.itemsReceived} onChange={(e) => setModal({ ...modal, itemsReceived: e.target.value })} /></Field>
          <button style={{ ...S.btnPrimary, width: "100%", justifyContent: "center" }} onClick={() => save(modal)}>Save</button>
        </Modal>
      )}
    </div>
  );
}

// ---------- Payout ----------
function PayoutTab({ data, setData, mode }) {
  const { C, S } = useTheme();
  const payout = data.payout || { baselineDate: null, balance: 0 };
  const [confirmReset, setConfirmReset] = useState(false);

  const soldSinceBaseline = data.inventory.filter(
    (i) => i.status === "sold" && i.dateSold && (!payout.baselineDate || i.dateSold >= payout.baselineDate)
  );
  const charlieEarned = soldSinceBaseline.reduce((s, i) => s + revenueShare(i, "Charlie"), 0);
  const lincolnEarned = soldSinceBaseline.reduce((s, i) => s + revenueShare(i, "Lincoln"), 0);
  const totalEarned = charlieEarned + lincolnEarned;
  const balance = Number(payout.balance) || 0;
  const charlieShare = totalEarned > 0 ? charlieEarned / totalEarned : 0.5;
  const lincolnShare = totalEarned > 0 ? lincolnEarned / totalEarned : 0.5;
  const charliePayout = balance * charlieShare;
  const lincolnPayout = balance * lincolnShare;

  const setBalance = (val) => setData((d) => ({ ...d, payout: { ...(d.payout || { baselineDate: null, balance: 0 }), balance: val } }));
  const doReset = () => {
    setData((d) => ({ ...d, payout: { baselineDate: todayISO(), balance: 0 } }));
    setConfirmReset(false);
  };

  return (
    <div>
      <div style={{ ...S.card, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 4, color: C.text }}>Earned since last payout</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>
          {payout.baselineDate ? `Counting sales from ${payout.baselineDate} onwards.` : "Counting all sales so far — press reset once a payout has been made to start a fresh count."}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ padding: "12px 14px", borderRadius: 10, background: C.primaryLight }}>
            <div style={{ fontSize: 12.5, color: C.primaryDark, fontWeight: 700, marginBottom: 6 }}>Charlie earned</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.primary, fontFamily: "Sora, sans-serif" }}>{fmtMoney(charlieEarned)}</div>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 10, background: C.lincolnBg }}>
            <div style={{ fontSize: 12.5, color: C.lincoln, fontWeight: 700, marginBottom: 6 }}>Lincoln earned</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.lincoln, fontFamily: "Sora, sans-serif" }}>{fmtMoney(lincolnEarned)}</div>
          </div>
        </div>
      </div>

      <div style={{ ...S.card, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 12, color: C.text }}>Current Vinted balance</div>
        <Field label="Amount currently sitting in the Vinted balance (£)">
          <input type="number" step="0.01" style={S.input} value={payout.balance} onChange={(e) => setBalance(e.target.value)} />
        </Field>
        <div style={{ fontSize: 12.5, color: C.muted }}>Enter the balance manually — this splits based on each person's earned share above, in proportion.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mode === "mobile" ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={{ ...S.card, padding: "16px 18px" }}>
          <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Pay Charlie</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.primary, fontFamily: "Sora, sans-serif" }}>{fmtMoney(charliePayout)}</div>
        </div>
        <div style={{ ...S.card, padding: "16px 18px" }}>
          <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Pay Lincoln</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.lincoln, fontFamily: "Sora, sans-serif" }}>{fmtMoney(lincolnPayout)}</div>
        </div>
      </div>

      <div style={{ ...S.card, padding: "18px 20px" }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 10, color: C.text }}>After paying out</div>
        {!confirmReset ? (
          <button style={{ ...S.btnGhost, color: C.red }} onClick={() => setConfirmReset(true)}><RefreshCw size={14} /> Reset payout to £0</button>
        ) : (
          <div>
            <div style={{ fontSize: 13, color: C.red, marginBottom: 10 }}>
              This sets the Vinted balance back to £0 and starts counting earnings fresh from today — past sales won't be counted again in the next payout. Are you sure?
            </div>
            <button style={{ ...S.btnPrimary, background: C.red, marginRight: 8 }} onClick={doReset}>Yes, reset</button>
            <button style={S.btnGhost} onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- AI Descriptions ----------
function AIDescriptionsTab({ mode }) {
  const { C, S } = useTheme();
  const [photo, setPhoto] = useState([]);
  const [form, setForm] = useState({ title: "", brand: "", size: "", condition: "Very Good", color: "", material: "", notes: "" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (photo.length === 0) return;
    setLoading(true); setResult("");
    try {
      const prompt = `You are writing a professional, SEO-optimised Vinted listing description. Use the photo and these details:
Item title: ${form.title || "(infer from photo)"}
Brand: ${form.brand || "(infer from photo if visible)"}
Size: ${form.size}
Condition: ${form.condition}
Colour: ${form.color}
Material: ${form.material}
Extra notes: ${form.notes}
Write a concise, appealing Vinted description (100-160 words) covering fit, condition detail, and a styling suggestion. Naturally weave in the kind of keywords real buyers actually type into search (item type, brand, style, colour, era/decade if relevant, occasion) within the first two sentences so the listing surfaces in search. Friendly but professional tone. Do not invent a brand or flaws that aren't mentioned. After the description, on a new line, add "Search terms: " followed by 6-10 comma-separated keywords/phrases a buyer might search for this item. Output only the description and that search-terms line, no other headers.`;
      const text = await callGemini(prompt, photo);
      setResult(text);
    } catch (e) {
      setResult("Something went wrong generating the description. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: mode === "mobile" ? "1fr" : "1fr 1fr", gap: 20, alignItems: "start" }}>
      <div style={{ ...S.card, padding: 20 }}>
        <Field label="Photo"><PhotoPicker photos={photo} setPhotos={setPhoto} multiple={false} /></Field>
        <Field label="Title"><input style={S.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Brand"><input style={S.input} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Field>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}><Field label="Size"><input style={S.input} value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></Field></div>
          <div style={{ flex: 1 }}><Field label="Condition">
            <select style={S.input} value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              {["New with tags", "New without tags", "Very Good", "Good", "Satisfactory"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}><Field label="Colour"><input style={S.input} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field></div>
          <div style={{ flex: 1 }}><Field label="Material"><input style={S.input} value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} /></Field></div>
        </div>
        <Field label="Extra notes"><textarea style={{ ...S.input, minHeight: 60 }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        <button style={{ ...S.btnPrimary, width: "100%", justifyContent: "center" }} disabled={loading || photo.length === 0} onClick={generate}>
          <Sparkles size={16} /> {loading ? "Generating..." : "Generate description"}
        </button>
      </div>
      <div style={{ ...S.card, padding: 20, minHeight: 300 }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 10, color: C.text }}>Generated description</div>
        {result ? (
          <>
            <div style={{ whiteSpace: "pre-wrap", fontSize: 14, color: C.text, lineHeight: 1.55, marginBottom: 14 }}>{result}</div>
            <button style={S.btnGhost} onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
            </button>
          </>
        ) : <div style={{ color: C.muted, fontSize: 13.5 }}>Upload a photo and fill in details to generate a description here.</div>}
      </div>
    </div>
  );
}

// ---------- Price Scanner ----------
function PriceScannerTab({ mode }) {
  const { C, S } = useTheme();
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const scan = async () => {
    if (photos.length === 0) return;
    setLoading(true); setResult("");
    try {
      const prompt = `You are helping a Vinted reseller price an item for a quick 3-day sale. Look at the photo(s) and identify the likely item type, brand (if visible), and condition. Extra context from seller: ${notes || "none"}.
Based on your general knowledge of typical resale values for similar items on Vinted and eBay UK, suggest:
1. A short item identification (2-3 lines)
2. A suggested "quick sale" price range for a 3-day sale, and a slightly higher "patient sale" price
3. One tip to help it sell faster
Be clear this is an AI estimate based on general knowledge, not live sold-listing data, and prices can vary. Keep the whole answer under 130 words.`;
      const text = await callGemini(prompt, photos);
      setResult(text);
    } catch (e) {
      setResult("Something went wrong scanning this item. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: mode === "mobile" ? "1fr" : "1fr 1fr", gap: 20, alignItems: "start" }}>
      <div style={{ ...S.card, padding: 20 }}>
        <div style={{
          background: C.primaryLight, color: C.primaryDark, borderRadius: 10, padding: "10px 12px",
          fontSize: 12.5, marginBottom: 16, display: "flex", gap: 8,
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>This gives an AI-estimated price based on general knowledge, not live eBay/Vinted sold listings — always sanity-check against a couple of live search results yourself.</span>
        </div>
        <Field label="Photo(s)"><PhotoPicker photos={photos} setPhotos={setPhotos} multiple /></Field>
        <Field label="Notes (optional)"><textarea style={{ ...S.input, minHeight: 60 }} placeholder="e.g. brand, flaws, RRP if known" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        <button style={{ ...S.btnPrimary, width: "100%", justifyContent: "center" }} disabled={loading || photos.length === 0} onClick={scan}>
          <ScanLine size={16} /> {loading ? "Scanning..." : "Estimate price"}
        </button>
      </div>
      <div style={{ ...S.card, padding: 20, minHeight: 260 }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 10, color: C.text }}>Price estimate</div>
        {result ? <div style={{ whiteSpace: "pre-wrap", fontSize: 14, color: C.text, lineHeight: 1.55 }}>{result}</div>
          : <div style={{ color: C.muted, fontSize: 13.5 }}>Upload photo(s) to get a price suggestion.</div>}
      </div>
    </div>
  );
}

// ---------- Auto-list modal (uses AI description + price scanner together) ----------
function AutoListModal({ item, onApply, onClose }) {
  const { S } = useTheme();
  const [loading, setLoading] = useState(true);
  const [desc, setDesc] = useState("");
  const [priceText, setPriceText] = useState("");
  const [price, setPrice] = useState(item.price || "");
  const [error, setError] = useState("");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    (async () => {
      const photos = item.photos || [];
      if (photos.length === 0) {
        setError("This item has no photos yet — add at least one photo before auto-listing.");
        setLoading(false);
        return;
      }
      try {
        const descPrompt = `You are writing a professional, SEO-optimised Vinted listing description. Use the photo and these details:
Item title: ${item.title || "(infer from photo)"}
Brand: ${item.brand || "(infer from photo if visible)"}
Size: ${item.size || ""}
Condition: ${item.condition || ""}
Category: ${item.category || "(infer from photo)"}
Write a concise, appealing Vinted description (100-160 words) covering fit, condition detail, and a styling suggestion. Naturally weave in the kind of keywords real buyers actually type into search (item type, brand, style, colour, era/decade if relevant, occasion) within the first two sentences so the listing surfaces in search. Friendly but professional tone. Do not invent a brand or flaws that aren't mentioned. After the description, on a new line, add "Search terms: " followed by 6-10 comma-separated keywords/phrases a buyer might search for this item. Output only the description and that search-terms line, no other headers.`;
        const pricePrompt = `You are helping a Vinted reseller price an item for a quick 3-day sale. Look at the photo(s) and identify the likely item type, brand (if visible), and condition. Extra context: title "${item.title || ""}", brand "${item.brand || ""}", size "${item.size || ""}", condition "${item.condition || ""}".
Based on your general knowledge of typical resale values for similar items on Vinted and eBay UK, suggest:
1. A short item identification (2-3 lines)
2. A suggested "quick sale" price range for a 3-day sale, and a slightly higher "patient sale" price
3. One tip to help it sell faster
Be clear this is an AI estimate based on general knowledge, not live sold-listing data, and prices can vary. Keep the whole answer under 130 words.`;
        const [descResult, priceResult] = await Promise.all([
          callGemini(descPrompt, [photos[0]]),
          callGemini(pricePrompt, photos),
        ]);
        setDesc(descResult);
        setPriceText(priceResult);
        const match = priceResult.match(/£\s?(\d+(?:\.\d{1,2})?)/);
        if (match) setPrice(match[1]);
      } catch (e) {
        setError("Something went wrong generating the listing. Please try again.");
      }
      setLoading(false);
    })();
  }, []);

  return (
    <Modal title={`Auto-list: ${item.title || "Item"}`} onClose={onClose} wide>
      {loading && <div style={{ color: "#888", fontSize: 14 }}>Generating description and price estimate…</div>}
      {error && <div style={{ color: "#c23b3b", fontSize: 13.5, marginBottom: 12 }}>{error}</div>}
      {!loading && !error && (
        <>
          <Field label="Generated description">
            <textarea style={{ ...S.input, minHeight: 120 }} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </Field>
          <Field label="AI price notes">
            <div style={{ ...S.input, minHeight: 90, whiteSpace: "pre-wrap", fontSize: 13 }}>{priceText}</div>
          </Field>
          <Field label="Listing price to apply (£)">
            <input type="number" step="0.01" style={S.input} value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
          <button style={{ ...S.btnPrimary, width: "100%", justifyContent: "center" }} onClick={() => onApply({ description: desc, price })}>
            <Sparkles size={16} /> Apply & mark as listed
          </button>
        </>
      )}
    </Modal>
  );
}

// ---------- Batch List modal (new) ----------
// Sends every "Ready to List" item (with a photo) to Gemini in ONE call.
// Returns a description + price per item for the user to copy — nothing is
// changed on the items themselves, this is just a fast draft-and-copy tool.
function BatchListModal({ items, onClose }) {
  const { C, S } = useTheme();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    (async () => {
      const eligible = items.filter((i) => i.photos && i.photos.length > 0);
      if (eligible.length === 0) {
        setError("None of your Ready to List items have photos yet — add at least one photo per item first.");
        setLoading(false);
        return;
      }
      try {
        let promptText = `You are writing Vinted listing descriptions and quick-sale price estimates for a UK reseller, for MULTIPLE items in a single batch. You are given one photo per item, in order, plus each item's known details. For EACH item, write:
- "description": a concise, appealing Vinted description (100-160 words) covering fit, condition detail, and a styling suggestion, naturally weaving in buyer search keywords (item type, brand, style, colour, era/decade if relevant, occasion) in the first two sentences. Do not invent a brand or flaws that aren't mentioned. End the description with a new line "Search terms: " followed by 6-10 comma-separated keywords a buyer might search for.
- "price": your single best-estimate quick-sale price in GBP as a plain number (no currency symbol), based on general knowledge of typical Vinted/eBay UK resale values for a 3-day quick sale.

Return ONLY a JSON array, no other text, in exactly this shape:
[{"id": "<item id exactly as given>", "description": "<description text>", "price": <number>}]

Items (photos follow in the same order):\n`;
        const images = [];
        eligible.forEach((it, idx) => {
          promptText += `\nItem ${idx + 1}: id="${it.id}", title="${it.title || ""}", brand="${it.brand || ""}", size="${it.size || ""}", condition="${it.condition || ""}", category="${it.category || ""}".`;
          images.push(it.photos[0]);
        });
        const text = await callGemini(promptText, images, true);
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        setResults(
          parsed.map((r) => {
            const item = eligible.find((i) => i.id === r.id);
            return { id: r.id, title: item ? item.title : r.id, description: r.description || "", price: r.price != null ? String(r.price) : "" };
          })
        );
      } catch (e) {
        setError("Something went wrong generating the batch listing. Try again with fewer items, or check your Gemini API key.");
      }
      setLoading(false);
    })();
  }, []);

  const copyItem = (r) => {
    const combined = `${r.description}\n\nSuggested price: ${fmtMoney(r.price)}`;
    navigator.clipboard.writeText(combined);
    setCopiedId(r.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <Modal title={`Batch list — ${items.length} ready item${items.length === 1 ? "" : "s"}`} onClose={onClose} wide>
      {loading && <div style={{ color: C.muted, fontSize: 14 }}>Generating descriptions and prices for {items.length} item{items.length === 1 ? "" : "s"} in one AI call…</div>}
      {error && <div style={{ color: C.red, fontSize: 13.5 }}>{error}</div>}
      {!loading && !error && results.length === 0 && <div style={{ color: C.muted, fontSize: 13.5 }}>No results came back — try again.</div>}
      {!loading && !error && results.map((r) => (
        <div key={r.id} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: C.text }}>{r.title || "Untitled item"}</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: C.primary, flexShrink: 0 }}>{fmtMoney(r.price)}</div>
          </div>
          <div style={{ whiteSpace: "pre-wrap", fontSize: 13.5, color: C.text, lineHeight: 1.5, marginBottom: 10 }}>{r.description}</div>
          <button style={{ ...S.btnGhost, padding: "5px 10px", fontSize: 12 }} onClick={() => copyItem(r)}>
            {copiedId === r.id ? <Check size={12} /> : <Copy size={12} />} {copiedId === r.id ? "Copied" : "Copy description + price"}
          </button>
        </div>
      ))}
    </Modal>
  );
}

// ---------- Inventory item form (shared by Inventory + Sold tabs) ----------
function ItemForm({ item, data, onSave, onClose, soldContext }) {
  const { C, S } = useTheme();
  const [f, setF] = useState(item);
  const [detecting, setDetecting] = useState(false);
  const [soldPromptOpen, setSoldPromptOpen] = useState(false);
  const [statusBeforeSold, setStatusBeforeSold] = useState(item.status || "ready");
  const [soldDraft, setSoldDraft] = useState({
    soldPrice: item.soldPrice || item.price || "",
    isBundle: !!item.isBundle,
    bundleDiscount: item.bundleDiscount || "",
    bundleItems: item.bundleItems || "",
  });

  const detectCategory = async () => {
    if (!f.photos || f.photos.length === 0) return;
    setDetecting(true);
    try {
      const prompt = `Look at this photo of a second-hand clothing/fashion item for resale. Pick exactly one category from this list that best fits it, and reply with ONLY that exact category text and nothing else: ${CATEGORY_OPTIONS.join(", ")}.`;
      const text = await callGemini(prompt, [f.photos[0]]);
      const cleaned = text.trim();
      const match = CATEGORY_OPTIONS.find((c) => cleaned.toLowerCase().includes(c.toLowerCase()));
      setF((prev) => ({ ...prev, category: match || cleaned }));
    } catch (e) {
      // silent fail, leave category as-is
    }
    setDetecting(false);
  };

  const openSoldPrompt = (previousStatus) => {
    setStatusBeforeSold(previousStatus);
    setSoldDraft({
      soldPrice: f.soldPrice || f.price || "",
      isBundle: !!f.isBundle,
      bundleDiscount: f.bundleDiscount || "",
      bundleItems: f.bundleItems || "",
    });
    setSoldPromptOpen(true);
  };

  const confirmSold = () => {
    setF((prev) => ({
      ...prev,
      status: "sold",
      soldPrice: soldDraft.soldPrice !== "" ? soldDraft.soldPrice : prev.price,
      dateSold: prev.dateSold || todayISO(),
      isBundle: !!soldDraft.isBundle,
      bundleDiscount: soldDraft.isBundle ? (soldDraft.bundleDiscount || "") : "",
      bundleItems: soldDraft.isBundle ? (soldDraft.bundleItems || "") : "",
    }));
    setSoldPromptOpen(false);
  };

  const cancelSold = () => {
    setF((prev) => ({
      ...prev,
      status: statusBeforeSold,
    }));
    setSoldPromptOpen(false);
  };

  return (
    <>
      <Modal title={data.inventory.some((i) => i.id === f.id) ? "Edit item" : "Add inventory"} onClose={onClose} wide>
        <Field label="Photos"><PhotoPicker photos={f.photos || []} setPhotos={(p) => setF({ ...f, photos: p })} /></Field>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}><Field label="Title"><input style={S.input} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field></div>
          <div style={{ flex: 1 }}><Field label="Brand"><input style={S.input} value={f.brand || ""} onChange={(e) => setF({ ...f, brand: e.target.value })} /></Field></div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}><Field label="Category">
            <select style={S.input} value={f.category || ""} onChange={(e) => setF({ ...f, category: e.target.value })}>
              <option value="">Not set</option>
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field></div>
          <button type="button" onClick={detectCategory} disabled={detecting || !(f.photos && f.photos.length)} style={{ ...S.btnGhost, marginBottom: 14, whiteSpace: "nowrap" }}>
            <Sparkles size={13} /> {detecting ? "Detecting…" : "AI detect"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}><Field label="Size"><input style={S.input} value={f.size} onChange={(e) => setF({ ...f, size: e.target.value })} /></Field></div>
          <div style={{ flex: 1 }}><Field label="Condition">
            <select style={S.input} value={f.condition} onChange={(e) => setF({ ...f, condition: e.target.value })}>
              {["New with tags", "New without tags", "Very Good", "Good", "Satisfactory"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}><Field label="Listing price (£)"><input type="number" step="0.01" style={S.input} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field></div>
          <div style={{ flex: 1 }}><Field label="Cost price (£) — if no bale"><input type="number" step="0.01" style={S.input} value={f.buyPrice || ""} onChange={(e) => setF({ ...f, buyPrice: e.target.value })} /></Field></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}><Field label="Assign to bale">
            <select style={S.input} value={f.baleId || ""} onChange={(e) => setF({ ...f, baleId: e.target.value || null })}>
              <option value="">None</option>
              {data.bales.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field></div>
          <div style={{ flex: 1 }}><Field label="Status">
            <select style={S.input} value={f.status} onChange={(e) => {
              const val = e.target.value;
              if (val === "sold" && f.status !== "sold") {
                openSoldPrompt(f.status);
              } else {
                setF((prev) => ({ ...prev, status: val }));
              }
            }}>
              <option value="ready">Ready to List</option>
              <option value="listed">Listed</option>
              <option value="sold">Sold</option>
            </select>
          </Field></div>
        </div>
        <Field label="Whose item is this?">
          <select style={S.input} value={f.owner || "Both"} onChange={(e) => setF({ ...f, owner: e.target.value })}>
            <option value="Charlie">Charlie</option>
            <option value="Lincoln">Lincoln</option>
            <option value="Both">Both (split 50/50)</option>
          </select>
        </Field>
        <Field label="Description">
          <textarea style={{ ...S.input, minHeight: 90 }} value={f.description || ""} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Use Auto-list from the inventory card, or Batch List, to generate this with AI" />
        </Field>
        {f.status === "sold" && (
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><Field label="Sold price (£)"><input type="number" step="0.01" style={S.input} value={f.soldPrice || f.price} onChange={(e) => setF({ ...f, soldPrice: e.target.value })} /></Field></div>
            <div style={{ flex: 1 }}><Field label="Date sold"><input type="date" style={S.input} value={f.dateSold || todayISO()} onChange={(e) => setF({ ...f, dateSold: e.target.value })} /></Field></div>
          </div>
        )}
        {f.status === "sold" && f.isBundle && (
          <div style={{ padding: 12, border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>Bundle sale</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
              {f.bundleDiscount ? `Bundle discount: ${fmtMoney(f.bundleDiscount)}` : "Bundle discount not entered"}
              {f.bundleItems ? ` · Other items: ${f.bundleItems}` : ""}
            </div>
          </div>
        )}
        {soldContext && (
          <>
            <Field label="Packaging status">
              <select style={S.input} value={f.packageStatus || "waiting"} onChange={(e) => {
                const val = e.target.value;
                setF((prev) => ({ ...prev, packageStatus: val, dateShipped: val === "shipped" ? (prev.dateShipped || todayISO()) : null }));
              }}>
                <option value="waiting">Waiting to Package</option>
                <option value="packaged">Packaged</option>
                <option value="shipped">Shipped</option>
              </select>
            </Field>
            <Field label="Shipping QR code photo"><PhotoPicker photos={f.qrPhoto ? [f.qrPhoto] : []} setPhotos={(p) => setF({ ...f, qrPhoto: p[0] || null })} multiple={false} /></Field>
          </>
        )}
        <button style={{ ...S.btnPrimary, width: "100%", justifyContent: "center", marginTop: 6 }} onClick={() => {
          const withDates = { ...f, dateAdded: f.dateAdded || todayISO() };
          if (f.status === "listed" && !f.dateListed) withDates.dateListed = todayISO();
          if (f.status !== "listed") withDates.dateListed = null;
          onSave(withDates);
        }}>Save item</button>
      </Modal>

      {soldPromptOpen && (
        <Modal title="Record sale" onClose={cancelSold}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            Enter what the buyer actually paid. The listed price is pre-filled, but you can change it if you accepted an offer.
          </div>

          <Field label="Amount actually paid (£)">
            <input
              type="number"
              step="0.01"
              min="0"
              autoFocus
              style={S.input}
              value={soldDraft.soldPrice}
              onChange={(e) => setSoldDraft((prev) => ({ ...prev, soldPrice: e.target.value }))}
            />
          </Field>

          <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0", fontSize: 13, color: C.text, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={soldDraft.isBundle}
              onChange={(e) => setSoldDraft((prev) => ({ ...prev, isBundle: e.target.checked }))}
            />
            Was this a bundle sale?
          </label>

          {soldDraft.isBundle && (
            <>
              <Field label="Bundle discount (£)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  style={S.input}
                  value={soldDraft.bundleDiscount}
                  onChange={(e) => setSoldDraft((prev) => ({ ...prev, bundleDiscount: e.target.value }))}
                  placeholder="e.g. 5.00"
                />
              </Field>

              <Field label="What other items were in the bundle?">
                <textarea
                  style={{ ...S.input, minHeight: 80 }}
                  value={soldDraft.bundleItems}
                  onChange={(e) => setSoldDraft((prev) => ({ ...prev, bundleItems: e.target.value }))}
                  placeholder="e.g. Black Nike hoodie, Levi's jeans"
                />
              </Field>
            </>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <button onClick={cancelSold} style={{ ...S.btnGhost, flex: 1, justifyContent: "center" }}>Cancel</button>
            <button onClick={confirmSold} style={{ ...S.btnPrimary, flex: 1, justifyContent: "center" }}>Confirm sale</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function ItemCard({ item, onEdit, onAutoList, onArchive }) {
  const { C } = useTheme();
  const meta = statusMeta(C)[item.status];
  const oMeta = ownerMeta(C)[item.owner || "Both"];
  const isStale = item.status === "listed" && daysSince(item.dateListed || item.dateAdded) >= 7;
  return (
    <div style={{
      background: C.card, border: isStale ? `1.5px solid ${C.red}` : `1px solid ${C.border}`, borderRadius: 14,
      boxShadow: C.shadow, padding: 12, display: "flex", gap: 12, flexDirection: "column",
      animation: isStale ? "pulseRed 1.6s infinite" : "none",
    }}>
      <div style={{ display: "flex", gap: 12 }}>
        <img src={item.photos && item.photos[0]} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, background: C.bg, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title || "Untitled item"}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <Badge meta={oMeta} />
              <Badge meta={meta} />
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>Size {item.size} · {item.condition} · {fmtMoney(item.price)}</div>
          {item.category && <div style={{ fontSize: 11.5, color: C.primary, marginTop: 2 }}>{item.category}</div>}
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <button onClick={() => onEdit(item)} style={{ background: C.card, color: C.primary, border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}><Pencil size={12} /> Edit</button>
            <button onClick={() => onAutoList(item)} style={{ background: C.card, color: C.primary, border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}><Sparkles size={12} /> Auto-list</button>
            {onArchive && (
              <button onClick={() => onArchive(item.id)} style={{ background: C.card, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}><ArchiveIcon size={12} /> Archive</button>
            )}
          </div>
        </div>
      </div>
      {isStale && (
        <div style={{
          background: C.redBg, color: C.red, border: `1px solid ${C.redBorder}`, borderRadius: 8,
          padding: "7px 10px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
        }}>
          <AlertTriangle size={14} /> Relist item — add a discount and new photos ({daysSince(item.dateListed || item.dateAdded)}d unsold)
        </div>
      )}
    </div>
  );
}

// ---------- Search + filter bar (shared) ----------
function FilterBar({ search, setSearch, filters, mode }) {
  const { C, S } = useTheme();
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
      <div style={{ position: "relative", flex: mode === "mobile" ? "1 1 100%" : "0 1 260px" }}>
        <Search size={14} color={C.muted} style={{ position: "absolute", left: 10, top: 11 }} />
        <input
          style={{ ...S.input, paddingLeft: 30 }}
          placeholder="Search title or brand…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {filters.map((f) => (
        <select key={f.label} style={{ ...S.input, width: "auto", minWidth: 140 }} value={f.value} onChange={(e) => f.onChange(e.target.value)}>
          <option value="">{f.label}: All</option>
          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ))}
    </div>
  );
}

// ---------- Inventory ----------
function InventoryTab({ data, setData, mode }) {
  const { C, S } = useTheme();
  const [modal, setModal] = useState(null);
  const [autoListItem, setAutoListItem] = useState(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const save = (row) => {
    setData((d) => {
      const list = d.inventory.some((i) => i.id === row.id) ? d.inventory.map((i) => (i.id === row.id ? row : i)) : [...d.inventory, row];
      return { ...d, inventory: list };
    });
    setModal(null);
  };
  const applyAutoList = ({ description, price }) => {
    setData((d) => ({
      ...d,
      inventory: d.inventory.map((i) => i.id === autoListItem.id ? {
        ...i,
        description,
        price: price !== "" && price != null ? price : i.price,
        status: "listed",
        dateListed: i.dateListed || todayISO(),
      } : i),
    }));
    setAutoListItem(null);
  };
  const archiveItem = (id) => {
    setData((d) => ({ ...d, inventory: d.inventory.map((i) => i.id === id ? { ...i, archived: true } : i) }));
  };

  const categories = Array.from(new Set(data.inventory.map((i) => i.category).filter(Boolean)));
  const readyItems = data.inventory.filter((i) => i.status === "ready" && !isArchived(i));
  const visible = data.inventory.filter((i) => {
    if (isArchived(i)) return false;
    if (statusFilter && i.status !== statusFilter) return false;
    if (ownerFilter && (i.owner || "Both") !== ownerFilter) return false;
    if (categoryFilter && i.category !== categoryFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!(i.title || "").toLowerCase().includes(s) && !(i.brand || "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
        <button style={S.btnGhost} disabled={readyItems.length === 0} onClick={() => setBatchOpen(true)}>
          <Sparkles size={16} /> Batch List Ready Items ({readyItems.length})
        </button>
        <button style={S.btnPrimary} onClick={() => setModal({ id: genId(), photos: [], title: "", size: "", condition: "Very Good", price: "", status: "ready", owner: "Both", description: "", category: "" })}>
          <Plus size={16} /> Add inventory
        </button>
      </div>
      <FilterBar
        search={search} setSearch={setSearch} mode={mode}
        filters={[
          { label: "Status", value: statusFilter, onChange: setStatusFilter, options: ["ready", "listed", "sold"] },
          { label: "Owner", value: ownerFilter, onChange: setOwnerFilter, options: ["Charlie", "Lincoln", "Both"] },
          { label: "Category", value: categoryFilter, onChange: setCategoryFilter, options: categories },
        ]}
      />
      <div style={{ display: "grid", gridTemplateColumns: mode === "mobile" ? "1fr" : "repeat(auto-fill, minmax(280px,1fr))", gap: 12 }}>
        {visible.map((item) => <ItemCard key={item.id} item={item} onEdit={setModal} onAutoList={setAutoListItem} onArchive={archiveItem} />)}
        {visible.length === 0 && <div style={{ color: C.muted }}>No inventory matches these filters.</div>}
      </div>
      {modal && <ItemForm item={modal} data={data} onSave={save} onClose={() => setModal(null)} />}
      {autoListItem && <AutoListModal item={autoListItem} onApply={applyAutoList} onClose={() => setAutoListItem(null)} />}
      {batchOpen && <BatchListModal items={readyItems} onClose={() => setBatchOpen(false)} />}
    </div>
  );
}

// ---------- Sold Items ----------
function SoldItemsTab({ data, setData, mode }) {
  const { C, S } = useTheme();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [packageFilter, setPackageFilter] = useState("");

  const soldItems = data.inventory.filter((i) => i.status === "sold" && !isArchived(i)).filter((i) => {
    if (ownerFilter && (i.owner || "Both") !== ownerFilter) return false;
    if (packageFilter && (i.packageStatus || "waiting") !== packageFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!(i.title || "").toLowerCase().includes(s) && !(i.brand || "").toLowerCase().includes(s)) return false;
    }
    return true;
  });
  const save = (row) => {
    setData((d) => ({ ...d, inventory: d.inventory.map((i) => (i.id === row.id ? row : i)) }));
    setModal(null);
  };
  const archiveItem = (id) => {
    setData((d) => ({ ...d, inventory: d.inventory.map((i) => i.id === id ? { ...i, archived: true } : i) }));
  };
  return (
    <div>
      <FilterBar
        search={search} setSearch={setSearch} mode={mode}
        filters={[
          { label: "Owner", value: ownerFilter, onChange: setOwnerFilter, options: ["Charlie", "Lincoln", "Both"] },
          { label: "Packaging", value: packageFilter, onChange: setPackageFilter, options: ["waiting", "packaged", "shipped"] },
        ]}
      />
      <div style={{ display: "grid", gridTemplateColumns: mode === "mobile" ? "1fr" : "repeat(auto-fill, minmax(300px,1fr))", gap: 12 }}>
        {soldItems.map((item) => {
          const pMeta = packageMeta(C)[item.packageStatus || "waiting"];
          const oMeta = ownerMeta(C)[item.owner || "Both"];
          return (
            <div key={item.id} style={{ ...S.card, padding: 12, display: "flex", gap: 12 }}>
              <img src={item.photos && item.photos[0]} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, background: C.bg, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{item.title}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Badge meta={oMeta} />
                    <Badge meta={pMeta} />
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>Sold {fmtMoney(item.soldPrice || item.price)} on {item.dateSold}</div>
                {item.isBundle && (
                  <div style={{ marginTop: 6, fontSize: 12, color: C.muted }}>
                    <strong style={{ color: C.text }}>Bundle:</strong>{" "}
                    {item.bundleDiscount ? `£${Number(item.bundleDiscount).toFixed(2)} discount` : "no discount entered"}
                    {item.bundleItems ? ` · With: ${item.bundleItems}` : ""}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                  <button onClick={() => setModal(item)} style={{ ...S.btnGhost, padding: "4px 10px", fontSize: 12 }}><Pencil size={12} /> Edit</button>
                  <button onClick={() => archiveItem(item.id)} style={{ ...S.btnGhost, padding: "4px 10px", fontSize: 12 }}><ArchiveIcon size={12} /> Archive</button>
                  {item.qrPhoto && <img src={item.qrPhoto} alt="QR" style={{ width: 26, height: 26, borderRadius: 4, border: `1px solid ${C.border}` }} />}
                </div>
              </div>
            </div>
          );
        })}
        {soldItems.length === 0 && <div style={{ color: C.muted }}>No sold items match these filters.</div>}
      </div>
      {modal && <ItemForm item={modal} data={data} onSave={save} onClose={() => setModal(null)} soldContext />}
    </div>
  );
}

// ---------- Label Printing ----------
function LabelCard({ item, setData }) {
  const { C, S } = useTheme();
  const [tracking, setTracking] = useState(item.trackingNumber || "");
  const [labelPhoto, setLabelPhoto] = useState(item.labelPhoto ? [item.labelPhoto] : []);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setData((d) => ({
      ...d,
      inventory: d.inventory.map((i) => i.id === item.id ? { ...i, trackingNumber: tracking, labelPhoto: labelPhoto[0] || null, labelPrinted: !!(labelPhoto[0] || tracking) } : i),
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div style={{ ...S.card, padding: 16 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <img src={item.photos && item.photos[0]} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, background: C.bg, flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{item.title || "Untitled item"}</div>
          <div style={{ fontSize: 12, color: C.muted }}>Sold {fmtMoney(item.soldPrice || item.price)} on {item.dateSold}</div>
        </div>
      </div>
      <Field label="Tracking / order reference">
        <input style={S.input} value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. tracking number" />
      </Field>
      <Field label="Barcode / label photo">
        <PhotoPicker photos={labelPhoto} setPhotos={setLabelPhoto} multiple={false} />
      </Field>
      <button style={S.btnPrimary} onClick={save}>{saved ? <Check size={14} /> : <Tag size={14} />} {saved ? "Saved" : "Save label"}</button>
    </div>
  );
}

function LabelPrintingTab({ data, setData, mode }) {
  const { C } = useTheme();
  const [search, setSearch] = useState("");
  const items = data.inventory.filter((i) => i.status === "sold" && !isArchived(i)).filter((i) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (i.title || "").toLowerCase().includes(s) || (i.brand || "").toLowerCase().includes(s);
  });
  return (
    <div>
      <FilterBar search={search} setSearch={setSearch} mode={mode} filters={[]} />
      <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>Every sold item lands here automatically — attach its barcode or shipping label so it's easy to find at packing time.</div>
      <div style={{ display: "grid", gridTemplateColumns: mode === "mobile" ? "1fr" : "repeat(auto-fill, minmax(280px,1fr))", gap: 12 }}>
        {items.map((item) => <LabelCard key={item.id} item={item} setData={setData} />)}
        {items.length === 0 && <div style={{ color: C.muted }}>No sold items to label yet.</div>}
      </div>
    </div>
  );
}

// ---------- Messaging Templates ----------
function MessagingTemplatesTab({ data, setData, mode }) {
  const { C, S } = useTheme();
  const [modal, setModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const save = (row) => {
    setData((d) => {
      const list = (d.templates || []).some((t) => t.id === row.id)
        ? d.templates.map((t) => (t.id === row.id ? row : t))
        : [...(d.templates || []), row];
      return { ...d, templates: list };
    });
    setModal(null);
  };
  const remove = (id) => setData((d) => ({ ...d, templates: d.templates.filter((t) => t.id !== id) }));
  const templates = data.templates || [];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button style={S.btnPrimary} onClick={() => setModal({ id: genId(), name: "", text: "" })}><Plus size={16} /> Add template</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mode === "mobile" ? "1fr" : "repeat(auto-fill, minmax(280px,1fr))", gap: 12 }}>
        {templates.map((t) => (
          <div key={t.id} style={{ ...S.card, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: C.text, marginBottom: 8 }}>{t.name}</div>
            <div style={{ fontSize: 13, color: C.text, whiteSpace: "pre-wrap", marginBottom: 12, lineHeight: 1.5 }}>{t.text}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ ...S.btnGhost, padding: "5px 10px", fontSize: 12 }} onClick={() => { navigator.clipboard.writeText(t.text); setCopiedId(t.id); setTimeout(() => setCopiedId(null), 1200); }}>
                {copiedId === t.id ? <Check size={12} /> : <Copy size={12} />} {copiedId === t.id ? "Copied" : "Copy"}
              </button>
              <button style={{ ...S.btnGhost, padding: "5px 10px", fontSize: 12 }} onClick={() => setModal(t)}><Pencil size={12} /> Edit</button>
              <button style={{ ...S.btnGhost, padding: "5px 10px", fontSize: 12, color: C.red }} onClick={() => remove(t.id)}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
        {templates.length === 0 && <div style={{ color: C.muted }}>No templates yet — add one for scenarios like "item dispatched" or "offer response".</div>}
      </div>
      {modal && (
        <Modal title={templates.some((t) => t.id === modal.id) ? "Edit template" : "Add template"} onClose={() => setModal(null)}>
          <Field label="Scenario name"><input style={S.input} value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} placeholder="e.g. Item dispatched" /></Field>
          <Field label="Message text"><textarea style={{ ...S.input, minHeight: 120 }} value={modal.text} onChange={(e) => setModal({ ...modal, text: e.target.value })} /></Field>
          <button style={{ ...S.btnPrimary, width: "100%", justifyContent: "center" }} onClick={() => save(modal)}>Save</button>
        </Modal>
      )}
    </div>
  );
}

// ---------- Archive ----------
function ArchiveTab({ data, setData, mode }) {
  const { C, S } = useTheme();
  const archived = data.inventory.filter(isArchived);
  const [confirmId, setConfirmId] = useState(null);

  const restore = (id) => {
    setData((d) => ({ ...d, inventory: d.inventory.map((i) => i.id === id ? { ...i, archived: false } : i) }));
  };
  const deleteItem = (id) => {
    setData((d) => ({ ...d, inventory: d.inventory.filter((i) => i.id !== id) }));
    setConfirmId(null);
  };

  return (
    <div>
      <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>
        Items land here automatically once they've sat in "Shipped" status for 21 days, or you can send an item here manually from Inventory or Sold Items. Restore brings an item back into the active system; deleting removes it permanently.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mode === "mobile" ? "1fr" : "repeat(auto-fill, minmax(280px,1fr))", gap: 12 }}>
        {archived.map((item) => (
          <div key={item.id} style={{ ...S.card, padding: 12, display: "flex", gap: 12, opacity: 0.85 }}>
            <img src={item.photos && item.photos[0]} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, background: C.bg, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{item.title || "Untitled item"}</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>
                {item.dateSold ? `Sold ${fmtMoney(item.soldPrice || item.price)} on ${item.dateSold}` : "Not sold"}{item.dateShipped ? ` · Shipped ${item.dateShipped}` : ""}
              </div>
              {confirmId === item.id ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11.5, color: C.red }}>Delete permanently?</span>
                  <button onClick={() => deleteItem(item.id)} style={{ ...S.btnGhost, padding: "4px 10px", fontSize: 12, color: "#fff", background: C.red, borderColor: C.red }}>Yes, delete</button>
                  <button onClick={() => setConfirmId(null)} style={{ ...S.btnGhost, padding: "4px 10px", fontSize: 12 }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => restore(item.id)} style={{ ...S.btnGhost, padding: "4px 10px", fontSize: 12 }}><RefreshCw size={12} /> Restore</button>
                  <button onClick={() => setConfirmId(item.id)} style={{ ...S.btnGhost, padding: "4px 10px", fontSize: 12, color: C.red }}><Trash2 size={12} /> Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {archived.length === 0 && <div style={{ color: C.muted }}>No archived items yet.</div>}
      </div>
    </div>
  );
}

// ---------- Authentication Help ----------
function AuthHelpTab() {
  const { C, S } = useTheme();
  const tips = [
    "Compare stitching, fonts and logo spacing against official brand product photos — uneven stitching or an off font is the most common tell.",
    "Check serial numbers, date codes or hologram stickers where the brand uses them, and look up the expected format for that brand and era.",
    "Look closely at hardware (zips, buttons, clasps) — genuine items usually have consistent, cleanly engraved branding on hardware.",
    "Check the material and smell — genuine leather and canvas have a distinct feel and smell that's hard for cheap fakes to replicate.",
    "Ask the seller for extra photos of tags, serial numbers and stitching before buying if you're the one purchasing bales or single items.",
    "Weigh the item if the brand publishes weights for that model — fakes are very often lighter than genuine pieces.",
  ];
  const resources = [
    { name: "Brand's official website / customer service", desc: "Many brands will confirm serial number formats or offer to verify an item if you contact them directly.", url: "" },
    { name: "PurseForum – Authenticate This threads", desc: "Free, community-run authentication threads for designer bags and accessories.", url: "https://forum.purseforum.com/" },
    { name: "Reddit r/DesignerReps and r/handbags", desc: "Communities experienced in spotting fakes across many brands, free to post in.", url: "https://www.reddit.com/r/handbags/" },
    { name: "Vinted's own item photos policy", desc: "Encourage buyers/sellers to include close-up tag and stitching photos — this alone deters most counterfeit listings.", url: "" },
  ];
  return (
    <div>
      <div style={{ ...S.card, padding: 20, marginBottom: 18 }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 12, color: C.text }}>Quick authenticity checklist</div>
        {tips.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13.5, color: C.text, lineHeight: 1.5 }}>
            <ShieldCheck size={16} color={C.primary} style={{ flexShrink: 0, marginTop: 2 }} /> {t}
          </div>
        ))}
      </div>
      <div style={{ ...S.card, padding: 20 }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 12, color: C.text }}>Free resources</div>
        {resources.map((r) => (
          <div key={r.name} style={{ padding: "10px 0", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
              {r.name}
              {r.url && <a href={r.url} target="_blank" rel="noreferrer" style={{ color: C.primary }}><ExternalLink size={13} /></a>}
            </div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{r.desc}</div>
          </div>
        ))}
        <div style={{
          marginTop: 14, fontSize: 12, color: C.muted, background: C.bg, padding: "10px 12px", borderRadius: 8,
        }}>Note: an automatic photo-based authenticity scanner isn't reliable enough to trust without a paid, specialist model behind it, so it isn't included here — use the checklist and community resources above instead.</div>
      </div>
    </div>
  );
}

// ---------- Settings ----------
function SettingsTab({ data, setData, currentUser, mode }) {
  const { C, S } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);
  const [displayName, setDisplayName] = useState((data.profiles && data.profiles[currentUser] && data.profiles[currentUser].displayName) || "");
  const [nameSaved, setNameSaved] = useState(false);

  const resetData = () => {
    setData({ ...DEFAULT_DATA, profiles: data.profiles || {} });
    setConfirmReset(false);
  };

  const saveProfile = () => {
    setData((d) => ({
      ...d,
      profiles: {
        ...(d.profiles || {}),
        [currentUser]: { ...(d.profiles?.[currentUser] || {}), displayName }
      }
    }));
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 1200);
  };

  const toggleDark = () => setData((d) => ({
    ...d,
    settings: { ...(d.settings || {}), darkMode: !(d.settings && d.settings.darkMode) }
  }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: mode === "mobile" ? "1fr" : "1fr 1fr", gap: 20, alignItems: "start" }}>
      <div style={{ ...S.card, padding: 20 }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 12, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
          <UserCircle2 size={17} color={C.primary} /> Your profile
        </div>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 12 }}>
          Signed in as {currentUser}. Set a display name to personalise greetings around the app.
        </div>
        <Field label="Display name">
          <input style={S.input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Charlie" />
        </Field>
        <button style={S.btnPrimary} onClick={saveProfile}>
          {nameSaved ? <Check size={14} /> : null} {nameSaved ? "Saved" : "Save name"}
        </button>

        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 20, paddingTop: 16 }}>
          <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 10, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
            {data.settings?.darkMode ? <Sun size={17} color={C.primary} /> : <Moon size={17} color={C.primary} />} Appearance
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: C.text, cursor: "pointer" }}>
            <input type="checkbox" checked={!!data.settings?.darkMode} onChange={toggleDark} style={{ width: 16, height: 16, cursor: "pointer" }} />
            Dark mode
          </label>
        </div>
      </div>

      <div style={{ ...S.card, padding: 20 }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 12, color: C.text }}>Firebase Authentication</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 14 }}>
          Login accounts are now managed by Firebase Authentication, not stored in the Firestore business-data document.
          To add or remove users, use Firebase Console → Authentication → Users.
        </div>
        <a
          href="https://console.firebase.google.com/project/vinted-sales-proj/authentication/users"
          target="_blank"
          rel="noreferrer"
          style={{ ...S.btnPrimary, textDecoration: "none", marginBottom: 18 }}
        >
          <ExternalLink size={14} /> Manage users in Firebase
        </a>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 10, color: C.text }}>Business data</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
            {data.inventory.length} inventory items · {data.bales.length} bales · {data.expenses.length} expenses.
            All business data is shared between authenticated users.
          </div>
          {!confirmReset ? (
            <button style={{ ...S.btnGhost, color: C.red }} onClick={() => setConfirmReset(true)}>
              <Trash2 size={14} /> Reset all business data
            </button>
          ) : (
            <div>
              <div style={{ fontSize: 13, color: C.red, marginBottom: 10 }}>
                This permanently deletes inventory, bales and expenses. Authentication accounts are kept. Are you sure?
              </div>
              <button style={{ ...S.btnPrimary, background: C.red, marginRight: 8 }} onClick={resetData}>Yes, reset</button>
              <button style={S.btnGhost} onClick={() => setConfirmReset(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- App ----------
function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(DEFAULT_DATA);
  const [currentUser, setCurrentUser] = useState(null);
  const [active, setActive] = useState("overview");
  const [mode, setMode] = useState(() => (typeof window !== "undefined" && window.innerWidth < 768 ? "mobile" : "desktop"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const remoteUpdateRef = useRef(false);
  const writeTimerRef = useRef(null);
  const inventoryIdsRef = useRef(new Set());
  const sharedLoadedRef = useRef(false);
  const inventoryLoadedRef = useRef(false);
  const hydratedRef = useRef(false);
   useEffect(() => {
    let unsubscribeShared = null;
    let unsubscribeInventory = null;
    let active = true;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeShared) unsubscribeShared();
      if (unsubscribeInventory) unsubscribeInventory();
      unsubscribeShared = null;
      unsubscribeInventory = null;

      if (!user) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      setCurrentUser(user.email || user.uid);
      setLoading(true);
      sharedLoadedRef.current = false;
      inventoryLoadedRef.current = false;
      hydratedRef.current = false;
      remoteUpdateRef.current = true;

      // Business-wide data (everything except inventory) stays in one document.
      unsubscribeShared = sharedDocRef.onSnapshot(
        (snap) => {
          if (!active) return;

          if (snap.exists) {
            const remote = snap.data() || {};
            const { users: _legacyUsers, inventory: legacyInventory, ...safeRemote } = remote;

            remoteUpdateRef.current = true;
            sharedLoadedRef.current = true;

            setData((prev) => ({
              ...DEFAULT_DATA,
              ...safeRemote,
              // Inventory is loaded from its own collection below.
              inventory: prev.inventory || [],
              payout: { ...DEFAULT_DATA.payout, ...(safeRemote.payout || {}) },
              settings: { ...DEFAULT_DATA.settings, ...(safeRemote.settings || {}) },
              profiles: { ...DEFAULT_DATA.profiles, ...(safeRemote.profiles || {}) },
              taskCompletions: { ...DEFAULT_DATA.taskCompletions, ...(safeRemote.taskCompletions || {}) },
              seasonalInsight: { ...DEFAULT_DATA.seasonalInsight, ...(safeRemote.seasonalInsight || {}) },
            }));

            // One-time migration: if the old shared document still contains
            // inventory, move those items into their own documents. This avoids
            // Firestore's 1 MiB document limit as the inventory grows.
            if (Array.isArray(legacyInventory) && legacyInventory.length > 0) {
              inventoryColRef.get()
                .then((existing) => {
                  if (existing.empty) {
                    const chunks = [];
                    for (let i = 0; i < legacyInventory.length; i += 450) {
                      chunks.push(legacyInventory.slice(i, i + 450));
                    }
                    return chunks.reduce(
                      (chain, chunk) => chain.then(() => {
                        const batch = db.batch();
                        chunk.forEach((item) => {
                          if (item && item.id) {
                            batch.set(inventoryColRef.doc(String(item.id)), item);
                          }
                        });
                        return batch.commit();
                      }),
                      Promise.resolve()
                    );
                  }
                })
                .catch((e) => console.error("Inventory migration failed:", e));
            }
          } else {
            const initial = { ...DEFAULT_DATA };
            delete initial.inventory;
            sharedDocRef.set(initial).catch((e) => console.error("Initial Firestore write failed:", e));
            remoteUpdateRef.current = true;
            sharedLoadedRef.current = true;
          }
        },
        (err) => {
          console.error("Firestore error:", err);
          hydratedRef.current = false;
          setLoading(false);
        }
      );

      // Each inventory item is now a separate Firestore document. Photos can
      // therefore remain in the item document without making the whole
      // inventory document grow indefinitely.
      unsubscribeInventory = inventoryColRef.onSnapshot(
        (snap) => {
          if (!active) return;
          const inventory = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          inventoryIdsRef.current = new Set(inventory.map((item) => String(item.id)));
          remoteUpdateRef.current = true;
          inventoryLoadedRef.current = true;
          hydratedRef.current = sharedLoadedRef.current && inventoryLoadedRef.current;
          setData((prev) => ({ ...prev, inventory }));
          if (hydratedRef.current) setLoading(false);
        },
        (err) => {
          console.error("Inventory Firestore error:", err);
          hydratedRef.current = false;
          setLoading(false);
        }
      );
    });

    return () => {
      active = false;
      unsubscribeAuth();
      if (unsubscribeShared) unsubscribeShared();
      if (unsubscribeInventory) unsubscribeInventory();
    };
  }, []);

  useEffect(() => {
    if (loading || !currentUser || !hydratedRef.current) return;

    // Never write until BOTH the shared document and the inventory collection
    // have loaded. This prevents a fresh Vercel deployment from briefly seeing
    // an empty inventory and writing that empty state back to Firestore.
    if (!sharedLoadedRef.current || !inventoryLoadedRef.current) return;

    // A Firestore snapshot caused this render. Do not immediately write it
    // back again (which would create a write loop).
    if (remoteUpdateRef.current) {
      remoteUpdateRef.current = false;
      return;
    }

    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);

    writeTimerRef.current = setTimeout(async () => {
      try {
        const { users: _legacyUsers, inventory: _inventory, ...safeData } = data;

        // Keep the shared document small: inventory is stored separately.
        await sharedDocRef.set(safeData);

        const currentIds = new Set((data.inventory || []).map((item) => String(item.id)));
        const oldIds = inventoryIdsRef.current || new Set();

        // Firestore batches are limited to 500 operations, so use 450 per batch.
        const operations = [];
        (data.inventory || []).forEach((item) => {
          if (item && item.id) {
            operations.push({ type: "set", id: String(item.id), item });
          }
        });
        oldIds.forEach((id) => {
          if (!currentIds.has(id)) operations.push({ type: "delete", id });
        });

        for (let i = 0; i < operations.length; i += 450) {
          const batch = db.batch();
          operations.slice(i, i + 450).forEach((op) => {
            const ref = inventoryColRef.doc(op.id);
            if (op.type === "delete") batch.delete(ref);
            else batch.set(ref, op.item);
          });
          await batch.commit();
        }

        inventoryIdsRef.current = currentIds;
      } catch (e) {
        console.error("Firestore write failed:", e);
      }
    }, 500);

    return () => clearTimeout(writeTimerRef.current);
  }, [data, loading, currentUser]);


  const dark = !!(data.settings && data.settings.darkMode);
  const C = dark ? DARK : LIGHT;

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#5B7192", fontFamily: "Inter, sans-serif" }}>Loading...</div>;
  }

  return (
    <ThemeContext.Provider value={{ C, dark }}>
      <div style={{ fontFamily: "Inter, sans-serif" }}>
        <style>{`html, body { background: ${C.bg}; }`}</style>
        {!currentUser ? (
          <LoginScreen />
        ) : (
          <div style={{
            display: "flex", minHeight: "100vh", background: C.bg, position: "relative",
            boxSizing: "border-box",
            paddingLeft: SAFE_LEFT,
            paddingRight: SAFE_RIGHT,
          }}>
            {mode === "desktop" && (
              <Sidebar active={active} setActive={setActive} currentUser={currentUser} data={data} onLogout={() => auth.signOut()} />
            )}
            {mode === "mobile" && drawerOpen && (
              <>
                <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: C.overlay, zIndex: 55 }} />
                <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 60, boxShadow: "4px 0 24px rgba(0,0,0,0.2)" }}>
                  <Sidebar active={active} setActive={setActive} currentUser={currentUser} data={data} onLogout={() => auth.signOut()} isDrawer onClose={() => setDrawerOpen(false)} />
                </div>
              </>
            )}
            <div style={{
              flex: 1, minWidth: 0, width: "100%", boxSizing: "border-box",
              padding: mode === "mobile" ? "18px 20px" : "26px 30px",
              paddingTop: mode === "mobile" ? `max(18px, ${SAFE_TOP})` : `max(26px, ${SAFE_TOP})`,
              paddingBottom: mode === "mobile" ? `max(20px, ${SAFE_BOTTOM})` : `max(26px, ${SAFE_BOTTOM})`,
            }}>
              <TopBar mode={mode} setMode={setMode} onMenuClick={() => setDrawerOpen(true)} title={TABS.find((t) => t.id === active)?.label}
                dark={dark} onToggleDark={() => setData((d) => ({ ...d, settings: { ...(d.settings || {}), darkMode: !(d.settings && d.settings.darkMode) } }))} />
              {active === "overview" && <OverviewTab data={data} setData={setData} currentUser={currentUser} />}
              {active === "pnl" && <PnLTab data={data} mode={mode} />}
              {active === "expenses" && <ExpensesTab data={data} setData={setData} mode={mode} />}
              {active === "balepnl" && <BalePnLTab data={data} setData={setData} mode={mode} />}
              {active === "payout" && <PayoutTab data={data} setData={setData} mode={mode} />}
              {active === "ai" && <AIDescriptionsTab mode={mode} />}
              {active === "scanner" && <PriceScannerTab mode={mode} />}
              {active === "inventory" && <InventoryTab data={data} setData={setData} mode={mode} />}
              {active === "sold" && <SoldItemsTab data={data} setData={setData} mode={mode} />}
              {active === "labels" && <LabelPrintingTab data={data} setData={setData} mode={mode} />}
              {active === "templates" && <MessagingTemplatesTab data={data} setData={setData} mode={mode} />}
              {active === "archive" && <ArchiveTab data={data} setData={setData} mode={mode} />}
              {active === "auth" && <AuthHelpTab />}
              {active === "settings" && <SettingsTab data={data} setData={setData} currentUser={currentUser} mode={mode} />}
            </div>
          </div>
        )}
      </div>
    </ThemeContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
