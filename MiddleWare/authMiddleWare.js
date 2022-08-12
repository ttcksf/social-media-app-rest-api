import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.JWT_KEY;
//expressは第一引数の条件を満たしたパスにアクセスされたら、第二引数の関数を実行する
//reqはHTTPリクエストを表すオブジェクト、resはレスポンスを生成するオブジェクト、nextは同じ条件のパスで別の関数を実行するかもしれないから終了せず停止しておくためのもの(ユーザー情報の更新、フォローなど)
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    if (token) {
      const decoded = jwt.verifty(token, secret);
      console.log(decoded);
      req.body._id = decoded?._id;
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

export default authMiddleware;
