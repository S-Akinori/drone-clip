import { collection, getDocs, query, where } from "firebase/firestore";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import Button from "../src/components/atoms/Button";
import Layout from "../src/components/templates/Layout"
import { useAuth } from "../src/lib/auth/auth"
import PrivateRoute from "../src/lib/auth/PrivateRoute"
import { db } from "../src/lib/firebase/firebase";
import { VideoDoc } from "../src/lib/types/videoDoc";

const HomePage = () => {
  const auth = useAuth();
  const router = useRouter();
  const [play, setPlay] = useState('');
  const [videos, setVideos] = useState<VideoDoc[] | null>(null);
  const onClick = async () => {
    const isSuccessful = await auth?.signout();
    console.log(isSuccessful)
    if(isSuccessful) {
      router.push('/');
    } else {
      console.log('error')
    }
  }

  const fetchVideos = async() => {
    const q = query(collection(db, "videos"), where('owner.uid', '==', auth?.user?.uid));
    const querySnapshot = await getDocs(q);
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
      const url = `${storageURL}/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(doc.data().fullPath)}?alt=media`
      videoDoc.url = url
      videoDocs.push(videoDoc)
    })
    setVideos(videoDocs)
  }

  useEffect(() => {
    if(auth?.user) {
      fetchVideos();
    }
  }, [auth])
  return (
    <PrivateRoute>
      <Layout>
        <div className="container mx-auto">
          <h1>ホーム</h1>
          <div className="mb-4">
            <div className="mb-4">{auth?.user?.displayName}さんの購入履歴</div>
            <div className="md:flex items-center ">
              {videos && videos.map(video => (
                <div className="md:w-1/3" key={video.id}>
                  <Link href={`video/${video.id}`}>
                    <a>
                      <ReactPlayer
                        url={video.url}
                        width="100%" 
                        height="100%" 
                        muted
                        loop
                        playing={play == video.id ? true : false}
                        onMouseOver={() => setPlay(video.id)}
                        onMouseLeave={() => setPlay('')}
                      />
                      <div className='bg-base text-base-cont py-1 px-2'>{video.title}</div>
                    </a>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={onClick}>サインアウト</Button>
        </div>
      </Layout>
    </PrivateRoute>
  )
}
export default HomePage;