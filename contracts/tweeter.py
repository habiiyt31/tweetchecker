# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
import json
from genlayer import *


class TweetChecker(gl.Contract):
    """
    Tweet Authenticity Checker -- Intelligent Contract on GenLayer.

    Implementation based on community feedback:
    - Compares engagement metrics WITHIN a single tweet (no history needed)
    - Burak's rules: likes > 70% of views = sus, RT > likes = sus
    - Account-aware: verified business gets LEGIT bias
    - Hard scams (send-to-receive, phishing) always SCAM
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
projects for promotional content or imperfect engagement ratios.

===================================
TWEET URL: {tweet_url}
===================================
DATA (from twitterapi.io -- profile + this specific tweet only):
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

VERIFIED_BUSINESS accounts are presumed legitimate. They get strong LEGIT
bias unless they post hard scam content.

STEP 3: ENGAGEMENT RATIO ANALYSIS (WITHIN THIS TWEET)

Calculate from the tweet's own metrics:
  like_rate    = (likeCount / viewCount) * 100
  rt_rate      = (retweetCount / viewCount) * 100
  reply_rate   = (replyCount / viewCount) * 100
  rt_to_like   = retweetCount / max(likeCount, 1)

CORE DETECTION RULES (apply universally, regardless of account size):

RULE 1: rt_to_like > 1.0 = SUSPICIOUS
   Reason: bots farm retweets, real humans like more than they RT.
   If rt_to_like > 1.5 -> very strong red flag.

RULE 2: like_rate > 50% = SUSPICIOUS
   Reason: impossible to get organic likes from 50%+ of viewers.
   Indicates injected/purchased likes.

RULE 3: like_rate > 70% = SCAM-level
   Reason: clearly fake engagement injection.

RULE 4: views > 10,000 AND reply_rate < 0.005% = SUSPICIOUS
   Reason: paid views from view farms have no real discussion.
   Real virals get replies.

RULE 5: rt_rate > 10% = SUSPICIOUS
   Reason: RT farm activity (bots that mass-retweet).

Show the calculated ratios in the output explicitly.

STEP 4: APPLY PENALTIES (start at 100)

VERIFIED_BUSINESS account rules:
- Only penalize for: rt_to_like > 2.0, like_rate > 50%, hard scam content
- DO NOT penalize for: low engagement, promotional feed
- Default expected score: 85-95 (LEGIT)

VERIFIED account rules:
- rt_to_like > 1.5: -30
- like_rate > 50%: -35
- Default expected score: 75-90

ESTABLISHED account rules:
- rt_to_like > 1.0: -25
- like_rate > 30%: -25
- Following >> Followers (10x): -15
- Default expected score: 65-85

SMALL account rules:
- rt_to_like > 1.0: -20
- like_rate > 25%: -20
- Default expected score: 70-90

NEW account (< 30 days):
- Base penalty: -25
- If promoting crypto/giveaway: extra -25
- Default expected score: 40-60

UNIVERSAL HARD PENALTIES (all categories):
- like_rate > 70%: -45
- views > 10K + reply_rate < 0.005%: -20
- rt_rate > 10%: -25
- Soft scam content (urgency, exaggerated claims): -15
- Suspicious shortened links to unknown domains: -20
- isAutomated = true: -30

STEP 5: VERDICT THRESHOLDS

- Score >= 55 -> LEGIT
- Score 30-54 -> SUSPICIOUS
- Score < 30  -> SCAM

Lean LEGIT when in doubt. False positives on real projects damage trust
more than missing borderline cases.

STEP 6: OUTPUT

Return ONLY this exact JSON -- no markdown, no code fences:
{{
  "verdict": "SCAM | SUSPICIOUS | LEGIT",
  "score": <calculated score>,
  "summary": "<one sentence stating verdict reason>",
  "explanation": {{
    "account_age": "<details + category>",
    "follower_ratio": "<X followers, Y following, interpretation>",
    "engagement_ratios": "<like_rate: X% | rt_rate: Y% | reply_rate: Z% | rt_to_like: W (healthy or suspicious?)>",
    "content": "<scam signals or 'no scam patterns detected'>"
  }},
  "signals": {{
    "account": "red | yellow | green",
    "followers": "red | yellow | green",
    "engagement": "red | yellow | green",
    "content": "red | yellow | green"
  }},
  "red_flags": ["<concrete flag>", "<another>"]
}}

CRITICAL REMINDERS:
- VERIFIED_BUSINESS accounts almost always get LEGIT unless content is scammy
- Promotional content alone is NOT a scam signal
- Pay-to-play models, contests from VERIFIED projects = LEGIT
- Real scams have CONCRETE patterns: phishing, send-to-receive, impersonation
- Engagement RATIOS within the tweet are more reliable than absolute counts
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