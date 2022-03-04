import Link from "next/link";
import { useState } from "react"
import Button from "../../atoms/Button";

interface Props {
  open?: boolean
}

const LoginAlert = ({open = false}: Props) => {
  const [isOpen, SetIsOpen] = useState(open);
  return (
    <>
      {isOpen && (
      <div className="fixed z-50 flex justify-center items-center bg-black/50 w-full h-full">
        <div className="flex justify-center items-center bg-white w-1/3 h-1/3 p-4 rounded">
          <div>
            <div>
              ユーザー登録・ログイン(無料)をしてください
            </div>
            <div>
              <div className="text-center py-4"><Link href="/login"><Button>ログインはこちら</Button></Link></div>
              <div className="text-center py-4"><Link href="/register"><Button>ユーザー登録はこちら</Button></Link></div>
            </div>
          </div>
        </div>
      </div>)}
    </>
  )
}
export default LoginAlert