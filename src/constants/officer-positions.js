// src/constants/officer-positions.js
const BSBA_OFFICER_POSITIONS = [
  "President",
  "Executive Vice President",
  "General Secretary",
  "Secretary Board",
  "Vp For Academics",
  "Member Of Vp For Academics",
  "Vp For Finance",
  "Member Of Vp For Finance",
  "Vp For Audit",
  "Member Of Vp For Audit",
  "Vp For Membership",
  "Member Of Vp For Membership",
  "Vp For Communication",
  "Member Of Vp For Communication",
  "Vp For Logistics",
  "Member Of Vp For Logistics",
  "Vp For Graphics And Publications",
  "Member Of Vp For Graphics And Publications",
  "Vp For Non-Academics (Sociocultural Committee)",
  "Member Of Vp For Non-Academics (Sociocultural Committee)",
  "Vp For Non-Academics (Sports Committee)",
  "Member Of Vp For Non-Academics (Sports Committee)",
  "Representative 1st year FM-A",
  "Representative 1st year FM-B",
  "Representative 1st year MM-A",
  "Representative 1st year MM-B",
  "Representative 1st year HRDM",
  "Representative 2nd year FM-A",
  "Representative 2nd year FM-B",
  "Representative 2nd year MM",
  "Representative 3rd year FM",
  "Representative 3rd year MM",
  "Representative 3rd year HRDM",
  "Representative 4th year FM",
  "Representative 4th year MM",
  "Representative 4th year HRDM",
];

// Avoid magic strings by exposing named constants
const BSBA_OFFICER_POSITION_MAP = {
  PRESIDENT: BSBA_OFFICER_POSITIONS[0],
  EXECUTIVE_VICE_PRESIDENT: BSBA_OFFICER_POSITIONS[1],
  GENERAL_SECRETARY: BSBA_OFFICER_POSITIONS[2],
  SECRETARY_BOARD: BSBA_OFFICER_POSITIONS[3],

  VP_FOR_ACADEMICS: BSBA_OFFICER_POSITIONS[4],
  MEMBER_OF_VP_FOR_ACADEMICS: BSBA_OFFICER_POSITIONS[5],

  VP_FOR_FINANCE: BSBA_OFFICER_POSITIONS[6],
  MEMBER_OF_VP_FOR_FINANCE: BSBA_OFFICER_POSITIONS[7],

  VP_FOR_AUDIT: BSBA_OFFICER_POSITIONS[8],
  MEMBER_OF_VP_FOR_AUDIT: BSBA_OFFICER_POSITIONS[9],

  VP_FOR_MEMBERSHIP: BSBA_OFFICER_POSITIONS[10],
  MEMBER_OF_VP_FOR_MEMBERSHIP: BSBA_OFFICER_POSITIONS[11],

  VP_FOR_COMMUNICATION: BSBA_OFFICER_POSITIONS[12],
  MEMBER_OF_VP_FOR_COMMUNICATION: BSBA_OFFICER_POSITIONS[13],

  VP_FOR_LOGISTICS: BSBA_OFFICER_POSITIONS[14],
  MEMBER_OF_VP_FOR_LOGISTICS: BSBA_OFFICER_POSITIONS[15],

  VP_FOR_GRAPHICS_AND_PUBLICATIONS: BSBA_OFFICER_POSITIONS[16],
  MEMBER_OF_VP_FOR_GRAPHICS_AND_PUBLICATIONS: BSBA_OFFICER_POSITIONS[17],

  VP_NON_ACADS_SOCIO: BSBA_OFFICER_POSITIONS[18],
  MEMBER_VP_NON_ACADS_SOCIO: BSBA_OFFICER_POSITIONS[19],

  VP_NON_ACADS_SPORTS: BSBA_OFFICER_POSITIONS[20],
  MEMBER_VP_NON_ACADS_SPORTS: BSBA_OFFICER_POSITIONS[21],

  REP_1ST_YEAR_FM_A: BSBA_OFFICER_POSITIONS[22],
  REP_1ST_YEAR_FM_B: BSBA_OFFICER_POSITIONS[23],
  REP_1ST_YEAR_MM_A: BSBA_OFFICER_POSITIONS[24],
  REP_1ST_YEAR_MM_B: BSBA_OFFICER_POSITIONS[25],
  REP_1ST_YEAR_HRDM: BSBA_OFFICER_POSITIONS[26],

  REP_2ND_YEAR_FM_A: BSBA_OFFICER_POSITIONS[27],
  REP_2ND_YEAR_FM_B: BSBA_OFFICER_POSITIONS[28],
  REP_2ND_YEAR_MM: BSBA_OFFICER_POSITIONS[29],

  REP_3RD_YEAR_FM: BSBA_OFFICER_POSITIONS[30],
  REP_3RD_YEAR_MM: BSBA_OFFICER_POSITIONS[31],
  REP_3RD_YEAR_HRDM: BSBA_OFFICER_POSITIONS[32],

  REP_4TH_YEAR_FM: BSBA_OFFICER_POSITIONS[33],
  REP_4TH_YEAR_MM: BSBA_OFFICER_POSITIONS[34],
  REP_4TH_YEAR_HRDM: BSBA_OFFICER_POSITIONS[35],
};

export { BSBA_OFFICER_POSITIONS, BSBA_OFFICER_POSITION_MAP };
