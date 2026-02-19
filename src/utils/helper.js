// @ts-check

/**
 * @typedef {Object} Organization
 * @property {string} _id - Unique identifier
 * @property {string} orgName - Organization name
 * @property {string} [description] - Organization description
 * @property {Object} [adviserId] - Adviser object (optional)
 * @property {string} [adviserId.username] - Adviser username
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 *
 * @param {Organization} org - The organization object
 * @returns {Object} Mapped organization object
 */
const mapOrganization = (org) => ({
  _id: org._id,
  orgName: org.orgName,
  description: org.description,
  adviser: org.adviserId?.username ?? null,
  createdAt: org.createdAt,
  updatedAt: org.updatedAt,
});

export { mapOrganization };
