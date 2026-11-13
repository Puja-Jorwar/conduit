"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";

const connectors = [
  {
    id: "razorpay", name: "Razorpay", emoji: "💳", category: "Payments",
    desc: "Sync payments, settlements, refunds, and GST data automatically.",
    badge: "Popular",
  },
  {
    id: "zoho", name: "Zoho CRM", emoji: "🟠", category: "CRM",
    desc: "Sync contacts, leads, deals, and account data from your Zoho CRM.",
    badge: "OAuth",
  },
  {
    id: "tally", name: "Tally ERP", emoji: "📊", category: "Accounting",
    desc: "Sync invoices, vouchers, and ledger data from your Tally Prime installation.",
    badge: "India Only",
  },
  {
    id: "whatsapp", name: "WhatsApp Business", emoji: "💬", category: "Messaging",
    desc: "Sync WhatsApp Business messages, conversations, and contact data.",
    badge: "New",
  },
  {
    id: "gst", name: "GSTN Portal", emoji: "🇮🇳", category: "Compliance",
    desc: "Auto-fetch GST return data, ITC claims, and GSTR filing status.",
    badge: "India Only",
  },
  {
    id: "shiprocket", name: "Shiprocket", emoji: "🚀", category: "Logistics",
    desc: "Sync orders, shipment tracking, delivery status and courier data.",
    badge: "New",
  },
];

const badgeColors: Record<string, string> = {
  Popular: "badge-purple",
  OAuth: "badge-blue",
  "India Only": "badge-green",
  New: "badge-yellow",
};

export default function IntegrationsPage() {
  const [search, setSearch] = useState("");

  const filtered = connectors.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }} className="page-enter">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '4px' }}>Integrations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Connect your Indian SaaS tools in minutes, not weeks.
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '28px' }}>
        <input
          type="text"
          placeholder="🔍  Search integrations — Razorpay, Tally, Zoho..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '10px', color: 'var(--text-primary)',
            fontSize: '14px', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-purple-bright)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {filtered.map(connector => (
          <div key={connector.id} className="glass-card" style={{ padding: '24px' }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>{connector.emoji}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '15px' }}>{connector.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{connector.category}</p>
                </div>
              </div>
              <span className={`badge ${badgeColors[connector.badge] || 'badge-blue'}`} style={{ flexShrink: 0 }}>
                {connector.badge}
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              {connector.desc}
            </p>

            <Link
              href={`/integrations/setup/${connector.id}`}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '9px' }}
            >
              Connect {connector.name} <ArrowRight size={14} />
            </Link>
          </div>
        ))}

        {/* Request custom connector card */}
        <div className="glass-card" style={{
          padding: '24px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          border: '1px dashed var(--border-bright)', cursor: 'pointer',
          minHeight: '200px',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '10px',
            background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <Plus size={22} color="#a78bfa" />
          </div>
          <p style={{ fontWeight: 600, marginBottom: '6px' }}>Request a Connector</p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Need a tool that's not listed? We'll build it.
          </p>
        </div>
      </div>
    </div>
  );
}
