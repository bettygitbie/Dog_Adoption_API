// Replace this file with custom middleware functions, including authentication and rate limiting
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const checkUser = (req, res, next) => {
  //console.log(req.cookie)
  const token =
    req.headers["authorization"]?.split(" ")[1] || req.cookies?.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        const user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

const reqAuth = (req,res,next)=>{
    const token =
    req.headers["authorization"]?.split(" ")[1] || req.cookies?.jwt;
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken)=>{
            if(err){
                return res.status(401).json({message: 'Invalid token'})
            }
            req.user = decodedToken;
            console.log("decoded", req.user)
            next();
        })
    }else {
        return res.status(401).json({message: "Please login to access this page"})
    }
}

module.exports = { checkUser, reqAuth };
