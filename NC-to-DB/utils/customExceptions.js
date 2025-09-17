class NCTCMismatchException extends Error {
  constructor(message) {
    super(message);
    this.name = "NCTCMismatchException";
  }
}

class RecordNotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = "RecordNotFoundException";
  }
}

class RecordNotCreatedException extends Error {
  constructor(message) {
    super(message);
    this.name = "RecordNotCreatedException";
  }
}

class RecordNotUpdatedException extends Error {
  constructor(message) {
    super(message);
    this.name = "RecordNotUpdatedException";
  }
}

class DuplicatePayloadException extends Error {
  constructor(message, data) {
    super(message);
    this.name = "DuplicatePayloadException";
    this.data = data;
  }
}

class ProtobuffMismatchException extends Error {
  constructor(message, data) {
    super(message);
    this.name = "ProtobuffMismatchException";
    this.data = data;
  }
}

module.exports = {
  NCTCMismatchException,
  RecordNotFoundException,
  RecordNotCreatedException,
  RecordNotUpdatedException,
  DuplicatePayloadException,
  ProtobuffMismatchException,
};
