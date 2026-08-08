import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Jobs_details from "./components/Jobs_details";
import Profile from "./components/Profile";
import Myprofile from "./components/Myprofile";
import Update_profile from "./components/Update_profile";
import Jobapply from "./components/Jobapply";
import Appliedjobs from "./components/Appliedjobs";
import Recruiter from "./components/Recruiter";
import Myjobs from "./components/Myjobs";
import Applicants from "./components/Applicants";
import Applicant_profile from "./components/Applicant_profile";
import Jobs_by_id_posted from "./components/Jobs_by_id_posted";
import Edit_job from "./components/Edit_job";
import Dashboard from "./components/Dashboard";
import Db_applicants from "./components/Db_applicants";
import Db_totaljobs from "./components/Db_totaljobs";
import Db_total_reject from "./components/Db_total_reject";
import Db_total_shortlist from "./components/Db_total_shortlist";
import CandidateCompatibility from "./components/CandidateCompatibility";
import CandidateComparison from "./components/CandidateComparison";
import HiringPipeline from "./components/HiringPipeline";
import CandidateTracker from "./components/CandidateTracker";
import Analytics from "./components/Analytics";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/job/:id" element={<Jobs_details />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/myprofile" element={<Myprofile />} />
          <Route path="/updateprofile" element={<Update_profile />} />
          <Route path="/jobapply/:id" element={<Jobapply />} />
          <Route path="/appliedjobs" element={<Appliedjobs />} />
          <Route path="/postjob" element={<Recruiter />} />
          <Route path="/myjobs" element={<Myjobs />} />
          <Route path="/applicant/:id" element={<Applicants />} />
          <Route path="/applicantprofile/:id" element={<Applicant_profile />} />
          <Route
            path="/viewpostedjobbyid/:id"
            element={<Jobs_by_id_posted />}
          />
          <Route path="/editjob/:id" element={<Edit_job />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboardapplicants" element={<Db_applicants />} />
          <Route path="/dashboardtotaljobs" element={<Db_totaljobs />} />
          <Route path="/dashboardtotalreject" element={<Db_total_reject />} />
          <Route path="/dashboardtotalshortlist" element={<Db_total_shortlist />} />
          <Route path="/compatibility/:jobId/:applicantId" element={<CandidateCompatibility />} />
          <Route path="/compare/:jobId" element={<CandidateComparison />} />
          <Route path="/pipeline/:jobId" element={<HiringPipeline />} />
          <Route path="/tracker/:jobId/:applicantId" element={<CandidateTracker />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;
