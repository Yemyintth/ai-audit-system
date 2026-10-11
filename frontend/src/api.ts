import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000/api', headers: { 'Content-Type': 'application/json' }, timeout: 60000 });

export default api;
export const fetchStats = () => api.get('/dashboard/stats');
export const fetchTransactions = (skip = 0, limit = 100) => api.get('/transactions/?skip=' + skip + '&limit=' + limit);
export const fetchAnomalies = (skip = 0, limit = 100) => api.get('/anomalies/?skip=' + skip + '&limit=' + limit);
export const checkHealth = () => api.get('/health');
export const fetchSystemStatus = () => api.get('/admin/status');
export const fetchSystemInfo = () => api.get('/admin/system-info');
export const fetchSettings = () => api.get('/admin/settings');
export const updateSettings = (s: any) => api.post('/admin/settings', s);
export const clearAnomalies = () => api.post('/admin/clear-anomalies');
export const resetData = () => api.post('/admin/reset-data');
export const fetchAuditHistory = (filter: string = 'all', search: string = '') => api.get('/audit/history?filter=' + filter + '&search=' + search);
export const fetchAuditDetail = (txId: string) => api.get('/audit/detail/' + txId);
export const saveReview = (txId: string, status: string, comment: string) => api.post('/audit/review/' + txId, { status, comment });
export const fetchReviews = () => api.get('/audit/reviews');
export const fetchAuditStats = () => api.get('/audit/stats');
export const fetchBots = () => api.get('/generation/bots');
export const fetchGenerationStats = () => api.get('/generation/stats');
export const fetchMLModels = () => api.get('/explain/models');
export const explainTransaction = (txId: string) => api.get('/explain/explain/' + txId);
export const fetchPaginated = (entity: string, page: number, limit: number, filter: string, search: string) =>
  api.get('/list/list?entity=' + entity + '&page=' + page + '&limit=' + limit + '&filter=' + filter + '&search=' + search);
export const fetchMethods = () => api.get('/list/methods');
export const fetchBotReport = (txId: string) => api.get('/list/bot-report/' + txId);
export const runDetection = (method: string, limit: number = 5000) => api.post('/detection/run', { method, limit });
export const compareAllMethods = () => api.get('/detection/compare');
export const fetchAnomalyStats = () => api.get('/anomalies/stats');
