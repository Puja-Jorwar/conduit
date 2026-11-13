"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, CheckCircle, XCircle, Clock, Activity, Layers, AlertTriangle } from "lucide-react";
import { getIntegrations, getStats, triggerSync } from "@/lib/api";

const sourceEmoji: Record<string, string> = {
  razorpay: "💳", zoho: "🟠", tally: "📊",
  whatsapp: "💬", gst: "🇮🇳", shiprocket: "🚀",
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{label}</p>
          <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: '10px',
          background: `${color}22`, border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );
}

function IntegrationRow({ integration, onSync, isSyncing }: { integration: any; onSync: (id: string) => void; isSyncing: boolean }) {
  const isActive = integration.is_active;

  return (
    <div className="glass-card" style={{
      padding: '20px 24px', display: 'flex',
      alignItems: 'center', gap: '16px', marginBottom: '10px',
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
        background: isSyncing ? '#f59e0b' : isActive ? 'var(--green)' : 'var(--red)',
      }} className={isActive && !isSyncing ? 'status-dot-green' : ''} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '24px' }}>{sourceEmoji[integration.source_type] || '🔌'}</span>
        <div>
          <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>{integration.name}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {integration.source_type} → {integration.destination_type}
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'right', minWidth: '140px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Last sync: {timeAgo(integration.last_synced_at)}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Schedule: {integration.schedule}
        </p>
      </div>

      <div style={{ minWidth: '90px', textAlign: 'center' }}>
        {isSyncing
          ? <span className="badge badge-yellow"><RefreshCw size={11} /> Syncing</span>
          : isActive
            ? <span className="badge badge-green"><CheckCircle size={11} /> Active</span>
            : <span className="badge badge-red"><XCircle size={11} /> Inactive</span>
        }
      </div>

      <button onClick={() => onSync(integration.id)} className="btn-secondary"
        style={{ padding: '7px 14px', fontSize: '13px' }} disabled={isSyncing}>
        <RefreshCw size={13} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
        {isSyncing ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total_success: 0, total_failed: 0, total_records_synced: 0 });
  const [loading, setLoading] = useState(true);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
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

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      const [intData, statsData] = await Promise.all([
        getIntegrations(userId),
        getStats(userId),
      ]);
      setIntegrations(intData);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      setError('Cannot reach backend. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSync = async (id: string) => {
    setSyncingIds(prev => new Set(prev).add(id));
    try {
      const result = await triggerSync(id);
      alert(`✅ ${result.message}`);
      setTimeout(loadData, 2000);
    } catch (err: any) {
      alert(`❌ Sync failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setSyncingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  if (!userId) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const total = integrations.length;
  const healthy = integrations.filter(i => i.is_active).length;
  const failed = stats.total_failed || 0;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }} className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '4px' }}>Welcome back 👋</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Real-time health status of all your integrations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadData} className="btn-secondary" style={{ padding: '9px 16px', fontSize: '13px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <Link href="/integrations" className="btn-primary">
            <Plus size={16} /> Add Integration
          </Link>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: '10px',
          padding: '14px 18px', marginBottom: '24px', fontSize: '14px', color: 'var(--red)',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon={Layers} label="Total Integrations" value={loading ? '...' : total} color="#8b5cf6" />
        <StatCard icon={CheckCircle} label="Active & Syncing" value={loading ? '...' : healthy} color="#10b981" />
        <StatCard icon={AlertTriangle} label="Syncs Failed (24h)" value={loading ? '...' : failed} color="#ef4444" />
        <StatCard icon={Activity} label="Records Synced Today" value={loading ? '...' : parseInt(stats.total_records_synced || 0).toLocaleString()} color="#3b82f6" />
      </div>

      {/* Integrations list */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 600 }}>Your Integrations</h2>
          <Link href="/logs" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            View all logs →
          </Link>
        </div>

        {loading ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p>Loading integrations from database...</p>
          </div>
        ) : integrations.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No integrations set up yet.</p>
            <Link href="/integrations" className="btn-primary">
              <Plus size={16} /> Add Your First Integration
            </Link>
          </div>
        ) : (
          integrations.map(integration => (
            <IntegrationRow
              key={integration.id}
              integration={integration}
              onSync={handleSync}
              isSyncing={syncingIds.has(integration.id)}
            />
          ))
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
