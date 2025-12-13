import React from 'react';

interface ServiceCTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  className?: string;
}

export function ServiceCTA({ 
  title = "Talk to Our Cloud Architects",
  description = "Ready to discuss your cloud challenges? Our architects are here to help design the right solution for your business.",
  buttonText = "Schedule a Consultation",
  contactInfo,
  className = '' 
}: ServiceCTAProps) {
  return (
    <section className={`bg-gray-50 py-16 ${className}`}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          {description}
        </p>
        
        <div className="space-y-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
            {buttonText}
          </button>
          
          {contactInfo && (
            <div className="flex justify-center gap-8 text-sm text-gray-600 mt-6">
              {contactInfo.email && (
                <div>
                  <span className="font-medium">Email:</span>
                  <a href={`mailto:${contactInfo.email}`} className="ml-2 text-blue-600 hover:underline">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.phone && (
                <div>
                  <span className="font-medium">Phone:</span>
                  <a href={`tel:${contactInfo.phone}`} className="ml-2 text-blue-600 hover:underline">
                    {contactInfo.phone}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ServiceCTA;