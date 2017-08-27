/* eslint-disable no-unused-vars */
// take out what shouldn't go on the client config
export default ({ contentDir, server, ...rest }) => ({
  ...rest
});
