import { MouseEventHandler } from "react";

interface Props {
  children: React.ReactNode,
  className?: string,
  id?: string,
  style?: React.CSSProperties
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean

}

const Button = ({children, className = '', id='', style = {}, onClick = undefined, disabled = false}: Props) => {
  return (
    <button 
      id={id}
      className={`px-4 py-2 bg-indigo-500 hover:bg-indigo-400 duration-300 text-white rounded ${className}`}
      style={style}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button;