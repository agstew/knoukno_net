const wrap = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Georgia, serif; color: #1a1a1a; background: #f9f7f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-top: 4px solid #c8a96e; }
    h1 { color: #1a1a1a; font-size: 22px; margin-bottom: 8px; }
    h2 { color: #c8a96e; font-size: 16px; font-weight: normal; margin-top: 0; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px; }
    p { font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 16px; }
    .action { background: #f3ede4; border-left: 4px solid #c8a96e; padding: 16px 20px; margin: 24px 0; font-style: italic; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #999; text-align: center; }
    strong { color: #1a1a1a; }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">Kno U Kno &mdash; Business Readiness Platform &mdash; You are receiving this because you subscribed to the 365-day series.</div>
  </div>
</body>
</html>`;

const emails = [
  // ─── DAYS 1-30: Fully written ─────────────────────────────────────────────
  {
    subject: 'Day 1: Your Business Journey Starts with Clarity',
    body: wrap(`
      <h1>Day 1: Your Business Journey Starts with Clarity</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Welcome. You have made a decision that most people only dream about &mdash; you are building something real. But before revenue, before marketing, before investors, there is one non-negotiable foundation: <strong>clarity</strong>.</p>
      <p>Clarity about what you do. Clarity about who you serve. Clarity about why it matters. Without it, every decision you make is built on sand. With it, everything else becomes faster, cheaper, and more focused.</p>
      <p>Most entrepreneurs skip this step. They are in a hurry to build, to launch, to grow. They confuse motion with progress. The result? Businesses that pivot endlessly, waste money on the wrong customers, and exhaust their founders with no clear direction.</p>
      <p>Your clarity starts with one sentence: <em>"I help [specific person] achieve [specific outcome] by [your method]."</em> If you cannot complete that sentence without using vague words like "businesses" or "everyone" or "solutions," you have work to do.</p>
      <div class="action"><strong>Today's Action:</strong> Write your one-sentence clarity statement. Show it to three people who are not your family. Ask them to repeat back what you do. If they get it wrong, rewrite it until they get it right.</div>
      <p>Clarity is not a destination &mdash; it is a practice. But it starts today, on Day 1, before anything else.</p>
    `)
  },
  {
    subject: 'Day 2: Know Your Customer Better Than They Know Themselves',
    body: wrap(`
      <h1>Day 2: Know Your Customer Better Than They Know Themselves</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Most entrepreneurs describe their ideal customer in broad, useless terms: "Anyone between 25 and 55 who needs X." That is not a customer. That is a demographic. There is a difference.</p>
      <p>Your ideal customer has a name in your mind. They have a specific job, a specific frustration, a specific dream. They wake up at 2am thinking about a specific problem &mdash; and you have the solution. Your job is to know what that problem feels like from the inside.</p>
      <p>Steve Jobs famously said that customers do not know what they want until you show it to them. That is true for breakthrough innovation. But for the rest of us, the fastest path to product-market fit is listening. <strong>Not surveys. Not forms. Real conversations.</strong></p>
      <p>The entrepreneurs who win are not the ones with the most funding or the best technology. They are the ones who understand their customer so deeply that their product, their messaging, and their service feel like they were built specifically for that one person.</p>
      <div class="action"><strong>Today's Action:</strong> Identify five real people who represent your ideal customer. Reach out to at least two of them today &mdash; not to pitch, but to ask questions. Listen more than you speak. Take notes.</div>
      <p>You cannot build the right thing if you do not understand the right person. Customer insight is the highest-ROI research you will ever do.</p>
    `)
  },
  {
    subject: 'Day 3: Revenue Is Vanity. Profit Is Sanity.',
    body: wrap(`
      <h1>Day 3: Revenue Is Vanity. Profit Is Sanity.</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>The number one lie entrepreneurs tell themselves &mdash; and tell their investors &mdash; is revenue. "We did $2 million last year!" Great. How much of that did you keep? What were your margins? What did you actually take home?</p>
      <p>Revenue is not success. Revenue is just the top line. Beneath it lie cost of goods, operating expenses, marketing spend, salaries, overhead, debt service, and taxes. What remains after all of that is profit. And profit is the score that matters.</p>
      <p>Many businesses with impressive revenues are quietly bleeding out. High-revenue, low-margin businesses are traps. They look successful on the outside while the founder quietly works 80 hours a week and cannot take a vacation without the business collapsing.</p>
      <p>The businesses that build lasting wealth focus on <strong>unit economics</strong>: how much does it cost to deliver one unit of value, and how much do you charge for it? Get that ratio right at small scale, and revenue growth becomes a multiplier. Get it wrong, and revenue growth just accelerates the bleeding.</p>
      <div class="action"><strong>Today's Action:</strong> Calculate your gross margin on your most popular product or service. Revenue minus direct costs, divided by revenue, expressed as a percentage. Is it healthy for your industry? If you do not know, that is your homework.</div>
      <p>Know your numbers. All of them. Not just the ones that feel good.</p>
    `)
  },
  {
    subject: 'Day 4: Build Systems, Not Just Products',
    body: wrap(`
      <h1>Day 4: Build Systems, Not Just Products</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Here is a hard truth most people learn too late: <strong>you are not building a product. You are building a system that delivers that product reliably, at scale, without you being present for every transaction.</strong></p>
      <p>The difference between a job and a business is whether it can run without you. If you disappeared for six weeks, would your customers still be served? Would revenue still come in? Would quality stay consistent? If the answer is no, you have a job, not a business &mdash; regardless of how much revenue you are generating.</p>
      <p>Michael Gerber called this the E-Myth &mdash; the entrepreneurial myth that most small business owners are actually highly skilled technicians who mistakenly believe that technical skill and business skill are the same thing. They are not. A great chef and a great restaurant operator are different roles.</p>
      <p>Systems are what allow you to step back. Systems are what allow you to hire. Systems are what allow you to scale. Without documented processes, SOPs, checklists, and workflows, every new employee has to learn from scratch, every mistake gets repeated, and every growth opportunity comes with exponential chaos.</p>
      <div class="action"><strong>Today's Action:</strong> Pick one recurring task in your business that only you currently do. Write a step-by-step process document for it &mdash; detailed enough that someone with no prior knowledge could follow it. This is your first system.</div>
      <p>Build systems today. Scale tomorrow.</p>
    `)
  },
  {
    subject: 'Day 5: Your Network Is Your Net Worth',
    body: wrap(`
      <h1>Day 5: Your Network Is Your Net Worth</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>No entrepreneur builds alone. Behind every breakthrough business &mdash; every product launch, every funding round, every key hire, every major partnership &mdash; is a network of relationships that made it possible.</p>
      <p>The most valuable introductions in your entrepreneurial career will not come from LinkedIn cold messages or networking events where everyone is handing out business cards. They will come from people who genuinely know you, trust you, and want to see you succeed.</p>
      <p>Here is the counterintuitive truth about networking: <strong>the best networkers give more than they take.</strong> They make introductions. They share opportunities. They promote other people's work. They are genuinely curious about what others need. And because of that, they have social capital to spend when they need a favor.</p>
      <p>Your network is not just about sales leads. It is about mentors who can save you years of mistakes. It is about co-founders you trust. It is about investors who believe in you. It is about employees who follow you into the unknown. Every one of these relationships starts with a genuine human connection.</p>
      <div class="action"><strong>Today's Action:</strong> Reach out to one person in your network today &mdash; not to ask for anything, but to add value. Share a resource, make an introduction, or just check in genuinely. Relationships require deposits before withdrawals.</div>
      <p>Invest in people. Your network is a compounding asset.</p>
    `)
  },
  {
    subject: 'Day 6: The Minimum Viable Product Is Not an Excuse for Low Quality',
    body: wrap(`
      <h1>Day 6: The Minimum Viable Product Is Not an Excuse for Low Quality</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>The MVP (Minimum Viable Product) concept is one of the most misunderstood ideas in entrepreneurship. It is often used as an excuse to ship something half-baked and call it a "test." That is not an MVP. That is a prototype &mdash; and releasing it to real customers can destroy your brand before it has a chance to grow.</p>
      <p>The true definition of an MVP is the <em>minimum product that delivers enough value to retain an early customer and generate meaningful feedback.</em> Not minimum effort. Minimum viable. There is a big difference.</p>
      <p>Reid Hoffman, founder of LinkedIn, famously said: "If you are not embarrassed by the first version of your product, you launched too late." That is true. But embarrassed is not the same as ashamed. Your MVP should feel rough around the edges, not broken at its core.</p>
      <p>The goal is learning, not launching. Every early customer is a research partner. What do they love? What confuses them? What do they wish it did? That feedback is worth more than any market research report you could buy.</p>
      <div class="action"><strong>Today's Action:</strong> If you have a product or service, identify the one core feature or value it delivers. Strip everything else away. Could you sell just that core value right now? What would it cost to build? Could you test it in the next 30 days?</div>
      <p>Speed and learning beat perfection every time.</p>
    `)
  },
  {
    subject: 'Day 7: Cash Flow Is Oxygen. Do Not Run Out.',
    body: wrap(`
      <h1>Day 7: Cash Flow Is Oxygen. Do Not Run Out.</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>More businesses fail because they run out of cash than for any other single reason. Not because they had bad products. Not because of bad marketing. Because the bank account hit zero before revenue caught up.</p>
      <p>Cash flow is not the same as profit. You can be profitable on paper and still die from a cash crisis. If your customers pay net-60 but your suppliers require payment in 15 days, you have a structural cash flow problem that grows as you grow.</p>
      <p>The biggest killers of small business cash flow are: slow-paying customers, over-investment in inventory, seasonal revenue without reserves, unexpected expenses, and rapid growth without adequate working capital. Every one of these is predictable. Every one of these is manageable if you see it coming.</p>
      <p><strong>Cash flow management is not accounting. It is survival.</strong> You need to know, at any moment, how much cash you have, how much is coming in over the next 30-60-90 days, and how much is going out. No guessing. No approximate numbers.</p>
      <div class="action"><strong>Today's Action:</strong> Build a simple 13-week cash flow forecast in a spreadsheet. List every expected cash inflow and outflow, week by week. Where does the balance go dangerously low? Now you have visibility &mdash; and visibility is your first defense.</div>
      <p>Never run out of oxygen.</p>
    `)
  },
  {
    subject: 'Day 8: Pricing Is a Strategy, Not a Guess',
    body: wrap(`
      <h1>Day 8: Pricing Is a Strategy, Not a Guess</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Most entrepreneurs price their products or services one of three ways: they copy a competitor, they calculate their costs and add a margin, or they pick a number that "feels right." All three of these approaches leave significant money on the table.</p>
      <p>Strategic pricing starts with value, not cost. The question is not "what does it cost me to produce this?" The question is "what is this worth to my customer?" The gap between your cost and your customer's perceived value is your pricing power.</p>
      <p>Consider: a painkiller relieves 8 hours of debilitating pain. The pill costs $0.03 to manufacture and retails for $1.50 &mdash; a 5,000% markup. Nobody complains, because the value (pain relief) far exceeds the price. Your goal is to be the painkiller, not the vitamin.</p>
      <p>Pricing also signals positioning. A low price says "affordable and accessible." A high price says "premium and exclusive." The same product at different price points attracts entirely different customers and creates entirely different brand perceptions. <strong>Your price is a message.</strong></p>
      <div class="action"><strong>Today's Action:</strong> Pick one product or service you offer. Research what competitors charge. Then ask three of your best customers what they would have paid for it. You may be shocked at the gap between what you charge and what you could charge.</div>
      <p>Price intentionally. Leave nothing on the table.</p>
    `)
  },
  {
    subject: 'Day 9: Sales Is Not a Dirty Word',
    body: wrap(`
      <h1>Day 9: Sales Is Not a Dirty Word</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Many founders &mdash; especially those from technical, creative, or academic backgrounds &mdash; have a complicated relationship with sales. They see it as pushy, manipulative, or beneath them. This belief is killing their businesses.</p>
      <p>Here is the truth: everything is sales. When you recruit a co-founder, you are selling your vision. When you hire your first employee, you are selling the opportunity. When you pitch an investor, you are selling the future. When you talk to a potential customer, you are selling a solution to their problem. The moment you stop being comfortable with that reality, you limit your ability to grow.</p>
      <p>Great sales is not about pressure. It is about listening deeply, understanding pain, demonstrating value clearly, and making it easy for the right customer to say yes. When your product genuinely solves a real problem, selling it should feel like a service, not a trick.</p>
      <p>The entrepreneurs who scale are the ones who learn to sell before they hire someone to do it for them. <strong>If you cannot sell your own product, you cannot train someone else to sell it.</strong> And if you do not know why customers buy, every salesperson you hire will be guessing.</p>
      <div class="action"><strong>Today's Action:</strong> Make five sales calls or send five personalized outreach messages today. Not automated emails. Personal, specific, human messages. Track how many respond. That response rate is the beginning of your conversion data.</div>
      <p>Sell confidently. You are helping people solve real problems.</p>
    `)
  },
  {
    subject: 'Day 10: The Competition Is Not Your Enemy',
    body: wrap(`
      <h1>Day 10: The Competition Is Not Your Enemy</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Founders often obsess about competition. They spy on competitors. They undercut their prices. They lose sleep worrying about what the other guy is building. This is largely wasted energy.</p>
      <p>Your competition is proof that demand exists. If nobody else is serving your market, that is not an opportunity &mdash; that is a warning sign. Competition validates the market. Your job is not to beat the competition. Your job is to serve your customer so well that they never consider the alternative.</p>
      <p>The most successful companies are not obsessed with their competitors. They are obsessed with their customers. Apple does not ask "what is Samsung building?" Apple asks "what do people actually want from a phone?" The best answer to competition is always: build something so good that comparison becomes irrelevant.</p>
      <p>That said, willful ignorance of your competitive landscape is dangerous. You should know who your top three competitors are, what they do well, where they fall short, and how their customers talk about them. <strong>Study them. Do not imitate them.</strong></p>
      <div class="action"><strong>Today's Action:</strong> Read the one-star reviews of your top competitor on Google, Yelp, or G2. What are their customers complaining about? Each complaint is a feature request for your business. This is your differentiation roadmap.</div>
      <p>Compete by being better, not by being louder.</p>
    `)
  },
  {
    subject: 'Day 11: Your Brand Is a Promise, Not a Logo',
    body: wrap(`
      <h1>Day 11: Your Brand Is a Promise, Not a Logo</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Entrepreneurs often confuse branding with visual design. They spend $5,000 on a logo and think they have a brand. They do not. A brand is the sum of every experience a customer has with your business &mdash; the way your phone is answered, the speed of your website, the warmth of your follow-up email, and yes, the visual identity too.</p>
      <p>Your brand is a promise. It says: "Here is what you can expect every single time you interact with us." When that promise is kept consistently, you earn trust. When it is broken, you lose it. The stronger your brand, the more forgiving customers become when things go wrong &mdash; because they know who you fundamentally are.</p>
      <p>Strong brands command premium prices. Apple charges $1,200 for a laptop that costs $300 to make. Starbucks charges $7 for a coffee that costs $0.50. The difference is not the product &mdash; it is the promise and the experience attached to it.</p>
      <div class="action"><strong>Today's Action:</strong> Write three words that you want people to immediately think of when they encounter your brand. Then audit your last 10 customer touchpoints. Does each one reinforce those three words? If not, you have a brand alignment gap to close.</div>
      <p>Build a brand that earns trust before a word is spoken.</p>
    `)
  },
  {
    subject: 'Day 12: Hire Slow, Fire Fast',
    body: wrap(`
      <h1>Day 12: Hire Slow, Fire Fast</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Hiring is the highest-leverage decision a founder makes. The right people will multiply your impact. The wrong people will consume your energy, demoralize your team, and cost you far more in lost opportunity than their salary.</p>
      <p>Most bad hires happen for one of three reasons: the founder was in a hurry and cut corners on the process, they hired for skills and ignored character, or they ignored red flags because they liked the person. Every experienced founder has at least one horror story. The lesson is always the same: <em>slow down on the front end.</em></p>
      <p>Interview for culture fit as rigorously as you interview for skills. Check references actually &mdash; not as a formality, but as a real information-gathering exercise. Give candidates small paid projects to complete before extending an offer. The extra two weeks you spend on due diligence can save you six months of misalignment.</p>
      <p>And when the person is clearly not working out? <strong>Move quickly.</strong> Every week you delay a necessary termination is a week you are sending a message to your whole team about what behavior is acceptable.</p>
      <div class="action"><strong>Today's Action:</strong> Review your current team (or your first hire plan). Do you have a defined hiring process with structured interview questions? If not, write five interview questions specific to the role and values you are hiring for.</div>
      <p>Build a team of people who make each other better.</p>
    `)
  },
  {
    subject: 'Day 13: Customers Do Not Buy Products. They Buy Outcomes.',
    body: wrap(`
      <h1>Day 13: Customers Do Not Buy Products. They Buy Outcomes.</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Theodore Levitt of Harvard Business School once said: "People don't want to buy a quarter-inch drill. They want a quarter-inch hole." Nobody buys a gym membership because they want to be on a treadmill. They buy it because they want to feel confident in their clothes. Nobody buys accounting software because they like spreadsheets. They buy it because they want to never think about bookkeeping again.</p>
      <p>When you understand this, your entire marketing strategy changes. You stop talking about features and start talking about transformations. You stop describing what the product does and start describing how the customer's life is different after using it.</p>
      <p>"Our software has 47 integrations" is a feature. "You will spend 3 fewer hours per week on administrative work" is an outcome. One makes the customer feel like they are buying technology. The other makes them feel like they are buying back their time. <strong>Always lead with the outcome.</strong></p>
      <div class="action"><strong>Today's Action:</strong> Rewrite your website homepage headline or your social media bio to describe the outcome your customer receives, not the product or service you provide. Test both versions with five people and see which one resonates.</div>
      <p>Sell the destination, not the plane.</p>
    `)
  },
  {
    subject: 'Day 14: One Week In. Time for a Ruthless Audit.',
    body: wrap(`
      <h1>Day 14: One Week In. Time for a Ruthless Audit.</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Two weeks into this journey, it is time to pause and assess. Not to celebrate. Not to second-guess yourself. But to take an honest look at where you are and where the gaps are.</p>
      <p>Great entrepreneurs are relentlessly self-honest. They do not protect their ego at the expense of their business. They look at the numbers, acknowledge what is not working, make adjustments, and move forward without drama. The ability to audit yourself ruthlessly &mdash; without spiraling into self-doubt &mdash; is one of the most important entrepreneurial skills.</p>
      <p>Ask yourself: In the last two weeks, have you made progress on the things that actually move the business forward? Or have you been "busy" with things that feel productive but are really just activity? Email is not progress. Tweaking your logo is not progress. Revenue conversations are progress. Customer feedback is progress. Executed decisions are progress.</p>
      <div class="action"><strong>Today's Action:</strong> Write down the three most important things you need to accomplish in the next 30 days for your business to move meaningfully forward. Now block time on your calendar for each one. Guard that time like a meeting with your most important investor.</div>
      <p>Audit. Adjust. Advance.</p>
    `)
  },
  {
    subject: 'Day 15: Every Business Needs a Marketing Engine',
    body: wrap(`
      <h1>Day 15: Every Business Needs a Marketing Engine</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Marketing is not a campaign. It is an engine. Campaigns start and stop. Engines run continuously, generating predictable output from predictable input. The difference between a business that grows steadily and one that lurches between feast and famine is usually the presence or absence of a marketing engine.</p>
      <p>A marketing engine has three components: a mechanism to attract attention (content, ads, SEO, partnerships, referrals), a mechanism to capture and nurture leads (email list, CRM, follow-up sequences), and a mechanism to convert leads to customers (sales process, offers, trials). When all three work together, customer acquisition becomes predictable, scalable, and improvable.</p>
      <p>Most small businesses have some version of component one. Far fewer have a real version of component two. And almost none have a documented, tested version of component three. <strong>That gap is why growth is inconsistent.</strong></p>
      <div class="action"><strong>Today's Action:</strong> Map your current marketing engine. What attracts attention? How do you capture leads? How do you convert them? Draw it on paper. Where is the biggest gap? That gap is your next marketing investment.</div>
      <p>Build an engine that runs while you sleep.</p>
    `)
  },
  {
    subject: 'Day 16: Debt Is a Tool. Use It Wisely.',
    body: wrap(`
      <h1>Day 16: Debt Is a Tool. Use It Wisely.</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Many entrepreneurs treat debt like it is either the enemy or a lifeline. Neither extreme serves them well. Debt is a tool. Like any tool, it can build something great or cause serious damage depending on how you use it.</p>
      <p>Good debt accelerates growth. If you borrow $100,000 at 8% interest to purchase equipment that generates $200,000 in new revenue, that is a smart use of leverage. The return far exceeds the cost, and you have used other people's money to multiply your own results.</p>
      <p>Bad debt subsidizes losses. If you are borrowing to cover operating shortfalls, payroll you cannot afford, or expenses that do not generate revenue, you are creating a liability that will come due without the ability to repay it. This is how businesses &mdash; and lives &mdash; collapse.</p>
      <p><strong>The question is always: what is the return on this borrowed capital?</strong> If you can answer that clearly and the answer is positive, debt is your friend. If you cannot answer it, step back before you sign.</p>
      <div class="action"><strong>Today's Action:</strong> List every debt obligation your business currently has. For each one, write whether it is "growth debt" (accelerating revenue) or "subsidy debt" (covering losses). If you have subsidy debt, that requires an immediate strategic response.</div>
      <p>Borrow to build. Never borrow to survive indefinitely.</p>
    `)
  },
  {
    subject: 'Day 17: Focus Is Your Competitive Advantage',
    body: wrap(`
      <h1>Day 17: Focus Is Your Competitive Advantage</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Entrepreneurs are, by nature, opportunity seekers. They see possibilities everywhere. And that trait &mdash; the one that made them start a business in the first place &mdash; is often the one that destroys it.</p>
      <p>Chasing multiple opportunities at once means none of them receive the sustained, deep focus required to truly excel. You spread your team too thin. You confuse your customers. You dilute your brand. You compete in multiple arenas simultaneously without the resources to win in any of them.</p>
      <p>The most successful businesses are not doing 10 things adequately. They are doing one or two things exceptionally. In-N-Out Burger has a menu with essentially five items. Apple makes roughly four categories of products. Specialization is a strategy, not a limitation.</p>
      <p><strong>What is the one thing your business does better than anyone else?</strong> Put all of your resources there. When that one thing is undeniable, you can expand. Expanding before your core is solid is how promising businesses collapse under their own ambition.</p>
      <div class="action"><strong>Today's Action:</strong> List every product, service, channel, and initiative your business is currently pursuing. Circle the top one or two that generate the most revenue and have the most potential. Put everything else on a "not now" list and refocus your energy.</div>
      <p>Less is not less. Less is more, done right.</p>
    `)
  },
  {
    subject: 'Day 18: Leadership Is a Skill. Develop It.',
    body: wrap(`
      <h1>Day 18: Leadership Is a Skill. Develop It.</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Many entrepreneurs are great at their craft. They can code, design, cook, build, write, or consult at a world-class level. But as the business grows, technical skill becomes less and less important. <strong>Leadership becomes everything.</strong></p>
      <p>Leadership is not a personality trait. It is not something you are born with. It is a learnable set of skills: how to communicate a vision clearly, how to make hard decisions under uncertainty, how to hold people accountable without destroying morale, how to attract talent, and how to create a culture where people do their best work.</p>
      <p>Poor leadership is the top reason why talented teams underperform and why talented people leave. You can pay competitively and still lose your best people to a competitor who leads them better. Culture, direction, and belonging are not soft concepts &mdash; they are the hard currency of talent retention.</p>
      <div class="action"><strong>Today's Action:</strong> Pick one leadership skill you know you need to develop &mdash; whether it is having difficult conversations, delegating effectively, communicating the vision, or managing performance. Find one book, course, or mentor focused on exactly that skill and commit to engaging with it this week.</div>
      <p>Lead yourself first. Then lead others.</p>
    `)
  },
  {
    subject: 'Day 19: Your Financial Model Is Your Business in Numbers',
    body: wrap(`
      <h1>Day 19: Your Financial Model Is Your Business in Numbers</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>If you cannot express your business in numbers, you do not fully understand your business. A financial model is not just for investors. It is the instrument panel of your entrepreneurial aircraft, telling you where you are, how fast you are moving, and how much fuel you have left.</p>
      <p>A basic financial model has three components: a profit and loss projection (what you expect to earn and spend), a cash flow projection (when money actually arrives and departs), and a balance sheet (what you own, what you owe, and what remains). Together, they tell a complete story about financial health.</p>
      <p>The act of building the model forces clarity. You cannot build a financial model with vague assumptions. You have to commit: How many customers? At what price? With what churn rate? With what cost per acquisition? Each of those commitments is a hypothesis. When reality diverges from the model, you have a signal that something important needs your attention.</p>
      <div class="action"><strong>Today's Action:</strong> Build or review your 12-month P&amp;L projection. Are your revenue assumptions based on real evidence? Are your cost assumptions complete? Identify your three biggest financial assumptions and stress test each one: what happens if they are 30% wrong?</div>
      <p>Numbers do not lie. Build your model. Know your numbers.</p>
    `)
  },
  {
    subject: 'Day 20: The Power of Recurring Revenue',
    body: wrap(`
      <h1>Day 20: The Power of Recurring Revenue</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Imagine two businesses, both generating $1 million in annual revenue. The first must re-earn all $1 million from scratch every year. The second starts each year with $800,000 already committed in recurring contracts and needs to find only $200,000 in new revenue. Which business would you rather own?</p>
      <p>Recurring revenue changes everything. It improves cash flow predictability. It increases company valuation. It reduces sales pressure. It lowers customer acquisition costs. And it allows you to build a genuine relationship with your customer base rather than constantly hunting for the next transaction.</p>
      <p>The shift from transactional to recurring does not happen automatically. It requires designing products or services that create ongoing value, and structuring your pricing around that ongoing value. Retainers, subscriptions, memberships, service contracts, licensing agreements &mdash; these are all mechanisms for converting one-time revenue into recurring revenue.</p>
      <div class="action"><strong>Today's Action:</strong> Identify one product or service in your business that customers currently buy once but could logically become a subscription or recurring engagement. Draft a proposal for what that recurring offering would look like. Price it. Describe the ongoing value. Then test it with three existing customers.</div>
      <p>Build revenue that compounds. Build recurring value.</p>
    `)
  },
  {
    subject: 'Day 21: Negotiate Everything',
    body: wrap(`
      <h1>Day 21: Negotiate Everything</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>One of the most underappreciated entrepreneurial skills is negotiation. Every dollar you save in a negotiation is a dollar of pure profit &mdash; because you did not have to earn it through revenue, pay taxes on it, or cover overhead. A negotiated discount goes directly to the bottom line.</p>
      <p>Many entrepreneurs leave enormous amounts of money on the table because they accept the first number offered. Rent, supplier pricing, software subscriptions, service contracts, loan terms, vendor fees &mdash; almost everything has room to negotiate, but only if you ask. Most people never ask.</p>
      <p>Negotiation is not about being aggressive or winning at the other person's expense. The best negotiations create agreements where both parties feel they received fair value. Getting there requires understanding what the other side actually needs, not just what they are asking for. <strong>Separate their position from their interest.</strong></p>
      <div class="action"><strong>Today's Action:</strong> Identify one recurring expense in your business &mdash; a software subscription, a supplier contract, or a lease. Contact the vendor and ask for a better rate. Mention that you are evaluating alternatives. The worst answer is no. The best answer saves you thousands per year.</div>
      <p>Everything is negotiable. Ask.</p>
    `)
  },
  {
    subject: 'Day 22: Accountability Changes Everything',
    body: wrap(`
      <h1>Day 22: Accountability Changes Everything</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Entrepreneurship is, at its core, a test of self-discipline. There is no boss telling you what to do. No performance review threatening your employment. No penalty for skipping the hard work today and doing something comfortable instead. The freedom is exhilarating &mdash; and terrifying &mdash; in equal measure.</p>
      <p>The entrepreneurs who achieve the most are not necessarily the most talented. They are the most accountable. They set clear goals, they measure progress honestly, and they have structures in place that force them to show up even when motivation fails. Because motivation is unreliable. Systems are not.</p>
      <p>External accountability &mdash; a business partner, a mastermind group, a coach, a mentor, a board &mdash; is one of the most effective performance multipliers available to founders. When someone you respect is going to ask you next week if you did what you committed to do, you are far more likely to do it.</p>
      <div class="action"><strong>Today's Action:</strong> Identify one person in your life who would make an effective accountability partner &mdash; someone who is in a similar building phase, has your respect, and will call you out honestly. Send them a message today proposing a weekly 30-minute accountability check-in. Commit to it.</div>
      <p>Accountability is not a weakness. It is an accelerant.</p>
    `)
  },
  {
    subject: 'Day 23: Test Before You Invest',
    body: wrap(`
      <h1>Day 23: Test Before You Invest</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>The graveyard of failed businesses is filled with companies that built first and learned second. They spent years developing a product, hundreds of thousands of dollars building it out, and then discovered that the market did not want it the way they imagined it. By then, it was too late.</p>
      <p>The lean startup methodology, made famous by Eric Ries, fundamentally changed how smart entrepreneurs think about product development. The core insight: <strong>the goal is to validate your assumptions as cheaply and quickly as possible, not to build the most complete version of your idea before getting feedback.</strong></p>
      <p>You can test almost anything before building it. A landing page with a signup form can tell you if there is demand before you write a line of code. A manual process can validate a business model before you automate it. A simple PDF or workshop can validate a course before you build a platform. The test costs pennies compared to the build.</p>
      <div class="action"><strong>Today's Action:</strong> Identify one assumption your business is built on that you have not yet validated with real market data. Design the cheapest, fastest possible experiment to test that assumption. Run it this week. The data is more valuable than the conviction.</div>
      <p>Assumptions are expensive. Tests are cheap.</p>
    `)
  },
  {
    subject: 'Day 24: The Legal Foundation of Your Business',
    body: wrap(`
      <h1>Day 24: The Legal Foundation of Your Business</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Legal issues are the silent killers of small businesses. You do not see them coming. You are busy building and selling and hiring, and then one day a contract dispute, an employment claim, a trademark infringement notice, or a regulatory violation shows up &mdash; and what started as a $5,000 problem quickly becomes a $50,000 problem if you do not have the right structures in place.</p>
      <p>The legal foundation of your business is not glamorous, but it is critical. Entity formation, operating agreements, founder agreements, IP assignments, non-disclosure agreements, employment contracts, terms of service, and privacy policies &mdash; these are not bureaucratic red tape. They are the structural engineering of your business.</p>
      <p>The good news: getting the basics right is far less expensive than most entrepreneurs think. A good business attorney can set up your fundamental legal structure for a few thousand dollars. That investment protects everything else you are building. <strong>Cutting corners on legal is like building a house on sand.</strong></p>
      <div class="action"><strong>Today's Action:</strong> Identify your top three legal exposures: Are you operating as the right business entity? Do you have written contracts with clients and suppliers? Is your intellectual property protected? Pick the most urgent gap and take one concrete step this week to close it.</div>
      <p>Protect what you are building. The legal foundation matters.</p>
    `)
  },
  {
    subject: 'Day 25: The Art of Saying No',
    body: wrap(`
      <h1>Day 25: The Art of Saying No</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Steve Jobs said that innovation is saying no to 1,000 things. The most successful entrepreneurs are not the ones who say yes to every opportunity &mdash; they are the ones who have the discipline to say no to the good opportunities so they can say yes to the great ones.</p>
      <p>Every yes is a no to something else. When you say yes to a client who is not your ideal customer, you are saying no to the time you could spend finding one who is. When you say yes to adding a feature, you are saying no to the focus required to perfect the core product. Every decision has an opportunity cost.</p>
      <p>Saying no is especially hard for early-stage entrepreneurs who feel they cannot afford to pass on any opportunity. That scarcity mindset leads to a scattered strategy, an exhausted founder, and a confused market position. Counterintuitively, saying no is one of the most growth-accelerating things you can do.</p>
      <div class="action"><strong>Today's Action:</strong> Look at your current commitments. Identify one thing you are doing that does not align with your core strategy or your ideal customer profile. Say no to it &mdash; gracefully, professionally, but definitively. Then redirect that time and energy toward your highest-impact opportunity.</div>
      <p>No is a complete sentence. Use it strategically.</p>
    `)
  },
  {
    subject: 'Day 26: Build Your Advisory Board Before You Need It',
    body: wrap(`
      <h1>Day 26: Build Your Advisory Board Before You Need It</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Almost every successful entrepreneur can point to two or three people who changed the trajectory of their business. A mentor who saw the blind spot. An advisor who made the right introduction. An experienced operator who had already solved the problem you were struggling with for six months. These relationships are enormously valuable &mdash; and they are most available to you before you desperately need them.</p>
      <p>An advisory board is not the same as a board of directors. Advisors are informal. They receive small amounts of equity (typically 0.1-0.5%) in exchange for strategic guidance, introductions, and credibility. They meet with you quarterly, or on an as-needed basis, to provide perspective that you cannot generate from inside the business.</p>
      <p>The best advisors have already built what you are trying to build. They have made the mistakes, they know the shortcuts, and they have the network you need. <strong>One introduction from the right advisor can be worth more than six months of cold outreach.</strong></p>
      <div class="action"><strong>Today's Action:</strong> Think about the three domains where you most need outside expertise &mdash; perhaps fundraising, sales, technical development, or operations. For each domain, identify one person who would be an ideal advisor. Write out a clear pitch for why working with you would be valuable to them. Then reach out to at least one of them this week.</div>
      <p>You do not have to build alone. Build your council.</p>
    `)
  },
  {
    subject: 'Day 27: Your Website Is Your Hardest-Working Salesperson',
    body: wrap(`
      <h1>Day 27: Your Website Is Your Hardest-Working Salesperson</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Your website works 24 hours a day, 7 days a week, in every time zone, without a salary, without sick days, and without a bad mood. If your website is unclear, slow, outdated, or unconvincing, you are sending prospects to the competition at scale, around the clock, without even knowing it.</p>
      <p>Most business websites make the same mistakes: they talk about the company instead of the customer, they use jargon instead of plain language, they bury the call to action, and they fail to establish trust through social proof. A visitor who lands on your site has approximately 7 seconds to determine whether to stay or leave. What does your first impression say?</p>
      <p>The anatomy of a high-converting homepage is straightforward: a clear headline that speaks to the customer's desired outcome, a brief explanation of how you deliver it, visual proof that it works (testimonials, logos, results), a risk-free call to action, and navigation that makes the next step obvious. That is it. Complexity kills conversion.</p>
      <div class="action"><strong>Today's Action:</strong> Ask five people who do not know your business to spend 30 seconds on your homepage. Ask them to tell you what you do, who you serve, and what they would do next. If their answers are unclear or wrong, you have a homepage problem that is costing you customers right now.</div>
      <p>Make every second of your website count.</p>
    `)
  },
  {
    subject: 'Day 28: Operational Excellence Is a Competitive Moat',
    body: wrap(`
      <h1>Day 28: Operational Excellence Is a Competitive Moat</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>Most entrepreneurs think about competitive advantage in terms of product, pricing, or marketing. Very few think about operational excellence as a competitive moat &mdash; and that is exactly why it is one. You cannot patent operations. But you can build them so efficiently that competitors cannot match your speed, your cost structure, or your quality, even if they copy your product.</p>
      <p>Amazon did not build the world's most valuable company on products. They built it on logistics, fulfillment, and operational efficiency so relentless that no competitor can come close to their cost structure. Toyota did not lead the automotive world on design &mdash; they led it on the Toyota Production System. Operational excellence, when executed consistently, becomes invisible to competitors but obvious to customers.</p>
      <p>For most entrepreneurs, operational excellence starts with simply documenting and standardizing the work. When processes are written down, errors decrease. When errors decrease, rework goes down. When rework goes down, costs decrease and quality increases. The compounding returns of operational discipline are extraordinary.</p>
      <div class="action"><strong>Today's Action:</strong> Identify the three most frequent operational errors or inconsistencies in your business. For each one, ask: is there a documented process that is being followed incorrectly, or is there no documented process at all? Close the documentation gap first.</div>
      <p>Do it right. Every time. That is the competitive edge.</p>
    `)
  },
  {
    subject: 'Day 29: Mental Toughness Is Part of the Business Plan',
    body: wrap(`
      <h1>Day 29: Mental Toughness Is Part of the Business Plan</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>No one tells you, when you start a business, about the emotional weight of it. The self-doubt at 2am. The guilt when things go wrong and people depend on you. The whiplash between a great week and a terrible one. The loneliness of making decisions that no one else fully understands. The pressure of being the last line of defense for your team's livelihoods.</p>
      <p>Entrepreneurship is one of the most psychologically demanding things a person can do. And yet, most business plans have no section on founder mental health. Most investors never ask about it. Most business schools teach strategy and finance and marketing &mdash; and never teach you how to manage your own psychology under sustained pressure.</p>
      <p>The founders who last are not the ones who never struggle. They are the ones who have built practices and structures that help them recover quickly, think clearly under stress, and maintain perspective when things go wrong. That might be therapy, meditation, physical exercise, prayer, peer communities, or some combination. Whatever works &mdash; it must be intentional.</p>
      <div class="action"><strong>Today's Action:</strong> Be honest with yourself: what is your current mental health and energy level? What practices do you have in place to protect and restore it? If the answer is "nothing intentional," choose one practice &mdash; a daily walk, 10 minutes of journaling, a weekly call with a peer &mdash; and start it tomorrow.</div>
      <p>Protect the founder. The business depends on it.</p>
    `)
  },
  {
    subject: 'Day 30: Thirty Days In. What Has Changed?',
    body: wrap(`
      <h1>Day 30: Thirty Days In. What Has Changed?</h1>
      <h2>Kno U Kno &mdash; 365-Day Business Readiness Series</h2>
      <p>You have made it to Day 30. That already puts you ahead of most people, who consume content without ever taking action. But the real question is: what has actually changed in your business over the last 30 days?</p>
      <p>Not what you have learned. Not what you have read or thought about. What have you done? What conversations have you had with real customers? What financial numbers do you now know that you did not know before? What system have you built? What hard decision have you made? What assumption have you tested?</p>
      <p>Learning without action is entertainment. The 365-day journey you are on is not about information accumulation. It is about the systematic construction of a business that can stand on its own, serve its customers excellently, and generate the financial outcomes that reflect the work you are putting in.</p>
      <p>The next 335 days will challenge you in ways the first 30 did not. The questions will get harder. The blind spots will get more uncomfortable. The work will require more courage. But so will the results.</p>
      <div class="action"><strong>Today's Action:</strong> Write down three specific things that have changed in your business thinking or execution over the last 30 days. Then write down the one thing you know you have been avoiding &mdash; the hard conversation, the uncertain decision, the uncomfortable truth. That is where your next 30 days must begin.</div>
      <p>30 days down. 335 to go. Keep building.</p>
    `)
  }
];

// ─── DAYS 31-365: Programmatically generated ──────────────────────────────
const topics = [
  { theme: 'Customer Research', tip: 'Understanding your customer deeply is the highest-ROI investment you can make. Every dollar spent on customer insight saves ten dollars wasted on wrong assumptions.' },
  { theme: 'Revenue Strategy', tip: 'Revenue without margin is vanity. Before you chase top-line growth, be certain your unit economics can support the weight of that growth.' },
  { theme: 'Team Building', tip: 'The people you choose to work with define your culture more than any values statement. Hire slowly, onboard intentionally, and lead with clarity.' },
  { theme: 'Financial Discipline', tip: 'Financial clarity is not the CFO\'s job alone. Every founder must understand their numbers at a level deep enough to make confident decisions.' },
  { theme: 'Marketing & Positioning', tip: 'Positioning is not what you say about yourself. It is the position you occupy in the mind of your customer when your name comes up.' },
  { theme: 'Operations & Systems', tip: 'A business that cannot operate without its founder has not yet become a business. Build systems that deliver quality reliably, independent of any single person.' },
  { theme: 'Sales Mastery', tip: 'Sales is a service. When your product genuinely solves a real problem, selling it is an act of kindness toward someone who needs what you offer.' },
  { theme: 'Leadership & Culture', tip: 'Culture is not what you say. It is what you tolerate, what you reward, and what you do when things get hard. Every decision you make defines it.' },
  { theme: 'Growth Strategy', tip: 'Sustainable growth comes from mastering one channel before expanding to another. A business growing in 10 directions at once is usually growing in none of them.' },
  { theme: 'Risk Management', tip: 'Risk management is not about eliminating risk. It is about taking the right risks, sizing them appropriately, and knowing exactly what you are betting.' },
  { theme: 'Innovation & Product', tip: 'The best product innovations come not from brainstorming sessions but from deep listening to the frustrations customers experience with existing solutions.' },
  { theme: 'Branding & Identity', tip: 'Your brand is the sum of every promise you make and every promise you keep. Consistency, over time, is what transforms a name into a reputation.' },
  { theme: 'Strategic Partnerships', tip: 'The right partnership can accelerate your growth by years. Think about who already serves your customer and how a collaboration could create value for all parties.' },
  { theme: 'Personal Development', tip: 'The business grows as fast as the founder grows. Your personal leadership ceiling is the business ceiling. Invest in yourself with the same discipline you invest in the business.' },
  { theme: 'Exit & Long-Term Vision', tip: 'The decisions you make today should be compatible with the future you are building toward. Know your exit &mdash; even if it changes &mdash; so that every step points in the same direction.' },
  { theme: 'Technology & Automation', tip: 'Technology should serve your strategy, not define it. Automate the repeatable. Reserve human judgment for the irreplaceable. Both must be intentional.' },
  { theme: 'Customer Retention', tip: 'The customers you already have are your most valuable asset. A 5% improvement in retention can increase profitability by 25-95%. Protect what you have earned.' },
  { theme: 'Mindset & Resilience', tip: 'Setbacks are not interruptions to the entrepreneurial journey. They are the journey. How you respond to failure defines your trajectory more than your initial talent does.' },
  { theme: 'Cash Flow & Capital', tip: 'Cash is the blood of the business. Revenue is important. Profit is important. But the business lives or dies on whether cash is in the account when obligations come due.' },
  { theme: 'Competitive Intelligence', tip: 'Your competitors are teaching you every day &mdash; through their pricing, their messaging, their hiring, and their customers\' complaints. Are you paying attention to those lessons?' }
];

const actionPrompts = [
  'Identify one customer assumption you have not validated and design a test to confirm or refute it this week.',
  'Review your pricing for one product or service. Research what the market supports and what your best customers would pay.',
  'Have a direct conversation with one person on your team about what is working and what is getting in their way.',
  'Pull your financial reports from the last 90 days. Identify your top revenue source and your top expense. Are they aligned?',
  'Rewrite one piece of marketing copy &mdash; a headline, email subject, or social post &mdash; to speak directly to customer outcomes.',
  'Document one process in your business that currently lives only in someone\'s head. Write it down step by step.',
  'Reach out to one prospect who has not yet converted. Ask one genuine question about what is holding them back.',
  'Ask one team member or collaborator what you could do differently to help them perform at their best.',
  'Identify your top growth channel from last quarter. Invest 20% more attention there this week.',
  'Review your top three business risks. Is each one assigned an owner and a mitigation action?',
  'Talk to three customers about your product. Ask what they wish it did that it currently does not.',
  'Audit one customer-facing touchpoint &mdash; a webpage, email template, or onboarding flow &mdash; against your brand promise.',
  'Reach out to one potential strategic partner. Identify a specific way you could create value for their customers.',
  'Read one chapter of a book on leadership, strategy, or personal development. Apply one idea before the week ends.',
  'Map your path from current state to your exit scenario. What is the single most important milestone between here and there?',
  'Identify one manual task in your business that could be automated. Research the best tool for the job.',
  'Review your churn data or client retention. Call one customer who left and ask why they moved on.',
  'Journal for 10 minutes on your biggest business challenge right now. What do you know but have been afraid to act on?',
  'Build a simple 8-week cash flow projection. Where does the balance get uncomfortably low?',
  'Read your competitors\' recent reviews or social media content. What are they saying? What are they missing?'
];

for (let day = 31; day <= 365; day++) {
  const topicIndex = (day - 31) % topics.length;
  const actionIndex = (day - 31) % actionPrompts.length;
  const topic = topics[topicIndex];
  const action = actionPrompts[actionIndex];
  const weekNumber = Math.ceil(day / 7);
  const monthNumber = Math.ceil(day / 30);

  emails.push({
    subject: `Day ${day}: ${topic.theme} &mdash; Building Block #${day}`,
    body: wrap(`
      <h1>Day ${day}: ${topic.theme}</h1>
      <h2>Kno U Kno &mdash; Week ${weekNumber} &middot; Month ${monthNumber} &middot; Day ${day} of 365</h2>
      <p>You are on Day ${day}. That is ${day} consecutive days of investing in your business readiness. Most people who started alongside you have already stopped. You have not. That persistence is a differentiator.</p>
      <p>Today's focus is <strong>${topic.theme}</strong>. This is one of the foundational pillars of every successful business, and it deserves your honest attention.</p>
      <p>${topic.tip}</p>
      <p>The most common mistake entrepreneurs make regarding ${topic.theme.toLowerCase()} is treating it as a one-time event rather than an ongoing discipline. The businesses that outperform their competitors do not just think about this once at launch &mdash; they return to it regularly, refine their approach, and improve with each iteration.</p>
      <p>Ask yourself this honest question: On a scale of 1 to 10, how strong is your business in the area of ${topic.theme.toLowerCase()} right now? What would it take to move that number up by two points in the next 90 days? That two-point improvement, compounded across all pillars, is what separates good businesses from great ones.</p>
      <div class="action"><strong>Today's Action:</strong> ${action}</div>
      <p>Day ${day} is behind you. Day ${day + 1} awaits. Keep building &mdash; one day, one decision, one discipline at a time.</p>
    `)
  });
}

module.exports = emails;
