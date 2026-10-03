import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.js';

export default function WholesalerDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          navigate('/login', { replace: true });
          return;
        }
        const snap = await getDoc(doc(db, 'wholesalers', uid));
        if (!snap.exists()) {
          setError('No shop profile found for this account.');
        } else {
          setShop(snap.data());
        }
      } catch (err) {
        console.error(err);
        setError('Could not load your shop.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  async function handleSignOut() {
    await signOut(auth);
    navigate('/login', { replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-7 text-center">
          <p className="text-danger mb-4">{error}</p>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-brand"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Not yet approved — waiting screen.
  if (!shop.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent text-2xl">
            ⏳
          </div>
          <h1 className="text-xl font-bold mb-2">Your shop is under review</h1>
          <p className="text-sm text-muted mb-5">
            Thanks, {shop.ownerName}. We've received your registration for{' '}
            <span className="font-semibold text-ink">{shop.shopName}</span>. The
            platform admin will review it shortly. You'll be able to add products
            once you're approved.
          </p>
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-brand"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Approved — placeholder for now.
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-7 text-center">
        <h1 className="text-xl font-bold mb-2">{shop.shopName}</h1>
        <p className="text-sm text-muted mb-5">Your shop is approved! Products coming next.</p>
        <button
          onClick={handleSignOut}
          className="w-full rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-brand"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}