import React from "react";

const CancellationsAndRefunds = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">Cancellations and Refunds Policy</h1>
      <p className="text-lg mb-4">
        At IdeaBoard AI, we strive to provide the best service possible. This policy outlines our terms regarding cancellations and refunds for our subscription plans.
      </p>
      
      <h2 className="text-2xl font-semibold mb-4 mt-8">1. Subscription Cancellation</h2>
      <p className="mb-4">
        You can cancel your IdeaBoard AI subscription at any time. Upon cancellation, your subscription will remain active until the end of your current billing period. You will not be charged for the next billing cycle.
      </p>
      <p className="mb-4">
        To cancel your subscription, please visit your "Profile" page and follow the cancellation instructions.
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-8">2. Refunds</h2>
      <p className="mb-4">
        Due to the nature of our digital services and immediate access to generation credits, IdeaBoard AI generally does not offer refunds for any subscription fees already paid. This applies to both monthly and annual plans.
      </p>
      <p className="mb-4">
        <strong>Exceptions:</strong>
        <ul className="list-disc list-inside ml-4">
          <li>If there was an error in billing (e.g., duplicate charge), please contact our support team immediately for resolution.</li>
          <li>In rare cases, at the sole discretion of IdeaBoard AI, a partial or full refund may be considered if there are extenuating circumstances.</li>
        </ul>
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-8">3. Downgrading Plans</h2>
      <p className="mb-4">
        If you choose to downgrade your plan, the changes will take effect at the start of your next billing cycle. No refunds will be issued for the difference in price for the current billing period.
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-8">4. Changes to Policy</h2>
      <p className="mb-4">
        IdeaBoard AI reserves the right to modify this Cancellations and Refunds Policy at any time. Any changes will be posted on this page, and your continued use of our services after such changes constitutes your acceptance of the new terms.
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-8">5. Contact Us</h2>
      <p className="mb-4">
        If you have any questions about this policy, please contact us at support@ideaboard.ai.
      </p>
    </div>
  );
};

export default CancellationsAndRefunds;
