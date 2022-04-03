import Link from "next/link"

interface Props {
  children: React.ReactNode,
  href?: string
  className?: string
}
const Tag = ({children, href, className}: Props) => {
  const myClass = 'px-4 py-1 bg-gray-100 rounded-full ' + className
  return (
    <>
      {href && <Link href={href}><a className={myClass}>{children}</a></Link>}
      {!href && <span className={myClass}>{children}</span>}
    </>
  )
}
export default Tag