/**
 * Created by HeXiaoli on 2016/4/1.
 * δ��½
 */

function noLogin(req,res,next){
    if(!req.session.user)
    {
        console.log("��Ǹ������û�е�¼��");
        return res.redirect('/login');
    }
    next();
}
exports.noLogin = noLogin;