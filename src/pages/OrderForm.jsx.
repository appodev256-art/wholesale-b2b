import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.js';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const inputClass =
  'block w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-base text-ink ' +
  'focus:outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft';

const emptyItem = { productName: '', quantity: '1', unit: '', requestedBrand: '' };

// Generates a reference like ORD-20261019-A7K2
function makeOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${date}-${suffix}`;
}

export default function OrderForm() {
  const navigate = useNavigate();

  // Contact details
  const [shopName, setShopName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Items list
  const [items, setItems] = useState([{ ...emptyItem }]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [successRef, setSuccessRef] = useState('');

  function updateItem(index, key, value) {
    setItems((old) =>
      old.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  }

  function addItem() {
    setItems((old) => [...old, { ...emptyItem }]);
  }

  function removeItem(index) {
    setItems((old) => old.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!shopName.trim() || !contactName.trim() || !phone.trim() || !deliveryAddress.trim()) {
      setError('Please fill in Shop name, Contact person, Phone, and Delivery address.');
      return;
    }

    const validItems = items
      .filter((it) => it.productName.trim())
      .map((it) => ({
        productName: it.productName.trim(),
        quantity: Number(it.quantity) || 1,
        unit: it.unit.trim(),
        requestedBrand: it.requestedBrand.trim(),
      }));

    if (validItems.length === 0) {
      setError('Add at least one item to your order.');
      return;
    }

    if (validItems.some((it) => !Number.isFinite(it.quantity) || it.quantity <= 0)) {
      setError('Each item must have a valid quantity greater than 0.');
      return;
    }

    setBusy(true);
    try {
      const orderNumber = makeOrderNumber();

      await addDoc(collection(db, 'orders'), {
        orderNumber,
        retailerId: auth.currentUser?.uid || null,
        shopName: shopName.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim() || '',
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim() || '',
        items: validItems,
        status: 'pending',
        currency: 'UGX',
        createdAt: serverTimestamp(),
      });

      setSuccessRef(orderNumber);
    } catch (err) {
      console.error(err);
      setError('Could not submit your order. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  // Success screen
  if (successRef) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand text-2xl">
              ✓
            </div>
            <h1 className="text-xl font-bold mb-2">Order received</h1>
            <p className="text-sm text-muted mb-4">
              Your order has been submitted successfully. Keep this reference:
            </p>
            <p className="text-lg font-bold text-ink mb-6">{successRef}</p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/shop')}
                className="flex-1 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-brand"
              >
                Back to shop
              </button>
              <button
                onClick={() => {
                  setSuccessRef('');
                  setShopName(''); setContactName(''); setPhone('');
                  setEmail(''); setDeliveryAddress(''); setNotes('');
                  setItems([{ ...emptyItem }]);
                }}
                className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white"
              >
                New order
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // The form
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Place an order</h1>
          <p className="text-sm text-muted">
            Submit your order details and we'll get back to you to confirm.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Contact details */}
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-bold mb-3">Your details</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-muted">
                  Shop name *
                </label>
                <input
                  className={inputClass}
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. City Traders"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-muted">
                  Contact person *
                </label>
                <input
                  className={inputClass}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-muted">
                  Phone number *
                </label>
                <input
                  className={inputClass}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+256..."
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-muted">
                  Email (optional)
                </label>
                <input
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block mb-1.5 text-xs font-semibold text-muted">
                  Delivery address *
                </label>
                <input
                  className={inputClass}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Town, area and delivery location"
                  required
                />
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-bold mb-1">Items to order</h2>
            <p className="text-sm text-muted mb-4">
              Add each product you'd like to order.
            </p>

            <div className="space-y-3">
              {items.map((it, index) => (
                <div key={index} className="rounded-xl bg-paper p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">Item {index + 1}</h3>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-xs font-semibold text-danger"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1.5 text-xs font-semibold text-muted">
                      Product name *
                    </label>
                    <input
                      className={inputClass}
                      value={it.productName}
                      onChange={(e) => updateItem(index, 'productName', e.target.value)}
                      placeholder="e.g. Cooking oil"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block mb-1.5 text-xs font-semibold text-muted">
                        Quantity
                      </label>
                      <input
                        className={inputClass}
                        type="number"
                        min="1"
                        step="1"
                        value={it.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-xs font-semibold text-muted">
                        Unit
                      </label>
                      <input
                        className={inputClass}
                        value={it.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        placeholder="Carton"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-xs font-semibold text-muted">
                        Brand (opt)
                      </label>
                      <input
                        className={inputClass}
                        value={it.requestedBrand}
                        onChange={(e) => updateItem(index, 'requestedBrand', e.target.value)}
                        placeholder="Any"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-3 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-brand hover:bg-paper"
            >
              + Add another item
            </button>
          </section>

          {/* Notes */}
          <section className="rounded-2xl border border-line bg-white p-5">
            <label className="block mb-1.5 text-xs font-semibold text-muted">
              Additional instructions (optional)
            </label>
            <textarea
              className={inputClass}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Delivery instructions or special requirements"
            />
          </section>

          {error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="block w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy ? 'Submitting order…' : 'Submit order'}
          </button>

          <p className="text-center text-xs text-muted">
            Submitting this form sends your order to the supplier for review. Prices
            and availability will be confirmed separately.
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}