import PostModel from "../Models/postModel.js";
import mongoose from "mongoose";
import express from "express";
import UserModel from "../Models/userModel.js";

//Create new Post
export const createPost = async (req, res) => {
  const newPost = new PostModel(req.body);

  try {
    await newPost.save();
    res.status(200).json("Post created");
  } catch (error) {
    res.status(500).json(error);
  }
};

//Get a post
export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await PostModel.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

//Update a post
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post Updated");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//Delete a post
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json("Post Deleted");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//like/dislikes a post
export const likePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    //userIdが配列の中に含まれていなかったら followers、likeは/Models/postModel.jsより
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json("Post Liked");
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post Disliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//Get Timeline Posts
export const getTimeLinePosts = async (req, res) => {
  const userId = req.params.id;

  try {
    //userIdとreq.body.idを比較して探す
    const currentUserPosts = await PostModel.find({ userId: userId });
    //mongodbのAPIde集計処理
    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          //新しくIDを生成する
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          //テーブルのコレクション名
          from: "posts",
          //入力コレクションで結合条件したいフィールド
          localField: "following",
          //結合したいコレクションで結合条件にしたいフィールド
          foreignField: "userId",
          //結果の配列名
          as: "followingPosts",
        },
      },
      {
        //新しく作るオブジェクトの設定
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);
    res
      .status(200)
      //concat() 文字列を結合して連結された文字列を返すmongodbのAPI。「(...followingPosts[0].followingPosts)」でfollowingPostsという配列名で区切らずに、そのまま結合する
      .json(
        currentUserPosts
          .concat(...followingPosts[0].followingPosts)
          //新しい順に並び替える関数
          .sort((a, b) => {
            return b.createdAt - a.createdAt;
          })
      );
  } catch (error) {
    res.status(500).json(error);
  }
};
