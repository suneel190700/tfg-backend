const db = require('../config/db');

// Helper: Calculate overlap percentage between two arrays
const calculateOverlap = (userItems, candidateItems) => {
    if (!userItems || !candidateItems || userItems.length === 0) return 0;
    
    // Normalize to lowercase for comparison
    const userSet = new Set(userItems.map(i => i.toLowerCase().trim()));
    const candidateSet = new Set(candidateItems.map(i => i.toLowerCase().trim()));
    
    let overlap = 0;
    candidateSet.forEach(item => {
        if (userSet.has(item)) overlap++;
    });
    
    return overlap / userSet.size;
};

// @desc    Get teammate recommendations
// @route   GET /api/matches
// @access  Private
exports.getRecommendations = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // 1. Fetch Current User Profile
        const currentUserResult = await db.query(
            'SELECT * FROM users WHERE user_id = $1', 
            [currentUserId]
        );
        
        if (currentUserResult.rows.length === 0) {
            return res.status(404).json({ message: "User profile not found" });
        }
        const currentUser = currentUserResult.rows[0];

        // Validate Profile Completion
        if (!currentUser.skills || currentUser.skills.length === 0) {
            return res.status(400).json({ message: "Please complete your profile skills first." });
        }

        // 2. Fetch All Candidate Profiles (excluding self)
        const candidatesResult = await db.query(
            'SELECT user_id, full_name, email, skills, interests, availability_hours FROM users WHERE user_id != $1',
            [currentUserId]
        );
        const candidates = candidatesResult.rows;

        // 3. Run Matching Algorithm (Weighted Score)
        const matches = candidates.map(candidate => {
            // A. Skill Overlap (Weight: 0.6)
            const skillScore = calculateOverlap(currentUser.skills, candidate.skills);

            // B. Interest Overlap (Weight: 0.3)
            const interestScore = calculateOverlap(currentUser.interests, candidate.interests);

            // C. Availability Match (Weight: 0.1)
            const maxHours = 50; // Normalization factor
            const diff = Math.abs((currentUser.availability_hours || 0) - (candidate.availability_hours || 0));
            const availabilityScore = Math.max(0, 1 - (diff / maxHours));

            // Total Weighted Score
            const totalScore = (skillScore * 0.6) + (interestScore * 0.3) + (availabilityScore * 0.1);

            return {
                candidateId: candidate.user_id,
                fullName: candidate.full_name,
                email: candidate.email,
                totalScore: parseFloat(totalScore.toFixed(2)), // Keep 2 decimal places
                details: {
                    skillScore: parseFloat(skillScore.toFixed(2)),
                    interestScore: parseFloat(interestScore.toFixed(2)),
                    availabilityScore: parseFloat(availabilityScore.toFixed(2))
                }
            };
        });

        // 4. Sort by highest score first
        matches.sort((a, b) => b.totalScore - a.totalScore);

        res.json(matches);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};