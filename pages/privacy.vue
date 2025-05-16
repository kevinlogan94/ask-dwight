<template>
  <div class="flex flex-col items-center justify-center p-24 min-h-screen">
    <UPageCard class="w-full max-w-4xl">
      <div class="prose dark:prose-invert max-w-none">
        <h1 class="text-center">Privacy Policy for ask-dwight.com and Subdomains</h1>
        <p class="text-center italic">Last Updated: May 15, 2025</p>

        <p>Ask-Dwight, LLC ("we," "us," "our") respects your privacy. This Privacy Policy outlines how we collect, use, share, and safeguard information obtained through your use of ask-dwight.com and all subdomains, including app.ask-dwight.com (collectively, the "Service").</p>

        <h2>1. Information We Collect</h2>
        <p>We collect the following types of information:</p>
        <ul>
          <li><strong>Google Account Information:</strong> When signing up using Google, we collect your full name, email address, and Google profile picture.</li>
          <li><strong>Usage Data:</strong> We collect information regarding your interactions on the Service, including pages visited, interaction frequency, and general usage behaviors. This data helps us enhance our platform and improve user experiences.</li>
          <li><strong>User-Provided Data:</strong> Users may input personal or business-related sales data into the Service. We use this data exclusively for training and improving our AI-powered sales models ("Dwight AI").</li>
          <li><strong>Form Submission Data:</strong> When you submit forms on our website (processed through Netlify), we collect the information you provide in those forms, including your name, email address, and any message content.</li>
        </ul>

        <h2>2. Purpose of Data Collection</h2>
        <p>Your information helps us:</p>
        <ul>
          <li>Deliver, operate, and improve our AI-powered sales assistant and related services.</li>
          <li>Train and refine Dwight AI models to enhance sales-related functionalities.</li>
        </ul>
        <p>We do <strong>not</strong> use collected data for marketing or promotional communications.</p>

        <h2>3. Sharing and Disclosure</h2>
        <p><strong>We do not sell your personal information to third parties under any circumstances.</strong></p>
        <p>We may share user data under the following limited circumstances:</p>
        <ul>
          <li><strong>Analytics and Data Providers:</strong> Information may be shared with third-party analytics providers (such as Google Analytics) and other third-party databases to better understand user behaviors and improve our Service.</li>
          <li><strong>Potential Partners:</strong> We reserve the right to share data with future analytics providers or similar business affiliates to support Service improvements.</li>
          <li><strong>Legal Requirements:</strong> We will cooperate and share user data with government or legal authorities if required by law or legal request.</li>
        </ul>

        <h2>3.1 Third-Party Service Providers</h2>
        <p>We use the following third-party service providers to facilitate our Service:</p>
        <ul>
          <li><strong>Supabase:</strong> For user authentication and database services. Their privacy practices can be reviewed at <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">https://supabase.com/privacy</a>.</li>
          <li><strong>Netlify:</strong> For website hosting and form processing. Their privacy practices can be reviewed at <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">https://www.netlify.com/privacy/</a>.</li>
          <li><strong>Google Analytics:</strong> For website usage tracking and analytics. Their privacy practices can be reviewed at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>.</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>We adhere to standard industry best practices for encryption, secure storage, and data handling to protect your personal information.</p>

        <h2>5. Cookies and Tracking Technologies</h2>
        <p>We utilize Google Analytics, which involves cookies and similar tracking technologies to analyze user interactions and improve the Service.</p>

        <h2>5.1 Legal Basis for Processing</h2>
        <p>We process your information under the following legal bases:</p>
        <ul>
          <li><strong>Implied Consent:</strong> By using our Service and signing in, you implicitly consent to our data practices as described in this Privacy Policy and our Terms of Service.</li>
          <li><strong>Contractual Necessity:</strong> Processing is necessary for the performance of our contract with you to provide the Service.</li>
          <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate interests, such as improving our Service, provided those interests are not overridden by your rights and freedoms.</li>
        </ul>

        <h2>6. User Rights and Data Management</h2>
        <p>You may request access to or deletion of your personal data at any time by contacting our support at kyle@ask-dwight.com. We currently do not offer an opt-out option for specific data uses.</p>

        <h2>7. Data Retention</h2>
        <p>We retain user data indefinitely, even after account closure or inactivity, to continue improving and refining our AI models.</p>

        <h2>8. Children's Privacy</h2>
        <p>Our Service is intended for users aged 18 and above.</p>

        <h2>9. Geographic Restrictions</h2>
        <p>Our Service is intended solely for users located within the United States. By using ask-dwight.com or any of its subdomains, you confirm that you reside within the United States.</p>

        <h2>10. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy periodically. We will notify users of any changes via email or notifications posted directly on the website.</p>

        <h2>11. Contact Information</h2>
        <p>If you have questions or concerns regarding this Privacy Policy, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> kyle@ask-dwight.com</li>
          <li><strong>Support Contact:</strong> Kyle Kidwell</li>
        </ul>

        <p>By using ask-dwight.com or any of its subdomains, you acknowledge that you have read and understood this Privacy Policy.</p>
      </div>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Privacy Policy",
  meta: [{ name: "description", content: "Privacy Policy for ask-dwight.com and all subdomains" }],
});
</script>
