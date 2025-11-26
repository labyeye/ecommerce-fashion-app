import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogService, Blog } from '../../services/blogService';
import { Calendar, ArrowRight } from 'lucide-react';

const BlogDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) {
      setError('Invalid blog');
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await blogService.getBlogBySlug(slug);
        setBlog(data);
      } catch (err) {
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF2E1' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF2E1' }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Article not found'}</p>
          <button onClick={() => navigate('/blogs')} className="px-4 py-2 bg-[#95522C] text-white rounded">Back to blogs</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF2E1' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="overflow-hidden rounded-lg shadow">
          {blog.featuredImage?.url && (
            <img src={blog.featuredImage.url} alt={blog.featuredImage.alt} className="w-full h-80 object-cover" />
          )}
          <div className="bg-white p-8">
            <div className="text-sm text-gray-500 flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="text-sm text-gray-500">by {blog.author?.name || 'Flaunt By Nishi'}</div>
              <div className="text-sm text-gray-500">{blog.views} views</div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#95522C' }}>{blog.title}</h1>

            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: blog.content }} />

            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-100 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <div />
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-[#95522C] flex items-center gap-2">
                <span>Back to top</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailsPage;
