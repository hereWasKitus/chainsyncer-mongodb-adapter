import { Event } from "./lib/models/Event";
import { QueueEvent } from "./lib/models/QueueEvent";

export class MongoDBAdapter {
  latest_blocks = null;
  events = null;
  events_queue = null;
  subscribers = null;

  client = null;
  db = null;

  _is_chainsyncer_adapter = true;

  /**
   *
   * @param {Object} db MongoDB instance
   */
  constructor(db, opts = {}) {
    this.db = db;
    this._initCollections(opts.prefix || "chsy_");
  }

  _initCollections(prefix) {
    this.events = this.db.collection(`${prefix}events`);
    this.events_queue = this.db.collection(`${prefix}eventsqueue`);
    this.subscribers = this.db.collection(`${prefix}subscribers`);
    this.latest_blocks = this.db.collection(`${prefix}latestblocks`);
  }

  /**
   *
   * @param {string} contract_name
   * @returns
   */
  async getLatestScannedBlockNumber(contract_name) {
    const item = await this.latest_blocks.findOne({ contract_name });

    if (item) {
      return item.block_number;
    }

    return 0;
  }

  /**
   *
   * @param {string} subscriber
   * @param {Array<string>} events
   */
  async removeQueue(subscriber, events) {
    await this.events_queue.deleteMany({
      event: { $in: events.map((n) => n.split(".")[1]) },
      contract: { $in: events.map((n) => n.split(".")[0]) },
      subscriber,
    });
  }

  /**
   *
   * @param {string} subscriber
   * @param {Array<string>} events
   */
  async addUnprocessedEventsToQueue(subscriber, events) {
    const unprocessed_events = (
      await this.events
        .find({
          contract: { $in: events.map((n) => n.split(".")[0]) },
          event: { $in: events.map((n) => n.split(".")[1]) },
        })
        .toArray()
    )
      .filter((n) => !n.processed_subscribers[subscriber])
      .map((n) => new QueueEvent({ id: n._id, ...n }, subscriber));

    await this.events_queue
      .insertMany(unprocessed_events.map((n) => n.toMongoObject()))
      .catch(() => {});
  }

  /**
   *
   * @returns
   */
  async selectAllSubscribers() {
    const subscribers = await this.subscribers.find({}).toArray();
    return subscribers;
  }

  /**
   *
   * @param {string} subscriber
   * @param {Array<string>} events
   * @returns
   */
  async updateSubscriber(subscriberName, events) {
    events = [...events.sort()];
    let subscriber = await this.subscribers.findOne({ name: subscriberName });

    if (!subscriber) {
      const latest_blocks = (await this.latest_blocks.find({}).toArray()).map(
        (n) => ({ [n.contract_name]: n.block_number })
      );
      await this.subscribers.insertOne({
        name: subscriberName,
        events: [],
        added_at: [...latest_blocks],
      });
      subscriber = await this.subscribers.findOne({ name: subscriberName });
    }

    const events_added = events.filter((n) => !subscriber.events.includes(n));
    const events_removed = subscriber.events.filter((n) => !events.includes(n));

    await this.subscribers.updateOne(
      { name: subscriberName },
      { $set: { events } }
    );

    return { events_added, events_removed };
  }

  async saveLatestScannedBlockNumber(contract_name, block_number) {
    await this.latest_blocks.updateOne(
      { contract_name },
      { $set: { block_number } },
      { upsert: true }
    );
  }

  /**
   * IMPORTANT
   * @param {string} subscriber
   * @returns {string}
   */
  async selectAllUnprocessedEventsBySubscriber(subscriber) {
    const from_queue = (
      await this.events_queue.find({ subscriber }).toArray()
    ).map((n) => n.event_id);

    const events = await this.events
      .find({ _id: { $in: from_queue } })
      .toArray();

    return events;
  }

  /**
   * IMPORTANT
   * @param {string} id
   * @param {string} subscriber
   */
  async setEventProcessedForSubscriber(id, subscriber) {
    const item = await this.events.findOne({ _id: id });

    if (item) {
      item.processed_subscribers[subscriber] = true;
      await this.events.updateOne(
        { _id: id },
        { $set: { processed_subscribers: item.processed_subscribers } }
      );

      const __id = id + "_" + subscriber;
      await this.events_queue.deleteOne({ _id: __id });
    }
  }

  /**
   *
   * @param {Array<string>} ids
   * @returns {Array<string>} filtered ids
   */
  async filterExistingEvents(ids) {
    const exist_ids = (
      await this.events.find({ _id: { $in: ids } }).toArray()
    ).map((n) => n._id);

    ids = ids.filter((n) => !exist_ids.includes(n));

    return ids;
  }

  /**
   *
   * @param {Array<any>} events
   * @param {Array<string>} subscribers
   */
  async saveEvents(events, subscribers) {
    if (!events.length) {
      return;
    }

    events = events.map((n) => new Event(n));

    const non_exist_ids = await this.filterExistingEvents(
      events.map((n) => n.id)
    );

    if (non_exist_ids.length !== events.length) {
      throw new Error("Some events already exist");
    }

    await this.events.insertMany(events.map((n) => n.toMongoObject()));

    for (const i in subscribers) {
      const subs = subscribers[i];

      const filtered_events = events.filter((n) => {
        const full = n.contract + "." + n.event;
        return subs.events.includes(full);
      });

      await this.events_queue.insertMany(
        filtered_events.map((n) => new QueueEvent(n, subs.name).toMongoObject())
      );
    }
  }
}
