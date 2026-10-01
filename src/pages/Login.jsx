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
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', textAlign: 'center' }}>
        <h1>Signed in</h1>
        <p>{user.email}</p>
        <button onClick={handleSignOut}>Sign out</button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', maxWidth: 360, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 12 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>
        {error && <p style={{ color: '#b42318' }}>{error}</p>}
        <button type="submit" disabled={busy} style={{ width: '100%', padding: 10 }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
