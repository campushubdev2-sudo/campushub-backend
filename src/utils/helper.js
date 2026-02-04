const mapOrganization = (org) => ({
  _id: org._id,
  orgName: org.orgName,
  description: org.description,
  adviser: org.adviserId?.username ?? null,
  createdAt: org.createdAt,
  updatedAt: org.updatedAt,
});

export { mapOrganization };
