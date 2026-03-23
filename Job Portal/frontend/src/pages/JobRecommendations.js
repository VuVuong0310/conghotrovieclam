import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const JobRecommendations = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('recommended');
    const [page, setPage] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecommendations();
    }, [activeTab, page]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const token = AuthService.getToken();
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            let url;
            const params = { limit: 10 };

            switch(activeTab) {
                case 'recommended':
                    url = 'http://localhost:8080/api/recommendations/jobs';
                    params.page = page;
                    params.size = 10;
                    break;
                case 'trending':
                    url = 'http://localhost:8080/api/recommendations/trending';
                    break;
                case 'new':
                    url = 'http://localhost:8080/api/recommendations/new';
                    params.limitDays = 7;
                    break;
                default:
                    return;
            }

            const response = await axios.get(url, { headers, params });
            const data = response.data.content || response.data;
            setJobs(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            setJobs([]);
            setLoading(false);
        }
    };

    const renderJobCard = (job) => (
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
            <p className="job-description">{job.description?.substring(0, 100)}...</p>
            <button
                onClick={() => navigate(`/job/${job.id}`)}
                className="btn btn-outline-primary btn-sm"
            >
                Xem chi tiết →
            </button>
        </div>
    );

    if (loading) return <div className="container-fluid text-center py-5">Đang tải...</div>;

    return (
        <div className="container-fluid recommendations-container">
            <div className="recommendations-header">
                <h2>💼 Khám Phá Công Việc</h2>
                <p>Tìm những cơ hội việc làm phù hợp với bạn</p>
            </div>

            <div className="tabs-section">
                <div className="nav nav-tabs" role="tablist">
                    <button
                        className={`nav-link ${activeTab === 'recommended' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('recommended'); setPage(0); }}
                    >
                        ⭐ Đề Xuất Cho Bạn
                    </button>
                    <button
                        className={`nav-link ${activeTab === 'trending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('trending')}
                    >
                        🔥 Xu Hướng
                    </button>
                    <button
                        className={`nav-link ${activeTab === 'new' ? 'active' : ''}`}
                        onClick={() => setActiveTab('new')}
                    >
                        ✨ Mới Nhất
                    </button>
                </div>
            </div>

            <div className="job-list-content">
                {jobs.length === 0 ? (
                    <p className="text-center text-muted mt-5">Không có công việc nào</p>
                ) : (
                    <div className="job-card-grid">
                        {jobs.map(renderJobCard)}
                    </div>
                )}
            </div>

            {/* Pagination for recommended tab */}
            {activeTab === 'recommended' && jobs.length > 0 && (
                <div className="pagination-container mt-4">
                    <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="btn btn-sm btn-outline-secondary"
                    >
                        ← Trước
                    </button>
                    <span className="mx-2">Trang {page + 1}</span>
                    <button
                        onClick={() => setPage(page + 1)}
                        className="btn btn-sm btn-outline-secondary"
                    >
                        Sau →
                    </button>
                </div>
            )}
        </div>
    );
};

export default JobRecommendations;
