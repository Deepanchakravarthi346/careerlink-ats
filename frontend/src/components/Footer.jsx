import "../css/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <h3>CareerLink</h3>
      <p>Connecting talented professionals with top companies. Experience the premium applicant tracking workflow.</p>
      <div className="footer-copyright">
        © {new Date().getFullYear()} CareerLink. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;
