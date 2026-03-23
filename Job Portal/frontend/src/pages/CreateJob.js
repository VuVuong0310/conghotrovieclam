import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobService from '../services/JobService';

function CreateJob() {
  const [job, setJob] = useState({
    title: '',
    description: '',
    location: '',
    employmentType: 'Full-time',
    salary: '',
    categoryId: '',
    deadline: '',
    requirements: ''
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setJob({
      ...job,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobData = { ...job };
      if (jobData.categoryId) {
        jobData.category = { id: parseInt(jobData.categoryId) };
      }
      delete jobData.categoryId;
      await JobService.createJob(jobData);
      alert('Job posted successfully! Waiting for admin approval.');
      setJob({
        title: '',
        description: '',
        location: '',
        employmentType: 'Full-time',
        salary: '',
        categoryId: '',
        deadline: '',
        requirements: ''
      });
    } catch (error) {
      console.error('Failed to create job', error);
    }
  };

  return (
    <div className="container">
      <h2>Post a Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={job.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            className="form-control"
            value={job.description}
            onChange={handleChange}
            rows="5"
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="categoryId"
            className="form-control"
            value={job.categoryId}
            onChange={handleChange}
          >
            <option value="">-- Select Category --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            className="form-control"
            value={job.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Employment Type</label>
          <select
            name="employmentType"
            className="form-control"
            value={job.employmentType}
            onChange={handleChange}
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
          </select>
        </div>

        <div className="form-group">
          <label>Salary</label>
          <input
            type="number"
            name="salary"
            className="form-control"
            value={job.salary}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Hạn nộp hồ sơ</label>
          <input
            type="date"
            name="deadline"
            className="form-control"
            value={job.deadline}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Yêu cầu ứng viên</label>
          <textarea
            name="requirements"
            className="form-control"
            value={job.requirements}
            onChange={handleChange}
            rows="4"
            placeholder="Ví dụ: Tốt nghiệp ĐH CNTT, 2 năm kinh nghiệm Java..."
          />
        </div>

        <button type="submit" className="btn btn-primary">Post Job</button>
      </form>
    </div>
  );
}

export default CreateJob;
