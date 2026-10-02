import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js';

export function useRole() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setRole(null);
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        setRole(snap.exists() ? snap.data().role : null);
      } catch (err) {
        console.error('useRole: failed to load role', err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  return { user, role, loading };
}