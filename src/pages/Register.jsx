import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../lib/registerUser.js';

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try signing in.';
    case 'auth/invalid-email':
      return 'That email address looks wrong.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Could not reach the server. Check your connection.';
    default:
      return 'Registration failed (' + code + ').';
  }
}

const inputClass =
  'block w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-base text-ink ' +
  'focus:outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft';

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState('retailer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (role === 'wholesaler') {
      const digits = whatsappNumber.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        setError('WhatsApp number should be 10–15 digits, e.g. 256772123456');
        return;
      }
      if (!shopName.trim() || !ownerName.trim()) {
        setError('Shop name and owner name are required.');
        return;
      }
    }

    setBusy(true);
    try {
      await registerUser({
        role,
        email,
        password,
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        whatsappNumber,
      });

      if (role === 'wholesaler') navigate('/wholesaler', { replace: true });
      else navigate('/shop', { replace: true });
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-7 shadow-lg shadow-ink/5">
        <h1 className="text-center text-2xl font-bold mb-1">Create an account</h1>
        <p className="text-center text-sm text-muted mb-5">Choose how you'll use the platform</p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setRole('retailer')}
            className={
              'rounded-lg border px-3 py-2.5 text-sm font-semibold ' +
              (role === 'retailer'
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-white text-muted')
            }
          >
            I'm a buyer
          </button>
          <button
            type="button"
            onClick={() => setRole('wholesaler')}
            className={
              'rounded-lg border px-3 py-2.5 text-sm font-semibold ' +
              (role === 'wholesaler'
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-white text-muted')
            }
          >
            I'm a wholesaler
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {role === 'wholesaler' && (
            <>
              <div className="mb-4">
                <label className="block mb-1.5 text-xs font-semibold text-muted">Shop name</label>
                <input
                  className={inputClass}
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Mukwano Wholesales"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1.5 text-xs font-semibold text-muted">Owner name</label>
                <input
                  className={inputClass}
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Kato"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1.5 text-xs font-semibold text-muted">
                  WhatsApp number
                </label>
                <input
                  className={inputClass}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="256772123456"
                  required
                />
                <p className="text-xs text-muted mt-1">
                  Include country code. Digits only — no +, no spaces.
                </p>
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block mb-1.5 text-xs font-semibold text-muted">Email</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1.5 text-xs font-semibold text-muted">Password</label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted mt-1">At least 6 characters.</p>
          </div>

          {error && (
            <p className="mb-3.5 rounded-lg bg-danger/10 px-3 py-2 text-[13.5px] text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="block w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}