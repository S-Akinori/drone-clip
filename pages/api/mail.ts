import nodemailer from 'nodemailer'
import type { NextApiRequest, NextApiResponse } from 'next'

type Props = {
  id: string;
  name: string;
  email: string;
  token: string;
}
type Response = {
  message: string
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT as number | undefined,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

interface EmailData {
  id: string;
  name: string
  email: string,
  token: string
}

const createMailMessage = (emailData: EmailData) => {
  const date = new Date().toLocaleString('sv')
  const header = '映像を購入しました'
  const message = `
    映像の購入ありがとうございます。
    以下が控えになります。
    再ダウンロードに必要になる情報なので、他人に共有することせず保管をお願いします。
    ======== 商品データ ===========
    【お名前】
    ${emailData.name}

    【メールアドレス】
    ${emailData.email}

    【購入日時】
    ${date}

    【商品トークン】
    ${emailData.token}
    
    【商品URL】
    ${process.env.NEXT_PUBLIC_HOME_URL}/video/${emailData.id}
    ====================================
    
    ドローンクリップ
    HP: https://impre.jp
  `;
  return {header, message};
}
const createNotificationMessage = (emailData: EmailData) => {
  const header = '商品が購入されました';
  const message = `
    【お名前】
    ${emailData.name}
    【メールアドレス】
    ${emailData.email}
  `
  return {header, message};
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const {name, email, token, id}: Props = req.body;
  const messageData = createMailMessage({id: id, name: name, email: email, token: token});
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: messageData.header,
    text: messageData.message,
  });
  res.status(200).json({ message: 'success'})
}