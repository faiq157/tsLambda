class retryableException extends Error {
  constructor(message) {
    super(message);
    this.name = "retryableException";
  }
}

module.exports = {
  retryableException,
};
