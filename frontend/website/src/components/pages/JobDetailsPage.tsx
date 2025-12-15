import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  Building2,
  Share2
} from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  location: string;
  experience: string;
  description: string;
  responsibilities: string;
  skills: string;
  salary?: string;
  postDate: string;
  googleFormLink: string;
  status: string;
  createdAt: string;
}

const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3500/api';

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/jobs/${id}`);

      if (!response.ok) {
        throw new Error('Job not found');
      }

      const data = await response.json();
      setJob(data?.data?.job || data.job);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Full-time': 'bg-blue-100 text-blue-800 border-blue-200',
      'Part-time': 'bg-green-100 text-green-800 border-green-200',
      'Internship': 'bg-purple-100 text-purple-800 border-purple-200',
      'Contract': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleShare = async () => {
    const shareData = {
      title: job?.title || 'Job Opening',
      text: `Check out this job opening: ${job?.title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The job you are looking for does not exist or has been removed.'}</p>
          <Link
            to="/careers"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  const responsibilities = job.responsibilities.split('\n').filter(r => r.trim());
  const skills = job.skills.split(',').map(s => s.trim()).filter(s => s);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb & Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/careers')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Careers
            </button>
            <nav className="text-sm text-gray-600">
              <Link to="/" className="hover:text-gray-900">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/careers" className="hover:text-gray-900">Careers</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{job.title}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Job Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border mb-4 ${getTypeColor(job.type)}`}>
                  {job.type}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-blue-100">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    <span>Flaunt By Nishi</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{job.experience}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>Posted {formatDate(job.postDate)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex-shrink-0 ml-4"
                title="Share this job"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <a
              href={job.googleFormLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Apply Now
              <ExternalLink className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Description */}
              <div className="p-8 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </div>

              {/* Responsibilities */}
              <div className="p-8 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Responsibilities</h2>
                <ul className="space-y-3">
                  {responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div className="p-8 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Apply Section */}
              <div className="p-8 bg-gray-50">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Apply?</h2>
                  <p className="text-gray-600 mb-6">
                    Take the next step in your career journey. Click below to fill out our application form.
                  </p>
                  <a
                    href={job.googleFormLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    Apply for this Position
                    <ExternalLink className="w-5 h-5 ml-2" />
                  </a>
                  <p className="text-sm text-gray-500 mt-4">
                    You will be redirected to Google Forms to complete your application
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Have Questions?</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about this position or the application process, feel free to reach out to us.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact Us
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Schema Markup for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "JobPosting",
          "title": job.title,
          "description": job.description,
          "identifier": {
            "@type": "PropertyValue",
            "name": "Flaunt By Nishi",
            "value": job._id
          },
          "datePosted": job.postDate,
          "employmentType": job.type.toUpperCase().replace('-', '_'),
          "hiringOrganization": {
            "@type": "Organization",
            "name": "Flaunt By Nishi",
            "sameAs": window.location.origin
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": job.location
            }
          },
          "baseSalary": job.salary ? {
            "@type": "MonetaryAmount",
            "currency": "INR",
            "value": {
              "@type": "QuantitativeValue",
              "value": job.salary
            }
          } : undefined,
          "experienceRequirements": job.experience,
          "skills": job.skills
        })}
      </script>
    </div>
  );
};

export default JobDetailsPage;
