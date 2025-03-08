import React from 'react';

const TermsOfService = () => {
  return (
    <div className="text-left flex flex-col max-w-4xl p-6 shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-6  text-white-600 text-center">Terms of Service</h1>
      <p className="text-white-600 mb-6 ">Last Updated: 03/07/2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-white-800">1. Acceptance of Terms</h2>
        <p className="text-white-700 mb-4">
          By accessing or using our TerraNova Drive platform ("Service"), you agree to comply with these Terms. If you do not agree, please refrain from using the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-white-800">2. User Responsibilities</h2>
        <ul className="list-disc list-inside text-white-700 mb-4">
          <li>Provide accurate and up-to-date information when creating an account.</li>
          <li>Maintain the confidentiality of your login credentials.</li>
          <li>Do not upload or share illegal, harmful, or copyrighted content without proper authorization.</li>
          <li>Avoid using automated tools to access or manage files in an unauthorized manner.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-white-800">3. File Storage and Limits</h2>
        <ul className="list-disc list-inside text-white-700 mb-4">
          <li>Users have limited storage based on their plan. Exceeding limits may result in restricted access.</li>
          <li>We reserve the right to delete files that violate these Terms without prior notice.</li>
          <li>Regular backups are encouraged. We are not responsible for data loss.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-white-800">4. Privacy Policy</h2>
        <p className="text-white-700 mb-4">
          Your privacy is important to us. Please review our <a href="#" className="text-white-500 hover:underline">Privacy Policy</a> to understand how we collect, use, and safeguard your information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-white-800">5. Prohibited Activities</h2>
        <ul className="list-disc list-inside text-white-700 mb-4">
          <li>Do not upload viruses, malware, or malicious scripts.</li>
          <li>Avoid impersonating others or misrepresenting your identity.</li>
          <li>Do not attempt to bypass security measures or access unauthorized data.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-white-800">6. Termination</h2>
        <p className="text-white-700 mb-4">
          We reserve the right to suspend or terminate access if these Terms are violated. Termination may include deletion of files and revocation of access.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-white-800">7. Limitation of Liability</h2>
        <p className="text-white-700 mb-4">
          To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-white-800">8. Modifications to Terms</h2>
        <p className="text-white-700 mb-4">
          We may update these Terms periodically. Changes will be effective immediately upon posting. Continued use of the Service implies acceptance of the updated Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-white-800">9. Contact Us</h2>
        <p className="text-white-700 mb-4">
          For questions or concerns about these Terms, please contact us at:
        </p>
        <ul className="text-white-700 mb-4">
          <li>Email: <a href="mailto:support@driveclone.com" className="text-white hover:underline">luisgerardo900@gmail.com</a></li>
          <li>Phone: +573228329913</li>
        </ul>
      </section>

      <p className="text-white-700 text-center">Thank you for choosing our TerraNova Drive! 🚀</p>
    </div>
  );
};

export default TermsOfService;
