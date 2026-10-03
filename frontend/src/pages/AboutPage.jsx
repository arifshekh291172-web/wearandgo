import React from 'react';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { STORE_CONFIG } from '../utils/config';
import { Sparkles, ShieldCheck, Heart, Truck } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      <Breadcrumb items={[{ label: 'About Us' }]} />

      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <img
          src="/logo.png"
          alt="Wear & Go"
          className="h-24 w-auto mx-auto object-contain filter drop-shadow-[0_4px_16px_rgba(197,160,89,0.4)]"
        />
        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
            Our Story & Philosophy
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-serif text-slate-950">
            About Wear & Go
          </h1>
          <p className="text-sm text-slate-500 italic">"{STORE_CONFIG.tagline}"</p>
        </div>
      </div>

      <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
          alt="Fashion Studio"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
        <p>
          Founded in Mumbai, <strong>Wear & Go</strong> was born from a fundamental belief: modern apparel should never force you to compromise between effortless urban aesthetics and tactile luxury.
        </p>
        <p>
          In a world cluttered with fast-fashion disposables, we partner directly with heritage textile mills across India to source heavyweight French terry cottons, breathable organic French linens, and hand-selected leathers. Every stitch, dropped shoulder seam, and tapered hem is engineered to move with you seamlessly through daily commutes, casual boardrooms, weekend brunches, and spontaneous getaways.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 not-prose">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <h4 className="font-bold text-sm text-slate-900">Uncompromising Fabric</h4>
            <p className="text-xs text-slate-500">240+ GSM combed cottons and organic fibers that retain their structure wash after wash.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <Heart className="w-6 h-6 text-rose-600" />
            <h4 className="font-bold text-sm text-slate-900">Ethically Crafted</h4>
            <p className="text-xs text-slate-500">Manufactured in certified factories adhering to fair wages, worker safety, and ecological dye standards.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <Truck className="w-6 h-6 text-blue-600" />
            <h4 className="font-bold text-sm text-slate-900">Pan-India Express</h4>
            <p className="text-xs text-slate-500">Fast delivery covering tier-1 metropolises to remote corners across 19,000+ PIN codes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
