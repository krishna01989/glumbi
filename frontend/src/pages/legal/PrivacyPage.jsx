import LegalLayout from './LegalLayout'

export default function PrivacyPage({ inApp = false }) {
  return (
    <LegalLayout title="Privacy Policy" updated="14 July 2026" inApp={inApp}>
      <p>Glumbi ("we", "us", "our") is committed to protecting the privacy of families who use our service. This policy explains what data we collect, why, and how we protect it.</p>

      <h2>1. Who we are</h2>
      <p>Glumbi is a children's storytelling and activity app operated by the Glumbi team. Our website is <strong>glumbi.com</strong>. For any privacy questions, contact us at <a href="mailto:privacy@glumbi.com">privacy@glumbi.com</a>.</p>

      <h2>2. What we collect</h2>

      <h3>Account information</h3>
      <ul>
        <li><strong>Email address</strong> — used to identify your account and for password resets.</li>
        <li><strong>Display name</strong> — optional, set when you sign up.</li>
        <li><strong>Password hash</strong> — stored as a one-way bcrypt hash; we never store your actual password.</li>
        <li><strong>Google sign-in subject ID</strong> — if you use "Continue with Google", we store only your Google subject ID (a unique string) — no Google password is ever shared with us.</li>
      </ul>
      <h3>Child profiles</h3>
      <ul>
        <li>Child's first name, age, gender, and avatar preference — used to personalise stories and activities.</li>
        <li>We do not collect any other personal data about your child.</li>
      </ul>
      <h3>Voice recordings (optional)</h3>
      <ul>
        <li>If you choose to add a custom story voice, we collect an audio recording of your voice (or another family member's voice). This recording is transmitted to a third-party voice synthesis provider to create a voice model.</li>
        <li>The voice model is stored by that provider and associated only with your account. The original audio file is not retained by Glumbi after processing.</li>
        <li>Voice data is used solely to narrate stories within your account. It is never used for advertising, profiling, or shared with other users.</li>
        <li>You can delete any custom voice at any time from My Account → Story Voices. Deletion removes the voice model from both Glumbi and the third-party provider.</li>
      </ul>
      <h3>Generated content</h3>
      <ul>
        <li>Stories, curiosity answers, activities, journal entries, and growth milestones you create are stored so you can access them again.</li>
        <li>Keywords and questions you type are processed by Glumbi AI to generate content. See section 5 for third-party details.</li>
      </ul>
      <h3>Usage data</h3>
      <ul>
        <li>Monthly AI credit count — to enforce fair-use limits.</li>
        <li>Account creation timestamp.</li>
        <li><strong>Child activity events</strong> — when a feature is opened or completed (e.g. a maze game started, a story read), how long the session lasted, and whether the device was online. This data is used solely to show parents a summary of how their child uses the app and to help us understand which features are most valuable. It is never shared with third parties or used for advertising.</li>
      </ul>

      <h2>3. What we do NOT collect</h2>
      <ul>
        <li>We do not use cookies on our website.</li>
        <li>We do not run advertising, tracking pixels, or third-party analytics scripts (no Google Analytics, no Facebook Pixel). Any usage analytics we collect are first-party, stored on our own servers, and surfaced only to you as the parent.</li>
        <li>We do not sell your data to any third party.</li>
        <li>We do not collect your location, device fingerprint, or IP address for profiling.</li>
      </ul>
      <p><strong>Note on localStorage:</strong> we store your login token, role, and two UI preference flags in your browser's <code>localStorage</code>. This is local to your device and never sent to third parties. You can clear it at any time via your browser settings.</p>

      <h2>4. How we use your data</h2>
      <ul>
        <li>To create and secure your account.</li>
        <li>To generate personalised stories and activities for your child.</li>
        <li>To enforce usage limits and prevent abuse.</li>
        <li>To respond to support requests you send us.</li>
      </ul>
      <p>We do not use your data for marketing without your explicit consent.</p>

      <h2>5. Third-party services</h2>
      <h3>AI content generation (Anthropic)</h3>
      <p>Glumbi AI is powered by Anthropic's API. Story keywords, curiosity questions, and activity preferences are sent to Anthropic to generate content. Anthropic's data processing is governed by their <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noreferrer">privacy policy</a>. We do not send any personally identifiable information (names, email) to Anthropic — only the creative keywords.</p>
      <h3>Google Sign-In</h3>
      <p>If you use "Continue with Google", the Google Identity Services script runs in your browser and may set a short-lived <code>g_state</code> cookie on Google's domain. We receive only a verified identity token; we never see your Google password. Google's sign-in is governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google's Privacy Policy</a>.</p>
      <h3>Google Text-to-Speech</h3>
      <p>Story text is sent to the Google Cloud Text-to-Speech API to generate audio. No personal data is included in these requests.</p>
      <h3>Voice synthesis (custom voices)</h3>
      <p>If you add a custom story voice, your audio recording is sent to a third-party voice synthesis provider to create a personalised voice model. This provider processes voice data solely to fulfil the narration feature and is contractually prohibited from using it for any other purpose. No child voice data is ever collected — only a parent or guardian may record a custom voice. You may delete your voice model at any time from within the app.</p>

      <h2>6. Data retention</h2>
      <ul>
        <li>Your account and all associated data is retained for as long as your account is active.</li>
        <li>You can delete your account and all data at any time by emailing <a href="mailto:privacy@glumbi.com">privacy@glumbi.com</a>.</li>
        <li>Individual stories, journal entries, and curiosity answers can be deleted by you at any time within the app.</li>
        <li><strong>Activity analytics</strong> — child activity event logs (feature usage timestamps, durations, and counts) are retained after account deletion for platform improvement purposes. These records contain only a child's first name and your email address alongside usage metrics; no story content, journal entries, or other personal content is retained. If you would like these records fully removed, email <a href="mailto:privacy@glumbi.com">privacy@glumbi.com</a> and we will delete them within 30 days.</li>
      </ul>

      <h2>7. Children's privacy (COPPA / DPDP)</h2>
      <p>Glumbi is designed for parents and caregivers to use <em>on behalf of</em> their children. We do not knowingly collect personal data directly from children under 13. Parents create accounts and manage all child profile data. If you believe a child has created an account without parental consent, contact us immediately at <a href="mailto:privacy@glumbi.com">privacy@glumbi.com</a> and we will delete it.</p>

      <h2>8. Security</h2>
      <ul>
        <li>All data is transmitted over HTTPS.</li>
        <li>Passwords are hashed using bcrypt before storage.</li>
        <li>JWT tokens expire and are stored only in browser localStorage (not in cookies, reducing XSS surface).</li>
        <li>All AI inputs pass through 4 layers of content safety filtering before being processed.</li>
      </ul>

      <h2>9. Your rights</h2>
      <p>Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. To exercise any of these rights, email <a href="mailto:privacy@glumbi.com">privacy@glumbi.com</a>. We will respond within 30 days.</p>

      <h2>10. Changes to this policy</h2>
      <p>We may update this policy from time to time. The "last updated" date at the top of this page always reflects the current version. We recommend checking this page periodically for any changes.</p>
    </LegalLayout>
  )
}
