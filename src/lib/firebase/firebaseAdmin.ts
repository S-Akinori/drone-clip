import admin from "firebase-admin"

const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(
    /\\n/g,
    "\n"
  ),
}

// if(admin.apps.length === 0) {
//   if(process.env.NEXT_PUBLIC_ENV === 'production') {
//     console.log('prod admin')
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//       storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
//     });
//   } else {
//     console.log('test admin')
//     admin.initializeApp({
//       projectId: "test",
//       credential: admin.credential.applicationDefault(),
//     });
//   }
// } else {
//   console.log('admin is already inisialized')
// }

// export {admin as firebaseAdmin}

export const firebaseAdmin = admin.apps[0] || admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
});