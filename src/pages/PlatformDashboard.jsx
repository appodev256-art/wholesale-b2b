import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

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
            className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(shop.id)}
            disabled={busy}
            className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-danger hover:bg-paper disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function PlatformDashboard() {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  async function loadAll() {
    try {
      const [wholesalersSnap, retailersSnap] = await Promise.all([
        getDocs(collection(db, 'wholesalers')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'retailer'))),
      ]);

      const allWholesalers = wholesalersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setPending(
        allWholesalers.filter((s) => s.approved !== true && s.rejected !== true)
      );
      setApproved(allWholesalers.filter((s) => s.approved === true));
      setRejected(allWholesalers.filter((s) => s.rejected === true));

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 flex items-center justify-center text-muted">
          Loading…
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Admin</h1>
          <p className="text-sm text-muted">Manage wholesalers and retailers on the platform.</p>
        </div>

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
          <p className="text-sm text-muted mb-3">Applications that were rejected.</p>
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
      </main>

      <Footer />
    </div>
  );
}