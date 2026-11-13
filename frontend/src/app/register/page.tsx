"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerCustomer } from "@/lib/api";
import { UserPlus, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await registerCustomer({ name, email, password });
      // Save customer session info to localStorage
      localStorage.setItem("conduit_user", JSON.stringify(user));
      // Redirect to dashboard
      router.push("/dashboard");
      // Trigger a page reload to notify Navbar
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '60px auto', padding: '0 20px' }} className="page-enter">
      <div className="glass-card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <UserPlus size={22} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Create your Account</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Start building integrations for your startup.
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
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ritesh Arora"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Work Email
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
              placeholder="Min. 8 characters"
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
            {loading ? "Creating account..." : "Sign Up"} <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '24px' }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: 'var(--accent-purple-bright)', textDecoration: 'none', fontWeight: 500 }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
