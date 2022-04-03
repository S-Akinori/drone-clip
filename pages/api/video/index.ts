import type { NextApiRequest, NextApiResponse } from 'next'
import { firebaseAdmin } from '../../../src/lib/firebase/firebaseAdmin'
import {VideoDoc} from '../../../src/lib/types/videoDoc'

type Response = {
  videoDocs: VideoDoc[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const {start} = req.body
  const db = firebaseAdmin.firestore();
  const videoRef = db.collection('videos');
  const query = start ? 
  videoRef.where('state', '==', 'public').limit(40).orderBy('favorite', 'desc').startAfter(start) : 
  videoRef.where('state', '==', 'public').limit(40).orderBy('favorite', 'desc');
  const querySnapshot = await query.get();
  let videoDocs: VideoDoc[] = []
  querySnapshot.forEach(async (doc) => {
    const videoDoc = doc.data() as VideoDoc;
    videoDoc.id = doc.id
    // const url = await getDownloadURL(ref(storage, encodeURI(doc.data().fullPath)))
    let storageURL = ''
    if(process.env.NEXT_PUBLIC_ENV === 'production') {
      storageURL = 'https://firebasestorage.googleapis.com'
    } else {
      storageURL = 'http://localhost:9199'
    }
    const url = `${storageURL}/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(doc.data().sampleFullPath)}?alt=media`
    videoDoc.url = url
    videoDocs.push(videoDoc)
  })
  
  res.status(200).json({ videoDocs: videoDocs})
}