import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import JobService from '../services/JobService';

function JobRecommendations() {
  const [activeTab, setActiveTab] = useState('recommended');
  const [recommended, setRecommended] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newest, setNewest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recRes, trendRes, newRes] = await Promise.all([
          JobService.getRecommendedJobs({}).catch(() => ({ data: { content: [] } })),
          JobService.getTrendingJobs(10).catch(() => ({ data: [] })),
          JobService.getNewJobs(7, 10).catch(() => ({ data: [] }))
        ]);
        setRecommended(recRes.data?.content || recRes.data || []);
        setTrending(trendRes.data || []);
        setNewest(newRes.data || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const tabs = [
    { key: 'recommended', label: 'Gợi ý cho bạn', icon: 'bi-star', data: recommended },
    { key: 'trending', label: 'Xu hướng', icon: 'bi-fire', data: trending },
    { key: 'newest', label: 'Mới nhất', icon: 'bi-clock-history', data: newest }
  ];

  const currentData = tabs.find(t => t.key === activeTab)?.data || [];

  const formatSalary = (s) => s ? Number(s).toLocaleString('vi-VN') + ' VND' : 'Thỏa thuận';

  const JobCard = ({ job }) => (
    <div className="col-md-6 col-lg-4">
      <div className="jp-job-card h-100">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <h6 className="fw-bold mb-0">{job.title}</h6>
        </div>
        <div className="text-muted small mb-2">
          <span className="me-3"><i className="bi bi-building me-1"></i>{job.company || job.employer?.companyName || 'N/A'}</span>
          <span><i className="bi bi-geo-alt me-1"></i>{job.location || 'N/A'}</span>
        </div>
        <div className="mb-3">
          <span className="jp-badge-primary me-2">{job.employmentType || 'Full-time'}</span>
          <span className="text-success fw-semibold small"><i className="bi bi-cash-stack me-1"></i>{formatSalary(job.salary)}</span>
        </div>
        <Link to={`/jobs/${job.id}`} className="btn btn-outline-primary btn-sm w-100">
          <i className="bi bi-eye me-1"></i>Xem chi tiết
        </Link>
      </div>
    </div>
  );

  if (loading) return <div className="jp-loading-page"><div className="jp-spinner"></div></div>;

  return (
    <div className="jp-container">
      <div className="jp-page-header mb-4">
        <h1><i className="bi bi-star me-2"></i>Việc Làm Gợi Ý</h1>
        <p>Khám phá các cơ hội việc làm phù hợp với bạn</p>
      </div>

      <ul className="nav nav-tabs mb-4">
        {tabs.map(tab => (
          <li className="nav-item" key={tab.key}>
            <button className={`nav-link ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              <i className={`bi ${tab.icon} me-1`}></i>{tab.label}
              <span className="badge bg-primary bg-opacity-10 text-primary ms-2">{tab.data.length}</span>
            </button>
          </li>
        ))}
      </ul>

      {currentData.length === 0 ? (
        <div className="jp-empty-state">
          <i className="bi bi-inbox"></i>
          <h5>Chưa có việc làm nào</h5>
          <p>Hãy cập nhật hồ sơ để nhận gợi ý phù hợp hơn</p>
          <Link to="/jobs" className="btn btn-primary"><i className="bi bi-search me-1"></i>Tìm việc làm</Link>
        </div>
      ) : (
        <div className="row g-3">
          {currentData.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}

export default JobRecommendations;
