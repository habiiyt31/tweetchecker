# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
import json
from genlayer import *


class TweetChecker(gl.Contract):
    """
    Tweet Authenticity Checker -- Intelligent Contract on GenLayer.

    Pragmatic detection rules:
    - Verified Business accounts are presumed LEGIT (only flagged if hard
      scam content like send-to-receive)
    - Other accounts: balanced engagement + content + behavioral analysis
    - Hard scams (giveaway, send-X-get-Y, impersonation) always SCAM
    """

    results: TreeMap[str, str]

    def __init__(self):
        pass

    @gl.public.write
    def analyze(self, tweet_url: str, api_data: str) -> None:

        def evaluate() -> str:
            prompt = f"""
You are a Twitter/X scam detector. Be PRACTICAL, not paranoid.

Most tweets are not scams. Your job is to catch ACTUAL scams (phishing,
send-to-receive, impersonation, giveaway-bait), not penalize legitimate
projects for having promotional content or imperfect engagement ratios.

===================================
TWEET URL: {tweet_url}
===================================
DATA (from twitterapi.io):
{api_data}
===================================

STEP 1: CHECK FOR HARD SCAM CONTENT (instant SCAM)

Read the tweet text. If ANY of these are present, immediately return
verdict=SCAM with score 10-30:

- "Send X get Y back" pattern (send 1 ETH receive 2 ETH)
- Fake giveaway requiring follow/RT/comment to win crypto
- Phishing links to fake versions of known sites
- Impersonation of real people/projects (using their name in handle)
- "Connect wallet to claim" patterns
- Investment promises with guaranteed returns
- Pump signals targeting unknown low-cap tokens with urgency

If NO hard scam content -> continue to STEP 2.

STEP 2: CATEGORIZE THE ACCOUNT

- "VERIFIED_BUSINESS" = isBlueVerified=true AND verifiedType="Business"
- "VERIFIED" = isBlueVerified=true (any other verifiedType or null)
- "ESTABLISHED" = followers >= 1,000 (no verification)
- "SMALL" = followers < 1,000
- "NEW" = account < 30 days old (overrides above)

VERIFIED_BUSINESS accounts are presumed legitimate companies that paid
for and went through verification. They get a strong LEGIT bias unless
they post hard scam content.

STEP 3: CALCULATE ENGAGEMENT RATIOS

  like_rate     = (likeCount / viewCount) * 100
  retweet_rate  = (retweetCount / viewCount) * 100
  reply_rate    = (replyCount / viewCount) * 100
  rt_to_like    = retweetCount / max(likeCount, 1)

Show these calculated values in the output.

STEP 4: APPLY PENALTIES (start at 100)

VERIFIED_BUSINESS account rules:
- Only penalize for: rt_to_like > 2.0, like_rate > 30%, hard scam content
- DO NOT penalize for: low engagement, promotional feed, follower count vs views ratio
- Default expected score: 85-95 (LEGIT)

VERIFIED account rules:
- Penalize for: rt_to_like > 1.5 (-30), like_rate > 25% (-30)
- Mild penalties for: all-promo feed (-5), small concerns
- Default expected score: 75-90

ESTABLISHED account rules:
- Penalize for: rt_to_like > 1.2 (-25), like_rate > 20% (-25)
- All-promo feed: -10
- Following >> Followers (10x): -15
- Default expected score: 65-85

SMALL account rules:
- Penalize for: rt_to_like > 1.0 (-20), like_rate > 15% (-20)
- All-promo feed promoting crypto: -15
- Default expected score: 70-90

NEW account (< 30 days):
- Base penalty: -25
- If promoting crypto/giveaway/finance: extra -25
- Default expected score: 40-60

UNIVERSAL HARD PENALTIES (apply to all categories):
- Soft scam content (urgency manipulation, exaggerated claims): -15
- Suspicious shortened links to unknown domains: -20
- isAutomated = true: -30

STEP 5: VERDICT THRESHOLDS (REVISED)

- Score >= 55 -> LEGIT
- Score 30-54 -> SUSPICIOUS
- Score < 30  -> SCAM

These thresholds are intentionally LENIENT because false positives on
real projects damage the tool's credibility more than missing borderline
cases. When in doubt, lean LEGIT.

STEP 6: OUTPUT

Return ONLY this exact JSON -- no markdown, no code fences:
{{
  "verdict": "SCAM | SUSPICIOUS | LEGIT",
  "score": <calculated score>,
  "summary": "<one sentence stating verdict reason>",
  "explanation": {{
    "account_age": "<details + category>",
    "follower_ratio": "<X followers, Y following, interpretation>",
    "engagement_ratios": "<like_rate: X% | retweet_rate: Y% | rt_to_like: Z (healthy?)>",
    "historical_context": "<this tweet vs account history>",
    "content": "<scam signals or 'no scam patterns detected'>"
  }},
  "signals": {{
    "account": "red | yellow | green",
    "followers": "red | yellow | green",
    "engagement": "red | yellow | green",
    "history": "red | yellow | green",
    "content": "red | yellow | green"
  }},
  "red_flags": ["<concrete flag>", "<another>"]
}}

CRITICAL REMINDERS:
- VERIFIED_BUSINESS accounts almost always get LEGIT unless content is scammy
- Promotional content alone is NOT a scam signal
- Low engagement-per-follower ratio is NOT a scam signal alone
- Pay-to-play models, contests, giveaways from VERIFIED projects = LEGIT
- Real scams have CONCRETE patterns: phishing, send-to-receive, impersonation
"""
            response = gl.nondet.exec_prompt(prompt)
            response = response.strip()
            if response.startswith("```"):
                response = response.split("\n", 1)[-1]
            if response.endswith("```"):
                response = response.rsplit("```", 1)[0]
            return response.strip()

        verdict = gl.eq_principle.prompt_comparative(
            evaluate,
            principle=(
                "Both outputs should agree on the SCAM verdict (yes or no). "
                "LEGIT and SUSPICIOUS verdicts are compatible (both = not confirmed scam). "
                "Only SCAM must match strictly. "
                "Score should be within 30 points."
            ),
        )

        self.results[tweet_url] = verdict

    @gl.public.view
    def get_result(self, tweet_url: str) -> str:
        return self.results.get(tweet_url, "Not analyzed yet")

    @gl.public.view
    def get_all_results(self) -> dict[str, str]:
        return {k: v for k, v in self.results.items()}

    @gl.public.view
    def has_result(self, tweet_url: str) -> bool:
        return tweet_url in self.results