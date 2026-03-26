import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import API_BASE from '../config/api';

const JobListAdvanced = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [employmentType, setEmploymentType] = useState('');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('DESC');
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, [page, size, sortBy, sortDirection]);

    const fetchJobs = async (searchKeyword = '', searchLocation = '', searchMinSalary = '', 
                             searchMaxSalary = '', searchEmploymentType = '') => {
        try {
            setLoading(true);
            const token = AuthService.getToken();
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const params = {
                page: page,
                size: size,
                sortBy: sortBy,
                sortDirection: sortDirection
            };

            if (searchKeyword) params.keyword = searchKeyword;
            if (searchLocation) params.location = searchLocation;
            if (searchMinSalary) params.minSalary = parseFloat(searchMinSalary) * 1000000;
            if (searchMaxSalary) params.maxSalary = parseFloat(searchMaxSalary) * 1000000;
            if (searchEmploymentType) params.employmentType = searchEmploymentType;

            const response = await axios.get(`${API_BASE}/search/jobs`, {
                headers,
                params
            });

            setJobs(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || 0);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            // Fallback to basic jobs API if search fails
            try {
                const response = await axios.get(`${API_BASE}/jobs`);
                setJobs(response.data);
            } catch (err) {
                console.error('Error fetching jobs from basic API:', err);
            }
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(0);  // Reset to first page
        fetchJobs(keyword, location, minSalary, maxSalary, employmentType);
    };

    const handleReset = () => {
        setKeyword('');
        setLocation('');
        setMinSalary('');
        setMaxSalary('');
        setEmploymentType('');
        setPage(0);
        setSize(10);
        setSortBy('createdAt');
        setSortDirection('DESC');
        fetchJobs();
    };

    const handlePageChange = (newPage) => {
        setPage(Math.max(0, Math.min(newPage, totalPages - 1)));
    };

    if (loading) return <div className="container-fluid text-center py-5">Đang tải...</div>;

    return (
        <div className="container-fluid job-list-container">
            <div className="filter-section">
                <h3>🔍 Tìm Việc Làm</h3>
                <div className="filter-row">
                    <input
                        type="text"
                        placeholder="Từ khóa (vị trí, kỹ năng)"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="filter-input"
                    />
                    <input
                        type="text"
                        placeholder="Địa điểm"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="filter-input"
                    />
                    <input
                        type="number"
                        placeholder="Lương tối thiểu (triệu VND)"
                        value={minSalary}
                        onChange={(e) => setMinSalary(e.target.value)}
                        className="filter-input"
                    />
                    <input
                        type="number"
                        placeholder="Lương tối đa (triệu VND)"
                        value={maxSalary}
                        onChange={(e) => setMaxSalary(e.target.value)}
                        className="filter-input"
                    />
                    <select
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                        className="filter-input"
                    >
                        <option value="">-- Loại việc làm --</option>
                        <option value="Full-time">Toàn thời gian</option>
                        <option value="Part-time">Bán thời gian</option>
                        <option value="Contract">Hợp đồng</option>
                        <option value="Internship">Thực tập</option>
                    </select>
                </div>

                <div className="filter-row mt-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-input"
                    >
                        <option value="createdAt">Mới nhất</option>
                        <option value="title">Tiêu đề</option>
                        <option value="salary">Lương</option>
                    </select>
                    <select
                        value={sortDirection}
                        onChange={(e) => setSortDirection(e.target.value)}
                        className="filter-input"
                    >
                        <option value="DESC">Giảm dần</option>
                        <option value="ASC">Tăng dần</option>
                    </select>
                    <button onClick={handleSearch} className="btn btn-primary">Tìm kiếm</button>
                    <button onClick={handleReset} className="btn btn-secondary">Xóa bộ lọc</button>
                </div>

                <div className="filter-info mt-2">
                    <small>Tìm thấy <strong>{totalElements}</strong> công việc | Trang <strong>{page + 1}/{Math.max(1, totalPages)}</strong></small>
                </div>
            </div>

            <div className="job-list-content">
                {jobs.length === 0 ? (
                    <p className="text-center text-muted mt-5">Không tìm thấy công việc phù hợp</p>
                ) : (
                    <>
                        <div className="job-card-grid">
                            {jobs.map(job => (
                                <div key={job.id} className="job-card">
                                    <div className="job-card-header">
                                        <h5>{job.title}</h5>
                                        <span className="job-id-badge">#{job.id}</span>
                                    </div>
                                    <p className="company-name">👔 {job.employer?.username || 'Công ty'}</p>
                                    <p className="job-location">📍 {job.location}</p>
                                    <p className="job-salary">💰 {job.salary ? (job.salary / 1000000).toFixed(1) : 'N/A'}M VND</p>
                                    <p className="job-type">
                                        <span className="badge" style={{
                                            backgroundColor: job.employmentType === 'Full-time' ? '#28a745' :
                                                           job.employmentType === 'Part-time' ? '#ffc107' :
                                                           job.employmentType === 'Contract' ? '#17a2b8' : '#6c757d'
                                        }}>
                                            {job.employmentType}
                                        </span>
                                    </p>
                                    <p className="job-description">{job.description.substring(0, 100)}...</p>
                                    <button
                                        onClick={() => navigate(`/job/${job.id}`)}
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        Xem chi tiết →
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="pagination-container mt-4">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 0}
                                className="btn btn-sm btn-outline-secondary"
                            >
                                ← Trước
                            </button>
                            
                            <div className="page-indicator">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = page - 2 + i;
                                    if (pageNum < 0 || pageNum >= totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`btn btn-sm ${page === pageNum ? 'btn-primary' : 'btn-outline-primary'}`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages - 1}
                                className="btn btn-sm btn-outline-secondary"
                            >
                                Sau →
                            </button>

                            <select
                                value={size}
                                onChange={(e) => { setSize(parseInt(e.target.value)); setPage(0); }}
                                className="filter-input"
                                style={{ width: '80px' }}
                            >
                                <option value="5">5 hàng</option>
                                <option value="10">10 hàng</option>
                                <option value="20">20 hàng</option>
                                <option value="50">50 hàng</option>
                            </select>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default JobListAdvanced;
