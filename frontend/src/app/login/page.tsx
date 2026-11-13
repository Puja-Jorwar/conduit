"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginCustomer } from "@/lib/api";
import { Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await loginCustomer({ email, password });
      // Save customer session info to localStorage
      localStorage.setItem("conduit_user", JSON.stringify(user));
      // Redirect to dashboard
      router.push("/dashboard");
      // Trigger a page reload to notify Navbar
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '80px auto', padding: '0 20px' }} className="page-enter">
      <div className="glass-card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <Lock size={20} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Log in to manage your integrations.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--red-dim)', border: '1px solid var(--red)',
            color: 'var(--red)', fontSize: '13px', padding: '10px 14px',
            borderRadius: '8px', marginBottom: '20px',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
          >
            {loading ? "Logging in..." : "Login"} <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '24px' }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: 'var(--accent-purple-bright)', textDecoration: 'none', fontWeight: 500 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
