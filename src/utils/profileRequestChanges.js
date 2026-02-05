import { formatDate } from './helpers';

const PERSONAL_INFO_LABELS = {
  first_name: 'First name',
  last_name: 'Last name',
  name_bn: 'Name (Bengali)',
  nid_number: 'NID number',
  phone: 'Phone',
  gender: 'Gender',
  dob: 'Date of birth',
  religion: 'Religion',
  blood_group: 'Blood group',
  marital_status: 'Marital status',
  place_of_birth: 'Place of birth',
  height: 'Height',
  passport: 'Passport',
  birth_reg: 'Birth registration',
};

const ADDRESS_LABELS = {
  division: 'Division',
  district: 'District',
  upazila: 'Upazila',
  post_office: 'Post office',
  house_no: 'House no / Road',
  village_road: 'Village / Area',
};

const FAMILY_FIELD_LABELS = {
  name: 'Name',
  name_bn: 'Name (Bengali)',
  nid: 'NID',
  dob: 'Date of birth',
  occupation: 'Occupation',
  is_alive: 'Alive',
  is_active_marriage: 'Active marriage',
  gender: 'Gender',
};

function formatValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return String(value);
}

function formatDateValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return formatDate(value);
  }
  return formatValue(value);
}

/**
 * Compare two values (including dates) for equality
 */
export function isSame(prev, next, key) {
  const a = prev == null || prev === '' ? null : prev;
  const b = next == null || next === '' ? null : next;
  if (a === b) return true;
  if (key === 'dob') {
    const d1 = a ? String(a).slice(0, 10) : null;
    const d2 = b ? String(b).slice(0, 10) : null;
    return d1 === d2;
  }
  return false;
}

/**
 * Build proposed_changes with only fields that differ from current employee.
 * Avoids sending Father/Mother is_alive etc. when they weren't toggled.
 */
function pickChangedFlat(current, proposed, keys) {
  const out = {};
  keys.forEach((key) => {
    const prev = current?.[key];
    const next = proposed?.[key];
    if (next == null || next === '') return;
    if (isSame(prev, next, key)) return;
    out[key] = next;
  });
  return Object.keys(out).length ? out : null;
}

function pickChangedNested(current, proposed, keysToCompare) {
  if (!current && !proposed) return null;
  const cur = current || {};
  const prop = proposed || {};
  const out = {};
  keysToCompare.forEach((key) => {
    const prev = cur[key];
    const next = prop[key];
    if (next == null && prev == null) return;
    if (isSame(prev, next, key)) return;
    out[key] = next;
  });
  return Object.keys(out).length ? out : null;
}

function pickChangedFamily(current, proposed) {
  if (!current && !proposed) return null;
  const cur = current || {};
  const prop = proposed || {};
  const fatherKeys = [
    'name',
    'name_bn',
    'nid',
    'dob',
    'occupation',
    'is_alive',
  ];
  const motherKeys = [
    'name',
    'name_bn',
    'nid',
    'dob',
    'occupation',
    'is_alive',
  ];
  const out = {};
  const father = pickChangedNested(cur.father, prop.father, fatherKeys);
  if (father) out.father = father;
  const mother = pickChangedNested(cur.mother, prop.mother, motherKeys);
  if (mother) out.mother = mother;
  const curSpouses = cur.spouses || [];
  const propSpouses = prop.spouses || [];
  if (
    propSpouses.length !== curSpouses.length ||
    JSON.stringify(curSpouses) !== JSON.stringify(propSpouses)
  ) {
    out.spouses = propSpouses;
  }
  const curChildren = cur.children || [];
  const propChildren = prop.children || [];
  if (
    propChildren.length !== curChildren.length ||
    JSON.stringify(curChildren) !== JSON.stringify(propChildren)
  ) {
    out.children = propChildren;
  }
  return Object.keys(out).length ? out : null;
}

function pickChangedAddresses(current, proposed) {
  const out = { present: {}, permanent: {} };
  const addrKeys = [
    'division',
    'district',
    'upazila',
    'post_office',
    'house_no',
    'village_road',
  ];
  for (const type of ['present', 'permanent']) {
    const cur = current?.[type] || {};
    const prop = proposed?.[type] || {};
    addrKeys.forEach((key) => {
      if (isSame(cur[key], prop[key])) return;
      if (prop[key] != null && prop[key] !== '') out[type][key] = prop[key];
    });
    if (Object.keys(out[type]).length === 0) delete out[type];
  }
  return Object.keys(out.present || {}).length ||
    Object.keys(out.permanent || {}).length
    ? out
    : null;
}

function pickChangedAcademics(current, proposed) {
  const safe = (a) => (a && typeof a === 'object' ? a : {});
  const cur = (current || []).map((a) => {
    const s = safe(a);
    return {
      exam_name: s.exam_name || '',
      institute: s.institute || '',
      passing_year: s.passing_year || '',
      result: s.result || '',
    };
  });
  const prop = (proposed || []).map((a) => {
    const s = safe(a);
    return {
      exam_name: s.exam_name || '',
      institute: s.institute || '',
      passing_year: s.passing_year || '',
      result: s.result || '',
    };
  });
  if (cur.length !== prop.length) return prop;
  const changed = prop.some((p, i) => {
    const c = cur[i] || {};
    return (
      !isSame(c.exam_name, p.exam_name) ||
      !isSame(c.institute, p.institute) ||
      !isSame(c.passing_year, p.passing_year) ||
      !isSame(c.result, p.result)
    );
  });
  if (!changed) return null;
  return prop;
}

/**
 * Build proposed_changes object containing only sections/fields that changed.
 * currentEmployee: API employee shape (family as array or normalized, addresses, academics).
 */
export function buildProposedChangesOnlyChanged(currentEmployee, formData) {
  if (!formData || typeof formData !== 'object') return {};
  const current = currentEmployee || {};
  const curFamily = current.family || [];
  const curFather = curFamily.find((f) => f.relation === 'father') || {};
  const curMother = curFamily.find((f) => f.relation === 'mother') || {};
  const curAddresses = current.addresses || [];
  const curPresent = curAddresses.find((a) => a.type === 'present') || {};
  const curPermanent = curAddresses.find((a) => a.type === 'permanent') || {};
  const personalKeys = Object.keys(PERSONAL_INFO_LABELS || {});
  const currentNormalized = {
    personal_info: Object.fromEntries(
      personalKeys.map((k) => [k, current[k] ?? ''])
    ),
    family: {
      father: curFather,
      mother: curMother,
      spouses: curFamily.filter((f) => f.relation === 'spouse'),
      children: curFamily.filter((f) => f.relation === 'child'),
    },
    addresses: {
      present: curPresent,
      permanent: curPermanent,
    },
    academics: (current.academics || []).map((a) => ({
      exam_name: a.exam_name,
      institute: a.institute,
      passing_year: a.passing_year,
      result: a.result,
    })),
  };
  const personalInfo = pickChangedFlat(
    currentNormalized.personal_info,
    formData,
    Object.keys(PERSONAL_INFO_LABELS || {})
  );
  const family = pickChangedFamily(currentNormalized.family, formData.family);
  const addresses = pickChangedAddresses(
    currentNormalized.addresses,
    formData.addresses
  );
  const academics = pickChangedAcademics(
    currentNormalized.academics,
    formData.academics
  );

  const proposed = {};
  if (personalInfo) proposed.personal_info = personalInfo;
  if (family) proposed.family = family;
  if (addresses) proposed.addresses = addresses;
  if (academics) proposed.academics = academics;
  return proposed;
}

/**
 * Build rows for a flat object (e.g. personal_info)
 */
function diffFlat(current, proposed, labels, options = {}) {
  const rows = [];
  const keys = new Set([
    ...Object.keys(current || {}),
    ...Object.keys(proposed || {}),
  ]);
  const fmt = options.dateKeys
    ? (v, k) =>
        options.dateKeys.includes(k) ? formatDateValue(v) : formatValue(v)
    : formatValue;
  keys.forEach((key) => {
    const prev = current?.[key];
    const next = proposed?.[key];
    if (isSame(prev, next, key)) return;
    if (next == null || next === '') return;
    const label = labels[key] || key.replace(/_/g, ' ');
    rows.push({
      label,
      previous: fmt(prev, key),
      proposed: fmt(next, key),
    });
  });
  return rows;
}

/**
 * Build rows for nested object (e.g. father, mother) with prefix
 */
function diffNestedObject(current, proposed, prefix) {
  const rows = [];
  const keys = new Set([
    ...Object.keys(current || {}),
    ...Object.keys(proposed || {}),
  ]);
  const skipKeys = [
    'relation',
    'employee_id',
    'id',
    'created_at',
    'updated_at',
    'deleted_at',
  ];
  keys.forEach((key) => {
    if (skipKeys.includes(key)) return;
    const prev = current?.[key];
    const next = proposed?.[key];
    if (isSame(prev, next, key)) return;
    if (next == null || next === '') return;
    // Don't show Father/Mother "Alive" when it's just default (previous empty, proposed Yes)
    if (key === 'is_alive' && (prev == null || prev === '') && next === true)
      return;
    const label = FAMILY_FIELD_LABELS[key] || key.replace(/_/g, ' ');
    const proposedDisplay =
      key === 'dob' ? formatDateValue(next) : formatValue(next);
    rows.push({
      label: `${prefix} – ${label}`,
      previous: key === 'dob' ? formatDateValue(prev) : formatValue(prev),
      proposed: proposedDisplay,
    });
  });
  return rows;
}

/**
 * Build sections for family (father, mother, spouses, children)
 */
function diffFamily(current, proposed) {
  const rows = [];
  if (!current && !proposed) return rows;

  const cur = current || {};
  const prop = proposed || {};

  if (cur.father || prop.father) {
    rows.push(...diffNestedObject(cur.father, prop.father, 'Father'));
  }
  if (cur.mother || prop.mother) {
    rows.push(...diffNestedObject(cur.mother, prop.mother, 'Mother'));
  }

  const curSpouses = cur.spouses || [];
  const propSpouses = prop.spouses || [];
  const maxSpouses = Math.max(curSpouses.length, propSpouses.length);
  for (let i = 0; i < maxSpouses; i++) {
    const prefix = `Spouse ${i + 1}`;
    rows.push(...diffNestedObject(curSpouses[i], propSpouses[i], prefix));
  }

  const curChildren = cur.children || [];
  const propChildren = prop.children || [];
  const maxChildren = Math.max(curChildren.length, propChildren.length);
  for (let i = 0; i < maxChildren; i++) {
    const prefix = `Child ${i + 1}`;
    rows.push(...diffNestedObject(curChildren[i], propChildren[i], prefix));
  }

  return rows;
}

/**
 * Build rows for addresses (present, permanent)
 */
function diffAddresses(current, proposed) {
  const rows = [];
  for (const type of ['present', 'permanent']) {
    const cur = current?.[type] || {};
    const prop = proposed?.[type] || {};
    const prefix = type === 'present' ? 'Present address' : 'Permanent address';
    Object.keys(ADDRESS_LABELS).forEach((key) => {
      const prev = cur[key];
      const next = prop[key];
      if (isSame(prev, next)) return;
      if (next == null || next === '') return;
      rows.push({
        label: `${prefix} – ${ADDRESS_LABELS[key]}`,
        previous: formatValue(prev),
        proposed: formatValue(next),
      });
    });
  }
  return rows;
}

/**
 * Build rows for academics (list comparison: show added/changed/removed)
 */
function diffAcademics(current, proposed) {
  const rows = [];
  const cur = current || [];
  const prop = proposed || [];
  const maxLen = Math.max(cur.length, prop.length);
  const examLabels = ['Exam name', 'Institute', 'Passing year', 'Result'];
  const keys = ['exam_name', 'institute', 'passing_year', 'result'];
  for (let i = 0; i < maxLen; i++) {
    const curRow = cur[i] || {};
    const propRow = prop[i] || {};
    const prefix = `Academic ${i + 1}`;
    keys.forEach((key, idx) => {
      const prev = curRow[key];
      const next = propRow[key];
      if (isSame(prev, next)) return;
      if (next == null || next === '') return;
      rows.push({
        label: `${prefix} – ${examLabels[idx]}`,
        previous: formatValue(prev),
        proposed: formatValue(next),
      });
    });
  }
  return rows;
}

/**
 * Build rows for document_update (file/document upload requests)
 */
function diffDocumentUpdate(proposed) {
  const doc = proposed?.document_update;
  if (!doc || typeof doc !== 'object') return [];
  const rows = [];
  if (doc.type != null && doc.type !== '') {
    rows.push({
      label: 'Document / file type',
      previous: '—',
      proposed: String(doc.type),
    });
  }
  if (doc.uploaded_at) {
    const dateStr =
      typeof doc.uploaded_at === 'string' &&
      /^\d{4}-\d{2}/.test(doc.uploaded_at)
        ? formatDate(doc.uploaded_at)
        : String(doc.uploaded_at);
    rows.push({
      label: 'Uploaded at',
      previous: '—',
      proposed: dateStr,
    });
  }
  return rows;
}

/**
 * Fallback section for "Document Update" requests when proposed_changes has no document_update
 * (e.g. details-only or legacy data). Uses details string from the request.
 */
export function getDocumentUpdateFallbackSection(details) {
  if (!details || typeof details !== 'string' || !details.trim()) return null;
  return {
    title: 'Document / file update',
    rows: [
      {
        label: 'Summary',
        previous: '—',
        proposed: details.trim(),
      },
    ],
  };
}

/**
 * Normalize proposed_changes (API may return string from JSON column)
 */
function normalizeProposed(proposedChanges) {
  if (proposedChanges == null) return {};
  if (typeof proposedChanges === 'object' && !Array.isArray(proposedChanges))
    return proposedChanges;
  if (typeof proposedChanges === 'string') {
    try {
      const parsed = JSON.parse(proposedChanges);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Build display sections from current_data and proposed_changes.
 * Returns array of { title, rows } where rows have { label, previous, proposed }.
 * Only includes sections/rows that have changes.
 */
export function getProposedChangesSections(currentData, proposedChanges) {
  const sections = [];
  const current = currentData || {};
  const proposed = normalizeProposed(proposedChanges);

  // Document / file upload changes (e.g. NID, birth cert, profile picture)
  const documentUpdateRows = diffDocumentUpdate(proposed);
  if (documentUpdateRows.length) {
    sections.push({
      title: 'Document / file update',
      rows: documentUpdateRows,
    });
  }

  const personalRows = diffFlat(
    current.personal_info,
    proposed.personal_info,
    PERSONAL_INFO_LABELS,
    { dateKeys: ['dob'] }
  );
  if (personalRows.length) {
    sections.push({ title: 'Personal information', rows: personalRows });
  }

  const familyRows = diffFamily(current.family, proposed.family);
  if (familyRows.length) {
    sections.push({ title: 'Family', rows: familyRows });
  }

  const addressRows = diffAddresses(current.addresses, proposed.addresses);
  if (addressRows.length) {
    sections.push({ title: 'Addresses', rows: addressRows });
  }

  const academicRows = diffAcademics(current.academics, proposed.academics);
  if (academicRows.length) {
    sections.push({ title: 'Academic records', rows: academicRows });
  }

  return sections;
}
