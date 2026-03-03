function SubscriptionPage({ company }) {
  return (
    <div className="space-y-4">
      <BillingSection company={company} />
    </div>
  );
}

window.SubscriptionPage = SubscriptionPage;
