import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase.js';

// Strips everything except digits. WhatsApp wa.me links need digits only.
export function cleanPhone(input) {
  return (input || '').replace(/\D/g, '');
}

// Creates:
//   users/{uid}                { email, role, createdAt }
//   wholesalers/{uid}          { shopName, ownerName, whatsappNumber, email, approved:false, createdAt }  (wholesaler only)
export async function registerUser({ role, email, password, shopName, ownerName, whatsappNumber }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  await setDoc(doc(db, 'users', uid), {
    email,
    role,
    createdAt: serverTimestamp(),
  });

  if (role === 'wholesaler') {
  await setDoc(doc(db, 'wholesalers', uid), {
    shopName,
    ownerName,
    whatsappNumber: cleanPhone(whatsappNumber),
    email,
    approved: false,
    rejected: false,
    createdAt: serverTimestamp(),
  });
}

  return cred.user;
}