import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../lib/firebase.js';

// Firebase's error codes, turned into messages a non-technical person can read.
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Keeps `user` in sync if Firebase already has someone signed in (e.g. after a refresh).
  useState(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    setUser(null);
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-7 shadow-lg shadow-ink/5">
          <h1 className="text-center text-2xl font-bold mb-1">Signed in</h1>
          <p className="text-center text-sm text-muted mb-5">{user.email}</p>
          <button
            className="block w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm font-semibold text-brand"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
    );
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
      </div>
    </div>
  );
}
