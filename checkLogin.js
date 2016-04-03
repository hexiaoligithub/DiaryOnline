/**
 * Created by HeXiaoli on 2016/4/1.
 * Î´µÇÂ½
 */

function noLogin(req,res,next){
    if(!req.session.user)
    {
        console.log("±§Ç¸£¬Äú»¹Ã»ÓÐµÇÂ¼£¡");
        return res.redirect('/login');
    }
    next();
}
exports.noLogin = noLogin;