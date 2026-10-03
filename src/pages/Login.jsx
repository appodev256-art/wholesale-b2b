import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.js';

function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks wrong.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'No account matches that email and password.';
    case 'auth/wrong-password':
      return 'That password is wrong.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a bit and try again.';
    case 'auth/network-request-failed':
      return 'Could not reach Firebase. Check your connection.';
    default:
      return 'Sign-in failed (' + code + ').';
  }
}

const inputClass =
  'block w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-base text-ink ' +
  'focus:outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Look up the role and route accordingly.
      const snap = await getDoc(doc(db, 'users', result.user.uid));
      if (!snap.exists()) {
        setError('No role assigned to this account. Contact the platform admin.');
        return;
      }

      const role = snap.data().role;
      if (role === 'platform') navigate('/platform', { replace: true });
      else if (role === 'wholesaler') navigate('/wholesaler', { replace: true });
      else if (role === 'retailer') navigate('/retailer', { replace: true });
      else setError('Unknown role: ' + role);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-7 shadow-lg shadow-ink/5">
        <h1 className="text-center text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-center text-sm text-muted mb-5">Sign in to your wholesale account</p>
        <form onSubmit={handleSubmit}>
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
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
<p className="text-center text-sm text-muted mt-5">
  New here?{' '}
  <Link to="/register" className="text-brand font-semibold">
    Create an account
  </Link>
</p>
      </div>
    </div>
  );
}