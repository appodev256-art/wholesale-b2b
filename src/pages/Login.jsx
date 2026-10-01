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
      <div className="screen-center">
        <div className="card">
          <h1>Signed in</h1>
          <p className="email-chip">{user.email}</p>
          <button className="btn ghost" onClick={handleSignOut}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-center">
      <div className="card">
        <h1>Welcome back</h1>
        <p className="lede">Sign in to your wholesale account</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn accent" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
