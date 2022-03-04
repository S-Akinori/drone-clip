export interface VideoDoc {
  id: string
  description: string
  fullPath: string
  sampleFullPath: string
  price: number | string
  size: number
  tags: string[]
  timeCreated: string
  title: string
  uid: string
  url: string,
  state: 'public' | 'sold',
  token: string,
  favorite: number
  owner: {
    name: string
    email: string
    uid: string
  }
}