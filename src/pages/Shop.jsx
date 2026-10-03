import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase.js';

function formatPrice(n) {
  return Number(n).toLocaleString('en-UG');
}

export default function Shop() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        // Load all approved wholesalers first, so we know whose products to show.
        const wsSnap = await getDocs(
          query(collection(db, 'wholesalers'), where('approved', '==', true))
        );
        const approvedIds = wsSnap.docs.map((d) => d.id);

        if (approvedIds.length === 0) {
          setProducts([]);
          return;
        }

        // Firestore 'in' queries cap at 10 — chunk if needed.
        const chunks = [];
        for (let i = 0; i < approvedIds.length; i += 10) {
          chunks.push(approvedIds.slice(i, i + 10));
        }

        const all = [];
        for (const chunk of chunks) {
          const pSnap = await getDocs(
            query(
              collection(db, 'products'),
              where('wholesalerId', 'in', chunk),
              orderBy('createdAt', 'desc')
            )
          );
          pSnap.forEach((d) => all.push({ id: d.id, ...d.data() }));
        }
        setProducts(all);
      } catch (err) {
        console.error(err);
        setError('Could not load the shop right now.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link to="/shop" className="font-bold text-lg text-ink">
            Wholesale Market
          </Link>
          <div className="flex gap-2">
            <Link
              to="/login"
              className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-brand"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">Browse products</h1>
        <p className="text-sm text-muted mb-5">
          Order directly from wholesalers on WhatsApp.
        </p>

        {loading && <p className="text-sm text-muted">Loading…</p>}

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-line bg-white p-6 text-center">
            <p className="text-muted">No products yet. Check back soon.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-line bg-white"
              >
                <div className="aspect-square bg-paper flex items-center justify-center">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.productName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-muted text-sm">No image</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold truncate">{p.productName}</p>
                  <p className="text-sm text-muted mb-1">{p.wholesalerShopName}</p>
                  <p className="font-bold text-ink">
                    UGX {formatPrice(p.price)}{' '}
                    <span className="text-sm font-normal text-muted">/ {p.unit}</span>
                  </p>
                  <button
                    disabled
                    className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white opacity-90"
                    title="Coming next step"
                  >
                    Order on WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}