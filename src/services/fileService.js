import api, { apiUpload } from './api';

const fileService = {
  // ... existing methods ...

  // Upload profile picture
  async uploadProfilePicture(employeeId, file, onProgress) {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await apiUpload(`/employees/${employeeId}/photo`, formData, onProgress);
    return response.data;
  },

  // Delete profile picture
  async deleteProfilePicture(employeeId) {
    const response = await api.delete(`/employees/${employeeId}/photo`);
    return response.data;
  },

  // Upload NID document
  async uploadNidDocument(employeeId, file, onProgress) {
    const formData = new FormData();
    formData.append('document', file);
    const response = await apiUpload(`/employees/${employeeId}/documents/nid`, formData, onProgress);
    return response.data;
  },

  // Upload birth certificate
  async uploadBirthCertificate(employeeId, file, onProgress) {
    const formData = new FormData();
    formData.append('document', file);
    const response = await apiUpload(`/employees/${employeeId}/documents/birth`, formData, onProgress);
    return response.data;
  },

  // Delete document
  async deleteDocument(employeeId, type) {
    const response = await api.delete(`/employees/${employeeId}/documents/${type}`);
    return response.data;
  },

  // Upload academic certificate
  async uploadAcademicCertificate(employeeId, academicId, file, onProgress) {
    const formData = new FormData();
    formData.append('certificate', file);
    const response = await apiUpload(
      `/employees/${employeeId}/academics/${academicId}/certificate`,
      formData,
      onProgress
    );
    return response.data;
  },

  // Delete academic certificate
  async deleteAcademicCertificate(employeeId, academicId) {
    const response = await api.delete(`/employees/${employeeId}/academics/${academicId}/certificate`);
    return response.data;
  },

  // Upload child birth certificate
  async uploadChildBirthCertificate(employeeId, familyMemberId, file, onProgress) {
    const formData = new FormData();
    formData.append('certificate', file);
    const response = await apiUpload(
      `/employees/${employeeId}/children/${familyMemberId}/certificate`,
      formData,
      onProgress
    );
    return response.data;
  },

  // Delete child birth certificate
  async deleteChildBirthCertificate(employeeId, familyMemberId) {
    const response = await api.delete(`/employees/${employeeId}/children/${familyMemberId}/certificate`);
    return response.data;
  },

  // **NEW: Delete pending file**
  async deletePendingFile(employeeId, path) {
    const response = await api.delete(`/employees/${employeeId}/pending-files`, {
      data: { path },
    });
    return response.data;
  },

  // **NEW: Get pending files list**
  async getPendingFiles(employeeId) {
    const response = await api.get(`/employees/${employeeId}/pending-files`);
    return response.data;
  },

  // Get file URL
  async getFileUrl(path) {
    const response = await api.post('/files/url', { path });
    return response.data;
  },
};

export default fileService;