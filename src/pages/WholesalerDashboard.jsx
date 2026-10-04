import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase.js';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const inputClass =
  'block w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-base text-ink ' +
  'focus:outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft';

export default function WholesalerDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [error, setError] = useState('');

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function loadShop() {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          navigate('/login', { replace: true });
          return;
        }
        const snap = await getDoc(doc(db, 'wholesalers', uid));
        if (!snap.exists()) setError('No shop profile found for this account.');
        else setShop(snap.data());
      } catch (err) {
        console.error(err);
        setError('Could not load your shop.');
      } finally {
        setLoading(false);
      }
    }
    loadShop();
  }, [navigate]);

  useEffect(() => {
    async function loadProducts() {
      if (!shop || !shop.approved || shop.rejected) {
        setProductsLoading(false);
        return;
      }
      try {
        const uid = auth.currentUser.uid;
        const q = query(collection(db, 'products'), where('wholesalerId', '==', uid));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
          const at = a.createdAt?.seconds ?? 0;
          const bt = b.createdAt?.seconds ?? 0;
          return bt - at;
        });
        setProducts(list);
      } catch (err) {
        console.error(err);
      } finally {
        setProductsLoading(false);
      }
    }
    loadProducts();
  }, [shop]);

  async function handleAddProduct(e) {
    e.preventDefault();
    setFormError('');

    const trimmedName = productName.trim();
    const trimmedUnit = unit.trim();
    const priceNum = Number(price);

    if (!trimmedName) return setFormError('Product name is required.');
    if (!Number.isFinite(priceNum) || priceNum <= 0 || !Number.isInteger(priceNum))
      return setFormError('Price must be a whole number greater than 0.');
    if (!trimmedUnit) return setFormError('Unit is required (e.g. Bale, Piece, Carton).');
    if (imageUrl && !/^https?:\/\//i.test(imageUrl.trim()))
      return setFormError('Image URL should start with http:// or https://');

    setSaving(true);
    try {
      const uid = auth.currentUser.uid;
      const newDoc = {
        wholesalerId: uid,
        wholesalerShopName: shop.shopName,
        wholesalerWhatsapp: shop.whatsappNumber,
        productName: trimmedName,
        price: priceNum,
        unit: trimmedUnit,
        imageUrl: imageUrl.trim() || '',
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, 'products'), newDoc);

      setProducts((prev) => [{ id: ref.id, ...newDoc, createdAt: new Date() }, ...prev]);

      setProductName('');
      setPrice('');
      setUnit('');
      setImageUrl('');
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setFormError('Could not save product. Try again.');
    } finally {
      setSaving(false);
    }
  }

  // ----- States -----

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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-7 text-center">
            <p className="text-danger">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Rejected
  if (shop.rejected) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger text-2xl">
              ✕
            </div>
            <h1 className="text-xl font-bold mb-2">Your application was rejected</h1>
            <p className="text-sm text-muted">
              We're sorry, {shop.ownerName}. Your shop{' '}
              <span className="font-semibold text-ink">{shop.shopName}</span> wasn't
              approved. If you believe this is a mistake, please contact the
              platform admin.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Pending
  if (!shop.approved) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent text-2xl">
              ⏳
            </div>
            <h1 className="text-xl font-bold mb-2">Your shop is under review</h1>
            <p className="text-sm text-muted">
              Thanks, {shop.ownerName}. We've received your registration for{' '}
              <span className="font-semibold text-ink">{shop.shopName}</span>. The
              platform admin will review it shortly. You'll be able to add products
              once you're approved.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Approved — full dashboard
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">{shop.shopName}</h1>
          <p className="text-sm text-muted">
            {shop.ownerName} · WhatsApp: {shop.whatsappNumber}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Your products ({products.length})</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                + Add product
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleAddProduct} className="mb-5 rounded-xl bg-paper p-4">
              <div className="mb-3">
                <label className="block mb-1.5 text-xs font-semibold text-muted">
                  Product name
                </label>
                <input
                  className={inputClass}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Bale of T-shirts"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-muted">
                    Price (UGX)
                  </label>
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="150000"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-muted">Unit</label>
                  <input
                    className={inputClass}
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Bale / Piece / Carton"
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block mb-1.5 text-xs font-semibold text-muted">
                  Image URL (optional)
                </label>
                <input
                  className={inputClass}
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              {formError && (
                <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-[13.5px] text-danger">
                  {formError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormError('');
                  }}
                  className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-muted hover:bg-paper"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {productsLoading ? (
            <p className="text-sm text-muted">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted">
              No products yet. Tap “Add product” to create your first one.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {products.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover bg-paper"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-paper flex items-center justify-center text-muted text-xs">
                      no img
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.productName}</p>
                    <p className="text-sm text-muted">
                      UGX {p.price.toLocaleString()} / {p.unit}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}