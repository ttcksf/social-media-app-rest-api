import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    //投稿のテキスト
    desc: String,
    likes: [],
    //投稿の画像(日付＋ファイル名の文字列になる想定)
    image: String,
  },
  {
    timestamps: true,
  }
);

var PostModel = mongoose.model("Posts", postSchema);
export default PostModel;
