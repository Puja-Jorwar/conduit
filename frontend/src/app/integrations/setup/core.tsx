"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createIntegration } from "@/lib/api";
import { ArrowLeft, Save, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

interface FormField {
  key: string;
  label: string;
  type: string;
  placeholder: string;
  description: string;
}

const connectorConfigs: Record<string, {
  name: string;
  emoji: string;
  description: string;
  fields: FormField[];
}> = {
  razorpay: {
    name: "Razorpay",
    emoji: "💳",
    description: "Sync your transactions, payments, fees, and GST details into your database.",
    fields: [
      { key: "key_id", label: "Key ID", type: "text", placeholder: "rzp_test_...", description: "Find this in settings → API Keys on your Razorpay dashboard." },
      { key: "key_secret", label: "Key Secret", type: "password", placeholder: "••••••••", description: "The secret associated with your Key ID." }
    ]
  },
  zoho: {
    name: "Zoho CRM",
    emoji: "🟠",
    description: "Connect your Zoho CRM account to keep sales pipelines, contacts, and leads synchronized.",
    fields: [
      { key: "client_id", label: "Client ID", type: "text", placeholder: "1000.xxxxxxxxxxxxxxx", description: "Created inside the Zoho Developer Console." },
      { key: "client_secret", label: "Client Secret", type: "password", placeholder: "••••••••", description: "The client secret for your Zoho App." },
      { key: "refresh_token", label: "Refresh Token", type: "text", placeholder: "1000.xxxx.xxxx", description: "Generated token used to request new API access sessions." }
    ]
  },
  tally: {
    name: "Tally ERP / Prime",
    emoji: "📊",
    description: "Sync invoices, vouchers, and bookkeeping entries from your local desktop Tally application.",
    fields: [
      { key: "tally_host", label: "Tally Host URL", type: "text", placeholder: "http://localhost:9000", description: "The URL where your local Tally XML server is running." },
      { key: "company_name", label: "Tally Company Name", type: "text", placeholder: "e.g. My Startup Private Limited", description: "Exactly as written inside Tally ERP." }
    ]
  }
};

export default function IntegrationSetupPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [userId, setUserId] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [integrationName, setIntegrationName] = useState("");
  const [schedule, setSchedule] = useState("hourly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticate user session
  useEffect(() => {
    const savedUser = localStorage.getItem("conduit_user");
    if (!savedUser) {
      router.push("/login");
    } else {
      setUserId(JSON.parse(savedUser).id);
    }
  }, [router]);

  const targetConnector = connectorConfigs[id];

  // Set default integration name once connector matches
  useEffect(() => {
    if (targetConnector) {
      setIntegrationName(`${targetConnector.name} Sync`);
    }
  }, [targetConnector]);

  if (!targetConnector) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Invalid Connector Type.</p>
        <Link href="/integrations" style={{ color: 'var(--accent-purple-bright)' }}>Go back</Link>
      </div>
    );
  }

  const handleFieldChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError(null);

    // Validate config values are not empty
    const missingFields = targetConnector.fields.filter(f => !config[f.key]);
    if (missingFields.length > 0) {
      setError(`Please fill in all config details: ${missingFields.map(f => f.label).join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      await createIntegration({
        customerId: userId,
        name: integrationName,
        sourceType: id,
        destinationType: "postgresql",
        config,
        schedule
      });
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save integration. Ensure backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }} className="page-enter">
      
      {/* Back button */}
      <Link href="/integrations" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--text-secondary)', textDecoration: 'none',
        fontSize: '13px', marginBottom: '24px'
      }}>
        <ArrowLeft size={14} /> Back to Integrations
      </Link>

      <div className="glass-card" style={{ padding: '36px' }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '28px' }}>
          <span style={{ fontSize: '48px', lineHeight: 1 }}>{targetConnector.emoji}</span>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
              Connect {targetConnector.name}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {targetConnector.description}
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div style={{
          display: 'flex', gap: '10px', alignItems: 'center',
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '10px 14px', borderRadius: '8px', marginBottom: '24px',
          color: 'var(--green)', fontSize: '12px'
        }}>
          <Sparkles size={16} />
          <span>API keys are encrypted in transit and at rest using AES-256-GCM.</span>
        </div>

        {error && (
          <div style={{
            background: 'var(--red-dim)', border: '1px solid var(--red)',
            color: 'var(--red)', fontSize: '13px', padding: '12px 16px',
            borderRadius: '8px', marginBottom: '24px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Integration Name */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Connection Name
            </label>
            <input
              type="text"
              required
              value={integrationName}
              onChange={e => setIntegrationName(e.target.value)}
              placeholder="e.g. My Production Sync"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
              }}
            />
          </div>

          {/* Dynamic Configuration Fields */}
          {targetConnector.fields.map(field => (
            <div key={field.key}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                {field.label}
              </label>
              <input
                type={field.type}
                required
                value={config[field.key] || ''}
                onChange={e => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                  marginBottom: '4px'
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{field.description}</span>
            </div>
          ))}

          {/* Schedule selector */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Sync Frequency
            </label>
            <select
              value={schedule}
              onChange={e => setSchedule(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="hourly">Every Hour (Recommended)</option>
              <option value="daily">Once a Day</option>
              <option value="weekly">Once a Week</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Connecting...
              </>
            ) : (
              <>
                <Save size={16} /> Save Integration
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
