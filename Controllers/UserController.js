import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";

//get a User
export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await UserModel.findById(id);
    if (user) {
      //password以外のものをまとめた新しい配列をotherDetailsとして作る
      const { password, ...otherDetails } = user._doc;

      res.status(200).json(otherDetails);
    } else {
      //あくまで桁数が合ってて中身が違う時だけのエラー処理。それ以外は500エラーになる。
      res.status(404).json("No such user");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//update a user
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus, password } = req.body;

  if (id === currentUserId || currentUserAdminStatus) {
    try {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }

      //mongooseのAPIで書き換える
      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("Access Denied! you can only update your own profile");
  }
};

//Delete user
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId, currentUserAdminStatus } = req.body;

  if (currentUserId === id || currentUserAdminStatus) {
    try {
      await UserModel.findByIdAndDelete(id);
      res.status(200).json("User deleted successfully");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("Access Denied! you can only delete your own profile");
  }
};

//Follow a User
export const followUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res.status(403).json("Action forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      //currentUserIdが配列の中に含まれていなかったら followers、followingは/Models/userModel.jsより
      if (!followUser.followers.includes(currentUserId)) {
        //follwersに配列のなかでcurrentUserIdをプッシュする
        await followUser.updateOne({ $push: { followers: currentUserId } });
        //follwingに配列のなかでIdをプッシュする
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json("User followed!");
      } else {
        res.status(403).json("User is Already followed by you");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

//Unfollow a User
export const UnFollowUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res.status(403).json("Action forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      //currentUserIdが配列の中に含まれていなかったら followers、followingは/Models/userModel.jsより
      if (followUser.followers.includes(currentUserId)) {
        //follwersに配列のなかでcurrentUserIdをプルする
        await followUser.updateOne({ $pull: { followers: currentUserId } });
        //follwingに配列のなかでIdをプルする
        await followingUser.updateOne({ $pull: { following: id } });
        res.status(200).json("User UnFollowed!");
      } else {
        res.status(403).json("User is not followed by you");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};
