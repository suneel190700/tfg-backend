// middleware/roleMiddleware.js

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // req.user is set by authMiddleware (decoded JWT)
        // We check if it exists first to avoid crashing
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        // Check if the user's role is included in the allowedRoles array
        // Example: allowedRoles = ['admin'], req.user.role = 'student' -> Returns False
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "Access denied. You do not have permission to perform this action." 
            });
        }

        next();
    };
};

module.exports = checkRole;