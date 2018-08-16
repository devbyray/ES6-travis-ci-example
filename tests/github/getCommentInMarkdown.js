const SETTINGS = require('../config/settings')
const AXIOS = require('axios')
AXIOS.defaults.headers.post['Content-Type'] = SETTINGS.DEFAULT_AXIOS_CONTENT_TYPE

module.exports = function (markDownComment, ghToken) {
  return AXIOS.post(`https://api.github.com/markdown?access_token=${ghToken}`, {
    text: markDownComment,
    mode: 'gfm',
    context: 'github/gollum'
  })
}
