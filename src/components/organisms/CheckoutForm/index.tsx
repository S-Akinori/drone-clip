import { LoadingButton } from "@mui/lab";
import { CardElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import React, { FormEvent, useContext, useEffect, useState } from "react"
import Button from "../../atoms/Button";
import SaveIcon from '@mui/icons-material/Save';
import { VideoDoc } from "../../../lib/types/videoDoc";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase/firebase";
import { useAuth } from "../../../lib/auth/auth";
import { TextField } from "@mui/material";
import { SubmitHandler, useForm } from "react-hook-form";
import Error from "../../atoms/Error";

interface Props {
  setSold: React.Dispatch<React.SetStateAction<boolean>>
  videoDoc: VideoDoc
}
interface Inputs {
  username: string,
  email: string,
}
const CheckoutForm = ({videoDoc, setSold}: Props) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if(!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
    setIsLoading(true);

    const {error} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: "http://localhost:3000",
      },
      redirect: "if_required"
    })
      // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error && (error.type === "card_error" || error.type === "validation_error")) {
      if(error.message) {
        setMessage(error.message);
      } else {
        setMessage("エラーが発生しました");
      }
    } else {
      const owner = {
        username: data.username,
        email: data.email,
        uid: auth?.user ? auth.user.uid : ''
      }
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let token = '';
      const len = 32
      for ( var i = 0; i < len; i++ ) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      await updateDoc(doc(db, "videos", videoDoc.id), {
        state: 'sold',
        token: token,
        owner: owner
      })
      const res = await fetch('/api/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: videoDoc.id,
          name: data.username,
          email: data.email,
          token: token,
        })
      });
      setSold(true)
    }
    setIsLoading(false);
  }
  useEffect(() => {
    if(!stripe) {
      return;
    }
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    )
    if(!clientSecret) {
      return;
    }
    stripe.retrievePaymentIntent(clientSecret).then(({paymentIntent}) => {
      switch(paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is proccessing");
          break;
        case "requires_payment_method":
          setMessage("your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong");
          break;
      }
    });
  }, [stripe]);
  return (
    <form id="payment-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <TextField label="ユーザー名" variant="outlined" fullWidth defaultValue={(auth?.user && auth.user.displayName) ? auth.user.displayName : ''} {...register('username', {
          maxLength: {
            value: 40,
            message: '40文字以内で入力してください'
          } 
        })} />
        {errors.email && <div><Error>{errors.email.message}</Error></div>}
      </div>
      <div className="mb-4">
        <TextField label="メールアドレス*" variant="outlined" fullWidth defaultValue={(auth?.user && auth.user.email) ? auth.user.email : ''} {...register('email', {
          required: '入力してください',
          pattern: {
            value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            message: 'メールアドレスを入力してください'
          }
        })} />
        {errors.email && <div><Error>{errors.email.message}</Error></div>}
      </div>
      <PaymentElement id="payment-element" />
      <div className="mt-4">
        <LoadingButton type="submit" variant="contained" loading={isLoading} disabled={!stripe || !elements} id="submit">
          購入
        </LoadingButton>
      </div>
      {message && <div id="payment-message">{message}</div>}
    </form>
  )
}
export default CheckoutForm