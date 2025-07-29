import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
    return (
        <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "800px", margin: "auto" }}>
            <h1>Privacy Policy</h1>
            <p>Last updated: April 8, 2025</p>
            <p>Your privacy is important to us. This Privacy Policy explains how we collect and use your information.</p>
            
            <h2>1. Information We Collect</h2>
            <p>We collect user inputs and usage data to improve the app experience.</p>

            <h2>2. How We Use Your Information</h2>
            <p>Your data is used only to provide responses and improve AI capabilities.</p>

            <h2>3. Data Protection</h2>
            <p>We take appropriate security measures to protect your data.</p>

            <Link to="/" style={{ color: "#888", textDecoration: "none" }}>Back to Home</Link>
        </div>
    );
};

export default PrivacyPolicy;