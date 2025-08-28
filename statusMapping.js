// statusMapping.js — xRAF dashboard canonical status logic (2025-08)
// Maps many raw ATS statuses into 6 display groups used by the UI.
//
// Display groups (and their order):
// 1) Application Received
// 2) Assessment Stage
// 3) Hired (Probation)
// 4) Hired (Confirmed)  <-- same as Probation but daysInStage ≥ 90
// 5) Previously Applied (No Payment)  <-- source is NOT xRAF/Employee Referral/RAF
// 6) Not Selected

(function (global) {
  // ---------- helpers ----------
  function norm(s) {
    return (s || '').toString().trim().toLowerCase();
  }

  function isXRafSource(source) {
    const s = norm(source);
    if (!s) return false; // empty is NOT accepted
    // Accept only clear xRAF-type sources
    return (
      s.includes('xraf') ||
      s.includes('xRAF')
    );
  }

  // ---------- group dictionaries (exact labels you provided) ----------
  const APP_RECEIVED = [
    'application received',

    // SHL blocks (you requested these to live under "Application Received")
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

  const ASSESSMENT_STAGE = [
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

  const HIRED = [
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

  // Giant "Not Selected" bucket — everything you listed here maps to Not Selected
  const NOT_SELECTED = [
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
    'withdrew - salary (p re-offen', // keeping as provided
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

  // For inferring "AI assessment passed" (Plan B)
  const INFER_ASSESSMENT_PASS = new Set([
    'interview scheduled',
    'interview complete / offer requested',
    'second interview scheduled',
    'second interview complete / offer requested',
    'third interview scheduled',
    'third interview complete / offer requested',
    'ready to offer',
    'job offer presented',
    'onboarding started',
    'new starter (hired)',
    'graduate',
    'cleared to start',
    'contract presented'
  ]);

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

    // Core: map raw status + context -> display group
    mapStatusToGroup(status, assessment, source, daysInStage) {
      const s = norm(status);

      // 1) Hard "Not Selected" bucket first (always wins)
      if (NOT_SELECTED.includes(s)) return 'Not Selected';

      // 2) Source gate: only xRAF/Employee Referral/RAF is accepted as referral
      if (!isXRafSource(source)) {
        return 'Previously Applied (No Payment)';
      }

      // 3) Hired buckets
      if (HIRED.includes(s)) {
        if (typeof daysInStage === 'number' && daysInStage >= 90) {
          return 'Hired (Confirmed)';
        }
        return 'Hired (Probation)';
      }

      // 4) Assessment stage
      if (ASSESSMENT_STAGE.includes(s)) {
        return 'Assessment Stage';
      }

      // 5) Application received
      if (APP_RECEIVED.includes(s)) {
        return 'Application Received';
      }

      // 6) Sensible fallback: try to infer
      // - If status mentions interview/offer -> Assessment Stage
      if (s.includes('interview') || s.includes('offer') || s.includes('screen')) {
        return 'Assessment Stage';
      }

      // - If status hints anything "hired/onboarding/start/graduate"
      if (
        s.includes('hired') ||
        s.includes('onboard') ||
        s.includes('start') ||
        s.includes('graduate')
      ) {
        return (typeof daysInStage === 'number' && daysInStage >= 90)
          ? 'Hired (Confirmed)'
          : 'Hired (Probation)';
      }

      // Default: Application Received
      return 'Application Received';
    },

    // Simplified style tokens for CSS
    getSimplifiedStatusType(status, assessment, source, daysInStage) {
      const group = this.mapStatusToGroup(status, assessment, source, daysInStage);
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

    // Plan B: infer whether the AI assessment has passed from the status progression
    // (use this in your RM50 logic if you don't have a numeric score)
    didPassAI(status) {
      return INFER_ASSESSMENT_PASS.has(norm(status));
    },

    // expose for reuse
    _sets: {
      APP_RECEIVED: new Set(APP_RECEIVED),
      ASSESSMENT_STAGE: new Set(ASSESSMENT_STAGE),
      HIRED: new Set(HIRED),
      NOT_SELECTED: new Set(NOT_SELECTED)
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
