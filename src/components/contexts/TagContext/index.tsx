import React, { useState } from "react";

interface Props {
  children: React.ReactNode
}

export const TagContext = React.createContext<string[]>([])
export const SetTagContext = React.createContext<React.Dispatch<React.SetStateAction<string[]>>>(() => undefined)
export const PageContext = React.createContext<number>(0)
export const SetPageContext = React.createContext<React.Dispatch<React.SetStateAction<number>>>(() => undefined)

const TagContextProvider = ({children}: Props) => {
  const [tags, setTags] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0)

  return (
    <TagContext.Provider value={tags}>
      <SetTagContext.Provider value={setTags}>
        <PageContext.Provider value={page}>
          <SetPageContext.Provider value={setPage}>
            {children}
          </SetPageContext.Provider>
        </PageContext.Provider>
      </SetTagContext.Provider>
    </TagContext.Provider>
  )
}

export default TagContextProvider