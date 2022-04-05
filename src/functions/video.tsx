import { firebaseAdmin } from '../../src/lib/firebase/firebaseAdmin'
import {VideoDoc} from '../../src/lib/types/videoDoc'

interface Props {
  start?: number
  tags?: string[]
}

export const fetchVideos = async ({start, tags}: Props = {}) => {
  const db = firebaseAdmin.firestore();
  const videoRef = db.collection('videos');
  let query = videoRef.where('state', '==', 'public')
  if(tags) {
    query = query.where('tags', 'array-contains-any', tags);
  } 
  if(start) {
    query = query.startAfter(start)
  }
  query.orderBy('favorite', 'desc').limit(40)
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
  return videoDocs;
}