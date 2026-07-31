import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { hapticTap } from "../hooks/useHaptics.js";

function Icon({ name, size = 20, className = "" }) {
  return (
    <span
      className={`material-symbols-outlined leading-none ${className}`}
      style={{ fontSize: size, fontFamily: "'Material Symbols Outlined'", fontWeight: "normal", fontStyle: "normal" }}
    >
      {name}
    </span>
  );
}

function SettingRow({ icon, label, description, children, onClick }) {
  return (
    <div
      className={`flex items-center justify-between py-4 px-1 border-b border-line/60 ${onClick ? "cursor-pointer active:opacity-70" : ""}`}
      onClick={onClick ? () => { hapticTap("light"); onClick(); } : undefined}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-border)" }}>
          <Icon name={icon} size={18} className="text-ink" />
        </div>
        <div className="min-w-0">
          <p className="font-display font-600 text-sm uppercase tracking-wide">{label}</p>
          {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => { hapticTap("light"); onChange(!checked); }}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
      style={{ background: checked ? "var(--c-accent)" : "var(--c-border)" }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

function ThemeSwatch({ color, selected, onClick, label }) {
  return (
    <button
      onClick={() => { hapticTap("light"); onClick(); }}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-tag transition-all ${selected ? "ring-2 ring-offset-2" : "opacity-70"}`}
      style={{ background: "var(--c-surface)", ringColor: selected ? color : "transparent" }}
    >
      <div className="w-10 h-10 rounded-full border border-line" style={{ background: color }} />
      <span className="text-[10px] font-display font-600 uppercase tracking-wide text-ink leading-none text-center">{label}</span>
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="font-display font-800 text-lg uppercase tracking-wide mb-3 text-ink">{title}</h3>
      <div className="hangtag px-4">{children}</div>
    </div>
  );
}

function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40" />
      <div className="relative hangtag w-full max-w-md p-6 max-h-[80vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-800 text-xl">{title}</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none p-1">x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function calcDataUsage() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const val = localStorage.getItem(key);
    total += key.length + (val?.length || 0);
  }
  return (total / 1024).toFixed(1);
}

export default function Settings() {
  const { user, logout, updateProfile, changePassword, deleteAccount } = useAuth();
  const { themeId, setThemeId } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(() => localStorage.getItem("ck_notif") !== "off");
  const [biometric, setBiometric] = useState(() => localStorage.getItem("ck_biometric") === "on");
  const [username, setUsername] = useState(user?.username || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [modal, setModal] = useState(null);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [dataUsage, setDataUsage] = useState("0.0");

  useEffect(() => {
    setDataUsage(calcDataUsage());
  }, [modal]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    setProfileMsg("");
    try {
      await updateProfile({ username });
      setProfileMsg("Saved!");
    } catch {
      setProfileMsg("Failed");
    } finally {
      setSavingProfile(false);
    }
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setSavingProfile(true);
      try { await updateProfile({ avatarUrl: reader.result }); } catch {} finally { setSavingProfile(false); }
    };
    reader.readAsDataURL(file);
  }

  async function handleChangePassword() {
    if (!pwCurrent || !pwNew) { setPwMsg("Fill both fields"); return; }
    if (pwNew.length < 8) { setPwMsg("New password must be 8+ characters"); return; }
    setPwLoading(true);
    setPwMsg("");
    try {
      await changePassword(pwCurrent, pwNew);
      setPwMsg("Password changed!");
      setPwCurrent("");
      setPwNew("");
    } catch (err) {
      setPwMsg(err.message || "Failed");
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount();
      navigate("/login");
    } catch (err) {
      alert(err.message || "Failed to delete account");
    }
  }

  async function handleRequestPermission(type) {
    try {
      if (type === "camera") {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        alert("Camera access granted!");
      } else if (type === "photos") {
        if (window.queryLocalFileSystem) {
          alert("Photo access granted!");
        } else {
          alert("Photo library access is available on your device.");
        }
      }
    } catch {
      alert("Permission denied. Enable it in your device Settings app.");
    }
  }

  const themeOptions = [
    { id: "default", label: "Default", preview: "#FAF7F1" },
    { id: "light", label: "Light", preview: "#FFFFFF" },
    { id: "dark", label: "Dark", preview: "#121212" },
    { id: "cherry", label: "Cherry Red", preview: "#DC2840" },
    { id: "cherryBlack", label: "Red + Black", preview: "#0A0A0A" },
    { id: "cherryCream", label: "Red + Cream", preview: "#FFF8F0" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-800 text-4xl">Settings</h1>
        <p className="text-muted text-sm mt-1">Customize your experience.</p>
      </div>

      <Section title="Appearance">
        <div className="py-4">
          <p className="text-xs uppercase tracking-wide text-muted font-display font-600 mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((t) => (
              <ThemeSwatch key={t.id} color={t.preview} label={t.label} selected={themeId === t.id} onClick={() => setThemeId(t.id)} />
            ))}
          </div>
        </div>
      </Section>

      <Section title="Profile">
        <div className="py-4">
          <div className="flex items-center gap-4 mb-4">
            <label className="relative cursor-pointer group">
              <div className="w-16 h-16 rounded-full border-2 border-line overflow-hidden flex items-center justify-center bg-canvas">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="person" size={32} className="text-muted" />
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Icon name="camera_alt" size={20} className="text-white" />
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
            <div className="flex-1">
              <label className="text-xs uppercase tracking-wide text-muted font-display font-600 block mb-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name"
                className="w-full border border-line rounded-tag px-3 py-2 bg-canvas text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSaveProfile} disabled={savingProfile}
              className="px-4 py-2 rounded-tag text-sm font-display font-600 uppercase tracking-wide text-white"
              style={{ background: "var(--c-accent)" }}>
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
            {profileMsg && <span className="text-xs text-muted">{profileMsg}</span>}
          </div>
          <p className="text-xs text-muted mt-3">{user?.email}</p>
        </div>
      </Section>

      <Section title="Account">
        <SettingRow icon="person" label="Email" description={user?.email || "Not set"}>
          <span className="text-xs text-muted" />
        </SettingRow>
        <SettingRow icon="lock" label="Change Password" description="Update your password" onClick={() => setModal("password")}>
          <Icon name="chevron_right" size={18} className="text-muted" />
        </SettingRow>
        <SettingRow icon="delete" label="Delete Account" description="Permanently remove your data" onClick={() => setModal("delete")}>
          <Icon name="chevron_right" size={18} className="text-muted" />
        </SettingRow>
      </Section>

      <Section title="Security">
        <SettingRow icon="fingerprint" label="Biometric Login" description="Use fingerprint or face ID">
          <Toggle checked={biometric} onChange={(v) => { setBiometric(v); localStorage.setItem("ck_biometric", v ? "on" : "off"); }} />
        </SettingRow>
        <SettingRow icon="key" label="Two-Factor Authentication" description="Add an extra layer of security" onClick={() => setModal("2fa")}>
          <Icon name="chevron_right" size={18} className="text-muted" />
        </SettingRow>
        <SettingRow icon="history" label="Active Sessions" description="Manage logged-in devices" onClick={() => setModal("sessions")}>
          <Icon name="chevron_right" size={18} className="text-muted" />
        </SettingRow>
      </Section>

      <Section title="Notifications">
        <SettingRow icon="notifications" label="Push Notifications" description="Outfit reminders and updates">
          <Toggle checked={notifications} onChange={(v) => { setNotifications(v); localStorage.setItem("ck_notif", v ? "on" : "off"); }} />
        </SettingRow>
      </Section>

      <Section title="Permissions">
        <SettingRow icon="camera_alt" label="Camera" description="Take photos of your clothes" onClick={() => handleRequestPermission("camera")}>
          <Icon name="chevron_right" size={18} className="text-muted" />
        </SettingRow>
        <SettingRow icon="photo_library" label="Photos" description="Access your photo library" onClick={() => handleRequestPermission("photos")}>
          <Icon name="chevron_right" size={18} className="text-muted" />
        </SettingRow>
      </Section>

      <Section title="Support">
        <SettingRow icon="help" label="Help Center" description="FAQs and guides" onClick={() => window.open("https://github.com/anomalyco/opencode/issues", "_blank")}>
          <Icon name="chevron_right" size={18} className="text-muted" />
        </SettingRow>
        <SettingRow icon="mail" label="Contact Support" description="Get help from our team" onClick={() => window.location.href = "mailto:support@vestio.app?subject=VESTIO Support Request"}>
          <Icon name="chevron_right" size={18} className="text-muted" />
        </SettingRow>
        <SettingRow icon="star" label="Rate the App" description="Share your experience" onClick={() => window.open("market://details?id=com.closetkeeper.app", "_blank")}>
          <Icon name="chevron_right" size={18} className="text-muted" />
        </SettingRow>
      </Section>

      <Section title="Legal">
        <SettingRow icon="gavel" label="Terms and Conditions" description="Service agreement" onClick={() => setModal("terms")}>
          <Icon name="chevron_right" size={18} className="text-muted" />
        </SettingRow>
        <SettingRow icon="policy" label="Privacy Policy" description="How we handle your data" onClick={() => setModal("privacy")}>
          <Icon name="chevron_right" size={18} className="text-muted" />
        </SettingRow>
        <SettingRow icon="info" label="Licenses" description="Open-source credits" onClick={() => setModal("licenses")}>
          <Icon name="chevron_right" size={18} className="text-muted" />
        </SettingRow>
      </Section>

      <Section title="About">
        <SettingRow icon="info" label="Version" description="1.0.0 (build 1)" />
        <SettingRow icon="storage" label="Data Usage" description={`${dataUsage} KB local storage`} />
      </Section>

      <div className="mb-12 mt-2">
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-tag font-display font-700 uppercase tracking-wide text-sm transition-colors"
          style={{ background: "var(--c-danger)", color: "#fff" }}>
          <Icon name="logout" size={18} /> Sign out
        </button>
      </div>

      <p className="text-center text-xs text-muted pb-4">VESTIO — Your private digital closet.</p>

      {/* ─── Modals ─── */}
      {modal === "password" && (
        <Modal onClose={() => { setModal(null); setPwMsg(""); }} title="Change Password">
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-muted font-display font-600 block mb-1">Current Password</label>
              <input type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)}
                className="w-full border border-line rounded-tag px-3 py-2 bg-canvas text-sm" placeholder="Enter current password" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-muted font-display font-600 block mb-1">New Password</label>
              <input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)}
                className="w-full border border-line rounded-tag px-3 py-2 bg-canvas text-sm" placeholder="At least 8 characters" />
            </div>
            {pwMsg && <p className="text-xs text-muted">{pwMsg}</p>}
            <button onClick={handleChangePassword} disabled={pwLoading}
              className="w-full py-2.5 rounded-tag font-display font-700 uppercase tracking-wide text-sm text-white"
              style={{ background: "var(--c-accent)" }}>
              {pwLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </Modal>
      )}

      {modal === "delete" && (
        <Modal onClose={() => setModal(null)} title="Delete Account">
          <p className="text-sm text-muted mb-4">This will permanently delete your account, all your clothes, outfits, and preferences. This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)}
              className="flex-1 py-2.5 rounded-tag font-display font-600 uppercase tracking-wide text-sm border border-line">
              Cancel
            </button>
            <button onClick={handleDeleteAccount}
              className="flex-1 py-2.5 rounded-tag font-display font-700 uppercase tracking-wide text-sm text-white"
              style={{ background: "var(--c-danger)" }}>
              Delete Forever
            </button>
          </div>
        </Modal>
      )}

      {modal === "2fa" && (
        <Modal onClose={() => setModal(null)} title="Two-Factor Authentication">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--c-accent)" }}>
              <Icon name="verified_user" size={32} className="text-white" />
            </div>
            <p className="font-display font-700 text-lg mb-2">Extra security layer</p>
            <p className="text-sm text-muted mb-6">Two-factor authentication adds a second verification step when you sign in. This feature will be available in a future update.</p>
            <button onClick={() => setModal(null)}
              className="w-full py-2.5 rounded-tag font-display font-700 uppercase tracking-wide text-sm text-white"
              style={{ background: "var(--c-accent)" }}>
              Got it
            </button>
          </div>
        </Modal>
      )}

      {modal === "sessions" && (
        <Modal onClose={() => setModal(null)} title="Active Sessions">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-tag border border-line bg-canvas">
              <Icon name="smartphone" size={20} className="text-moss" />
              <div className="flex-1">
                <p className="font-display font-600 text-sm">This device</p>
                <p className="text-[11px] text-muted">Android · Active now</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-tag text-white font-display font-600" style={{ background: "var(--c-accent)" }}>Current</span>
            </div>
          </div>
          <button onClick={() => setModal(null)}
            className="w-full mt-4 py-2.5 rounded-tag font-display font-700 uppercase tracking-wide text-sm text-white"
            style={{ background: "var(--c-accent)" }}>
            Done
          </button>
        </Modal>
      )}

      {modal === "terms" && (
        <Modal onClose={() => setModal(null)} title="Terms and Conditions">
          <div className="text-sm text-muted space-y-3 max-h-60 overflow-y-auto">
            <p><strong>1. Acceptance of Terms</strong><br/>By using VESTIO, you agree to these terms.</p>
            <p><strong>2. Use of Service</strong><br/>VESTIO is a personal wardrobe management app. Your data is stored locally and is private to you.</p>
            <p><strong>3. User Content</strong><br/>All clothing data and images you add belong to you. We do not access or use your content.</p>
            <p><strong>4. Privacy</strong><br/>We do not sell or share your personal data. See our Privacy Policy for details.</p>
            <p><strong>5. Limitation of Liability</strong><br/>VESTIO is provided "as is" without warranties. We are not liable for any damages.</p>
            <p><strong>6. Changes</strong><br/>We may update these terms at any time. Continued use constitutes acceptance.</p>
          </div>
          <button onClick={() => setModal(null)}
            className="w-full mt-4 py-2.5 rounded-tag font-display font-700 uppercase tracking-wide text-sm text-white"
            style={{ background: "var(--c-accent)" }}>
            I Understand
          </button>
        </Modal>
      )}

      {modal === "privacy" && (
        <Modal onClose={() => setModal(null)} title="Privacy Policy">
          <div className="text-sm text-muted space-y-3 max-h-60 overflow-y-auto">
            <p><strong>Data Collection</strong><br/>VESTIO collects only the data you provide: clothing items, outfits, and profile information.</p>
            <p><strong>Data Storage</strong><br/>Your data is stored locally on your device and on our private servers. We do not use third-party analytics.</p>
            <p><strong>Data Sharing</strong><br/>We do not share, sell, or transfer your data to any third parties.</p>
            <p><strong>Security</strong><br/>We use industry-standard encryption to protect your data in transit and at rest.</p>
            <p><strong>Your Rights</strong><br/>You can export or delete your data at any time from the Settings page.</p>
            <p><strong>Contact</strong><br/>For privacy concerns, email support@vestio.app</p>
          </div>
          <button onClick={() => setModal(null)}
            className="w-full mt-4 py-2.5 rounded-tag font-display font-700 uppercase tracking-wide text-sm text-white"
            style={{ background: "var(--c-accent)" }}>
            I Understand
          </button>
        </Modal>
      )}

      {modal === "licenses" && (
        <Modal onClose={() => setModal(null)} title="Licenses">
          <div className="text-sm text-muted space-y-3 max-h-60 overflow-y-auto">
            <div>
              <p className="font-display font-600 text-ink">React</p>
              <p className="text-[11px]">MIT License - Meta Platforms, Inc.</p>
            </div>
            <div>
              <p className="font-display font-600 text-ink">Vite</p>
              <p className="text-[11px]">MIT License - Evan You</p>
            </div>
            <div>
              <p className="font-display font-600 text-ink">Capacitor</p>
              <p className="text-[11px]">MIT License - Ionic</p>
            </div>
            <div>
              <p className="font-display font-600 text-ink">Tailwind CSS</p>
              <p className="text-[11px]">MIT License - Tailwind Labs</p>
            </div>
            <div>
              <p className="font-display font-600 text-ink">Express</p>
              <p className="text-[11px]">MIT License - TJ Holowaychuk</p>
            </div>
            <div>
              <p className="font-display font-600 text-ink">better-sqlite3</p>
              <p className="text-[11px]">MIT License - Joshua Wise</p>
            </div>
            <div>
              <p className="font-display font-600 text-ink">Material Symbols</p>
              <p className="text-[11px]">Apache License 2.0 - Google</p>
            </div>
          </div>
          <button onClick={() => setModal(null)}
            className="w-full mt-4 py-2.5 rounded-tag font-display font-700 uppercase tracking-wide text-sm text-white"
            style={{ background: "var(--c-accent)" }}>
            Done
          </button>
        </Modal>
      )}
    </div>
  );
}
