import { collection, DocumentData, getDocs, query, where } from 'firebase/firestore'
import { getDownloadURL, ref, StorageReference } from 'firebase/storage'
import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Layout from '../src/components/templates/Layout'
import { db, storage } from '../src/lib/firebase/firebase'
import styles from '../styles/Home.module.css'
import {firebaseAdmin} from '../src/lib/firebase/firebaseAdmin'
import { GetBucketSignedUrlConfig, GetSignedUrlConfig } from '@google-cloud/storage'
import ReactPlayer from 'react-player'
import Link from 'next/link'
import { VideoDoc } from '../src/lib/types/videoDoc'

interface Props {
  videoDocs: VideoDoc[]
}

const Home = ({videoDocs}: Props) => {
  const [play, setPlay] = useState('');
  return (
    <Layout>
      <div className='container mx-auto'>
        <h2 className='text-center text-2xl font-bold'>自分だけのドローン映像を手に入れよう</h2>
        {/* <div className='text-center max-w-screen-sm mx-auto py-4'>
          <input type="text" placeholder='検索' className='rounded-full' />
        </div> */}
        <div className='flex items-center flex-wrap'>
          {videoDocs && videoDocs.map((doc, index) => (
            <div key={doc.id} className="relative md:w-1/3 p-2" >
              <Link href={`/video/${doc.id}`}><a className='relative block'>
                <ReactPlayer 
                  url={doc.url}
                  width="100%" 
                  height="100%" 
                  muted
                  loop
                  playing={play == doc.id ? true : false}
                  onMouseOver={() => setPlay(doc.id)}
                  onMouseLeave={() => setPlay('')}
                />
                <div className='bg-base text-base-cont py-1 px-2'>{doc.title}</div>
              </a></Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const q = query(collection(db, "videos"), where('state', '==', 'public'));
  const querySnapshot = await getDocs(q);
  let videoDocs: VideoDoc[] = []
  let videoURLs: string[] = []
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
  return {
    props: {
      videoDocs,
      videoURLs
    }
  }
}

export default Home