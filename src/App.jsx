import { useState } from 'react'

const recommendationStyles = {
  strong: 'bg-emerald-950 border-emerald-700 text-emerald-300',
  maybe: 'bg-amber-950 border-amber-700 text-amber-300',
  weak: 'bg-red-950 border-red-700 text-red-300',
}

function App() {
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleScreen = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:3001/api/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, resume }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Something went wrong.')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Could not reach the server. Make sure the backend is running.'
          : err.message || 'Failed to screen candidate. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI Resume Screener</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Paste the job description here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Candidate Resume
            </label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              rows={12}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Paste the candidate's resume here..."
            />
          </div>
        </div>

        <button
          onClick={handleScreen}
          disabled={loading || !jobDescription || !resume}
          className="mt-6 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-900 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {loading ? 'Screening...' : 'Screen Candidate'}
        </button>

        {error && (
          <div className="mt-6 bg-red-950 border border-red-800 text-red-300 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            {/* Score + recommendation */}
            <div className="flex items-center gap-6 bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-5xl font-bold text-amber-400">{result.score}</div>
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full border text-sm font-medium uppercase tracking-wide ${
                    recommendationStyles[result.recommendation] || 'bg-slate-700 border-slate-600 text-slate-300'
                  }`}
                >
                  {result.recommendation}
                </span>
                <p className="mt-2 text-slate-300 text-sm">{result.summary}</p>
              </div>
            </div>

            {/* Matches + gaps side by side */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wide">
                  Matches
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {result.matches.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wide">
                  Gaps
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {result.gaps.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-red-400">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interview questions */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wide">
                Suggested Interview Questions
              </h3>
              <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
                {result.interviewQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App