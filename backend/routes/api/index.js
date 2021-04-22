const router = require('express').Router();
const asyncHandler = require('express-async-handler');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth.js');
const { User } = require('../../db/models');



/* Phase 3 - Auth Testing
router.get('/set-token-cookie', asyncHandler(async (req, res) => {
    const user = await User.findOne({
        where: {
            username: 'Demo-lition'
        },
    })
    setTokenCookie(res, user);
    return res.json({ user });
}));

router.get('/restore-user',
    restoreUser,
    (req, res) => res.json(req.user)
);

router.get('/require-auth',
    requireAuth,
    (req, res) => res.json(req.user)
);

router.post('/test', function (req, res) {
    res.json({ requestBody: req.body });
});*/

module.exports = router;
