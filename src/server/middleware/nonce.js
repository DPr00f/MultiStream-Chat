import uuid from 'uuid';

export default function nonce() {
  return (req, res, next) => {
    res.locals.nonce = uuid.v4();
    next();
  };
}
