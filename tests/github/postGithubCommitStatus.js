const AXIOS = require('axios')
const SETTINGS = require('../config/settings')

AXIOS.defaults.headers.post['Content-Type'] = SETTINGS.DEFAULT_AXIOS_CONTENT_TYPE

module.exports = function (statusObject, repoSlug, ghCommitSHA, trBuildId, ghToken) {
  const {
    state, description: desc, context
  } = statusObject

  if (trBuildId) {
    return AXIOS.post(
      `https://api.github.com/repos/${repoSlug}/statuses/${ghCommitSHA}?access_token=${ghToken}`,
      {
        state,
        target_url: `https://travis-ci.org/${repoSlug}${trBuildId ? `/${trBuildId}` : null}`,
        description: desc,
        context
      }
    )
      .then((response) => {
        console.log('Posted commit status!')
      })
      .catch((error) => {
        console.error("Didn't Posted commit status!")
        console.error(error)
      })
  } else {
    return false
  }
}
