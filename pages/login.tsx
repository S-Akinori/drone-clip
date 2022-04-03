import { TextField } from "@mui/material";
import { FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, signInWithEmailAndPassword, TwitterAuthProvider } from "firebase/auth";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Button from "../src/components/atoms/Button";
import Error from "../src/components/atoms/Error";
import Layout from "../src/components/templates/Layout";
import { useAuth } from "../src/lib/auth/auth";
import GoogleIcon from '@mui/icons-material/Google';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import Link from "next/link";

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
  const signInWithSNS = async (providerName: 'google' | 'facebook' | 'twitter' | 'github') => {
    let provider: GoogleAuthProvider | FacebookAuthProvider | TwitterAuthProvider | GithubAuthProvider | null = null
    if(providerName == 'google') {
      provider = new GoogleAuthProvider();
    } else if(providerName == 'facebook') {
      provider = new FacebookAuthProvider();
    } else if(providerName == 'twitter') {
      provider = new TwitterAuthProvider();
    } else if(providerName == 'github') {
      provider = new GithubAuthProvider();
    }
    if(provider == null) {
      setMessage('ログインできませんでした');
      return
    }
    const user = await auth?.signinWithSNS(provider, providerName);
    if(user) {
      router.push('/home');
    } else {
      setMessage('ログインできませんでした');
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <h1 className="text-center">ログイン</h1>
        <div className="text-center mb-4"><Link href='/register'><a className="underline">登録していない方はこちら</a></Link></div>
        <div className="mb-4">
          <div className="text-center mb-4">SNSアカウントでログイン</div>
          <div className="flex justify-center flex-wrap">
            <div className="text-center mb-4 px-4 w-1/2 md:w-1/4">
              <Button onClick={() => signInWithSNS('google')} className="w-full block" style={{background: '#FFF', color: "#222", boxShadow: '2px 2px 2px #ccc'}}><GoogleIcon />Google</Button>
            </div>
            <div className="text-center mb-4 px-4 w-1/2 md:w-1/4">
              <Button onClick={() => signInWithSNS('twitter')} className="w-full block" style={{background: '#1DA1F2'}}><TwitterIcon /> Twitter</Button>
            </div>
            <div className="text-center mb-4 px-4 w-1/2 md:w-1/4">
              <Button onClick={() => signInWithSNS('facebook')} className="w-full block" style={{background: '#1877F2'}}><FacebookIcon /> Facebook</Button>
            </div>
            <div className="text-center mb-4 px-4 w-1/2 md:w-1/4">
              <Button onClick={() => signInWithSNS('github')} className="w-full block" style={{background: '#24292f'}}><GitHubIcon /> GitHub</Button>
            </div>
          </div>
        </div>
        <div>
          <div className="text-center mb-4">メールアドレスでログイン</div>
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
        </div>
        {message && <div className="text-center"><Error>{message}</Error></div>}
      </div>
    </Layout>
  )
}
export default LoginPage