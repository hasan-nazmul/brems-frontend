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
function isSame(prev, next, key) {
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
 * Build display sections from current_data and proposed_changes.
 * Returns array of { title, rows } where rows have { label, previous, proposed }.
 * Only includes sections/rows that have changes.
 */
export function getProposedChangesSections(currentData, proposedChanges) {
  const sections = [];
  const current = currentData || {};
  const proposed = proposedChanges || {};

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
