// statusMapping.js — xRAF dashboard canonical status logic (2025-08)
// Maps raw ATS statuses into 6 display groups used by the UI.
//
// Display groups (and their order):
// 1) Application Received
// 2) Assessment Stage
// 3) Hired (Probation)
// 4) Hired (Confirmed)  <-- same as Probation but daysInStage ≥ 90
// 5) Previously Applied (No Payment)  <-- source must be xRAF; anything else is not accepted
// 6) Not Selected

(function (global) {
  // ---------- helpers ----------
  function norm(s) {
    return (s || '').toString().trim().toLowerCase();
  }

  // Only "xRAF" (case-insensitive) is accepted as a referral source.
  // Anything else -> Previously Applied (No Payment)
  function isXRafSource(source) {
    const s = norm(source);
    return s === 'xraf';
  }

  // ---------- group dictionaries (exact labels you provided) ----------
  // 1) Application Received
  const APP_RECEIVED_LIST = [
    'application received',

    // SHL blocks (lives under "Application Received")
    'shl assessment: conversational multichat eng',
    'shl assessment: sales competency eng',
    'shl assessment: system diagnostic eng',
    'shl assessment: typing eng',
    'shl assessment: writex e-mail eng',

    'contact attempt 1',
    'contact attempt 2',
    'contact attempt 3',
    'textapply',
    'external portal',
    'internal portal',
    'recruiter submitted',
    'agency submissions',
    'employee referral',
    'incomplete'
  ].map(norm);

  // 2) Assessment Stage
  const ASSESSMENT_LIST = [
    'evaluated',
    'pre-screened',
    'screened',
    'screen: assessment 1 completed',
    'screened: amber candidate',
    'screened: green candidate',
    'screened: unable to allocate',
    'interview scheduled',
    'interview complete / offer requested',
    'second interview scheduled',
    'second interview complete / offer requested',
    'third interview scheduled',
    'third interview complete / offer requested',
    'ready to offer',
    'job offer presented',
    'waha agreement (signature)',
    'moved to another requisition or talent pool',
    'class start date re-assigned'
  ].map(norm);

  // 3) Hired (Probation/Confirmed)
  const HIRED_LIST = [
    'credit check initiated',
    'onboarding started',
    'contract presented',
    'background check (canada)',
    'background/drug check initiated',
    'ccms export initiated',
    'cleared to start',
    'equipment requested',
    'new starter (hired)',
    'graduate'
  ].map(norm);

  // 4) Not Selected (full list)
  const NOT_SELECTED_LIST = [
    'eliminated - age',
    'eliminated - assessment results did not meet criteria',
    'eliminated - availability',
    'eliminated - cv/resume analysis',
    'eliminated - did not start assessment',
    'eliminated - incomplete assessment',
    'eliminated - language',
    'eliminated - location/country',
    'eliminated - no hire list/not rehireable',
    'eliminated - processed on another requisition',
    'eliminated - unprocessed candidate',
    'eliminated - unreachable/unresponsive',
    'eliminated - wah - connectivity requirements',
    'eliminated - wah - technical requirements',
    'withdrew - country',
    'withdrew - location',
    'withdrew - long-term commitment',
    'withdrew - no reason given',
    'withdrew - other job offer',
    'withdrew - salary',
    'withdrew - schedule',
    'eliminated - initial dnq',
    'eliminated - no show (interview 1)',
    'eliminated - no show (interview 2)',
    'eliminated - no show (interview 3)',
    'eliminated - interview 1 complete (reject)',
    'eliminated - interview 2 complete (reject)',
    'eliminated - interview 3 complete (reject)',
    'eliminated - availability (interview 1)',
    'withdrew - job fit (interview 1)',
    'withdrew - job fit (interview 2)',
    'withdrew - job fit (interview 3)',
    'withdrew - other job offer (interview 1)',
    'withdrew - other job offer (interview 2)',
    'withdrew - other job offer (interview 3)',
    'withdrew - personal/family (interview 1 )',
    'withdrew - personal/family (interview 2)',
    'withdrew - personal/family (interview 3)',
    'withdrew - salary (interview 1)',
    'withdrew - salary (interview 2)',
    'withdrew - salary (interview 3)',
    'withdrew - schedule (interview 1 )',
    'withdrew - schedule (interview 2)',
    'withdrew - schedule (interview 3)',
    'eliminated - age (pre-offer)',
    'eliminated - age (post offer)',
    'eliminated - employment eligibility verification',
    'eliminated - falsified application',
    'eliminated - ineligible (background)',
    'eliminated - ineligible (drug test)',
    'eliminated - offer rescinded (pre-offer)',
    'eliminated - offer rescinded (post offer)',
    'eliminated - unreachable/unresponsive (pre-offer)',
    'eliminated - unreachable/unresponsive (post offer)',
    'withdrew - medical (pre-offer)',
    'withdrew - medical (post offer)',
    'withdrew - offer declined/rejected',
    'withdrew - onboarding incomplete',
    'withdrew - other job offer (pre-offer)',
    'withdrew - other job offer (post offer)',
    'withdrew - personal/family (pre-offer)',
    'withdrew - personal/family (post offer)',
    'withdrew - role (pre-offer)',
    'withdrew - role (post offer)',
    'withdrew - salary (p re-offen',
    'withdrew - salary (post offer)',
    'withdrew - schedule (pre-offer)',
    'withdrew - schedule (post offer)',
    'eliminated - no show',
    'internal employee',
    'class cancelled',

    // Legacy bucket
    'legacy - assessment results did not meet criteria',
    'legacy - age',
    'legacy - anonymous by gdpr',
    'legacy - availability',
    'legacy - behavior',
    'legacy - communication skills',
    'legacy - criminal record',
    'legacy - cv analysis',
    'legacy - education',
    'legacy - falsified application',
    'legacy - invalid phone number',
    'legacy - language',
    'legacy - long-term commitment',
    'legacy - motivation',
    'legacy - no hire list',
    'legacy - no show',
    'legacy - not re-hirable',
    'legacy - recording denied',
    'legacy - reference check',
    'legacy - salary expectation',
    'legacy - soft skills',
    'legacy - unreachable',
    'legacy - wah - connectivity requirements',
    'legacy - wah - contract',
    'legacy - wah - technical requirements',
    'legacy - work permit',
    'legacy - country',
    'legacy - did not apply',
    'legacy - incomplete assessment',
    'legacy - location',
    'legacy - medical',
    'legacy - negative review of tp',
    'legacy - no reason given',
    'legacy - other job offer',
    'legacy - personal/family',
    'legacy - project',
    'legacy - role',
    'legacy - salary conditions',
    'legacy - schedule',
    'legacy - security condition',

    'self-withdrew (recruiter)',
    'self-withdrew (portal)'
  ].map(norm);

  // For Plan B: statuses that imply the AI assessment has been passed
  const INFER_ASSESS_PASS = new Set([
    'second interview scheduled',
    'second interview complete / offer requested'
  ]);

  // Convert to Sets for O(1) checks
  const APP_RECEIVED = new Set(APP_RECEIVED_LIST);
  const ASSESSMENT_STAGE = new Set(ASSESSMENT_LIST);
  const HIRED = new Set(HIRED_LIST);
  const NOT_SELECTED = new Set(NOT_SELECTED_LIST);

  // ---------- main mapper ----------
  const StatusMapping = {
    displayOrder: [
      'Application Received',
      'Assessment Stage',
      'Hired (Probation)',
      'Hired (Confirmed)',
      'Previously Applied (No Payment)',
      'Not Selected'
    ],

    /**
     * Core mapping: raw status + context -> display group
     * @param {string} status
     * @param {{score?:number,date?:string}|null} assessment
     * @param {string} source
     * @param {number} daysInStage
     */
    mapStatusToGroup(status, assessment, source, daysInStage) {
      const s = norm(status);

      // 0) Source gate first: only xRAF is accepted
      if (!isXRafSource(source)) {
        return 'Previously Applied (No Payment)';
      }

      // 1) Not Selected (exact list first)
      if (NOT_SELECTED.has(s)) return 'Not Selected';
      // Not Selected heuristics (covers variants)
      if (
        s.startsWith('eliminated') ||
        s.startsWith('withdrew') ||
        s.includes('legacy -') ||
        s.includes('offer rescinded') ||
        s.includes('no show') ||
        s.includes('not re-hirable') ||
        s.includes('unreachable') ||
        s.includes('unresponsive')
      ) {
        return 'Not Selected';
      }

      // 2) Hired buckets
      if (HIRED.has(s) || s.includes('new starter') || s.includes('hired') || s.includes('cleared to start') || s.includes('onboard')) {
        if (typeof daysInStage === 'number' && daysInStage >= 90) {
          return 'Hired (Confirmed)';
        }
        return 'Hired (Probation)';
      }

      // 3) Assessment Stage
      if (
        ASSESSMENT_STAGE.has(s) ||
        s.startsWith('screen:') ||
        s.startsWith('screened') ||
        s.includes('interview') ||
        s.includes('offer') ||
        s.includes('waha agreement') ||
        s.includes('moved to another requisition') ||
        s.includes('class start date re-assigned')
      ) {
        return 'Assessment Stage';
      }

      // 4) Application Received
      if (APP_RECEIVED.has(s) || s.startsWith('shl assessment:')) {
        return 'Application Received';
      }

      // 5) Fallback: treat unknowns as Application Received
      return 'Application Received';
    },

    // Simplified style tokens for CSS (also tolerates being passed a group label directly)
    getSimplifiedStatusType(status, assessment, source, daysInStage) {
      const groupLabels = new Set(this.displayOrder.map(norm));
      const s = norm(status);
      const group = groupLabels.has(s)
        ? status
        : this.mapStatusToGroup(status, assessment, source, daysInStage);

      switch (group) {
        case 'Hired (Confirmed)': return 'passed';
        case 'Hired (Probation)': return 'probation';
        case 'Previously Applied (No Payment)': return 'previously-applied';
        case 'Assessment Stage': return 'assessment';
        case 'Not Selected': return 'failed';
        case 'Application Received':
        default: return 'received';
      }
    },

    // For display
    determineStage(status, assessment, source, daysInStage) {
      return this.mapStatusToGroup(status, assessment, source, daysInStage);
    },

    /**
     * Plan B + explicit score:
     * - Returns true if assessment.score ≥ 70
     * - Or if status implies pass via INFER_ASSESS_PASS (Second Interview scheduled/complete)
     */
    hasPassedAIAssessment(status, assessment) {
      if (assessment && typeof assessment.score === 'number' && assessment.score >= 70) return true;
      const s = norm(status);
      return INFER_ASSESS_PASS.has(s);
    },

    // For WhatsApp reminders (Application Received + Assessment Stage)
    isReminderEligible(groupLabel) {
      return groupLabel === 'Application Received' || groupLabel === 'Assessment Stage';
    },

    // Expose for debugging if needed
    _sets: {
      APP_RECEIVED,
      ASSESSMENT_STAGE,
      HIRED,
      NOT_SELECTED
    },
    _isXRafSource: isXRafSource
  };

  // UMD-style export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatusMapping;
  } else {
    global.StatusMapping = StatusMapping;
  }
})(this);
