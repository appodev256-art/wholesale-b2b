import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase.js';

export default function Header({ onSearch, searchValue = '', showSearch = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  async function handleSignOut() {
    await signOut(auth);
    navigate('/shop', { replace: true });
  }

  return (
    <header className="border-b border-line bg-white sticky top-0 z-20">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
        <Link to="/shop" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="Wholesale B2B" className="h-9 w-9 object-contain" />
          <span className="font-bold text-lg text-ink hidden sm:inline">
            Wholesale B2B
          </span>
        </Link>

        {showSearch && (
          <div className="flex-1 max-w-xl">
            <input
              type="search"
              value={searchValue}
              onChange={(e) => onSearch?.(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft"
            />
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {user ? (
            <>
              <span className="text-sm text-muted hidden sm:inline max-w-[160px] truncate">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-brand hover:bg-paper"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-brand hover:bg-paper"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}