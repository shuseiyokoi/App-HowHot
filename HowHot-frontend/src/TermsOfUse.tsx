import { Link } from "react-router-dom";

const TermsOfUse = () => {
    return (
        <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "800px", margin: "auto"  }}>
            <h1>Terms of Use</h1>
            <p>Last updated: April 8, 2025</p>
            <p>Welcome to Ask Me Bot! By using our service, you agree to the following terms</p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing this application, you agree to be bound by these Terms of Use.</p>

            <h2>2. Usage Restrictions</h2>
            <p>You agree not to misuse this application in any way.</p>

            <h2>3. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time.</p>

            <h2>4. Spiciness Prediction Disclaimer</h2>
            <p>
                Our application uses AI to predict the spiciness level of food based on images and user feedback.
                Please note that these predictions are for informational purposes only and may not accurately reflect the actual spiciness level of the food.
                We are not responsible for any discomfort, injury, or other consequences resulting from underestimating or overestimating the spiciness of food based on our predictions.
                Always use your own judgment and take necessary precautions if you are sensitive to spicy food.
            </p>

            <Link to="/" style={{ color: "#888", textDecoration: "none" }}>Back to Home</Link>
        </div>
    );
};

export default TermsOfUse;
