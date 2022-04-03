import Link from "next/link";
import { MouseEventHandler } from "react";

interface Props {
  children: React.ReactNode,
  className?: string,
  id?: string,
  style?: React.CSSProperties
  onClick?: MouseEventHandler<HTMLElement>
  disabled?: boolean
  href?: string
}

const Button = ({children, className = '', id='', style = {}, onClick = undefined, disabled = false, href = ''}: Props) => {
  if(!className || !className.includes('bg-')) {
    className += 'bg-main'
  }
  return (
    <>
      {href && (
        <Link href={href}>
          <a
            id={id}
            className={`px-4 py-2 hover:opacity-80 duration-300 text-white rounded ${className}`}
            style={style}
            onClick={onClick}
          >
            {children}
          </a>
        </Link>
      )}
      {!href && (
        <button 
          id={id}
          className={`px-4 py-2 hover:opacity-80 duration-300 text-white rounded ${className}`}
          style={style}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </button>
      )}
    </>
  )
}

export default Button;