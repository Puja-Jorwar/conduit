"use client";
import { Key, Bell, Shield, CreditCard, ChevronRight } from "lucide-react";

const settingsSections = [
  {
    icon: Key,
    title: "API Keys",
    desc: "Manage your Conduit API keys for programmatic access.",
    action: "Manage Keys",
  },
  {
    icon: Bell,
    title: "Alert Notifications",
    desc: "Configure Slack, email, or webhook alerts when integrations fail.",
    action: "Configure",
  },
  {
    icon: Shield,
    title: "Security",
    desc: "Two-factor authentication, session management, and access logs.",
    action: "View Settings",
  },
  {
    icon: CreditCard,
    title: "Billing & Plan",
    desc: "You are on the Indian SaaS Starter plan — ₹4,999/month. Upgrade anytime.",
    action: "Manage Plan",
  },
];

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }} className="page-enter">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '4px' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Manage your account preferences and integrations.
        </p>
      </div>

      {/* Account info */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 700, color: 'white', flexShrink: 0,
        }}>
          TF
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: '15px' }}>Test Founder</p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>founder@conduit.io</p>
        </div>
        <span className="badge badge-green">🇮🇳 Starter Plan</span>
      </div>

      {/* Settings sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {settingsSections.map((s, i) => (
          <div key={i} className="glass-card" style={{
            padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: '16px',
            cursor: 'pointer',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '9px',
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <s.icon size={18} color="#a78bfa" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{s.title}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.desc}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px', flexShrink: 0 }}>
              {s.action} <ChevronRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
