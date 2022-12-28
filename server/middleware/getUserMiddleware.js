const jwt = require("jsonwebtoken");

if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: './.env' });

module.exports = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        res.locals.user = 'unauthorized';
        res.locals.errorMessage = 'No Token'
        //console.log('no token')
        next();
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.user = decoded.user;
        //console.log(res.locals.user)
        next();
    } catch (e) {
        if(e instanceof jwt.TokenExpiredError){
            res.clearCookie('authToken');
            console.log('cookie cleared');
            res.redirect('/');
            next();
            return;
        }
        console.error(e);
        res.locals.user = 'unauthorized';
        res.locals.errorMessage = 'Invalid Token'
        res.locals.authError = e;
        //console.log(res.locals.user)
        next();
    }
};
