import bcrypt from 'bcrypt'
import UserModel from '@/models/user'
import TopicModel from '@/models/topic'
import AuthService from './authService'
import type { LoginResponseData } from './types/userService'
import ReplyModel from '@/models/reply'
import CommentModel from '@/models/comment'

import type { SortOrder, SortFieldRanking } from './types/userService'

class UserService {
  async getUserByUid(uid: number) {
    const user = await UserModel.findOne({ uid })
    const responseData = {
      uid: user.uid,
      name: user.name,
      avatar: user.avatar,
      roles: user.roles,
      status: user.status,
      time: user.time,
      moemoepoint: user.moemoepoint,
      bio: user.bio,
      upvote: user.upvote,
      like: user.like,
      dislike: user.dislike,
      daily_topic_count: user.daily_topic_count,

      topic: user.topic,
      reply: user.reply,
      comment: user.comment,
      likeTopic: user.like_topic,
      upvoteTopic: user.upvote_topic,
    }
    return responseData
  }

  async getUserByUsername(name: string) {
    const regex = new RegExp(name, 'i')
    const users = await UserModel.find({ name: regex }).lean()
    const responseData = users.map(({ password, _id, ...rest }) => rest)
    return responseData
  }

  async getUserInfoByUid(uid: number, fieldsToSelect: string[]) {
    const userProjection = fieldsToSelect.join(' ')
    const user = await UserModel.findOne({ uid }).select(userProjection)
    return user
  }

  async loginUser(
    name: string,
    password: string
  ): Promise<number | LoginResponseData> {
    const user = await UserModel.findOne({ $or: [{ name }, { email: name }] })

    if (!user) {
      return 10101
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password)

    if (isCorrectPassword) {
      const { token, refreshToken } = await AuthService.generateTokens(
        user.uid,
        user.name
      )

      const userInfo = {
        uid: user.uid,
        name: user.name,
        avatar: user.avatar,
        moemoepoint: user.moemoepoint,
        roles: user.roles,
        token,
      }

      return {
        data: userInfo,
        refreshToken,
      }
    } else {
      return 10102
    }
  }

  async updateUserByUid(
    uid: string,
    fieldToUpdate: string,
    newFieldValue: string
  ) {
    await UserModel.updateOne(
      { uid },
      { $set: { [fieldToUpdate]: newFieldValue } }
    )
  }

  async getUserTopics(tidArray: number[]) {
    const topics = await TopicModel.find({ tid: { $in: tidArray } }).limit(50)

    const responseData = topics.map((topic) => ({
      tid: topic.tid,
      title: topic.title,
      time: topic.time,
    }))
    return responseData
  }

  async getUserReplies(ridArray: number[]) {
    const replies = await ReplyModel.find({ rid: { $in: ridArray } }).limit(50)

    const responseData = replies.map((reply) => ({
      tid: reply.tid,
      content: reply.content.substring(0, 100),
      time: reply.time,
    }))
    return responseData
  }

  async getUserComments(cidArray: number[]) {
    const comments = await CommentModel.find({ cid: { $in: cidArray } }).limit(
      50
    )

    const responseData = comments.map((comment) => ({
      tid: comment.tid,
      content: comment.content.substring(0, 100),
    }))
    return responseData
  }

  async getUserRanking(
    page: number,
    limit: number,
    sortField: SortFieldRanking,
    sortOrder: SortOrder
  ) {
    const skip = (page - 1) * limit

    const sortOptions: Record<string, 'asc' | 'desc'> = {
      [sortField]: sortOrder === 'asc' ? 'asc' : 'desc',
    }

    const users = await UserModel.find()
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean()

    const responseData = users.map((user) => ({
      uid: user.uid,
      name: user.name,
      avatar: user.avatar,
      field: user[sortField],
    }))

    return responseData
  }
}

export default new UserService()
