const questions = [
  // ─── MEMBER TIER (1-50) ─── Foundational business readiness ───────────────
  {
    id: 1,
    tier: 'member',
    text: 'What specific problem does your business solve, and can you prove that problem exists?',
    example: 'A restaurant owner notices that delivery apps take 30% commission. Their business solves high commission fees — but can they prove the size of that market and the pain restaurants actually feel?'
  },
  {
    id: 2,
    tier: 'member',
    text: 'Who is your ideal customer, and have you had a real conversation with at least 10 of them?',
    example: 'You think your customer is a 35-year-old working mom. But have you actually sat down with 10 of them and asked what keeps them up at night?'
  },
  {
    id: 3,
    tier: 'member',
    text: 'What is your unique value proposition — what do you offer that no one else does?',
    example: 'Two coffee shops sit side by side. One says "great coffee." The other says "coffee roasted within 48 hours, guaranteed or free." Which one has a real value proposition?'
  },
  {
    id: 4,
    tier: 'member',
    text: 'How does your business make money, and have you tested whether people will actually pay for it?',
    example: 'A fitness app has 10,000 free users but has never asked anyone for a credit card. Enthusiasm is not revenue — have you validated willingness to pay?'
  },
  {
    id: 5,
    tier: 'member',
    text: 'What does your competitive landscape look like, and why will customers choose you over existing options?',
    example: 'If you are opening a barbershop, you are not competing with one other shop — you are competing with every established relationship a customer already has. Why would they switch to you?'
  },
  {
    id: 6,
    tier: 'member',
    text: 'Do you know your total addressable market (TAM), and is it large enough to build a sustainable business?',
    example: 'A bespoke hat-maker in a city of 50,000 people. The TAM might only be 200 customers a year. Is that enough to pay yourself a living wage?'
  },
  {
    id: 7,
    tier: 'member',
    text: 'What are your startup costs, and do you have enough capital to reach profitability without running out of money?',
    example: 'A food truck owner budgets $40,000 for the truck but forgets licensing, commissary fees, insurance, and initial inventory. Real startup costs are often 2–3x the initial estimate.'
  },
  {
    id: 8,
    tier: 'member',
    text: 'What does your revenue model look like for the first 12 months — month by month?',
    example: 'If you need $5,000/month to break even and you are starting from zero customers, how many months will it take to reach that number? Have you mapped it out honestly?'
  },
  {
    id: 9,
    tier: 'member',
    text: 'Have you validated your pricing, and do customers agree your price reflects the value you provide?',
    example: 'A consultant charges $500/hour because they think they are worth it. But have three clients already paid that rate without negotiating? Price is only real when someone pays it.'
  },
  {
    id: 10,
    tier: 'member',
    text: 'What does your go-to-market strategy look like — how will you get your first 100 customers?',
    example: 'Saying "I will use social media" is not a strategy. How many posts per week, on which platform, targeting which audience, with what call to action, and what is your conversion rate expectation?'
  },
  {
    id: 11,
    tier: 'member',
    text: 'Do you have a legal business structure in place, and have you consulted an attorney or CPA?',
    example: 'An LLC vs. an S-Corp has very different tax implications. Are you operating as a sole proprietor unknowingly? Have you talked to a professional, or just Googled it?'
  },
  {
    id: 12,
    tier: 'member',
    text: 'Have you protected your intellectual property — name, logo, process, or product?',
    example: 'You spend two years building a brand name, then discover someone in another state already has that trademark. A $300 trademark search could have saved everything.'
  },
  {
    id: 13,
    tier: 'member',
    text: 'Do you understand your cost of goods sold (COGS), and are your margins healthy enough to sustain the business?',
    example: 'A clothing brand charges $80 for a shirt that costs $60 to produce and ship. After marketing, returns, and overhead, they are losing money on every sale.'
  },
  {
    id: 14,
    tier: 'member',
    text: 'What does your customer acquisition strategy look like beyond word of mouth?',
    example: 'Word of mouth is great at the start, but it is not predictable or scalable. What happens when referrals slow down — do you have a paid or earned media strategy?'
  },
  {
    id: 15,
    tier: 'member',
    text: 'What does your brand identity communicate, and does it resonate with your target customer?',
    example: 'A luxury skincare brand uses Comic Sans and stock photos. The product may be excellent, but the branding destroys trust before the customer ever reads a word.'
  },
  {
    id: 16,
    tier: 'member',
    text: 'Have you mapped out your fulfillment or service delivery process, and can it handle volume without breaking?',
    example: 'An online store gets featured in a major newsletter and receives 500 orders overnight — but they can only process 20 a day. Systems failures can sink a business at the moment of opportunity.'
  },
  {
    id: 17,
    tier: 'member',
    text: 'Do you have any recurring revenue, and if not, how are you planning to create it?',
    example: 'A one-time sale business is always starting from zero. A subscription, retainer, or membership model creates predictable cash flow. Have you explored this for your business?'
  },
  {
    id: 18,
    tier: 'member',
    text: 'What does your personal financial runway look like — how long can you sustain yourself without drawing a salary?',
    example: 'An entrepreneur with $10,000 in savings, $3,000/month in personal expenses, and zero revenue has a 3-month runway. Is that enough to build a viable business?'
  },
  {
    id: 19,
    tier: 'member',
    text: 'Have you identified your three biggest risks, and what is your mitigation plan for each?',
    example: 'A retail business has three risks: supply chain disruption, a key employee leaving, and a major competitor moving in nearby. Have you thought through each scenario?'
  },
  {
    id: 20,
    tier: 'member',
    text: 'Do you have a customer retention strategy, or are you focused only on new customer acquisition?',
    example: 'Acquiring a new customer costs 5–7x more than retaining an existing one. If you have no loyalty program, follow-up process, or re-engagement strategy, you are pouring water into a leaky bucket.'
  },
  {
    id: 21,
    tier: 'member',
    text: 'What metrics are you tracking weekly, and do those metrics actually tell you if your business is healthy?',
    example: 'A business owner tracks social media followers and website visitors but not revenue, churn rate, or profit. Vanity metrics feel good but do not pay rent.'
  },
  {
    id: 22,
    tier: 'member',
    text: 'Have you clearly defined the roles and responsibilities in your business, even if you are a solo founder?',
    example: 'A solo founder wearing 12 hats is normal early on — but do you have a documented org chart with clear ownership for sales, operations, marketing, and finance? Even if all boxes point to you?'
  },
  {
    id: 23,
    tier: 'member',
    text: 'What does your customer experience look like from first touch to repeat purchase — have you mapped the full journey?',
    example: 'A potential customer sees your ad, clicks, lands on a slow website, finds confusing checkout, receives late shipping, and gets no follow-up email. Where does the experience break down?'
  },
  {
    id: 24,
    tier: 'member',
    text: 'Do you have written contracts or agreements in place for your key business relationships?',
    example: 'A service provider does $20,000 of work on a handshake deal. The client disputes the scope. Without a contract, the service provider has no legal ground to stand on.'
  },
  {
    id: 25,
    tier: 'member',
    text: 'What is your plan if your top supplier, partner, or platform disappears overnight?',
    example: 'An Amazon FBA seller has no backup plan when Amazon suspends their account for a policy violation. Single points of failure can end businesses instantly.'
  },
  {
    id: 26,
    tier: 'member',
    text: 'How are you separating personal finances from business finances, and are you keeping clean books?',
    example: 'Mixing personal and business accounts is one of the most common mistakes small business owners make. It creates tax nightmares and makes it impossible to know if the business is actually profitable.'
  },
  {
    id: 27,
    tier: 'member',
    text: 'Have you stress-tested your business model — what happens if revenue drops 30% for three months?',
    example: 'A restaurant owner who runs with razor-thin margins has no cushion for a slow season, a health inspection closure, or a construction project blocking foot traffic.'
  },
  {
    id: 28,
    tier: 'member',
    text: 'Do you have business insurance, and do you understand what it does and does not cover?',
    example: 'A photographer assumes their homeowner\'s insurance covers their equipment at a client shoot. It does not. One stolen camera bag could result in a $5,000 out-of-pocket loss.'
  },
  {
    id: 29,
    tier: 'member',
    text: 'What is your elevator pitch, and can you deliver it clearly in 60 seconds or less?',
    example: 'You step into an elevator with a potential investor. In 60 seconds, can you explain what you do, who you serve, how you make money, and why you will win? If not, your thinking is still fuzzy.'
  },
  {
    id: 30,
    tier: 'member',
    text: 'Have you identified your direct and indirect competitors, and do you understand their strengths?',
    example: 'A meal-prep service considers other meal-prep companies as competitors — but fails to account for grocery stores, restaurants, and meal kits. True competitive analysis includes all alternatives.'
  },
  {
    id: 31,
    tier: 'member',
    text: 'Do you have a clear 90-day action plan, and are you executing it consistently?',
    example: 'Most entrepreneurs have a 5-year vision but no 90-day execution plan. A clear 90-day plan with weekly milestones is the bridge between dreaming and doing.'
  },
  {
    id: 32,
    tier: 'member',
    text: 'What does your customer feedback process look like — are you systematically collecting and acting on it?',
    example: 'A software company has a feedback form on their website that no one monitors. Customers are frustrated but silent — until they leave a public one-star review.'
  },
  {
    id: 33,
    tier: 'member',
    text: 'Have you tested your product or service with a real, paying customer before investing heavily in it?',
    example: 'An entrepreneur spends $50,000 building a mobile app before asking a single potential user to pay for it. An MVP could have validated the idea for $500 and saved the rest.'
  },
  {
    id: 34,
    tier: 'member',
    text: 'What does your hiring plan look like, and do you know what skills you need most in your first hire?',
    example: 'A founder who is great at product but terrible at sales might hire a second engineer instead of a sales rep. The wrong first hire can stall growth for a full year.'
  },
  {
    id: 35,
    tier: 'member',
    text: 'Do you know the difference between cash flow and profit, and are you managing both?',
    example: 'A profitable business on paper can still go bankrupt if it runs out of cash. If your clients pay net-60 but your suppliers require payment in 15 days, you have a cash flow crisis waiting to happen.'
  },
  {
    id: 36,
    tier: 'member',
    text: 'What is your refund and dispute resolution policy, and have you communicated it clearly to customers?',
    example: 'A coaching program charges $2,000 upfront with no refund policy posted. When a client demands a refund, the dispute becomes a chargeback nightmare and a reputational hit.'
  },
  {
    id: 37,
    tier: 'member',
    text: 'What technology tools are you using to run your business, and are they scalable as you grow?',
    example: 'Running your business from Gmail, Excel, and sticky notes works for 10 clients. At 100 clients, it collapses. Are you building on a foundation that scales?'
  },
  {
    id: 38,
    tier: 'member',
    text: 'Have you defined what success looks like for your business in year 1, year 3, and year 5?',
    example: 'Without a definition of success, every milestone feels inadequate or arbitrary. Is success $1M revenue? 10 employees? Buying out a competitor? Being acquired? Define it.'
  },
  {
    id: 39,
    tier: 'member',
    text: 'What is your social media strategy, and does it generate real business results or just activity?',
    example: 'A business posts daily and has 5,000 followers but has never converted a single follower into a paying customer. Activity is not the same as strategy.'
  },
  {
    id: 40,
    tier: 'member',
    text: 'Do you have a mentorship or advisory network that challenges your assumptions and provides honest feedback?',
    example: 'Entrepreneurs who only talk to supportive friends and family get a warped picture of reality. A mentor who has built and sold a business will ask harder questions than your mom.'
  },
  {
    id: 41,
    tier: 'member',
    text: 'Have you thought about what happens to your business if you become ill or incapacitated for 90 days?',
    example: 'A sole proprietor who is also the only salesperson, service provider, and bookkeeper has a business that stops the moment they stop. What is your continuity plan?'
  },
  {
    id: 42,
    tier: 'member',
    text: 'Do you have a defined sales process, and does your team know how to execute it consistently?',
    example: 'One salesperson closes 40% of leads while another closes 5%. The difference is rarely talent — it is usually process. Have you documented and trained on your sales process?'
  },
  {
    id: 43,
    tier: 'member',
    text: 'What does your online presence look like, and does it instill trust and credibility in a first-time visitor?',
    example: 'A potential client Googles your business and finds an outdated website, no reviews, and a Facebook page last updated in 2021. Trust is lost before they even contact you.'
  },
  {
    id: 44,
    tier: 'member',
    text: 'Have you clearly defined your geographic market, and does that market have enough demand to sustain your business?',
    example: 'A boutique bakery in a small town of 3,000 people may not have enough foot traffic to sustain a brick-and-mortar. Have you done the math on local demand?'
  },
  {
    id: 45,
    tier: 'member',
    text: 'What does your onboarding process look like for new customers, and does it set them up for success?',
    example: 'A SaaS company loses 60% of new users in the first 14 days because they have no structured onboarding. A great product with a poor onboarding experience looks like a bad product.'
  },
  {
    id: 46,
    tier: 'member',
    text: 'Are you building systems and processes, or are you the system?',
    example: 'If every decision, every client call, every deliverable flows through you personally, you have not built a business — you have built a job. What would happen if you took two weeks off?'
  },
  {
    id: 47,
    tier: 'member',
    text: 'Do you know your top 3 sources of revenue, and are you investing in growing them?',
    example: 'Many business owners are surprised when they analyze the data to find that 80% of their revenue comes from just 20% of their products or clients. Do you know yours?'
  },
  {
    id: 48,
    tier: 'member',
    text: 'Have you thought through your exit strategy — how and when do you plan to leave this business?',
    example: 'Whether you plan to pass the business to your children, sell it, or wind it down, the decisions you make today should align with that goal. Have you defined the end?'
  },
  {
    id: 49,
    tier: 'member',
    text: 'What is your plan for handling negative reviews or a PR crisis?',
    example: 'A restaurant gets a viral negative review on Yelp. The owner responds with insults. Two months later, revenue is down 40%. Have you thought through a crisis communication plan?'
  },
  {
    id: 50,
    tier: 'member',
    text: 'Are you genuinely passionate about this business, or are you chasing money without caring about the mission?',
    example: 'Passion alone does not build a business — but founders who only chase money hit a wall the moment it gets hard. The entrepreneurs who last through adversity typically believe deeply in what they are building.'
  },

  // ─── PRO TIER (51-75) ─── Unit economics, scaling, investor readiness ──────
  {
    id: 51,
    tier: 'pro',
    text: 'What is your Customer Acquisition Cost (CAC), and how has it trended over the last 6 months?',
    example: 'You spend $10,000/month on marketing and acquire 50 new customers — that is $200 CAC. If CAC was $100 six months ago, that is a red flag. What is driving the increase?'
  },
  {
    id: 52,
    tier: 'pro',
    text: 'What is your Customer Lifetime Value (LTV), and what is your LTV:CAC ratio?',
    example: 'If your LTV is $800 and your CAC is $200, your LTV:CAC ratio is 4:1 — considered healthy. Below 3:1 means you may be losing money over the customer relationship lifecycle.'
  },
  {
    id: 53,
    tier: 'pro',
    text: 'What is your monthly burn rate, and how many months of runway do you have?',
    example: 'A startup with $300,000 in the bank and $50,000/month in expenses has 6 months of runway. At what point do you need to raise, become profitable, or cut costs?'
  },
  {
    id: 54,
    tier: 'pro',
    text: 'Have you built a 3-year financial model with revenue assumptions, cost drivers, and scenario analysis?',
    example: 'A 3-year model is not about being right — it is about forcing you to think through assumptions. If 20% of your assumed customers do not convert, what happens to the business?'
  },
  {
    id: 55,
    tier: 'pro',
    text: 'What is your gross margin, and how does it compare to industry benchmarks?',
    example: 'A SaaS company with 80% gross margins and a manufacturing company with 25% gross margins require entirely different business models to be sustainable. Where do you sit relative to your industry?'
  },
  {
    id: 56,
    tier: 'pro',
    text: 'What is your monthly recurring revenue (MRR) or annual recurring revenue (ARR), and what is the growth rate?',
    example: 'An investor does not just want to see $50,000 MRR — they want to see the month-over-month growth rate. 10% MoM growth means doubling roughly every 7 months. What is your growth rate?'
  },
  {
    id: 57,
    tier: 'pro',
    text: 'What is your churn rate, and do you understand why customers are leaving?',
    example: 'A subscription business with 5% monthly churn loses over 46% of its customers in a year. Even with strong acquisition, high churn means you are filling a leaky bucket. Do you exit-survey churned customers?'
  },
  {
    id: 58,
    tier: 'pro',
    text: 'What are your unit economics at each stage — acquisition, conversion, fulfillment, and support?',
    example: 'Knowing overall profitability is not enough. Do you know the cost of each unit of value delivered? A courier company should know cost per delivery, not just annual profit.'
  },
  {
    id: 59,
    tier: 'pro',
    text: 'Have you identified your North Star Metric — the single metric that best reflects your core value creation?',
    example: 'For Airbnb, it is nights booked. For Spotify, it is time listening. For your business, what is the one metric that, if it grows, nearly everything else follows?'
  },
  {
    id: 60,
    tier: 'pro',
    text: 'Do you have product-market fit — can you articulate it with data, not just intuition?',
    example: 'Sean Ellis\'s test: survey your customers and ask how they would feel if they could no longer use your product. If 40%+ say "very disappointed," you likely have product-market fit. What does your data say?'
  },
  {
    id: 61,
    tier: 'pro',
    text: 'What is your payback period on customer acquisition, and does it align with your cash flow cycle?',
    example: 'If it costs $300 to acquire a customer and they pay you $50/month, your payback period is 6 months. If you are cash-strapped, a 6-month payback period can create serious liquidity problems.'
  },
  {
    id: 62,
    tier: 'pro',
    text: 'Have you mapped your revenue concentration risk — does one client represent more than 20% of your revenue?',
    example: 'A marketing agency where one client represents 60% of revenue is extremely fragile. When that client leaves — and at some point, they will — the business is in immediate crisis.'
  },
  {
    id: 63,
    tier: 'pro',
    text: 'What is your sales conversion rate at each stage of your funnel, and where are you losing the most prospects?',
    example: '1,000 website visitors → 100 free trials → 10 paid subscriptions is a 1% end-to-end conversion rate. Where in that funnel is the biggest drop, and what are you doing to improve it?'
  },
  {
    id: 64,
    tier: 'pro',
    text: 'Are you investor-ready — do you have a pitch deck, data room, and cap table that would survive due diligence?',
    example: 'Investors will scrutinize every number in your model, every customer contract, and every employment agreement. Are your records clean enough to survive that level of scrutiny?'
  },
  {
    id: 65,
    tier: 'pro',
    text: 'What are your top three operational bottlenecks, and what is your plan to eliminate them?',
    example: 'A growing e-commerce brand discovers that order fulfillment is their bottleneck — they can take orders faster than they can ship. Identifying and eliminating constraints is a core leadership responsibility.'
  },
  {
    id: 66,
    tier: 'pro',
    text: 'Do you have a documented playbook for sales, operations, and customer success that anyone could follow?',
    example: 'If your head of sales left tomorrow and you had to hire a replacement, could that replacement follow a documented playbook and be effective within 30 days? If not, you have a knowledge concentration problem.'
  },
  {
    id: 67,
    tier: 'pro',
    text: 'What does your competitive moat look like — what makes it increasingly difficult for competitors to take your customers?',
    example: 'Network effects, proprietary data, switching costs, brand loyalty, and patents are examples of moats. "We have great customer service" is not a moat. What is yours?'
  },
  {
    id: 68,
    tier: 'pro',
    text: 'Have you stress-tested your pricing model — are you leaving money on the table or pricing yourself out of the market?',
    example: 'A B2B SaaS company charges $99/month for a product that saves enterprise clients $50,000/year. They are massively underpriced. Have you done value-based pricing analysis?'
  },
  {
    id: 69,
    tier: 'pro',
    text: 'What does your talent acquisition and retention strategy look like as you scale past 10 employees?',
    example: 'The things that attract employee #1 (equity, mission, risk) are different from what attract employees #10-50 (salary, stability, career path). Is your employer brand ready for the next stage?'
  },
  {
    id: 70,
    tier: 'pro',
    text: 'What are your top 3 growth levers, and have you run controlled experiments to validate they work?',
    example: 'A company believes referral programs are their top growth lever. But they have never run a structured referral program with proper attribution. Beliefs without experiments are just guesses.'
  },
  {
    id: 71,
    tier: 'pro',
    text: 'Do you have a culture document, and can your employees articulate your company values without prompting?',
    example: 'Culture is not a poster on the wall. It is the decisions made when no one is watching. If your team cannot tell you the top 3 company values right now, you do not have a culture — you have a vibe.'
  },
  {
    id: 72,
    tier: 'pro',
    text: 'What is your plan for international expansion, and have you assessed the legal, tax, and cultural complexity?',
    example: 'A US company decides to expand to Europe without understanding GDPR, VAT requirements, local labor laws, or currency risk. International expansion can create more problems than revenue if done carelessly.'
  },
  {
    id: 73,
    tier: 'pro',
    text: 'What does your data and analytics infrastructure look like — can you make decisions from real-time business data?',
    example: 'A business that looks at last month\'s data to make this month\'s decisions is flying blind. Do you have a dashboard with real-time KPIs that your leadership team reviews daily or weekly?'
  },
  {
    id: 74,
    tier: 'pro',
    text: 'Have you thought through your pricing tiers, and do they create a natural upsell path from new customers to high-value customers?',
    example: 'A SaaS product with a free tier, a $29/month starter, and a $199/month pro plan creates a natural upgrade path. Customers enter at low friction and upgrade as they get more value. Does your pricing funnel exist?'
  },
  {
    id: 75,
    tier: 'pro',
    text: 'What does your succession plan look like for key leadership roles — could the business survive losing its best people?',
    example: 'Many businesses collapse when a co-founder leaves, a star salesperson quits, or a key technical person departs. Have you identified successors and cross-trained critical roles?'
  },

  // ─── BONUS TIER (76-175) ─── Advanced strategy, governance, M&A, exit ──────
  {
    id: 76,
    tier: 'bonus',
    text: 'What is your formal exit strategy, and have you taken concrete steps to make the business attractive to acquirers or investors?',
    example: 'A founder who wants to sell in 5 years should be building clean financials, reducing key-person dependency, and growing recurring revenue today. Is every decision you make today aligned with that exit?'
  },
  {
    id: 77,
    tier: 'bonus',
    text: 'Have you registered all relevant intellectual property — patents, trademarks, and copyrights — in every market you operate in?',
    example: 'A US trademark does not protect your brand in the EU, Canada, or Australia. If your business operates internationally, you need jurisdiction-specific IP protection.'
  },
  {
    id: 78,
    tier: 'bonus',
    text: 'Do you have a formal board of directors or advisory board, and are they providing meaningful strategic oversight?',
    example: 'A board that only rubber-stamps decisions is a liability, not an asset. Does your board include people who challenge your assumptions, open doors, and hold you accountable?'
  },
  {
    id: 79,
    tier: 'bonus',
    text: 'Have you considered an ESOP (Employee Stock Ownership Plan) as a succession or retention strategy?',
    example: 'An ESOP allows a founder to sell a portion of the business to employees with significant tax advantages, while preserving company culture and rewarding long-term employees.'
  },
  {
    id: 80,
    tier: 'bonus',
    text: 'What does your M&A strategy look like — have you identified companies you would consider acquiring to accelerate growth?',
    example: 'A marketing agency could acquire a smaller agency in a new city or vertical rather than building from scratch. Have you mapped the acquisition landscape in your industry?'
  },
  {
    id: 81,
    tier: 'bonus',
    text: 'Do you have a formal due diligence package ready for potential investors or acquirers?',
    example: 'A due diligence package includes audited financials, customer contracts, IP registrations, employee agreements, corporate records, and key operating metrics. Is yours ready today?'
  },
  {
    id: 82,
    tier: 'bonus',
    text: 'What is your governance structure — do you have documented decision rights, authority matrices, and board meeting cadences?',
    example: 'Without a governance structure, major decisions get made ad hoc or avoided entirely. Does your company have documented rules for who can approve what, at what dollar threshold?'
  },
  {
    id: 83,
    tier: 'bonus',
    text: 'Have you explored strategic partnerships or joint ventures as a growth vehicle?',
    example: 'A health food company partners with a gym chain to distribute their product in all gym vending machines. This dramatically expands reach without the cost of building distribution from scratch.'
  },
  {
    id: 84,
    tier: 'bonus',
    text: 'What is your business\'s EBITDA, and how does it compare to industry multiples for valuation purposes?',
    example: 'If your industry typically trades at 5x EBITDA and your EBITDA is $500,000, your baseline valuation is $2.5M. Understanding multiples helps you know whether your current trajectory will hit your financial exit goal.'
  },
  {
    id: 85,
    tier: 'bonus',
    text: 'Have you stress-tested your supply chain for geopolitical risk, and do you have diversified sourcing?',
    example: 'A manufacturer sourcing 100% from one country faces catastrophic risk from tariffs, trade wars, or political instability. Have you diversified your suppliers across multiple geographies?'
  },
  {
    id: 86,
    tier: 'bonus',
    text: 'Do you have a formal revenue recognition policy, and are your financials GAAP or IFRS compliant?',
    example: 'A SaaS company that books annual contracts as revenue upfront may be violating GAAP. Improper revenue recognition can invalidate your financials and expose you to significant legal risk.'
  },
  {
    id: 87,
    tier: 'bonus',
    text: 'What is your plan for managing currency risk if you operate in multiple countries?',
    example: 'A US company with significant European revenue discovered that a 15% USD/EUR movement wiped out their profit margin for the year. Have you considered hedging strategies or natural currency matching?'
  },
  {
    id: 88,
    tier: 'bonus',
    text: 'Have you identified and addressed regulatory risk in your industry — are you monitoring proposed legislation that could impact your business model?',
    example: 'A payday lending startup builds its entire business model on a regulatory loophole. When regulators close the loophole, the business model evaporates. Are you ahead of regulatory trends?'
  },
  {
    id: 89,
    tier: 'bonus',
    text: 'What does your data privacy and cybersecurity posture look like — have you completed a formal security audit?',
    example: 'A healthcare startup collects sensitive patient data with no formal security policies, no penetration testing, and no incident response plan. HIPAA violations can cost $100K–$2M per violation.'
  },
  {
    id: 90,
    tier: 'bonus',
    text: 'Have you explored licensing your intellectual property as a revenue stream?',
    example: 'A software company licenses its core technology to competitors in adjacent markets, generating $500K/year in passive royalty revenue without adding headcount or operational complexity.'
  },
  {
    id: 91,
    tier: 'bonus',
    text: 'What does your debt structure look like — do you understand your covenants and are you at risk of breaching them?',
    example: 'A company with a $2M line of credit has a covenant requiring a minimum current ratio of 1.5. If revenue drops and the ratio falls below 1.5, the bank can call the loan immediately. Do you monitor your covenants?'
  },
  {
    id: 92,
    tier: 'bonus',
    text: 'Have you conducted a formal competitive intelligence exercise in the last 12 months?',
    example: 'Competitive intelligence goes beyond Google. It includes mystery shopping, analyzing job postings, monitoring patents, reviewing earnings calls, and interviewing your competitors\'s churned customers.'
  },
  {
    id: 93,
    tier: 'bonus',
    text: 'What is your Net Revenue Retention (NRR), and does it indicate that your existing customer base is growing or shrinking?',
    example: 'NRR above 100% means your existing customers are spending more this year than last year, even accounting for churn. Elite SaaS companies have NRR of 120–140%. What is yours?'
  },
  {
    id: 94,
    tier: 'bonus',
    text: 'Do you have a formalized OKR or KPI framework that aligns company strategy with team-level execution?',
    example: 'A company\'s annual goal is to reach $5M ARR. Has that goal been broken down into Q1-Q4 OKRs for every team? If the sales team misses Q1, do you have a mechanism to catch it before Q4?'
  },
  {
    id: 95,
    tier: 'bonus',
    text: 'Have you explored government grants, tax credits, or R&D incentives available in your industry or region?',
    example: 'The US R&D tax credit can return $10,000–$250,000 in taxes annually to qualifying businesses. Many companies leave this money on the table simply because they do not know it exists.'
  },
  {
    id: 96,
    tier: 'bonus',
    text: 'What is your earned media strategy — have you built relationships with journalists, podcasters, or influencers in your industry?',
    example: 'A single feature in an industry trade publication or a podcast with 100,000 listeners can generate more qualified leads than three months of paid advertising. Is earned media in your growth strategy?'
  },
  {
    id: 97,
    tier: 'bonus',
    text: 'Do you have a formal vendor management program, and have you negotiated terms that create competitive advantage?',
    example: 'A large retailer negotiates net-90 payment terms with suppliers while offering net-30 terms to customers — creating 60 days of essentially free float. Are you using your scale to negotiate favorable terms?'
  },
  {
    id: 98,
    tier: 'bonus',
    text: 'What does your employer branding look like, and are you consistently attracting A-level talent?',
    example: 'Glassdoor reviews, LinkedIn presence, how your current employees talk about you publicly, and your reputation in the talent market determine the quality of people who apply. What does your employer brand say?'
  },
  {
    id: 99,
    tier: 'bonus',
    text: 'Have you built or considered building a platform business model that creates value from network effects?',
    example: 'Uber, Airbnb, and eBay are platform businesses — they do not own the assets; they connect supply and demand. Could your business evolve to a platform model to dramatically increase scalability?'
  },
  {
    id: 100,
    tier: 'bonus',
    text: 'What is your ESG (Environmental, Social, Governance) strategy, and does it align with your customer and investor expectations?',
    example: 'A consumer goods company targeting Gen Z customers and institutional investors increasingly faces scrutiny on sustainability practices. Is ESG an afterthought or a core part of your value proposition?'
  },
  {
    id: 101,
    tier: 'bonus',
    text: 'Have you documented and protected your trade secrets — processes, formulas, customer lists, and methodologies?',
    example: 'A fast-food chain\'s secret sauce recipe is a trade secret protected by strict internal controls. Without NDAs, access controls, and documentation, your trade secrets are vulnerable the moment an employee leaves.'
  },
  {
    id: 102,
    tier: 'bonus',
    text: 'What is your company\'s weighted average cost of capital (WACC), and do your investments exceed that hurdle rate?',
    example: 'If your WACC is 12% and a proposed expansion project returns 9%, you are destroying shareholder value. Every capital allocation decision should clear the WACC hurdle.'
  },
  {
    id: 103,
    tier: 'bonus',
    text: 'Have you considered vertical integration as a way to reduce costs and improve quality control?',
    example: 'A coffee brand that roasts its own beans rather than buying from a third-party roaster gains control over quality and margin. Has vertical integration been evaluated as a strategic option?'
  },
  {
    id: 104,
    tier: 'bonus',
    text: 'Do you have a formalized product roadmap, and have you validated priorities against customer demand data?',
    example: 'A product team building features based on the loudest customer voice often misallocates resources. Has your product roadmap been validated against quantitative usage data and revenue impact analysis?'
  },
  {
    id: 105,
    tier: 'bonus',
    text: 'What is your strategy for managing activist shareholders or disruptive board members if they emerge?',
    example: 'An activist investor acquires a 15% stake in your company and demands a board seat and major strategic changes. Have you thought through how you would respond to protect the long-term vision?'
  },
  {
    id: 106,
    tier: 'bonus',
    text: 'Have you built a war chest of cash reserves to capitalize on acquisition opportunities during market downturns?',
    example: 'Warren Buffett famously waits for market corrections to deploy capital. Companies with cash reserves can acquire distressed competitors at favorable valuations. Are you positioning for opportunistic acquisitions?'
  },
  {
    id: 107,
    tier: 'bonus',
    text: 'What is your technical debt, and have you allocated resources to systematically reduce it before it becomes a crisis?',
    example: 'A startup that built its product in six months to launch fast may have accrued significant technical debt. When the codebase becomes unmaintainable, growth stalls and key engineers leave.'
  },
  {
    id: 108,
    tier: 'bonus',
    text: 'Have you explored franchising as a growth model, and do you have the systems to support franchisees?',
    example: 'Franchising can accelerate growth dramatically while shifting operational burden to franchisees. But it requires bulletproof operations manuals, training systems, and legal frameworks. Are you there?'
  },
  {
    id: 109,
    tier: 'bonus',
    text: 'What does your content marketing strategy look like, and is it generating compounding returns over time?',
    example: 'A company that publishes high-quality long-form content sees organic search traffic grow 20% annually. Content marketing is one of the few growth channels that compounds — have you invested in it seriously?'
  },
  {
    id: 110,
    tier: 'bonus',
    text: 'Do you have a formal risk register, and are identified risks assigned owners with mitigation deadlines?',
    example: 'A risk register is a living document listing every material business risk, probability, potential impact, mitigation strategy, and responsible owner. Does your leadership team review it quarterly?'
  },
  {
    id: 111,
    tier: 'bonus',
    text: 'Have you evaluated strategic divestiture — are there business units or product lines that dilute focus and should be sold?',
    example: 'A company with 12 product lines discovers that 3 generate 90% of revenue. The other 9 consume 60% of management attention. Strategic divestiture could unlock significant value and focus.'
  },
  {
    id: 112,
    tier: 'bonus',
    text: 'What is your pricing power, and have you tested price increases to understand customer price elasticity?',
    example: 'A SaaS company afraid to raise prices discovers that a 20% price increase results in only 3% churn — a massively positive net effect on revenue. Have you tested your customers\' price sensitivity?'
  },
  {
    id: 113,
    tier: 'bonus',
    text: 'Have you explored white-label partnerships that allow you to generate revenue from your core technology or expertise?',
    example: 'A fintech company white-labels its compliance software to three banks, generating $2M/year in licensing revenue without any additional sales effort from their core team.'
  },
  {
    id: 114,
    tier: 'bonus',
    text: 'What is your company\'s digital transformation roadmap, and are you leveraging AI and automation to reduce costs and improve quality?',
    example: 'A logistics company automates route optimization with AI, cutting fuel costs by 18% and driver overtime by 22%. Are you systematically identifying and automating manual processes?'
  },
  {
    id: 115,
    tier: 'bonus',
    text: 'Do you have a formal process for identifying, recruiting, and closing strategic advisors and board members?',
    example: 'The best board members and advisors are not found on job boards — they are cultivated through relationships. Do you have a formal process to identify, approach, and onboard high-value advisors?'
  },
  {
    id: 116,
    tier: 'bonus',
    text: 'What does your audit and compliance program look like, and are you prepared for a regulatory audit with 48 hours\' notice?',
    example: 'A healthcare company receives a surprise HIPAA audit. They have no compliance officer, no documented policies, and no audit trails. The resulting investigation threatens their operating license.'
  },
  {
    id: 117,
    tier: 'bonus',
    text: 'Have you explored revenue-based financing as an alternative to equity dilution for growth capital?',
    example: 'Revenue-based financing allows companies to borrow against future revenue with no equity dilution. For a profitable company with strong recurring revenue, it can be more cost-effective than raising a venture round.'
  },
  {
    id: 118,
    tier: 'bonus',
    text: 'What is your customer segmentation strategy, and are you pricing and positioning differently for different segments?',
    example: 'A software company charges SMBs $99/month and enterprises $10,000/month for essentially the same product with different support levels. Price segmentation by willingness to pay can dramatically increase revenue.'
  },
  {
    id: 119,
    tier: 'bonus',
    text: 'Have you mapped your critical path dependencies — what are the 3 things that, if they fail, the entire business fails?',
    example: 'A company\'s critical path might be: technology infrastructure stays up, top 2 clients renew, and lead engineer stays employed. What are yours, and what have you done to protect each?'
  },
  {
    id: 120,
    tier: 'bonus',
    text: 'Do you have a formal process for evaluating and piloting new technology vendors before full deployment?',
    example: 'A company deploys a new ERP system company-wide without a pilot, causing 3 weeks of operational chaos. Have you built a structured technology evaluation and pilot process?'
  },
  {
    id: 121,
    tier: 'bonus',
    text: 'What is your gross revenue retention (GRR) and how does it compare to your NRR, and what does the difference tell you?',
    example: 'If your GRR is 85% and NRR is 105%, that means you are losing 15% of customers but the remaining customers are expanding enough to more than compensate. Understanding this gap guides retention strategy.'
  },
  {
    id: 122,
    tier: 'bonus',
    text: 'Have you built a community around your brand, and are your customers advocates who bring in other customers?',
    example: 'Harley-Davidson\'s HOG (Harley Owners Group) is a customer community that reduces churn to near zero and generates referrals organically. Does your business have a community strategy?'
  },
  {
    id: 123,
    tier: 'bonus',
    text: 'What is your strategy for managing the business cycle — how do you position during a recession versus an expansion?',
    example: 'Counter-cyclical businesses (debt collection, discount retail, repair services) thrive in recessions. Cyclical businesses need to reserve capital during expansions to survive contractions. Which is yours?'
  },
  {
    id: 124,
    tier: 'bonus',
    text: 'Have you evaluated whether your capital structure is optimal — is the mix of debt and equity minimizing your cost of capital?',
    example: 'A profitable company using only equity financing may be leaving money on the table. Tax-deductible debt can reduce WACC and increase returns to equity holders. Has your CFO analyzed your optimal capital structure?'
  },
  {
    id: 125,
    tier: 'bonus',
    text: 'What is your strategy for winning in an AI-driven competitive landscape — are you using AI as a differentiator or falling behind?',
    example: 'An insurance company uses AI to underwrite policies 10x faster than competitors with 15% fewer errors. AI is already separating winners from losers in many industries. Where does your business stand?'
  },
  {
    id: 126,
    tier: 'bonus',
    text: 'Have you formally analyzed your company\'s brand equity and its contribution to enterprise value?',
    example: 'Interbrand estimates that brand equity represents 30–50% of many companies\' market capitalization. Have you measured what your brand is worth, and are you actively investing to build it?'
  },
  {
    id: 127,
    tier: 'bonus',
    text: 'Do you have a documented process for managing executive compensation and performance reviews?',
    example: 'Without a formal executive compensation framework, you risk paying too much, retaining underperformers, or losing top talent to competitors who make a better offer. Is your compensation structure intentional?'
  },
  {
    id: 128,
    tier: 'bonus',
    text: 'What does your partnership ecosystem look like — have you mapped the channels and alliances that could accelerate growth?',
    example: 'A cybersecurity startup builds a network of managed service provider (MSP) partners that resell their product. This channel generates 40% of revenue without a direct sales team. Have you mapped your channel potential?'
  },
  {
    id: 129,
    tier: 'bonus',
    text: 'Have you considered a dual-class share structure to preserve founder control while raising growth capital?',
    example: 'Google, Facebook, and Snap used dual-class shares to allow founders to raise billions in public markets while retaining voting control. Is this governance structure relevant to your long-term capital strategy?'
  },
  {
    id: 130,
    tier: 'bonus',
    text: 'What is your employee Net Promoter Score (eNPS), and does it correlate with productivity and retention?',
    example: 'Companies with high eNPS scores see lower voluntary turnover, higher productivity, and better customer NPS scores. When did you last survey your team, and what did you do with the results?'
  },
  {
    id: 131,
    tier: 'bonus',
    text: 'Have you established a formal innovation process for identifying and testing new business opportunities?',
    example: 'Amazon\'s "two-pizza team" model allows small autonomous teams to innovate without bureaucratic interference. Does your company have a structured process for generating and validating new ideas?'
  },
  {
    id: 132,
    tier: 'bonus',
    text: 'What does your environmental compliance picture look like, and have you quantified your carbon footprint?',
    example: 'A manufacturing company discovers that its carbon footprint places it in the top 10% of emitters in its industry. Proactively addressing this now is far less costly than reacting to regulatory mandates later.'
  },
  {
    id: 133,
    tier: 'bonus',
    text: 'Do you have a documented crisis management plan covering scenarios like data breach, executive misconduct, or product failure?',
    example: 'Johnson & Johnson\'s Tylenol recall in 1982 is a textbook crisis management success. A documented plan, clear spokesperson, and rapid response protected the brand. Does your plan exist?'
  },
  {
    id: 134,
    tier: 'bonus',
    text: 'What is your strategy for cross-selling and upselling within your existing customer base?',
    example: 'A company grows revenue 35% in one year without acquiring a single new customer — purely through systematized cross-sells and upsells within the existing base. What is your expansion revenue playbook?'
  },
  {
    id: 135,
    tier: 'bonus',
    text: 'Have you evaluated your company\'s readiness for an IPO, and do you understand the ongoing obligations of being a public company?',
    example: 'Going public means quarterly earnings calls, SEC filings, Sarbanes-Oxley compliance, and intense public scrutiny. The cost of being public can exceed $3M annually. Is it right for your business?'
  },
  {
    id: 136,
    tier: 'bonus',
    text: 'What is your strategy for managing currency exchange risk in your payroll if you hire globally?',
    example: 'A US company that pays 40 engineers in Eastern Europe in USD faces a 12% payroll cost increase when the dollar weakens significantly. Have you explored paying in local currencies or using hedging instruments?'
  },
  {
    id: 137,
    tier: 'bonus',
    text: 'Have you implemented a formal customer health scoring system to identify at-risk accounts before they churn?',
    example: 'A customer success team uses a health score that combines login frequency, feature adoption, support ticket volume, and NPS to flag accounts likely to churn 90 days in advance. Do you have a proactive early warning system?'
  },
  {
    id: 138,
    tier: 'bonus',
    text: 'What is your Ideal Customer Profile (ICP) for enterprise sales, and have you built a target account list?',
    example: 'An enterprise software company defines its ICP as: 500-5,000 employees, healthcare or financial services, existing CRM in place, $100M+ revenue. Every sales dollar is focused on that ICP. Do you have one?'
  },
  {
    id: 139,
    tier: 'bonus',
    text: 'Do you have a documented financial close process, and can you produce accurate financials within 10 business days of month-end?',
    example: 'An investor asks a CEO for last month\'s P&L, and the CEO has to wait three weeks for the accounting team to close the books. This signals poor financial controls and operational maturity.'
  },
  {
    id: 140,
    tier: 'bonus',
    text: 'Have you explored spin-offs or carve-outs as a way to unlock hidden value in your portfolio?',
    example: 'A conglomerate discovers that its software division would command a 10x revenue multiple as a standalone company but is valued at only 2x as part of the larger entity. A carve-out could unlock significant shareholder value.'
  },
  {
    id: 141,
    tier: 'bonus',
    text: 'What is your strategy for building thought leadership in your industry, and are you recognized as an authority?',
    example: 'A consulting firm whose partners speak at 10 industry conferences per year, publish in major trade publications, and maintain high-traffic blogs attract clients who come pre-sold. Is your team building thought leadership?'
  },
  {
    id: 142,
    tier: 'bonus',
    text: 'Have you completed a thorough analysis of your pricing architecture across different product lines, channels, and geographies?',
    example: 'A company charges the same price for its software in New York and in rural India. A dynamic pricing architecture that reflects local purchasing power could dramatically expand the total addressable market.'
  },
  {
    id: 143,
    tier: 'bonus',
    text: 'What is your strategy for winning against a well-funded competitor who enters your market?',
    example: 'Uber entered every city where a taxi monopoly existed. What is your playbook if a Sequoia-backed competitor decides to target your exact market segment with unlimited capital and a lower price?'
  },
  {
    id: 144,
    tier: 'bonus',
    text: 'Have you assessed your company\'s diversity, equity, and inclusion posture, and does it reflect your stated values?',
    example: 'A company with a stated commitment to DEI discovers through a pay audit that women and underrepresented minorities are paid 18% less than their counterparts in equivalent roles. Does your data match your values?'
  },
  {
    id: 145,
    tier: 'bonus',
    text: 'What does your deferred revenue or backlog look like, and is it a leading indicator of future growth?',
    example: 'A company with $3M in backlog and $500K in monthly revenue has 6 months of future revenue already committed. A declining backlog is an early warning sign that demand is softening. Do you track it?'
  },
  {
    id: 146,
    tier: 'bonus',
    text: 'Have you evaluated geographic arbitrage in your operations — are you locating functions where talent is best and costs are lowest?',
    example: 'A US company moves its customer support team to Bogotá, Colombia and its engineering team to Kraków, Poland, cutting fully-loaded costs by 55% while maintaining quality. Have you mapped the cost-quality trade-off globally?'
  },
  {
    id: 147,
    tier: 'bonus',
    text: 'What is your strategy for managing the transition from founder-led sales to a professional sales organization?',
    example: 'Founder-led sales closes deals through relationships and passion. Professional sales teams need repeatable processes, CRM discipline, and quotas. This transition fails more often than it succeeds without intentional planning.'
  },
  {
    id: 148,
    tier: 'bonus',
    text: 'Have you evaluated how your business would perform under different ownership structures — PE-owned, VC-backed, or family-owned?',
    example: 'A PE firm that acquires a business typically demands 20-25% EBITDA margins and an exit in 5-7 years. Is your business and your personal values compatible with PE ownership expectations?'
  },
  {
    id: 149,
    tier: 'bonus',
    text: 'What is your strategy for building a proprietary dataset that creates competitive advantage as AI becomes more important?',
    example: 'A healthcare company that has been collecting patient outcomes data for 15 years has a dataset that cannot be replicated. That proprietary data is becoming their most valuable competitive asset in an AI-driven world.'
  },
  {
    id: 150,
    tier: 'bonus',
    text: 'Have you mapped your regulatory approval pathway and timeline if your product or service requires government authorization?',
    example: 'A medical device startup underestimates the FDA 510(k) clearance process by 18 months and runs out of runway before receiving approval. Regulatory timelines must be part of your financial modeling.'
  },
  {
    id: 151,
    tier: 'bonus',
    text: 'What is your strategy for managing the psychological and personal challenges of entrepreneurship, including isolation, stress, and burnout?',
    example: 'Studies show that entrepreneurs experience depression at rates 50% higher than non-entrepreneurs. Do you have structures in place — therapy, peer communities, co-founders, coaches — to protect your mental health and judgment?'
  },
  {
    id: 152,
    tier: 'bonus',
    text: 'Have you formalized your strategic planning process, and does it produce a written annual plan with clear ownership and accountability?',
    example: 'A company holds an offsite retreat, produces strategic plans, and then puts them in a drawer until the next offsite. Strategy without execution cadence is just a wishlist. How do you make strategy operational?'
  },
  {
    id: 153,
    tier: 'bonus',
    text: 'What is your digital advertising efficiency — are you measuring Return on Ad Spend (ROAS) at the channel, campaign, and ad set level?',
    example: 'A company spending $50,000/month on Facebook ads discovers, after implementing proper attribution, that two specific ad sets generate 80% of conversions. They reallocate budget and cut blended CAC by 40%.'
  },
  {
    id: 154,
    tier: 'bonus',
    text: 'Have you thought through the ethics of your business — are there practices you employ that you would be uncomfortable defending publicly?',
    example: 'A food company markets products with misleading health claims. A journalist investigates and publishes an exposé. The resulting consumer backlash costs $20M in sales. Are your business practices defensible under full transparency?'
  },
  {
    id: 155,
    tier: 'bonus',
    text: 'What is your inventory management strategy, and have you optimized for carrying costs versus stockout risk?',
    example: 'A retailer over-orders inventory to avoid stockouts and ends up with $500,000 in slow-moving merchandise that must be liquidated at a loss. Economic order quantity (EOQ) modeling could prevent this.'
  },
  {
    id: 156,
    tier: 'bonus',
    text: 'Have you developed a second-line leadership team that is capable of running the business without the founder in the room?',
    example: 'A founder takes a 3-week vacation for the first time in 8 years and discovers that without their presence, decisions stall and revenue dips. The business is not ready to scale — or to be sold.'
  },
  {
    id: 157,
    tier: 'bonus',
    text: 'What is your strategy for managing customer data in compliance with global privacy regulations including GDPR, CCPA, and emerging laws?',
    example: 'A startup sends marketing emails to EU residents without proper consent mechanisms and data processing agreements. A single GDPR complaint can initiate an investigation with fines up to 4% of global annual revenue.'
  },
  {
    id: 158,
    tier: 'bonus',
    text: 'Have you considered the tax implications of your growth strategy — including transfer pricing, nexus rules, and international structure?',
    example: 'A US company expands to 15 states without analyzing nexus rules and discovers it owes back sales tax plus penalties in 12 states. A $50,000 tax attorney engagement could have saved $500,000 in penalties.'
  },
  {
    id: 159,
    tier: 'bonus',
    text: 'What is your strategy for building customer intimacy at scale — as you grow, how do you avoid becoming a commodity provider?',
    example: 'Amazon knows what every customer bought, when, how much they paid, and what they might want next. Customer intimacy at scale is not impossible — but it requires intentional data strategy and personalization capabilities.'
  },
  {
    id: 160,
    tier: 'bonus',
    text: 'Have you stress-tested your team\'s ability to execute during a major external disruption — pandemic, recession, or natural disaster?',
    example: 'In March 2020, companies with remote work infrastructure, cloud-based systems, and cross-trained teams adapted in days. Companies without those capabilities took months — and some never recovered. What is your resilience profile?'
  },
  {
    id: 161,
    tier: 'bonus',
    text: 'What is your strategy for managing a multi-generational workforce with different expectations, communication styles, and motivators?',
    example: 'A company with Boomer managers and Gen Z front-line employees discovers a fundamental misalignment on remote work expectations, feedback frequency, and career development. This cultural gap is killing retention.'
  },
  {
    id: 162,
    tier: 'bonus',
    text: 'Have you mapped and optimized your working capital cycle — days sales outstanding, days payable, and inventory turnover?',
    example: 'A manufacturer with DSO of 60 days and DPO of 15 days is effectively financing its customers. By negotiating better payment terms on both sides, they free up $800,000 in working capital without a single new dollar of revenue.'
  },
  {
    id: 163,
    tier: 'bonus',
    text: 'What is your go-to-market strategy for entering a new market segment, and have you validated it before full investment?',
    example: 'A B2B company decides to enter the SMB market but assumes SMBs buy like enterprises. The sales cycle, pricing, onboarding, and support requirements are fundamentally different. Have you tested the new segment before going all-in?'
  },
  {
    id: 164,
    tier: 'bonus',
    text: 'Do you have a formal process for evaluating and approving capital expenditures, and do those investments meet a minimum return threshold?',
    example: 'A company buys a $500,000 piece of equipment based on gut instinct. A proper CapEx analysis would have revealed a 4-year payback period and 8% IRR — far below their 15% hurdle rate.'
  },
  {
    id: 165,
    tier: 'bonus',
    text: 'Have you explored building a marketplace business model that connects buyers and sellers in your industry?',
    example: 'A staffing agency transforms into a marketplace connecting independent contractors with companies directly, taking a 12% transaction fee. Revenue triples in 18 months with no increase in headcount.'
  },
  {
    id: 166,
    tier: 'bonus',
    text: 'What is your pricing strategy for initial contracts versus renewal contracts, and are you leaving renewal revenue on the table?',
    example: 'A SaaS company offers steep first-year discounts to win deals but fails to build in automatic price escalations at renewal. Three years in, 60% of their customer base is paying 2019 pricing in 2024.'
  },
  {
    id: 167,
    tier: 'bonus',
    text: 'Have you evaluated your company\'s option to go public via a SPAC, direct listing, or traditional IPO — and do you understand the trade-offs?',
    example: 'A SPAC merger can provide faster access to public capital but comes with different lock-up periods, dilution profiles, and governance requirements than a traditional IPO. Have you modeled all three paths?'
  },
  {
    id: 168,
    tier: 'bonus',
    text: 'What is your philosophy and practice around sharing equity with employees, and does it motivate the behaviors you want?',
    example: 'A startup gives equity to the first 10 employees but not the next 90. By the time the company reaches 100 people, only 10% of the team has any ownership stake. Is equity aligned with your culture and retention goals?'
  },
  {
    id: 169,
    tier: 'bonus',
    text: 'Have you built a system for capturing, evaluating, and acting on competitive intelligence on a continuous basis?',
    example: 'A company assigns one person to monitor competitor pricing changes, new feature releases, hiring trends, and customer reviews weekly. This 5-hour-per-week investment yields strategic insights that inform every major decision.'
  },
  {
    id: 170,
    tier: 'bonus',
    text: 'What is your strategy for building proprietary distribution that competitors cannot easily replicate?',
    example: 'Dollar Shave Club built a direct-to-consumer subscription model that gave Unilever a reason to acquire them for $1 billion. A proprietary distribution channel can be as valuable as the product itself.'
  },
  {
    id: 171,
    tier: 'bonus',
    text: 'Have you evaluated your company\'s resilience against technological disruption — could a new technology make your business model obsolete within 5 years?',
    example: 'Blockbuster had 5 years of warning that streaming would disrupt their business. They chose not to act. What technology trends are currently developing that could make your business model irrelevant?'
  },
  {
    id: 172,
    tier: 'bonus',
    text: 'What is your strategy for leveraging customer success as a growth function, not just a retention function?',
    example: 'Salesforce\'s customer success team is responsible for net revenue retention and expansion revenue. In their model, customer success is a revenue-generating function, not a cost center. Is yours?'
  },
  {
    id: 173,
    tier: 'bonus',
    text: 'Have you formally defined your company\'s purpose beyond profit, and does it guide decision-making at all levels of the organization?',
    example: 'Patagonia\'s purpose — "We\'re in business to save our home planet" — guides product decisions, sourcing, marketing, and even political activism. When purpose is real, it attracts talent, customers, and press that money cannot buy.'
  },
  {
    id: 174,
    tier: 'bonus',
    text: 'What is your personal vision for this business 10 years from now, and are you making decisions today that align with that vision?',
    example: 'A founder who wants to exit in 5 years should be building recurring revenue, reducing key-person dependency, and maintaining clean books. A founder who wants to pass the business to their children should be thinking about family governance. Your 10-year vision must drive today\'s decisions.'
  },
  {
    id: 175,
    tier: 'bonus',
    text: 'If you had to honestly grade your overall business readiness today, what grade would you give yourself and why — and what would it take to move up one letter?',
    example: 'A business owner gives themselves a C+ because their product is strong and customers love them, but their finances are a mess, they have no documented processes, and they are one employee departure away from chaos. What grade do you deserve, and what does a B look like?'
  }
];

module.exports = questions;
