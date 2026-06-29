import { useState } from 'react'

const verdictStyles = {
  strong: { bar: 'bg-[#16C79A]', text: 'text-[#16C79A]', label: 'Strong fit' },
  maybe: { bar: 'bg-[#F2A340]', text: 'text-[#F2A340]', label: 'Worth a look' },
  weak: { bar: 'bg-[#E0556B]', text: 'text-[#E0556B]', label: 'Weak fit' },
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

  const verdict = result ? verdictStyles[result.recommendation] || verdictStyles.maybe : null

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B93A7] mb-2">
            Candidate screening
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">AI Resume Screener</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-2 text-[#8B93A7]">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              className="w-full bg-[#11151E] border border-[#1F2530] rounded-md p-4 text-sm leading-relaxed text-slate-200 placeholder:text-[#5C6478] focus:outline-none focus:border-[#F2A340]/60 transition-colors"
              placeholder="Paste the job description here..."
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-2 text-[#8B93A7]">
              Candidate Resume
            </label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              rows={12}
              className="w-full bg-[#11151E] border border-[#1F2530] rounded-md p-4 text-sm leading-relaxed text-slate-200 placeholder:text-[#5C6478] focus:outline-none focus:border-[#F2A340]/60 transition-colors"
              placeholder="Paste the candidate's resume here..."
            />
          </div>
        </div>

        <button
          onClick={handleScreen}
          disabled={loading || !jobDescription || !resume}
          className="mt-6 bg-[#F2A340] hover:bg-[#F5B461] disabled:bg-[#1F2530] disabled:text-[#5C6478] disabled:cursor-not-allowed text-[#0B0E14] font-medium px-6 py-3 rounded-md transition-colors"
        >
          {loading ? 'Screening...' : 'Screen Candidate'}
        </button>

        {error && (
          <div className="mt-6 border-l-2 border-[#E0556B] bg-[#1A1014] text-[#E0556B] rounded-r-md p-4 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-10 space-y-6">
            {/* Verdict strip */}
            <div className={`flex border-l-4 ${verdict.bar} bg-[#11151E] rounded-r-md overflow-hidden`}>
              <div className="px-6 py-6">
                <div className="font-mono text-6xl font-light leading-none text-white">
                  {result.score}
                </div>
                <div className="font-mono text-[10px] text-[#5C6478] mt-1 tracking-wider">
                  / 100
                </div>
              </div>
              <div className="border-l border-[#1F2530] px-6 py-6 flex-1">
                <span className={`font-mono text-xs uppercase tracking-wider ${verdict.text}`}>
                  {verdict.label}
                </span>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Matches + gaps */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#11151E] border border-[#1F2530] rounded-md p-5">
                <h3 className="font-mono text-xs text-[#16C79A] mb-4 uppercase tracking-wider">
                  Matches — {result.matches.length}
                </h3>
                {result.matches.length > 0 ? (
                  <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
                    {result.matches.map((item, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className="text-[#16C79A] font-mono text-xs mt-0.5">＋</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#5C6478]">No matching requirements found.</p>
                )}
              </div>

              <div className="bg-[#11151E] border border-[#1F2530] rounded-md p-5">
                <h3 className="font-mono text-xs text-[#E0556B] mb-4 uppercase tracking-wider">
                  Gaps — {result.gaps.length}
                </h3>
                {result.gaps.length > 0 ? (
                  <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
                    {result.gaps.map((item, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className="text-[#E0556B] font-mono text-xs mt-0.5">－</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#5C6478]">No gaps identified.</p>
                )}
              </div>
            </div>

            {/* Interview questions */}
            <div className="bg-[#11151E] border border-[#1F2530] rounded-md p-5">
              <h3 className="font-mono text-xs text-[#F2A340] mb-4 uppercase tracking-wider">
                Suggested interview questions
              </h3>
              {result.interviewQuestions.length > 0 ? (
                <ol className="space-y-3 text-sm text-slate-300 leading-relaxed">
                  {result.interviewQuestions.map((q, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-mono text-[#5C6478] text-xs mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-[#5C6478]">
                  Not enough information in the resume to suggest interview questions.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App