import jwt from "jsonwebtoken";

 const isAuthenticated = async (req, res,next) => {
  try {
    //  for getting the all the cookie named tokens // attempts to retrieve a cookie named token from the cookies object of res (the response object). 
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "User not Authenticated",
        success: false
      })
    }
//    for checking that token is valid or not with the help of the secret key 
// if valid then deccode will have the userid which we have given while generating the token
    const decode =  jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      return res.status(401).json({
        message: "Invalid Token",
        success: false,
      });
    }
   // we are making a variable that  is req.id which has the userid which we used later in this 
    req.id = decode.userId;
    // if this line works that means that user is authenticated and proceed for futher 
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
   
  }
};

export default isAuthenticated;
