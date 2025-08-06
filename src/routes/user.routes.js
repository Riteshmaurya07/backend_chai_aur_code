const router = require('express').Router();
const { verify } = require('jsonwebtoken');
const { registerUser, loginUser } = require('../controllers/user.controller.js');
const {upload} = require('../middlewares/multer.middleware.js');
const { verifyJwt } = require('../middlewares/auth.middleware.js');
const { logOutUser } = require('../controllers/user.controller.js');

router.route('/register').post(
    upload.fields([
    {
       name:'avatar',
        maxCount: 1
    },
    {
        name:'coverImage',
        maxCount: 1
    }
 ]), registerUser);

 router.route('/login').post(loginUser);

 router.route("/logout").post(verifyJwt, logOutUser);


module.exports = router;