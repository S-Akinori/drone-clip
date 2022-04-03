import { useContext, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { VideoDoc } from '../../../lib/types/videoDoc'
import Button from '../../atoms/Button'

interface Props {
  children: React.ReactNode
  tags?: string[]
  videos: VideoDoc[]
  setVideos: React.Dispatch<React.SetStateAction<VideoDoc[]>>
}

const FetchVideosButton = ({children, tags, videos, setVideos}: Props) => {
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false)

  const {ref, inView} = useInView({
    rootMargin: '-50px',
    triggerOnce: true
  })

  const onClick = async () => {
    const urlTag = tags?.length ? 'tag/' + tags.join('/') : ''
    const res = await fetch("/api/video/" + urlTag, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({start: videos[videos.length - 1].favorite})
    })
    const data = await res.json();
    if(data.videoDocs.length) {
      setVideos(videos.concat(data.videoDocs));
    } else {
      setEnd(true)
    }
  }

  useEffect(() => {
    if(inView && !loading && videos.length) { // when scroll reaches end point, fetch more data
      console.log('fetching')
      setLoading(true)
      const fetchVideosByTag = async (tags: string[] = []) => {
        const urlTag = tags.length ? 'tag/' + tags.join('/') : '';
        const res = await fetch("/api/video/" + urlTag, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({start: videos[videos.length - 1].favorite})
        })
        const data = await res.json();
        if(data.videoDocs.length) {
          setVideos(videos.concat(data.videoDocs));
        } else {
          setEnd(true)
        }
        setLoading(false)
      }
      fetchVideosByTag(tags)
    }
  }, [inView])
  return (
    <>
      {!loading && !end && <div ref={ref}><Button onClick={onClick}>{children}</Button></div>}
      {loading && !end && <div><Button onClick={onClick}>Loading...</Button></div>}
    </>
  )
}

export default FetchVideosButton