# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
import json
from genlayer import *


class TweetChecker(gl.Contract):
    """
    Tweet Authenticity Checker -- Intelligent Contract on GenLayer.

    Receives data from twitterapi.io that has already been fetched by the
    frontend, then the GenLayer LLM analyzes every signal and returns a verdict.
    """

    results: TreeMap[str, str]

    def __init__(self):
        pass

    @gl.public.write
    def analyze(self, tweet_url: str, api_data: str) -> None:
        """
        Main analysis function.

        Uses gl.eq_principle.prompt_comparative -- the official GenLayer
        pattern for LLM-based consensus.
        """

        def evaluate() -> str:
            prompt = f"""
You are an expert Twitter/X fraud and scam detection system.

You have been given REAL data fetched from twitterapi.io.
Analyze every signal carefully and provide a detailed verdict
that anyone can understand -- no technical jargon.

===================================
TWEET URL: {tweet_url}
===================================
FULL API DATA (from twitterapi.io):
{api_data}
===================================

Analyze these 5 signals one by one:

--- SIGNAL 1: ACCOUNT SOURCE & AGE ---
- How old is this account? (days/months/years)
- Is it verified? (isBlueVerified field)
- Is the profile complete? (bio, location, website)
- Is it marked as automated? (isAutomated field)
- Red flag: account < 30 days old, no avatar/bio, isAutomated=true

--- SIGNAL 2: FOLLOWERS & FOLLOWING RATIO ---
- Exact follower count and following count
- Calculate ratio: followers / following
- Red flag: following > followers by 10x or more

--- SIGNAL 3: RECENT TWEETS PATTERN ---
- What topics does this account mostly tweet about?
- Red flag: 100% promotional content, all tweets in short timeframe

--- SIGNAL 4: ENGAGEMENT SPIKE DETECTION (MOST IMPORTANT) ---
Step 1: Average viewCount across recent tweets
Step 2: Look at viewCount of THIS specific tweet
Step 3: Compare them
- 10x+  = SUSPICIOUS SPIKE
- 100x+ = CLEAR FAKE ENGAGEMENT
- Always show: "Average: X | This tweet: Y | Ratio: Zx"

--- SIGNAL 5: TWEET CONTENT ---
- Unrealistic returns? Urgency? Suspicious links?
- Impersonation? "Send to receive" scams?

===================================
SCORING:
- Start at 100
- Account < 30 days old      : -25
- Following >> Followers     : -20
- All promo content          : -15
- Engagement spike 10x+      : -25
- Engagement spike 100x+     : -40
- Scam content detected      : -30
- isAutomated = true         : -20
===================================

Return ONLY this exact JSON -- no markdown, no code fences, no other text:
{{
  "verdict": "SCAM | SUSPICIOUS | LEGIT",
  "score": <0-100>,
  "summary": "<one clear sentence>",
  "explanation": {{
    "account_age": "<...>",
    "follower_ratio": "<X followers, Y following. ...>",
    "recent_tweets": "<...>",
    "engagement_spike": "<Average: X | This tweet: Y | Ratio: Zx>",
    "content": "<...>"
  }},
  "signals": {{
    "account_age": "red | yellow | green",
    "follower_ratio": "red | yellow | green",
    "recent_tweets": "red | yellow | green",
    "engagement_spike": "red | yellow | green",
    "content": "red | yellow | green"
  }},
  "red_flags": ["<flag 1>", "<flag 2>"]
}}
"""
            response = gl.nondet.exec_prompt(prompt)
            # Strip markdown fences in case the LLM added them
            response = response.strip()
            if response.startswith("```"):
                response = response.split("\n", 1)[-1]
            if response.endswith("```"):
                response = response.rsplit("```", 1)[0]
            return response.strip()

        verdict = gl.eq_principle.prompt_comparative(
            evaluate,
            principle=(
                "The verdict (SCAM/SUSPICIOUS/LEGIT) must be the same. "
                "The score must be within 15 points. "
                "Signal colors and red_flags should be similar but exact text may differ."
            ),
        )

        self.results[tweet_url] = verdict

    @gl.public.view
    def get_result(self, tweet_url: str) -> str:
        """
        Read the analysis result for a given tweet URL.
        Returns a JSON string with the full verdict.
        Returns 'Not analyzed yet' if not yet analyzed.
        """
        return self.results.get(tweet_url, "Not analyzed yet")

    @gl.public.view
    def get_all_results(self) -> dict[str, str]:
        """
        Read all analyzed tweets and their results.
        """
        return {k: v for k, v in self.results.items()}

    @gl.public.view
    def has_result(self, tweet_url: str) -> bool:
        """
        Check whether a tweet URL has already been analyzed.
        """
        return tweet_url in self.results