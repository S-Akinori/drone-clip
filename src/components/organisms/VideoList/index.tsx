import Link from "next/link"
import { useState } from "react"
import ReactPlayer from "react-player"
import { VideoDoc } from "../../../lib/types/videoDoc"

interface Props {
  videos: VideoDoc[]
}

const VideoList = ({videos}: Props) => {
  const [play, setPlay] = useState('');
  return (
    <div className='flex items-center flex-wrap'>
      {videos && videos.map((doc, index) => (
        <div key={doc.id} className="relative md:w-1/4 p-2" >
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
            <div className='bg-base-cont text-base-color py-1 px-2'>{doc.title}</div>
          </a></Link>
        </div>
      ))}
    </div>
  )
}

export default VideoList