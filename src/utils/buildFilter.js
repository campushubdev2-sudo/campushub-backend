// @ts-check

/**
 * @typedef {Object} Query
 * @property {string} [title] - Event title to filter (partial, case-insensitive)
 * @property {string} [venue] - Event venue to filter (partial, case-insensitive)
 * @property {string} [organizedBy] - Organizer name to filter
 * @property {string|Date} [date] - Event date to filter (exact day)
 */

/**
 * Builds a MongoDB filter object from a query object.
 * @param {Query} query - The query object containing filter parameters
 * @returns {Object} A MongoDB filter object
 */
const buildFilterFromQuery = (query) => {
  const filter = {};

  if (query.title) {
    filter.title = { $regex: query.title, $options: "i" };
  }
  if (query.venue) {
    filter.venue = { $regex: query.venue, $options: "i" };
  }
  if (query.organizedBy) {
    filter.organizedBy = query.organizedBy;
  }
  if (query.date) {
    const start = new Date(query.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter.date = { $gte: start, $lt: end };
  }

  return filter;
};

export { buildFilterFromQuery };
