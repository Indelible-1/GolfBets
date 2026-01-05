// ============ GROUPS ============

export {
  createGroup,
  getGroup,
  getUserGroups,
  getGroupWithMembers,
  updateGroupName,
  updateGroupSettings,
  addGroupMember,
  removeGroupMember,
  deleteGroup,
  incrementGroupStats,
  validateGroupName,
  canDeleteGroup,
  canEditGroup,
  isGroupMember,
} from './groups'

// ============ SEASONS ============

export {
  createSeason,
  getSeason,
  getGroupSeasons,
  getActiveGroupSeason,
  getOrCreateCurrentSeason,
  updateSeasonStandings,
  completeSeason,
  getSeasonDates,
  isSeasonActive,
  getSeasonProgress,
} from './seasons'

// ============ LEADERBOARD ============

export {
  calculateStandings,
  calculateStandingsFromLedger,
  filterMatchesByDateRange,
  filterLedgerByDateRange,
  formatRankChange,
  getRankEmoji,
  getRankLabel,
  getWinLossRatio,
  formatWinLoss,
} from './leaderboard'

// ============ REMATCH ============

export {
  createRematchConfig,
  canRematch,
  modifyRematchConfig,
  updateRematchParticipants,
  updateRematchTeeTime,
  updateRematchCourse,
  getRematchSummary,
  isRematchModified,
} from './rematch'

// ============ TEMPLATES ============

export {
  createBetTemplate,
  getBetTemplate,
  getUserBetTemplates,
  getDefaultBetTemplate,
  updateBetTemplateName,
  updateBetTemplateBets,
  setDefaultTemplate,
  deleteBetTemplate,
  applyBetTemplate,
  validateTemplateName,
  getTemplateSummary,
  isTemplateOwner,
} from './templates'
