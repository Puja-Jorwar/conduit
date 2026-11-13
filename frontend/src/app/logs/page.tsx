"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { getLogs } from "@/lib/api";

const sourceEmoji: Record<string, string> = {
  razorpay: "💳", zoho: "🟠", tally: "📊",
  whatsapp: "💬", gst: "🇮🇳", shiprocket: "🚀",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDuration(seconds: number | string | null) {
  if (!seconds) return '—';
  const s = parseFloat(String(seconds));
  if (isNaN(s)) return '—';
  if (s < 1) return `${Math.round(s * 1000)}ms`;
  return `${s.toFixed(1)}s`;
}

export default function LogsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
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

  const loadLogs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getLogs(userId, filter === 'all' ? undefined : filter, 50);
      setLogs(data);
      setError(null);
    } catch (err: any) {
      setError('Cannot reach backend. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [userId, filter]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  if (!userId) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const successCount = logs.filter(l => l.status === 'success').length;
  const failedCount = logs.filter(l => l.status === 'failed').length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }} className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '4px' }}>Sync Logs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Every sync event, success, and failure — logged from your live database.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-green"><CheckCircle size={11} /> {successCount} OK</span>
          <span className="badge badge-red"><XCircle size={11} /> {failedCount} Failed</span>
          <button onClick={loadLogs} className="btn-secondary" style={{ padding: '7px 14px', fontSize: '13px' }}>
            <RefreshCw size={13} /> Refresh
          </button>
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

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { key: 'all', label: 'All Logs' },
          { key: 'success', label: 'Success' },
          { key: 'failed', label: 'Failed' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={filter === f.key ? "btn-primary" : "btn-secondary"}
            style={{ padding: '7px 16px', fontSize: '13px' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 100px 80px 80px 120px',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border)',
          fontSize: '12px', fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          <span>Integration</span>
          <span>Status</span>
          <span>Records</span>
          <span>Duration</span>
          <span>Source</span>
          <span>Time</span>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={22} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
            <p>Loading logs from database...</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No logs found. Trigger a sync from the dashboard to see logs here.
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={log.id} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 100px 80px 80px 120px',
              padding: '14px 20px',
              borderBottom: i < logs.length - 1 ? '1px solid var(--border)' : 'none',
              alignItems: 'center', transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{log.integration_name}</p>
                {log.error_message && (
                  <p style={{ fontSize: '12px', color: 'var(--red)', marginTop: '2px' }}>
                    ⚠ {log.error_message}
                  </p>
                )}
              </div>

              <div>
                {log.status === 'success'
                  ? <span className="badge badge-green"><CheckCircle size={11} /> Success</span>
                  : log.status === 'processing'
                    ? <span className="badge badge-blue"><RefreshCw size={11} /> Running</span>
                    : <span className="badge badge-red"><XCircle size={11} /> Failed</span>
                }
              </div>

              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {(log.records_synced || 0).toLocaleString()}
              </span>

              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} /> {formatDuration(log.duration_seconds)}
              </span>

              <span style={{ fontSize: '20px' }}>
                {sourceEmoji[log.source_type] || '🔌'}
              </span>

              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {timeAgo(log.started_at)}
              </span>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
