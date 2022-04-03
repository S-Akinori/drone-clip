import type { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react'
import Layout from '../../src/components/templates/Layout'
import { VideoDoc } from '../../src/lib/types/videoDoc'
import SearchVideoForm from '../../src/components/organisms/SearchVideoForm'
import VideoList from '../../src/components/organisms/VideoList'
import { useInView } from 'react-intersection-observer'
import FetchVideosButton from '../../src/components/organisms/FetchVideosButton'

interface Props {
  videoDocs: VideoDoc[]
}
const VideoIndexPage = ({videoDocs}: Props) => {
  const [videos, setVideos] = useState<VideoDoc[]>([])
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    setVideos(videoDocs)
  }, [])

  return (
    <>
      <style jsx>{`
        .top-mv {
          position: relative;
          padding: 8rem 1rem;
          background: url(/top.jpg) no-repeat center center / cover;
          color: #FFF
        }
        .top-mv::before {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
      <Layout className='pt-0'>
        <div className='top-mv'>
          <div className='relative'>
            <h2 className='text-center text-2xl font-bold'>自分だけのドローン映像を手に入れよう</h2>
            <SearchVideoForm />
          </div>
        </div>
        <div className='container mx-auto px-4 py-4'>
          {videos && <VideoList videos={videos} />}
          {!videos && <div>動画が見つかりませんでした</div>}
        </div>
        <div className='text-center'>
          <FetchVideosButton videos={videos} setVideos={setVideos}>もっと見る</FetchVideosButton>
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await fetch(process.env.NEXT_PUBLIC_HOME_URL + "/api/video/")
  const data = await res.json();
  const docs = data.videoDocs as VideoDoc[]
  let videoDocs: VideoDoc[] = []
  let videoURLs: string[] = []
  docs.forEach(async (doc) => {
    const videoDoc = doc;
    videoDoc.id = doc.id
    // const url = await getDownloadURL(ref(storage, encodeURI(doc.data().fullPath)))
    let storageURL = ''
    if(process.env.NEXT_PUBLIC_ENV === 'production') {
      storageURL = 'https://firebasestorage.googleapis.com'
    } else {
      storageURL = 'http://localhost:9199'
    }
    const url = `${storageURL}/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(doc.sampleFullPath)}?alt=media`
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

export default VideoIndexPage