import { Autocomplete, Chip, Input, TextField } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/router";
import { SyntheticEvent, useEffect, useState } from "react";
import { NestedValue, SubmitHandler, useForm } from "react-hook-form";
import Button from "../../../src/components/atoms/Button";
import Error from "../../../src/components/atoms/Error";
import Layout from "../../../src/components/templates/Layout";
import { useAuth } from "../../../src/lib/auth/auth";
import PrivateRoute from "../../../src/lib/auth/PrivateRoute";
import { db, storage } from "../../../src/lib/firebase/firebase";
import { tags } from "../../../src/variables/tags";

interface Inputs {
  title: string,
  description: string,
  tags: NestedValue<string[]>,
  file: FileList,
  fileSample: FileList,
  price: number
}

const VideoCreatePage = () => {
  const auth = useAuth();
  const router = useRouter()
  const [message, setMessage] = useState('')
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Inputs>({
    defaultValues: {tags: []}
  });
  const onSubmit : SubmitHandler<Inputs> = async (data) => {
    setMessage('');
    try {
      const storageRef = ref(storage, `videos/${data.file[0].name}`);
      const snapshot = await uploadBytes(storageRef, data.file[0]);
      const sampleStorageRef = ref(storage, `sampleVideos/${data.fileSample[0].name}`);
      const sampleSnapshot = await uploadBytes(sampleStorageRef, data.fileSample[0]);
      const fileData = {
        title: data.title,
        description: data.description,
        tags: data.tags,
        price: data.price as number,
        fullPath: snapshot.metadata.fullPath,
        sampleFullPath: sampleSnapshot.metadata.fullPath,
        size: snapshot.metadata.size,
        timeCreated: snapshot.metadata.timeCreated,
        uid: auth?.user?.uid,
        favorite: 0,
        state: 'public',
        owner: {},
      }
      const docRef = await addDoc(collection(db, "videos"), fileData);
      setMessage('???????????????????????????????????????')
    } catch(e) {
      setMessage('?????????????????????????????????????????????????????????')
    }
  }
  const checkVideo = (value: FileList) => {
    const extension = value[0].name.substring(value[0].name.lastIndexOf('.'))
    const validExtensions = ['.mp4', '.avi', '.fiv', '.mov', '.wmv'];
    return validExtensions.includes(extension);
  }
  const updateTag = (event: SyntheticEvent<Element, Event>, values: string[]) => {
    setValue('tags', values, { shouldValidate: true })
    console.log(values)
  }
  
  useEffect(() => {
    register('tags', {
      validate: (value) => value.length < 4 || '?????????3???????????????????????????'
    })
  }, [register])
  return (
      <Layout>
        <div className="container mx-auto">
          <h2 className="text-center">????????????????????????</h2>
          <form className="py-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <TextField label="??????????????????" variant="outlined" fullWidth {...register('title', {
                required: '????????????????????????',
                maxLength: {
                  value: 100,
                  message: '100???????????????????????????????????????'
                } 
              })} />
              {errors.title && <div><Error>{errors.title.message}</Error></div>}
            </div>
            <div className="mb-4">
              <TextField label="??????" variant="outlined" fullWidth multiline rows={4} {...register('description', {
                required: '????????????????????????',
              })} />
              {errors.description && <div><Error>{errors.description.message}</Error></div>}
            </div>
            <div className="mb-4">
            <Autocomplete
              multiple
              id="tags-filled"
              options={tags.map((tag) => tag)}
              freeSolo
              onChange={updateTag}
              renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <div key={index}>
                    <Chip variant="outlined" label={option} {...getTagProps({ index })}  />
                  </div>
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="filled"
                  label="??????"
                />
              )}
            />
            {errors.tags && <div><Error>{errors.tags.message}</Error></div>}
            </div>
            <div className="mb-4">
              <div>??????</div>
              <input type="file" accept=".mp4,.avi,.fiv,.mov,.wmv" {...register('file', {
                required: '????????????????????????????????????',
                validate: {
                  isVideo: (value) => checkVideo(value) || '??????????????????(mp4, avi, fiv, mov, wmv)???????????????????????????????????????'
                }
              })} />
              {errors.file && <div><Error>{errors.file.message}</Error></div>}
            </div>
            <div className="mb-4">
              <div>???????????????</div>
              <input type="file" accept=".mp4,.avi,.fiv,.mov,.wmv" {...register('fileSample', {
                required: '????????????????????????????????????',
                validate: {
                  isVideo: (value) => checkVideo(value) || '??????????????????(mp4, avi, fiv, mov, wmv)???????????????????????????????????????'
                }
              })} />
              {errors.file && <div><Error>{errors.file.message}</Error></div>}
            </div>
            <div className="mb-4">
              <TextField label="??????" type="number" variant="outlined" fullWidth {...register('price', {
                required: '????????????????????????',
                validate: {
                  positive: (value) => value >= 0 || '0?????????????????????????????????'
                }
              })} />
              {errors.price && <div><Error>{errors.price.message}</Error></div>}
            </div>
            <div className="text-center">
              <Button>??????</Button>
            </div>
            {message && <div><Error>{message}</Error></div>}
          </form>
        </div>
      </Layout>
  )
}

export default VideoCreatePage;