import { useEffect, useState } from "react";
import "../css/Home.css";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaBuilding, FaUserTie, FaBriefcase } from "react-icons/fa";
import Pagination from "./Pagination";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import EmptyState from "./ui/EmptyState";
import Skeleton from "./ui/Skeleton";
import ErrorState from "./ui/ErrorState";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

function Home() {
  const [job, setJob] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [jobtitle, setJobtitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [sortOption, setSortOption] = useState("-posted_on");
  
  const [suggestions, setSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const navigate = useNavigate();

  const fetchJobs = async (page = 1, search = jobtitle, loc = location, type = jobType, sort = sortOption) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page,
        search: search,
        location: loc,
        job_type: type,
        sort: sort
      });

      const res = await fetch(`${API_BASE}/accounts/home/?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load jobs");
      
      const data = await res.json();
      setJob(data.results || (Array.isArray(data) ? data : []));
      setTotalPages(data.total_pages || 1);
      setCurrentPage(data.current_page || 1);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err) {
      console.error(err);
      setError("Unable to load jobs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(currentPage, jobtitle, location, jobType, sortOption);
  }, [currentPage, jobType, sortOption]); 

  const executeSearch = () => {
    setCurrentPage(1);
    fetchJobs(1, jobtitle, location, jobType, sortOption);
    document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetFilters = () => {
    setJobtitle("");
    setLocation("");
    setJobType("");
    setSortOption("-posted_on");
    setCurrentPage(1);
    fetchJobs(1, "", "", "", "-posted_on");
  };

  function jobapply(id) {
    navigate(`/job/${id}`);
  }

  function getSuggestions(value) {
    setJobtitle(value);
    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }
    fetch(`${API_BASE}/accounts/jobsuggestion/${value}/`)
      .then((res) => res.json())
      .then((data) => setSuggestions(data))
      .catch((error) => console.error(error));
  }

  function getLocationSuggestions(value) {
    setLocation(value);
    if (value.trim() === "") {
      setLocationSuggestions([]);
      return;
    }
    fetch(`${API_BASE}/accounts/locationsuggestion/${value}/`)
      .then((res) => res.json())
      .then((data) => setLocationSuggestions(data))
      .catch((err) => console.error(err));
  }

  return (
    <div className="home-container">
      <section className="home-hero">
        <div className="home-hero-content">
          <h1>Find Your Next <span style={{ color: "var(--color-primary)" }}>Dream Job</span></h1>
          <p>Discover thousands of opportunities that match your skills and aspirations.</p>
        </div>
      </section>

      <section id="jobs-section" className="home-jobs-section">
        <div className="ui-filter-bar" style={{ marginBottom: 'var(--spacing-5)' }}>
          <div className="ui-filter-search">
            <FaSearch className="ui-filter-search-icon" />
            <input
              className="ui-filter-search-input"
              type="text"
              placeholder="Job title, keywords..."
              value={jobtitle}
              onChange={(e) => getSuggestions(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
            />
            {suggestions.length > 0 && (
              <div className="home-suggestions">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    className="home-suggestion-item"
                    onClick={() => {
                      setJobtitle(item.title);
                      setSuggestions([]);
                      executeSearch();
                    }}
                  >
                    <FaBriefcase style={{ marginRight: '8px', color: 'var(--color-text-secondary)' }} /> {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ui-filter-search">
            <FaMapMarkerAlt className="ui-filter-search-icon" />
            <input
              className="ui-filter-search-input"
              type="text"
              placeholder="City, state, or zip"
              value={location}
              onChange={(e) => getLocationSuggestions(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
            />
            {locationSuggestions.length > 0 && (
              <div className="home-suggestions">
                {locationSuggestions.map((item, index) => (
                  <div
                    key={index}
                    className="home-suggestion-item"
                    onClick={() => {
                      setLocation(item.location);
                      setLocationSuggestions([]);
                      executeSearch();
                    }}
                  >
                    <FaMapMarkerAlt style={{ marginRight: '8px', color: 'var(--color-text-secondary)' }} /> {item.location}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ui-filter-controls">
            <select 
              className="ui-filter-select"
              value={jobType} 
              onChange={(e) => { setJobType(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Any Job Type</option>
              <option value="fulltime">Full Time</option>
              <option value="parttime">Part Time</option>
            </select>
            
            <select 
              className="ui-filter-select"
              value={sortOption} 
              onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
            >
              <option value="-posted_on">Newest</option>
              <option value="posted_on">Oldest</option>
              <option value="title">A-Z</option>
            </select>

            <Button variant="primary" onClick={executeSearch}>Search</Button>
            <Button variant="outline" onClick={resetFilters}>Reset</Button>
          </div>
        </div>

        <div className="home-jobs-header">
          <h2>Recommended Jobs</h2>
          <span className="home-jobs-count">{job.length} matching jobs</span>
        </div>

        {isLoading ? (
          <div className="home-job-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="home-job-card">
                <Skeleton type="title" />
                <Skeleton type="text" count={3} />
                <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                  <Skeleton type="text" style={{ width: '100px', height: '36px' }} />
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={executeSearch} />
        ) : job.length === 0 ? (
          <EmptyState 
            icon={<FaSearch size={48} />}
            title="No jobs found"
            description="Try adjusting your search criteria or removing filters to find more jobs."
            action={<Button onClick={resetFilters}>Clear Filters</Button>}
          />
        ) : (
          <div className="home-job-grid">
            {job.map((jobs) => (
              <Card className="home-job-card" key={jobs.id}>
                <div className="home-job-card-top">
                  <div className="home-job-company-logo">
                    <FaBuilding />
                  </div>
                  <div className="home-job-card-header">
                    <p className="home-job-company">{jobs.company}</p>
                    <h3 className="home-job-title">{jobs.title}</h3>
                  </div>
                  <Badge variant={jobs.jop_type === 'fulltime' ? 'primary' : 'warning'} className="home-job-type-badge">
                    {jobs.jop_type === 'fulltime' ? 'Full Time' : 'Part Time'}
                  </Badge>
                </div>

                <div className="home-job-meta">
                  <span className="home-job-meta-item">
                    <FaMoneyBillWave /> {jobs.salary}
                  </span>
                  <span className="home-job-meta-item">
                    <FaUserTie /> {jobs.experience}
                  </span>
                  <span className="home-job-meta-item">
                    <FaMapMarkerAlt /> {jobs.location}
                  </span>
                </div>

                <div className="home-job-card-actions">
                  <Button 
                    variant="primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => jobapply(jobs.id)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {!isLoading && job.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-5)' }}>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              hasNext={hasNext}
              hasPrev={hasPrev}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
