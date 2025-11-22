import React, { useState } from "react";

const NewsletterPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/newsletters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subject, bannerUrl, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(`Sent to ${data.data.recipientsCount} recipients`);
      } else {
        setResult(data.message || "Error sending newsletter");
      }
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : String(err);
      setResult(text || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset: React.MouseEventHandler<HTMLButtonElement> = () => {
    setTitle("");
    setSubject("");
    setBannerUrl("");
    setMessage("");
    setResult(null);
  };

  const handleTitleChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setTitle(e.target.value);
  const handleSubjectChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setSubject(e.target.value);
  const handleBannerChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setBannerUrl(e.target.value);
  const handleMessageChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => setMessage(e.target.value);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Send Newsletter</h1>
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label
            htmlFor="newsletter-title"
            className="block text-sm font-medium"
          >
            Title
          </label>
          <input
            id="newsletter-title"
            value={title}
            onChange={handleTitleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label
            htmlFor="newsletter-subject"
            className="block text-sm font-medium"
          >
            Subject
          </label>
          <input
            id="newsletter-subject"
            value={subject}
            onChange={handleSubjectChange}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label
            htmlFor="newsletter-banner"
            className="block text-sm font-medium"
          >
            Banner URL (optional)
          </label>
          <input
            id="newsletter-banner"
            value={bannerUrl}
            onChange={handleBannerChange}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label
            htmlFor="newsletter-message"
            className="block text-sm font-medium"
          >
            Message (HTML allowed)
          </label>
          <textarea
            id="newsletter-message"
            value={message}
            onChange={handleMessageChange}
            rows={8}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {loading ? "Sending..." : "Send to all customers"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border rounded"
          >
            Reset
          </button>
        </div>
        {result && <div className="mt-2 text-sm">{result}</div>}
      </form>
    </div>
  );
};

export default NewsletterPage;
