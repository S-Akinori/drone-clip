import { CSSProperties } from "react"

interface Props {
  h2?: string
  h3?: string
  sub?: string
  className?: string
  style?: CSSProperties
}

const Title = ({h2, h3, sub, className, style}: Props) => {
  return (
    <div className={`mb-4 ${className}`} style={style}>
      {sub && <div className="font_en">{sub}</div>}
      {h2 && <h2 className="text-main">{h2}</h2>}
      {h3 && <h3>{h3}</h3>}
    </div>
  )  
}

export default Title