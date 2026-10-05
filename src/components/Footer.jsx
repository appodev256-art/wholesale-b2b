import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase.js';

export default function Footer() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  async function handleSignOut() {
    await signOut(auth);
    navigate('/shop', { replace: true });
  }

  return (
    <footer className="border-t border-line bg-white mt-8">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src="/logo.png" alt="Wholesale B2B" className="h-7 w-7 object-contain" />
              <span className="font-bold text-ink">Wholesale B2B</span>
            </div>
            <p className="text-sm text-muted">
              Connect with trusted wholesalers. Order directly on WhatsApp.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-ink mb-2">Quick links</h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link to="/shop" className="text-muted hover:text-brand">
                  Browse products
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted hover:text-brand">
                  Create an account
                </Link>
              </li>
              {!user && (
                <li>
                  <Link to="/login" className="text-muted hover:text-brand">
                    Sign in
                  </Link>
                </li>
              )}
              {user && (
                <li>
                  <button
                    onClick={handleSignOut}
                    className="text-muted hover:text-brand"
                  >
                    Sign out
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-ink mb-2">For wholesalers</h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link to="/register" className="text-muted hover:text-brand">
                  Sell on Wholesale B2B
                </Link>
              </li>
              <li>
                <span className="text-muted">Order support: coming soon</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted">
            © {year} Wholesale B2B. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            Made in Uganda 🇺🇬
          </p>
        </div>
      </div>
    </footer>
  );
}