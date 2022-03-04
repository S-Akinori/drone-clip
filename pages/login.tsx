import { TextField } from "@mui/material";
import { GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Button from "../src/components/atoms/Button";
import Error from "../src/components/atoms/Error";
import Layout from "../src/components/templates/Layout";
import { useAuth } from "../src/lib/auth/auth";

interface Inputs {
  email: string,
  password: string
}

const LoginPage : NextPage = () => {
  const [message, setMessage] = useState('');
  const auth = useAuth();
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();
  

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setMessage('');
    const isSuccessful = await auth?.signinWithEmail(data);
    if(isSuccessful) {
      router.push('/home');
    } else {
      setMessage('ログインに失敗しました');
    }
  }
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const user = await auth?.signinWithGoogle(provider);
    if(user) {
      router.push('/home');
    } else {
      setMessage('登録ができませんでした。再度登録をお願いします。');
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <h1 className="text-center">ログイン</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <TextField label="メールアドレス*" variant="outlined" fullWidth {...register('email', {
              required: '入力してください',
              pattern: {
                value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                message: 'メールアドレスを入力してください'
              }
            })} />
            {errors.email && <div><Error>{errors.email.message}</Error></div>}
          </div>
          <div className="mb-4">
            <TextField type='password' label="パスワード*" variant="outlined" fullWidth {...register('password', {
              required: '入力してください',
              minLength: {
                value: 8,
                message: '8文字以上で入力してください。'
              }
            })} />
            {errors.password && <div><Error>{errors.password.message}</Error></div>}
          </div>
          <div className="text-center mb-4">
            <Button>ログイン</Button>
          </div>
        </form>
        <div className="text-center">
          <Button onClick={signInWithGoogle}>Googleアカウントでログイン</Button>
        </div>
        {message && <div className="text-center"><Error>{message}</Error></div>}
      </div>
    </Layout>
  )
}
export default LoginPage