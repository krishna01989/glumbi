import LegalLayout from './LegalLayout'

export default function PrivacyPage({ inApp = false }) {
  return (
    <LegalLayout title="Privacy Policy" updated="26 July 2026" inApp={inApp}>
      <p>Glumbi ("we", "us", "our") is committed to protecting the privacy of families who use our service. This policy explains what data we collect, why, and how we protect it. It is written to comply with the <strong>Digital Personal Data Protection Act 2023 (DPDP Act, India)</strong> and the <strong>Children's Online Privacy Protection Act (COPPA, USA)</strong>.</p>

      <h2>1. Who we are</h2>
      <p>Glumbi is a children's learning and storytelling app. Our website is <strong>glumbi.com</strong>. For any privacy questions or data requests, contact our Data Protection Officer at <a href="mailto:privacy@glumbi.com">privacy@glumbi.com</a>. We aim to respond within 30 days.</p>

      <h2>2. What we collect</h2>

      <h3>Account information</h3>
      <ul>
        <li><strong>Email address</strong> — used to identify your account and for password resets.</li>
        <li><strong>Display name</strong> — optional, set when you sign up.</li>
        <li><strong>Password hash</strong> — stored as a one-way bcrypt hash; we never store your actual password.</li>
        <li><strong>Google sign-in subject ID</strong> — if you use "Continue with Google", we store only your Google subject ID — no Google password is ever shared with us.</li>
        <li><strong>Parental consent record</strong> — the date and policy version when you gave consent to process your child's data.</li>
      </ul>
      <h3>Child profiles</h3>
      <ul>
        <li>Child's first name, birth year, gender, and avatar preference — used to personalise stories and activities.</li>
        <li>We do not collect any other personal data about your child.</li>
      </ul>
      <h3>Voice recordings (optional)</h3>
      <ul>
        <li>If you choose to add a custom story voice, we collect an audio recording (parent or guardian only — no child voice data is collected).</li>
        <li>This recording is transmitted to a third-party voice synthesis provider solely to create a personalised voice model. The original audio file is not retained by Glumbi after processing.</li>
        <li>Voice data is used solely to narrate stories within your account. It is never used for advertising, profiling, or shared with other users.</li>
        <li>You can delete any custom voice at any time from My Account → Story Voices.</li>
      </ul>
      <h3>Generated content</h3>
      <ul>
        <li>Stories, curiosity answers, activities, journal entries, and drawings your child creates are stored so you can access them again.</li>
        <li>Keywords and questions typed are processed by Glumbi AI to generate content. See section 5 for third-party details.</li>
      </ul>
      <h3>Usage data</h3>
      <ul>
        <li>Monthly AI credit count — to enforce fair-use limits.</li>
        <li>Account creation timestamp and consent timestamp.</li>
        <li><strong>Child activity events</strong> — when a feature is opened or completed, how long the session lasted, and whether the device was online. Used solely to show parents a summary of how their child uses the app. Never shared with third parties or used for advertising or profiling.</li>
      </ul>

      <h2>3. What we do NOT collect</h2>
      <ul>
        <li>We do not use cookies for tracking.</li>
        <li>We do not run advertising, tracking pixels, or third-party analytics scripts (no Google Analytics, no Facebook Pixel).</li>
        <li>We do not sell your data to any third party.</li>
        <li>We do not collect your location, device fingerprint, or IP address for profiling.</li>
        <li>We do not behaviorally profile or target advertising at children.</li>
      </ul>
      <p><strong>Note on localStorage:</strong> we store your login token, role, and UI preference flags in your browser's <code>localStorage</code>. This is local to your device and never sent to third parties.</p>

      <h2>4. Legal basis for processing (DPDP Act 2023)</h2>
      <p>We process personal data on the following bases under the DPDP Act 2023:</p>
      <ul>
        <li><strong>Consent</strong> — you give explicit parental/guardian consent before any child data is processed. This consent is recorded with a timestamp and policy version. You may withdraw consent at any time from your Profile settings.</li>
        <li><strong>Contractual necessity</strong> — account email and password are required to provide the service.</li>
        <li><strong>Legitimate interest</strong> — anonymous usage counts to understand platform health.</li>
      </ul>

      <h2>5. How we use your data</h2>
      <ul>
        <li>To create and secure your account.</li>
        <li>To generate personalised stories and activities for your child.</li>
        <li>To enforce usage limits and prevent abuse.</li>
        <li>To respond to support requests you send us.</li>
        <li>To send you account and security emails (password reset, quota alerts, account status changes).</li>
        <li>To send optional weekly activity recap emails (you can opt out at any time in your Profile).</li>
      </ul>

      <h2>6. Third-party services</h2>
      <h3>AI content generation (Anthropic)</h3>
      <p>Glumbi AI is powered by Anthropic's API. Story keywords, curiosity questions, and activity preferences are sent to Anthropic to generate content. We do not send any personally identifiable information (names, email) to Anthropic — only the creative keywords. Governed by <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noreferrer">Anthropic's privacy policy</a>.</p>
      <h3>Google Sign-In</h3>
      <p>If you use "Continue with Google", the Google Identity Services script runs in your browser. We receive only a verified identity token. Governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google's Privacy Policy</a>.</p>
      <h3>Google Text-to-Speech</h3>
      <p>Story text is sent to the Google Cloud Text-to-Speech API to generate audio. No personal data is included in these requests.</p>
      <h3>Voice synthesis (custom voices)</h3>
      <p>If you add a custom story voice, your audio recording is sent to a third-party provider contractually prohibited from using it for any other purpose. No child voice data is collected. You may delete your voice model at any time from within the app.</p>

      <h2>7. International data transfers</h2>
      <p>Glumbi uses cloud infrastructure providers to host and operate the service. These providers may store and process your data in countries outside India, including the <strong>United States</strong> and other jurisdictions. We select providers that offer appropriate data security standards and contractual protections. By using Glumbi and providing your consent, you acknowledge that your data may be transferred to and processed in countries outside your country of residence. We apply appropriate safeguards to protect your data in accordance with the DPDP Act 2023 regardless of where it is processed.</p>

      <h2>8. Data retention</h2>
      <ul>
        <li>Your account and all associated data is retained for as long as your account is active.</li>
        <li>You can delete your account and all data at any time from within the app (Profile → Delete Account) or by emailing <a href="mailto:privacy@glumbi.com">privacy@glumbi.com</a>.</li>
        <li>Individual stories, journal entries, and curiosity answers can be deleted within the app at any time.</li>
        <li><strong>Activity analytics</strong> — child activity event logs are retained after account deletion for platform improvement. If you would like these fully removed, email <a href="mailto:privacy@glumbi.com">privacy@glumbi.com</a> and we will delete them within 30 days.</li>
      </ul>

      <h2>9. Children's privacy (COPPA &amp; DPDP Act 2023)</h2>
      <p>Glumbi is designed for parents and guardians to use on behalf of their children. In compliance with COPPA (USA) and the DPDP Act 2023 (India):</p>
      <ul>
        <li>We require <strong>verifiable parental/guardian consent</strong> before processing any child's personal data.</li>
        <li>Consent is recorded with a timestamp and policy version number in our database.</li>
        <li>We collect <strong>only the minimum data necessary</strong> (name, birth year) to provide the service.</li>
        <li>We do <strong>not</strong> engage in behavioral profiling, targeted advertising, or tracking of children.</li>
        <li>You may <strong>withdraw consent</strong> at any time from Profile → Privacy &amp; Data → Withdraw Parental Consent. Withdrawal stops all AI-powered child data processing. Your account remains active and you may re-consent at any time.</li>
        <li>You may <strong>review all data</strong> we hold about your family from Profile → Privacy &amp; Data → My Data.</li>
        <li>If you believe a child has created an account without parental consent, contact us immediately at <a href="mailto:privacy@glumbi.com">privacy@glumbi.com</a> and we will delete it promptly.</li>
      </ul>

      <h2>10. Your rights under DPDP Act 2023</h2>
      <p>As a data principal under the DPDP Act 2023, you have the following rights:</p>
      <ul>
        <li><strong>Right to access</strong> — view a summary of all data we hold about you and your children (Profile → My Data).</li>
        <li><strong>Right to correction</strong> — update your child's profile name, age, or avatar at any time within the app.</li>
        <li><strong>Right to erasure</strong> — delete your account and all associated data from Profile → Delete Account, or email us.</li>
        <li><strong>Right to withdraw consent</strong> — withdraw parental consent from Profile → Withdraw Parental Consent at any time.</li>
        <li><strong>Right to grievance redressal</strong> — raise any data-related complaint with our Data Protection Officer at <a href="mailto:privacy@glumbi.com">privacy@glumbi.com</a>. We will acknowledge within 48 hours and resolve within 30 days.</li>
      </ul>

      <h2>11. Security</h2>
      <ul>
        <li>All data is transmitted over HTTPS/TLS.</li>
        <li>Passwords are hashed using bcrypt before storage.</li>
        <li>Authentication tokens expire within 24 hours.</li>
        <li>Audio streaming uses short-lived signed tokens (not your account token) to prevent credential exposure in server logs.</li>
        <li>All AI inputs pass through content safety filtering before processing.</li>
      </ul>
      <p>In the event of a data breach that affects your personal data, we will notify affected users by email promptly upon becoming aware of the breach. We will describe what happened, what data was affected, and what steps we are taking.</p>

      <h2>12. Grievance Officer</h2>
      <p>For any privacy concerns, data requests, or complaints under the DPDP Act 2023 or COPPA, contact our Grievance / Data Protection Officer:</p>
      <p><strong>Email:</strong> <a href="mailto:privacy@glumbi.com">privacy@glumbi.com</a><br />
      <strong>Response time:</strong> Acknowledgement within 48 hours, resolution within 30 days.</p>

      <h2>13. Changes to this policy</h2>
      <p>We may update this policy from time to time. The "last updated" date at the top of this page reflects the current version. If we make material changes that require fresh parental consent, we will prompt you to re-consent on next login.</p>
    </LegalLayout>
  )
}
