const { BASIC_USER, AGENCY_OWNER, MASTER_PORTAL,SUPER_ADMIN } = require('../config/constants');
const { Unauthorized } = require('../utility/errors');

module.exports = (roles) => (req, res, next) => {
    const userRole = req.role; // Retrieve role from req object
    console.log(userRole, roles)
    if (!roles.includes(userRole) && !roles.includes(BASIC_USER, AGENCY_OWNER, MASTER_PORTAL,SUPER_ADMIN)) {
        throw new Unauthorized('You dont have permissions for this action');
    }
    next();
};



