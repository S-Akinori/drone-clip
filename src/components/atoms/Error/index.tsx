interface Props {
  children: React.ReactNode
}

const Error = ({children}: Props) => {
  return <span className="text-red-500">{children}</span>
}

export default Error