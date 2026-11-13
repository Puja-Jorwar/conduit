import Link from "next/link";
import { ArrowRight, Zap, Shield, Activity, Globe } from "lucide-react";

const features = [
  { icon: Zap, title: "Indian Stack First", desc: "Native support for Razorpay, Tally, Zoho, GST Network, and WhatsApp Business API." },
  { icon: Shield, title: "Bank-Grade Security", desc: "AES-256-GCM encryption for all credentials. Your API keys never stored in plain text." },
  { icon: Activity, title: "Silent Failure Detection", desc: "Proactive health monitoring catches broken integrations before your customers do." },
  { icon: Globe, title: "AI-Powered Setup", desc: "Describe your integration in plain English. Our AI reads API docs and builds the connector." },
];

const stats = [
  { value: "₹5,999", label: "per month vs $800 for global tools" },
  { value: "< 5 min", label: "setup time per integration" },
  { value: "99.9%", label: "uptime SLA for syncs" },
  { value: "3x", label: "faster than building in-house" },
];

export default function LandingPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }} className="page-enter">

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 0 60px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)',
          padding: '6px 16px', borderRadius: '999px', marginBottom: '24px',
          fontSize: '13px', color: '#a78bfa',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
          Built for Indian SaaS founders
        </div>

        <h1 style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '20px' }}>
          The integration layer{' '}
          <span className="gradient-text">Indian SaaS</span>{' '}
          <br />companies actually need
        </h1>

        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 36px', lineHeight: 1.7 }}>
          Connect Razorpay, Tally, Zoho, and 20+ Indian tools in minutes.
          No engineers required. No ₹60,000/month enterprise pricing.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/dashboard" className="btn-primary" style={{ fontSize: '15px', padding: '12px 24px' }}>
            Open Dashboard <ArrowRight size={16} />
          </Link>
          <Link href="/integrations" className="btn-secondary" style={{ fontSize: '15px', padding: '12px 24px' }}>
            See Integrations
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px', background: 'var(--border)',
        border: '1px solid var(--border)', borderRadius: '12px',
        overflow: 'hidden', marginBottom: '80px',
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, textAlign: 'center', marginBottom: '48px', letterSpacing: '-0.5px' }}>
          Everything global platforms <span className="gradient-text">forgot to build</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: '28px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '10px', marginBottom: '16px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2))',
                border: '1px solid rgba(124,58,237,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <f.icon size={20} color="#a78bfa" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        textAlign: 'center', padding: '60px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(37,99,235,0.15) 100%)',
        border: '1px solid rgba(124,58,237,0.25)',
        marginBottom: '80px',
      }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>Ready to sync your Indian SaaS stack?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '15px' }}>
          Start for free. No credit card required. First 3 integrations on us.
        </p>
        <Link href="/dashboard" className="btn-primary" style={{ fontSize: '15px', padding: '12px 28px' }}>
          Start Building <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
