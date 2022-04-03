import type { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react'
import Layout from '../../../src/components/templates/Layout'
import { VideoDoc } from '../../../src/lib/types/videoDoc'
import VideoSearchForm from '../../../src/components/organisms/SearchVideoForm'
import VideoList from '../../../src/components/organisms/VideoList'
import FetchVideosButton from '../../../src/components/organisms/FetchVideosButton'
import { useRouter } from 'next/router'
import Tag from '../../../src/components/atoms/Tag'
import SearchVideoForm from '../../../src/components/organisms/SearchVideoForm'

const VideosByTagPage = () => {
  const [videos, setVideos] = useState<VideoDoc[]>([]);
  const router = useRouter();
  const tags = router.query.tag as string[];

  useEffect(() => {
    if(tags) {
      const fetchVideos = async (tags: string[]) => {
        const urlTag = tags.join('/')
        const res = await fetch("/api/video/tag/" + urlTag)
        const data = await res.json();
        setVideos(data.videoDocs)
      }
      fetchVideos(tags)
    }
  }, [tags])

  return (
    <>
      <Layout>
        <div className='container p-4 mx-auto'>
          <SearchVideoForm />
          <h2 className='text-lg'>
            {tags && tags.map((tag, index) => (
              <Tag key={index} className='mx-2'>{tag}</Tag>
            ))}
          </h2>
          <div className='container mx-auto px-4 py-4'>
            {videos && <VideoList videos={videos} />}
            {!videos && <div>動画が見つかりませんでした</div>}
          </div>
          <div className='text-center'>
            <FetchVideosButton videos={videos} setVideos={setVideos} tags={tags}>もっと見る</FetchVideosButton>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default VideosByTagPage