import { Autocomplete, Chip, IconButton, TextField } from "@mui/material"
import { tags } from "../../../variables/tags"
import SearchIcon from '@mui/icons-material/Search';
import { NestedValue, SubmitHandler, useForm } from "react-hook-form";
import { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { VideoDoc } from "../../../lib/types/videoDoc";
import { useRouter } from "next/router";

interface Props {
  setVideos?: Dispatch<SetStateAction<VideoDoc[]>>
  setTags?: Dispatch<SetStateAction<string[]>>
  className?: string
}

interface Inputs {
  tags: NestedValue<string[]>,
}

const SearchVideoForm = ({setVideos, setTags, className = undefined}: Props) => {
  const router = useRouter();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Inputs>({
    defaultValues: {tags: []}
  });
  const updateTag = (event: SyntheticEvent<Element, Event>, values: string[]) => {
    setValue('tags', values, { shouldValidate: true });
  }
  
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const tagsUrl = data.tags.length ? 'tag/' + data.tags.join('/') : ''
    const res = await fetch("/api/video/" + tagsUrl)
    const docs = await res.json()

    if(setVideos !== undefined && setTags !== undefined) {
      setTags(data.tags)
      setVideos(docs.videoDocs)
    } else {
      router.push('/video/' + tagsUrl)
    }
  }
  return (
    <div className={className}>
      <div className='max-w-screen-sm mx-auto py-4'>
      <form className="py-4" onSubmit={handleSubmit(onSubmit)}>
        <div className='relative'>
          <Autocomplete
            sx={{
              background: '#FFF',
              borderRadius: '100vh',
              '& .MuiAutocomplete-inputRoot': {
                paddingRight: '60px !important',
                borderRadius: '100vh',
                borderBottom: 'none',
                ":before": {
                  display: 'none'
                },
                ":after": {
                  display: 'none'
                }
              },
              '& .MuiAutocomplete-endAdornment': {
                right: '40px !important'
              }
            }}
            multiple
            id="tags-filled"
            options={tags.map((tag) => tag)}
            freeSolo
            onChange={updateTag}
            fullWidth
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
                label="タグ検索"
              />
            )}
          />
          <div className='absolute right-0 top-1/2 -translate-y-1/2'>
            <IconButton type='submit'>
              <SearchIcon />
            </IconButton>
          </div>
        </div>
      </form>
    </div>
    </div>
  )
}

export default SearchVideoForm