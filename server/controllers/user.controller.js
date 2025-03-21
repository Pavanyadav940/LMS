import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
// Create a new user registering the user
export const register = async (req, res) => {
  try {
    // console.log(req.body)
    const { name, email, password } = req.body;
    //    for validation of all fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // for checking if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // for creating the user
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      name,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "user Account successfully",
    });
  } catch (error) {
    console.log("Error while registering user", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

// for login
export const login = async (req, res) => {
  try {
    const { password, email } = req.body;
    //    for checking of all fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // /for validation of all fields
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // Token generation
    generateToken(res, user, `Welcome back ${user.name} `);
  } catch (error) {
    console.log("Error while login", error);
    res.status(500).json({
      success: false,
      message: "Failed to login user",
    });
  }
};

// for logout
export const logout = async (_, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "User Logout Successfully ",
      success: true,
    });
  } catch (error) {
    console.log("Error while logout", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};

// for fetching the user profile
export const getUserProfile = async (req,res) => {
  try {
      const userId = req.id;
      const user = await User.findById(userId).select("-password").populate("enrolledCourses");
      if(!user){
          return res.status(404).json({
              message:"Profile not found",
              success:false
          })
      }
      return res.status(200).json({
          success:true,
          user
      })
  } catch (error) {
      console.log(error);
      return res.status(500).json({
          success:false,
          message:"Failed to load user"
      })
  }
}

// for updating the profile photo
export const updatedProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name } = req.body;
    const profilePhoto = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success,
      });
    }

    //  pehle purana photo delete karo from the cloudinary of that particular user
    // extract public url from of the old image from the url if it is exists;
    if (user.photoUrl) {
      const publicId = user.photoUrl.split("/").pop().split(".")[0]; // extract public id
      deleteMediaFromCloudinary(publicId);
    }

    // upload imageh
    const cloudResponse = await uploadMedia(profilePhoto.path);
    const photoUrl = cloudResponse.secure_url;
    const updatedData = { name, photoUrl };
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "profile updated succcessfully.",
    });
  } catch (error) {
    console.log("Error While updating the User Profile", error),
      res.status(500).json({
        success: false,
        message: "failed to update user Profile",
      });
  }
};
