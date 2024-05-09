const { BASIC_USER, AGENCY_OWNER, MASTER_PORTAL,SUPER_ADMIN,COIN_RESLLER,BEAN_RESELLER } = require('../config/constants');
const { Unauthorized } = require('../utility/errors');

module.exports = (roles) => (req, res, next) => {
    const userRole = req.role; // Retrieve role from req object
    if (!roles.includes(userRole) && !roles.includes(BASIC_USER, AGENCY_OWNER, MASTER_PORTAL,SUPER_ADMIN,COIN_RESLLER,BEAN_RESELLER)) {
        throw new Unauthorized('You dont have permissions for this action');
    }
    next();
};



