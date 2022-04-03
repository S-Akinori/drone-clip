import { GetStaticProps } from "next";
import Button from "../src/components/atoms/Button";
import VideoList from "../src/components/organisms/VideoList";
import TextAndImageBox from "../src/components/molecules/TextAndImageBox";
import Layout from "../src/components/templates/Layout";
import { VideoDoc } from "../src/lib/types/videoDoc";
import Title from "../src/components/molecules/Title";

interface Props {
  videoDocs: VideoDoc[]
}

const TopPage = ({videoDocs}: Props) => {
  return (
    <Layout className="pt-0">
      <div className="md:flex items-center px-4 py-12 mb-12" 
        style={{
          background: 'linear-gradient(to bottom right, #f1f8ff, #f1f8ff 50%, transparent 50%)'
        }}
      >
        <div className="md:w-1/2 md:pr-2 mb-4 text-center md:text-left">
          <h1>自分だけのドローン素材を</h1>
          <div className="mb-4">
            すべての映像が1つ限定です。<br />
            他の人が持っていないオリジナルの映像を手に入れましょう！
          </div>
          <div>
            <Button className="bg-main" href="/register">ユーザー登録をする（無料）</Button>
          </div>
        </div>
        <div className="md:w-1/2 md:pl-2">
          <video src="/top.mp4" className="w-full rounded-lg" autoPlay loop muted></video>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <Title h2="ドローンクリップの特徴" sub="Feature" className="text-center" />
        <div></div>
        <div className="md:flex mb-12">
          <TextAndImageBox src="/images/snow-bg.jpg" title="ドローン映像に特化" className="md:w-1/3 mb-8 md:px-4">
            ドローンクリップではドローンを利用した素材だけを集めています。「ドローン素材は個人で撮るには大変だけど素材が欲しい」というあなたにピッタリです。
          </TextAndImageBox>
          <TextAndImageBox src="/images/chuzenjiko.jpg" title="どの素材も1人だけ入手可能" className="md:w-1/3 mb-8 md:px-4">
            多くの素材サイトは誰でもダウンロード可能です。特にフリー素材はいろんなところで見られるため安っぽく見られてしまうこともあります。
            ドローンクリップはあなたが購入した時点でその映像の権限はあなたのものになります。素材にこだわりたいときにオススメです。
          </TextAndImageBox>
          <TextAndImageBox src="/images/office-gebe5be82a_1280.jpg" title="登録不要で素材が買える" className="md:w-1/3 mb-8 md:px-4">
            ビデオ検索や購入はすべてユーザー登録なしでできます。「1つだけ素材がほしいのにいちいち登録するのは面倒」という方でもサクッと購入が可能です。
          </TextAndImageBox>
        </div>
      </div>
      <div className="bg-gray-900 p-4 py-12">
        <div className="container mx-auto">
          <Title h2="こんなドローン素材があります" sub="Examples" className="text-center text-white" />
          <VideoList videos={videoDocs} />
          <div className="text-center">
            <Button href="/video" className="bg-main">もっと素材を探す</Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4 py-12">
        <Title h2="さっそく素材を探しましょう！" sub="Let's Start!!" className="text-center" />
        <div className="mb-4">
          ユーザー登録は不要ですが、登録することで素材の購入履歴を見ることができます。<br />
          ・動画の整理がオンラインできたり<br />
          ・購入のときにメールアドレス等の入力が省ける<br />
          などの利点があります。
        </div>
        <div className="text-center">
          <Button className="bg-main" href="/register">ユーザー登録をする（無料）</Button>
        </div>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await fetch(process.env.NEXT_PUBLIC_HOME_URL + "/api/video/")
  const data = await res.json();
  const docs = data.videoDocs as VideoDoc[]
  let videoDocs: VideoDoc[] = []
  docs.forEach(async (doc) => {
    const videoDoc = doc;
    videoDoc.id = doc.id
    // const url = await getDownloadURL(ref(storage, encodeURI(doc.data().fullPath)))
    let storageURL = ''
    if(process.env.NEXT_PUBLIC_ENV === 'production') {
      storageURL = 'https://firebasestorage.googleapis.com'
    } else {
      storageURL = 'http://localhost:9199'
    }
    const url = `${storageURL}/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(doc.sampleFullPath)}?alt=media`
    videoDoc.url = url
    videoDocs.push(videoDoc)
  })
  return {
    props: {
      videoDocs
    }
  }
}

export default TopPage