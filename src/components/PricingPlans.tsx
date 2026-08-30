import './PricingPlans.css';

export default function PricingPlans() {
  return (
    <div className="pricing-container">
      <div className="pricing-card">
        <h3 className="plan-name">Free</h3>
        <div className="plan-price">
          <span className="currency">$</span>0<span className="period">/mo</span>
        </div>
        <p className="plan-desc">For individuals just getting started with deep research.</p>
        <button className="plan-btn">Current Plan</button>
        <ul className="plan-features">
          <li><span className="check">✓</span> 10 deep research queries per day</li>
          <li><span className="check">✓</span> Basic Llama 3.1 8B model access</li>
          <li><span className="check">✓</span> Standard response speed</li>
          <li><span className="check">✓</span> Web search integration</li>
        </ul>
      </div>

      <div className="pricing-card premium-card">
        <div className="premium-badge">Most Popular</div>
        <h3 className="plan-name">Pro</h3>
        <div className="plan-price">
          <span className="currency">$</span>20<span className="period">/mo</span>
        </div>
        <p className="plan-desc">For power users who need priority speed and more requests.</p>
        <button className="plan-btn premium-btn">Upgrade to Pro</button>
        <ul className="plan-features">
          <li><span className="check">✓</span> 500 deep research queries per day</li>
          <li><span className="check">✓</span> Access to standard premium models</li>
          <li><span className="check">✓</span> Priority response speed</li>
          <li><span className="check">✓</span> Voice interaction & basic personalizations</li>
        </ul>
      </div>

      <div className="pricing-card">
        <h3 className="plan-name">Ultra</h3>
        <div className="plan-price">
          <span className="currency">$</span>50<span className="period">/mo</span>
        </div>
        <p className="plan-desc">For teams and heavy researchers needing maximum capabilities.</p>
        <button className="plan-btn">Upgrade to Ultra</button>
        <ul className="plan-features">
          <li><span className="check">✓</span> Unlimited deep research queries</li>
          <li><span className="check">✓</span> Access to ALL flagship models (Llama 70B, 405B)</li>
          <li><span className="check">✓</span> Highest priority response speed</li>
          <li><span className="check">✓</span> Custom agents, webhooks & API access</li>
        </ul>
      </div>
    </div>
  );
}
