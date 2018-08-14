const SETTINGS = require('../config/settings');
const AXIOS = require('axios')
AXIOS.defaults.headers.post['Content-Type'] = SETTINGS.DEFAULT_AXIOS_CONTENT_TYPE;

module.exports = function (comment, repoSlug, prId, ghToken) {
    return AXIOS.post(`https://api.github.com/repos/${repoSlug}/issues/${prId}/comments?access_token=${ghToken}`, {
                body: comment,
            })
            .then(function (response) {
                // console.log('Posted comment!');
                // console.log(response);
            })
            .catch(function (error) {
                console.error('Didn\'t Posted comment!');
                console.error(error);
            });
}