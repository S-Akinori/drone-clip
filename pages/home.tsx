import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, signInWithPopup, TwitterAuthProvider } from "firebase/auth";
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GoogleIcon from '@mui/icons-material/Google';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import Error from "../src/components/atoms/Error";

const HomePage = () => {
  const auth = useAuth();
  const router = useRouter();
  const [play, setPlay] = useState('');
  const [videos, setVideos] = useState<VideoDoc[] | null>(null);
  const [snsMessage, setSnsMessage] = useState('')
  const [linkedSNS, setLinkedSNS] = useState<string[]>([]);
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

  const linkWithSNS = async (providerName: 'google' | 'facebook' | 'twitter' | 'github') => {
    let provider: GoogleAuthProvider | FacebookAuthProvider | TwitterAuthProvider | GithubAuthProvider | null = null
    if(providerName == 'google') {
      provider = new GoogleAuthProvider();
    } else if(providerName == 'facebook') {
      provider = new FacebookAuthProvider();
    } else if(providerName == 'twitter') {
      provider = new TwitterAuthProvider();
    } else if(providerName == 'github') {
      provider = new GithubAuthProvider();
    }
    if(provider == null) {
      setSnsMessage('連携ができませんでした');
      return
    }

    const user = await auth?.linkSNS(provider, providerName)
    if(user) {
      console.log(user);
      setSnsMessage('連携が完了しました。');
    } else {
      setSnsMessage('連携ができませんでした');
    }
  }

  useEffect(() => {
    if(auth?.user) {
      fetchVideos();
      let providers: string[] = []
      auth.user.providerData.forEach(data => {
        providers.push(data.providerId);
      })
      setLinkedSNS(providers)
    }
  }, [auth])
  return (
    <PrivateRoute>
      <Layout>
        <div className="container mx-auto px-4">
          <h1>ホーム</h1>
          <div className="mb-4">
            <div className="mb-4">{auth?.user?.displayName}さんの購入履歴</div>
            <div className="md:flex items-center border rounded p-4">
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
              {!videos || !videos.length && (
                <div>
                  <div>購入した映像はありません</div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h2>設定</h2>
            <div>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  SNSアカウント連携
                </AccordionSummary>
                <AccordionDetails>
                  <div className="flex justify-center flex-wrap">
                    <div className="text-center mb-4 px-4 w-1/2 md:w-1/4">
                      <Button 
                        onClick={() => linkWithSNS('google')}
                        className="w-full block"
                        style={{background: '#FFF', color: "#222", boxShadow: '2px 2px 2px #ccc'}}
                        disabled={linkedSNS.includes('google.com') ? true : false}
                      >
                        <GoogleIcon />Google
                      </Button>
                      {linkedSNS.includes('google.com') && <div>連携済み</div>}
                    </div>
                    <div className="text-center mb-4 px-4 w-1/2 md:w-1/4">
                      <Button 
                        onClick={() => linkWithSNS('twitter')} 
                        className="w-full block" 
                        style={{background: '#1DA1F2'}}
                        disabled={linkedSNS.includes('twitter.com') ? true : false}
                      >
                        <TwitterIcon /> Twitter
                      </Button>
                      {linkedSNS.includes('twitter.com') && <div>連携済み</div>}
                    </div>
                    <div className="text-center mb-4 px-4 w-1/2 md:w-1/4">
                      <Button 
                        onClick={() => linkWithSNS('facebook')} 
                        className="w-full block" 
                        style={{background: '#1877F2'}}
                        disabled={linkedSNS.includes('facebook.com') ? true : false}
                      >
                        <FacebookIcon /> Facebook
                      </Button>
                      {linkedSNS.includes('facebook.com') && <div>連携済み</div>}
                    </div>
                    <div className="text-center mb-4 px-4 w-1/2 md:w-1/4">
                      <Button 
                        onClick={() => linkWithSNS('github')} 
                        className="w-full block" 
                        style={{background: '#24292f'}}
                        disabled={linkedSNS.includes('github.com') ? true : false}
                      >
                        <GitHubIcon /> GitHub
                      </Button>
                      {linkedSNS.includes('github.com') && <div>連携済み</div>}
                    </div>
                  </div>
                  {snsMessage && <Error>{snsMessage}</Error>}
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  ログアウト
                </AccordionSummary>
                <AccordionDetails>
                  <Button onClick={onClick}>ログアウト</Button>
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        </div>
      </Layout>
    </PrivateRoute>
  )
}
export default HomePage;