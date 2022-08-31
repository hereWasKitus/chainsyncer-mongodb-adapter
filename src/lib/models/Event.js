export class Event {

  /**
   * @type {string}
   */
  id

  /**
   * @type {string}
   */
  contract

  /**
   * @type {string}
   */
  event

  /**
   * @type {string}
   */
  transaction_hash

  /**
   * @type {number}
   */
  block_number

  /**
   * @type {number}
   */
  log_index

  /**
   * @type {number}
   */
  tx_index

  /**
   * @type {string}
   */
  from_address

  /**
   * @type {number}
   */
  global_index

  /**
   * @type {string}
   */
  block_timestamp

  /**
   * @type {Array<number|string>}
   */
  args

  /**
   * @type {any}
   */
  processed_subscribers

  constructor( data ) {
    this.id = data.id;
    this.contract = data.contract;
    this.event = data.event;
    this.transaction_hash = data.transaction_hash;
    this.block_number = data.block_number;
    this.log_index = data.log_index;
    this.tx_index = data.tx_index;
    this.from_address = data.from_address;
    this.global_index = data.global_index;
    this.block_timestamp = data.block_timestamp;
    this.args = data.args || [];
    this.processed_subscribers = {};
  }

  toMongoObject() {
    return {
      _id: this.id,
      contract: this.contract,
      event: this.event,
      transaction_hash: this.transaction_hash,
      block_number: this.block_number,
      log_index: this.log_index,
      tx_index: this.tx_index,
      from_address: this.from_address,
      global_index: this.global_index,
      block_timestamp: this.block_timestamp,
      args: this.args,
      processed_subscribers: this.processed_subscribers
    };
  }
}