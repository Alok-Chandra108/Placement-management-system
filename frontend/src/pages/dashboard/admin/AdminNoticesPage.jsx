import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotices } from '../../../api/noticeApi';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Calendar, 
  Plus,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Clock
} from 'lucide-react';

const AdminNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination and Filtering State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle category change
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit,
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
      };
      
      const response = await fetchNotices(params);
      
      if (response.success) {
        setNotices(response.data.notices);
        setTotalPages(response.data.pages);
        setTotalCount(response.data.total);
      } else {
        setError(response.message || 'Failed to fetch notices.');
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [page, debouncedSearch, categoryFilter]);

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Urgent':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'Placement':
        return 'bg-brand-blue-light text-brand-blue border-brand-blue-light';
      case 'General':
        return 'bg-green-50 text-green-700 border-green-100';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Notice Board</h1>
          <p className="text-neutral-500 mt-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Manage official announcements and placement alerts
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-2xl hover:bg-brand-orange/90 transition-all duration-300 font-semibold shadow-lg shadow-brand-orange/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create New Notice
        </button>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title or content..."
            className="block w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all outline-none shadow-sm placeholder:text-neutral-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-neutral-400" />
          </div>
          <select
            className="block w-full pl-12 pr-10 py-3.5 bg-white border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all outline-none shadow-sm appearance-none cursor-pointer"
            value={categoryFilter}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            <option value="Urgent">Urgent Priority</option>
            <option value="Placement">Placement Drive</option>
            <option value="General">General Notice</option>
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <ChevronRight className="h-4 w-4 text-neutral-400 rotate-90" />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-8 py-5 text-left text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
                  Announcement Details
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
                  Category
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
                  Date Published
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
                  Status
                </th>
                <th className="px-8 py-5 text-right text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <AnimatePresence mode="wait">
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <motion.tr 
                      key={`skeleton-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="animate-pulse"
                    >
                      <td className="px-8 py-6">
                        <div className="h-4 w-64 bg-neutral-100 rounded-full mb-3"></div>
                        <div className="h-3 w-40 bg-neutral-50 rounded-full"></div>
                      </td>
                      <td className="px-6 py-6"><div className="h-7 w-24 bg-neutral-100 rounded-xl"></div></td>
                      <td className="px-6 py-6"><div className="h-4 w-32 bg-neutral-100 rounded-full"></div></td>
                      <td className="px-6 py-6"><div className="h-7 w-20 bg-neutral-100 rounded-xl"></div></td>
                      <td className="px-8 py-6"><div className="h-10 w-24 bg-neutral-100 rounded-xl ml-auto"></div></td>
                    </motion.tr>
                  ))
                ) : notices.length > 0 ? (
                  notices.map((notice) => (
                    <motion.tr 
                      key={notice._id}
                      variants={itemVariants}
                      className="group hover:bg-neutral-50/80 transition-all duration-300"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-neutral-900 group-hover:text-brand-blue transition-colors leading-relaxed">
                            {notice.title}
                          </span>
                          <span className="text-xs text-neutral-500 mt-1.5 flex items-center gap-1.5 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300"></div>
                            Posted by {notice.postedBy?.fullName || 'Academic Office'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3.5 py-1.5 inline-flex text-[11px] font-bold rounded-xl border ${getCategoryStyles(notice.category)} uppercase tracking-wider`}>
                          {notice.category}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          {formatDate(notice.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${notice.isActive !== false ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-neutral-300'}`}></div>
                          <span className={`text-xs font-bold uppercase tracking-widest ${notice.isActive !== false ? 'text-green-700' : 'text-neutral-500'}`}>
                            {notice.isActive !== false ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="p-2.5 text-neutral-400 hover:text-brand-blue hover:bg-brand-blue-light rounded-xl transition-all" title="View Details">
                            <ExternalLink className="w-4.5 h-4.5" />
                          </button>
                          <button className="p-2.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-all" title="More Options">
                            <MoreVertical className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-20 h-20 bg-neutral-50 rounded-3xl flex items-center justify-center mb-6">
                          <FileText className="h-10 w-10 text-neutral-300" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900">No notices to display</h3>
                        <p className="text-neutral-500 mt-2 text-sm leading-relaxed">
                          We couldn't find any notices matching your criteria. Try adjusting your search or filters.
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        {!loading && notices.length > 0 && (
          <div className="px-8 py-6 bg-neutral-50/30 border-t border-neutral-100 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">
              Showing <span className="text-neutral-900 font-bold">{(page - 1) * limit + 1}</span> to{' '}
              <span className="text-neutral-900 font-bold">{Math.min(page * limit, totalCount)}</span> of{' '}
              <span className="text-neutral-900 font-bold">{totalCount}</span>
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`min-w-[40px] h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                      page === i + 1
                        ? 'bg-brand-blue text-white shadow-brand-blue/20'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-blue/30 hover:text-brand-blue'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminNoticesPage;

