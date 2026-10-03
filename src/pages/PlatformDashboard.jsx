import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase.js';

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ShopCard({ shop, onApprove, onReject, busy, showActions }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-bold truncate">{shop.shopName}</p>
          <p className="text-sm text-muted truncate">{shop.ownerName}</p>
        </div>
        <span className="text-xs text-muted whitespace-nowrap">
          {formatDate(shop.createdAt)}
        </span>
      </div>
      <p className="text-sm text-muted truncate">WhatsApp: {shop.whatsappNumber}</p>
      <p className="text-sm text-muted truncate mb-3">Email: {shop.email}</p>

      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(shop.id)}
            disabled={busy}
            className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(shop.id)}
            disabled={busy}
            className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-danger disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function PlatformDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  async function loadAll() {
    try {
      const [pendingSnap, approvedSnap, rejectedSnap, retailersSnap] = await Promise.all([
        getDocs(query(collection(db, 'wholesalers'), where('approved', '==', false), where('rejected', '==', false))),
        getDocs(query(collection(db, 'wholesalers'), where('approved', '==', true))),
        getDocs(query(collection(db, 'wholesalers'), where('rejected', '==', true))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'retailer'))),
      ]);

      setPending(pendingSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setApproved(approvedSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setRejected(rejectedSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setRetailers(retailersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setError('Could not load admin data. ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function approve(id) {
    setBusyId(id);
    try {
      await updateDoc(doc(db, 'wholesalers', id), { approved: true, rejected: false });
      await loadAll();
    } catch (err) {
      console.error(err);
      alert('Could not approve: ' + (err?.message || 'unknown error'));
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id) {
    const shop = pending.find((s) => s.id === id);
    const ok = window.confirm(
      `Reject ${shop?.shopName || 'this wholesaler'}?\n\nThey will not be able to sell on the platform.`
    );
    if (!ok) return;

    setBusyId(id);
    try {
      await updateDoc(doc(db, 'wholesalers', id), { rejected: true, approved: false });
      await loadAll();
    } catch (err) {
      console.error(err);
      alert('Could not reject: ' + (err?.message || 'unknown error'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    navigate('/login', { replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">Loading…</div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <h1 className="font-bold text-lg text-ink">Platform Admin</h1>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-brand"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <section>
          <h2 className="text-lg font-bold mb-1">
            Pending wholesalers ({pending.length})
          </h2>
          <p className="text-sm text-muted mb-3">Review and approve new shop signups.</p>
          {pending.length === 0 ? (
            <div className="rounded-xl border border-line bg-white p-4 text-sm text-muted">
              No pending wholesalers.
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((s) => (
                <ShopCard
                  key={s.id}
                  shop={s}
                  showActions
                  busy={busyId === s.id}
                  onApprove={approve}
                  onReject={reject}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold mb-1">
            Approved wholesalers ({approved.length})
          </h2>
          <p className="text-sm text-muted mb-3">Shops currently selling on the platform.</p>
          {approved.length === 0 ? (
            <div className="rounded-xl border border-line bg-white p-4 text-sm text-muted">
              No approved wholesalers yet.
            </div>
          ) : (
            <div className="space-y-3">
              {approved.map((s) => (
                <ShopCard key={s.id} shop={s} showActions={false} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold mb-1">
            Rejected wholesalers ({rejected.length})
          </h2>
          <p className="text-sm text-muted mb-3">
            Applications that were rejected.
          </p>
          {rejected.length === 0 ? (
            <div className="rounded-xl border border-line bg-white p-4 text-sm text-muted">
              None yet.
            </div>
          ) : (
            <div className="space-y-3">
              {rejected.map((s) => (
                <ShopCard key={s.id} shop={s} showActions={false} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold mb-1">Retailers ({retailers.length})</h2>
          <p className="text-sm text-muted mb-3">All registered buyers.</p>
          {retailers.length === 0 ? (
            <div className="rounded-xl border border-line bg-white p-4 text-sm text-muted">
              No retailers yet.
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-white divide-y divide-line">
              {retailers.map((r) => (
                <div key={r.id} className="p-4">
                  <p className="font-semibold truncate">{r.email}</p>
                  <p className="text-xs text-muted">
                    Joined: {formatDate(r.createdAt)} · Last active: {formatDate(r.lastActiveAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}