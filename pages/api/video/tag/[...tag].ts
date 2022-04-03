import type { NextApiRequest, NextApiResponse } from 'next'
import { firebaseAdmin } from '../../../../src/lib/firebase/firebaseAdmin'
import {VideoDoc} from '../../../../src/lib/types/videoDoc'

type Props = {
  tags: string[]
}
type Response = {
  videoDocs: VideoDoc[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const {tag} = req.query;
  const {start} = req.body
  const db = firebaseAdmin.firestore();
  const videoRef = db.collection('videos');
  console.log(start)
  const query = start ? 
  videoRef.where('tags', 'array-contains-any', tag).where('state', '==', 'public').orderBy('favorite', 'desc').startAfter(start).limit(40) : 
  videoRef.where('tags', 'array-contains-any', tag).where('state', '==', 'public').orderBy('favorite', 'desc').limit(40);
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

    // memo : 一致するタグが多い動画ほど優先的に表示させるように整理したい！！
  })
  
  res.status(200).json({ videoDocs: videoDocs})
}