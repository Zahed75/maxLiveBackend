const { AGENCY_OWNER, ADMIN, SUPER_ADMIN } = require('../config/constants');
const { Unauthorized } = require('../utility/errors');

module.exports = (roles) => (req, res, next) => {
    const userRole = req.role; // Retrieve role from req object
    if (!roles.includes(userRole) && !roles.includes( AGENCY_OWNER, ADMIN, SUPER_ADMIN)) {
        throw new Unauthorized('You dont have permissions for this action');
    }
    next();
};