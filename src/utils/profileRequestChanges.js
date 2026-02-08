import { formatDate } from './helpers';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const STORAGE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

/**
 * Build the full URL for a storage file path (Cloudinary or local).
 */
export function getStorageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (CLOUDINARY_CLOUD_NAME && path.includes('brems/')) {
    const isRaw = path.toLowerCase().endsWith('.pdf') || path.includes('/raw/');
    const resource = isRaw ? 'raw' : 'image';
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resource}/upload/${path.replace(/^\//, '')}`;
  }
  return `${STORAGE_URL}/storage/${path}`;
}

/**
 * Check if a file path is an image
 */
export function isImageFile(path) {
  if (!path) return false;
  const ext = path.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

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

const DOCUMENT_TYPE_LABELS = {
  'profile_picture': 'Profile Picture',
  'nid_file_path': 'NID Document',
  'birth_file_path': 'Birth Certificate',
};

function formatValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return String(value);
}

function formatDateValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
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
 * Build rows for document_update (file/document upload requests)
 */
function diffDocumentUpdate(proposed) {
  const doc = proposed?.document_update;
  if (!doc || typeof doc !== 'object') {
    return [];
  }
  
  const rows = [];
  
  // Document type label
  if (doc.type) {
    rows.push({
      label: 'Document Type',
      previous: '—',
      proposed: String(doc.type),
      isText: true,
    });
  }
  
  // Target field (what will be updated)
  if (doc.employee_field) {
    const fieldLabel = DOCUMENT_TYPE_LABELS[doc.employee_field] || doc.employee_field;
    rows.push({
      label: 'Updates Field',
      previous: '—',
      proposed: fieldLabel,
      isText: true,
    });
  } else if (doc.academic_id) {
    rows.push({
      label: 'Updates',
      previous: '—',
      proposed: `Academic Certificate (Record #${doc.academic_id})`,
      isText: true,
    });
  } else if (doc.family_member_id) {
    rows.push({
      label: 'Updates',
      previous: '—',
      proposed: `Child Birth Certificate (Member #${doc.family_member_id})`,
      isText: true,
    });
  }
  
  // File preview - THE KEY PART
  if (doc.file_path) {
    const fileUrl = getStorageUrl(doc.file_path);
    const isImage = isImageFile(doc.file_path);
    const currentFileUrl = doc.current_file_path ? getStorageUrl(doc.current_file_path) : null;
    
    rows.push({
      label: 'File',
      previous: currentFileUrl || '—',
      proposed: fileUrl,
      isFile: true,
      isImage: isImage,
      fileName: doc.file_path.split('/').pop(),
      currentFileName: doc.current_file_path ? doc.current_file_path.split('/').pop() : null,
    });
  }
  
  // Upload timestamp
  if (doc.uploaded_at) {
    rows.push({
      label: 'Uploaded At',
      previous: '—',
      proposed: formatDateValue(doc.uploaded_at),
      isText: true,
    });
  }
  
  return rows;
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
 * Build rows for academics (list comparison)
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
 * Fallback section for "Document Update" requests when no document_update key exists
 */
export function getDocumentUpdateFallbackSection(details) {
  if (!details || typeof details !== 'string' || !details.trim()) return null;
  return {
    title: 'Document / File Update',
    rows: [
      {
        label: 'Summary',
        previous: '—',
        proposed: details.trim(),
        isText: true,
      },
    ],
  };
}

/**
 * Build display sections from current_data and proposed_changes.
 * Returns array of { title, rows } where rows have { label, previous, proposed }.
 */
export function getProposedChangesSections(currentData, proposedChanges) {
  const sections = [];
  const current = currentData || {};
  const proposed = normalizeProposed(proposedChanges);

  // **NEW: Pending documents (unified format)**
  if (proposed.pending_documents && Array.isArray(proposed.pending_documents)) {
    const pendingDocRows = diffPendingDocuments(proposed);
    if (pendingDocRows.length) {
      sections.push({
        title: 'Document Uploads',
        rows: pendingDocRows,
      });
    }
  }

  // Legacy: Document update (single document)
  if (proposed.document_update) {
    const documentUpdateRows = diffDocumentUpdate(proposed);
    if (documentUpdateRows.length) {
      sections.push({
        title: 'Document / File Update',
        rows: documentUpdateRows,
      });
    }
  }

  console.log('getProposedChangesSections - proposed after normalize:', proposed);

  // Document / file upload changes (MUST BE FIRST - this is the main fix)
  if (proposed.document_update) {
    const documentUpdateRows = diffDocumentUpdate(proposed);
    console.log('Document update rows:', documentUpdateRows);
    if (documentUpdateRows.length) {
      sections.push({
        title: 'Document / File Update',
        rows: documentUpdateRows,
      });
    }
  }

  // Personal info changes
  if (proposed.personal_info) {
    const personalRows = diffFlat(
      current.personal_info,
      proposed.personal_info,
      PERSONAL_INFO_LABELS,
      { dateKeys: ['dob'] }
    );
    if (personalRows.length) {
      sections.push({ title: 'Personal Information', rows: personalRows });
    }
  }

  // Family changes
  if (proposed.family) {
    const familyRows = diffFamily(current.family, proposed.family);
    if (familyRows.length) {
      sections.push({ title: 'Family', rows: familyRows });
    }
  }

  // Address changes
  if (proposed.addresses) {
    const addressRows = diffAddresses(current.addresses, proposed.addresses);
    if (addressRows.length) {
      sections.push({ title: 'Addresses', rows: addressRows });
    }
  }

  // Academic changes
  if (proposed.academics) {
    const academicRows = diffAcademics(current.academics, proposed.academics);
    if (academicRows.length) {
      sections.push({ title: 'Academic Records', rows: academicRows });
    }
  }

  return sections;
}

// Keep the existing helper exports for building proposed changes
export function buildProposedChangesOnlyChanged(currentEmployee, formData) {
  // ... keep your existing implementation
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
    const fatherKeys = ['name', 'name_bn', 'nid', 'dob', 'occupation', 'is_alive'];
    const motherKeys = ['name', 'name_bn', 'nid', 'dob', 'occupation', 'is_alive'];
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
    const addrKeys = ['division', 'district', 'upazila', 'post_office', 'house_no', 'village_road'];
    for (const type of ['present', 'permanent']) {
      const cur = current?.[type] || {};
      const prop = proposed?.[type] || {};
      addrKeys.forEach((key) => {
        if (isSame(cur[key], prop[key])) return;
        if (prop[key] != null && prop[key] !== '') out[type][key] = prop[key];
      });
      if (Object.keys(out[type]).length === 0) delete out[type];
    }
    return Object.keys(out.present || {}).length || Object.keys(out.permanent || {}).length
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

  const personalInfo = pickChangedFlat(
    currentNormalized.personal_info,
    formData,
    Object.keys(PERSONAL_INFO_LABELS || {})
  );
  const family = pickChangedFamily(currentNormalized.family, formData.family);
  const addresses = pickChangedAddresses(currentNormalized.addresses, formData.addresses);
  const academics = pickChangedAcademics(currentNormalized.academics, formData.academics);

  const proposed = {};
  if (personalInfo) proposed.personal_info = personalInfo;
  if (family) proposed.family = family;
  if (addresses) proposed.addresses = addresses;
  if (academics) proposed.academics = academics;
  return proposed;
}

function diffPendingDocuments(proposed) {
  const docs = proposed?.pending_documents;
  if (!docs || !Array.isArray(docs) || docs.length === 0) {
    return [];
  }

  return docs.map((doc, index) => {
    const fileUrl = getStorageUrl(doc.path);
    const isImage = isImageFile(doc.path);
    const currentFileUrl = doc.current_file_path ? getStorageUrl(doc.current_file_path) : null;

    return {
      label: doc.document_type || `Document ${index + 1}`,
      previous: currentFileUrl || '—',
      proposed: fileUrl,
      isFile: true,
      isImage: isImage,
      fileName: doc.path?.split('/').pop(),
      currentFileName: doc.current_file_path?.split('/').pop(),
    };
  });
}