module.exports.renderHome = (req, res) => {
    res.render('home', { title: 'Home' });
};

module.exports.renderDashboard = (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to access the dashboard.');
        return res.redirect('/auth/login');
    }
    res.render('dashboard', { title: 'Dashboard', user: req.user });
};
