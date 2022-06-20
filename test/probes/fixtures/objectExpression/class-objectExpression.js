class NotObj {
  log;

  constructor() {
    this.log = ['a', 'b', 'c'];
  }

  get latest() {
    return this.log[this.log.length - 1];
  }
};
