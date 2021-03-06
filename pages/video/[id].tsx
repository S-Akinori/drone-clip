import { IconButton, Modal, TextField } from "@mui/material"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { collection, doc, getDoc, getDocs, onSnapshot, updateDoc } from "firebase/firestore"
import { getBlob, getDownloadURL, ref, StringFormat } from "firebase/storage"
import { GetStaticPaths, GetStaticProps } from "next"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import ReactPlayer from "react-player"
import Button from "../../src/components/atoms/Button"
import CheckoutForm from "../../src/components/organisms/CheckoutForm"
import Layout from "../../src/components/templates/Layout"
import { db, storage } from "../../src/lib/firebase/firebase"
import CloseIcon from '@mui/icons-material/Close';
import { VideoDoc } from "../../src/lib/types/videoDoc"
import {saveAs} from "file-saver"
import { SubmitHandler, useForm } from "react-hook-form"
import Error from "../../src/components/atoms/Error"
import VideoList from "../../src/components/organisms/VideoList"
import Tag from "../../src/components/atoms/Tag"
import { fetchVideos } from '../../src/functions/video'

interface UserDoc {
  displayName: string,
  photoURL: string,
}

interface Params {
  params: {
    id: string
  }
}

interface Props {
  videoDoc: VideoDoc
  userDoc: UserDoc
  relatedVideos: VideoDoc[]
}

const promise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY as string)

const options = {
  clientSecret: '1234',
};

interface Inputs {
  email: string
  token: string
}

const VideoShowPage = ({videoDoc, userDoc, relatedVideos}: Props) => {  
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
  const [message, setMessage] = useState('');
  const [videoData, setVideoData] = useState<VideoDoc>(videoDoc)
  const [open, setOpen] = useState(false)
  const [sold, setSold] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const date = new Date(videoDoc.timeCreated)
  const tagUrl = videoDoc.tags.join('/')

  const showStripeModal = async () => {
    if(videoDoc.state == 'sold') {
      return;
    }
    if(clientSecret) {
      setOpen(true);
      return;
    }
    const res = await fetch("/api/checkout_session", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({price: videoDoc.price})
    })
    const data = await res.json()
    setClientSecret(data.clientSecret)
    setOpen(true)
  }
  const options = {
    clientSecret,
  }

  const downloadVideo: SubmitHandler<Inputs> = async (data) => {
    setMessage('')
    if(videoData.owner.email === data.email && videoData.token === data.token) {
      getBlob(ref(storage, videoData.fullPath))
      .then((blob) => {
        saveAs(blob)
      })
      .catch(error => {
        setMessage('????????????????????????????????????????????????????????????')
      })
    } else {
      setMessage('??????????????????????????????????????????????????????????????????')
    }
  }

  useEffect(() => {
    const fetchVideoDoc = async (id: string) => {
      const docRef = doc(db, "videos", id);
      const docSnap = await getDoc(docRef);
      return docSnap.data() as VideoDoc;
    }
    if(clientSecret && sold) {
      fetchVideoDoc(videoDoc.id).then(doc => {
        setVideoData(doc)
        setOpen(false)
        getDownloadURL(ref(storage, videoData.fullPath))
        .then((url) => {
          saveAs(url)
        })
        .catch(error => {
          console.log(error)
        })
      });
    } else if(!sold) {
      fetchVideoDoc(videoDoc.id).then(doc => {
        if(doc.state == 'sold') {
          setSold(true)
        }
      })
    }
  }, [sold])
  return (
    <Layout>
      <div className="container px-4 mx-auto">
        <h1>{videoData.title}</h1>
        <div className="md:flex mb-8">
          <div className="md:w-1/2">
            <ReactPlayer
              url={videoData.url}
              width="100%" 
              height="100%"
              controls
            />
          </div>
          <div className="md:w-1/2 md:p-4">
            <div className="mb-4">{videoData.description}</div>
            {!sold && <div className="mb-4"><Button onClick={showStripeModal}>&yen; {typeof(videoData.price) == 'string' ? parseInt(videoData.price).toLocaleString() : videoData.price.toLocaleString()} - ????????????</Button></div>}
            {sold && (
              <div className="my-4">
                <div>???????????????????????????????????????</div>
                <div className="mb-4">??????????????????????????????</div>
                <form onSubmit={handleSubmit(downloadVideo)}>
                  <div className="mb-4">
                    <TextField label="?????????????????????" variant="outlined" fullWidth {...register('email', {
                      required: '????????????????????????',
                      pattern: {
                        value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        message: '????????????????????????????????????????????????'
                      }
                    })} />
                    {errors.email && <div><Error>{errors.email.message}</Error></div>}
                  </div>
                  <div className="mb-4">
                    <TextField label="??????????????????" variant="outlined" fullWidth {...register('token', {
                      required: '????????????????????????'
                    })} />
                    {errors.token && <div><Error>{errors.token.message}</Error></div>}
                  </div>
                  <div>
                    <Button>??????????????????</Button>
                    {message && <div><Error>{message}</Error></div>}
                  </div>
                </form>
              </div>
            )}
            <div className="flex mb-4">
              {videoData.tags && videoData.tags.map((tag, index) => (
                <Tag key={index} href={`/video/tag/${tag}`} className="mr-4">{tag}</Tag>
              ))}
            </div>
            <div className="flex">
              <div className="mr-4">{`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`}</div>
              <div>{userDoc.displayName}</div>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h2>?????????????????????????????????</h2>
          <VideoList videos={relatedVideos} />
        </div>
        <div className="text-center">
          <Button href={`/video/tag/${tagUrl}`}>???????????????</Button>
        </div>
        {open && ( 
          <div className="fixed top-0 left-0 flex justify-center items-center w-full h-full bg-base-cont-transparent">
            <div className="relative p-4 bg-base">
              <div className="absolute top-0 right-0">
                <IconButton aria-label="close" onClick={() => setOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
              <div className="mb-4 font-bold text-xl">&yen; {typeof(videoData.price) == 'string' ? parseInt(videoData.price).toLocaleString() : videoData.price.toLocaleString()} </div>
              <Elements stripe={promise} options={options}>
                <CheckoutForm videoDoc={videoData} setSold={setSold} />
              </Elements>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async ()  => {
  const querySnapShot = await getDocs(collection(db, "videos"));
  const paths = querySnapShot.docs.map(doc => ({
    params: {id: doc.id},
  }))
  return {paths, fallback: false}
}
export const getStaticProps: GetStaticProps = async ({params}) => {
  const id = params?.id as string
  const docRef = doc(db, "videos", id);
  const docSnap = await getDoc(docRef);
  const videoDoc = docSnap.data() as VideoDoc
  videoDoc.id = docSnap.id
  const userRef = doc(db, "users", videoDoc.uid)
  const userDocSnap = await getDoc(userRef);
  const userDoc = userDocSnap.data();
  let storageURL = ''
  if(process.env.NEXT_PUBLIC_ENV === 'production') {
    storageURL = 'https://firebasestorage.googleapis.com'
  } else {
    storageURL = 'http://localhost:9199'
  }
  const url = `${storageURL}/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(docSnap?.data()?.sampleFullPath)}?alt=media`
  videoDoc.url = url;
  const docs = await fetchVideos({tags: videoDoc.tags})
  const relatedVideos = docs;

  return {props: {videoDoc, userDoc, relatedVideos}}
}

export default VideoShowPage