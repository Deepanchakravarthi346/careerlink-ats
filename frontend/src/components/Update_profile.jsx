import React, { useEffect, useState } from "react";
import "../css/Recruiter.css"; // Reuse form layout css
import { useNavigate } from "react-router-dom";
import BackButton from "./ui/BackButton";
import {
  FaUserEdit,
  FaSpinner,
  FaMapMarkerAlt,
  FaFileAlt,
  FaGraduationCap,
  FaLink,
  FaArrowLeft,
} from "react-icons/fa";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height *= MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width *= MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const Update_profile = () => {
  const [profileview, setProfileview] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const access_token = localStorage.getItem("accessTokens");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/accounts/profileview/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProfileview(data));
  }, [access_token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileview((prev) => ({ ...prev, [name]: value }));
  };

  async function saveprofile(e) {
    e.preventDefault();
    setIsSaving(true);

    let profilePicFile = null;
    if (profileview.profile_picture instanceof File) {
      if (profileview.profile_picture.size < 1024 * 1024) {
        // Less than 1MB, no need to compress
        profilePicFile = profileview.profile_picture;
      } else {
        try {
          profilePicFile = await compressImage(profileview.profile_picture);
        } catch (error) {
          console.error("Image compression failed:", error);
          alert("Failed to process the selected image. Please try a different photo.");
          setIsSaving(false);
          return;
        }
      }
    }

    const formData = new FormData();
    formData.append("headline", profileview.headline || "");
    formData.append("location", profileview.location || "");
    formData.append("about", profileview.about || "");
    formData.append("skills", profileview.skills || "");
    formData.append("degree", profileview.degree || "");
    formData.append("institution", profileview.institution || "");
    formData.append("start_year", profileview.start_year || "");
    formData.append("end_year", profileview.end_year || "");
    formData.append("git_hub", profileview.git_hub || "");
    formData.append("linkedin", profileview.linkedin || "");

    if (profilePicFile) {
      formData.append("profile_picture", profilePicFile);
    }

    if (profileview.resume instanceof File) {
      formData.append("resume", profileview.resume);
    }

    fetch(`${API_BASE}/accounts/profileupdate/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Profile updated successfully.");
        navigate("/myprofile");
      })
      .catch((error) => alert(error))
      .finally(() => setIsSaving(false));
  }

  return (
    <div className="postjob-container">
      <div style={{ marginBottom: "16px" }}>
        <BackButton />
      </div>
      <div className="page-header">
        <h1>Update Profile</h1>
        <p>Keep your profile up to date to stand out.</p>
      </div>

      <form className="job-form" onSubmit={saveprofile}>
        <div className="form-card">
          <h2>
            <FaUserEdit style={{ color: "var(--color-primary)" }} /> Basic
            Information
          </h2>

          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "var(--color-bg)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {profileview.profile_picture &&
              !(profileview.profile_picture instanceof File) ? (
                <img
                  src={profileview.profile_picture}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : profileview.profile_picture instanceof File ? (
                <span style={{ fontSize: "32px" }}>🖼️</span>
              ) : (
                <FaUserEdit
                  style={{ fontSize: "32px", color: "var(--color-primary)" }}
                />
              )}
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setProfileview({
                    ...profileview,
                    profile_picture: e.target.files[0],
                  })
                }
              />
            </div>
          </div>

          <div className="grid">
            <Input
              label="Professional Headline"
              name="headline"
              type="text"
              value={profileview.headline || ""}
              onChange={handleChange}
            />
            <Input
              label="Location"
              name="location"
              type="text"
              value={profileview.location || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-card">
          <h2>
            <FaFileAlt style={{ color: "var(--color-primary)" }} /> About &
            Skills
          </h2>
          <Textarea
            label="About Me"
            name="about"
            rows="5"
            value={profileview.about || ""}
            onChange={handleChange}
          />
          <Textarea
            label="Professional Skills (comma separated)"
            name="skills"
            rows="3"
            value={profileview.skills || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-card">
          <h2>
            <FaGraduationCap style={{ color: "var(--color-primary)" }} />{" "}
            Education
          </h2>
          <div className="grid">
            <Input
              label="Degree"
              name="degree"
              type="text"
              value={profileview.degree || ""}
              onChange={handleChange}
            />
            <Input
              label="Institution"
              name="institution"
              type="text"
              value={profileview.institution || ""}
              onChange={handleChange}
            />
            <Input
              label="Start Year"
              name="start_year"
              type="number"
              value={profileview.start_year || ""}
              onChange={handleChange}
            />
            <Input
              label="End Year"
              name="end_year"
              type="number"
              value={profileview.end_year || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-card">
          <h2>
            <FaLink style={{ color: "var(--color-primary)" }} /> Social Links &
            Resume
          </h2>
          <div className="grid">
            <Input
              label="LinkedIn URL"
              name="linkedin"
              type="url"
              value={profileview.linkedin || ""}
              onChange={handleChange}
            />
            <Input
              label="GitHub URL"
              name="git_hub"
              type="url"
              value={profileview.git_hub || ""}
              onChange={handleChange}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Update Resume (PDF/DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                setProfileview({ ...profileview, resume: e.target.files[0] })
              }
            />
          </div>
        </div>

        <div className="button-group">
          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate("/myprofile")}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <FaSpinner className="spinner-icon" /> Saving...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Update_profile;
