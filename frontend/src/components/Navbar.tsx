"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, LogOut } from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Integrations", href: "/integrations" },
  { label: "Logs", href: "/logs" },
  { label: "Settings", href: "/settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Read user from localStorage on mount
    const savedUser = localStorage.getItem("conduit_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("conduit_user");
    setUser(null);
    router.push("/");
    window.location.reload();
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '64px',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
      backgroundColor: 'rgba(6, 9, 18, 0.85)',
      display: 'flex', alignItems: 'center',
      padding: '0 32px',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34, borderRadius: '8px',
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={18} color="white" fill="white" />
        </div>
        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          Conduit
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {navLinks.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-card)' : 'transparent',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}>
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <>
            <span style={{
              fontSize: '13px', color: 'var(--text-secondary)',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              padding: '5px 12px', borderRadius: '999px',
            }}>
              🇮🇳 {user.plan ? `${user.plan.toUpperCase()} Plan` : 'Starter Plan'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, color: 'white',
              }} title={user.name}>
                {getInitials(user.name)}
              </div>
              <button 
                onClick={handleLogout} 
                className="btn-secondary" 
                style={{ padding: '6px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/login" className="btn-secondary" style={{ padding: '7px 14px', fontSize: '13px' }}>
              Login
            </Link>
            <Link href="/register" className="btn-primary" style={{ padding: '7px 14px', fontSize: '13px' }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
