"kw">import { useState, useEffect } "kw">from 'react';
"kw">import ClaudeService "kw">from '../services/claude.js';
 
"kw">export "kw">function useClaude() {
  "kw">const [loading, setLoading] = useState("bool">false);
  "kw">const [error, setError] = useState("bool">null);
  "kw">const [status, setStatus] = useState({ usingFallback: "bool">false, membershipExhausted: "bool">false });
 
  "kw">const ask = "kw">async (prompt) => {
    setLoading("bool">true);
    setError("bool">null);
    "kw">try {
      "kw">const response = "kw">await ClaudeService.ask(prompt);
      setStatus(ClaudeService.getStatus());
      "kw">return response;
    } "kw">catch (err) {
      setError(err.message);
      console.error('Claude API Error:', err);
      "kw">throw err;
    } finally {
      setLoading("bool">false);
    }
  };
 
  "kw">const resetLimits = () => {
    ClaudeService.resetMembershipStatus();
    setStatus({ usingFallback: "bool">false, membershipExhausted: "bool">false });
  };
 
  "kw">return { 
    ask, 
    loading, 
    error, 
    usingFallback: status.usingFallback,
    membershipExhausted: status.membershipExhausted,
    resetLimits
  };
}
