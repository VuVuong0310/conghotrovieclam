import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobService from '../services/JobService';
import API_BASE from '../config/api';

function CreateJob() {
  const [job, setJob] = useState({ title: '', description: '', location: '', employmentType: 'Full-time', salary: '', categoryId: '', deadline: '', requirements: '' });
  const [categories, setCategories] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE}/categories`).then(res => setCategories(res.data)).catch(err => console.error(err));
  }, []);

  const handleChange = (e) => setJob({ ...job, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobData = { ...job };
      if (jobData.categoryId) jobData.category = { id: parseInt(jobData.categoryId) };
      delete jobData.categoryId;
      await JobService.createJob(jobData);
      setSuccess('Đăng tuyển thành công! Đang chờ Admin phê duyệt.');
      setJob({ title: '', description: '', location: '', employmentType: 'Full-time', salary: '', categoryId: '', deadline: '', requirements: '' });
      setTimeout(() => setSuccess(''), 4000);
    } catch (error) { console.error('Failed to create job', error); }
  };

  return (
    <div className="jp-container" style={{ maxWidth: 780 }}>
      <div className="jp-page-header mb-4">
        <h1><i className="bi bi-plus-circle me-2"></i>Đăng Tin Tuyển Dụng</h1>
        <p>Tạo tin tuyển dụng mới để tìm ứng viên phù hợp</p>
      </div>

      {success && <div className="alert alert-success"><i className="bi bi-check-circle me-2"></i>{success}</div>}

      <div className="jp-card">
        <div className="jp-card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label"><i className="bi bi-briefcase me-1"></i>Tên công việc</label>
              <input type="text" name="title" className="form-control" value={job.title} onChange={handleChange} required placeholder="VD: Lập trình viên Java Senior" />
            </div>

            <div className="mb-3">
              <label className="form-label"><i className="bi bi-file-earmark-text me-1"></i>Mô tả công việc</label>
              <textarea name="description" className="form-control" value={job.description} onChange={handleChange} rows="5" required placeholder="Mô tả chi tiết công việc..." />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label"><i className="bi bi-tag me-1"></i>Danh mục</label>
                <select name="categoryId" className="form-select" value={job.categoryId} onChange={handleChange}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label"><i className="bi bi-geo-alt me-1"></i>Địa điểm</label>
                <input type="text" name="location" className="form-control" value={job.location} onChange={handleChange} placeholder="VD: Hà Nội" />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label"><i className="bi bi-clock me-1"></i>Loại hình</label>
                <select name="employmentType" className="form-select" value={job.employmentType} onChange={handleChange}>
                  <option value="Full-time">Toàn thời gian</option>
                  <option value="Part-time">Bán thời gian</option>
                  <option value="Contract">Hợp đồng</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label"><i className="bi bi-cash-stack me-1"></i>Mức lương (VND)</label>
                <input type="number" name="salary" className="form-control" value={job.salary} onChange={handleChange} placeholder="VD: 15000000" />
              </div>
              <div className="col-md-4">
                <label className="form-label"><i className="bi bi-calendar-event me-1"></i>Hạn nộp hồ sơ</label>
                <input type="date" name="deadline" className="form-control" value={job.deadline} onChange={handleChange} />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label"><i className="bi bi-check2-square me-1"></i>Yêu cầu ứng viên</label>
              <textarea name="requirements" className="form-control" value={job.requirements} onChange={handleChange} rows="4" placeholder="VD: Tốt nghiệp ĐH CNTT, 2 năm kinh nghiệm Java..." />
            </div>

            <button type="submit" className="btn btn-primary px-4"><i className="bi bi-send me-1"></i>Đăng Tuyển</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateJob;
