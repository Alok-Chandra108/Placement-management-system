import api from './axiosInstance';

/**
 * Fetch all active notices
 * @param {Object} params - Query params (e.g., limit, page, category)
 */
export const fetchNotices = async (params = {}) => {
  const response = await api.get('/notices', { params });
  return response.data;
};

/**
 * Fetch a single notice by ID
 * @param {String} id - Notice ID
 */
export const fetchNoticeById = async (id) => {
  const response = await api.get(`/notices/${id}`);
  return response.data;
};
