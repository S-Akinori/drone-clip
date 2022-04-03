import Image from "next/image"
import { CSSProperties } from "react"

interface Props {
  children: React.ReactNode
  src: string,
  title?: string
  className?: string
  style?: CSSProperties
}
const TextAndImageBox = ({children, src, title, className, style}: Props) => {
  return (
    <div className={className} style={style}>
      {title && <div className="mb-2 text-lg font-bold text-center">{title}</div>}
      <div className="text-center mb-2">
        <Image
          className="rounded-lg"
          src={src}
          alt={title}
          width={600}
          height={400}
        />
      </div>
      <div>{children}</div>
    </div>
  )
}

export default TextAndImageBox