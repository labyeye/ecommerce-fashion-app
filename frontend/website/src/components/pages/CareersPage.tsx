import React, { useState, useEffect } from "react";
import { Briefcase, Search, Building2 } from "lucide-react";

interface Job {
  _id: string;
  title: string;
  type: "Full-time" | "Part-time" | "Internship" | "Contract";
  location: string;
  experience: string;
  description: string;
  salary?: string;
  googleFormLink?: string;
  postDate: string;
  status: string;
}

const CareersPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const API_BASE = import.meta.env.VITE_API_BASE || "https://ecommerce-fashion-app-som7.vercel.app/api";

  useEffect(() => {
    fetchJobs();
  }, [typeFilter, locationFilter, searchTerm]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        status: "Active",
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(locationFilter !== "all" && { location: locationFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`${API_BASE}/jobs?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data?.data?.jobs || []);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const uniqueLocations = Array.from(new Set(jobs.map((job) => job.location)));

  return (
    <div className="min-h-screen bg-background py-20">
      <section className="bg-tertiary text-white py-20">
        <div className="w-full mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-4xl md:text-5xl font-bold mb-6">
              Join Our Growing Team
            </span>
            <p className="text-xl mb-8 text-blue-100">
              Build your career with us and be part of something amazing. We're
              always looking for talented individuals who share our passion.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-background  sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search jobs by title, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-tertiary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="min-w-[150px]">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-tertiary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="min-w-[150px]">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-tertiary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Listing */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary mx-auto mb-4"></div>
                <p className="text-tertiary">Loading opportunities...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-tertiary mb-4">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">{error}</p>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-tertiary" />
                <h3 className="text-xl font-semibold text-tertiary mb-2">
                  No jobs found
                </h3>
                <p className="text-tertiary mb-6">
                  Try adjusting your filters or check back later for new
                  opportunities.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="text-2xl font-bold text-tertiary">
                    {jobs.length} Open Position{jobs.length !== 1 ? "s" : ""}
                  </span>
                  <p className="text-tertiary mt-1">
                    Find the perfect role that matches your skills and passion
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      className="bg-background rounded-2xl shadow-sm border border-tertiary hover:shadow-md transition-shadow duration-200 overflow-hidden"
                    >
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-tertiary" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-tertiary">
                                Flaunt By Nishi
                              </div>
                            </div>
                          </div>

                          <div className="text-xs bg-background text-tertiary px-2 py-1 rounded-md">
                            Saved
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold text-tertiary mt-4">
                          {job.title}
                        </h3>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs bg-background text-tertiary px-2 py-1 rounded-md">
                            {job.type}
                          </span>
                          <span className="text-xs bg-background text-tertiary px-2 py-1 rounded-md">
                            {job.experience}
                          </span>
                        </div>

                        <p className="text-sm text-tertiary mt-4 line-clamp-2 flex-1">
                          {job.description}
                        </p>

                        <div className="mt-6 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-tertiary">
                              {job.salary || "$100/hr"}
                            </div>
                            <div className="text-xs text-tertiary">
                              {job.location}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <a
                              href={job.googleFormLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-tertiary text-white rounded-md text-sm font-medium hover:bg-tertiary/90 transition-colors"
                            >
                              Apply now
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
    </div>
  );
};

export default CareersPage;
