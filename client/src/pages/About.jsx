import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const About = () => {
  const trustPillars = [
    {
      title: 'AI Price Valuation',
      weight: '35% Weight',
      color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
      description: 'Random Forest Regressor trained on thousands of vehicle transactions to compute true fair market price ranges.'
    },
    {
      title: 'Fraud & Anomaly Safety',
      weight: '30% Weight',
      color: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30 text-indigo-400',
      description: 'Automated ML classifier detecting severe underpricing scams, new account anomalies, and suspicious descriptions.'
    },
    {
      title: 'Visual Damage CNN',
      weight: '25% Weight',
      color: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
      description: 'Transfer Learning MobileNetV2 CNN scanning uploaded car photos for exterior dent and damage classification.'
    },
    {
      title: 'Seller Verification',
      weight: '10% Weight',
      color: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
      description: 'Historical deal completion rates, account longevity, and verified response metrics.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-background text-textPrimary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <span>✨ Powered by AI & Machine Learning</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Transparancy & Trust in Used Car Trading
          </h1>
          <p className="text-lg text-textSecondary leading-relaxed">
            Rentica makes car rental transparent, simple, and trustworthy — connecting verified owners with renters who want a better experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-surface border border-border/70 space-y-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">
              📊
            </div>
            <h3 className="text-xl font-bold text-textPrimary">Fair Market Pricing</h3>
            <p className="text-sm text-textSecondary leading-relaxed">
              Every car listed on Rentica has verified daily pricing and owner details so renters always know what they are getting.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-border/70 space-y-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl">
              🛡️
            </div>
            <h3 className="text-xl font-bold text-textPrimary">Automated Fraud Shield</h3>
            <p className="text-sm text-textSecondary leading-relaxed">
              High-risk listings and deposit scams are automatically intercepted by our Fraud Classifier before ever reaching public buyers.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-border/70 space-y-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl">
              🔍
            </div>
            <h3 className="text-xl font-bold text-textPrimary">Computer Vision Scans</h3>
            <p className="text-sm text-textSecondary leading-relaxed">
              Our MobileNetV2 CNN model inspects vehicle photos to score body panel condition and flag damage tags automatically.
            </p>
          </div>
        </div>

        {/* Trust Score Methodology Section */}
        <div id="trust-score" className="space-y-8 scroll-mt-24">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Trust Score Breakdown Methodology
            </h2>
            <p className="text-sm text-textSecondary">
              Every listing receives a transparent 0–100 Trust Score derived from 4 key machine learning evaluation pillars:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trustPillars.map((pillar, idx) => (
              <div key={idx} className={`p-6 rounded-2xl bg-gradient-to-br ${pillar.color} border text-left space-y-2`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-textPrimary">{pillar.title}</h4>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-background/80 border border-border/60 text-textPrimary">
                    {pillar.weight}
                  </span>
                </div>
                <p className="text-xs text-textSecondary leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-10 rounded-3xl bg-surface border border-border text-center space-y-6 max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to explore verified vehicles?</h3>
          <p className="text-sm text-textSecondary max-w-xl mx-auto">
            Browse our curated selection of verified cars with transparent AI price estimates and condition reports.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/browse">
              <Button variant="primary" pill className="font-bold px-8 py-3">
                Browse Marketplace
              </Button>
            </Link>
            <Link to="/create-listing">
              <Button variant="outline" pill className="font-bold px-8 py-3">
                Sell Your Car
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;

