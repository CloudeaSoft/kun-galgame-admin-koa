import type { UserAttributes } from './user'

export interface CommentAttributes {
  cid: number
  rid: number
  tid: number
  c_uid: number
  to_uid: number
  content: string

  likes_count: number
  likes: number[]

  cuid: UserAttributes[]
  touid: UserAttributes[]
}
