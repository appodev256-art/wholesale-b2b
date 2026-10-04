import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase.js';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function formatPrice(n) {
  return Number(n).toLocaleString('en-UG');
}

function buildWhatsAppLink({ number, shopName, productName, price, unit, retailerName }) {
  const lines = [
    `Hello ${shopName},`,
    '',
    `I'd like to order:`,
    `• ${productName} — UGX ${Number(price).toLocaleString('en-UG')} / ${unit}`,
    '',
    `My name is ${retailerName}. Is it available?`,
  ];
  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${number}?text=${text}`;
}

export default function Shop() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const wsSnap = await getDocs(
          query(collection(db, 'wholesalers'), where('approved', '==', true))
        );
        const approvedIds = wsSnap.docs.map((d) => d.id);

        if (approvedIds.length === 0) {
          setProducts([]);
          return;
        }

        const chunks = [];
        for (let i = 0; i < approvedIds.length; i += 10) {
          chunks.push(approvedIds.slice(i, i + 10));
        }

        const all = [];
        for (const chunk of chunks) {
          const pSnap = await getDocs(
            query(collection(db, 'products'), where('wholesalerId', 'in', chunk))
          );
          pSnap.forEach((d) => all.push({ id: d.id, ...d.data() }));
        }

        all.sort((a, b) => {
          const at = a.createdAt?.seconds ?? 0;
          const bt = b.createdAt?.seconds ?? 0;
          return bt - at;
        });

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

  function handleOrder(product) {
    if (!user) {
      navigate('/login?next=/shop');
      return;
    }

    const retailerName =
      user.displayName || user.email?.split('@')[0] || 'a buyer';

    const link = buildWhatsAppLink({
      number: product.wholesalerWhatsapp,
      shopName: product.wholesalerShopName,
      productName: product.productName,
      price: product.price,
      unit: product.unit,
      retailerName,
    });

    window.open(link, '_blank', 'noopener,noreferrer');
  }

  const visible = products.filter((p) =>
    p.productName.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header showSearch searchValue={search} onSearch={setSearch} />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
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

        {!loading && !error && products.length > 0 && visible.length === 0 && (
          <div className="rounded-2xl border border-line bg-white p-6 text-center">
            <p className="text-muted">No products match “{search}”.</p>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
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
                    onClick={() => handleOrder(p)}
                    className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Order on WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}